// Job Requirement Analyzer and Smart Cover Letter Generator

// User Profile based on existing documents
let userProfile = {
    skills: [],
    experiences: [],
    writingStyle: {
        greetings: [],
        closings: [],
        transitionPhrases: [],
        actionVerbs: []
    },
    achievements: [],
    keywords: []
};

// Analyze job description sentence by sentence
function analyzeJobDescription(jobDescription) {
    if (!jobDescription) return [];
    
    // Split into sentences
    const sentences = jobDescription.match(/[^.!?]+[.!?]+/g) || [];
    const requirements = [];
    
    sentences.forEach((sentence, index) => {
        const trimmed = sentence.trim();
        
        // Skip very short sentences or boilerplate
        if (trimmed.length < 20) return;
        
        // Analyze sentence importance
        const importance = calculateImportance(trimmed);
        
        // Extract requirements
        if (importance > 0.3) {
            requirements.push({
                id: `req-${index}`,
                text: trimmed,
                importance: importance,
                type: categorizeRequirement(trimmed),
                keywords: extractKeywords(trimmed),
                isRequired: isHardRequirement(trimmed),
                matchingSuggestions: []
            });
        }
    });
    
    // Sort by importance
    requirements.sort((a, b) => b.importance - a.importance);
    
    return requirements;
}

function calculateImportance(sentence) {
    let score = 0.5; // Base score
    
    // High priority indicators
    const highPriorityWords = [
        'müssen', 'erforderlich', 'voraussetzung', 'mindestens', 'zwingend',
        'unbedingt', 'notwendig', 'erwarten', 'setzen voraus', 'must have'
    ];
    
    // Medium priority indicators
    const mediumPriorityWords = [
        'sollten', 'wünschenswert', 'vorteilhaft', 'idealerweise', 
        'bevorzugt', 'erwünscht', 'nice to have', 'von vorteil'
    ];
    
    // Task indicators
    const taskWords = [
        'aufgaben', 'verantwortlich', 'zuständig', 'entwickeln', 'führen',
        'betreuen', 'koordinieren', 'analysieren', 'optimieren', 'implementieren'
    ];
    
    const lowerSentence = sentence.toLowerCase();
    
    // Check for priority indicators
    highPriorityWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 0.3;
    });
    
    mediumPriorityWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 0.2;
    });
    
    taskWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 0.15;
    });
    
    // Check for specific requirements (years, degree, etc.)
    if (/\d+\s*jahr/i.test(sentence)) score += 0.2;
    if (/bachelor|master|diplom|studium/i.test(sentence)) score += 0.25;
    if (/zertifik|qualifikation/i.test(sentence)) score += 0.2;
    
    // Cap at 1.0
    return Math.min(score, 1.0);
}

function categorizeRequirement(sentence) {
    const lower = sentence.toLowerCase();
    
    if (/erfahrung|praxis|kenntnis/i.test(lower)) return 'experience';
    if (/studium|abschluss|bachelor|master/i.test(lower)) return 'education';
    if (/sprach|englisch|deutsch/i.test(lower)) return 'language';
    if (/software|tool|system|programm/i.test(lower)) return 'technical';
    if (/führung|team|management/i.test(lower)) return 'leadership';
    if (/kommunikation|präsentation/i.test(lower)) return 'softskill';
    
    return 'general';
}

function isHardRequirement(sentence) {
    const hardIndicators = [
        'zwingend', 'müssen', 'erforderlich', 'voraussetzung', 
        'unbedingt', 'notwendig', 'mindestens'
    ];
    
    const lower = sentence.toLowerCase();
    return hardIndicators.some(indicator => lower.includes(indicator));
}

function extractKeywords(text) {
    // Remove common words and extract important terms
    const stopWords = [
        'der', 'die', 'das', 'und', 'oder', 'aber', 'in', 'mit', 'von', 'zu',
        'für', 'auf', 'an', 'bei', 'nach', 'aus', 'um', 'über', 'vor', 'seit'
    ];
    
    const words = text.toLowerCase()
        .replace(/[.,!?;:]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word));
    
    return [...new Set(words)];
}

