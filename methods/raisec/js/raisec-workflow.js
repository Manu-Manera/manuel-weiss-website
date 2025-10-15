/**
 * 🎯 RAISEC Smart Workflow
 * Moderne, interaktive RAISEC-Methode zur beruflichen Orientierung
 * Autor: Manuel Weiss
 * Version: 2.0
 */

class RAISECSmartWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.workflowData = {};
        this.raisecScores = {
            realistic: 0,
            artistic: 0,
            investigative: 0,
            social: 0,
            enterprising: 0,
            conventional: 0
        };
        this.init();
    }

    init() {
        this.loadSavedData();
        this.setupEventListeners();
        this.updateProgress();
        console.log('🎯 RAISEC Smart Workflow initialized');
    }

    loadSavedData() {
        // Load data from localStorage
        for (let i = 1; i <= this.totalSteps; i++) {
            const savedData = localStorage.getItem(`raisecStep${i}`);
            if (savedData) {
                this.workflowData[`step${i}`] = JSON.parse(savedData);
            }
        }
        
        // Load RAISEC scores
        const savedScores = localStorage.getItem('raisecScores');
        if (savedScores) {
            this.raisecScores = JSON.parse(savedScores);
        }
    }

    setupEventListeners() {
        // Auto-save functionality
        document.querySelectorAll('textarea, input[type="text"], input[type="email"], input[type="radio"], input[type="checkbox"]').forEach(element => {
            element.addEventListener('input', () => {
                this.autoSave();
            });
            
            element.addEventListener('change', () => {
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
            localStorage.setItem(`raisecStep${this.currentStep}`, JSON.stringify(currentStepData));
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

        // Collect radio button values
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            data[radio.name] = radio.value;
        });

        // Collect checkbox values
        const checkboxes = {};
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            if (!checkboxes[checkbox.name]) {
                checkboxes[checkbox.name] = [];
            }
            checkboxes[checkbox.name].push(checkbox.value);
        });
        Object.assign(data, checkboxes);

        return data;
    }

    saveAndContinue() {
        const currentStepData = this.collectCurrentStepData();
        if (currentStepData) {
            localStorage.setItem(`raisecStep${this.currentStep}`, JSON.stringify(currentStepData));
            this.workflowData[`step${this.currentStep}`] = currentStepData;
        }

        // Calculate RAISEC scores if this is an assessment step
        if (this.currentStep <= 4) {
            this.calculateRAISECScores();
        }

        // Navigate to next step
        const nextStep = this.currentStep + 1;
        if (nextStep <= this.totalSteps) {
            window.location.href = `step${nextStep}.html`;
        } else {
            this.completeWorkflow();
        }
    }

    calculateRAISECScores() {
        // This is a simplified scoring system
        // In a real implementation, you'd have more sophisticated scoring
        
        const stepData = this.workflowData[`step${this.currentStep}`];
        if (!stepData) return;

        // Example scoring logic (customize based on your questions)
        const scoringRules = {
            step1: {
                realistic: ['handwerk', 'praktisch', 'technisch', 'maschinen', 'werkzeug'],
                artistic: ['kreativ', 'künstlerisch', 'design', 'musik', 'kunst'],
                investigative: ['forschung', 'wissenschaft', 'analysieren', 'experimentieren', 'untersuchen'],
                social: ['helfen', 'lehren', 'beraten', 'pflegen', 'betreuen'],
                enterprising: ['führen', 'verkaufen', 'unternehmen', 'management', 'organisieren'],
                conventional: ['organisieren', 'verwalten', 'dokumentieren', 'strukturieren', 'planen']
            }
        };

        const currentRules = scoringRules[`step${this.currentStep}`];
        if (!currentRules) return;

        // Count keyword matches in text responses
        Object.keys(currentRules).forEach(area => {
            const keywords = currentRules[area];
            let score = 0;
            
            // Check all text fields for keywords
            Object.values(stepData).forEach(value => {
                if (typeof value === 'string') {
                    const text = value.toLowerCase();
                    keywords.forEach(keyword => {
                        if (text.includes(keyword)) {
                            score += 1;
                        }
                    });
                }
            });
            
            this.raisecScores[area] += score;
        });

        // Save scores
        localStorage.setItem('raisecScores', JSON.stringify(this.raisecScores));
    }

    completeWorkflow() {
        // Generate final RAISEC analysis
        const analysis = this.generateRAISECAnalysis();
        
        // Save final analysis
        localStorage.setItem('raisecFinalAnalysis', JSON.stringify(analysis));
        
        // Redirect to results page
        window.location.href = 'results.html';
    }

    generateRAISECAnalysis() {
        const sortedScores = Object.entries(this.raisecScores)
            .sort(([,a], [,b]) => b - a);

        const topThree = sortedScores.slice(0, 3);
        const raisectype = topThree.map(([area]) => area.toUpperCase()).join('');

        const analysis = {
            timestamp: new Date().toISOString(),
            steps: this.workflowData,
            scores: this.raisecScores,
            raisectype: raisectype,
            topAreas: topThree,
            recommendations: this.generateRecommendations(topThree),
            careerPaths: this.getCareerPaths(raisectype)
        };

        return analysis;
    }

    generateRecommendations(topThree) {
        const recommendations = {
            realistic: {
                description: "Du bevorzugst praktische, handwerkliche Tätigkeiten",
                careers: ["Ingenieur", "Handwerker", "Techniker", "Mechaniker", "Architekt"],
                skills: ["Problemlösung", "Technisches Verständnis", "Praktische Umsetzung"],
                development: ["Technische Weiterbildung", "Zertifikate", "Praktische Erfahrung"]
            },
            artistic: {
                description: "Du bist kreativ und künstlerisch veranlagt",
                careers: ["Designer", "Künstler", "Musiker", "Schriftsteller", "Fotograf"],
                skills: ["Kreativität", "Ästhetisches Empfinden", "Innovation"],
                development: ["Künstlerische Ausbildung", "Portfolio aufbauen", "Netzwerk in der Kreativbranche"]
            },
            investigative: {
                description: "Du liebst analytische und wissenschaftliche Arbeit",
                careers: ["Forscher", "Wissenschaftler", "Analyst", "Entwickler", "Berater"],
                skills: ["Analytisches Denken", "Forschung", "Problemlösung"],
                development: ["Studium", "Forschungserfahrung", "Fachpublikationen"]
            },
            social: {
                description: "Du möchtest Menschen helfen und unterstützen",
                careers: ["Lehrer", "Therapeut", "Berater", "Sozialarbeiter", "Coach"],
                skills: ["Empathie", "Kommunikation", "Menschenkenntnis"],
                development: ["Soziale Kompetenzen", "Beratungsausbildung", "Praktische Erfahrung"]
            },
            enterprising: {
                description: "Du bist unternehmerisch und führungsstark",
                careers: ["Manager", "Unternehmer", "Verkäufer", "Berater", "Projektleiter"],
                skills: ["Führung", "Verkauf", "Strategisches Denken"],
                development: ["Management-Ausbildung", "Netzwerk", "Unternehmerische Erfahrung"]
            },
            conventional: {
                description: "Du bevorzugst strukturierte und organisatorische Aufgaben",
                careers: ["Buchhalter", "Sekretär", "Verwalter", "Organisator", "Sachbearbeiter"],
                skills: ["Organisation", "Genauigkeit", "Strukturiertes Arbeiten"],
                development: ["Büroorganisation", "Software-Kenntnisse", "Verwaltungsausbildung"]
            }
        };

        return topThree.map(([area, score]) => ({
            area,
            score,
            ...recommendations[area]
        }));
    }

    getCareerPaths(raisectype) {
        const careerPaths = {
            'REA': "Technisch-kreative Karriere",
            'REI': "Forschung und Entwicklung",
            'RES': "Technische Beratung",
            'REE': "Technisches Management",
            'REC': "Technische Verwaltung",
            'ARE': "Kreative Technik",
            'ARI': "Künstlerische Forschung",
            'ARS': "Kreative Beratung",
            'ARE': "Kreatives Management",
            'ARC': "Kreative Verwaltung",
            'IRE': "Forschung und Technik",
            'IRA': "Wissenschaftliche Kreativität",
            'IRS': "Wissenschaftliche Beratung",
            'IRE': "Forschungsmanagement",
            'IRC': "Wissenschaftliche Verwaltung",
            'SRE': "Soziale Technik",
            'SRA': "Soziale Kreativität",
            'SRI': "Soziale Forschung",
            'SRE': "Soziales Management",
            'SRC': "Soziale Verwaltung",
            'ERE': "Management und Technik",
            'ERA': "Kreatives Management",
            'ERI': "Forschungsmanagement",
            'ERS': "Soziales Management",
            'ERC': "Verwaltungsmanagement",
            'CRE': "Verwaltung und Technik",
            'CRA': "Verwaltungs-Kreativität",
            'CRI': "Verwaltungs-Forschung",
            'CRS': "Soziale Verwaltung",
            'CRE': "Verwaltungs-Management"
        };

        return careerPaths[raisectype] || "Individuelle Karriereentwicklung";
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

    getRAISECScores() {
        return this.raisecScores;
    }

    resetWorkflow() {
        for (let i = 1; i <= this.totalSteps; i++) {
            localStorage.removeItem(`raisecStep${i}`);
        }
        localStorage.removeItem('raisecScores');
        localStorage.removeItem('raisecFinalAnalysis');
        this.workflowData = {};
        this.raisecScores = {
            realistic: 0,
            artistic: 0,
            investigative: 0,
            social: 0,
            enterprising: 0,
            conventional: 0
        };
        this.currentStep = 1;
    }

    exportData() {
        const data = {
            workflow: this.workflowData,
            scores: this.raisecScores,
            analysis: JSON.parse(localStorage.getItem('raisecFinalAnalysis') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raisec-workflow-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Global functions for HTML onclick handlers
function startRAISECWorkflow() {
    window.location.href = 'step1.html';
}

function openVideo(url) {
    window.open(url, '_blank');
}

function scrollToSection(section) {
    const sections = {
        'realistic': 'step1',
        'artistic': 'step1', 
        'investigative': 'step1',
        'social': 'step1',
        'enterprising': 'step1',
        'conventional': 'step1'
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
        window.raisecSmartWorkflow = new RAISECSmartWorkflow();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAISECSmartWorkflow;
}
