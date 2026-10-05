/* GROW · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const NEG = /\b(nicht|nie|kein|keine|weniger|aufhören|loswerden|ohne)\b/i;
    const OBS_TYPES = { me: { l: 'In me', ic: '🪞', d: 'Fear, habit, belief, missing skill' }, others: { l: 'Others', ic: '👥', d: 'Expectations, resistance, lack of support' }, circ: { l: 'Circumstances', ic: '🌍', d: 'Time, money, rules, place' } };
    const RES = ['Experience', 'Knowledge', 'Network', 'Time', 'Money', 'Discipline', 'Creativity', 'Supporter', 'Courage', 'Health', 'Humour', 'Past successes'];
    const PROMPTS = ['If money were no object …', 'What would someone I admire do?', 'What would I advise a friend?', 'What is the opposite of what I have been doing so far?', 'What would be the smallest step?', 'What would be the bravest step?', 'Who could I ask for help?', 'What would I do if I knew for sure it would work?'];
    const LINKS = [
        { m: 'Rubicon model', l: '../rubikon-model/rubikon-model.html', why: 'Make the decision binding.' },
        { m: 'SMART goals', l: '../goal-setting/goal-setting.html', why: 'Sharpen the goal to make it measurable.' },
        { m: 'Solution focus', l: '../solution-focused/solution-focused.html', why: 'Deepen exceptions and scaling.' },
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'Turn the Will step into a routine.' },
        { m: 'Well-formed outcome (NLP)', l: '../nlp-meta-goal/nlp-meta-goal.html', why: 'Check the goal for coherence.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const todayKey = () => new Date().toISOString().slice(0, 10);
    const fmt = (iso) => { const d = new Date(iso); return isNaN(d) || !iso ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }); };
    const notes = (h) => h.map(x => `<div class="mk-note ${x.t}"><i class="fas ${x.t === 'ok' ? 'fa-check-circle' : x.t === 'warn' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i><span>${x.m}</span></div>`).join('');

    /* ---------- G ---------- */
    function renderGoalCheck() {
        const g = S.goal || ''; const h = []; let m;
        if ((m = g.match(NEG))) h.push({ t: 'warn', m: `„${esc(m[0])}" – phrase what you <em>instead</em> want.` });
        if (g.trim().length > 10 && !h.length && !(S.measure || '').trim()) h.push({ t: 'info', m: 'Good. How will you measure that you have achieved it? (field below)' });
        if (g.trim().length > 10 && !h.length && (S.measure || '').trim()) h.push({ t: 'ok', m: 'Positive and measurable – a goal you can work with.' });
        $('tc-goalcheck').innerHTML = notes(h);
    }
    function renderScaleDef() {
        const e = n(S.enough, 8);
        $('tc-scale-def').innerHTML = `
            <div class="mk-field"><label for="tc-ten">This is what 10 looks like</label><textarea class="mk-textarea" id="tc-ten" placeholder="A concrete picture of the achieved goal">${esc(S.ten || '')}</textarea></div>
            <div class="mk-field"><label>Good enough for me would be</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${e}" id="tc-enough"><span class="mk-range-val">${e}</span></div></div>
            ${e <= 6 ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>You are satisfied with relatively little – is the goal perhaps framed too big, or is it not that important to you?</span></div>' : ''}`;
        $('tc-ten').addEventListener('input', e => { S.ten = e.target.value; MethodKit.save(); });
        $('tc-enough').addEventListener('input', e => { S.enough = n(e.target.value, 8); MethodKit.save(); renderScaleDef(); });
        MethodKit._autosizeAll();
    }

    /* ---------- R ---------- */
    function renderNow() {
        const c = n(S.now, 3), e = n(S.enough, 8);
        $('tc-now').innerHTML = `
            <div class="tc-track"><i class="fill" style="width:${c * 10}%"></i><span class="mark" style="left:${c * 10}%">${c}</span><span class="mark enough" style="left:${e * 10}%" title="Good enough">${e}</span></div>
            <div class="tc-ticks">${Array.from({ length: 11 }, (_, i) => `<span>${i}</span>`).join('')}</div>
            <div class="mk-field" style="margin-top:14px"><label>Where do you stand on the goal scale today?</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" value="${c}" id="tc-nowr"><span class="mk-range-val">${c}</span></div></div>
            <div class="mk-field"><label for="tc-already">Why ${c} and not 0 – what have you already achieved?</label><textarea class="mk-textarea" id="tc-already" placeholder="…">${esc(S.already || '')}</textarea></div>
            ${e - c > 0 ? `<div class="mk-note info"><i class="fas fa-route"></i><span>Noch ${e - c} Punkt${e - c > 1 ? 'e' : ''} bis „gut genug". What would be the <strong>eine</strong> point that comes next?</span></div>` : ''}`;
        $('tc-nowr').addEventListener('input', e => { S.now = n(e.target.value, 3); MethodKit.save(); renderNow(); });
        $('tc-already').addEventListener('input', e => { S.already = e.target.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }
    function renderObstacles() {
        const O = S.obs;
        const counts = { me: 0, others: 0, circ: 0 }; O.forEach(o => { if (o.type && o.text) counts[o.type]++; });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        let insight = '';
        if (total >= 2) { const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]; if (top[1] / total >= 0.6) insight = { me: 'Most obstacles lie in you – good news: that is the area you can influence directly.', others: 'Most obstacles lie with others. Check: what of this is assumption, what is certain? And what can you do anyway?', circ: 'Mainly the circumstances slow you down. Which can you change, which do you have to plan for?' }[top[0]]; }
        $('tc-obstacles').innerHTML = `
            ${O.map(o => `<div class="tc-obs ${o.type || ''}"><input class="mk-input" data-ot="${o.id}" value="${esc(o.text)}" placeholder="What is in the way?"><div class="tc-obs-t">${Object.entries(OBS_TYPES).map(([k, t]) => `<button class="${o.type === k ? 'on' : ''}" data-oty="${o.id}" data-k="${k}" title="${t.d}">${t.ic} ${t.l}</button>`).join('')}</div><button class="mk-iconbtn" data-orm="${o.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>`).join('')}
            <button class="mk-btn mk-btn-outline mk-btn-sm" id="tc-obs-add"><i class="fas fa-plus"></i> Obstacle</button>
            ${insight ? `<div class="mk-note info" style="margin-top:10px"><i class="fas fa-lightbulb"></i><span>${insight}</span></div>` : ''}`;
        $('tc-obs-add').addEventListener('click', () => { S.obs.push({ id: MethodKit.uid(), text: '', type: '' }); MethodKit.save(); renderObstacles(); const i = $('tc-obstacles').querySelectorAll('[data-ot]'); i[i.length - 1].focus(); });
        $('tc-obstacles').querySelectorAll('[data-ot]').forEach(el => el.addEventListener('input', () => { const o = O.find(x => x.id === el.dataset.ot); if (o) { o.text = el.value; MethodKit.save(); } }));
        $('tc-obstacles').querySelectorAll('[data-oty]').forEach(b => b.addEventListener('click', () => { const o = O.find(x => x.id === b.dataset.oty); if (o) { o.type = b.dataset.k; MethodKit.save(); renderObstacles(); } }));
        $('tc-obstacles').querySelectorAll('[data-orm]').forEach(b => b.addEventListener('click', () => { S.obs = O.filter(x => x.id !== b.dataset.orm); MethodKit.save(); renderObstacles(); }));
    }
    function renderRes() {
        $('tc-res').innerHTML = RES.map(r => `<button class="mk-chip ${S.res.includes(r) ? 'selected' : ''}" data-r="${r}">${r}</button>`).join('');
        $('tc-res').querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { const i = S.res.indexOf(b.dataset.r); i > -1 ? S.res.splice(i, 1) : S.res.push(b.dataset.r); MethodKit.save(); renderRes(); }));
    }

    /* ---------- O ---------- */
    function renderPrompts() {
        $('tc-prompts').innerHTML = PROMPTS.map(p => `<button class="mk-chip ${S.usedPrompts.includes(p) ? 'selected' : ''}" data-pr="${esc(p)}">${esc(p)}</button>`).join('');
        $('tc-prompts').querySelectorAll('[data-pr]').forEach(b => b.addEventListener('click', () => { if (!S.usedPrompts.includes(b.dataset.pr)) S.usedPrompts.push(b.dataset.pr); MethodKit.save(); renderPrompts(); const i = $('tc-opt-in'); if (i) { i.placeholder = b.dataset.pr; i.focus(); } }));
    }
    function renderOptions() {
        $('tc-options').innerHTML = `
            ${S.options.map((o, i) => `<div class="tc-opt ${o.pick ? 'pick' : ''}"><div class="tc-opt-h"><span class="num">${i + 1}</span><input class="mk-input grow" data-ot="${o.id}" value="${esc(o.text)}"><button class="mk-iconbtn" data-or="${o.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>
                <div class="tc-opt-r"><label>Wirkung<div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${n(o.impact, 5)}" data-oi="${o.id}"><span class="mk-range-val">${n(o.impact, 5)}</span></div></label><label>Aufwand<div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${n(o.effort, 5)}" data-oe="${o.id}"><span class="mk-range-val">${n(o.effort, 5)}</span></div></label></div></div>`).join('')}
            <div class="tc-add" style="margin-top:8px"><input class="mk-input" id="tc-opt-in" placeholder="A possibility …" maxlength="160"><button class="mk-btn mk-btn-primary" id="tc-opt-add" aria-label="Add option"><i class="fas fa-plus"></i></button></div>
            ${S.options.length < 5 ? `<div class="mk-faint" style="margin-top:8px">${S.options.length}/5 – noch ${5 - S.options.length} bis zur Mindestmenge.</div>` : '<div class="mk-note ok" style="margin-top:8px"><i class="fas fa-check-circle"></i><span>Five or more options – now the rating is worthwhile.</span></div>'}`;
        const add = () => { const v = $('tc-opt-in').value.trim(); if (!v) return; S.options.push({ id: MethodKit.uid(), text: v, impact: 5, effort: 5, pick: false }); MethodKit.save(); renderOptions(); renderMatrix(); $('tc-opt-in').focus(); };
        $('tc-opt-add').addEventListener('click', add); $('tc-opt-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
        $('tc-options').querySelectorAll('[data-ot]').forEach(el => el.addEventListener('input', () => { const o = S.options.find(x => x.id === el.dataset.ot); if (o) { o.text = el.value; MethodKit.save(); renderMatrix(); } }));
        $('tc-options').querySelectorAll('[data-oi],[data-oe]').forEach(el => el.addEventListener('input', () => { const o = S.options.find(x => x.id === (el.dataset.oi || el.dataset.oe)); if (o) { o[el.dataset.oi ? 'impact' : 'effort'] = n(el.value, 5); el.nextElementSibling.textContent = el.value; MethodKit.save(); renderMatrix(); } }));
        $('tc-options').querySelectorAll('[data-or]').forEach(b => b.addEventListener('click', () => { S.options = S.options.filter(x => x.id !== b.dataset.or); MethodKit.save(); renderOptions(); renderMatrix(); }));
    }
    function renderMatrix() {
        const O = S.options.filter(o => o.text.trim());
        if (!O.length) { $('tc-matrix').innerHTML = '<div class="mk-empty">Your options land here: top left = high impact, low effort.</div>'; return; }
        const W = 420, H = 300, P = 36; const x = (v) => P + ((v - 1) / 9) * (W - 2 * P), y = (v) => H - P - ((v - 1) / 9) * (H - 2 * P);
        const quick = O.filter(o => n(o.impact, 5) >= 6 && n(o.effort, 5) <= 5);
        $('tc-matrix').innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="tc-mx" role="img">
            <rect x="${P}" y="${P}" width="${x(5.5) - P}" height="${y(5.5) - P}" class="q quick"/>
            <line x1="${P}" x2="${W - P}" y1="${y(5.5)}" y2="${y(5.5)}" class="ax"/><line x1="${x(5.5)}" x2="${x(5.5)}" y1="${P}" y2="${H - P}" class="ax"/>
            <text x="${x(3.2)}" y="${P + 14}" class="ql">Quick wins</text><text x="${x(7.8)}" y="${P + 14}" class="ql">Big projects</text><text x="${x(3.2)}" y="${H - P - 6}" class="ql">On the side</text><text x="${x(7.8)}" y="${H - P - 6}" class="ql">Rather drop</text>
            <text x="${W / 2}" y="${H - 8}" class="axl">Effort →</text><text x="12" y="${H / 2}" class="axl" transform="rotate(-90 12 ${H / 2})">Impact →</text>
            ${O.map(o => `<g class="pt ${o.pick ? 'pick' : ''}" data-mp="${o.id}"><circle cx="${x(n(o.effort, 5))}" cy="${y(n(o.impact, 5))}" r="13"/><text x="${x(n(o.effort, 5))}" y="${y(n(o.impact, 5)) + 4}">${S.options.indexOf(o) + 1}</text><title>${esc(o.text)}</title></g>`).join('')}
        </svg>
        <div class="mk-faint" style="text-align:center">Click a point to earmark the option for Will.</div>
        ${quick.length ? `<div class="mk-note ok"><i class="fas fa-bolt"></i><span>Quick Win${quick.length > 1 ? 's' : ''}: ${quick.map(o => `<strong>${esc(o.text)}</strong>`).join(', ')}</span></div>` : ''}`;
        $('tc-matrix').querySelectorAll('[data-mp]').forEach(g => g.addEventListener('click', () => { const o = S.options.find(x => x.id === g.dataset.mp); if (o) { o.pick = !o.pick; MethodKit.save(); renderOptions(); renderMatrix(); } }));
    }

    /* ---------- W ---------- */
    function renderWill() {
        const picks = S.options.filter(o => o.pick && o.text);
        const W = S.will;
        $('tc-will').innerHTML = `
            ${picks.length ? `<div class="mk-section-label">Earmarked from Options</div><div class="mk-chips" style="margin-bottom:12px">${picks.map(o => `<button class="mk-chip ${W.choice === o.text ? 'selected' : ''}" data-wc="${esc(o.text)}">${esc(o.text)}</button>`).join('')}</div>` : ''}
            <div class="mk-field"><label for="tc-choice">What do you decide on?</label><input class="mk-input" id="tc-choice" value="${esc(W.choice || '')}" placeholder="One option – or a combination"></div>
            <div class="mk-grid-2">
                <div class="mk-field"><label for="tc-first">Your first step</label><input class="mk-input" id="tc-first" value="${esc(W.first || '')}" placeholder="Small enough for the next 72 hours"></div>
                <div class="mk-field"><label for="tc-when">When exactly?</label><input class="mk-input" type="datetime-local" id="tc-when" value="${esc(W.when || '')}"></div>
            </div>
            <div class="mk-field"><label for="tc-support">Who supports you – and whom do you tell?</label><input class="mk-input" id="tc-support" value="${esc(W.support || '')}" placeholder="Telling someone about it doubles the chance."></div>
            ${/\b(könnte|sollte|versuche|vielleicht|eigentlich)\b/i.test(W.first + ' ' + W.choice) ? '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>“Could / should / try" – that is not yet a will. Phrase it: “I will …"</span></div>' : ''}`;
        $('tc-will').querySelectorAll('[data-wc]').forEach(b => b.addEventListener('click', () => { W.choice = b.dataset.wc; MethodKit.save(); renderWill(); }));
        [['tc-choice', 'choice'], ['tc-first', 'first'], ['tc-when', 'when'], ['tc-support', 'support']].forEach(([id, k]) => { $(id).addEventListener('input', e => { W[k] = e.target.value; MethodKit.save(); }); $(id).addEventListener('change', () => { renderWill(); renderCommit(); }); });
    }
    function renderCommit() {
        const c = n(S.commitment, 7);
        $('tc-commit').innerHTML = `
            <div class="mk-field"><label>How certain is it that you will take the first step? (1–10)</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${c}" id="tc-commitr"><span class="mk-range-val">${c}</span></div></div>
            ${c < 8 ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Below 8 in practice means: it probably won’t happen. <strong>What would have to be different for you to land at 8 or higher?</strong> Usually: the step smaller, the time more concrete.</span></div><div class="mk-field"><textarea class="mk-textarea" id="tc-toeight" placeholder="To make it an 8, …">${esc(S.toEight || '')}</textarea></div>` : '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>High commitment. Now the if-then plans, then everything is in place.</span></div>'}`;
        $('tc-commitr').addEventListener('input', e => { S.commitment = n(e.target.value, 7); MethodKit.save(); renderCommit(); });
        const t = $('tc-toeight'); if (t) t.addEventListener('input', e => { S.toEight = e.target.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }
    function renderIfThen() {
        const O = S.obs.filter(o => o.text.trim());
        if (!O.length) { $('tc-ifthen').innerHTML = '<div class="mk-empty">No obstacles entered in Reality – then you don’t need anything here.</div>'; return; }
        $('tc-ifthen').innerHTML = O.map(o => `<div class="tc-ift"><div class="if"><span class="mk-badge">If</span> ${OBS_TYPES[o.type]?.ic || ''} ${esc(o.text)}</div><div class="then"><span class="mk-badge">then</span><input class="mk-input" data-it="${o.id}" value="${esc(S.ifthen[o.id] || '')}" placeholder="… I will …"></div></div>`).join('');
        $('tc-ifthen').querySelectorAll('[data-it]').forEach(el => el.addEventListener('input', () => { S.ifthen[el.dataset.it] = el.value; MethodKit.save(); }));
    }

    /* ---------- Check-in ---------- */
    function renderCheckin() {
        const log = S.log; const cur = n(S.now, 3); const last = log[log.length - 1]; const can = !last || last.date !== todayKey();
        let chart = '';
        if (log.length >= 2) { const W = 520, H = 140, P = 24; const xs = i => P + (i / (log.length - 1)) * (W - 2 * P), ys = v => H - P - (v / 10) * (H - 2 * P); chart = `<svg viewBox="0 0 ${W} ${H}" class="tc-chart">${[0, 5, 10].map(v => `<line x1="${P}" x2="${W - P}" y1="${ys(v)}" y2="${ys(v)}" class="grid"/><text x="${P - 6}" y="${ys(v) + 4}" class="ax">${v}</text>`).join('')}<line x1="${P}" x2="${W - P}" y1="${ys(n(S.enough, 8))}" y2="${ys(n(S.enough, 8))}" class="enough"/><polyline points="${log.map((e, i) => `${xs(i)},${ys(e.v)}`).join(' ')}" class="line"/>${log.map((e, i) => `<circle cx="${xs(i)}" cy="${ys(e.v)}" r="4" class="pt"><title>${fmt(e.date)} · ${e.v}</title></circle>`).join('')}</svg>`; }
        $('tc-checkin').innerHTML = `
            ${chart || `<div class="mk-empty">${log.length ? 'From the second entry you will see the trend.' : 'No check-in yet.'}</div>`}
            <div class="tc-log-row"><span>Today on the goal scale:</span><div class="mk-range-wrap" style="flex:1"><input type="range" class="mk-range" min="0" max="10" id="tc-logv" value="${cur}"><span class="mk-range-val" id="tc-logval">${cur}</span></div><button class="mk-btn mk-btn-primary mk-btn-sm" id="tc-logsave" ${can ? '' : 'disabled title="Already entered today"'}><i class="fas fa-plus"></i> Enter</button></div>
            <div class="mk-field" style="margin-top:12px"><label for="tc-moved">What has moved since last time – and what did you learn from it?</label><textarea class="mk-textarea" id="tc-moved" placeholder="…">${esc(S.moved || '')}</textarea></div>
            ${S.will.first ? `<label class="tc-done"><input type="checkbox" id="tc-firstdone" ${S.firstDone ? 'checked' : ''}> Ersten Schritt „${esc(S.will.first)}" erledigt</label>` : ''}
            ${log.length ? `<div class="mk-chips" style="margin-top:10px">${log.slice().reverse().slice(0, 6).map(e => `<span class="mk-chip">${fmt(e.date)} · <b>${e.v}</b></span>`).join('')}</div>` : ''}`;
        $('tc-logv').addEventListener('input', e => { $('tc-logval').textContent = e.target.value; });
        $('tc-logsave').addEventListener('click', () => { const v = n($('tc-logv').value, cur); const prev = last ? last.v : null; S.log.push({ date: todayKey(), v }); S.now = v; MethodKit.save({ now: true }); MethodKit.toast(prev != null && v > prev ? `+${v - prev} since ${fmt(last.date)} 🎉` : 'Entered', 'success'); renderCheckin(); renderSummary(); });
        $('tc-moved').addEventListener('input', e => { S.moved = e.target.value; MethodKit.save(); });
        const fd = $('tc-firstdone'); if (fd) fd.addEventListener('change', () => { S.firstDone = fd.checked; MethodKit.save(); if (fd.checked) MethodKit.toast('First step done – that is the hardest one.', 'success'); });
        MethodKit._autosizeAll();
    }
    function renderSummary() {
        const W = S.will;
        $('tc-summary').innerHTML = `<div class="tc-sum">
            <div class="g"><b>G</b><span>${esc(S.goal) || '–'}${S.until ? '<br><small>bis ' + fmt(S.until) + '</small>' : ''}</span></div>
            <div class="r"><b>R</b><span>Heute ${n(S.now, 3)}/10 · good enough ${n(S.enough, 8)}${S.obs.filter(o => o.text).length ? '<br><small>' + S.obs.filter(o => o.text).length + ' Hindernisse' : ''}</small></span></div>
            <div class="o"><b>O</b><span>${S.options.filter(o => o.text).length} Optionen${S.options.filter(o => o.pick).length ? ', ' + S.options.filter(o => o.pick).length + ' vorgemerkt' : ''}</span></div>
            <div class="w"><b>W</b><span>${esc(W.choice) || '–'}${W.first ? '<br><small>First step: ' + esc(W.first) + (W.when ? ' · ' + new Date(W.when).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '') + '</small>' : ''}<br><small>Commitment ${n(S.commitment, 7)}/10</small></span></div>
        </div>`;
    }
    function renderLinks() { $('tc-links').innerHTML = LINKS.map(l => `<a class="mk-option tc-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }
    function exportAll() {
        const W = S.will;
        const L = ['GROW · GOAL COACHING', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'G · GOAL', S.goal || '–', S.until ? 'By: ' + S.until : '', S.measure ? 'Measurable: ' + S.measure : '', S.why ? 'Why: ' + S.why : '', S.ten ? '10 = ' + S.ten : '', `Good enough: ${n(S.enough, 8)}`, ''];
        L.push('R · REALITY', `Today: ${n(S.now, 3)}/10`, S.already ? 'Already achieved: ' + S.already : '', S.reality || '', S.nottried ? 'Not yet tried: ' + S.nottried : ''); S.obs.forEach(o => { if (o.text) L.push(`- Obstacle [${OBS_TYPES[o.type]?.l || '?'}]: ${o.text}`); }); if (S.res.length) L.push('Resources: ' + S.res.join(', ')); if (S.resnote) L.push(S.resnote); L.push('');
        L.push('O · OPTIONS'); S.options.forEach((o, i) => { if (o.text) L.push(`${i + 1}. ${o.text} (Impact ${n(o.impact, 5)} / Effort ${n(o.effort, 5)})${o.pick ? ' ★' : ''}`); }); L.push('');
        L.push('W · WILL', 'Decision: ' + (W.choice || '–'), 'First step: ' + (W.first || '–') + (W.when ? ' · ' + W.when : ''), W.support ? 'Support: ' + W.support : '', `Commitment: ${n(S.commitment, 7)}/10`, S.toEight ? 'For an 8: ' + S.toEight : ''); S.obs.forEach(o => { if (S.ifthen[o.id]) L.push(`If ${o.text} → then ${S.ifthen[o.id]}`); });
        if (S.log.length) L.push('', 'CHECK-INS', ...S.log.map(e => `${e.date}: ${e.v}/10`)); if (S.moved) L.push('Moved: ' + S.moved);
        MethodKit.exportText('grow-plan.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'target-coaching', accent: '#6366f1', accent2: '#22c55e',
            steps: [{ icon: '🎯', label: 'Goal' }, { icon: '📍', label: 'Reality' }, { icon: '💡', label: 'Options' }, { icon: '✅', label: 'Will' }, { icon: '📈', label: 'Check-in' }],
            defaultState: { goal: '', until: '', measure: '', why: '', ten: '', enough: 8, now: 3, already: '', reality: '', nottried: '', obs: [], res: [], resnote: '', usedPrompts: [], options: [], will: {}, commitment: 7, toEight: '', ifthen: {}, log: [], moved: '', firstDone: false }
        });
        S = MethodKit.state;
        ['will', 'ifthen'].forEach(k => { if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {}; });
        ['obs', 'res', 'usedPrompts', 'options', 'log'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        S.options = S.options.map(o => typeof o === 'string' ? { id: MethodKit.uid(), text: o, impact: 5, effort: 5, pick: false } : o);
        // Migration
        if (typeof S.obstacles === 'string') { if (S.obstacles.trim() && !S.obs.length) S.obs.push({ id: MethodKit.uid(), text: S.obstacles.trim().slice(0, 140), type: '' }); delete S.obstacles; }
        if (typeof S.choice === 'string') { if (S.choice.trim() && !S.will.choice) S.will.choice = S.choice; delete S.choice; }
        if (typeof S.firststep === 'string') { if (S.firststep.trim() && !S.will.first) S.will.first = S.firststep; delete S.firststep; }

        MethodKit.bindFields();
        $('tc-goal').addEventListener('input', renderGoalCheck); $('tc-measure').addEventListener('input', renderGoalCheck);
        renderGoalCheck(); renderScaleDef();
        MethodKit.onStep = function (k) {
            if (k === 1) renderScaleDef();
            if (k === 2) { renderNow(); renderObstacles(); renderRes(); }
            if (k === 3) { renderPrompts(); renderOptions(); renderMatrix(); }
            if (k === 4) { renderWill(); renderCommit(); renderIfThen(); }
            if (k === 5) { renderCheckin(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
        $('tc-export').addEventListener('click', exportAll);
    })();
})();