// Analyze user's documents to build profile
async function analyzeUserDocuments() {
    console.log('Starting comprehensive user document analysis...');
    
    // Get all user documents from localStorage
    const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
    const cvData = JSON.parse(localStorage.getItem('cvData') || '{}');
    const previousApplications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    // Analyze all uploaded documents (PDFs, Word docs, etc.)
    for (const doc of documents) {
        if (doc.type === 'cv' || doc.type === 'cover-letter') {
            // Extract text content from document
            const textContent = await extractTextFromDocument(doc);
            if (textContent) {
                analyzeDocumentContent(textContent, doc.type);
            }
        } else if (doc.type === 'certificate' || doc.type === 'certification') {
            // Extract certifications and qualifications
            extractCertifications(doc);
        }
    }
    
    // Extract skills from CV
    if (cvData.sections) {
        const skillsSection = cvData.sections.find(s => s.type === 'skills');
        if (skillsSection) {
            skillsSection.entries.forEach(category => {
                userProfile.skills.push(...category.skills);
            });
        }
        
        // Extract experiences with detailed analysis
        const expSection = cvData.sections.find(s => s.type === 'experience');
        if (expSection) {
            userProfile.experiences = expSection.entries.map(exp => ({
                position: exp.position,
                company: exp.company,
                duration: exp.duration,
                description: exp.description,
                keywords: exp.description.flatMap(d => extractKeywords(d)),
                achievements: extractAchievementsFromText(exp.description.join(' ')),
                technologies: extractTechnologies(exp.description.join(' '))
            }));
        }
        
        // Extract education
        const eduSection = cvData.sections.find(s => s.type === 'education');
        if (eduSection) {
            userProfile.education = eduSection.entries.map(edu => ({
                degree: edu.degree,
                institution: edu.institution,
                duration: edu.duration,
                specialization: edu.specialization,
                keywords: extractKeywords(edu.degree + ' ' + edu.specialization)
            }));
        }
    }
    
    // Analyze previous cover letters for writing style and patterns
    previousApplications.forEach(app => {
        if (app.coverLetter) {
            analyzeWritingStyle(app.coverLetter);
            extractSuccessPatterns(app);
        }
    });
    
    // Extract achievements and keywords from all documents
    extractAchievementsAndKeywords();
    
    // Build comprehensive competency map
    buildCompetencyMap();
    
    // Save analyzed profile
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    return userProfile;
}

// Extract text from various document formats
async function extractTextFromDocument(doc) {
    // For demo purposes, return sample text
    // In production, this would use PDF.js or similar libraries
    if (doc.name && doc.name.toLowerCase().includes('lebenslauf')) {
        return `Manuel Weiß
HR-Berater und Digitalisierungsexperte

Berufserfahrung:
Senior HR Consultant bei ABC Consulting GmbH (2020-heute)
- Beratung von DAX-Unternehmen bei HR-Transformation
- Implementierung von SAP SuccessFactors und Workday
- Führung von Teams bis zu 15 Mitarbeitern
- 40% Effizienzsteigerung durch Prozessoptimierung

HR Manager bei XYZ AG (2015-2020)
- Verantwortlich für 500+ Mitarbeiter
- Einführung agiler Arbeitsmethoden
- Digitalisierung der HR-Prozesse`;
    }
    return doc.content || '';
}

// Analyze document content based on type
function analyzeDocumentContent(content, docType) {
    const lines = content.split('\n');
    
    lines.forEach(line => {
        // Extract key information based on patterns
        if (docType === 'cv') {
            // Extract positions, companies, durations
            const positionMatch = line.match(/^(.+?)\s+bei\s+(.+?)\s*\((\d{4})-(\d{4}|\w+)\)/);
            if (positionMatch) {
                const [, position, company, startYear, endYear] = positionMatch;
                // Add to experiences if not already present
                if (!userProfile.experiences.find(exp => exp.position === position && exp.company === company)) {
                    userProfile.experiences.push({
                        position,
                        company,
                        startYear,
                        endYear,
                        keywords: extractKeywords(position + ' ' + company)
                    });
                }
            }
        }
        
        // Extract skills and technologies
        const techPatterns = /\b(SAP|Workday|Java|Python|JavaScript|React|Angular|Vue|Node\.js|AWS|Azure|Docker|Kubernetes|Scrum|Agile|PRINCE2|PMP)\b/gi;
        const matches = line.match(techPatterns);
        if (matches) {
            matches.forEach(tech => {
                if (!userProfile.skills.includes(tech)) {
                    userProfile.skills.push(tech);
                }
            });
        }
    });
}

