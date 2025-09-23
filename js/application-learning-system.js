// Application Learning System
// This system learns from each application to improve future suggestions

class ApplicationLearningSystem {
    constructor() {
        this.learningData = this.loadLearningData();
    }
    
    // Load existing learning data from localStorage
    loadLearningData() {
        const savedData = localStorage.getItem('applicationLearningData');
        return savedData ? JSON.parse(savedData) : {
            successfulPatterns: [],
            phraseMappings: {},
            companyPreferences: {},
            industryKeywords: {},
            responseTemplates: {},
            userCorrections: [],
            statisticalData: {
                totalApplications: 0,
                successfulApplications: 0,
                averageCoverLetterLength: 0,
                mostEffectivePhrases: [],
                bestPerformingIntros: [],
                bestPerformingClosings: []
            }
        };
    }
    
    // Save learning data
    saveLearningData() {
        localStorage.setItem('applicationLearningData', JSON.stringify(this.learningData));
    }
    
    // Learn from a completed application
    learnFromApplication(applicationData) {
        const {
            company,
            position,
            jobDescription,
            coverLetter,
            selectedRequirements,
            status,
            greeting,
            closing,
            customEdits
        } = applicationData;
        
        // Update statistical data
        this.learningData.statisticalData.totalApplications++;
        
        if (status === 'Vorstellungsgespräch' || status === 'Angenommen') {
            this.learningData.statisticalData.successfulApplications++;
            this.learnFromSuccessfulApplication(applicationData);
        }
        
        // Learn from cover letter
        this.analyzeCoverLetterPatterns(coverLetter);
        
        // Learn from requirement matching
        if (selectedRequirements) {
            this.learnFromRequirementMatching(selectedRequirements);
        }
        
        // Learn from user edits
        if (customEdits && customEdits.length > 0) {
            this.learnFromUserEdits(customEdits);
        }
        
        // Learn company preferences
        this.updateCompanyPreferences(company, applicationData);
        
        // Update industry keywords
        this.updateIndustryKeywords(position, jobDescription);
        
        this.saveLearningData();
    }
    
    // Learn from successful applications
    learnFromSuccessfulApplication(applicationData) {
        const pattern = {
            company: applicationData.company,
            position: applicationData.position,
            keyPhrases: this.extractKeyPhrases(applicationData.coverLetter),
            requirements: applicationData.selectedRequirements,
            greeting: applicationData.greeting,
            closing: applicationData.closing,
            timestamp: new Date().toISOString()
        };
        
        this.learningData.successfulPatterns.push(pattern);
        
        // Update best performing intros and closings
        this.updateBestPerformers(applicationData.greeting, 'intro');
        this.updateBestPerformers(applicationData.closing, 'closing');
    }
    
    // Extract key phrases from cover letter
    extractKeyPhrases(coverLetter) {
        const phrases = [];
        const sentencePatterns = [
            /[Mm]eine Erfahrung in (.+?) (ermöglicht|befähigt)/g,
            /[Ii]ch konnte (.+?) erfolgreich/g,
            /[Dd]urch (.+?) habe ich/g,
            /[Aa]ls (.+?) war ich/g
        ];
        
        sentencePatterns.forEach(pattern => {
            const matches = coverLetter.matchAll(pattern);
            for (const match of matches) {
                phrases.push(match[0]);
            }
        });
        
        return phrases;
    }
    
    // Learn from requirement matching
    learnFromRequirementMatching(selectedRequirements) {
        selectedRequirements.forEach(req => {
            const requirementText = req.requirement.text;
            const responseText = req.response;
            
            // Create mapping of requirement to response
            if (!this.learningData.phraseMappings[requirementText]) {
                this.learningData.phraseMappings[requirementText] = [];
            }
            
            this.learningData.phraseMappings[requirementText].push({
                response: responseText,
                timestamp: new Date().toISOString(),
                success: false // Will be updated when application status changes
            });
        });
    }
    
