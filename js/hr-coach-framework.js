/**
 * HR COACH FRAMEWORK – Seitenlogik
 * 10 HR-Kernbereiche mit HR-Kompass (Hero), Reifegrad-Radar, Fortschrittsbalken,
 * Bereichs-Karten mit Progress-Ringen und Gesamtfortschritt.
 * Fortschritt wird pro Bereich aus localStorage ("hrCoach_<id>_progress") gelesen.
 */

const HR_FRAMEWORK_AREAS = [
    { id: 'analytics',    title: 'Analytics & Reporting',            short: 'Analytics',    description: 'KPIs, Dashboards, Predictive Analytics und datengetriebene Entscheidungen', icon: 'fa-chart-line',     color: '#0f4c75', workflowPage: 'hr-coach-analytics-workflow.html',    criteria: 8 },
    { id: 'strategie',    title: 'Strategie & Kultur',               short: 'Strategie',    description: 'Kulturanalyse, Werte-Alignment, strategische HR-Planung',                      icon: 'fa-chess',          color: '#167d8c', workflowPage: 'hr-coach-strategie-workflow.html',    criteria: 8 },
    { id: 'recruiting',   title: 'Recruiting & Employer Branding',   short: 'Recruiting',   description: 'Talentgewinnung, Candidate Journey, Arbeitgebermarke',                         icon: 'fa-user-plus',      color: '#3aa6a6', workflowPage: 'hr-coach-recruiting-workflow.html',   criteria: 8 },
    { id: 'onboarding',   title: 'Onboarding & Offboarding',         short: 'Onboarding',   description: 'Pre-/Onboarding, Exit-Management, Employee Lifecycle',                         icon: 'fa-door-open',      color: '#2a9d8f', workflowPage: 'hr-coach-onboarding-workflow.html',   criteria: 8 },
    { id: 'admin',        title: 'HR Administration',                short: 'Admin',        description: 'Prozessoptimierung, Self-Service, Digitalisierung',                            icon: 'fa-gears',          color: '#e8a04b', workflowPage: 'hr-coach-admin-workflow.html',        criteria: 8 },
    { id: 'performance',  title: 'Performance Management',           short: 'Performance',  description: 'Feedback-Kultur, OKRs, Zielvereinbarungen, Leistungsbeurteilung',              icon: 'fa-bullseye',       color: '#e9775b', workflowPage: 'hr-coach-performance-workflow.html',  criteria: 8 },
    { id: 'compensation', title: 'Compensation & Benefits',          short: 'Compensation', description: 'Vergütungsstrategie, Total Rewards, Benefit-Programme',                        icon: 'fa-coins',          color: '#c06c84', workflowPage: 'hr-coach-compensation-workflow.html', criteria: 8 },
    { id: 'learning',     title: 'Learning & Succession',            short: 'Learning',     description: 'Karrierepfade, Nachfolgeplanung, Weiterbildung, Talententwicklung',           icon: 'fa-graduation-cap', color: '#4a7fb5', workflowPage: 'hr-coach-learning-workflow.html',     criteria: 8 },
    { id: 'leadership',   title: 'Leadership Development',           short: 'Leadership',   description: 'Führungsstile, Coaching, Management-Entwicklung',                               icon: 'fa-users-gear',     color: '#b5563d', workflowPage: 'hr-coach-leadership-workflow.html',   criteria: 8 },
    { id: 'wellbeing',    title: 'BGM & Wellbeing',                  short: 'Wellbeing',    description: 'Mental Health, Work-Life-Balance, Gesundheitsmanagement',                      icon: 'fa-heart',          color: '#7cb87a', workflowPage: 'hr-coach-wellbeing-workflow.html',    criteria: 8 }
];

const FW_TARGET_PCT = 80; // Zielbild im Radar

document.addEventListener('DOMContentLoaded', function () {
    const stats = computeStats();
    renderCompass(stats);
    renderRadar(stats);
    renderProgressBars(stats);
    renderAreasGrid(stats);
    renderOverallProgress(stats);
    const heroOverall = document.getElementById('heroOverall');
    if (heroOverall) heroOverall.textContent = stats.avg + '%';
    // Balken/Ringe nach dem ersten Paint animieren
    requestAnimationFrame(function () {
        requestAnimationFrame(function () { document.body.classList.add('fw-ready'); });
    });
});

/* ------------------------------------------------------------------ Daten */

