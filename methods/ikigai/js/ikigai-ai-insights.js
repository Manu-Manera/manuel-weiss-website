/**
 * 🧠 Ikigai AI Insights System
 * KI-basierte Analyse und personalisierte Empfehlungen
 * Autor: Manuel Weiss
 * Version: 1.0
 */

class IkigaiAIInsights {
    constructor() {
        this.analysisData = {};
        this.insights = {};
        this.recommendations = {};
        this.patterns = {};
        this.init();
    }

    init() {
        this.setupAnalysisEngine();
        this.loadExistingData();
        console.log('🧠 Ikigai AI Insights initialized');
    }

    setupAnalysisEngine() {
        // Schlüsselwörter für verschiedene Bereiche
        this.keywordPatterns = {
            passion: {
                positive: ['liebe', 'begeisterung', 'freude', 'energie', 'motivation', 'spaß', 'hobby', 'interesse', 'leidenschaft'],
                negative: ['langweilig', 'müde', 'stress', 'angst', 'sorge', 'probleme', 'schwierig']
            },
            mission: {
                positive: ['helfen', 'beitrag', 'welt', 'gemeinschaft', 'sinn', 'zweck', 'bedeutung', 'veränderung', 'verbesserung'],
                negative: ['egoistisch', 'selbstsüchtig', 'unwichtig', 'nutzlos', 'sinnlos']
            },
            profession: {
                positive: ['karriere', 'erfolg', 'geld', 'markt', 'chance', 'gehalt', 'beruf', 'arbeit', 'unternehmen'],
                negative: ['armut', 'arbeitslos', 'chancenlos', 'schlecht bezahlt', 'unsicher']
            },
            vocation: {
                positive: ['talent', 'fähigkeit', 'stärke', 'kompetenz', 'expertise', 'können', 'begabung', 'geschick'],
                negative: ['schwach', 'unfähig', 'inkompetent', 'unbegabt', 'schlecht']
            }
        };

        // Emotionale Marker
        this.emotionalMarkers = {
            excitement: ['aufregend', 'spannend', 'fantastisch', 'wunderbar', 'großartig', 'toll'],
            fear: ['angst', 'sorge', 'befürchtung', 'unsicher', 'nervös', 'panik'],
            satisfaction: ['zufrieden', 'glücklich', 'erfüllt', 'stolz', 'zufrieden', 'befriedigend'],
            frustration: ['frustriert', 'enttäuscht', 'verärgert', 'wütend', 'genervt', 'unzufrieden']
        };

        // Berufsfelder und ihre Charakteristika
        this.careerPatterns = {
            creative: ['design', 'kunst', 'kreativ', 'künstlerisch', 'gestaltung', 'musik', 'schreiben'],
            technical: ['technik', 'programmierung', 'engineering', 'wissenschaft', 'mathematik', 'analytisch'],
            social: ['menschen', 'kommunikation', 'hilfe', 'beratung', 'coaching', 'lehren', 'betreuung'],
            business: ['management', 'führung', 'unternehmen', 'marketing', 'verkauf', 'strategie'],
            health: ['gesundheit', 'medizin', 'therapie', 'pflege', 'wohlbefinden', 'fitness'],
            education: ['lernen', 'lehren', 'bildung', 'wissen', 'forschung', 'studium']
        };
    }

    loadExistingData() {
        // Lade gespeicherte Workflow-Daten
        for (let i = 1; i <= 7; i++) {
            const stepData = localStorage.getItem(`ikigaiStep${i}`);
            if (stepData) {
                this.analysisData[`step${i}`] = JSON.parse(stepData);
            }
        }
    }

    analyzeStep(stepNumber) {
        const stepData = this.analysisData[`step${stepNumber}`];
        if (!stepData) return null;

        const analysis = {
            step: stepNumber,
            timestamp: new Date().toISOString(),
            insights: {},
            recommendations: {},
            patterns: {},
            emotionalState: {},
            careerAlignment: {}
        };

        // Analysiere basierend auf dem Schritt
        switch(stepNumber) {
            case 1: // Selbstreflexion
                analysis.insights = this.analyzeSelfReflection(stepData);
                break;
            case 2: // Passion
                analysis.insights = this.analyzePassion(stepData);
                break;
            case 3: // Mission
                analysis.insights = this.analyzeMission(stepData);
                break;
            case 4: // Profession
                analysis.insights = this.analyzeProfession(stepData);
                break;
            case 5: // Vocation
                analysis.insights = this.analyzeVocation(stepData);
                break;
            case 6: // Synthese
                analysis.insights = this.analyzeSynthesis(stepData);
                break;
            case 7: // Aktionsplan
                analysis.insights = this.analyzeActionPlan(stepData);
                break;
        }

        // Generiere Empfehlungen
        analysis.recommendations = this.generateRecommendations(analysis.insights, stepNumber);
        
        // Erkenne Muster
        analysis.patterns = this.identifyPatterns(stepData);
        
        // Analysiere emotionalen Zustand
        analysis.emotionalState = this.analyzeEmotionalState(stepData);
        
        // Karriere-Alignment
        analysis.careerAlignment = this.analyzeCareerAlignment(stepData);

        return analysis;
    }

