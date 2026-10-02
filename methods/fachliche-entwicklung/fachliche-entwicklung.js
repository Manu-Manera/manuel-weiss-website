/* Fachliche Entwicklung · Logik (Kit-basiert) */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const HOURS_PER_POINT = 12;
    const PRIO = { high: { l: 'Hoch', w: 1.5 }, mid: { l: 'Mittel', w: 1 }, low: { l: 'Niedrig', w: 0.6 } };
    const DEFAULT_SKILLS = [
        ['Fachwissen im Kerngebiet', 6, 8], ['Methoden & Tools', 5, 8], ['Daten & Analyse', 4, 7],
        ['Kommunikation & Präsentation', 6, 8], ['Führung & Zusammenarbeit', 5, 7], ['Digitale Kompetenz / KI', 4, 8]
    ];
    const TRENDS = ['Künstliche Intelligenz', 'Automatisierung', 'Datenkompetenz', 'Cloud & Integration', 'Regulatorik & Compliance', 'Remote & asynchrone Arbeit', 'Nachhaltigkeit', 'Agile Arbeitsweisen', 'Kundenzentrierung', 'Cybersecurity', 'Low-Code / No-Code', 'Beratungskompetenz'];
    const METHODS = ['Online-Kurs', 'Fachbuch', 'Praxisprojekt', 'Mentoring', 'Zertifikat', 'Community / Meetup', 'Job-Shadowing', 'Selbst lehren', 'Podcast / Video', 'Lerngruppe'];
    const CERT_SUGGEST = ['Scrum Master (PSM I)', 'Projektmanagement (IPMA / PMP)', 'Cloud Practitioner', 'Data Analytics', 'ITIL Foundation', 'Change Management (Prosci)', 'Hersteller-Zertifikat', 'Sprachzertifikat'];
    const STATUS = { planned: 'Geplant', progress: 'In Arbeit', done: 'Erreicht' };
    const RHYTHM_DAYS = { weekly: 7, biweekly: 14, monthly: 30 };
    const LINKS = [
        { m: 'SMART-Ziele', l: '../goal-setting/goal-setting.html', why: 'Ziele sauber ausformulieren und nachhalten.' },
        { m: 'Kompetenz-Landkarte', l: '../competence-map/competence-map.html', why: 'Deine Kompetenzen visuell ordnen.' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Lernzeit fest im Alltag verankern.' },
        { m: 'Zeitmanagement', l: '../time-management/time-management.html', why: 'Das Wochenbudget wirklich freischaufeln.' },
        { m: 'VIA-Charakterstärken', l: '../via-strengths/via-strengths.html', why: 'Lernen über deine Stärken statt gegen sie.' },
        { m: 'Johari-Fenster', l: '../johari-window/johari-window.html', why: 'Fremdbild zur Selbsteinschätzung einholen.' }
    ];

    /* ---------- Helpers ---------- */
    const n = (v, d) => { const x = parseFloat(v); return isNaN(x) ? d : x; };
    const gap = (s) => Math.max(0, n(s.soll, 0) - n(s.ist, 0));
    const wgap = (s) => gap(s) * (PRIO[s.prio] || PRIO.mid).w;
    const ranked = () => S.skills.slice().sort((a, b) => wgap(b) - wgap(a) || gap(b) - gap(a));
    const todayKey = () => new Date().toISOString().slice(0, 10);
    const monthLabel = (ym) => { if (!ym) return ''; const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('de-CH', { month: 'short', year: 'numeric' }); };
    const ymOf = (d) => d.toISOString().slice(0, 7);
    const addDays = (d, days) => { const x = new Date(d); x.setDate(x.getDate() + days); return x; };
    const fmtDate = (iso) => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }); };

    /* Lernpfad-Berechnung: sequentiell nach Ranking */
    function pathPlan() {
        const budget = Math.max(1, n(S.hours, 5));
        let cursor = new Date(); const out = [];
        ranked().filter(s => gap(s) > 0).forEach(s => {
            const hours = gap(s) * HOURS_PER_POINT;
            const weeks = Math.max(1, Math.ceil(hours / budget));
            const start = new Date(cursor); const end = addDays(cursor, weeks * 7);
            out.push({ s, hours, weeks, start, end });
            cursor = end;
        });
        return out;
    }

    /* ---------- Step 1 · Skills & Radar ---------- */
    function renderSkills() {
        const host = $('fe-skills');
        host.innerHTML = `
            ${S.skills.map((s, i) => `
                <div class="fe-skill" style="--i:${i}">
                    <div class="fe-skill-top"><span class="fe-dot" style="background:${axisColor(i)}"></span><input class="mk-input fe-skill-name" data-sk="${s.id}" data-f="name" value="${esc(s.name)}" placeholder="Kompetenzfeld" maxlength="40"><button class="mk-iconbtn" data-rm="${s.id}" aria-label="Entfernen" ${S.skills.length <= 3 ? 'disabled title="Mindestens 3 Felder"' : ''}><i class="fas fa-times"></i></button></div>
                    <div class="fe-skill-ranges">
                        <label>Ist <input type="range" class="mk-range" min="1" max="10" step="1" value="${n(s.ist, 5)}" data-sk="${s.id}" data-f="ist"><b class="v-ist">${n(s.ist, 5)}</b></label>
                        <label>Soll <input type="range" class="mk-range soll" min="1" max="10" step="1" value="${n(s.soll, 7)}" data-sk="${s.id}" data-f="soll"><b class="v-soll">${n(s.soll, 7)}</b></label>
                    </div>
                </div>`).join('')}
            ${S.skills.length < 8 ? `<button class="mk-btn mk-btn-outline mk-btn-sm" id="fe-add-skill"><i class="fas fa-plus"></i> Kompetenzfeld ergänzen</button>` : '<span class="mk-faint">Maximal 8 Felder – mehr verwässert das Bild.</span>'}
            <div class="fe-level" style="margin-top:16px;">
                <label for="fe-level">Dein fachliches Gesamt-Level heute</label>
                <div class="mk-range-wrap"><span class="mk-faint">Einsteiger</span><input type="range" class="mk-range" id="fe-level" min="1" max="10" step="1" value="${n(S.level, 5)}"><span class="mk-faint">Expert:in</span><span class="mk-range-val" id="fe-level-val">${n(S.level, 5)}</span></div>
            </div>`;
        host.querySelectorAll('[data-sk]').forEach(el => el.addEventListener('input', () => {
            const s = S.skills.find(x => x.id === el.dataset.sk); if (!s) return;
            if (el.dataset.f === 'name') s.name = el.value; else s[el.dataset.f] = n(el.value, 5);
            const row = el.closest('.fe-skill'); if (el.dataset.f === 'ist') row.querySelector('.v-ist').textContent = s.ist; if (el.dataset.f === 'soll') row.querySelector('.v-soll').textContent = s.soll;
            MethodKit.save(); renderRadar();
        }));
        host.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { if (S.skills.length <= 3) return; S.skills = S.skills.filter(x => x.id !== b.dataset.rm); MethodKit.save(); renderSkills(); renderRadar(); }));
        const add = $('fe-add-skill'); if (add) add.addEventListener('click', () => { S.skills.push({ id: MethodKit.uid(), name: '', ist: 5, soll: 7, prio: 'mid', formats: [], note: '' }); MethodKit.save(); renderSkills(); renderRadar(); const inputs = host.querySelectorAll('.fe-skill-name'); inputs[inputs.length - 1].focus(); });
        $('fe-level').addEventListener('input', e => { S.level = n(e.target.value, 5); $('fe-level-val').textContent = S.level; MethodKit.save(); });
    }
    const AX = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'];
    const axisColor = (i) => AX[i % AX.length];
    function renderRadar() {
        const k = S.skills.length; if (k < 3) { $('fe-radar').innerHTML = ''; return; }
        const cx = 230, cy = 170, R = 108;
        const pt = (i, v) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / k; const r = (v / 10) * R; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
        const poly = (f) => S.skills.map((s, i) => pt(i, n(s[f], 0)).map(x => x.toFixed(1)).join(',')).join(' ');
        const rings = [2, 4, 6, 8, 10].map(v => `<polygon points="${S.skills.map((_, i) => pt(i, v).map(x => x.toFixed(1)).join(',')).join(' ')}" class="ring"/>`).join('');
        const wrap = (t) => { const words = String(t).split(/\s+/); const lines = ['']; words.forEach(w => { if ((lines[lines.length - 1] + ' ' + w).trim().length > 16 && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); }); return lines.slice(0, 2); };
        const axes = S.skills.map((s, i) => {
            const [x, y] = pt(i, 10); const [lx, ly] = pt(i, 11.6);
            const lines = wrap(s.name || 'Feld ' + (i + 1));
            const anchor = Math.abs(lx - cx) < 10 ? 'middle' : lx > cx ? 'start' : 'end';
            const dy0 = ly < cy - 5 ? -(lines.length - 1) * 12 : ly > cy + 5 ? 0 : -(lines.length - 1) * 6;
            return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="axis"/><text x="${lx.toFixed(1)}" y="${(ly + dy0).toFixed(1)}" class="lbl" fill="${axisColor(i)}" text-anchor="${anchor}">${lines.map((l, j) => `<tspan x="${lx.toFixed(1)}" dy="${j ? 12 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
        }).join('');
        const avgI = (S.skills.reduce((a, s) => a + n(s.ist, 0), 0) / k).toFixed(1), avgS = (S.skills.reduce((a, s) => a + n(s.soll, 0), 0) / k).toFixed(1);
        $('fe-radar').innerHTML = `
            <svg viewBox="0 0 460 340" class="fe-radar" role="img" aria-label="Skill-Radar">
                ${rings}${axes}
                <polygon points="${poly('soll')}" class="soll"/>
                <polygon points="${poly('ist')}" class="ist"/>
                ${S.skills.map((s, i) => { const [x, y] = pt(i, n(s.ist, 0)); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${axisColor(i)}" stroke="#fff" stroke-width="1.5"/>`; }).join('')}
            </svg>
            <div class="fe-radar-legend"><span><i class="ist"></i> Ist · Ø ${avgI}</span><span><i class="soll"></i> Soll · Ø ${avgS}</span></div>`;
    }

    /* ---------- Step 2 · Gap ---------- */
    function renderGap() {
        const list = ranked();
        const maxW = Math.max(1, ...list.map(wgap));
        $('fe-gap').innerHTML = list.length ? `
            <div class="fe-gap-head"><span>Kompetenz</span><span>Ist → Soll</span><span>Lücke</span><span>Priorität</span></div>
            ${list.map((s, i) => `<div class="fe-gap-row ${i < 3 && gap(s) > 0 ? 'top' : ''} ${gap(s) === 0 ? 'ok' : ''}">
                <span class="nm">${i < 3 && gap(s) > 0 ? `<b class="rk">${i + 1}</b>` : ''}${esc(s.name || 'Unbenannt')}</span>
                <span class="is">${n(s.ist, 0)} → ${n(s.soll, 0)}</span>
                <span class="bar"><i style="width:${(wgap(s) / maxW * 100).toFixed(0)}%"></i><em>${gap(s) ? '+' + gap(s) : '✓'}</em></span>
                <select class="mk-select fe-prio" data-prio="${s.id}">${Object.keys(PRIO).map(k => `<option value="${k}" ${(s.prio || 'mid') === k ? 'selected' : ''}>${PRIO[k].l}</option>`).join('')}</select>
            </div>`).join('')}
            <div class="mk-result" style="margin-top:14px;"><h4>Deine Lern-Reihenfolge</h4>${list.filter(s => gap(s) > 0).slice(0, 3).map((s, i) => `${i + 1}. <strong>${esc(s.name)}</strong> (+${gap(s)})`).join(' · ') || 'Keine Lücken – prüfe, ob dein Soll wirklich ambitioniert genug für deine Vision ist.'}</div>` : '<div class="mk-empty">Lege in Schritt 1 Kompetenzfelder an.</div>';
        $('fe-gap').querySelectorAll('[data-prio]').forEach(sel => sel.addEventListener('input', () => { const s = S.skills.find(x => x.id === sel.dataset.prio); if (s) { s.prio = sel.value; MethodKit.save(); renderGap(); } }));
        $('fe-trend-chips').innerHTML = TRENDS.map(t => `<button class="mk-chip ${S.trendChips.includes(t) ? 'selected' : ''}" data-t="${esc(t)}">${esc(t)}</button>`).join('');
        $('fe-trend-chips').querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { const t = b.dataset.t; S.trendChips = S.trendChips.includes(t) ? S.trendChips.filter(x => x !== t) : [...S.trendChips, t]; MethodKit.save(); renderGap(); }));
    }

    /* ---------- Step 3 · Lernpfad ---------- */
    function renderPath() {
        $('fe-methods').innerHTML = METHODS.map(m => `<button class="mk-chip ${S.methods.includes(m) ? 'selected' : ''}" data-m="${esc(m)}">${esc(m)}</button>`).join('');
        $('fe-methods').querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { const m = b.dataset.m; S.methods = S.methods.includes(m) ? S.methods.filter(x => x !== m) : [...S.methods, m]; MethodKit.save(); renderPath(); }));
        const plan = pathPlan();
        if (!plan.length) { $('fe-path').innerHTML = '<div class="mk-card"><div class="mk-empty">Keine Lücken im Skill-Radar – nichts zu planen. Erhöhe in Schritt 1 dein Soll, wo deine Vision es verlangt.</div></div>'; return; }
        const totalH = plan.reduce((a, p) => a + p.hours, 0), totalW = plan.reduce((a, p) => a + p.weeks, 0);
        const end = plan[plan.length - 1].end;
        $('fe-path').innerHTML = `
            <div class="mk-card fe-path-summary"><div><b>${totalH} Std.</b><span>Lernaufwand gesamt</span></div><div><b>${totalW} Wochen</b><span>bei ${n(S.hours, 5)} Std./Woche</span></div><div><b>${end.toLocaleDateString('de-CH', { month: 'short', year: 'numeric' })}</b><span>voraussichtlich fertig</span></div></div>
            ${plan.map((p, i) => { const s = p.s; const fm = s.formats && s.formats.length ? s.formats : S.methods; return `
            <div class="mk-card fe-path-item">
                <div class="fe-path-head"><b class="rk">${i + 1}</b><div><h3>${esc(s.name)}</h3><span class="mk-faint">${n(s.ist, 0)} → ${n(s.soll, 0)} · ${p.hours} Std. · ~${p.weeks} Wochen · ${p.start.toLocaleDateString('de-CH', { day: '2-digit', month: 'short' })} – ${p.end.toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div></div>
                <div class="mk-section-label">Lernwege für diesen Skill</div>
                <div class="mk-chips">${METHODS.map(m => `<button class="mk-chip ${fm.includes(m) ? 'selected' : ''}" data-fmt="${s.id}:${esc(m)}">${esc(m)}</button>`).join('')}</div>
                <div class="mk-field" style="margin:12px 0 0;"><label>Konkret: Welcher Kurs, welches Buch, welches Projekt?</label><input class="mk-input" data-note="${s.id}" value="${esc(s.note || '')}" placeholder="z. B. Kurs „…" auf Coursera, Nebenprojekt mit Team X"></div>
            </div>`; }).join('')}`;
        $('fe-path').querySelectorAll('[data-fmt]').forEach(b => b.addEventListener('click', () => { const [id, m] = b.dataset.fmt.split(/:(.+)/); const s = S.skills.find(x => x.id === id); if (!s) return; const cur = s.formats && s.formats.length ? s.formats.slice() : S.methods.slice(); s.formats = cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]; MethodKit.save(); renderPath(); }));
        $('fe-path').querySelectorAll('[data-note]').forEach(i => i.addEventListener('input', () => { const s = S.skills.find(x => x.id === i.dataset.note); if (s) { s.note = i.value; MethodKit.save(); } }));
    }

    /* ---------- Step 4 · Zertifikate ---------- */
    function renderCerts() {
        $('fe-certs').innerHTML = `
            ${S.certs.length ? S.certs.map(c => `<div class="fe-cert ${c.status}">
                <div class="fe-cert-main"><input class="mk-input" data-c="${c.id}" data-f="name" value="${esc(c.name)}" placeholder="Zertifikat"><input class="mk-input" data-c="${c.id}" data-f="provider" value="${esc(c.provider || '')}" placeholder="Anbieter"></div>
                <div class="fe-cert-meta"><input class="mk-input" type="month" data-c="${c.id}" data-f="target" value="${esc(c.target || '')}" title="Zieltermin"><select class="mk-select" data-c="${c.id}" data-f="status">${Object.keys(STATUS).map(k => `<option value="${k}" ${c.status === k ? 'selected' : ''}>${STATUS[k]}</option>`).join('')}</select><select class="mk-select" data-c="${c.id}" data-f="prio">${Object.keys(PRIO).map(k => `<option value="${k}" ${(c.prio || 'mid') === k ? 'selected' : ''}>${PRIO[k].l}</option>`).join('')}</select><button class="mk-iconbtn" data-rmc="${c.id}" aria-label="Löschen"><i class="fas fa-trash"></i></button></div>
            </div>`).join('') : '<div class="mk-empty">Noch keine Zertifikate geplant – und das ist völlig in Ordnung.</div>'}
            <div class="fe-add"><input class="mk-input" id="fe-cert-add" placeholder="Zertifikat hinzufügen …" maxlength="80"><button class="mk-btn mk-btn-primary" id="fe-cert-addbtn"><i class="fas fa-plus"></i></button></div>
            <div class="mk-section-label" style="margin-top:14px;">Typische Kategorien</div>
            <div class="mk-chips">${CERT_SUGGEST.map(c => `<button class="mk-chip" data-cs="${esc(c)}">+ ${esc(c)}</button>`).join('')}</div>`;
        const add = (name) => { if (!name.trim()) return; S.certs.push({ id: MethodKit.uid(), name: name.trim(), provider: '', target: '', status: 'planned', prio: 'mid' }); MethodKit.save(); renderCerts(); };
        $('fe-cert-addbtn').addEventListener('click', () => add($('fe-cert-add').value));
        $('fe-cert-add').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(ev.target.value); } });
        $('fe-certs').querySelectorAll('[data-cs]').forEach(b => b.addEventListener('click', () => add(b.dataset.cs)));
        $('fe-certs').querySelectorAll('[data-c]').forEach(el => el.addEventListener('input', () => { const c = S.certs.find(x => x.id === el.dataset.c); if (!c) return; c[el.dataset.f] = el.value; MethodKit.save(); if (el.dataset.f === 'status') renderCerts(); }));
        $('fe-certs').querySelectorAll('[data-rmc]').forEach(b => b.addEventListener('click', () => { S.certs = S.certs.filter(x => x.id !== b.dataset.rmc); MethodKit.save(); renderCerts(); }));
    }

    /* ---------- Step 5 · Tracking ---------- */
    function renderCheckin() {
        const last = S.checkins[S.checkins.length - 1];
        const due = last ? addDays(new Date(last.date), RHYTHM_DAYS[S.rhythm] || 7) : null;
        const isDue = !last || due <= new Date();
        const draft = S.__ci || (S.__ci = {});
        $('fe-checkin').innerHTML = `
            <div class="mk-note ${isDue ? 'warn' : 'ok'}"><i class="fas ${isDue ? 'fa-bell' : 'fa-check-circle'}"></i><span>${last ? `Letzter Check-in: ${fmtDate(last.date)} (Ø ${last.avg.toFixed(1)}). ${isDue ? 'Der nächste ist fällig.' : 'Nächster fällig am ' + due.toLocaleDateString('de-CH') + '.'}` : 'Noch kein Check-in. Der erste legt deine Ausgangslinie fest.'}</span></div>
            <div class="fe-ci-grid">${S.skills.map((s, i) => { const v = draft[s.id] != null ? draft[s.id] : n(s.ist, 5); return `<label class="fe-ci"><span class="nm"><i style="background:${axisColor(i)}"></i>${esc(s.name)}</span><input type="range" class="mk-range" min="1" max="10" step="1" value="${v}" data-ci="${s.id}"><b>${v}</b><span class="mk-faint">Soll ${n(s.soll, 0)}</span></label>`; }).join('')}</div>
            <button class="mk-btn mk-btn-primary" id="fe-ci-save" style="margin-top:12px;"><i class="fas fa-check"></i> Check-in speichern</button>`;
        $('fe-checkin').querySelectorAll('[data-ci]').forEach(r => r.addEventListener('input', () => { draft[r.dataset.ci] = n(r.value, 5); r.nextElementSibling.textContent = r.value; }));
        $('fe-ci-save').addEventListener('click', () => {
            const vals = {}; let sum = 0;
            S.skills.forEach(s => { const v = draft[s.id] != null ? draft[s.id] : n(s.ist, 5); vals[s.id] = v; s.ist = v; sum += v; });
            const avg = sum / Math.max(1, S.skills.length);
            const prev = last ? last.avg : null;
            S.checkins.push({ date: todayKey(), avg, vals }); S.__ci = {};
            MethodKit.save({ now: true });
            MethodKit.toast(prev != null && avg > prev ? `Check-in gespeichert · Ø ${avg.toFixed(1)} (+${(avg - prev).toFixed(1)})` : `Check-in gespeichert · Ø ${avg.toFixed(1)}`, 'success');
            renderCheckin(); renderChart(); renderRadar();
        });
    }
    function renderChart() {
        const cs = S.checkins; const sollAvg = S.skills.reduce((a, s) => a + n(s.soll, 0), 0) / Math.max(1, S.skills.length);
        if (cs.length < 2) { $('fe-chart').innerHTML = `<div class="mk-empty">${cs.length ? 'Ab dem zweiten Check-in siehst du hier deinen Verlauf.' : 'Mach den ersten Check-in – dann entsteht hier dein Verlauf.'}</div>`; return; }
        const W = 560, H = 160, P = 28; const xs = (i) => P + (i / (cs.length - 1)) * (W - 2 * P); const ys = (v) => H - P - ((v - 1) / 9) * (H - 2 * P);
        $('fe-chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="fe-chart" role="img" aria-label="Verlauf">
            ${[1, 4, 7, 10].map(v => `<line x1="${P}" x2="${W - P}" y1="${ys(v)}" y2="${ys(v)}" class="grid"/><text x="${P - 6}" y="${ys(v) + 4}" class="ax">${v}</text>`).join('')}
            <line x1="${P}" x2="${W - P}" y1="${ys(sollAvg)}" y2="${ys(sollAvg)}" class="soll"/><text x="${W - P}" y="${ys(sollAvg) - 5}" class="ax" text-anchor="end">Soll Ø ${sollAvg.toFixed(1)}</text>
            <polyline points="${cs.map((c, i) => `${xs(i)},${ys(c.avg)}`).join(' ')}" class="line"/>
            ${cs.map((c, i) => `<circle cx="${xs(i)}" cy="${ys(c.avg)}" r="4" class="pt"><title>${fmtDate(c.date)} · Ø ${c.avg.toFixed(1)}</title></circle>`).join('')}
            ${cs.map((c, i) => (i === 0 || i === cs.length - 1 || cs.length <= 6) ? `<text x="${xs(i)}" y="${H - 8}" class="ax" text-anchor="middle">${new Date(c.date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}</text>` : '').join('')}
        </svg>`;
    }
    function renderMilestones() {
        const list = S.milestones.slice().sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
        $('fe-milestones').innerHTML = `
            ${list.map(m => `<div class="mk-row fe-ms ${m.done ? 'done' : ''}"><input type="checkbox" data-msd="${m.id}" ${m.done ? 'checked' : ''}><span class="grow">${esc(m.title)}</span>${m.date ? `<span class="mk-faint" style="font-size:12px;white-space:nowrap">${monthLabel(m.date)}</span>` : ''}<button class="mk-iconbtn" data-msr="${m.id}" aria-label="Löschen"><i class="fas fa-times"></i></button></div>`).join('')}
            <div class="fe-add"><input class="mk-input" id="fe-ms-add" placeholder="Meilenstein …" maxlength="100"><input class="mk-input fe-date" type="month" id="fe-ms-date"><button class="mk-btn mk-btn-outline" id="fe-ms-addbtn"><i class="fas fa-plus"></i></button></div>`;
        const add = () => { const t = $('fe-ms-add').value; if (!t.trim()) return; S.milestones.push({ id: MethodKit.uid(), title: t.trim(), date: $('fe-ms-date').value, done: false }); MethodKit.save(); renderMilestones(); $('fe-ms-add').focus(); };
        $('fe-ms-addbtn').addEventListener('click', add);
        $('fe-ms-add').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(); } });
        $('fe-milestones').querySelectorAll('[data-msd]').forEach(cb => cb.addEventListener('change', () => { const m = S.milestones.find(x => x.id === cb.dataset.msd); if (m) { m.done = cb.checked; MethodKit.save(); renderMilestones(); if (m.done) MethodKit.toast('Meilenstein erreicht 🎉', 'success'); } }));
        $('fe-milestones').querySelectorAll('[data-msr]').forEach(b => b.addEventListener('click', () => { S.milestones = S.milestones.filter(x => x.id !== b.dataset.msr); MethodKit.save(); renderMilestones(); }));
    }
    function renderTracking() { renderCheckin(); renderChart(); renderMilestones(); }

    /* ---------- Step 6 · Roadmap ---------- */
    function renderRoadmap() {
        const ev = [];
        pathPlan().forEach(p => ev.push({ ym: ymOf(p.end), type: 'learn', icon: '📚', text: `${p.s.name}: Ziel-Level ${n(p.s.soll, 0)} erreicht (${p.hours} Std.)` }));
        S.certs.forEach(c => ev.push({ ym: c.target || '', type: 'cert', icon: '🏆', text: `${c.name}${c.provider ? ' · ' + c.provider : ''} (${STATUS[c.status] || ''})`, done: c.status === 'done' }));
        S.milestones.forEach(m => ev.push({ ym: m.date || '', type: 'ms', icon: '🚩', text: m.title, done: m.done }));
        S.goals.forEach((g, i) => { if (g.title) ev.push({ ym: g.deadline ? g.deadline.slice(0, 7) : '', type: 'goal', icon: '🎯', text: `Ziel ${i + 1}: ${g.title}` }); });
        if (!ev.length) { $('fe-roadmap').innerHTML = '<div class="mk-empty">Noch leer. Lernpfad, Zertifikate, Meilensteine und Ziele erscheinen hier automatisch.</div>'; return; }
        const now = ymOf(new Date());
        const groups = {}; ev.forEach(e => { (groups[e.ym || 'none'] = groups[e.ym || 'none'] || []).push(e); });
        const keys = Object.keys(groups).filter(k => k !== 'none').sort();
        $('fe-roadmap').innerHTML = `<div class="fe-timeline">
            ${keys.map(k => `<div class="fe-tl-month ${k < now ? 'past' : k === now ? 'now' : ''}"><div class="fe-tl-label">${monthLabel(k)}${k === now ? ' <span class="mk-badge">jetzt</span>' : ''}</div><div class="fe-tl-items">${groups[k].map(e => `<div class="fe-tl-item ${e.type} ${e.done ? 'done' : ''}"><span>${e.icon}</span>${esc(e.text)}</div>`).join('')}</div></div>`).join('')}
            ${groups.none ? `<div class="fe-tl-month"><div class="fe-tl-label mk-faint">Ohne Termin</div><div class="fe-tl-items">${groups.none.map(e => `<div class="fe-tl-item ${e.type}"><span>${e.icon}</span>${esc(e.text)}</div>`).join('')}</div></div>` : ''}
        </div>`;
    }

    /* ---------- Step 7 · Aktionsplan ---------- */
    function renderGoals() {
        const plan = pathPlan(); const top = plan[0];
        const suggestion = top ? { title: `${top.s.name} von ${n(top.s.ist, 0)} auf ${n(top.s.soll, 0)} bringen`, metric: `Selbsteinschätzung ≥ ${n(top.s.soll, 0)} im Check-in, bestätigt durch Feedback`, deadline: top.end.toISOString().slice(0, 10) } : null;
        $('fe-goals').innerHTML = `
            ${suggestion && !S.goals[0].title ? `<div class="mk-note info"><i class="fas fa-lightbulb"></i><span>Vorschlag aus deiner grössten Lücke: <strong>${esc(suggestion.title)}</strong> bis ${fmtDate(suggestion.deadline)}. <button class="mk-btn mk-btn-outline mk-btn-sm" id="fe-goal-apply" style="margin-left:6px">Übernehmen</button></span></div>` : ''}
            ${S.goals.map((g, i) => `<div class="fe-goal ${g.title ? '' : 'empty'}"><div class="fe-goal-n">${i + 1}</div><div class="fe-goal-f">
                <input class="mk-input" data-g="${i}" data-f="title" value="${esc(g.title)}" placeholder="Ziel ${i + 1}${i ? ' (optional)' : ''} – was genau?">
                <input class="mk-input" data-g="${i}" data-f="metric" value="${esc(g.metric)}" placeholder="Woran misst du Erfolg?">
                <input class="mk-input" type="date" data-g="${i}" data-f="deadline" value="${esc(g.deadline)}">
            </div></div>`).join('')}`;
        const ap = $('fe-goal-apply'); if (ap) ap.addEventListener('click', () => { S.goals[0] = suggestion; MethodKit.save(); renderGoals(); });
        $('fe-goals').querySelectorAll('[data-g]').forEach(el => el.addEventListener('input', () => { S.goals[+el.dataset.g][el.dataset.f] = el.value; MethodKit.save(); }));
    }
    function renderSteps() {
        $('fe-steps').innerHTML = S.steps.map((s, i) => `<div class="mk-row fe-step"><b class="rk">${i + 1}</b><input class="mk-input grow" data-s="${i}" value="${esc(s)}" placeholder="${['z. B. Kurs auswählen und buchen', 'z. B. Lernzeit im Kalender blocken', 'z. B. Mentor:in um ein Gespräch bitten'][i]}"></div>`).join('');
        $('fe-steps').querySelectorAll('[data-s]').forEach(i => i.addEventListener('input', () => { S.steps[+i.dataset.s] = i.value; MethodKit.save(); }));
    }
    function renderLinks() { $('fe-links').innerHTML = LINKS.map(l => `<a class="mk-option fe-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }
    function renderAction() { renderGoals(); renderSteps(); renderLinks(); }

    /* ---------- Export ---------- */
    function exportAll() {
        const L = ['FACHLICHE ENTWICKLUNG', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        L.push('STANDORT'); [['Rolle', S.role], ['Vision', S.vision], ['Erfahrung', S.experience], ['Erfolge', S.projects]].forEach(([k, v]) => { if (v) L.push(k + ': ' + v); }); L.push('Gesamt-Level: ' + n(S.level, 5) + '/10', '');
        L.push('SKILL-GAP (sortiert)'); ranked().forEach((s, i) => L.push(`${i + 1}. ${s.name}: ${n(s.ist, 0)} → ${n(s.soll, 0)} (Lücke ${gap(s)}, Prio ${(PRIO[s.prio] || PRIO.mid).l})`));
        if (S.trendChips.length) L.push('Trends: ' + S.trendChips.join(', ')); if (S.trends) L.push('Konsequenz: ' + S.trends); L.push('');
        const plan = pathPlan(); if (plan.length) { L.push(`LERNPFAD (${n(S.hours, 5)} Std./Woche)`); plan.forEach((p, i) => L.push(`${i + 1}. ${p.s.name}: ${p.hours} Std., ~${p.weeks} Wochen, bis ${p.end.toLocaleDateString('de-CH')}${(p.s.formats || []).length ? ' · ' + p.s.formats.join(', ') : S.methods.length ? ' · ' + S.methods.join(', ') : ''}${p.s.note ? ' · ' + p.s.note : ''}`)); L.push(''); }
        if (S.certs.length) { L.push('ZERTIFIKATE'); S.certs.forEach(c => L.push(`- ${c.name}${c.provider ? ' (' + c.provider + ')' : ''} · ${STATUS[c.status]}${c.target ? ' · bis ' + monthLabel(c.target) : ''}`)); L.push(''); }
        if (S.checkins.length) { L.push('CHECK-INS'); S.checkins.forEach(c => L.push(`${fmtDate(c.date)}: Ø ${c.avg.toFixed(1)}`)); L.push(''); }
        if (S.milestones.length) { L.push('MEILENSTEINE'); S.milestones.forEach(m => L.push(`[${m.done ? 'x' : ' '}] ${m.title}${m.date ? ' (' + monthLabel(m.date) + ')' : ''}`)); L.push(''); }
        if (S.deps || S.risks) { L.push('ROADMAP-RAHMEN'); if (S.deps) L.push('Abhängigkeiten: ' + S.deps); if (S.risks) L.push('Risiken: ' + S.risks); L.push(''); }
        L.push('AKTIONSPLAN'); S.goals.forEach((g, i) => { if (g.title) L.push(`Ziel ${i + 1}: ${g.title}${g.metric ? ' · Messkriterium: ' + g.metric : ''}${g.deadline ? ' · bis ' + fmtDate(g.deadline) : ''}`); });
        S.steps.forEach((s, i) => { if (s) L.push(`Schritt ${i + 1}: ${s}`); });
        [['Ressourcen', S.resources], ['Unterstützung', S.support], ['Hindernisse', S.obstacles], ['Motivation', S.motivation], ['Fortschritt im Alltag', S.metrics], ['Belohnung', S.rewards]].forEach(([k, v]) => { if (v) L.push(k + ': ' + v); });
        MethodKit.exportText('fachliche-entwicklung.txt', L.join('\n'));
    }

    /* ---------- Init ---------- */
    (async function () {
        await MethodKit.init({
            method: 'fachliche-entwicklung',
            accent: '#0ea5e9', accent2: '#6366f1',
            steps: [
                { icon: '📍', label: 'Standort' }, { icon: '🔍', label: 'Skill-Gap' }, { icon: '📚', label: 'Lernpfad' },
                { icon: '🏆', label: 'Zertifikate' }, { icon: '📈', label: 'Tracking' }, { icon: '🗺️', label: 'Roadmap' }, { icon: '✅', label: 'Plan' }
            ],
            defaultState: { role: '', vision: '', experience: '', projects: '', level: 5, skills: [], trends: '', trendChips: [], hours: 5, methods: [], certs: [], rhythm: 'weekly', metrics: '', rewards: '', milestones: [], checkins: [], deps: '', risks: '', goals: [{ title: '', metric: '', deadline: '' }, { title: '', metric: '', deadline: '' }, { title: '', metric: '', deadline: '' }], steps: ['', '', ''], resources: '', support: '', obstacles: '', motivation: '' }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.skills) || !S.skills.length) S.skills = DEFAULT_SKILLS.map(([name, ist, soll]) => ({ id: MethodKit.uid(), name, ist, soll, prio: 'mid', formats: [], note: '' }));
        ['trendChips', 'methods', 'certs', 'milestones', 'checkins'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        if (!Array.isArray(S.goals) || S.goals.length !== 3) S.goals = [0, 1, 2].map(i => (S.goals && S.goals[i]) || { title: '', metric: '', deadline: '' });
        if (!Array.isArray(S.steps) || S.steps.length !== 3) S.steps = [0, 1, 2].map(i => (S.steps && S.steps[i]) || '');
        if (!S.rhythm) S.rhythm = 'weekly';

        MethodKit.bindFields();
        renderSkills(); renderRadar();
        $('fe-rhythm').addEventListener('input', renderCheckin);
        $('fe-hours').addEventListener('input', () => { if (MethodKit.step === 3) renderPath(); });

        MethodKit.onStep = function (k) {
            if (k === 1) renderRadar();
            if (k === 2) renderGap();
            if (k === 3) renderPath();
            if (k === 4) renderCerts();
            if (k === 5) renderTracking();
            if (k === 6) renderRoadmap();
            if (k === 7) renderAction();
        };
        MethodKit.onStep(MethodKit.step);
        $('fe-export').addEventListener('click', exportAll);
    })();
})();
