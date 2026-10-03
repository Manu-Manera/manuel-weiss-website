/* Gallup-Stärkendomänen · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    // [Name, Kurzbeschreibung, Schattenseite]
    const DOMAINS = [
        { id: 'exec', ic: '⚙️', t: 'Ausführen', c: '#6366f1', insight: 'Du machst Dinge möglich: Du setzt um und bringst Ziele über die Ziellinie.', need: 'Menschen, die Ideen in Ergebnisse verwandeln, Deadlines halten und dranbleiben.', t34: [['Leistungsorientierung', 'Du brauchst jeden Tag ein Ergebnis, sonst fühlt er sich verloren an', 'Rastlos, kann nicht abschalten, misst Menschen am Output'], ['Organisationstalent', 'Du jonglierst Variablen und findest die beste Anordnung', 'Ändert ständig Pläne, verwirrt andere mit Optimierungen'], ['Überzeugung', 'Feste Werte bestimmen dein Handeln – Sinn vor Geld', 'Unflexibel, moralisierend, verurteilt andere Prioritäten'], ['Gleichmut', 'Du behandelst alle gleich und willst klare, stabile Regeln', 'Bürokratisch, zu wenig Raum für Ausnahmen und Individualität'], ['Behutsamkeit', 'Du wägst Risiken sorgfältig ab, bevor du handelst', 'Zögerlich, misstrauisch, bremst Entscheidungen'], ['Disziplin', 'Du brauchst Routine, Struktur und Ordnung', 'Starr, perfektionistisch, kommt mit Chaos schlecht klar'], ['Fokus', 'Du setzt dir Ziele und filterst alles aus, was ablenkt', 'Tunnelblick, ungeduldig mit Umwegen, übersieht Nebenschauplätze'], ['Verantwortungsgefühl', 'Was du zusagst, hältst du – psychologisch verpflichtend', 'Kann nicht Nein sagen, überlastet sich, misstraut Delegation'], ['Wiederherstellung', 'Du liebst es, Probleme zu lösen und Kaputtes zu reparieren', 'Sieht überall Defizite, vernachlässigt, was funktioniert']] },
        { id: 'infl', ic: '📣', t: 'Einfluss nehmen', c: '#ec4899', insight: 'Du nimmst andere mit: Du sprichst, überzeugst und trägst Ideen nach aussen.', need: 'Menschen, die das Wort ergreifen, verkaufen, Gehör verschaffen und Energie erzeugen.', t34: [['Aktivierung', 'Du willst anfangen – jetzt. Handeln ist der beste Lehrer', 'Ungeduldig, vorschnell, überrollt die Bedenkenträger'], ['Autorität', 'Du übernimmst das Steuer und scheust keine Konfrontation', 'Dominant, einschüchternd, hört zu wenig zu'], ['Kommunikation', 'Du erklärst, erzählst, schreibst – und machst Ideen lebendig', 'Redet zu viel, hört zu wenig, Form vor Inhalt'], ['Wettbewerb', 'Du misst dich an anderen und willst gewinnen', 'Schlechter Verlierer, macht alles zum Rennen, verliert Kooperation'], ['Maximierung', 'Du machst aus Gutem Exzellentes – Stärken statt Schwächen', 'Elitär, ungeduldig mit Mittelmass, meidet Reparatur-Arbeit'], ['Selbstbewusstsein', 'Du vertraust deinem Urteil und steuerst dein Leben', 'Arrogant, beratungsresistent, Risiken unterschätzt'], ['Bedeutsamkeit', 'Du willst gesehen werden und Spuren hinterlassen', 'Braucht Anerkennung, wirkt eitel, Ego vor Sache'], ['Kontaktfreudigkeit', 'Du gewinnst Fremde für dich – jeder Raum ist eine Chance', 'Oberflächlich, zu viele Bekannte, zu wenig Tiefe']] },
        { id: 'rel', ic: '🤝', t: 'Beziehungen aufbauen', c: '#22c55e', insight: 'Du bist der Kitt im Team: Du verbindest Menschen und schaffst Zusammenhalt.', need: 'Menschen, die Vertrauen aufbauen, Stimmungen spüren und ein Team zusammenhalten.', t34: [['Anpassungsfähigkeit', 'Du lebst im Jetzt und reagierst gelassen auf Veränderung', 'Richtungslos, planlos, wirkt unverbindlich'], ['Verbundenheit', 'Du glaubst, dass alles zusammenhängt und Sinn hat', 'Abgehoben, zu wenig pragmatisch, passiv-schicksalsgläubig'], ['Entwicklung', 'Du siehst Potenzial in anderen und hilfst ihnen zu wachsen', 'Investiert in Hoffnungslose, vernachlässigt eigene Entwicklung'], ['Einfühlungsvermögen', 'Du spürst die Gefühle anderer, als wären es deine', 'Überwältigt, nimmt alles persönlich, kann nicht abgrenzen'], ['Harmoniestreben', 'Du suchst Konsens und meidest Reibung', 'Konfliktscheu, unklar, lässt Probleme schwelen'], ['Integration', 'Du holst Aussenstehende rein – alle gehören dazu', 'Unkritisch bei Auswahl, verwässert Standards'], ['Individualisierung', 'Du siehst, was jeden Menschen einzigartig macht', 'Macht zu viele Ausnahmen, wirkt ungerecht'], ['Positivität', 'Du steckst andere mit Begeisterung an', 'Naiv, Probleme werden nicht ernst genommen, wirkt unecht'], ['Bindungsfähigkeit', 'Du bevorzugst tiefe Beziehungen zu wenigen', 'Verschlossen gegenüber Neuen, Cliquenbildung']] },
        { id: 'strat', ic: '🧠', t: 'Strategisch denken', c: '#0ea5e9', insight: 'Du denkst voraus: Du analysierst, lernst und triffst kluge Entscheidungen.', need: 'Menschen, die Informationen sammeln, Muster erkennen und die Zukunft durchdenken.', t34: [['Analytisch', 'Du suchst Gründe und Ursachen – Beweise statt Behauptungen', 'Kalt, zerpflückt Ideen, lähmt mit Fragen'], ['Kontext', 'Du verstehst die Gegenwart durch ihre Geschichte', 'Rückwärtsgewandt, bremst Neues mit „früher…"'], ['Zukunftsorientierung', 'Du siehst, was sein könnte, und ziehst Energie daraus', 'Träumer, vernachlässigt das Heute, frustriert von Langsamkeit'], ['Ideenreichtum', 'Du bist fasziniert von Ideen und Verbindungen', 'Sprunghaft, zu viele Ideen, wenig Umsetzung'], ['Wissbegier', 'Du sammelst Informationen, Dinge, Beziehungen – alles könnte nützlich sein', 'Hortet, kommt nicht zum Punkt, Analyse ohne Ende'], ['Intellekt', 'Du brauchst geistige Aktivität und denkst gern allein nach', 'Zu viel im Kopf, zu wenig Austausch, wirkt distanziert'], ['Lernbegeisterung', 'Der Prozess des Lernens begeistert dich mehr als das Ergebnis', 'Ewiger Anfänger, lernt statt anzuwenden'], ['Strategie', 'Du siehst Muster und findest den besten Weg durchs Chaos', 'Überspringt Schritte, andere können nicht folgen, wirkt besserwisserisch']] }
    ];
    const ALL = []; DOMAINS.forEach(d => d.t34.forEach(([name, desc, shadow]) => ALL.push({ name, desc, shadow, d })));
    const LINKS = [
        { m: 'Stärken finden', l: '../strengths-finder/strengths-finder.html', why: 'Stärken nach Energie und Nutzung bewerten.' },
        { m: 'VIA-Charakterstärken', l: '../via-strengths/via-strengths.html', why: 'Charakterstärken statt Arbeitstalente.' },
        { m: 'Johari-Fenster', l: '../johari-window/johari-window.html', why: 'Welche Talente sehen andere an dir?' },
        { m: 'Kompetenz-Map', l: '../competence-map/competence-map.html', why: 'Talente in Kompetenzen übersetzen.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const T = (name) => ALL.find(x => x.name === name);
    const counts = (list) => { const c = {}; DOMAINS.forEach(d => c[d.id] = 0); list.forEach(nm => { const t = T(nm); if (t) c[t.d.id]++; }); return c; };

    /* ---------- 1 ---------- */
    function renderGroups() {
        $('gp-groups').innerHTML = DOMAINS.map(d => `<div class="gp-grp" style="--c:${d.c}"><div class="gp-grp-h"><span>${d.ic}</span><b>${d.t}</b><small>${d.t34.filter(([nm]) => S.selected.includes(nm)).length}/${d.t34.length}</small></div><div class="gp-talents">${d.t34.map(([nm, desc]) => `<button class="gp-tal ${S.selected.includes(nm) ? 'on' : ''}" data-s="${nm}"><b>${nm}</b><small>${desc}</small></button>`).join('')}</div></div>`).join('') +
            `<div class="gp-count ${S.selected.length >= 8 && S.selected.length <= 12 ? 'ok' : S.selected.length > 12 ? 'over' : ''}">${S.selected.length} gewählt</div>` +
            (S.selected.length > 12 ? note('info', `${S.selected.length} Talente – Gallup zeigt im Standard-Report nur die Top 5, weil die den Unterschied machen. Streiche, was nur „ein bisschen" zutrifft.`) : S.selected.length >= 8 ? note('ok', 'Gute Grundlage. Im nächsten Schritt wählst und ordnest du die Top 5.') : S.selected.length ? note('info', `Noch ${8 - S.selected.length} mehr für ein belastbares Profil.`) : '');
        $('gp-groups').querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.s; if (S.selected.includes(v)) { S.selected = S.selected.filter(x => x !== v); S.top = S.top.filter(x => x !== v); } else S.selected.push(v); MethodKit.save(); renderGroups(); }));
    }

    /* ---------- 2 ---------- */
    function renderTop() {
        if (S.selected.length < 5) { $('gp-top').innerHTML = note('info', 'Wähle zuerst mindestens fünf Talente in Schritt 1.'); return; }
        S.top = S.top.filter(v => S.selected.includes(v));
        $('gp-top').innerHTML = `<div class="gp-toplist">${[0, 1, 2, 3, 4].map(i => { const nm = S.top[i]; const t = nm ? T(nm) : null; return `<div class="gp-slot ${t ? 'filled' : ''}" style="--c:${t ? t.d.c : 'var(--mk-line)'}"><span class="gp-rank">${i + 1}</span>${t ? `<div class="gp-slot-b"><b>${t.name}</b><small>${t.d.ic} ${t.d.t}</small></div><div class="gp-slot-act">${i > 0 ? `<button class="mk-iconbtn" data-up="${i}" aria-label="Nach oben"><i class="fas fa-arrow-up"></i></button>` : ''}${i < S.top.length - 1 ? `<button class="mk-iconbtn" data-down="${i}" aria-label="Nach unten"><i class="fas fa-arrow-down"></i></button>` : ''}<button class="mk-iconbtn" data-rm="${i}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>` : '<span class="mk-faint">leer</span>'}</div>`; }).join('')}</div><div class="mk-section-label" style="margin-top:12px">Aus deiner Auswahl</div><div class="mk-chips">${S.selected.filter(v => !S.top.includes(v)).map(v => `<button class="mk-chip" data-add="${v}" style="--c:${T(v).d.c}">${T(v).d.ic} ${v}</button>`).join('') || '<span class="mk-faint">Alle gewählten Talente sind in den Top 5.</span>'}</div>` +
            (S.top.length === 5 ? (() => { const c = counts(S.top); const doms = Object.values(c).filter(Boolean).length; return doms === 1 ? note('info', `Alle fünf aus <strong>${DOMAINS.find(d => c[d.id]).t}</strong>. Ein sehr klares Profil – und eine klare Lücke. Schritt 4 wird wichtig.`) : doms === 4 ? note('ok', 'Top 5 über alle vier Domänen verteilt – selten. Du bist ein Generalist; deine Herausforderung ist Fokus, nicht Ergänzung.') : note('ok', `Top 5 komplett – aus ${doms} Domänen.`); })() : `<div class="mk-faint">${S.top.length}/5 – klicke Talente unten, um sie hinzuzufügen.</div>`);
        const h = $('gp-top');
        h.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => { if (S.top.length >= 5) { MethodKit.toast('Top 5 ist voll – erst eines entfernen', 'warn'); return; } S.top.push(b.dataset.add); MethodKit.save(); renderTop(); }));
        h.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { S.top.splice(+b.dataset.rm, 1); MethodKit.save(); renderTop(); }));
        h.querySelectorAll('[data-up]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.up;[S.top[i - 1], S.top[i]] = [S.top[i], S.top[i - 1]]; MethodKit.save(); renderTop(); }));
        h.querySelectorAll('[data-down]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.down;[S.top[i + 1], S.top[i]] = [S.top[i], S.top[i + 1]]; MethodKit.save(); renderTop(); }));
    }

    /* ---------- 3 ---------- */
    function renderProfile() {
        const list = S.top.length === 5 ? S.top : S.selected;
        if (!list.length) { $('gp-profile').innerHTML = note('info', 'Wähle zuerst Talente.'); return; }
        const c = counts(list); const total = list.length; const sorted = [...DOMAINS].sort((a, b) => c[b.id] - c[a.id]);
        const cAll = counts(S.selected);
        $('gp-profile').innerHTML = `<div class="mk-faint" style="margin-bottom:8px">Basis: ${S.top.length === 5 ? 'deine Top 5' : `alle ${total} gewählten Talente`}</div><div class="gp-bars">${sorted.map(d => `<div class="gp-bar-row"><span class="gp-bar-l">${d.ic} ${d.t}</span><div class="gp-bar"><i style="width:${c[d.id] / total * 100}%;background:${d.c}"></i></div><strong>${c[d.id]}</strong>${S.top.length === 5 && cAll[d.id] !== c[d.id] ? `<small>(${cAll[d.id]} gesamt)</small>` : '<small></small>'}</div>`).join('')}</div>` +
            `<div class="mk-result" style="margin-top:12px"><h4>${sorted[0].ic} Dominante Domäne: ${sorted[0].t}</h4>${sorted[0].insight}${c[sorted[1].id] && c[sorted[1].id] >= c[sorted[0].id] - 1 ? `<div style="margin-top:6px">Fast gleichauf: <strong>${sorted[1].t}</strong>. ${{ 'exec+infl': 'Du setzt um und bringst andere dazu, mitzuziehen – ein Macher-Profil.', 'exec+rel': 'Du lieferst – und nimmst die Menschen dabei mit. Ein Profil für Teamführung.', 'exec+strat': 'Du denkst voraus und setzt um. Du brauchst jemanden, der dafür Gehör verschafft.', 'infl+rel': 'Du bewegst Menschen – nach aussen und innen. Achte darauf, dass auch etwas fertig wird.', 'infl+strat': 'Du siehst, wohin es geht, und überzeugst andere davon. Ein Visionärs-Profil.', 'rel+strat': 'Du verstehst Menschen und Zusammenhänge. Dein Hebel: jemand, der deine Erkenntnisse in Taten übersetzt.' }[[sorted[0].id, sorted[1].id].sort().join('+')] || ''}</div>` : ''}</div>` +
            (c[sorted[3].id] === 0 ? note('info', `<strong>${sorted[3].ic} ${sorted[3].t}: kein Talent.</strong> Das ist keine Schwäche, sondern eine Information: ${sorted[3].need} Schritt 4 zeigt, wer das für dich übernimmt.`) : '');
    }
    function renderDetail() {
        if (!S.top.length) { $('gp-detail').innerHTML = note('info', 'Ordne zuerst deine Top 5 in Schritt 2.'); return; }
        $('gp-detail').innerHTML = S.top.map((nm, i) => { const t = T(nm); const m = S.mine[nm] || ''; return `<div class="gp-det" style="--c:${t.d.c}"><div class="gp-det-h"><span class="gp-rank">${i + 1}</span><b>${t.name}</b><small>${t.d.ic} ${t.d.t}</small></div><p>${t.desc}.</p><div class="gp-shadow"><b>Schattenseite</b>${t.shadow}</div><input class="mk-input" data-mine="${nm}" value="${esc(m)}" placeholder="Wie zeigt sich ${t.name} bei dir konkret? Eine Situation."></div>`; }).join('');
        $('gp-detail').querySelectorAll('[data-mine]').forEach(inp => inp.addEventListener('input', () => { S.mine[inp.dataset.mine] = inp.value; MethodKit.save(); }));
    }

    /* ---------- 4 ---------- */
    function renderTeam() {
        const list = S.top.length === 5 ? S.top : S.selected;
        if (!list.length) { $('gp-team').innerHTML = note('info', 'Wähle zuerst Talente.'); return; }
        const c = counts(list); const weak = [...DOMAINS].sort((a, b) => c[a.id] - c[b.id]).filter(d => c[d.id] <= Math.min(...Object.values(c)));
        $('gp-team').innerHTML = weak.map(d => `<div class="gp-need" style="--c:${d.c}"><div class="gp-need-h"><span>${d.ic}</span><div><b>${d.t}</b> – ${c[d.id] === 0 ? 'bei dir nicht vertreten' : `bei dir schwach (${c[d.id]})`}</div></div><p>${d.need}</p><div class="mk-faint">Typische Talente: ${d.t34.slice(0, 4).map(x => x[0]).join(', ')} …</div><input class="mk-input" data-partner="${d.id}" value="${esc(S.partners[d.id] || '')}" placeholder="Wer in deinem Umfeld hat das? Name – und wofür du ihn oder sie einbindest."></div>`).join('') +
            (weak.every(d => (S.partners[d.id] || '').trim()) ? note('ok', 'Für jede schwache Domäne hast du jemanden. Das ist der Gallup-Weg: nicht Schwächen beheben, sondern ergänzen.') : note('info', 'Wer dir fehlt, muss nicht im Team sein – ein Mentor, eine Freundin oder ein Sparringspartner reicht oft.'));
        $('gp-team').querySelectorAll('[data-partner]').forEach(inp => { inp.addEventListener('input', () => { S.partners[inp.dataset.partner] = inp.value; MethodKit.save(); }); inp.addEventListener('change', renderTeam); });
    }
    function renderSummary() {
        if (!S.top.length) { $('gp-summary').innerHTML = ''; return; }
        const t1 = T(S.top[0]);
        $('gp-summary').innerHTML = `<div class="mk-result" style="margin-top:12px"><h4>Dein Profil</h4><div class="gp-sum">${S.top.map((nm, i) => `<span style="--c:${T(nm).d.c}">${i + 1}. ${nm}</span>`).join('')}</div>${S.aim ? `<div style="margin-top:8px"><b>Diese Woche (${t1.name}):</b> ${esc(S.aim)}</div>` : ''}${S.watch ? `<div><b>Achte auf:</b> ${esc(S.watch)}</div>` : `<div class="mk-faint">Schattenseite von ${t1.name}: ${t1.shadow}</div>`}</div>`;
    }
    function renderLinks() { $('gp-links').innerHTML = LINKS.map(x => `<a class="mk-option gp-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const c = counts(S.top.length === 5 ? S.top : S.selected);
        const L = ['CLIFTONSTRENGTHS-DOMÄNEN', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'TOP 5'];
        S.top.forEach((nm, i) => { const t = T(nm); L.push(`${i + 1}. ${nm} (${t.d.t})`, `   ${t.desc}`, `   Schattenseite: ${t.shadow}`, S.mine[nm] ? `   Bei mir: ${S.mine[nm]}` : ''); });
        L.push('', 'DOMÄNEN'); DOMAINS.forEach(d => L.push(`${d.ic} ${d.t}: ${c[d.id]} – ${d.t34.filter(x => S.selected.includes(x[0])).map(x => x[0]).join(', ') || '–'}`));
        const P = Object.entries(S.partners).filter(([, v]) => v); if (P.length) { L.push('', 'ERGÄNZUNG'); P.forEach(([id, v]) => L.push(`${DOMAINS.find(d => d.id === id).t}: ${v}`)); }
        if (S.aim) L.push('', 'Diese Woche: ' + S.aim); if (S.watch) L.push('Achte auf: ' + S.watch);
        MethodKit.exportText('gallup-staerken.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'gallup-strengths', accent: '#6366f1', accent2: '#0ea5e9',
            steps: [{ icon: '🔎', label: 'Talente' }, { icon: '🏆', label: 'Top 5' }, { icon: '📊', label: 'Profil' }, { icon: '🤝', label: 'Team' }],
            defaultState: { selected: [], top: [], mine: {}, partners: {}, aim: '', watch: '' }
        });
        S = MethodKit.state;
        ['selected', 'top'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        ['mine', 'partners'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        S.selected = S.selected.filter(nm => T(nm)); S.top = S.top.filter(nm => T(nm)).slice(0, 5);
        MethodKit.bindFields();
        $('gp-export').addEventListener('click', exportAll);
        ['gp-aim', 'gp-watch'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 1) renderGroups();
            if (k === 2) renderTop();
            if (k === 3) { renderProfile(); renderDetail(); }
            if (k === 4) { renderTeam(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
