/* Fünf Säulen der Identität (Petzold) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const P = [
        { id: 'body', ic: '💪', t: 'Body', d: 'Health, energy, sleep, movement, body awareness', c: '#22c55e', q: 'How at home do you feel in your body – and how do you take care of it?', help: ['Sleep before everything else: fixed times for one week', 'Go outside for 20 minutes every day', 'Book that doctor\'s appointment you\'ve been putting off'] },
        { id: 'social', ic: '🤝', t: 'Social network', d: 'Family, friends, partnership, colleagues, belonging', c: '#ec4899', q: 'Who is there when things get hard – and how often are you actually in touch?', help: ['Actively call one person a week', 'Put a meet-up firmly in the calendar', 'Join a group or club'] },
        { id: 'work', ic: '💼', t: 'Work & achievement', d: 'Job, tasks, skills, recognition, effectiveness', c: '#6366f1', q: 'Do you experience yourself as effective – and is what you contribute seen?', help: ['Have a conversation about role and expectations', 'Deepen one skill on purpose', 'Volunteer work or a project outside the job'] },
        { id: 'mat', ic: '🏠', t: 'Material security', d: 'Income, housing, savings, possessions, protection', c: '#f59e0b', q: 'Can you sleep well when it comes to money and housing?', help: ['Track expenses for one month', 'Set an emergency-fund goal (3 months of expenses)', 'Review insurance and contracts once'] },
        { id: 'values', ic: '🧭', t: 'Values & meaning', d: 'Beliefs, faith, sense of meaning, ideals, belonging to something larger', c: '#14b8a6', q: 'Do you know what you get up for – and do you live by it?', help: ['Clarify values (Values compass method)', 'A commitment to something larger than you', '5 minutes of stillness or gratitude daily'] }
    ];
    const TREND = [['down', '↘', 'is getting weaker'], ['flat', '→', 'stabil'], ['up', '↗', 'is getting stronger']];
    const EFF = [['s', 'small (≤ 30 min)'], ['m', 'medium (an afternoon)'], ['l', 'large (several weeks)']];
    const LINKS = [
        { m: 'Resource analysis', l: '../resource-analysis/resource-analysis.html', why: 'What specifically holds in each pillar?' },
        { m: 'Values compass', l: '../values-clarification/values-clarification.html', why: 'Deepen the values & meaning pillar.' },
        { m: 'Stress compass', l: '../stress-management/stress-management.html', why: 'When a pillar is wobbling right now.' },
        { m: 'Wheel of Life', l: '../wheel-of-life/wheel-of-life.html', why: 'A finer split of life areas.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const R = (id) => S.r[id] || (S.r[id] = { sat: 0, trend: '', note: '' });
    const PI = (id) => P.find(p => p.id === id);
    const rated = () => P.filter(p => n(R(p.id).sat, 0));
    const sorted = () => [...rated()].sort((a, b) => R(a.id).sat - R(b.id).sat);
    const avg = () => { const r = rated(); return r.length ? r.reduce((a, p) => a + R(p.id).sat, 0) / r.length : 0; };

    /* ---------- 1 ---------- */
    function renderRate() {
        $('fp-rate').innerHTML = P.map(p => { const r = R(p.id); return `<div class="fp-p" style="--c:${p.c}"><div class="fp-p-h"><span>${p.ic}</span><div><b>${p.t}</b><small>${p.d}</small></div><em>${r.sat ? r.sat + '/10' : '–'}</em></div><div class="fp-q">${p.q}</div><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${r.sat || 5}" data-sat="${p.id}" aria-label="${p.t} Zufriedenheit"><span class="mk-range-val">${r.sat || '–'}</span></div><div class="fp-trend">${TREND.map(([k, s, l]) => `<button class="${r.trend === k ? 'on ' + k : ''}" data-tr="${p.id}" data-v="${k}">${s} ${l}</button>`).join('')}</div><input class="mk-input" data-note="${p.id}" value="${esc(r.note || '')}" placeholder="What holds here – and what wobbles?"></div>`; }).join('') + rateNote();
        const host = $('fp-rate');
        host.querySelectorAll('[data-sat]').forEach(i => { i.addEventListener('input', () => { R(i.dataset.sat).sat = +i.value; i.nextElementSibling.textContent = i.value; i.closest('.fp-p').querySelector('em').textContent = i.value + '/10'; MethodKit.save(); }); i.addEventListener('change', renderRate); });
        host.querySelectorAll('[data-tr]').forEach(b => b.addEventListener('click', () => { R(b.dataset.tr).trend = b.dataset.v; MethodKit.save(); renderRate(); }));
        host.querySelectorAll('[data-note]').forEach(i => i.addEventListener('input', () => { R(i.dataset.note).note = i.value; MethodKit.save(); }));
    }
    function rateNote() {
        const r = rated(); if (r.length < 5) return note('info', `${r.length}/5 pillars rated. Move each slider deliberately – even if “5” feels convenient.`);
        const noTrend = P.filter(p => !R(p.id).trend); if (noTrend.length) return note('info', `Trend missing for ${noTrend.map(p => p.t).join(', ')}. The trend is often more important than the score: a 7 that's falling needs more attention than a 5 that's rising.`);
        return note('ok', 'All pillars rated. The picture in the next step shows how your roof is standing.');
    }

    /* ---------- 2 ---------- */
    function analysis() {
        const out = []; const r = rated(); if (r.length < 5) return out;
        const so = sorted(), low = so[0], high = so[so.length - 1], a = avg(), spread = R(high.id).sat - R(low.id).sat;
        const weak = P.filter(p => R(p.id).sat <= 4), falling = P.filter(p => R(p.id).trend === 'down');
        if (weak.length >= 2) out.push(['warn', `<strong>${weak.slice(0, -1).map(p => p.t).join(', ')} und ${weak[weak.length - 1].t}</strong> are at 4 or below. ${['', '', 'Zwei', 'Drei', 'Vier', 'Fünf'][weak.length]} weak pillars at once – the roof no longer holds on its own. Get support before you try to carry everything yourself.`]);
        else if (weak.length === 1) out.push(['warn', `<strong>${weak[0].t}</strong> is at ${R(weak[0].id).sat}/10 the stress point. The others are carrying the load for now – that works for a while, but not forever.`]);
        if (R(high.id).sat >= 8 && so.slice(0, 4).every(p => R(p.id).sat <= 5)) out.push(['warn', `<strong>Concentration risk:</strong> Your identity rests almost entirely on <strong>${high.t}</strong> (${R(high.id).sat}/10), the others are at ≤ 5. If this pillar falls – layoff, illness, breakup – everything falls. Build a second one now, while you're doing well.`]);
        else if (spread >= 5) out.push(['info', `Wide spread: ${high.t} ${R(high.id).sat} vs. ${low.t} ${R(low.id).sat}. Often one pillar is overbuilt to compensate for another. Ask yourself: am I fleeing into ${high.t}?`]);
        if (falling.length >= 2) out.push(['warn', `${falling.map(p => p.t).join(' und ')} are getting weaker. Several falling trends at once are an early warning – even if the scores are still okay.`]);
        else if (falling.length === 1 && R(falling[0].id).sat >= 6) out.push(['info', `${falling[0].t} stands at ${R(falling[0].id).sat}, but falling. Now is the good moment to countersteer – not only once it hits 4.`]);
        if (R('work').sat >= 8 && R('body').sat <= 5 && R('body').trend !== 'up') out.push(['info', 'Work strong, body weak – the classic pattern before burnout. The body is the pillar all the others physically stand on.']);
        if (R('values').sat <= 4 && a >= 6) out.push(['info', 'Everything is running, but meaning is missing. That\'s the “emptiness despite success.” The values pillar doesn\'t need big steps, just clarity: what is all this for?']);
        if (R('social').sat <= 4 && R('mat').sat >= 7) out.push(['info', 'Materially secure, socially thin. Money cushions a lot – but in a crisis you need people, not a bank balance.']);
        if (!out.length) out.push(spread <= 2 && a >= 7 ? ['ok', `Balanced and stable (Ø ${a.toFixed(1)}). Das ist das Ziel des Modells: kein Dach auf einer Säule, sondern auf fünf. Pflege, was da ist.`] : ['ok', `Ø ${a.toFixed(1)}/10, no acute imbalance. The weakest pillar (${low.t}, ${R(low.id).sat}) ist dein natürlicher Fokus.`]);
        return out;
    }
    function renderChart() {
        if (rated().length < 5) { $('fp-chart').innerHTML = note('info', 'Rate all five pillars in step 1.'); return; }
        const a = avg(), last = S.history.length ? S.history[S.history.length - 1] : null;
        $('fp-chart').innerHTML = `<div class="fp-house"><div class="fp-roof"><span>Identity</span><small>Ø ${a.toFixed(1)}</small></div><div class="fp-cols">${P.map(p => { const r = R(p.id); const d = last && last.r[p.id] ? r.sat - last.r[p.id].sat : null; return `<div class="fp-col"><div class="fp-col-t"><i style="height:${r.sat * 10}%; background:${p.c}" class="${r.sat <= 4 ? 'weak' : ''}"><b>${r.sat}</b></i></div><span class="fp-col-ic">${p.ic}</span><span class="fp-col-l">${p.t}</span><span class="fp-col-tr ${r.trend}">${(TREND.find(t => t[0] === r.trend) || ['', '·'])[1]}${d !== null && d !== 0 ? ` <em>${d > 0 ? '+' : ''}${d}</em>` : ''}</span></div>`; }).join('')}</div><div class="fp-ground"></div></div>` + analysis().map(([t, m]) => note(t, m)).join('');
    }

    /* ---------- 3 ---------- */
    function renderFocus() {
        if (rated().length < 5) { $('fp-focus').innerHTML = note('info', 'Rate all pillars first.'); return; }
        const so = sorted(); const sugg = P.find(p => R(p.id).trend === 'down' && R(p.id).sat <= 5) || so[0];
        const focus = S.focus && PI(S.focus) ? PI(S.focus) : null;
        const strong = focus ? P.filter(p => p.id !== focus.id && R(p.id).sat >= 6).sort((a, b) => R(b.id).sat - R(a.id).sat) : [];
        $('fp-focus').innerHTML = `<div class="mk-field"><label>Which pillar do you strengthen first?</label><div class="fp-pick">${so.map(p => `<button class="fp-pick-b ${S.focus === p.id ? 'on' : ''}" style="--c:${p.c}" data-f="${p.id}"><span>${p.ic}</span><b>${p.t}</b><small>${R(p.id).sat}/10 ${(TREND.find(t => t[0] === R(p.id).trend) || ['', ''])[1]}</small>${p.id === sugg.id ? '<em>Suggestion</em>' : ''}</button>`).join('')}</div></div>` +
            (!focus ? note('info', `Suggestion: <strong>${sugg.t}</strong> – ${R(sugg.id).trend === 'down' ? 'sie fällt und ist schon unter 6' : 'die niedrigste Säule'}. You may also pick another if it matters more to you.`) :
                `<div class="fp-focus-card" style="--c:${focus.c}"><div class="fp-p-h"><span>${focus.ic}</span><div><b>${focus.t}</b><small>${R(focus.id).sat}/10 · ${(TREND.find(t => t[0] === R(focus.id).trend) || ['', '', 'kein Trend'])[2]}</small></div></div>${R(focus.id).note ? `<div class="fp-quote">„${esc(R(focus.id).note)}"</div>` : ''}<div class="mk-field"><label>If this pillar keeps getting weaker – what happens to the other four?</label><textarea class="mk-textarea" id="fp-impact" rows="2" placeholder="e.g. Ohne Energie leidet die Arbeit, und für Freunde bleibt nichts übrig">${esc(S.impact || '')}</textarea></div><div class="mk-field"><label>Which strong pillar can support it?</label><div class="mk-chips">${strong.length ? strong.map(p => `<button class="mk-chip ${S.support === p.id ? 'selected' : ''}" data-sup="${p.id}">${p.ic} ${p.t} (${R(p.id).sat})</button>`).join('') : '<span class="mk-faint">No pillar above 5 – then get support from outside: a person, counseling.</span>'}</div></div>${S.support && PI(S.support) ? `<div class="mk-field"><label>How exactly does ${PI(S.support).t} help with ${focus.t}?</label><input class="mk-input" id="fp-how" value="${esc(S.how || '')}" placeholder="${howHint(focus.id, S.support)}"></div>` : ''}${focusNote(focus)}</div>`);
        const host = $('fp-focus');
        host.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { if (S.focus !== b.dataset.f) { S.focus = b.dataset.f; S.support = ''; S.how = ''; } MethodKit.save(); renderFocus(); }));
        host.querySelectorAll('[data-sup]').forEach(b => b.addEventListener('click', () => { S.support = S.support === b.dataset.sup ? '' : b.dataset.sup; MethodKit.save(); renderFocus(); }));
        const im = $('fp-impact'); if (im) { im.addEventListener('input', () => { S.impact = im.value; MethodKit.save(); }); im.addEventListener('change', renderFocus); }
        const hw = $('fp-how'); if (hw) { hw.addEventListener('input', () => { S.how = hw.value; MethodKit.save(); }); hw.addEventListener('change', renderFocus); }
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function howHint(f, s) {
        const M = { 'body|social': 'e.g. Arrange to exercise with a friend', 'body|work': 'e.g. Block the lunch break as a fixed walk', 'body|mat': 'e.g. Free up money for physio or a gym', 'body|values': 'e.g. See movement as a self-care ritual', 'social|work': 'e.g. Meet colleagues outside of work', 'social|body': 'e.g. A running group instead of alone', 'social|mat': 'e.g. Invite friends over for a meal', 'social|values': 'e.g. Find community through a commitment', 'work|social': 'e.g. Ask a mentor in your network for advice', 'work|body': 'e.g. Bring energy back into the job through sleep', 'work|values': 'e.g. Look for tasks that fit your values', 'work|mat': 'e.g. Use savings for further training', 'mat|work': 'e.g. A salary talk or a side project', 'mat|social': 'e.g. A money check with someone who knows this', 'mat|values': 'e.g. Clarify what “enough” is for you', 'mat|body': 'e.g. See health as the best insurance', 'values|social': 'e.g. Talk about meaning with people close to you', 'values|work': 'e.g. Name the meaning-part in your job', 'values|body': 'e.g. Stillness, nature, breath as a path to meaning', 'values|mat': 'e.g. Give money to something that matters to you' };
        return M[f + '|' + s] || 'How exactly?';
    }
    function focusNote(f) {
        const i = (S.impact || '').trim();
        if (!i) return note('info', 'Naming the interaction makes the urgency visible. Which pillar does this one pull down with it?');
        if (!S.support) return note('info', 'Petzold: pillars support each other. Pick the strongest – it\'s your resource for the rebuild.');
        const h = (S.how || '').trim();
        if (!h) return note('info', 'One more “how” – then you have the lever.');
        if (h.length < 25 || (/(?<![a-zäöüß])(mehr|weniger|öfter|besser|bewusster|versuchen|achten)(?![a-zäöüß])/i.test(h) && !/\d|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|jeden|täglich|wöchentlich|uhr/i.test(h))) return note('info', `„${esc(h)}" – that's a direction, not yet a lever. When, how often, with whom?`);
        return note('ok', `${f.t} strengthen with help from ${PI(S.support).t}. In the next step those become actions.`);
    }

    /* ---------- 4 ---------- */
    function renderPlan() {
        const focus = S.focus && PI(S.focus) ? PI(S.focus) : null;
        if (!focus) { $('fp-plan').innerHTML = note('info', 'Pick a focus pillar in step 3.'); return; }
        const strong = sorted()[4];
        $('fp-plan').innerHTML = `<div class="fp-focus-card" style="--c:${focus.c}"><div class="fp-p-h"><span>${focus.ic}</span><div><b>${focus.t} strengthen</b><small>Ideas: ${focus.help.join(' · ')}</small></div></div>${S.actions.map(a => `<div class="fp-act"><input class="mk-input" data-at="${a.id}" value="${esc(a.text)}" placeholder="What exactly?"><input class="mk-input fp-by" type="date" data-by="${a.id}" value="${esc(a.by || '')}"><div class="fp-eff">${EFF.map(([k, l]) => `<button class="${a.eff === k ? 'on' : ''}" data-eff="${a.id}" data-v="${k}" title="${l}">${k === 's' ? 'S' : k === 'm' ? 'M' : 'L'}</button>`).join('')}</div><button class="mk-iconbtn" data-del="${a.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>`).join('')}${S.actions.length < 3 ? `<button class="mk-btn mk-btn-outline mk-btn-sm" id="fp-add"><i class="fas fa-plus"></i> Schritt</button>` : ''}${planNote()}</div>` +
            (strong && strong.id !== focus.id ? `<div class="fp-focus-card" style="--c:${strong.c}; margin-top:12px"><div class="fp-p-h"><span>${strong.ic}</span><div><b>${strong.t} protect</b><small>Your strongest pillar (${R(strong.id).sat}/10). Strong pillars wobble from neglect – what will you do so it stays strong?</small></div></div><input class="mk-input" id="fp-protect" value="${esc(S.protect || '')}" placeholder="e.g. Reserve one hour a week just for this"></div>` : '');
        const host = $('fp-plan');
        const add = $('fp-add'); if (add) add.addEventListener('click', () => { S.actions.push({ id: MethodKit.uid(), text: '', by: '', eff: '' }); MethodKit.save(); renderPlan(); const l = host.querySelectorAll('[data-at]'); l.length && l[l.length - 1].focus(); });
        host.querySelectorAll('[data-at]').forEach(i => { i.addEventListener('input', () => { S.actions.find(a => a.id === i.dataset.at).text = i.value; MethodKit.save(); }); i.addEventListener('change', renderPlan); });
        host.querySelectorAll('[data-by]').forEach(i => i.addEventListener('change', () => { S.actions.find(a => a.id === i.dataset.by).by = i.value; MethodKit.save(); renderPlan(); }));
        host.querySelectorAll('[data-eff]').forEach(b => b.addEventListener('click', () => { S.actions.find(a => a.id === b.dataset.eff).eff = b.dataset.v; MethodKit.save(); renderPlan(); }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { S.actions = S.actions.filter(a => a.id !== b.dataset.del); MethodKit.save(); renderPlan(); }));
        const pr = $('fp-protect'); if (pr) pr.addEventListener('input', () => { S.protect = pr.value; MethodKit.save(); });
    }
    function planNote() {
        const A = S.actions.filter(a => (a.text || '').trim());
        if (!A.length) return note('info', 'One step is enough to start. Small enough that you\'ll do it this week.');
        if (A.every(a => a.eff === 'l')) return note('warn', 'Only large steps. Big plans for a weak pillar often fail for lack of the energy that\'s missing right there. Add a small step – for this week.');
        if (A.some(a => !(a.by || '').trim())) return note('info', 'Without a date it stays an intention. When?');
        if (!A.some(a => a.eff === 's')) return note('info', 'No small step in there. What can you do in 30 minutes?');
        return note('ok', `${A.length} Step${A.length > 1 ? 'e' : ''} with a date, at least one of them small. That's a plan that holds.`);
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        if (rated().length < 5) { $('fp-summary').innerHTML = note('info', 'No complete rating yet.'); return; }
        const focus = S.focus && PI(S.focus) ? PI(S.focus) : null; const A = S.actions.filter(a => (a.text || '').trim());
        $('fp-summary').innerHTML = `<div class="fp-sum">${P.map(p => `<div style="--c:${p.c}"><span>${p.ic}</span><b>${R(p.id).sat}</b><small>${p.t}</small><em class="${R(p.id).trend}">${(TREND.find(t => t[0] === R(p.id).trend) || ['', '·'])[1]}</em></div>`).join('')}</div><div class="mk-result"><h4>Ø ${avg().toFixed(1)}/10</h4>${analysis()[0] ? analysis()[0][1] : ''}</div>` +
            (focus ? `<div class="mk-result"><h4>${focus.ic} Focus: ${focus.t}</h4>${S.support && PI(S.support) ? `Gestützt durch ${PI(S.support).t}${S.how ? ` – ${esc(S.how)}` : ''}<br>` : ''}${A.length ? `<ul class="fp-ul">${A.map(a => `<li>${esc(a.text)}${a.by ? ` <small>bis ${new Date(a.by).toLocaleDateString('en-GB')}</small>` : ''}</li>`).join('')}</ul>` : '<span class="mk-faint">no steps yet</span>'}${S.protect ? `<div class="mk-faint" style="margin-top:6px">Schutz: ${esc(S.protect)}</div>` : ''}</div>` : '') +
            (S.history.length ? `<div class="mk-section-label">Verlauf (${S.history.length} Snapshot${S.history.length > 1 ? 's' : ''})</div><div class="fp-hist">${S.history.slice(-6).map(h => `<div><small>${new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' })}</small>${P.map(p => `<i style="height:${(h.r[p.id] ? h.r[p.id].sat : 0) * 3}px; background:${p.c}" title="${p.t}: ${h.r[p.id] ? h.r[p.id].sat : '–'}"></i>`).join('')}</div>`).join('')}</div>` : note('info', 'Save a snapshot – in three months you\'ll see what has moved.'));
    }
    function snapshot() { const r = {}; P.forEach(p => r[p.id] = { sat: R(p.id).sat, trend: R(p.id).trend }); const t = new Date().toDateString(); S.history = S.history.filter(h => new Date(h.date).toDateString() !== t); S.history.push({ date: Date.now(), r }); MethodKit.save({ now: true }); MethodKit.toast('Snapshot saved', 'ok'); renderSummary(); }
    function renderLinks() { $('fp-links').innerHTML = LINKS.map(x => `<a class="mk-option fp-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['FIVE PILLARS OF IDENTITY', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), ''];
        P.forEach(p => { const r = R(p.id); L.push(`${p.ic} ${p.t}: ${r.sat || '–'}/10 ${(TREND.find(t => t[0] === r.trend) || ['', ''])[1]}${r.note ? ` – ${r.note}` : ''}`); });
        analysis().forEach(([, m]) => L.push('', m.replace(/<[^>]+>/g, '')));
        if (S.focus && PI(S.focus)) { L.push('', `FOCUS: ${PI(S.focus).t}`); if (S.impact) L.push(`Interaction: ${S.impact}`); if (S.support && PI(S.support)) L.push(`Support: ${PI(S.support).t}${S.how ? ` – ${S.how}` : ''}`); S.actions.filter(a => a.text).forEach(a => L.push(`  - ${a.text}${a.by ? ` (bis ${a.by})` : ''}${a.eff ? ` [${a.eff.toUpperCase()}]` : ''}`)); if (S.protect) L.push(`Protection: ${S.protect}`); }
        if (S.history.length) { L.push('', 'HISTORY'); S.history.forEach(h => L.push(`  ${new Date(h.date).toLocaleDateString('de-CH')}: ${P.map(p => `${p.t} ${h.r[p.id] ? h.r[p.id].sat : '–'}`).join(' · ')}`)); }
        MethodKit.exportText('fuenf-saeulen.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'five-pillars', accent: '#16a34a', accent2: '#10b981',
            steps: [{ icon: '📊', label: 'Stocktake' }, { icon: '🏛️', label: 'Picture' }, { icon: '🔗', label: 'Impact' }, { icon: '🛠️', label: 'Plan' }, { icon: '🧾', label: 'Profile' }],
            defaultState: { r: {}, focus: '', support: '', how: '', impact: '', actions: [], protect: '', history: [] }
        });
        S = MethodKit.state;
        if (!S.r || typeof S.r !== 'object') S.r = {};
        // Migration: altes ratings{body,mind,soul,rel,career} → r{}
        if (S.ratings && typeof S.ratings === 'object') { const map = { body: 'body', rel: 'social', career: 'work', soul: 'values' }; Object.entries(map).forEach(([o, k]) => { if (S.ratings[o] && !S.r[k]) S.r[k] = { sat: n(S.ratings[o], 0), trend: '', note: (S.notes || {})[o] || '' }; }); delete S.ratings; delete S.notes; if (S.focus && map[S.focus]) S.focus = map[S.focus]; else if (S.focus && !PI(S.focus)) S.focus = ''; }
        if (!Array.isArray(S.actions)) S.actions = []; S.actions = S.actions.map(a => typeof a === 'string' ? { id: MethodKit.uid(), text: a, by: '', eff: '' } : Object.assign({ id: MethodKit.uid(), text: '', by: '', eff: '' }, a));
        if (!Array.isArray(S.history)) S.history = [];
        $('fp-export').addEventListener('click', exportAll); $('fp-snapshot').addEventListener('click', snapshot);
        MethodKit.onStep = function (k) {
            if (k === 1) renderRate();
            if (k === 2) renderChart();
            if (k === 3) renderFocus();
            if (k === 4) renderPlan();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
