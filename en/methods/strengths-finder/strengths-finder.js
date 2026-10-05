/* Finding strengths · Logik (nach dem Realise2-Modell: Energy × performance × Nutzung) */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    // Stärke → Schattenseite bei Überdosis
    const POOL = {
        'Analytical': 'Analysis paralysis: check too long, decide too late', 'Creative': 'Too many ideas, too little follow-through – others lose the thread', 'Empathetic': 'Boundaries blur, your own needs get left behind', 'Organized': 'Rigidity – plans become more important than the goal', 'Communicative': 'Too much talking, too little listening', 'Assertive': 'Steamrolling – others pull back instead of coming along', 'Patient': 'Sitting on things that need a decision', 'Strategic': 'Up in the clouds – the here and now gets shortchanged', 'Detail-oriented': 'Perfectionism, micromanagement, missed deadlines', 'Enthusiastic': 'Overpromising – expectations that don’t get kept', 'Reliable': 'Doing everything yourself, not delegating, burning out', 'Courageous': 'Recklessness – risks that others have to pay for', 'Disciplined': 'Rigidity, hardness toward yourself and others', 'Curious': 'Scattering – starting too much, finishing too little', 'Solution-focused': 'Solving too fast, before the problem is understood', 'Collaborative': 'Avoiding conflict, holding back your own view', 'Independent': 'Lone wolf – neither asking for nor accepting help', 'Resilient': 'Ignoring limits until the body sets them', 'Visionary': 'Castles in the air with no ground contact', 'Pragmatic': 'Thinking short-term, sacrificing quality', 'Diplomatic': 'Unclarity – nobody knows where you stand', 'Eager to learn': 'Eternal student – learning instead of applying', 'Responsible': 'Everything on your own shoulders, guilt', 'Flexible': 'Anything-goes – no clear course', 'Focused': 'Tunnel vision – missing what matters at the edges', 'Inspiring': 'Show instead of substance', 'Humorous': 'Not taking serious things seriously, jokes as evasion', 'Decisive': 'Too hasty – not including others', 'Helpful': 'Can’t say no, getting used', 'Persistent': 'Stubbornness – clinging to dead things'
    };
    const LINKS = [
        { m: 'VIA character strengths', l: '../via-strengths/via-strengths.html', why: 'The 24 scientifically grounded character strengths.' },
        { m: 'Gallup domains', l: '../gallup-strengths/gallup-strengths.html', why: 'Through which domain do you have impact?' },
        { m: 'Johari window', l: '../johari-window/johari-window.html', why: 'Which strengths do others see that you don’t?' },
        { m: 'Moment of Excellence', l: '../moment-excellence/moment-excellence.html', why: 'Anchor a strength in the body.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const R = (v) => S.ratings[v] || {};
    const rated = (v) => R(v).e && R(v).p && R(v).u;
    const Q = { strength: { t: 'Real strength', d: 'gives energy & good at it & used often', c: '#10b981', ic: '⭐' }, unrealized: { t: 'Unused strength', d: 'gives energy & good at it – but rarely used', c: '#0ea5e9', ic: '💎' }, learned: { t: 'Learned behavior', d: 'good at it – but costs energy', c: '#f59e0b', ic: '🔋' }, potential: { t: 'Potential', d: 'gives energy – but not yet good at it', c: '#8b5cf6', ic: '🌱' }, weakness: { t: 'Weakness', d: 'neither energy nor performance', c: '#94a3b8', ic: '·' } };
    const quad = (v) => { const r = R(v); if (!rated(v)) return null; const e = r.e >= 4, p = r.p >= 4, u = r.u >= 3; if (e && p) return u ? 'strength' : 'unrealized'; if (!e && p) return 'learned'; if (e && !p) return 'potential'; return 'weakness'; };
    const byQuad = (q) => S.selected.filter(v => quad(v) === q);

    /* ---------- 1 ---------- */
    function renderPool() {
        const all = [...Object.keys(POOL), ...S.custom];
        $('sf-pool').innerHTML = `<div class="mk-chips">${all.map(v => `<button class="mk-chip ${S.selected.includes(v) ? 'selected' : ''}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div><div class="sf-count ${S.selected.length >= 8 && S.selected.length <= 15 ? 'ok' : S.selected.length > 15 ? 'over' : ''}">${S.selected.length} chosen</div>` +
            (S.selected.length > 15 ? note('info', 'A lot. That’s okay – but step 2 will be long. Cut what doesn’t make you nod when you read it.') : S.selected.length >= 8 ? note('ok', 'Good selection. On to rating.') : S.selected.length ? note('info', `Still ${8 - S.selected.length} more – be generous, you’ll sort later.`) : '');
        $('sf-pool').querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.v; if (S.selected.includes(v)) { S.selected = S.selected.filter(x => x !== v); S.top = S.top.filter(x => x !== v); } else S.selected.push(v); MethodKit.save(); renderPool(); }));
    }

    /* ---------- 2 ---------- */
    function renderRate() {
        if (!S.selected.length) { $('sf-rate').innerHTML = note('info', 'Pick strengths in step 1 first.'); return; }
        const dots = (v, k, label) => `<div class="sf-dim"><span>${label}</span><div class="sf-dots">${[1, 2, 3, 4, 5].map(x => `<button class="${n(R(v)[k], 0) >= x ? 'on' : ''} ${k}" data-rv="${esc(v)}" data-k="${k}" data-x="${x}" aria-label="${label} ${x}">●</button>`).join('')}</div></div>`;
        const done = S.selected.filter(rated).length;
        $('sf-rate').innerHTML = S.selected.map(v => { const q = quad(v); return `<div class="sf-rate ${q ? 'q-' + q : ''}"><div class="sf-rate-h"><b>${esc(v)}</b>${q ? `<span class="sf-qtag" style="--c:${Q[q].c}">${Q[q].ic} ${Q[q].t}</span>` : ''}</div><div class="sf-dims">${dots(v, 'e', '⚡ Energie')}${dots(v, 'p', '🎯 Leistung')}${dots(v, 'u', '🔁 Nutzung')}</div></div>`; }).join('') +
            (done === S.selected.length ? (() => { const st = byQuad('strength').length, un = byQuad('unrealized').length, le = byQuad('learned').length; return note('ok', `All rated: ${st} real strength${st !== 1 ? 'n' : ''}, ${un} ungenutzt, ${le} erlernt. ${le > st ? '<strong>More learned behaviors than real strengths</strong> – das erklärt, warum du gut bist und trotzdem müde. Schritt 3 zeigt den Ausweg.' : un ? `${un} ungenutzte Stärke${un > 1 ? 'n' : ''} – das ist dein grösster Hebel: Du kannst es schon, es gibt dir Energie, du tust es nur zu selten.` : 'On to the map.'}`); })() : `<div class="mk-faint" style="text-align:center">${done}/${S.selected.length} fully rated</div>`);
        $('sf-rate').querySelectorAll('[data-rv]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.rv; S.ratings[v] = S.ratings[v] || {}; S.ratings[v][b.dataset.k] = +b.dataset.x; MethodKit.save(); renderRate(); }));
    }

    /* ---------- 3 ---------- */
    function renderMap() {
        const r = S.selected.filter(rated);
        if (r.length < 3) { $('sf-map').innerHTML = note('info', 'Rate at least three strengths in step 2.'); return; }
        const cell = (q, title) => `<div class="sf-cell" style="--c:${Q[q].c}"><b>${Q[q].ic} ${Q[q].t}</b><small>${Q[q].d}</small><div>${byQuad(q).map(v => `<span class="sf-tag ${S.top.includes(v) ? 'top' : ''}" ${q === 'unrealized' || q === 'strength' ? `style="--c:${Q[q].c}"` : ''}>${esc(v)}${q === 'unrealized' || q === 'strength' ? ` <em>${R(v).e}·${R(v).p}·${R(v).u}</em>` : ''}</span>`).join('') || '<span class="mk-faint">–</span>'}</div></div>`;
        $('sf-map').innerHTML = `<div class="sf-axes"><span></span><span>Performance low</span><span>Performance high</span></div><div class="sf-mapgrid"><span class="sf-axis-y">Energy high</span>${cell('potential')}<div class="sf-cell-pair">${cell('unrealized')}${cell('strength')}</div><span class="sf-axis-y">Energy low</span>${cell('weakness')}${cell('learned')}</div>` +
            (byQuad('learned').length ? note('warn', `<strong>${byQuad('learned').join(', ')}</strong>: You’re good at this – and it drains you. These are exactly the things people keep handing you because you do them well. Learn to limit them or hand them off.`) : '') +
            (byQuad('unrealized').length ? note('ok', `<strong>${byQuad('unrealized').join(', ')}</strong>: Here’s gold. Energy and skill are there – only the opportunity is missing. What would need to change so you do this more often?`) : '') +
            (byQuad('potential').length ? note('info', `<strong>${byQuad('potential').join(', ')}</strong>: Gives you energy, but you’re not good at it yet. If you want to learn something – learn this. Practice pays off here because motivation comes on its own.`) : '');
    }
    function renderTop() {
        const cands = [...byQuad('strength'), ...byQuad('unrealized')];
        if (!cands.length) { $('sf-top').innerHTML = note('info', 'No real or unused strengths yet. Keep rating – or be more generous on the energy question.'); return; }
        S.top = S.top.filter(v => cands.includes(v));
        $('sf-top').innerHTML = `<div class="mk-chips">${cands.map(v => `<button class="mk-chip ${S.top.includes(v) ? 'selected' : ''}" data-t="${esc(v)}">${S.top.includes(v) ? '⭐ ' : ''}${esc(v)}${quad(v) === 'unrealized' ? ' 💎' : ''}</button>`).join('')}</div><div class="sf-count ${S.top.length === 5 ? 'ok' : ''}">${S.top.length}/5</div>` +
            (S.top.length === 5 ? (byQuad('unrealized').some(v => S.top.includes(v)) ? note('ok', 'Top 5 complete – including at least one unused strength. That one will make the biggest difference in step 4.') : byQuad('unrealized').length ? note('info', 'Top 5 complete, but only from the proven ones. Put an unused strength (💎) in – that’s where the growth is.') : note('ok', 'Top 5 complete.')) : S.top.length > 5 ? note('warn', 'More than five – that waters down the focus.') : '');
        $('sf-top').querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.t; if (S.top.includes(v)) S.top = S.top.filter(x => x !== v); else if (S.top.length >= 5) { MethodKit.toast('Maximum 5 – unselect one first', 'warn'); return; } else S.top.push(v); MethodKit.save(); renderTop(); renderMap(); }));
    }

    /* ---------- 4 ---------- */
    function renderUse() {
        if (!S.top.length) { $('sf-use').innerHTML = note('info', 'Pick your top 5 in step 3 first.'); return; }
        $('sf-use').innerHTML = S.top.map(v => { const u = S.use[v] || {}; const q = quad(v); return `<div class="sf-usebox" style="--c:${Q[q].c}"><div class="sf-usebox-h"><b>⭐ ${esc(v)}</b><span class="sf-qtag" style="--c:${Q[q].c}">${Q[q].ic} ${Q[q].t}</span></div><div class="mk-field"><label>Where will I use this (more)? ${q === 'unrealized' ? '<span class="mk-faint">– du nutzt es bisher selten: Welche Gelegenheit schaffst du dir?</span>' : ''}</label><input class="mk-input" data-uw="${esc(v)}" value="${esc(u.where || '')}" placeholder="Concrete situation, project, role"></div><div class="sf-shadow"><b>Overuse risk</b>${POOL[v] ? esc(POOL[v]) : '<em>Eigene Stärke – was passiert, wenn du davon zu viel hast?</em>'}<div class="sf-shadow-q">Do you recognize this in yourself?<div class="sf-yn"><button class="${u.over === 'yes' ? 'on' : ''}" data-ov="${esc(v)}" data-x="yes">Yes, sometimes</button><button class="${u.over === 'no' ? 'on' : ''}" data-ov="${esc(v)}" data-x="no">Not really</button></div></div>${u.over === 'yes' ? `<input class="mk-input" data-ug="${esc(v)}" value="${esc(u.guard || '')}" placeholder="My counterweight: How do I notice the overuse, and what do I do then?">` : ''}</div></div>`; }).join('') +
            (() => { const overs = S.top.filter(v => (S.use[v] || {}).over === 'yes'); return overs.length >= 3 ? note('info', `At ${overs.length} of ${S.top.length} strengths you notice the overuse. That’s typical: strengths you use a lot are the ones that tip first. One counterweight per strength is enough.`) : ''; })();
        const host = $('sf-use');
        host.querySelectorAll('[data-uw]').forEach(i => i.addEventListener('input', () => { (S.use[i.dataset.uw] = S.use[i.dataset.uw] || {}).where = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-ug]').forEach(i => i.addEventListener('input', () => { (S.use[i.dataset.ug] = S.use[i.dataset.ug] || {}).guard = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-ov]').forEach(b => b.addEventListener('click', () => { (S.use[b.dataset.ov] = S.use[b.dataset.ov] || {}).over = b.dataset.x; MethodKit.save(); renderUse(); }));
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        $('sf-summary').innerHTML = S.top.length ? `<div class="mk-result"><h4>Your top 5</h4><div class="sf-sum">${S.top.map((v, i) => { const u = S.use[v] || {}; const q = quad(v); return `<div style="border-left:3px solid ${Q[q].c}"><b>${i + 1}. ${esc(v)} <small>${Q[q].ic} ${Q[q].t}</small></b>${u.where ? `<div>→ ${esc(u.where)}</div>` : '<div class="mk-faint">no place to use it yet</div>'}${u.over === 'yes' && u.guard ? `<div class="mk-faint">⚠ ${esc(u.guard)}</div>` : ''}</div>`; }).join('')}</div>${byQuad('learned').length ? `<div style="margin-top:10px"><b>🔋 Begrenzen oder abgeben:</b> ${byQuad('learned').map(esc).join(', ')}</div>` : ''}${byQuad('potential').length ? `<div style="margin-top:4px"><b>🌱 Lernen lohnt sich:</b> ${byQuad('potential').map(esc).join(', ')}</div>` : ''}${S.week ? `<div style="margin-top:10px"><b>This week:</b> ${esc(S.week)}</div>` : ''}${S.stop ? `<div><b>Lasse ich:</b> ${esc(S.stop)}</div>` : ''}</div>` : '<div class="mk-empty">The summary fills up from the previous steps.</div>';
    }
    function renderLinks() { $('sf-links').innerHTML = LINKS.map(x => `<a class="mk-option sf-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['MY STRENGTHS', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), ''];
        ['q1', 'q2', 'q3', 'q4'].forEach((k, i) => { if (S[k]) L.push(['Lost in time: ', 'Compliments: ', 'As a child: ', 'Proudest win: '][i] + S[k]); });
        L.push('', 'MAP (energy · performance · use)');
        Object.keys(Q).forEach(q => { const l = byQuad(q); if (l.length) L.push(`${Q[q].ic} ${Q[q].t}: ${l.map(v => `${v} (${R(v).e}·${R(v).p}·${R(v).u})`).join(', ')}`); });
        L.push('', 'TOP 5'); S.top.forEach((v, i) => { const u = S.use[v] || {}; L.push(`${i + 1}. ${v}${u.where ? ' → ' + u.where : ''}${u.over === 'yes' ? `  [Überdosis: ${POOL[v] || '–'}${u.guard ? ' | Counterweight: ' + u.guard : ''}]` : ''}`); });
        if (S.week) L.push('', 'This week: ' + S.week); if (S.stop) L.push('I’ll drop: ' + S.stop);
        MethodKit.exportText('meine-staerken.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'strengths-finder', accent: '#6366f1', accent2: '#a855f7',
            steps: [{ icon: '🔎', label: 'Collect' }, { icon: '⚖️', label: 'Rate' }, { icon: '🗺️', label: 'Map' }, { icon: '🚀', label: 'Putting it to use' }, { icon: '📝', label: 'Plan' }],
            defaultState: { q1: '', q2: '', q3: '', q4: '', custom: [], selected: [], ratings: {}, top: [], use: {}, week: '', stop: '' }
        });
        S = MethodKit.state;
        ['custom', 'selected', 'top'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        ['ratings', 'use'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        // Migration: alter pool (Array) → custom; altes use (String) → {where}
        if (Array.isArray(S.pool)) { S.pool.forEach(v => { if (!POOL[v] && !S.custom.includes(v)) S.custom.push(v); }); delete S.pool; }
        Object.keys(S.use).forEach(v => { if (typeof S.use[v] === 'string') S.use[v] = { where: S.use[v] }; });
        MethodKit.bindFields();
        $('sf-export').addEventListener('click', exportAll);
        const add = () => { const i = $('sf-custom'); const v = i.value.trim(); if (!v) return; if (POOL[v] || S.custom.includes(v)) { MethodKit.toast('Already exists', 'warn'); return; } S.custom.push(v); S.selected.push(v); i.value = ''; MethodKit.save(); renderPool(); };
        $('sf-add').addEventListener('click', add); $('sf-custom').addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
        ['sf-week', 'sf-stop'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 1) renderPool();
            if (k === 2) renderRate();
            if (k === 3) { renderMap(); renderTop(); }
            if (k === 4) renderUse();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
