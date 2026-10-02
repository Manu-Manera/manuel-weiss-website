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
    const DAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
    const FREQS = [
        { id: 'daily', label: 'Täglich', days: 1 },
        { id: '3x', label: '3× pro Woche', days: 2 },
        { id: 'weekly', label: '1× pro Woche', days: 7 },
        { id: 'biweekly', label: 'Alle 2 Wochen', days: 14 },
        { id: 'monthly', label: 'Monatlich', days: 30 }
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
        if (m >= 5.6) return 'Du liegst deutlich über dem Durchschnitt (Ø ≈ 4.5–5.5). Ziel: dieses Niveau halten und absichern.';
        if (m >= 4.5) return 'Du liegst im Durchschnitt. Hier ist am meisten Spielraum nach oben.';
        if (m >= 3.5) return 'Du liegst etwas unter dem Durchschnitt – ein guter Grund, gezielt zu üben.';
        return 'Du liegst deutlich unter dem Durchschnitt. Die Übungen hier helfen – wenn es sich schwer anfühlt, hol dir zusätzlich professionelle Unterstützung.';
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
            MethodKit.toast(`Baseline ${m.toFixed(2)} gespeichert`, 'success');
            renderBaselineBadge();
        };
    }
    function renderBaselineBadge() {
        const l = lastShs();
        const r = $('hoh-shs-result');
        if (!l || !r) return;
        const n = S.shs.length;
        const old = $('hoh-baseline-badge'); if (old) old.remove();
        r.insertAdjacentHTML('beforeend', `<div class="hoh-hint ok" id="hoh-baseline-badge" style="margin-top:10px;"><i class="fas fa-check-circle"></i><div>${n === 1 ? 'Baseline' : n + '. Messung'} vom ${fmtDate(l.date)}: <strong>${l.mean.toFixed(2)}</strong>. Nächste Messung in ${Math.max(0, REMEASURE_DAYS - daysSince(l.date))} Tagen im Review-Schritt.</div></div>`);
    }
    function fmtDate(k) { const d = new Date(k); return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

    /* =====================================================================
       Schritt 2 · Fit-Diagnostik
       ===================================================================== */
    function renderFit() {
        const host = $('hoh-fit-list');
        host.innerHTML = D.ACTIVITIES.map(a => {
            const f = S.fit[a.id] || {};
            const sc = fitScore(a.id);
            return `<div class="hoh-fit-act" data-act="${a.id}">
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
            S.fit[a][d] = +el.value; S.fit[a].__t = 1;
            host.querySelector(`[data-fv="${a}-${d}"]`).textContent = el.value;
            const sc = fitScore(a), b = host.querySelector(`[data-score="${a}"]`);
            b.textContent = (sc > 0 ? '+' : '') + sc; b.className = 'hoh-fit-score ' + scoreClass(a);
            MethodKit.save(); renderRanking();
        }));
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
        if (!touched) { host.innerHTML = '<div class="mk-empty">Bewerte oben mindestens eine Aktivität – das Ranking entsteht live.</div>'; return; }
        const max = 19, min = -11, span = max - min;
        host.innerHTML = (touched < 12 ? `<div class="hoh-hint info"><i class="fas fa-info-circle"></i><div>${touched} von 12 bewertet. Für ein belastbares Ranking alle 12 durchgehen – es dauert etwa 10 Minuten.</div></div>` : '') +
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
            `<div class="hoh-hint ok" style="margin-top:12px;"><i class="fas fa-lightbulb"></i><div>Deine Top 4: <strong>${r.filter(x => x.t).slice(0, 4).map(x => x.a.title).join(', ')}</strong>. Im nächsten Schritt kannst du sie übernehmen oder anpassen.</div></div>`;
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
        if (!S.selected.length) hints.push(['info', 'Wähle mindestens eine Aktivität. Dein Fit-Ranking schlägt dir die passenden vor.']);
        if (S.selected.length > 4) hints.push(['warn', `${S.selected.length} Aktivitäten sind viel. Lyubomirsky empfiehlt höchstens vier – sonst wird keine zur Gewohnheit.`]);
        S.selected.forEach(id => { if (fitTouched(id) && fitScore(id) < 0) hints.push(['warn', `<strong>${act(id).title}</strong> hat einen negativen Fit-Score – du würdest sie eher aus Pflichtgefühl machen. Das hält selten.`]); });
        const lowDiversity = S.selected.length >= 2 && S.selected.every(id => ['body', 'spirituality', 'savoring'].indexOf(id) > -1);
        if (lowDiversity) hints.push(['info', 'Alle gewählten Aktivitäten sind eher nach innen gerichtet. Eine soziale (Freundlichkeit, Beziehungen, Dankbarkeit) ergänzt gut.']);
        if (S.selected.length >= 1 && S.selected.length <= 4 && !hints.some(x => x[0] === 'warn')) hints.push(['ok', `${S.selected.length} ${S.selected.length === 1 ? 'Aktivität' : 'Aktivitäten'} – gute Grösse. Lege unten fest, wann du übst.`]);
        h.innerHTML = hints.map(x => `<div class="hoh-hint ${x[0]}"><i class="fas fa-${x[0] === 'warn' ? 'triangle-exclamation' : x[0] === 'ok' ? 'check-circle' : 'info-circle'}"></i><div>${x[1]}</div></div>`).join('');
    }
    function renderPlan() {
        const host = $('hoh-plan');
        if (!S.selected.length) { host.innerHTML = ''; return; }
        host.innerHTML = S.selected.map(id => {
            const a = act(id); const p = S.plan[id] = S.plan[id] || { freq: defaultFreq(id), days: [] };
            return `<div class="mk-card hoh-planact" style="border-left-color:${a.color}">
                <h3><span style="font-size:22px">${a.ic}</span> ${a.title}</h3>
                <div class="hoh-plan-row">
                    <div class="mk-field"><label>Rhythmus</label>
                        <select class="mk-select" data-freq="${id}">${FREQS.map(f => `<option value="${f.id}" ${p.freq === f.id ? 'selected' : ''}>${f.label}</option>`).join('')}</select>
                    </div>
                    <div class="mk-field"><label>Feste Tage <span class="hint">(optional)</span></label>
                        <div class="hoh-days">${DAY_ORDER.map(d => `<button class="hoh-day ${p.days.indexOf(d) > -1 ? 'on' : ''}" data-day="${d}" data-dact="${id}">${DAY_LABELS[d]}</button>`).join('')}</div>
                    </div>
                </div>
                <div class="mk-field"><label>Auslöser <span class="hint">(Wenn-Dann: nach welchem festen Moment im Alltag?)</span></label>
                    <input class="mk-input" data-cue="${id}" value="${esc(p.cue || '')}" placeholder="z. B. „Sonntagabend nach dem Abendessen" oder „direkt nach dem ersten Kaffee"">
                </div>
                <div class="hoh-dose"><i class="fas fa-flask"></i> <strong>Dosierung laut Forschung:</strong> ${a.dose}</div>
            </div>`;
        }).join('');
        host.querySelectorAll('[data-freq]').forEach(el => el.addEventListener('change', () => { S.plan[el.dataset.freq].freq = el.value; MethodKit.save(); }));
        host.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', () => {
            const p = S.plan[b.dataset.dact], d = +b.dataset.day, i = p.days.indexOf(d);
            if (i > -1) p.days.splice(i, 1); else p.days.push(d);
            b.classList.toggle('on'); MethodKit.save();
        }));
        host.querySelectorAll('[data-cue]').forEach(el => el.addEventListener('input', () => { S.plan[el.dataset.cue].cue = el.value; MethodKit.save(); }));
    }

    /* =====================================================================
       Schritt 4 · Praxis
       ===================================================================== */
    function renderPractice() {
        const th = $('hoh-today');
        if (!S.selected.length) {
            th.innerHTML = '<div class="mk-empty">Noch kein Programm. Wähle im Schritt „Programm" deine Aktivitäten – oder probiere unten frei eine Übung aus.</div>';
        } else {
            const due = S.selected.filter(id => doneToday(id) || isDueToday(id));
            const v = varietyIndex(14);
            let html = due.length ? due.map(id => {
                const a = act(id), p = S.plan[id] || {}, dn = doneToday(id);
                return `<div class="hoh-today-item ${dn ? 'done' : ''}"><span class="ic">${a.ic}</span><div class="t">${a.title}<small>${p.cue ? esc(p.cue) : (FREQS.find(f => f.id === p.freq) || FREQS[2]).label}</small></div>${dn ? '<span style="color:#059669;font-weight:700;font-size:13px"><i class="fas fa-check"></i> erledigt</span>' : `<button class="mk-btn mk-btn-ghost mk-btn-sm" data-jump="${id}">Übung wählen</button>`}</div>`;
            }).join('') : '<div class="hoh-hint ok"><i class="fas fa-mug-hot"></i><div>Heute steht laut Plan nichts an. Freier Tag – oder du nimmst dir unten spontan etwas.</div></div>';
            if (v.total >= 5 && v.distinct <= 2) html += `<div class="hoh-hint warn" style="margin-top:10px;"><i class="fas fa-shuffle"></i><div><strong>Vielfalt-Warnung:</strong> In den letzten 14 Tagen hast du ${v.total} Übungen gemacht, aber nur ${v.distinct} verschiedene. Hedonische Adaptation droht – wechsle die Übung, den Ort oder die Form.</div></div>`;
            th.innerHTML = html;
            th.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => {
                const m = document.querySelector(`.hoh-module[data-mod="${b.dataset.jump}"]`);
                if (m) { m.scrollIntoView({ behavior: 'smooth', block: 'start' }); m.querySelector('[data-tab="ex"]').click(); }
            }));
        }
        renderModules();
    }
    function renderModules() {
        const host = $('hoh-modules');
        const order = S.selected.concat(D.ACTIVITIES.map(a => a.id).filter(id => S.selected.indexOf(id) < 0));
        host.innerHTML = (S.selected.length ? `<h3 style="margin:6px 0 10px;color:var(--mk-muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em;">Dein Programm</h3>` : '') +
            order.map((id, idx) => {
                const a = act(id); const inProg = S.selected.indexOf(id) > -1;
                const divider = (!inProg && (idx === 0 || S.selected.indexOf(order[idx - 1]) > -1)) ? `<h3 style="margin:22px 0 10px;color:var(--mk-muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em;">Alle weiteren Aktivitäten</h3>` : '';
                const le = lastEntry(id);
                return divider + `<div class="mk-card hoh-module" data-mod="${id}" style="border-top-color:${a.color}">
                    <div class="hoh-module-head"><span class="ic">${a.ic}</span><div style="flex:1"><h3>${a.n}. ${a.title}</h3><p>${a.short}${le ? ` · zuletzt ${fmtDate(le.date)}` : ''}</p></div>${inProg ? '<span class="mk-badge">im Programm</span>' : ''}</div>
                    <div class="hoh-module-tabs">
                        <button class="hoh-module-tab on" data-tab="ex">Übungen (${a.exercises.length})</button>
                        <button class="hoh-module-tab" data-tab="why">Warum es wirkt</button>
                        <button class="hoh-module-tab" data-tab="res">Forschung</button>
                        <button class="hoh-module-tab" data-tab="link">Verwandte Methoden</button>
                    </div>
                    <div class="hoh-module-pane on" data-pane="ex">
                        ${a.exercises.map(e => {
                            const cnt = entriesFor(id, e.id).length; const l = cnt ? entriesFor(id, e.id).slice(-1)[0] : null;
                            return `<div class="hoh-ex ${l && daysSince(l.date) <= 1 ? 'recent' : ''}"><div class="t"><strong>${e.title}</strong><small>⏱ ${e.min} Min · ${e.dose}${e.timer ? ' · mit Timer' : ''}</small></div>${cnt ? `<span class="cnt">${cnt}×</span>` : ''}<button class="mk-btn mk-btn-primary mk-btn-sm" data-start="${id}:${e.id}"><i class="fas fa-play"></i> Start</button></div>`;
                        }).join('')}
                    </div>
                    <div class="hoh-module-pane" data-pane="why"><p>${a.why}</p><div class="hoh-dose"><i class="fas fa-flask"></i> <strong>Dosierung:</strong> ${a.dose}</div></div>
                    <div class="hoh-module-pane" data-pane="res"><p>${a.research}</p></div>
                    <div class="hoh-module-pane" data-pane="link"><p>Vertiefe diese Aktivität mit bestehenden Workflows:</p><div class="hoh-links">${a.links.map(l => `<a href="${D.METHOD_PATHS[l.m] || '#'}"><i class="fas fa-arrow-up-right-from-square"></i> ${l.l}</a>`).join('')}<a href="${D.METHOD_PATHS['habit-building']}"><i class="fas fa-repeat"></i> Gewohnheit daraus machen</a></div></div>
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
            <div class="hoh-ex-meta"><span class="mk-badge">⏱ ${e.min} Min</span><span class="mk-badge">${e.dose}</span><span class="mk-badge">${a.title}</span></div>
            <div class="hoh-ex-intro">${e.intro}</div>
            <div class="hoh-mood"><label>Stimmung vorher</label><div class="mk-range-wrap" style="flex:1"><input class="mk-range" type="range" min="1" max="10" value="5" id="hoh-before"><span class="mk-range-val" id="hoh-before-v">5</span></div></div>
            ${e.timer ? `<div class="hoh-timer" id="hoh-timer"><div class="time" id="hoh-timer-t">${fmtT(EX.timerLeft)}</div><div class="ctr"><button class="mk-btn mk-btn-primary mk-btn-sm" id="hoh-timer-start"><i class="fas fa-play"></i> Timer starten</button><button class="mk-btn mk-btn-outline mk-btn-sm" id="hoh-timer-reset"><i class="fas fa-rotate-left"></i></button></div></div>` : ''}
            ${e.prompts.map((p, i) => `<div class="mk-field"><label>${esc(p.l)}</label><textarea class="mk-textarea" data-ans="${i}" placeholder="${esc(p.p)}" style="min-height:${e.prompts.length > 4 ? 60 : 90}px"></textarea></div>`).join('')}
            <div class="hoh-ex-tip"><i class="fas fa-lightbulb"></i> ${e.tip}</div>
            <div class="hoh-mood"><label>Stimmung nachher</label><div class="mk-range-wrap" style="flex:1"><input class="mk-range" type="range" min="1" max="10" value="5" id="hoh-after"><span class="mk-range-val" id="hoh-after-v">5</span></div></div>`;
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
            if (EX.timerLeft <= 0) { stopTimer(); EX.timerDone = true; $('hoh-timer').classList.add('finished'); MethodKit.toast('Zeit um – schliess die Übung in Ruhe ab', 'success'); if (navigator.vibrate) { try { navigator.vibrate([80, 60, 80]); } catch (x) {} } }
        }, 1000);
    }
    function stopTimer() { clearInterval(timerIv); timerIv = null; if (EX) EX.timerRunning = false; const t = $('hoh-timer'); if (t) t.classList.remove('running'); const b = $('hoh-timer-start'); if (b) b.innerHTML = '<i class="fas fa-play"></i> Weiter'; }
    function closeExercise() { stopTimer(); EX = null; $('hoh-overlay').hidden = true; document.body.style.overflow = ''; }
    function finishExercise() {
        if (!EX) return;
        const answers = Array.from(document.querySelectorAll('[data-ans]')).map(t => t.value.trim());
        if (!answers.some(Boolean) && !EX.timerDone) { MethodKit.toast('Schreib wenigstens einen Satz – oder lass den Timer laufen', 'error'); return; }
        const minutes = Math.max(1, Math.round((Date.now() - EX.startedAt) / 60000));
        S.entries.push({ id: MethodKit.uid(), date: todayKey(), ts: Date.now(), act: EX.a.id, ex: EX.e.id, answers, before: EX.before, after: EX.after, minutes });
        MethodKit.save({ now: true });
        const delta = EX.after - EX.before;
        closeExercise();
        MethodKit.toast(delta > 0 ? `Gespeichert · Stimmung +${delta} · 🔥 ${streak()} Tage` : `Gespeichert · 🔥 ${streak()} Tage`, 'success');
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
            [n, 'Übungen gesamt'], [streak(), 'Tage Streak 🔥'], [Object.keys(dayCounts()).length, 'aktive Tage'],
            [(avgDelta >= 0 ? '+' : '') + avgDelta.toFixed(1), 'Ø Stimmungs-Delta'], [minutes >= 60 ? Math.round(minutes / 60) + ' h' : minutes + ' min', 'investierte Zeit'], [`${v.distinct}/${v.total}`, 'Vielfalt (14 Tage)']
        ].map(x => `<div class="hoh-stat"><div class="v">${x[0]}</div><div class="l">${x[1]}</div></div>`).join('');

        // Heatmap: 12 Wochen, Spalten = Wochen, Zeilen = Mo..So
        const dc = dayCounts(); const cells = []; const today = new Date(); const tk = todayKey();
        const end = new Date(today); const dowEnd = (end.getDay() + 6) % 7; end.setDate(end.getDate() + (6 - dowEnd));
        const start = new Date(end); start.setDate(start.getDate() - 7 * 12 + 1);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const k = localKey(d); const c = dc[k] || 0; const future = d > today;
            cells.push(`<i class="${c >= 3 ? 'l3' : c === 2 ? 'l2' : c === 1 ? 'l1' : 'l0'} ${k === tk ? 'today' : ''}" style="${future ? 'opacity:.25' : ''}" title="${fmtDate(k)}: ${c} Übung${c === 1 ? '' : 'en'}"></i>`);
        }
        $('hoh-heat').innerHTML = cells.join('');

        // Filter
        const used = Array.from(new Set(S.entries.map(e => e.act)));
        $('hoh-log-filter').innerHTML = `<button class="mk-chip ${logFilter === 'all' ? 'selected' : ''}" data-lf="all">Alle</button>` + used.map(id => `<button class="mk-chip ${logFilter === id ? 'selected' : ''}" data-lf="${id}">${act(id).ic} ${act(id).title}</button>`).join('');
        $('hoh-log-filter').querySelectorAll('[data-lf]').forEach(b => b.addEventListener('click', () => { logFilter = b.dataset.lf; renderLog(); }));

        const list = S.entries.filter(e => logFilter === 'all' || e.act === logFilter).slice().reverse();
        const host = $('hoh-log');
        if (!list.length) { host.innerHTML = '<div class="mk-empty">Noch keine Einträge. Starte im Schritt „Praxis" eine Übung.</div>'; return; }
        host.innerHTML = list.slice(0, 60).map(e => {
            const a = act(e.act), ex = exOf(e.act, e.ex); const d = (e.after != null && e.before != null) ? e.after - e.before : null;
            return `<div class="hoh-entry" data-eid="${e.id}">
                <div class="hoh-entry-head"><span class="ic">${a ? a.ic : '•'}</span><div class="t">${ex ? ex.title : e.ex}<small>${fmtDate(e.date)} · ${a ? a.title : ''} · ${e.minutes || 0} Min</small></div>${d != null ? `<span class="delta ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? '+' : ''}${d}</span>` : ''}<button class="mk-iconbtn" data-del="${e.id}" title="Löschen"><i class="fas fa-trash"></i></button></div>
                <div class="hoh-entry-body">${ex ? ex.prompts.map((p, i) => e.answers[i] ? `<div class="a"><strong>${esc(p.l)}</strong><span>${esc(e.answers[i])}</span></div>` : '').join('') : ''}${e.answers.every(x => !x) ? '<div class="mk-faint">Ohne Notizen (Timer-Übung).</div>' : ''}</div>
            </div>`;
        }).join('') + (list.length > 60 ? `<div class="mk-faint" style="text-align:center;padding:8px">… und ${list.length - 60} ältere Einträge (im Export enthalten)</div>` : '');
        host.querySelectorAll('.hoh-entry-head').forEach(h => h.addEventListener('click', ev => { if (ev.target.closest('[data-del]')) return; h.parentElement.classList.toggle('open'); }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
            if (!confirm('Eintrag wirklich löschen?')) return;
            S.entries = S.entries.filter(x => x.id !== b.dataset.del); MethodKit.save({ now: true }); renderLog();
        }));
    }

    /* =====================================================================
       Schritt 6 · Review
       ===================================================================== */
    function renderReview() {
        const ch = $('hoh-shs-chart');
        if (S.shs.length < 2) {
            ch.innerHTML = S.shs.length ? `<div class="mk-result"><h4>Bisher eine Messung</h4>Baseline ${S.shs[0].mean.toFixed(2)} vom ${fmtDate(S.shs[0].date)}. Nach der zweiten Messung erscheint hier dein Verlauf.</div>` : '<div class="mk-empty">Noch keine Baseline. Miss sie zuerst im Schritt „Kompass".</div>';
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
            <div class="mk-result" style="margin-top:10px;"><h4>Trend</h4>Von <strong>${first.toFixed(2)}</strong> (${fmtDate(S.shs[0].date)}) auf <strong>${last.toFixed(2)}</strong> (${fmtDate(S.shs[n - 1].date)}): <strong style="color:${diff > 0 ? '#059669' : diff < 0 ? '#dc2626' : 'inherit'}">${diff > 0 ? '+' : ''}${diff.toFixed(2)}</strong>. ${diff >= 0.5 ? 'Das ist ein spürbarer Effekt – bleib dran.' : diff > 0 ? 'Kleiner, positiver Trend. Glück wächst langsam.' : diff === 0 ? 'Stabil. Prüfe unten die fünf Hows – oft fehlt Vielfalt oder Dosis.' : 'Rückgang – das kann an äusseren Umständen liegen. Prüfe die fünf Hows und ob deine Aktivitäten noch passen.'}<br><span class="mk-faint">Schattierter Bereich = Bevölkerungsdurchschnitt 4.5–5.5.</span></div>`;
        }
        const l = lastShs(); const rm = $('hoh-remeasure'); const ds = daysSince(l ? l.date : null);
        if (!l) rm.innerHTML = '';
        else if (ds >= REMEASURE_DAYS) {
            rm.innerHTML = `<div class="hoh-hint info" style="margin-top:14px;"><i class="fas fa-ruler"></i><div><strong>Zeit für eine neue Messung</strong> – die letzte ist ${ds} Tage her.</div></div><div id="hoh-shs2"></div><div id="hoh-shs2-result"></div><button class="mk-btn mk-btn-primary" id="hoh-shs2-save" style="margin-top:12px;"><i class="fas fa-check"></i> Messung speichern</button>`;
            S.__shsDraft2 = [4, 4, 4, 4];
            renderShs('hoh-shs2', 'hoh-shs2-result', null, '__shsDraft2');
            $('hoh-shs2-save').onclick = () => { const m = shsMean(S.__shsDraft2); S.shs.push({ date: todayKey(), vals: S.__shsDraft2.slice(), mean: m }); MethodKit.save({ now: true }); MethodKit.toast(`Messung ${m.toFixed(2)} gespeichert`, 'success'); renderReview(); };
        } else rm.innerHTML = `<div class="hoh-hint ok" style="margin-top:14px;"><i class="fas fa-calendar-check"></i><div>Letzte Messung vor ${ds} Tag${ds === 1 ? '' : 'en'}. Nächste Messung in ${REMEASURE_DAYS - ds} Tagen – zwischendurch zu messen bringt nichts, Glück schwankt tagesabhängig.</div></div>`;

        // Five Hows mit automatischen Signalen aus den Daten
        const v = varietyIndex(14);
        const deltas = S.entries.map(e => e.after - e.before).filter(x => !isNaN(x));
        const avgDelta = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null;
        const cues = S.selected.filter(id => S.plan[id] && S.plan[id].cue).length;
        const auto = {
            emotion: avgDelta == null ? 'Noch keine Daten – jede Übung fragt Stimmung vorher/nachher ab.' : `Dein Ø Stimmungs-Delta über ${deltas.length} ${deltas.length === 1 ? 'Übung' : 'Übungen'}: <strong>${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(1)}</strong>. ${avgDelta >= 1 ? 'Die Übungen tun dir messbar gut.' : avgDelta > 0 ? 'Leicht positiv – prüfe, welche Übungen am stärksten wirken (Logbuch).' : 'Kaum Effekt – vielleicht passen die Aktivitäten nicht (Fit-Diagnostik wiederholen).'}`,
            timing: v.total ? `Letzte 14 Tage: ${v.distinct} verschiedene Übungen bei ${v.total} Durchgängen. ${v.total >= 5 && v.distinct <= 2 ? '<strong>Zu wenig Vielfalt.</strong>' : v.distinct >= 3 ? 'Gute Abwechslung.' : ''}` : 'Noch keine Übungen in den letzten 14 Tagen.',
            social: '',
            effort: `${S.entries.length} Übungen, ${streak()} Tage Streak, ${Object.keys(dayCounts()).length} aktive Tage.`,
            habit: S.selected.length ? `${cues} von ${S.selected.length} Aktivitäten haben einen Auslöser (Wenn-Dann) hinterlegt.${cues < S.selected.length ? ' Ergänze die fehlenden im Schritt „Programm".' : ''}` : ''
        };
        $('hoh-hows').innerHTML = D.HOWS.map(h => `<div class="hoh-how"><span class="ic">${h.ic}</span><div class="t"><strong>${h.title}</strong><div class="q">${h.q}</div><div class="d">${h.d}</div>${auto[h.id] ? `<div class="auto"><i class="fas fa-chart-simple"></i> ${auto[h.id]}</div>` : ''}<input class="mk-input" style="margin-top:8px;font-size:13px;padding:8px 12px" data-hown="${h.id}" value="${esc(S.howsNotes[h.id] || '')}" placeholder="Meine Notiz / mein nächster Schritt dazu …"></div><button class="chk ${S.hows[h.id] ? 'on' : ''}" data-how="${h.id}" title="Erfüllt">${S.hows[h.id] ? '<i class="fas fa-check"></i>' : ''}</button></div>`).join('');
        $('hoh-hows').querySelectorAll('[data-how]').forEach(b => b.addEventListener('click', () => { S.hows[b.dataset.how] = !S.hows[b.dataset.how]; MethodKit.save(); renderReview(); }));
        $('hoh-hows').querySelectorAll('[data-hown]').forEach(i => i.addEventListener('input', () => { S.howsNotes[i.dataset.hown] = i.value; MethodKit.save(); }));
    }

    /* ---------- Export ---------- */
    function exportAll() {
        let t = 'THE HOW OF HAPPINESS – MEIN PROGRAMM\n====================================\n\n';
        t += 'GLÜCKS-BASELINE (Subjective Happiness Scale, 1–7)\n';
        S.shs.forEach(s => { t += `  ${fmtDate(s.date)}: ${s.mean.toFixed(2)}\n`; });
        if (!S.shs.length) t += '  (noch keine Messung)\n';
        t += '\nFIT-RANKING\n';
        ranking().forEach((x, i) => { t += `  ${i + 1}. ${x.a.title}: ${x.t ? (x.s > 0 ? '+' : '') + x.s : '–'}\n`; });
        t += '\nMEIN PROGRAMM\n';
        S.selected.forEach(id => { const a = act(id), p = S.plan[id] || {}; t += `  ${a.ic} ${a.title} – ${(FREQS.find(f => f.id === p.freq) || FREQS[2]).label}${p.days && p.days.length ? ' (' + p.days.map(d => DAY_LABELS[d]).join(', ') + ')' : ''}${p.cue ? ' – Auslöser: ' + p.cue : ''}\n     Dosierung: ${a.dose}\n`; });
        if (!S.selected.length) t += '  (noch nichts gewählt)\n';
        t += '\nDIE FÜNF HOWS\n';
        D.HOWS.forEach(h => { t += `  [${S.hows[h.id] ? 'x' : ' '}] ${h.title}${S.howsNotes[h.id] ? ' – ' + S.howsNotes[h.id] : ''}\n`; });
        t += `\nLOGBUCH (${S.entries.length} Einträge, Streak ${streak()} Tage)\n`;
        S.entries.forEach(e => {
            const a = act(e.act), ex = exOf(e.act, e.ex);
            t += `\n${fmtDate(e.date)} · ${a ? a.title : e.act} · ${ex ? ex.title : e.ex} · Stimmung ${e.before}→${e.after} · ${e.minutes} Min\n`;
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
                { icon: '🧭', label: 'Kompass' }, { icon: '🧩', label: 'Fit-Check' }, { icon: '📋', label: 'Programm' },
                { icon: '▶️', label: 'Praxis' }, { icon: '📒', label: 'Logbuch' }, { icon: '📈', label: 'Review' }
            ],
            defaultState: { shs: [], fit: {}, selected: [], plan: {}, entries: [], hows: {}, howsNotes: {} }
        });
        S = MethodKit.state;
        ['shs', 'selected', 'entries'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        ['fit', 'plan', 'hows', 'howsNotes'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });

        renderPie();
        renderShs('hoh-shs', 'hoh-shs-result', 'hoh-shs-save', '__shsDraft');
        renderBaselineBadge();
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
