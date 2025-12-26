/**
 * Ikigai Smart Workflow - Komplett neue, moderne Implementierung
 * Mit YouTube-Videos, detaillierten Erklärungen und modernem Design
 */

class IkigaiSmartWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.workflowData = {
            selfReflection: '',
            passion: '',
            mission: '',
            profession: '',
            vocation: '',
            synthesis: '',
            synthesisPassionMission: '',
            synthesisMissionProfession: '',
            synthesisProfessionVocation: '',
            synthesisVocationPassion: '',
            actionPlan: ''
        };
        
        this.youtubeVideos = [
            {
                id: 'JdS6FYUi54s',
                title: 'What is Ikigai? - The Japanese Secret to a Long and Happy Life',
                description: 'Erklärt das Konzept von Ikigai und wie man es findet'
            },
            {
                id: 'CevxZvSJLk8',
                title: 'How to Find Your Ikigai - TED Talk',
                description: 'TED Talk über die Suche nach dem eigenen Ikigai'
            },
            {
                id: 'iJc1dSAUp6g',
                title: 'Ikigai: The Japanese Way of Finding Purpose',
                description: 'Detaillierte Anleitung zur Ikigai-Methode'
            }
        ];
        
        this.init();
    }
    
    async init() {
        console.log('🎯 Initializing Ikigai Smart Workflow...');
        this.createWorkflowInterface();
        try {
            await this.loadSavedProgress();
        } catch (error) {
            console.warn('⚠️ Fehler beim Laden des gespeicherten Stands, starte mit Schritt 1:', error);
            this.currentStep = 1;
        }
        this.loadStep(this.currentStep);
    }
    
    createWorkflowInterface() {
        // Create main workflow container
        const container = document.createElement('div');
        container.id = 'ikigai-smart-workflow';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        container.innerHTML = `
            <div style="background: white; width: 95%; max-width: 1000px; height: 95%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; position: relative;">
                    <h2 style="margin: 0; font-size: 1.8rem;">🎯 Ikigai - Finde deinen Lebenszweck</h2>
                    <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Die japanische Methode zur Entdeckung deines Lebenszwecks</p>
                    <button onclick="window.ikigaiSmartWorkflow.close()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                
                <!-- Progress Bar -->
                <div style="background: #f8fafc; padding: 1rem 2rem; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600; color: #374151;">Schritt <span id="current-step">1</span> von <span id="total-steps">7</span></span>
                        <span style="color: #6b7280;" id="step-title">Selbstreflexion</span>
                    </div>
                    <div style="background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden;">
                        <div id="progress-bar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: 14.29%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Content -->
                <div id="ikigai-content" style="flex: 1; padding: 2rem; overflow-y: auto;">
                    <!-- Step content will be loaded here -->
                </div>
                
                <!-- Navigation -->
                <div style="background: #f8fafc; padding: 1.5rem 2rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <button id="prev-btn" onclick="window.ikigaiSmartWorkflow.previousStep()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: none; transition: all 0.3s ease; white-space: nowrap;">
                        ← Zurück
                    </button>
                    <button id="save-later-btn" onclick="window.ikigaiSmartWorkflow.saveProgressForLater()" style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; white-space: nowrap; flex: 0 0 auto;">
                        💾 Später weitermachen
                    </button>
                    <div style="flex: 1; min-width: 0;"></div>
                    <button id="next-btn" onclick="window.ikigaiSmartWorkflow.nextStep()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; white-space: nowrap;">
                        Weiter →
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
    }
    
    loadStep(step) {
        this.currentStep = step;
        this.updateProgress();
        
        const content = document.getElementById('ikigai-content');
        if (!content) return;
        
        let stepContent = '';
        
        switch(step) {
            case 1:
                stepContent = this.generateStep1();
                break;
            case 2:
                stepContent = this.generateStep2();
                break;
            case 3:
                stepContent = this.generateStep3();
                break;
            case 4:
                stepContent = this.generateStep4();
                break;
            case 5:
                stepContent = this.generateStep5();
                break;
            case 6:
                stepContent = this.generateStep6();
                break;
            case 7:
                stepContent = this.generateStep7();
                break;
        }
        
        content.innerHTML = stepContent;
        this.updateNavigation();
        this.addHoverEffects();
        this.restoreStepData(step);
    }
    
    /**
     * Stellt gespeicherte Daten für den aktuellen Schritt wieder her
     */
    restoreStepData(step) {
        // Lade gespeicherte Daten in die Textfelder
        switch(step) {
            case 1:
                const selfReflection = document.getElementById('self-reflection');
                if (selfReflection && this.workflowData.selfReflection) {
                    selfReflection.value = this.workflowData.selfReflection;
                }
                break;
            case 2:
                const passion = document.getElementById('passion');
                if (passion && this.workflowData.passion) {
                    passion.value = this.workflowData.passion;
                }
                break;
            case 3:
                const mission = document.getElementById('mission');
                if (mission && this.workflowData.mission) {
                    mission.value = this.workflowData.mission;
                }
                break;
            case 4:
                const profession = document.getElementById('profession');
                if (profession && this.workflowData.profession) {
                    profession.value = this.workflowData.profession;
                }
                break;
            case 5:
                const vocation = document.getElementById('vocation');
                if (vocation && this.workflowData.vocation) {
                    vocation.value = this.workflowData.vocation;
                }
                break;
            case 6:
                const synthesis = document.getElementById('ikigai-synthesis');
                if (synthesis && this.workflowData.synthesis) {
                    synthesis.value = this.workflowData.synthesis;
                }
                const synthesisPassionMission = document.getElementById('synthesis-passion-mission');
                if (synthesisPassionMission && this.workflowData.synthesisPassionMission) {
                    synthesisPassionMission.value = this.workflowData.synthesisPassionMission;
                }
                const synthesisMissionProfession = document.getElementById('synthesis-mission-profession');
                if (synthesisMissionProfession && this.workflowData.synthesisMissionProfession) {
                    synthesisMissionProfession.value = this.workflowData.synthesisMissionProfession;
                }
                const synthesisProfessionVocation = document.getElementById('synthesis-profession-vocation');
                if (synthesisProfessionVocation && this.workflowData.synthesisProfessionVocation) {
                    synthesisProfessionVocation.value = this.workflowData.synthesisProfessionVocation;
                }
                const synthesisVocationPassion = document.getElementById('synthesis-vocation-passion');
                if (synthesisVocationPassion && this.workflowData.synthesisVocationPassion) {
                    synthesisVocationPassion.value = this.workflowData.synthesisVocationPassion;
                }
                break;
            case 7:
                const actionPlan = document.getElementById('action-plan');
                if (actionPlan && this.workflowData.actionPlan) {
                    actionPlan.value = this.workflowData.actionPlan;
                }
                break;
        }
    }
    
    generateStep1() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 1: Selbstreflexion</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Beginne mit einer tiefen Selbstreflexion über dein Leben</p>
            </div>
            
            <!-- YouTube Video -->
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb; margin-bottom: 2rem;">
                <h4 style="color: #374151; margin: 0 0 1rem 0;">📺 Lerne mehr über Ikigai:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    ${this.youtubeVideos.map(video => `
                        <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb; transition: all 0.3s ease; cursor: pointer;" 
                             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" 
                             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                             onclick="window.open('https://www.youtube.com/watch?v=${video.id}', '_blank')">
                            <div style="width: 100%; height: 120px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;">
                                <span style="font-size: 2rem;">▶️</span>
                            </div>
                            <h5 style="color: #374151; margin: 0 0 0.5rem 0; font-size: 0.9rem;">${video.title}</h5>
                            <p style="color: #6b7280; margin: 0; font-size: 0.8rem;">${video.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Was denkst du über dein aktuelles Leben?</label>
                <textarea id="self-reflection" placeholder="Reflektiere über dein Leben: Was macht dich glücklich? Was belastet dich? Wo siehst du dich in 5 Jahren? Was sind deine größten Träume und Ängste?..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                    onfocus="this.style.borderColor='#667eea'"
                    onblur="this.style.borderColor='#e5e7eb'"></textarea>
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 0.5rem 0;">💡 Tipps für die Selbstreflexion:</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 1.5rem;">
                    <li>Nimm dir Zeit - beeile dich nicht</li>
                    <li>Sei ehrlich zu dir selbst</li>
                    <li>Denke an Momente, in denen du dich besonders lebendig gefühlt hast</li>
                    <li>Frage Freunde und Familie nach ihrer Einschätzung</li>
                </ul>
            </div>
        `;
    }
    
    generateStep2() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 2: Passion - Was du liebst</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Entdecke deine Leidenschaften und was dich wirklich begeistert</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Was liebst du wirklich? Was macht dich glücklich?</label>
                <textarea id="passion" placeholder="Beschreibe deine Leidenschaften: Welche Aktivitäten machen dir Spaß? Wofür brennst du? Was würdest du tun, auch wenn du nicht dafür bezahlt würdest? Was bringt dich zum Lächeln?..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                    onfocus="this.style.borderColor='#667eea'"
                    onblur="this.style.borderColor='#e5e7eb'"></textarea>
            </div>
            
            <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #92400e; margin: 0 0 0.5rem 0;">🔥 Passion-Entdeckung:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 1.5rem;">
                    <li>Denke an deine Kindheitsträume</li>
                    <li>Was machst du gerne in deiner Freizeit?</li>
                    <li>Wofür bewundern dich andere?</li>
                    <li>Was würdest du tun, wenn du unbegrenzt Zeit hättest?</li>
                </ul>
            </div>
        `;
    }
    
    generateStep3() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 3: Mission - Was die Welt braucht</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Finde heraus, womit du der Welt einen Dienst erweisen kannst</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Womit kannst du der Welt helfen? Was braucht die Welt?</label>
                <textarea id="mission" placeholder="Überlege, wie du der Welt helfen kannst: Welche Probleme siehst du? Was macht dich traurig oder wütend? Wie möchtest du die Welt verbessern? Welche Veränderungen wünschst du dir?..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                    onfocus="this.style.borderColor='#667eea'"
                    onblur="this.style.borderColor='#e5e7eb'"></textarea>
            </div>
            
            <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h4 style="color: #14532d; margin: 0 0 0.5rem 0;">🌍 Mission-Entdeckung:</h4>
                <ul style="color: #14532d; margin: 0; padding-left: 1.5rem;">
                    <li>Welche globalen Probleme beschäftigen dich?</li>
                    <li>Wie möchtest du anderen helfen?</li>
                    <li>Was ist dein Beitrag zur Gesellschaft?</li>
                    <li>Welche Werte sind dir wichtig?</li>
                </ul>
            </div>
        `;
    }
    
    generateStep4() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 4: Profession - Womit du Geld verdienen kannst</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Identifiziere deine beruflichen Möglichkeiten und Fähigkeiten</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Womit kannst du Geld verdienen? Was sind deine beruflichen Fähigkeiten?</label>
                <textarea id="profession" placeholder="Überlege deine beruflichen Möglichkeiten: Welche Fähigkeiten hast du? Was kannst du gut? Wofür würden andere bezahlen? Welche Jobs interessieren dich? Welche Branchen faszinieren dich?..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                    onfocus="this.style.borderColor='#667eea'"
                    onblur="this.style.borderColor='#e5e7eb'"></textarea>
            </div>
            
            <div style="background: #fdf2f8; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ec4899;">
                <h4 style="color: #831843; margin: 0 0 0.5rem 0;">💼 Profession-Entdeckung:</h4>
                <ul style="color: #831843; margin: 0; padding-left: 1.5rem;">
                    <li>Welche Ausbildung und Erfahrung hast du?</li>
                    <li>Was sind deine beruflichen Stärken?</li>
                    <li>Welche Branchen interessieren dich?</li>
                    <li>Wie möchtest du arbeiten?</li>
                </ul>
            </div>
        `;
    }
    
    generateStep5() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 5: Vocation - Was du gut kannst</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Erkenne deine Talente und natürlichen Fähigkeiten</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Was kannst du besonders gut? Was sind deine Talente?</label>
                <textarea id="vocation" placeholder="Beschreibe deine Talente: Was kannst du gut? Was kommt dir natürlich? Wofür loben dich andere? Was fällt dir leicht? Welche Fähigkeiten hast du entwickelt?..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                    onfocus="this.style.borderColor='#667eea'"
                    onblur="this.style.borderColor='#e5e7eb'"></textarea>
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 0.5rem 0;">🎯 Vocation-Entdeckung:</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 1.5rem;">
                    <li>Was fällt dir leicht, anderen aber schwer?</li>
                    <li>Wofür wirst du oft um Rat gefragt?</li>
                    <li>Welche Fähigkeiten hast du natürlich entwickelt?</li>
                    <li>Was macht dir Spaß und du bist gut darin?</li>
                </ul>
            </div>
        `;
    }
    
    generateStep6() {
        // Lade gespeicherte Daten für die Zusammenfassung
        const passion = this.workflowData.passion || '';
        const mission = this.workflowData.mission || '';
        const profession = this.workflowData.profession || '';
        const vocation = this.workflowData.vocation || '';
        const synthesis = this.workflowData.synthesis || '';
        
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 6: Synthese - Dein Ikigai</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Finde die Schnittmenge aller vier Bereiche</p>
            </div>
            
            <!-- KI-Synthese Button -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">
                <h4 style="color: white; margin: 0 0 1rem 0; font-size: 1.2rem;">🤖 KI-Synthese erstellen</h4>
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 1.5rem 0; font-size: 0.95rem;">Lass die KI eine ausführliche Synthese deiner Ikigai-Antworten erstellen</p>
                <button id="generate-ai-synthesis-btn" onclick="window.ikigaiSmartWorkflow.generateAISynthesis()" style="padding: 0.875rem 2rem; background: white; color: #667eea; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <span id="ai-synthesis-btn-text">✨ Synthese von KI erstellen lassen</span>
                    <span id="ai-synthesis-loading" style="display: none;">⏳ KI analysiert...</span>
                </button>
            </div>
            
            <!-- Zusammenfassung der vier Bereiche -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">🔥 Was du liebst</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-passion">${passion ? (passion.substring(0, 100) + (passion.length > 100 ? '...' : '')) : '-'}</p>
                </div>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">🌍 Was die Welt braucht</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-mission">${mission ? (mission.substring(0, 100) + (mission.length > 100 ? '...' : '')) : '-'}</p>
                </div>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">💼 Womit du Geld verdienen kannst</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-profession">${profession ? (profession.substring(0, 100) + (profession.length > 100 ? '...' : '')) : '-'}</p>
                </div>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">🎯 Was du gut kannst</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-vocation">${vocation ? (vocation.substring(0, 100) + (vocation.length > 100 ? '...' : '')) : '-'}</p>
                </div>
            </div>
            
            <!-- Haupt-Ikigai Synthese Feld -->
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                    🎯 Dein Ikigai - Die Synthese aller vier Bereiche
                </label>
                <textarea id="ikigai-synthesis" placeholder="Hier erscheint deine persönliche Ikigai-Synthese, die die Schnittmenge deiner Leidenschaft, Mission, Profession und Vocation beschreibt. Du kannst die KI-Synthese verwenden oder deine eigene Formulierung schreiben..." 
                    style="width: 100%; min-height: 200px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                    onfocus="this.style.borderColor='#667eea'"
                    onblur="this.style.borderColor='#e5e7eb'">${synthesis}</textarea>
            </div>
            
            <!-- Detaillierte Synthese-Felder -->
            <div style="margin-bottom: 2rem;">
                <h4 style="color: #374151; margin-bottom: 1rem; font-size: 1.1rem;">Detaillierte Synthese-Bereiche</h4>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Schnittmenge: Passion & Mission</label>
                    <textarea id="synthesis-passion-mission" placeholder="Wie verbinden sich deine Leidenschaften mit dem, was die Welt braucht?" 
                        style="width: 100%; height: 100px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                        onfocus="this.style.borderColor='#667eea'"
                        onblur="this.style.borderColor='#e5e7eb'">${this.workflowData.synthesisPassionMission || ''}</textarea>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Schnittmenge: Mission & Profession</label>
                    <textarea id="synthesis-mission-profession" placeholder="Wie verbindet sich deine Mission mit deinen beruflichen Möglichkeiten?" 
                        style="width: 100%; height: 100px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                        onfocus="this.style.borderColor='#667eea'"
                        onblur="this.style.borderColor='#e5e7eb'">${this.workflowData.synthesisMissionProfession || ''}</textarea>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Schnittmenge: Profession & Vocation</label>
                    <textarea id="synthesis-profession-vocation" placeholder="Wie verbinden sich deine beruflichen Möglichkeiten mit deinen Talenten?" 
                        style="width: 100%; height: 100px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                        onfocus="this.style.borderColor='#667eea'"
                        onblur="this.style.borderColor='#e5e7eb'">${this.workflowData.synthesisProfessionVocation || ''}</textarea>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Schnittmenge: Vocation & Passion</label>
                    <textarea id="synthesis-vocation-passion" placeholder="Wie verbinden sich deine Talente mit deinen Leidenschaften?" 
                        style="width: 100%; height: 100px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                        onfocus="this.style.borderColor='#667eea'"
                        onblur="this.style.borderColor='#e5e7eb'">${this.workflowData.synthesisVocationPassion || ''}</textarea>
                </div>
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 1rem 0;">💡 Tipp</h4>
                <p style="color: #0c4a6e; margin: 0;">Die KI-Synthese analysiert deine Antworten aus allen vorherigen Schritten und erstellt eine ausführliche, persönliche Synthese. Du kannst diese Vorschläge dann nach deinen Wünschen anpassen.</p>
            </div>
        `;
    }
    
    generateStep7() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 7: Aktionsplan</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Erstelle einen konkreten Plan, um dein Ikigai zu leben</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Wie möchtest du dein Ikigai in die Tat umsetzen?</label>
                <textarea id="action-plan" placeholder="Erstelle einen konkreten Aktionsplan: Was sind deine nächsten Schritte? Welche Ziele setzt du dir? Wie möchtest du dein Ikigai leben? Welche Veränderungen willst du vornehmen?..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit; transition: border-color 0.3s ease;"
                    onfocus="this.style.borderColor='#667eea'"
                    onblur="this.style.borderColor='#e5e7eb'"></textarea>
            </div>
            
            <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h4 style="color: #14532d; margin: 0 0 1rem 0;">📋 Aktionsplan-Tipps:</h4>
                <ul style="color: #14532d; margin: 0; padding-left: 1.5rem;">
                    <li>Setze dir konkrete, messbare Ziele</li>
                    <li>Teile große Ziele in kleine Schritte auf</li>
                    <li>Setze dir Fristen für deine Ziele</li>
                    <li>Überprüfe regelmäßig deinen Fortschritt</li>
                </ul>
            </div>
        `;
    }
    
    calculateIkigai() {
        const passion = document.getElementById('passion')?.value || '';
        const mission = document.getElementById('mission')?.value || '';
        const profession = document.getElementById('profession')?.value || '';
        const vocation = document.getElementById('vocation')?.value || '';
        
        // Einfache AI-ähnliche Analyse
        const passionWords = passion.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
        const missionWords = mission.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
        const professionWords = profession.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
        const vocationWords = vocation.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
        
        // Finde gemeinsame Themen
        const allWords = [...passionWords, ...missionWords, ...professionWords, ...vocationWords];
        const wordCount = {};
        allWords.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        const commonThemes = Object.entries(wordCount)
            .filter(([word, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word]) => word);
        
        if (commonThemes.length > 0) {
            return `Dein Ikigai ist es, ${commonThemes.join(', ')} zu tun - die perfekte Verbindung deiner Leidenschaft, Mission, Profession und Vocation.`;
        } else {
            return "Dein Ikigai ist die einzigartige Schnittmenge deiner Leidenschaft, Mission, Profession und Vocation. Nutze diese Erkenntnisse als Leitfaden für deine Lebensentscheidungen.";
        }
    }
    
    addHoverEffects() {
        // Add hover effects to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            });
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });
        
        // Add hover effects to textareas
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('mouseenter', function() {
                this.style.borderColor = '#667eea';
                this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            });
            textarea.addEventListener('mouseleave', function() {
                if (document.activeElement !== this) {
                    this.style.borderColor = '#e5e7eb';
                    this.style.boxShadow = 'none';
                }
            });
        });
    }
    
    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.getElementById('progress-bar');
        const currentStepEl = document.getElementById('current-step');
        const stepTitle = document.getElementById('step-title');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (currentStepEl) currentStepEl.textContent = this.currentStep;
        
        const titles = [
            'Selbstreflexion',
            'Passion',
            'Mission',
            'Profession',
            'Vocation',
            'Synthese',
            'Aktionsplan'
        ];
        
        if (stepTitle) stepTitle.textContent = titles[this.currentStep - 1];
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        }
        
        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.textContent = 'Abschließen';
                nextBtn.removeAttribute('onclick');
                nextBtn.setAttribute('onclick', 'window.ikigaiSmartWorkflow.finish()');
            } else {
                nextBtn.textContent = 'Weiter →';
                nextBtn.removeAttribute('onclick');
                nextBtn.setAttribute('onclick', 'window.ikigaiSmartWorkflow.nextStep()');
            }
        }
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.saveCurrentStep();
            this.loadStep(this.currentStep + 1);
        }
    }
    
    previousStep() {
        if (this.currentStep > 1) {
            this.loadStep(this.currentStep - 1);
        }
    }
    
    saveCurrentStep() {
        switch(this.currentStep) {
            case 1:
                this.workflowData.selfReflection = document.getElementById('self-reflection')?.value || '';
                break;
            case 2:
                this.workflowData.passion = document.getElementById('passion')?.value || '';
                break;
            case 3:
                this.workflowData.mission = document.getElementById('mission')?.value || '';
                break;
            case 4:
                this.workflowData.profession = document.getElementById('profession')?.value || '';
                break;
            case 5:
                this.workflowData.vocation = document.getElementById('vocation')?.value || '';
                break;
            case 6:
                this.workflowData.synthesis = document.getElementById('ikigai-synthesis')?.value || '';
                this.workflowData.synthesisPassionMission = document.getElementById('synthesis-passion-mission')?.value || '';
                this.workflowData.synthesisMissionProfession = document.getElementById('synthesis-mission-profession')?.value || '';
                this.workflowData.synthesisProfessionVocation = document.getElementById('synthesis-profession-vocation')?.value || '';
                this.workflowData.synthesisVocationPassion = document.getElementById('synthesis-vocation-passion')?.value || '';
                break;
            case 7:
                this.workflowData.actionPlan = document.getElementById('action-plan')?.value || '';
                break;
        }
    }
    
    async finish() {
        this.saveCurrentStep();
        
        // Update summary in step 6
        const summaryPassion = document.getElementById('summary-passion');
        const summaryMission = document.getElementById('summary-mission');
        const summaryProfession = document.getElementById('summary-profession');
        const summaryVocation = document.getElementById('summary-vocation');
        
        if (summaryPassion) summaryPassion.textContent = this.workflowData.passion.substring(0, 100) + '...';
        if (summaryMission) summaryMission.textContent = this.workflowData.mission.substring(0, 100) + '...';
        if (summaryProfession) summaryProfession.textContent = this.workflowData.profession.substring(0, 100) + '...';
        if (summaryVocation) summaryVocation.textContent = this.workflowData.vocation.substring(0, 100) + '...';
        
        // Speichere als abgeschlossen in AWS
        try {
            if (window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()) {
                // Markiere als abgeschlossen über UserProgressTracker
                if (window.userProgressTracker) {
                    if (!window.userProgressTracker.isInitialized) {
                        await window.userProgressTracker.init();
                    }
                    
                    // Tracke alle Schritte als abgeschlossen
                    for (let i = 1; i <= this.totalSteps; i++) {
                        await window.userProgressTracker.trackStepCompletion('ikigai-workflow', `step-${i}`, this.totalSteps);
                    }
                    
                    // Speichere finale Daten
                    await window.userProgressTracker.trackFormData('ikigai-workflow', {
                        currentStep: this.totalSteps,
                        totalSteps: this.totalSteps,
                        workflowData: this.workflowData,
                        completed: true,
                        completedAt: new Date().toISOString()
                    });
                }
                
                // Speichere auch im Profil als abgeschlossen
                if (window.awsProfileAPI) {
                    try {
                        // Warte auf Initialisierung falls nötig
                        if (!window.awsProfileAPI.isInitialized) {
                            await window.awsProfileAPI.waitForInit();
                        }
                        
                        if (window.awsProfileAPI.isInitialized) {
                            const user = window.realUserAuth.getCurrentUser();
                            const userId = user?.id || user?.userId || user?.email;
                            
                            if (userId) {
                                const profile = await window.awsProfileAPI.loadProfile();
                                const updatedProfile = {
                                    ...profile,
                                    userId: userId,
                                    ikigaiWorkflow: {
                                        methodId: 'ikigai',
                                        methodName: 'Ikigai-Workflow',
                                        currentStep: this.totalSteps,
                                        totalSteps: this.totalSteps,
                                        workflowData: this.workflowData,
                                        completionPercentage: 100,
                                        lastUpdated: new Date().toISOString(),
                                        completedAt: new Date().toISOString(),
                                        status: 'completed'
                                    },
                                    updatedAt: new Date().toISOString()
                                };
                                
                                await window.awsProfileAPI.saveProfile(updatedProfile);
                            }
                        }
                    } catch (profileError) {
                        console.warn('⚠️ Konnte nicht im Profil speichern:', profileError);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern des abgeschlossenen Workflows:', error);
            // Weiter mit lokaler Speicherung als Fallback
        }
        
        // Save to localStorage (Fallback)
        localStorage.setItem('ikigaiSmartWorkflow', JSON.stringify(this.workflowData));
        
        // Show success message
        alert('🎉 Dein Ikigai wurde gespeichert! Nutze diese Erkenntnisse als Leitfaden für dein Leben.');
        
        // Close workflow
        this.close();
    }
    
    close() {
        const container = document.getElementById('ikigai-smart-workflow');
        if (container) {
            container.remove();
        }
    }
    
    /**
     * Speichert den aktuellen Workflow-Stand in AWS für späteres Fortsetzen
     */
    async saveProgressForLater() {
        try {
            // Sammle alle aktuellen Daten
            this.saveCurrentStep();
            
            // Prüfe ob User angemeldet ist
            if (!window.realUserAuth || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) {
                alert('⚠️ Bitte melde dich an, um deinen Fortschritt zu speichern.');
                return;
            }
            
            // Bereite Workflow-Daten vor
            const workflowProgress = {
                methodId: 'ikigai',
                methodName: 'Ikigai-Workflow',
                currentStep: this.currentStep,
                totalSteps: this.totalSteps,
                workflowData: this.workflowData,
                completionPercentage: Math.round((this.currentStep / this.totalSteps) * 100),
                lastUpdated: new Date().toISOString(),
                status: 'in-progress'
            };
            
            // Speichere über UserProgressTracker (für Dashboard-Integration)
            if (window.userProgressTracker) {
                // Stelle sicher, dass Progress Tracker initialisiert ist
                if (!window.userProgressTracker.isInitialized) {
                    await window.userProgressTracker.init();
                }
                
                // Speichere als Workflow-Progress
                await window.userProgressTracker.trackFormData('ikigai-workflow', {
                    currentStep: this.currentStep,
                    totalSteps: this.totalSteps,
                    workflowData: this.workflowData
                });
                
                // Tracke Schritt-Fortschritt
                await window.userProgressTracker.trackStepCompletion('ikigai-workflow', `step-${this.currentStep}`, this.totalSteps);
            }
            
            // Speichere auch direkt im Profil für einfachen Zugriff
            if (window.awsProfileAPI) {
                try {
                    // Warte auf Initialisierung falls nötig
                    if (!window.awsProfileAPI.isInitialized) {
                        await window.awsProfileAPI.waitForInit();
                    }
                    
                    if (window.awsProfileAPI.isInitialized) {
                        const user = window.realUserAuth.getCurrentUser();
                        const userId = user?.id || user?.userId || user?.email;
                        
                        if (userId) {
                            // Lade aktuelles Profil
                            const profile = await window.awsProfileAPI.loadProfile();
                            
                            // Füge Ikigai-Workflow-Daten hinzu
                            const updatedProfile = {
                                ...profile,
                                userId: userId,
                                ikigaiWorkflow: workflowProgress,
                                updatedAt: new Date().toISOString()
                            };
                            
                            // Speichere in AWS
                            await window.awsProfileAPI.saveProfile(updatedProfile);
                        }
                    }
                } catch (profileError) {
                    console.warn('⚠️ Konnte nicht direkt im Profil speichern:', profileError);
                    // Weiter mit Progress Tracker
                }
            }
            
            // Zeige Erfolgs-Benachrichtigung
            this.showSaveNotification();
            
            console.log('✅ Ikigai-Workflow Fortschritt gespeichert:', workflowProgress);
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern des Fortschritts:', error);
            alert('⚠️ Fehler beim Speichern: ' + (error.message || 'Unbekannter Fehler'));
        }
    }
    
    /**
     * Lädt gespeicherten Workflow-Stand beim Start
     */
    async loadSavedProgress() {
        try {
            // Prüfe ob User angemeldet ist
            if (!window.realUserAuth || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) {
                console.log('ℹ️ User nicht angemeldet - starte mit Schritt 1');
                this.currentStep = 1;
                return;
            }
            
            // Warte auf AWS Profile API Initialisierung (falls noch nicht fertig)
            if (window.awsProfileAPI) {
                if (!window.awsProfileAPI.isInitialized) {
                    await window.awsProfileAPI.waitForInit();
                }
                
                if (window.awsProfileAPI.isInitialized) {
                    const profile = await window.awsProfileAPI.loadProfile();
                    
                    if (profile && profile.ikigaiWorkflow) {
                        const savedProgress = profile.ikigaiWorkflow;
                        
                        // Stelle sicher, dass es ein Ikigai-Workflow ist
                        if (savedProgress.methodId === 'ikigai' && savedProgress.status === 'in-progress') {
                            this.currentStep = savedProgress.currentStep || 1;
                            this.workflowData = savedProgress.workflowData || this.workflowData;
                            
                            console.log('✅ Gespeicherter Ikigai-Workflow-Stand geladen:', {
                                step: this.currentStep,
                                completion: savedProgress.completionPercentage + '%'
                            });
                            
                            return;
                        }
                    }
                }
            }
            
            // Fallback: Lade von UserProgressTracker
            if (window.userProgressTracker) {
                if (!window.userProgressTracker.isInitialized) {
                    await window.userProgressTracker.init();
                }
                
                const pageProgress = window.userProgressTracker.getPageProgress('ikigai-workflow');
                
                if (pageProgress && pageProgress.formData) {
                    this.currentStep = pageProgress.formData.currentStep || 1;
                    this.workflowData = pageProgress.formData.workflowData || this.workflowData;
                    
                    console.log('✅ Gespeicherter Stand von Progress Tracker geladen');
                    return;
                }
            }
            
            // Kein gespeicherter Stand gefunden - starte mit Schritt 1
            console.log('ℹ️ Kein gespeicherter Stand gefunden - starte mit Schritt 1');
            this.currentStep = 1;
            
        } catch (error) {
            console.error('❌ Fehler beim Laden des gespeicherten Stands:', error);
            // Bei Fehler starte mit Schritt 1
            this.currentStep = 1;
        }
    }
    
    /**
     * Generiert eine KI-basierte Synthese der Ikigai-Antworten
     */
    async generateAISynthesis() {
        try {
            // Sammle alle Daten aus den vorherigen Schritten
            this.saveCurrentStep();
            
            const selfReflection = this.workflowData.selfReflection || '';
            const passion = this.workflowData.passion || '';
            const mission = this.workflowData.mission || '';
            const profession = this.workflowData.profession || '';
            const vocation = this.workflowData.vocation || '';
            
            // Prüfe ob genug Daten vorhanden sind
            if (!passion && !mission && !profession && !vocation) {
                alert('⚠️ Bitte fülle zuerst die Schritte 2-5 aus, bevor du eine KI-Synthese erstellen kannst.');
                return;
            }
            
            // Zeige Loading-Status
            const btn = document.getElementById('generate-ai-synthesis-btn');
            const btnText = document.getElementById('ai-synthesis-btn-text');
            const btnLoading = document.getElementById('ai-synthesis-loading');
            
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '0.7';
                btn.style.cursor = 'not-allowed';
            }
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';
            
            // Lade API Key
            let apiKey = null;
            
            // Versuche verschiedene Quellen für den API Key
            if (window.globalAIService && window.globalAIService.apiKey) {
                apiKey = window.globalAIService.apiKey;
            } else if (window.secureAPIManager) {
                apiKey = window.secureAPIManager.getAPIKey();
            } else if (localStorage.getItem('openai_api_key')) {
                apiKey = localStorage.getItem('openai_api_key');
            }
            
            if (!apiKey || !apiKey.startsWith('sk-')) {
                alert('⚠️ Kein OpenAI API Key gefunden!\n\nBitte konfiguriere deinen API Key im Admin Panel unter KI-Einstellungen.');
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                }
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
                return;
            }
            
            // Erstelle den Prompt für die KI
            const prompt = `Du bist ein Experte für Ikigai, die japanische Methode zur Findung des Lebenszwecks. 

