/* =====================================================================
   The How of Happiness · Logik
   Schritte: Kompass → Fit-Diagnostik → Programm → Praxis → Logbuch → Review
   ===================================================================== */
(function () {
    'use strict';

    const D = window.HOH_DATA;
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    const todayKey = () => localKey(new Date());
    function localKey(d) { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); }
    const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
    const FREQS = [
        { id: 'daily', label: 'Daily', days: 1 },
        { id: '3x', label: '3× per week', days: 2 },
        { id: 'weekly', label: '1× per week', days: 7 },
        { id: 'biweekly', label: 'Every 2 weeks', days: 14 },
        { id: 'monthly', label: 'Monthly', days: 30 }
    ];
    const REMEASURE_DAYS = 14;

    const act = (id) => D.ACTIVITIES.find(a => a.id === id);
    const exOf = (aId, eId) => { const a = act(aId); return a && a.exercises.find(e => e.id === eId); };

    let S;

    /* ---------- Fit ---------- */
    function fitScore(aId) {
        const f = S.fit[aId];
        if (!f) return null;
        return D.FIT_DIMS.reduce((s, d) => s + d.sign * (f[d.id] == null ? 4 : f[d.id]), 0);
    }
    function fitTouched(aId) { return !!(S.fit[aId] && S.fit[aId].__t); }
    function ranking() {
        return D.ACTIVITIES.map(a => ({ a, s: fitScore(a.id), t: fitTouched(a.id) }))
            .sort((x, y) => (y.s == null ? -99 : y.s) - (x.s == null ? -99 : x.s));
    }

    /* ---------- SHS ---------- */
    function shsMean(vals) {
        const v = D.SHS.map((it, i) => { const raw = vals[i] == null ? 4 : vals[i]; return it.rev ? 8 - raw : raw; });
        return Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100) / 100;
    }
    function shsInterpret(m) {
        if (m >= 5.6) return 'You are clearly above average (avg. ≈ 4.5–5.5). Goal: hold this level and protect it.';
        if (m >= 4.5) return 'You are in the average range. This is where there is the most room to rise.';
        if (m >= 3.5) return 'You are a little below average – a good reason to practice on purpose.';
        return 'You are clearly below average. The exercises here help – if it feels heavy, also get professional support.';
    }
    function lastShs() { return S.shs.length ? S.shs[S.shs.length - 1] : null; }
    function daysSince(dateKey) { if (!dateKey) return Infinity; return Math.floor((new Date(todayKey()) - new Date(dateKey)) / 86400000); }

    /* ---------- Entries ---------- */
    function entriesFor(aId, exId) { return S.entries.filter(e => e.act === aId && (!exId || e.ex === exId)); }
    function lastEntry(aId) { const l = entriesFor(aId); return l.length ? l[l.length - 1] : null; }
    function dayCounts() { const m = {}; S.entries.forEach(e => { m[e.date] = (m[e.date] || 0) + 1; }); return m; }
    function streak() {
        const m = dayCounts(); let s = 0; const d = new Date();
        if (!m[localKey(d)]) d.setDate(d.getDate() - 1);
        for (;;) { const k = localKey(d); if (m[k]) { s++; d.setDate(d.getDate() - 1); } else break; }
        return s;
    }
    function varietyIndex(days) {
        const since = new Date(); since.setDate(since.getDate() - days);
        const recent = S.entries.filter(e => new Date(e.date) >= since);
        return { total: recent.length, distinct: new Set(recent.map(e => e.ex)).size };
    }
    function isDueToday(aId) {
        const p = S.plan[aId] || {};
        const f = FREQS.find(x => x.id === (p.freq || 'weekly')) || FREQS[2];
        const dow = new Date().getDay();
        if (p.days && p.days.length) return p.days.indexOf(dow) > -1;
        const le = lastEntry(aId);
        return !le || daysSince(le.date) >= f.days;
    }
    function doneToday(aId) { return entriesFor(aId).some(e => e.date === todayKey()); }

    /* =====================================================================
       Schritt 1 · Kompass
       ===================================================================== */
    function renderPie() {
        let acc = 0;
        const stops = D.PIE.map(p => { const s = `${p.color} ${acc}% ${acc + p.pct}%`; acc += p.pct; return s; });
        $('hoh-pie').style.background = `conic-gradient(${stops.join(', ')})`;
        $('hoh-pie-legend').innerHTML = D.PIE.map(p => `<div class="hoh-legend-item"><i style="background:${p.color}"></i><div><strong>${p.pct} % · ${p.label}</strong><div class="d">${p.d}</div></div></div>`).join('');
    }
    function renderShs(hostId, resultId, saveBtnId, draftKey) {
        const host = $(hostId);
        S[draftKey] = S[draftKey] || [4, 4, 4, 4];
        host.innerHTML = D.SHS.map((it, i) => `
            <div class="hoh-shs-item">
                <div class="q">${it.q}</div>
                <div class="mk-range-wrap"><input class="mk-range" type="range" min="1" max="7" step="1" value="${S[draftKey][i]}" data-shs="${i}"><span class="mk-range-val" data-shsv="${i}">${S[draftKey][i]}</span></div>
                <div class="anchors"><span>1 · ${it.lo}</span><span>7 · ${it.hi}</span></div>
            </div>`).join('');
        const upd = () => {
            const m = shsMean(S[draftKey]);
            $(resultId).innerHTML = `<div class="mk-result"><div class="hoh-score"><div class="big">${m.toFixed(2)}</div><div><strong>Subjective Happiness Score</strong><div class="d">${shsInterpret(m)}</div></div></div></div>`;
        };
        host.querySelectorAll('[data-shs]').forEach(el => el.addEventListener('input', () => {
            S[draftKey][+el.dataset.shs] = +el.value;
            host.querySelector(`[data-shsv="${el.dataset.shs}"]`).textContent = el.value;
            MethodKit.save(); upd();
        }));
        upd();
        const btn = $(saveBtnId);
        if (btn) btn.onclick = () => {
            const m = shsMean(S[draftKey]);
            S.shs.push({ date: todayKey(), vals: S[draftKey].slice(), mean: m });
            MethodKit.save({ now: true });
            MethodKit.toast(`Baseline ${m.toFixed(2)} saved`, 'success');
            renderBaselineBadge();
            renderBaselineState(false);
        };
    }
    function renderBaselineBadge() {
        const l = lastShs();
        const r = $('hoh-shs-result');
        if (!l || !r) return;
        const n = S.shs.length;
        const old = $('hoh-baseline-badge'); if (old) old.remove();
        r.insertAdjacentHTML('beforeend', `<div class="mk-note ok" id="hoh-baseline-badge" style="margin-top:10px;"><i class="fas fa-check-circle"></i><div>${n === 1 ? 'Baseline' : n + '. Messung'} from ${fmtDate(l.date)}: <strong>${l.mean.toFixed(2)}</strong>. Next measurement in ${Math.max(0, REMEASURE_DAYS - daysSince(l.date))} days in the review step.</div></div>`);
    }
    /* Kompakter Zustand des Baseline-Blocks, wenn schon gemessen wurde */
    function renderBaselineState(forceForm) {
        const l = lastShs();
        const form = $('hoh-shs'), res = $('hoh-shs-result'), btn = $('hoh-shs-save'), done = $('hoh-shs-done');
        if (!done) return;
        const showForm = forceForm || !l;
        form.hidden = !showForm; res.hidden = !showForm; btn.hidden = !showForm;
        done.hidden = showForm;
        if (!showForm) {
            const ds = daysSince(l.date);
            const prev = S.shs.length > 1 ? S.shs[S.shs.length - 2] : null;
            const diff = prev ? l.mean - prev.mean : null;
            done.innerHTML = `<div class="hoh-baseline-done">
                <div class="hoh-score"><div class="big">${l.mean.toFixed(2)}</div><div><strong>${S.shs.length === 1 ? 'Deine Baseline' : S.shs.length + '. Messung'} · ${fmtDate(l.date)}</strong><div class="d">${shsInterpret(l.mean)}</div>${diff != null ? `<div class="d" style="margin-top:4px;">Veränderung zur Vormessung: <strong style="color:${diff > 0 ? '#059669' : diff < 0 ? '#dc2626' : 'inherit'}">${diff > 0 ? '+' : ''}${diff.toFixed(2)}</strong></div>` : ''}</div></div>
                <div class="hoh-baseline-actions">
                    <span class="mk-faint" style="font-size:13px;"><i class="fas fa-calendar"></i> Next measurement ${ds >= REMEASURE_DAYS ? 'due now' : 'in ' + (REMEASURE_DAYS - ds) + ' Tagen'}</span>
                    <button class="mk-btn mk-btn-outline mk-btn-sm" id="hoh-shs-again"><i class="fas fa-rotate"></i> ${ds >= REMEASURE_DAYS ? 'Jetzt neu messen' : 'Trotzdem neu messen'}</button>
                </div></div>`;
            $('hoh-shs-again').onclick = () => { S.__shsDraft = [4, 4, 4, 4]; renderShs('hoh-shs', 'hoh-shs-result', 'hoh-shs-save', '__shsDraft'); renderBaselineState(true); form.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
        }
    }
    function fmtDate(k) { const d = new Date(k); return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

    /* =====================================================================
       Schritt 2 · Fit-Diagnostik
       ===================================================================== */
    function renderFitToolbar() {
        const tb = $('hoh-fit-toolbar'); if (!tb) return;
        const touched = D.ACTIVITIES.filter(a => fitTouched(a.id)).length;
        tb.innerHTML = `
            <div class="hoh-fit-progress"><span class="mk-badge">${touched}/12 rated</span><div class="hoh-fit-bar"><span style="width:${touched / 12 * 100}%"></span></div></div>
            <div class="hoh-fit-tools">
                ${touched < 12 ? `<button class="mk-btn mk-btn-ghost mk-btn-sm" id="hoh-fit-nextopen"><i class="fas fa-forward-step"></i> Nächste offene</button>` : `<span class="mk-note ok" style="margin:0;padding:6px 12px;font-size:13px;"><i class="fas fa-check"></i> Alle bewertet</span>`}
                <button class="mk-btn mk-btn-outline mk-btn-sm" id="hoh-fit-toggleall"><i class="fas fa-angles-down"></i> Expand all</button>
            </div>`;
        const list = $('hoh-fit-list');
        const nextBtn = $('hoh-fit-nextopen');
        if (nextBtn) nextBtn.onclick = () => {
            const open = D.ACTIVITIES.find(a => !fitTouched(a.id)); if (!open) return;
            list.querySelectorAll('.hoh-fit-act').forEach(el => el.classList.toggle('open', el.dataset.act === open.id));
            const el = list.querySelector(`.hoh-fit-act[data-act="${open.id}"]`);
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        $('hoh-fit-toggleall').onclick = (ev) => {
            const anyClosed = Array.from(list.querySelectorAll('.hoh-fit-act')).some(el => !el.classList.contains('open'));
            list.querySelectorAll('.hoh-fit-act').forEach(el => el.classList.toggle('open', anyClosed));
            ev.currentTarget.innerHTML = anyClosed ? '<i class="fas fa-angles-up"></i> Collapse all' : '<i class="fas fa-angles-down"></i> Expand all';
        };
    }
    function renderFit() {
        const host = $('hoh-fit-list');
        host.innerHTML = D.ACTIVITIES.map(a => {
            const f = S.fit[a.id] || {};
            const sc = fitScore(a.id);
            return `<div class="hoh-fit-act ${fitTouched(a.id) ? 'touched' : ''}" data-act="${a.id}" style="--act:${a.color}">
                <div class="hoh-fit-head">
                    <span class="ic">${a.ic}</span>
                    <div class="t">${a.n}. ${a.title}<small>${a.short}</small></div>
                    <span class="hoh-fit-score ${scoreClass(a.id)}" data-score="${a.id}">${sc == null ? '–' : (sc > 0 ? '+' : '') + sc}</span>
                    <i class="fas fa-chevron-down chev"></i>
                </div>
                <div class="hoh-fit-body">
                    ${D.FIT_DIMS.map(d => `
                        <div class="hoh-dim">
                            <span class="lbl ${d.sign < 0 ? 'neg' : ''}">${d.sign < 0 ? '−' : '+'} ${d.label}</span>
                            <input class="mk-range" type="range" min="1" max="7" value="${f[d.id] == null ? 4 : f[d.id]}" data-fa="${a.id}" data-fd="${d.id}">
                            <span class="val" data-fv="${a.id}-${d.id}">${f[d.id] == null ? 4 : f[d.id]}</span>
                            <div class="q">${d.q}</div>
                        </div>`).join('')}
                </div>
            </div>`;
        }).join('');
        host.querySelectorAll('.hoh-fit-head').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('open')));
        host.querySelectorAll('[data-fa]').forEach(el => el.addEventListener('input', () => {
            const a = el.dataset.fa, d = el.dataset.fd;
            S.fit[a] = S.fit[a] || {};
            const wasTouched = !!S.fit[a].__t;
            S.fit[a][d] = +el.value; S.fit[a].__t = 1;
            host.querySelector(`[data-fv="${a}-${d}"]`).textContent = el.value;
            const sc = fitScore(a), b = host.querySelector(`[data-score="${a}"]`);
            b.textContent = (sc > 0 ? '+' : '') + sc; b.className = 'hoh-fit-score ' + scoreClass(a);
            el.closest('.hoh-fit-act').classList.add('touched');
            MethodKit.save(); renderRanking();
            if (!wasTouched) renderFitToolbar();
        }));
        renderFitToolbar();
        renderRanking();
    }
    function scoreClass(aId) {
        const sc = fitScore(aId);
        if (!fitTouched(aId)) return 'untouched';
        return sc > 4 ? 'pos' : sc < 0 ? 'neg' : '';
    }
    function renderRanking() {
        const host = $('hoh-fit-ranking');
        const r = ranking();
        const touched = r.filter(x => x.t).length;
        if (!touched) { host.innerHTML = '<div class="mk-empty">Rate at least one activity above – the ranking updates live.</div>'; return; }
        const max = 19, min = -11, span = max - min;
        host.innerHTML = (touched < 12 ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><div>${touched} of 12 rated. For a reliable ranking, go through all 12 – it takes about 10 minutes.</div></div>` : '') +
            r.map((x, i) => {
                const s = x.s == null ? 0 : x.s;
                const zero = ((0 - min) / span) * 100, pos = ((s - min) / span) * 100;
                const left = Math.min(zero, pos), width = Math.abs(pos - zero);
                return `<div class="hoh-rank ${i < 4 && x.t ? 'top' : ''}" style="${x.t ? '' : 'opacity:.4'}">
                    <span class="n">${i + 1}</span><span class="ic">${x.a.ic}</span><span class="t">${x.a.title}</span>
                    <div class="bar"><span style="left:${left}%;width:${width}%;background:${s >= 0 ? x.a.color : '#dc2626'}"></span></div>
                    <span class="s">${x.t ? (s > 0 ? '+' : '') + s : '–'}</span>
                </div>`;
            }).join('') +
            `<div class="mk-note ok" style="margin-top:12px;"><i class="fas fa-lightbulb"></i><div>Your top 4: <strong>${r.filter(x => x.t).slice(0, 4).map(x => x.a.title).join(', ')}</strong>. In the next step you can adopt or adjust them.</div></div>`;
    }

    /* =====================================================================
       Schritt 3 · Programm
       ===================================================================== */
    function renderProgram() {
        if (!S.selected.length && !S.__autoSelected) {
            const top = ranking().filter(x => x.t).slice(0, 4).map(x => x.a.id);
            if (top.length) { S.selected = top; S.__autoSelected = 1; MethodKit.save(); }
        }
        const host = $('hoh-select');
        host.innerHTML = D.ACTIVITIES.map(a => {
            const sc = fitScore(a.id), t = fitTouched(a.id);
            return `<button class="mk-chip ${S.selected.indexOf(a.id) > -1 ? 'selected' : ''}" data-sel="${a.id}">${a.ic} ${a.title}${t ? ` <span style="opacity:.7">(${sc > 0 ? '+' : ''}${sc})</span>` : ''}</button>`;
        }).join('');
        host.querySelectorAll('[data-sel]').forEach(b => b.addEventListener('click', () => {
            const id = b.dataset.sel, i = S.selected.indexOf(id);
            if (i > -1) S.selected.splice(i, 1); else S.selected.push(id);
            if (!S.plan[id]) S.plan[id] = { freq: defaultFreq(id), days: [] };
            MethodKit.save(); renderProgram();
        }));
        renderSelectHints();
        renderPlan();
    }
    function defaultFreq(id) {
        return ({ gratitude: 'weekly', kindness: 'weekly', body: 'daily', savoring: 'daily', relationships: 'daily', optimism: '3x', overthinking: 'daily', flow: 'daily', goals: 'weekly', spirituality: 'daily', coping: '3x', forgiveness: 'weekly' })[id] || 'weekly';
    }
    function renderSelectHints() {
        const h = $('hoh-select-hints'); const hints = [];
        if (!S.selected.length) hints.push(['info', 'Choose at least one activity. Your fit ranking suggests the ones that fit.']);
        if (S.selected.length > 4) hints.push(['warn', `${S.selected.length} activities is a lot. Lyubomirsky recommends four at most – otherwise none become a habit.`]);
        S.selected.forEach(id => { if (fitTouched(id) && fitScore(id) < 0) hints.push(['warn', `<strong>${act(id).title}</strong> has a negative fit score – you'd do it more out of duty. That rarely lasts.`]); });
        const lowDiversity = S.selected.length >= 2 && S.selected.every(id => ['body', 'spirituality', 'savoring'].indexOf(id) > -1);
        if (lowDiversity) hints.push(['info', 'All chosen activities lean inward. A social one (kindness, relationships, gratitude) complements them well.']);
        if (S.selected.length >= 1 && S.selected.length <= 4 && !hints.some(x => x[0] === 'warn')) hints.push(['ok', `${S.selected.length} ${S.selected.length === 1 ? 'Aktivität' : 'Aktivitäten'} – a good size. Set below when you'll practice.`]);
        h.innerHTML = hints.map(x => `<div class="mk-note ${x[0]}"><i class="fas fa-${x[0] === 'warn' ? 'triangle-exclamation' : x[0] === 'ok' ? 'check-circle' : 'info-circle'}"></i><div>${x[1]}</div></div>`).join('');
    }
    function weeklyMinutes() {
        return S.selected.reduce((sum, id) => {
            const a = act(id), p = S.plan[id] || {}; const f = FREQS.find(x => x.id === p.freq) || FREQS[2];
            const per = p.days && p.days.length ? p.days.length : Math.round(7 / f.days * 10) / 10;
            const avg = a.exercises.reduce((s, e) => s + e.min, 0) / a.exercises.length;
            return sum + per * Math.min(avg, 20);
        }, 0);
    }
    function renderPlan() {
        const host = $('hoh-plan');
        if (!S.selected.length) { host.innerHTML = ''; return; }
        const mins = Math.round(weeklyMinutes());
        host.innerHTML = `<div class="hoh-plan-summary"><div><strong>${S.selected.length} ${S.selected.length === 1 ? 'Aktivität' : 'Aktivitäten'}</strong> · approx. <strong>${mins} min per week</strong></div><div class="mk-faint" style="font-size:13px;">${mins > 150 ? 'Das ist ambitioniert – lieber kleiner anfangen und steigern.' : mins < 30 ? 'Sehr schlank. Gut zum Starten, später gern ausbauen.' : 'Realistischer Umfang – gut machbar neben dem Alltag.'}</div></div>` + S.selected.map(id => {
            const a = act(id); const p = S.plan[id] = S.plan[id] || { freq: defaultFreq(id), days: [] };
            return `<div class="mk-card hoh-planact" style="border-left-color:${a.color}">
                <h3><span style="font-size:22px">${a.ic}</span> ${a.title}</h3>
                <div class="hoh-plan-row">
                    <div class="mk-field"><label>Rhythm</label>
                        <select class="mk-select" data-freq="${id}">${FREQS.map(f => `<option value="${f.id}" ${p.freq === f.id ? 'selected' : ''}>${f.label}</option>`).join('')}</select>
                    </div>
                    <div class="mk-field"><label>Fixed days <span class="hint">(optional)</span></label>
                        <div class="hoh-days">${DAY_ORDER.map(d => `<button class="hoh-day ${p.days.indexOf(d) > -1 ? 'on' : ''}" data-day="${d}" data-dact="${id}">${DAY_LABELS[d]}</button>`).join('')}</div>
                    </div>
                </div>
                <div class="mk-field"><label>Trigger <span class="hint">(If-then: after which fixed moment in your day?)</span></label>
                    <input class="mk-input" data-cue="${id}" value="${esc(p.cue || '')}" placeholder="e.g. “Sunday evening after dinner" oder „direkt nach dem ersten Kaffee"">
                </div>
                <div class="hoh-dose"><i class="fas fa-flask"></i> <strong>Dosage according to research:</strong> ${a.dose}</div>
            </div>`;
        }).join('');
        host.querySelectorAll('[data-freq]').forEach(el => el.addEventListener('change', () => { S.plan[el.dataset.freq].freq = el.value; MethodKit.save(); renderPlan(); }));
        host.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', () => {
            const p = S.plan[b.dataset.dact], d = +b.dataset.day, i = p.days.indexOf(d);
            if (i > -1) p.days.splice(i, 1); else p.days.push(d);
            MethodKit.save(); renderPlan();
        }));
        host.querySelectorAll('[data-cue]').forEach(el => el.addEventListener('input', () => { S.plan[el.dataset.cue].cue = el.value; MethodKit.save(); }));
    }

    /* =====================================================================
       Schritt 4 · Praxis
       ===================================================================== */
    function renderPractice() {
        const th = $('hoh-today');
        if (!S.selected.length) {
            th.innerHTML = '<div class="mk-empty">No program yet. Choose your activities in the “Program” step – or try an exercise freely below.</div>';
        } else {
            const due = S.selected.filter(id => doneToday(id) || isDueToday(id));
            const v = varietyIndex(14);
            const open = due.filter(id => !doneToday(id)).length;
            $('hoh-today-sub').textContent = open ? `${open} ${open === 1 ? 'Aktivität steht' : 'Aktivitäten stehen'} due today. Suggested is always the exercise that has waited the longest.` : 'Everything on today\'s plan is done. Below you will find all activities if you feel like more.';
            let html = due.length ? due.map(id => {
                const a = act(id), p = S.plan[id] || {}, dn = doneToday(id);
                const sug = suggestExercise(id);
                return `<div class="hoh-today-item ${dn ? 'done' : ''}" style="--act:${a.color}"><span class="ic">${a.ic}</span><div class="t">${a.title}<small>${dn ? 'Done today' : `Vorschlag: <strong>${sug.title}</strong> · ${sug.min} Min`}${p.cue ? ` · ${esc(p.cue)}` : ''}</small></div>${dn ? '<span class="hoh-done-tag"><i class="fas fa-check"></i> done</span>' : `<div class="hoh-today-actions"><button class="mk-btn mk-btn-primary mk-btn-sm" data-start="${id}:${sug.id}"><i class="fas fa-play"></i> Start</button><button class="mk-btn mk-btn-outline mk-btn-sm" data-jump="${id}" title="Choose another exercise"><i class="fas fa-list"></i></button></div>`}</div>`;
            }).join('') : '<div class="mk-note ok"><i class="fas fa-mug-hot"></i><div>Nothing is on the plan today. A free day – or pick something spontaneously below.</div></div>';
            if (v.total >= 5 && v.distinct <= 2) html += `<div class="mk-note warn" style="margin-top:10px;"><i class="fas fa-shuffle"></i><div><strong>Variety warning:</strong> In the last 14 days you did ${v.total} exercises, but only ${v.distinct} different ones. Hedonic adaptation is looming – switch the exercise, the place, or the form.</div></div>`;
            th.innerHTML = html;
            th.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => {
                const m = document.querySelector(`.hoh-module[data-mod="${b.dataset.jump}"]`);
                if (m) { m.scrollIntoView({ behavior: 'smooth', block: 'start' }); m.querySelector('[data-tab="ex"]').click(); }
            }));
            th.querySelectorAll('[data-start]').forEach(b => b.addEventListener('click', () => { const [a, e] = b.dataset.start.split(':'); openExercise(a, e); }));
        }
        renderModules();
    }
    /* Smarter Vorschlag: die Übung der Aktivität, die am längsten nicht gemacht wurde (nie gemachte zuerst, in Buch-Reihenfolge) */
    function suggestExercise(aId) {
        const a = act(aId);
        let best = null, bestTs = Infinity;
        a.exercises.forEach((e, i) => {
            const l = entriesFor(aId, e.id).slice(-1)[0];
            const ts = l ? (l.ts || new Date(l.date).getTime()) : -1e12 + i; // nie gemacht → ganz vorne, stabil sortiert
            if (ts < bestTs) { bestTs = ts; best = e; }
        });
        return best || a.exercises[0];
    }
    function renderModules() {
        const host = $('hoh-modules');
        const order = S.selected.concat(D.ACTIVITIES.map(a => a.id).filter(id => S.selected.indexOf(id) < 0));
        host.innerHTML = (S.selected.length ? `<h3 style="margin:6px 0 10px;color:var(--mk-muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em;">Your program</h3>` : '') +
            order.map((id, idx) => {
                const a = act(id); const inProg = S.selected.indexOf(id) > -1;
                const divider = (!inProg && (idx === 0 || S.selected.indexOf(order[idx - 1]) > -1)) ? `<h3 style="margin:22px 0 10px;color:var(--mk-muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em;">All further activities</h3>` : '';
                const le = lastEntry(id);
                return divider + `<div class="mk-card hoh-module" data-mod="${id}" style="border-top-color:${a.color}">
                    <div class="hoh-module-head"><span class="ic">${a.ic}</span><div style="flex:1"><h3>${a.n}. ${a.title}</h3><p>${a.short}${le ? ` · zuletzt ${fmtDate(le.date)}` : ''}</p></div>${inProg ? '<span class="mk-badge">im Programm</span>' : ''}</div>
                    <div class="hoh-module-tabs">
                        <button class="hoh-module-tab on" data-tab="ex">Exercises (${a.exercises.length})</button>
                        <button class="hoh-module-tab" data-tab="why">Why it works</button>
                        <button class="hoh-module-tab" data-tab="res">Research</button>
                        <button class="hoh-module-tab" data-tab="link">Related methods</button>
                    </div>
                    <div class="hoh-module-pane on" data-pane="ex">
                        ${a.exercises.map(e => { const cnt = entriesFor(id, e.id).length; const l = cnt ? entriesFor(id, e.id).slice(-1)[0] : null; return `<div class="hoh-ex ${l && daysSince(l.date) <= 1 ? 'recent' : ''}"><div class="t"><strong>${e.title}</strong><small>⏱ ${e.min} Min · ${e.dose}${e.timer ? ' · with timer' : ''}</small></div>${cnt ? `<span class="cnt">${cnt}×</span>` : ''}<button class="mk-btn mk-btn-primary mk-btn-sm" data-start="${id}:${e.id}"><i class="fas fa-play"></i> Start</button></div>`;
                        }).join('')}
                    </div>
                    <div class="hoh-module-pane" data-pane="why"><p>${a.why}</p><div class="hoh-dose"><i class="fas fa-flask"></i> <strong>Dosage:</strong> ${a.dose}</div></div>
                    <div class="hoh-module-pane" data-pane="res"><p>${a.research}</p></div>
                    <div class="hoh-module-pane" data-pane="link"><p>Deepen this activity with existing workflows:</p><div class="hoh-links">${a.links.map(l => `<a href="${D.METHOD_PATHS[l.m] || '#'}"><i class="fas fa-arrow-up-right-from-square"></i> ${l.l}</a>`).join('')}<a href="${D.METHOD_PATHS['habit-building']}"><i class="fas fa-repeat"></i> Turn it into a habit</a></div></div>
                </div>`;
            }).join('');
        host.querySelectorAll('.hoh-module-tab').forEach(t => t.addEventListener('click', () => {
            const m = t.closest('.hoh-module');
            m.querySelectorAll('.hoh-module-tab').forEach(x => x.classList.toggle('on', x === t));
            m.querySelectorAll('.hoh-module-pane').forEach(p => p.classList.toggle('on', p.dataset.pane === t.dataset.tab));
        }));
        host.querySelectorAll('[data-start]').forEach(b => b.addEventListener('click', () => { const [a, e] = b.dataset.start.split(':'); openExercise(a, e); }));
    }

    /* ---------- Übungs-Overlay ---------- */
    let EX = null, timerIv = null;
    function openExercise(aId, eId) {
        const a = act(aId), e = exOf(aId, eId); if (!a || !e) return;
        EX = { a, e, before: 5, after: 5, startedAt: Date.now(), timerLeft: e.timer * 60, timerRunning: false, timerDone: false };
        $('hoh-ex-title').textContent = `${a.ic} ${e.title}`;
        $('hoh-ex-body').innerHTML = `
            <div class="hoh-ex-meta"><span class="mk-badge">⏱ ${e.min} min</span><span class="mk-badge">${e.dose}</span><span class="mk-badge">${a.title}</span></div>
            <div class="hoh-ex-intro">${e.intro}</div>
            <div class="hoh-mood"><label>Mood before</label><div class="mk-range-wrap" style="flex:1"><input class="mk-range" type="range" min="1" max="10" value="5" id="hoh-before"><span class="mk-range-val" id="hoh-before-v">5</span></div></div>
            ${e.timer ? `<div class="hoh-timer" id="hoh-timer"><div class="time" id="hoh-timer-t">${fmtT(EX.timerLeft)}</div><div class="ctr"><button class="mk-btn mk-btn-primary mk-btn-sm" id="hoh-timer-start"><i class="fas fa-play"></i> Timer starten</button><button class="mk-btn mk-btn-outline mk-btn-sm" id="hoh-timer-reset"><i class="fas fa-rotate-left"></i></button></div></div>` : ''}
            ${e.prompts.map((p, i) => `<div class="mk-field"><label>${esc(p.l)}</label><textarea class="mk-textarea" data-ans="${i}" placeholder="${esc(p.p)}" style="min-height:${e.prompts.length > 4 ? 60 : 90}px"></textarea></div>`).join('')}
            <div class="hoh-ex-tip"><i class="fas fa-lightbulb"></i> ${e.tip}</div>
            <div class="hoh-mood"><label>Mood after</label><div class="mk-range-wrap" style="flex:1"><input class="mk-range" type="range" min="1" max="10" value="5" id="hoh-after"><span class="mk-range-val" id="hoh-after-v">5</span></div></div>`;
        $('hoh-before').addEventListener('input', ev => { EX.before = +ev.target.value; $('hoh-before-v').textContent = ev.target.value; });
        $('hoh-after').addEventListener('input', ev => { EX.after = +ev.target.value; $('hoh-after-v').textContent = ev.target.value; });
        if (e.timer) {
            $('hoh-timer-start').addEventListener('click', toggleTimer);
            $('hoh-timer-reset').addEventListener('click', () => { stopTimer(); EX.timerLeft = e.timer * 60; EX.timerDone = false; $('hoh-timer').className = 'hoh-timer'; $('hoh-timer-t').textContent = fmtT(EX.timerLeft); });
        }
        $('hoh-overlay').hidden = false; document.body.style.overflow = 'hidden';
        $('hoh-ex-body').scrollTop = 0;
    }
    function fmtT(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
    function toggleTimer() {
        if (EX.timerRunning) { stopTimer(); return; }
        EX.timerRunning = true; $('hoh-timer').classList.add('running');
        $('hoh-timer-start').innerHTML = '<i class="fas fa-pause"></i> Pause';
        timerIv = setInterval(() => {
            EX.timerLeft--; $('hoh-timer-t').textContent = fmtT(Math.max(0, EX.timerLeft));
            if (EX.timerLeft <= 0) { stopTimer(); EX.timerDone = true; $('hoh-timer').classList.add('finished'); MethodKit.toast('Time\'s up – finish the exercise at your pace', 'success'); if (navigator.vibrate) { try { navigator.vibrate([80, 60, 80]); } catch (x) {} } }
        }, 1000);
    }
    function stopTimer() { clearInterval(timerIv); timerIv = null; if (EX) EX.timerRunning = false; const t = $('hoh-timer'); if (t) t.classList.remove('running'); const b = $('hoh-timer-start'); if (b) b.innerHTML = '<i class="fas fa-play"></i> Next'; }
    function closeExercise() { stopTimer(); EX = null; $('hoh-overlay').hidden = true; document.body.style.overflow = ''; }
    function finishExercise() {
        if (!EX) return;
        const answers = Array.from(document.querySelectorAll('[data-ans]')).map(t => t.value.trim());
        if (!answers.some(Boolean) && !EX.timerDone) { MethodKit.toast('Write at least one sentence – or let the timer run', 'error'); return; }
        const minutes = Math.max(1, Math.round((Date.now() - EX.startedAt) / 60000));
        S.entries.push({ id: MethodKit.uid(), date: todayKey(), ts: Date.now(), act: EX.a.id, ex: EX.e.id, answers, before: EX.before, after: EX.after, minutes });
        MethodKit.save({ now: true });
        const delta = EX.after - EX.before;
        closeExercise();
        MethodKit.toast(delta > 0 ? `Saved · Mood +${delta} · 🔥 ${streak()} days` : `Saved · 🔥 ${streak()} days`, 'success');
        renderPractice();
    }

    /* =====================================================================
       Schritt 5 · Logbuch
       ===================================================================== */
    let logFilter = 'all';
    function renderLog() {
        const n = S.entries.length;
        const deltas = S.entries.filter(e => e.before != null && e.after != null).map(e => e.after - e.before);
        const avgDelta = deltas.length ? (deltas.reduce((a, b) => a + b, 0) / deltas.length) : 0;
        const minutes = S.entries.reduce((a, e) => a + (e.minutes || 0), 0);
        const v = varietyIndex(14);
        $('hoh-stats').innerHTML = [
            [n, 'Exercises total'], [streak(), 'day streak 🔥'], [Object.keys(dayCounts()).length, 'active days'],
            [(avgDelta >= 0 ? '+' : '') + avgDelta.toFixed(1), 'Avg. mood delta'], [minutes >= 60 ? Math.round(minutes / 60) + ' h' : minutes + ' min', 'time invested'], [`${v.distinct}/${v.total}`, 'Variety (14 days)']
        ].map(x => `<div class="hoh-stat"><div class="v">${x[0]}</div><div class="l">${x[1]}</div></div>`).join('');

        // Heatmap: 12 Wochen, Spalten = Wochen, Zeilen = Mo..So
        const dc = dayCounts(); const cells = []; const today = new Date(); const tk = todayKey();
        const end = new Date(today); const dowEnd = (end.getDay() + 6) % 7; end.setDate(end.getDate() + (6 - dowEnd));
        const start = new Date(end); start.setDate(start.getDate() - 7 * 12 + 1);
        const months = []; let lastM = -1;
        for (let d = new Date(start), i = 0; d <= end; d.setDate(d.getDate() + 1), i++) {
            const k = localKey(d); const c = dc[k] || 0; const future = d > today;
            if (i % 7 === 0) { const mid = new Date(d); mid.setDate(mid.getDate() + 3); const m = mid.getMonth(); months.push(m !== lastM ? mid.toLocaleDateString('en-GB', { month: 'short' }) : ''); lastM = m; }
            cells.push(`<i class="${c >= 3 ? 'l3' : c === 2 ? 'l2' : c === 1 ? 'l1' : 'l0'} ${k === tk ? 'today' : ''}" style="${future ? 'opacity:.25' : ''}" title="${fmtDate(k)}: ${c} Exercise${c === 1 ? '' : 'en'}"></i>`);
        }
        $('hoh-heat').innerHTML = cells.join('');
        const ml = $('hoh-heat-months'); if (ml) ml.innerHTML = months.map(m => `<span>${m}</span>`).join('');

        // Filter
        const used = Array.from(new Set(S.entries.map(e => e.act)));
        $('hoh-log-filter').innerHTML = `<button class="mk-chip ${logFilter === 'all' ? 'selected' : ''}" data-lf="all">All</button>` + used.map(id => `<button class="mk-chip ${logFilter === id ? 'selected' : ''}" data-lf="${id}">${act(id).ic} ${act(id).title}</button>`).join('');
        $('hoh-log-filter').querySelectorAll('[data-lf]').forEach(b => b.addEventListener('click', () => { logFilter = b.dataset.lf; renderLog(); }));

        const list = S.entries.filter(e => logFilter === 'all' || e.act === logFilter).slice().reverse();
        const host = $('hoh-log');
        if (!list.length) { host.innerHTML = '<div class="mk-empty">No entries yet. Start an exercise in the “Practice” step.</div>'; return; }
        host.innerHTML = list.slice(0, 60).map(e => {
            const a = act(e.act), ex = exOf(e.act, e.ex); const d = (e.after != null && e.before != null) ? e.after - e.before : null;
            return `<div class="hoh-entry" data-eid="${e.id}">
                <div class="hoh-entry-head"><span class="ic">${a ? a.ic : '•'}</span><div class="t">${ex ? ex.title : e.ex}<small>${fmtDate(e.date)} · ${a ? a.title : ''} · ${e.minutes || 0} min</small></div>${d != null ? `<span class="delta ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? '+' : ''}${d}</span>` : ''}<button class="mk-iconbtn" data-del="${e.id}" title="Delete"><i class="fas fa-trash"></i></button></div>
                <div class="hoh-entry-body">${ex ? ex.prompts.map((p, i) => e.answers[i] ? `<div class="a"><strong>${esc(p.l)}</strong><span>${esc(e.answers[i])}</span></div>` : '').join('') : ''}${e.answers.every(x => !x) ? '<div class="mk-faint">Ohne Notizen (Timer-Übung).</div>' : ''}</div>
            </div>`;
        }).join('') + (list.length > 60 ? `<div class="mk-faint" style="text-align:center;padding:8px">… and ${list.length - 60} older entries (included in the export)</div>` : '');
        host.querySelectorAll('.hoh-entry-head').forEach(h => h.addEventListener('click', ev => { if (ev.target.closest('[data-del]')) return; h.parentElement.classList.toggle('open'); }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
            if (!confirm('Really delete this entry?')) return;
            S.entries = S.entries.filter(x => x.id !== b.dataset.del); MethodKit.save({ now: true }); renderLog();
        }));
    }

    /* =====================================================================
       Schritt 6 · Review
       ===================================================================== */
    function renderReview() {
        const ch = $('hoh-shs-chart');
        if (S.shs.length < 2) {
            ch.innerHTML = S.shs.length ? `<div class="mk-result"><h4>One measurement so far</h4>Baseline ${S.shs[0].mean.toFixed(2)} from ${fmtDate(S.shs[0].date)}. After the second measurement, your trend appears here.</div>` : '<div class="mk-empty">No baseline yet. Measure it first in the “Compass” step.</div>';
        } else {
            const W = 600, H = 170, P = 28; const n = S.shs.length;
            const x = i => P + (i / (n - 1)) * (W - 2 * P), y = v => H - P - ((v - 1) / 6) * (H - 2 * P);
            const pts = S.shs.map((s, i) => `${x(i)},${y(s.mean)}`).join(' ');
            const first = S.shs[0].mean, last = S.shs[n - 1].mean, diff = last - first;
            ch.innerHTML = `<svg class="hoh-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
                ${[1, 2, 3, 4, 5, 6, 7].map(v => `<line x1="${P}" x2="${W - P}" y1="${y(v)}" y2="${y(v)}" stroke="#e6eaf1" stroke-width="1"/><text x="${P - 8}" y="${y(v) + 4}" font-size="10" fill="#94a3b8" text-anchor="end">${v}</text>`).join('')}
                <rect x="${P}" y="${y(5.5)}" width="${W - 2 * P}" height="${y(4.5) - y(5.5)}" fill="rgba(245,158,11,.08)"/>
                <polyline points="${pts}" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
                ${S.shs.map((s, i) => `<circle cx="${x(i)}" cy="${y(s.mean)}" r="5" fill="#fff" stroke="#f59e0b" stroke-width="3"><title>${fmtDate(s.date)}: ${s.mean.toFixed(2)}</title></circle>`).join('')}
            </svg>
            <div class="mk-result" style="margin-top:10px;"><h4>Trend</h4>From <strong>${first.toFixed(2)}</strong> (${fmtDate(S.shs[0].date)}) auf <strong>${last.toFixed(2)}</strong> (${fmtDate(S.shs[n - 1].date)}): <strong style="color:${diff > 0 ? '#059669' : diff < 0 ? '#dc2626' : 'inherit'}">${diff > 0 ? '+' : ''}${diff.toFixed(2)}</strong>. ${diff >= 0.5 ? 'Das ist ein spürbarer Effekt – bleib dran.' : diff > 0 ? 'Kleiner, positiver Trend. Glück wächst langsam.' : diff === 0 ? 'Stabil. Prüfe unten die fünf Hows – oft fehlt Vielfalt oder Dosis.' : 'Rückgang – das kann an äusseren Umständen liegen. Prüfe die fünf Hows und ob deine Aktivitäten noch passen.'}<br><span class="mk-faint">Shaded area = population average 4.5–5.5.</span></div>`;
        }
        const l = lastShs(); const rm = $('hoh-remeasure'); const ds = daysSince(l ? l.date : null);
        if (!l) rm.innerHTML = '';
        else if (ds >= REMEASURE_DAYS) {
            rm.innerHTML = `<div class="mk-note info" style="margin-top:14px;"><i class="fas fa-ruler"></i><div><strong>Time for a new measurement</strong> – the last one is ${ds} days ago.</div></div><div id="hoh-shs2"></div><div id="hoh-shs2-result"></div><button class="mk-btn mk-btn-primary" id="hoh-shs2-save" style="margin-top:12px;"><i class="fas fa-check"></i> Save measurement</button>`;
            S.__shsDraft2 = [4, 4, 4, 4];
            renderShs('hoh-shs2', 'hoh-shs2-result', null, '__shsDraft2');
            $('hoh-shs2-save').onclick = () => { const m = shsMean(S.__shsDraft2); S.shs.push({ date: todayKey(), vals: S.__shsDraft2.slice(), mean: m }); MethodKit.save({ now: true }); MethodKit.toast(`Measurement ${m.toFixed(2)} saved`, 'success'); renderReview(); };
        } else rm.innerHTML = `<div class="mk-note ok" style="margin-top:14px;"><i class="fas fa-calendar-check"></i><div>Last measurement ${ds} Day${ds === 1 ? '' : 'en'}. Next measurement in ${REMEASURE_DAYS - ds} days ago – measuring in between doesn't help, happiness fluctuates day to day.</div></div>`;

        // Five Hows mit automatischen Signalen aus den Daten
        const v = varietyIndex(14);
        const deltas = S.entries.map(e => e.after - e.before).filter(x => !isNaN(x));
        const avgDelta = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null;
        const cues = S.selected.filter(id => S.plan[id] && S.plan[id].cue).length;
        const auto = {
            emotion: avgDelta == null ? 'No data yet – every exercise asks for mood before/after.' : `Your avg. mood delta over ${deltas.length} ${deltas.length === 1 ? 'Übung' : 'Übungen'}: <strong>${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(1)}</strong>. ${avgDelta >= 1 ? 'Die Übungen tun dir messbar gut.' : avgDelta > 0 ? 'Leicht positiv – prüfe, welche Übungen am stärksten wirken (Logbuch).' : 'Kaum Effekt – vielleicht passen die Aktivitäten nicht (Fit-Diagnostik wiederholen).'}`,
            timing: v.total ? `Last 14 days: ${v.distinct} different exercises across ${v.total} Durchgängen. ${v.total >= 5 && v.distinct <= 2 ? '<strong>Zu wenig Vielfalt.</strong>' : v.distinct >= 3 ? 'Gute Abwechslung.' : ''}` : 'No exercises in the last 14 days.',
            social: '',
            effort: `${S.entries.length} exercises, ${streak()} day streak, ${Object.keys(dayCounts()).length} active days.`,
            habit: S.selected.length ? `${cues} of ${S.selected.length} activities have a trigger (if-then) set.${cues < S.selected.length ? ' Ergänze die fehlenden im Schritt „Programm".' : ''}` : ''
        };
        $('hoh-hows').innerHTML = D.HOWS.map(h => `<div class="hoh-how"><span class="ic">${h.ic}</span><div class="t"><strong>${h.title}</strong><div class="q">${h.q}</div><div class="d">${h.d}</div>${auto[h.id] ? `<div class="auto"><i class="fas fa-chart-simple"></i> ${auto[h.id]}</div>` : ''}<input class="mk-input" style="margin-top:8px;font-size:13px;padding:8px 12px" data-hown="${h.id}" value="${esc(S.howsNotes[h.id] || '')}" placeholder="My note / my next step for this …"></div><button class="chk ${S.hows[h.id] ? 'on' : ''}" data-how="${h.id}" title="Erfüllt">${S.hows[h.id] ? '<i class="fas fa-check"></i>' : ''}</button></div>`).join('');
        $('hoh-hows').querySelectorAll('[data-how]').forEach(b => b.addEventListener('click', () => { S.hows[b.dataset.how] = !S.hows[b.dataset.how]; MethodKit.save(); renderReview(); }));
        $('hoh-hows').querySelectorAll('[data-hown]').forEach(i => i.addEventListener('input', () => { S.howsNotes[i.dataset.hown] = i.value; MethodKit.save(); }));
    }

    /* ---------- Export ---------- */
    function exportAll() {
        let t = 'THE HOW OF HAPPINESS – MY PROGRAM\n====================================\n\n';
        t += 'HAPPINESS BASELINE (Subjective Happiness Scale, 1–7)\n';
        S.shs.forEach(s => { t += `  ${fmtDate(s.date)}: ${s.mean.toFixed(2)}\n`; });
        if (!S.shs.length) t += '  (no measurement yet)\n';
        t += '\nFIT-RANKING\n';
        ranking().forEach((x, i) => { t += `  ${i + 1}. ${x.a.title}: ${x.t ? (x.s > 0 ? '+' : '') + x.s : '–'}\n`; });
        t += '\nMY PROGRAM\n';
        S.selected.forEach(id => { const a = act(id), p = S.plan[id] || {}; t += `  ${a.ic} ${a.title} – ${(FREQS.find(f => f.id === p.freq) || FREQS[2]).label}${p.days && p.days.length ? ' (' + p.days.map(d => DAY_LABELS[d]).join(', ') + ')' : ''}${p.cue ? ' – Auslöser: ' + p.cue : ''}\n Dosage: ${a.dose}\n`; });
        if (!S.selected.length) t += '  (nothing chosen yet)\n';
        t += '\nTHE FIVE HOWS\n';
        D.HOWS.forEach(h => { t += `  [${S.hows[h.id] ? 'x' : ' '}] ${h.title}${S.howsNotes[h.id] ? ' – ' + S.howsNotes[h.id] : ''}\n`; });
        t += `\nLOG (${S.entries.length} entries, streak ${streak()} days)\n`;
        S.entries.forEach(e => {
            const a = act(e.act), ex = exOf(e.act, e.ex);
            t += `\n${fmtDate(e.date)} · ${a ? a.title : e.act} · ${ex ? ex.title : e.ex} · Mood ${e.before}→${e.after} · ${e.minutes} min\n`;
            if (ex) ex.prompts.forEach((p, i) => { if (e.answers[i]) t += `  ${p.l}\n    ${e.answers[i].replace(/\n/g, '\n    ')}\n`; });
        });
        MethodKit.exportText('how-of-happiness.txt', t);
    }

    /* =====================================================================
       Init
       ===================================================================== */
    (async function init() {
        await MethodKit.init({
            method: 'how-of-happiness',
            accent: '#f59e0b', accent2: '#f97316',
            steps: [
                { icon: '🧭', label: 'Compass' }, { icon: '🧩', label: 'Fit check' }, { icon: '📋', label: 'Program' },
                { icon: '▶️', label: 'Practice' }, { icon: '📒', label: 'Logbook' }, { icon: '📈', label: 'Review' }
            ],
            defaultState: { shs: [], fit: {}, selected: [], plan: {}, entries: [], hows: {}, howsNotes: {} }
        });
        S = MethodKit.state;
        ['shs', 'selected', 'entries'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        ['fit', 'plan', 'hows', 'howsNotes'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });

        renderPie();
        renderShs('hoh-shs', 'hoh-shs-result', 'hoh-shs-save', '__shsDraft');
        renderBaselineBadge();
        renderBaselineState(false);
        renderFit();

        MethodKit.onStep = function (n) {
            if (n === 2) renderRanking();
            if (n === 3) renderProgram();
            if (n === 4) renderPractice();
            if (n === 5) renderLog();
            if (n === 6) renderReview();
        };
        MethodKit.onStep(MethodKit.step);

        $('hoh-ex-close').addEventListener('click', closeExercise);
        $('hoh-ex-cancel').addEventListener('click', closeExercise);
        $('hoh-ex-done').addEventListener('click', finishExercise);
        $('hoh-overlay').addEventListener('click', ev => { if (ev.target === $('hoh-overlay')) closeExercise(); });
        document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !$('hoh-overlay').hidden) closeExercise(); });
        $('hoh-export').addEventListener('click', exportAll);
    })();
})();
