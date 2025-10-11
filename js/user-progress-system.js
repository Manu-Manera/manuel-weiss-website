/**
 * User Progress Tracking System
 * Verfolgt den Fortschritt der Benutzer durch alle Workflows
 */

class UserProgressSystem {
    constructor() {
        this.progressData = {
            completedWorkflows: [],
            currentWorkflows: [],
            achievements: [],
            statistics: {
                totalTimeSpent: 0,
                workflowsCompleted: 0,
                lastActivity: null
            }
        };
        
        this.workflowTypes = {
            'values-clarification': {
                name: 'Werte-Klarstellung',
                icon: '🎯',
                estimatedTime: 15,
                steps: ['Fragen', 'Auswahl', 'Ranking']
            },
            'ikigai': {
                name: 'Ikigai',
                icon: '🎯',
                estimatedTime: 20,
                steps: ['Was du liebst', 'Was du gut kannst', 'Was die Welt braucht', 'Wofür du bezahlt werden könntest', 'Dein Ikigai']
            },
            'raisec': {
                name: 'RAISEC Assessment',
                icon: '🔍',
                estimatedTime: 10,
                steps: ['Fragen beantworten', 'Profil berechnen', 'Berufsempfehlungen']
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadProgressData();
        this.setupProgressTracking();
    }
    
    loadProgressData() {
        const saved = localStorage.getItem('userProgress');
        if (saved) {
            try {
                this.progressData = { ...this.progressData, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error loading progress data:', e);
            }
        }
    }
    
    saveProgressData() {
        localStorage.setItem('userProgress', JSON.stringify(this.progressData));
    }
    
    setupProgressTracking() {
        // Track workflow starts
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-workflow]')) {
                const workflowType = e.target.dataset.workflow;
                this.startWorkflow(workflowType);
            }
        });
        
        // Track workflow completions
        window.addEventListener('workflowCompleted', (e) => {
            this.completeWorkflow(e.detail.workflowType, e.detail.data);
        });
        
