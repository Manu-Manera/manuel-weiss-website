/* Nonviolent communication · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const JUDGE = /\b(always|never|constantly|every time|typical|lazy|selfish|disrespectful|rude|unfair|mean|arrogant|unreliable|chaotic|impossible|sloppy|ignorant|stupid|immer|nie|niemals|ständig|dauernd|jedes mal|typisch|faul|egoistisch|respektlos|unverschämt|rücksichtslos|unfair|gemein|arrogant|unzuverlässig|chaotisch|unmöglich|schlampig|ignorant|dumm)\b/i;
    const YOU_ARE = /\byou are\b|\byou\'re\b|\byou always\b|\byou never\b|\byou only want\b|\byou do (that |it )?on purpose\b|\bdu bist\b|\bdu hast (mich )?(wieder|schon wieder)\b|\bdu willst (doch )?nur\b|\bdu machst (das )?(absichtlich|extra)\b/i;
    const PSEUDO = /\b(ignoriert|missachtet|übergangen|angegriffen|manipuliert|ausgenutzt|hintergangen|verraten|bevormundet|abgelehnt|nicht ernst genommen|im stich gelassen|betrogen|provoziert|benutzt|unterdrückt|missverstanden|nicht gesehen|nicht gehört|abgewertet)\b/i;
    const FEEL = {
        unmet: { l: 'When needs are unmet', items: ['sad', 'anxious', 'angry', 'frustrated', 'disappointed', 'lonely', 'exhausted', 'helpless', 'confused', 'restless', 'hurt', 'irritated', 'worried', 'overwhelmed', 'annoyed', 'insecure'] },
        met: { l: 'When needs are met', items: ['relieved', 'grateful', 'calm', 'glad', 'connected', 'confident', 'inspired', 'proud', 'safe', 'alive'] }
    };
    const NEEDS = {
        'Connection': ['Closeness', 'Belonging', 'Understanding', 'Being seen', 'Support', 'Trust', 'Appreciation', 'Respect'],
        'Autonomy': ['Freedom', 'Self-determination', 'Space', 'Choice'],
        'Security': ['Reliability', 'Clarity', 'Stability', 'Protection', 'Order'],
        'Meaning & growth': ['Meaning', 'Contributing', 'Learning', 'Creativity', 'Effectiveness'],
        'Well-being': ['Peace', 'Rest', 'Ease', 'Play', 'Health'],
        'Honesty': ['Authenticity', 'Openness', 'Fairness', 'Equality']
    };
    const FEEL2NEED = { sad: ['Connection', 'Closeness'], anxious: ['Security', 'Protection'], angry: ['Respect', 'Fairness'], frustrated: ['Effectiveness', 'Clarity'], disappointed: ['Reliability', 'Trust'], lonely: ['Closeness', 'Belonging'], exhausted: ['Rest', 'Support'], helpless: ['Effectiveness', 'Support'], confused: ['Clarity'], restless: ['Security', 'Peace'], hurt: ['Appreciation', 'Respect'], irritated: ['Space', 'Peace'], worried: ['Security'], overwhelmed: ['Support', 'Space'], annoyed: ['Respect', 'Space'], insecure: ['Clarity', 'Trust'] };
    const NEG = /\b(nicht|nie|kein|keine|aufhören|aufhörst|hör auf|hörst auf|lass das|unterlass|weniger)\b/i;
    const VAGUE = /\b(mehr respekt|respektvoller|netter|besser|ernst nehmen|rücksicht|verständnis haben|dich bemühen|anstrengen|zuhören|verlässlich(er)? sein|dich ändern)\b/i;
    const NO_OPTS = [{ k: 'ok', ic: '🤝', l: 'Okay – then we’ll look for something else', d: 'That is a request. You stay in connection.' }, { k: 'hurt', ic: '😔', l: 'I would be disappointed but would want to understand', d: 'Almost a request. Then ask about the need behind the no.' }, { k: 'press', ic: '😤', l: 'I would apply pressure or hold it against them', d: 'That is a demand. The other person senses it – and no longer hears the request.' }];
    const LINKS = [
        { m: 'AEK communication', l: '../aek-communication/aek-communication.html', why: 'Balance the message clearly, empathetically and kindly.' },
        { m: 'Circular questioning', l: '../circular-interview/circular-interview.html', why: 'Deepen your counterpart’s perspective.' },
        { m: 'Harvard method', l: '../harvard-method/harvard-method.html', why: 'When needs turn into a negotiation.' },
        { m: 'Emotional intelligence', l: '../emotional-intelligence/emotional-intelligence.html', why: 'Recognise and name feelings faster.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const who = () => (S.who || '').trim() || 'your counterpart';

    /* ---------- 1 ---------- */
    function renderSitCheck() {
        const t = S.situation || ''; if (!t.trim()) { $('nvc-sitcheck').innerHTML = ''; return; }
        const j = t.match(JUDGE), y = t.match(YOU_ARE);
        $('nvc-sitcheck').innerHTML = (j || y) ? note('info', `Da steckt ${j ? `„${esc(j[0])}"` : ''}${j && y ? ' und ' : ''}${y ? `„${esc(y[0])}"` : ''} in there – completely normal for a first draft. That is exactly what the next four steps sort out.`) : note('ok', 'Already quite factual. Now separate the four steps cleanly.');
    }

    /* ---------- 2 ---------- */
    function renderObsCheck() {
        const t = S.observation || ''; if (!t.trim()) { $('nvc-obscheck').innerHTML = ''; return; }
        const H = [];
        const j = t.match(JUDGE); if (j) H.push(note('warn', `„${esc(j[0])}” is a judgement or generalisation. How often exactly, when exactly? Numbers and times are indisputable.`));
        if (YOU_ARE.test(t)) H.push(note('warn', '“You are …” describes a person, not a behaviour. Phrase it: “You did / said …”'));
        if (/\b(weil du|um mich|absichtlich|wolltest|because you|on purpose|deliberately|you wanted)\b/i.test(t)) H.push(note('info', 'That is an interpretation of intent. The camera sees no intentions – only actions.'));
        if (!H.length && /\d|gestern|heute|yesterday|today|at \d|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|last week|um \d|am (montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)|letzte woche/i.test(t)) H.push(note('ok', 'Concrete with time or number – nobody can dispute that.'));
        else if (!H.length) H.push(note('info', 'Sounds observational. Even stronger: when exactly, how often?'));
        $('nvc-obscheck').innerHTML = H.join('');
    }

    /* ---------- 3 ---------- */
    function renderFeelings() {
        $('nvc-feelings').innerHTML = Object.values(FEEL).map(g => `<div class="mk-section-label">${g.l}</div><div class="mk-chips">${g.items.map(f => `<button class="mk-chip ${S.feelings.includes(f) ? 'selected' : ''}" data-f="${f}">${f}</button>`).join('')}</div>`).join('');
        $('nvc-feelings').querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { const f = b.dataset.f; S.feelings = S.feelings.includes(f) ? S.feelings.filter(x => x !== f) : [...S.feelings, f].slice(-3); MethodKit.save(); renderFeelings(); renderFeelCheck(); }));
    }
    function renderFeelCheck() {
        const t = S.feeling || ''; const H = [];
        const p = t.match(PSEUDO); if (p) H.push(note('warn', `„${esc(p[0])}" is a pseudo-feeling: it describes what the other person (allegedly) does, not what is in you. What do you feel, <em>when</em> you see yourself treated like that – sad, angry, unsettled?`));
        if (/\bich fühle,? dass\b|\bi feel (that|like)\b|\bi have the feeling\b|\bich fühle mich wie\b|\bich habe das gefühl\b/i.test(t)) H.push(note('info', '“I feel that …” introduces a thought, not a feeling. A feeling stands alone: “I am sad.”'));
        if (S.feelings.length > 2) H.push(note('info', 'Three feelings – choose the strongest for the message. Several at once dilute it.'));
        if (!H.length && (S.feelings.length || t.trim())) H.push(note('ok', `${S.feelings.length ? S.feelings.join(', ') + ' – ' : ''}real feelings. They cannot be argued away.`));
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
        if (/\b(dass du|du sollst|du musst|von dir|dass er|dass sie|that you|you should|you must|from you|that he|that she)\b/i.test(t)) H.push(note('warn', 'A need is never tied to a specific person or action. “I need you to call” is a strategy. The need behind it: reliability? Connection?'));
        if (!H.length && (S.needs.length || t.trim())) H.push(note('ok', `${S.needs.length ? S.needs.join(' und ') : 'Das'} – a universal need that ${who()} probably knows too. That is your common ground.`));
        $('nvc-needcheck').innerHTML = H.join('');
    }
    function renderTheirNeeds() {
        const all = Object.values(NEEDS).flat();
        $('nvc-theirneeds').innerHTML = `<div class="mk-chips">${all.map(x => `<button class="mk-chip ${S.theirNeeds.includes(x) ? 'selected' : ''}" data-tn="${x}">${x}</button>`).join('')}</div>
            ${S.theirNeeds.length ? note(S.theirNeeds.some(x => S.needs.includes(x)) ? 'ok' : 'info', S.theirNeeds.some(x => S.needs.includes(x)) ? `You share the need for <strong>${S.theirNeeds.filter(x => S.needs.includes(x)).join(', ')}</strong> – only your strategies collide. That is the sentence with which you can open the conversation.` : `${who()} brauchte vermutlich ${S.theirNeeds.join(' or ')}. If you say that out loud in the conversation, the defensiveness drops immediately.`) : ''}`;
        $('nvc-theirneeds').querySelectorAll('[data-tn]').forEach(b => b.addEventListener('click', () => { const x = b.dataset.tn; S.theirNeeds = S.theirNeeds.includes(x) ? S.theirNeeds.filter(y => y !== x) : [...S.theirNeeds, x].slice(-2); MethodKit.save(); renderTheirNeeds(); }));
    }

    /* ---------- 5 ---------- */
    function renderReqCheck() {
        const t = S.request || ''; if (!t.trim()) { $('nvc-reqcheck').innerHTML = ''; return; }
        const H = [];
        const ng = t.match(NEG); if (ng) H.push(note('warn', `„${esc(ng[0])}" – a request says what you <em>want</em>, not what should stop. “Stop interrupting” → “Please let me finish, I’ll give you a sign.”`));
        const vg = t.match(VAGUE); if (vg) H.push(note('warn', `„${esc(vg[0])}" is not observable. What exactly should the person <em>do</em> – so concretely that you both know whether it happened?`));
        if (!/\?|wärst du bereit|would you be willing|could you|would you|are you open|könntest du|magst du|wäre es (für dich )?okay|bist du einverstanden/i.test(t)) H.push(note('info', 'Phrase it as a question: “Would you be willing to …?” That leaves the other person the choice – and that is exactly what distinguishes a request from a demand.'));
        if (/\b(ab jetzt|immer|in zukunft|nie wieder|jedes mal|from now on|always|in future|never again|every time)\b/i.test(t)) H.push(note('info', '“From now on always” is hardly doable. Ask for something for the next concrete situation – that can be promised.'));
        if (!H.length) H.push(note('ok', 'Positive, concrete, as a question – a real request.'));
        $('nvc-reqcheck').innerHTML = H.join('');
    }
    function renderNoTest() {
        $('nvc-notest').innerHTML = `<div class="mk-grid">${NO_OPTS.map(o => `<button class="mk-option ${S.noTest === o.k ? 'selected' : ''}" data-no="${o.k}"><span class="ic">${o.ic}</span><span class="t">${o.l}</span><span class="d">${o.d}</span></button>`).join('')}</div>
            ${S.noTest === 'press' ? `<div class="mk-field" style="margin-top:12px"><label for="nvc-nowhy">What is at stake for you if ${esc(who())} Nein sagt?</label><input class="mk-input" id="nvc-nowhy" value="${esc(S.noWhy || '')}" placeholder="Often an unmet need that hasn’t been voiced yet."></div>` + note('info', 'Say the need behind it first. Then the request can be a request again.') : ''}`;
        $('nvc-notest').querySelectorAll('[data-no]').forEach(b => b.addEventListener('click', () => { S.noTest = S.noTest === b.dataset.no ? '' : b.dataset.no; MethodKit.save(); renderNoTest(); }));
        const nw = $('nvc-nowhy'); if (nw) nw.addEventListener('input', e => { S.noWhy = e.target.value; MethodKit.save(); });
    }

    /* ---------- 6 ---------- */
    function message() {
        const obs = (S.observation || '').trim().replace(/\.$/, '');
        const asWenn = /^wenn\b/i.test(obs);
        // Gefühl: „ich bin X" / “I feel X" – invertiert nach „Wenn …," sonst als eigener Satz
        let f = (S.feeling || '').trim().replace(/\.$/, '').replace(/^ich\s+/i, '');
        if (!f && S.feelings.length) f = 'bin ' + S.feelings[0];
        if (f && !/^(bin|fühle)\b/i.test(f)) f = 'feel ' + f;
        const fInv = f.replace(/^bin/i, 'I am').replace(/^fühle mich/i, 'I feel');
        let nd = (S.need || '').trim().replace(/\.$/, '');
        if (!nd && S.needs.length) nd = 'because ' + S.needs.join(' and ') + ' important ' + (S.needs.length > 1 ? 'sind' : 'ist');
        else if (nd && !/^weil\b/i.test(nd)) nd = 'weil ' + nd;
        const parts = [];
        if (obs && asWenn) { parts.push(obs + ','); if (f) parts.push(fInv + (nd ? ',' : '.')); }
        else { if (obs) parts.push(obs.charAt(0).toUpperCase() + obs.slice(1) + '.'); if (f) parts.push('Me ' + f + (nd ? ',' : '.')); }
        if (nd) parts.push(nd + '.');
        if (S.request) parts.push(S.request.trim());
        return parts.join(' ');
    }
    function renderMessage() {
        const m = message();
        const missing = [['observation', 'Observation', 2], ['feeling', 'Feeling', 3], ['need', 'Need', 4], ['request', 'Request', 5]].filter(([k, , ]) => !(S[k] || '').trim() && !(k === 'feeling' && S.feelings.length) && !(k === 'need' && S.needs.length));
        $('nvc-message').innerHTML = `<div class="nvc-msg">${['👁️', '🫀', '💎', '🙏'].map((ic, i) => `<span class="nvc-msg-ic ${[S.observation, S.feeling || S.feelings.length, S.need || S.needs.length, S.request][i] ? 'on' : ''}">${ic}</span>`).join('')}</div>
            <div class="mk-result"><h4>Scaffold</h4>${m ? esc(m) : '<span class="mk-faint">Still empty – fill in the four steps.</span>'}</div>
            ${missing.length ? note('info', 'Still open: ' + missing.map(([, l, s]) => `${l} (step ${s})`).join(', ')) : note('ok', 'All four steps are there. Now put it in your own language – without giving up the order.')}`;
        const fin = $('nvc-final'); if (fin && !S.final && m) { fin.placeholder = m; }
    }
    function renderFlip() {
        const F = S.flip; const fld = (k, l, ph) => `<div class="mk-field"><label>${l}</label><input class="mk-input" data-fl="${k}" value="${esc(F[k] || '')}" placeholder="${ph}"></div>`;
        const filled = ['obs', 'feel', 'need', 'req'].filter(k => (F[k] || '').trim()).length;
        $('nvc-flip').innerHTML = `<div class="nvc-flip">${fld('obs', `👁️ Was hat ${esc(who())} beobachtet?`, 'What did the other person see or hear from you?')}${fld('feel', `🫀 How does ${esc(who())} vermutlich?`, 'e.g. under pressure, overwhelmed, unsettled')}${fld('need', '💎 Which need is behind it?', S.theirNeeds.length ? S.theirNeeds.join(', ') : 'z. B. Anerkennung, Raum, Ruhe')}${fld('req', '🙏 What would the person wish from you?', '…')}</div>
            ${filled === 4 ? note('ok', 'You can phrase both sides in NVC. Feel free to begin the conversation with the other person’s side – that opens doors.') : filled ? note('info', `${filled}/4 – keep going. The better you capture the other side, the less you have to convince.`) : ''}`;
        $('nvc-flip').querySelectorAll('[data-fl]').forEach(el => { el.addEventListener('input', () => { F[el.dataset.fl] = el.value; MethodKit.save(); }); el.addEventListener('change', renderFlip); });
    }
    function renderLinks() { $('nvc-links').innerHTML = LINKS.map(x => `<a class="mk-option nvc-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['NONVIOLENT COMMUNICATION', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'SITUATION', S.situation || '–', 'With: ' + who(), '', '👁️ OBSERVATION', S.observation || '–', '', '🫀 FEELING', (S.feeling || '–') + (S.feelings.length ? ' · ' + S.feelings.join(', ') : '') + ` · Intensity ${n(S.intensity, 6)}/10`, '', '💎 NEED', (S.need || '–') + (S.needs.length ? ' · ' + S.needs.join(', ') : ''), S.theirNeeds.length ? `Assumed need of ${who()}: ${S.theirNeeds.join(', ')}` : '', '', '🙏 REQUEST', S.request || '–', S.noTest ? 'If no: ' + (NO_OPTS.find(o => o.k === S.noTest) || {}).l : '', '', 'MESSAGE', S.final || message() || '–', ''];
        const F = S.flip; if (Object.values(F).some(Boolean)) L.push(`EMPATHY SWITCH (${who()})`, F.obs ? 'Observation: ' + F.obs : '', F.feel ? 'Feeling: ' + F.feel : '', F.need ? 'Need: ' + F.need : '', F.req ? 'Wish: ' + F.req : '', '');
        if (S.after) L.push('AFTER THE CONVERSATION', S.after);
        MethodKit.exportText('gfk-botschaft.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'nonviolent-communication', accent: '#22c55e', accent2: '#14b8a6',
            steps: [{ icon: '🎯', label: 'Situation' }, { icon: '👁️', label: 'Observation' }, { icon: '🫀', label: 'Feeling' }, { icon: '💎', label: 'Need' }, { icon: '🙏', label: 'Request' }, { icon: '✉️', label: 'Message' }],
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
        $('nvc-copy').addEventListener('click', () => { const t = S.final || message(); if (!t) { MethodKit.toast('No message yet', 'warn'); return; } navigator.clipboard.writeText(t).then(() => MethodKit.toast('Copied', 'success')); });
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
