/**
 * HR COACH FRAMEWORK - Hauptlogik
 * 10 HR-Kernbereiche mit Yoga-Teppich Übersicht und Fortschrittsanzeige
 */

const HR_FRAMEWORK_AREAS = [
    { id: 'analytics', title: 'Analytics & Reporting', description: 'KPIs, Dashboards, Predictive Analytics und datengetriebene Entscheidungen', icon: 'fa-chart-line', iconClass: 'icon-analytics', color: '#6366f1', workflowPage: 'hr-coach-analytics-workflow.html', criteria: 8 },
    { id: 'strategie', title: 'Strategie & Kultur', description: 'Kulturanalyse, Werte-Alignment, strategische HR-Planung', icon: 'fa-chess', iconClass: 'icon-strategie', color: '#ec4899', workflowPage: 'hr-coach-strategie-workflow.html', criteria: 8 },
    { id: 'recruiting', title: 'Recruiting & Employer Branding', description: 'Talentgewinnung, Candidate Journey, Arbeitgebermarke', icon: 'fa-user-plus', iconClass: 'icon-recruiting', color: '#06b6d4', workflowPage: 'hr-coach-recruiting-workflow.html', criteria: 8 },
    { id: 'onboarding', title: 'Onboarding & Offboarding', description: 'Pre-/Onboarding, Exit-Management, Employee Lifecycle', icon: 'fa-door-open', iconClass: 'icon-onboarding', color: '#10b981', workflowPage: 'hr-coach-onboarding-workflow.html', criteria: 8 },
    { id: 'admin', title: 'HR Administration', description: 'Prozessoptimierung, Self-Service, Digitalisierung', icon: 'fa-cogs', iconClass: 'icon-admin', color: '#f59e0b', workflowPage: 'hr-coach-admin-workflow.html', criteria: 8 },
    { id: 'performance', title: 'Performance Management', description: 'Feedback-Kultur, OKRs, Zielvereinbarungen, Leistungsbeurteilung', icon: 'fa-bullseye', iconClass: 'icon-performance', color: '#8b5cf6', workflowPage: 'hr-coach-performance-workflow.html', criteria: 8 },
    { id: 'compensation', title: 'Compensation & Benefits', description: 'Vergütungsstrategie, Total Rewards, Benefit-Programme', icon: 'fa-coins', iconClass: 'icon-compensation', color: '#f97316', workflowPage: 'hr-coach-compensation-workflow.html', criteria: 8 },
    { id: 'learning', title: 'Learning & Succession', description: 'Karrierepfade, Nachfolgeplanung, Weiterbildung, Talententwicklung', icon: 'fa-graduation-cap', iconClass: 'icon-learning', color: '#14b8a6', workflowPage: 'hr-coach-learning-workflow.html', criteria: 8 },
    { id: 'leadership', title: 'Leadership Development', description: 'Führungsstile, Coaching, Management-Entwicklung', icon: 'fa-users-cog', iconClass: 'icon-leadership', color: '#ef4444', workflowPage: 'hr-coach-leadership-workflow.html', criteria: 8 },
    { id: 'wellbeing', title: 'BGM & Wellbeing', description: 'Mental Health, Work-Life-Balance, Gesundheitsmanagement', icon: 'fa-heart', iconClass: 'icon-wellbeing', color: '#22c55e', workflowPage: 'hr-coach-wellbeing-workflow.html', criteria: 8 }
];

document.addEventListener('DOMContentLoaded', function () {
    renderAreasGrid();
    renderOverallProgress();
    renderYogaTeppich();
});

function getAreaProgress(areaId) {
    const saved = localStorage.getItem('hrCoach_' + areaId + '_progress');
    return saved ? parseInt(saved, 10) : 0;
}

function renderAreasGrid() {
    const grid = document.getElementById('areasGrid');
    if (!grid) return;
    grid.innerHTML = HR_FRAMEWORK_AREAS.map(function (area) {
        const progress = getAreaProgress(area.id);
        return '<a href="' + area.workflowPage + '" class="area-card">' +
            '<div class="area-card-icon ' + area.iconClass + '"><i class="fas ' + area.icon + '"></i></div>' +
            '<h3>' + area.title + '</h3>' +
            '<p>' + area.description + '</p>' +
            '<div class="area-progress">' +
            '<div class="area-progress-fill" style="width:' + progress + '%;background:' + area.color + ';"></div>' +
            '</div>' +
            '<div class="area-progress-text">' +
            '<span>' + progress + '% abgeschlossen</span>' +
            '<span>' + area.criteria + ' Kriterien</span>' +
            '</div>' +
            '</a>';
    }).join('');
}