function getAreaProgress(areaId) {
    let saved = null;
    try { saved = localStorage.getItem('hrCoach_' + areaId + '_progress'); } catch (e) {}
    const n = saved ? parseInt(saved, 10) : 0;
    return isNaN(n) ? 0 : Math.max(0, Math.min(100, n));
}

function computeStats() {
    const progress = {};
    let total = 0, started = 0, done = 0, best = null, weakest = null;
    HR_FRAMEWORK_AREAS.forEach(function (a) {
        const p = getAreaProgress(a.id);
        progress[a.id] = p;
        total += p;
        if (p > 0) started++;
        if (p >= 100) done++;
        if (!best || p > progress[best.id]) best = a;
        if (!weakest || p < progress[weakest.id]) weakest = a;
    });
    return {
        progress: progress,
        avg: Math.round(total / HR_FRAMEWORK_AREAS.length),
        started: started,
        done: done,
        best: best,
        weakest: weakest
    };
}

function statusFor(p) {
    if (p >= 100) return { cls: 'fw-chip-done',  icon: 'fa-circle-check', label: 'Abgeschlossen' };
    if (p >= 40)  return { cls: 'fw-chip-mid',   icon: 'fa-spinner',      label: 'In Arbeit' };
    if (p > 0)    return { cls: 'fw-chip-start', icon: 'fa-play',         label: 'Gestartet' };
    return         { cls: 'fw-chip-new',   icon: 'fa-circle',       label: 'Noch nicht gestartet' };
}

function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}

/* ------------------------------------------------------- SVG-Hilfsfunktionen */

function polar(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, rOuter, rInner, a0, a1) {
    const large = a1 - a0 > 180 ? 1 : 0;
    const o0 = polar(cx, cy, rOuter, a0), o1 = polar(cx, cy, rOuter, a1);
    const i0 = polar(cx, cy, rInner, a0), i1 = polar(cx, cy, rInner, a1);
    return 'M' + o0.x.toFixed(2) + ' ' + o0.y.toFixed(2) +
        ' A' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + o1.x.toFixed(2) + ' ' + o1.y.toFixed(2) +
        ' L' + i1.x.toFixed(2) + ' ' + i1.y.toFixed(2) +
        ' A' + rInner + ' ' + rInner + ' 0 ' + large + ' 0 ' + i0.x.toFixed(2) + ' ' + i0.y.toFixed(2) + ' Z';
}

/* ------------------------------------------------------------ HR-Kompass */

function renderCompass(stats) {
    const el = document.getElementById('compass');
    if (!el) return;
    const n = HR_FRAMEWORK_AREAS.length;
    const cx = 200, cy = 200, rOuter = 150, rInner = 96, gap = 2.4, labelR = 166;
    let segs = '', labels = '';

    HR_FRAMEWORK_AREAS.forEach(function (area, i) {
        const a0 = (i / n) * 360 + gap / 2;
        const a1 = ((i + 1) / n) * 360 - gap / 2;
        const p = stats.progress[area.id];
        const fillR = rInner + 4 + (rOuter - rInner - 4) * (p / 100);
        const mid = (a0 + a1) / 2;
        const lp = polar(cx, cy, labelR, mid);
        const anchor = Math.abs(mid - 180) < 12 || mid < 12 || mid > 348 ? 'middle' : (mid < 180 ? 'start' : 'end');
        const dy = mid < 12 || mid > 348 ? -2 : (Math.abs(mid - 180) < 12 ? 10 : 4);
        const pct = polar(cx, cy, (rInner + rOuter) / 2, mid);

        segs += '<g class="seg" role="link" tabindex="0" data-id="' + area.id + '" data-href="' + area.workflowPage + '" data-title="' + esc(area.title) + '" data-desc="' + esc(area.description) + '" data-pct="' + p + '">' +
            '<title>' + esc(area.title) + ' – ' + p + '%</title>' +
            '<path class="seg-track" d="' + arcPath(cx, cy, rOuter, rInner, a0, a1) + '" fill="' + area.color + '"/>' +
            '<path class="seg-base" d="' + arcPath(cx, cy, rInner + 4, rInner, a0, a1) + '" fill="' + area.color + '"/>' +
            (p > 0 ? '<path class="seg-fill" d="' + arcPath(cx, cy, fillR, rInner, a0, a1) + '" fill="' + area.color + '"/>' : '') +
            (p > 0 ? '<text class="seg-pct" x="' + pct.x.toFixed(1) + '" y="' + pct.y.toFixed(1) + '" text-anchor="middle" dominant-baseline="central">' + p + '%</text>' : '') +
            '</g>';
        labels += '<text class="seg-label" x="' + lp.x.toFixed(1) + '" y="' + (lp.y + dy).toFixed(1) + '" text-anchor="' + anchor + '">' + esc(area.short) + '</text>';
    });

    el.innerHTML = '<svg viewBox="-70 -4 540 408" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><radialGradient id="fwCenterGlow" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="rgba(255,255,255,0.16)"/><stop offset="100%" stop-color="rgba(255,255,255,0.02)"/></radialGradient></defs>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (rOuter + 6) + '" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="2 5"/>' +
        segs + labels +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (rInner - 10) + '" fill="url(#fwCenterGlow)" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>' +
        '<text class="center-pct" x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" dominant-baseline="central">' + stats.avg + '%</text>' +
        '<text class="center-cap" x="' + cx + '" y="' + (cy + 36) + '" text-anchor="middle">REIFEGRAD</text>' +
        '</svg>';

    const tipTitle = document.querySelector('#compassTip .fw-tip-title');
    const tipText = document.querySelector('#compassTip .fw-tip-text');
    const defaults = tipTitle && tipText ? { t: tipTitle.textContent, d: tipText.textContent } : null;

    el.querySelectorAll('.seg').forEach(function (g) {
        function show() {
            if (!tipTitle || !tipText) return;
            tipTitle.innerHTML = esc(g.getAttribute('data-title')) + ' <span style="opacity:.7;font-weight:600">· ' + g.getAttribute('data-pct') + '%</span>';
            tipText.textContent = g.getAttribute('data-desc');
        }
        function reset() {
            if (!defaults) return;
            tipTitle.textContent = defaults.t;
            tipText.textContent = defaults.d;
        }
        g.addEventListener('mouseenter', show);
        g.addEventListener('focus', show);
        g.addEventListener('mouseleave', reset);
        g.addEventListener('blur', reset);
        g.addEventListener('click', function () { window.location.href = g.getAttribute('data-href'); });
        g.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = g.getAttribute('data-href'); }
        });
    });
}

