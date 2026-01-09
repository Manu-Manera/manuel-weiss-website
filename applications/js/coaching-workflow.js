/**
 * BEWERBUNGSCOACHING - Systemischer Workflow
 * Professionelles Bewerbungscoaching mit "Hilfe zur Selbsthilfe" Ansatz
 */

class CoachingWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.data = {
            // Step 1: Standortbestimmung
            currentSituation: '',
            satisfactionLevel: 0,
            currentResources: '',
            biggestChallenge: '',
            
            // Step 2: Stärken & Werte
            naturalTalents: '',
            acquiredSkills: '',
            coreValues: '',
            uniqueStrengths: '',
            
            // Step 3: Zielfindung
            dreamJob: '',
            shortTermGoals: '',
            longTermVision: '',
            idealWorkEnvironment: '',
            
            // Step 4: Hindernisse & Ressourcen
            mainObstacles: '',
            internalBlockers: '',
            externalBlockers: '',
            supportSystem: '',
            solutionStrategies: '',
            
            // Step 5: Aktionsplan
            nextSteps: '',
            firstAction: '',
            milestones: '',
            timeline: '',
            
            // Step 6: Motivation & Commitment
            motivators: '',
            commitment: '',
            successIndicators: '',
            rewardSystem: '',
            accountabilityPartner: ''
        };
        
        // Verlinkung zu Persönlichkeitsentwicklungsmethoden
        this.relatedMethods = {
            1: [
                { id: 'wheel_of_life', name: 'Rad des Lebens', desc: 'Bewerte verschiedene Lebensbereiche', icon: 'fa-circle-notch' },
                { id: 'self-assessment', name: 'Selbsteinschätzung', desc: 'Erkenne dein volles Potenzial', icon: 'fa-mirror' }
            ],
            2: [
                { id: 'ikigai', name: 'Ikigai', desc: 'Finde deinen Lebenszweck', icon: 'fa-compass' },
                { id: 'via-strengths', name: 'VIA-Stärken', desc: 'Entdecke deine Charakterstärken', icon: 'fa-gem' },
                { id: 'swot', name: 'SWOT-Analyse', desc: 'Stärken, Schwächen, Chancen, Risiken', icon: 'fa-th-large' },
                { id: 'values-clarification', name: 'Werteklärung', desc: 'Was ist dir wirklich wichtig?', icon: 'fa-heart' }
            ],
            3: [
                { id: 'goal-setting', name: 'SMART-Ziele', desc: 'Setze messbare Ziele', icon: 'fa-bullseye' },
                { id: 'vision-board', name: 'Vision Board', desc: 'Visualisiere deine Zukunft', icon: 'fa-images' },
                { id: 'nlp-meta-goal', name: 'NLP Meta-Ziel', desc: 'Finde dein übergeordnetes Ziel', icon: 'fa-brain' }
            ],
            4: [
                { id: 'resource-analysis', name: 'Ressourcenanalyse', desc: 'Entdecke deine verborgenen Stärken', icon: 'fa-boxes' },
                { id: 'nlp-dilts', name: 'NLP Dilts-Pyramide', desc: 'Verstehe deine Verhaltensebenen', icon: 'fa-layer-group' },
                { id: 'solution-focused', name: 'Lösungsfokussiert', desc: 'Fokus auf was funktioniert', icon: 'fa-lightbulb' }
            ],
            5: [
                { id: 'change-stages', name: 'Veränderungsphasen', desc: 'Verstehe den Veränderungsprozess', icon: 'fa-sync-alt' },
                { id: 'target-coaching', name: 'Ziel-Coaching', desc: 'Präzise Zielerreichung', icon: 'fa-crosshairs' },
                { id: 'rubikon-model', name: 'Rubikon-Modell', desc: 'Von der Entscheidung zur Handlung', icon: 'fa-route' }
            ],
            6: [
                { id: 'habit-building', name: 'Gewohnheiten', desc: 'Baue positive Routinen auf', icon: 'fa-redo' },
                { id: 'moment-excellence', name: 'Moment of Excellence', desc: 'Aktiviere deine Bestleistung', icon: 'fa-star' },
                { id: 'mindfulness', name: 'Achtsamkeit', desc: 'Entwickle innere Ruhe', icon: 'fa-spa' }
            ]
        };
        
        this.stepConfig = [
            {
                id: 1,
                title: 'Standortbestimmung',
                subtitle: 'Wo stehst du gerade?',
                icon: 'fa-search',
                questions: [
                    {
                        field: 'currentSituation',
                        label: 'Beschreibe deine aktuelle berufliche Situation',
                        hint: 'Was machst du gerade? Wie lange schon? Was ist gut, was nicht?',
                        type: 'textarea',
                        prompts: [
                            'In welcher Branche/Position bist du tätig?',
                            'Was sind deine täglichen Aufgaben?',
                            'Was gefällt dir an deiner aktuellen Situation?',
                            'Was würdest du gerne ändern?'
                        ]
                    },
                    {
                        field: 'satisfactionLevel',
                        label: 'Wie zufrieden bist du auf einer Skala von 1-10?',
                        hint: '1 = sehr unzufrieden, 10 = absolut zufrieden',
                        type: 'scale'
                    },
                    {
                        field: 'currentResources',
                        label: 'Welche Ressourcen stehen dir zur Verfügung?',
                        hint: 'Zeit, Geld, Unterstützung, Netzwerk, Qualifikationen...',
                        type: 'textarea',
                        prompts: [
                            'Wie viel Zeit kannst du in die Jobsuche investieren?',
                            'Hast du finanzielle Rücklagen?',
                            'Wer kann dich unterstützen?',
                            'Welche Qualifikationen hast du bereits?'
                        ]
                    },
                    {
                        field: 'biggestChallenge',
                        label: 'Was ist gerade deine größte Herausforderung?',
                        hint: 'Sei ehrlich - dies ist der erste Schritt zur Lösung.',
                        type: 'textarea'
                    }
                ]
            },
            {
                id: 2,
                title: 'Stärken & Werte',
                subtitle: 'Was macht dich einzigartig?',
                icon: 'fa-gem',
                questions: [
                    {
                        field: 'naturalTalents',
                        label: 'Was sind deine natürlichen Talente?',
                        hint: 'Dinge, die dir leicht fallen und die du gerne machst.',
                        type: 'textarea',
                        prompts: [
                            'Was konntest du schon als Kind besonders gut?',
                            'Wofür wirst du oft gelobt?',
                            'Was machen andere lieber mit dir zusammen?',
                            'Wobei vergisst du die Zeit?'
                        ]
                    },
                    {
                        field: 'acquiredSkills',
                        label: 'Welche Fähigkeiten hast du dir angeeignet?',
                        hint: 'Durch Ausbildung, Beruf, Hobbys, Lebenserfahrung.',
                        type: 'textarea',
                        prompts: [
                            'Hard Skills: Technische Fähigkeiten, Sprachen, Tools',
                            'Soft Skills: Kommunikation, Führung, Organisation',
                            'Branchen-Know-how und Spezialwissen',
                            'Zertifikate und Qualifikationen'
                        ]
                    },
                    {
                        field: 'coreValues',
                        label: 'Was sind deine wichtigsten Werte?',
                        hint: 'Was ist dir im Beruf und Leben wirklich wichtig?',
                        type: 'textarea',
                        prompts: [
                            'Freiheit, Sicherheit, Anerkennung, Kreativität?',
                            'Familie, Karriere, Work-Life-Balance?',
                            'Teamarbeit oder Selbstständigkeit?',
                            'Innovation oder Tradition?'
                        ]
                    },
                    {
                        field: 'uniqueStrengths',
                        label: 'Was ist dein USP - dein Alleinstellungsmerkmal?',
                        hint: 'Die einzigartige Kombination, die nur du mitbringst.',
                        type: 'textarea'
                    }
                ]
            },
            {
                id: 3,
                title: 'Zielfindung',
                subtitle: 'Wohin willst du?',
                icon: 'fa-bullseye',
                questions: [
                    {
                        field: 'dreamJob',
                        label: 'Beschreibe deinen Traumjob',
                        hint: 'Stell dir vor, du hättest keine Einschränkungen. Was würdest du tun?',
                        type: 'textarea',
                        prompts: [
                            'Welche Tätigkeit würdest du ausüben?',
                            'In welcher Branche/Unternehmen?',
                            'Wie sieht dein typischer Arbeitstag aus?',
                            'Wie viel würdest du verdienen?'
                        ]
                    },
                    {
                        field: 'shortTermGoals',
                        label: 'Was willst du in den nächsten 3-6 Monaten erreichen?',
                        hint: 'Konkrete, messbare Ziele.',
                        type: 'textarea',
                        prompts: [
                            'Wie viele Bewerbungen willst du schreiben?',
                            'Welche Qualifikationen willst du erwerben?',
                            'Welche Kontakte willst du knüpfen?',
                            'Wann willst du eine neue Stelle haben?'
                        ]
                    },
                    {
                        field: 'longTermVision',
                        label: 'Wo siehst du dich in 5 Jahren?',
                        hint: 'Deine große Vision - denke groß!',
                        type: 'textarea'
                    },
                    {
                        field: 'idealWorkEnvironment',
                        label: 'Wie sieht dein ideales Arbeitsumfeld aus?',
                        hint: 'Unternehmenskultur, Team, Arbeitsweise, Ort...',
                        type: 'textarea',
                        prompts: [
                            'Start-up oder Konzern?',
                            'Remote, hybrid oder vor Ort?',
                            'Teamgröße und -dynamik?',
                            'Führungsstil und Hierarchie?'
                        ]
                    }
                ]
            },
            {
                id: 4,
                title: 'Hindernisse & Ressourcen',
                subtitle: 'Was steht im Weg?',
                icon: 'fa-mountain',
                questions: [
                    {
                        field: 'mainObstacles',
                        label: 'Was sind die größten Hindernisse auf deinem Weg?',
                        hint: 'Sei ehrlich - nur was du erkennst, kannst du überwinden.',
                        type: 'textarea'
                    },
                    {
                        field: 'internalBlockers',
                        label: 'Welche inneren Blockaden hast du?',
                        hint: 'Ängste, Glaubenssätze, Selbstzweifel...',
                        type: 'textarea',
                        prompts: [
                            'Welche Ängste halten dich zurück?',
                            'Welche negativen Glaubenssätze hast du?',
                            '"Ich bin nicht gut genug für..."',
                            '"Ich kann nicht... weil..."'
                        ]
                    },
                    {
                        field: 'externalBlockers',
                        label: 'Welche äußeren Hindernisse gibt es?',
                        hint: 'Finanzielle Situation, familiäre Pflichten, Marktlage...',
                        type: 'textarea'
                    },
                    {
                        field: 'supportSystem',
                        label: 'Wer oder was kann dich unterstützen?',
                        hint: 'Menschen, Organisationen, Ressourcen...',
                        type: 'textarea',
                        prompts: [
                            'Familie und Freunde',
                            'Mentoren und Coaches',
                            'Netzwerke und Verbände',
                            'Arbeitsagentur, IHK, Weiterbildungen'
                        ]
                    },
                    {
                        field: 'solutionStrategies',
                        label: 'Welche Strategien könntest du nutzen?',
                        hint: 'Für jedes Hindernis gibt es einen Weg.',
                        type: 'textarea'
                    }
                ]
            },
            {
                id: 5,
                title: 'Aktionsplan',
                subtitle: 'Was sind deine nächsten Schritte?',
                icon: 'fa-tasks',
                questions: [
                    {
                        field: 'firstAction',
                        label: 'Was ist der ALLERERSTE Schritt, den du tun kannst?',
                        hint: 'Klein und konkret - etwas, das du in den nächsten 24h tun kannst.',
                        type: 'textarea'
                    },
                    {
                        field: 'nextSteps',
                        label: 'Liste deine nächsten 5-10 konkreten Schritte auf',
                        hint: 'Jeder Schritt sollte eine klare Handlung sein.',
                        type: 'textarea',
                        prompts: [
                            'Lebenslauf aktualisieren',
                            'LinkedIn-Profil optimieren',
                            'Stellenanzeigen recherchieren',
                            'Netzwerkkontakte aktivieren',
                            'Bewerbungsunterlagen vorbereiten'
                        ]
                    },
                    {
                        field: 'milestones',
                        label: 'Definiere wichtige Meilensteine',
                        hint: 'Zwischenziele, die du feiern kannst.',
                        type: 'textarea',
                        prompts: [
                            'Woche 1: Unterlagen fertig',
                            'Woche 2: 10 Bewerbungen verschickt',
                            'Monat 1: Erstes Interview',
                            'Monat 3: Zusage erhalten'
                        ]
                    },
                    {
                        field: 'timeline',
                        label: 'Erstelle einen Zeitplan',
                        hint: 'Wann willst du was erreicht haben?',
                        type: 'textarea'
                    }
                ]
            },
            {
                id: 6,
                title: 'Motivation & Commitment',
                subtitle: 'Wie bleibst du dran?',
                icon: 'fa-fire',
                questions: [
                    {
                        field: 'motivators',
                        label: 'Was motiviert dich am meisten?',
                        hint: 'Dein inneres Feuer - warum willst du das erreichen?',
                        type: 'textarea',
                        prompts: [
                            'Was wird sich verbessern, wenn du dein Ziel erreichst?',
                            'Wie wirst du dich fühlen?',
                            'Wer wird stolz auf dich sein?',
                            'Was kannst du dann tun, was jetzt nicht geht?'
                        ]
                    },
                    {
                        field: 'commitment',
                        label: 'Welches Commitment gibst du dir selbst?',
                        hint: 'Ein Versprechen an dich selbst.',
                        type: 'textarea'
                    },
                    {
                        field: 'successIndicators',
                        label: 'Woran erkennst du, dass du auf dem richtigen Weg bist?',
                        hint: 'Kleine Erfolge und Fortschrittsindikatoren.',
                        type: 'textarea'
                    },
                    {
                        field: 'rewardSystem',
                        label: 'Wie belohnst du dich für erreichte Meilensteine?',
                        hint: 'Kleine und große Belohnungen.',
                        type: 'textarea'
                    },
                    {
                        field: 'accountabilityPartner',
                        label: 'Wer ist dein Accountability-Partner?',
                        hint: 'Jemand, der dich unterstützt und zur Rechenschaft zieht.',
                        type: 'textarea'
                    }
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        console.log('🧭 CoachingWorkflow initialized');
        this.loadProgress();
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // WORKFLOW CONTROL
    // ═══════════════════════════════════════════════════════════════════════════
    
    start() {
        document.getElementById('coachingModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        this.renderStep(this.currentStep);
        this.updateProgress();
    }
    
    close() {
        if (this.hasUnsavedChanges()) {
            if (!confirm('Du hast ungespeicherte Änderungen. Möchtest du wirklich schließen?')) {
                return;
            }
        }
        document.getElementById('coachingModal').classList.remove('active');
        document.body.style.overflow = '';
    }
    
    nextStep() {
        this.saveCurrentStepData();
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.renderStep(this.currentStep);
            this.updateProgress();
            this.saveProgress();
        } else {
            this.complete();
        }
    }
    
    previousStep() {
        this.saveCurrentStepData();
        
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderStep(this.currentStep);
            this.updateProgress();
        }
    }
    
    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.saveCurrentStepData();
            this.currentStep = step;
            this.renderStep(this.currentStep);
            this.updateProgress();
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════════
    
    renderStep(stepNumber) {
        const step = this.stepConfig[stepNumber - 1];
        const container = document.getElementById('coachingContent');
        const methods = this.relatedMethods[stepNumber] || [];
        
        let html = `
            <div class="step-content">
                <h2><i class="fas ${step.icon}"></i> ${step.title}</h2>
                <p class="step-intro">${step.subtitle}</p>
        `;
        
        step.questions.forEach(q => {
            html += this.renderQuestion(q);
        });
        
        // Vertiefende Persönlichkeitsentwicklungsmethoden
        if (methods.length > 0) {
            html += `
                <div class="related-methods-section">
                    <h4><i class="fas fa-compass"></i> Du möchtest noch tiefer gehen?</h4>
                    <p class="related-methods-intro">Diese Entwicklungsmethoden können dir weiter helfen:</p>
                    <div class="related-methods-grid">
                        ${methods.map(m => `
                            <a href="/persoenlichkeitsentwicklung-uebersicht.html#${m.id}" 
                               class="related-method-card" 
                               target="_blank"
                               title="${m.desc}">
                                <i class="fas ${m.icon}"></i>
                                <div class="method-info">
                                    <span class="method-name">${m.name}</span>
                                    <span class="method-desc">${m.desc}</span>
                                </div>
                                <i class="fas fa-external-link-alt method-arrow"></i>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        container.innerHTML = html;
        
        // Event Listeners für Scale-Buttons
        container.querySelectorAll('.scale-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const group = e.target.closest('.scale-input');
                group.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.data[e.target.dataset.field] = parseInt(e.target.dataset.value);
            });
        });
        
        // Populate with saved data
        this.populateStepData();
        
        // Update buttons
        document.getElementById('prevStepBtn').style.display = stepNumber > 1 ? 'flex' : 'none';
        document.getElementById('nextStepBtn').innerHTML = stepNumber === this.totalSteps 
            ? 'Abschließen <i class="fas fa-check"></i>'
            : 'Weiter <i class="fas fa-arrow-right"></i>';
    }
    
    renderQuestion(q) {
        let html = `<div class="question-group">`;
        html += `<label for="${q.field}">${q.label}</label>`;
        
        if (q.hint) {
            html += `<p class="question-hint">${q.hint}</p>`;
        }
        
        if (q.type === 'textarea') {
            html += `<textarea id="${q.field}" name="${q.field}" rows="4" placeholder="Deine Antwort..."></textarea>`;
        } else if (q.type === 'scale') {
            html += `<div class="scale-input">`;
            for (let i = 1; i <= 10; i++) {
                const isActive = this.data[q.field] === i ? 'active' : '';
                html += `<button type="button" class="scale-btn ${isActive}" data-field="${q.field}" data-value="${i}">${i}</button>`;
            }
            html += `</div>`;
        } else {
            html += `<input type="text" id="${q.field}" name="${q.field}" placeholder="Deine Antwort...">`;
        }
        
        if (q.prompts && q.prompts.length > 0) {
            html += `
                <div class="thinking-prompts">
                    <h5><i class="fas fa-lightbulb"></i> Denkanstöße</h5>
                    <ul>
                        ${q.prompts.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }
    
    populateStepData() {
        const step = this.stepConfig[this.currentStep - 1];
        
        step.questions.forEach(q => {
            if (q.type === 'scale') {
                const value = this.data[q.field];
                if (value) {
                    const btn = document.querySelector(`.scale-btn[data-field="${q.field}"][data-value="${value}"]`);
                    if (btn) btn.classList.add('active');
                }
            } else {
                const el = document.getElementById(q.field);
                if (el && this.data[q.field]) {
                    el.value = this.data[q.field];
                }
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PROGRESS & DATA
    // ═══════════════════════════════════════════════════════════════════════════
    
    updateProgress() {
        const progress = ((this.currentStep - 1) / this.totalSteps) * 100;
        const progressBar = document.getElementById('modalProgressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update step indicators
        document.querySelectorAll('.progress-step').forEach((el, index) => {
            el.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                el.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                el.classList.add('active');
            }
        });
    }
    
    saveCurrentStepData() {
        const step = this.stepConfig[this.currentStep - 1];
        
        step.questions.forEach(q => {
            if (q.type !== 'scale') {
                const el = document.getElementById(q.field);
                if (el) {
                    this.data[q.field] = el.value;
                }
            }
        });
    }
    
    saveProgress() {
        try {
            localStorage.setItem('coaching_workflow_data', JSON.stringify(this.data));
            localStorage.setItem('coaching_workflow_step', this.currentStep.toString());
            console.log('💾 Coaching progress saved');
            
            // Optional: Save to server if logged in
            this.saveToServer();
        } catch (e) {
            console.error('Error saving coaching progress:', e);
        }
    }
    
    loadProgress() {
        try {
            const savedData = localStorage.getItem('coaching_workflow_data');
            const savedStep = localStorage.getItem('coaching_workflow_step');
            
            if (savedData) {
                this.data = { ...this.data, ...JSON.parse(savedData) };
            }
            if (savedStep) {
                this.currentStep = parseInt(savedStep);
            }
            console.log('📂 Coaching progress loaded, step:', this.currentStep);
        } catch (e) {
            console.error('Error loading coaching progress:', e);
        }
    }
    
    async saveToServer() {
        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn()) {
            return;
        }
        
        try {
            // Hier könnte AWS-Integration folgen
            console.log('☁️ Would save to server (not implemented)');
        } catch (e) {
            console.error('Error saving to server:', e);
        }
    }
    
    hasUnsavedChanges() {
        // Prüfe ob aktuelle Eingaben vom gespeicherten Stand abweichen
        const step = this.stepConfig[this.currentStep - 1];
        
        for (const q of step.questions) {
            if (q.type !== 'scale') {
                const el = document.getElementById(q.field);
                if (el && el.value !== (this.data[q.field] || '')) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // COMPLETION
    // ═══════════════════════════════════════════════════════════════════════════
    
    complete() {
        this.saveCurrentStepData();
        this.saveProgress();
        
        const container = document.getElementById('coachingContent');
        container.innerHTML = `
            <div class="step-content" style="text-align: center;">
                <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
                    <i class="fas fa-check" style="font-size: 3rem; color: white;"></i>
                </div>
                <h2 style="color: #10b981;">🎉 Glückwunsch!</h2>
                <p class="step-intro">Du hast den Coaching-Workflow erfolgreich abgeschlossen!</p>
                
                <div style="background: #f0fdf4; border-radius: 16px; padding: 24px; margin: 32px 0; text-align: left;">
                    <h3 style="color: #166534; margin-bottom: 16px;">
                        <i class="fas fa-clipboard-list"></i> Deine Zusammenfassung
                    </h3>
                    <p style="color: #15803d; margin-bottom: 16px;">
                        Du hast wertvolle Erkenntnisse über dich selbst gewonnen. Hier sind die wichtigsten Punkte:
                    </p>
                    <ul style="color: #166534; padding-left: 20px;">
                        <li><strong>Aktuelle Zufriedenheit:</strong> ${this.data.satisfactionLevel}/10</li>
                        <li><strong>Nächster Schritt:</strong> ${this.data.firstAction || 'Noch nicht definiert'}</li>
                        <li><strong>Hauptmotivation:</strong> ${this.data.motivators ? this.data.motivators.substring(0, 100) + '...' : 'Noch nicht definiert'}</li>
                    </ul>
                </div>
                
                <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="coachingWorkflow.downloadSummary()">
                        <i class="fas fa-download"></i> Zusammenfassung herunterladen
                    </button>
                    <button class="btn btn-outline" style="border-color: #667eea; color: #667eea;" onclick="coachingWorkflow.goToStep(1)">
                        <i class="fas fa-redo"></i> Nochmal durchgehen
                    </button>
                </div>
            </div>
        `;
        
        // Hide navigation buttons
        document.getElementById('prevStepBtn').style.display = 'none';
        document.getElementById('nextStepBtn').style.display = 'none';
        document.getElementById('saveLaterBtn').style.display = 'none';
        
        // Show toast
        if (typeof showToast === 'function') {
            showToast('Coaching abgeschlossen! 🎉', 'success');
        }
    }
    
    downloadSummary() {
        const summary = this.generateSummary();
        const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bewerbungscoaching_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    generateSummary() {
        return `
═══════════════════════════════════════════════════════════════════════════
                    BEWERBUNGSCOACHING - DEINE ZUSAMMENFASSUNG
                         Erstellt am ${new Date().toLocaleDateString('de-DE')}
═══════════════════════════════════════════════════════════════════════════

📍 STANDORTBESTIMMUNG
──────────────────────────────────────────────────────────────────────────
Aktuelle Situation:
${this.data.currentSituation || '(nicht ausgefüllt)'}

Zufriedenheitslevel: ${this.data.satisfactionLevel}/10

Verfügbare Ressourcen:
${this.data.currentResources || '(nicht ausgefüllt)'}

Größte Herausforderung:
${this.data.biggestChallenge || '(nicht ausgefüllt)'}


💎 STÄRKEN & WERTE
──────────────────────────────────────────────────────────────────────────
Natürliche Talente:
${this.data.naturalTalents || '(nicht ausgefüllt)'}

Erworbene Fähigkeiten:
${this.data.acquiredSkills || '(nicht ausgefüllt)'}

Kernwerte:
${this.data.coreValues || '(nicht ausgefüllt)'}

Alleinstellungsmerkmal (USP):
${this.data.uniqueStrengths || '(nicht ausgefüllt)'}


🎯 ZIELE
──────────────────────────────────────────────────────────────────────────
Traumjob:
${this.data.dreamJob || '(nicht ausgefüllt)'}

Kurzfristige Ziele (3-6 Monate):
${this.data.shortTermGoals || '(nicht ausgefüllt)'}

Langfristige Vision (5 Jahre):
${this.data.longTermVision || '(nicht ausgefüllt)'}

Ideales Arbeitsumfeld:
${this.data.idealWorkEnvironment || '(nicht ausgefüllt)'}


⛰️ HINDERNISSE & LÖSUNGEN
──────────────────────────────────────────────────────────────────────────
Haupthindernisse:
${this.data.mainObstacles || '(nicht ausgefüllt)'}

Innere Blockaden:
${this.data.internalBlockers || '(nicht ausgefüllt)'}

Äußere Hindernisse:
${this.data.externalBlockers || '(nicht ausgefüllt)'}

Unterstützungssystem:
${this.data.supportSystem || '(nicht ausgefüllt)'}

Lösungsstrategien:
${this.data.solutionStrategies || '(nicht ausgefüllt)'}


📋 AKTIONSPLAN
──────────────────────────────────────────────────────────────────────────
Allererster Schritt:
${this.data.firstAction || '(nicht ausgefüllt)'}

Nächste Schritte:
${this.data.nextSteps || '(nicht ausgefüllt)'}

Meilensteine:
${this.data.milestones || '(nicht ausgefüllt)'}

Zeitplan:
${this.data.timeline || '(nicht ausgefüllt)'}


🔥 MOTIVATION & COMMITMENT
──────────────────────────────────────────────────────────────────────────
Motivatoren:
${this.data.motivators || '(nicht ausgefüllt)'}

Mein Commitment:
${this.data.commitment || '(nicht ausgefüllt)'}

Erfolgsindikatoren:
${this.data.successIndicators || '(nicht ausgefüllt)'}

Belohnungssystem:
${this.data.rewardSystem || '(nicht ausgefüllt)'}

Accountability-Partner:
${this.data.accountabilityPartner || '(nicht ausgefüllt)'}


═══════════════════════════════════════════════════════════════════════════
                    Viel Erfolg auf deinem Weg!
                         manuel-weiss.ch
═══════════════════════════════════════════════════════════════════════════
        `.trim();
    }
}

// Initialize
const coachingWorkflow = new CoachingWorkflow();

// Global functions
function startCoachingWorkflow() {
    coachingWorkflow.start();
}

function closeCoachingModal() {
    coachingWorkflow.close();
}

function nextCoachingStep() {
    coachingWorkflow.nextStep();
}

function previousCoachingStep() {
    coachingWorkflow.previousStep();
}

function saveCoachingProgress() {
    coachingWorkflow.saveCurrentStepData();
    coachingWorkflow.saveProgress();
    if (typeof showToast === 'function') {
        showToast('Fortschritt gespeichert!', 'success');
    } else {
        alert('Fortschritt gespeichert!');
    }
}

function showMethodExplanation() {
    const section = document.getElementById('methodSection');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

