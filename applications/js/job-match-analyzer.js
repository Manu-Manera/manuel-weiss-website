/**
 * ═══════════════════════════════════════════════════════════════════════════
 * JOB MATCH ANALYZER
 * Real-time job matching score and keyword analysis
 * ═══════════════════════════════════════════════════════════════════════════
 */

class JobMatchAnalyzer {
    constructor() {
        this.matchScore = 0;
        this.foundKeywords = [];
        this.missingKeywords = [];
        this.skillGaps = [];
        this.debounceTimeout = null;
        
        // Keyword categories with weights
        this.keywordCategories = {
            required: { weight: 3, patterns: ['muss', 'erforderlich', 'voraussetzung', 'zwingend'] },
            preferred: { weight: 2, patterns: ['wünschenswert', 'idealerweise', 'von vorteil', 'gerne'] },
            nice: { weight: 1, patterns: ['plus', 'bonus', 'optional'] }
        };
        
        // Common skill synonyms for better matching
        this.skillSynonyms = {
            'javascript': ['js', 'ecmascript', 'es6', 'es2015'],
            'python': ['py', 'python3'],
            'typescript': ['ts'],
            'react': ['reactjs', 'react.js'],
            'vue': ['vuejs', 'vue.js'],
            'angular': ['angularjs', 'angular.js'],
            'node': ['nodejs', 'node.js'],
            'sql': ['mysql', 'postgresql', 'postgres', 'sqlite', 'mssql'],
            'agile': ['scrum', 'kanban', 'sprint'],
            'cloud': ['aws', 'azure', 'gcp', 'google cloud'],
            'ci/cd': ['jenkins', 'gitlab ci', 'github actions', 'devops'],
            'kommunikation': ['kommunikativ', 'kommunikationsstark'],
            'teamarbeit': ['teamfähig', 'teamplayer', 'teamorientiert'],
            'projektmanagement': ['pm', 'projektleitung', 'projektmanager']
        };
        
        this.init();
    }
    
    init() {
        this.createMatchDashboard();
        this.setupEventListeners();
        console.log('📊 Job Match Analyzer initialized');
    }
    
    createMatchDashboard() {
        // Find where to insert the dashboard
        const sidebar = document.querySelector('.editor-sidebar') || 
                       document.querySelector('.resume-section:first-of-type');
        
        if (!sidebar) return;
        
        // Check if dashboard already exists
        if (document.getElementById('jobMatchDashboard')) return;
        
        const dashboard = document.createElement('div');
        dashboard.id = 'jobMatchDashboard';
        dashboard.className = 'job-match-dashboard';
        dashboard.innerHTML = `
            <div class="match-header">
                <h3><i class="fas fa-chart-pie"></i> Job-Match Score</h3>
                <button class="match-collapse-btn" title="Ein-/Ausklappen">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            
            <div class="match-content">
                <!-- Score Ring -->
                <div class="match-score-ring">
                    <svg viewBox="0 0 100 100">
                        <circle class="score-bg" cx="50" cy="50" r="45" />
                        <circle class="score-progress" cx="50" cy="50" r="45" 
                                stroke-dasharray="283" stroke-dashoffset="283" />
                    </svg>
                    <div class="score-value">
                        <span class="score-number">0</span>
                        <span class="score-percent">%</span>
                    </div>
                </div>
                
                <div class="match-label">
                    <span class="match-status">Noch keine Analyse</span>
                </div>
                
                <!-- Keywords Section -->
                <div class="match-keywords">
                    <div class="keywords-section found">
                        <h4><i class="fas fa-check-circle"></i> Gefundene Keywords</h4>
                        <div class="keywords-list" id="foundKeywordsList">
                            <span class="no-keywords">-</span>
                        </div>
                    </div>
                    
                    <div class="keywords-section missing">
                        <h4><i class="fas fa-exclamation-circle"></i> Fehlende Keywords</h4>
                        <div class="keywords-list" id="missingKeywordsList">
                            <span class="no-keywords">-</span>
                        </div>
                    </div>
                </div>
                
                <!-- Skill Gaps -->
                <div class="skill-gaps" id="skillGapsSection" style="display: none;">
                    <h4><i class="fas fa-puzzle-piece"></i> Skill-Gaps</h4>
                    <div class="gaps-list" id="skillGapsList"></div>
                </div>
                
                <!-- Suggestions -->
                <div class="match-suggestions" id="matchSuggestions">
                    <h4><i class="fas fa-lightbulb"></i> Verbesserungsvorschläge</h4>
                    <ul class="suggestions-list"></ul>
                </div>
            </div>
        `;
        
        // Insert at appropriate position
        const atsSection = document.querySelector('.resume-ai-section') ||
                          document.querySelector('[id*="ats"]');
        if (atsSection) {
            atsSection.parentNode.insertBefore(dashboard, atsSection);
        } else {
            sidebar.insertBefore(dashboard, sidebar.firstChild);
        }
        
        // Collapse functionality
        const collapseBtn = dashboard.querySelector('.match-collapse-btn');
        collapseBtn.addEventListener('click', () => {
            dashboard.classList.toggle('collapsed');
            const icon = collapseBtn.querySelector('i');
            icon.classList.toggle('fa-chevron-up');
            icon.classList.toggle('fa-chevron-down');
        });
    }
    