/* ------------------------------------------------------------ Radar-Chart */

function renderRadar(stats) {
    const el = document.getElementById('radarChart');
    if (!el) return;
    const n = HR_FRAMEWORK_AREAS.length;
    const cx = 290, cy = 215, R = 140, labelR = R + 26;
    let out = '<svg viewBox="0 0 580 430" xmlns="http://www.w3.org/2000/svg">';

    // Ringe (25/50/75/100)
    [25, 50, 75, 100].forEach(function (lvl) {
        const r = R * lvl / 100;
        let pts = '';
        for (let i = 0; i < n; i++) {
            const p = polar(cx, cy, r, i * 360 / n);
            pts += p.x.toFixed(1) + ',' + p.y.toFixed(1) + ' ';
        }
        out += '<polygon class="grid-line" points="' + pts.trim() + '"/>';
        out += '<text class="ring-label" x="' + (cx + 4) + '" y="' + (cy - r + 10) + '">' + lvl + '</text>';
    });

    // Achsen + Labels
    HR_FRAMEWORK_AREAS.forEach(function (area, i) {
        const ang = i * 360 / n;
        const end = polar(cx, cy, R, ang);
        out += '<line class="axis" x1="' + cx + '" y1="' + cy + '" x2="' + end.x.toFixed(1) + '" y2="' + end.y.toFixed(1) + '"/>';
        const lp = polar(cx, cy, labelR, ang);
        const anchor = ang < 8 || ang > 352 || Math.abs(ang - 180) < 8 ? 'middle' : (ang < 180 ? 'start' : 'end');
        const parts = area.title.split(' & ');
        let lines;
        if (parts.length > 1) {
            lines = [parts[0] + ' &', parts.slice(1).join(' & ')];
        } else {
            const words = area.title.split(' ');
            lines = words.length > 1 && area.title.length > 18 ? [words[0], words.slice(1).join(' ')] : [area.title];
        }
        const baseY = lp.y - (lines.length - 1) * 6.5 + (ang > 352 || ang < 8 ? -4 : (Math.abs(ang - 180) < 8 ? 12 : 4));
        out += '<text class="axis-label" x="' + lp.x.toFixed(1) + '" y="' + baseY.toFixed(1) + '" text-anchor="' + anchor + '">';
        lines.forEach(function (ln, k) {
            out += '<tspan x="' + lp.x.toFixed(1) + '" dy="' + (k === 0 ? 0 : 13) + '">' + esc(ln) + '</tspan>';
        });
        out += '</text>';
    });

    // Zielbild
    let tpts = '';
    for (let i = 0; i < n; i++) {
        const p = polar(cx, cy, R * FW_TARGET_PCT / 100, i * 360 / n);
        tpts += p.x.toFixed(1) + ',' + p.y.toFixed(1) + ' ';
    }
    out += '<polygon class="target" points="' + tpts.trim() + '"/>';

    // Ihr Stand
    let ypts = '', dots = '';
    HR_FRAMEWORK_AREAS.forEach(function (area, i) {
        const p = stats.progress[area.id];
        const r = Math.max(R * p / 100, 3);
        const pt = polar(cx, cy, r, i * 360 / n);
        ypts += pt.x.toFixed(1) + ',' + pt.y.toFixed(1) + ' ';
        dots += '<circle class="dot" cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="4.5" fill="' + area.color + '"><title>' + esc(area.title) + ': ' + p + '%</title></circle>';
    });
    out += '<polygon class="you" points="' + ypts.trim() + '"/>' + dots;
    out += '</svg>';
    el.innerHTML = out;
}

