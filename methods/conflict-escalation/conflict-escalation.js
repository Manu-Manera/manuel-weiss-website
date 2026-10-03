/* Konflikteskalation (Glasl) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const STAGES = [
        { n: 1, t: 'Verhärtung', ph: 1, d: 'Standpunkte prallen aufeinander und verhärten sich. Man glaubt noch, durch Gespräch zu einer Lösung zu kommen.', sym: ['Wir drehen uns im Kreis – dieselben Argumente, immer wieder', 'Es gibt spürbare Spannung, aber wir reden noch miteinander', 'Wir sind beide überzeugt, dass die Sache mit einem guten Gespräch lösbar ist'] },
        { n: 2, t: 'Debatte & Polemik', ph: 1, d: 'Es geht nicht mehr nur um die Sache, sondern um Recht haben. Schwarz-Weiss-Denken, taktische Argumente, Spitzen.', sym: ['Wir wollen gewinnen, nicht mehr nur die Sache klären', 'Es fallen Spitzen, Ironie, verbale Fouls', 'Wir argumentieren taktisch – auch mit Dingen, die wir eigentlich nicht glauben'] },
        { n: 3, t: 'Taten statt Worte', ph: 1, d: 'Reden bringt nichts mehr, also handelt man – ohne Absprache. Empathie geht verloren, Fehlinterpretationen häufen sich.', sym: ['Wir schaffen Fakten, statt zu reden', 'Wir reden kaum noch direkt miteinander', 'Ich deute das Verhalten der anderen Seite reflexhaft negativ'] },
        { n: 4, t: 'Koalitionen', ph: 2, d: 'Man sucht Verbündete. Es geht um Image: Die anderen werden stereotyp gesehen, man selbst ist „der Gute".', sym: ['Ich suche Verbündete und erzähle anderen meine Version', 'Die andere Seite ist in meinen Augen „so ein Typ" geworden', 'Es geht um Image und Gesicht, nicht mehr um die Sache'] },
        { n: 5, t: 'Gesichtsverlust', ph: 2, d: 'Direkte und öffentliche Angriffe auf die moralische Integrität. Vertrauen ist zerstört – man will den anderen entlarven.', sym: ['Es gab öffentliche Angriffe oder Blossstellungen', 'Ich glaube, die andere Seite hat einen schlechten Charakter', 'Vertrauen ist weg – ich traue ihr/ihm alles zu'] },
        { n: 6, t: 'Drohstrategien', ph: 2, d: 'Drohungen und Gegendrohungen. Der Konflikt beschleunigt sich durch Ultimaten.', sym: ['Es wurden Drohungen oder Ultimaten ausgesprochen', 'Ich habe selbst gedroht oder bin kurz davor', 'Die Lage fühlt sich an wie ein Wettrüsten'] },
        { n: 7, t: 'Begrenzte Vernichtung', ph: 3, d: 'Der andere wird nicht mehr als Mensch gesehen. Eigener Schaden wird akzeptiert, solange der des anderen grösser ist.', sym: ['Ich nehme eigenen Schaden in Kauf, wenn es die andere Seite härter trifft', 'Die andere Seite ist für mich „kein Mensch mehr", nur Gegner', 'Es geht nur noch darum, Schaden zuzufügen'] },
        { n: 8, t: 'Zersplitterung', ph: 3, d: 'Das Ziel ist, das System des Gegners zu zerstören – Unterstützer, Ressourcen, Existenz.', sym: ['Ich will die Basis der anderen Seite zerstören (Umfeld, Ressourcen, Position)', 'Alles ist erlaubt, um die andere Seite auszuschalten'] },
        { n: 9, t: 'Gemeinsam in den Abgrund', ph: 3, d: 'Totale Konfrontation ohne Rückweg – die Vernichtung des Gegners um jeden Preis, auch den eigenen.', sym: ['Ich würde alles verlieren, wenn ich die andere Seite damit mit runterziehe'] }
    ];
    const PHASES = {
        1: { t: 'Win-Win', c: '#22c55e', d: 'Beide können noch gewinnen. Selbsthilfe oder Moderation reicht.', help: 'Moderation / Klärungsgespräch' },
        2: { t: 'Win-Lose', c: '#f59e0b', d: 'Einer verliert. Ohne neutrale Dritte geht es selten zurück.', help: 'Prozessbegleitung oder Mediation' },
        3: { t: 'Lose-Lose', c: '#ef4444', d: 'Beide verlieren. Hier hilft nur noch Machteingriff von aussen.', help: 'Schiedsverfahren / Machteingriff' }
    };
    const OWN = ['Ich unterbreche oder höre nicht zu Ende zu', 'Ich spreche hinter dem Rücken über die andere Seite', 'Ich deute Absichten, ohne nachzufragen', 'Ich werde ironisch oder sarkastisch', 'Ich schaffe Fakten, ohne zu informieren', 'Ich meide den direkten Kontakt', 'Ich habe gedroht oder Konsequenzen angedeutet', 'Ich sammle Beweise gegen die andere Seite', 'Ich suche Verbündete', 'Ich werte die Person ab, nicht nur das Verhalten'];
    const STRAT = {
        1: [
            { ic: '🗣️', t: 'Direkt ansprechen', d: 'Ein Vier-Augen-Gespräch – mit Ich-Botschaften, ohne Zeugen, ohne Zeitdruck.' },
            { ic: '👂', t: 'Erst verstehen, dann verstanden werden', d: 'Die Position der anderen Seite in eigenen Worten wiedergeben, bevor du deine vertrittst.' },
            { ic: '🤝', t: 'Gemeinsames Ziel benennen', d: 'Was wollt ihr beide? Das rückt die Sache wieder vor die Person.' },
            { ic: '🧊', t: 'Pause statt Debatte', d: 'Wenn es hitzig wird: vertagen, nicht gewinnen wollen.' }
        ],
        2: [
            { ic: '🧑‍⚖️', t: 'Neutrale dritte Person', d: 'Ab Stufe 4 reicht Selbsthilfe meist nicht mehr. Eine Moderation oder Mediation bringt Struktur und Sicherheit.' },
            { ic: '🛑', t: 'Koalitionen auflösen', d: 'Hör auf, Verbündete zu sammeln – und bitte dein Umfeld, sich herauszuhalten.' },
            { ic: '🙏', t: 'Gesicht wahren lassen', d: 'Biete einen Ausweg an, bei dem niemand öffentlich verliert.' },
            { ic: '🚫', t: 'Keine Drohungen', d: 'Jede Drohung beschleunigt. Benenne stattdessen Grenzen und Bedürfnisse.' }
        ],
        3: [
            { ic: '🚨', t: 'Hilfe von aussen – jetzt', d: 'Auf dieser Stufe schadet jede weitere Eigeninitiative. Vorgesetzte, HR, Schlichtungsstelle oder rechtliche Beratung einschalten.' },
            { ic: '🛡️', t: 'Sich selbst schützen', d: 'Abstand, Dokumentation, Unterstützung. Es geht nicht mehr um Lösung, sondern um Schadensbegrenzung.' },
            { ic: '🚪', t: 'Ausstieg prüfen', d: 'Manchmal ist der klügste Zug, das Feld zu verlassen.' }
        ]
    };
    const LINKS = [
        { m: 'Gewaltfreie Kommunikation', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Für das direkte Gespräch (Stufe 1–3).' },
        { m: 'Harvard-Methode', l: '../harvard-method/harvard-method.html', why: 'Interessen statt Positionen verhandeln.' },
        { m: 'Zirkuläres Fragen', l: '../circular-interview/circular-interview.html', why: 'Die Perspektive der anderen Seite erkunden.' },
        { m: 'Stressmanagement', l: '../stress-management/stress-management.html', why: 'Wenn der Konflikt dich auffrisst.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const stage = (k) => STAGES.find(s => s.n === k);
    const suggested = () => { let max = 0; STAGES.forEach(s => s.sym.forEach((_, i) => { if (S.symptoms.includes(`${s.n}-${i}`)) max = Math.max(max, s.n); })); return max; };
    const cur = () => S.stage || suggested() || 0;

    /* ---------- 2 ---------- */
    function renderSymptoms() {
        $('ce-symptoms').innerHTML = STAGES.map(s => `<div class="ce-symgrp" style="--c:${PHASES[s.ph].c}"><div class="ce-symgrp-h"><b>${s.n}</b> ${s.t}</div>${s.sym.map((x, i) => { const k = `${s.n}-${i}`; return `<label class="ce-sym ${S.symptoms.includes(k) ? 'on' : ''}"><input type="checkbox" data-sym="${k}" ${S.symptoms.includes(k) ? 'checked' : ''}> <span>${x}</span></label>`; }).join('')}</div>`).join('') +
            (suggested() ? note(suggested() <= 3 ? 'ok' : suggested() <= 6 ? 'warn' : 'warn', `Höchste angekreuzte Stufe: <strong>${suggested()} – ${stage(suggested()).t}</strong> (${PHASES[stage(suggested()).ph].t}). ${S.symptoms.length === 1 ? 'Ein einzelnes Symptom reicht nicht – prüfe im nächsten Schritt, ob die Stufe stimmt.' : 'Im nächsten Schritt kannst du die Stufe bestätigen oder anpassen.'}`) : note('info', 'Noch nichts angekreuzt.'));
        $('ce-symptoms').querySelectorAll('[data-sym]').forEach(c => c.addEventListener('change', () => { if (c.checked) S.symptoms.push(c.dataset.sym); else S.symptoms = S.symptoms.filter(x => x !== c.dataset.sym); MethodKit.save(); renderSymptoms(); }));
    }

    /* ---------- 3 ---------- */
    function renderThermo() {
        const k = cur(); const sg = suggested();
        $('ce-thermo').innerHTML = `<div class="ce-thermo">${STAGES.map(s => `<button class="ce-th ${k === s.n ? 'on' : ''} ${k >= s.n ? 'lit' : ''} ${sg === s.n && S.stage && S.stage !== sg ? 'sugg' : ''}" style="--c:${PHASES[s.ph].c}" data-st="${s.n}" aria-label="Stufe ${s.n} ${s.t}"><b>${s.n}</b><span>${s.t}</span></button>`).join('')}</div><div class="ce-phases"><span style="--c:#22c55e">Win-Win · 1–3</span><span style="--c:#f59e0b">Win-Lose · 4–6</span><span style="--c:#ef4444">Lose-Lose · 7–9</span></div>` +
            (sg && S.stage && S.stage !== sg ? note('info', `Der Symptom-Check deutet auf Stufe ${sg}, du hast Stufe ${S.stage} gewählt. Beides ist legitim – dein Gefühl zählt. Achte nur darauf, den Konflikt nicht kleiner zu machen, als er ist.`) : '');
        $('ce-thermo').querySelectorAll('[data-st]').forEach(b => b.addEventListener('click', () => { S.stage = +b.dataset.st; MethodKit.save(); renderThermo(); renderStageCard(); }));
    }
    function renderStageCard() {
        const k = cur(); if (!k) { $('ce-stagecard').innerHTML = note('info', 'Wähle oben die Stufe, die am ehesten passt – oder gehe zurück zum Symptom-Check.'); return; }
        const s = stage(k), p = PHASES[s.ph];
        $('ce-stagecard').innerHTML = `<div class="ce-stagecard" style="--c:${p.c}"><div class="ce-stage-n">${s.n}</div><div><div class="mk-section-label" style="color:${p.c}">${p.t}</div><h3>${s.t}</h3><p>${s.d}</p><p class="mk-faint">${p.d} <strong>Empfohlen: ${p.help}.</strong></p></div></div>` +
            (S.load >= 8 && k <= 3 ? note('info', 'Die Stufe ist noch tief, aber die Belastung hoch (' + S.load + '/10). Das spricht dafür, jetzt zu handeln – solange noch Win-Win möglich ist.') : '') +
            (S.since === 'years' && k <= 2 ? note('info', 'Seit Jahren auf Stufe 1–2? Verhärtung über lange Zeit wirkt oft tiefer, als sie aussieht. Prüfe die Symptome von Stufe 3–4 noch einmal ehrlich.') : '');
    }
    function renderOwn() {
        $('ce-own').innerHTML = `<div class="mk-chips">${OWN.map((o, i) => `<button class="mk-chip ${S.own.includes(i) ? 'selected' : ''}" data-own="${i}">${o}</button>`).join('')}</div>` +
            (S.own.length >= 4 ? note('warn', `${S.own.length} eigene Eskalationsmuster. Das ist keine Schuldfrage – aber es ist dein Hebel: Jedes davon kannst du ab morgen lassen.`) : S.own.length ? note('ok', `${S.own.length} Muster erkannt. Ehrlich hinzuschauen ist der erste Schritt zur De-Eskalation.`) : note('info', 'Nichts? Fast jeder Konflikt hat zwei Seiten – schau noch einmal hin.'));
        $('ce-own').querySelectorAll('[data-own]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.own; S.own = S.own.includes(i) ? S.own.filter(x => x !== i) : [...S.own, i]; MethodKit.save(); renderOwn(); }));
    }

    /* ---------- 4 ---------- */
    function renderStrategy() {
        const k = cur(); if (!k) { $('ce-strategy').innerHTML = note('info', 'Ohne Stufe keine Strategie – bitte zuerst Schritt 3.'); return; }
        const ph = stage(k).ph, p = PHASES[ph];
        $('ce-strategy').innerHTML = `<div class="mk-section-label" style="color:${p.c}">Stufe ${k} · ${p.t}</div>` +
            (ph === 3 ? note('warn', 'Auf dieser Stufe ist Selbsthilfe nicht mehr sinnvoll – sie kann sogar schaden. Diese Seite ersetzt keine Beratung. Hol dir Unterstützung.') : ph === 2 ? note('warn', 'Ab Stufe 4 empfiehlt Glasl eine neutrale dritte Person. Was du selbst noch tun kannst: nicht weiter eskalieren.') : note('ok', 'Hier könnt ihr es noch selbst lösen. Je früher, desto leichter.')) +
            `<div class="mk-grid">${STRAT[ph].map((x, i) => `<button class="mk-option ${S.strategies.includes(`${ph}-${i}`) ? 'selected' : ''}" data-str="${ph}-${i}"><span class="ic">${x.ic}</span><span class="t">${x.t}</span><span class="d">${x.d}</span></button>`).join('')}</div>` +
            (S.own.length ? `<div class="mk-result" style="margin-top:12px"><h4>Und das lässt du ab sofort</h4><ul class="ce-ul">${S.own.map(i => `<li>${OWN[i]}</li>`).join('')}</ul></div>` : '');
        $('ce-strategy').querySelectorAll('[data-str]').forEach(b => b.addEventListener('click', () => { const k2 = b.dataset.str; S.strategies = S.strategies.includes(k2) ? S.strategies.filter(x => x !== k2) : [...S.strategies, k2]; MethodKit.save(); renderStrategy(); }));
    }
    function renderInterest() {
        const w = (S.want || '').trim(), t = (S.theirs || '').trim();
        $('ce-interest-note').innerHTML = w && /recht|gewinn|beweis|zeigen|durchsetz/i.test(w) ? note('warn', '„Recht haben" oder „gewinnen" ist eine Position, kein Interesse. Was bekommst du, wenn du recht hast – und warum ist das wichtig?') : w && t ? note('ok', 'Zwei Interessen nebeneinander – gibt es eine Lösung, die beide bedient? Das ist der Kern der Harvard-Methode.') : w && !t ? note('info', 'Du kennst dein Interesse. Was die andere Seite braucht, ist eine Hypothese – aber ohne sie gibt es keine Lösung, die hält.') : '';
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        const k = cur(); const s = k ? stage(k) : null;
        $('ce-summary').innerHTML = s ? `<div class="mk-result" style="margin-top:8px"><h4>Dein Plan</h4><div class="ce-sum"><div><b>Konflikt</b>${esc(S.conflict || '–')}${S.who ? ` <span class="mk-faint">(mit ${esc(S.who)})</span>` : ''}</div><div><b>Stufe</b><span style="color:${PHASES[s.ph].c};font-weight:700">${s.n} · ${s.t}</span> – ${PHASES[s.ph].help}</div>${S.strategies.length ? `<div><b>Strategie</b>${S.strategies.map(x => { const [p, i] = x.split('-'); return STRAT[p] && STRAT[p][i] ? STRAT[p][i].t : ''; }).filter(Boolean).join(' · ')}</div>` : ''}${S.own.length ? `<div><b>Lasse ich</b>${S.own.map(i => OWN[i]).join(' · ')}</div>` : ''}${S.next ? `<div><b>Nächster Schritt</b>${esc(S.next)}${S.when ? ` – ${esc(S.when)}` : ''}</div>` : ''}${S.stop ? `<div><b>Stopp-Regel</b>${esc(S.stop)}</div>` : ''}</div></div>` : '';
    }
    function renderLog() {
        const k = cur();
        $('ce-log').innerHTML = `<div class="ce-logadd"><label class="mk-faint">Heute steht der Konflikt auf Stufe</label><div class="ce-logst">${STAGES.map(s => `<button class="${S.logStage === s.n ? 'on' : ''}" style="--c:${PHASES[s.ph].c}" data-ls="${s.n}">${s.n}</button>`).join('')}</div><input class="mk-input" id="ce-lognote" placeholder="Was ist passiert? (optional)"><button class="mk-btn mk-btn-outline mk-btn-sm" id="ce-logsave"><i class="fas fa-plus"></i> Eintrag</button></div>` +
            (S.log.length ? `<div class="ce-loglist">${[...S.log].reverse().map(e => `<div class="ce-logrow"><span class="ce-logn" style="--c:${PHASES[stage(e.stage).ph].c}">${e.stage}</span><div><small>${new Date(e.date).toLocaleDateString('de-CH')}</small>${e.note ? `<div>${esc(e.note)}</div>` : ''}</div></div>`).join('')}</div>` +
                (S.log.length >= 2 ? (() => { const a = S.log[S.log.length - 2].stage, b = S.log[S.log.length - 1].stage; return b < a ? note('ok', `Von Stufe ${a} auf ${b} – es geht in die richtige Richtung. Dranbleiben.`) : b > a ? note('warn', `Von Stufe ${a} auf ${b} – der Konflikt eskaliert weiter. Zeit, die Strategie zu überdenken oder Hilfe zu holen.`) : note('info', 'Unverändert. Stillstand ist keine Lösung – aber auch kein Rückschritt.'); })() : '') : '');
        $('ce-log').querySelectorAll('[data-ls]').forEach(b => b.addEventListener('click', () => { S.logStage = +b.dataset.ls; renderLog(); }));
        $('ce-logsave').addEventListener('click', () => { const st = S.logStage || k; if (!st) { MethodKit.toast('Bitte zuerst eine Stufe wählen', 'warn'); return; } S.log.push({ date: Date.now(), stage: st, note: $('ce-lognote').value.trim() }); S.logStage = 0; MethodKit.save({ now: true }); MethodKit.toast('Eintrag gespeichert', 'ok'); renderLog(); });
    }
    function renderLinks() { $('ce-links').innerHTML = LINKS.map(x => `<a class="mk-option ce-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const k = cur(); const s = k ? stage(k) : null;
        const L = ['KONFLIKTESKALATION (GLASL)', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'KONFLIKT: ' + (S.conflict || '–'), S.who ? 'Mit: ' + S.who : '', S.trigger ? 'Auslöser: ' + S.trigger : '', 'Belastung: ' + S.load + '/10', ''];
        if (s) L.push(`STUFE ${s.n} – ${s.t} (${PHASES[s.ph].t})`, s.d, 'Empfohlen: ' + PHASES[s.ph].help, '');
        if (S.own.length) L.push('EIGENER ANTEIL', ...S.own.map(i => '- ' + OWN[i]), S.ownNote ? S.ownNote : '', '');
        if (S.strategies.length) L.push('STRATEGIE', ...S.strategies.map(x => { const [p, i] = x.split('-'); return STRAT[p] && STRAT[p][i] ? `- ${STRAT[p][i].t}: ${STRAT[p][i].d}` : ''; }), '');
        if (S.want || S.theirs) L.push('INTERESSEN', S.want ? 'Ich: ' + S.want : '', S.theirs ? 'Andere Seite: ' + S.theirs : '', '');
        L.push('PLAN', 'Nächster Schritt: ' + (S.next || '–'), S.when ? 'Wann: ' + S.when : '', S.stop ? 'Stopp-Regel: ' + S.stop : '');
        if (S.log.length) L.push('', 'VERLAUF', ...S.log.map(e => `${new Date(e.date).toLocaleDateString('de-CH')} · Stufe ${e.stage}${e.note ? ' · ' + e.note : ''}`));
        MethodKit.exportText('konflikt-glasl.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'conflict-escalation', accent: '#f97316', accent2: '#ef4444',
            steps: [{ icon: '🔥', label: 'Konflikt' }, { icon: '🔍', label: 'Symptome' }, { icon: '🌡️', label: 'Stufe' }, { icon: '🧯', label: 'De-Eskalation' }, { icon: '📝', label: 'Plan' }],
            defaultState: { conflict: '', who: '', since: '', trigger: '', load: 5, symptoms: [], stage: 0, own: [], ownNote: '', strategies: [], want: '', theirs: '', next: '', when: '', stop: '', log: [], logStage: 0 }
        });
        S = MethodKit.state;
        ['symptoms', 'own', 'strategies', 'log'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        if (typeof S.stage === 'string') S.stage = parseInt(S.stage, 10) || 0;
        S.load = parseInt(S.load, 10) || 5;
        MethodKit.bindFields();
        $('ce-export').addEventListener('click', exportAll);
        ['ce-want', 'ce-theirs'].forEach(id => $(id).addEventListener('input', renderInterest));
        ['ce-next', 'ce-when', 'ce-stop'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 2) renderSymptoms();
            if (k === 3) { renderThermo(); renderStageCard(); renderOwn(); }
            if (k === 4) { renderStrategy(); renderInterest(); }
            if (k === 5) { renderSummary(); renderLog(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
