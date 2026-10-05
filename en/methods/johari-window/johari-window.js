/* Johari-Fenster · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    // Die 56 klassischen Johari-Adjektive (deutsch)
    const ADJ = ['able', 'accepting', 'adaptable', 'bold', 'calm', 'caring', 'cheerful', 'clever', 'complex', 'confident', 'dependable', 'dignified', 'empathetic', 'energetic', 'extroverted', 'friendly', 'helpful', 'idealistic', 'independent', 'ingenious', 'intelligent', 'introverted', 'kind', 'knowledgeable', 'logical', 'loving', 'mature', 'modest', 'nervous', 'observant', 'organised', 'patient', 'powerful', 'proud', 'quiet', 'reflective', 'relaxed', 'religious', 'responsive', 'searching', 'self-assertive', 'self-determined', 'sentimental', 'shy', 'silly', 'spontaneous', 'likeable', 'tense', 'trustworthy', 'warm', 'wise', 'witty', 'ambitious', 'assertive', 'creative', 'honest'];
    const NEG = ['nervous', 'tense', 'shy', 'silly', 'proud', 'complex', 'sentimental', 'quiet', 'introverted'];
    const LINKS = [
        { m: 'Self-assessment', l: '../self-assessment/self-assessment.html', why: 'Compare competencies with others’ view.' },
        { m: 'Finding strengths', l: '../strengths-finder/strengths-finder.html', why: 'Use the traits from the open area as strengths.' },
        { m: 'Four-ears model', l: '../communication/communication.html', why: 'How you come across depends on how you send.' },
        { m: 'Nonviolent communication', l: '../nonviolent-communication/nonviolent-communication.html', why: 'Disclose yourself without defending yourself.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const raters = () => S.raters.filter(r => r.adj.length);
    const counts = () => { const c = {}; raters().forEach(r => r.adj.forEach(a => c[a] = (c[a] || 0) + 1)); return c; };
    const othersSet = () => Object.keys(counts());
    const win = () => { const O = othersSet(), c = counts(); return { open: S.self.filter(a => O.includes(a)).sort((a, b) => c[b] - c[a]), hidden: S.self.filter(a => !O.includes(a)), blind: O.filter(a => !S.self.includes(a)).sort((a, b) => c[b] - c[a]), unknown: ADJ.filter(a => !S.self.includes(a) && !O.includes(a)), c }; };

    /* ---------- 1 ---------- */
    function renderSelf() {
        const nSel = S.self.length;
        $('jo-self').innerHTML = `<div class="jo-count ${nSel > 8 ? 'over' : nSel >= 5 ? 'ok' : ''}">${nSel} chosen</div><div class="mk-chips jo-chips">${ADJ.map(a => `<button class="mk-chip ${S.self.includes(a) ? 'selected' : ''}" data-a="${a}">${a}</button>`).join('')}</div>` +
            (nSel > 8 ? note('warn', `${nSel} traits – the window gets blurry. Which five to eight are really typical?`) : nSel >= 5 ? (S.self.some(a => NEG.includes(a)) ? note('ok', `You also chose less flattering traits (${S.self.filter(a => NEG.includes(a)).join(', ')}). That is a sign of an honest self-image.`) : note('info', 'Only positive traits? That is normal – and exactly why others’ views are worthwhile. Nobody is only “reliable, friendly, smart”.')) : '');
        $('jo-self').querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { const a = b.dataset.a; S.self = S.self.includes(a) ? S.self.filter(x => x !== a) : [...S.self, a]; MethodKit.save(); renderSelf(); }));
    }

    /* ---------- 2 ---------- */
    function renderRaters() {
        if (!S.raters.length) S.raters.push({ id: MethodKit.uid(), name: '', rel: '', adj: [] });
        if (S.openRater === undefined || !S.raters.some(r => r.id === S.openRater)) S.openRater = S.raters[0].id;
        $('jo-raters').innerHTML = `<div class="jo-rtabs">${S.raters.map((r, i) => `<button class="jo-rtab ${S.openRater === r.id ? 'on' : ''}" data-rt="${r.id}">${esc(r.name || 'Person ' + (i + 1))}<small>${r.adj.length}</small></button>`).join('')}${S.raters.length < 6 ? `<button class="jo-rtab add" id="jo-radd" aria-label="Add person"><i class="fas fa-plus"></i></button>` : ''}</div>` +
            S.raters.filter(r => r.id === S.openRater).map(r => `<div class="jo-rater"><div class="mk-grid-2"><div class="mk-field"><label>Name</label><input class="mk-input" data-rn="${r.id}" value="${esc(r.name)}" placeholder="e.g. Lena"></div><div class="mk-field"><label>Relationship</label><select class="mk-select" data-rr="${r.id}"><option value="">–</option>${[['work', 'Work / colleague'], ['boss', 'Vorgesetzte/r'], ['friend', 'Freund/in'], ['family', 'Familie'], ['partner', 'Partner/in'], ['other', 'Sonstige']].map(([v, l]) => `<option value="${v}" ${r.rel === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div><div class="jo-count ${r.adj.length > 8 ? 'over' : r.adj.length >= 5 ? 'ok' : ''}">${r.adj.length} chosen</div><div class="mk-chips jo-chips">${ADJ.map(a => `<button class="mk-chip ${r.adj.includes(a) ? 'selected' : ''} ${S.self.includes(a) ? 'mine' : ''}" data-ra="${a}">${a}</button>`).join('')}</div><div class="mk-faint" style="margin-top:6px">Outlined = also in your self-image</div>${S.raters.length > 1 ? `<button class="mk-btn mk-btn-outline mk-btn-sm" style="margin-top:10px" data-rdel="${r.id}"><i class="fas fa-trash"></i> Person entfernen</button>` : ''}</div>`).join('') +
            (() => { const R = raters(); const rels = new Set(R.map(r => r.rel).filter(Boolean)); return R.length === 0 ? note('info', 'No view from others yet. Without real feedback the window remains a guess – really ask someone.') : R.length === 1 ? note('info', 'One view from others shows how <em>one</em> person sees you. From three people on you will see patterns.') : rels.size === 1 && R.length >= 2 ? note('info', 'All raters from the same context. How colleagues see you can differ a lot from how friends see you – mix the perspectives.') : note('ok', `${R.length} others’ views${rels.size > 1 ? ' aus ' + rels.size + ' Kontexten' : ''}. The window is meaningful.`); })();
        const host = $('jo-raters');
        host.querySelectorAll('[data-rt]').forEach(b => b.addEventListener('click', () => { S.openRater = b.dataset.rt; renderRaters(); }));
        const add = $('jo-radd'); if (add) add.addEventListener('click', () => { const r = { id: MethodKit.uid(), name: '', rel: '', adj: [] }; S.raters.push(r); S.openRater = r.id; MethodKit.save(); renderRaters(); });
        host.querySelectorAll('[data-rn]').forEach(i => { i.addEventListener('input', () => { S.raters.find(r => r.id === i.dataset.rn).name = i.value; MethodKit.save(); }); i.addEventListener('change', renderRaters); });
        host.querySelectorAll('[data-rr]').forEach(s => s.addEventListener('change', () => { S.raters.find(r => r.id === s.dataset.rr).rel = s.value; MethodKit.save(); renderRaters(); }));
        host.querySelectorAll('[data-ra]').forEach(b => b.addEventListener('click', () => { const r = S.raters.find(x => x.id === S.openRater); const a = b.dataset.ra; r.adj = r.adj.includes(a) ? r.adj.filter(x => x !== a) : [...r.adj, a]; MethodKit.save(); renderRaters(); }));
        host.querySelectorAll('[data-rdel]').forEach(b => b.addEventListener('click', () => { S.raters = S.raters.filter(r => r.id !== b.dataset.rdel); S.openRater = S.raters[0] && S.raters[0].id; MethodKit.save(); renderRaters(); }));
    }

    /* ---------- 3 ---------- */
    function tag(a, c, max) { const w = c && max ? c[a] / max : 0; return `<span class="jo-tag ${w >= 0.67 ? 'strong' : ''}" ${c && c[a] ? `title="${c[a]} of ${max} people"` : ''}>${a}${c && c[a] > 1 ? `<small>×${c[a]}</small>` : ''}</span>`; }
    function renderWindow() {
        const W = win(); const nR = raters().length; const max = nR || 1;
        if (!S.self.length && !nR) { $('jo-window').innerHTML = note('info', 'Choose your self-image first and enter at least one view from others.'); return; }
        const total = W.open.length + W.hidden.length + W.blind.length || 1;
        const openPct = Math.round(W.open.length / total * 100);
        $('jo-window').innerHTML = `<div class="jo-axes"><span></span><span>Known to me</span><span>Unknown to me</span></div><div class="jo-grid"><span class="jo-axis-y">Known to others</span><div class="jo-q open" style="--w:${Math.max(20, 20 + W.open.length * 8)}%"><b>Open</b><small>${W.open.length}</small><div>${W.open.length ? W.open.map(a => tag(a, W.c, max)).join('') : '<span class="mk-faint">–</span>'}</div></div><div class="jo-q blind"><b>Blind spot</b><small>${W.blind.length}</small><div>${W.blind.length ? W.blind.map(a => tag(a, W.c, max)).join('') : '<span class="mk-faint">–</span>'}</div></div><span class="jo-axis-y">Unknown to others</span><div class="jo-q hidden"><b>Hidden</b><small>${W.hidden.length}</small><div>${W.hidden.length ? W.hidden.map(a => tag(a)).join('') : '<span class="mk-faint">–</span>'}</div></div><div class="jo-q unknown"><b>Unknown</b><small>${W.unknown.length}</small><div class="mk-faint" style="font-size:12px">${W.unknown.length} Traits that neither you nor others named – potential or simply not you.</div></div></div>` +
            (nR ? `<div class="jo-stats"><div><b>${openPct} %</b><span>open area</span></div><div><b>${W.blind.length}</b><span>blind spots</span></div><div><b>${W.hidden.length}</b><span>hidden</span></div><div><b>${nR}</b><span>raters</span></div></div>` : '') +
            (!nR ? note('info', 'Without others’ views there is no blind spot and no open area – everything is “hidden”. Enter in step 2 what others say.') : '') +
            (nR && W.open.length === 0 ? note('warn', 'Not a single word overlaps. Either others see you completely differently from how you see yourself – or the raters hardly know you. Both are important information.') : '') +
            (nR && openPct >= 60 ? note('ok', `${openPct} % open – self-image and others’ view largely match. You are readable to others.`) : '') +
            (nR && W.blind.length > W.open.length ? note('info', `More blind spots (${W.blind.length}) than open (${W.open.length}). Others see sides of you that you don't have on your radar. Read the blind spots slowly – which ones are a gift?`) : '') +
            (nR >= 2 && W.blind.some(a => W.c[a] === nR) ? note('warn', `<strong>All</strong> raters name: ${W.blind.filter(a => W.c[a] === nR).join(', ')} – and you yourself don’t. That is the strongest blind spot this tool can show.`) : '') +
            (nR && W.hidden.length >= S.self.length * 0.6 && S.self.length >= 5 ? note('info', `${W.hidden.length} of ${S.self.length} self-image traits are seen by nobody. Do you not show yourself – or is the self-image off?`) : '');
    }

    /* ---------- 4 ---------- */
    function renderReflect() {
        const W = win(); const nR = raters().length; const max = nR || 1;
        const strongBlind = W.blind.filter(a => W.c[a] / max >= 0.5);
        $('jo-reflect').innerHTML = (W.blind.length ? `<div class="jo-refl blind"><b>👁️ Blind spot</b><div>${W.blind.map(a => tag(a, W.c, max)).join('')}</div>${strongBlind.some(a => NEG.includes(a)) ? `<div class="mk-faint">${strongBlind.filter(a => NEG.includes(a)).join(', ')} – uncomfortable to hear? Exactly these responses are the most valuable, because nobody else will tell you.</div>` : strongBlind.length ? `<div class="mk-faint">${strongBlind.join(', ')} – positive sides you don’t see yourself. Why not? Modesty, habit, or doesn’t it count as a strength for you?</div>` : ''}</div>` : '') +
            (W.hidden.length ? `<div class="jo-refl hidden"><b>🔒 Hidden</b><div>${W.hidden.map(a => tag(a)).join('')}</div><div class="mk-faint">${W.hidden.some(a => NEG.includes(a)) ? `${W.hidden.filter(a => NEG.includes(a)).join(', ')} – you probably hide this consciously. Does it cost energy to hide it?` : 'Positive traits that nobody sees. That is wasted capital – or you only show them in contexts from which nobody gave feedback.'}</div></div>` : '') +
            (!W.blind.length && !W.hidden.length ? note('info', 'Nothing to reflect on yet – fill in self-image and others’ views first.') : '');
    }

    /* ---------- 5 ---------- */
    function renderGrow() {
        const W = win(); const nR = raters().length;
        const asks = []; const shows = [];
        if (!nR) asks.push('Ask the first person – without others’ views there is no window.');
        else if (nR < 3) asks.push(`You have ${nR} view from others${nR > 1 ? 'er' : ''}. Get ${3 - nR} more${3 - nR > 1 ? '' : 's'} – from a different context.`);
        if (W.blind.length) asks.push(`Ask: “You said ’${W.blind[0]}’ – when did you experience that in me?” An example turns the word into a behaviour.`);
        if (W.hidden.length) { const pos = W.hidden.filter(a => !NEG.includes(a)); if (pos.length) shows.push(`Show ”${pos[0]}” consciously: in which situation this week could that become visible?`); const neg = W.hidden.filter(a => NEG.includes(a)); if (neg.length) shows.push(`„${neg[0]}” – tell someone you trust. Whoever names a weakness doesn’t appear weak, but approachable.`); }
        $('jo-grow').innerHTML = `<div class="jo-grow"><div class="jo-grow-col ask"><b>🙋 Seek feedback</b><small>shrinks the blind spot</small><ul>${asks.map(a => `<li>${a}</li>`).join('') || '<li>Your blind spot is empty – either very good, or you haven’t asked enough people yet.</li>'}</ul></div><div class="jo-grow-col show"><b>🪟 Disclose yourself</b><small>shrinks the hidden area</small><ul>${shows.map(a => `<li>${a}</li>`).join('') || '<li>Nothing hidden – everything you say about yourself, others see too.</li>'}</ul></div></div>`;
    }
    function renderSummary() {
        const W = win();
        $('jo-summary').innerHTML = S.self.length ? `<div class="mk-result" style="margin-top:12px"><h4>Your Johari window</h4><div class="jo-sum"><div><b>Open</b>${W.open.join(', ') || '–'}</div><div><b>Blind spot</b>${W.blind.join(', ') || '–'}</div><div><b>Hidden</b>${W.hidden.join(', ') || '–'}</div>${S.ask ? `<div><b>Frage ich</b>${esc(S.ask)}</div>` : ''}${S.show ? `<div><b>Zeige ich</b>${esc(S.show)}</div>` : ''}</div></div>` : '';
    }
    function renderLinks() { $('jo-links').innerHTML = LINKS.map(x => `<a class="mk-option jo-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function shareText() { return `Hi! I'm currently working on my self-image and how others see me (Johari window). Would you help me? Please choose 5–8 words from this list that describe me best – honestly, not politely:\n\n${ADJ.join(', ')}\n\nThank you!`; }
    function exportAll() {
        const W = win(); const R = raters();
        const L = ['JOHARI WINDOW', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'SELF-IMAGE: ' + (S.self.join(', ') || '–'), ''];
        if (R.length) { L.push('OTHERS’ VIEWS'); R.forEach((r, i) => L.push(`${r.name || 'Person ' + (i + 1)}${r.rel ? ' (' + r.rel + ')' : ''}: ${r.adj.join(', ')}`)); L.push(''); }
        L.push('OPEN (me & others): ' + (W.open.map(a => W.c[a] > 1 ? `${a} ×${W.c[a]}` : a).join(', ') || '–'), 'BLIND SPOT (others only): ' + (W.blind.map(a => W.c[a] > 1 ? `${a} ×${W.c[a]}` : a).join(', ') || '–'), 'HIDDEN (me only): ' + (W.hidden.join(', ') || '–'), 'UNKNOWN: ' + W.unknown.length + ' traits', '');
        if (S.reflectBlind) L.push('Reflection blind spot: ' + S.reflectBlind); if (S.reflectHidden) L.push('Reflection hidden: ' + S.reflectHidden);
        if (S.ask) L.push('I ask: ' + S.ask); if (S.show) L.push('I show: ' + S.show);
        MethodKit.exportText('johari-fenster.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'johari-window', accent: '#06b6d4', accent2: '#3b82f6',
            steps: [{ icon: '🙂', label: 'Self-image' }, { icon: '👥', label: 'others’ views' }, { icon: '🪟', label: 'Window' }, { icon: '🤔', label: 'Reflection' }, { icon: '📈', label: 'Enlarge' }],
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
        $('jo-share').addEventListener('click', () => navigator.clipboard.writeText(shareText()).then(() => MethodKit.toast('Question text copied – send it to someone', 'ok')));
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