/* ------------------------------------------------------- Fortschrittsbalken */

function renderProgressBars(stats) {
    const el = document.getElementById('progressBars');
    if (!el) return;
    const sorted = HR_FRAMEWORK_AREAS.slice().sort(function (a, b) {
        return stats.progress[b.id] - stats.progress[a.id];
    });
    el.innerHTML = sorted.map(function (area) {
        const p = stats.progress[area.id];
        return '<a class="fw-bar" href="' + area.workflowPage + '">' +
            '<span class="fw-bar-dot" style="background:' + area.color + '"></span>' +
            '<span class="fw-bar-main">' +
            '<span class="fw-bar-title">' + esc(area.title) + '</span>' +
            '<span class="fw-bar-track"><span class="fw-bar-fill" data-width="' + p + '" style="background:' + area.color + '"></span></span>' +
            '</span>' +
            '<span class="fw-bar-pct">' + p + '%</span>' +
            '</a>';
    }).join('');

    requestAnimationFrame(function () {
        el.querySelectorAll('.fw-bar-fill').forEach(function (f) {
            f.style.width = f.getAttribute('data-width') + '%';
        });
    });

    const note = document.getElementById('barsNote');
    if (note) {
        note.innerHTML = '<strong>' + stats.started + '</strong> <span>von</span> <strong>' + HR_FRAMEWORK_AREAS.length + '</strong> <span>Bereichen gestartet</span> · ' +
            '<strong>' + stats.done + '</strong> <span>abgeschlossen</span> · <span>Zielbild</span> <strong>' + FW_TARGET_PCT + '%</strong>';
    }
}

/* ------------------------------------------------------------ Bereichskarten */

function ringSvg(p, size, stroke, cls) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">' +
        '<circle class="ring-track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '"/>' +
        '<circle class="ring-fill" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - p / 100)).toFixed(2) + '"/>' +
        '<text x="' + size / 2 + '" y="' + size / 2 + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + p + '%</text>' +
        '</svg>';
}

function renderAreasGrid(stats) {
    const grid = document.getElementById('areasGrid');
    if (!grid) return;
    grid.innerHTML = HR_FRAMEWORK_AREAS.map(function (area) {
        const p = stats.progress[area.id];
        const st = statusFor(p);
        return '<a href="' + area.workflowPage + '" class="fw-area" style="--area-color:' + area.color + '">' +
            '<div class="fw-area-top">' +
            '<div class="fw-area-icon"><i class="fas ' + area.icon + '"></i></div>' +
            '<div class="fw-ring" aria-label="' + p + '% abgeschlossen">' + ringSvg(p, 56, 5) + '</div>' +
            '</div>' +
            '<h3>' + esc(area.title) + '</h3>' +
            '<p>' + esc(area.description) + '</p>' +
            '<div class="fw-area-foot">' +
            '<span class="fw-chip ' + st.cls + '"><i class="fas ' + st.icon + '"></i> <span>' + st.label + '</span></span>' +
            '<span class="fw-area-link"><span>' + (p > 0 ? 'Fortsetzen' : 'Analyse starten') + '</span> <i class="fas fa-arrow-right"></i></span>' +
            '</div>' +
            '</a>';
    }).join('');
}

/* --------------------------------------------------------- Gesamtfortschritt */

