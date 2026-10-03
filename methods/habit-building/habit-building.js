/* Gewohnheiten aufbauen · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const LAWS = [
        ['obv', '👀', 'Offensichtlich', 'Wo liegt der Auslöser sichtbar bereit? (Matte vor dem Bett, Buch auf dem Kissen, App auf dem Startbildschirm)'],
        ['attr', '🍬', 'Attraktiv', 'Womit koppelst du es, worauf du dich freust? (Podcast nur beim Laufen, Lieblingskaffee nur beim Schreiben)'],
        ['easy', '🪶', 'Einfach', 'Was bereitest du am Vorabend vor, damit es null Entscheidungen braucht?'],
        ['sat', '✅', 'Befriedigend', 'Was ist die sofortige Belohnung direkt danach – nicht in drei Monaten?']
    ];
    const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const LINKS = [
        { m: 'Ziele setzen', l: '../goal-setting/goal-setting.html', why: 'Wohin die Gewohnheit führen soll.' },
        { m: 'Rubikon-Modell', l: '../rubikon-model/rubikon-model.html', why: 'Vom Wunsch über die Entscheidung ins Handeln.' },
        { m: 'Stress-Kompass', l: '../stress-management/stress-management.html', why: 'Erholungsgewohnheiten gezielt aufbauen.' },
        { m: 'Journaling', l: '../journaling/journaling.html', why: 'Die Abendreflexion als Gewohnheit.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const key = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
    const today = () => key(new Date());
    const daysAgo = (k) => { const d = new Date(); d.setDate(d.getDate() - k); return d; };
    const H = (id) => S.habits.find(h => h.id === id);
    const cueT = (c) => (c || '').trim().replace(/^(nachdem|sobald|wenn|immer wenn|direkt nachdem|jedes mal wenn)\s+/i, '');

    /* ---------- Analyse ---------- */
    const cueQuality = (c) => { c = (c || '').toLowerCase(); if (!c.trim()) return 0; if (/nachdem|sobald|wenn ich|direkt nach|bevor|um \d|uhr|jeden morgen|jeden abend|beim /.test(c)) return 2; return 1; };
    const routineMinutes = (r) => { const m = /(\d+)\s*(min|minute|stunde|std|h\b)/i.exec(r || ''); if (!m) return null; let v = +m[1]; if (/stunde|std|h\b/i.test(m[2])) v *= 60; return v; };
    function streak(h, from) {
        let s = 0; const d = from ? new Date(from) : new Date();
        if (!from && !(h.done || {})[key(d)]) d.setDate(d.getDate() - 1); // heute noch offen zählt nicht als Bruch
        for (; ;) { if ((h.done || {})[key(d)]) { s++; d.setDate(d.getDate() - 1); } else break; }
        return s;
    }
    function longest(h) { const ks = Object.keys(h.done || {}).sort(); let best = 0, cur = 0, prev = null; ks.forEach(k => { if (prev && (new Date(k) - new Date(prev)) / 86400000 === 1) cur++; else cur = 1; best = Math.max(best, cur); prev = k; }); return best; }
    function rate(h, days) { const start = h.created ? new Date(h.created) : null; let total = 0, hit = 0; for (let i = 0; i < days; i++) { const d = daysAgo(i); if (start && d < new Date(key(start))) break; total++; if ((h.done || {})[key(d)]) hit++; } return total ? { pct: Math.round(hit / total * 100), hit, total } : { pct: 0, hit: 0, total: 0 }; }
    function byWeekday(h) { const c = [0, 0, 0, 0, 0, 0, 0], t = [0, 0, 0, 0, 0, 0, 0]; for (let i = 0; i < 28; i++) { const d = daysAgo(i); if (h.created && d < new Date(key(new Date(h.created)))) break; t[d.getDay()]++; if ((h.done || {})[key(d)]) c[d.getDay()]++; } return WD.map((w, i) => ({ w, pct: t[i] ? Math.round(c[i] / t[i] * 100) : null })); }
    const lawsDone = (h) => LAWS.filter(([k]) => ((h.laws || {})[k] || '').trim()).length;
    const missedYesterday = (h) => !(h.done || {})[key(daysAgo(1))] && h.created && new Date(h.created) < daysAgo(1);

    /* ---------- 1 ---------- */
    function renderPreview() {
        const v = (id) => $(id).value.trim();
        const cue = v('hb-cue'), r = v('hb-routine');
        const cq = cueQuality(cue);
        $('hb-cue-note').innerHTML = cue ? (cq === 2 ? '' : note('info', 'Mach den Auslöser konkreter: „Nachdem ich …" oder eine feste Uhrzeit/einen festen Ort. Vage Auslöser („morgens") feuern nicht.')) : '';
        const mins = routineMinutes(r);
        $('hb-routine-note').innerHTML = !r ? '' : mins !== null && mins > 5 ? note('warn', `${mins} Minuten ist für den Start zu gross. Fogg: Unter zwei Minuten – „eine Seite lesen", „einen Liegestütz", „Schuhe anziehen". Die Grösse kommt von allein, die Regelmässigkeit nicht.`) : /jeden tag|immer|täglich/i.test(r) && !mins ? note('info', 'Die Handlung selbst, nicht die Häufigkeit: Was genau tust du, wenn der Auslöser kommt?') : '';
        $('hb-preview').innerHTML = (cue || r) ? `<div class="hb-formula"><b>Nachdem</b> ${esc(cueT(cue) || '…')}, <b>werde ich</b> ${esc(r || '…')}${v('hb-reward') ? `, <b>und danach</b> ${esc(v('hb-reward'))}` : ''}.${v('hb-identity') ? `<small>${esc(v('hb-identity'))}</small>` : ''}</div>` : '';
    }
    function addHabit() {
        const v = (id) => $(id).value.trim();
        if (!v('hb-name')) { MethodKit.toast('Was willst du aufbauen?', 'warn'); $('hb-name').focus(); return; }
        if (!v('hb-cue') || !v('hb-routine')) { MethodKit.toast('Auslöser und Handlung sind Pflicht – ohne sie gibt es keine Gewohnheit', 'warn'); return; }
        if (S.habits.filter(h => !h.paused).length >= 3 && !confirm('Du hast schon drei aktive Gewohnheiten. Mehr als drei gleichzeitig scheitern fast immer. Trotzdem anlegen?')) return;
        S.habits.push({ id: MethodKit.uid(), name: v('hb-name'), cue: v('hb-cue'), routine: v('hb-routine'), reward: v('hb-reward'), identity: v('hb-identity'), laws: {}, ifthen: { if: '', then: '' }, done: {}, review: {}, created: Date.now() });
        ['hb-name', 'hb-cue', 'hb-routine', 'hb-reward', 'hb-identity'].forEach(id => $(id).value = '');
        MethodKit.save({ now: true }); MethodKit.toast('Angelegt – Schritt 2 macht sie leichter', 'ok'); renderPreview(); renderHabits();
    }
    function renderHabits() {
        const act = S.habits.filter(h => !h.paused).length;
        $('hb-count').textContent = S.habits.length ? `${act} aktiv${S.habits.length - act ? ` · ${S.habits.length - act} pausiert` : ''}` : '';
        if (!S.habits.length) { $('hb-habits').innerHTML = '<div class="mk-empty">Noch keine Gewohnheit. Fang mit genau einer an.</div>'; return; }
        $('hb-habits').innerHTML = S.habits.map(h => `<div class="hb-habit ${h.paused ? 'paused' : ''}"><div class="hb-habit-top"><div class="hb-habit-t"><h4>${esc(h.name)}</h4><div class="hb-meta">Nachdem ${esc(cueT(h.cue))} → ${esc(h.routine)}${h.reward ? ` → ${esc(h.reward)}` : ''}</div>${h.identity ? `<div class="hb-id">${esc(h.identity)}</div>` : ''}</div><div class="hb-habit-a"><button class="mk-iconbtn" data-pause="${h.id}" aria-label="${h.paused ? 'Fortsetzen' : 'Pausieren'}" title="${h.paused ? 'Fortsetzen' : 'Pausieren'}"><i class="fas fa-${h.paused ? 'play' : 'pause'}"></i></button><button class="mk-iconbtn" data-del="${h.id}" aria-label="Löschen"><i class="fas fa-trash"></i></button></div></div>${routineMinutes(h.routine) > 5 ? note('warn', 'Diese Handlung ist gross. Wenn sie im Tracking hakt: verkleinern.') : ''}</div>`).join('') +
            (act > 3 ? note('warn', `${act} aktive Gewohnheiten gleichzeitig: Wähle eine „Keystone"-Gewohnheit und pausiere die anderen, bis sie sitzt (≈ 3–4 Wochen).`) : '');
        $('hb-habits').querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { if (!confirm('Gewohnheit samt Tracking löschen?')) return; S.habits = S.habits.filter(h => h.id !== b.dataset.del); MethodKit.save(); renderHabits(); }));
        $('hb-habits').querySelectorAll('[data-pause]').forEach(b => b.addEventListener('click', () => { H(b.dataset.pause).paused = !H(b.dataset.pause).paused; MethodKit.save(); renderHabits(); }));
    }

    /* ---------- 2 ---------- */
    function renderLaws() {
        const hs = S.habits.filter(h => !h.paused);
        if (!hs.length) { $('hb-laws').innerHTML = note('info', 'Lege in Schritt 1 eine Gewohnheit an.'); return; }
        $('hb-laws').innerHTML = hs.map(h => { const L = h.laws || {}, I = h.ifthen || {}; const d = lawsDone(h); return `<div class="hb-law-card"><div class="hb-law-h"><b>${esc(h.name)}</b><span class="mk-badge">${d}/4 Gesetze</span></div><div class="mk-grid-2">${LAWS.map(([k, ic, t, q]) => `<div class="mk-field"><label>${ic} ${t}</label><textarea class="mk-textarea" rows="2" data-law="${h.id}" data-k="${k}" placeholder="${q}">${esc(L[k] || '')}</textarea></div>`).join('')}</div><div class="mk-section-label">Wenn-dann-Plan (Implementation Intention)</div><div class="mk-grid-2"><div class="mk-field"><label>Wenn dieses Hindernis kommt …</label><input class="mk-input" data-if="${h.id}" value="${esc(I.if || '')}" placeholder="z. B. ich verschlafe / Besuch ist da / ich bin müde"></div><div class="mk-field"><label>… dann tue ich</label><input class="mk-input" data-then="${h.id}" value="${esc(I.then || '')}" placeholder="z. B. die Minimalversion: 3 Atemzüge statt 2 Minuten"></div></div>${lawNote(h)}</div>`; }).join('');
        const host = $('hb-laws');
        host.querySelectorAll('[data-law]').forEach(t => t.addEventListener('input', () => { const h = H(t.dataset.law); h.laws = h.laws || {}; h.laws[t.dataset.k] = t.value; MethodKit.save(); }));
        host.querySelectorAll('[data-if]').forEach(i => i.addEventListener('input', () => { const h = H(i.dataset.if); h.ifthen = h.ifthen || {}; h.ifthen.if = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-then]').forEach(i => i.addEventListener('input', () => { const h = H(i.dataset.then); h.ifthen = h.ifthen || {}; h.ifthen.then = i.value; MethodKit.save(); }));
        host.querySelectorAll('textarea, input').forEach(el => el.addEventListener('change', renderLaws));
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function lawNote(h) {
        const L = h.laws || {}, I = h.ifthen || {}, d = lawsDone(h);
        if (!d) return note('info', 'Die meisten Gewohnheiten scheitern nicht am Willen, sondern an der Umgebung. Fang mit „Einfach" an: Was bereitest du vor?');
        if (!(L.sat || '').trim()) return note('info', 'Die Belohnung fehlt. Das Gehirn wiederholt, was sich sofort gut anfühlt – nicht, was in drei Monaten gesund ist.');
        if (!(I.if || '').trim() || !(I.then || '').trim()) return note('info', 'Plane das Scheitern: Wenn-dann-Pläne verdoppeln die Umsetzungsrate (Gollwitzer). Welches Hindernis kommt sicher?');
        if (/mehr|später|morgen|nachholen/i.test(I.then)) return note('warn', '„Nachholen" ist keine Strategie – es verdoppelt die Last. Besser: eine Minimalversion, die du auch an schlechten Tagen schaffst.');
        return note('ok', 'System komplett: vier Gesetze und ein Plan B. Jetzt zählt nur noch das tägliche Häkchen.');
    }

    /* ---------- 3 ---------- */
    function renderTrack() {
        const hs = S.habits.filter(h => !h.paused);
        if (!hs.length) { $('hb-track').innerHTML = note('info', 'Noch keine aktive Gewohnheit.'); return; }
        const tk = today();
        $('hb-track').innerHTML = hs.map(h => { const done = (h.done || {})[tk]; const st = streak(h); const my = missedYesterday(h); return `<div class="hb-habit"><div class="hb-habit-top"><button class="hb-check ${done ? 'done' : ''}" data-c="${h.id}" aria-label="Heute erledigt">${done ? '<i class="fas fa-check"></i>' : ''}</button><div class="hb-habit-t"><h4>${esc(h.name)}</h4><div class="hb-meta">${esc(h.routine)}</div></div><span class="hb-streak">🔥 ${st}</span></div>${my && !done ? note('warn', `Gestern ausgelassen. Heute ist der wichtigste Tag: <strong>Nie zweimal.</strong>${(h.ifthen || {}).then ? ` Plan B: ${esc(h.ifthen.then)}` : ' Zur Not die Minimalversion.'}`) : ''}<div class="hb-cal" data-cal="${h.id}">${[...Array(28)].map((_, i) => { const d = daysAgo(27 - i); const k = key(d); const before = h.created && d < new Date(key(new Date(h.created))); return `<button class="${(h.done || {})[k] ? 'on' : ''} ${before ? 'pre' : ''} ${k === tk ? 'today' : ''}" data-d="${k}" data-h="${h.id}" ${before ? 'disabled' : ''} title="${d.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'numeric' })}" aria-label="${k}"></button>`; }).join('')}</div><div class="hb-cal-l"><span>vor 4 Wochen</span><span>heute</span></div></div>`; }).join('');
        const host = $('hb-track');
        host.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { const h = H(b.dataset.c); h.done = h.done || {}; if (h.done[tk]) delete h.done[tk]; else { h.done[tk] = true; const s = streak(h); MethodKit.toast(s >= 7 ? `🔥 ${s} Tage – das wird eine Gewohnheit` : s >= 3 ? `🔥 ${s} Tage am Stück` : 'Erledigt ✓', 'ok'); } MethodKit.save({ now: true }); renderTrack(); }));
        host.querySelectorAll('.hb-cal [data-d]').forEach(b => b.addEventListener('click', () => { const h = H(b.dataset.h); h.done = h.done || {}; if (h.done[b.dataset.d]) delete h.done[b.dataset.d]; else h.done[b.dataset.d] = true; MethodKit.save(); renderTrack(); }));
    }

    /* ---------- 4 ---------- */
    function renderEval() {
        const hs = S.habits.filter(h => !h.paused);
        if (!hs.length) { $('hb-eval').innerHTML = note('info', 'Noch keine aktive Gewohnheit.'); return; }
        $('hb-eval').innerHTML = hs.map(h => {
            const r7 = rate(h, 7), r28 = rate(h, 28), lg = longest(h), wd = byWeekday(h).filter(x => x.pct !== null);
            const best = wd.length > 2 ? [...wd].sort((a, b) => b.pct - a.pct)[0] : null, worst = wd.length > 2 ? [...wd].sort((a, b) => a.pct - b.pct)[0] : null;
            const R = h.review || {};
            let verdict;
            if (r28.total < 5) verdict = note('info', `Erst ${r28.total} Tag${r28.total === 1 ? '' : 'e'} getrackt – Muster zeigen sich ab etwa einer Woche. Weitermachen.`);
            else if (r7.pct < 50) verdict = note('warn', `${r7.pct} % in den letzten 7 Tagen. Das ist kein Charakterproblem, die Gewohnheit ist zu gross oder der Auslöser zu schwach. <strong>Halbiere die Handlung</strong> („${esc(h.routine)}" → was wäre die halbe Version?) oder koppel sie an einen zuverlässigeren Auslöser.`);
            else if (r7.pct < 80) verdict = note('info', `${r7.pct} % – solide, aber wacklig. Schau auf die schwachen Tage${worst && worst.pct < 50 ? ` (${worst.w}: ${worst.pct} %)` : ''}: Was ist da anders? Oft hilft ein zweiter Auslöser für diese Tage.`);
            else if (r28.total >= 14 && r28.pct >= 80) verdict = note('ok', `${r28.pct} % über ${r28.total} Tage – die Gewohnheit sitzt. Jetzt darfst du <strong>vergrössern</strong>: etwa 10–20 % mehr („${esc(h.routine)}" → etwas länger oder eine Stufe anspruchsvoller). Oder du hängst die nächste Gewohnheit direkt dahinter.`);
            else verdict = note('ok', `${r7.pct} % diese Woche. Noch nicht vergrössern – erst zwei Wochen stabil über 80 %, dann steigern.`);
            return `<div class="hb-eval-card"><div class="hb-law-h"><b>${esc(h.name)}</b><span class="hb-streak">🔥 ${streak(h)}</span></div><div class="hb-stats"><div><b>${r7.pct}%</b><span>7 Tage (${r7.hit}/${r7.total})</span></div><div><b>${r28.pct}%</b><span>28 Tage (${r28.hit}/${r28.total})</span></div><div><b>${lg}</b><span>längste Serie</span></div><div><b>${Object.keys(h.done || {}).length}</b><span>gesamt</span></div></div>${wd.length > 2 ? `<div class="hb-wd">${byWeekday(h).map(x => `<div><i style="height:${x.pct === null ? 0 : Math.max(4, x.pct * 0.4)}px" class="${x.pct === null ? '' : x.pct >= 70 ? 'ok' : x.pct >= 40 ? 'mid' : 'low'}"></i><span>${x.w}</span></div>`).join('')}</div>${best && worst && best.pct - worst.pct >= 40 ? `<div class="mk-faint" style="font-size:12px">Stärkster Tag ${best.w} (${best.pct} %), schwächster ${worst.w} (${worst.pct} %).</div>` : ''}` : ''}${verdict}<div class="mk-grid-2" style="margin-top:10px"><div class="mk-field"><label>Was hat geholfen?</label><input class="mk-input" data-rv="${h.id}" data-k="helped" value="${esc(R.helped || '')}" placeholder="z. B. Sachen am Vorabend bereitlegen"></div><div class="mk-field"><label>Was hat gestört?</label><input class="mk-input" data-rv="${h.id}" data-k="hindered" value="${esc(R.hindered || '')}" placeholder="z. B. Handy zuerst in die Hand genommen"></div></div></div>`;
        }).join('');
        $('hb-eval').querySelectorAll('[data-rv]').forEach(i => i.addEventListener('input', () => { const h = H(i.dataset.rv); h.review = h.review || {}; h.review[i.dataset.k] = i.value; MethodKit.save(); }));
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        if (!S.habits.length) { $('hb-summary').innerHTML = note('info', 'Noch nichts angelegt.'); return; }
        $('hb-summary').innerHTML = S.habits.map(h => { const r = rate(h, 28); return `<div class="mk-result" style="margin-bottom:10px"><h4>${esc(h.name)}${h.paused ? ' <span class="mk-badge">pausiert</span>' : ''}</h4><div class="hb-formula" style="margin:6px 0"><b>Nachdem</b> ${esc(cueT(h.cue))}, <b>werde ich</b> ${esc(h.routine)}${h.reward ? `, <b>und danach</b> ${esc(h.reward)}` : ''}.${h.identity ? `<small>${esc(h.identity)}</small>` : ''}</div><div class="mk-faint" style="font-size:13px">${lawsDone(h)}/4 Gesetze · ${(h.ifthen || {}).then ? 'Plan B ✓' : 'kein Plan B'} · 🔥 ${streak(h)} · ${r.total ? `${r.pct} % (${r.total} Tage)` : 'noch kein Tracking'}</div></div>`; }).join('');
    }
    function renderLinks() { $('hb-links').innerHTML = LINKS.map(x => `<a class="mk-option hb-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['GEWOHNHEITS-SYSTEM', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        S.habits.forEach(h => {
            const r = rate(h, 28), L2 = h.laws || {}, I = h.ifthen || {};
            L.push(`■ ${h.name}${h.paused ? ' (pausiert)' : ''}`, `  Nachdem ${cueT(h.cue)}, werde ich ${h.routine}${h.reward ? `, und danach ${h.reward}` : ''}.`);
            if (h.identity) L.push(`  Identität: ${h.identity}`);
            LAWS.forEach(([k, , t]) => { if ((L2[k] || '').trim()) L.push(`  ${t}: ${L2[k].trim()}`); });
            if ((I.if || '').trim()) L.push(`  Wenn ${I.if.trim()} → dann ${(I.then || '').trim()}`);
            L.push(`  Streak ${streak(h)} · längste Serie ${longest(h)} · ${r.total ? `${r.pct} % in ${r.total} Tagen` : 'kein Tracking'}`);
            if ((h.review || {}).helped) L.push(`  Geholfen: ${h.review.helped}`); if ((h.review || {}).hindered) L.push(`  Gestört: ${h.review.hindered}`);
            L.push('');
        });
        MethodKit.exportText('gewohnheiten.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'habit-building', accent: '#22c55e', accent2: '#14b8a6',
            steps: [{ icon: '🎨', label: 'Designen' }, { icon: '🪶', label: 'Reibung' }, { icon: '✅', label: 'Tracken' }, { icon: '📈', label: 'Auswerten' }, { icon: '🧭', label: 'System' }],
            defaultState: { habits: [] }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.habits)) S.habits = [];
        S.habits.forEach(h => { h.laws = h.laws || {}; h.ifthen = h.ifthen || { if: '', then: '' }; h.done = h.done || {}; h.review = h.review || {}; if (!h.created) { const ks = Object.keys(h.done).sort(); h.created = ks.length ? new Date(ks[0]).getTime() : Date.now(); } });
        ['hb-name', 'hb-cue', 'hb-routine', 'hb-reward', 'hb-identity'].forEach(id => $(id).addEventListener('input', renderPreview));
        $('hb-add').addEventListener('click', addHabit);
        $('hb-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) { renderPreview(); renderHabits(); }
            if (k === 2) renderLaws();
            if (k === 3) renderTrack();
            if (k === 4) renderEval();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