        // Track time spent
        this.startTimeTracking();
    }
    
    startWorkflow(workflowType) {
        if (!this.workflowTypes[workflowType]) return;
        
        const workflow = {
            type: workflowType,
            startTime: new Date().toISOString(),
            currentStep: 0,
            data: {}
        };
        
        // Remove any existing current workflow of this type
        this.progressData.currentWorkflows = this.progressData.currentWorkflows.filter(w => w.type !== workflowType);
        
        // Add new workflow
        this.progressData.currentWorkflows.push(workflow);
        
        this.saveProgressData();
        this.updateProgressDisplay();
        
        console.log(`🚀 Started workflow: ${workflowType}`);
    }
    
    completeWorkflow(workflowType, data) {
        const currentWorkflow = this.progressData.currentWorkflows.find(w => w.type === workflowType);
        if (!currentWorkflow) return;
        
        const completionTime = new Date().toISOString();
        const timeSpent = new Date(completionTime) - new Date(currentWorkflow.startTime);
        
        const completedWorkflow = {
            type: workflowType,
            startTime: currentWorkflow.startTime,
            completionTime: completionTime,
            timeSpent: timeSpent,
            data: data
        };
        
        // Move to completed workflows
        this.progressData.completedWorkflows.push(completedWorkflow);
        this.progressData.currentWorkflows = this.progressData.currentWorkflows.filter(w => w.type !== workflowType);
        
        // Update statistics
        this.progressData.statistics.workflowsCompleted++;
        this.progressData.statistics.totalTimeSpent += timeSpent;
        this.progressData.statistics.lastActivity = completionTime;
        
        // Check for achievements
        this.checkAchievements(workflowType);
        
        this.saveProgressData();
        this.updateProgressDisplay();
        
        console.log(`✅ Completed workflow: ${workflowType}`);
        
        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('workflowCompleted', {
            detail: { workflowType, data }
        }));
    }
    
    checkAchievements(workflowType) {
        const achievements = [];
        
        // First workflow completion
        if (this.progressData.completedWorkflows.length === 1) {
            achievements.push({
                id: 'first_workflow',
                title: 'Erster Schritt',
                description: 'Du hast deinen ersten Workflow abgeschlossen!',
                icon: '🎉',
                unlocked: true
            });
        }
        
        // All workflows completed
        const completedTypes = [...new Set(this.progressData.completedWorkflows.map(w => w.type))];
        if (completedTypes.length === Object.keys(this.workflowTypes).length) {
            achievements.push({
                id: 'all_workflows',
                title: 'Vollständige Selbsterkenntnis',
                description: 'Du hast alle verfügbaren Workflows abgeschlossen!',
                icon: '🏆',
                unlocked: true
            });
        }
        
        // Speed achievements
        const workflow = this.progressData.completedWorkflows.find(w => w.type === workflowType);
        if (workflow) {
            const estimatedTime = this.workflowTypes[workflowType].estimatedTime * 60000; // Convert to milliseconds
            if (workflow.timeSpent < estimatedTime * 0.5) {
                achievements.push({
                    id: `speed_${workflowType}`,
                    title: 'Blitzschnell',
                    description: `Du hast ${this.workflowTypes[workflowType].name} in Rekordzeit abgeschlossen!`,
                    icon: '⚡',
                    unlocked: true
                });
            }
        }
        
        // Add new achievements
        achievements.forEach(achievement => {
            if (!this.progressData.achievements.find(a => a.id === achievement.id)) {
                this.progressData.achievements.push(achievement);
            }
        });
    }
    
    startTimeTracking() {
        setInterval(() => {
            this.progressData.statistics.totalTimeSpent += 60000; // Add 1 minute
            this.saveProgressData();
        }, 60000);
    }
    
    updateProgressDisplay() {
        // Update progress indicators on the page
        this.updateWorkflowCards();
        this.updateProgressStats();
        this.updateAchievements();
    }
    
    updateWorkflowCards() {
        Object.keys(this.workflowTypes).forEach(workflowType => {
            const card = document.querySelector(`[data-workflow="${workflowType}"]`);
            if (!card) return;
            
            const isCompleted = this.progressData.completedWorkflows.some(w => w.type === workflowType);
            const isCurrent = this.progressData.currentWorkflows.some(w => w.type === workflowType);
            
            if (isCompleted) {
                card.classList.add('completed');
                card.querySelector('.workflow-status')?.textContent = 'Abgeschlossen';
            } else if (isCurrent) {
                card.classList.add('current');
                card.querySelector('.workflow-status')?.textContent = 'In Bearbeitung';
            } else {
                card.classList.remove('completed', 'current');
                card.querySelector('.workflow-status')?.textContent = 'Verfügbar';
            }
        });
    }
    
    updateProgressStats() {
        const statsContainer = document.getElementById('progressStats');
        if (!statsContainer) return;
        
        const totalTime = Math.round(this.progressData.statistics.totalTimeSpent / 60000); // Convert to minutes
        const completedCount = this.progressData.completedWorkflows.length;
        const currentCount = this.progressData.currentWorkflows.length;
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${completedCount}</div>
                    <div class="stat-label">Abgeschlossen</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔄</div>
                    <div class="stat-value">${currentCount}</div>
                    <div class="stat-label">In Bearbeitung</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value">${totalTime}min</div>
                    <div class="stat-label">Zeit investiert</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${this.progressData.achievements.length}</div>
                    <div class="stat-label">Erfolge</div>
                </div>
            </div>
        `;
    }
    
    updateAchievements() {
        const achievementsContainer = document.getElementById('achievementsContainer');
        if (!achievementsContainer) return;
        
        achievementsContainer.innerHTML = `
            <div class="achievements-grid">
                ${this.progressData.achievements.map(achievement => `
                    <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-content">
                            <h4>${achievement.title}</h4>
                            <p>${achievement.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getProgressSummary() {
        return {
            completed: this.progressData.completedWorkflows.length,
            current: this.progressData.currentWorkflows.length,
            total: Object.keys(this.workflowTypes).length,
            achievements: this.progressData.achievements.length,
            timeSpent: Math.round(this.progressData.statistics.totalTimeSpent / 60000)
        };
    }
    
    exportProgress() {
        const progressData = {
            ...this.progressData,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(progressData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    resetProgress() {
        if (confirm('Möchtest du wirklich deinen gesamten Fortschritt zurücksetzen?')) {
            this.progressData = {
                completedWorkflows: [],
                currentWorkflows: [],
                achievements: [],
                statistics: {
                    totalTimeSpent: 0,
                    workflowsCompleted: 0,
                    lastActivity: null
                }
            };
            this.saveProgressData();
            this.updateProgressDisplay();
        }
    }
}

// Initialize the progress system
let userProgressSystem;
document.addEventListener('DOMContentLoaded', () => {
    userProgressSystem = new UserProgressSystem();
    window.userProgressSystem = userProgressSystem;
});

// Make it globally available
window.UserProgressSystem = UserProgressSystem;
