/* Circular questioning · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const ROLES = ['Partner:in', 'Vorgesetzte:r', 'Kolleg:in', 'Kind', 'Parent', 'Freund:in', 'Team', 'Kund:in'];
    /* Fragetypen: {a} = Person A, {b} = Person B, {me} = Ich */
    const TYPES = {
        differ: { l: 'Differences', ic: '↔️', need: 2, q: ['Who suffers more from the situation – {a} or {b}? How can you tell?', 'Which of the two, {a} or {b}, is more likely to believe in a solution?', 'Who finds it easier to bring up the topic – {a} or {b}?'] },
        view: { l: 'Outside view', ic: '👓', need: 2, q: ['How does {a} think {b} would describe the situation?', 'What does {a} think {b} expects from {me}?', 'How would {a} explain why {b} behaves this way?'] },
        behave: { l: 'Verhalten', ic: '🔁', need: 2, q: ['What does {a} do when {b} withdraws – and what does {b} do then?', 'How does {b} react when {a} brings up the topic?', 'What would {a} have to do for {b} to behave even more like they do now?'] },
        hypo: { l: 'Hypothetical', ic: '🔮', need: 1, q: ['If the problem disappeared tomorrow: who would notice first – and how?', 'Suppose {a} suddenly reacted completely differently – what would change for the others?', 'What would have to happen for the problem to get worse? What does that say about the solution?'] },
        gain: { l: 'Function', ic: '🧩', need: 1, q: ['What is the problem good for – who benefits from it staying?', 'What would the price be for {a} if the problem were solved?', 'Which role does {a} play in the system that would be missing without the problem?'] },
        outside: { l: 'Outside perspective', ic: '🪑', need: 1, q: ['What advice would a neutral person give all of you?', 'What would {a} say if they knew that {me} is answering these questions?', 'What would someone see who observes the situation for the first time – without knowing the backstory?'] }
    };
    const PATTERNS = [
        { k: 'escalate', l: 'Escalation', d: 'The more A, the more B – both reinforce each other.' },
        { k: 'pursue', l: 'Pursuit & withdrawal', d: 'One comes closer, the other withdraws – and vice versa.' },
        { k: 'coalition', l: 'Coalition', d: 'Two team up against a third.' },
        { k: 'blame', l: 'Blame', d: 'Each considers the other to be the cause.' },
        { k: 'loyal', l: 'Loyalty conflict', d: 'Someone is caught between two sides.' },
        { k: 'silent', l: 'Silence', d: 'The problem isn\'t talked about – everyone knows about it.' },
        { k: 'rescue', l: 'Rescuer role', d: 'Someone solves for others what they would have to solve themselves.' },
        { k: 'rigid', l: 'Fixed roles', d: 'Everyone knows how the other will react – and reacts to it in advance.' }
    ];
    const LINKS = [
        { m: 'Systemic coaching', l: '../systemic-coaching/systemic-coaching.html', why: 'Map out the whole system and form hypotheses.' },
        { m: 'Harvard method', l: '../harvard-method/harvard-method.html', why: 'When understanding should turn into a conversation.' },
        { m: 'Nonviolent communication', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Voice your own side without blame.' },
        { m: 'Solution focus', l: '../solution-focused/solution-focused.html', why: 'Find exceptions where the pattern doesn\'t apply.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const people = () => S.people.filter(p => p.name.trim());
    const nameOf = (id) => id === 'me' ? 'me' : (S.people.find(p => p.id === id) || {}).name || '…';
    const fill = (q, a, b) => q.replace(/\{a\}/g, nameOf(a)).replace(/\{b\}/g, nameOf(b)).replace(/\{me\}/g, 'mir');

    /* ---------- 1 ---------- */
    function renderPeople() {
        $('ci-people').innerHTML = `${S.people.map(p => `<div class="ci-person"><input class="mk-input" data-pn="${p.id}" value="${esc(p.name)}" placeholder="Name"><select class="mk-select" data-pr="${p.id}"><option value="">Rolle</option>${ROLES.map(r => `<option ${p.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select><button class="mk-iconbtn" data-px="${p.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>`).join('')}
            <button class="mk-btn mk-btn-outline mk-btn-sm" id="ci-padd"><i class="fas fa-plus"></i> Person</button>
            ${people().length >= 2 ? `<div class="mk-note ok" style="margin-top:10px"><i class="fas fa-check-circle"></i><span>${people().length} Beteiligte – genug für zirkuläre Fragen über Beziehungen.</span></div>` : '<div class="mk-note info" style="margin-top:10px"><i class="fas fa-info-circle"></i><span>At least two people (besides you) so that questions about their relationship become possible.</span></div>'}`;
        $('ci-padd').addEventListener('click', () => { S.people.push({ id: MethodKit.uid(), name: '', role: '' }); MethodKit.save(); renderPeople(); const i = $('ci-people').querySelectorAll('[data-pn]'); i[i.length - 1].focus(); });
        $('ci-people').querySelectorAll('[data-pn]').forEach(el => { el.addEventListener('input', () => { const p = S.people.find(x => x.id === el.dataset.pn); if (p) { p.name = el.value; MethodKit.save(); } }); el.addEventListener('change', renderPeople); });
        $('ci-people').querySelectorAll('[data-pr]').forEach(el => el.addEventListener('change', () => { const p = S.people.find(x => x.id === el.dataset.pr); if (p) { p.role = el.value; MethodKit.save(); } }));
        $('ci-people').querySelectorAll('[data-px]').forEach(b => b.addEventListener('click', () => { S.people = S.people.filter(x => x.id !== b.dataset.px); MethodKit.save(); renderPeople(); }));
    }

    /* ---------- 2 ---------- */
    function renderGen() {
        const P = people(); const G = S.gen;
        if (!G.type) G.type = 'view'; const T = TYPES[G.type];
        const opts = (sel, excl) => `<option value="me" ${sel === 'me' ? 'selected' : ''}>me</option>` + P.filter(p => p.id !== excl).map(p => `<option value="${p.id}" ${sel === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
        if (!G.a || (G.a !== 'me' && !P.some(p => p.id === G.a))) G.a = P[0] ? P[0].id : 'me';
        if (!G.b || G.b === G.a || (G.b !== 'me' && !P.some(p => p.id === G.b))) G.b = P.find(p => p.id !== G.a) ? P.find(p => p.id !== G.a).id : 'me';
        const qi = n(G.qi, 0) % T.q.length; const q = fill(T.q[qi], G.a, G.b);
        const asked = S.answers.some(x => x.q === q);
        $('ci-generator').innerHTML = `
            <div class="mk-chips">${Object.entries(TYPES).map(([k, t]) => `<button class="mk-chip ${G.type === k ? 'selected' : ''}" data-ty="${k}">${t.ic} ${t.l}</button>`).join('')}</div>
            ${P.length ? `<div class="ci-pair"><label>über</label><select class="mk-select" id="ci-ga">${opts(G.a)}</select>${T.need > 1 ? `<label>and</label><select class="mk-select" id="ci-gb">${opts(G.b, G.a)}</select>` : ''}</div>` : '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>Enter the people involved in step 1 – otherwise the questions stay abstract.</span></div>'}
            <div class="ci-q"><div class="ci-q-t">${esc(q)}</div><div class="ci-q-a"><button class="mk-btn mk-btn-outline mk-btn-sm" id="ci-gnext"><i class="fas fa-shuffle"></i> Different question</button>${asked ? '<span class="mk-badge">already answered</span>' : `<button class="mk-btn mk-btn-primary mk-btn-sm" id="ci-gtake"><i class="fas fa-plus"></i> Beantworten</button>`}</div></div>
            <div class="mk-faint">Answer from the perspective of the person asked – not what you believe, but what they would probably say.</div>`;
        $('ci-generator').querySelectorAll('[data-ty]').forEach(b => b.addEventListener('click', () => { G.type = b.dataset.ty; G.qi = 0; MethodKit.save(); renderGen(); }));
        const ga = $('ci-ga'); if (ga) ga.addEventListener('change', e => { G.a = e.target.value; if (G.b === G.a) G.b = ''; MethodKit.save(); renderGen(); });
        const gb = $('ci-gb'); if (gb) gb.addEventListener('change', e => { G.b = e.target.value; MethodKit.save(); renderGen(); });
        $('ci-gnext').addEventListener('click', () => { G.qi = (qi + 1) % T.q.length; MethodKit.save(); renderGen(); });
        const take = $('ci-gtake'); if (take) take.addEventListener('click', () => { S.answers.push({ id: MethodKit.uid(), type: G.type, q, a: '', about: [G.a, T.need > 1 ? G.b : null].filter(Boolean) }); MethodKit.save(); renderGen(); renderAnswers(); const t = $('ci-answers').querySelector(`[data-ans="${S.answers[S.answers.length - 1].id}"]`); if (t) { t.focus(); t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } });
    }
    function renderAnswers() {
        const A = S.answers;
        const typesUsed = new Set(A.filter(x => x.a.trim()).map(x => x.type));
        $('ci-answers').innerHTML = A.length ? A.map(x => `<div class="ci-ans"><div class="ci-ans-h"><span class="mk-badge">${TYPES[x.type] ? TYPES[x.type].ic + ' ' + TYPES[x.type].l : ''}</span><button class="mk-iconbtn" data-ax="${x.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div><div class="ci-ans-q">${esc(x.q)}</div><textarea class="mk-textarea" data-ans="${x.id}" placeholder="„…" – so würde die Person vermutlich antworten">${esc(x.a)}</textarea>${x.a.trim() && /\b(ich finde|meiner meinung|ich glaube, dass er|eigentlich sollte|müsste einfach)\b/i.test(x.a) ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Klingt nach deiner Sicht. Versuch den Satz aus dem Mund der gefragten Person – in der Ich-Form dieser Person.</span></div>' : ''}</div>`).join('') + `
            <div class="mk-note ${typesUsed.size >= 3 ? 'ok' : 'info'}"><i class="fas fa-${typesUsed.size >= 3 ? 'check-circle' : 'info-circle'}"></i><span>${A.filter(x => x.a.trim()).length} Answers from ${typesUsed.size} Question type${typesUsed.size === 1 ? '' : 'en'}.${typesUsed.size < 3 ? ' Drei verschiedene Typen bringen meist den Durchbruch – besonders „Hypothetisch" und „Funktion".' : ' Gute Vielfalt.'}</span></div>` : '<div class="mk-empty">No questions answered yet. Generate one above and click “Answer”.</div>';
        $('ci-answers').querySelectorAll('[data-ans]').forEach(el => { el.addEventListener('input', () => { const x = A.find(y => y.id === el.dataset.ans); if (x) { x.a = el.value; MethodKit.save(); } }); el.addEventListener('change', renderAnswers); });
        $('ci-answers').querySelectorAll('[data-ax]').forEach(b => b.addEventListener('click', () => { S.answers = S.answers.filter(y => y.id !== b.dataset.ax); MethodKit.save(); renderAnswers(); renderGen(); }));
        MethodKit._autosizeAll();
    }

    /* ---------- 3 ---------- */
    function renderWheel() {
        const P = [{ id: 'me', name: 'Me', role: '' }, ...people()];
        $('ci-wheel').innerHTML = P.length > 1 ? `<div class="ci-wheel">${P.map(p => { const w = S.wheel[p.id] || {}; return `<div class="ci-spoke ${p.id === 'me' ? 'me' : ''}"><div class="ci-spoke-h"><b>${esc(p.name)}</b>${p.role ? `<small>${esc(p.role)}</small>` : ''}</div><input class="mk-input" data-ws="${p.id}" data-k="view" value="${esc(w.view || '')}" placeholder="“For me, the situation is …""><input class="mk-input" data-ws="${p.id}" data-k="wish" value="${esc(w.wish || '')}" placeholder="„I would like …""></div>`; }).join('')}</div>${wheelNote(P)}` : '<div class="mk-empty">People involved are missing (step 1).</div>';
        $('ci-wheel').querySelectorAll('[data-ws]').forEach(el => { el.addEventListener('input', () => { const w = S.wheel[el.dataset.ws] || (S.wheel[el.dataset.ws] = {}); w[el.dataset.k] = el.value; MethodKit.save(); }); el.addEventListener('change', renderWheel); });
    }
    function wheelNote(P) {
        const wishes = P.map(p => (S.wheel[p.id] || {}).wish || '').filter(Boolean);
        if (wishes.length < 2) return '';
        const words = w => new Set(w.toLowerCase().match(/[a-zäöüß]{5,}/g) || []);
        let shared = 0; for (let i = 0; i < wishes.length; i++) for (let j = i + 1; j < wishes.length; j++) for (const w of words(wishes[i])) if (words(wishes[j]).has(w)) shared++;
        return shared ? `<div class="mk-note ok"><i class="fas fa-link"></i><span>The wishes overlap (${shared} shared terms). Often everyone wants the same thing – just by routes that block each other.</span></div>` : '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>The wishes sound different. Ask one level deeper: what does each person want that for? That\'s usually where they meet.</span></div>';
    }

    /* ---------- 4 ---------- */
    function renderPatterns() {
        $('ci-patterns').innerHTML = `<div class="ci-pat">${PATTERNS.map(p => `<button class="mk-option ${S.patterns.includes(p.k) ? 'selected' : ''}" data-pat="${p.k}"><span class="t">${p.l}</span><span class="d">${p.d}</span></button>`).join('')}</div>
            ${S.patterns.length ? `<div class="mk-field" style="margin-top:12px"><label for="ci-patwhere">Wo genau in deinen Antworten zeigt sich das?</label><textarea class="mk-textarea" id="ci-patwhere" placeholder="Quote an answer from above.">${esc(S.patWhere || '')}</textarea></div>` : ''}
            ${S.patterns.length >= 3 ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Drei oder mehr Muster – das System ist eng verwoben. Such das eine Muster, an dem du selbst beteiligt bist: Dort hast du den Hebel.</span></div>' : ''}`;
        $('ci-patterns').querySelectorAll('[data-pat]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.pat; S.patterns = S.patterns.includes(k) ? S.patterns.filter(x => x !== k) : [...S.patterns, k]; MethodKit.save(); renderPatterns(); }));
        const pw = $('ci-patwhere'); if (pw) pw.addEventListener('input', e => { S.patWhere = e.target.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }
    function renderLoop() {
        const P = [{ id: 'me', name: 'me' }, ...people()]; const L = S.loop;
        const sel = (k) => `<select class="mk-select" data-lp="${k}"><option value="">Who?</option>${P.map(p => `<option value="${p.id}" ${L[k] === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`;
        const ok = L.a && L.b && L.ado && L.bdo;
        $('ci-loop').innerHTML = `
            <div class="ci-loop"><div class="ci-loop-row"><span>The more</span>${sel('a')}<input class="mk-input" data-lt="ado" value="${esc(L.ado || '')}" placeholder="… does (e.g. controls)"></div>
            <div class="ci-loop-arrow"><i class="fas fa-arrow-down"></i> the more</div>
            <div class="ci-loop-row">${sel('b')}<input class="mk-input" data-lt="bdo" value="${esc(L.bdo || '')}" placeholder="… does (e.g. withdraws)"></div>
            <div class="ci-loop-arrow"><i class="fas fa-rotate-left"></i> and the more ${L.a ? esc(nameOf(L.a)) : '…'} ${esc(L.ado || '…')}</div></div>
            ${ok ? `<div class="mk-result"><h4>Die Schleife</h4>Je mehr <strong>${esc(nameOf(L.a))}</strong> ${esc(L.ado)}, the more ${esc(nameOf(L.b))} ${esc(L.bdo)} – und je mehr ${esc(nameOf(L.b))} ${esc(L.bdo)}, the more ${esc(nameOf(L.a))} ${esc(L.ado)}.<div class="mk-faint" style="margin-top:8px">${L.a === 'me' || L.b === 'me' ? 'You\'re part of the loop – good: if you change your move, the circle can\'t keep running as before.' : 'You\'re not in the loop. Ask yourself: how do you keep it running anyway – by watching, mediating, taking sides?'}</div></div>
            <div class="mk-field" style="margin-top:10px"><label for="ci-break">Wo könnte man die Schleife unterbrechen – mit dem kleinsten Schritt?</label><input class="mk-input" id="ci-break" value="${esc(S.loopBreak || '')}" placeholder="e.g. For once, don't ask – wait and see"></div>` : ''}`;
        $('ci-loop').querySelectorAll('[data-lp]').forEach(el => el.addEventListener('change', () => { L[el.dataset.lp] = el.value; MethodKit.save(); renderLoop(); }));
        $('ci-loop').querySelectorAll('[data-lt]').forEach(el => { el.addEventListener('input', () => { L[el.dataset.lt] = el.value; MethodKit.save(); }); el.addEventListener('change', renderLoop); });
        const br = $('ci-break'); if (br) br.addEventListener('input', e => { S.loopBreak = e.target.value; MethodKit.save(); });
    }

    /* ---------- 5 ---------- */
    function renderShift() {
        const before = n(S.stuck, 6), after = n(S.stuckAfter, 4); const d = before - after;
        const A = S.answers.filter(x => x.a.trim());
        $('ci-shift').innerHTML = `<div class="ci-shift"><div><b>${before}</b><span>stuck before</span></div><div class="ci-shift-arrow">${d > 0 ? '↘' : d < 0 ? '↗' : '→'}</div><div><b class="${d > 0 ? 'ok' : ''}">${after}</b><span>now</span></div></div>
            <div class="mk-note ${d >= 3 ? 'ok' : d > 0 ? 'info' : 'warn'}"><i class="fas fa-${d >= 3 ? 'check-circle' : 'info-circle'}"></i><span>${d >= 3 ? 'Deutliche Bewegung – die Perspektiven haben gewirkt.' : d > 0 ? 'Etwas gelockert. Welche Antwort hat am meisten bewegt? Dort weiterfragen.' : A.length < 3 ? 'Noch keine Bewegung – mit nur ' + A.length + ' Antworten ist das normal. Zurück zu Schritt 2, besonders zu „Hypothetisch" und „Funktion".' : 'Keine Bewegung trotz vieler Antworten. Prüf ehrlich: Hast du aus Sicht der anderen geantwortet – oder deine Sicht in ihre Worte gelegt?'}</span></div>`;
        $('ci-summary').innerHTML = A.length || S.patterns.length ? `<div class="mk-result" style="margin-top:12px"><h4>At a glance</h4><div class="ci-sum"><span>${people().length} People involved</span><span>${A.length} Answers</span><span>${S.patterns.length} Muster${S.patterns.length ? ': ' + S.patterns.map(k => (PATTERNS.find(p => p.k === k) || {}).l).join(', ') : ''}</span>${S.loop.a && S.loop.b ? `<span>Schleife ${esc(nameOf(S.loop.a))} ↔ ${esc(nameOf(S.loop.b))}</span>` : ''}</div></div>` : '';
    }
    function renderLinks() { $('ci-links').innerHTML = LINKS.map(x => `<a class="mk-option ci-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['CIRCULAR QUESTIONING', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'SITUATION', S.situation || '–', S.want ? 'I want to understand: ' + S.want : '', 'People involved: ' + (people().map(p => p.name + (p.role ? ' (' + p.role + ')' : '')).join(', ') || '–'), ''];
        L.push('QUESTIONS & ANSWERS'); S.answers.forEach(x => { L.push(`[${TYPES[x.type] ? TYPES[x.type].l : ''}] ${x.q}`); L.push('→ ' + (x.a || '–')); L.push(''); });
        const W = Object.entries(S.wheel).filter(([, w]) => w.view || w.wish); if (W.length) { L.push('PERSPECTIVE WHEEL'); W.forEach(([id, w]) => L.push(`${nameOf(id)}: ${w.view || '–'} · Wish: ${w.wish || '–'}`)); L.push(''); }
        if (S.patterns.length) L.push('PATTERNS: ' + S.patterns.map(k => (PATTERNS.find(p => p.k === k) || {}).l).join(', '), S.patWhere || '', '');
        if (S.loop.a && S.loop.b) L.push('LOOP', `The more ${nameOf(S.loop.a)} ${S.loop.ado}, the more ${nameOf(S.loop.b)} ${S.loop.bdo}.`, S.loopBreak ? 'Interrupt: ' + S.loopBreak : '', '');
        L.push('INSIGHT', S.insight || '–', S.surprise ? 'Surprised: ' + S.surprise : '', S.next ? 'Next step: ' + S.next : '', `Stuck: ${n(S.stuck, 6)} → ${n(S.stuckAfter, 4)}`);
        MethodKit.exportText('zirkulaeres-fragen.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'circular-interview', accent: '#8b5cf6', accent2: '#06b6d4',
            steps: [{ icon: '🎯', label: 'Situation' }, { icon: '🔄', label: 'Questions' }, { icon: '🎡', label: 'Perspectives' }, { icon: '🧩', label: 'Patterns' }, { icon: '💡', label: 'Insight' }],
            defaultState: { situation: '', want: '', stuck: 6, people: [], gen: { type: 'view', qi: 0, a: '', b: '' }, answers: [], wheel: {}, patterns: [], patWhere: '', loop: {}, loopBreak: '', insight: '', surprise: '', next: '', stuckAfter: 4 }
        });
        S = MethodKit.state;
        // Migration: people als String, answers als Objekt {i: text}
        if (typeof S.people === 'string') { const names = S.people.split(/[,;\n]/).map(x => x.trim()).filter(Boolean); S.people = names.map(nm => ({ id: MethodKit.uid(), name: nm, role: '' })); }
        if (!Array.isArray(S.people)) S.people = [];
        if (S.answers && !Array.isArray(S.answers)) { const OLDQ = ['How do you think the other person involved would describe the situation?', 'What does this person probably think YOU need?', 'Who suffers most from the situation – and who least?', 'If the problem disappeared tomorrow: who would notice first, and how?', 'What would have to happen for the problem to get worse?', 'What advice would a good mutual friend give you?']; S.answers = Object.entries(S.answers).filter(([, a]) => a && a.trim()).map(([i, a]) => ({ id: MethodKit.uid(), type: ['view', 'view', 'differ', 'hypo', 'hypo', 'outside'][+i] || 'view', q: OLDQ[+i] || 'Question', a, about: [] })); }
        if (!Array.isArray(S.answers)) S.answers = [];
        ['gen', 'wheel', 'loop'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; }); if (!Array.isArray(S.patterns)) S.patterns = [];
        MethodKit.bindFields();
        $('ci-export').addEventListener('click', exportAll);
        document.querySelector('[data-mk-field="stuckAfter"]').addEventListener('input', renderShift);
        MethodKit.onStep = function (k) {
            if (k === 1) renderPeople();
            if (k === 2) { renderGen(); renderAnswers(); }
            if (k === 3) renderWheel();
            if (k === 4) { renderPatterns(); renderLoop(); }
            if (k === 5) { renderShift(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
