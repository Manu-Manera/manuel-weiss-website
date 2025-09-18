// Persönlichkeitsentwicklung Chatbot - JavaScript Module

// Chatbot state
let conversationHistory = [];

// Chatbot Toggle Function
function toggleChatbot() {
    const chatbot = document.getElementById('aiCoachChatbot');
    const toggle = document.getElementById('aiCoachToggle');
    
    if (!chatbot || !toggle) return;
    
    if (chatbot.classList.contains('active')) {
        chatbot.classList.remove('active');
        toggle.classList.remove('hidden');
    } else {
        chatbot.classList.add('active');
        toggle.classList.add('hidden');
    }
}

window.toggleChatbot = toggleChatbot;

// Send Message Function
function sendMessage() {
    const input = document.getElementById('chatbotInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    input.value = '';
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI response with better logic
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateAIResponse(message);
        addMessage(response.text, 'coach', response.actions);
    }, 1500 + Math.random() * 1000); // Random delay for realism
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message coach-message typing-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Keyword-based responses
    if (message.includes('ziel') || message.includes('zielsetzung')) {
        return {
            text: 'Zielsetzung ist ein wichtiger Schritt in der Persönlichkeitsentwicklung! Ich kann dir dabei helfen, deine Ziele zu definieren und einen Plan zu erstellen.',
            actions: `
                <button class="quick-action-btn" onclick="startMethod('goal-setting')">
                    <i class="fas fa-bullseye"></i> Ziel-Setting Workflow starten
                </button>
                <button class="quick-action-btn" onclick="startMethod('ikigai')">
                    <i class="fas fa-compass"></i> Ikigai-Methode
                </button>
            `
        };
    }
    
    if (message.includes('stärk') || message.includes('talent')) {
        return {
            text: 'Deine Stärken zu kennen ist fundamental für deine Entwicklung! Lass uns deine Stärken identifizieren und nutzen.',
            actions: `
                <button class="quick-action-btn" onclick="startMethod('strengths-analysis')">
                    <i class="fas fa-star"></i> Stärken-Analyse
                </button>
                <button class="quick-action-btn" onclick="startMethod('gallup-strengths')">
                    <i class="fas fa-clipboard-list"></i> Gallup StrengthsFinder
                </button>
            `
        };
    }
    
    if (message.includes('wert') || message.includes('prinzip')) {
        return {
            text: 'Werte sind das Fundament deiner Entscheidungen. Lass uns deine wichtigsten Werte identifizieren.',
            actions: `
                <button class="quick-action-btn" onclick="startMethod('values-clarification')">
                    <i class="fas fa-heart"></i> Werte-Klärung
                </button>
                <button class="quick-action-btn" onclick="startMethod('five-pillars')">
                    <i class="fas fa-pillar"></i> Fünf Säulen der Identität
                </button>
            `
        };
    }
    
    if (message.includes('stress') || message.includes('entspann')) {
        return {
            text: 'Stress-Management ist essentiell für dein Wohlbefinden. Hier sind einige Methoden, die dir helfen können.',
            actions: `
                <button class="quick-action-btn" onclick="startMethod('mindfulness')">
                    <i class="fas fa-leaf"></i> Achtsamkeit & Meditation
                </button>
                <button class="quick-action-btn" onclick="startMethod('emotional-intelligence')">
                    <i class="fas fa-brain"></i> Emotionale Intelligenz
                </button>
            `
        };
    }
    
    if (message.includes('kommunikation') || message.includes('gespräch')) {
        return {
            text: 'Kommunikation ist eine Schlüsselkompetenz! Lass uns deine Kommunikationsfähigkeiten verbessern.',
            actions: `
                <button class="quick-action-btn" onclick="startMethod('communication')">
                    <i class="fas fa-comments"></i> Kommunikations-Training
                </button>
                <button class="quick-action-btn" onclick="startMethod('nonviolent-communication')">
                    <i class="fas fa-handshake"></i> Gewaltfreie Kommunikation
                </button>
            `
        };
    }
    
    if (message.includes('zeit') || message.includes('organis')) {
        return {
            text: 'Zeitmanagement ist der Schlüssel zu mehr Produktivität und weniger Stress. Lass uns deine Zeit optimieren!',
            actions: `
                <button class="quick-action-btn" onclick="startMethod('time-management')">
                    <i class="fas fa-clock"></i> Zeitmanagement
                </button>
                <button class="quick-action-btn" onclick="startMethod('habit-building')">
                    <i class="fas fa-repeat"></i> Gewohnheiten aufbauen
                </button>
            `
        };
    }
    
    // Default response
    return {
        text: 'Das ist ein interessantes Thema! Ich kann dir verschiedene Methoden der Persönlichkeitsentwicklung vorschlagen. Was möchtest du als nächstes erkunden?',
        actions: `
            <button class="quick-action-btn" onclick="startAssessment()">
                <i class="fas fa-clipboard-list"></i> Assessment starten
            </button>
            <button class="quick-action-btn" onclick="exploreMethods()">
                <i class="fas fa-compass"></i> Methoden erkunden
            </button>
            <button class="quick-action-btn" onclick="personalizedWorkflow()">
                <i class="fas fa-route"></i> Personalisierten Workflow
            </button>
        `
    };
}

