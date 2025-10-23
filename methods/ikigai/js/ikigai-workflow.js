/**
 * 🎯 Ikigai Smart Workflow
 * Moderne, interaktive Ikigai-Methode mit 7 detaillierten Schritten
 * Autor: Manuel Weiss
 * Version: 2.0
 */

class IkigaiSmartWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.workflowData = {};
        this.init();
    }

    init() {
        this.loadSavedData();
        this.setupEventListeners();
        this.updateProgress();
        this.initializeAIInsights();
        this.initializeAnimatedDiagram();
        this.initializeExportFunctions();
        console.log('🎯 Ikigai Smart Workflow initialized');
    }

    loadSavedData() {
        // Load data from localStorage
        for (let i = 1; i <= this.totalSteps; i++) {
            const savedData = localStorage.getItem(`ikigaiStep${i}`);
            if (savedData) {
                this.workflowData[`step${i}`] = JSON.parse(savedData);
            }
        }
    }

    setupEventListeners() {
        // Auto-save functionality
        document.querySelectorAll('textarea, input[type="text"], input[type="email"]').forEach(element => {
            element.addEventListener('input', () => {
                this.autoSave();
            });
        });

        // Form submission
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAndContinue();
            });
        });
    }

    autoSave() {
        const currentStepData = this.collectCurrentStepData();
        if (currentStepData) {
            localStorage.setItem(`ikigaiStep${this.currentStep}`, JSON.stringify(currentStepData));
        }
    }

    collectCurrentStepData() {
        const form = document.querySelector('form');
        if (!form) return null;

        const formData = new FormData(form);
        const data = {
            step: this.currentStep,
            timestamp: new Date().toISOString()
        };

        // Collect all form fields
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Also collect textarea values
        document.querySelectorAll('textarea').forEach(textarea => {
            data[textarea.name || textarea.id] = textarea.value;
        });

        return data;
    }

    saveAndContinue() {
        const currentStepData = this.collectCurrentStepData();
        if (currentStepData) {
            localStorage.setItem(`ikigaiStep${this.currentStep}`, JSON.stringify(currentStepData));
            this.workflowData[`step${this.currentStep}`] = currentStepData;
        }

        // Navigate to next step
        const nextStep = this.currentStep + 1;
        if (nextStep <= this.totalSteps) {
            window.location.href = `step${nextStep}.html`;
        } else {
            this.completeWorkflow();
        }
    }

    completeWorkflow() {
        // Generate final Ikigai analysis
        const analysis = this.generateIkigaiAnalysis();
        
        // Save final analysis
        localStorage.setItem('ikigaiFinalAnalysis', JSON.stringify(analysis));
        
        // Redirect to results page
        window.location.href = 'results.html';
    }

    generateIkigaiAnalysis() {
        const analysis = {
            timestamp: new Date().toISOString(),
            steps: this.workflowData,
            ikigai: {
                passion: this.extractPassion(),
                mission: this.extractMission(),
                profession: this.extractProfession(),
                vocation: this.extractVocation(),
                synthesis: this.generateSynthesis(),
                actionPlan: this.generateActionPlan()
            }
        };

        return analysis;
    }

    extractPassion() {
        const step2Data = this.workflowData.step2;
        if (!step2Data) return null;

        return {
            activities: step2Data.activities || '',
            interests: step2Data.interests || '',
            values: step2Data.values || '',
            energy: step2Data.energy || ''
        };
    }

    extractMission() {
        const step3Data = this.workflowData.step3;
        if (!step3Data) return null;

        return {
            problems: step3Data.problems || '',
            impact: step3Data.impact || '',
            contribution: step3Data.contribution || '',
            legacy: step3Data.legacy || ''
        };
    }

    extractProfession() {
        const step4Data = this.workflowData.step4;
        if (!step4Data) return null;

        return {
            skills: step4Data.skills || '',
            market: step4Data.market || '',
            opportunities: step4Data.opportunities || '',
            income: step4Data.income || ''
        };
    }

    extractVocation() {
        const step5Data = this.workflowData.step5;
        if (!step5Data) return null;

        return {
            talents: step5Data.talents || '',
            strengths: step5Data.strengths || '',
            abilities: step5Data.abilities || '',
            expertise: step5Data.expertise || ''
        };
    }

    generateSynthesis() {
        const passion = this.extractPassion();
        const mission = this.extractMission();
        const profession = this.extractProfession();
        const vocation = this.extractVocation();

        if (!passion || !mission || !profession || !vocation) {
            return null;
        }

        // Find common themes and intersections
        const commonThemes = this.findCommonThemes([passion, mission, profession, vocation]);
        
        return {
            commonThemes,
            ikigaiStatement: this.generateIkigaiStatement(commonThemes),
            intersections: {
                passionMission: this.findIntersection(passion, mission),
                missionProfession: this.findIntersection(mission, profession),
                professionVocation: this.findIntersection(profession, vocation),
                vocationPassion: this.findIntersection(vocation, passion)
            }
        };
    }

    findCommonThemes(areas) {
        const themes = [];
        const allText = areas.map(area => 
            Object.values(area).join(' ').toLowerCase()
        ).join(' ');

        // Simple keyword extraction (in a real app, you'd use NLP)
        const keywords = allText.split(/\s+/).filter(word => 
            word.length > 3 && !this.isStopWord(word)
        );

        const wordCount = {};
        keywords.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        return Object.entries(wordCount)
            .filter(([word, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    isStopWord(word) {
        const stopWords = ['und', 'der', 'die', 'das', 'ein', 'eine', 'mit', 'für', 'von', 'zu', 'auf', 'in', 'ist', 'sind', 'haben', 'kann', 'wird', 'werden', 'können', 'möchte', 'will', 'soll', 'dass', 'wie', 'was', 'wo', 'wann', 'warum', 'wer'];
        return stopWords.includes(word.toLowerCase());
    }

    findIntersection(area1, area2) {
        const text1 = Object.values(area1).join(' ').toLowerCase();
        const text2 = Object.values(area2).join(' ').toLowerCase();
        
        const words1 = text1.split(/\s+/).filter(word => word.length > 3);
        const words2 = text2.split(/\s+/).filter(word => word.length > 3);
        
        return words1.filter(word => words2.includes(word));
    }

    generateIkigaiStatement(commonThemes) {
        if (commonThemes.length === 0) {
            return "Dein Ikigai wird durch die Verbindung deiner Leidenschaften, Mission, Profession und Vocation entstehen.";
        }

        const topThemes = commonThemes.slice(0, 3).map(theme => theme.word);
        return `Dein Ikigai dreht sich um: ${topThemes.join(', ')}. Diese Bereiche verbinden deine Leidenschaften mit dem, was die Welt braucht, und bieten dir die Möglichkeit, deine Talente zu nutzen und damit deinen Lebensunterhalt zu verdienen.`;
    }

    generateActionPlan() {
        const step7Data = this.workflowData.step7;
        if (!step7Data) return null;

        return {
            shortTerm: step7Data.shortTerm || '',
            mediumTerm: step7Data.mediumTerm || '',
            longTerm: step7Data.longTerm || '',
            resources: step7Data.resources || '',
            obstacles: step7Data.obstacles || '',
            support: step7Data.support || ''
        };
    }

    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${this.currentStep} von ${this.totalSteps}`;
        }
    }

    // Public methods for external use
    getCurrentStep() {
        return this.currentStep;
    }

    getWorkflowData() {
        return this.workflowData;
    }

    resetWorkflow() {
        for (let i = 1; i <= this.totalSteps; i++) {
            localStorage.removeItem(`ikigaiStep${i}`);
        }
        localStorage.removeItem('ikigaiFinalAnalysis');
        this.workflowData = {};
        this.currentStep = 1;
    }

    exportData() {
        const data = {
            workflow: this.workflowData,
            analysis: JSON.parse(localStorage.getItem('ikigaiFinalAnalysis') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ikigai-workflow-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Neue Methoden für erweiterte Features
    initializeAIInsights() {
        if (typeof IkigaiAIInsights !== 'undefined') {
            this.aiInsights = new IkigaiAIInsights();
        }
    }

    initializeAnimatedDiagram() {
        const diagramContainer = document.getElementById('ikigai-animated-diagram');
        if (diagramContainer && typeof IkigaiAnimatedDiagram !== 'undefined') {
            this.animatedDiagram = new IkigaiAnimatedDiagram('ikigai-animated-diagram');
        }
    }

    initializeExportFunctions() {
        if (typeof IkigaiExportFunctions !== 'undefined') {
            this.exportFunctions = new IkigaiExportFunctions();
        }
    }

    // KI-basierte Insights
    getAIInsights(stepNumber) {
        if (this.aiInsights) {
            return this.aiInsights.getInsights(stepNumber);
        }
        return null;
    }

    getPersonalizedRecommendations() {
        if (this.aiInsights) {
            return this.aiInsights.getPersonalizedRecommendations();
        }
        return null;
    }

    // Animiertes Diagramm
    updateAnimatedDiagram() {
        if (this.animatedDiagram) {
            // Aktualisiere Diagramm basierend auf Workflow-Daten
            const areas = ['passion', 'mission', 'profession', 'vocation'];
            areas.forEach(area => {
                const progress = this.calculateAreaProgress(area);
                this.animatedDiagram.setAreaProgress(area, progress);
            });
        }
    }

    calculateAreaProgress(area) {
        // Berechne Fortschritt basierend auf den Workflow-Daten
        const stepMapping = {
            passion: 2,
            mission: 3,
            profession: 4,
            vocation: 5
        };
        
        const stepNumber = stepMapping[area];
        const stepData = this.workflowData[`step${stepNumber}`];
        
        if (!stepData) return 0;
        
        // Einfache Berechnung: Anzahl ausgefüllter Felder * 20
        const fields = Object.keys(stepData).filter(key => 
            key !== 'step' && key !== 'timestamp' && stepData[key] && stepData[key].trim()
        );
        
        return Math.min(fields.length * 20, 100);
    }

    // Export-Funktionen
    exportToPDF() {
        if (this.exportFunctions) {
            this.exportFunctions.exportToPDF();
        }
    }

    exportToWord() {
        if (this.exportFunctions) {
            this.exportFunctions.exportToWord();
        }
    }

    exportToJSON() {
        if (this.exportFunctions) {
            this.exportFunctions.exportToJSON();
        }
    }
}

// Global functions for HTML onclick handlers
function startIkigaiWorkflow() {
    window.location.href = 'step1.html';
}

function openVideo(url) {
    window.open(url, '_blank');
}

function scrollToSection(section) {
    const sections = {
        'passion': 'step2',
        'mission': 'step3', 
        'profession': 'step4',
        'vocation': 'step5'
    };
    
    const targetStep = sections[section];
    if (targetStep) {
        window.location.href = `${targetStep}.html`;
    }
}

// Initialize workflow when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on a step page
    if (window.location.pathname.includes('step')) {
        window.ikigaiSmartWorkflow = new IkigaiSmartWorkflow();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IkigaiSmartWorkflow;
}
