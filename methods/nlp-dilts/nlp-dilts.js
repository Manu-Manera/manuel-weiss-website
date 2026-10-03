/* Logische Ebenen (Dilts) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const LEVELS = [
        { id: 'env', ic: '🌍', t: 'Umgebung', q: 'Wo, wann und mit wem zeigt sich das Thema? Welche äusseren Umstände spielen mit?', dq: 'Wie gestaltest du deine Umgebung, wenn du so handelst?', w: 'Wo / wann' },
        { id: 'beh', ic: '🚶', t: 'Verhalten', q: 'Was genau tust du – oder tust du nicht? Konkrete, beobachtbare Handlungen.', dq: 'Was tust du konkret anders?', w: 'Was' },
        { id: 'cap', ic: '🛠️', t: 'Fähigkeiten', q: 'Welche Fähigkeiten und Strategien setzt du ein – und welche fehlen?', dq: 'Welche Fähigkeiten nutzt oder entwickelst du dafür?', w: 'Wie' },
        { id: 'val', ic: '❤️', t: 'Werte & Glaubenssätze', q: 'Was ist dir dabei wichtig? Welche Überzeugung treibt dich – oder hält dich zurück? („Ich kann nicht …", „Man muss …")', dq: 'Welche Überzeugung trägt dich jetzt? Was ist dir wichtig?', w: 'Warum' },
        { id: 'id', ic: '🪞', t: 'Identität', q: 'Wer bist du in diesem Zusammenhang? „Ich bin jemand, der …"', dq: 'Wer bist du, wenn du aus diesem Sinn heraus lebst?', w: 'Wer' },
        { id: 'pur', ic: '✨', t: 'Zugehörigkeit & Sinn', q: 'Wozu das alles? Für wen oder was über dich hinaus? Wo gehörst du dazu?', dq: 'Was ist der grössere Sinn, der dich trägt?', w: 'Wozu' }
    ];
    const LIMIT = /\b(kann (ich )?nicht|kann nicht|schaffe (ich )?nicht|nie|niemals|immer|muss|müssen|darf nicht|geht nicht|bin nicht (gut|fähig|der typ)|nicht gut genug|zu (alt|jung|dumm|schwach)|man (muss|sollte|darf nicht)|unmöglich|keiner|niemand)\b/i;
    const LINKS = [
        { m: 'Wohlgeformtes Ziel (NLP)', l: '../nlp-meta-goal/nlp-meta-goal.html', why: 'Das Ziel auf der Hebel-Ebene präzise formulieren.' },
        { m: 'Werte-Klärung', l: '../values-clarification/values-clarification.html', why: 'Die Werte-Ebene vertiefen.' },
        { m: 'Ikigai', l: '../ikigai/ikigai.html', why: 'Die Sinn-Ebene ausleuchten.' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Verhalten dauerhaft ändern.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const up = (id) => (S.levels[id] || '').trim();
    const filledUp = () => LEVELS.filter(l => up(l.id)).length;
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;

    /* ---------- 1 ---------- */
    function renderProblemLvl() {
        $('dl-problem-lvl').innerHTML = `<div class="mk-chips">${LEVELS.map(l => `<button class="mk-chip ${S.problemLvl === l.id ? 'selected' : ''}" data-pl="${l.id}">${l.ic} ${l.t}</button>`).join('')}</div>`;
        $('dl-problem-lvl').querySelectorAll('[data-pl]').forEach(b => b.addEventListener('click', () => { S.problemLvl = S.problemLvl === b.dataset.pl ? '' : b.dataset.pl; MethodKit.save(); renderProblemLvl(); }));
    }

    /* ---------- 2 ---------- */
    function renderPyramid(active) {
        $('dl-pyramid').innerHTML = `<div class="dl-pyr">${[...LEVELS].reverse().map((l, i) => `<div class="dl-pyr-lvl ${up(l.id) ? 'done' : ''} ${active === l.id ? 'active' : ''} ${S.problemLvl === l.id ? 'problem' : ''}" style="--i:${i}" data-pj="${l.id}"><span>${l.ic}</span><b>${l.t}</b></div>`).join('')}</div>`;
        $('dl-pyramid').querySelectorAll('[data-pj]').forEach(el => el.addEventListener('click', () => { const t = $('dl-up').querySelector(`[data-lv="${el.dataset.pj}"]`); if (t) { t.focus(); t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }));
    }
    function renderUp() {
        $('dl-up').innerHTML = LEVELS.map((l, i) => `<div class="dl-lvl ${up(l.id) ? 'done' : ''}" style="--c:${['#94a3b8', '#0ea5e9', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899'][i]}"><div class="dl-lvl-h"><span class="ic">${l.ic}</span><div><b>${l.t}</b><small>${l.w}?</small></div></div><div class="hint">${l.q}</div><textarea class="mk-textarea" data-lv="${l.id}" placeholder="…">${esc(S.levels[l.id] || '')}</textarea>${l.id === 'val' && up('val') && LIMIT.test(up('val')) ? note('info', 'Da klingt ein einschränkender Glaubenssatz durch – gut, dass er sichtbar wird. Schritt 4 nimmt ihn sich vor.') : ''}</div>`).join('') +
            (filledUp() === 6 ? note('ok', 'Alle sechs Ebenen. Lies deine Antworten von oben nach unten – passt das Verhalten zu dem, wer du sein willst?') : `<div class="mk-faint" style="text-align:center">${filledUp()}/6 Ebenen</div>`);
        $('dl-up').querySelectorAll('[data-lv]').forEach(el => { el.addEventListener('input', () => { S.levels[el.dataset.lv] = el.value; MethodKit.save(); }); el.addEventListener('focus', () => renderPyramid(el.dataset.lv)); el.addEventListener('change', () => { renderUp(); renderPyramid(); }); });
        MethodKit._autosizeAll();
    }

    /* ---------- 3 ---------- */
    function renderResource() {
        const pur = up('pur'), id = up('id');
        $('dl-resource').innerHTML = pur || id ? `<div class="dl-res"><div class="mk-section-label">Deine Ressource von oben</div>${pur ? `<div class="dl-res-row"><span>✨</span><div>${esc(pur)}</div></div>` : ''}${id ? `<div class="dl-res-row"><span>🪞</span><div>${esc(id)}</div></div>` : ''}<div class="mk-faint">Halte das beim Abstieg präsent. Aus dieser Haltung heraus beantwortest du jede Ebene neu.</div></div>` : note('info', 'Die oberen Ebenen (Identität, Sinn) sind noch leer – der Abstieg wirkt am stärksten, wenn du von dort kommst. Zurück zu Schritt 2?');
    }
    function renderDown() {
        const D = S.down;
        $('dl-down').innerHTML = [...LEVELS].reverse().filter(l => l.id !== 'pur').map((l, i) => `<div class="dl-lvl dl-down" style="--c:${['#8b5cf6', '#f59e0b', '#14b8a6', '#0ea5e9', '#94a3b8'][i]}"><div class="dl-lvl-h"><span class="ic">${l.ic}</span><div><b>${l.t}</b>${up(l.id) ? `<small>heute: ${esc(up(l.id).slice(0, 70))}${up(l.id).length > 70 ? '…' : ''}</small>` : ''}</div></div><div class="hint">${l.dq}</div><textarea class="mk-textarea" data-dn="${l.id}" placeholder="Von oben her gedacht …">${esc(D[l.id] || '')}</textarea></div>`).join('') +
            (Object.values(D).filter(x => (x || '').trim()).length >= 4 ? note('ok', 'Vergleiche Aufstieg und Abstieg: Wo unterscheiden sich die Antworten am stärksten? Dort liegt die Veränderung.') : '');
        $('dl-down').querySelectorAll('[data-dn]').forEach(el => { el.addEventListener('input', () => { D[el.dataset.dn] = el.value; MethodKit.save(); }); el.addEventListener('change', renderDown); });
        MethodKit._autosizeAll();
    }

    /* ---------- 4 ---------- */
    function renderAlign() {
        const A = S.align; const rated = LEVELS.filter(l => A[l.id]);
        $('dl-align').innerHTML = `<div class="dl-align">${LEVELS.map(l => `<div class="dl-al-row"><span class="dl-al-l">${l.ic} ${l.t}</span><div class="dl-al-dots">${[1, 2, 3, 4, 5].map(v => `<button class="${n(A[l.id], 0) >= v ? 'on' : ''}" data-al="${l.id}" data-v="${v}" aria-label="${l.t} ${v}">●</button>`).join('')}</div><div class="dl-al-bar"><i style="width:${n(A[l.id], 0) * 20}%" class="${n(A[l.id], 0) <= 2 ? 'low' : n(A[l.id], 0) >= 4 ? 'hi' : ''}"></i></div></div>`).join('')}</div><div class="mk-faint">1 = passt gar nicht zum Rest · 5 = völlig stimmig</div>` +
            (rated.length === 6 ? (() => { const low = LEVELS.filter(l => n(A[l.id], 0) <= 2); const min = Math.min(...LEVELS.map(l => n(A[l.id], 0))); const weakest = LEVELS.filter(l => n(A[l.id], 0) === min); return low.length ? note('warn', `Bruchstelle: <strong>${low.map(l => l.t).join(', ')}</strong>. ${low.some(l => l.id === 'beh') ? 'Dein Verhalten widerspricht dem, was dir wichtig ist – das ist der häufigste Energiefresser.' : low.some(l => l.id === 'val') ? 'Eine Überzeugung passt nicht zu dem, wer du bist oder sein willst. Das ist der klassische Ort für einen Glaubenssatz-Wechsel.' : low.some(l => l.id === 'env') ? 'Die Umgebung passt nicht zu dir. Manchmal ist die Lösung nicht innen, sondern ein Ortswechsel.' : 'Hier liegt die Spannung – und damit der Hebel.'}`) : note('ok', `Hohe Stimmigkeit – schwächstes Glied: ${weakest.map(l => l.t).join(', ')} (${min}/5). Wenn du dort nachjustierst, läuft der Rest von selbst.`); })() : '');
        $('dl-align').querySelectorAll('[data-al]').forEach(b => b.addEventListener('click', () => { A[b.dataset.al] = +b.dataset.v; MethodKit.save(); renderAlign(); }));
    }
    function renderBelief() {
        const v = up('val'); const m = v.match(LIMIT); const B = S.belief;
        if (!v) { $('dl-belief').innerHTML = note('info', 'Die Werte-Ebene in Schritt 2 ist leer. Glaubenssätze verstecken sich dort – oft in Worten wie „muss", „kann nicht", „immer".'); return; }
        $('dl-belief').innerHTML = `<div class="dl-belief-q">${esc(v)}</div>
            ${m ? note('warn', `„${esc(m[0])}" – ein typisches Signal für einen einschränkenden Glaubenssatz. Teste ihn:`) : note('ok', 'Keine typischen Einschränkungs-Marker. Trotzdem lohnt der Test:')}
            <div class="mk-field"><label for="dl-b1">Ist das zu 100 % wahr? Kennst du eine Ausnahme?</label><input class="mk-input" id="dl-b1" value="${esc(B.exception || '')}" placeholder="Eine Situation, in der es nicht galt"></div>
            <div class="mk-field"><label for="dl-b2">Was kostet dich dieser Satz?</label><input class="mk-input" id="dl-b2" value="${esc(B.cost || '')}" placeholder="…"></div>
            <div class="mk-field"><label for="dl-b3">Wie lautet er, wenn er dich unterstützt statt bremst?</label><input class="mk-input" id="dl-b3" value="${esc(B.reframe || '')}" placeholder="„Ich kann nicht …" → „Ich lerne gerade, …" · „Man muss …" → „Ich entscheide, …""></div>
            ${B.reframe && LIMIT.test(B.reframe) ? note('info', 'Der neue Satz enthält noch einen Einschränkungs-Marker. Noch einmal – positiv, in der Gegenwart, mit „ich".') : B.reframe ? note('ok', 'Ein tragender Satz. Sag ihn dreimal laut – und prüfe, ob der Körper mitgeht.') : ''}`;
        [['dl-b1', 'exception'], ['dl-b2', 'cost'], ['dl-b3', 'reframe']].forEach(([id, k]) => { $(id).addEventListener('input', e => { B[k] = e.target.value; MethodKit.save(); }); if (k === 'reframe') $(id).addEventListener('change', renderBelief); });
    }

    /* ---------- 5 ---------- */
    function renderLever() {
        const A = S.align; const pIdx = LEVELS.findIndex(l => l.id === S.problemLvl);
        const lows = LEVELS.filter(l => n(A[l.id], 0) && n(A[l.id], 0) <= 2);
        let sugg = null;
        if (lows.length) sugg = lows[lows.length - 1];
        else if (pIdx >= 0 && pIdx < 5) sugg = LEVELS[pIdx + 1];
        if (!S.lever && sugg) S.lever = sugg.id;
        const lv = LEVELS.find(l => l.id === S.lever);
        $('dl-lever').innerHTML = `
            ${sugg ? note('info', `${lows.length ? `Die Stimmigkeit zeigt den Bruch bei <strong>${sugg.t}</strong>.` : `Das Problem zeigt sich bei <strong>${LEVELS[pIdx].t}</strong> – nach Dilts liegt die Lösung meist eine Ebene höher: <strong>${sugg.t}</strong>.`} Vorschlag für deinen Hebel.`) : note('info', 'Wähle die Ebene, auf der du ansetzen willst. Faustregel: eine Ebene über der, auf der sich das Problem zeigt.')}
            <div class="mk-chips">${LEVELS.map(l => `<button class="mk-chip ${S.lever === l.id ? 'selected' : ''}" data-lev="${l.id}">${l.ic} ${l.t}</button>`).join('')}</div>
            ${lv ? `<div class="mk-result" style="margin-top:12px"><h4>${lv.ic} Hebel: ${lv.t}</h4>${S.down[lv.id] ? `<div><b>Von oben gedacht:</b> ${esc(S.down[lv.id])}</div>` : ''}${up(lv.id) ? `<div class="mk-faint" style="margin-top:6px"><b>Heute:</b> ${esc(up(lv.id))}</div>` : ''}${lv.id === S.problemLvl ? '<div class="mk-faint" style="margin-top:6px">Du setzt auf derselben Ebene an, auf der sich das Problem zeigt. Das geht – ist aber oft Symptombehandlung. Was wäre eine Ebene höher?</div>' : ''}</div>` : ''}`;
        $('dl-lever').querySelectorAll('[data-lev]').forEach(b => b.addEventListener('click', () => { S.lever = b.dataset.lev; MethodKit.save(); renderLever(); renderSummary(); }));
    }
    function renderSummary() {
        const lv = LEVELS.find(l => l.id === S.lever);
        $('dl-summary').innerHTML = filledUp() ? `<div class="mk-result" style="margin-top:12px"><h4>Deine Pyramide</h4><div class="dl-sum">${[...LEVELS].reverse().map(l => `<div class="dl-sum-row ${S.lever === l.id ? 'lever' : ''}"><span>${l.ic}</span><b>${l.t}</b><div>${esc(S.down[l.id] || up(l.id) || '–')}</div></div>`).join('')}</div>${S.belief.reframe ? `<div style="margin-top:8px"><b>Neuer Glaubenssatz:</b> ${esc(S.belief.reframe)}</div>` : ''}${lv && S.first ? `<div style="margin-top:4px"><b>Erster Schritt (${lv.t}):</b> ${esc(S.first)}</div>` : ''}</div>` : '';
    }
    function renderLinks() { $('dl-links').innerHTML = LINKS.map(x => `<a class="mk-option dl-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['LOGISCHE EBENEN (DILTS)', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'THEMA: ' + (S.topic || '–'), S.now ? 'Heute: ' + S.now : '', S.want ? 'Ziel: ' + S.want : '', ''];
        L.push('AUFSTIEG (heute)'); LEVELS.forEach(l => L.push(`${l.ic} ${l.t}: ${up(l.id) || '–'}`)); L.push('');
        L.push('ABSTIEG (von oben gedacht)'); [...LEVELS].reverse().forEach(l => { if (S.down[l.id]) L.push(`${l.ic} ${l.t}: ${S.down[l.id]}`); }); L.push('');
        if (Object.keys(S.align).length) L.push('STIMMIGKEIT: ' + LEVELS.map(l => `${l.t} ${n(S.align[l.id], 0) || '–'}/5`).join(' · '), '');
        const B = S.belief; if (B.reframe || B.exception) L.push('GLAUBENSSATZ', B.exception ? 'Ausnahme: ' + B.exception : '', B.cost ? 'Kosten: ' + B.cost : '', B.reframe ? 'Neu: ' + B.reframe : '', '');
        const lv = LEVELS.find(l => l.id === S.lever); L.push('HEBEL: ' + (lv ? lv.t : '–'), S.insight ? 'Erkenntnis: ' + S.insight : '', S.first ? 'Erster Schritt: ' + S.first : '');
        MethodKit.exportText('dilts-ebenen.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'nlp-dilts', accent: '#6366f1', accent2: '#8b5cf6',
            steps: [{ icon: '🎯', label: 'Thema' }, { icon: '⬆️', label: 'Aufstieg' }, { icon: '⬇️', label: 'Abstieg' }, { icon: '🧭', label: 'Stimmigkeit' }, { icon: '🔑', label: 'Hebel' }],
            defaultState: { topic: '', now: '', want: '', problemLvl: '', levels: {}, down: {}, align: {}, belief: {}, lever: '', insight: '', first: '' }
        });
        S = MethodKit.state;
        ['levels', 'down', 'align', 'belief'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        if (S.lever && !LEVELS.some(l => l.id === S.lever)) S.lever = '';
        MethodKit.bindFields();
        $('dl-export').addEventListener('click', exportAll);
        $('dl-first').addEventListener('input', renderSummary);
        MethodKit.onStep = function (k) {
            if (k === 1) renderProblemLvl();
            if (k === 2) { renderPyramid(); renderUp(); }
            if (k === 3) { renderResource(); renderDown(); }
            if (k === 4) { renderAlign(); renderBelief(); }
            if (k === 5) { renderLever(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
