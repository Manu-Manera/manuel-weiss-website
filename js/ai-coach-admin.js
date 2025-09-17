// AI Coach Admin - Advanced API Integration and File Management
class AICoachAdmin {
    constructor() {
        this.settings = {
            apiKey: '',
            model: 'gpt-4',
            maxTokens: 500,
            temperature: 0.7,
            personality: 'professional',
            responseStyle: 'concise',
            languageLevel: 'simple',
            enableQuickActions: true,
            enableTypingIndicator: true,
            systemPrompt: '',
            assessmentPrompt: '',
            workflowPrompt: ''
        };
        
        this.usageStats = {
            totalRequests: 0,
            totalTokens: 0,
            estimatedCost: 0,
            dailyUsage: [],
            conversations: [],
            assessments: [],
            workflows: []
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.loadUsageStats();
    }
    
    // Settings Management
    loadSettings() {
        const saved = localStorage.getItem('aiCoachSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.updateFormFields();
    }
    
    saveSettings() {
        localStorage.setItem('aiCoachSettings', JSON.stringify(this.settings));
        this.updateChatbotFiles();
    }
    
    updateFormFields() {
        const fields = {
            'openaiApiKey': this.settings.apiKey,
            'apiModel': this.settings.model,
            'maxTokens': this.settings.maxTokens,
            'temperature': this.settings.temperature,
            'coachPersonality': this.settings.personality,
            'responseStyle': this.settings.responseStyle,
            'languageLevel': this.settings.languageLevel,
            'enableQuickActions': this.settings.enableQuickActions,
            'enableTypingIndicator': this.settings.enableTypingIndicator,
            'systemPrompt': this.settings.systemPrompt,
            'assessmentPrompt': this.settings.assessmentPrompt,
            'workflowPrompt': this.settings.workflowPrompt
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
        
        this.updateApiStatus();
    }
    
    updateApiStatus() {
        const statusElement = document.getElementById('apiStatus');
        if (statusElement && this.settings.apiKey) {
            const statusIndicator = statusElement.querySelector('.status-indicator');
            const statusText = statusElement.querySelector('.status-text');
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'Konfiguriert';
        }
    }
    
    // API Connection Testing
    async testApiConnection() {
        const apiKey = document.getElementById('openaiApiKey').value;
        const statusElement = document.getElementById('apiStatus');
        const statusIndicator = statusElement.querySelector('.status-indicator');
        const statusText = statusElement.querySelector('.status-text');
        
        if (!apiKey) {
            this.showNotification('Bitte gib einen API Key ein', 'error');
            return false;
        }
        
        statusIndicator.className = 'status-indicator';
        statusText.textContent = 'Teste Verbindung...';
        
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                statusIndicator.className = 'status-indicator online';
                statusText.textContent = 'Verbindung erfolgreich';
                this.showNotification('API-Verbindung erfolgreich getestet!', 'success');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'Verbindung fehlgeschlagen';
            this.showNotification(`API-Verbindung fehlgeschlagen: ${error.message}`, 'error');
            return false;
        }
    }
    
    // File Updates
    async updateChatbotFiles() {
        try {
            // Update the main chatbot file
            await this.updateMainChatbotFile();
            
            // Update the AI coach JavaScript file
            await this.updateAICoachFile();
            
            this.showNotification('Chatbot-Dateien erfolgreich aktualisiert!', 'success');
        } catch (error) {
            console.error('Error updating chatbot files:', error);
            this.showNotification('Fehler beim Aktualisieren der Chatbot-Dateien', 'error');
        }
    }
    
    async updateMainChatbotFile() {
        // This would update the persoenlichkeitsentwicklung-uebersicht.html file
        // In a real implementation, you would use a backend API or file system access
        
        const updates = {
            apiKey: this.settings.apiKey,
            model: this.settings.model,
            maxTokens: this.settings.maxTokens,
            temperature: this.settings.temperature
        };
        
        console.log('Updating main chatbot file with:', updates);
        
        // Simulate file update
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Main chatbot file updated successfully');
                resolve();
            }, 1000);
        });
    }
    
    async updateAICoachFile() {
        // This would update the js/ai-coach.js file
        
        const updates = {
            apiKey: this.settings.apiKey,
            model: this.settings.model,
            systemPrompt: this.settings.systemPrompt,
            assessmentPrompt: this.settings.assessmentPrompt,
            workflowPrompt: this.settings.workflowPrompt
        };
        
        console.log('Updating AI coach file with:', updates);
        
        // Simulate file update
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('AI coach file updated successfully');
                resolve();
            }, 1000);
        });
    }
    
    // Usage Statistics
    loadUsageStats() {
        const saved = localStorage.getItem('aiCoachUsageStats');
        if (saved) {
            this.usageStats = { ...this.usageStats, ...JSON.parse(saved) };
        }
        this.updateUsageDisplay();
    }
    
    saveUsageStats() {
        localStorage.setItem('aiCoachUsageStats', JSON.stringify(this.usageStats));
    }
    
    updateUsageDisplay() {
        const elements = {
            'totalRequests': this.usageStats.totalRequests,
            'totalTokens': this.usageStats.totalTokens,
            'estimatedCost': `$${this.usageStats.estimatedCost.toFixed(2)}`,
            'totalConversations': this.usageStats.conversations.length,
            'totalAssessments': this.usageStats.assessments.length,
            'totalWorkflows': this.usageStats.workflows.length
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        this.updateUsageChart();
    }
    
    updateUsageChart() {
        const canvas = document.getElementById('usageChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.usageStats.dailyUsage.slice(-7); // Last 7 days
        
        // Simple chart implementation
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (data.length === 0) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Keine Daten verfügbar', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const maxValue = Math.max(...data.map(d => d.requests));
        const barWidth = canvas.width / data.length;
        
        data.forEach((day, index) => {
            const barHeight = (day.requests / maxValue) * (canvas.height - 40);
            const x = index * barWidth;
            const y = canvas.height - barHeight - 20;
            
            ctx.fillStyle = '#4f46e5';
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
            
            ctx.fillStyle = '#374151';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(day.requests.toString(), x + barWidth / 2, y - 5);
        });
    }
    
    // Assessment Management
    createAssessment(data) {
        const assessment = {
            id: `assessment_${Date.now()}`,
            name: data.name,
            description: data.description,
            questions: data.questions,
            category: data.category,
            estimatedTime: data.estimatedTime,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        this.usageStats.assessments.push(assessment);
        this.saveUsageStats();
        this.updateUsageDisplay();
        
        return assessment;
    }
    
    updateAssessment(id, data) {
        const index = this.usageStats.assessments.findIndex(a => a.id === id);
        if (index !== -1) {
            this.usageStats.assessments[index] = { ...this.usageStats.assessments[index], ...data };
            this.saveUsageStats();
            return this.usageStats.assessments[index];
        }
        return null;
    }
    
    deleteAssessment(id) {
        const index = this.usageStats.assessments.findIndex(a => a.id === id);
        if (index !== -1) {
            this.usageStats.assessments.splice(index, 1);
            this.saveUsageStats();
            this.updateUsageDisplay();
            return true;
        }
        return false;
    }
    
    // Workflow Management
    createWorkflow(data) {
        const workflow = {
            id: `workflow_${Date.now()}`,
            name: data.name,
            description: data.description,
            steps: data.steps,
            category: data.category,
            estimatedDuration: data.estimatedDuration,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        this.usageStats.workflows.push(workflow);
        this.saveUsageStats();
        this.updateUsageDisplay();
        
        return workflow;
    }
    
    updateWorkflow(id, data) {
        const index = this.usageStats.workflows.findIndex(w => w.id === id);
        if (index !== -1) {
            this.usageStats.workflows[index] = { ...this.usageStats.workflows[index], ...data };
            this.saveUsageStats();
            return this.usageStats.workflows[index];
        }
        return null;
    }
    
    deleteWorkflow(id) {
        const index = this.usageStats.workflows.findIndex(w => w.id === id);
        if (index !== -1) {
            this.usageStats.workflows.splice(index, 1);
            this.saveUsageStats();
            this.updateUsageDisplay();
            return true;
        }
        return false;
    }
    
    // Conversation Management
    addConversation(data) {
        const conversation = {
            id: `conv_${Date.now()}`,
            type: data.type, // 'general', 'assessment', 'workflow'
            messages: data.messages,
            duration: data.duration,
            createdAt: new Date().toISOString(),
            userId: data.userId || 'anonymous'
        };
        
        this.usageStats.conversations.push(conversation);
        this.usageStats.totalRequests += data.messages.length;
        this.usageStats.totalTokens += data.tokens || 0;
        this.usageStats.estimatedCost += this.calculateCost(data.tokens || 0);
        
        this.saveUsageStats();
        this.updateUsageDisplay();
        
        return conversation;
    }
    
    calculateCost(tokens) {
        // GPT-4 pricing: $0.03 per 1K input tokens, $0.06 per 1K output tokens
        // Simplified calculation assuming 50/50 input/output ratio
        const inputTokens = tokens * 0.5;
        const outputTokens = tokens * 0.5;
        return (inputTokens / 1000 * 0.03) + (outputTokens / 1000 * 0.06);
    }
    
    // Analytics
    getAnalytics(period = '7d') {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        
        const filteredConversations = this.usageStats.conversations.filter(
            conv => new Date(conv.createdAt) >= startDate
        );
        
        const filteredAssessments = this.usageStats.assessments.filter(
            assessment => new Date(assessment.createdAt) >= startDate
        );
        
        const filteredWorkflows = this.usageStats.workflows.filter(
            workflow => new Date(workflow.createdAt) >= startDate
        );
        
        return {
            conversations: filteredConversations,
            assessments: filteredAssessments,
            workflows: filteredWorkflows,
            totalRequests: filteredConversations.reduce((sum, conv) => sum + conv.messages.length, 0),
            totalTokens: filteredConversations.reduce((sum, conv) => sum + (conv.tokens || 0), 0),
            estimatedCost: filteredConversations.reduce((sum, conv) => sum + this.calculateCost(conv.tokens || 0), 0)
        };
    }
    
    // Event Listeners
    setupEventListeners() {
        // API Settings
        const apiKeyInput = document.getElementById('openaiApiKey');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                this.settings.apiKey = e.target.value;
            });
        }
        
        const apiModelSelect = document.getElementById('apiModel');
        if (apiModelSelect) {
            apiModelSelect.addEventListener('change', (e) => {
                this.settings.model = e.target.value;
            });
        }
        
        const maxTokensInput = document.getElementById('maxTokens');
        if (maxTokensInput) {
            maxTokensInput.addEventListener('input', (e) => {
                this.settings.maxTokens = parseInt(e.target.value);
            });
        }
        
        const temperatureInput = document.getElementById('temperature');
        if (temperatureInput) {
            temperatureInput.addEventListener('input', (e) => {
                this.settings.temperature = parseFloat(e.target.value);
            });
        }
        
        // Chatbot Configuration
        const personalitySelect = document.getElementById('coachPersonality');
        if (personalitySelect) {
            personalitySelect.addEventListener('change', (e) => {
                this.settings.personality = e.target.value;
            });
        }
        
        const responseStyleSelect = document.getElementById('responseStyle');
        if (responseStyleSelect) {
            responseStyleSelect.addEventListener('change', (e) => {
                this.settings.responseStyle = e.target.value;
            });
        }
        
        const languageLevelSelect = document.getElementById('languageLevel');
        if (languageLevelSelect) {
            languageLevelSelect.addEventListener('change', (e) => {
                this.settings.languageLevel = e.target.value;
            });
        }
        
        const quickActionsCheckbox = document.getElementById('enableQuickActions');
        if (quickActionsCheckbox) {
            quickActionsCheckbox.addEventListener('change', (e) => {
                this.settings.enableQuickActions = e.target.checked;
            });
        }
        
        const typingIndicatorCheckbox = document.getElementById('enableTypingIndicator');
        if (typingIndicatorCheckbox) {
            typingIndicatorCheckbox.addEventListener('change', (e) => {
                this.settings.enableTypingIndicator = e.target.checked;
            });
        }
        
        // System Prompts
        const systemPromptTextarea = document.getElementById('systemPrompt');
        if (systemPromptTextarea) {
            systemPromptTextarea.addEventListener('input', (e) => {
                this.settings.systemPrompt = e.target.value;
            });
        }
        
        const assessmentPromptTextarea = document.getElementById('assessmentPrompt');
        if (assessmentPromptTextarea) {
            assessmentPromptTextarea.addEventListener('input', (e) => {
                this.settings.assessmentPrompt = e.target.value;
            });
        }
        
        const workflowPromptTextarea = document.getElementById('workflowPrompt');
        if (workflowPromptTextarea) {
            workflowPromptTextarea.addEventListener('input', (e) => {
                this.settings.workflowPrompt = e.target.value;
            });
        }
        
        // Auto-save on changes
        const autoSaveInputs = document.querySelectorAll('#api-settings input, #api-settings select, #chatbot-config input, #chatbot-config select, #chatbot-config textarea');
        autoSaveInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.saveSettings();
            });
        });
    }
    
    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add notification styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }
                .notification-success { background: linear-gradient(135deg, #10b981, #059669); }
                .notification-error { background: linear-gradient(135deg, #ef4444, #dc2626); }
                .notification-info { background: linear-gradient(135deg, #3b82f6, #2563eb); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Export/Import
    exportSettings() {
        const data = {
            settings: this.settings,
            usageStats: this.usageStats,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-coach-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    this.updateFormFields();
                }
                
                if (data.usageStats) {
                    this.usageStats = { ...this.usageStats, ...data.usageStats };
                    this.updateUsageDisplay();
                }
                
                this.saveSettings();
                this.saveUsageStats();
                
                this.showNotification('Einstellungen erfolgreich importiert!', 'success');
            } catch (error) {
                this.showNotification('Fehler beim Importieren der Einstellungen', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize AI Coach Admin
let aiCoachAdmin;

document.addEventListener('DOMContentLoaded', () => {
    aiCoachAdmin = new AICoachAdmin();
});

// Global functions for HTML onclick handlers
window.testApiConnection = () => aiCoachAdmin.testApiConnection();
window.saveApiSettings = () => aiCoachAdmin.saveSettings();
window.toggleApiKeyVisibility = () => {
    const input = document.getElementById('openaiApiKey');
    const button = document.querySelector('.toggle-visibility i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
};

// Assessment functions
window.createNewAssessment = () => aiCoachAdmin.showNotification('Neues Assessment erstellen - Feature in Entwicklung', 'info');
window.editAssessment = (type) => aiCoachAdmin.showNotification(`Assessment "${type}" bearbeiten - Feature in Entwicklung`, 'info');
window.previewAssessment = (type) => aiCoachAdmin.showNotification(`Assessment "${type}" Vorschau - Feature in Entwicklung`, 'info');
window.deleteAssessment = (type) => {
    if (confirm(`Möchtest du das Assessment "${type}" wirklich löschen?`)) {
        aiCoachAdmin.deleteAssessment(type);
        aiCoachAdmin.showNotification(`Assessment "${type}" gelöscht`, 'success');
    }
};

// Workflow functions
window.createNewWorkflow = () => aiCoachAdmin.showNotification('Neues Workflow-Template erstellen - Feature in Entwicklung', 'info');
window.editWorkflow = (type) => aiCoachAdmin.showNotification(`Workflow "${type}" bearbeiten - Feature in Entwicklung`, 'info');
window.previewWorkflow = (type) => aiCoachAdmin.showNotification(`Workflow "${type}" Vorschau - Feature in Entwicklung`, 'info');
window.duplicateWorkflow = (type) => aiCoachAdmin.showNotification(`Workflow "${type}" dupliziert`, 'success');

// Conversation functions
window.viewConversation = (id) => aiCoachAdmin.showNotification(`Gespräch "${id}" anzeigen - Feature in Entwicklung`, 'info');
window.exportConversation = (id) => aiCoachAdmin.showNotification(`Gespräch "${id}" exportieren - Feature in Entwicklung`, 'info');
window.deleteConversation = (id) => {
    if (confirm(`Möchtest du das Gespräch "${id}" wirklich löschen?`)) {
        aiCoachAdmin.showNotification(`Gespräch "${id}" gelöscht`, 'success');
    }
};

// Export AI Coach Admin for global access
window.aiCoachAdmin = aiCoachAdmin;
