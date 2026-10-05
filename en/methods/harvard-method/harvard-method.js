/* Harvard-Methode · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const EMO = ['Anger', 'Fear', 'Disappointment', 'Pressure', 'Distrust', 'Pride', 'Shame', 'Impatience', 'Powerlessness', 'Hope'];
    const INT_TYPES = ['Security', 'Recognition', 'Autonomy', 'Fairness', 'Time', 'Money', 'Peace', 'Belonging', 'Control', 'Growth'];
    const CRIT_SEEDS = ['Market price / salary', 'Previous practice', 'Law / contract', 'Industry standard', 'Equal treatment', 'Effort in hours', 'Expert opinion', 'What a neutral person would find fair'];
    const LINKS = [
        { m: 'AEK communication', l: '../aek-communication/aek-communication.html', why: 'Phrase the opening clearly and respectfully.' },
        { m: 'Conflict escalation (Glasl)', l: '../conflict-escalation/conflict-escalation.html', why: 'Assess how far the conflict has already gone.' },
        { m: 'Nonviolent communication', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Express interests as needs.' },
        { m: 'Systemic coaching', l: '../systemic-coaching/systemic-coaching.html', why: 'When more than two parties are involved.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const who = () => S.who || 'the other party';

    /* ---------- 1 ---------- */
    function renderStakes() {
        const o = n(S.outcomeImp, 5), r = n(S.relImp, 5);
        let hint = '';
        if (o >= 7 && r >= 7) hint = 'Both the issue and the relationship matter to you – the classic Harvard situation. Invest in interests and options.';
        else if (o >= 7 && r <= 4) hint = 'The issue counts, the relationship less. Your BATNA (step 5) is your most important lever.';
        else if (o <= 4 && r >= 7) hint = 'The relationship matters more than the outcome. Ask yourself whether you can be generous – and say so openly.';
        else if (o <= 4 && r <= 4) hint = 'Neither the issue nor the relationship weighs heavily. Is the negotiation worth it at all?';
        $('hm-stakes').innerHTML = `
            <div class="mk-grid-2">
                <div class="mk-field"><label>How important is the <strong>outcome</strong>?</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${o}" data-st="outcomeImp"><span class="mk-range-val">${o}</span></div></div>
                <div class="mk-field"><label>How important is the <strong>Relationship</strong> to ${esc(who())}?</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${r}" data-st="relImp"><span class="mk-range-val">${r}</span></div></div>
            </div>
            ${hint ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>${hint}</span></div>` : ''}`;
        $('hm-stakes').querySelectorAll('[data-st]').forEach(el => el.addEventListener('input', () => { S[el.dataset.st] = n(el.value, 5); MethodKit.save(); renderStakes(); }));
    }

    /* ---------- 2 ---------- */
    function renderEmotions() {
        const row = (k, l) => `<div class="mk-section-label">${l}</div><div class="mk-chips">${EMO.map(e => `<button class="mk-chip ${(S.emo[k] || []).includes(e) ? 'selected' : ''}" data-ek="${k}" data-ev="${e}">${e}</button>`).join('')}</div>`;
        $('hm-emotions').innerHTML = row('mine', 'My feelings about the issue') + row('theirs', `Assumed feelings of ${esc(who())}`) +
            ((S.emo.mine || []).length ? `<div class="mk-note info" style="margin-top:10px"><i class="fas fa-info-circle"></i><span>Naming feelings instead of acting them out: “I notice that this makes me ${esc((S.emo.mine || [])[0].toLowerCase())} ” is legitimate and defuses.</span></div>` : '');
        $('hm-emotions').querySelectorAll('[data-ek]').forEach(b => b.addEventListener('click', () => { const a = S.emo[b.dataset.ek] || (S.emo[b.dataset.ek] = []); const i = a.indexOf(b.dataset.ev); i > -1 ? a.splice(i, 1) : a.push(b.dataset.ev); MethodKit.save(); renderEmotions(); }));
    }

    /* ---------- 3 ---------- */
    function renderSide(side) {
        const host = $(side === 'mine' ? 'hm-mine' : 'hm-theirs'); const d = S[side]; const other = side === 'theirs';
        host.innerHTML = `
            <div class="mk-field"><label>${other ? 'Ihre' : 'Meine'} Position – what ${other ? 'fordert ' + esc(who()) : 'fordere ich'}?</label><input class="mk-input" data-pos="${side}" value="${esc(d.position || '')}" placeholder="The concrete demand"></div>
            <div class="mk-section-label">Why? – ${other ? 'vermutete ' : ''}Interests behind it</div>
            ${d.interests.map(it => `<div class="hm-int"><input class="mk-input" data-it="${it.id}" data-side="${side}" value="${esc(it.text)}" placeholder="${other ? 'Vermutlich, weil …' : 'Weil ich …'}"><select class="mk-select" data-itt="${it.id}" data-side="${side}"><option value="">Art</option>${INT_TYPES.map(t => `<option ${it.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select><button class="hm-prio ${it.prio ? 'on' : ''}" data-itp="${it.id}" data-side="${side}" title="Core interest">★</button><button class="mk-iconbtn" data-itr="${it.id}" data-side="${side}" aria-label="Remove"><i class="fas fa-times"></i></button></div>`).join('')}
            <button class="mk-btn mk-btn-outline mk-btn-sm" data-ita="${side}"><i class="fas fa-plus"></i> Interest</button>
            ${!other && d.position && !d.interests.length ? '<div class="mk-note info" style="margin-top:8px"><i class="fas fa-lightbulb"></i><span>Ask yourself three times “Why do I want this?" – every answer is an interest.</span></div>' : ''}
            ${other && d.interests.length && !d.interests.some(i => i.text) ? '' : other && !d.interests.length ? `<div class="mk-note info" style="margin-top:8px"><i class="fas fa-lightbulb"></i><span>If you don’t know: what would you want in the place of ${esc(who())} – and what would you be afraid of?</span></div>` : ''}`;
        host.querySelector(`[data-pos]`).addEventListener('input', e => { d.position = e.target.value; MethodKit.save(); });
        host.querySelector('[data-ita]').addEventListener('click', () => { d.interests.push({ id: MethodKit.uid(), text: '', type: '', prio: false }); MethodKit.save(); renderSide(side); const inputs = host.querySelectorAll('[data-it]'); inputs[inputs.length - 1].focus(); });
        host.querySelectorAll('[data-it]').forEach(el => el.addEventListener('input', () => { const it = d.interests.find(x => x.id === el.dataset.it); if (it) { it.text = el.value; MethodKit.save(); renderMatch(); } }));
        host.querySelectorAll('[data-itt]').forEach(el => el.addEventListener('change', () => { const it = d.interests.find(x => x.id === el.dataset.itt); if (it) { it.type = el.value; MethodKit.save(); renderMatch(); } }));
        host.querySelectorAll('[data-itp]').forEach(b => b.addEventListener('click', () => { const it = d.interests.find(x => x.id === b.dataset.itp); if (it) { it.prio = !it.prio; MethodKit.save(); renderSide(side); renderMatch(); } }));
        host.querySelectorAll('[data-itr]').forEach(b => b.addEventListener('click', () => { d.interests = d.interests.filter(x => x.id !== b.dataset.itr); MethodKit.save(); renderSide(side); renderMatch(); }));
    }
    function renderMatch() {
        const mi = S.mine.interests.filter(i => i.text.trim()), ti = S.theirs.interests.filter(i => i.text.trim());
        if (!mi.length || !ti.length) { $('hm-match').innerHTML = '<div class="mk-empty">Once both sides have interests, you will see common ground and differences here.</div>'; return; }
        const myTypes = new Set(mi.map(i => i.type).filter(Boolean)), thTypes = new Set(ti.map(i => i.type).filter(Boolean));
        const shared = [...myTypes].filter(t => thTypes.has(t));
        const onlyMe = [...myTypes].filter(t => !thTypes.has(t)), onlyThem = [...thTypes].filter(t => !myTypes.has(t));
        $('hm-match').innerHTML = `
            <div class="hm-venn">
                <div class="hm-venn-c mine"><b>Only me</b>${onlyMe.length ? onlyMe.map(t => `<span>${t}</span>`).join('') : '<em>–</em>'}</div>
                <div class="hm-venn-c shared"><b>Shared</b>${shared.length ? shared.map(t => `<span>${t}</span>`).join('') : '<em>nothing yet</em>'}</div>
                <div class="hm-venn-c theirs"><b>Only ${esc(who())}</b>${onlyThem.length ? onlyThem.map(t => `<span>${t}</span>`).join('') : '<em>–</em>'}</div>
            </div>
            ${shared.length ? `<div class="mk-note ok"><i class="fas fa-handshake"></i><span>Gemeinsame Interessen (${shared.join(', ')}) are your opening: "We both care about ${shared[0]} – let’s see how we can make that work for both of us."</span></div>` : ''}
            ${onlyMe.length && onlyThem.length ? `<div class="mk-note info"><i class="fas fa-right-left"></i><span>Unterschiedliche Interessen (${onlyMe[0]} vs. ${onlyThem[0]}) are not a problem but trading material: what costs you little and ${esc(who())} brings a lot – and vice versa.</span></div>` : ''}
            ${!myTypes.size || !thTypes.size ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Assign a type to the interests – then the comparison becomes meaningful.</span></div>' : ''}`;
    }

    /* ---------- 4 ---------- */
    function renderOptions() {
        $('hm-options').innerHTML = `
            ${S.options.map((o, i) => `<div class="hm-opt"><div class="hm-opt-h"><span class="num">${i + 1}</span><input class="mk-input grow" data-ot="${o.id}" value="${esc(o.text)}" placeholder="A possible solution …"><button class="mk-iconbtn" data-or="${o.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>
                <div class="hm-opt-r"><label>Bedient <b>meine</b> Interessen<div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" value="${n(o.me, 5)}" data-om="${o.id}"><span class="mk-range-val">${n(o.me, 5)}</span></div></label><label>Bedient <b>ihre</b> Interessen<div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" value="${n(o.them, 5)}" data-oth="${o.id}"><span class="mk-range-val">${n(o.them, 5)}</span></div></label></div></div>`).join('')}
            <div class="hm-add"><input class="mk-input" id="hm-opt-in" placeholder="New option – wild ones welcome" maxlength="160"><button class="mk-btn mk-btn-primary" id="hm-opt-add" aria-label="Add option"><i class="fas fa-plus"></i></button></div>
            ${S.options.length < 3 ? '<div class="mk-note info" style="margin-top:10px"><i class="fas fa-lightbulb"></i><span>Goal: at least five options. Questions that help: What if we enlarge the pie? What costs me little and brings the other side a lot? What would a third party suggest?</span></div>' : ''}`;
        const add = () => { const v = $('hm-opt-in').value.trim(); if (!v) return; S.options.push({ id: MethodKit.uid(), text: v, me: 5, them: 5 }); MethodKit.save(); renderOptions(); renderMatrix(); $('hm-opt-in').focus(); };
        $('hm-opt-add').addEventListener('click', add); $('hm-opt-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
        $('hm-options').querySelectorAll('[data-ot]').forEach(el => el.addEventListener('input', () => { const o = S.options.find(x => x.id === el.dataset.ot); if (o) { o.text = el.value; MethodKit.save(); renderMatrix(); } }));
        $('hm-options').querySelectorAll('[data-om],[data-oth]').forEach(el => el.addEventListener('input', () => { const id = el.dataset.om || el.dataset.oth; const o = S.options.find(x => x.id === id); if (o) { o[el.dataset.om ? 'me' : 'them'] = n(el.value, 5); el.nextElementSibling.textContent = el.value; MethodKit.save(); renderMatrix(); } }));
        $('hm-options').querySelectorAll('[data-or]').forEach(b => b.addEventListener('click', () => { S.options = S.options.filter(x => x.id !== b.dataset.or); MethodKit.save(); renderOptions(); renderMatrix(); }));
    }
    function renderMatrix() {
        const O = S.options.filter(o => o.text.trim());
        if (!O.length) { $('hm-matrix').innerHTML = '<div class="mk-empty">Your options appear here in the matrix: top right = win for both.</div>'; return; }
        const W = 420, H = 300, P = 36;
        const x = (v) => P + (v / 10) * (W - 2 * P), y = (v) => H - P - (v / 10) * (H - 2 * P);
        const best = O.slice().sort((a, b) => (n(b.me, 5) + n(b.them, 5)) - (n(a.me, 5) + n(a.them, 5)))[0];
        $('hm-matrix').innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="hm-mx" role="img" aria-label="Options matrix">
            <rect x="${x(5)}" y="${P}" width="${x(10) - x(5)}" height="${y(5) - P}" class="q win"/>
            <line x1="${P}" x2="${W - P}" y1="${y(5)}" y2="${y(5)}" class="ax"/><line x1="${x(5)}" x2="${x(5)}" y1="${P}" y2="${H - P}" class="ax"/>
            <text x="${x(7.5)}" y="${P + 14}" class="ql">Win-win</text><text x="${x(2.5)}" y="${P + 14}" class="ql">Only ${esc(who()).slice(0, 14)} wins</text><text x="${x(7.5)}" y="${H - P - 6}" class="ql">Only I win</text><text x="${x(2.5)}" y="${H - P - 6}" class="ql">Nobody</text>
            <text x="${W / 2}" y="${H - 8}" class="axl">→ serves my interests</text><text x="12" y="${H / 2}" class="axl" transform="rotate(-90 12 ${H / 2})">→ serves their interests</text>
            ${O.map((o, i) => `<g class="pt ${o === best ? 'best' : ''}"><circle cx="${x(n(o.me, 5))}" cy="${y(n(o.them, 5))}" r="${o === best ? 16 : 13}"/><text x="${x(n(o.me, 5))}" y="${y(n(o.them, 5)) + 4}">${S.options.indexOf(o) + 1}</text><title>${esc(o.text)}</title></g>`).join('')}
        </svg>
        ${best && n(best.me, 5) >= 6 && n(best.them, 5) >= 6 ? `<div class="mk-note ok"><i class="fas fa-star"></i><span>Option ${S.options.indexOf(best) + 1} „${esc(best.text)}" is in the win-win field – your favourite for the opening.</span></div>` : `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>No option clearly in the win-win field yet. Combine two options or ask: what would have to be added so that both are satisfied?</span></div>`}`;
    }

    /* ---------- 5 ---------- */
    function renderCriteria() {
        $('hm-criteria').innerHTML = `
            <div class="mk-chips">${S.criteria.map((c, i) => `<span class="mk-chip selected hm-crit">${esc(c)}<button data-cr="${i}"><i class="fas fa-times"></i></button></span>`).join('')}</div>
            <div class="hm-add" style="margin-top:10px"><input class="mk-input" id="hm-crit-in" placeholder="Own criterion" maxlength="100"><button class="mk-btn mk-btn-primary" id="hm-crit-add"><i class="fas fa-plus"></i></button></div>
            <div class="mk-section-label" style="margin-top:12px">Suggestions</div>
            <div class="mk-chips">${CRIT_SEEDS.filter(s => !S.criteria.includes(s)).map(s => `<button class="mk-chip" data-cs="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div>
            ${S.criteria.length ? `<div class="mk-note ok" style="margin-top:12px"><i class="fas fa-check-circle"></i><span>In the conversation: “Let’s first agree on <em>woran</em> we measure a fair solution – for example ${esc(S.criteria[0])}." Whoever sets the criteria leads the negotiation.</span></div>` : ''}`;
        const add = (v) => { v = (v || '').trim(); if (!v || S.criteria.includes(v)) return; S.criteria.push(v); MethodKit.save(); renderCriteria(); };
        $('hm-crit-add').addEventListener('click', () => add($('hm-crit-in').value)); $('hm-crit-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(e.target.value); } });
        $('hm-criteria').querySelectorAll('[data-cs]').forEach(b => b.addEventListener('click', () => add(b.dataset.cs)));
        $('hm-criteria').querySelectorAll('[data-cr]').forEach(b => b.addEventListener('click', () => { S.criteria.splice(+b.dataset.cr, 1); MethodKit.save(); renderCriteria(); }));
    }
    function renderBatna() {
        const B = S.batna; const m = n(B.myStrength, 5), t = n(B.theirStrength, 5);
        let hint = '';
        if (B.mine && m >= 7 && t <= 4) hint = { t: 'ok', m: 'Your alternative is strong, theirs weak – you negotiate from a position of calm. Use that without threatening.' };
        else if (B.mine && m <= 4 && t >= 7) hint = { t: 'warn', m: 'Their alternative is stronger. Your most important preparation step: improve your BATNA before you negotiate. What could you do until then?' };
        else if (B.mine && m <= 4 && t <= 4) hint = { t: 'info', m: 'Both depend on an agreement – a good basis for creative options.' };
        else if (B.mine) hint = { t: 'info', m: 'Balanced alternatives. The objective criteria will decide.' };
        $('hm-batna').innerHTML = `
            <div class="mk-field"><label for="hm-batna-mine">My best alternative without agreement</label><textarea class="mk-textarea" id="hm-batna-mine" placeholder="What exactly do I do if we don’t agree?">${esc(B.mine || '')}</textarea></div>
            <div class="mk-field"><label>How strong is my alternative?</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${m}" data-bs="myStrength"><span class="mk-range-val">${m}</span></div></div>
            <div class="mk-field"><label for="hm-batna-theirs">Assumed best alternative of ${esc(who())}</label><textarea class="mk-textarea" id="hm-batna-theirs" placeholder="What does the other party do if you don’t agree?">${esc(B.theirs || '')}</textarea></div>
            <div class="mk-field"><label>How strong is their alternative?</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${t}" data-bs="theirStrength"><span class="mk-range-val">${t}</span></div></div>
            <div class="hm-batna-bars"><div><span>Me</span><i style="width:${m * 10}%"></i></div><div><span>${esc(who())}</span><i class="t" style="width:${t * 10}%"></i></div></div>
            ${hint ? `<div class="mk-note ${hint.t}"><i class="fas fa-info-circle"></i><span>${hint.m}</span></div>` : ''}
            <div class="mk-field" style="margin-top:12px"><label for="hm-walk">My bottom line – from when is my BATNA better than any agreement?</label><input class="mk-input" id="hm-walk" value="${esc(B.walk || '')}" placeholder="Concrete: number, condition, date"></div>
            ${B.improve !== undefined || m <= 5 ? `<div class="mk-field"><label for="hm-improve">How can I improve my BATNA before the negotiation?</label><input class="mk-input" id="hm-improve" value="${esc(B.improve || '')}" placeholder="e.g. get a second offer, prepare plan B"></div>` : ''}`;
        $('hm-batna-mine').addEventListener('input', e => { B.mine = e.target.value; MethodKit.save(); }); $('hm-batna-mine').addEventListener('change', renderBatna);
        $('hm-batna-theirs').addEventListener('input', e => { B.theirs = e.target.value; MethodKit.save(); });
        $('hm-batna').querySelectorAll('[data-bs]').forEach(el => el.addEventListener('input', () => { B[el.dataset.bs] = n(el.value, 5); MethodKit.save(); renderBatna(); }));
        $('hm-walk').addEventListener('input', e => { B.walk = e.target.value; MethodKit.save(); });
        const im = $('hm-improve'); if (im) im.addEventListener('input', e => { B.improve = e.target.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }

    /* ---------- 6 ---------- */
    function renderPlan() {
        const shared = [...new Set(S.mine.interests.map(i => i.type).filter(Boolean))].filter(t => S.theirs.interests.some(i => i.type === t));
        const myCore = S.mine.interests.filter(i => i.prio && i.text).map(i => i.text);
        const best = S.options.filter(o => o.text).slice().sort((a, b) => (n(b.me, 5) + n(b.them, 5)) - (n(a.me, 5) + n(a.them, 5)));
        const opening = S.opening || (`${S.relplan ? S.relplan.trim() + ' ' : ''}${shared.length ? `I believe we both care about ${shared[0]} wichtig. ` : ''}${myCore.length ? `What matters most to me is ${myCore[0].replace(/^(weil |dass )/i, '').replace(/\.$/, '')}. ` : ''}${S.theirs.interests.some(i => i.text) ? `I assume that for you, ${S.theirs.interests.find(i => i.text).text.replace(/^(vermutlich, )?weil /i, '').replace(/\.$/, '')} counts – is that right? ` : ''}${S.criteria.length ? `Let’s first clarify how we measure a fair solution – for example ”${S.criteria[0]}".` : ''}`).trim();
        $('hm-plan').innerHTML = `
            <div class="hm-plan">
                <div class="hm-plan-b"><b>Issue</b>${esc(S.issue || S.situation || '–')}</div>
                <div class="hm-plan-b"><b>My core interests</b>${myCore.length ? myCore.map(esc).join(' · ') : esc(S.mine.interests.filter(i => i.text).map(i => i.text).join(' · ') || '–')}</div>
                <div class="hm-plan-b"><b>Shared</b>${shared.length ? shared.join(', ') : '–'}</div>
                <div class="hm-plan-b"><b>Options (best first)</b>${best.length ? `<ol>${best.slice(0, 3).map(o => `<li>${esc(o.text)} <span class="mk-faint">(${n(o.me, 5)}/${n(o.them, 5)})</span></li>`).join('')}</ol>` : '–'}</div>
                <div class="hm-plan-b"><b>Criteria</b>${S.criteria.length ? S.criteria.map(esc).join(' · ') : '–'}</div>
                <div class="hm-plan-b"><b>BATNA / bottom line</b>${esc(S.batna.mine || '–')}${S.batna.walk ? '<br>Untergrenze: ' + esc(S.batna.walk) : ''}</div>
            </div>
            <div class="mk-field" style="margin-top:14px"><label for="hm-opening">My opening sentence</label><span class="hint">Generated from your input – adjust it.</span><textarea class="mk-textarea" id="hm-opening">${esc(opening)}</textarea></div>
            <div class="mk-field"><label for="hm-nono">What I will not do under any circumstances</label><input class="mk-input" id="hm-nono" value="${esc(S.nono || '')}" placeholder="e.g. bring up old mistakes · threaten to quit · give in after the first no"></div>`;
        $('hm-opening').addEventListener('input', e => { S.opening = e.target.value; MethodKit.save(); });
        $('hm-nono').addEventListener('input', e => { S.nono = e.target.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }
    function renderLinks() { $('hm-links').innerHTML = LINKS.map(l => `<a class="mk-option hm-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }
    function exportAll() {
        const L = ['HARVARD METHOD · NEGOTIATION PLAN', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'SITUATION', S.situation || '–', `Other party: ${S.who || '–'} · Deadline: ${S.deadline || 'offen'} · Outcome ${n(S.outcomeImp, 5)}/10 · Relationship ${n(S.relImp, 5)}/10`, ''];
        L.push('1 · PEOPLE AND PROBLEM', 'Issue: ' + (S.issue || '–'), 'My feelings: ' + ((S.emo.mine || []).join(', ') || '–'), 'Their feelings: ' + ((S.emo.theirs || []).join(', ') || '–'), S.relationship ? 'Interpersonal: ' + S.relationship : '', S.relplan ? 'Addressing it: ' + S.relplan : '', '');
        L.push('2 · INTERESTS', 'My position: ' + (S.mine.position || '–')); S.mine.interests.forEach(i => { if (i.text) L.push(`  ${i.prio ? '★' : '-'} ${i.text}${i.type ? ' [' + i.type + ']' : ''}`); }); L.push('Their position: ' + (S.theirs.position || '–')); S.theirs.interests.forEach(i => { if (i.text) L.push(`  ${i.prio ? '★' : '-'} ${i.text}${i.type ? ' [' + i.type + ']' : ''}`); }); L.push('');
        L.push('3 · OPTIONS'); S.options.forEach((o, i) => { if (o.text) L.push(`${i + 1}. ${o.text} (ich ${n(o.me, 5)} / them ${n(o.them, 5)})`); }); L.push('');
        L.push('4 · CRITERIA', S.criteria.join(', ') || '–', '', 'BATNA', 'Mine: ' + (S.batna.mine || '–') + ` (${n(S.batna.myStrength, 5)}/10)`, 'Theirs: ' + (S.batna.theirs || '–') + ` (${n(S.batna.theirStrength, 5)}/10)`, S.batna.walk ? 'Bottom line: ' + S.batna.walk : '', S.batna.improve ? 'Improve: ' + S.batna.improve : '', '');
        L.push('OPENING', S.opening || '–', S.nono ? 'Don’t do: ' + S.nono : ''); if (S.result) L.push('', 'OUTCOME', S.result);
        MethodKit.exportText('verhandlungsplan-harvard.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'harvard-method', accent: '#6366f1', accent2: '#0ea5e9',
            steps: [{ icon: '🤝', label: 'Situation' }, { icon: '🧍', label: 'Separate' }, { icon: '🎯', label: 'Interessen' }, { icon: '💡', label: 'Options' }, { icon: '⚖️', label: 'Criteria' }, { icon: '📋', label: 'Plan' }],
            defaultState: { situation: '', who: '', deadline: '', outcomeImp: 5, relImp: 5, issue: '', emo: {}, relationship: '', relplan: '', mine: { position: '', interests: [] }, theirs: { position: '', interests: [] }, options: [], criteria: [], batna: {}, opening: '', nono: '', result: '' }
        });
        S = MethodKit.state;
        if (!S.emo || typeof S.emo !== 'object') S.emo = {}; if (!S.batna || typeof S.batna !== 'object') S.batna = {};
        ['mine', 'theirs'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = { position: '', interests: [] }; if (!Array.isArray(S[k].interests)) S[k].interests = []; });
        if (!Array.isArray(S.criteria)) S.criteria = typeof S.criteria === 'string' && S.criteria.trim() ? [S.criteria.trim()] : [];
        if (!Array.isArray(S.options)) S.options = [];
        S.options = S.options.map(o => typeof o === 'string' ? { id: MethodKit.uid(), text: o, me: 5, them: 5 } : o);
        // Migration alter Freitexte
        if (typeof S.myInterests === 'string') { if (S.myInterests.trim() && !S.mine.interests.length) S.mine.interests.push({ id: MethodKit.uid(), text: S.myInterests.trim(), type: '', prio: true }); delete S.myInterests; }
        if (typeof S.theirInterests === 'string') { if (S.theirInterests.trim() && !S.theirs.interests.length) S.theirs.interests.push({ id: MethodKit.uid(), text: S.theirInterests.trim(), type: '', prio: false }); delete S.theirInterests; }
        if (typeof S.batna === 'string') { S.batna = { mine: S.batna }; }

        MethodKit.bindFields();
        $('hm-who').addEventListener('input', () => { renderStakes(); });
        renderStakes();
        MethodKit.onStep = function (k) {
            if (k === 1) renderStakes();
            if (k === 2) renderEmotions();
            if (k === 3) { $('hm-theirs-h').textContent = who(); renderSide('mine'); renderSide('theirs'); renderMatch(); }
            if (k === 4) { renderOptions(); renderMatrix(); }
            if (k === 5) { renderCriteria(); renderBatna(); }
            if (k === 6) { renderPlan(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
        $('hm-export').addEventListener('click', exportAll);
    })();
})();
