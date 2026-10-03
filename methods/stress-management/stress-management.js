/* Stressmanagement · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const DUR = [['acute', 'Akut – seit Tagen'], ['weeks', 'Seit Wochen'], ['months', 'Seit Monaten'], ['chronic', 'Eigentlich immer']];
    const DOMAINS = ['Arbeit', 'Familie', 'Partnerschaft', 'Gesundheit', 'Finanzen', 'Studium', 'Zukunft', 'Soziales', 'Wohnen'];
    const FREQ = [['daily', 'täglich', 3], ['weekly', 'wöchentlich', 2], ['rare', 'selten', 1]];
    const SIGNALS = {
        body: { l: '🫀 Körper', items: ['Verspannter Nacken', 'Kopfschmerzen', 'Schlafprobleme', 'Magen/Verdauung', 'Herzklopfen', 'Zähneknirschen', 'Ständige Müdigkeit', 'Flache Atmung'] },
        mind: { l: '🧠 Gedanken', items: ['Grübeln', 'Konzentrationsprobleme', 'Vergesslichkeit', 'Schwarzmalen', 'Gedankenkreisen nachts', '„Ich schaffe das nicht"'] },
        emo: { l: '💭 Gefühle', items: ['Gereiztheit', 'Innere Unruhe', 'Dünnhäutigkeit', 'Lustlosigkeit', 'Angst', 'Gleichgültigkeit'] },
        act: { l: '🚶 Verhalten', items: ['Rückzug', 'Mehr essen / Süsses', 'Mehr Alkohol / Nikotin', 'Aufschieben', 'Hektik', 'Keine Pausen', 'Schneller reden', 'Mehr Bildschirm'] }
    };
    const CTRL = [['change', 'Change it', 'Ich kann es ändern', '🔧', 'Was tust du konkret, bis wann?'], ['love', 'Love it', 'Ich nehme es an und gestalte meinen Umgang', '🤲', 'Was änderst du an deiner Haltung oder deinem Umgang?'], ['leave', 'Leave it', 'Ich verlasse die Situation', '🚪', 'Was lässt du los oder beendest du – und was kostet das?']];
    const RES = ['Erfahrung mit Ähnlichem', 'Fähigkeiten', 'Unterstützung durch andere', 'Zeit', 'Geld', 'Gesundheit', 'Humor', 'Klare Prioritäten', 'Ich habe Schlimmeres überstanden', 'Gute Routinen'];
    const SOS = ['4-7-8-Atmung (3 Runden)', '10 Minuten rausgehen', 'Glas Wasser, langsam', 'Schultern hoch – fallen lassen', 'Jemanden anrufen', 'Die 3 wichtigsten Dinge aufschreiben', 'Handy weglegen, Augen schliessen', 'Kalt übers Gesicht', 'Eine Sache zu Ende bringen', 'Sagen: „Ich melde mich in 30 Minuten"'];
    const RECOV = ['Schlaf (7+ h)', 'Bewegung', 'Natur', 'Zeit mit Menschen, die guttun', 'Allein-Zeit', 'Hobby ohne Zweck', 'Musik', 'Lesen', 'Nichts tun', 'Kochen / Essen in Ruhe', 'Humor & Lachen', 'Dankbarkeit'];
    const RFREQ = [['daily', 'täglich', 7], ['several', 'mehrmals/Woche', 3], ['weekly', '1×/Woche', 1], ['rare', 'selten', 0.3]];
    const LINKS = [
        { m: 'Achtsamkeit', l: '../mindfulness/mindfulness.html', why: 'Atem-Anker und Body-Scan für den Akutfall.' },
        { m: 'Eisenhower', l: '../time-management/time-management.html', why: 'Wenn Zeitdruck der Hauptstressor ist.' },
        { m: 'Fünf Säulen', l: '../five-pillars/five-pillars.html', why: 'Wo ist das Leben aus der Balance?' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Erholung zur festen Routine machen.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const load = (s) => n(s.int, 3) * ((FREQ.find(f => f[0] === s.freq) || FREQ[1])[2]);
    const stressors = () => S.stressors.filter(s => s.text.trim());
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const chips = (host, items, key, single) => { $(host).innerHTML = `<div class="mk-chips">${items.map(i => { const v = Array.isArray(i) ? i[0] : i, l = Array.isArray(i) ? i[1] : i; const on = single ? S[key] === v : S[key].includes(v); return `<button class="mk-chip ${on ? 'selected' : ''}" data-c="${esc(v)}">${esc(l)}</button>`; }).join('')}</div>`; $(host).querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.c; if (single) S[key] = S[key] === v ? '' : v; else S[key] = S[key].includes(v) ? S[key].filter(x => x !== v) : [...S[key], v]; MethodKit.save(); chips(host, items, key, single); renderCheckNote(); })); };

    /* ---------- 1 ---------- */
    function renderCheckNote() {
        const l = n(S.level, 5); const H = [];
        if (l >= 8 && ['months', 'chronic'].includes(S.duration)) H.push(note('warn', 'Hoher Stress über Monate – das ist der Bereich, in dem Erschöpfung entsteht. Dieses Werkzeug hilft beim Sortieren; sprich zusätzlich mit jemandem, dem du vertraust, oder mit einer Fachperson.'));
        else if (l >= 8) H.push(note('info', 'Akut hoch. Spring gern direkt zu Schritt 6 (SOS-Plan) und komm danach zurück zum Sortieren.'));
        if (S.domains.length >= 4) H.push(note('info', `${S.domains.length} Bereiche gleichzeitig – oft steckt dahinter ein gemeinsamer Nenner (zu wenig Erholung, zu wenig Nein). Achte in Schritt 2 darauf.`));
        $('sm-checknote').innerHTML = H.join('');
    }

    /* ---------- 2 ---------- */
    function renderStressors() {
        $('sm-stressors').innerHTML = S.stressors.length ? S.stressors.map(s => `<div class="sm-str"><input class="mk-input" data-st="${s.id}" value="${esc(s.text)}" placeholder="Stressor"><div class="sm-str-r"><span class="sm-lab">Intensität</span><div class="sm-dots">${[1, 2, 3, 4, 5].map(v => `<button class="${n(s.int, 3) >= v ? 'on' : ''}" data-si="${s.id}" data-v="${v}" aria-label="Intensität ${v}">●</button>`).join('')}</div><div class="sm-freq">${FREQ.map(f => `<button class="${s.freq === f[0] ? 'on' : ''}" data-sf="${s.id}" data-f="${f[0]}">${f[1]}</button>`).join('')}</div><button class="mk-iconbtn" data-sx="${s.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div></div>`).join('') : '<div class="mk-empty">Noch keine Stressoren. Was hat dich in den letzten zwei Wochen am meisten belastet?</div>';
        const h = $('sm-stressors');
        h.querySelectorAll('[data-st]').forEach(el => el.addEventListener('input', () => { const s = S.stressors.find(x => x.id === el.dataset.st); if (s) { s.text = el.value; MethodKit.save(); renderMap(); } }));
        h.querySelectorAll('[data-si]').forEach(b => b.addEventListener('click', () => { const s = S.stressors.find(x => x.id === b.dataset.si); if (s) { s.int = +b.dataset.v; MethodKit.save(); renderStressors(); renderMap(); } }));
        h.querySelectorAll('[data-sf]').forEach(b => b.addEventListener('click', () => { const s = S.stressors.find(x => x.id === b.dataset.sf); if (s) { s.freq = b.dataset.f; MethodKit.save(); renderStressors(); renderMap(); } }));
        h.querySelectorAll('[data-sx]').forEach(b => b.addEventListener('click', () => { S.stressors = S.stressors.filter(x => x.id !== b.dataset.sx); MethodKit.save(); renderStressors(); renderMap(); }));
    }
    function addStressor(t) { t = (t || '').trim(); if (!t) { MethodKit.toast('Bitte Stressor eingeben', 'warn'); return; } S.stressors.push({ id: MethodKit.uid(), text: t, int: 3, freq: 'weekly', ctrl: '', action: '' }); MethodKit.save(); $('sm-in').value = ''; renderStressors(); renderMap(); $('sm-in').focus(); }
    function renderMap() {
        const L = stressors().map(s => ({ ...s, load: load(s) })).sort((a, b) => b.load - a.load);
        if (!L.length) { $('sm-map').innerHTML = '<div class="mk-empty">Die Landkarte entsteht aus deinen Stressoren.</div>'; return; }
        const max = L[0].load, total = L.reduce((a, s) => a + s.load, 0);
        $('sm-map').innerHTML = `<div class="sm-bars">${L.map(s => `<div class="sm-bar"><span class="sm-bar-l">${esc(s.text)}</span><div class="sm-bar-t"><i style="width:${s.load / max * 100}%" class="${s.load >= 12 ? 'hi' : s.load >= 6 ? 'mid' : ''}"></i></div><small>${Math.round(s.load / total * 100)} %</small></div>`).join('')}</div>
            ${L[0].load / total >= 0.4 ? note('info', `<strong>${esc(L[0].text)}</strong> macht ${Math.round(L[0].load / total * 100)} % deiner Belastung aus. Wenn du nur einen Stressor angehst, dann diesen – Schritt 5 nimmt ihn sich vor.`) : L.length >= 4 ? note('info', 'Viele mittlere Stressoren statt eines grossen – typisch für „Tausend kleine Schnitte". Hier hilft weniger das Lösen einzelner Punkte als mehr Erholung (Schritt 6).') : ''}
            ${L.filter(s => s.freq === 'daily' && n(s.int, 3) >= 4).length ? note('warn', `Täglich und intensiv: ${L.filter(s => s.freq === 'daily' && n(s.int, 3) >= 4).map(s => esc(s.text)).join(', ')}. Dauerstress ohne Pause ist das, was krank macht – nicht die Spitzen.`) : ''}`;
    }

    /* ---------- 3 ---------- */
    function renderSignals() {
        const counts = Object.fromEntries(Object.keys(SIGNALS).map(k => [k, S.signals.filter(s => SIGNALS[k].items.includes(s)).length]));
        $('sm-signals').innerHTML = Object.entries(SIGNALS).map(([k, g]) => `<div class="mk-section-label">${g.l} ${counts[k] ? `<span class="mk-badge">${counts[k]}</span>` : ''}</div><div class="mk-chips">${g.items.map(i => `<button class="mk-chip ${S.signals.includes(i) ? 'selected' : ''}" data-sg="${esc(i)}">${esc(i)}</button>`).join('')}</div>`).join('');
        $('sm-signals').querySelectorAll('[data-sg]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.sg; S.signals = S.signals.includes(v) ? S.signals.filter(x => x !== v) : [...S.signals, v]; MethodKit.save(); renderSignals(); renderSigNote(); }));
        renderSigNote();
    }
    function renderSigNote() {
        const total = S.signals.length; const body = S.signals.filter(s => SIGNALS.body.items.includes(s)).length; const na = n(S.noticeAt, 7); const H = [];
        if (!total) { $('sm-signote').innerHTML = ''; return; }
        const first = S.signals[0];
        H.push(note('ok', `Dein Frühwarnprofil: ${total} Signale. Das erste, das du bemerkst, ist vermutlich <strong>${esc(first)}</strong> – mach es zu deinem Alarm: Sobald es auftaucht, greift dein SOS-Plan.`));
        if (body >= 4) H.push(note('warn', 'Viele körperliche Signale. Der Körper spricht, wenn der Kopf nicht hinhört – nimm die Erholungsseite in Schritt 6 ernst.'));
        if (na >= 8) H.push(note('info', `Du bemerkst Stress erst bei ${na}/10 – dann ist er schon weit fortgeschritten. Ziel: die Signale schon bei 5 oder 6 erkennen. Ein kurzer Check-in am Mittag hilft.`));
        $('sm-signote').innerHTML = H.join('');
    }

    /* ---------- 4 ---------- */
    function renderControl() {
        const L = stressors();
        if (!L.length) { $('sm-control').innerHTML = '<div class="mk-empty">Zuerst Stressoren in Schritt 2.</div>'; return; }
        const dist = Object.fromEntries(CTRL.map(c => [c[0], L.filter(s => s.ctrl === c[0]).length]));
        $('sm-control').innerHTML = L.sort((a, b) => load(b) - load(a)).map(s => `<div class="sm-ctl"><div class="sm-ctl-h"><b>${esc(s.text)}</b><small>Belastung ${load(s)}</small></div><div class="sm-ctl-opts">${CTRL.map(c => `<button class="${s.ctrl === c[0] ? 'on ' + c[0] : ''}" data-sc="${s.id}" data-k="${c[0]}"><span>${c[3]}</span>${c[1]}</button>`).join('')}</div>${s.ctrl ? `<input class="mk-input" data-sa="${s.id}" value="${esc(s.action || '')}" placeholder="${CTRL.find(c => c[0] === s.ctrl)[4]}">` : ''}</div>`).join('') +
            (L.every(s => s.ctrl) ? `<div class="sm-dist">${CTRL.map(c => `<span class="${c[0]}">${c[3]} ${c[1]}: ${dist[c[0]]}</span>`).join('')}</div>` + (dist.love === L.length ? note('info', 'Alles „Love it"? Prüf ehrlich: Ist das Annahme – oder Resignation? Mindestens ein Stressor lässt sich meist verändern.') : dist.change === L.length ? note('info', 'Alles ändern wollen ist selbst ein Stressor. Was davon darfst du einfach annehmen?') : note('ok', 'Jeder Stressor hat eine Entscheidung. Das allein senkt die Belastung – Unentschiedenes stresst am meisten.')) : '');
        $('sm-control').querySelectorAll('[data-sc]').forEach(b => b.addEventListener('click', () => { const s = S.stressors.find(x => x.id === b.dataset.sc); if (s) { s.ctrl = s.ctrl === b.dataset.k ? '' : b.dataset.k; MethodKit.save(); renderControl(); } }));
        $('sm-control').querySelectorAll('[data-sa]').forEach(el => el.addEventListener('input', () => { const s = S.stressors.find(x => x.id === el.dataset.sa); if (s) { s.action = el.value; MethodKit.save(); } }));
    }

    /* ---------- 5 ---------- */
    function renderAppraisal() {
        const L = stressors().sort((a, b) => load(b) - load(a)); const A = S.appraisal;
        if (!L.length) { $('sm-appraisal').innerHTML = '<div class="mk-empty">Zuerst Stressoren in Schritt 2.</div>'; return; }
        if (!A.target || !L.some(s => s.id === A.target)) A.target = L[0].id;
        const t = L.find(s => s.id === A.target); const threat = n(A.threat, 7); const res = A.res.length;
        const ratio = res >= 4 && threat <= 5 ? 'challenge' : res <= 1 && threat >= 7 ? 'threat' : 'mixed';
        $('sm-appraisal').innerHTML = `
            <div class="mk-field"><label>Welchen Stressor nimmst du dir vor?</label><select class="mk-select" id="sm-target">${L.map(s => `<option value="${s.id}" ${s.id === A.target ? 'selected' : ''}>${esc(s.text)}</option>`).join('')}</select></div>
            <div class="mk-section-label">Primäre Bewertung – was steht auf dem Spiel?</div>
            <div class="mk-field"><textarea class="mk-textarea" id="sm-stake" placeholder="Was befürchtest du konkret? Was wäre das Schlimmste – und wie wahrscheinlich ist es wirklich?">${esc(A.stake || '')}</textarea></div>
            <div class="mk-field"><label>Wie fühlt es sich an?</label><div class="sm-scale"><span>Herausforderung</span><input type="range" class="mk-range" min="1" max="10" id="sm-threat" value="${threat}"><span>Bedrohung</span></div></div>
            <div class="mk-section-label">Sekundäre Bewertung – was hast du?</div>
            <div class="mk-chips">${RES.map(r => `<button class="mk-chip ${A.res.includes(r) ? 'selected' : ''}" data-ar="${esc(r)}">${esc(r)}</button>`).join('')}</div>
            <div class="sm-appr ${ratio}"><div><b>${threat}</b><span>Bedrohung</span></div><div class="vs">vs.</div><div><b>${res}</b><span>Ressourcen</span></div></div>
            ${ratio === 'threat' ? note('warn', 'Hohe Bedrohung, kaum Ressourcen – so fühlt sich Stress an. Die Frage ist nicht, ob die Bedrohung real ist, sondern: Welche Ressource übersiehst du gerade? Wer könnte helfen?') : ratio === 'challenge' ? note('ok', 'Mehr Ressourcen als Bedrohung – das Gehirn bewertet das als Herausforderung, nicht als Gefahr. Derselbe Stressor, anderer Stress.') : note('info', 'Noch unentschieden. Jede Ressource, die du dir bewusst machst, verschiebt die Waage – und zwar wirklich, nicht nur gefühlt.')}
            <div class="mk-field" style="margin-top:12px"><label for="sm-reframe">Formuliere den Stressor als Herausforderung</label><input class="mk-input" id="sm-reframe" value="${esc(A.reframe || '')}" placeholder="„Ich muss …" → „Ich habe die Gelegenheit, … / Ich will herausfinden, ob …""></div>
            ${A.reframe && /\bmuss\b|\bmüssen\b|\bsollte\b/i.test(A.reframe) ? note('info', '„Muss" steckt noch drin. Herausforderungen klingen nach „will", „kann", „probiere".') : ''}`;
        $('sm-target').addEventListener('change', e => { A.target = e.target.value; MethodKit.save(); renderAppraisal(); });
        $('sm-stake').addEventListener('input', e => { A.stake = e.target.value; MethodKit.save(); });
        $('sm-threat').addEventListener('input', e => { A.threat = n(e.target.value, 7); MethodKit.save(); }); $('sm-threat').addEventListener('change', renderAppraisal);
        $('sm-appraisal').querySelectorAll('[data-ar]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.ar; A.res = A.res.includes(v) ? A.res.filter(x => x !== v) : [...A.res, v]; MethodKit.save(); renderAppraisal(); }));
        $('sm-reframe').addEventListener('input', e => { A.reframe = e.target.value; MethodKit.save(); }); $('sm-reframe').addEventListener('change', renderAppraisal);
        MethodKit._autosizeAll();
    }

    /* ---------- 6 ---------- */
    function renderSos() {
        $('sm-sos').innerHTML = `<div class="mk-chips">${SOS.map(s => `<button class="mk-chip ${S.sos.includes(s) ? 'selected' : ''}" data-so="${esc(s)}">${esc(s)}</button>`).join('')}</div>
            <div class="sm-add" style="margin-top:8px"><input class="mk-input" id="sm-sos-in" placeholder="Eigenes …" maxlength="60"><button class="mk-btn mk-btn-outline mk-btn-sm" id="sm-sos-add" aria-label="Hinzufügen"><i class="fas fa-plus"></i></button></div>
            ${S.sos.length ? `<div class="mk-result" style="margin-top:12px"><h4>Wenn ich ${S.signals.length ? esc(S.signals[0]) : 'meine Signale'} bemerke:</h4><ol class="sm-sos-list">${S.sos.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}
            ${S.sos.length > 3 ? note('info', 'Mehr als drei – im Akutfall entscheidest du nicht mehr. Streich auf die drei, die du wirklich tust.') : S.sos.length === 3 ? note('ok', 'Drei Schritte, fertig entschieden. Schreib sie auf einen Zettel an den Bildschirm.') : ''}`;
        $('sm-sos').querySelectorAll('[data-so]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.so; S.sos = S.sos.includes(v) ? S.sos.filter(x => x !== v) : [...S.sos, v]; MethodKit.save(); renderSos(); renderSummary(); }));
        const add = () => { const v = $('sm-sos-in').value.trim(); if (!v) return; if (!SOS.includes(v)) SOS.push(v); S.sos.push(v); MethodKit.save(); renderSos(); renderSummary(); };
        $('sm-sos-add').addEventListener('click', add); $('sm-sos-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    }
    function recoveryScore() { return Object.entries(S.recovery).reduce((a, [, f]) => a + ((RFREQ.find(r => r[0] === f) || [0, 0, 0])[2]), 0); }
    function renderRecovery() {
        const R = S.recovery; const score = recoveryScore(); const loadSum = stressors().reduce((a, s) => a + load(s), 0);
        $('sm-recovery').innerHTML = `<div class="sm-rec">${RECOV.map(r => `<div class="sm-rec-row"><span>${esc(r)}</span><div class="sm-freq">${RFREQ.map(f => `<button class="${R[r] === f[0] ? 'on' : ''}" data-rc="${esc(r)}" data-f="${f[0]}">${f[1]}</button>`).join('')}</div></div>`).join('')}</div>
            ${Object.keys(R).length ? `<div class="sm-balance"><div class="sm-bal-side"><b>${loadSum}</b><span>Belastung</span></div><div class="sm-bal-bar"><i class="load" style="flex:${loadSum || 1}"></i><i class="rec" style="flex:${Math.round(score) || 1}"></i></div><div class="sm-bal-side"><b>${Math.round(score)}</b><span>Erholung</span></div></div>
            ${score < loadSum * 0.5 ? note('warn', 'Die Waage kippt deutlich zur Belastung. Du brauchst nicht weniger Stress – du brauchst mehr Erholung, und zwar geplant, nicht „wenn Zeit ist".') : score < loadSum ? note('info', 'Erholung hinkt der Belastung hinterher. Welche eine Erholungsquelle könnte von „selten" auf „mehrmals pro Woche"?') : note('ok', 'Erholung hält mit der Belastung mit – das ist Resilienz. Schütze diese Zeiten wie Termine.')}` : ''}`;
        $('sm-recovery').querySelectorAll('[data-rc]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.rc; R[k] = R[k] === b.dataset.f ? undefined : b.dataset.f; if (!R[k]) delete R[k]; MethodKit.save(); renderRecovery(); renderSummary(); }));
    }
    function renderSummary() {
        const L = stressors(); const top = L.sort((a, b) => load(b) - load(a))[0]; const A = S.appraisal;
        $('sm-summary').innerHTML = L.length || S.signals.length ? `<div class="sm-sum">
            ${top ? `<div><b>Grösster Stressor</b>${esc(top.text)}${top.ctrl ? ` · ${CTRL.find(c => c[0] === top.ctrl)[1]}${top.action ? ': ' + esc(top.action) : ''}` : ''}</div>` : ''}
            ${S.signals.length ? `<div><b>Alarmsignal</b>${esc(S.signals[0])}</div>` : ''}
            ${S.sos.length ? `<div><b>SOS</b>${S.sos.slice(0, 3).map(esc).join(' → ')}</div>` : ''}
            ${A.reframe ? `<div><b>Neue Bewertung</b>${esc(A.reframe)}</div>` : ''}
            ${Object.keys(S.recovery).length ? `<div><b>Erholung</b>${Object.entries(S.recovery).filter(([, f]) => f === 'daily' || f === 'several').map(([k]) => esc(k)).join(', ') || 'noch nichts Regelmässiges'}</div>` : ''}</div>` : '<div class="mk-empty">Der Plan füllt sich aus den vorherigen Schritten.</div>';
    }
    function renderLinks() { $('sm-links').innerHTML = LINKS.map(x => `<a class="mk-option sm-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['STRESSMANAGEMENT', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', `Level: ${n(S.level, 5)}/10 · ${(DUR.find(d => d[0] === S.duration) || [])[1] || ''} · ${S.domains.join(', ')}`, ''];
        L.push('STRESSOREN'); stressors().sort((a, b) => load(b) - load(a)).forEach(s => L.push(`  ${s.text} · Intensität ${n(s.int, 3)} · ${(FREQ.find(f => f[0] === s.freq) || [])[1]} · Belastung ${load(s)}${s.ctrl ? ' · ' + CTRL.find(c => c[0] === s.ctrl)[1] + (s.action ? ': ' + s.action : '') : ''}`)); L.push('');
        if (S.signals.length) L.push('FRÜHWARNSIGNALE', '  ' + S.signals.join(', '), `  Bemerke ich ab Level ${n(S.noticeAt, 7)}`, '');
        const A = S.appraisal; if (A.stake || A.reframe) L.push('BEWERTUNG', A.stake ? '  Auf dem Spiel: ' + A.stake : '', `  Bedrohung ${n(A.threat, 7)}/10 · Ressourcen: ${A.res.join(', ') || '–'}`, A.reframe ? '  Als Herausforderung: ' + A.reframe : '', '');
        if (S.sos.length) L.push('SOS-PLAN', ...S.sos.map((s, i) => `  ${i + 1}. ${s}`), '');
        const R = Object.entries(S.recovery); if (R.length) L.push('ERHOLUNG', ...R.map(([k, f]) => `  ${k}: ${(RFREQ.find(r => r[0] === f) || [])[1]}`), '');
        if (S.first) L.push('DIESE WOCHE: ' + S.first);
        MethodKit.exportText('stressmanagement.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'stress-management', accent: '#14b8a6', accent2: '#0ea5e9',
            steps: [{ icon: '🌡️', label: 'Check' }, { icon: '⚡', label: 'Stressoren' }, { icon: '🚨', label: 'Signale' }, { icon: '⚖️', label: 'Einfluss' }, { icon: '🔄', label: 'Bewertung' }, { icon: '🛡️', label: 'Plan' }],
            defaultState: { level: 5, duration: '', domains: [], stressors: [], signals: [], noticeAt: 7, appraisal: { target: '', stake: '', threat: 7, res: [], reframe: '' }, sos: [], recovery: {}, first: '' }
        });
        S = MethodKit.state;
        ['domains', 'stressors', 'signals', 'sos'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; }); if (!S.appraisal || typeof S.appraisal !== 'object') S.appraisal = { res: [] }; if (!Array.isArray(S.appraisal.res)) S.appraisal.res = []; if (!S.recovery || typeof S.recovery !== 'object') S.recovery = {};
        // Migration: alte Freitexte
        if (typeof S.stressors === 'string') { S.stressors = S.stressors.split(/[,;\n]/).map(x => x.trim()).filter(Boolean).map(t => ({ id: MethodKit.uid(), text: t, int: 3, freq: 'weekly', ctrl: '', action: '' })); }
        if (typeof S.signals === 'string') { S.signals = S.signals.split(/[,;\n]/).map(x => x.trim()).filter(Boolean); }
        ['control', 'accept', 'plan', 'acute'].forEach(k => { if (typeof S[k] === 'string') { if (k === 'acute' && S[k].trim() && !S.sos.length) S.sos.push(S[k].trim().slice(0, 60)); if (k === 'plan' && S[k].trim() && !S.first) S.first = S[k].trim(); delete S[k]; } });
        MethodKit.bindFields();
        chips('sm-duration', DUR, 'duration', true); chips('sm-domains', DOMAINS, 'domains', false);
        document.querySelector('[data-mk-field="level"]').addEventListener('input', renderCheckNote);
        document.querySelector('[data-mk-field="noticeAt"]').addEventListener('input', renderSigNote);
        $('sm-add').addEventListener('click', () => addStressor($('sm-in').value)); $('sm-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addStressor(e.target.value); } });
        $('sm-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) renderCheckNote();
            if (k === 2) { renderStressors(); renderMap(); }
            if (k === 3) renderSignals();
            if (k === 4) renderControl();
            if (k === 5) renderAppraisal();
            if (k === 6) { renderSos(); renderRecovery(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