    // Learn from user edits
    learnFromUserEdits(edits) {
        edits.forEach(edit => {
            this.learningData.userCorrections.push({
                original: edit.original,
                corrected: edit.corrected,
                context: edit.context,
                timestamp: new Date().toISOString()
            });
        });
        
        // Analyze corrections to improve future suggestions
        this.analyzeUserCorrections();
    }
    
    // Analyze user corrections to identify patterns
    analyzeUserCorrections() {
        const corrections = this.learningData.userCorrections;
        const patterns = {};
        
        corrections.forEach(correction => {
            // Find common replacements
            const key = `${correction.original} -> ${correction.corrected}`;
            patterns[key] = (patterns[key] || 0) + 1;
        });
        
        // Store frequently corrected patterns
        this.learningData.correctionPatterns = Object.entries(patterns)
            .filter(([_, count]) => count > 2)
            .map(([pattern, count]) => ({ pattern, count }));
    }
    
    // Update company preferences
    updateCompanyPreferences(company, applicationData) {
        if (!this.learningData.companyPreferences[company]) {
            this.learningData.companyPreferences[company] = {
                applications: 0,
                successfulApplications: 0,
                preferredPhrases: [],
                averageLength: 0
            };
        }
        
        const prefs = this.learningData.companyPreferences[company];
        prefs.applications++;
        
        if (applicationData.status === 'Vorstellungsgespräch' || applicationData.status === 'Angenommen') {
            prefs.successfulApplications++;
            prefs.preferredPhrases.push(...this.extractKeyPhrases(applicationData.coverLetter));
        }
    }
    
    // Update industry keywords
    updateIndustryKeywords(position, jobDescription) {
        const industry = this.detectIndustry(position, jobDescription);
        
        if (!this.learningData.industryKeywords[industry]) {
            this.learningData.industryKeywords[industry] = {};
        }
        
        // Extract and count keywords
        const keywords = this.extractKeywords(jobDescription);
        keywords.forEach(keyword => {
            this.learningData.industryKeywords[industry][keyword] = 
                (this.learningData.industryKeywords[industry][keyword] || 0) + 1;
        });
    }
    
    // Detect industry from position and job description
    detectIndustry(position, jobDescription) {
        const industryKeywords = {
            'IT': ['software', 'entwicklung', 'programmierung', 'cloud', 'data'],
            'HR': ['personal', 'recruiting', 'talent', 'mitarbeiter', 'führung'],
            'Finance': ['finanzen', 'controlling', 'buchhaltung', 'analyse', 'reporting'],
            'Sales': ['vertrieb', 'verkauf', 'kunden', 'umsatz', 'akquise'],
            'Marketing': ['marketing', 'kampagne', 'social media', 'content', 'brand']
        };
        
        const text = (position + ' ' + jobDescription).toLowerCase();
        let bestMatch = 'General';
        let maxScore = 0;
        
        Object.entries(industryKeywords).forEach(([industry, keywords]) => {
            const score = keywords.filter(kw => text.includes(kw)).length;
            if (score > maxScore) {
                maxScore = score;
                bestMatch = industry;
            }
        });
        
        return bestMatch;
    }
    
