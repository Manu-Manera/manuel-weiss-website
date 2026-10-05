/* Systemic coaching · Logik (Kit-basiert) */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const CONTEXTS = ['Work / team', 'Leadership', 'Partnership', 'Family', 'Friends', 'Family of origin', 'Project / client', 'Myself'];
    const ROLES = ['Partner', 'Kind', 'Parent', 'Manager', 'Colleague', 'Employee', 'Friend', 'Customer', 'Team', 'Organization', 'Ex-', 'Other'];
    const QUAL = { good: { l: 'gut', c: '#10b981' }, tense: { l: 'tense', c: '#f59e0b' }, conflict: { l: 'Conflict', c: '#ef4444' }, distant: { l: 'distanziert', c: '#94a3b8' }, ambivalent: { l: 'ambivalent', c: '#8b5cf6' } };
    const CIRC_T = [
        { id: 'view', t: (m) => `How would <b>${m}</b> describe your concern – in one sentence?` },
        { id: 'explain', t: (m) => `What does <b>${m}</b> believe is why you behave the way you do?` },
        { id: 'wish', t: (m) => `What would <b>${m}</b>  want from you, if you had to guess honestly?` },
        { id: 'notice', t: (m) => `Who in the system would be the first to notice if something between you and <b>${m}</b> changes – and how?` },
        { id: 'diff', t: (m) => `Who suffers most from the situation – you, <b>${m}</b> or a third person? What makes the difference?` },
        { id: 'worse', t: (m) => `What would you have to do so that things between you and <b>${m}</b> are guaranteed to get worse?` }
    ];
    const FUNC_OPTS = [
        { id: 'protect', l: 'Protects from something', d: 'e.g. from conflict, closeness, responsibility, visibility' },
        { id: 'loyal', l: 'Holds a loyalty', d: 'e.g. to a person, family rule, former self' },
        { id: 'balance', l: 'Holds a balance', d: 'e.g. roles stay clear, nobody has to move' },
        { id: 'attention', l: 'Secures contact or attention', d: 'even negative contact is contact' },
        { id: 'avoid', l: 'Avoids a decision', d: 'as long as the problem is there, I don\'t have to choose' },
        { id: 'identity', l: 'Confirms a self-image', d: 'e.g. “I am the reasonable one”, “I come up short”' }
    ];
    const REFRAMES = [
        { from: 'I withdraw', to: 'I protect the relationship from escalation' },
        { from: 'I control everything', to: 'I take responsibility where others let go' },
        { from: 'I am too accommodating', to: 'I hold the system together' },
        { from: 'I explode', to: 'I show that something matters to me' },
        { from: 'I stay silent', to: 'I give others space' },
        { from: 'I interfere', to: 'I am engaged and I care' }
    ];
    const RES_TYPES = ['Person who stands by me', 'Someone who is neutral', 'Earlier solution in the system', 'A rule that has proven itself', 'Shared interest', 'Humor / lightness', 'External help', 'Time (it has changed before)'];
    const HYP_FRAMES = [
        { id: 'loop', l: 'Loop', f: 'The more I {A}, the more {B} – and vice versa.' },
        { id: 'function', l: 'Function', f: 'The pattern ensures that {X} does not have to happen.' },
        { id: 'loyalty', l: 'Loyalty', f: 'I behave this way because it keeps me loyal to {Y}.' },
        { id: 'rule', l: 'Unwritten rule', f: 'In this system the rule is: {Regel}. My behavior follows it.' },
        { id: 'context', l: 'Context', f: 'The behavior makes sense when you consider that {Kontext}.' }
    ];
    const INTERRUPTS = [
        { id: 'stop', icon: '⏸️', l: 'Leave out my part', d: 'At one point in the loop, consciously not react as usual.' },
        { id: 'opposite', icon: '🔄', l: 'Do the opposite', d: 'Instead of withdrawing: speak up. Instead of controlling: ask.' },
        { id: 'meta', icon: '💬', l: 'Name the pattern', d: '“I notice that we\'re doing … again – is it the same for you?”' },
        { id: 'context', icon: '📍', l: 'Change the context', d: 'The same conversation in another place, at another time, in another form.' },
        { id: 'ally', icon: '🤝', l: 'Bring in a resource', d: 'Bring a neutral person or a proven rule into play.' },
        { id: 'ask', icon: '❓', l: 'Ask circularly – live', d: 'Ask the other person a circular question instead of arguing.' }
    ];
    const LINKS = [
        { m: 'Solution focus', l: '../solution-focused/solution-focused.html', why: 'Exceptions and scaling for your experiment.' },
        { m: 'Circular interview', l: '../circular-interview/circular-interview.html', why: 'Deepen the circular questions.' },
        { m: 'Conflict escalation (Glasl)', l: '../conflict-escalation/conflict-escalation.html', why: 'When a relationship is in conflict.' },
        { m: 'Nonviolent communication', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Address the pattern without escalating.' },
        { m: 'Johari window', l: '../johari-window/johari-window.html', why: 'Compare how others see you and your self-image.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const members = () => S.members;
    const nameOf = (id) => (members().find(m => m.id === id) || {}).name || '?';

    /* ---------- 1 · Kontext, Landkarte ---------- */
    function renderContext() {
        $('sc-context').innerHTML = CONTEXTS.map(c => `<button class="mk-chip ${S.contexts.includes(c) ? 'selected' : ''}" data-ctx="${esc(c)}">${esc(c)}</button>`).join('');
        $('sc-context').querySelectorAll('[data-ctx]').forEach(b => b.addEventListener('click', () => { const c = b.dataset.ctx; S.contexts = S.contexts.includes(c) ? S.contexts.filter(x => x !== c) : [...S.contexts, c]; MethodKit.save(); renderContext(); }));
    }
    function renderMap() {
        const ms = members(); const W = 420, H = 340, cx = W / 2, cy = H / 2;
        const rings = [60, 95, 128];
        const nodes = ms.map((m, i) => {
            const r = rings[Math.max(0, Math.min(2, 3 - n(m.closeness, 2)))]; // closeness 3 = innen
            const a = -Math.PI / 2 + (i / Math.max(ms.length, 1)) * Math.PI * 2;
            return { m, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, c: (QUAL[m.quality] || QUAL.good).c };
        });
        $('sc-map').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="System map">
            ${rings.map(r => `<circle cx="${cx}" cy="${cy}" r="${r}" class="ring"/>`).join('')}
            ${nodes.map(nd => `<line x1="${cx}" y1="${cy}" x2="${nd.x}" y2="${nd.y}" stroke="${nd.c}" class="edge ${nd.m.quality === 'conflict' ? 'zig' : ''} ${nd.m.quality === 'distant' ? 'dash' : ''}"/>`).join('')}
            <circle cx="${cx}" cy="${cy}" r="22" class="me"/><text x="${cx}" y="${cy + 4}" class="me-t">Me</text>
            ${nodes.map(nd => `<g class="node" data-focus="${nd.m.id}"><circle cx="${nd.x}" cy="${nd.y}" r="${nd.m.id === S.focus ? 17 : 14}" fill="${nd.c}" class="${nd.m.id === S.focus ? 'focus' : ''}"/><text x="${nd.x}" y="${nd.y + 4}" class="ini">${esc((nd.m.name || '?').slice(0, 2).toUpperCase())}</text><text x="${nd.x}" y="${nd.y + (nd.y < cy - 10 ? -22 : 30)}" class="lbl">${esc((nd.m.name || '').slice(0, 14))}</text></g>`).join('')}
        </svg>
        <div class="sc-legend">${Object.entries(QUAL).map(([k, q]) => `<span><i style="background:${q.c}"></i>${q.l}</span>`).join('')}</div>
        ${ms.length ? '<div class="mk-faint" style="text-align:center;margin-top:4px">Klick auf eine Person, um sie zum Fokus für die zirkulären Fragen zu machen.</div>' : ''}`;
        $('sc-map').querySelectorAll('[data-focus]').forEach(g => g.addEventListener('click', () => { S.focus = g.dataset.focus; MethodKit.save(); renderMap(); renderMembers(); }));
    }
    function renderMembers() {
        const ms = members();
        $('sc-members').innerHTML = `
            ${ms.map(m => `<div class="sc-member ${m.id === S.focus ? 'focus' : ''}">
                <div class="sc-member-row">
                    <input class="mk-input" data-m="${m.id}" data-f="name" value="${esc(m.name || '')}" placeholder="Name">
                    <select class="mk-select" data-m="${m.id}" data-f="role">${ROLES.map(r => `<option ${m.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                    <button class="mk-iconbtn" data-rm="${m.id}" aria-label="Remove"><i class="fas fa-times"></i></button>
                </div>
                <div class="sc-member-row2">
                    <label>Nähe <input type="range" class="mk-range" min="1" max="3" value="${n(m.closeness, 2)}" data-m="${m.id}" data-f="closeness"></label>
                    <div class="sc-qual">${Object.entries(QUAL).map(([k, q]) => `<button class="${m.quality === k ? 'on' : ''}" style="--q:${q.c}" data-m="${m.id}" data-q="${k}" title="${q.l}"></button>`).join('')}<span>${(QUAL[m.quality] || QUAL.good).l}</span></div>
                </div>
                <button class="sc-focus-btn ${m.id === S.focus ? 'on' : ''}" data-setfocus="${m.id}"><i class="fas fa-crosshairs"></i> ${m.id === S.focus ? 'Focus person' : 'Set as focus'}</button>
            </div>`).join('')}
            <button class="mk-btn mk-btn-outline" id="sc-add" style="width:100%"><i class="fas fa-user-plus"></i> Add person</button>
            ${ms.length >= 2 ? '' : '<div class="mk-note info" style="margin-top:10px"><i class="fas fa-info-circle"></i><span>Mindestens zwei Personen – auch wenn eine davon „das Team" oder „meine Mutter, die das kommentiert" ist.</span></div>'}`;
        $('sc-add').addEventListener('click', () => { const m = { id: MethodKit.uid(), name: '', role: ROLES[0], closeness: 2, quality: 'good' }; S.members.push(m); if (!S.focus) S.focus = m.id; MethodKit.save(); renderMembers(); renderMap(); const inp = $('sc-members').querySelector(`[data-m="${m.id}"][data-f="name"]`); if (inp) inp.focus(); });
        $('sc-members').querySelectorAll('[data-m][data-f]').forEach(el => el.addEventListener('input', () => { const m = ms.find(x => x.id === el.dataset.m); if (!m) return; m[el.dataset.f] = el.dataset.f === 'closeness' ? n(el.value, 2) : el.value; MethodKit.save(); renderMap(); if (el.dataset.f !== 'name') renderMembers(); }));
        $('sc-members').querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { const m = ms.find(x => x.id === b.dataset.m); if (m) { m.quality = b.dataset.q; MethodKit.save(); renderMembers(); renderMap(); } }));
        $('sc-members').querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { S.members = ms.filter(x => x.id !== b.dataset.rm); if (S.focus === b.dataset.rm) S.focus = S.members[0]?.id || null; MethodKit.save(); renderMembers(); renderMap(); }));
        $('sc-members').querySelectorAll('[data-setfocus]').forEach(b => b.addEventListener('click', () => { S.focus = b.dataset.setfocus; MethodKit.save(); renderMembers(); renderMap(); }));
    }

    /* ---------- 2 · Zirkulär & Schleife ---------- */
    function renderCircular() {
        const ms = members().filter(m => (m.name || '').trim());
        if (!ms.length) { $('sc-circular').innerHTML = '<div class="mk-empty">Add at least one person in step 1, then the questions appear here.</div>'; return; }
        const f = ms.find(m => m.id === S.focus) || ms[0]; S.focus = f.id;
        const ans = S.circular[f.id] || (S.circular[f.id] = {});
        const done = ms.map(m => ({ m, k: Object.values(S.circular[m.id] || {}).filter(v => (v || '').trim()).length }));
        $('sc-circular').innerHTML = `
            <div class="mk-chips sc-focus-chips">${done.map(d => `<button class="mk-chip ${d.m.id === f.id ? 'selected' : ''}" data-cf="${d.m.id}">${esc(d.m.name)}${d.k ? ` <small>${d.k}/${CIRC_T.length}</small>` : ''}</button>`).join('')}</div>
            <div class="sc-circ-list">${CIRC_T.map(q => `<div class="mk-field"><label>${q.t(esc(f.name))}</label><textarea class="mk-textarea" data-cq="${q.id}" placeholder="…">${esc(ans[q.id] || '')}</textarea></div>`).join('')}</div>
            ${ans.worse ? `<div class="mk-note ok"><i class="fas fa-lightbulb"></i><span>Die Verschlimmerungsfrage ist Gold: Alles, was du dort aufgeschrieben hast, ist umgekehrt ein Hebel für Verbesserung.</span></div>` : ''}`;
        $('sc-circular').querySelectorAll('[data-cf]').forEach(b => b.addEventListener('click', () => { S.focus = b.dataset.cf; MethodKit.save(); renderCircular(); }));
        $('sc-circular').querySelectorAll('[data-cq]').forEach(t => t.addEventListener('input', () => { ans[t.dataset.cq] = t.value; MethodKit.save(); }));
        MethodKit._autosizeAll();
    }
    function renderLoop() {
        const L = S.loop; const other = nameOf(S.focus);
        const steps = [
            { k: 'a', who: 'Me', l: 'do / say …' },
            { k: 'b', who: other, l: 'reacts with …' },
            { k: 'c', who: 'Me', l: 'I react to that with …' },
            { k: 'd', who: other, l: 'whereupon …' }
        ];
        const filled = steps.filter(s => (L[s.k] || '').trim()).length;
        $('sc-loop').innerHTML = `
            <div class="sc-loop">${steps.map((s, i) => `<div class="sc-loop-step ${s.who === 'Ich' ? 'me' : 'other'}"><div class="who">${i + 1} · ${esc(s.who)}</div><input class="mk-input" data-loop="${s.k}" value="${esc(L[s.k] || '')}" placeholder="${s.l}"></div>${i < 3 ? '<div class="sc-loop-arrow"><i class="fas fa-arrow-down"></i></div>' : '<div class="sc-loop-arrow back"><i class="fas fa-rotate-left"></i> and back to the start</div>'}`).join('')}</div>
            ${filled === 4 ? `<div class="mk-result"><h4>Deine Schleife</h4>Ich <strong>${esc(L.a)}</strong> → ${esc(other)} <strong>${esc(L.b)}</strong> → ich <strong>${esc(L.c)}</strong> → ${esc(other)} <strong>${esc(L.d)}</strong> → …<div class="mk-faint" style="margin-top:8px">Zwei Stellen gehören dir: 1 und 3. Dort kannst du in Schritt 5 ansetzen.</div></div>` : ''}
            <div class="mk-field" style="margin-top:14px"><label for="sc-patterns">Further patterns you notice</label><textarea class="mk-textarea" id="sc-patterns" placeholder="Recurring sentences, roles, times, places …">${esc(S.patterns || '')}</textarea></div>`;
        $('sc-loop').querySelectorAll('[data-loop]').forEach(el => { el.addEventListener('input', () => { L[el.dataset.loop] = el.value; MethodKit.save(); }); el.addEventListener('change', renderLoop); });
        $('sc-patterns').addEventListener('input', e => { S.patterns = e.target.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }

    /* ---------- 3 · Funktion & Reframing ---------- */
    function renderFunction() {
        $('sc-function').innerHTML = `
            <div class="mk-grid sc-func">${FUNC_OPTS.map(o => `<button class="mk-option ${S.funcs.includes(o.id) ? 'selected' : ''}" data-fn="${o.id}"><span class="t">${o.l}</span><span class="d">${o.d}</span></button>`).join('')}</div>
            <div class="mk-field" style="margin-top:14px"><label for="sc-function-t">Concrete: What is the problem good for in your system – and for whom?</label><span class="hint">Start with “As long as the problem is there, …”</span><textarea class="mk-textarea" id="sc-function-t" placeholder="As long as the problem is there, …">${esc(S.function || '')}</textarea></div>
            ${S.funcs.length ? `<div class="mk-field"><label for="sc-price">Was wäre der Preis, wenn das Problem weg wäre? Wer müsste sich dann bewegen?</label><textarea class="mk-textarea" id="sc-price" placeholder="…">${esc(S.price || '')}</textarea></div>` : ''}`;
        $('sc-function').querySelectorAll('[data-fn]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.fn; S.funcs = S.funcs.includes(id) ? S.funcs.filter(x => x !== id) : [...S.funcs, id]; MethodKit.save(); renderFunction(); }));
        $('sc-function-t').addEventListener('input', e => { S.function = e.target.value; MethodKit.save(); });
        const p = $('sc-price'); if (p) p.addEventListener('input', e => { S.price = e.target.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }
    function renderReframe() {
        const R = S.reframe;
        $('sc-reframe').innerHTML = `
            <div class="sc-reframe">
                <div class="mk-field"><label>My problem behavior</label><input class="mk-input" data-rf="from" value="${esc(R.from || '')}" placeholder="e.g. I withdraw"></div>
                <div class="sc-reframe-arrow"><i class="fas fa-arrow-right"></i></div>
                <div class="mk-field"><label>… is also a skill / intention</label><input class="mk-input" data-rf="to" value="${esc(R.to || '')}" placeholder="e.g. I protect the relationship from escalation"></div>
            </div>
            <div class="mk-section-label">Examples to click</div>
            <div class="sc-rf-ex">${REFRAMES.map((r, i) => `<button data-rfx="${i}"><span>${esc(r.from)}</span><i class="fas fa-arrow-right"></i><span>${esc(r.to)}</span></button>`).join('')}</div>
            ${R.from && R.to ? `<div class="mk-result"><h4>Dein Reframing</h4>„${esc(R.from)}" also means: <strong>${esc(R.to)}</strong>.<div class="mk-faint" style="margin-top:6px">Frage für Schritt 5: Wie kannst du diese Fähigkeit behalten – und sie anders einsetzen?</div></div>` : ''}`;
        $('sc-reframe').querySelectorAll('[data-rf]').forEach(el => { el.addEventListener('input', () => { R[el.dataset.rf] = el.value; MethodKit.save(); }); el.addEventListener('change', renderReframe); });
        $('sc-reframe').querySelectorAll('[data-rfx]').forEach(b => b.addEventListener('click', () => { const r = REFRAMES[+b.dataset.rfx]; R.from = r.from; R.to = r.to; MethodKit.save(); renderReframe(); }));
    }

    /* ---------- 4 · Ressourcen & Hypothesen ---------- */
    function renderResources() {
        const ms = members().filter(m => m.name && (m.quality === 'good' || m.quality === 'ambivalent'));
        $('sc-resources').innerHTML = `
            ${ms.length ? `<div class="mk-note ok"><i class="fas fa-users"></i><span>Aus deiner Landkarte: ${ms.map(m => `<strong>${esc(m.name)}</strong>`).join(', ')} – ${ms.length === 1 ? 'a relationship that holds' : 'relationships that hold'}.</span></div>` : ''}
            <div class="mk-chips">${RES_TYPES.map(r => `<button class="mk-chip ${S.resChips.includes(r) ? 'selected' : ''}" data-rc="${esc(r)}">${esc(r)}</button>`).join('')}</div>
            <div class="mk-field" style="margin-top:14px"><label for="sc-resources-t">Concrete: Who or what is a resource – and how could you use it?</label><textarea class="mk-textarea" id="sc-resources-t" placeholder="…">${esc(S.resources || '')}</textarea></div>`;
        $('sc-resources').querySelectorAll('[data-rc]').forEach(b => b.addEventListener('click', () => { const r = b.dataset.rc; S.resChips = S.resChips.includes(r) ? S.resChips.filter(x => x !== r) : [...S.resChips, r]; MethodKit.save(); renderResources(); }));
        $('sc-resources-t').addEventListener('input', e => { S.resources = e.target.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }
    function renderHypotheses() {
        const H = S.hyps;
        const kinds = new Set(H.map(h => h.frame));
        $('sc-hypotheses').innerHTML = `
            ${H.map((h, i) => `<div class="sc-hyp">
                <div class="sc-hyp-head"><span class="mk-badge">${esc(HYP_FRAMES.find(f => f.id === h.frame)?.l || 'Free')}</span><span class="grow"></span><button class="mk-iconbtn" data-rmh="${h.id}" aria-label="Delete"><i class="fas fa-trash"></i></button></div>
                <textarea class="mk-textarea" data-h="${h.id}" placeholder="${esc(HYP_FRAMES.find(f => f.id === h.frame)?.f || 'Vielleicht …')}">${esc(h.text || '')}</textarea>
                <div class="sc-hyp-rate"><span>Nützlich – eröffnet mir neue Möglichkeiten</span><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="5" value="${n(h.useful, 3)}" data-hu="${h.id}"><span class="mk-range-val">${n(h.useful, 3)}/5</span></div></div>
            </div>`).join('')}
            <div class="mk-section-label">New hypothesis – choose a frame</div>
            <div class="mk-chips">${HYP_FRAMES.map(f => `<button class="mk-chip ${kinds.has(f.id) ? 'selected' : ''}" data-nh="${f.id}" title="${esc(f.f)}">+ ${f.l}</button>`).join('')}<button class="mk-chip" data-nh="free">+ Free</button></div>
            ${H.length >= 2 && kinds.size >= 2 ? `<div class="mk-note ok" style="margin-top:12px"><i class="fas fa-check-circle"></i><span>${H.length} Hypothesen aus ${kinds.size} Perspektiven – gute Grundlage. Die nützlichste (${Math.max(...H.map(h => n(h.useful, 3)))}/5) wird in Schritt 5 dein Ausgangspunkt.</span></div>` : H.length ? '<div class="mk-note info" style="margin-top:12px"><i class="fas fa-info-circle"></i><span>At least two hypotheses from different frames – that way you don't fall in love with one explanation.</span></div>' : ''}`;
        $('sc-hypotheses').querySelectorAll('[data-nh]').forEach(b => b.addEventListener('click', () => { S.hyps.push({ id: MethodKit.uid(), frame: b.dataset.nh, text: '', useful: 3 }); MethodKit.save(); renderHypotheses(); const ts = $('sc-hypotheses').querySelectorAll('textarea'); if (ts.length) ts[ts.length - 1].focus(); }));
        $('sc-hypotheses').querySelectorAll('[data-h]').forEach(t => t.addEventListener('input', () => { const h = H.find(x => x.id === t.dataset.h); if (h) { h.text = t.value; MethodKit.save(); } }));
        $('sc-hypotheses').querySelectorAll('[data-hu]').forEach(r => r.addEventListener('input', () => { const h = H.find(x => x.id === r.dataset.hu); if (h) { h.useful = n(r.value, 3); MethodKit.save(); r.nextElementSibling.textContent = h.useful + '/5'; } }));
        $('sc-hypotheses').querySelectorAll('[data-rmh]').forEach(b => b.addEventListener('click', () => { S.hyps = H.filter(x => x.id !== b.dataset.rmh); MethodKit.save(); renderHypotheses(); }));
        MethodKit._autosizeAll();
    }

    /* ---------- 5 · Experiment ---------- */
    function renderInterrupt() {
        const L = S.loop, E = S.exp;
        const best = S.hyps.filter(h => h.text).sort((a, b) => n(b.useful, 3) - n(a.useful, 3))[0];
        $('sc-interrupt').innerHTML = `
            ${L.a || L.c ? `<div class="sc-mine"><div class="mk-section-label">Deine Stellen in der Schleife</div>${['a', 'c'].filter(k => L[k]).map(k => `<button class="sc-mine-btn ${E.at === k ? 'on' : ''}" data-at="${k}"><span class="num">${k === 'a' ? 1 : 3}</span><span>Me ${esc(L[k])}</span></button>`).join('')}</div>` : ''}
            ${best ? `<div class="mk-note info"><i class="fas fa-lightbulb"></i><span>Deine nützlichste Hypothese: <em>${esc(best.text)}</em> – welches Experiment würde sie testen?</span></div>` : ''}
            <div class="mk-section-label" style="margin-top:12px">Type of interruption</div>
            <div class="mk-grid sc-int">${INTERRUPTS.map(o => `<button class="mk-option ${E.kind === o.id ? 'selected' : ''}" data-kind="${o.id}"><span class="ic">${o.icon}</span><span class="t">${o.l}</span><span class="d">${o.d}</span></button>`).join('')}</div>`;
        $('sc-interrupt').querySelectorAll('[data-at]').forEach(b => b.addEventListener('click', () => { E.at = E.at === b.dataset.at ? null : b.dataset.at; MethodKit.save(); renderInterrupt(); renderExperiment(); }));
        $('sc-interrupt').querySelectorAll('[data-kind]').forEach(b => b.addEventListener('click', () => { E.kind = b.dataset.kind; MethodKit.save(); renderInterrupt(); renderExperiment(); }));
    }
    function renderExperiment() {
        const E = S.exp; const kind = INTERRUPTS.find(o => o.id === E.kind);
        $('sc-experiment').innerHTML = `
            <div class="mk-field"><label for="sc-exp-do">What exactly do you do differently?</label>${kind ? `<span class="hint">${kind.l}: ${kind.d}</span>` : ''}<textarea class="mk-textarea" id="sc-exp-do" placeholder="Next time, when …, I will …">${esc(E.do || '')}</textarea></div>
            <div class="mk-grid-2">
                <div class="mk-field"><label for="sc-exp-when">When / on which occasion?</label><input class="mk-input" id="sc-exp-when" value="${esc(E.when || '')}" placeholder="e.g. Monday in the team meeting"></div>
                <div class="mk-field"><label for="sc-exp-watch">What do you watch for in the other person?</label><input class="mk-input" id="sc-exp-watch" value="${esc(E.watch || '')}" placeholder="Reaction, tone, what runs differently"></div>
            </div>
            <div class="mk-field"><label for="sc-exp-hyp">What do you expect – and what would be a surprise?</label><textarea class="mk-textarea" id="sc-exp-hyp" placeholder="Expectation: … A surprise would be: …">${esc(E.expect || '')}</textarea></div>
            <div class="mk-field"><label for="sc-exp-result">After the experiment: What happened?</label><span class="hint">Come back here. No matter how it went – you gained information about your system.</span><textarea class="mk-textarea" id="sc-exp-result" placeholder="…">${esc(E.result || '')}</textarea></div>
            ${E.do ? `<div class="mk-result"><h4>Your experiment</h4>${kind ? kind.icon + ' ' : ''}<strong>${esc(E.do)}</strong>${E.when ? ' · ' + esc(E.when) : ''}${E.watch ? '<br><span class="mk-faint">Observe: ' + esc(E.watch) + '</span>' : ''}</div>` : ''}`;
        [['sc-exp-do', 'do'], ['sc-exp-when', 'when'], ['sc-exp-watch', 'watch'], ['sc-exp-hyp', 'expect'], ['sc-exp-result', 'result']].forEach(([id, k]) => { $(id).addEventListener('input', e => { E[k] = e.target.value; MethodKit.save(); }); });
        $('sc-exp-do').addEventListener('change', renderExperiment); $('sc-exp-when').addEventListener('change', renderExperiment); $('sc-exp-watch').addEventListener('change', renderExperiment);
        MethodKit._autosizeAll();
    }
    function renderLinks() { $('sc-links').innerHTML = LINKS.map(l => `<a class="mk-option sc-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }

    /* ---------- Export ---------- */
    function exportAll() {
        const L = ['SYSTEMIC COACHING', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), ''];
        if (S.topic) L.push('CONCERN', S.topic, S.contexts.length ? 'Context: ' + S.contexts.join(', ') : '', '');
        if (S.members.length) { L.push('SYSTEM'); S.members.forEach(m => L.push(`- ${m.name || '?'} (${m.role}) · Nähe ${n(m.closeness, 2)}/3 · ${(QUAL[m.quality] || QUAL.good).l}${m.id === S.focus ? ' · Fokus' : ''}`)); L.push(''); }
        Object.entries(S.circular).forEach(([id, ans]) => { const vals = CIRC_T.filter(q => (ans[q.id] || '').trim()); if (vals.length) { L.push('CIRCULAR QUESTIONS · ' + nameOf(id)); vals.forEach(q => L.push('- ' + q.t(nameOf(id)).replace(/<\/?b>/g, ''), '  ' + ans[q.id])); L.push(''); } });
        const lp = S.loop; if (lp.a || lp.b) L.push('PATTERN LOOP', `Me ${lp.a || '…'} → ${nameOf(S.focus)} ${lp.b || '…'} → I ${lp.c || '…'} → ${nameOf(S.focus)} ${lp.d || '…'}`, ''); if (S.patterns) L.push('Further patterns: ' + S.patterns, '');
        if (S.funcs.length || S.function) L.push('FUNCTION', S.funcs.map(id => FUNC_OPTS.find(o => o.id === id)?.l).filter(Boolean).join(', '), S.function || '', S.price ? 'Price of the solution: ' + S.price : '', '');
        if (S.reframe.from) L.push('REFRAMING', `„${S.reframe.from}" → ${S.reframe.to || ''}`, '');
        if (S.resChips.length || S.resources) L.push('RESOURCES', S.resChips.join(', '), S.resources || '', '');
        if (S.hyps.length) { L.push('HYPOTHESES'); S.hyps.forEach(h => L.push(`- [${HYP_FRAMES.find(f => f.id === h.frame)?.l || 'Frei'} · ${n(h.useful, 3)}/5] ${h.text}`)); L.push(''); }
        const E = S.exp; if (E.do) L.push('EXPERIMENT', (INTERRUPTS.find(o => o.id === E.kind)?.l || '') + ': ' + E.do, E.when ? 'When: ' + E.when : '', E.watch ? 'Observe: ' + E.watch : '', E.expect ? 'Expectation: ' + E.expect : '', E.result ? 'Result: ' + E.result : '');
        MethodKit.exportText('systemisches-coaching.txt', L.filter(x => x !== undefined).join('\n'));
    }

    /* ---------- Init ---------- */
    (async function () {
        await MethodKit.init({
            method: 'systemic-coaching',
            accent: '#8b5cf6', accent2: '#06b6d4',
            steps: [{ icon: '🗺️', label: 'System' }, { icon: '🔁', label: 'Patterns' }, { icon: '🧩', label: 'Function' }, { icon: '💡', label: 'Hypotheses' }, { icon: '🧪', label: 'Experiment' }],
            defaultState: { topic: '', contexts: [], members: [], focus: null, circular: {}, loop: {}, patterns: '', funcs: [], function: '', price: '', reframe: {}, resChips: [], resources: '', hyps: [], exp: {} }
        });
        S = MethodKit.state;
        ['circular', 'loop', 'reframe', 'exp'].forEach(k => { if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {}; });
        ['contexts', 'members', 'funcs', 'resChips', 'hyps'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        // Migration alter Freitexte
        if (typeof S.system === 'string' && S.system.trim() && !S.members.length) { S.system.split(/[,\n;]+/).map(x => x.trim()).filter(Boolean).slice(0, 8).forEach(nm => S.members.push({ id: MethodKit.uid(), name: nm.slice(0, 30), role: 'Other', closeness: 2, quality: 'good' })); S.focus = S.members[0]?.id || null; delete S.system; }
        if (typeof S.hypothesis === 'string' && S.hypothesis.trim() && !S.hyps.length) { S.hyps.push({ id: MethodKit.uid(), frame: 'free', text: S.hypothesis.trim(), useful: 3 }); delete S.hypothesis; }
        if (typeof S.step === 'string' && S.step.trim() && !S.exp.do) { S.exp.do = S.step.trim(); delete S.step; }

        MethodKit.bindFields();
        renderContext(); renderMap(); renderMembers();
        MethodKit.onStep = function (k) {
            if (k === 1) { renderMap(); renderMembers(); }
            if (k === 2) { renderCircular(); renderLoop(); }
            if (k === 3) { renderFunction(); renderReframe(); }
            if (k === 4) { renderResources(); renderHypotheses(); }
            if (k === 5) { renderInterrupt(); renderExperiment(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
        $('sc-export').addEventListener('click', exportAll);
    })();
})();