// CRITICAL: Make sendMessage globally available immediately
window.sendMessage = sendMessage;
window.showTypingIndicator = showTypingIndicator;
window.hideTypingIndicator = hideTypingIndicator;
window.generateAIResponse = generateAIResponse;

// Add Message Function
function addMessage(content, sender, actions = null) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (typeof content === 'string') {
        messageContent.innerHTML = `<p>${content}</p>`;
    } else {
        messageContent.innerHTML = content;
    }
    
    if (actions) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'quick-actions';
        actionsDiv.innerHTML = actions;
        messageContent.appendChild(actionsDiv);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store in conversation history
    conversationHistory.push({
        sender: sender,
        content: content,
        timestamp: new Date().toISOString()
    });
}

// Chatbot Helper Functions
function startAssessment() {
    addMessage('Welches Assessment möchtest du starten? Ich kann dir verschiedene Tests vorschlagen.', 'coach', `
        <button class="quick-action-btn" onclick="runAssessment('strengths')"><i class="fas fa-star"></i> Stärken-Assessment</button>
        <button class="quick-action-btn" onclick="runAssessment('values')"><i class="fas fa-heart"></i> Werte-Assessment</button>
        <button class="quick-action-btn" onclick="runAssessment('goals')"><i class="fas fa-bullseye"></i> Ziele-Assessment</button>
    `);
}

function exploreMethods() {
    addMessage('Hier sind die beliebtesten Methoden der Persönlichkeitsentwicklung:', 'coach', `
        <button class="quick-action-btn" onclick="startMethod('ikigai')"><i class="fas fa-compass"></i> Ikigai</button>
        <button class="quick-action-btn" onclick="startMethod('values-clarification')"><i class="fas fa-heart"></i> Werte-Klärung</button>
        <button class="quick-action-btn" onclick="startMethod('strengths-analysis')"><i class="fas fa-star"></i> Stärken-Analyse</button>
        <button class="quick-action-btn" onclick="startMethod('goal-setting')"><i class="fas fa-bullseye"></i> Ziel-Setting</button>
        <button class="quick-action-btn" onclick="startMethod('mindfulness')"><i class="fas fa-leaf"></i> Achtsamkeit</button>
    `);
}

function personalizedWorkflow() {
    addMessage('Lass uns einen personalisierten Workflow für dich erstellen. Erzähle mir von deinen aktuellen Zielen und Herausforderungen.', 'coach');
}

