/* Emotionale Intelligenz · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const DOM = {
        self: { label: 'Selbstwahrnehmung', ic: '🪞', c: '#a855f7', lo: 'Gefühle tauchen bei dir eher als Körpersymptom oder Reaktion auf, bevor du sie benennen kannst. Das ist die Basis für alles andere – hier anzufangen lohnt am meisten.', mid: 'Du erkennst deine Gefühle meist, aber oft erst mit Verzögerung. Ziel: den Moment erwischen, in dem sie entstehen.', hi: 'Du weisst in der Regel, was du fühlst und warum. Achte darauf, dass Wahrnehmung nicht zu Grübeln wird.', ex: [['Drei Check-ins', 'Dreimal täglich (Wecker) eine Frage: „Was fühle ich gerade – und wo im Körper?" Ein Wort, eine Stelle.'], ['Trigger-Liste', 'Eine Woche lang jeden starken Gefühlsmoment notieren: Was war vorher? Nach sieben Tagen Muster suchen.'], ['Gefühls-Granularität', 'Statt „gut/schlecht": ein präziseres Wort. Enttäuscht statt schlecht, erleichtert statt gut.']] },
        reg: { label: 'Selbstregulation', ic: '🧘', c: '#6366f1', lo: 'Gefühle steuern dich öfter als du sie. Impulse schiessen durch, Ärger hält an. Die gute Nachricht: Regulation ist das trainierbarste Feld.', mid: 'Du fängst dich meist, aber es kostet Kraft. Techniken für die ersten Sekunden helfen dir am meisten.', hi: 'Du bleibst unter Druck handlungsfähig. Prüfe, ob du Gefühle regulierst oder nur unterdrückst – das ist ein Unterschied.', ex: [['Die 6-Sekunden-Pause', 'Bei einem Impuls: ausatmen, bis sechs zählen, dann reagieren. Der Amygdala-Peak dauert etwa so lange.'], ['Benennen zum Zähmen', '„Ich merke, ich werde wütend." Laut oder innerlich. Benennen senkt die Aktivierung messbar (Lieberman).'], ['Neubewertung', 'Frag bei Ärger: „Was wäre eine wohlwollende Erklärung für das Verhalten?" Nicht glauben müssen – nur prüfen.']] },
        motiv: { label: 'Motivation', ic: '🔥', c: '#f59e0b', lo: 'Antrieb kommt bei dir eher von aussen – Druck, Termine, Erwartungen. Ohne sie fällt es schwer, dranzubleiben.', mid: 'Du kannst dich motivieren, aber Rückschläge werfen dich zurück. Der Hebel: Fortschritt sichtbar machen.', hi: 'Du ziehst Energie aus dem Tun selbst und bleibst bei Rückschlägen dran. Achte auf Erholung – intrinsische Motivation kann in Erschöpfung führen.', ex: [['Fortschritts-Journal', 'Jeden Abend ein Satz: „Heute bin ich weitergekommen bei …" Kleine Fortschritte sind der stärkste Motivator (Amabile).'], ['Warum-Kette', 'Bei einer lästigen Aufgabe dreimal „Wozu?" fragen, bis du bei etwas landest, das dir wichtig ist.'], ['Rückschlag-Ritual', 'Nach einem Misserfolg: Was lerne ich? Was war ausserhalb meiner Kontrolle? Was mache ich morgen anders?']] },
        emp: { label: 'Empathie', ic: '💞', c: '#ec4899', lo: 'Du bekommst oft erst spät mit, wie es anderen geht – oder interpretierst es über dich. Zuhören ohne eigene Agenda ist die Übung.', mid: 'Du spürst andere, aber nicht immer zuverlässig. Nachfragen statt annehmen macht dich treffsicherer.', hi: 'Du liest Menschen gut und sie fühlen sich von dir verstanden. Grenze: Empathie darf nicht in Übernahme fremder Gefühle kippen.', ex: [['Zuhören ohne Antwort', 'In einem Gespräch pro Tag: Nicht antworten, nur zusammenfassen: „Du meinst also …" Erst wenn die Person nickt, eigene Sicht.'], ['Perspektiven-Wechsel', 'Bei Ärger über jemanden: Schreib seine Sicht in Ich-Form auf, zwei Sätze. Was braucht er oder sie?'], ['Körpersprache lesen', 'In einer Besprechung bewusst eine Person beobachten: Haltung, Mimik, Tempo. Was fühlt sie – und passt das zu dem, was sie sagt?']] },
        social: { label: 'Soziale Kompetenz', ic: '🤝', c: '#10b981', lo: 'Beziehungen kosten dich Energie oder du vermeidest schwierige Gespräche. Ein klarer Gesprächsrahmen hilft dir.', mid: 'Du kommst mit Menschen klar, aber Konflikte oder Feedback fühlen sich holprig an. Üben an kleinen Situationen.', hi: 'Du bewegst dich sicher zwischen Menschen, gibst und nimmst Feedback. Achte darauf, dass Beziehungen nicht nur funktional bleiben.', ex: [['Ein unbequemes Gespräch', 'Diese Woche eines führen, das du aufschiebst. Vorbereitung: Beobachtung – Wirkung – Wunsch (drei Sätze).'], ['Wertschätzung konkret', 'Täglich einer Person sagen, was genau sie gut gemacht hat – nicht „super", sondern was und warum.'], ['Netzwerk pflegen', 'Eine Nachricht pro Woche an jemanden, von dem du nichts brauchst. Nur so: „Habe an dich gedacht, weil …"']] }
    };
    // Reihenfolge bleibt stabil: 0–14 sind die alten Items (Migration), 15–19 neu und invers kodiert
    const ITEMS = [
        { d: 'self', t: 'Ich merke schnell, wenn sich meine Stimmung ändert.' }, { d: 'self', t: 'Ich weiss meist genau, warum ich mich so fühle, wie ich mich fühle.' }, { d: 'self', t: 'Ich kenne meine emotionalen Auslöser („Trigger") gut.' },
        { d: 'reg', t: 'Auch unter Stress bleibe ich handlungsfähig.' }, { d: 'reg', t: 'Ich kann impulsive Reaktionen zurückhalten.' }, { d: 'reg', t: 'Nach Ärger beruhige ich mich relativ schnell wieder.' },
        { d: 'motiv', t: 'Ich verfolge meine Ziele auch bei Rückschlägen weiter.' }, { d: 'motiv', t: 'Ich kann mich selbst motivieren, ohne Druck von aussen.' }, { d: 'motiv', t: 'Ich sehe in Problemen eher Chancen als Bedrohungen.' },
        { d: 'emp', t: 'Ich spüre, wie es anderen geht, auch wenn sie nichts sagen.' }, { d: 'emp', t: 'Ich kann mich gut in andere Sichtweisen hineinversetzen.' }, { d: 'emp', t: 'Andere fühlen sich von mir verstanden.' },
        { d: 'social', t: 'Mir fällt es leicht, mit unterschiedlichen Menschen klarzukommen.' }, { d: 'social', t: 'Ich kann Konflikte ansprechen, ohne zu verletzen.' }, { d: 'social', t: 'Ich baue und pflege Beziehungen aktiv.' },
        { d: 'self', t: 'Oft merke ich erst im Nachhinein, dass ich wütend oder verletzt war.', r: true }, { d: 'reg', t: 'Wenn mich etwas ärgert, sage ich Dinge, die ich später bereue.', r: true }, { d: 'motiv', t: 'Ohne Druck von aussen bleibe ich selten an einer Sache dran.', r: true }, { d: 'emp', t: 'Mir wird gesagt, ich würde nicht richtig zuhören.', r: true }, { d: 'social', t: 'Schwierige Gespräche schiebe ich auf, so lange es geht.', r: true }
    ];
    const ORDER = [0, 3, 9, 6, 12, 15, 1, 4, 10, 7, 13, 16, 2, 5, 11, 8, 14, 17, 18, 19];
    const SITS = [
        { t: 'In einer Besprechung kritisiert dich ein Kollege vor allen – unfair, findest du. Dein Puls geht hoch.', o: [['Ich kontere sofort und stelle klar, dass er falsch liegt.', 'reg', 0, 'Der Impuls gewinnt. Vielleicht hast du recht – aber vor allen eskaliert das. Was wäre, wenn du erst atmest?'], ['Ich sage nichts, ärgere mich aber den ganzen Tag.', 'reg', 1, 'Du hältst dich zurück – gut –, aber der Ärger bleibt unbearbeitet. Regulation heisst nicht schlucken, sondern den richtigen Moment wählen.'], ['Ich atme durch, sage: „Da sehe ich es anders – lass uns das nach dem Meeting klären", und mache es dann auch.', 'reg', 2, 'Impuls gestoppt, Grenze gesetzt, Klärung geplant. Das ist Selbstregulation im Alltag.'], ['Ich frage ihn, was genau ihn stört – vielleicht hat er einen Punkt.', 'emp', 2, 'Stark: Du gehst in seine Perspektive, bevor du dich verteidigst. Achte nur darauf, dass du deinen eigenen Standpunkt nicht verlierst.']] },
        { t: 'Eine Freundin erzählt dir, dass sie ihren Job verloren hat. Sie wirkt gefasst.', o: [['Ich sage, dass das sicher das Beste war und sie schnell was Neues findet.', 'emp', 0, 'Gut gemeint, aber du überspringst ihr Gefühl. „Gefasst wirken" heisst nicht „gefasst sein".'], ['Ich erzähle, wie es mir damals in einer ähnlichen Lage ging.', 'emp', 1, 'Du suchst Nähe über deine Geschichte – verständlich, aber jetzt geht es um sie. Erst ihr Raum, dann deiner.'], ['Ich frage: „Wie geht es dir damit – ehrlich?" und halte die Stille aus.', 'emp', 2, 'Du gibst ihr die Möglichkeit, hinter die Fassade zu gehen. Stille aushalten ist Empathie in Reinform.'], ['Ich biete sofort an, ihren Lebenslauf zu überarbeiten.', 'social', 1, 'Hilfsbereit und handlungsstark. Aber Lösung vor Gefühl kann als Abwimmeln ankommen. Frag erst, was sie braucht.']] },
        { t: 'Du hast dir vorgenommen, dreimal pro Woche Sport zu machen. Es ist die dritte Woche, du warst einmal.', o: [['Ich gebe das Ziel auf – offenbar bin ich nicht der Typ dafür.', 'motiv', 0, 'Ein Rückschlag wird zum Urteil über dich. Das ist der häufigste Grund, warum Vorhaben sterben – nicht der Rückschlag selbst.'], ['Ich ärgere mich über mich und nehme mir vor, nächste Woche fünfmal zu gehen.', 'motiv', 1, 'Antrieb über Selbstvorwurf hält selten länger als zwei Tage. Und fünfmal nach einmal ist ein Setup zum Scheitern.'], ['Ich frage mich, was dazwischenkam, und mache das Ziel kleiner: zweimal, feste Termine.', 'motiv', 2, 'Du analysierst statt zu urteilen und passt das System an. Genau so bleibt Motivation stabil.'], ['Ich suche mir jemanden, mit dem ich mich verabrede.', 'social', 2, 'Soziale Verbindlichkeit ist einer der stärksten Motivatoren. Kluger Zug – kombiniert mit einem kleineren Ziel noch besser.']] },
        { t: 'Beim Lesen einer E-Mail spürst du plötzlich einen Kloss im Hals und Druck in der Brust.', o: [['Ich lese weiter – das geht vorbei.', 'self', 0, 'Das Signal wird übergangen. Der Körper meldet ein Gefühl, bevor der Kopf es hat. Wer das ignoriert, verliert die Information.'], ['Ich merke: Da ist etwas. Ich lege kurz das Handy weg und frage mich, was genau mich getroffen hat.', 'self', 2, 'Du nimmst das Körpersignal ernst und übersetzt es. Das ist Selbstwahrnehmung – der Anfang jeder Regulation.'], ['Ich antworte sofort, damit es erledigt ist.', 'reg', 0, 'Handeln unter Aktivierung – die Antwort wird vermutlich anders ausfallen, als du sie in einer Stunde schreiben würdest.'], ['Ich schreibe mir auf: „Druck in der Brust, nach Satz 3". Später schaue ich, was das war.', 'self', 1, 'Du dokumentierst – gut. Noch besser: gleich einen Moment hinspüren, solange das Gefühl frisch ist.']] }
    ];
    const FEEL = {
        'Freude': ['zufrieden', 'erleichtert', 'stolz', 'dankbar', 'begeistert', 'gelassen', 'verbunden', 'neugierig', 'inspiriert', 'hoffnungsvoll'],
        'Ärger': ['gereizt', 'frustriert', 'wütend', 'empört', 'ungeduldig', 'verbittert', 'genervt', 'eifersüchtig'],
        'Angst': ['nervös', 'unsicher', 'besorgt', 'überfordert', 'angespannt', 'panisch', 'misstrauisch', 'hilflos'],
        'Traurigkeit': ['enttäuscht', 'einsam', 'erschöpft', 'niedergeschlagen', 'verletzt', 'leer', 'sehnsüchtig', 'beschämt'],
        'Überraschung': ['verwirrt', 'verblüfft', 'irritiert', 'fasziniert']
    };
    const LINKS = [
        { m: 'Stress-Kompass', l: '../stress-management/stress-management.html', why: 'Regulation unter Druck vertiefen.' },
        { m: 'Vier Seiten einer Nachricht', l: '../communication/communication.html', why: 'Empathie im Gespräch anwenden.' },
        { m: 'Achtsamkeit', l: '../mindfulness/mindfulness.html', why: 'Wahrnehmung ohne Bewertung üben.' },
        { m: 'Johari-Fenster', l: '../johari-window/johari-window.html', why: 'Wie andere dich emotional erleben.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const val = (i) => { const a = n(S.answers[i], 0); if (!a) return 0; return ITEMS[i].r ? 6 - a : a; };
    const answered = () => ITEMS.filter((_, i) => n(S.answers[i], 0)).length;
    function scores() { const out = {}; Object.keys(DOM).forEach(d => { const idx = ITEMS.map((it, i) => it.d === d ? i : -1).filter(i => i >= 0 && val(i)); out[d] = idx.length ? Math.round(idx.reduce((a, i) => a + val(i), 0) / idx.length / 5 * 100) : 0; }); return out; }
    const level = (p) => p < 50 ? 'lo' : p < 75 ? 'mid' : 'hi';
    function consistency() { // Differenz zwischen direkten und inversen Items je Bereich
        const flags = []; Object.keys(DOM).forEach(d => { const dir = ITEMS.map((it, i) => (it.d === d && !it.r) ? i : -1).filter(i => i >= 0 && val(i)); const rev = ITEMS.map((it, i) => (it.d === d && it.r) ? i : -1).filter(i => i >= 0 && val(i)); if (dir.length && rev.length) { const a = dir.reduce((x, i) => x + val(i), 0) / dir.length, b = rev.reduce((x, i) => x + val(i), 0) / rev.length; if (Math.abs(a - b) >= 2) flags.push({ d, a, b }); } }); return flags;
    }

    /* ---------- 1 ---------- */
    function renderItems() {
        $('ei-items').innerHTML = ORDER.map((i, k) => { const it = ITEMS[i]; return `<div class="ei-item ${n(S.answers[i], 0) ? 'done' : ''}"><div class="ei-item-t"><span class="ei-num">${k + 1}</span>${it.t}</div><div class="ei-scale">${[1, 2, 3, 4, 5].map(v => `<button class="${n(S.answers[i], 0) === v ? 'sel' : ''}" data-i="${i}" data-v="${v}" aria-label="${v}">${v}</button>`).join('')}</div></div>`; }).join('');
        $('ei-items').querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => { S.answers[b.dataset.i] = +b.dataset.v; MethodKit.save(); renderItems(); const nx = $('ei-items').querySelector('.ei-item:not(.done)'); if (nx && answered() < ITEMS.length) nx.scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
        $('ei-progress').textContent = answered();
    }

    /* ---------- 2 ---------- */
    function radar(sc) {
        const ks = Object.keys(DOM), cx = 110, cy = 110, R = 80, N = ks.length;
        const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
        const rings = [25, 50, 75, 100].map(p => `<polygon points="${ks.map((_, i) => pt(i, R * p / 100).join(',')).join(' ')}" fill="none" stroke="var(--mk-line)" stroke-width="1"/>`).join('');
        const poly = ks.map((k, i) => pt(i, R * sc[k] / 100).join(',')).join(' ');
        const labels = ks.map((k, i) => { const [x, y] = pt(i, R + 18); return `<text x="${x}" y="${y}" font-size="16" text-anchor="middle" dominant-baseline="middle">${DOM[k].ic}</text>`; }).join('');
        return `<svg viewBox="0 0 220 220" class="ei-radar">${rings}<polygon points="${poly}" fill="var(--mk-accent-soft)" stroke="var(--mk-accent)" stroke-width="2.5" stroke-linejoin="round"/>${ks.map((k, i) => { const [x, y] = pt(i, R * sc[k] / 100); return `<circle cx="${x}" cy="${y}" r="4" fill="${DOM[k].c}"/>`; }).join('')}${labels}</svg>`;
    }
    function renderResults() {
        if (answered() < 10) { $('ei-results').innerHTML = note('info', `Erst ${answered()}/20 beantwortet. Für ein belastbares Profil brauchst du alle.`); return; }
        const sc = scores(); const sorted = Object.keys(DOM).sort((a, b) => sc[b] - sc[a]); const best = sorted[0], weak = sorted[sorted.length - 1];
        const allHi = Object.values(sc).every(v => v >= 85), allMid = Object.values(sc).every(v => v >= 55 && v <= 70), spread = sc[best] - sc[weak];
        const cons = consistency();
        $('ei-results').innerHTML = `<div class="ei-prof">${radar(sc)}<div class="ei-bars">${sorted.map(d => `<div class="ei-bar ${d === weak ? 'weak' : ''}" style="--c:${DOM[d].c}"><div class="ei-bar-h"><span>${DOM[d].ic} ${DOM[d].label}</span><b>${sc[d]}%</b></div><div class="ei-bar-t"><i style="width:${sc[d]}%"></i></div><small>${DOM[d][level(sc[d])]}</small></div>`).join('')}</div></div>` +
            (cons.length ? note('warn', `<strong>Antwortmuster prüfen:</strong> Bei ${cons.map(f => DOM[f.d].label).join(' und ')} widersprechen sich deine direkten und umgekehrten Aussagen deutlich. Meist bedeutet das: Das Selbstbild ist positiver als das Verhalten. Schau in Schritt 3, was du in Situationen tatsächlich tust.`) : '') +
            (allHi ? note('info', 'Überall über 85 %. Entweder bist du aussergewöhnlich – oder die Einschätzung ist freundlicher als die Realität. Frag zwei Menschen, die dich kennen, nach ihrer Einschätzung.') : '') +
            (allMid ? note('info', 'Alles im Mittelfeld. Das kann stimmen – oder du hast viel „3" gewählt. Geh noch einmal durch und entscheide dich bei jeder Aussage für eine Richtung.') : '') +
            (!allHi && !allMid && spread >= 25 ? note('ok', `Klares Profil: <strong>${DOM[best].label}</strong> trägt dich (${sc[best]} %), <strong>${DOM[weak].label}</strong> ist das Entwicklungsfeld (${sc[weak]} %). Goleman: Die Bereiche bauen aufeinander auf – Selbstwahrnehmung zuerst, dann Regulation, dann der Rest.`) : '') +
            (!allHi && !allMid && spread < 25 ? note('ok', `Ausgeglichenes Profil (${sc[weak]}–${sc[best]} %). Dein Entwicklungsfeld ist ${DOM[weak].label} – mit kleinem Vorsprung.`) : '') +
            (weak !== 'self' && sc.self < 70 ? note('info', `Selbstwahrnehmung liegt bei ${sc.self} %. Sie ist das Fundament: Wer nicht merkt, was er fühlt, kann es nicht steuern. Erwäge, dort zu beginnen, auch wenn ${DOM[weak].label} niedriger ist.`) : '');
    }

    /* ---------- 3 ---------- */
    function renderSits() {
        $('ei-sits').innerHTML = SITS.map((s, si) => { const ch = S.sits[si]; return `<div class="ei-sit"><div class="ei-sit-t"><span class="ei-num">${si + 1}</span>${s.t}</div><div class="ei-opts">${s.o.map((o, oi) => `<button class="mk-option ${ch === oi ? 'selected' : ''} ${ch !== undefined && ch !== oi ? 'dim' : ''}" data-s="${si}" data-o="${oi}"><span class="t">${o[0]}</span>${ch === oi ? `<span class="d ei-fb ${o[2] === 2 ? 'ok' : o[2] === 1 ? 'mid' : 'low'}">${DOM[o[1]].ic} ${DOM[o[1]].label} · ${o[3]}</span>` : ''}</button>`).join('')}</div></div>`; }).join('') + sitNote();
        $('ei-sits').querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { S.sits[b.dataset.s] = +b.dataset.o; MethodKit.save(); renderSits(); }));
    }
    function sitNote() {
        const done = Object.keys(S.sits).length; if (done < SITS.length) return note('info', `${done}/${SITS.length} Situationen. Wähle ehrlich – der Wert liegt im Abgleich mit deinem Profil.`);
        const pts = SITS.reduce((a, s, i) => a + s.o[S.sits[i]][2], 0);
        const sc = answered() >= 10 ? scores() : null;
        const lowDom = SITS.map((s, i) => s.o[S.sits[i]]).filter(o => o[2] === 0).map(o => o[1]);
        let m = pts >= 7 ? `${pts}/8 Punkte – deine Reaktionen sind emotional klug.` : pts >= 4 ? `${pts}/8 Punkte – teils Reflex, teils Reflexion.` : `${pts}/8 Punkte – in Situationen gewinnt oft der Impuls.`;
        if (sc && lowDom.length) { const mism = lowDom.filter(d => sc[d] >= 75); if (mism.length) m += ` Auffällig: Bei <strong>${[...new Set(mism)].map(d => DOM[d].label).join(', ')}</strong> hast du dich hoch eingeschätzt, reagierst in der Situation aber impulsiv. Genau diese Lücke zwischen Selbstbild und Verhalten ist dein Trainingsfeld.`; }
        return note(pts >= 7 ? 'ok' : 'info', m);
    }

    /* ---------- 4 ---------- */
    function renderDiary() {
        const D = S.diary.slice().reverse().slice(0, 8);
        const words = new Set(S.diary.map(e => e.word)); const fams = new Set(S.diary.map(e => e.fam));
        $('ei-diary').innerHTML = `<div class="ei-feel">${Object.entries(FEEL).map(([fam, ws]) => `<div class="ei-fam"><b>${fam}</b><div class="mk-chips">${ws.map(w => `<button class="mk-chip ${S.draft.word === w ? 'selected' : ''}" data-w="${w}" data-fam="${fam}">${w}</button>`).join('')}</div></div>`).join('')}</div>` +
            `<div class="mk-grid-2" style="margin-top:10px"><div class="mk-field"><label>Auslöser – was war gerade?</label><input class="mk-input" id="ei-trig" value="${esc(S.draft.trigger || '')}" placeholder="z. B. Mail vom Chef ohne Anrede"></div><div class="mk-field"><label>Wo im Körper?</label><input class="mk-input" id="ei-body" value="${esc(S.draft.body || '')}" placeholder="z. B. Enge im Hals, Hitze im Gesicht"></div></div><div class="mk-field"><label>Intensität <span class="mk-range-val" id="ei-intval">${n(S.draft.int, 5)}</span>/10</label><input type="range" class="mk-range" id="ei-int" min="1" max="10" value="${n(S.draft.int, 5)}"></div><button class="mk-btn mk-btn-primary" id="ei-save" ${S.draft.word ? '' : 'disabled'}><i class="fas fa-plus"></i> Eintragen</button>` +
            (S.diary.length ? `<div class="mk-section-label" style="margin-top:16px">Deine Einträge (${S.diary.length}) · ${words.size} verschiedene Wörter · ${fams.size}/5 Familien</div>${diaryNote(words, fams)}<div class="ei-log">${D.map(e => `<div class="ei-log-e"><span class="ei-log-w" style="--c:${famColor(e.fam)}">${e.word}</span><span class="ei-log-i">${e.int}/10</span><span class="ei-log-t">${esc(e.trigger || '')}${e.body ? ` · <i>${esc(e.body)}</i>` : ''}</span><small>${new Date(e.date).toLocaleDateString('de-CH', { day: 'numeric', month: 'numeric' })}</small></div>`).join('')}</div>` : note('info', 'Noch keine Einträge. Was fühlst du jetzt gerade – such das genaueste Wort.'));
        const host = $('ei-diary');
        host.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { S.draft.word = S.draft.word === b.dataset.w ? '' : b.dataset.w; S.draft.fam = b.dataset.fam; MethodKit.save(); renderDiary(); }));
        $('ei-trig').addEventListener('input', e => { S.draft.trigger = e.target.value; MethodKit.save(); });
        $('ei-body').addEventListener('input', e => { S.draft.body = e.target.value; MethodKit.save(); });
        $('ei-int').addEventListener('input', e => { S.draft.int = +e.target.value; $('ei-intval').textContent = e.target.value; MethodKit.save(); });
        $('ei-save').addEventListener('click', () => { if (!S.draft.word) return; S.diary.push({ date: Date.now(), word: S.draft.word, fam: S.draft.fam, trigger: S.draft.trigger || '', body: S.draft.body || '', int: n(S.draft.int, 5) }); S.draft = { word: '', fam: '', trigger: '', body: '', int: 5 }; MethodKit.save({ now: true }); MethodKit.toast('Eingetragen', 'ok'); renderDiary(); });
    }
    const famColor = (f) => ({ 'Freude': '#10b981', 'Ärger': '#ef4444', 'Angst': '#f59e0b', 'Traurigkeit': '#6366f1', 'Überraschung': '#a855f7' })[f] || '#94a3b8';
    function diaryNote(words, fams) {
        const N = S.diary.length; if (N < 3) return '';
        const neg = S.diary.filter(e => e.fam !== 'Freude').length / N, noBody = S.diary.filter(e => !e.body).length / N;
        if (words.size <= 2 && N >= 4) return note('info', `${N} Einträge, aber nur ${words.size === 1 ? 'ein einziges Wort' : words.size + ' verschiedene Wörter'}. Granularität ist der Hebel: Je feiner du unterscheidest (gereizt ≠ frustriert ≠ wütend), desto gezielter kannst du reagieren.`);
        if (fams.size === 1 && N >= 4) return note('info', `Alle Einträge aus einer Familie (${[...fams][0]}). Entweder ist gerade viel los – oder die anderen Gefühle sind leiser und du übersiehst sie. Trag auch das Unauffällige ein.`);
        if (noBody > 0.6) return note('info', 'Bei den meisten Einträgen fehlt der Körper. Gefühle sind zuerst körperlich – wer den Ort kennt, erkennt sie früher.');
        if (neg >= 0.85 && N >= 5) return note('info', `${Math.round(neg * 100)} % unangenehme Gefühle. Normal beim Tagebuch – wir notieren, was stört. Aber: Trag bewusst auch einen angenehmen Moment pro Tag ein, sonst verzerrt sich das Bild.`);
        return note('ok', `${words.size} verschiedene Gefühlswörter in ${fams.size} Familien – gute Granularität. Weiter so: Ein Eintrag pro Tag reicht.`);
    }

    /* ---------- 5 ---------- */
    function renderTrain() {
        if (answered() < 10) { $('ei-train').innerHTML = note('info', 'Beantworte zuerst die Selbsteinschätzung.'); return; }
        const sc = scores(); const sorted = Object.keys(DOM).sort((a, b) => sc[a] - sc[b]);
        const focus = S.focus && DOM[S.focus] ? S.focus : (sc.self < 70 && sorted[0] !== 'self' && sc.self - sc[sorted[0]] < 15 ? 'self' : sorted[0]);
        const d = DOM[focus], T = S.train || {};
        $('ei-train').innerHTML = `<div class="mk-field"><label>Dein Trainingsfeld</label><div class="mk-chips">${sorted.map(k => `<button class="mk-chip ${k === focus ? 'selected' : ''}" data-focus="${k}">${DOM[k].ic} ${DOM[k].label} · ${sc[k]} %</button>`).join('')}</div></div>` +
            `<div class="ei-train-h" style="--c:${d.c}"><span>${d.ic}</span><div><b>${d.label}</b><small>${d[level(sc[focus])]}</small></div></div><div class="mk-section-label">Wähle eine Übung für die nächsten 14 Tage</div><div class="ei-ex">${d.ex.map((e, i) => `<button class="mk-option ${T.ex === i ? 'selected' : ''}" data-ex="${i}"><span class="t">${e[0]}</span><span class="d">${e[1]}</span></button>`).join('')}</div>` +
            `<div class="mk-grid-2" style="margin-top:10px"><div class="mk-field"><label>Wann genau? (Auslöser im Alltag)</label><input class="mk-input" id="ei-when" value="${esc(T.when || '')}" placeholder="z. B. nach jedem Meeting / beim Zähneputzen"></div><div class="mk-field"><label>Woran merke ich nach 14 Tagen einen Unterschied?</label><input class="mk-input" id="ei-sign" value="${esc(T.sign || '')}" placeholder="z. B. Ich habe dreimal die Pause geschafft, bevor ich geantwortet habe"></div></div>` + trainNote(T, d) +
            `<div class="mk-result" style="margin-top:14px"><h4>Dein EQ-Profil</h4><div class="ei-sum">${Object.keys(DOM).sort((a, b) => sc[b] - sc[a]).map(k => `<span style="--c:${DOM[k].c}">${DOM[k].ic} ${DOM[k].label} <b>${sc[k]} %</b></span>`).join('')}</div>${Object.keys(S.sits).length === SITS.length ? `<div class="mk-faint" style="font-size:13px; margin-top:6px">Situationstest: ${SITS.reduce((a, s, i) => a + s.o[S.sits[i]][2], 0)}/8</div>` : ''}${S.diary.length ? `<div class="mk-faint" style="font-size:13px">Gefühlstagebuch: ${S.diary.length} Einträge · ${new Set(S.diary.map(e => e.word)).size} Wörter</div>` : ''}${T.ex !== undefined ? `<div style="margin-top:6px"><b>Training:</b> ${d.ex[T.ex][0]}${T.when ? ` – ${esc(T.when)}` : ''}</div>` : ''}</div>`;
        const host = $('ei-train');
        host.querySelectorAll('[data-focus]').forEach(b => b.addEventListener('click', () => { S.focus = b.dataset.focus; S.train = {}; MethodKit.save(); renderTrain(); }));
        host.querySelectorAll('[data-ex]').forEach(b => b.addEventListener('click', () => { S.train = S.train || {}; S.train.ex = +b.dataset.ex; MethodKit.save(); renderTrain(); }));
        $('ei-when').addEventListener('input', e => { S.train = S.train || {}; S.train.when = e.target.value; MethodKit.save(); }); $('ei-when').addEventListener('change', renderTrain);
        $('ei-sign').addEventListener('input', e => { S.train = S.train || {}; S.train.sign = e.target.value; MethodKit.save(); }); $('ei-sign').addEventListener('change', renderTrain);
    }
    function trainNote(T, d) {
        if (T.ex === undefined) return note('info', 'Eine Übung, nicht drei. EQ wächst durch Wiederholung in echten Situationen – nicht durch Wissen.');
        if (!(T.when || '').trim()) return note('info', 'Koppel die Übung an einen festen Moment – sonst vergisst du sie am zweiten Tag.');
        if (!(T.sign || '').trim()) return note('info', 'Wie erkennst du, dass es wirkt? Ein beobachtbares Zeichen, keine Stimmung.');
        return note('ok', `14 Tage ${d.ex[T.ex][0]} – ${esc(T.when)}. Danach den Test wiederholen und vergleichen.`);
    }
    function renderLinks() { $('ei-links').innerHTML = LINKS.map(x => `<a class="mk-option ei-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const sc = scores(); const L = ['EQ-PROFIL', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        Object.keys(DOM).sort((a, b) => sc[b] - sc[a]).forEach(d => L.push(`${DOM[d].ic} ${DOM[d].label}: ${sc[d]} % – ${DOM[d][level(sc[d])]}`));
        const cons = consistency(); if (cons.length) L.push('', 'Konsistenz-Hinweis: ' + cons.map(f => DOM[f.d].label).join(', '));
        if (Object.keys(S.sits).length) { L.push('', 'SITUATIONEN'); SITS.forEach((s, i) => { if (S.sits[i] !== undefined) L.push(`  ${i + 1}. ${s.o[S.sits[i]][0]} (${s.o[S.sits[i]][2]}/2)`); }); }
        if (S.diary.length) { L.push('', 'GEFÜHLSTAGEBUCH'); S.diary.forEach(e => L.push(`  ${new Date(e.date).toLocaleDateString('de-CH')} – ${e.word} (${e.int}/10)${e.trigger ? `: ${e.trigger}` : ''}${e.body ? ` [${e.body}]` : ''}`)); }
        const T = S.train || {}; if (S.focus && T.ex !== undefined) L.push('', 'TRAINING', `${DOM[S.focus].label}: ${DOM[S.focus].ex[T.ex][0]}`, DOM[S.focus].ex[T.ex][1], T.when ? `Wann: ${T.when}` : '', T.sign ? `Zeichen: ${T.sign}` : '');
        MethodKit.exportText('eq-profil.txt', L.filter(x => x !== undefined).join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'emotional-intelligence', accent: '#a855f7', accent2: '#ec4899',
            steps: [{ icon: '📝', label: 'Test' }, { icon: '📊', label: 'Profil' }, { icon: '🎭', label: 'Situationen' }, { icon: '📓', label: 'Tagebuch' }, { icon: '🏋️', label: 'Training' }],
            defaultState: { answers: {}, sits: {}, diary: [], draft: { word: '', fam: '', trigger: '', body: '', int: 5 }, focus: '', train: {} }
        });
        S = MethodKit.state;
        ['answers', 'sits', 'train'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        if (!Array.isArray(S.diary)) S.diary = []; if (!S.draft || typeof S.draft !== 'object') S.draft = { word: '', fam: '', trigger: '', body: '', int: 5 };
        $('ei-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) renderItems();
            if (k === 2) renderResults();
            if (k === 3) renderSits();
            if (k === 4) renderDiary();
            if (k === 5) { renderTrain(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
