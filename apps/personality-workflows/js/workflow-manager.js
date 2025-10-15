/**
 * Personality Workflows Manager
 * Zentrale Verwaltung aller Workflow-Funktionen
 */

class PersonalityWorkflowManager {
    constructor() {
        this.workflows = {
            ikigai: {
                name: 'Ikigai',
                description: 'Finde deinen Lebenszweck',
                steps: 7,
                duration: '30-45 Min',
                icon: 'compass',
                color: '#667eea'
            },
            raisec: {
                name: 'RAISEC',
                description: 'Berufliche Interessen entdecken',
                steps: 6,
                duration: '25-35 Min',
                icon: 'briefcase',
                color: '#8b5cf6'
            },
            swot: {
                name: 'SWOT-Analyse',
                description: 'Stärken und Schwächen analysieren',
                steps: 5,
                duration: '20-30 Min',
                icon: 'chart-line',
                color: '#10b981'
            },
            'wheel-of-life': {
                name: 'Wheel of Life',
                description: 'Lebensbereiche bewerten',
                steps: 6,
                duration: '25-35 Min',
                icon: 'circle-notch',
                color: '#06b6d4'
            }
        };
        
        this.currentWorkflow = null;
        this.workflowHistory = [];
        
        this.init();
    }
    
    init() {
        this.loadWorkflowHistory();
        this.setupEventListeners();
        console.log('🎯 Personality Workflow Manager initialized');
    }
    
    setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('workflow-selector-modal');
            if (e.target === modal) {
                this.closeWorkflowSelector();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeWorkflowSelector();
            }
        });
    }
    
    startWorkflow(workflowType) {
        if (!this.workflows[workflowType]) {
            console.error(`Workflow ${workflowType} not found`);
            return;
        }
        
        this.currentWorkflow = workflowType;
        this.addToHistory(workflowType);
        
        // Close modal
        this.closeWorkflowSelector();
        
        // Start the appropriate workflow
        this.executeWorkflow(workflowType);
    }
    
    executeWorkflow(workflowType) {
        const workflowClasses = {
            'ikigai': 'IkigaiSmartWorkflow',
            'raisec': 'RAISECSmartWorkflow',
            'swot': 'SWOTSmartWorkflow',
            'wheel-of-life': 'WheelOfLifeSmartWorkflow'
        };
        
        const className = workflowClasses[workflowType];
        if (!className || !window[className]) {
            console.error(`Workflow class ${className} not found`);
            return;
        }
        
        // Close existing workflows
        this.closeAllWorkflows();
        
        // Create new workflow instance
        const workflowInstance = new window[className]();
        
        // Store reference
        window[`${workflowType}SmartWorkflow`] = workflowInstance;
        
        console.log(`🎯 Started ${workflowType} workflow`);
    }
    
    closeAllWorkflows() {
        const workflowIds = [
            'ikigai-smart-workflow',
            'raisec-smart-workflow',
            'swot-smart-workflow',
            'wheel-of-life-smart-workflow'
        ];
        
        workflowIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        });
    }
    
    addToHistory(workflowType) {
        const historyItem = {
            type: workflowType,
            timestamp: new Date().toISOString(),
            name: this.workflows[workflowType].name
        };
        
        this.workflowHistory.unshift(historyItem);
        
        // Keep only last 10 items
        this.workflowHistory = this.workflowHistory.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('personalityWorkflowHistory', JSON.stringify(this.workflowHistory));
        
        // Update UI
        this.updateRecentWorkflows();
    }
    
    loadWorkflowHistory() {
        const saved = localStorage.getItem('personalityWorkflowHistory');
        if (saved) {
            this.workflowHistory = JSON.parse(saved);
        }
    }
    
    updateRecentWorkflows() {
        const container = document.getElementById('recent-workflows-list');
        if (!container) return;
        
        if (this.workflowHistory.length === 0) {
            container.innerHTML = '<p class="no-recent">Noch keine Workflows durchgeführt</p>';
            return;
        }
        
        container.innerHTML = this.workflowHistory.map(workflow => `
            <div class="recent-workflow-item">
                <i class="fas fa-${this.workflows[workflow.type]?.icon || 'play'}"></i>
                <span>${workflow.name}</span>
                <small>${this.formatDate(workflow.timestamp)}</small>
                <button class="btn btn-sm" onclick="workflowManager.startWorkflow('${workflow.type}')">
                    Wiederholen
                </button>
            </div>
        `).join('');
    }
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Gerade eben';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `Vor ${minutes} Min`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `Vor ${hours} Std`;
        } else {
            const days = Math.floor(diff / 86400000);
            return `Vor ${days} Tag${days > 1 ? 'en' : ''}`;
        }
    }
    
    showWorkflowSelector() {
        const modal = document.getElementById('workflow-selector-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    closeWorkflowSelector() {
        const modal = document.getElementById('workflow-selector-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    showWorkflowDetails(workflowType) {
        const workflow = this.workflows[workflowType];
        if (!workflow) return;
        
        const details = `
            <div class="workflow-details">
                <h3>${workflow.name}</h3>
                <p>${workflow.description}</p>
                <div class="workflow-stats">
                    <div class="stat">
                        <i class="fas fa-clock"></i>
                        ${workflow.steps} Schritte
                    </div>
                    <div class="stat">
                        <i class="fas fa-clock"></i>
                        ${workflow.duration}
                    </div>
                </div>
                <div class="workflow-actions">
                    <button class="btn btn-primary" onclick="workflowManager.startWorkflow('${workflowType}')">
                        <i class="fas fa-play"></i>
                        Starten
                    </button>
                </div>
            </div>
        `;
        
        // Show in modal or alert for now
        alert(`Details für ${workflow.name}:\n\n${workflow.description}\n\n${workflow.steps} Schritte\n${workflow.duration}`);
    }
    
    getWorkflowStats() {
        const stats = {
            totalWorkflows: this.workflowHistory.length,
            mostUsed: this.getMostUsedWorkflow(),
            lastUsed: this.workflowHistory[0] || null
        };
        
        return stats;
    }
    
    getMostUsedWorkflow() {
        const counts = {};
        this.workflowHistory.forEach(workflow => {
            counts[workflow.type] = (counts[workflow.type] || 0) + 1;
        });
        
        const mostUsed = Object.entries(counts)
            .sort(([,a], [,b]) => b - a)[0];
        
        return mostUsed ? {
            type: mostUsed[0],
            count: mostUsed[1],
            name: this.workflows[mostUsed[0]].name
        } : null;
    }
    
    exportWorkflowData() {
        const data = {
            history: this.workflowHistory,
            stats: this.getWorkflowStats(),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `personality-workflows-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    clearWorkflowHistory() {
        if (confirm('Möchtest du wirklich den gesamten Workflow-Verlauf löschen?')) {
            this.workflowHistory = [];
            localStorage.removeItem('personalityWorkflowHistory');
            this.updateRecentWorkflows();
        }
    }
}

// Global functions for backward compatibility
function showWorkflowSelector() {
    if (window.workflowManager) {
        window.workflowManager.showWorkflowSelector();
    }
}

function closeWorkflowSelector() {
    if (window.workflowManager) {
        window.workflowManager.closeWorkflowSelector();
    }
}

function startWorkflow(workflowType) {
    if (window.workflowManager) {
        window.workflowManager.startWorkflow(workflowType);
    }
}

function showWorkflowDetails(workflowType) {
    if (window.workflowManager) {
        window.workflowManager.showWorkflowDetails(workflowType);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.workflowManager = new PersonalityWorkflowManager();
    
    // Update recent workflows display
    if (window.workflowManager) {
        window.workflowManager.updateRecentWorkflows();
    }
});

// Export for global access
window.PersonalityWorkflowManager = PersonalityWorkflowManager;