function clearChat() {
    const messagesContainer = document.getElementById('chatbotMessages');
    messagesContainer.innerHTML = `
        <div class="message coach-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Chat wurde geleert. Wie kann ich dir heute helfen?</p>
                <div class="quick-actions">
                    <button class="quick-action-btn" onclick="startAssessment()">
                        <i class="fas fa-clipboard-list"></i> Assessment starten
                    </button>
                    <button class="quick-action-btn" onclick="exploreMethods()">
                        <i class="fas fa-compass"></i> Methoden erkunden
                    </button>
                    <button class="quick-action-btn" onclick="personalizedWorkflow()">
                        <i class="fas fa-route"></i> Personalisierten Workflow
                    </button>
                </div>
            </div>
        </div>
    `;
    conversationHistory = [];
}

function exportChat() {
    const chatData = {
        timestamp: new Date().toISOString(),
        conversation: conversationHistory,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Assessment Functions
async function runAssessment(type) {
    try {
        const result = await aiCoach.runAssessment(type);
        
        if (result.completed) {
            addMessage(result.response, 'coach', generateAdvancedActions(result.actions));
        } else {
            addMessage(result.response, 'coach', `
                <button class="quick-action-btn" onclick="answerAssessmentQuestion('${type}', ${result.questionNumber})">
                    <i class="fas fa-reply"></i> Antworten
                </button>
                <button class="quick-action-btn" onclick="skipAssessment('${type}')">
                    <i class="fas fa-forward"></i> Überspringen
                </button>
            `);
        }
    } catch (error) {
        console.error('Error running assessment:', error);
        addMessage('Entschuldigung, beim Assessment ist ein Fehler aufgetreten. Bitte versuche es erneut.', 'coach');
    }
}

async function answerAssessmentQuestion(type, questionNumber) {
    const input = document.getElementById('chatbotInput');
    const answer = input.value.trim();
    
    if (!answer) {
        addMessage('Bitte gib eine Antwort ein, bevor du fortfährst.', 'coach');
        return;
    }
    
    // Store answer in user profile
    if (!userProfile.assessments[type]) {
        userProfile.assessments[type] = { answers: [] };
    }
    userProfile.assessments[type].answers[questionNumber - 1] = answer;
    
    // Clear input
    input.value = '';
    
    // Continue with next question
    await runAssessment(type);
}

function skipAssessment(type) {
    addMessage('Assessment übersprungen. Möchtest du ein anderes Assessment versuchen oder eine andere Methode erkunden?', 'coach', `
        <button class="quick-action-btn" onclick="startAssessment()"><i class="fas fa-clipboard-list"></i> Anderes Assessment</button>
        <button class="quick-action-btn" onclick="exploreMethods()"><i class="fas fa-compass"></i> Methoden erkunden</button>
    `);
}

// CRITICAL: Make all chatbot functions globally available
window.clearChat = clearChat;
window.startAssessment = startAssessment;
window.exploreMethods = exploreMethods;
window.personalizedWorkflow = personalizedWorkflow;
window.exportChat = exportChat;
window.addMessage = addMessage;
window.runAssessment = runAssessment;
window.answerAssessmentQuestion = answerAssessmentQuestion;
window.skipAssessment = skipAssessment;

// Add event listeners for chatbot buttons
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - Setting up chatbot event listeners');
    
    // Add event listeners for chatbot buttons
    const sendButton = document.querySelector('.send-button');
    if (sendButton) {
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Send button clicked');
            sendMessage();
        });
    }
    
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Chatbot toggle clicked');
            toggleChatbot();
        });
    }
    
    const aiCoachToggle = document.getElementById('aiCoachToggle');
    if (aiCoachToggle) {
        aiCoachToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('AI Coach toggle clicked');
            toggleChatbot();
        });
    }
});

// Ensure chatbot functions are available after all scripts load
window.addEventListener('load', function() {
    // Re-ensure chatbot functions are available
    if (typeof window.sendMessage !== 'function') {
        window.sendMessage = sendMessage;
        console.log('sendMessage function restored');
    }
    if (typeof window.toggleChatbot !== 'function') {
        window.toggleChatbot = toggleChatbot;
        console.log('toggleChatbot function restored');
    }
});