// Extract certifications from documents
function extractCertifications(doc) {
    if (!userProfile.certifications) {
        userProfile.certifications = [];
    }
    
    // Extract certification info from document name or content
    const certPatterns = [
        /Zertifikat.*?(\w+)/i,
        /Certificate.*?(\w+)/i,
        /(PMP|PRINCE2|Scrum Master|SAP|ITIL|Six Sigma)/i
    ];
    
    certPatterns.forEach(pattern => {
        const match = doc.name.match(pattern);
        if (match) {
            userProfile.certifications.push({
                name: match[1],
                document: doc.name,
                date: doc.uploadedAt
            });
        }
    });
}

// Extract achievements from text
function extractAchievementsFromText(text) {
    const achievements = [];
    const achievementPatterns = [
        /(\d+%?\s*(?:Steigerung|Erhöhung|Reduzierung|Verbesserung|Kosteneinsparung))/gi,
        /(?:erfolgreich|entwickelt|implementiert|geleitet|verantwortet|eingeführt|optimiert)\s+(.+?)(?:\.|,|$)/gi,
        /(?:Team|Projekt|Abteilung)\s+(?:mit|von)\s+(\d+)\s+(?:Mitarbeiter|Personen|Teilnehmer)/gi,
        /(?:Budget|Umsatz|Kosten)\s+(?:von|über|bis)\s+([\d,]+\s*(?:€|EUR|Mio\.|Millionen))/gi
    ];
    
    achievementPatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            achievements.push(match[0]);
        }
    });
    
    return [...new Set(achievements)];
}

// Extract technologies and tools
function extractTechnologies(text) {
    const technologies = [];
    const techKeywords = [
        'SAP', 'SuccessFactors', 'Workday', 'Oracle', 'Peoplesoft',
        'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue',
        'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL',
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
        'Git', 'Jenkins', 'JIRA', 'Confluence', 'Slack',
        'Scrum', 'Agile', 'Kanban', 'PRINCE2', 'PMP'
    ];
    
    techKeywords.forEach(tech => {
        const regex = new RegExp(`\\b${tech}\\b`, 'gi');
        if (regex.test(text)) {
            technologies.push(tech);
        }
    });
    
    return [...new Set(technologies)];
}

// Extract patterns from successful applications
function extractSuccessPatterns(application) {
    if (!userProfile.successPatterns) {
        userProfile.successPatterns = [];
    }
    
    // If application was successful (had interview or was accepted)
    if (application.status === 'Vorstellungsgespräch' || application.status === 'Angenommen') {
        userProfile.successPatterns.push({
            company: application.company,
            position: application.position,
            keywords: extractKeywords(application.jobDescription || ''),
            coverLetterLength: application.coverLetter ? application.coverLetter.length : 0,
            usedPhrases: extractKeyPhrases(application.coverLetter || '')
        });
    }
}

// Extract key phrases from text
function extractKeyPhrases(text) {
    const phrases = [];
    const phrasePatterns = [
        /mit großem Interesse/gi,
        /Ihre Stellenanzeige/gi,
        /meine Erfahrung/gi,
        /ich konnte/gi,
        /erfolgreich/gi,
        /Verantwortung/gi,
        /Team/gi,
        /Projekt/gi
    ];
    
    phrasePatterns.forEach(pattern => {
        if (pattern.test(text)) {
            phrases.push(pattern.source);
        }
    });
    
    return phrases;
}

// Build comprehensive competency map
function buildCompetencyMap() {
    userProfile.competencyMap = {
        technical: {},
        leadership: {},
        soft: {},
        industry: {}
    };
    
    // Categorize skills and experiences
    userProfile.skills.forEach(skill => {
        const category = categorizeSkill(skill);
        if (!userProfile.competencyMap[category][skill]) {
            userProfile.competencyMap[category][skill] = {
                level: 'expert',
                yearsOfExperience: calculateExperienceYears(skill),
                projects: findRelatedProjects(skill)
            };
        }
    });
}

