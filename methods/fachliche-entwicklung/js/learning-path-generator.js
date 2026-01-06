/**
 * Learning Path Generator
 * Generiert individuelle Lernpfade basierend auf Skill-Gaps und Präferenzen
 */

class LearningPathGenerator {
    constructor() {
        this.learningPath = [];
    }

    generatePath(skillGaps, preferences) {
        const path = {
            phases: [],
            totalDuration: 0,
            milestones: []
        };
        
        // Gruppiere Skills nach Kategorien
        const categorizedGaps = this.categorizeGaps(skillGaps);
        
        // Erstelle Phasen basierend auf Priorität
        Object.keys(categorizedGaps).forEach((category, index) => {
            const phase = {
                phaseNumber: index + 1,
                category: category,
                skills: categorizedGaps[category],
                duration: this.calculatePhaseDuration(categorizedGaps[category]),
                resources: this.getResourcesForCategory(category, preferences)
            };
            
            path.phases.push(phase);
            path.totalDuration += phase.duration;
            
            // Erstelle Meilensteine
            path.milestones.push({
                phase: phase.phaseNumber,
                description: `${category} Skills erworben`,
                targetDate: this.calculateTargetDate(path.totalDuration)
            });
        });
        
        this.learningPath = path;
        return path;
    }

    categorizeGaps(skillGaps) {
        const categorized = {};
        
        skillGaps.forEach(gap => {
            const category = gap.category || 'Allgemein';
            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(gap);
        });
        
        return categorized;
    }

    calculatePhaseDuration(skills) {
        // Schätze Dauer basierend auf Anzahl und Komplexität der Skills
        let totalWeeks = 0;
        
        skills.forEach(skill => {
            const timeEstimate = skill.estimatedTime || '1-2 Monate';
            const weeks = this.parseTimeToWeeks(timeEstimate);
            totalWeeks += weeks;
        });
        
        // Berücksichtige Überlappung (Skills können parallel gelernt werden)
        return Math.ceil(totalWeeks * 0.7); // 30% Überlappung
    }

    parseTimeToWeeks(timeString) {
        // Konvertiere Zeit-Strings zu Wochen
        if (timeString.includes('Monat')) {
            const months = parseInt(timeString) || 2;
            return months * 4;
        }
        if (timeString.includes('Woche')) {
            return parseInt(timeString) || 2;
        }
        return 4; // Default: 4 Wochen
    }

    getResourcesForCategory(category, preferences) {
        const resources = [];
        
        // Basierend auf Präferenzen
        if (preferences && preferences.learningFormats) {
            if (preferences.learningFormats.includes('online-kurse')) {
                resources.push({
                    type: 'course',
                    name: `${category} Online Course`,
                    platform: 'Coursera',
                    duration: '4-8 Wochen'
                });
            }
            
            if (preferences.learningFormats.includes('buecher')) {
                resources.push({
                    type: 'book',
                    name: `${category} Best Practices Book`,
                    author: 'Industry Expert'
                });
            }
            
            if (preferences.learningFormats.includes('praktische-projekte')) {
                resources.push({
                    type: 'project',
                    name: `${category} Practice Project`,
                    description: 'Hands-on Projekt zur Anwendung'
                });
            }
        }
        
        return resources;
    }

    calculateTargetDate(weeksFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + (weeksFromNow * 7));
        return date.toLocaleDateString('de-DE');
    }

    getVisualization() {
        if (!this.learningPath || this.learningPath.phases.length === 0) {
            return null;
        }
        
        return {
            timeline: this.learningPath.phases.map((phase, index) => ({
                phase: phase.phaseNumber,
                startWeek: index === 0 ? 0 : this.learningPath.phases.slice(0, index).reduce((sum, p) => sum + p.duration, 0),
                duration: phase.duration,
                category: phase.category,
                skills: phase.skills.length
            })),
            totalWeeks: this.learningPath.totalDuration
        };
    }
}