    // Extract keywords from text
    extractKeywords(text) {
        const stopWords = ['der', 'die', 'das', 'und', 'oder', 'aber', 'in', 'mit', 'von', 'zu'];
        return text.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 4 && !stopWords.includes(word))
            .filter((word, index, self) => self.indexOf(word) === index);
    }
    
    // Update best performers
    updateBestPerformers(text, type) {
        const targetArray = type === 'intro' 
            ? this.learningData.statisticalData.bestPerformingIntros
            : this.learningData.statisticalData.bestPerformingClosings;
        
        const existing = targetArray.find(item => item.text === text);
        if (existing) {
            existing.successCount++;
        } else {
            targetArray.push({
                text: text,
                successCount: 1,
                lastUsed: new Date().toISOString()
            });
        }
        
        // Sort by success count
        targetArray.sort((a, b) => b.successCount - a.successCount);
        
        // Keep only top 10
        if (targetArray.length > 10) {
            targetArray.length = 10;
        }
    }
    
    // Get improved suggestions based on learning
    getImprovedSuggestions(requirement) {
        const suggestions = [];
        
        // Check if we have successful patterns for similar requirements
        const similarPatterns = this.findSimilarPatterns(requirement.text);
        
        similarPatterns.forEach(pattern => {
            suggestions.push({
                text: pattern.response,
                confidence: pattern.confidence,
                source: 'learned'
            });
        });
        
        // Apply user corrections
        suggestions.forEach(suggestion => {
            suggestion.text = this.applyUserCorrections(suggestion.text);
        });
        
        return suggestions;
    }
    
    // Find similar patterns in learning data
    findSimilarPatterns(requirementText) {
        const patterns = [];
        const keywords = this.extractKeywords(requirementText);
        
        Object.entries(this.learningData.phraseMappings).forEach(([req, responses]) => {
            const similarity = this.calculateSimilarity(requirementText, req);
            if (similarity > 0.6) {
                responses.forEach(response => {
                    patterns.push({
                        response: response.response,
                        confidence: similarity,
                        success: response.success
                    });
                });
            }
        });
        
        // Sort by confidence and success
        patterns.sort((a, b) => {
            if (a.success && !b.success) return -1;
            if (!a.success && b.success) return 1;
            return b.confidence - a.confidence;
        });
        
        return patterns.slice(0, 3);
    }
    
    // Calculate text similarity
    calculateSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }
    
    // Apply user corrections to text
    applyUserCorrections(text) {
        let correctedText = text;
        
        this.learningData.userCorrections.forEach(correction => {
            if (correctedText.includes(correction.original)) {
                correctedText = correctedText.replace(correction.original, correction.corrected);
            }
        });
        
        return correctedText;
    }
    
    // Get learning insights
    getLearningInsights() {
        const insights = {
            totalApplications: this.learningData.statisticalData.totalApplications,
            successRate: this.learningData.statisticalData.successfulApplications / 
                        this.learningData.statisticalData.totalApplications || 0,
            mostSuccessfulCompanies: this.getMostSuccessfulCompanies(),
            mostEffectiveIntros: this.learningData.statisticalData.bestPerformingIntros.slice(0, 3),
            mostEffectiveClosings: this.learningData.statisticalData.bestPerformingClosings.slice(0, 3),
            commonCorrections: this.learningData.correctionPatterns || []
        };
        
        return insights;
    }
    
    // Get most successful companies
    getMostSuccessfulCompanies() {
        return Object.entries(this.learningData.companyPreferences)
            .map(([company, data]) => ({
                company,
                successRate: data.successfulApplications / data.applications || 0,
                applications: data.applications
            }))
            .filter(c => c.applications > 0)
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 5);
    }
}

// Initialize learning system
window.applicationLearningSystem = new ApplicationLearningSystem();

// Hook into application save process
window.saveApplicationWithLearning = function(applicationData) {
    // Learn from the application
    window.applicationLearningSystem.learnFromApplication(applicationData);
    
    // Save the application normally
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push(applicationData);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    return applicationData;
};

// Hook into status update process
window.updateApplicationStatusWithLearning = function(applicationId, newStatus) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const app = applications.find(a => a.id === applicationId);
    
    if (app) {
        const oldStatus = app.status;
        app.status = newStatus;
        
        // If status changed to successful, update learning data
        if ((newStatus === 'Vorstellungsgespräch' || newStatus === 'Angenommen') &&
            oldStatus !== 'Vorstellungsgespräch' && oldStatus !== 'Angenommen') {
            window.applicationLearningSystem.learnFromSuccessfulApplication(app);
        }
        
        localStorage.setItem('applications', JSON.stringify(applications));
    }
};
