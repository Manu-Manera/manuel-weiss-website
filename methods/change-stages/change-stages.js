/* Stufen der Veränderung (Prochaska) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const PH = [
        { id: 'pre', ic: '😶', t: 'Absichtslosigkeit', sub: 'Kein Thema', c: '#94a3b8', d: 'Du siehst (noch) kein Problem – oder hast resigniert. Andere sehen es vielleicht deutlicher als du.', trap: 'Dich überreden lassen oder dich selbst mit Druck antreiben. Druck erzeugt Widerstand.', task: 'Nicht handeln – hinschauen. Sammle Informationen, ohne dich zu entscheiden. Was kostet dich das Verhalten wirklich? Was sagen Menschen, denen du vertraust?', q: ['Ich sehe eigentlich kein Problem – andere machen mehr daraus, als es ist', 'Ich habe keine Absicht, in den nächsten sechs Monaten etwas zu ändern'] },
        { id: 'con', ic: '🤔', t: 'Absichtsbildung', sub: 'Ich überlege', c: '#f59e0b', d: 'Du weisst, dass etwas anders werden sollte – und schwankst zwischen Wollen und Nicht-Wollen. Diese Phase kann Jahre dauern.', trap: 'Ewiges Abwägen („chronische Kontemplation"). Oder: zu früh losstürmen und beim ersten Rückschlag alles hinwerfen.', task: 'Die Entscheidung reifen lassen – mit System. Mach die Waage: Was spricht dafür, was dagegen? Was gewinnst du, was verlierst du? Erst wenn das Dafür ehrlich überwiegt, geh weiter.', q: ['Ich denke ernsthaft darüber nach, etwas zu ändern – aber ich bin hin- und hergerissen', 'Ich sehe die Nachteile meines Verhaltens, habe aber noch keinen Plan'] },
        { id: 'prep', ic: '📋', t: 'Vorbereitung', sub: 'Ich plane', c: '#0ea5e9', d: 'Die Entscheidung ist gefallen. Du willst innerhalb der nächsten Wochen beginnen und hast vielleicht schon kleine Schritte gemacht.', trap: 'Zu lange planen, um nicht anfangen zu müssen. Oder ohne Plan loslegen und untergehen.', task: 'Einen konkreten Plan machen: Was genau, ab wann, wie oft? Welche Hürden kommen – und was tust du dann? Wer weiss davon? Ein Starttermin in den nächsten 14 Tagen.', q: ['Ich habe mich entschieden und will innerhalb des nächsten Monats anfangen', 'Ich habe schon erste kleine Schritte gemacht oder konkret geplant'] },
        { id: 'act', ic: '🏃', t: 'Handlung', sub: 'Ich tue es', c: '#22c55e', d: 'Du hast begonnen und veränderst dein Verhalten sichtbar – seit weniger als sechs Monaten. Das ist die anstrengendste Phase.', trap: 'Alles auf einmal wollen. Rückschläge als Scheitern deuten. Keine Belohnung einbauen.', task: 'Dranbleiben leicht machen: Umgebung anpassen, Auslöser entfernen, Fortschritt sichtbar machen, kleine Belohnungen. Unterstützung aktiv nutzen. Wenn-Dann-Pläne für schwierige Situationen.', q: ['Ich habe in den letzten sechs Monaten konkret etwas verändert und ziehe es durch', 'Es kostet mich noch Kraft, aber ich bin dran'] },
        { id: 'main', ic: '🌳', t: 'Aufrechterhaltung', sub: 'Ich halte durch', c: '#10b981', d: 'Das neue Verhalten läuft seit über sechs Monaten. Es wird allmählich zur Gewohnheit – aber Rückfälle sind weiterhin möglich.', trap: 'Nachlässig werden („Ich hab es ja geschafft"). Risikosituationen unterschätzen.', task: 'Das Neue absichern: Routinen pflegen, Rückfall-Auslöser kennen, Identität anpassen („Ich bin jemand, der …"). Und: andere unterstützen – das festigt dich selbst.', q: ['Das neue Verhalten läuft seit mehr als sechs Monaten', 'Es fühlt sich schon fast normal an, auch wenn ich aufpassen muss'] }
    ];
    const RISKS = ['Stress / Überlastung', 'Müdigkeit', 'Soziale Situationen', 'Langeweile', 'Alleinsein', 'Erfolg feiern wollen', 'Negative Gefühle', 'Alte Umgebung / alte Freunde', 'Reisen / Routine-Bruch', 'Krankheit'];
    const LINKS = [
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Für Handlung & Aufrechterhaltung.' },
        { m: 'Rubikon-Modell', l: '../rubikon-model/rubikon-model.html', why: 'Vom Wünschen zum Wollen – der Schritt über den Fluss.' },
        { m: 'Wohlgeformtes Ziel (NLP)', l: '../nlp-meta-goal/nlp-meta-goal.html', why: 'Das Ziel präzise formulieren.' },
        { m: 'Lösungsfokussiert', l: '../solution-focused/solution-focused.html', why: 'Was funktioniert schon? Mehr davon.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const scores = () => PH.map(p => p.q.reduce((a, _, i) => a + n(S.quiz[`${p.id}${i}`], 0), 0));
    const quizDone = () => PH.every(p => p.q.every((_, i) => S.quiz[`${p.id}${i}`]));
    const suggested = () => { if (!quizDone()) return ''; const sc = scores(); let best = 0; sc.forEach((v, i) => { if (v >= sc[best]) best = i; }); return PH[best].id; };
    const cur = () => PH.find(p => p.id === (S.stage || suggested())) || null;
    const idx = (id) => PH.findIndex(p => p.id === id);

    /* ---------- 1 ---------- */
    function renderIC() {
        const i = n(S.importance, 5), c = n(S.confidence, 5);
        $('cs-ic-note').innerHTML = i <= 4 ? note('info', 'Geringe Wichtigkeit – dann ist die Frage weniger „wie", sondern „ob überhaupt". Das ist ein Zeichen für Absichtslosigkeit oder Absichtsbildung.') : i >= 7 && c <= 4 ? note('warn', 'Wichtig, aber wenig Zuversicht – das klassische Muster, bei dem gute Vorsätze scheitern. Dein Fokus: kleinere Schritte und Erfolgserlebnisse, nicht mehr Motivation.') : i >= 7 && c >= 7 ? note('ok', 'Wichtig und zuversichtlich – gute Voraussetzungen. Wenn du noch nicht angefangen hast: Was hält dich?') : c >= 7 && i <= 5 ? note('info', 'Du könntest – aber es ist dir nicht so wichtig. Vielleicht ist es gar nicht dein Ziel, sondern das eines anderen?') : '';
    }

    /* ---------- 2 ---------- */
    function renderQuiz() {
        const items = []; PH.forEach(p => p.q.forEach((q, i) => items.push({ k: `${p.id}${i}`, q })));
        const order = S.quizOrder && S.quizOrder.length === items.length ? S.quizOrder : (S.quizOrder = items.map(x => x.k).sort(() => Math.random() - .5));
        $('cs-quiz').innerHTML = order.map((k, j) => { const it = items.find(x => x.k === k); return `<div class="cs-q"><div class="cs-q-t"><span>${j + 1}</span> ${it.q}</div><div class="cs-q-opts">${[['1', 'Trifft nicht zu'], ['2', 'Eher nicht'], ['3', 'Teils'], ['4', 'Eher ja'], ['5', 'Trifft voll zu']].map(([v, l]) => `<button class="${n(S.quiz[k], 0) === +v ? 'on' : ''}" data-q="${k}" data-v="${v}">${l}</button>`).join('')}</div></div>`; }).join('') +
            (quizDone() ? note('ok', `Alle ${items.length} Aussagen bewertet. Deine Phase: <strong>${PH.find(p => p.id === suggested()).t}</strong>. Weiter zu Schritt 3.`) : `<div class="mk-faint" style="text-align:center">${Object.keys(S.quiz).filter(k => S.quiz[k]).length}/${items.length} bewertet</div>`);
        $('cs-quiz').querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { S.quiz[b.dataset.q] = +b.dataset.v; MethodKit.save(); renderQuiz(); }));
    }

    /* ---------- 3 ---------- */
    function renderStairs() {
        const c = cur(); const sc = scores(); const max = Math.max(1, ...sc); const sg = suggested();
        $('cs-stairs').innerHTML = `<div class="cs-stairs">${PH.map((p, i) => `<button class="cs-stair ${c && c.id === p.id ? 'on' : ''} ${sg === p.id && c && c.id !== sg ? 'sugg' : ''}" style="--c:${p.c};--i:${i}" data-ph="${p.id}"><span class="ic">${p.ic}</span><b>${p.t}</b><small>${p.sub}</small>${quizDone() ? `<div class="cs-score"><i style="width:${Math.round(sc[i] / max * 100)}%"></i></div>` : ''}</button>`).join('')}</div>` +
            (!quizDone() && !S.stage ? note('info', 'Das Quiz ist noch nicht vollständig. Du kannst die Phase hier auch direkt wählen.') : '') +
            (sg && S.stage && S.stage !== sg ? note('info', `Das Quiz deutet auf <strong>${PH.find(p => p.id === sg).t}</strong>, du hast <strong>${c.t}</strong> gewählt. ${idx(S.stage) > idx(sg) ? 'Vorsicht: Wer sich eine Phase zu weit vorne sieht, überspringt den Schritt, der gerade dran wäre.' : 'Du siehst dich weiter hinten als das Quiz – das ist oft ehrlich. Gut.'}`) : '');
        $('cs-stairs').querySelectorAll('[data-ph]').forEach(b => b.addEventListener('click', () => { S.stage = b.dataset.ph; MethodKit.save(); renderStairs(); renderPhase(); }));
    }
    function renderPhase() {
        const c = cur(); if (!c) { $('cs-phase').innerHTML = ''; return; }
        const i = n(S.importance, 5), cf = n(S.confidence, 5);
        $('cs-phase').innerHTML = `<div class="cs-phase" style="--c:${c.c}"><div class="cs-phase-ic">${c.ic}</div><div><div class="mk-section-label" style="color:${c.c}">Phase ${idx(c.id) + 1} von 5</div><h3>${c.t}</h3><p>${c.d}</p><div class="cs-trap"><b>Typische Falle</b>${c.trap}</div></div></div>` +
            (c.id === 'pre' && i >= 7 ? note('info', 'Du sagst, die Veränderung ist dir wichtig (' + i + '/10) – und stehst trotzdem bei „kein Thema"? Vielleicht bist du weiter, als das Quiz zeigt. Oder du hast resigniert. Beides lohnt einen zweiten Blick.') : '') +
            (c.id === 'act' && cf <= 4 ? note('warn', 'Du handelst, aber mit wenig Zuversicht (' + cf + '/10). Das ist die Rückfall-Zone. Schritt 5 ist für dich besonders wichtig.') : '') +
            ((c.id === 'con' || c.id === 'prep') && (S.log || []).some(e => e.stage === 'act' || e.stage === 'main') ? note('info', 'Laut Verlauf warst du schon einmal weiter. Ein Rückfall ist kein Neuanfang – du weisst schon vieles, was beim ersten Mal nicht klar war.') : '');
    }

    /* ---------- 4 ---------- */
    function renderTask() {
        const c = cur(); if (!c) { $('cs-task').innerHTML = note('info', 'Bitte zuerst in Schritt 3 die Phase bestimmen.'); return; }
        $('cs-task').innerHTML = `<div class="mk-section-label" style="color:${c.c}">${c.ic} ${c.t}</div><div class="cs-task" style="--c:${c.c}"><b>Dein Auftrag in dieser Phase</b><p>${c.task}</p></div>` +
            (c.id === 'pre' ? note('info', 'Kein „nächster Schritt" im Sinne von Handeln. Dein Schritt ist: eine Woche lang beobachten, wie oft und wann das Verhalten auftritt – ohne es zu ändern.') : '');
        $('cs-balance-card').style.display = c.id === 'pre' || c.id === 'con' || c.id === 'prep' ? '' : 'none';
    }
    function renderBalance() {
        const B = S.balance;
        const list = (k, title, ph) => `<div class="cs-bal-col"><b>${title}</b>${(B[k] || []).map((x, i) => `<div class="cs-bal-item"><span>${esc(x)}</span><button class="mk-iconbtn" data-bdel="${k}:${i}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('')}<div class="cs-bal-add"><input class="mk-input" data-badd="${k}" placeholder="${ph}"><button class="mk-btn mk-btn-outline mk-btn-sm" data-baddbtn="${k}" aria-label="Hinzufügen"><i class="fas fa-plus"></i></button></div></div>`;
        const pro = (B.pro || []).length, con = (B.con || []).length;
        $('cs-balance').innerHTML = `<div class="cs-bal">${list('pro', '✅ Dafür – was gewinne ich?', 'Ein Vorteil der Veränderung')}${list('con', '⚠️ Dagegen – was kostet es mich?', 'Ein Nachteil / eine Hürde')}</div>` +
            (pro + con >= 3 ? `<div class="cs-scale"><div class="cs-scale-side" style="flex:${pro}"><b>${pro}</b></div><div class="cs-scale-side con" style="flex:${con}"><b>${con}</b></div></div>` + (pro > con + 1 ? note('ok', 'Das Dafür überwiegt deutlich – die Entscheidung ist eigentlich gefallen. Was hält dich noch?') : con >= pro ? note('warn', 'Das Dagegen ist mindestens so stark wie das Dafür. Kein Wunder, dass du zögerst. Zwei Wege: das Dafür ehrlich vertiefen – oder akzeptieren, dass es noch nicht dran ist.') : note('info', 'Knapp. Welche Hürde auf der Dagegen-Seite könntest du konkret verkleinern?')) : '');
        $('cs-balance').querySelectorAll('[data-baddbtn]').forEach(b => b.addEventListener('click', () => add(b.dataset.baddbtn)));
        $('cs-balance').querySelectorAll('[data-badd]').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') add(i.dataset.badd); }));
        $('cs-balance').querySelectorAll('[data-bdel]').forEach(b => b.addEventListener('click', () => { const [k, i] = b.dataset.bdel.split(':'); B[k].splice(+i, 1); MethodKit.save(); renderBalance(); }));
        function add(k) { const inp = $('cs-balance').querySelector(`[data-badd="${k}"]`); const v = inp.value.trim(); if (!v) return; (B[k] = B[k] || []).push(v); MethodKit.save(); renderBalance(); const ni = $('cs-balance').querySelector(`[data-badd="${k}"]`); if (ni) ni.focus(); }
    }

    /* ---------- 5 ---------- */
    function renderRisks() {
        $('cs-risks').innerHTML = `<div class="mk-section-label">Meine Risikosituationen</div><div class="mk-chips">${RISKS.map((r, i) => `<button class="mk-chip ${S.risks.includes(i) ? 'selected' : ''}" data-r="${i}">${r}</button>`).join('')}</div>` +
            (S.risks.length ? note('info', `${S.risks.length} Risikosituation${S.risks.length > 1 ? 'en' : ''}. Für die wichtigste formulierst du unten einen Wenn-Dann-Plan – <em>bevor</em> sie eintritt.`) : '');
        $('cs-risks').querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.r; S.risks = S.risks.includes(i) ? S.risks.filter(x => x !== i) : [...S.risks, i]; MethodKit.save(); renderRisks(); }));
    }
    function renderRelapseNote() {
        const r = (S.relapse || '').trim();
        $('cs-relapse-note').innerHTML = !r ? '' : /nie wieder|aufgeben|scheitern|versagt|alles umsonst|darf nicht/i.test(r) ? note('warn', 'Da klingt Alles-oder-Nichts durch. Ein Rückfall ist ein Ausrutscher, kein Beweis. Der Plan sollte beschreiben, wie du <em>weitermachst</em>: „Wenn …, dann …"') : !/wenn/i.test(r) ? note('info', 'Ein Wenn-Dann-Plan beginnt mit einer konkreten Situation: „Wenn ich am Abend gestresst bin, dann …"') : !/dann/i.test(r) ? note('info', 'Und was tust du dann? Eine Handlung, die du auch im schlechtesten Moment hinbekommst.') : note('ok', 'Konkrete Situation, konkrete Handlung. So funktionieren Wenn-Dann-Pläne.');
    }
    function renderSummary() {
        const c = cur();
        $('cs-summary').innerHTML = S.behavior ? `<div class="mk-result" style="margin-top:12px"><h4>Dein Stand</h4><div class="cs-sum"><div><b>Verhalten</b>${esc(S.behavior)}</div>${c ? `<div><b>Phase</b><span style="color:${c.c};font-weight:700">${c.ic} ${c.t}</span></div>` : ''}<div><b>Wichtigkeit / Zuversicht</b>${n(S.importance, 5)}/10 · ${n(S.confidence, 5)}/10</div>${S.next ? `<div><b>Nächster Schritt</b>${esc(S.next)}${S.when ? ` – bis ${esc(S.when)}` : ''}</div>` : ''}${S.relapse ? `<div><b>Rückfall-Plan</b>${esc(S.relapse)}</div>` : ''}${S.support ? `<div><b>Unterstützung</b>${esc(S.support)}</div>` : ''}</div></div>` : '';
    }
    function renderLog() {
        const c = cur();
        $('cs-log').innerHTML = `<div class="cs-logadd"><div class="cs-logph">${PH.map(p => `<button class="${(S.logStage || (c && c.id)) === p.id ? 'on' : ''}" style="--c:${p.c}" data-lp="${p.id}" title="${p.t}">${p.ic}</button>`).join('')}</div><input class="mk-input" id="cs-lognote" placeholder="Wie läuft es? (optional)"><button class="mk-btn mk-btn-outline mk-btn-sm" id="cs-logsave"><i class="fas fa-plus"></i> Check-in</button></div>` +
            (S.log.length ? `<div class="cs-loglist">${[...S.log].reverse().map(e => { const p = PH.find(x => x.id === e.stage) || PH[0]; return `<div class="cs-logrow"><span style="--c:${p.c}">${p.ic}</span><div><small>${new Date(e.date).toLocaleDateString('de-CH')} · ${p.t}</small>${e.note ? `<div>${esc(e.note)}</div>` : ''}</div></div>`; }).join('')}</div>` +
                (S.log.length >= 2 ? (() => { const a = idx(S.log[S.log.length - 2].stage), b = idx(S.log[S.log.length - 1].stage); return b > a ? note('ok', 'Eine Phase weiter als beim letzten Check-in. So sieht Fortschritt aus.') : b < a ? note('info', 'Eine Phase zurück. Das ist im Modell vorgesehen – die Spirale, nicht die Leiter. Was hast du gelernt, das du beim nächsten Anlauf nutzt?') : note('info', 'Gleiche Phase. Wenn das länger so bleibt: Welcher Schritt für genau diese Phase fehlt noch?'); })() : '') : '');
        $('cs-log').querySelectorAll('[data-lp]').forEach(b => b.addEventListener('click', () => { S.logStage = b.dataset.lp; renderLog(); }));
        $('cs-logsave').addEventListener('click', () => { const st = S.logStage || (c && c.id); if (!st) { MethodKit.toast('Bitte zuerst eine Phase wählen', 'warn'); return; } S.log.push({ date: Date.now(), stage: st, note: $('cs-lognote').value.trim() }); S.logStage = ''; MethodKit.save({ now: true }); MethodKit.toast('Check-in gespeichert', 'ok'); renderLog(); });
    }
    function renderLinks() { $('cs-links').innerHTML = LINKS.map(x => `<a class="mk-option cs-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const c = cur();
        const L = ['STUFEN DER VERÄNDERUNG (PROCHASKA)', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'VERHALTEN: ' + (S.behavior || '–'), S.why ? 'Warum jetzt: ' + S.why : '', `Wichtigkeit ${n(S.importance, 5)}/10 · Zuversicht ${n(S.confidence, 5)}/10`, ''];
        if (c) L.push(`PHASE: ${c.t} (${c.sub})`, c.d, 'Falle: ' + c.trap, 'Auftrag: ' + c.task, '');
        const B = S.balance; if ((B.pro || []).length || (B.con || []).length) L.push('WAAGE', ...(B.pro || []).map(x => '+ ' + x), ...(B.con || []).map(x => '- ' + x), '');
        L.push('NÄCHSTER SCHRITT: ' + (S.next || '–'), S.when ? 'Bis: ' + S.when : '', '');
        if (S.risks.length) L.push('RISIKOSITUATIONEN: ' + S.risks.map(i => RISKS[i]).join(', '));
        if (S.relapse) L.push('RÜCKFALL-PLAN: ' + S.relapse); if (S.support) L.push('UNTERSTÜTZUNG: ' + S.support);
        if (S.log.length) L.push('', 'VERLAUF', ...S.log.map(e => `${new Date(e.date).toLocaleDateString('de-CH')} · ${(PH.find(p => p.id === e.stage) || {}).t || e.stage}${e.note ? ' · ' + e.note : ''}`));
        MethodKit.exportText('stufen-der-veraenderung.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'change-stages', accent: '#0ea5e9', accent2: '#22c55e',
            steps: [{ icon: '🎯', label: 'Verhalten' }, { icon: '📍', label: 'Standort' }, { icon: '🪜', label: 'Phase' }, { icon: '👣', label: 'Schritt' }, { icon: '🔁', label: 'Dranbleiben' }],
            defaultState: { behavior: '', why: '', importance: 5, confidence: 5, quiz: {}, quizOrder: [], stage: '', balance: { pro: [], con: [] }, next: '', when: '', risks: [], relapse: '', support: '', log: [], logStage: '' }
        });
        S = MethodKit.state;
        if (!S.quiz || typeof S.quiz !== 'object') S.quiz = {};
        if (!S.balance || typeof S.balance !== 'object') S.balance = { pro: [], con: [] };
        ['risks', 'log', 'quizOrder'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        if (S.stage && !PH.some(p => p.id === S.stage)) { const map = { precontemplation: 'pre', contemplation: 'con', preparation: 'prep', action: 'act', maintenance: 'main' }; S.stage = map[S.stage] || ''; }
        MethodKit.bindFields();
        $('cs-export').addEventListener('click', exportAll);
        document.querySelectorAll('[data-mk-field="importance"],[data-mk-field="confidence"]').forEach(r => r.addEventListener('input', renderIC));
        $('cs-relapse').addEventListener('input', () => { renderRelapseNote(); renderSummary(); });
        ['cs-support', 'cs-next', 'cs-when', 'cs-behavior'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 1) renderIC();
            if (k === 2) renderQuiz();
            if (k === 3) { renderStairs(); renderPhase(); }
            if (k === 4) { renderTask(); renderBalance(); }
            if (k === 5) { renderRisks(); renderRelapseNote(); renderSummary(); renderLog(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
