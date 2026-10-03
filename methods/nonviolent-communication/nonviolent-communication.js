/* Gewaltfreie Kommunikation · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const JUDGE = /\b(immer|nie|niemals|ständig|dauernd|jedes mal|typisch|faul|egoistisch|respektlos|unverschämt|rücksichtslos|unfair|gemein|arrogant|unzuverlässig|chaotisch|unmöglich|schlampig|ignorant|dumm)\b/i;
    const YOU_ARE = /\bdu bist\b|\bdu hast (mich )?(wieder|schon wieder)\b|\bdu willst (doch )?nur\b|\bdu machst (das )?(absichtlich|extra)\b/i;
    const PSEUDO = /\b(ignoriert|missachtet|übergangen|angegriffen|manipuliert|ausgenutzt|hintergangen|verraten|bevormundet|abgelehnt|nicht ernst genommen|im stich gelassen|betrogen|provoziert|benutzt|unterdrückt|missverstanden|nicht gesehen|nicht gehört|abgewertet)\b/i;
    const FEEL = {
        unmet: { l: 'Wenn Bedürfnisse unerfüllt sind', items: ['traurig', 'ängstlich', 'wütend', 'frustriert', 'enttäuscht', 'einsam', 'erschöpft', 'hilflos', 'verwirrt', 'unruhig', 'verletzt', 'gereizt', 'besorgt', 'überfordert', 'genervt', 'unsicher'] },
        met: { l: 'Wenn Bedürfnisse erfüllt sind', items: ['erleichtert', 'dankbar', 'ruhig', 'froh', 'verbunden', 'zuversichtlich', 'inspiriert', 'stolz', 'geborgen', 'lebendig'] }
    };
    const NEEDS = {
        'Verbindung': ['Nähe', 'Zugehörigkeit', 'Verständnis', 'Gesehen werden', 'Unterstützung', 'Vertrauen', 'Wertschätzung', 'Respekt'],
        'Autonomie': ['Freiheit', 'Selbstbestimmung', 'Raum', 'Wahlmöglichkeit'],
        'Sicherheit': ['Verlässlichkeit', 'Klarheit', 'Stabilität', 'Schutz', 'Ordnung'],
        'Sinn & Wachstum': ['Sinn', 'Beitrag leisten', 'Lernen', 'Kreativität', 'Wirksamkeit'],
        'Wohlbefinden': ['Ruhe', 'Erholung', 'Leichtigkeit', 'Spiel', 'Gesundheit'],
        'Ehrlichkeit': ['Authentizität', 'Offenheit', 'Fairness', 'Gleichwertigkeit']
    };
    const FEEL2NEED = { traurig: ['Verbindung', 'Nähe'], ängstlich: ['Sicherheit', 'Schutz'], wütend: ['Respekt', 'Fairness'], frustriert: ['Wirksamkeit', 'Klarheit'], enttäuscht: ['Verlässlichkeit', 'Vertrauen'], einsam: ['Nähe', 'Zugehörigkeit'], erschöpft: ['Erholung', 'Unterstützung'], hilflos: ['Wirksamkeit', 'Unterstützung'], verwirrt: ['Klarheit'], unruhig: ['Sicherheit', 'Ruhe'], verletzt: ['Wertschätzung', 'Respekt'], gereizt: ['Raum', 'Ruhe'], besorgt: ['Sicherheit'], überfordert: ['Unterstützung', 'Raum'], genervt: ['Respekt', 'Raum'], unsicher: ['Klarheit', 'Vertrauen'] };
    const NEG = /\b(nicht|nie|kein|keine|aufhören|aufhörst|hör auf|hörst auf|lass das|unterlass|weniger)\b/i;
    const VAGUE = /\b(mehr respekt|respektvoller|netter|besser|ernst nehmen|rücksicht|verständnis haben|dich bemühen|anstrengen|zuhören|verlässlich(er)? sein|dich ändern)\b/i;
    const NO_OPTS = [{ k: 'ok', ic: '🤝', l: 'Okay – dann suchen wir etwas anderes', d: 'Das ist eine Bitte. Du bleibst in Verbindung.' }, { k: 'hurt', ic: '😔', l: 'Ich wäre enttäuscht, würde es aber verstehen wollen', d: 'Fast eine Bitte. Frag dann nach dem Bedürfnis hinter dem Nein.' }, { k: 'press', ic: '😤', l: 'Ich würde Druck machen oder es ihm vorhalten', d: 'Das ist eine Forderung. Der andere spürt das – und hört die Bitte nicht mehr.' }];
    const LINKS = [
        { m: 'AEK-Kommunikation', l: '../aek-communication/aek-communication.html', why: 'Die Botschaft klar, einfühlsam und freundlich ausbalancieren.' },
        { m: 'Zirkuläres Fragen', l: '../circular-interview/circular-interview.html', why: 'Die Perspektive des Gegenübers vertiefen.' },
        { m: 'Harvard-Methode', l: '../harvard-method/harvard-method.html', why: 'Wenn aus Bedürfnissen eine Verhandlung wird.' },
        { m: 'Emotionale Intelligenz', l: '../emotional-intelligence/emotional-intelligence.html', why: 'Gefühle schneller erkennen und benennen.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const who = () => (S.who || '').trim() || 'dein Gegenüber';

    /* ---------- 1 ---------- */
    function renderSitCheck() {
        const t = S.situation || ''; if (!t.trim()) { $('nvc-sitcheck').innerHTML = ''; return; }
        const j = t.match(JUDGE), y = t.match(YOU_ARE);
        $('nvc-sitcheck').innerHTML = (j || y) ? note('info', `Da steckt ${j ? `„${esc(j[0])}"` : ''}${j && y ? ' und ' : ''}${y ? `„${esc(y[0])}"` : ''} drin – völlig normal für den ersten Wurf. Genau das sortieren die nächsten vier Schritte.`) : note('ok', 'Schon ziemlich sachlich. Jetzt die vier Schritte sauber trennen.');
    }

    /* ---------- 2 ---------- */
    function renderObsCheck() {
        const t = S.observation || ''; if (!t.trim()) { $('nvc-obscheck').innerHTML = ''; return; }
        const H = [];
        const j = t.match(JUDGE); if (j) H.push(note('warn', `„${esc(j[0])}" ist eine Bewertung oder Verallgemeinerung. Wie oft genau, wann genau? Zahlen und Zeitpunkte sind unbestreitbar.`));
        if (YOU_ARE.test(t)) H.push(note('warn', '„Du bist …" beschreibt eine Person, nicht ein Verhalten. Formuliere: „Du hast … getan / gesagt."'));
        if (/\b(weil du|um mich|absichtlich|wolltest)\b/i.test(t)) H.push(note('info', 'Das ist eine Deutung der Absicht. Die Kamera sieht keine Absichten – nur Handlungen.'));
        if (!H.length && /\d|gestern|heute|um \d|am (montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)|letzte woche/i.test(t)) H.push(note('ok', 'Konkret mit Zeit oder Zahl – das kann niemand bestreiten.'));
        else if (!H.length) H.push(note('info', 'Klingt beobachtend. Noch stärker: Wann genau, wie oft?'));
        $('nvc-obscheck').innerHTML = H.join('');
    }

    /* ---------- 3 ---------- */
    function renderFeelings() {
        $('nvc-feelings').innerHTML = Object.values(FEEL).map(g => `<div class="mk-section-label">${g.l}</div><div class="mk-chips">${g.items.map(f => `<button class="mk-chip ${S.feelings.includes(f) ? 'selected' : ''}" data-f="${f}">${f}</button>`).join('')}</div>`).join('');
        $('nvc-feelings').querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { const f = b.dataset.f; S.feelings = S.feelings.includes(f) ? S.feelings.filter(x => x !== f) : [...S.feelings, f].slice(-3); MethodKit.save(); renderFeelings(); renderFeelCheck(); }));
    }
    function renderFeelCheck() {
        const t = S.feeling || ''; const H = [];
        const p = t.match(PSEUDO); if (p) H.push(note('warn', `„${esc(p[0])}" ist ein Pseudo-Gefühl: Es beschreibt, was der andere (angeblich) tut, nicht was in dir ist. Was fühlst du, <em>wenn</em> du dich so behandelt siehst – traurig, wütend, verunsichert?`));
        if (/\bich fühle,? dass\b|\bich fühle mich wie\b|\bich habe das gefühl\b/i.test(t)) H.push(note('info', '„Ich fühle, dass …" leitet einen Gedanken ein, kein Gefühl. Ein Gefühl steht allein: „Ich bin traurig."'));
        if (S.feelings.length > 2) H.push(note('info', 'Drei Gefühle – wähle das stärkste für die Botschaft. Mehrere auf einmal verwässern.'));
        if (!H.length && (S.feelings.length || t.trim())) H.push(note('ok', `${S.feelings.length ? S.feelings.join(', ') + ' – ' : ''}echte Gefühle. Sie lassen sich nicht wegdiskutieren.`));
        $('nvc-feelcheck').innerHTML = H.join('');
    }

    /* ---------- 4 ---------- */
    function renderNeeds() {
        const sugg = [...new Set(S.feelings.flatMap(f => FEEL2NEED[f] || []))];
        $('nvc-needs').innerHTML = (sugg.length ? `<div class="mk-note info"><i class="fas fa-lightbulb"></i><span>Hinter „${S.feelings.join(', ')}" stecken oft: ${sugg.map(s => `<button class="nvc-sugg ${S.needs.includes(s) ? 'on' : ''}" data-ns="${s}">${s}</button>`).join(' ')}</span></div>` : '') +
            Object.entries(NEEDS).map(([g, items]) => `<div class="mk-section-label">${g}</div><div class="mk-chips">${items.map(x => `<button class="mk-chip ${S.needs.includes(x) ? 'selected' : ''}" data-ns="${x}">${x}</button>`).join('')}</div>`).join('');
        $('nvc-needs').querySelectorAll('[data-ns]').forEach(b => b.addEventListener('click', () => { const x = b.dataset.ns; S.needs = S.needs.includes(x) ? S.needs.filter(y => y !== x) : [...S.needs, x].slice(-2); MethodKit.save(); renderNeeds(); renderNeedCheck(); }));
    }
    function renderNeedCheck() {
        const t = S.need || ''; const H = [];
        if (/\b(dass du|du sollst|du musst|von dir|dass er|dass sie)\b/i.test(t)) H.push(note('warn', 'Ein Bedürfnis ist nie an eine bestimmte Person oder Handlung gebunden. „Ich brauche, dass du anrufst" ist eine Strategie. Das Bedürfnis dahinter: Verlässlichkeit? Verbindung?'));
        if (!H.length && (S.needs.length || t.trim())) H.push(note('ok', `${S.needs.length ? S.needs.join(' und ') : 'Das'} – ein universelles Bedürfnis, das ${who()} vermutlich auch kennt. Das ist eure gemeinsame Basis.`));
        $('nvc-needcheck').innerHTML = H.join('');
    }
    function renderTheirNeeds() {
        const all = Object.values(NEEDS).flat();
        $('nvc-theirneeds').innerHTML = `<div class="mk-chips">${all.map(x => `<button class="mk-chip ${S.theirNeeds.includes(x) ? 'selected' : ''}" data-tn="${x}">${x}</button>`).join('')}</div>
            ${S.theirNeeds.length ? note(S.theirNeeds.some(x => S.needs.includes(x)) ? 'ok' : 'info', S.theirNeeds.some(x => S.needs.includes(x)) ? `Ihr teilt das Bedürfnis nach <strong>${S.theirNeeds.filter(x => S.needs.includes(x)).join(', ')}</strong> – nur eure Strategien kollidieren. Das ist der Satz, mit dem du das Gespräch öffnen kannst.` : `${who()} brauchte vermutlich ${S.theirNeeds.join(' oder ')}. Wenn du das im Gespräch aussprichst, sinkt die Abwehr sofort.`) : ''}`;
        $('nvc-theirneeds').querySelectorAll('[data-tn]').forEach(b => b.addEventListener('click', () => { const x = b.dataset.tn; S.theirNeeds = S.theirNeeds.includes(x) ? S.theirNeeds.filter(y => y !== x) : [...S.theirNeeds, x].slice(-2); MethodKit.save(); renderTheirNeeds(); }));
    }

    /* ---------- 5 ---------- */
    function renderReqCheck() {
        const t = S.request || ''; if (!t.trim()) { $('nvc-reqcheck').innerHTML = ''; return; }
        const H = [];
        const ng = t.match(NEG); if (ng) H.push(note('warn', `„${esc(ng[0])}" – eine Bitte sagt, was du <em>willst</em>, nicht was aufhören soll. „Hör auf zu unterbrechen" → „Lass mich bitte ausreden, ich gebe dir dann ein Zeichen."`));
        const vg = t.match(VAGUE); if (vg) H.push(note('warn', `„${esc(vg[0])}" ist nicht beobachtbar. Was genau soll die Person <em>tun</em> – so konkret, dass ihr beide wisst, ob es passiert ist?`));
        if (!/\?|wärst du bereit|könntest du|magst du|wäre es (für dich )?okay|bist du einverstanden/i.test(t)) H.push(note('info', 'Formuliere als Frage: „Wärst du bereit, …?" Das lässt dem anderen die Wahl – und genau das unterscheidet Bitte von Forderung.'));
        if (/\b(ab jetzt|immer|in zukunft|nie wieder|jedes mal)\b/i.test(t)) H.push(note('info', '„Ab jetzt immer" ist kaum erfüllbar. Bitte um etwas für die nächste konkrete Situation – das lässt sich zusagen.'));
        if (!H.length) H.push(note('ok', 'Positiv, konkret, als Frage – eine echte Bitte.'));
        $('nvc-reqcheck').innerHTML = H.join('');
    }
    function renderNoTest() {
        $('nvc-notest').innerHTML = `<div class="mk-grid">${NO_OPTS.map(o => `<button class="mk-option ${S.noTest === o.k ? 'selected' : ''}" data-no="${o.k}"><span class="ic">${o.ic}</span><span class="t">${o.l}</span><span class="d">${o.d}</span></button>`).join('')}</div>
            ${S.noTest === 'press' ? `<div class="mk-field" style="margin-top:12px"><label for="nvc-nowhy">Was steht für dich auf dem Spiel, wenn ${esc(who())} Nein sagt?</label><input class="mk-input" id="nvc-nowhy" value="${esc(S.noWhy || '')}" placeholder="Oft ein unerfülltes Bedürfnis, das noch nicht ausgesprochen ist."></div>` + note('info', 'Sag das Bedürfnis dahinter zuerst. Dann kann die Bitte wieder eine Bitte sein.') : ''}`;
        $('nvc-notest').querySelectorAll('[data-no]').forEach(b => b.addEventListener('click', () => { S.noTest = S.noTest === b.dataset.no ? '' : b.dataset.no; MethodKit.save(); renderNoTest(); }));
        const nw = $('nvc-nowhy'); if (nw) nw.addEventListener('input', e => { S.noWhy = e.target.value; MethodKit.save(); });
    }

    /* ---------- 6 ---------- */
    function message() {
        const obs = (S.observation || '').trim().replace(/\.$/, '');
        const asWenn = /^wenn\b/i.test(obs);
        // Gefühl: „ich bin X" / „ich fühle mich X" – invertiert nach „Wenn …," sonst als eigener Satz
        let f = (S.feeling || '').trim().replace(/\.$/, '').replace(/^ich\s+/i, '');
        if (!f && S.feelings.length) f = 'bin ' + S.feelings[0];
        if (f && !/^(bin|fühle)\b/i.test(f)) f = 'fühle mich ' + f;
        const fInv = f.replace(/^bin/i, 'bin ich').replace(/^fühle mich/i, 'fühle ich mich');
        let nd = (S.need || '').trim().replace(/\.$/, '');
        if (!nd && S.needs.length) nd = 'weil mir ' + S.needs.join(' und ') + ' wichtig ' + (S.needs.length > 1 ? 'sind' : 'ist');
        else if (nd && !/^weil\b/i.test(nd)) nd = 'weil ' + nd;
        const parts = [];
        if (obs && asWenn) { parts.push(obs + ','); if (f) parts.push(fInv + (nd ? ',' : '.')); }
        else { if (obs) parts.push(obs.charAt(0).toUpperCase() + obs.slice(1) + '.'); if (f) parts.push('Ich ' + f + (nd ? ',' : '.')); }
        if (nd) parts.push(nd + '.');
        if (S.request) parts.push(S.request.trim());
        return parts.join(' ');
    }
    function renderMessage() {
        const m = message();
        const missing = [['observation', 'Beobachtung', 2], ['feeling', 'Gefühl', 3], ['need', 'Bedürfnis', 4], ['request', 'Bitte', 5]].filter(([k, , ]) => !(S[k] || '').trim() && !(k === 'feeling' && S.feelings.length) && !(k === 'need' && S.needs.length));
        $('nvc-message').innerHTML = `<div class="nvc-msg">${['👁️', '🫀', '💎', '🙏'].map((ic, i) => `<span class="nvc-msg-ic ${[S.observation, S.feeling || S.feelings.length, S.need || S.needs.length, S.request][i] ? 'on' : ''}">${ic}</span>`).join('')}</div>
            <div class="mk-result"><h4>Gerüst</h4>${m ? esc(m) : '<span class="mk-faint">Noch leer – fülle die vier Schritte.</span>'}</div>
            ${missing.length ? note('info', 'Noch offen: ' + missing.map(([, l, s]) => `${l} (Schritt ${s})`).join(', ')) : note('ok', 'Alle vier Schritte da. Jetzt in deine Sprache bringen – ohne die Reihenfolge aufzugeben.')}`;
        const fin = $('nvc-final'); if (fin && !S.final && m) { fin.placeholder = m; }
    }
    function renderFlip() {
        const F = S.flip; const fld = (k, l, ph) => `<div class="mk-field"><label>${l}</label><input class="mk-input" data-fl="${k}" value="${esc(F[k] || '')}" placeholder="${ph}"></div>`;
        const filled = ['obs', 'feel', 'need', 'req'].filter(k => (F[k] || '').trim()).length;
        $('nvc-flip').innerHTML = `<div class="nvc-flip">${fld('obs', `👁️ Was hat ${esc(who())} beobachtet?`, 'Was hat die andere Person von dir gesehen oder gehört?')}${fld('feel', `🫀 Wie fühlt sich ${esc(who())} vermutlich?`, 'z. B. unter Druck, überfordert, verunsichert')}${fld('need', '💎 Welches Bedürfnis steckt dahinter?', S.theirNeeds.length ? S.theirNeeds.join(', ') : 'z. B. Anerkennung, Raum, Ruhe')}${fld('req', '🙏 Was würde die Person sich von dir wünschen?', '…')}</div>
            ${filled === 4 ? note('ok', 'Du kannst beide Seiten in GFK formulieren. Beginne das Gespräch ruhig mit der Seite des anderen – das öffnet Türen.') : filled ? note('info', `${filled}/4 – weiter. Je besser du die andere Seite triffst, desto weniger musst du überzeugen.`) : ''}`;
        $('nvc-flip').querySelectorAll('[data-fl]').forEach(el => { el.addEventListener('input', () => { F[el.dataset.fl] = el.value; MethodKit.save(); }); el.addEventListener('change', renderFlip); });
    }
    function renderLinks() { $('nvc-links').innerHTML = LINKS.map(x => `<a class="mk-option nvc-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['GEWALTFREIE KOMMUNIKATION', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'SITUATION', S.situation || '–', 'Mit: ' + who(), '', '👁️ BEOBACHTUNG', S.observation || '–', '', '🫀 GEFÜHL', (S.feeling || '–') + (S.feelings.length ? ' · ' + S.feelings.join(', ') : '') + ` · Intensität ${n(S.intensity, 6)}/10`, '', '💎 BEDÜRFNIS', (S.need || '–') + (S.needs.length ? ' · ' + S.needs.join(', ') : ''), S.theirNeeds.length ? `Vermutetes Bedürfnis von ${who()}: ${S.theirNeeds.join(', ')}` : '', '', '🙏 BITTE', S.request || '–', S.noTest ? 'Bei Nein: ' + (NO_OPTS.find(o => o.k === S.noTest) || {}).l : '', '', 'BOTSCHAFT', S.final || message() || '–', ''];
        const F = S.flip; if (Object.values(F).some(Boolean)) L.push(`EMPATHIE-WECHSEL (${who()})`, F.obs ? 'Beobachtung: ' + F.obs : '', F.feel ? 'Gefühl: ' + F.feel : '', F.need ? 'Bedürfnis: ' + F.need : '', F.req ? 'Wunsch: ' + F.req : '', '');
        if (S.after) L.push('NACH DEM GESPRÄCH', S.after);
        MethodKit.exportText('gfk-botschaft.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'nonviolent-communication', accent: '#22c55e', accent2: '#14b8a6',
            steps: [{ icon: '🎯', label: 'Situation' }, { icon: '👁️', label: 'Beobachtung' }, { icon: '🫀', label: 'Gefühl' }, { icon: '💎', label: 'Bedürfnis' }, { icon: '🙏', label: 'Bitte' }, { icon: '✉️', label: 'Botschaft' }],
            defaultState: { situation: '', who: '', goal: '', observation: '', feelings: [], feeling: '', intensity: 6, needs: [], need: '', theirNeeds: [], request: '', noTest: '', noWhy: '', final: '', flip: {}, after: '' }
        });
        S = MethodKit.state;
        ['feelings', 'needs', 'theirNeeds'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; }); if (!S.flip || typeof S.flip !== 'object') S.flip = {};
        MethodKit.bindFields();
        $('nvc-situation').addEventListener('input', renderSitCheck);
        $('nvc-observation').addEventListener('input', renderObsCheck);
        $('nvc-feeling').addEventListener('input', renderFeelCheck);
        $('nvc-need').addEventListener('input', renderNeedCheck);
        $('nvc-request').addEventListener('input', renderReqCheck);
        $('nvc-copy').addEventListener('click', () => { const t = S.final || message(); if (!t) { MethodKit.toast('Noch keine Botschaft', 'warn'); return; } navigator.clipboard.writeText(t).then(() => MethodKit.toast('Kopiert', 'success')); });
        $('nvc-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) renderSitCheck();
            if (k === 2) renderObsCheck();
            if (k === 3) { renderFeelings(); renderFeelCheck(); }
            if (k === 4) { renderNeeds(); renderNeedCheck(); renderTheirNeeds(); }
            if (k === 5) { renderReqCheck(); renderNoTest(); }
            if (k === 6) { renderMessage(); renderFlip(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