function renderOverallProgress(stats) {
    const card = document.getElementById('overallProgressCard');
    if (!card) return;
    const avg = stats.avg;
    let message = 'Starten Sie mit der ersten Dimension – jede Analyse dauert nur wenige Minuten.';
    if (avg >= 100) message = 'Alle Bereiche analysiert. Exportieren Sie den Gesamtbericht und planen Sie die nächsten Schritte.';
    else if (avg >= 70) message = 'Fast geschafft – schliessen Sie die letzten Bereiche ab, um das vollständige Bild zu erhalten.';
    else if (avg >= 30) message = 'Guter Fortschritt. Setzen Sie die Analyse fort, um Ihr Zielbild zu erreichen.';
    else if (avg > 0) message = 'Ein guter Anfang. Vertiefen Sie die nächsten Dimensionen für belastbare Empfehlungen.';

    const next = stats.weakest;
    const c = 2 * Math.PI * 58;

    card.innerHTML =
        '<div class="fw-overall-ring" role="img" aria-label="Gesamtfortschritt ' + avg + '%">' +
        '<svg viewBox="0 0 136 136"><defs><linearGradient id="fwSunsetGrad" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#ffd59a"/><stop offset="55%" stop-color="#e8a04b"/><stop offset="100%" stop-color="#e9775b"/></linearGradient></defs>' +
        '<circle class="ring-track" cx="68" cy="68" r="58"/>' +
        '<circle class="ring-fill" cx="68" cy="68" r="58" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - avg / 100)).toFixed(2) + '"/>' +
        '<text x="68" y="68">' + avg + '%</text></svg>' +
        '</div>' +
        '<div class="fw-overall-copy">' +
        '<h3>Ihr Gesamtfortschritt</h3>' +
        '<p>' + message + '</p>' +
        '<div class="fw-overall-meta">' +
        '<span><strong>' + stats.started + '/' + HR_FRAMEWORK_AREAS.length + '</strong> <span>Bereiche gestartet</span></span>' +
        '<span><strong>' + stats.done + '</strong> <span>abgeschlossen</span></span>' +
        (stats.best && stats.progress[stats.best.id] > 0 ? '<span><span>Stärkster Bereich:</span> <strong>' + esc(stats.best.title) + '</strong></span>' : '') +
        '</div>' +
        '</div>' +
        '<div class="fw-overall-actions">' +
        (next ? '<a class="fw-btn fw-btn-primary" href="' + next.workflowPage + '"><i class="fas fa-arrow-right"></i> <span>' + (avg > 0 ? 'Nächster Schritt' : 'Jetzt starten') + '</span></a>' : '') +
        '<button type="button" class="fw-btn fw-btn-outline" onclick="exportFullReport()"><i class="fas fa-file-export"></i> <span>Gesamtbericht exportieren</span></button>' +
        '</div>';
}

/* ------------------------------------------------------------------ Export */

function exportFullReport() {
    const stats = computeStats();
    const isEn = document.documentElement.lang === 'en';
    const L = isEn ? {
        title: 'HR Coach Framework – Overall Report', created: 'Created on', overall: 'Overall maturity',
        started: 'Areas started', done: 'Areas completed', area: 'Area', progress: 'Progress', status: 'Status',
        st: { done: 'Completed', mid: 'In progress', start: 'Started', 'new': 'Not started' }, locale: 'en-GB'
    } : {
        title: 'HR Coach Framework – Gesamtbericht', created: 'Erstellt am', overall: 'Gesamtreifegrad',
        started: 'Bereiche gestartet', done: 'Bereiche abgeschlossen', area: 'Bereich', progress: 'Fortschritt', status: 'Status',
        st: { done: 'Abgeschlossen', mid: 'In Arbeit', start: 'Gestartet', 'new': 'Noch nicht gestartet' }, locale: 'de-CH'
    };
    let text = L.title + '\n' + '='.repeat(L.title.length) + '\n';
    text += L.created + ': ' + new Date().toLocaleDateString(L.locale) + '\n\n';
    text += L.overall + ': ' + stats.avg + '%\n';
    text += L.started + ': ' + stats.started + '/' + HR_FRAMEWORK_AREAS.length + '\n';
    text += L.done + ': ' + stats.done + '\n\n';
    HR_FRAMEWORK_AREAS.forEach(function (area) {
        const p = stats.progress[area.id];
        const key = p >= 100 ? 'done' : p >= 40 ? 'mid' : p > 0 ? 'start' : 'new';
        text += '- ' + area.title + ': ' + p + '% (' + L.st[key] + ')\n';
    });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'HR-Coach-Framework-Report.txt';
    a.click();
    URL.revokeObjectURL(a.href);
}
