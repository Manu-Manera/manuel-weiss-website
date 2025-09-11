// Method Loader System - Lädt Methoden dynamisch

class MethodLoader {
    constructor() {
        this.loadedMethods = new Map();
        this.workflowDefinitions = null; // Wird dynamisch geladen
        this.methodDefinitions = {
            'values-clarification': {
                title: 'Werte-Klärung Workflow',
                htmlFile: 'methods/values-clarification/values-clarification.html',
                cssFile: 'methods/values-clarification/values-clarification.css',
                jsFile: 'methods/values-clarification/values-clarification.js',
                initFunction: 'initValuesClarification'
            },
            'strengths-finder': {
                title: 'Stärken-Analyse Workflow',
                htmlFile: 'methods/strengths-finder/strengths-finder.html',
                cssFile: 'methods/strengths-finder/strengths-finder.css',
                jsFile: 'methods/strengths-finder/strengths-finder.js',
                initFunction: 'initStrengthsFinder'
            },
            'goal-setting': {
                title: 'Ziel-Setting Workflow',
                htmlFile: 'methods/goal-setting/goal-setting.html',
                cssFile: 'methods/goal-setting/goal-setting.css',
                jsFile: 'methods/goal-setting/goal-setting.js',
                initFunction: 'initGoalSetting'
            },
            'mindfulness': {
                title: 'Achtsamkeit & Meditation Workflow',
                htmlFile: 'methods/mindfulness/mindfulness.html',
                cssFile: 'methods/mindfulness/mindfulness.css',
                jsFile: 'methods/mindfulness/mindfulness.js',
                initFunction: 'initMindfulness'
            },
            'emotional-intelligence': {
                title: 'Emotionale Intelligenz Workflow',
                htmlFile: 'methods/emotional-intelligence/emotional-intelligence.html',
                cssFile: 'methods/emotional-intelligence/emotional-intelligence.css',
                jsFile: 'methods/emotional-intelligence/emotional-intelligence.js',
                initFunction: 'initEmotionalIntelligence'
            },
            'habit-building': {
                title: 'Gewohnheiten aufbauen Workflow',
                htmlFile: 'methods/habit-building/habit-building.html',
                cssFile: 'methods/habit-building/habit-building.css',
                jsFile: 'methods/habit-building/habit-building.js',
                initFunction: 'initHabitBuilding'
            },
            'gallup-strengths': {
                title: 'Gallup StrengthsFinder Assessment',
                htmlFile: 'methods/gallup-strengths/gallup-strengths.html',
                cssFile: 'methods/gallup-strengths/gallup-strengths.css',
                jsFile: 'methods/gallup-strengths/gallup-strengths.js',
                initFunction: 'initGallupStrengths'
            },
            'via-strengths': {
                title: 'VIA Character Strengths Assessment',
                htmlFile: 'methods/via-strengths/via-strengths.html',
                cssFile: 'methods/via-strengths/via-strengths.css',
                jsFile: 'methods/via-strengths/via-strengths.js',
                initFunction: 'initVIAStrengths'
            },
            'self-assessment': {
                title: 'Selbsteinschätzung Assessment',
                htmlFile: 'methods/self-assessment/self-assessment.html',
                cssFile: 'methods/self-assessment/self-assessment.css',
                jsFile: 'methods/self-assessment/self-assessment.js',
                initFunction: 'initSelfAssessment'
            },
            'communication': {
                title: 'Kommunikation Workflow',
                htmlFile: 'methods/communication/communication.html',
                cssFile: 'methods/communication/communication.css',
                jsFile: 'methods/communication/communication.js',
                initFunction: 'initCommunication'
            },
            'time-management': {
                title: 'Zeitmanagement Workflow',
                htmlFile: 'methods/time-management/time-management.html',
                cssFile: 'methods/time-management/time-management.css',
                jsFile: 'methods/time-management/time-management.js',
                initFunction: 'initTimeManagement'
            },
            'nlp-dilts': {
                title: 'NLP Dilts Workflow',
                htmlFile: 'methods/nlp-dilts/nlp-dilts.html',
                cssFile: 'methods/nlp-dilts/nlp-dilts.css',
                jsFile: 'methods/nlp-dilts/nlp-dilts.js',
                initFunction: 'initNLPDilts'
            },
            'johari-window': {
                title: 'Johari Window Workflow',
                htmlFile: 'methods/johari-window/johari-window.html',
                cssFile: 'methods/johari-window/johari-window.css',
                jsFile: 'methods/johari-window/johari-window.js',
                initFunction: 'initJohariWindow'
            },
            'walt-disney': {
                title: 'Walt Disney Workflow',
                htmlFile: 'methods/walt-disney/walt-disney.html',
                cssFile: 'methods/walt-disney/walt-disney.css',
                jsFile: 'methods/walt-disney/walt-disney.js',
                initFunction: 'initWaltDisney'
            },
            'nonviolent-communication': {
                title: 'Gewaltfreie Kommunikation Workflow',
                htmlFile: 'methods/nonviolent-communication/nonviolent-communication.html',
                cssFile: 'methods/nonviolent-communication/nonviolent-communication.css',
                jsFile: 'methods/nonviolent-communication/nonviolent-communication.js',
                initFunction: 'initNonviolentCommunication'
            },
            'five-pillars': {
                title: 'Fünf Säulen Workflow',
                htmlFile: 'methods/five-pillars/five-pillars.html',
                cssFile: 'methods/five-pillars/five-pillars.css',
                jsFile: 'methods/five-pillars/five-pillars.js',
                initFunction: 'initFivePillars'
            },
            'nlp-meta-goal': {
                title: 'NLP Meta-Goal Workflow',
                htmlFile: 'methods/nlp-meta-goal/nlp-meta-goal.html',
                cssFile: 'methods/nlp-meta-goal/nlp-meta-goal.css',
                jsFile: 'methods/nlp-meta-goal/nlp-meta-goal.js',
                initFunction: 'initNLPMetaGoal'
            },
            'aek-communication': {
                title: 'AEK Kommunikation Workflow',
                htmlFile: 'methods/aek-communication/aek-communication.html',
                cssFile: 'methods/aek-communication/aek-communication.css',
                jsFile: 'methods/aek-communication/aek-communication.js',
                initFunction: 'initAEKCommunication'
            },
            'rubikon-model': {
                title: 'Rubikon-Modell Workflow',
                htmlFile: 'methods/rubikon-model/rubikon-model.html',
                cssFile: 'methods/rubikon-model/rubikon-model.css',
                jsFile: 'methods/rubikon-model/rubikon-model.js',
                initFunction: 'initRubikonModel'
            },
            'systemic-coaching': {
                title: 'Systemisches Coaching Workflow',
                htmlFile: 'methods/systemic-coaching/systemic-coaching.html',
                cssFile: 'methods/systemic-coaching/systemic-coaching.css',
                jsFile: 'methods/systemic-coaching/systemic-coaching.js',
                initFunction: 'initSystemicCoaching'
            },
            'rafael-method': {
                title: 'Rafael-Methode Workflow',
                htmlFile: 'methods/rafael-method/rafael-method.html',
                cssFile: 'methods/rafael-method/rafael-method.css',
                jsFile: 'methods/rafael-method/rafael-method.js',
                initFunction: 'initRafaelMethod'
            },
            'conflict-escalation': {
                title: 'Konflikt-Eskalation Workflow',
                htmlFile: 'methods/conflict-escalation/conflict-escalation.html',
                cssFile: 'methods/conflict-escalation/conflict-escalation.css',
                jsFile: 'methods/conflict-escalation/conflict-escalation.js',
                initFunction: 'initConflictEscalation'
            },
            'harvard-method': {
                title: 'Harvard-Methode Workflow',
                htmlFile: 'methods/harvard-method/harvard-method.html',
                cssFile: 'methods/harvard-method/harvard-method.css',
                jsFile: 'methods/harvard-method/harvard-method.js',
                initFunction: 'initHarvardMethod'
            },
            'circular-interview': {
                title: 'Zirkuläres Interview Workflow',
                htmlFile: 'methods/circular-interview/circular-interview.html',
                cssFile: 'methods/circular-interview/circular-interview.css',
                jsFile: 'methods/circular-interview/circular-interview.js',
                initFunction: 'initCircularInterview'
            },
            'target-coaching': {
                title: 'Ziel-Coaching Workflow',
                htmlFile: 'methods/target-coaching/target-coaching.html',
                cssFile: 'methods/target-coaching/target-coaching.css',
                jsFile: 'methods/target-coaching/target-coaching.js',
                initFunction: 'initTargetCoaching'
            },
            'solution-focused': {
                title: 'Lösungsfokussiertes Coaching Workflow',
                htmlFile: 'methods/solution-focused/solution-focused.html',
                cssFile: 'methods/solution-focused/solution-focused.css',
                jsFile: 'methods/solution-focused/solution-focused.js',
                initFunction: 'initSolutionFocused'
            },
            'change-stages': {
                title: 'Veränderungsstufen Workflow',
                htmlFile: 'methods/change-stages/change-stages.html',
                cssFile: 'methods/change-stages/change-stages.css',
                jsFile: 'methods/change-stages/change-stages.js',
                initFunction: 'initChangeStages'
            },
            'competence-map': {
                title: 'Kompetenz-Landkarte Workflow',
                htmlFile: 'methods/competence-map/competence-map.html',
                cssFile: 'methods/competence-map/competence-map.css',
                jsFile: 'methods/competence-map/competence-map.js',
                initFunction: 'initCompetenceMap'
            },
            'moment-excellence': {
                title: 'Moment of Excellence Workflow',
                htmlFile: 'methods/moment-excellence/moment-excellence.html',
                cssFile: 'methods/moment-excellence/moment-excellence.css',
                jsFile: 'methods/moment-excellence/moment-excellence.js',
                initFunction: 'initMomentExcellence'
            },
            'resource-analysis': {
                title: 'Ressourcen-Analyse Workflow',
                htmlFile: 'methods/resource-analysis/resource-analysis.html',
                cssFile: 'methods/resource-analysis/resource-analysis.css',
                jsFile: 'methods/resource-analysis/resource-analysis.js',
                initFunction: 'initResourceAnalysis'
            },
            'swot-analysis': {
                title: 'SWOT-Analyse Workflow',
                htmlFile: 'methods/swot-analysis/swot-analysis.html',
                cssFile: 'methods/swot-analysis/swot-analysis.css',
                jsFile: 'methods/swot-analysis/swot-analysis.js',
                initFunction: 'initSWOTAnalysis'
            },
            'wheel-of-life': {
                title: 'Wheel of Life Workflow',
                htmlFile: 'methods/wheel-of-life/wheel-of-life.html',
                cssFile: 'methods/wheel-of-life/wheel-of-life.css',
                jsFile: 'methods/wheel-of-life/wheel-of-life.js',
                initFunction: 'initWheelOfLife'
            },
            'journaling': {
                title: 'Journaling Workflow',
                htmlFile: 'methods/journaling/journaling.html',
                cssFile: 'methods/journaling/journaling.css',
                jsFile: 'methods/journaling/journaling.js',
                initFunction: 'initJournaling'
            },
            'vision-board': {
                title: 'Vision Board Workflow',
                htmlFile: 'methods/vision-board/vision-board.html',
                cssFile: 'methods/vision-board/vision-board.css',
                jsFile: 'methods/vision-board/vision-board.js',
                initFunction: 'initVisionBoard'
            },
            'stress-management': {
                title: 'Stress-Management Workflow',
                htmlFile: 'methods/stress-management/stress-management.html',
                cssFile: 'methods/stress-management/stress-management.css',
                jsFile: 'methods/stress-management/stress-management.js',
                initFunction: 'initStressManagement'
            }
        };
    }

