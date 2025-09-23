// AI Twin Presenter for Application Pages
// This creates an interactive AI representation of the applicant

class AITwinPresenter {
    constructor() {
        this.userProfile = null;
        this.applicationData = null;
        this.conversationHistory = [];
        this.isActive = false;
    }
    
    // Initialize AI Twin with user data
    async initialize(applicationId) {
        // Load user profile
        this.userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        // Load specific application data
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        this.applicationData = applications.find(app => app.id === applicationId);
        
        if (!this.applicationData) {
            console.error('Application not found:', applicationId);
            return false;
        }
        
        // Load learning insights
        if (window.applicationLearningSystem) {
            this.learningInsights = window.applicationLearningSystem.getLearningInsights();
        }
        
        return true;
    }
    
    // Create AI Twin UI for the application page
    createAITwinUI() {
        const aiTwinHTML = `
            <div id="ai-twin-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
                <!-- AI Twin Avatar -->
                <div id="ai-twin-avatar" style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: all 0.3s ease;">
                    <div style="width: 60px; height: 60px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 24px; font-weight: bold; color: #667eea;">MW</span>
                    </div>
                    <div id="ai-twin-pulse" style="position: absolute; width: 100%; height: 100%; border: 3px solid #667eea; border-radius: 50%; animation: pulse 2s infinite;"></div>
                </div>
                
                <!-- AI Twin Chat Window -->
                <div id="ai-twin-chat" style="display: none; position: absolute; bottom: 100px; right: 0; width: 400px; height: 600px; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); overflow: hidden;">
                    <!-- Chat Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin: 0; font-size: 1.2rem;">Manuel Weiß - AI Assistant</h3>
                            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Ich beantworte Ihre Fragen zu meiner Bewerbung</p>
                        </div>
                        <button onclick="aiTwin.toggleChat()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    
                    <!-- Chat Messages -->
                    <div id="ai-twin-messages" style="height: 400px; overflow-y: auto; padding: 1.5rem; background: #f8fafc;">
                        <div class="ai-message" style="margin-bottom: 1rem;">
                            <div style="background: #e0e7ff; padding: 1rem; border-radius: 12px; border-bottom-left-radius: 0;">
                                <p style="margin: 0;">Hallo! Ich bin Manuel Weiß. Schön, dass Sie sich Zeit für meine Bewerbung nehmen. Haben Sie Fragen zu meinen Qualifikationen oder möchten Sie mehr über meine Erfahrungen erfahren?</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Questions -->
                    <div style="padding: 0 1.5rem; background: white;">
                        <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Häufige Fragen:</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                            <button onclick="aiTwin.askQuestion('experience')" style="padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                                Berufserfahrung
                            </button>
                            <button onclick="aiTwin.askQuestion('skills')" style="padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                                Kernkompetenzen
                            </button>
                            <button onclick="aiTwin.askQuestion('motivation')" style="padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                                Motivation
                            </button>
                            <button onclick="aiTwin.askQuestion('projects')" style="padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                                Projekte
                            </button>
                        </div>
                    </div>
                    
                    <!-- Chat Input -->
                    <div style="padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb;">
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="ai-twin-input" placeholder="Stellen Sie mir eine Frage..." style="flex: 1; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; outline: none;" onkeypress="if(event.key === 'Enter') aiTwin.sendMessage()">
                            <button onclick="aiTwin.sendMessage()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.7;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                #ai-twin-avatar:hover {
                    transform: scale(1.1);
                }
                
                .ai-message {
                    animation: fadeIn 0.5s ease;
                }
                
                .user-message {
                    animation: fadeIn 0.5s ease;
                    text-align: right;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @media (max-width: 768px) {
                    #ai-twin-chat {
                        width: 100% !important;
                        height: 100% !important;
                        bottom: 0 !important;
                        right: 0 !important;
                        border-radius: 0 !important;
                    }
                }
            </style>
        `;
        
        // Add to page
        const container = document.createElement('div');
        container.innerHTML = aiTwinHTML;
        document.body.appendChild(container);
        
        // Add click handler to avatar
        document.getElementById('ai-twin-avatar').addEventListener('click', () => this.toggleChat());
    }
    
    // Toggle chat window
    toggleChat() {
        const chat = document.getElementById('ai-twin-chat');
        const avatar = document.getElementById('ai-twin-avatar');
        
        if (chat.style.display === 'none') {
            chat.style.display = 'block';
            avatar.style.transform = 'scale(0.8)';
            this.isActive = true;
            
            // Focus input
            setTimeout(() => {
                document.getElementById('ai-twin-input').focus();
            }, 100);
        } else {
            chat.style.display = 'none';
            avatar.style.transform = 'scale(1)';
            this.isActive = false;
        }
    }
    