Analysiere die folgenden Antworten einer Person aus einem Ikigai-Workflow und erstelle eine ausführliche, persönliche Synthese:

**Selbstreflexion:**
${selfReflection || 'Nicht ausgefüllt'}

**Passion - Was die Person liebt:**
${passion || 'Nicht ausgefüllt'}

**Mission - Was die Welt braucht:**
${mission || 'Nicht ausgefüllt'}

**Profession - Womit die Person Geld verdienen kann:**
${profession || 'Nicht ausgefüllt'}

**Vocation - Was die Person gut kann:**
${vocation || 'Nicht ausgefüllt'}

Erstelle eine umfassende Ikigai-Synthese im folgenden Format (als JSON):

{
  "mainSynthesis": "Eine ausführliche, 3-4 Absätze lange Hauptsynthese, die die Schnittmenge aller vier Bereiche beschreibt. Diese sollte inspirierend, persönlich und konkret sein.",
  "passionMission": "Wie verbinden sich die Leidenschaften mit dem, was die Welt braucht? (2-3 Sätze)",
  "missionProfession": "Wie verbindet sich die Mission mit den beruflichen Möglichkeiten? (2-3 Sätze)",
  "professionVocation": "Wie verbinden sich die beruflichen Möglichkeiten mit den Talenten? (2-3 Sätze)",
  "vocationPassion": "Wie verbinden sich die Talente mit den Leidenschaften? (2-3 Sätze)"
}