    analyzeSelfReflection(data) {
        const insights = {
            valuesClarity: this.analyzeValues(data.values || ''),
            strengthsRecognition: this.analyzeStrengths(data.strengths || ''),
            passionIndicators: this.analyzePassionIndicators(data.passions || ''),
            experienceImpact: this.analyzeExperienceImpact(data.experiences || ''),
            goalAlignment: this.analyzeGoalAlignment(data.goals || ''),
            fearPatterns: this.analyzeFearPatterns(data.fears || '')
        };

        return insights;
    }

    analyzePassion(data) {
        const insights = {
            passionIntensity: this.calculatePassionIntensity(data),
            energySources: this.identifyEnergySources(data),
            timeInvestment: this.analyzeTimeInvestment(data),
            socialAspects: this.analyzeSocialAspects(data),
            growthPotential: this.assessGrowthPotential(data)
        };

        return insights;
    }

    analyzeMission(data) {
        const insights = {
            impactScope: this.assessImpactScope(data),
            problemSolving: this.analyzeProblemSolving(data),
            communityFocus: this.analyzeCommunityFocus(data),
            legacyDesire: this.analyzeLegacyDesire(data),
            urgencyLevel: this.assessUrgencyLevel(data)
        };

        return insights;
    }

    analyzeProfession(data) {
        const insights = {
            marketAwareness: this.assessMarketAwareness(data),
            skillMonetization: this.analyzeSkillMonetization(data),
            opportunityRecognition: this.analyzeOpportunityRecognition(data),
            financialGoals: this.analyzeFinancialGoals(data),
            riskTolerance: this.assessRiskTolerance(data)
        };

        return insights;
    }

    analyzeVocation(data) {
        const insights = {
            skillAssessment: this.assessSkills(data),
            naturalTalents: this.identifyNaturalTalents(data),
            developmentAreas: this.identifyDevelopmentAreas(data),
            confidenceLevel: this.assessConfidenceLevel(data),
            expertiseAreas: this.identifyExpertiseAreas(data)
        };

        return insights;
    }

    analyzeSynthesis(data) {
        const insights = {
            ikigaiAlignment: this.calculateIkigaiAlignment(data),
            intersectionStrength: this.assessIntersectionStrength(data),
            balanceScore: this.calculateBalanceScore(data),
            clarityLevel: this.assessClarityLevel(data),
            actionability: this.assessActionability(data)
        };

        return insights;
    }

    analyzeActionPlan(data) {
        const insights = {
            planCompleteness: this.assessPlanCompleteness(data),
            timelineRealism: this.assessTimelineRealism(data),
            resourceAwareness: this.assessResourceAwareness(data),
            obstacleRecognition: this.assessObstacleRecognition(data),
            supportSystem: this.assessSupportSystem(data)
        };

        return insights;
    }

    // Hilfsmethoden für die Analyse
    analyzeValues(valuesText) {
        const valueKeywords = ['familie', 'freiheit', 'kreativität', 'sicherheit', 'abenteuer', 'frieden', 'gerechtigkeit', 'liebe', 'wahrheit', 'schönheit'];
        const foundValues = valueKeywords.filter(value => 
            valuesText.toLowerCase().includes(value)
        );
        
        return {
            identifiedValues: foundValues,
            clarityScore: Math.min(foundValues.length * 20, 100),
            dominantThemes: this.extractDominantThemes(valuesText)
        };
    }

    analyzeStrengths(strengthsText) {
        const strengthCategories = {
            technical: ['programmierung', 'technik', 'mathematik', 'analytisch', 'logisch'],
            creative: ['kreativ', 'künstlerisch', 'design', 'musik', 'schreiben'],
            social: ['kommunikation', 'empathie', 'führung', 'teamwork', 'beratung'],
            physical: ['sport', 'handwerk', 'koordination', 'kraft', 'ausdauer']
        };

        const identifiedStrengths = {};
        Object.keys(strengthCategories).forEach(category => {
            identifiedStrengths[category] = strengthCategories[category].filter(strength => 
                strengthsText.toLowerCase().includes(strength)
            ).length;
        });

        return {
            strengthCategories: identifiedStrengths,
            confidenceScore: this.calculateConfidenceScore(strengthsText),
            uniqueStrengths: this.extractUniqueStrengths(strengthsText)
        };
    }