    // Send user message
    sendMessage() {
        const input = document.getElementById('ai-twin-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        input.value = '';
        
        // Process message and generate response
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response, 'ai');
        }, 1000);
    }
    
    // Add message to chat
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('ai-twin-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
        messageDiv.style.marginBottom = '1rem';
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div style="background: #667eea; color: white; padding: 1rem; border-radius: 12px; border-bottom-right-radius: 0; display: inline-block; max-width: 80%;">
                    <p style="margin: 0;">${text}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div style="background: #e0e7ff; padding: 1rem; border-radius: 12px; border-bottom-left-radius: 0; display: inline-block; max-width: 90%;">
                    <p style="margin: 0;">${text}</p>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save to conversation history
        this.conversationHistory.push({ sender, text, timestamp: new Date() });
    }
    
    // Generate AI response based on user input
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for specific keywords and respond accordingly
        if (lowerMessage.includes('erfahrung') || lowerMessage.includes('beruf')) {
            return this.getExperienceResponse();
        } else if (lowerMessage.includes('kompetenz') || lowerMessage.includes('fähigkeit') || lowerMessage.includes('skill')) {
            return this.getSkillsResponse();
        } else if (lowerMessage.includes('motivation') || lowerMessage.includes('warum')) {
            return this.getMotivationResponse();
        } else if (lowerMessage.includes('projekt') || lowerMessage.includes('erfolg')) {
            return this.getProjectsResponse();
        } else if (lowerMessage.includes('gehalt') || lowerMessage.includes('verdienst')) {
            return this.getSalaryResponse();
        } else if (lowerMessage.includes('verfügbar') || lowerMessage.includes('start')) {
            return this.getAvailabilityResponse();
        } else if (lowerMessage.includes('frage')) {
            return this.getQuestionsResponse();
        } else {
            return this.getGenericResponse(message);
        }
    }
    
    // Get experience response
    getExperienceResponse() {
        if (this.userProfile.experiences && this.userProfile.experiences.length > 0) {
            const latestExp = this.userProfile.experiences[0];
            return `In meiner aktuellen Position als ${latestExp.position} bei ${latestExp.company} konnte ich umfangreiche Erfahrungen in der ${latestExp.keywords.slice(0, 3).join(', ')} sammeln. Besonders stolz bin ich auf ${latestExp.achievements ? latestExp.achievements[0] : 'die erfolgreiche Umsetzung verschiedener Projekte'}. Insgesamt bringe ich ${this.calculateTotalExperience()} Jahre Berufserfahrung mit.`;
        }
        return 'Ich verfüge über langjährige Erfahrung in der HR-Beratung und Digitalisierung. Gerne erzähle ich Ihnen mehr über spezifische Projekte oder Herausforderungen, die ich gemeistert habe.';
    }
    
    // Get skills response
    getSkillsResponse() {
        if (this.userProfile.skills && this.userProfile.skills.length > 0) {
            const topSkills = this.userProfile.skills.slice(0, 5).join(', ');
            return `Meine Kernkompetenzen umfassen ${topSkills}. Darüber hinaus verfüge ich über ausgeprägte Fähigkeiten in der ${this.userProfile.competencyMap ? Object.keys(this.userProfile.competencyMap).join(', ') : 'Projektleitung und Teamführung'}. Welcher Bereich interessiert Sie besonders?`;
        }
        return 'Ich bringe ein breites Spektrum an Fähigkeiten mit, von technischen Kompetenzen bis hin zu ausgeprägten Soft Skills. Besonders stark bin ich in der Verbindung von HR-Expertise und digitalen Lösungen.';
    }
    
    // Get motivation response
    getMotivationResponse() {
        const company = this.applicationData?.company || 'Ihrem Unternehmen';
        const position = this.applicationData?.position || 'dieser Position';
        
        return `Meine Motivation für ${position} bei ${company} speist sich aus mehreren Quellen: Zum einen reizt mich die Herausforderung, ${this.applicationData?.jobDescription ? 'die in der Stellenbeschreibung genannten Aufgaben' : 'neue Aufgaben'} zu meistern. Zum anderen sehe ich hier die perfekte Möglichkeit, meine Expertise einzubringen und gleichzeitig weiterzuwachsen. Die Unternehmenskultur und die strategische Ausrichtung passen ideal zu meinen Werten und Zielen.`;
    }
    
    // Get projects response
    getProjectsResponse() {
        if (this.userProfile.experiences && this.userProfile.experiences[0]?.achievements) {
            const achievement = this.userProfile.experiences[0].achievements[0];
            return `Ein Projekt, auf das ich besonders stolz bin, ist ${achievement}. Dabei konnte ich nicht nur meine fachlichen Kompetenzen unter Beweis stellen, sondern auch meine Fähigkeit, Teams zu führen und komplexe Herausforderungen zu lösen. Möchten Sie mehr Details zu diesem oder anderen Projekten erfahren?`;
        }
        return 'In meiner Laufbahn habe ich zahlreiche erfolgreiche Projekte geleitet, von der Digitalisierung kompletter HR-Prozesse bis zur Einführung neuer Systeme. Ein Highlight war die Transformation der HR-Abteilung eines DAX-Unternehmens mit über 10.000 Mitarbeitern.';
    }
    
    // Get salary response
    getSalaryResponse() {
        return 'Bezüglich der Gehaltsvorstellungen bin ich offen für ein faires Angebot, das meiner Erfahrung und den Anforderungen der Position entspricht. Gerne bespreche ich dieses Thema in einem persönlichen Gespräch, wenn wir uns über die gegenseitigen Erwartungen ausgetauscht haben.';
    }
    
    // Get availability response
    getAvailabilityResponse() {
        const availableDate = new Date();
        availableDate.setMonth(availableDate.getMonth() + 1);
        
        return `Ich könnte die Position zum ${availableDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })} antreten. Bei besonderer Dringlichkeit bin ich gerne bereit, frühere Lösungen zu besprechen. Für Gespräche stehe ich Ihnen selbstverständlich kurzfristig zur Verfügung.`;
    }
    
    // Get questions response
    getQuestionsResponse() {
        return 'Natürlich habe ich auch einige Fragen an Sie: Wie sieht ein typischer Arbeitstag in dieser Position aus? Welche Herausforderungen erwarten mich in den ersten 100 Tagen? Und wie würden Sie die Teamkultur beschreiben? Ich freue mich auf einen offenen Austausch!';
    }
    
    // Get generic response
    getGenericResponse(message) {
        const responses = [
            'Das ist eine interessante Frage! Können Sie mir etwas mehr Kontext geben, damit ich Ihnen eine präzise Antwort geben kann?',
            'Gerne gehe ich darauf ein. Welcher spezifische Aspekt interessiert Sie dabei besonders?',
            'Vielen Dank für Ihre Frage. Ich möchte sicherstellen, dass ich Ihnen die relevantesten Informationen gebe - können Sie Ihre Frage etwas spezifizieren?',
            'Das ist ein wichtiger Punkt. Lassen Sie mich das aus meiner Perspektive beleuchten...'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Handle quick questions
    askQuestion(topic) {
        const questions = {
            'experience': 'Können Sie mir mehr über Ihre Berufserfahrung erzählen?',
            'skills': 'Welche Kernkompetenzen bringen Sie mit?',
            'motivation': 'Was motiviert Sie für diese Position?',
            'projects': 'Welche Projekte haben Sie erfolgreich umgesetzt?'
        };
        
        const question = questions[topic];
        if (question) {
            // Add user question
            this.addMessage(question, 'user');
            
            // Generate response
            setTimeout(() => {
                const response = this.generateResponse(question);
                this.addMessage(response, 'ai');
            }, 1000);
        }
    }
    
    // Calculate total years of experience
    calculateTotalExperience() {
        if (!this.userProfile.experiences) return '10+';
        
        let totalYears = 0;
        this.userProfile.experiences.forEach(exp => {
            if (exp.startYear && exp.endYear) {
                const end = exp.endYear === 'heute' ? new Date().getFullYear() : parseInt(exp.endYear);
                const start = parseInt(exp.startYear);
                totalYears += (end - start);
            }
        });
        
        return totalYears || '10+';
    }
}

// Initialize AI Twin when page loads
window.aiTwin = new AITwinPresenter();

// Function to add AI Twin to application page
window.addAITwinToPage = async function(applicationId) {
    // Initialize with application data
    const initialized = await window.aiTwin.initialize(applicationId);
    
    if (initialized) {
        // Create UI
        window.aiTwin.createAITwinUI();
        
        // Show welcome animation
        setTimeout(() => {
            const avatar = document.getElementById('ai-twin-avatar');
            if (avatar) {
                avatar.style.animation = 'bounce 1s ease';
            }
        }, 1000);
    }
};