    async loadWorkflowDefinitions() {
        if (this.workflowDefinitions) {
            return this.workflowDefinitions;
        }

        try {
            const response = await fetch('methods/workflow-definitions.js');
            if (response.ok) {
                const script = document.createElement('script');
                script.src = 'methods/workflow-definitions.js';
                document.head.appendChild(script);
                
                // Wait for script to load
                return new Promise((resolve) => {
                    script.onload = () => {
                        this.workflowDefinitions = window.methodWorkflowDefinitions;
                        resolve(this.workflowDefinitions);
                    };
                });
            }
        } catch (error) {
            console.warn('Could not load workflow definitions:', error);
        }
        
        return null;
    }

    async loadMethod(methodId) {
        try {
            // Check if method is already loaded
            if (this.loadedMethods.has(methodId)) {
                return this.loadedMethods.get(methodId);
            }

            const methodDef = this.methodDefinitions[methodId];
            if (!methodDef) {
                throw new Error(`Method ${methodId} not found`);
            }

            console.log(`Loading method: ${methodId}`);

            // Load workflow definitions
            await this.loadWorkflowDefinitions();

            // Load HTML content
            const htmlResponse = await fetch(methodDef.htmlFile);
            if (!htmlResponse.ok) {
                throw new Error(`Failed to load HTML for ${methodId}`);
            }
            let htmlContent = await htmlResponse.text();

            // Get workflow definition for this method
            const workflowDef = this.workflowDefinitions?.[methodId];
            if (workflowDef) {
                // Customize HTML based on workflow definition
                htmlContent = this.customizeWorkflowHTML(htmlContent, workflowDef);
            }

            // Load CSS
            await this.loadCSS(methodDef.cssFile);

            // Load JavaScript
            await this.loadJS(methodDef.jsFile);

            const methodData = {
                title: methodDef.title,
                html: htmlContent,
                initFunction: methodDef.initFunction,
                workflowDefinition: workflowDef
            };

            this.loadedMethods.set(methodId, methodData);
            return methodData;

        } catch (error) {
            console.error(`Error loading method ${methodId}:`, error);
            return {
                title: 'Methode nicht verfügbar',
                html: `
                    <div class="workflow-container">
                        <div class="error-message">
                            <h3>⚠️ Methode nicht verfügbar</h3>
                            <p>Diese Methode ist noch nicht implementiert oder konnte nicht geladen werden.</p>
                            <p>Fehler: ${error.message}</p>
                        </div>
                    </div>
                `,
                initFunction: null
            };
        }
    }

