/* AEK-Kommunikation · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const STYLES = [
        { id: 'passive', ic: '🙈', l: 'Too soft', d: 'I talk around it, apologize, give in. The concern does not land.', fix: 'Your focus: the A part. Say the core sentence out loud first – without softeners.' },
        { id: 'aggressive', ic: '🔥', l: 'Too hard', d: 'I get direct, blaming or loud. The concern lands – but the relationship suffers.', fix: 'Your focus: E and K. Take twice as long for the other person’s perspective.' },
        { id: 'avoid', ic: '🫥', l: 'Avoiding', d: 'I prefer to say nothing and hope it sorts itself out.', fix: 'Your focus: a concrete date (step 6). Prep lowers the threshold.' },
        { id: 'balanced', ic: '⚖️', l: 'Usually balanced', d: 'I often hit the tone – but not under pressure.', fix: 'Your focus: the objections in step 6, so you stay balanced under pressure too.' }
    ];
    const IPARTS = [
        { k: 'obs', l: 'Observation', q: 'What concretely happened – without judgment?', ph: 'When … / As … / Over the last two weeks …', chk: 'judge' },
        { k: 'effect', l: 'Effect on me', q: 'What does that trigger in you?', ph: '… then I feel … / … that means for me …', chk: 'you' },
        { k: 'need', l: 'Need', q: 'What do you need?', ph: 'It matters to me that … / I need …', chk: '' },
        { k: 'ask', l: 'Request / suggestion', q: 'What do you specifically wish for?', ph: 'So I ask you … / My suggestion: …', chk: 'soft' }
    ];
    const SOFT = /\b(eigentlich|vielleicht|irgendwie|ein bisschen|nur|mal|quasi|sozusagen|könnte man|wäre es möglich|ich glaube|ich denke|sorry|entschuldigung|tut mir leid|nicht böse gemeint)\b/i;
    const YOU = /\b(du bist|du hast immer|du machst immer|du nie|immer|nie|ständig|typisch|wie immer|schon wieder)\b/i;
    const JUDGE = /\b(unmöglich|respektlos|faul|chaotisch|unprofessionell|egoistisch|rücksichtslos|unfair|falsch|schlecht)\b/i;
    const PERSP = [
        { k: 'situation', l: 'What situation is the other person in right now?', ph: 'Pressure, deadlines, their own expectations, what else is going on …' },
        { k: 'fear', l: 'What might they fear about your message?', ph: 'More work, losing face, losing control, rejection …' },
        { k: 'need', l: 'What do they probably need?', ph: 'Reliability, recognition, a say, calm …' },
        { k: 'react', l: 'How will they likely react?', ph: 'First reaction – and what is underneath.' }
    ];
    const E_STARTS = ['I understand that', 'I am aware that', 'I see that', 'I can see that'];
    const KIND_CATS = ['Something the person concretely did', 'A strength I truly appreciate', 'What matters to me in the collaboration', 'Why the relationship matters to me'];
    const EMPTY = /\b(toll|super|grossartig|great|nett|lieb|cool|klasse|spitze)\b/i;
    const ORDERS = [
        { id: 'kea', seq: ['k', 'e', 'a'], l: 'K → E → A', d: 'Classic: appreciation opens, empathy connects, the concern closes. For managers, customers.' },
        { id: 'eak', seq: ['e', 'a', 'k'], l: 'E → A → K', d: 'More direct: show understanding first, then plain talk, end warm. For colleagues, partner.' },
        { id: 'aek', seq: ['a', 'e', 'k'], l: 'A → E → K', d: 'For urgent or repeated concerns: clarity first, then cushion.' },
        { id: 'kae', seq: ['k', 'a', 'e'], l: 'K → A → E', d: 'Sandwich variant: concern in the middle, understanding at the end leaves room for a reply.' }
    ];
    const OBJ_SEEDS = ['That is not possible now.', 'That is your problem.', 'Everyone else manages that too.', 'You see this too narrowly.', 'Why are you only saying this now?', 'I don’t have time for that.'];
    const LINKS = [
        { m: 'Nonviolent communication', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Deepen the I-message.' },
        { m: 'Harvard method', l: '../harvard-method/harvard-method.html', why: 'When the conversation becomes a negotiation.' },
        { m: 'Conflict escalation', l: '../conflict-escalation/conflict-escalation.html', why: 'When the conflict is already advanced.' },
        { m: 'Communication models', l: '../communication/communication.html', why: 'Understand four sides of a message.' },
        { m: 'RAFAEL method', l: '../rafael-method/rafael-method.html', why: 'Reflect on the conversation afterwards in a structured way.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;

    const aText = () => IPARTS.map(p => (S.i[p.k] || '').trim()).filter(Boolean).join(' ');
    const eText = () => { const t = (S.etext || '').trim(); return t || (S.p.need ? `${E_STARTS[0]} ${S.p.need.trim().replace(/\.$/, '')} matters to you.` : ''); };
    const kText = () => (S.ktext || '').trim();
    const part = (k) => k === 'a' ? aText() : k === 'e' ? eText() : kText();
    const message = () => { const o = ORDERS.find(x => x.id === S.order) || ORDERS[0]; return S.final && S.finalEdited ? S.final : o.seq.map(part).filter(Boolean).join('\n\n'); };

    function toneHints(text, ctx) {
        const h = []; let m;
        if ((m = text.match(SOFT)) && ctx !== 'k') h.push({ t: 'warn', m: `Softener “${esc(m[0])}" – weakens your concern. Try cutting it.` });
        if ((m = text.match(YOU))) h.push({ t: 'warn', m: `„${esc(m[0])}" sounds like blame. Generalizations trigger defense – stay with the concrete case.` });
        if ((m = text.match(JUDGE))) h.push({ t: 'warn', m: `„${esc(m[0])}" is a judgment. What did you concretely observe?` });
        if (ctx === 'k' && (m = text.match(EMPTY)) && words(text) < 12) h.push({ t: 'info', m: `„${esc(m[0])}" – too general. Name <em>what</em> exactly what you appreciate.` });
        return h;
    }
    const notes = (h) => h.map(x => `<div class="mk-note ${x.t}"><i class="fas ${x.t === 'ok' ? 'fa-check-circle' : x.t === 'warn' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i><span>${x.m}</span></div>`).join('');

    /* ---------- 1 ---------- */
    function renderDiff() {
        const d = n(S.difficulty, 5);
        $('aek-diff').innerHTML = `<div class="mk-field"><label>How hard is this conversation for you?</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${d}" id="aek-diffr"><span class="mk-range-val">${d}</span></div></div>
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
        if (k === 'obs' && /\b(ich finde|ich fühle|ich glaube)\b/i.test(v)) h.push({ t: 'info', m: 'The observation stays with the facts – your experience comes in part 2.' });
        if (k === 'ask' && v.trim() && !/\b(bitte|vorschlag|wünsche|möchte|lass uns|können wir|würdest du)\b/i.test(v)) h.push({ t: 'info', m: 'Phrase it as a request or suggestion – then it stays negotiable and still clear.' });
        host.innerHTML = notes(h);
    }
    function renderAPreview() {
        const t = aText();
        $('aek-apreview').innerHTML = t ? `<div class="mk-result aek-prev-a"><h4>💪 Assertive</h4>${esc(t)}</div><div class="mk-faint" style="margin-top:6px">${words(t)} Wörter · ${words(t) > 70 ? 'Eher lang – was kann weg?' : words(t) < 15 ? 'Sehr knapp – fehlt ein Teil?' : 'Gute Länge.'}</div>` : '<div class="mk-empty">Fill in the four parts above – your clear sentence appears here.</div>';
    }

    /* ---------- 3 ---------- */
    function renderPersp() {
        $('aek-persp').innerHTML = `<div class="aek-chair"><i class="fas fa-chair"></i> You are now sitting in the chair of <strong>${esc(S.who || 'deinem Gegenüber')}</strong>.</div>` +
            PERSP.map(p => `<div class="mk-field"><label>${p.l}</label><textarea class="mk-textarea" data-pp="${p.k}" placeholder="${p.ph}">${esc(S.p[p.k] || '')}</textarea></div>`).join('');
        $('aek-persp').querySelectorAll('[data-pp]').forEach(t => t.addEventListener('input', () => { S.p[t.dataset.pp] = t.value; MethodKit.save(); renderEPreview(); }));
        MethodKit._autosizeAll();
    }
    function renderEPreview() {
        const sugg = S.p.need ? E_STARTS.map(s => `${s} ${S.p.need.trim().replace(/\.$/, '')} matters to you.`) : [];
        $('aek-epreview').innerHTML = `
            ${sugg.length ? `<div class="mk-section-label">Vorschläge aus deiner Perspektivarbeit</div><div class="aek-sugg">${sugg.map(s => `<button class="aek-sugg-b" data-es="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : ''}
            <div class="mk-field" style="margin-top:10px"><label for="aek-etext">Your empathy sentence</label><textarea class="mk-textarea" id="aek-etext" placeholder="I understand that …">${esc(S.etext || '')}</textarea></div>
            ${S.etext && /\baber\b/i.test(S.etext) ? '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>Ein „aber" löscht alles davor. Versuch „und" oder einen Punkt – das Anliegen kommt ohnehin in einem eigenen Satz.</span></div>' : ''}
            ${S.etext && S.etext.trim().length > 10 ? `<div class="mk-result aek-prev-e"><h4>❤️ Empathetic</h4>${esc(S.etext)}</div>` : ''}`;
        $('aek-epreview').querySelectorAll('[data-es]').forEach(b => b.addEventListener('click', () => { S.etext = b.dataset.es; MethodKit.save(); renderEPreview(); }));
        const t = $('aek-etext'); t.addEventListener('input', () => { S.etext = t.value; MethodKit.save(); }); t.addEventListener('change', renderEPreview);
        MethodKit._autosizeAll();
    }

    /* ---------- 4 ---------- */
    function renderKind() {
        $('aek-kind').innerHTML = `
            <div class="mk-section-label">Collect specifics</div>
            ${KIND_CATS.map((c, i) => `<div class="mk-field"><label>${c}</label><input class="mk-input" data-kc="${i}" value="${esc(S.k[i] || '')}" placeholder="…"></div>`).join('')}
            <div class="mk-field" style="margin-top:8px"><label for="aek-ktext">Your appreciation sentence</label><span class="hint">One or two sentences, honest – not a lead-in to the concern, but true on its own.</span><textarea class="mk-textarea" id="aek-ktext" placeholder="I appreciate about you / our collaboration that …">${esc(S.ktext || '')}</textarea></div>
            <div id="aek-khint">${notes(toneHints(S.ktext || '', 'k'))}</div>
            ${S.ktext && S.ktext.trim().length > 10 && !toneHints(S.ktext, 'k').length ? `<div class="mk-result aek-prev-k"><h4>🤝 Kind</h4>${esc(S.ktext)}</div>` : ''}`;
        $('aek-kind').querySelectorAll('[data-kc]').forEach(el => el.addEventListener('input', () => { S.k[+el.dataset.kc] = el.value; MethodKit.save(); }));
        const t = $('aek-ktext'); t.addEventListener('input', () => { S.ktext = t.value; MethodKit.save(); $('aek-khint').innerHTML = notes(toneHints(t.value, 'k')); }); t.addEventListener('change', renderKind);
        MethodKit._autosizeAll();
    }

    /* ---------- 5 ---------- */
    function renderOrder() {
        const rec = ['Manager', 'Customer'].includes(S.rel) ? 'kea' : ['Partner', 'Colleague', 'Friend'].includes(S.rel) ? 'eak' : null;
        $('aek-order').innerHTML = `<div class="mk-grid aek-orders">${ORDERS.map(o => `<button class="mk-option ${(S.order || 'kea') === o.id ? 'selected' : ''}" data-order="${o.id}"><span class="t">${o.l}${rec === o.id ? ' <span class="mk-badge">recommended</span>' : ''}</span><span class="d">${o.d}</span></button>`).join('')}</div>`;
        $('aek-order').querySelectorAll('[data-order]').forEach(b => b.addEventListener('click', () => { S.order = b.dataset.order; S.finalEdited = false; MethodKit.save(); renderOrder(); renderMessage(); renderBalance(); }));
    }
    function renderMessage() {
        const o = ORDERS.find(x => x.id === (S.order || 'kea'));
        const missing = o.seq.filter(k => !part(k)).map(k => ({ a: 'Assertive (step 2)', e: 'Empathetic (step 3)', k: 'Kind (step 4)' })[k]);
        const msg = message();
        $('aek-message').innerHTML = `
            ${missing.length ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Noch leer: ${missing.join(', ')}.</span></div>` : ''}
            <div class="aek-msg">${o.seq.map(k => part(k) ? `<div class="aek-msg-p ${k}"><span class="tag">${{ a: '💪 A', e: '❤️ E', k: '🤝 K' }[k]}</span>${esc(part(k))}</div>` : '').join('')}</div>
            <div class="mk-field" style="margin-top:12px"><label for="aek-final">Fine-tuning – your final text</label><span class="hint">Here you may rephrase freely. Changing the order resets the text.</span><textarea class="mk-textarea" id="aek-final">${esc(msg)}</textarea></div>`;
        const f = $('aek-final'); f.addEventListener('input', () => { S.final = f.value; S.finalEdited = true; MethodKit.save(); renderBalance(); });
        MethodKit._autosizeAll();
    }
    function renderBalance() {
        const a = words(aText()), e = words(eText()), k = words(kText()), tot = a + e + k || 1;
        const pct = (x) => Math.round(x / tot * 100);
        const h = toneHints(S.finalEdited ? S.final : message(), 'all');
        if (a && pct(a) > 65) h.push({ t: 'info', m: 'The A part dominates. For a difficult relationship, more E and K is worth it.' });
        if (a && pct(a) < 20 && tot > 30) h.push({ t: 'info', m: 'The A part almost disappears – is your concern still landing?' });
        if (!h.length && tot > 30) h.push({ t: 'ok', m: 'Balanced and without blame or softeners.' });
        $('aek-balance').innerHTML = `
            <div class="aek-bal"><i class="a" style="flex:${a || 0.0001}" title="Assertive ${pct(a)} %"></i><i class="e" style="flex:${e || 0.0001}" title="Empathetic ${pct(e)} %"></i><i class="k" style="flex:${k || 0.0001}" title="Kind ${pct(k)} %"></i></div>
            <div class="aek-bal-l"><span><b class="a"></b>Assertive ${pct(a)} %</span><span><b class="e"></b>Empathetic ${pct(e)} %</span><span><b class="k"></b>Kind ${pct(k)} %</span></div>
            ${notes(h)}`;
    }

    /* ---------- 6 ---------- */
    function renderObjections() {
        $('aek-objections').innerHTML = `
            ${S.obj.map(o => `<div class="aek-obj"><div class="aek-obj-h"><span class="mk-badge">Einwand</span><input class="mk-input grow" data-ot="${o.id}" value="${esc(o.text)}" placeholder="What might the other person say?"><button class="mk-iconbtn" data-or="${o.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>
                <textarea class="mk-textarea" data-oa="${o.id}" placeholder="My reply – assertive, empathetic, kind">${esc(o.answer || '')}</textarea>${notes(toneHints(o.answer || '', 'a'))}</div>`).join('')}
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
        if (S.when || S.where) L.push('SETTING', [S.when, S.where].filter(Boolean).join(' · ')); if (S.after) L.push('Review: ' + S.after);
        MethodKit.exportText('aek-botschaft.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'aek-communication', accent: '#14b8a6', accent2: '#0ea5e9',
            steps: [{ icon: '🎯', label: 'Concern' }, { icon: '💪', label: 'Assertive' }, { icon: '❤️', label: 'Empathetic' }, { icon: '🤝', label: 'Kind' }, { icon: '✉️', label: 'Message' }, { icon: '🗓️', label: 'Preparation' }],
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
        $('aek-copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(message()); MethodKit.toast('Message copied', 'success'); } catch (e) { MethodKit.toast('Copy not possible', 'error'); } });
    })();
})();