    calculatePassionIntensity(data) {
        const passionKeywords = ['liebe', 'begeisterung', 'freude', 'energie', 'leidenschaft', 'spaß'];
        const text = Object.values(data).join(' ').toLowerCase();
        const intensity = passionKeywords.reduce((score, keyword) => {
            return score + (text.split(keyword).length - 1) * 10;
        }, 0);
        
        return Math.min(intensity, 100);
    }

    generateRecommendations(insights, stepNumber) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            resources: [],
            nextSteps: []
        };

        // Generiere Empfehlungen basierend auf den Insights
        if (insights.valuesClarity && insights.valuesClarity.clarityScore < 60) {
            recommendations.immediate.push({
                type: 'values_clarity',
                title: 'Werte-Klarheit verbessern',
                description: 'Deine Werte könnten klarer definiert werden. Versuche, deine Top 5 Werte zu identifizieren.',
                action: 'Führe eine Werte-Übung durch oder nutze das Wheel of Life Tool.'
            });
        }

        if (insights.passionIntensity && insights.passionIntensity < 70) {
            recommendations.shortTerm.push({
                type: 'passion_exploration',
                title: 'Leidenschaften erkunden',
                description: 'Erkunde neue Bereiche, die dich interessieren könnten.',
                action: 'Probiere neue Hobbys aus oder besuche Veranstaltungen in interessanten Bereichen.'
            });
        }

        if (insights.ikigaiAlignment && insights.ikigaiAlignment < 80) {
            recommendations.longTerm.push({
                type: 'ikigai_development',
                title: 'Ikigai weiterentwickeln',
                description: 'Dein Ikigai ist noch nicht vollständig ausgebildet.',
                action: 'Arbeite an der Stärkung der schwächeren Bereiche deines Ikigai.'
            });
        }

        return recommendations;
    }

    identifyPatterns(data) {
        const text = Object.values(data).join(' ').toLowerCase();
        const patterns = {
            recurringThemes: this.findRecurringThemes(text),
            emotionalPatterns: this.identifyEmotionalPatterns(text),
            goalPatterns: this.identifyGoalPatterns(text),
            challengePatterns: this.identifyChallengePatterns(text)
        };

        return patterns;
    }

    analyzeEmotionalState(data) {
        const text = Object.values(data).join(' ').toLowerCase();
        const emotionalState = {
            overall: this.assessOverallEmotionalState(text),
            confidence: this.assessConfidenceLevel(text),
            motivation: this.assessMotivationLevel(text),
            stress: this.assessStressLevel(text),
            optimism: this.assessOptimismLevel(text)
        };

        return emotionalState;
    }

    analyzeCareerAlignment(data) {
        const text = Object.values(data).join(' ').toLowerCase();
        const careerAlignment = {
            primaryField: this.identifyPrimaryCareerField(text),
            skillAlignment: this.assessSkillAlignment(text),
            interestAlignment: this.assessInterestAlignment(text),
            marketAlignment: this.assessMarketAlignment(text),
            growthPotential: this.assessCareerGrowthPotential(text)
        };

        return careerAlignment;
    }

    // Hilfsmethoden für spezifische Analysen
    extractDominantThemes(text) {
        const words = text.toLowerCase().split(/\s+/);
        const wordCount = {};
        words.forEach(word => {
            if (word.length > 4) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });
        
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => ({ word, count }));
    }

    calculateConfidenceScore(text) {
        const confidenceKeywords = ['kann', 'können', 'gut', 'stark', 'fähig', 'kompetent', 'erfolgreich'];
        const doubtKeywords = ['unsicher', 'zweifel', 'schwierig', 'probleme', 'ängste'];
        
        const confidenceCount = confidenceKeywords.reduce((count, keyword) => 
            count + (text.split(keyword).length - 1), 0);
        const doubtCount = doubtKeywords.reduce((count, keyword) => 
            count + (text.split(keyword).length - 1), 0);
        
        return Math.max(0, Math.min(100, (confidenceCount - doubtCount) * 20));
    }

    // Öffentliche Methoden
    getInsights(stepNumber) {
        return this.analyzeStep(stepNumber);
    }

    getAllInsights() {
        const allInsights = {};
        for (let i = 1; i <= 7; i++) {
            allInsights[`step${i}`] = this.analyzeStep(i);
        }
        return allInsights;
    }

    getPersonalizedRecommendations() {
        const allInsights = this.getAllInsights();
        return this.generatePersonalizedRecommendations(allInsights);
    }

    generatePersonalizedRecommendations(allInsights) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            resources: [],
            relatedMethods: []
        };

        // Analysiere alle Steps für personalisierte Empfehlungen
        const overallConfidence = this.calculateOverallConfidence(allInsights);
        const passionStrength = this.calculatePassionStrength(allInsights);
        const missionClarity = this.calculateMissionClarity(allInsights);

        if (overallConfidence < 60) {
            recommendations.immediate.push({
                type: 'confidence_building',
                title: 'Selbstvertrauen stärken',
                description: 'Dein Selbstvertrauen könnte gestärkt werden.',
                action: 'Führe eine SWOT-Analyse durch oder arbeite mit einem Coach.'
            });
        }

        if (passionStrength < 70) {
            recommendations.shortTerm.push({
                type: 'passion_exploration',
                title: 'Leidenschaften erkunden',
                description: 'Erkunde neue Bereiche, die dich interessieren könnten.',
                action: 'Probiere verschiedene Aktivitäten aus und achte darauf, was dir Energie gibt.'
            });
        }

        if (missionClarity < 80) {
            recommendations.longTerm.push({
                type: 'mission_clarity',
                title: 'Mission klären',
                description: 'Deine Mission könnte klarer definiert werden.',
                action: 'Überlege, welche Probleme in der Welt du lösen möchtest.'
            });
        }

        // Empfehle verwandte Methoden
        recommendations.relatedMethods = this.suggestRelatedMethods(allInsights);

        return recommendations;
    }

    suggestRelatedMethods(allInsights) {
        const relatedMethods = [];

        // Basierend auf den Insights verschiedene Methoden vorschlagen
        if (allInsights.step1 && allInsights.step1.insights.valuesClarity.clarityScore < 60) {
            relatedMethods.push({
                name: 'Wheel of Life',
                description: 'Hilft bei der Bewertung verschiedener Lebensbereiche',
                url: '../wheel-of-life/index-wheel.html',
                reason: 'Deine Werte könnten durch eine Lebensbereichs-Analyse klarer werden'
            });
        }

        if (allInsights.step2 && allInsights.step2.insights.passionIntensity < 70) {
            relatedMethods.push({
                name: 'RAISEC Assessment',
                description: 'Identifiziert berufliche Interessen und Neigungen',
                url: '../raisec/index-raisec.html',
                reason: 'Könnte dir helfen, deine Leidenschaften besser zu verstehen'
            });
        }

        if (allInsights.step3 && allInsights.step3.insights.impactScope < 60) {
            relatedMethods.push({
                name: 'SWOT-Analyse',
                description: 'Analysiert Stärken, Schwächen, Chancen und Risiken',
                url: '../swot/index-swot.html',
                reason: 'Könnte dir helfen, deine Mission klarer zu definieren'
            });
        }

        return relatedMethods;
    }

    // Hilfsmethoden für Berechnungen
    calculateOverallConfidence(allInsights) {
        let totalConfidence = 0;
        let stepCount = 0;
        
        Object.values(allInsights).forEach(step => {
            if (step && step.insights && step.insights.confidenceScore) {
                totalConfidence += step.insights.confidenceScore;
                stepCount++;
            }
        });
        
        return stepCount > 0 ? totalConfidence / stepCount : 0;
    }

    calculatePassionStrength(allInsights) {
        const passionStep = allInsights.step2;
        return passionStep && passionStep.insights.passionIntensity ? 
            passionStep.insights.passionIntensity : 0;
    }

    calculateMissionClarity(allInsights) {
        const missionStep = allInsights.step3;
        return missionStep && missionStep.insights.impactScope ? 
            missionStep.insights.impactScope : 0;
    }

    // Export-Funktionen
    exportInsights() {
        const insights = this.getAllInsights();
        const recommendations = this.getPersonalizedRecommendations();
        
        return {
            insights,
            recommendations,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
    }
}

// Globale Funktionen für HTML-Integration
function getAIInsights(stepNumber) {
    if (!window.ikigaiAIInsights) {
        window.ikigaiAIInsights = new IkigaiAIInsights();
    }
    return window.ikigaiAIInsights.getInsights(stepNumber);
}

function getPersonalizedRecommendations() {
    if (!window.ikigaiAIInsights) {
        window.ikigaiAIInsights = new IkigaiAIInsights();
    }
    return window.ikigaiAIInsights.getPersonalizedRecommendations();
}

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IkigaiAIInsights;
}