// Categorize skill into competency type
function categorizeSkill(skill) {
    const technical = ['SAP', 'Java', 'Python', 'JavaScript', 'React', 'AWS', 'Docker'];
    const leadership = ['Führung', 'Management', 'Team', 'Projekt', 'Scrum Master'];
    const soft = ['Kommunikation', 'Präsentation', 'Verhandlung', 'Beratung'];
    
    if (technical.some(t => skill.toLowerCase().includes(t.toLowerCase()))) return 'technical';
    if (leadership.some(l => skill.toLowerCase().includes(l.toLowerCase()))) return 'leadership';
    if (soft.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 'soft';
    
    return 'industry';
}

// Calculate years of experience for a skill
function calculateExperienceYears(skill) {
    let years = 0;
    userProfile.experiences.forEach(exp => {
        if (exp.keywords.some(k => k.toLowerCase().includes(skill.toLowerCase()))) {
            const start = parseInt(exp.startYear) || 2020;
            const end = exp.endYear === 'heute' ? new Date().getFullYear() : parseInt(exp.endYear) || 2024;
            years += (end - start);
        }
    });
    return years;
}

// Find projects related to a skill
function findRelatedProjects(skill) {
    const projects = [];
    userProfile.experiences.forEach(exp => {
        if (exp.keywords.some(k => k.toLowerCase().includes(skill.toLowerCase()))) {
            projects.push({
                company: exp.company,
                position: exp.position,
                achievements: exp.achievements || []
            });
        }
    });
    return projects;
}

function analyzeWritingStyle(coverLetter) {
    // Initialize writing style structures
    if (!userProfile.writingStyle.sentenceStructures) {
        userProfile.writingStyle.sentenceStructures = [];
    }
    if (!userProfile.writingStyle.introductionPatterns) {
        userProfile.writingStyle.introductionPatterns = [];
    }
    if (!userProfile.writingStyle.skillPresentations) {
        userProfile.writingStyle.skillPresentations = [];
    }
    
    // Extract greetings with context
    const greetingMatch = coverLetter.match(/^(Sehr geehrte.*?,|Liebe.*?,|Hallo.*?,|Guten Tag.*?,)/m);
    if (greetingMatch && !userProfile.writingStyle.greetings.includes(greetingMatch[1])) {
        userProfile.writingStyle.greetings.push(greetingMatch[1]);
    }
    
    // Extract closings with variations
    const closingPatterns = [
        /(Mit freundlichen Grüßen|Beste Grüße|Freundliche Grüße|Herzliche Grüße|Viele Grüße|Mit besten Grüßen)/,
        /(Ich freue mich.*?(?:\.|$))/,
        /(Über.*?Gespräch.*?(?:\.|$))/,
        /(Gerne.*?persönlich.*?(?:\.|$))/
    ];
    
    closingPatterns.forEach(pattern => {
        const match = coverLetter.match(pattern);
        if (match && !userProfile.writingStyle.closings.includes(match[1])) {
            userProfile.writingStyle.closings.push(match[1]);
        }
    });
    
    // Extract introduction patterns
    const introPatterns = [
        /mit (großem|besonderem|starkem) Interesse habe ich/gi,
        /Ihre Stellenanzeige.*?hat (mich|meine Aufmerksamkeit)/gi,
        /als.*?habe ich.*?gelesen/gi,
        /durch.*?bin ich auf/gi,
        /mit Begeisterung/gi
    ];
    
    introPatterns.forEach(pattern => {
        const matches = coverLetter.match(pattern);
        if (matches) {
            matches.forEach(match => {
                if (!userProfile.writingStyle.introductionPatterns.includes(match)) {
                    userProfile.writingStyle.introductionPatterns.push(match);
                }
            });
        }
    });
    
    // Extract transition phrases with more variety
    const transitions = [
        /[Dd]arüber hinaus/g,
        /[Zz]udem/g,
        /[Dd]es Weiteren/g,
        /[Aa]ußerdem/g,
        /[Ii]nsbesondere/g,
        /[Dd]abei/g,
        /[Gg]leichzeitig/g,
        /[Ee]benso/g,
        /[Ff]erner/g,
        /[Nn]icht zuletzt/g,
        /[Ii]n diesem Zusammenhang/g,
        /[Aa]ufgrund/g,
        /[Dd]urch meine/g
    ];
    
    transitions.forEach(pattern => {
        const matches = coverLetter.match(pattern);
        if (matches) {
            matches.forEach(match => {
                if (!userProfile.writingStyle.transitionPhrases.includes(match)) {
                    userProfile.writingStyle.transitionPhrases.push(match);
                }
            });
        }
    });
    
    // Extract action verbs and personal expressions
    const actionVerbs = extractActionVerbs(coverLetter);
    userProfile.writingStyle.actionVerbs = [...new Set([...userProfile.writingStyle.actionVerbs, ...actionVerbs])];
    
    // Extract skill presentation patterns
    const skillPatterns = [
        /[Mm]eine (Expertise|Erfahrung|Kenntnisse) in (.+?) (ermöglicht|befähigt|erlaubt)/g,
        /[Ii]ch verfüge über (.+?) (Kenntnisse|Erfahrung|Expertise)/g,
        /[Dd]urch meine (.+?) konnte ich/g,
        /[Aa]ls (.+?) habe ich/g,
        /[Mm]it (.+?) Jahren Erfahrung/g
    ];
    
    skillPatterns.forEach(pattern => {
        const matches = coverLetter.matchAll(pattern);
        for (const match of matches) {
            const presentation = match[0];
            if (!userProfile.writingStyle.skillPresentations.includes(presentation)) {
                userProfile.writingStyle.skillPresentations.push(presentation);
            }
        }
    });
    
    // Analyze sentence structures
    analyzeSentenceStructures(coverLetter);
    
    // Extract personal tone indicators
    analyzePersonalTone(coverLetter);
}

function extractActionVerbs(text) {
    const actionVerbs = [];
    const verbPatterns = [
        /\b(entwickelte|entwickelt|implementierte|implementiert|führte|geführt|leitete|geleitet|verantwortete|verantwortet)\b/gi,
        /\b(optimierte|optimiert|verbesserte|verbessert|steigerte|gesteigert|reduzierte|reduziert)\b/gi,
        /\b(analysierte|analysiert|konzipierte|konzipiert|koordinierte|koordiniert|betreute|betreut)\b/gi,
        /\b(erreichte|erreicht|erzielte|erzielt|schaffte|geschafft|realisierte|realisiert)\b/gi,
        /\b(unterstützte|unterstützt|beriet|beraten|schulte|geschult|coachte|gecoacht)\b/gi
    ];
    
    verbPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            actionVerbs.push(...matches);
        }
    });
    
    return [...new Set(actionVerbs)];
}

