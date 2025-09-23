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
    // Extract greetings
    const greetingMatch = coverLetter.match(/^(Sehr geehrte.*?,|Liebe.*?,|Hallo.*?,)/m);
    if (greetingMatch && !userProfile.writingStyle.greetings.includes(greetingMatch[1])) {
        userProfile.writingStyle.greetings.push(greetingMatch[1]);
    }
    
    // Extract closings
    const closingMatch = coverLetter.match(/(Mit freundlichen Grüßen|Beste Grüße|Freundliche Grüße|Herzliche Grüße)/);
    if (closingMatch && !userProfile.writingStyle.closings.includes(closingMatch[1])) {
        userProfile.writingStyle.closings.push(closingMatch[1]);
    }
    
    // Extract transition phrases
    const transitions = [
        /[Dd]arüber hinaus/g,
        /[Zz]udem/g,
        /[Dd]es Weiteren/g,
        /[Aa]ußerdem/g,
        /[Ii]nsbesondere/g,
        /[Dd]abei/g
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
    const defaultGreetings = [
        `mit großem Interesse habe ich Ihre ${source} gelesen`,
        `Ihre ${source} hat meine Aufmerksamkeit geweckt`,
        `mit Begeisterung habe ich Ihre ${source} zur Kenntnis genommen`,
        `beim Lesen Ihrer ${source} war ich sofort überzeugt`,
        `Ihre ${source} spricht mich in besonderem Maße an`
    ];
    
    const sources = {
        'LinkedIn': ['auf LinkedIn', 'in Ihrem LinkedIn-Post', 'über LinkedIn'],
        'Stellenanzeige': ['auf Ihrer Webseite', 'im Internet', 'online'],
        'Xing': ['auf Xing', 'über Xing'],
        'Indeed': ['auf Indeed', 'über Indeed'],
        'StepStone': ['auf StepStone', 'über StepStone']
    };
    
    const sourceVariations = sources[source] || [''];
    const greeting = defaultGreetings[Math.floor(Math.random() * defaultGreetings.length)];
    const variation = sourceVariations[Math.floor(Math.random() * sourceVariations.length)];
    
    // Combine user's style if available
    const userGreeting = userProfile.writingStyle.greetings[0] || 'Sehr geehrte Damen und Herren,';
    
    return {
        formal: `${userGreeting}\n\n${greeting} ${variation}.`,
        variations: [
            `${userGreeting}\n\nmit großer Freude habe ich ${variation} entdeckt, dass Sie eine/n ${workflowData.position} suchen.`,
            `${userGreeting}\n\nals ${userProfile.experiences[0]?.position || 'erfahrener Experte'} hat mich Ihre Stellenausschreibung ${variation} sofort angesprochen.`,
            `${userGreeting}\n\ndie Kombination aus ${extractMainRequirements()} in Ihrer Stellenbeschreibung ${variation} entspricht exakt meinem Profil.`
        ]
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
    const defaultClosings = [
        'Über eine Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.',
        'Ich freue mich darauf, Sie in einem persönlichen Gespräch von meinen Qualifikationen zu überzeugen.',
        'Gerne stelle ich Ihnen meine Expertise in einem persönlichen Gespräch vor.',
        'Auf eine positive Rückmeldung und die Möglichkeit eines persönlichen Austauschs freue ich mich.',
        'Ich bin überzeugt, dass ich mit meiner Erfahrung einen wertvollen Beitrag zu Ihrem Team leisten kann und freue mich auf Ihre Rückmeldung.'
    ];
    
    const userClosing = userProfile.writingStyle.closings[0] || 'Mit freundlichen Grüßen';
    
    return {
        selected: defaultClosings[0],
        formal: userClosing,
        variations: defaultClosings
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
