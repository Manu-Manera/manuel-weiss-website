/**
 * Progress Tracker
 * System zur Verfolgung des Lernfortschritts
 */

class ProgressTracker {
    constructor() {
        this.progressData = {
            skills: {},
            hours: 0,
            milestones: [],
            reflections: []
        };
    }

    trackSkill(skillName, level) {
        // Level: 1-10
        if (!this.progressData.skills[skillName]) {
            this.progressData.skills[skillName] = {
                startLevel: level,
                currentLevel: level,
                history: [],
                startDate: new Date().toISOString()
            };
        } else {
            this.progressData.skills[skillName].currentLevel = level;
            this.progressData.skills[skillName].history.push({
                level: level,
                date: new Date().toISOString()
            });
        }
        
        this.saveProgress();
    }

    addLearningHours(hours) {
        this.progressData.hours += hours;
        this.saveProgress();
    }

    addMilestone(milestone) {
        this.progressData.milestones.push({
            ...milestone,
            date: new Date().toISOString(),
            completed: false
        });
        this.saveProgress();
    }

    completeMilestone(milestoneId) {
        const milestone = this.progressData.milestones.find(m => m.id === milestoneId);
        if (milestone) {
            milestone.completed = true;
            milestone.completedDate = new Date().toISOString();
            this.saveProgress();
        }
    }

    addReflection(reflection) {
        this.progressData.reflections.push({
            ...reflection,
            date: new Date().toISOString()
        });
        this.saveProgress();
    }

    getProgressSummary() {
        const totalSkills = Object.keys(this.progressData.skills).length;
        const completedMilestones = this.progressData.milestones.filter(m => m.completed).length;
        const totalMilestones = this.progressData.milestones.length;
        
        return {
            totalSkills: totalSkills,
            averageLevel: this.calculateAverageLevel(),
            totalHours: this.progressData.hours,
            milestonesProgress: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
            lastReflection: this.progressData.reflections.length > 0 
                ? this.progressData.reflections[this.progressData.reflections.length - 1]
                : null
        };
    }

    calculateAverageLevel() {
        const skills = Object.values(this.progressData.skills);
        if (skills.length === 0) return 0;
        
        const totalLevel = skills.reduce((sum, skill) => sum + skill.currentLevel, 0);
        return Math.round((totalLevel / skills.length) * 10) / 10;
    }

    getSkillProgress(skillName) {
        return this.progressData.skills[skillName] || null;
    }

    getChartData() {
        const skills = Object.keys(this.progressData.skills);
        
        return {
            labels: skills,
            currentLevels: skills.map(skill => this.progressData.skills[skill].currentLevel),
            startLevels: skills.map(skill => this.progressData.skills[skill].startLevel),
            hoursOverTime: this.getHoursOverTime(),
            milestonesTimeline: this.getMilestonesTimeline()
        };
    }

    getHoursOverTime() {
        // Gruppiere Stunden nach Woche
        const weeks = {};
        // Vereinfachte Implementierung - in Produktion würde man echte Zeitdaten verwenden
        return {
            labels: ['Woche 1', 'Woche 2', 'Woche 3', 'Woche 4'],
            data: [5, 8, 10, 12] // Beispiel-Daten
        };
    }

    getMilestonesTimeline() {
        return this.progressData.milestones.map(m => ({
            id: m.id,
            title: m.title,
            date: m.date,
            completed: m.completed,
            completedDate: m.completedDate
        }));
    }

    saveProgress() {
        localStorage.setItem('fachlicheEntwicklungProgress', JSON.stringify(this.progressData));
    }

    loadProgress() {
        const saved = localStorage.getItem('fachlicheEntwicklungProgress');
        if (saved) {
            try {
                this.progressData = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading progress:', e);
            }
        }
    }
}

