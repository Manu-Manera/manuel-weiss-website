/* Johari-Fenster · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    // Die 56 klassischen Johari-Adjektive (deutsch)
    const ADJ = ['fähig', 'akzeptierend', 'anpassungsfähig', 'mutig', 'ruhig', 'fürsorglich', 'fröhlich', 'klug', 'komplex', 'selbstbewusst', 'zuverlässig', 'würdevoll', 'einfühlsam', 'energisch', 'extrovertiert', 'freundlich', 'hilfsbereit', 'idealistisch', 'unabhängig', 'erfinderisch', 'intelligent', 'introvertiert', 'gütig', 'wissbegierig', 'logisch', 'liebevoll', 'reif', 'bescheiden', 'nervös', 'aufmerksam', 'organisiert', 'geduldig', 'kraftvoll', 'stolz', 'still', 'reflektiert', 'entspannt', 'religiös', 'ansprechbar', 'suchend', 'selbstsicher', 'selbstbestimmt', 'sentimental', 'schüchtern', 'albern', 'spontan', 'sympathisch', 'angespannt', 'vertrauenswürdig', 'warmherzig', 'weise', 'humorvoll', 'ehrgeizig', 'durchsetzungsstark', 'kreativ', 'ehrlich'];
    const NEG = ['nervös', 'angespannt', 'schüchtern', 'albern', 'stolz', 'komplex', 'sentimental', 'still', 'introvertiert'];
    const LINKS = [
        { m: 'Selbsteinschätzung', l: '../self-assessment/self-assessment.html', why: 'Kompetenzen mit Fremdbild abgleichen.' },
        { m: 'Stärken finden', l: '../strengths-finder/strengths-finder.html', why: 'Die Eigenschaften aus dem offenen Bereich als Stärken nutzen.' },
        { m: '4-Ohren-Modell', l: '../communication/communication.html', why: 'Wie du wirkst, hängt davon ab, wie du sendest.' },
        { m: 'Gewaltfreie Kommunikation', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Sich mitteilen, ohne sich zu verteidigen.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const raters = () => S.raters.filter(r => r.adj.length);
    const counts = () => { const c = {}; raters().forEach(r => r.adj.forEach(a => c[a] = (c[a] || 0) + 1)); return c; };
    const othersSet = () => Object.keys(counts());
    const win = () => { const O = othersSet(), c = counts(); return { open: S.self.filter(a => O.includes(a)).sort((a, b) => c[b] - c[a]), hidden: S.self.filter(a => !O.includes(a)), blind: O.filter(a => !S.self.includes(a)).sort((a, b) => c[b] - c[a]), unknown: ADJ.filter(a => !S.self.includes(a) && !O.includes(a)), c }; };

    /* ---------- 1 ---------- */
    function renderSelf() {
        const nSel = S.self.length;
        $('jo-self').innerHTML = `<div class="jo-count ${nSel > 8 ? 'over' : nSel >= 5 ? 'ok' : ''}">${nSel} gewählt</div><div class="mk-chips jo-chips">${ADJ.map(a => `<button class="mk-chip ${S.self.includes(a) ? 'selected' : ''}" data-a="${a}">${a}</button>`).join('')}</div>` +
            (nSel > 8 ? note('warn', `${nSel} Eigenschaften – das Fenster wird unscharf. Welche fünf bis acht sind wirklich typisch?`) : nSel >= 5 ? (S.self.some(a => NEG.includes(a)) ? note('ok', `Du hast auch weniger schmeichelhafte Eigenschaften gewählt (${S.self.filter(a => NEG.includes(a)).join(', ')}). Das ist ein Zeichen für ein ehrliches Selbstbild.`) : note('info', 'Nur positive Eigenschaften? Das ist normal – und genau deshalb lohnt sich das Fremdbild. Niemand ist nur „zuverlässig, freundlich, klug".')) : '');
        $('jo-self').querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { const a = b.dataset.a; S.self = S.self.includes(a) ? S.self.filter(x => x !== a) : [...S.self, a]; MethodKit.save(); renderSelf(); }));
    }

    /* ---------- 2 ---------- */
    function renderRaters() {
        if (!S.raters.length) S.raters.push({ id: MethodKit.uid(), name: '', rel: '', adj: [] });
        if (S.openRater === undefined || !S.raters.some(r => r.id === S.openRater)) S.openRater = S.raters[0].id;
        $('jo-raters').innerHTML = `<div class="jo-rtabs">${S.raters.map((r, i) => `<button class="jo-rtab ${S.openRater === r.id ? 'on' : ''}" data-rt="${r.id}">${esc(r.name || 'Person ' + (i + 1))}<small>${r.adj.length}</small></button>`).join('')}${S.raters.length < 6 ? `<button class="jo-rtab add" id="jo-radd" aria-label="Person hinzufügen"><i class="fas fa-plus"></i></button>` : ''}</div>` +
            S.raters.filter(r => r.id === S.openRater).map(r => `<div class="jo-rater"><div class="mk-grid-2"><div class="mk-field"><label>Name</label><input class="mk-input" data-rn="${r.id}" value="${esc(r.name)}" placeholder="z. B. Lena"></div><div class="mk-field"><label>Beziehung</label><select class="mk-select" data-rr="${r.id}"><option value="">–</option>${[['work', 'Arbeit / Kollegin'], ['boss', 'Vorgesetzte/r'], ['friend', 'Freund/in'], ['family', 'Familie'], ['partner', 'Partner/in'], ['other', 'Sonstige']].map(([v, l]) => `<option value="${v}" ${r.rel === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div><div class="jo-count ${r.adj.length > 8 ? 'over' : r.adj.length >= 5 ? 'ok' : ''}">${r.adj.length} gewählt</div><div class="mk-chips jo-chips">${ADJ.map(a => `<button class="mk-chip ${r.adj.includes(a) ? 'selected' : ''} ${S.self.includes(a) ? 'mine' : ''}" data-ra="${a}">${a}</button>`).join('')}</div><div class="mk-faint" style="margin-top:6px">Umrandet = steht auch in deinem Selbstbild</div>${S.raters.length > 1 ? `<button class="mk-btn mk-btn-outline mk-btn-sm" style="margin-top:10px" data-rdel="${r.id}"><i class="fas fa-trash"></i> Person entfernen</button>` : ''}</div>`).join('') +
            (() => { const R = raters(); const rels = new Set(R.map(r => r.rel).filter(Boolean)); return R.length === 0 ? note('info', 'Noch kein Fremdbild. Ohne echte Rückmeldung bleibt das Fenster eine Vermutung – frag wirklich jemanden.') : R.length === 1 ? note('info', 'Ein Fremdbild zeigt, wie <em>eine</em> Person dich sieht. Ab drei Personen siehst du Muster.') : rels.size === 1 && R.length >= 2 ? note('info', 'Alle Feedbackgeber aus demselben Kontext. Wie dich Kollegen sehen, kann sich stark davon unterscheiden, wie dich Freunde sehen – mische die Perspektiven.') : note('ok', `${R.length} Fremdbilder${rels.size > 1 ? ' aus ' + rels.size + ' Kontexten' : ''}. Das Fenster ist aussagekräftig.`); })();
        const host = $('jo-raters');
        host.querySelectorAll('[data-rt]').forEach(b => b.addEventListener('click', () => { S.openRater = b.dataset.rt; renderRaters(); }));
        const add = $('jo-radd'); if (add) add.addEventListener('click', () => { const r = { id: MethodKit.uid(), name: '', rel: '', adj: [] }; S.raters.push(r); S.openRater = r.id; MethodKit.save(); renderRaters(); });
        host.querySelectorAll('[data-rn]').forEach(i => { i.addEventListener('input', () => { S.raters.find(r => r.id === i.dataset.rn).name = i.value; MethodKit.save(); }); i.addEventListener('change', renderRaters); });
        host.querySelectorAll('[data-rr]').forEach(s => s.addEventListener('change', () => { S.raters.find(r => r.id === s.dataset.rr).rel = s.value; MethodKit.save(); renderRaters(); }));
        host.querySelectorAll('[data-ra]').forEach(b => b.addEventListener('click', () => { const r = S.raters.find(x => x.id === S.openRater); const a = b.dataset.ra; r.adj = r.adj.includes(a) ? r.adj.filter(x => x !== a) : [...r.adj, a]; MethodKit.save(); renderRaters(); }));
        host.querySelectorAll('[data-rdel]').forEach(b => b.addEventListener('click', () => { S.raters = S.raters.filter(r => r.id !== b.dataset.rdel); S.openRater = S.raters[0] && S.raters[0].id; MethodKit.save(); renderRaters(); }));
    }

    /* ---------- 3 ---------- */
    function tag(a, c, max) { const w = c && max ? c[a] / max : 0; return `<span class="jo-tag ${w >= 0.67 ? 'strong' : ''}" ${c && c[a] ? `title="${c[a]} von ${max} Personen"` : ''}>${a}${c && c[a] > 1 ? `<small>×${c[a]}</small>` : ''}</span>`; }
    function renderWindow() {
        const W = win(); const nR = raters().length; const max = nR || 1;
        if (!S.self.length && !nR) { $('jo-window').innerHTML = note('info', 'Wähle zuerst dein Selbstbild und trage mindestens ein Fremdbild ein.'); return; }
        const total = W.open.length + W.hidden.length + W.blind.length || 1;
        const openPct = Math.round(W.open.length / total * 100);
        $('jo-window').innerHTML = `<div class="jo-axes"><span></span><span>Mir bekannt</span><span>Mir unbekannt</span></div><div class="jo-grid"><span class="jo-axis-y">Anderen bekannt</span><div class="jo-q open" style="--w:${Math.max(20, 20 + W.open.length * 8)}%"><b>Offen</b><small>${W.open.length}</small><div>${W.open.length ? W.open.map(a => tag(a, W.c, max)).join('') : '<span class="mk-faint">–</span>'}</div></div><div class="jo-q blind"><b>Blinder Fleck</b><small>${W.blind.length}</small><div>${W.blind.length ? W.blind.map(a => tag(a, W.c, max)).join('') : '<span class="mk-faint">–</span>'}</div></div><span class="jo-axis-y">Anderen unbekannt</span><div class="jo-q hidden"><b>Verborgen</b><small>${W.hidden.length}</small><div>${W.hidden.length ? W.hidden.map(a => tag(a)).join('') : '<span class="mk-faint">–</span>'}</div></div><div class="jo-q unknown"><b>Unbekannt</b><small>${W.unknown.length}</small><div class="mk-faint" style="font-size:12px">${W.unknown.length} Eigenschaften, die weder du noch andere genannt haben – Potenzial oder schlicht nicht du.</div></div></div>` +
            (nR ? `<div class="jo-stats"><div><b>${openPct} %</b><span>offener Bereich</span></div><div><b>${W.blind.length}</b><span>blinde Flecken</span></div><div><b>${W.hidden.length}</b><span>verborgen</span></div><div><b>${nR}</b><span>Feedbackgeber</span></div></div>` : '') +
            (!nR ? note('info', 'Ohne Fremdbild gibt es keinen blinden Fleck und keinen offenen Bereich – alles ist „verborgen". Trag in Schritt 2 ein, was andere sagen.') : '') +
            (nR && W.open.length === 0 ? note('warn', 'Kein einziges Wort überschneidet sich. Entweder sehen dich andere völlig anders, als du dich siehst – oder die Feedbackgeber kennen dich kaum. Beides ist eine wichtige Information.') : '') +
            (nR && openPct >= 60 ? note('ok', `${openPct} % offen – Selbst- und Fremdbild decken sich weitgehend. Du bist für andere lesbar.`) : '') +
            (nR && W.blind.length > W.open.length ? note('info', `Mehr blinde Flecken (${W.blind.length}) als Offenes (${W.open.length}). Andere sehen Seiten an dir, die du nicht auf dem Schirm hast. Lies die blinden Flecken langsam – welche sind ein Geschenk?`) : '') +
            (nR >= 2 && W.blind.some(a => W.c[a] === nR) ? note('warn', `<strong>Alle</strong> Feedbackgeber nennen: ${W.blind.filter(a => W.c[a] === nR).join(', ')} – und du selbst nicht. Das ist der stärkste blinde Fleck, den dieses Werkzeug zeigen kann.`) : '') +
            (nR && W.hidden.length >= S.self.length * 0.6 && S.self.length >= 5 ? note('info', `${W.hidden.length} von ${S.self.length} Selbstbild-Eigenschaften sieht niemand. Zeigst du dich nicht – oder stimmt das Selbstbild nicht?`) : '');
    }

    /* ---------- 4 ---------- */
    function renderReflect() {
        const W = win(); const nR = raters().length; const max = nR || 1;
        const strongBlind = W.blind.filter(a => W.c[a] / max >= 0.5);
        $('jo-reflect').innerHTML = (W.blind.length ? `<div class="jo-refl blind"><b>👁️ Blinder Fleck</b><div>${W.blind.map(a => tag(a, W.c, max)).join('')}</div>${strongBlind.some(a => NEG.includes(a)) ? `<div class="mk-faint">${strongBlind.filter(a => NEG.includes(a)).join(', ')} – unangenehm zu hören? Genau diese Rückmeldungen sind die wertvollsten, weil sie dir sonst niemand sagt.</div>` : strongBlind.length ? `<div class="mk-faint">${strongBlind.join(', ')} – positive Seiten, die du selbst nicht siehst. Warum nicht? Bescheidenheit, Gewohnheit, oder zählt es für dich nicht als Stärke?</div>` : ''}</div>` : '') +
            (W.hidden.length ? `<div class="jo-refl hidden"><b>🔒 Verborgen</b><div>${W.hidden.map(a => tag(a)).join('')}</div><div class="mk-faint">${W.hidden.some(a => NEG.includes(a)) ? `${W.hidden.filter(a => NEG.includes(a)).join(', ')} – das verbirgst du vermutlich bewusst. Kostet es Energie, es zu verstecken?` : 'Positive Eigenschaften, die niemand sieht. Das ist verschenktes Kapital – oder du zeigst sie nur in Kontexten, aus denen niemand Feedback gegeben hat.'}</div></div>` : '') +
            (!W.blind.length && !W.hidden.length ? note('info', 'Noch nichts zu reflektieren – füll erst Selbst- und Fremdbild aus.') : '');
    }

    /* ---------- 5 ---------- */
    function renderGrow() {
        const W = win(); const nR = raters().length;
        const asks = []; const shows = [];
        if (!nR) asks.push('Frag die erste Person – ohne Fremdbild gibt es kein Fenster.');
        else if (nR < 3) asks.push(`Du hast ${nR} Fremdbild${nR > 1 ? 'er' : ''}. Hol dir ${3 - nR} weitere${3 - nR > 1 ? '' : 's'} – aus einem anderen Kontext.`);
        if (W.blind.length) asks.push(`Frag nach: „Du hast ‚${W.blind[0]}' gesagt – wann hast du das an mir erlebt?" Ein Beispiel macht aus dem Wort ein Verhalten.`);
        if (W.hidden.length) { const pos = W.hidden.filter(a => !NEG.includes(a)); if (pos.length) shows.push(`Zeig „${pos[0]}" bewusst: In welcher Situation diese Woche könnte das sichtbar werden?`); const neg = W.hidden.filter(a => NEG.includes(a)); if (neg.length) shows.push(`„${neg[0]}" – sag es jemandem, dem du vertraust. Wer eine Schwäche benennt, wirkt nicht schwach, sondern nahbar.`); }
        $('jo-grow').innerHTML = `<div class="jo-grow"><div class="jo-grow-col ask"><b>🙋 Feedback einholen</b><small>verkleinert den blinden Fleck</small><ul>${asks.map(a => `<li>${a}</li>`).join('') || '<li>Dein blinder Fleck ist leer – entweder sehr gut, oder du hast noch zu wenige gefragt.</li>'}</ul></div><div class="jo-grow-col show"><b>🪟 Sich mitteilen</b><small>verkleinert das Verborgene</small><ul>${shows.map(a => `<li>${a}</li>`).join('') || '<li>Nichts Verborgenes – alles, was du über dich sagst, sehen andere auch.</li>'}</ul></div></div>`;
    }
    function renderSummary() {
        const W = win();
        $('jo-summary').innerHTML = S.self.length ? `<div class="mk-result" style="margin-top:12px"><h4>Dein Johari-Fenster</h4><div class="jo-sum"><div><b>Offen</b>${W.open.join(', ') || '–'}</div><div><b>Blinder Fleck</b>${W.blind.join(', ') || '–'}</div><div><b>Verborgen</b>${W.hidden.join(', ') || '–'}</div>${S.ask ? `<div><b>Frage ich</b>${esc(S.ask)}</div>` : ''}${S.show ? `<div><b>Zeige ich</b>${esc(S.show)}</div>` : ''}</div></div>` : '';
    }
    function renderLinks() { $('jo-links').innerHTML = LINKS.map(x => `<a class="mk-option jo-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function shareText() { return `Hallo! Ich arbeite gerade an meinem Selbst- und Fremdbild (Johari-Fenster). Magst du mir helfen? Wähle bitte 5–8 Wörter aus dieser Liste, die mich am besten beschreiben – ehrlich, nicht höflich:\n\n${ADJ.join(', ')}\n\nDanke dir!`; }
    function exportAll() {
        const W = win(); const R = raters();
        const L = ['JOHARI-FENSTER', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'SELBSTBILD: ' + (S.self.join(', ') || '–'), ''];
        if (R.length) { L.push('FREMDBILDER'); R.forEach((r, i) => L.push(`${r.name || 'Person ' + (i + 1)}${r.rel ? ' (' + r.rel + ')' : ''}: ${r.adj.join(', ')}`)); L.push(''); }
        L.push('OFFEN (ich & andere): ' + (W.open.map(a => W.c[a] > 1 ? `${a} ×${W.c[a]}` : a).join(', ') || '–'), 'BLINDER FLECK (nur andere): ' + (W.blind.map(a => W.c[a] > 1 ? `${a} ×${W.c[a]}` : a).join(', ') || '–'), 'VERBORGEN (nur ich): ' + (W.hidden.join(', ') || '–'), 'UNBEKANNT: ' + W.unknown.length + ' Eigenschaften', '');
        if (S.reflectBlind) L.push('Reflexion blinder Fleck: ' + S.reflectBlind); if (S.reflectHidden) L.push('Reflexion verborgen: ' + S.reflectHidden);
        if (S.ask) L.push('Frage ich: ' + S.ask); if (S.show) L.push('Zeige ich: ' + S.show);
        MethodKit.exportText('johari-fenster.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'johari-window', accent: '#06b6d4', accent2: '#3b82f6',
            steps: [{ icon: '🙂', label: 'Selbstbild' }, { icon: '👥', label: 'Fremdbilder' }, { icon: '🪟', label: 'Fenster' }, { icon: '🤔', label: 'Reflexion' }, { icon: '📈', label: 'Vergrössern' }],
            defaultState: { self: [], raters: [], openRater: undefined, reflectBlind: '', reflectHidden: '', ask: '', show: '' }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.self)) S.self = [];
        if (!Array.isArray(S.raters)) S.raters = [];
        // Migration: altes Feld "others" (ein Array) → eine Person
        if (Array.isArray(S.others) && S.others.length && !S.raters.length) { S.raters.push({ id: MethodKit.uid(), name: '', rel: '', adj: S.others.filter(a => ADJ.includes(a)) }); delete S.others; }
        S.self = S.self.filter(a => ADJ.includes(a));
        MethodKit.bindFields();
        $('jo-export').addEventListener('click', exportAll);
        $('jo-share').addEventListener('click', () => navigator.clipboard.writeText(shareText()).then(() => MethodKit.toast('Frage-Text kopiert – schick ihn jemandem', 'ok')));
        ['jo-ask', 'jo-show'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 1) renderSelf();
            if (k === 2) renderRaters();
            if (k === 3) renderWindow();
            if (k === 4) renderReflect();
            if (k === 5) { renderGrow(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
