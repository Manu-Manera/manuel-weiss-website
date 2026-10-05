/* Building habits · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const LAWS = [
        ['obv', '👀', 'Obvious', 'Where is the cue visibly ready? (mat in front of the bed, book on the pillow, app on the home screen)'],
        ['attr', '🍬', 'Attractive', 'What do you pair it with that you look forward to? (podcast only while running, favorite coffee only while writing)'],
        ['easy', '🪶', 'Easy', 'What do you prepare the night before so it needs zero decisions?'],
        ['sat', '✅', 'Satisfying', 'What\'s the immediate reward right after – not in three months?']
    ];
    const WD = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const LINKS = [
        { m: 'Goal setting', l: '../goal-setting/goal-setting.html', why: 'Where the habit should lead.' },
        { m: 'Rubicon model', l: '../rubikon-model/rubikon-model.html', why: 'From wish through decision into action.' },
        { m: 'Stress compass', l: '../stress-management/stress-management.html', why: 'Build recovery habits on purpose.' },
        { m: 'Journaling', l: '../journaling/journaling.html', why: 'Evening reflection as a habit.' }
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
        $('hb-cue-note').innerHTML = cue ? (cq === 2 ? '' : note('info', 'Make the cue more concrete: “After I …” or a fixed time/place. Vague cues (“in the morning”) don\'t fire.')) : '';
        const mins = routineMinutes(r);
        $('hb-routine-note').innerHTML = !r ? '' : mins !== null && mins > 5 ? note('warn', `${mins} minutes is too big to start. Fogg: under two minutes – “read one page,” “one push-up,” “put on shoes.” Size comes on its own, consistency doesn't.`) : /jeden tag|immer|täglich/i.test(r) && !mins ? note('info', 'The action itself, not the frequency: what exactly do you do when the cue comes?') : '';
        $('hb-preview').innerHTML = (cue || r) ? `<div class="hb-formula"><b>Nachdem</b> ${esc(cueT(cue) || '…')}, <b>I will</b> ${esc(r || '…')}${v('hb-reward') ? `, <b>und danach</b> ${esc(v('hb-reward'))}` : ''}.${v('hb-identity') ? `<small>${esc(v('hb-identity'))}</small>` : ''}</div>` : '';
    }
    function addHabit() {
        const v = (id) => $(id).value.trim();
        if (!v('hb-name')) { MethodKit.toast('What do you want to build?', 'warn'); $('hb-name').focus(); return; }
        if (!v('hb-cue') || !v('hb-routine')) { MethodKit.toast('Cue and action are required – without them there is no habit', 'warn'); return; }
        if (S.habits.filter(h => !h.paused).length >= 3 && !confirm('You already have three active habits. More than three at once almost always fail. Create it anyway?')) return;
        S.habits.push({ id: MethodKit.uid(), name: v('hb-name'), cue: v('hb-cue'), routine: v('hb-routine'), reward: v('hb-reward'), identity: v('hb-identity'), laws: {}, ifthen: { if: '', then: '' }, done: {}, review: {}, created: Date.now() });
        ['hb-name', 'hb-cue', 'hb-routine', 'hb-reward', 'hb-identity'].forEach(id => $(id).value = '');
        MethodKit.save({ now: true }); MethodKit.toast('Created – step 2 makes it easier', 'ok'); renderPreview(); renderHabits();
    }
    function renderHabits() {
        const act = S.habits.filter(h => !h.paused).length;
        $('hb-count').textContent = S.habits.length ? `${act} aktiv${S.habits.length - act ? ` · ${S.habits.length - act} pausiert` : ''}` : '';
        if (!S.habits.length) { $('hb-habits').innerHTML = '<div class="mk-empty">No habit yet. Start with exactly one.</div>'; return; }
        $('hb-habits').innerHTML = S.habits.map(h => `<div class="hb-habit ${h.paused ? 'paused' : ''}"><div class="hb-habit-top"><div class="hb-habit-t"><h4>${esc(h.name)}</h4><div class="hb-meta">Nachdem ${esc(cueT(h.cue))} → ${esc(h.routine)}${h.reward ? ` → ${esc(h.reward)}` : ''}</div>${h.identity ? `<div class="hb-id">${esc(h.identity)}</div>` : ''}</div><div class="hb-habit-a"><button class="mk-iconbtn" data-pause="${h.id}" aria-label="${h.paused ? 'Fortsetzen' : 'Pausieren'}" title="${h.paused ? 'Fortsetzen' : 'Pausieren'}"><i class="fas fa-${h.paused ? 'play' : 'pause'}"></i></button><button class="mk-iconbtn" data-del="${h.id}" aria-label="Delete"><i class="fas fa-trash"></i></button></div></div>${routineMinutes(h.routine) > 5 ? note('warn', 'Diese Handlung ist gross. Wenn sie im Tracking hakt: verkleinern.') : ''}</div>`).join('') +
            (act > 3 ? note('warn', `${act} active habits at once: pick one “keystone” habit and pause the others until it sits (≈ 3–4 weeks).`) : '');
        $('hb-habits').querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { if (!confirm('Delete habit including tracking?')) return; S.habits = S.habits.filter(h => h.id !== b.dataset.del); MethodKit.save(); renderHabits(); }));
        $('hb-habits').querySelectorAll('[data-pause]').forEach(b => b.addEventListener('click', () => { H(b.dataset.pause).paused = !H(b.dataset.pause).paused; MethodKit.save(); renderHabits(); }));
    }

    /* ---------- 2 ---------- */
    function renderLaws() {
        const hs = S.habits.filter(h => !h.paused);
        if (!hs.length) { $('hb-laws').innerHTML = note('info', 'Create a habit in step 1.'); return; }
        $('hb-laws').innerHTML = hs.map(h => { const L = h.laws || {}, I = h.ifthen || {}; const d = lawsDone(h); return `<div class="hb-law-card"><div class="hb-law-h"><b>${esc(h.name)}</b><span class="mk-badge">${d}/4 laws</span></div><div class="mk-grid-2">${LAWS.map(([k, ic, t, q]) => `<div class="mk-field"><label>${ic} ${t}</label><textarea class="mk-textarea" rows="2" data-law="${h.id}" data-k="${k}" placeholder="${q}">${esc(L[k] || '')}</textarea></div>`).join('')}</div><div class="mk-section-label">If-then plan (implementation intention)</div><div class="mk-grid-2"><div class="mk-field"><label>If this obstacle comes …</label><input class="mk-input" data-if="${h.id}" value="${esc(I.if || '')}" placeholder="e.g. I oversleep / visitors are here / I'm tired"></div><div class="mk-field"><label>… then I do</label><input class="mk-input" data-then="${h.id}" value="${esc(I.then || '')}" placeholder="e.g. the minimum version: 3 breaths instead of 2 minutes"></div></div>${lawNote(h)}</div>`; }).join('');
        const host = $('hb-laws');
        host.querySelectorAll('[data-law]').forEach(t => t.addEventListener('input', () => { const h = H(t.dataset.law); h.laws = h.laws || {}; h.laws[t.dataset.k] = t.value; MethodKit.save(); }));
        host.querySelectorAll('[data-if]').forEach(i => i.addEventListener('input', () => { const h = H(i.dataset.if); h.ifthen = h.ifthen || {}; h.ifthen.if = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-then]').forEach(i => i.addEventListener('input', () => { const h = H(i.dataset.then); h.ifthen = h.ifthen || {}; h.ifthen.then = i.value; MethodKit.save(); }));
        host.querySelectorAll('textarea, input').forEach(el => el.addEventListener('change', renderLaws));
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function lawNote(h) {
        const L = h.laws || {}, I = h.ifthen || {}, d = lawsDone(h);
        if (!d) return note('info', 'Most habits fail not from will, but from the environment. Start with “Easy”: what do you prepare?');
        if (!(L.sat || '').trim()) return note('info', 'The reward is missing. The brain repeats what feels good immediately – not what\'s healthy in three months.');
        if (!(I.if || '').trim() || !(I.then || '').trim()) return note('info', 'Plan the failure: if-then plans double the follow-through rate (Gollwitzer). Which obstacle will definitely come?');
        if (/mehr|später|morgen|nachholen/i.test(I.then)) return note('warn', '“Catching up” is not a strategy – it doubles the load. Better: a minimum version you can do even on bad days.');
        return note('ok', 'System complete: four laws and a plan B. Now only the daily checkmark counts.');
    }

    /* ---------- 3 ---------- */
    function renderTrack() {
        const hs = S.habits.filter(h => !h.paused);
        if (!hs.length) { $('hb-track').innerHTML = note('info', 'No active habit yet.'); return; }
        const tk = today();
        $('hb-track').innerHTML = hs.map(h => { const done = (h.done || {})[tk]; const st = streak(h); const my = missedYesterday(h); return `<div class="hb-habit"><div class="hb-habit-top"><button class="hb-check ${done ? 'done' : ''}" data-c="${h.id}" aria-label="Done today">${done ? '<i class="fas fa-check"></i>' : ''}</button><div class="hb-habit-t"><h4>${esc(h.name)}</h4><div class="hb-meta">${esc(h.routine)}</div></div><span class="hb-streak">🔥 ${st}</span></div>${my && !done ? note('warn', `Gestern ausgelassen. Heute ist der wichtigste Tag: <strong>Nie zweimal.</strong>${(h.ifthen || {}).then ? ` Plan B: ${esc(h.ifthen.then)}` : ' If needed, the minimum version.'}`) : ''}<div class="hb-cal" data-cal="${h.id}">${[...Array(28)].map((_, i) => { const d = daysAgo(27 - i); const k = key(d); const before = h.created && d < new Date(key(new Date(h.created))); return `<button class="${(h.done || {})[k] ? 'on' : ''} ${before ? 'pre' : ''} ${k === tk ? 'today' : ''}" data-d="${k}" data-h="${h.id}" ${before ? 'disabled' : ''} title="${d.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'numeric' })}" aria-label="${k}"></button>`; }).join('')}</div><div class="hb-cal-l"><span>4 weeks ago</span><span>today</span></div></div>`; }).join('');
        const host = $('hb-track');
        host.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { const h = H(b.dataset.c); h.done = h.done || {}; if (h.done[tk]) delete h.done[tk]; else { h.done[tk] = true; const s = streak(h); MethodKit.toast(s >= 7 ? `🔥 ${s} days – this is becoming a habit` : s >= 3 ? `🔥 ${s} days in a row` : 'Done ✓', 'ok'); } MethodKit.save({ now: true }); renderTrack(); }));
        host.querySelectorAll('.hb-cal [data-d]').forEach(b => b.addEventListener('click', () => { const h = H(b.dataset.h); h.done = h.done || {}; if (h.done[b.dataset.d]) delete h.done[b.dataset.d]; else h.done[b.dataset.d] = true; MethodKit.save(); renderTrack(); }));
    }

    /* ---------- 4 ---------- */
    function renderEval() {
        const hs = S.habits.filter(h => !h.paused);
        if (!hs.length) { $('hb-eval').innerHTML = note('info', 'No active habit yet.'); return; }
        $('hb-eval').innerHTML = hs.map(h => {
            const r7 = rate(h, 7), r28 = rate(h, 28), lg = longest(h), wd = byWeekday(h).filter(x => x.pct !== null);
            const best = wd.length > 2 ? [...wd].sort((a, b) => b.pct - a.pct)[0] : null, worst = wd.length > 2 ? [...wd].sort((a, b) => a.pct - b.pct)[0] : null;
            const R = h.review || {};
            let verdict;
            if (r28.total < 5) verdict = note('info', `Only ${r28.total} Day${r28.total === 1 ? '' : 'e'} tracked – patterns show up after about a week. Keep going.`);
            else if (r7.pct < 50) verdict = note('warn', `${r7.pct} % in the last 7 days. This is not a character problem – the habit is too big or the cue is too weak. <strong>Halve the action</strong> („${esc(h.routine)}" → what would the half version be?) or pair it with a more reliable cue.`);
            else if (r7.pct < 80) verdict = note('info', `${r7.pct} % – solide, aber wacklig. Schau auf die schwachen Tage${worst && worst.pct < 50 ? ` (${worst.w}: ${worst.pct} %)` : ''}: What's different there? A second cue for those days often helps.`);
            else if (r28.total >= 14 && r28.pct >= 80) verdict = note('ok', `${r28.pct} % over ${r28.total} days – the habit sits. Now you may <strong>grow it</strong>: about 10–20 % more (“${esc(h.routine)}" → a bit longer or one level more demanding). Or you stack the next habit right after it.`);
            else verdict = note('ok', `${r7.pct} % this week. Don't grow it yet – first two weeks stable above 80 %, then increase.`);
            return `<div class="hb-eval-card"><div class="hb-law-h"><b>${esc(h.name)}</b><span class="hb-streak">🔥 ${streak(h)}</span></div><div class="hb-stats"><div><b>${r7.pct}%</b><span>7 days (${r7.hit}/${r7.total})</span></div><div><b>${r28.pct}%</b><span>28 days (${r28.hit}/${r28.total})</span></div><div><b>${lg}</b><span>longest streak</span></div><div><b>${Object.keys(h.done || {}).length}</b><span>total</span></div></div>${wd.length > 2 ? `<div class="hb-wd">${byWeekday(h).map(x => `<div><i style="height:${x.pct === null ? 0 : Math.max(4, x.pct * 0.4)}px" class="${x.pct === null ? '' : x.pct >= 70 ? 'ok' : x.pct >= 40 ? 'mid' : 'low'}"></i><span>${x.w}</span></div>`).join('')}</div>${best && worst && best.pct - worst.pct >= 40 ? `<div class="mk-faint" style="font-size:12px">Strongest day ${best.w} (${best.pct} %), weakest ${worst.w} (${worst.pct} %).</div>` : ''}` : ''}${verdict}<div class="mk-grid-2" style="margin-top:10px"><div class="mk-field"><label>What helped?</label><input class="mk-input" data-rv="${h.id}" data-k="helped" value="${esc(R.helped || '')}" placeholder="e.g. Lay things out the night before"></div><div class="mk-field"><label>What got in the way?</label><input class="mk-input" data-rv="${h.id}" data-k="hindered" value="${esc(R.hindered || '')}" placeholder="e.g. Picked up the phone first"></div></div></div>`;
        }).join('');
        $('hb-eval').querySelectorAll('[data-rv]').forEach(i => i.addEventListener('input', () => { const h = H(i.dataset.rv); h.review = h.review || {}; h.review[i.dataset.k] = i.value; MethodKit.save(); }));
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        if (!S.habits.length) { $('hb-summary').innerHTML = note('info', 'Nothing created yet.'); return; }
        $('hb-summary').innerHTML = S.habits.map(h => { const r = rate(h, 28); return `<div class="mk-result" style="margin-bottom:10px"><h4>${esc(h.name)}${h.paused ? ' <span class="mk-badge">pausiert</span>' : ''}</h4><div class="hb-formula" style="margin:6px 0"><b>Nachdem</b> ${esc(cueT(h.cue))}, <b>I will</b> ${esc(h.routine)}${h.reward ? `, <b>und danach</b> ${esc(h.reward)}` : ''}.${h.identity ? `<small>${esc(h.identity)}</small>` : ''}</div><div class="mk-faint" style="font-size:13px">${lawsDone(h)}/4 laws · ${(h.ifthen || {}).then ? 'Plan B ✓' : 'kein Plan B'} · 🔥 ${streak(h)} · ${r.total ? `${r.pct} % (${r.total} Tage)` : 'no tracking yet'}</div></div>`; }).join('');
    }
    function renderLinks() { $('hb-links').innerHTML = LINKS.map(x => `<a class="mk-option hb-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['HABIT SYSTEM', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), ''];
        S.habits.forEach(h => {
            const r = rate(h, 28), L2 = h.laws || {}, I = h.ifthen || {};
            L.push(`■ ${h.name}${h.paused ? ' (pausiert)' : ''}`, `  Nachdem ${cueT(h.cue)}, werde ich ${h.routine}${h.reward ? `, und danach ${h.reward}` : ''}.`);
            if (h.identity) L.push(`  Identity: ${h.identity}`);
            LAWS.forEach(([k, , t]) => { if ((L2[k] || '').trim()) L.push(`  ${t}: ${L2[k].trim()}`); });
            if ((I.if || '').trim()) L.push(`  If ${I.if.trim()} → then ${(I.then || '').trim()}`);
            L.push(`  Streak ${streak(h)} · longest streak ${longest(h)} · ${r.total ? `${r.pct} % in ${r.total} Tagen` : 'no tracking'}`);
            if ((h.review || {}).helped) L.push(`  Helped: ${h.review.helped}`); if ((h.review || {}).hindered) L.push(`  Got in the way: ${h.review.hindered}`);
            L.push('');
        });
        MethodKit.exportText('gewohnheiten.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'habit-building', accent: '#22c55e', accent2: '#14b8a6',
            steps: [{ icon: '🎨', label: 'Design' }, { icon: '🪶', label: 'Friction' }, { icon: '✅', label: 'Track' }, { icon: '📈', label: 'Evaluate' }, { icon: '🧭', label: 'System' }],
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
