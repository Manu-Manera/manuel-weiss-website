/* 4-Ohren-Modell (Schulz von Thun) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const SIDES = [
        { id: 'fact', ic: '📋', t: 'Factual level', c: '#0ea5e9', q: 'What does the statement inform about – purely in terms of content?', ear: 'Factual ear', earD: 'You hear facts and check: is that true? Is it relevant? Feelings and undertones slip through.', trap: 'You respond to content while the other person was after something completely different – and come across as cold or slow on the uptake.' },
        { id: 'self', ic: '🪞', t: 'Self-disclosure', c: '#8b5cf6', q: 'What does the statement reveal about the sender – their mood, values, needs?', ear: 'Self-disclosure ear', earD: 'You hear how the other person is doing: “What does that say about them?” That protects you – but can turn into diagnosing instead of listening.', trap: 'You explain to the other person what\'s going on with them instead of responding to what was said.' },
        { id: 'relation', ic: '🤝', t: 'Relationship level', c: '#ec4899', q: 'What does the statement say about how the sender relates to the receiver – and what they think of them?', ear: 'Relationship ear', earD: 'You hear: “What do they think of me? How are they treating me?” This ear is oversensitive in many people – and produces hurt where none was intended.', trap: 'You feel attacked or belittled even though it was about the facts.' },
        { id: 'appeal', ic: '👉', t: 'Appeal', c: '#f59e0b', q: 'What does the sender want to move the receiver to do? What should they do, think, stop doing?', ear: 'Appeal ear', earD: 'You hear a request in everything – and jump. That makes you helpful, but also controlled by others.', trap: 'You fulfill wishes that were never voiced, and eventually end up exhausted or angry.' }
    ];
    const QUIZ = [
        { s: 'fact', q: 'When someone says something emotional, I first correct the facts.' },
        { s: 'relation', q: 'I often wonder what someone really thinks of me when they say something factual.' },
        { s: 'appeal', q: 'When someone mentions a problem, I immediately feel responsible for solving it.' },
        { s: 'self', q: 'I quickly notice how the other person is doing – often before they say it themselves.' },
        { s: 'relation', q: 'Criticism of my work feels like criticism of me as a person.' },
        { s: 'fact', q: '“That\'s just information” – I often think or say this sentence.' },
        { s: 'appeal', q: 'I understand casual remarks (“It\'s cold in here”) as a request.' },
        { s: 'self', q: 'When someone is irritable, my first thought is “They\'re having a bad day”, not “What did I do?”' }
    ];
    const YOU = /\b(du bist|du hast|du machst|du kannst|du willst|immer|nie|ständig|typisch|weil du)\b/i;
    const PSEUDO = /\b(ignoriert|übergangen|nicht ernst genommen|angegriffen|abgewertet|missverstanden|ausgenutzt|hintergangen|im stich gelassen|manipuliert|provoziert|bevormundet)\b/i;
    const VAGUE = /\b(mehr|weniger|besser|netter|respekt|wertschätzung|verständnis|rücksicht)\b/i;
    const LINKS = [
        { m: 'Nonviolent communication', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Deepen the I-message in four steps.' },
        { m: 'Conflict escalation (Glasl)', l: '../conflict-escalation/conflict-escalation.html', why: 'When misunderstandings have turned into a conflict.' },
        { m: 'Circular questioning', l: '../circular-interview/circular-interview.html', why: 'Explore the other side\'s perspective.' },
        { m: 'Johari window', l: '../johari-window/johari-window.html', why: 'How do you come across to others – really?' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const side = (id) => SIDES.find(s => s.id === id);
    const other = () => S.who || 'the other person';
    const scores = () => { const sc = {}; SIDES.forEach(s => sc[s.id] = 0); QUIZ.forEach((q, i) => sc[q.s] += n(S.quiz[i], 0)); return sc; };
    const quizDone = () => QUIZ.every((_, i) => S.quiz[i]);
    const dominant = () => { if (!quizDone()) return null; const sc = scores(); return SIDES.reduce((a, s) => sc[s.id] > sc[a.id] ? s : a, SIDES[0]); };

    /* ---------- 1 ---------- */
    function renderRole() {
        $('co-role').innerHTML = [['sender', '🗣️', 'I said it', 'and was understood differently than I meant it'], ['receiver', '👂', 'I heard it', 'and I\'m not sure how it was meant']].map(([v, ic, t, d]) => `<button class="mk-option ${S.role === v ? 'selected' : ''}" data-role="${v}"><span class="ic">${ic}</span><span class="t">${t}</span><span class="d">${d}</span></button>`).join('');
        $('co-role').querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => { S.role = b.dataset.role; MethodKit.save(); renderRole(); renderSitNote(); }));
    }
    function renderSitNote() {
        const m = (S.message || '').trim();
        $('co-sitnote').innerHTML = !m ? '' : m.length < 12 ? note('info', 'The more literal the statement, the clearer the analysis. What exactly was said?') : /\?$/.test(m) ? note('info', 'A question – questions have four sides too. Especially the relationship and appeal sides are often stronger than the factual side in questions.') : /\b(immer|nie|schon wieder|typisch)\b/i.test(m) ? note('info', 'Words like “always”, “never”, “yet again” heavily charge the relationship side – they say more about the relationship than about the facts.') : note('ok', 'Good. In the next step you break this statement down into its four sides.');
    }

    /* ---------- 2 ---------- */
    function renderSides() {
        $('co-quote').innerHTML = S.message ? `<div class="co-quote">„${esc(S.message)}"${S.who ? `<small>${S.role === 'receiver' ? `${esc(S.who)} to me` : `me to ${esc(S.who)}`}</small>` : ''}</div>` : note('info', 'No statement in step 1 yet – the analysis gets more concrete when you use a real situation.');
        $('co-sides').innerHTML = SIDES.map(s => `<div class="co-side" style="--c:${s.c}"><div class="co-side-h"><span>${s.ic}</span><b>${s.t}</b></div><div class="hint">${s.q}</div><textarea class="mk-textarea" data-side="${s.id}" placeholder="…">${esc(S[s.id] || '')}</textarea></div>`).join('');
        $('co-sides').querySelectorAll('[data-side]').forEach(el => el.addEventListener('input', () => { S[el.dataset.side] = el.value; MethodKit.save(); }));
        MethodKit._autosizeAll();
    }
    function renderMeantHeard() {
        const chips = (key) => `<div class="mk-chips">${SIDES.map(s => `<button class="mk-chip ${S[key] === s.id ? 'selected' : ''}" data-${key}="${s.id}" style="${S[key] === s.id ? `background:${s.c};border-color:${s.c}` : ''}">${s.ic} ${s.t}</button>`).join('')}</div>`;
        $('co-meant').innerHTML = chips('meant'); $('co-heard').innerHTML = chips('heard');
        $('co-meant').querySelectorAll('[data-meant]').forEach(b => b.addEventListener('click', () => { S.meant = S.meant === b.dataset.meant ? '' : b.dataset.meant; MethodKit.save(); renderMeantHeard(); }));
        $('co-heard').querySelectorAll('[data-heard]').forEach(b => b.addEventListener('click', () => { S.heard = S.heard === b.dataset.heard ? '' : b.dataset.heard; MethodKit.save(); renderMeantHeard(); }));
        const m = side(S.meant), h = side(S.heard);
        $('co-gap').innerHTML = m && h ? (m.id === h.id ? note('ok', `Meant and heard on the same side (${m.t}). Then the misunderstanding is probably not in the ear, but in the content of this side – read your answer above once more.`) : note('warn', `<strong>Here lies the misunderstanding:</strong> what was meant was ${m.ic} <strong>${m.t}</strong>, it was heard with the ${h.ic} <strong>${h.ear}</strong>. ${h.trap} ${S.role === 'receiver' ? 'The follow-up question in step 4 resolves that.' : 'The I-message in step 4 makes the intended side explicit.'}`)) : '';
    }

    /* ---------- 3 ---------- */
    function renderQuiz() {
        $('co-quiz').innerHTML = QUIZ.map((q, i) => `<div class="co-q"><div class="co-q-t"><span>${i + 1}</span>${q.q}</div><div class="co-q-opts">${[1, 2, 3, 4, 5].map(v => `<button class="${n(S.quiz[i], 0) === v ? 'on' : ''}" data-q="${i}" data-v="${v}">${['No', 'Rather no', 'Partly', 'Rather yes', 'Yes'][v - 1]}</button>`).join('')}</div></div>`).join('');
        $('co-quiz').querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { S.quiz[b.dataset.q] = +b.dataset.v; MethodKit.save(); renderQuiz(); renderProfile(); }));
    }
    function renderProfile() {
        if (!quizDone()) { $('co-profile').innerHTML = `<div class="mk-faint" style="text-align:center">${Object.keys(S.quiz).filter(k => S.quiz[k]).length}/${QUIZ.length} answered – the profile appears once all statements are rated.</div>`; return; }
        const sc = scores(), d = dominant(), max = 10;
        const sorted = [...SIDES].sort((a, b) => sc[b.id] - sc[a.id]);
        const spread = sc[sorted[0].id] - sc[sorted[3].id];
        $('co-profile').innerHTML = `<h3>Your ear profile</h3><div class="co-ears">${SIDES.map(s => `<div class="co-ear ${d.id === s.id ? 'dom' : ''}" style="--c:${s.c}"><div class="co-ear-h"><span>${s.ic}</span><b>${s.ear}</b><small>${sc[s.id]}/${max}</small></div><div class="co-ear-bar"><i style="width:${sc[s.id] / max * 100}%"></i></div></div>`).join('')}</div>` +
            (spread <= 2 ? note('ok', 'Balanced – you listen with all four ears about equally. That\'s rare and valuable: you can choose depending on the situation.') : note('info', `Your favorite ear: ${d.ic} <strong>${d.ear}</strong>. ${d.earD}<br><br><strong>Typical trap:</strong> ${d.trap}`)) +
            (S.heard && d.id === S.heard ? note('warn', `It fits: in the situation from step 2 you listened with exactly this ear. That's no coincidence – it's your pattern.`) : '') +
            (sc[sorted[3].id] <= 3 ? note('info', `Your quietest ear: ${sorted[3].ic} <strong>${sorted[3].ear}</strong> (${sc[sorted[3].id]}/10). Deliberately practice hearing this side too: “${sorted[3].q}"`) : '');
    }

    /* ---------- 4 ---------- */
    function ibText() {
        const w = (S.ibWhen || '').trim(), f = (S.ibFeel || '').trim(), nd = (S.ibNeed || '').trim(), ws = (S.ibWish || '').trim();
        if (!w && !f && !nd && !ws) return '';
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        const strip = (s, re) => s.replace(re, '').trim();
        let out = '';
        if (w) out += cap(/^wenn/i.test(w) ? w : 'If ' + w).replace(/[.,…]+$/, '');
        if (f) out += (out ? ', ' : '') + strip(f, /^[,…\s]*(dann\s+)?/i).replace(/[.,…]+$/, '');
        if (nd) out += (out ? ', ' : '') + (/^weil/i.test(strip(nd, /^[,…\s]*/)) ? strip(nd, /^[,…\s]*/) : 'weil ' + strip(nd, /^[,…\s]*/)).replace(/[.,…]+$/, '');
        out += out ? '. ' : '';
        if (ws) { let w2 = strip(ws, /^[,…\s]*/); if (!/^ich (wünsche|möchte|bitte|brauche|würde|fände)/i.test(w2)) w2 = 'I would like' + (/^dass\b/i.test(w2) ? ', ' : ' ') + w2; out += cap(w2).replace(/[.…]+$/, '') + '.'; }
        return out.trim();
    }
    function renderIB() {
        const m = side(S.meant);
        $('co-ib-intro').innerHTML = S.role === 'sender' && m ? note('info', `You wanted to send ${m.ic} <strong>${m.t}</strong> – and it landed differently. An I-message makes the self-disclosure side explicit so that ${esc(other())} doesn't have to guess.`) : S.role === 'receiver' ? note('info', `As the receiver, you can use an I-message to say what the statement triggered in you – without attacking ${esc(other())} .`) : '';
        const f = (S.ibFeel || '').trim(), ws = (S.ibWish || '').trim(), w = (S.ibWhen || '').trim();
        const checks = [];
        if (w && YOU.test(w)) checks.push(note('warn', `“When …” contains a judgment (“${esc(w.match(YOU)[0])}”). Describe only what observably happened – like a camera.`));
        if (f && YOU.test(f)) checks.push(note('warn', 'The feeling part contains a you-message. A feeling is “I feel unsure”, not “you\'re unfair”.'));
        else if (f && PSEUDO.test(f)) checks.push(note('info', `„${esc(f.match(PSEUDO)[0])}" is a pseudo-feeling – it describes what the other person does. What do you feel about it: unsure, disappointed, annoyed?`));
        if (ws && VAGUE.test(ws) && ws.length < 50) checks.push(note('info', `„${esc(ws.match(VAGUE)[0])}" – what exactly should ${esc(other())} do? A request can be fulfilled if it could be observed.`));
        if (ws && /\b(nicht|nie|kein|aufhören|lass)\b/i.test(ws)) checks.push(note('info', 'The request is phrased negatively. What should happen instead?'));
        if (!checks.length && w && f && (S.ibNeed || '').trim() && ws) checks.push(note('ok', 'Observation, feeling, need, request – all four there, no you-message. You can say it like that.'));
        $('co-ib-check').innerHTML = checks.join('');
        $('co-ib').textContent = ibText() || '…';
    }
    function renderMeta() {
        const h = side(S.heard), m = side(S.meant);
        if (!S.message) { $('co-meta').innerHTML = note('info', 'No follow-up question without a statement from step 1.'); return; }
        const heardTxt = h ? (S[h.id] || '').trim() : '';
        const sentence = h ? `When you said “${S.message.trim()}", habe ich ${heardTxt ? `as: ${heardTxt.replace(/[.]+$/, '')}` : `vor allem ${h.t === 'Appeal' ? 'a request' : h.t === 'Relationship level' ? 'something about our relationship' : h.t === 'Factual level' ? 'the pure information' : 'something about you'} gehört`}. Is that what you meant${m && m.id !== h.id ? ` – or was it more about ${m.t === 'Appeal' ? 'something you want from me' : m.t === 'Factual level' ? 'the matter itself' : m.t === 'Relationship level' ? 'the two of us' : 'you'}` : ''}?` : '';
        $('co-meta').innerHTML = h ? `<div class="co-meta-pick"><span class="mk-faint">Heard with:</span> <span class="co-tag" style="--c:${h.c}">${h.ic} ${h.ear}</span></div><div class="mk-result"><h4>Your follow-up question</h4><div class="co-msg">${esc(sentence)}</div><div class="co-copy-row"><button class="mk-btn mk-btn-outline mk-btn-sm" id="co-copy2"><i class="fas fa-copy"></i> Copy</button></div></div>${note('info', 'The trick: you say openly which ear you heard it with. That takes the pressure off – nobody has to be right.')}` : note('info', 'In step 2, choose which ear it was heard with – the follow-up question is built from that.');
        const b = $('co-copy2'); if (b) b.addEventListener('click', () => navigator.clipboard.writeText(sentence).then(() => MethodKit.toast('Copied', 'ok')));
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        const m = side(S.meant), h = side(S.heard), d = dominant();
        $('co-summary').innerHTML = S.message ? `<div class="mk-result"><h4>Your analysis</h4><div class="co-sum"><div><b>Statement</b>„${esc(S.message)}"${S.who ? ` <span class="mk-faint">(${S.role === 'receiver' ? `${esc(S.who)} to me` : `me to ${esc(S.who)}`})</span>` : ''}</div>${SIDES.filter(s => S[s.id]).map(s => `<div style="border-left:3px solid ${s.c}"><b>${s.ic} ${s.t}</b>${esc(S[s.id])}</div>`).join('')}${m && h ? `<div><b>Missverständnis</b>Gemeint: ${m.t} · Gehört: ${h.ear}${m.id === h.id ? ' – identical' : ''}</div>` : ''}${d ? `<div><b>Mein Lieblingsohr</b>${d.ic} ${d.ear}</div>` : ''}${ibText() ? `<div><b>Ich-Botschaft</b>${esc(ibText())}</div>` : ''}${S.next ? `<div><b>Vornehmen</b>${esc(S.next)}</div>` : ''}</div></div>` : '<div class="mk-empty">The summary fills up from the previous steps.</div>';
    }
    function renderLinks() { $('co-links').innerHTML = LINKS.map(x => `<a class="mk-option co-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const m = side(S.meant), h = side(S.heard), d = dominant(), sc = scores();
        const L = ['FOUR-EARS MODEL (SCHULZ VON THUN)', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'STATEMENT: “' + (S.message || '–') + '"', S.who ? (S.role === 'receiver' ? 'From: ' : 'To: ') + S.who : '', S.context ? 'Context: ' + S.context : '', S.reaction ? 'Reaction: ' + S.reaction : '', '', 'FOUR SIDES'];
        SIDES.forEach(s => L.push(`${s.ic} ${s.t}: ${S[s.id] || '–'}`));
        if (m || h) L.push('', 'Meant: ' + (m ? m.t : '–'), 'Heard with: ' + (h ? h.ear : '–'));
        if (d) L.push('', 'EAR PROFILE', ...SIDES.map(s => `${s.ear}: ${sc[s.id]}/10`), 'Favorite ear: ' + d.ear);
        if (ibText()) L.push('', 'I-MESSAGE', ibText());
        if (S.next) L.push('', 'RESOLUTION: ' + S.next);
        MethodKit.exportText('vier-ohren.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'communication', accent: '#0ea5e9', accent2: '#6366f1',
            steps: [{ icon: '💬', label: 'Situation' }, { icon: '🔲', label: '4 sides' }, { icon: '👂', label: 'Ear profile' }, { icon: '✉️', label: 'Clearer' }, { icon: '📝', label: 'Conclusion' }],
            defaultState: { role: '', message: '', who: '', context: '', reaction: '', fact: '', self: '', relation: '', appeal: '', meant: '', heard: '', quiz: {}, ibWhen: '', ibFeel: '', ibNeed: '', ibWish: '', next: '' }
        });
        S = MethodKit.state;
        if (!S.quiz || typeof S.quiz !== 'object') S.quiz = {};
        MethodKit.bindFields();
        $('co-export').addEventListener('click', exportAll);
        $('co-copy').addEventListener('click', () => { const t = ibText(); if (t) navigator.clipboard.writeText(t).then(() => MethodKit.toast('Copied', 'ok')); });
        $('co-message').addEventListener('input', renderSitNote);
        ['co-ibwhen', 'co-ibfeel', 'co-ibneed', 'co-ibwish'].forEach(id => $(id).addEventListener('input', renderIB));
        $('co-next').addEventListener('input', renderSummary);
        MethodKit.onStep = function (k) {
            if (k === 1) { renderRole(); renderSitNote(); }
            if (k === 2) { renderSides(); renderMeantHeard(); }
            if (k === 3) { renderQuiz(); renderProfile(); }
            if (k === 4) { renderIB(); renderMeta(); }
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
