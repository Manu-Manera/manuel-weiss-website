/* Zirkuläres Fragen · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const ROLES = ['Partner:in', 'Vorgesetzte:r', 'Kolleg:in', 'Kind', 'Elternteil', 'Freund:in', 'Team', 'Kund:in'];
    /* Fragetypen: {a} = Person A, {b} = Person B, {me} = Ich */
    const TYPES = {
        differ: { l: 'Unterschiede', ic: '↔️', need: 2, q: ['Wer leidet mehr unter der Situation – {a} oder {b}? Woran merkt man das?', 'Wer von beiden, {a} oder {b}, glaubt eher an eine Lösung?', 'Wem fällt es leichter, das Thema anzusprechen – {a} oder {b}?'] },
        view: { l: 'Fremdsicht', ic: '👓', need: 2, q: ['Was glaubt {a}, wie {b} die Situation beschreiben würde?', 'Was denkt {a}, was {b} von {me} erwartet?', 'Wie würde {a} erklären, warum {b} sich so verhält?'] },
        behave: { l: 'Verhalten', ic: '🔁', need: 2, q: ['Was tut {a}, wenn {b} sich zurückzieht – und was tut {b} dann?', 'Wie reagiert {b}, wenn {a} das Thema anspricht?', 'Was müsste {a} tun, damit {b} sich noch mehr so verhält wie jetzt?'] },
        hypo: { l: 'Hypothetisch', ic: '🔮', need: 1, q: ['Wenn das Problem morgen verschwunden wäre: Wer würde es als Erstes merken – und woran?', 'Angenommen, {a} würde plötzlich ganz anders reagieren – was würde sich für die anderen ändern?', 'Was müsste passieren, damit sich das Problem verschlimmert? Was sagt das über die Lösung?'] },
        gain: { l: 'Funktion', ic: '🧩', need: 1, q: ['Wofür ist das Problem gut – wer hat einen Vorteil davon, dass es bleibt?', 'Was wäre für {a} der Preis, wenn das Problem gelöst wäre?', 'Welche Rolle spielt {a} im System, die ohne das Problem fehlen würde?'] },
        outside: { l: 'Aussensicht', ic: '🪑', need: 1, q: ['Welchen Rat würde eine neutrale Person euch allen geben?', 'Was würde {a} sagen, wenn sie wüsste, dass {me} diese Fragen beantwortet?', 'Was würde jemand sehen, der die Situation zum ersten Mal beobachtet – ohne die Vorgeschichte zu kennen?'] }
    };
    const PATTERNS = [
        { k: 'escalate', l: 'Eskalation', d: 'Je mehr A, desto mehr B – beide verstärken sich.' },
        { k: 'pursue', l: 'Verfolgen & Rückzug', d: 'Einer kommt näher, der andere zieht sich zurück – und umgekehrt.' },
        { k: 'coalition', l: 'Koalition', d: 'Zwei verbünden sich gegen eine:n Dritte:n.' },
        { k: 'blame', l: 'Schuldzuweisung', d: 'Jeder hält den anderen für die Ursache.' },
        { k: 'loyal', l: 'Loyalitätskonflikt', d: 'Jemand steht zwischen zwei Seiten.' },
        { k: 'silent', l: 'Schweigen', d: 'Das Problem wird nicht angesprochen – alle wissen davon.' },
        { k: 'rescue', l: 'Retter-Rolle', d: 'Jemand löst für andere, was diese selbst lösen müssten.' },
        { k: 'rigid', l: 'Festgelegte Rollen', d: 'Jeder weiss, wie der andere reagiert – und reagiert vorher schon darauf.' }
    ];
    const LINKS = [
        { m: 'Systemisches Coaching', l: '../systemic-coaching/systemic-coaching.html', why: 'Das ganze System aufstellen und Hypothesen bilden.' },
        { m: 'Harvard-Methode', l: '../harvard-method/harvard-method.html', why: 'Wenn aus Verstehen ein Gespräch werden soll.' },
        { m: 'Gewaltfreie Kommunikation', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Die eigene Seite ohne Vorwurf aussprechen.' },
        { m: 'Lösungsfokus', l: '../solution-focused/solution-focused.html', why: 'Ausnahmen finden, in denen das Muster nicht greift.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const people = () => S.people.filter(p => p.name.trim());
    const nameOf = (id) => id === 'me' ? 'ich' : (S.people.find(p => p.id === id) || {}).name || '…';
    const fill = (q, a, b) => q.replace(/\{a\}/g, nameOf(a)).replace(/\{b\}/g, nameOf(b)).replace(/\{me\}/g, 'mir');

    /* ---------- 1 ---------- */
    function renderPeople() {
        $('ci-people').innerHTML = `${S.people.map(p => `<div class="ci-person"><input class="mk-input" data-pn="${p.id}" value="${esc(p.name)}" placeholder="Name"><select class="mk-select" data-pr="${p.id}"><option value="">Rolle</option>${ROLES.map(r => `<option ${p.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select><button class="mk-iconbtn" data-px="${p.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('')}
            <button class="mk-btn mk-btn-outline mk-btn-sm" id="ci-padd"><i class="fas fa-plus"></i> Person</button>
            ${people().length >= 2 ? `<div class="mk-note ok" style="margin-top:10px"><i class="fas fa-check-circle"></i><span>${people().length} Beteiligte – genug für zirkuläre Fragen über Beziehungen.</span></div>` : '<div class="mk-note info" style="margin-top:10px"><i class="fas fa-info-circle"></i><span>Mindestens zwei Personen (ausser dir), damit Fragen über ihre Beziehung möglich werden.</span></div>'}`;
        $('ci-padd').addEventListener('click', () => { S.people.push({ id: MethodKit.uid(), name: '', role: '' }); MethodKit.save(); renderPeople(); const i = $('ci-people').querySelectorAll('[data-pn]'); i[i.length - 1].focus(); });
        $('ci-people').querySelectorAll('[data-pn]').forEach(el => { el.addEventListener('input', () => { const p = S.people.find(x => x.id === el.dataset.pn); if (p) { p.name = el.value; MethodKit.save(); } }); el.addEventListener('change', renderPeople); });
        $('ci-people').querySelectorAll('[data-pr]').forEach(el => el.addEventListener('change', () => { const p = S.people.find(x => x.id === el.dataset.pr); if (p) { p.role = el.value; MethodKit.save(); } }));
        $('ci-people').querySelectorAll('[data-px]').forEach(b => b.addEventListener('click', () => { S.people = S.people.filter(x => x.id !== b.dataset.px); MethodKit.save(); renderPeople(); }));
    }

    /* ---------- 2 ---------- */
    function renderGen() {
        const P = people(); const G = S.gen;
        if (!G.type) G.type = 'view'; const T = TYPES[G.type];
        const opts = (sel, excl) => `<option value="me" ${sel === 'me' ? 'selected' : ''}>ich</option>` + P.filter(p => p.id !== excl).map(p => `<option value="${p.id}" ${sel === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
        if (!G.a || (G.a !== 'me' && !P.some(p => p.id === G.a))) G.a = P[0] ? P[0].id : 'me';
        if (!G.b || G.b === G.a || (G.b !== 'me' && !P.some(p => p.id === G.b))) G.b = P.find(p => p.id !== G.a) ? P.find(p => p.id !== G.a).id : 'me';
        const qi = n(G.qi, 0) % T.q.length; const q = fill(T.q[qi], G.a, G.b);
        const asked = S.answers.some(x => x.q === q);
        $('ci-generator').innerHTML = `
            <div class="mk-chips">${Object.entries(TYPES).map(([k, t]) => `<button class="mk-chip ${G.type === k ? 'selected' : ''}" data-ty="${k}">${t.ic} ${t.l}</button>`).join('')}</div>
            ${P.length ? `<div class="ci-pair"><label>über</label><select class="mk-select" id="ci-ga">${opts(G.a)}</select>${T.need > 1 ? `<label>und</label><select class="mk-select" id="ci-gb">${opts(G.b, G.a)}</select>` : ''}</div>` : '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>Trag in Schritt 1 Beteiligte ein – sonst bleiben die Fragen abstrakt.</span></div>'}
            <div class="ci-q"><div class="ci-q-t">${esc(q)}</div><div class="ci-q-a"><button class="mk-btn mk-btn-outline mk-btn-sm" id="ci-gnext"><i class="fas fa-shuffle"></i> Andere Frage</button>${asked ? '<span class="mk-badge">schon beantwortet</span>' : `<button class="mk-btn mk-btn-primary mk-btn-sm" id="ci-gtake"><i class="fas fa-plus"></i> Beantworten</button>`}</div></div>
            <div class="mk-faint">Antworte aus Sicht der gefragten Person – nicht, was du glaubst, sondern was sie vermutlich sagen würde.</div>`;
        $('ci-generator').querySelectorAll('[data-ty]').forEach(b => b.addEventListener('click', () => { G.type = b.dataset.ty; G.qi = 0; MethodKit.save(); renderGen(); }));
        const ga = $('ci-ga'); if (ga) ga.addEventListener('change', e => { G.a = e.target.value; if (G.b === G.a) G.b = ''; MethodKit.save(); renderGen(); });
        const gb = $('ci-gb'); if (gb) gb.addEventListener('change', e => { G.b = e.target.value; MethodKit.save(); renderGen(); });
        $('ci-gnext').addEventListener('click', () => { G.qi = (qi + 1) % T.q.length; MethodKit.save(); renderGen(); });
        const take = $('ci-gtake'); if (take) take.addEventListener('click', () => { S.answers.push({ id: MethodKit.uid(), type: G.type, q, a: '', about: [G.a, T.need > 1 ? G.b : null].filter(Boolean) }); MethodKit.save(); renderGen(); renderAnswers(); const t = $('ci-answers').querySelector(`[data-ans="${S.answers[S.answers.length - 1].id}"]`); if (t) { t.focus(); t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } });
    }
    function renderAnswers() {
        const A = S.answers;
        const typesUsed = new Set(A.filter(x => x.a.trim()).map(x => x.type));
        $('ci-answers').innerHTML = A.length ? A.map(x => `<div class="ci-ans"><div class="ci-ans-h"><span class="mk-badge">${TYPES[x.type] ? TYPES[x.type].ic + ' ' + TYPES[x.type].l : ''}</span><button class="mk-iconbtn" data-ax="${x.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div><div class="ci-ans-q">${esc(x.q)}</div><textarea class="mk-textarea" data-ans="${x.id}" placeholder="„…" – so würde die Person vermutlich antworten">${esc(x.a)}</textarea>${x.a.trim() && /\b(ich finde|meiner meinung|ich glaube, dass er|eigentlich sollte|müsste einfach)\b/i.test(x.a) ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Klingt nach deiner Sicht. Versuch den Satz aus dem Mund der gefragten Person – in der Ich-Form dieser Person.</span></div>' : ''}</div>`).join('') + `
            <div class="mk-note ${typesUsed.size >= 3 ? 'ok' : 'info'}"><i class="fas fa-${typesUsed.size >= 3 ? 'check-circle' : 'info-circle'}"></i><span>${A.filter(x => x.a.trim()).length} Antworten aus ${typesUsed.size} Fragetyp${typesUsed.size === 1 ? '' : 'en'}.${typesUsed.size < 3 ? ' Drei verschiedene Typen bringen meist den Durchbruch – besonders „Hypothetisch" und „Funktion".' : ' Gute Vielfalt.'}</span></div>` : '<div class="mk-empty">Noch keine Fragen beantwortet. Oben eine erzeugen und „Beantworten" klicken.</div>';
        $('ci-answers').querySelectorAll('[data-ans]').forEach(el => { el.addEventListener('input', () => { const x = A.find(y => y.id === el.dataset.ans); if (x) { x.a = el.value; MethodKit.save(); } }); el.addEventListener('change', renderAnswers); });
        $('ci-answers').querySelectorAll('[data-ax]').forEach(b => b.addEventListener('click', () => { S.answers = S.answers.filter(y => y.id !== b.dataset.ax); MethodKit.save(); renderAnswers(); renderGen(); }));
        MethodKit._autosizeAll();
    }

    /* ---------- 3 ---------- */
    function renderWheel() {
        const P = [{ id: 'me', name: 'Ich', role: '' }, ...people()];
        $('ci-wheel').innerHTML = P.length > 1 ? `<div class="ci-wheel">${P.map(p => { const w = S.wheel[p.id] || {}; return `<div class="ci-spoke ${p.id === 'me' ? 'me' : ''}"><div class="ci-spoke-h"><b>${esc(p.name)}</b>${p.role ? `<small>${esc(p.role)}</small>` : ''}</div><input class="mk-input" data-ws="${p.id}" data-k="view" value="${esc(w.view || '')}" placeholder="„Für mich ist die Situation …""><input class="mk-input" data-ws="${p.id}" data-k="wish" value="${esc(w.wish || '')}" placeholder="„Ich wünsche mir …""></div>`; }).join('')}</div>${wheelNote(P)}` : '<div class="mk-empty">Beteiligte fehlen (Schritt 1).</div>';
        $('ci-wheel').querySelectorAll('[data-ws]').forEach(el => { el.addEventListener('input', () => { const w = S.wheel[el.dataset.ws] || (S.wheel[el.dataset.ws] = {}); w[el.dataset.k] = el.value; MethodKit.save(); }); el.addEventListener('change', renderWheel); });
    }
    function wheelNote(P) {
        const wishes = P.map(p => (S.wheel[p.id] || {}).wish || '').filter(Boolean);
        if (wishes.length < 2) return '';
        const words = w => new Set(w.toLowerCase().match(/[a-zäöüß]{5,}/g) || []);
        let shared = 0; for (let i = 0; i < wishes.length; i++) for (let j = i + 1; j < wishes.length; j++) for (const w of words(wishes[i])) if (words(wishes[j]).has(w)) shared++;
        return shared ? `<div class="mk-note ok"><i class="fas fa-link"></i><span>Die Wünsche überschneiden sich (${shared} gemeinsame Begriffe). Oft wollen alle dasselbe – nur auf Wegen, die sich gegenseitig blockieren.</span></div>` : '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Die Wünsche klingen verschieden. Frag eine Ebene tiefer: Wozu will jede:r das? Dort treffen sie sich meist.</span></div>';
    }

    /* ---------- 4 ---------- */
    function renderPatterns() {
        $('ci-patterns').innerHTML = `<div class="ci-pat">${PATTERNS.map(p => `<button class="mk-option ${S.patterns.includes(p.k) ? 'selected' : ''}" data-pat="${p.k}"><span class="t">${p.l}</span><span class="d">${p.d}</span></button>`).join('')}</div>
            ${S.patterns.length ? `<div class="mk-field" style="margin-top:12px"><label for="ci-patwhere">Wo genau in deinen Antworten zeigt sich das?</label><textarea class="mk-textarea" id="ci-patwhere" placeholder="Zitiere eine Antwort von oben.">${esc(S.patWhere || '')}</textarea></div>` : ''}
            ${S.patterns.length >= 3 ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Drei oder mehr Muster – das System ist eng verwoben. Such das eine Muster, an dem du selbst beteiligt bist: Dort hast du den Hebel.</span></div>' : ''}`;
        $('ci-patterns').querySelectorAll('[data-pat]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.pat; S.patterns = S.patterns.includes(k) ? S.patterns.filter(x => x !== k) : [...S.patterns, k]; MethodKit.save(); renderPatterns(); }));
        const pw = $('ci-patwhere'); if (pw) pw.addEventListener('input', e => { S.patWhere = e.target.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }
    function renderLoop() {
        const P = [{ id: 'me', name: 'ich' }, ...people()]; const L = S.loop;
        const sel = (k) => `<select class="mk-select" data-lp="${k}"><option value="">Wer?</option>${P.map(p => `<option value="${p.id}" ${L[k] === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`;
        const ok = L.a && L.b && L.ado && L.bdo;
        $('ci-loop').innerHTML = `
            <div class="ci-loop"><div class="ci-loop-row"><span>Je mehr</span>${sel('a')}<input class="mk-input" data-lt="ado" value="${esc(L.ado || '')}" placeholder="… tut (z. B. kontrolliert)"></div>
            <div class="ci-loop-arrow"><i class="fas fa-arrow-down"></i> desto mehr</div>
            <div class="ci-loop-row">${sel('b')}<input class="mk-input" data-lt="bdo" value="${esc(L.bdo || '')}" placeholder="… tut (z. B. zieht sich zurück)"></div>
            <div class="ci-loop-arrow"><i class="fas fa-rotate-left"></i> und desto mehr ${L.a ? esc(nameOf(L.a)) : '…'} ${esc(L.ado || '…')}</div></div>
            ${ok ? `<div class="mk-result"><h4>Die Schleife</h4>Je mehr <strong>${esc(nameOf(L.a))}</strong> ${esc(L.ado)}, desto mehr ${esc(nameOf(L.b))} ${esc(L.bdo)} – und je mehr ${esc(nameOf(L.b))} ${esc(L.bdo)}, desto mehr ${esc(nameOf(L.a))} ${esc(L.ado)}.<div class="mk-faint" style="margin-top:8px">${L.a === 'me' || L.b === 'me' ? 'Du bist Teil der Schleife – gut: Wenn du deinen Zug änderst, kann der Kreis nicht weiterlaufen wie bisher.' : 'Du bist nicht in der Schleife. Frag dich: Wie hältst du sie trotzdem am Laufen – durch Zuschauen, Vermitteln, Partei ergreifen?'}</div></div>
            <div class="mk-field" style="margin-top:10px"><label for="ci-break">Wo könnte man die Schleife unterbrechen – mit dem kleinsten Schritt?</label><input class="mk-input" id="ci-break" value="${esc(S.loopBreak || '')}" placeholder="z. B. Einmal nicht nachfragen, sondern abwarten"></div>` : ''}`;
        $('ci-loop').querySelectorAll('[data-lp]').forEach(el => el.addEventListener('change', () => { L[el.dataset.lp] = el.value; MethodKit.save(); renderLoop(); }));
        $('ci-loop').querySelectorAll('[data-lt]').forEach(el => { el.addEventListener('input', () => { L[el.dataset.lt] = el.value; MethodKit.save(); }); el.addEventListener('change', renderLoop); });
        const br = $('ci-break'); if (br) br.addEventListener('input', e => { S.loopBreak = e.target.value; MethodKit.save(); });
    }

    /* ---------- 5 ---------- */
    function renderShift() {
        const before = n(S.stuck, 6), after = n(S.stuckAfter, 4); const d = before - after;
        const A = S.answers.filter(x => x.a.trim());
        $('ci-shift').innerHTML = `<div class="ci-shift"><div><b>${before}</b><span>festgefahren vorher</span></div><div class="ci-shift-arrow">${d > 0 ? '↘' : d < 0 ? '↗' : '→'}</div><div><b class="${d > 0 ? 'ok' : ''}">${after}</b><span>jetzt</span></div></div>
            <div class="mk-note ${d >= 3 ? 'ok' : d > 0 ? 'info' : 'warn'}"><i class="fas fa-${d >= 3 ? 'check-circle' : 'info-circle'}"></i><span>${d >= 3 ? 'Deutliche Bewegung – die Perspektiven haben gewirkt.' : d > 0 ? 'Etwas gelockert. Welche Antwort hat am meisten bewegt? Dort weiterfragen.' : A.length < 3 ? 'Noch keine Bewegung – mit nur ' + A.length + ' Antworten ist das normal. Zurück zu Schritt 2, besonders zu „Hypothetisch" und „Funktion".' : 'Keine Bewegung trotz vieler Antworten. Prüf ehrlich: Hast du aus Sicht der anderen geantwortet – oder deine Sicht in ihre Worte gelegt?'}</span></div>`;
        $('ci-summary').innerHTML = A.length || S.patterns.length ? `<div class="mk-result" style="margin-top:12px"><h4>Auf einen Blick</h4><div class="ci-sum"><span>${people().length} Beteiligte</span><span>${A.length} Antworten</span><span>${S.patterns.length} Muster${S.patterns.length ? ': ' + S.patterns.map(k => (PATTERNS.find(p => p.k === k) || {}).l).join(', ') : ''}</span>${S.loop.a && S.loop.b ? `<span>Schleife ${esc(nameOf(S.loop.a))} ↔ ${esc(nameOf(S.loop.b))}</span>` : ''}</div></div>` : '';
    }
    function renderLinks() { $('ci-links').innerHTML = LINKS.map(x => `<a class="mk-option ci-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['ZIRKULÄRES FRAGEN', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'SITUATION', S.situation || '–', S.want ? 'Verstehen will ich: ' + S.want : '', 'Beteiligte: ' + (people().map(p => p.name + (p.role ? ' (' + p.role + ')' : '')).join(', ') || '–'), ''];
        L.push('FRAGEN & ANTWORTEN'); S.answers.forEach(x => { L.push(`[${TYPES[x.type] ? TYPES[x.type].l : ''}] ${x.q}`); L.push('→ ' + (x.a || '–')); L.push(''); });
        const W = Object.entries(S.wheel).filter(([, w]) => w.view || w.wish); if (W.length) { L.push('PERSPEKTIVEN-RAD'); W.forEach(([id, w]) => L.push(`${nameOf(id)}: ${w.view || '–'} · Wunsch: ${w.wish || '–'}`)); L.push(''); }
        if (S.patterns.length) L.push('MUSTER: ' + S.patterns.map(k => (PATTERNS.find(p => p.k === k) || {}).l).join(', '), S.patWhere || '', '');
        if (S.loop.a && S.loop.b) L.push('SCHLEIFE', `Je mehr ${nameOf(S.loop.a)} ${S.loop.ado}, desto mehr ${nameOf(S.loop.b)} ${S.loop.bdo}.`, S.loopBreak ? 'Unterbrechen: ' + S.loopBreak : '', '');
        L.push('ERKENNTNIS', S.insight || '–', S.surprise ? 'Überrascht: ' + S.surprise : '', S.next ? 'Nächster Schritt: ' + S.next : '', `Festgefahren: ${n(S.stuck, 6)} → ${n(S.stuckAfter, 4)}`);
        MethodKit.exportText('zirkulaeres-fragen.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'circular-interview', accent: '#8b5cf6', accent2: '#06b6d4',
            steps: [{ icon: '🎯', label: 'Situation' }, { icon: '🔄', label: 'Fragen' }, { icon: '🎡', label: 'Perspektiven' }, { icon: '🧩', label: 'Muster' }, { icon: '💡', label: 'Erkenntnis' }],
            defaultState: { situation: '', want: '', stuck: 6, people: [], gen: { type: 'view', qi: 0, a: '', b: '' }, answers: [], wheel: {}, patterns: [], patWhere: '', loop: {}, loopBreak: '', insight: '', surprise: '', next: '', stuckAfter: 4 }
        });
        S = MethodKit.state;
        // Migration: people als String, answers als Objekt {i: text}
        if (typeof S.people === 'string') { const names = S.people.split(/[,;\n]/).map(x => x.trim()).filter(Boolean); S.people = names.map(nm => ({ id: MethodKit.uid(), name: nm, role: '' })); }
        if (!Array.isArray(S.people)) S.people = [];
        if (S.answers && !Array.isArray(S.answers)) { const OLDQ = ['Was glaubst du, wie die andere beteiligte Person die Situation beschreiben würde?', 'Was denkt diese Person wohl, was DU brauchst?', 'Wer leidet am meisten unter der Situation – und wer am wenigsten?', 'Wenn das Problem morgen verschwunden wäre: Wer würde es als Erstes merken, woran?', 'Was müsste passieren, damit sich das Problem verschlimmert?', 'Welchen Rat würde ein:e gemeinsame:r guter Freund:in euch geben?']; S.answers = Object.entries(S.answers).filter(([, a]) => a && a.trim()).map(([i, a]) => ({ id: MethodKit.uid(), type: ['view', 'view', 'differ', 'hypo', 'hypo', 'outside'][+i] || 'view', q: OLDQ[+i] || 'Frage', a, about: [] })); }
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