Die Synthese sollte:
- Alle vier Bereiche intelligent verknüpfen
- Konkrete, umsetzbare Erkenntnisse liefern
- Inspirierend und motivierend sein
- In der Du-Form geschrieben sein
- Auf Deutsch sein

Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text.`;

            // Rufe die OpenAI API auf
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Du bist ein Experte für Ikigai und Persönlichkeitsentwicklung. Du erstellst präzise, inspirierende Synthesen im JSON-Format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Fehler: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // Parse die JSON-Antwort
            let synthesisData;
            try {
                // Entferne mögliche Markdown-Code-Blöcke
                const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                synthesisData = JSON.parse(cleanedResponse);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('AI Response:', aiResponse);
                // Fallback: Versuche die Antwort direkt zu verwenden
                synthesisData = {
                    mainSynthesis: aiResponse,
                    passionMission: '',
                    missionProfession: '',
                    professionVocation: '',
                    vocationPassion: ''
                };
            }
            
            // Fülle die Felder mit der KI-Synthese
            const mainSynthesisField = document.getElementById('ikigai-synthesis');
            if (mainSynthesisField && synthesisData.mainSynthesis) {
                mainSynthesisField.value = synthesisData.mainSynthesis;
            }
            
            const passionMissionField = document.getElementById('synthesis-passion-mission');
            if (passionMissionField && synthesisData.passionMission) {
                passionMissionField.value = synthesisData.passionMission;
            }
            
            const missionProfessionField = document.getElementById('synthesis-mission-profession');
            if (missionProfessionField && synthesisData.missionProfession) {
                missionProfessionField.value = synthesisData.missionProfession;
            }
            
            const professionVocationField = document.getElementById('synthesis-profession-vocation');
            if (professionVocationField && synthesisData.professionVocation) {
                professionVocationField.value = synthesisData.professionVocation;
            }
            
            const vocationPassionField = document.getElementById('synthesis-vocation-passion');
            if (vocationPassionField && synthesisData.vocationPassion) {
                vocationPassionField.value = synthesisData.vocationPassion;
            }
            
            // Speichere die Synthese-Daten
            this.workflowData.synthesis = synthesisData.mainSynthesis || '';
            this.workflowData.synthesisPassionMission = synthesisData.passionMission || '';
            this.workflowData.synthesisMissionProfession = synthesisData.missionProfession || '';
            this.workflowData.synthesisProfessionVocation = synthesisData.professionVocation || '';
            this.workflowData.synthesisVocationPassion = synthesisData.vocationPassion || '';
            
            // Zeige Erfolgs-Benachrichtigung
            this.showAISynthesisNotification();
            
            console.log('✅ KI-Synthese erfolgreich erstellt');
            
        } catch (error) {
            console.error('❌ Fehler bei der KI-Synthese-Erstellung:', error);
            alert('⚠️ Fehler beim Erstellen der KI-Synthese: ' + (error.message || 'Unbekannter Fehler'));
        } finally {
            // Stelle Button wieder her
            const btn = document.getElementById('generate-ai-synthesis-btn');
            const btnText = document.getElementById('ai-synthesis-btn-text');
            const btnLoading = document.getElementById('ai-synthesis-loading');
            
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }
    
    /**
     * Zeigt eine Benachrichtigung nach erfolgreicher KI-Synthese
     */
    showAISynthesisNotification() {
        // Entferne bestehende Notification falls vorhanden
        const existingNotification = document.getElementById('ikigai-ai-synthesis-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Erstelle Notification-Element
        const notification = document.createElement('div');
        notification.id = 'ikigai-ai-synthesis-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 600;
            animation: ikigaiSlideIn 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <span style="font-size: 1.5rem;">✨</span>
            <div>
                <div style="font-size: 1rem; margin-bottom: 0.25rem;">KI-Synthese erstellt!</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">Du kannst die Vorschläge jetzt anpassen</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Entferne nach 5 Sekunden
        setTimeout(() => {
            notification.style.animation = 'ikigaiSlideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    /**
     * Zeigt eine Benachrichtigung nach dem Speichern
     */
    showSaveNotification() {
        // Entferne bestehende Notification falls vorhanden
        const existingNotification = document.getElementById('ikigai-save-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Füge Animation-Style hinzu (nur einmal)
        if (!document.getElementById('ikigai-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'ikigai-notification-styles';
            style.textContent = `
                @keyframes ikigaiSlideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes ikigaiSlideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Erstelle Notification-Element
        const notification = document.createElement('div');
        notification.id = 'ikigai-save-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 600;
            animation: ikigaiSlideIn 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        notification.innerHTML = `
            <span style="font-size: 1.5rem;">✅</span>
            <div>
                <div style="font-size: 1rem; margin-bottom: 0.25rem;">Fortschritt gespeichert!</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">Du kannst später an Schritt ${this.currentStep} weitermachen</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Entferne nach 4 Sekunden
        setTimeout(() => {
            notification.style.animation = 'ikigaiSlideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Make globally available
window.IkigaiSmartWorkflow = IkigaiSmartWorkflow;