function analyzeSentenceStructures(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    sentences.forEach(sentence => {
        // Analyze sentence beginnings
        const beginning = sentence.trim().substring(0, 50);
        
        // Common patterns
        if (/^(Als|Mit|Durch|In meiner|Während|Bei)/.test(beginning)) {
            const structure = beginning.match(/^(\w+\s+\w+(?:\s+\w+)?)/);
            if (structure && !userProfile.writingStyle.sentenceStructures.includes(structure[1])) {
                userProfile.writingStyle.sentenceStructures.push(structure[1]);
            }
        }
    });
}

function analyzePersonalTone(text) {
    if (!userProfile.writingStyle.personalTone) {
        userProfile.writingStyle.personalTone = {
            formality: 'formal', // formal, semi-formal, casual
            enthusiasm: 'moderate', // high, moderate, low
            confidence: 'confident', // very confident, confident, modest
            directness: 'direct' // direct, indirect
        };
    }
    
    // Analyze formality
    const casualIndicators = /\b(toll|super|klasse|spannend|cool)\b/gi;
    const formalIndicators = /\b(hiermit|bezugnehmend|diesbezüglich|nachfolgend)\b/gi;
    
    if (casualIndicators.test(text)) {
        userProfile.writingStyle.personalTone.formality = 'casual';
    } else if (formalIndicators.test(text)) {
        userProfile.writingStyle.personalTone.formality = 'very formal';
    }
    
    // Analyze enthusiasm
    const enthusiasmIndicators = /\b(begeistert|fasziniert|leidenschaftlich|sehr gerne|mit Freude)\b/gi;
    const enthusiasmMatches = text.match(enthusiasmIndicators);
    if (enthusiasmMatches && enthusiasmMatches.length > 2) {
        userProfile.writingStyle.personalTone.enthusiasm = 'high';
    }
    
    // Analyze confidence
    const confidenceIndicators = /\b(überzeugt|sicher|definitiv|zweifellos|selbstverständlich)\b/gi;
    const modestIndicators = /\b(glaube|denke|vielleicht|eventuell|möglicherweise)\b/gi;
    
    const confidenceCount = (text.match(confidenceIndicators) || []).length;
    const modestCount = (text.match(modestIndicators) || []).length;
    
    if (confidenceCount > modestCount * 2) {
        userProfile.writingStyle.personalTone.confidence = 'very confident';
    } else if (modestCount > confidenceCount * 2) {
        userProfile.writingStyle.personalTone.confidence = 'modest';
    }
}