    customizeWorkflowHTML(htmlContent, workflowDef) {
        // Replace generic step titles with method-specific ones
        let customizedHTML = htmlContent;
        
        // Update workflow progress steps
        const progressSteps = workflowDef.stepTitles.map((title, index) => `
            <div class="progress-step ${index === 0 ? 'active' : ''}" data-step="${index + 1}">
                <div class="step-number">${index + 1}</div>
                <div class="step-title">${title}</div>
            </div>
        `).join('');
        
        // Replace the progress steps in HTML
        customizedHTML = customizedHTML.replace(
            /<div class="workflow-progress">[\s\S]*?<\/div>/,
            `<div class="workflow-progress">${progressSteps}</div>`
        );
        
        // Update step count in navigation
        customizedHTML = customizedHTML.replace(
            /Schritt 1 von \d+/,
            `Schritt 1 von ${workflowDef.steps}`
        );
        
        return customizedHTML;
    }

    async loadCSS(cssFile) {
        return new Promise((resolve, reject) => {
            // Check if CSS is already loaded
            const existingLink = document.querySelector(`link[href="${cssFile}"]`);
            if (existingLink) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssFile;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${cssFile}`));
            document.head.appendChild(link);
        });
    }

    async loadJS(jsFile) {
        return new Promise((resolve, reject) => {
            // Check if JS is already loaded
            const existingScript = document.querySelector(`script[src="${jsFile}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = jsFile;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load JS: ${jsFile}`));
            document.head.appendChild(script);
        });
    }

    getMethodWorkflowData(methodId) {
        if (this.loadedMethods.has(methodId)) {
            return this.loadedMethods.get(methodId);
        }
        
        // Return placeholder for not yet loaded methods
        return {
            title: 'Methode wird geladen...',
            html: `
                <div class="workflow-container">
                    <div class="loading-message">
                        <h3>🔄 Methode wird geladen...</h3>
                        <p>Bitte warten Sie, während die Methode geladen wird.</p>
                    </div>
                </div>
            `,
            initFunction: null
        };
    }

    async preloadMethods(methodIds) {
        const promises = methodIds.map(methodId => this.loadMethod(methodId));
        return Promise.all(promises);
    }

    unloadMethod(methodId) {
        if (this.loadedMethods.has(methodId)) {
            this.loadedMethods.delete(methodId);
        }
    }

    clearAllMethods() {
        this.loadedMethods.clear();
    }
}

// Global instance
window.methodLoader = new MethodLoader();

// Updated loadMethodWorkflow function
async function loadMethodWorkflow(methodId) {
    try {
        // Show loading state
        document.getElementById('workflow-title').textContent = 'Methode wird geladen...';
        document.getElementById('workflow-content').innerHTML = `
            <div class="loading-message">
                <h3>🔄 Methode wird geladen...</h3>
                <p>Bitte warten Sie, während die Methode geladen wird.</p>
            </div>
        `;

        // Load method using the new loader
        const methodData = await window.methodLoader.loadMethod(methodId);
        
        // Update UI
        document.getElementById('workflow-title').textContent = methodData.title;
        document.getElementById('workflow-content').innerHTML = methodData.html;
        
        // Initialize method-specific JavaScript
        if (methodData.initFunction && window[methodData.initFunction]) {
            window[methodData.initFunction]();
        }
        
        // Reset to first step
        switchWorkflowStep(1);
        
        // Show success notification
        showNotification('Methode erfolgreich geladen!', 'success');
        
    } catch (error) {
        console.error('Error loading method workflow:', error);
        showNotification('Fehler beim Laden der Methode: ' + error.message, 'error');
    }
}

// Export for use in other files
window.MethodLoader = MethodLoader;
window.loadMethodWorkflow = loadMethodWorkflow;
