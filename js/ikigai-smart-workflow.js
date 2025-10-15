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
    
    init() {
        console.log('🎯 Initializing Ikigai Smart Workflow...');
        this.createWorkflowInterface();
        this.loadStep(1);
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
                <div style="background: #f8fafc; padding: 1.5rem 2rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                    <button id="prev-btn" onclick="window.ikigaiSmartWorkflow.previousStep()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: none; transition: all 0.3s ease;">
                        ← Zurück
                    </button>
                    <div style="flex: 1;"></div>
                    <button id="next-btn" onclick="window.ikigaiSmartWorkflow.nextStep()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
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
        const ikigai = this.calculateIkigai();
        
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 6: Synthese - Dein Ikigai</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Finde die Schnittmenge aller vier Bereiche</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🎯 Dein Ikigai</h4>
                <p style="margin: 0; font-size: 1.2rem; line-height: 1.6;">${ikigai}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">🔥 Was du liebst</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-passion">-</p>
                </div>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">🌍 Was die Welt braucht</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-mission">-</p>
                </div>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">💼 Womit du Geld verdienen kannst</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-profession">-</p>
                </div>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">🎯 Was du gut kannst</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-vocation">-</p>
                </div>
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 1rem 0;">🎉 Dein Ikigai gefunden!</h4>
                <p style="color: #0c4a6e; margin: 0;">Das ist der Schnittpunkt deiner Leidenschaft, Mission, Profession und Vocation. Nutze dies als Leitfaden für deine Lebensentscheidungen.</p>
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
            case 7:
                this.workflowData.actionPlan = document.getElementById('action-plan')?.value || '';
                break;
        }
    }
    
    finish() {
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
        
        // Save to localStorage
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
}

// Make globally available
window.IkigaiSmartWorkflow = IkigaiSmartWorkflow;
