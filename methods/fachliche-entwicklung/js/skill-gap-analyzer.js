/**
 * Skill-Gap-Analyzer
 * KI-gestützte Analyse von Skill-Lücken basierend auf Zielen
 */

class SkillGapAnalyzer {
    constructor() {
        this.analyzedGaps = [];
    }

    analyzeGaps(currentSkills, targetSkills, careerGoals) {
        const gaps = [];
        
        // Einfache Text-Analyse (in Produktion würde man NLP verwenden)
        const currentSkillsList = this.extractSkills(currentSkills);
        const targetSkillsList = this.extractSkills(targetSkills);
        
        // Finde fehlende Skills
        targetSkillsList.forEach(targetSkill => {
            if (!this.hasSkill(currentSkillsList, targetSkill)) {
                gaps.push({
                    skill: targetSkill,
                    priority: this.calculatePriority(targetSkill, careerGoals),
                    category: this.categorizeSkill(targetSkill),
                    estimatedTime: this.estimateLearningTime(targetSkill)
                });
            }
        });
        
        // Sortiere nach Priorität
        gaps.sort((a, b) => b.priority - a.priority);
        
        this.analyzedGaps = gaps;
        return gaps;
    }

    extractSkills(text) {
        if (!text) return [];
        
        // Einfache Extraktion von Skills (kann durch NLP verbessert werden)
        const commonSkills = [
            'JavaScript', 'Python', 'Java', 'React', 'Vue', 'Angular',
            'Node.js', 'TypeScript', 'SQL', 'MongoDB', 'AWS', 'Docker',
            'Kubernetes', 'Git', 'CI/CD', 'Agile', 'Scrum', 'Leadership',
            'Communication', 'Problem Solving', 'Design Thinking'
        ];
        
        const foundSkills = [];
        const lowerText = text.toLowerCase();
        
        commonSkills.forEach(skill => {
            if (lowerText.includes(skill.toLowerCase())) {
                foundSkills.push(skill);
            }
        });
        
        return foundSkills;
    }

    hasSkill(skillsList, skill) {
        return skillsList.some(s => 
            s.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(s.toLowerCase())
        );
    }

    calculatePriority(skill, careerGoals) {
        if (!careerGoals) return 5;
        
        const goalsText = careerGoals.toLowerCase();
        const skillLower = skill.toLowerCase();
        
        // Höhere Priorität wenn Skill in Zielen erwähnt wird
        if (goalsText.includes(skillLower)) {
            return 10;
        }
        
        // Mittlere Priorität für kritische Skills
        const criticalSkills = ['leadership', 'communication', 'problem solving'];
        if (criticalSkills.some(cs => skillLower.includes(cs))) {
            return 7;
        }
        
        return 5;
    }

    categorizeSkill(skill) {
        const skillLower = skill.toLowerCase();
        
        if (['javascript', 'python', 'java', 'react', 'vue', 'angular', 'node', 'typescript'].some(s => skillLower.includes(s))) {
            return 'Frontend/Backend';
        }
        if (['sql', 'mongodb', 'database', 'data'].some(s => skillLower.includes(s))) {
            return 'Datenbanken';
        }
        if (['aws', 'azure', 'cloud', 'docker', 'kubernetes', 'devops'].some(s => skillLower.includes(s))) {
            return 'Cloud & DevOps';
        }
        if (['leadership', 'management', 'team', 'communication'].some(s => skillLower.includes(s))) {
            return 'Soft Skills';
        }
        
        return 'Allgemein';
    }

    estimateLearningTime(skill) {
        const skillLower = skill.toLowerCase();
        
        // Grobe Schätzungen basierend auf Skill-Komplexität
        if (['leadership', 'communication', 'problem solving'].some(s => skillLower.includes(s))) {
            return '3-6 Monate';
        }
        if (['react', 'vue', 'angular', 'node'].some(s => skillLower.includes(s))) {
            return '2-4 Monate';
        }
        if (['aws', 'docker', 'kubernetes'].some(s => skillLower.includes(s))) {
            return '1-3 Monate';
        }
        
        return '1-2 Monate';
    }

    getRecommendations(gaps) {
        const recommendations = [];
        
        gaps.slice(0, 5).forEach(gap => {
            recommendations.push({
                skill: gap.skill,
                category: gap.category,
                priority: gap.priority,
                time: gap.estimatedTime,
                resources: this.getResourcesForSkill(gap.skill)
            });
        });
        
        return recommendations;
    }

    getResourcesForSkill(skill) {
        const skillLower = skill.toLowerCase();
        
        // Ressourcen-Empfehlungen basierend auf Skill
        if (skillLower.includes('react')) {
            return [
                { type: 'course', name: 'React - The Complete Guide', platform: 'Udemy' },
                { type: 'book', name: 'Learning React', author: 'Alex Banks' },
                { type: 'practice', name: 'Build a Todo App', platform: 'Personal Project' }
            ];
        }
        
        if (skillLower.includes('aws')) {
            return [
                { type: 'course', name: 'AWS Certified Solutions Architect', platform: 'A Cloud Guru' },
                { type: 'practice', name: 'AWS Free Tier Projects', platform: 'AWS' }
            ];
        }
        
        return [
            { type: 'course', name: `${skill} Course`, platform: 'Coursera' },
            { type: 'practice', name: 'Hands-on Practice', platform: 'Personal Project' }
        ];
    }
}