    setupEventListeners() {
        // Listen to job description changes
        const jobDescFields = ['atsJobDescription', 'jobDescription'];
        jobDescFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('input', () => this.debouncedAnalyze());
            }
        });
        
        // Listen to resume field changes
        const resumeFields = ['summary', 'title'];
        resumeFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('input', () => this.debouncedAnalyze());
            }
        });
        
        // Listen to dynamic content changes
        const observer = new MutationObserver(() => this.debouncedAnalyze());
        const containers = ['experienceContainer', 'technicalSkillsContainer', 'softSkillsContainer'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                observer.observe(container, { childList: true, subtree: true, characterData: true });
            }
        });
        
        // Initial analysis after a short delay
        setTimeout(() => this.analyze(), 1000);
    }
    
    debouncedAnalyze() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => this.analyze(), 500);
    }
    
    analyze() {
        const jobDescription = this.getJobDescription();
        const resumeContent = this.getResumeContent();
        
        if (!jobDescription || jobDescription.length < 50) {
            this.updateDashboard(0, [], [], [], []);
            return;
        }
        
        // Extract keywords from job description
        const jobKeywords = this.extractKeywords(jobDescription);
        
        // Find matches in resume
        const { found, missing } = this.findMatches(jobKeywords, resumeContent);
        
        // Calculate score
        const score = this.calculateScore(found, missing, jobKeywords);
        
        // Identify skill gaps
        const gaps = this.identifySkillGaps(missing);
        
        // Generate suggestions
        const suggestions = this.generateSuggestions(missing, score);
        
        // Update UI
        this.updateDashboard(score, found, missing, gaps, suggestions);
    }
    
    getJobDescription() {
        const atsField = document.getElementById('atsJobDescription');
        const jobField = document.getElementById('jobDescription');
        return (atsField?.value || '') + ' ' + (jobField?.value || '');
    }
    
    getResumeContent() {
        const parts = [];
        
        // Personal info
        const fields = ['title', 'summary'];
        fields.forEach(id => {
            const field = document.getElementById(id);
            if (field?.value) parts.push(field.value);
        });
        
        // Experience descriptions
        document.querySelectorAll('[data-field="description"]').forEach(field => {
            if (field.value) parts.push(field.value);
        });
        
        // Skills
        document.querySelectorAll('.skill-tag input, .soft-skill-item input').forEach(input => {
            if (input.value) parts.push(input.value);
        });
        
        // Skill categories
        document.querySelectorAll('.skill-category-name').forEach(input => {
            if (input.value) parts.push(input.value);
        });
        
        return parts.join(' ').toLowerCase();
    }
    
    extractKeywords(text) {
        const keywords = new Map(); // keyword -> { weight, context }
        const textLower = text.toLowerCase();
        
        // Common German stop words to exclude
        const stopWords = new Set([
            'und', 'oder', 'der', 'die', 'das', 'ein', 'eine', 'für', 'mit', 'von',
            'zu', 'bei', 'auf', 'aus', 'nach', 'über', 'unter', 'durch', 'als',
            'ist', 'sind', 'werden', 'wird', 'haben', 'hat', 'sein', 'kann',
            'sowie', 'auch', 'wenn', 'dann', 'dass', 'sich', 'wir', 'sie', 'ihr',
            'uns', 'unser', 'ihre', 'deine', 'meine', 'man', 'mehr', 'sehr',
            'gerne', 'gute', 'guten', 'guter', 'neue', 'neuen', 'neuer', 'erste'
        ]);
        
        // Extract words (3+ characters)
        const words = textLower
            .replace(/[^a-zäöüß0-9\s-]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length >= 3 && !stopWords.has(w));
        
        // Count word frequency and determine weight
        words.forEach((word, index) => {
            // Skip pure numbers
            if (/^\d+$/.test(word)) return;
            
            // Check context for weight
            const contextStart = Math.max(0, index - 5);
            const contextEnd = Math.min(words.length, index + 5);
            const context = words.slice(contextStart, contextEnd).join(' ');
            
            let weight = 1;
            
            // Check for requirement indicators
            if (this.keywordCategories.required.patterns.some(p => context.includes(p))) {
                weight = 3;
            } else if (this.keywordCategories.preferred.patterns.some(p => context.includes(p))) {
                weight = 2;
            }
            
            // Increase weight for frequent words
            const existing = keywords.get(word);
            if (existing) {
                keywords.set(word, { 
                    weight: Math.max(existing.weight, weight),
                    count: existing.count + 1
                });
            } else {
                keywords.set(word, { weight, count: 1 });
            }
        });
        
        // Filter to most relevant keywords (appear at least twice or have high weight)
        const filtered = new Map();
        keywords.forEach((data, word) => {
            if (data.count >= 2 || data.weight >= 2) {
                filtered.set(word, data);
            }
        });
        
        // Add common compound terms
        const compounds = this.extractCompoundTerms(textLower);
        compounds.forEach((term, data) => {
            filtered.set(term, { weight: 2, count: 1 });
        });
        
        return filtered;
    }
    
    extractCompoundTerms(text) {
        const compounds = new Map();
        
        // Common job-related compound terms
        const patterns = [
            /projektmanagement/gi,
            /teamführung/gi,
            /kundenbetreuung/gi,
            /qualitätssicherung/gi,
            /software-entwicklung/gi,
            /web-entwicklung/gi,
            /datenanalyse/gi,
            /prozessoptimierung/gi,
            /change management/gi,
            /stakeholder management/gi,
            /requirement engineering/gi,
            /business intelligence/gi,
            /machine learning/gi,
            /deep learning/gi,
            /user experience/gi,
            /agile methoden/gi,
            /continuous integration/gi,
            /full.?stack/gi,
            /front.?end/gi,
            /back.?end/gi
        ];
        
        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                const term = matches[0].toLowerCase().replace(/[^a-zäöüß\s-]/g, '');
                compounds.set(term, { weight: 2, count: matches.length });
            }
        });
        
        return compounds;
    }
    
    findMatches(jobKeywords, resumeContent) {
        const found = [];
        const missing = [];
        
        jobKeywords.forEach((data, keyword) => {
            // Check direct match
            let isFound = resumeContent.includes(keyword);
            
            // Check synonyms
            if (!isFound) {
                for (const [main, synonyms] of Object.entries(this.skillSynonyms)) {
                    if (keyword === main || synonyms.includes(keyword)) {
                        // Check if any synonym is in resume
                        isFound = [main, ...synonyms].some(s => resumeContent.includes(s));
                        break;
                    }
                }
            }
            
            if (isFound) {
                found.push({ keyword, weight: data.weight });
            } else {
                missing.push({ keyword, weight: data.weight });
            }
        });
        
        return { found, missing };
    }
    
    calculateScore(found, missing, allKeywords) {
        if (allKeywords.size === 0) return 0;
        
        let totalWeight = 0;
        let foundWeight = 0;
        
        allKeywords.forEach(data => {
            totalWeight += data.weight;
        });
        
        found.forEach(item => {
            foundWeight += item.weight;
        });
        
        const score = Math.round((foundWeight / totalWeight) * 100);
        return Math.min(100, Math.max(0, score));
    }
    
    identifySkillGaps(missing) {
        // Group missing keywords into categories
        const gaps = [];
        
        // Technical skills
        const techKeywords = missing.filter(m => 
            this.isTechnicalKeyword(m.keyword)
        );
        if (techKeywords.length) {
            gaps.push({
                category: 'Technische Skills',
                items: techKeywords.map(k => k.keyword),
                priority: 'high'
            });
        }
        
        // Soft skills
        const softKeywords = missing.filter(m => 
            this.isSoftSkillKeyword(m.keyword)
        );
        if (softKeywords.length) {
            gaps.push({
                category: 'Soft Skills',
                items: softKeywords.map(k => k.keyword),
                priority: 'medium'
            });
        }
        
        return gaps;
    }
    
    isTechnicalKeyword(keyword) {
        const techPatterns = [
            /java|python|javascript|typescript|react|vue|angular|node|sql|aws|azure|docker|kubernetes|git|api|cloud|agile|scrum|devops|ci|cd|html|css|php|ruby|go|rust|swift|kotlin/i
        ];
        return techPatterns.some(p => p.test(keyword));
    }
    
    isSoftSkillKeyword(keyword) {
        const softPatterns = [
            /kommunikation|team|führung|organisation|präsentation|verhandlung|kreativ|analytisch|selbstständig|flexibel|belastbar|motivation|empathie|konflikt|problem|lösung/i
        ];
        return softPatterns.some(p => p.test(keyword));
    }
    
    generateSuggestions(missing, score) {
        const suggestions = [];
        
        if (score < 30) {
            suggestions.push({
                text: 'Ihr Profil stimmt kaum mit der Stelle überein. Überprüfen Sie die Anforderungen.',
                priority: 'high'
            });
        } else if (score < 50) {
            suggestions.push({
                text: 'Ergänzen Sie fehlende Keywords in Ihrem Kurzprofil und den Erfahrungen.',
                priority: 'high'
            });
        } else if (score < 70) {
            suggestions.push({
                text: 'Gute Basis! Fügen Sie noch einige fehlende Schlüsselbegriffe hinzu.',
                priority: 'medium'
            });
        } else if (score < 90) {
            suggestions.push({
                text: 'Sehr gute Übereinstimmung! Kleine Optimierungen sind noch möglich.',
                priority: 'low'
            });
        }
        
        // Specific suggestions based on missing keywords
        const highWeightMissing = missing.filter(m => m.weight >= 2);
        if (highWeightMissing.length > 0) {
            suggestions.push({
                text: `Wichtige fehlende Begriffe: "${highWeightMissing.slice(0, 3).map(m => m.keyword).join('", "')}"`,
                priority: 'high'
            });
        }
        
        // Quantification suggestion
        const resumeContent = this.getResumeContent();
        if (!/\d+\s*%|\d+\s*(euro|€|umsatz|kunden|mitarbeiter|projekt)/i.test(resumeContent)) {
            suggestions.push({
                text: 'Fügen Sie messbare Ergebnisse hinzu (Zahlen, Prozente, Beträge).',
                priority: 'medium'
            });
        }
        
        return suggestions;
    }
    
    updateDashboard(score, found, missing, gaps, suggestions) {
        const dashboard = document.getElementById('jobMatchDashboard');
        if (!dashboard) return;
        
        this.matchScore = score;
        this.foundKeywords = found;
        this.missingKeywords = missing;
        this.skillGaps = gaps;
        
        // Update score ring
        const scoreNumber = dashboard.querySelector('.score-number');
        const scoreProgress = dashboard.querySelector('.score-progress');
        const matchStatus = dashboard.querySelector('.match-status');
        
        if (scoreNumber) scoreNumber.textContent = score;
        
        if (scoreProgress) {
            // Circumference = 2 * PI * 45 = 283
            const offset = 283 - (283 * score / 100);
            scoreProgress.style.strokeDashoffset = offset;
            
            // Color based on score
            if (score >= 70) {
                scoreProgress.style.stroke = '#10b981';
            } else if (score >= 40) {
                scoreProgress.style.stroke = '#f59e0b';
            } else {
                scoreProgress.style.stroke = '#ef4444';
            }
        }
        
        if (matchStatus) {
            if (score === 0) {
                matchStatus.textContent = 'Stellenbeschreibung eingeben';
                matchStatus.className = 'match-status neutral';
            } else if (score >= 70) {
                matchStatus.textContent = 'Sehr gute Übereinstimmung';
                matchStatus.className = 'match-status good';
            } else if (score >= 40) {
                matchStatus.textContent = 'Mittlere Übereinstimmung';
                matchStatus.className = 'match-status medium';
            } else {
                matchStatus.textContent = 'Geringe Übereinstimmung';
                matchStatus.className = 'match-status low';
            }
        }
        
        // Update found keywords
        const foundList = document.getElementById('foundKeywordsList');
        if (foundList) {
            if (found.length) {
                foundList.innerHTML = found
                    .sort((a, b) => b.weight - a.weight)
                    .slice(0, 15)
                    .map(k => `<span class="keyword found weight-${k.weight}">${k.keyword}</span>`)
                    .join('');
            } else {
                foundList.innerHTML = '<span class="no-keywords">Keine gefunden</span>';
            }
        }
        
        // Update missing keywords
        const missingList = document.getElementById('missingKeywordsList');
        if (missingList) {
            if (missing.length) {
                missingList.innerHTML = missing
                    .sort((a, b) => b.weight - a.weight)
                    .slice(0, 10)
                    .map(k => `<span class="keyword missing weight-${k.weight}" title="Klicken zum Hinzufügen" data-keyword="${k.keyword}">${k.keyword}</span>`)
                    .join('');
                
                // Add click handlers to add keywords
                missingList.querySelectorAll('.keyword.missing').forEach(el => {
                    el.addEventListener('click', () => {
                        this.suggestAddKeyword(el.dataset.keyword);
                    });
                });
            } else {
                missingList.innerHTML = '<span class="no-keywords">Alle wichtigen gefunden!</span>';
            }
        }
        
        // Update skill gaps
        const gapsSection = document.getElementById('skillGapsSection');
        const gapsList = document.getElementById('skillGapsList');
        if (gapsSection && gapsList) {
            if (gaps.length) {
                gapsSection.style.display = 'block';
                gapsList.innerHTML = gaps.map(gap => `
                    <div class="gap-category ${gap.priority}">
                        <strong>${gap.category}</strong>
                        <div class="gap-items">
                            ${gap.items.slice(0, 5).map(item => `<span>${item}</span>`).join('')}
                        </div>
                    </div>
                `).join('');
            } else {
                gapsSection.style.display = 'none';
            }
        }
        
        // Update suggestions
        const suggestionsSection = document.getElementById('matchSuggestions');
        if (suggestionsSection) {
            const list = suggestionsSection.querySelector('.suggestions-list');
            if (list) {
                if (suggestions.length) {
                    list.innerHTML = suggestions.map(s => `
                        <li class="suggestion-${s.priority}">
                            <i class="fas fa-${s.priority === 'high' ? 'exclamation-triangle' : s.priority === 'medium' ? 'info-circle' : 'check-circle'}"></i>
                            ${s.text}
                        </li>
                    `).join('');
                } else {
                    list.innerHTML = '<li class="suggestion-success"><i class="fas fa-check-circle"></i> Optimales Matching erreicht!</li>';
                }
            }
        }
    }
    
    suggestAddKeyword(keyword) {
        // Find the summary field and suggest adding the keyword
        const summary = document.getElementById('summary');
        if (summary) {
            const currentValue = summary.value;
            if (!currentValue.toLowerCase().includes(keyword.toLowerCase())) {
                // Show a notification or prompt
                if (confirm(`"${keyword}" zum Kurzprofil hinzufügen?`)) {
                    summary.value = currentValue + (currentValue ? '. ' : '') + 
                                   `Erfahrung in ${keyword}.`;
                    summary.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
    }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only init on resume or cover letter editor pages
    if (document.getElementById('resumeForm') || document.getElementById('atsJobDescription') || 
        document.getElementById('jobDescription')) {
        window.jobMatchAnalyzer = new JobMatchAnalyzer();
    }
});