function extractAchievementsAndKeywords() {
    // Extract numbers and achievements
    const achievementPatterns = [
        /(\d+%?\s*(?:Steigerung|Erhöhung|Reduzierung|Verbesserung))/gi,
        /(?:erfolgreich|entwickelt|implementiert|geleitet|verantwortet)\s+(.+?)(?:\.|,)/gi,
        /(?:Projekt|Team|Abteilung)\s+(?:mit|von)\s+(\d+)\s+(?:Mitarbeiter|Personen)/gi
    ];
    
    userProfile.experiences.forEach(exp => {
        exp.description.forEach(desc => {
            achievementPatterns.forEach(pattern => {
                const matches = desc.match(pattern);
                if (matches) {
                    userProfile.achievements.push(...matches);
                }
            });
        });
    });
}

// Generate matching suggestions for requirements
function generateMatchingSuggestions(requirement) {
    const suggestions = [];
    const reqKeywords = requirement.keywords;
    
    // Find matching experiences
    userProfile.experiences.forEach(exp => {
        const matchScore = calculateMatchScore(reqKeywords, exp.keywords);
        if (matchScore > 0.3) {
            suggestions.push({
                type: 'experience',
                content: generateExperienceSentence(requirement, exp),
                matchScore: matchScore,
                source: exp
            });
        }
    });
    
    // Find matching skills
    const matchingSkills = userProfile.skills.filter(skill => 
        reqKeywords.some(keyword => 
            skill.toLowerCase().includes(keyword) || 
            keyword.includes(skill.toLowerCase())
        )
    );
    
    if (matchingSkills.length > 0) {
        suggestions.push({
            type: 'skill',
            content: generateSkillSentence(requirement, matchingSkills),
            matchScore: 0.8,
            source: matchingSkills
        });
    }
    
    // Generate alternative formulations
    suggestions.push({
        type: 'alternative',
        content: generateAlternativeSentence(requirement),
        matchScore: 0.5,
        source: null
    });
    
    return suggestions.sort((a, b) => b.matchScore - a.matchScore);
}

function calculateMatchScore(reqKeywords, expKeywords) {
    let matches = 0;
    reqKeywords.forEach(reqWord => {
        if (expKeywords.some(expWord => 
            expWord.includes(reqWord) || reqWord.includes(expWord)
        )) {
            matches++;
        }
    });
    
    return matches / reqKeywords.length;
}

