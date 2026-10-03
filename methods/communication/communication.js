/* 4-Ohren-Modell (Schulz von Thun) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const SIDES = [
        { id: 'fact', ic: '📋', t: 'Sachebene', c: '#0ea5e9', q: 'Worüber informiert die Aussage – rein inhaltlich?', ear: 'Sach-Ohr', earD: 'Du hörst Fakten und prüfst: Stimmt das? Ist das relevant? Gefühle und Zwischentöne rutschen durch.', trap: 'Du reagierst auf Inhalte, während es dem anderen um etwas ganz anderes ging – und wirkst kühl oder begriffsstutzig.' },
        { id: 'self', ic: '🪞', t: 'Selbstoffenbarung', c: '#8b5cf6', q: 'Was verrät die Aussage über den Sender – seine Stimmung, Werte, Bedürfnisse?', ear: 'Selbstoffenbarungs-Ohr', earD: 'Du hörst, wie es dem anderen geht: „Was sagt das über ihn aus?" Das schützt dich – kann aber auch zum Diagnostizieren statt Zuhören werden.', trap: 'Du erklärst dem anderen, was mit ihm los ist, statt auf das Gesagte einzugehen.' },
        { id: 'relation', ic: '🤝', t: 'Beziehungsebene', c: '#ec4899', q: 'Was sagt die Aussage darüber, wie der Sender zum Empfänger steht – und was er von ihm hält?', ear: 'Beziehungs-Ohr', earD: 'Du hörst: „Was hält er von mir? Wie behandelt er mich?" Dieses Ohr ist bei vielen überempfindlich – und produziert Kränkung, wo keine gemeint war.', trap: 'Du fühlst dich angegriffen oder abgewertet, obwohl es um die Sache ging.' },
        { id: 'appeal', ic: '👉', t: 'Appell', c: '#f59e0b', q: 'Wozu will der Sender den Empfänger bewegen? Was soll er tun, denken, lassen?', ear: 'Appell-Ohr', earD: 'Du hörst in allem eine Aufforderung – und springst. Das macht dich hilfsbereit, aber auch fremdbestimmt.', trap: 'Du erfüllst Wünsche, die nie geäussert wurden, und bist irgendwann erschöpft oder sauer.' }
    ];
    const QUIZ = [
        { s: 'fact', q: 'Wenn jemand etwas Emotionales sagt, korrigiere ich erst mal die Fakten.' },
        { s: 'relation', q: 'Ich frage mich oft, was jemand wirklich von mir hält, wenn er etwas Sachliches sagt.' },
        { s: 'appeal', q: 'Wenn jemand ein Problem erwähnt, fühle ich mich sofort zuständig, es zu lösen.' },
        { s: 'self', q: 'Ich merke schnell, wie es meinem Gegenüber geht – oft bevor er es selbst sagt.' },
        { s: 'relation', q: 'Kritik an meiner Arbeit fühlt sich an wie Kritik an mir als Person.' },
        { s: 'fact', q: '„Das ist doch nur eine Information" – diesen Satz denke oder sage ich häufig.' },
        { s: 'appeal', q: 'Beiläufige Bemerkungen („Es ist kalt hier") verstehe ich als Aufforderung.' },
        { s: 'self', q: 'Wenn jemand gereizt ist, denke ich zuerst: „Der hat einen schlechten Tag", nicht: „Was habe ich getan?"' }
    ];
    const YOU = /\b(du bist|du hast|du machst|du kannst|du willst|immer|nie|ständig|typisch|weil du)\b/i;
    const PSEUDO = /\b(ignoriert|übergangen|nicht ernst genommen|angegriffen|abgewertet|missverstanden|ausgenutzt|hintergangen|im stich gelassen|manipuliert|provoziert|bevormundet)\b/i;
    const VAGUE = /\b(mehr|weniger|besser|netter|respekt|wertschätzung|verständnis|rücksicht)\b/i;
    const LINKS = [
        { m: 'Gewaltfreie Kommunikation', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Die Ich-Botschaft in vier Schritten vertiefen.' },
        { m: 'Konflikteskalation (Glasl)', l: '../conflict-escalation/conflict-escalation.html', why: 'Wenn aus Missverständnissen ein Konflikt wurde.' },
        { m: 'Zirkuläres Fragen', l: '../circular-interview/circular-interview.html', why: 'Die Perspektive der anderen Seite erkunden.' },
        { m: 'Johari-Fenster', l: '../johari-window/johari-window.html', why: 'Wie wirkst du auf andere – wirklich?' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const side = (id) => SIDES.find(s => s.id === id);
    const other = () => S.who || 'die andere Person';
    const scores = () => { const sc = {}; SIDES.forEach(s => sc[s.id] = 0); QUIZ.forEach((q, i) => sc[q.s] += n(S.quiz[i], 0)); return sc; };
    const quizDone = () => QUIZ.every((_, i) => S.quiz[i]);
    const dominant = () => { if (!quizDone()) return null; const sc = scores(); return SIDES.reduce((a, s) => sc[s.id] > sc[a.id] ? s : a, SIDES[0]); };

    /* ---------- 1 ---------- */
    function renderRole() {
        $('co-role').innerHTML = [['sender', '🗣️', 'Ich habe es gesagt', 'und wurde anders verstanden, als ich es meinte'], ['receiver', '👂', 'Ich habe es gehört', 'und bin mir nicht sicher, wie es gemeint war']].map(([v, ic, t, d]) => `<button class="mk-option ${S.role === v ? 'selected' : ''}" data-role="${v}"><span class="ic">${ic}</span><span class="t">${t}</span><span class="d">${d}</span></button>`).join('');
        $('co-role').querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => { S.role = b.dataset.role; MethodKit.save(); renderRole(); renderSitNote(); }));
    }
    function renderSitNote() {
        const m = (S.message || '').trim();
        $('co-sitnote').innerHTML = !m ? '' : m.length < 12 ? note('info', 'Je wörtlicher die Aussage, desto klarer wird die Analyse. Was wurde genau gesagt?') : /\?$/.test(m) ? note('info', 'Eine Frage – auch Fragen haben vier Seiten. Besonders die Beziehungs- und Appellseite sind bei Fragen oft stärker als die Sachseite.') : /\b(immer|nie|schon wieder|typisch)\b/i.test(m) ? note('info', 'Wörter wie „immer", „nie", „schon wieder" laden die Beziehungsseite stark auf – sie sagen mehr über die Beziehung als über die Sache.') : note('ok', 'Gut. Im nächsten Schritt zerlegst du diese Aussage auf ihre vier Seiten.');
    }

    /* ---------- 2 ---------- */
    function renderSides() {
        $('co-quote').innerHTML = S.message ? `<div class="co-quote">„${esc(S.message)}"${S.who ? `<small>${S.role === 'receiver' ? `${esc(S.who)} zu mir` : `ich zu ${esc(S.who)}`}</small>` : ''}</div>` : note('info', 'Noch keine Aussage in Schritt 1 – die Analyse wird konkreter, wenn du eine echte Situation nimmst.');
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
        $('co-gap').innerHTML = m && h ? (m.id === h.id ? note('ok', `Gemeint und gehört auf derselben Seite (${m.t}). Dann liegt das Missverständnis vermutlich nicht im Ohr, sondern im Inhalt dieser Seite – lies deine Antwort oben noch einmal.`) : note('warn', `<strong>Hier liegt das Missverständnis:</strong> gemeint war ${m.ic} <strong>${m.t}</strong>, gehört wurde mit dem ${h.ic} <strong>${h.ear}</strong>. ${h.trap} ${S.role === 'receiver' ? 'Die Nachfrage in Schritt 4 löst das auf.' : 'Die Ich-Botschaft in Schritt 4 macht die gemeinte Seite explizit.'}`)) : '';
    }

    /* ---------- 3 ---------- */
    function renderQuiz() {
        $('co-quiz').innerHTML = QUIZ.map((q, i) => `<div class="co-q"><div class="co-q-t"><span>${i + 1}</span>${q.q}</div><div class="co-q-opts">${[1, 2, 3, 4, 5].map(v => `<button class="${n(S.quiz[i], 0) === v ? 'on' : ''}" data-q="${i}" data-v="${v}">${['Nein', 'Eher nein', 'Teils', 'Eher ja', 'Ja'][v - 1]}</button>`).join('')}</div></div>`).join('');
        $('co-quiz').querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { S.quiz[b.dataset.q] = +b.dataset.v; MethodKit.save(); renderQuiz(); renderProfile(); }));
    }
    function renderProfile() {
        if (!quizDone()) { $('co-profile').innerHTML = `<div class="mk-faint" style="text-align:center">${Object.keys(S.quiz).filter(k => S.quiz[k]).length}/${QUIZ.length} beantwortet – das Profil erscheint, wenn alle Aussagen bewertet sind.</div>`; return; }
        const sc = scores(), d = dominant(), max = 10;
        const sorted = [...SIDES].sort((a, b) => sc[b.id] - sc[a.id]);
        const spread = sc[sorted[0].id] - sc[sorted[3].id];
        $('co-profile').innerHTML = `<h3>Dein Ohren-Profil</h3><div class="co-ears">${SIDES.map(s => `<div class="co-ear ${d.id === s.id ? 'dom' : ''}" style="--c:${s.c}"><div class="co-ear-h"><span>${s.ic}</span><b>${s.ear}</b><small>${sc[s.id]}/${max}</small></div><div class="co-ear-bar"><i style="width:${sc[s.id] / max * 100}%"></i></div></div>`).join('')}</div>` +
            (spread <= 2 ? note('ok', 'Ausgewogen – du hörst auf allen vier Ohren ähnlich stark. Das ist selten und wertvoll: Du kannst situativ wählen.') : note('info', `Dein Lieblingsohr: ${d.ic} <strong>${d.ear}</strong>. ${d.earD}<br><br><strong>Typische Falle:</strong> ${d.trap}`)) +
            (S.heard && d.id === S.heard ? note('warn', `Passt zusammen: In der Situation aus Schritt 2 hast du mit genau diesem Ohr gehört. Das ist kein Zufall – es ist dein Muster.`) : '') +
            (sc[sorted[3].id] <= 3 ? note('info', `Dein leisestes Ohr: ${sorted[3].ic} <strong>${sorted[3].ear}</strong> (${sc[sorted[3].id]}/10). Übe bewusst, diese Seite mitzuhören: „${sorted[3].q}"`) : '');
    }

    /* ---------- 4 ---------- */
    function ibText() {
        const w = (S.ibWhen || '').trim(), f = (S.ibFeel || '').trim(), nd = (S.ibNeed || '').trim(), ws = (S.ibWish || '').trim();
        if (!w && !f && !nd && !ws) return '';
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        const strip = (s, re) => s.replace(re, '').trim();
        let out = '';
        if (w) out += cap(/^wenn/i.test(w) ? w : 'Wenn ' + w).replace(/[.,…]+$/, '');
        if (f) out += (out ? ', ' : '') + strip(f, /^[,…\s]*(dann\s+)?/i).replace(/[.,…]+$/, '');
        if (nd) out += (out ? ', ' : '') + (/^weil/i.test(strip(nd, /^[,…\s]*/)) ? strip(nd, /^[,…\s]*/) : 'weil ' + strip(nd, /^[,…\s]*/)).replace(/[.,…]+$/, '');
        out += out ? '. ' : '';
        if (ws) { let w2 = strip(ws, /^[,…\s]*/); if (!/^ich (wünsche|möchte|bitte|brauche|würde|fände)/i.test(w2)) w2 = 'Ich wünsche mir' + (/^dass\b/i.test(w2) ? ', ' : ' ') + w2; out += cap(w2).replace(/[.…]+$/, '') + '.'; }
        return out.trim();
    }
    function renderIB() {
        const m = side(S.meant);
        $('co-ib-intro').innerHTML = S.role === 'sender' && m ? note('info', `Du wolltest ${m.ic} <strong>${m.t}</strong> senden – und es kam anders an. Eine Ich-Botschaft macht die Selbstoffenbarungs-Seite explizit, damit ${esc(other())} nicht raten muss.`) : S.role === 'receiver' ? note('info', `Als Empfänger kannst du mit einer Ich-Botschaft sagen, was die Aussage bei dir ausgelöst hat – ohne ${esc(other())} anzugreifen.`) : '';
        const f = (S.ibFeel || '').trim(), ws = (S.ibWish || '').trim(), w = (S.ibWhen || '').trim();
        const checks = [];
        if (w && YOU.test(w)) checks.push(note('warn', `„Wenn …" enthält eine Bewertung („${esc(w.match(YOU)[0])}"). Beschreib nur, was beobachtbar passiert ist – wie eine Kamera.`));
        if (f && YOU.test(f)) checks.push(note('warn', 'Im Gefühls-Teil steckt eine Du-Botschaft. Ein Gefühl ist „ich bin verunsichert", nicht „du bist unfair".'));
        else if (f && PSEUDO.test(f)) checks.push(note('info', `„${esc(f.match(PSEUDO)[0])}" ist ein Pseudo-Gefühl – es beschreibt, was der andere tut. Was fühlst du dabei: verunsichert, enttäuscht, ärgerlich?`));
        if (ws && VAGUE.test(ws) && ws.length < 50) checks.push(note('info', `„${esc(ws.match(VAGUE)[0])}" – was genau soll ${esc(other())} tun? Eine Bitte ist erfüllbar, wenn man sie beobachten könnte.`));
        if (ws && /\b(nicht|nie|kein|aufhören|lass)\b/i.test(ws)) checks.push(note('info', 'Die Bitte ist negativ formuliert. Was soll stattdessen passieren?'));
        if (!checks.length && w && f && (S.ibNeed || '').trim() && ws) checks.push(note('ok', 'Beobachtung, Gefühl, Bedürfnis, Bitte – alle vier da, ohne Du-Botschaft. Das kann man so sagen.'));
        $('co-ib-check').innerHTML = checks.join('');
        $('co-ib').textContent = ibText() || '…';
    }
    function renderMeta() {
        const h = side(S.heard), m = side(S.meant);
        if (!S.message) { $('co-meta').innerHTML = note('info', 'Ohne Aussage aus Schritt 1 keine Nachfrage.'); return; }
        const heardTxt = h ? (S[h.id] || '').trim() : '';
        const sentence = h ? `Als du gesagt hast „${S.message.trim()}", habe ich ${heardTxt ? `verstanden: ${heardTxt.replace(/[.]+$/, '')}` : `vor allem ${h.t === 'Appell' ? 'eine Aufforderung' : h.t === 'Beziehungsebene' ? 'etwas über unsere Beziehung' : h.t === 'Sachebene' ? 'die reine Information' : 'etwas über dich'} gehört`}. Hast du das so gemeint${m && m.id !== h.id ? ` – oder ging es dir eher um ${m.t === 'Appell' ? 'etwas, das du dir von mir wünschst' : m.t === 'Sachebene' ? 'die Sache selbst' : m.t === 'Beziehungsebene' ? 'uns beide' : 'dich'}` : ''}?` : '';
        $('co-meta').innerHTML = h ? `<div class="co-meta-pick"><span class="mk-faint">Gehört mit:</span> <span class="co-tag" style="--c:${h.c}">${h.ic} ${h.ear}</span></div><div class="mk-result"><h4>Deine Nachfrage</h4><div class="co-msg">${esc(sentence)}</div><div class="co-copy-row"><button class="mk-btn mk-btn-outline mk-btn-sm" id="co-copy2"><i class="fas fa-copy"></i> Kopieren</button></div></div>${note('info', 'Der Trick: Du legst offen, mit welchem Ohr du gehört hast. Das nimmt den Druck raus – niemand muss recht haben.')}` : note('info', 'Wähle in Schritt 2, mit welchem Ohr gehört wurde – daraus entsteht die Nachfrage.');
        const b = $('co-copy2'); if (b) b.addEventListener('click', () => navigator.clipboard.writeText(sentence).then(() => MethodKit.toast('Kopiert', 'ok')));
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        const m = side(S.meant), h = side(S.heard), d = dominant();
        $('co-summary').innerHTML = S.message ? `<div class="mk-result"><h4>Deine Analyse</h4><div class="co-sum"><div><b>Aussage</b>„${esc(S.message)}"${S.who ? ` <span class="mk-faint">(${S.role === 'receiver' ? `${esc(S.who)} zu mir` : `ich zu ${esc(S.who)}`})</span>` : ''}</div>${SIDES.filter(s => S[s.id]).map(s => `<div style="border-left:3px solid ${s.c}"><b>${s.ic} ${s.t}</b>${esc(S[s.id])}</div>`).join('')}${m && h ? `<div><b>Missverständnis</b>Gemeint: ${m.t} · Gehört: ${h.ear}${m.id === h.id ? ' – deckungsgleich' : ''}</div>` : ''}${d ? `<div><b>Mein Lieblingsohr</b>${d.ic} ${d.ear}</div>` : ''}${ibText() ? `<div><b>Ich-Botschaft</b>${esc(ibText())}</div>` : ''}${S.next ? `<div><b>Vornehmen</b>${esc(S.next)}</div>` : ''}</div></div>` : '<div class="mk-empty">Die Zusammenfassung füllt sich aus den vorherigen Schritten.</div>';
    }
    function renderLinks() { $('co-links').innerHTML = LINKS.map(x => `<a class="mk-option co-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const m = side(S.meant), h = side(S.heard), d = dominant(), sc = scores();
        const L = ['4-OHREN-MODELL (SCHULZ VON THUN)', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'AUSSAGE: „' + (S.message || '–') + '"', S.who ? (S.role === 'receiver' ? 'Von: ' : 'An: ') + S.who : '', S.context ? 'Kontext: ' + S.context : '', S.reaction ? 'Reaktion: ' + S.reaction : '', '', 'VIER SEITEN'];
        SIDES.forEach(s => L.push(`${s.ic} ${s.t}: ${S[s.id] || '–'}`));
        if (m || h) L.push('', 'Gemeint: ' + (m ? m.t : '–'), 'Gehört mit: ' + (h ? h.ear : '–'));
        if (d) L.push('', 'OHREN-PROFIL', ...SIDES.map(s => `${s.ear}: ${sc[s.id]}/10`), 'Lieblingsohr: ' + d.ear);
        if (ibText()) L.push('', 'ICH-BOTSCHAFT', ibText());
        if (S.next) L.push('', 'VORNEHMEN: ' + S.next);
        MethodKit.exportText('vier-ohren.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'communication', accent: '#0ea5e9', accent2: '#6366f1',
            steps: [{ icon: '💬', label: 'Situation' }, { icon: '🔲', label: '4 Seiten' }, { icon: '👂', label: 'Ohren-Profil' }, { icon: '✉️', label: 'Klarer' }, { icon: '📝', label: 'Fazit' }],
            defaultState: { role: '', message: '', who: '', context: '', reaction: '', fact: '', self: '', relation: '', appeal: '', meant: '', heard: '', quiz: {}, ibWhen: '', ibFeel: '', ibNeed: '', ibWish: '', next: '' }
        });
        S = MethodKit.state;
        if (!S.quiz || typeof S.quiz !== 'object') S.quiz = {};
        MethodKit.bindFields();
        $('co-export').addEventListener('click', exportAll);
        $('co-copy').addEventListener('click', () => { const t = ibText(); if (t) navigator.clipboard.writeText(t).then(() => MethodKit.toast('Kopiert', 'ok')); });
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
