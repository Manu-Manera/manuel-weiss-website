/* AEK-Kommunikation · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const STYLES = [
        { id: 'passive', ic: '🙈', l: 'Zu weich', d: 'Ich rede drum herum, entschuldige mich, gebe nach. Das Anliegen kommt nicht an.', fix: 'Dein Fokus: der A-Teil. Sag den Kernsatz zuerst laut für dich – ohne Weichmacher.' },
        { id: 'aggressive', ic: '🔥', l: 'Zu hart', d: 'Ich werde direkt, vorwurfsvoll oder laut. Das Anliegen kommt an – aber die Beziehung leidet.', fix: 'Dein Fokus: E und K. Nimm dir doppelt so viel Zeit für die Perspektive des anderen.' },
        { id: 'avoid', ic: '🫥', l: 'Ausweichen', d: 'Ich sage lieber nichts und hoffe, dass es sich erledigt.', fix: 'Dein Fokus: ein konkreter Termin (Schritt 6). Vorbereitung senkt die Schwelle.' },
        { id: 'balanced', ic: '⚖️', l: 'Meist ausgewogen', d: 'Ich treffe oft den Ton – aber nicht unter Druck.', fix: 'Dein Fokus: die Einwände in Schritt 6, damit du auch unter Druck ausgewogen bleibst.' }
    ];
    const IPARTS = [
        { k: 'obs', l: 'Beobachtung', q: 'Was ist konkret passiert – ohne Bewertung?', ph: 'Wenn … / Als … / In den letzten zwei Wochen …', chk: 'judge' },
        { k: 'effect', l: 'Wirkung auf mich', q: 'Was löst das bei dir aus?', ph: '… dann bin ich … / … bedeutet das für mich …', chk: 'you' },
        { k: 'need', l: 'Bedürfnis', q: 'Was brauchst du?', ph: 'Mir ist wichtig, dass … / Ich brauche …', chk: '' },
        { k: 'ask', l: 'Bitte / Vorschlag', q: 'Was wünschst du dir konkret?', ph: 'Deshalb bitte ich dich … / Mein Vorschlag: …', chk: 'soft' }
    ];
    const SOFT = /\b(eigentlich|vielleicht|irgendwie|ein bisschen|nur|mal|quasi|sozusagen|könnte man|wäre es möglich|ich glaube|ich denke|sorry|entschuldigung|tut mir leid|nicht böse gemeint)\b/i;
    const YOU = /\b(du bist|du hast immer|du machst immer|du nie|immer|nie|ständig|typisch|wie immer|schon wieder)\b/i;
    const JUDGE = /\b(unmöglich|respektlos|faul|chaotisch|unprofessionell|egoistisch|rücksichtslos|unfair|falsch|schlecht)\b/i;
    const PERSP = [
        { k: 'situation', l: 'In welcher Lage ist dein Gegenüber gerade?', ph: 'Druck, Termine, eigene Erwartungen, was gerade sonst noch läuft …' },
        { k: 'fear', l: 'Was könnte die Person an deiner Botschaft befürchten?', ph: 'Mehrarbeit, Gesichtsverlust, Kontrollverlust, Ablehnung …' },
        { k: 'need', l: 'Was braucht sie vermutlich?', ph: 'Verlässlichkeit, Anerkennung, Mitsprache, Ruhe …' },
        { k: 'react', l: 'Wie wird sie wahrscheinlich reagieren?', ph: 'Erste Reaktion – und was dahinter steckt.' }
    ];
    const E_STARTS = ['Ich verstehe, dass', 'Mir ist bewusst, dass', 'Ich sehe, dass', 'Ich kann nachvollziehen, dass'];
    const KIND_CATS = ['Etwas, das die Person konkret getan hat', 'Eine Stärke, die ich wirklich schätze', 'Was mir an der Zusammenarbeit wichtig ist', 'Warum mir die Beziehung wichtig ist'];
    const EMPTY = /\b(toll|super|grossartig|great|nett|lieb|cool|klasse|spitze)\b/i;
    const ORDERS = [
        { id: 'kea', seq: ['k', 'e', 'a'], l: 'K → E → A', d: 'Klassisch: Wertschätzung öffnet, Empathie verbindet, Anliegen schliesst. Für Vorgesetzte, Kund:innen.' },
        { id: 'eak', seq: ['e', 'a', 'k'], l: 'E → A → K', d: 'Direkter: Zeigt sofort Verständnis, dann Klartext, warm beenden. Für Kolleg:innen, Partner:in.' },
        { id: 'aek', seq: ['a', 'e', 'k'], l: 'A → E → K', d: 'Für dringende oder wiederholte Anliegen: Erst Klarheit, dann abfedern.' },
        { id: 'kae', seq: ['k', 'a', 'e'], l: 'K → A → E', d: 'Sandwich-Variante: Anliegen in der Mitte, Verständnis am Ende lässt Raum für Antwort.' }
    ];
    const OBJ_SEEDS = ['Das geht jetzt nicht.', 'Das ist dein Problem.', 'Alle anderen schaffen das auch.', 'Du siehst das zu eng.', 'Warum sagst du das erst jetzt?', 'Ich habe keine Zeit dafür.'];
    const LINKS = [
        { m: 'Gewaltfreie Kommunikation', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Die Ich-Botschaft vertiefen.' },
        { m: 'Harvard-Methode', l: '../harvard-method/harvard-method.html', why: 'Wenn aus dem Gespräch eine Verhandlung wird.' },
        { m: 'Konflikt-Eskalation', l: '../conflict-escalation/conflict-escalation.html', why: 'Wenn der Konflikt schon fortgeschritten ist.' },
        { m: 'Kommunikationsmodelle', l: '../communication/communication.html', why: 'Vier Seiten einer Nachricht verstehen.' },
        { m: 'RAFAEL-Methode', l: '../rafael-method/rafael-method.html', why: 'Das Gespräch danach strukturiert reflektieren.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;

    const aText = () => IPARTS.map(p => (S.i[p.k] || '').trim()).filter(Boolean).join(' ');
    const eText = () => { const t = (S.etext || '').trim(); return t || (S.p.need ? `${E_STARTS[0]} ${S.p.need.trim().replace(/\.$/, '')} für dich wichtig ist.` : ''); };
    const kText = () => (S.ktext || '').trim();
    const part = (k) => k === 'a' ? aText() : k === 'e' ? eText() : kText();
    const message = () => { const o = ORDERS.find(x => x.id === S.order) || ORDERS[0]; return S.final && S.finalEdited ? S.final : o.seq.map(part).filter(Boolean).join('\n\n'); };

    function toneHints(text, ctx) {
        const h = []; let m;
        if ((m = text.match(SOFT)) && ctx !== 'k') h.push({ t: 'warn', m: `Weichmacher „${esc(m[0])}" – schwächt dein Anliegen. Streich ihn probeweise.` });
        if ((m = text.match(YOU))) h.push({ t: 'warn', m: `„${esc(m[0])}" klingt nach Vorwurf. Verallgemeinerungen lösen Verteidigung aus – bleib beim konkreten Fall.` });
        if ((m = text.match(JUDGE))) h.push({ t: 'warn', m: `„${esc(m[0])}" ist eine Bewertung. Was hast du konkret beobachtet?` });
        if (ctx === 'k' && (m = text.match(EMPTY)) && words(text) < 12) h.push({ t: 'info', m: `„${esc(m[0])}" – allgemein. Nenne, <em>was</em> genau du schätzt.` });
        return h;
    }
    const notes = (h) => h.map(x => `<div class="mk-note ${x.t}"><i class="fas ${x.t === 'ok' ? 'fa-check-circle' : x.t === 'warn' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i><span>${x.m}</span></div>`).join('');

    /* ---------- 1 ---------- */
    function renderDiff() {
        const d = n(S.difficulty, 5);
        $('aek-diff').innerHTML = `<div class="mk-field"><label>Wie schwer fällt dir dieses Gespräch?</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${d}" id="aek-diffr"><span class="mk-range-val">${d}</span></div></div>
            ${d >= 8 ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Sehr schwer – umso wichtiger die Vorbereitung. Plane in Schritt 6 Einwände durch und übe den A-Satz laut.</span></div>' : ''}`;
        $('aek-diffr').addEventListener('input', e => { S.difficulty = n(e.target.value, 5); MethodKit.save(); renderDiff(); });
    }
    function renderStyles() {
        $('aek-styles').innerHTML = STYLES.map(s => `<button class="mk-option ${S.style === s.id ? 'selected' : ''}" data-style="${s.id}"><span class="ic">${s.ic}</span><span class="t">${s.l}</span><span class="d">${s.d}</span></button>`).join('') +
            (S.style ? `<div class="mk-note ok" style="grid-column:1/-1"><i class="fas fa-lightbulb"></i><span>${STYLES.find(s => s.id === S.style).fix}</span></div>` : '');
        $('aek-styles').querySelectorAll('[data-style]').forEach(b => b.addEventListener('click', () => { S.style = S.style === b.dataset.style ? '' : b.dataset.style; MethodKit.save(); renderStyles(); }));
    }

    /* ---------- 2 ---------- */
    function renderIBuilder() {
        $('aek-ibuilder').innerHTML = IPARTS.map((p, i) => `<div class="aek-ipart"><div class="aek-ipart-h"><span class="num">${i + 1}</span><strong>${p.l}</strong><span class="mk-faint">${p.q}</span></div><textarea class="mk-textarea" data-ip="${p.k}" placeholder="${p.ph}">${esc(S.i[p.k] || '')}</textarea><div data-iph="${p.k}"></div></div>`).join('');
        $('aek-ibuilder').querySelectorAll('[data-ip]').forEach(t => { t.addEventListener('input', () => { S.i[t.dataset.ip] = t.value; MethodKit.save(); hintFor(t.dataset.ip); renderAPreview(); }); hintFor(t.dataset.ip); });
        MethodKit._autosizeAll();
    }
    function hintFor(k) {
        const host = $('aek-ibuilder').querySelector(`[data-iph="${k}"]`); const v = S.i[k] || '';
        const h = toneHints(v, 'a');
        if (k === 'obs' && /\b(ich finde|ich fühle|ich glaube)\b/i.test(v)) h.push({ t: 'info', m: 'Die Beobachtung bleibt bei den Fakten – dein Erleben kommt in Teil 2.' });
        if (k === 'ask' && v.trim() && !/\b(bitte|vorschlag|wünsche|möchte|lass uns|können wir|würdest du)\b/i.test(v)) h.push({ t: 'info', m: 'Formuliere als Bitte oder Vorschlag – so bleibt es verhandelbar und doch klar.' });
        host.innerHTML = notes(h);
    }
    function renderAPreview() {
        const t = aText();
        $('aek-apreview').innerHTML = t ? `<div class="mk-result aek-prev-a"><h4>💪 Assertive</h4>${esc(t)}</div><div class="mk-faint" style="margin-top:6px">${words(t)} Wörter · ${words(t) > 70 ? 'Eher lang – was kann weg?' : words(t) < 15 ? 'Sehr knapp – fehlt ein Teil?' : 'Gute Länge.'}</div>` : '<div class="mk-empty">Fülle die vier Teile oben aus – hier entsteht dein klarer Satz.</div>';
    }

    /* ---------- 3 ---------- */
    function renderPersp() {
        $('aek-persp').innerHTML = `<div class="aek-chair"><i class="fas fa-chair"></i> Du sitzt jetzt auf dem Stuhl von <strong>${esc(S.who || 'deinem Gegenüber')}</strong>.</div>` +
            PERSP.map(p => `<div class="mk-field"><label>${p.l}</label><textarea class="mk-textarea" data-pp="${p.k}" placeholder="${p.ph}">${esc(S.p[p.k] || '')}</textarea></div>`).join('');
        $('aek-persp').querySelectorAll('[data-pp]').forEach(t => t.addEventListener('input', () => { S.p[t.dataset.pp] = t.value; MethodKit.save(); renderEPreview(); }));
        MethodKit._autosizeAll();
    }
    function renderEPreview() {
        const sugg = S.p.need ? E_STARTS.map(s => `${s} ${S.p.need.trim().replace(/\.$/, '')} für dich wichtig ist.`) : [];
        $('aek-epreview').innerHTML = `
            ${sugg.length ? `<div class="mk-section-label">Vorschläge aus deiner Perspektivarbeit</div><div class="aek-sugg">${sugg.map(s => `<button class="aek-sugg-b" data-es="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : ''}
            <div class="mk-field" style="margin-top:10px"><label for="aek-etext">Dein Empathie-Satz</label><textarea class="mk-textarea" id="aek-etext" placeholder="Ich verstehe, dass …">${esc(S.etext || '')}</textarea></div>
            ${S.etext && /\baber\b/i.test(S.etext) ? '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>Ein „aber" löscht alles davor. Versuch „und" oder einen Punkt – das Anliegen kommt ohnehin in einem eigenen Satz.</span></div>' : ''}
            ${S.etext && S.etext.trim().length > 10 ? `<div class="mk-result aek-prev-e"><h4>❤️ Empathetic</h4>${esc(S.etext)}</div>` : ''}`;
        $('aek-epreview').querySelectorAll('[data-es]').forEach(b => b.addEventListener('click', () => { S.etext = b.dataset.es; MethodKit.save(); renderEPreview(); }));
        const t = $('aek-etext'); t.addEventListener('input', () => { S.etext = t.value; MethodKit.save(); }); t.addEventListener('change', renderEPreview);
        MethodKit._autosizeAll();
    }

    /* ---------- 4 ---------- */
    function renderKind() {
        $('aek-kind').innerHTML = `
            <div class="mk-section-label">Sammle Konkretes</div>
            ${KIND_CATS.map((c, i) => `<div class="mk-field"><label>${c}</label><input class="mk-input" data-kc="${i}" value="${esc(S.k[i] || '')}" placeholder="…"></div>`).join('')}
            <div class="mk-field" style="margin-top:8px"><label for="aek-ktext">Dein Wertschätzungs-Satz</label><span class="hint">Ein bis zwei Sätze, ehrlich – kein Vorspann fürs Anliegen, sondern eigenständig wahr.</span><textarea class="mk-textarea" id="aek-ktext" placeholder="Ich schätze an dir / an unserer Zusammenarbeit, dass …">${esc(S.ktext || '')}</textarea></div>
            <div id="aek-khint">${notes(toneHints(S.ktext || '', 'k'))}</div>
            ${S.ktext && S.ktext.trim().length > 10 && !toneHints(S.ktext, 'k').length ? `<div class="mk-result aek-prev-k"><h4>🤝 Kind</h4>${esc(S.ktext)}</div>` : ''}`;
        $('aek-kind').querySelectorAll('[data-kc]').forEach(el => el.addEventListener('input', () => { S.k[+el.dataset.kc] = el.value; MethodKit.save(); }));
        const t = $('aek-ktext'); t.addEventListener('input', () => { S.ktext = t.value; MethodKit.save(); $('aek-khint').innerHTML = notes(toneHints(t.value, 'k')); }); t.addEventListener('change', renderKind);
        MethodKit._autosizeAll();
    }

    /* ---------- 5 ---------- */
    function renderOrder() {
        const rec = ['Vorgesetzte:r', 'Kund:in'].includes(S.rel) ? 'kea' : ['Partner:in', 'Kolleg:in', 'Freund:in'].includes(S.rel) ? 'eak' : null;
        $('aek-order').innerHTML = `<div class="mk-grid aek-orders">${ORDERS.map(o => `<button class="mk-option ${(S.order || 'kea') === o.id ? 'selected' : ''}" data-order="${o.id}"><span class="t">${o.l}${rec === o.id ? ' <span class="mk-badge">empfohlen</span>' : ''}</span><span class="d">${o.d}</span></button>`).join('')}</div>`;
        $('aek-order').querySelectorAll('[data-order]').forEach(b => b.addEventListener('click', () => { S.order = b.dataset.order; S.finalEdited = false; MethodKit.save(); renderOrder(); renderMessage(); renderBalance(); }));
    }
    function renderMessage() {
        const o = ORDERS.find(x => x.id === (S.order || 'kea'));
        const missing = o.seq.filter(k => !part(k)).map(k => ({ a: 'Assertive (Schritt 2)', e: 'Empathetic (Schritt 3)', k: 'Kind (Schritt 4)' })[k]);
        const msg = message();
        $('aek-message').innerHTML = `
            ${missing.length ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Noch leer: ${missing.join(', ')}.</span></div>` : ''}
            <div class="aek-msg">${o.seq.map(k => part(k) ? `<div class="aek-msg-p ${k}"><span class="tag">${{ a: '💪 A', e: '❤️ E', k: '🤝 K' }[k]}</span>${esc(part(k))}</div>` : '').join('')}</div>
            <div class="mk-field" style="margin-top:12px"><label for="aek-final">Feinschliff – dein finaler Text</label><span class="hint">Hier darfst du frei umformulieren. Ein Wechsel der Reihenfolge setzt den Text zurück.</span><textarea class="mk-textarea" id="aek-final">${esc(msg)}</textarea></div>`;
        const f = $('aek-final'); f.addEventListener('input', () => { S.final = f.value; S.finalEdited = true; MethodKit.save(); renderBalance(); });
        MethodKit._autosizeAll();
    }
    function renderBalance() {
        const a = words(aText()), e = words(eText()), k = words(kText()), tot = a + e + k || 1;
        const pct = (x) => Math.round(x / tot * 100);
        const h = toneHints(S.finalEdited ? S.final : message(), 'all');
        if (a && pct(a) > 65) h.push({ t: 'info', m: 'Der A-Teil dominiert. Für eine schwierige Beziehung lohnt sich mehr E und K.' });
        if (a && pct(a) < 20 && tot > 30) h.push({ t: 'info', m: 'Der A-Teil geht fast unter – kommt dein Anliegen noch an?' });
        if (!h.length && tot > 30) h.push({ t: 'ok', m: 'Ausgewogen und ohne Vorwürfe oder Weichmacher.' });
        $('aek-balance').innerHTML = `
            <div class="aek-bal"><i class="a" style="flex:${a || 0.0001}" title="Assertive ${pct(a)} %"></i><i class="e" style="flex:${e || 0.0001}" title="Empathetic ${pct(e)} %"></i><i class="k" style="flex:${k || 0.0001}" title="Kind ${pct(k)} %"></i></div>
            <div class="aek-bal-l"><span><b class="a"></b>Assertive ${pct(a)} %</span><span><b class="e"></b>Empathetic ${pct(e)} %</span><span><b class="k"></b>Kind ${pct(k)} %</span></div>
            ${notes(h)}`;
    }

    /* ---------- 6 ---------- */
    function renderObjections() {
        $('aek-objections').innerHTML = `
            ${S.obj.map(o => `<div class="aek-obj"><div class="aek-obj-h"><span class="mk-badge">Einwand</span><input class="mk-input grow" data-ot="${o.id}" value="${esc(o.text)}" placeholder="Was könnte dein Gegenüber sagen?"><button class="mk-iconbtn" data-or="${o.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>
                <textarea class="mk-textarea" data-oa="${o.id}" placeholder="Meine Antwort – assertiv, empathisch, freundlich">${esc(o.answer || '')}</textarea>${notes(toneHints(o.answer || '', 'a'))}</div>`).join('')}
            <div class="mk-chips" style="margin-top:8px">${OBJ_SEEDS.filter(s => !S.obj.some(o => o.text === s)).map(s => `<button class="mk-chip" data-os="${esc(s)}">+ „${esc(s)}"</button>`).join('')}<button class="mk-chip" data-os="">+ Eigener Einwand</button></div>`;
        $('aek-objections').querySelectorAll('[data-os]').forEach(b => b.addEventListener('click', () => { S.obj.push({ id: MethodKit.uid(), text: b.dataset.os, answer: '' }); MethodKit.save(); renderObjections(); }));
        $('aek-objections').querySelectorAll('[data-ot]').forEach(el => el.addEventListener('input', () => { const o = S.obj.find(x => x.id === el.dataset.ot); if (o) { o.text = el.value; MethodKit.save(); } }));
        $('aek-objections').querySelectorAll('[data-oa]').forEach(el => { el.addEventListener('input', () => { const o = S.obj.find(x => x.id === el.dataset.oa); if (o) { o.answer = el.value; MethodKit.save(); } }); el.addEventListener('change', renderObjections); });
        $('aek-objections').querySelectorAll('[data-or]').forEach(b => b.addEventListener('click', () => { S.obj = S.obj.filter(x => x.id !== b.dataset.or); MethodKit.save(); renderObjections(); }));
        MethodKit._autosizeAll();
    }
    function renderLinks() { $('aek-links').innerHTML = LINKS.map(l => `<a class="mk-option aek-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }

    function exportAll() {
        const L = ['AEK-KOMMUNIKATION', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'ANLIEGEN', S.topic || '–', `Gegenüber: ${S.who || '–'}${S.rel ? ' (' + S.rel + ')' : ''} · Schwierigkeit ${n(S.difficulty, 5)}/10`, S.style ? 'Mein Muster: ' + STYLES.find(s => s.id === S.style).l : '', ''];
        L.push('ASSERTIVE'); IPARTS.forEach(p => { if (S.i[p.k]) L.push(`- ${p.l}: ${S.i[p.k]}`); }); L.push('');
        L.push('EMPATHETIC'); PERSP.forEach(p => { if (S.p[p.k]) L.push(`- ${p.l} ${S.p[p.k]}`); }); if (S.etext) L.push('Satz: ' + S.etext); L.push('');
        L.push('KIND'); S.k.forEach((v, i) => { if (v) L.push(`- ${KIND_CATS[i]}: ${v}`); }); if (S.ktext) L.push('Satz: ' + S.ktext); L.push('');
        L.push('BOTSCHAFT (' + (ORDERS.find(o => o.id === (S.order || 'kea')).l) + ')', message(), '');
        if (S.obj.length) { L.push('EINWÄNDE'); S.obj.forEach(o => L.push(`„${o.text}" → ${o.answer || '–'}`)); L.push(''); }
        if (S.when || S.where) L.push('SETTING', [S.when, S.where].filter(Boolean).join(' · ')); if (S.after) L.push('Rückblick: ' + S.after);
        MethodKit.exportText('aek-botschaft.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'aek-communication', accent: '#14b8a6', accent2: '#0ea5e9',
            steps: [{ icon: '🎯', label: 'Anliegen' }, { icon: '💪', label: 'Assertive' }, { icon: '❤️', label: 'Empathetic' }, { icon: '🤝', label: 'Kind' }, { icon: '✉️', label: 'Botschaft' }, { icon: '🗓️', label: 'Vorbereitung' }],
            defaultState: { topic: '', who: '', rel: '', difficulty: 5, style: '', i: {}, p: {}, etext: '', k: ['', '', '', ''], ktext: '', order: 'kea', final: '', finalEdited: false, obj: [], when: '', where: '', after: '' }
        });
        S = MethodKit.state;
        ['i', 'p'].forEach(k => { if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {}; });
        if (!Array.isArray(S.k)) S.k = ['', '', '', '']; if (!Array.isArray(S.obj)) S.obj = [];
        // Migration alter Freitexte
        if (typeof S.assertive === 'string') { if (S.assertive.trim() && !S.i.ask) S.i.ask = S.assertive; delete S.assertive; }
        if (typeof S.empathetic === 'string') { if (S.empathetic.trim() && !S.etext) S.etext = S.empathetic; delete S.empathetic; }
        if (typeof S.kind === 'string') { if (S.kind.trim() && !S.ktext) S.ktext = S.kind; delete S.kind; }

        MethodKit.bindFields();
        renderDiff(); renderStyles();
        MethodKit.onStep = function (k) {
            if (k === 2) { renderIBuilder(); renderAPreview(); }
            if (k === 3) { renderPersp(); renderEPreview(); }
            if (k === 4) renderKind();
            if (k === 5) { renderOrder(); renderMessage(); renderBalance(); }
            if (k === 6) { renderObjections(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
        $('aek-export').addEventListener('click', exportAll);
        $('aek-copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(message()); MethodKit.toast('Botschaft kopiert', 'success'); } catch (e) { MethodKit.toast('Kopieren nicht möglich', 'error'); } });
    })();
})();