function renderOverallProgress() {
    const card = document.getElementById('overallProgressCard');
    if (!card) return;
    let total = 0;
    HR_FRAMEWORK_AREAS.forEach(function (area) {
        total += getAreaProgress(area.id);
    });
    const avgProgress = Math.round(total / HR_FRAMEWORK_AREAS.length);
    let message = 'Beginnen Sie mit der Analyse Ihrer HR-Bereiche';
    if (avgProgress >= 70) message = 'Fast geschafft! Schließen Sie die letzten Bereiche ab';
    else if (avgProgress >= 30) message = 'Guter Fortschritt! Setzen Sie die Analyse fort';
    card.innerHTML = '<h2><i class="fas fa-chart-pie" style="margin-right:0.5rem;"></i>Ihr Gesamtfortschritt</h2>' +
        '<div style="font-size:4rem;font-weight:800;color:#a5b4fc;margin:1.5rem 0;">' + avgProgress + '%</div>' +
        '<p style="color:#c7d2fe;font-size:1.1rem;">' + message + '</p>' +
        '<div style="margin-top:2rem;">' +
        '<button onclick="exportFullReport()" class="btn-export" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;">' +
        '<i class="fas fa-file-pdf"></i> Gesamtbericht exportieren</button>' +
        '</div>';
}

function renderYogaTeppich() {
    const container = document.getElementById('yogaTeppichSVG');
    if (!container) return;
    const n = HR_FRAMEWORK_AREAS.length;
    const cx = 200;
    const cy = 200;
    const rOuter = 180;
    const rInner = 70;
    let segments = '';
    HR_FRAMEWORK_AREAS.forEach(function (area, i) {
        const startAngle = (i / n) * 360 - 90;
        const endAngle = ((i + 1) / n) * 360 - 90;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const x1 = cx + rOuter * Math.cos(startRad);
        const y1 = cy + rOuter * Math.sin(startRad);
        const x2 = cx + rOuter * Math.cos(endRad);
        const y2 = cy + rOuter * Math.sin(endRad);
        const x3 = cx + rInner * Math.cos(endRad);
        const y3 = cy + rInner * Math.sin(endRad);
        const x4 = cx + rInner * Math.cos(startRad);
        const y4 = cy + rInner * Math.sin(startRad);
        const d = 'M ' + x1 + ' ' + y1 + ' A ' + rOuter + ' ' + rOuter + ' 0 0 1 ' + x2 + ' ' + y2 + ' L ' + x3 + ' ' + y3 + ' A ' + rInner + ' ' + rInner + ' 0 0 0 ' + x4 + ' ' + y4 + ' Z';
        const progress = getAreaProgress(area.id);
        const fillOpacity = 0.15 + (progress / 100) * 0.5;
        segments += '<path class="yoga-segment" d="' + d + '" fill="' + area.color + '" fill-opacity="' + fillOpacity + '" stroke="rgba(255,255,255,0.3)" stroke-width="1" data-area="' + area.id + '" onclick="window.location.href=\'' + area.workflowPage + '\'"/>';
    });
    const midAngle = -90 + 360 / (2 * n);
    const labelR = (rInner + rOuter) / 2;
    let labels = '';
    HR_FRAMEWORK_AREAS.forEach(function (area, i) {
        const a = (i / n) * 360 - 90 + (360 / (2 * n));
        const rad = (a * Math.PI) / 180;
        const lx = cx + labelR * Math.cos(rad);
        const ly = cy + labelR * Math.sin(rad);
        const shortTitle = area.title.split(' ')[0].substring(0, 8);
        labels += '<text x="' + lx + '" y="' + ly + '" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="10" font-weight="bold">' + shortTitle + '</text>';
    });
    container.innerHTML = '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + rOuter + '" fill="none" stroke="rgba(99,102,241,0.3)" stroke-width="2"/>' +
        segments +
        labels +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + rInner + '" fill="rgba(99,102,241,0.3)" stroke="rgba(165,180,252,0.5)" stroke-width="2"/>' +
        '<text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" fill="white" font-size="14" font-weight="bold">HR Coach</text>' +
        '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" fill="#a5b4fc" font-size="10">Framework</text>' +
        '</svg>';
}

function exportFullReport() {
    let text = 'HR Coach Framework – Gesamtbericht\n';
    text += 'Erstellt am: ' + new Date().toLocaleDateString('de-DE') + '\n\n';
    HR_FRAMEWORK_AREAS.forEach(function (area) {
        const p = getAreaProgress(area.id);
        text += area.title + ': ' + p + '%\n';
    });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'HR-Coach-Framework-Bericht.txt';
    a.click();
    URL.revokeObjectURL(a.href);
}