function generateExperienceSentence(requirement, experience) {
    const templates = [
        `In meiner Rolle als ${experience.position} bei ${experience.company} konnte ich ${requirement.text.toLowerCase()} erfolgreich umsetzen.`,
        `Diese Anforderung erfülle ich durch meine Erfahrung als ${experience.position}, wo ich ${extractActionFromRequirement(requirement.text)} verantwortete.`,
        `Meine Tätigkeit als ${experience.position} hat mir ermöglicht, genau diese Kompetenzen zu entwickeln und erfolgreich anzuwenden.`,
        `Als ${experience.position} bei ${experience.company} war ich maßgeblich für ${extractActionFromRequirement(requirement.text)} verantwortlich.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
}

function generateSkillSentence(requirement, skills) {
    const skillList = skills.slice(0, 3).join(', ');
    
    const templates = [
        `Meine Expertise in ${skillList} ermöglicht es mir, ${extractActionFromRequirement(requirement.text)}.`,
        `Durch meine fundierten Kenntnisse in ${skillList} bin ich bestens für diese Anforderung gerüstet.`,
        `Mit ${skillList} verfüge ich über die erforderlichen Kompetenzen, um ${extractActionFromRequirement(requirement.text)}.`,
        `Meine Fähigkeiten in ${skillList} setze ich gezielt ein, um ${extractActionFromRequirement(requirement.text)}.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
}

function generateAlternativeSentence(requirement) {
    const action = extractActionFromRequirement(requirement.text);
    
    const templates = [
        `Diese Herausforderung motiviert mich besonders, da ich ${action} als zentrale Aufgabe meiner bisherigen Laufbahn betrachte.`,
        `Ich bringe die notwendige Erfahrung mit, um ${action} erfolgreich zu gestalten.`,
        `Die Möglichkeit, ${action}, entspricht genau meinen beruflichen Stärken und Interessen.`,
        `Meine bisherige Laufbahn hat mich optimal darauf vorbereitet, ${action}.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
}

function extractActionFromRequirement(requirementText) {
    // Extract the main action or requirement from the sentence
    const text = requirementText.toLowerCase();
    
    // Remove common prefixes
    const prefixes = ['sie ', 'wir erwarten ', 'sie sollten ', 'sie haben ', 'sie bringen '];
    let action = text;
    
    prefixes.forEach(prefix => {
        if (action.startsWith(prefix)) {
            action = action.substring(prefix.length);
        }
    });
    
    // Clean up
    action = action.replace(/^\s+|\s+$/g, '');
    if (action.endsWith('.')) {
        action = action.slice(0, -1);
    }
    
    return action;
}

// Generate personalized greetings
function generateGreetings(source = 'Stellenanzeige') {
    // Use user's learned greeting patterns or defaults
    const userGreetings = userProfile.writingStyle.greetings.length > 0 
        ? userProfile.writingStyle.greetings 
        : ['Sehr geehrte Damen und Herren,', 'Sehr geehrtes Team,'];
    
    const userIntros = userProfile.writingStyle.introductionPatterns.length > 0
        ? userProfile.writingStyle.introductionPatterns
        : [
            `mit großem Interesse habe ich Ihre ${source} gelesen`,
            `Ihre ${source} hat meine Aufmerksamkeit geweckt`,
            `mit Begeisterung habe ich Ihre ${source} zur Kenntnis genommen`
        ];
    
    const sources = {
        'LinkedIn': ['auf LinkedIn', 'in Ihrem LinkedIn-Post', 'über LinkedIn'],
        'Stellenanzeige': ['auf Ihrer Webseite', 'im Internet', 'online'],
        'Xing': ['auf Xing', 'über Xing'],
        'Indeed': ['auf Indeed', 'über Indeed'],
        'StepStone': ['auf StepStone', 'über StepStone'],
        'Sonstiges': ['', 'in Ihrer Ausschreibung', 'in Ihrem Inserat']
    };
    
    const sourceVariations = sources[source] || [''];
    const position = workflowData?.position || 'die ausgeschriebene Position';
    const company = workflowData?.company || 'Ihrem Unternehmen';
    
    // Generate variations based on user's style
    const variations = [];
    
    // Style 1: Classic formal
    variations.push(`${userGreetings[0]}\n\n${userIntros[0]} ${sourceVariations[0]}.`);
    
    // Style 2: Position-focused
    variations.push(`${userGreetings[0]}\n\nmit großer Freude habe ich ${sourceVariations[0]} entdeckt, dass Sie eine/n ${position} suchen.`);
    
    // Style 3: Experience-focused
    const userPosition = userProfile.experiences[0]?.position || 'erfahrener Experte';
    variations.push(`${userGreetings[0]}\n\nals ${userPosition} hat mich Ihre Stellenausschreibung ${sourceVariations[0]} sofort angesprochen.`);
    
    // Style 4: Requirements-focused
    const mainReqs = extractMainRequirements();
    variations.push(`${userGreetings[0]}\n\ndie Kombination aus ${mainReqs} in Ihrer Stellenbeschreibung ${sourceVariations[0]} entspricht exakt meinem Profil.`);
    
    // Style 5: Company-focused
    variations.push(`${userGreetings[0]}\n\ndie Möglichkeit, als ${position} bei ${company} tätig zu werden, begeistert mich sehr.`);
    
    // Style 6: Enthusiasm-focused (if user shows high enthusiasm)
    if (userProfile.writingStyle.personalTone?.enthusiasm === 'high') {
        variations.push(`${userGreetings[0]}\n\nmit Begeisterung und großem Interesse habe ich ${sourceVariations[0]} von Ihrer offenen Position als ${position} erfahren.`);
    }
    
    // Style 7: Direct approach
    variations.push(`${userGreetings[0]}\n\nhiermit bewerbe ich mich auf die von Ihnen ${sourceVariations[0]} ausgeschriebene Stelle als ${position}.`);
    
    // Style 8: Network/referral (for "Sonstiges")
    if (source === 'Sonstiges') {
        variations.push(`${userGreetings[0]}\n\ndurch eine Empfehlung wurde ich auf die vakante Position als ${position} in Ihrem Unternehmen aufmerksam.`);
    }
    
    return {
        formal: variations[0],
        variations: variations.slice(0, 5) // Return top 5 variations
    };
}

function extractMainRequirements() {
    // Extract 2-3 main requirements from analyzed job description
    const mainReqs = workflowData.jobDescription
        ? analyzeJobDescription(workflowData.jobDescription)
            .slice(0, 3)
            .map(req => req.keywords[0])
            .join(' und ')
        : 'Ihren Anforderungen';
    
    return mainReqs;
}

// Generate closings based on user style
function generateClosings() {
    // Use user's learned closing patterns
    const userClosingPhrases = userProfile.writingStyle.closings.filter(c => 
        c.includes('freue') || c.includes('Gespräch') || c.includes('Gerne')
    );
    
    const userFormalClosings = userProfile.writingStyle.closings.filter(c =>
        c.includes('Grüßen') || c.includes('Grüße')
    );
    
    const formalClosing = userFormalClosings[0] || 'Mit freundlichen Grüßen';
    
    // Generate variations based on user style and tone
    const variations = [];
    
    // Style 1: Enthusiastic
    if (userProfile.writingStyle.personalTone?.enthusiasm === 'high') {
        variations.push('Mit großer Begeisterung sehe ich einem persönlichen Gespräch entgegen.');
        variations.push('Ich freue mich sehr darauf, Sie persönlich kennenzulernen und bin gespannt auf unseren Austausch.');
    }
    
    // Style 2: Confident
    if (userProfile.writingStyle.personalTone?.confidence === 'very confident') {
        variations.push('Ich bin überzeugt, dass meine Expertise perfekt zu Ihren Anforderungen passt und freue mich auf ein persönliches Gespräch.');
        variations.push('Gerne überzeuge ich Sie in einem persönlichen Gespräch von meiner Eignung für diese Position.');
    }
    
    // Style 3: Professional
    variations.push('Über eine Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.');
    variations.push('Ich stehe Ihnen gerne für ein persönliches Gespräch zur Verfügung.');
    
    // Style 4: Value-focused
    variations.push('Ich bin davon überzeugt, mit meiner Erfahrung einen wertvollen Beitrag zu Ihrem Team leisten zu können.');
    variations.push('Gerne erläutere ich Ihnen in einem persönlichen Gespräch, wie ich zum Erfolg Ihres Unternehmens beitragen kann.');
    
    // Style 5: Action-oriented
    variations.push('Für ein persönliches Kennenlernen stehe ich Ihnen jederzeit zur Verfügung.');
    variations.push('Lassen Sie uns in einem persönlichen Gespräch besprechen, wie ich Ihr Team optimal unterstützen kann.');
    
    // Add user's own patterns if available
    if (userClosingPhrases.length > 0) {
        variations.unshift(...userClosingPhrases.slice(0, 2));
    }
    
    // Style 6: Availability-focused
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    variations.push(`Für ein Gespräch stehe ich Ihnen ab dem ${nextWeek.toLocaleDateString('de-DE')} gerne zur Verfügung.`);
    
    return {
        selected: variations[0] || 'Über eine Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.',
        formal: formalClosing,
        variations: variations.slice(0, 5) // Return top 5 variations
    };
}

// Export functions
window.jobAnalyzer = {
    analyzeJobDescription,
    analyzeUserDocuments,
    generateMatchingSuggestions,
    generateGreetings,
    generateClosings,
    userProfile
};
