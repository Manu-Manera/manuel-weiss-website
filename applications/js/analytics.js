/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BEWERBUNGS-ANALYTICS
 * Track and visualize application statistics
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ApplicationAnalytics {
    constructor() {
        this.data = {
            applications: [],
            stats: {}
        };
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.render();
        console.log('📊 Analytics initialized');
    }
    
    async loadData() {
        try {
            // Load applications from cloud or localStorage
            let applications = [];
            
            if (window.cloudDataService) {
                applications = await window.cloudDataService.getApplications(true) || [];
            }
            
            if (!applications.length) {
                const stored = localStorage.getItem('applications') || 
                              localStorage.getItem('bewerbungen');
                applications = stored ? JSON.parse(stored) : [];
            }
            
            // Also load cover letters as potential applications
            let coverLetters = [];
            if (window.cloudDataService) {
                coverLetters = await window.cloudDataService.getCoverLetters(true) || [];
            } else {
                const stored = localStorage.getItem('cover_letter_drafts');
                coverLetters = stored ? JSON.parse(stored) : [];
            }
            
            this.data.applications = [...applications, ...coverLetters.map(cl => ({
                id: cl.id,
                company: cl.jobData?.companyName || 'Unbekannt',
                position: cl.jobData?.jobTitle || 'Position',
                status: cl.status || 'entwurf',
                createdAt: cl.createdAt,
                industry: cl.jobData?.industry || '',
                aiGenerated: !!cl.generatedContent
            }))];
            
            this.calculateStats();
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }
    
    calculateStats() {
        const apps = this.data.applications;
        
        // Basic counts
        const total = apps.length;
        const byStatus = {};
        const byIndustry = {};
        const byMonth = {};
        const responseTimeDays = [];
        
        apps.forEach(app => {
            // Status distribution
            const status = app.status || 'unbekannt';
            byStatus[status] = (byStatus[status] || 0) + 1;
            
            // Industry distribution
            const industry = app.industry || 'Sonstige';
            byIndustry[industry] = (byIndustry[industry] || 0) + 1;
            
            // Timeline by month
            if (app.createdAt) {
                const date = new Date(app.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
            }
            
            // Response time calculation
            if (app.createdAt && app.responseDate) {
                const created = new Date(app.createdAt);
                const responded = new Date(app.responseDate);
                const days = Math.round((responded - created) / (1000 * 60 * 60 * 24));
                if (days > 0 && days < 180) {
                    responseTimeDays.push(days);
                }
            }
        });
        
        // Calculate rates
        const sent = total - (byStatus['entwurf'] || 0);
        const responses = (byStatus['antwort'] || 0) + (byStatus['einladung'] || 0) + 
                         (byStatus['absage'] || 0) + (byStatus['zusage'] || 0);
        const interviews = (byStatus['einladung'] || 0) + (byStatus['zusage'] || 0);
        const offers = byStatus['zusage'] || 0;
        
        const responseRate = sent > 0 ? Math.round((responses / sent) * 100) : 0;
        const interviewRate = sent > 0 ? Math.round((interviews / sent) * 100) : 0;
        const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;
        
        // Average response time
        const avgResponseTime = responseTimeDays.length > 0 
            ? Math.round(responseTimeDays.reduce((a, b) => a + b, 0) / responseTimeDays.length)
            : null;
        
        // AI vs manual comparison
        const aiGenerated = apps.filter(a => a.aiGenerated).length;
        const aiSuccessRate = aiGenerated > 0 
            ? Math.round((apps.filter(a => a.aiGenerated && ['einladung', 'zusage'].includes(a.status)).length / aiGenerated) * 100)
            : 0;
        
        this.data.stats = {
            total,
            sent,
            responses,
            interviews,
            offers,
            responseRate,
            interviewRate,
            offerRate,
            avgResponseTime,
            byStatus,
            byIndustry,
            byMonth,
            aiGenerated,
            aiSuccessRate
        };
    }
    
    render() {
        const container = document.getElementById('analyticsContent');
        if (!container) return;
        
        const { stats } = this.data;
        
        container.innerHTML = `
            <!-- Overview Cards -->
            <div class="analytics-overview">
                <div class="stat-card primary">
                    <div class="stat-icon"><i class="fas fa-paper-plane"></i></div>
                    <div class="stat-content">
                        <span class="stat-value">${stats.total}</span>
                        <span class="stat-label">Bewerbungen gesamt</span>
                    </div>
                </div>
                <div class="stat-card success">
                    <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                    <div class="stat-content">
                        <span class="stat-value">${stats.responseRate}%</span>
                        <span class="stat-label">Antwortrate</span>
                    </div>
                </div>
                <div class="stat-card info">
                    <div class="stat-icon"><i class="fas fa-user-tie"></i></div>
                    <div class="stat-content">
                        <span class="stat-value">${stats.interviews}</span>
                        <span class="stat-label">Einladungen</span>
                    </div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-content">
                        <span class="stat-value">${stats.avgResponseTime || '-'}</span>
                        <span class="stat-label">Ø Antwortzeit (Tage)</span>
                    </div>
                </div>
            </div>

            <!-- Status Distribution -->
            <div class="analytics-section">
                <h3><i class="fas fa-chart-pie"></i> Status-Verteilung</h3>
                <div class="status-distribution">
                    ${this.renderStatusBars(stats.byStatus, stats.total)}
                </div>
            </div>

            <!-- Timeline Chart -->
            <div class="analytics-section">
                <h3><i class="fas fa-chart-line"></i> Bewerbungsverlauf</h3>
                <div class="timeline-chart" id="timelineChart">
                    ${this.renderTimelineChart(stats.byMonth)}
                </div>
            </div>

            <!-- Industry Distribution -->
            <div class="analytics-section">
                <h3><i class="fas fa-industry"></i> Branchen</h3>
                <div class="industry-list">
                    ${this.renderIndustryList(stats.byIndustry)}
                </div>
            </div>

            <!-- AI vs Manual -->
            <div class="analytics-section ai-comparison">
                <h3><i class="fas fa-robot"></i> KI vs. Manuell</h3>
                <div class="comparison-grid">
                    <div class="comparison-card">
                        <span class="comparison-value">${stats.aiGenerated}</span>
                        <span class="comparison-label">KI-generiert</span>
                    </div>
                    <div class="comparison-card">
                        <span class="comparison-value">${stats.total - stats.aiGenerated}</span>
                        <span class="comparison-label">Manuell erstellt</span>
                    </div>
                    <div class="comparison-card highlight">
                        <span class="comparison-value">${stats.aiSuccessRate}%</span>
                        <span class="comparison-label">KI-Erfolgsrate</span>
                    </div>
                </div>
            </div>

            <!-- Conversion Funnel -->
            <div class="analytics-section">
                <h3><i class="fas fa-filter"></i> Bewerbungs-Funnel</h3>
                <div class="funnel-chart">
                    ${this.renderFunnel(stats)}
                </div>
            </div>
        `;
    }
    
    renderStatusBars(byStatus, total) {
        const statusConfig = {
            'entwurf': { label: 'Entwurf', color: '#94a3b8' },
            'gesendet': { label: 'Gesendet', color: '#3b82f6' },
            'antwort': { label: 'Antwort erhalten', color: '#8b5cf6' },
            'einladung': { label: 'Einladung', color: '#10b981' },
            'absage': { label: 'Absage', color: '#ef4444' },
            'zusage': { label: 'Zusage', color: '#059669' },
            'unbekannt': { label: 'Unbekannt', color: '#cbd5e1' }
        };
        
        return Object.entries(byStatus)
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => {
                const config = statusConfig[status] || statusConfig['unbekannt'];
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
                return `
                    <div class="status-bar-item">
                        <div class="status-bar-header">
                            <span class="status-name">${config.label}</span>
                            <span class="status-count">${count} (${percentage}%)</span>
                        </div>
                        <div class="status-bar">
                            <div class="status-bar-fill" style="width: ${percentage}%; background: ${config.color}"></div>
                        </div>
                    </div>
                `;
            }).join('');
    }
    
    renderTimelineChart(byMonth) {
        const months = Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-12); // Last 12 months
        
        if (!months.length) {
            return '<p class="no-data">Noch keine Daten vorhanden</p>';
        }
        
        const maxCount = Math.max(...months.map(m => m[1]));
        
        return `
            <div class="chart-bars">
                ${months.map(([month, count]) => {
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    const [year, mon] = month.split('-');
                    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 
                                       'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
                    const label = monthNames[parseInt(mon) - 1];
                    
                    return `
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar" style="height: ${height}%">
                                <span class="chart-bar-value">${count}</span>
                            </div>
                            <span class="chart-bar-label">${label}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    renderIndustryList(byIndustry) {
        const total = Object.values(byIndustry).reduce((a, b) => a + b, 0);
        
        return Object.entries(byIndustry)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([industry, count]) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
                return `
                    <div class="industry-item">
                        <span class="industry-name">${industry}</span>
                        <div class="industry-bar-wrapper">
                            <div class="industry-bar" style="width: ${percentage}%"></div>
                        </div>
                        <span class="industry-count">${count}</span>
                    </div>
                `;
            }).join('') || '<p class="no-data">Keine Branchendaten</p>';
    }
    
    renderFunnel(stats) {
        const stages = [
            { name: 'Bewerbungen', count: stats.total, color: '#3b82f6' },
            { name: 'Gesendet', count: stats.sent, color: '#6366f1' },
            { name: 'Antworten', count: stats.responses, color: '#8b5cf6' },
            { name: 'Einladungen', count: stats.interviews, color: '#10b981' },
            { name: 'Zusagen', count: stats.offers, color: '#059669' }
        ];
        
        const maxCount = stages[0].count || 1;
        
        return stages.map((stage, index) => {
            const width = Math.max(20, (stage.count / maxCount) * 100);
            const conversion = index > 0 && stages[index - 1].count > 0
                ? Math.round((stage.count / stages[index - 1].count) * 100)
                : 100;
            
            return `
                <div class="funnel-stage">
                    <div class="funnel-bar" style="width: ${width}%; background: ${stage.color}">
                        <span class="funnel-count">${stage.count}</span>
                    </div>
                    <div class="funnel-info">
                        <span class="funnel-name">${stage.name}</span>
                        ${index > 0 ? `<span class="funnel-conversion">${conversion}%</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('analyticsContent')) {
        window.applicationAnalytics = new ApplicationAnalytics();
    }
});
