/* Well-formed outcome (NLP) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const NEG = /\b(nicht|nie|kein|keine|keinen|weniger|aufhören|loswerden|ohne|vermeiden|weg|los|endlich nicht|nicht mehr)\b/i;
    const VAGUE = /\b(besser|glücklicher|entspannter|erfolgreicher|zufriedener|selbstbewusster|mehr|gesünder|ruhiger|gut)\b/i;
    const OTHERS = /\b(dass (er|sie|mein|meine|die|der|das|man)|soll(te)? (er|sie)|er soll|sie soll|die anderen|mein chef soll|endlich versteht|akzeptier)/i;
    const MODAL = /\b(sollte|müsste|könnte|eigentlich|vielleicht|versuchen|probieren)\b/i;
    const PAIRS = [
        { bad: 'I don’t want to be nervous anymore', good: 'I am calm and present when I speak in front of the team' },
        { bad: 'My partner should have more time', good: 'I plan a fixed evening for two every week and send the invite' },
        { bad: 'Less stress', good: 'I end the workday at 6 p.m. and close the laptop' },
        { bad: 'Become more successful', good: 'By June I lead my own project with three people' }
    ];
    const CTX = { where: ['Work', 'At home', 'Partnership', 'Friends', 'Sports', 'In public', 'Online', 'Everywhere'], when: ['Täglich', 'Weekly', 'In meetings', 'Under pressure', 'In the morning', 'In the evening', 'In conflicts', 'Always'], who: ['Alone', 'Partner', 'Family', 'Team', 'Supervisors', 'Customers', 'Strangers', 'All'] };
    const VAKOG = [
        { k: 'see', ic: '👁️', l: 'What do you see?', h: 'Place, people, faces, your body, light …' },
        { k: 'hear', ic: '👂', l: 'What do you hear – including inwardly?', h: 'Voices, sentences, tones, your inner commentary …' },
        { k: 'feel', ic: '🫀', l: 'What do you feel?', h: 'Body sensation, posture, breathing, temperature …' },
        { k: 'smell', ic: '👃', l: 'Do you smell or taste something?', h: 'Optional – often surprisingly strongly anchored.' }
    ];
    const RES_CATS = [
        { k: 'skills', l: 'Skills & knowledge', ic: '🧠' }, { k: 'people', l: 'People & support', ic: '🤝' }, { k: 'time', l: 'Time & energy', ic: '⏱️' }, { k: 'means', l: 'Means & money', ic: '🧰' }, { k: 'states', l: 'Inner states (courage, calm …)', ic: '🧘' }
    ];
    const ECO = [
        { k: 'cost', q: 'What does the goal cost you – in time, energy, money, habits?', bad: 'The price is too high for me or unclear' },
        { k: 'relations', q: 'How does the goal affect important relationships?', bad: 'Someone important will suffer from it' },
        { k: 'values', q: 'Does the goal fit your values and who you want to be?', bad: 'It contradicts something that matters to me' },
        { k: 'parts', q: 'Is there a part of you that’s against it? What does that part want?', bad: 'Yes, there is resistance' }
    ];
    const ANS = { yes: { l: 'Congruent', ic: '✅' }, unsure: { l: 'Unsure', ic: '🤔' }, no: { l: 'Problem', ic: '⚠️' } };
    const LINKS = [
        { m: 'SMART goals', l: '../goal-setting/goal-setting.html', why: 'Make the goal measurable and dated.' },
        { m: 'Rubicon model', l: '../rubikon-model/rubikon-model.html', why: 'From wanting to committed action.' },
        { m: 'Dilts pyramid', l: '../nlp-dilts/nlp-dilts.html', why: 'Check the goal on all logical levels.' },
        { m: 'Werte-Klärung', l: '../values-clarification/values-clarification.html', why: 'When the ecology check snags.' },
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'Turn the first step into a routine.' }
    ];
    const fmt = (iso) => { const d = new Date(iso); return isNaN(d) || !iso ? '' : d.toLocaleDateString('en-GB'); };

    /* ---------- Kriterien-Score ---------- */
    function criteria() {
        const g = S.positive || '';
        const vak = VAKOG.filter(v => (S.vakog[v.k] || '').trim()).length;
        const metaN = S.meta.filter(m => (m || '').trim()).length;
        const ecoBad = ECO.some(e => S.eco[e.k] === 'no');
        const ecoDone = ECO.every(e => S.eco[e.k]);
        return [
            { k: 'pos', l: 'Positive', ok: g.trim().length > 8 && !NEG.test(g), step: 1 },
            { k: 'spec', l: 'Concrete', ok: g.trim().length > 8 && !VAGUE.test(g) || (S.measure || '').trim().length > 0, step: 1 },
            { k: 'own', l: 'Self-initiated', ok: (S.control || '').trim().length > 10 && !OTHERS.test(g), step: 2 },
            { k: 'ctx', l: 'Context', ok: Object.values(S.ctx).some(a => a && a.length) || (S.notctx || '').trim(), step: 2 },
            { k: 'evi', l: 'Sensory-specific', ok: vak >= 2, step: 3 },
            { k: 'meta', l: 'Meta-goal', ok: metaN >= 1, step: 4 },
            { k: 'res', l: 'Resources', ok: S.res.some(r => r.text), step: 5 },
            { k: 'eco', l: 'Ecological', ok: ecoDone && !ecoBad, warn: ecoBad, step: 5 }
        ];
    }
    function renderScore() {
        const C = criteria(); const n = C.filter(c => c.ok).length; const pct = Math.round(n / C.length * 100);
        const r = 26, circ = 2 * Math.PI * r;
        $('mg-score').innerHTML = `
            <svg viewBox="0 0 64 64" class="mg-ring"><circle cx="32" cy="32" r="${r}" class="bg"/><circle cx="32" cy="32" r="${r}" class="fg" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - n / C.length)}"/><text x="32" y="36" class="t">${n}/${C.length}</text></svg>
            <div class="mg-crit">${C.map(c => `<button class="mg-crit-i ${c.ok ? 'ok' : c.warn ? 'warn' : ''}" data-go="${c.step}" title="Zu Schritt ${c.step}"><i class="fas ${c.ok ? 'fa-check' : c.warn ? 'fa-exclamation' : 'fa-minus'}"></i>${c.l}</button>`).join('')}</div>
            <div class="mg-score-l">${pct === 100 ? 'Wohlgeformt – dein Ziel erfüllt alle Kriterien.' : 'Wohlgeformtheit: ' + pct + ' %'}</div>`;
        $('mg-score').querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => MethodKit.goTo(+b.dataset.go)));
    }

    /* ---------- 1 ---------- */
    function renderPosCheck() {
        const g = S.positive || ''; const h = [];
        let m;
        if ((m = g.match(NEG))) h.push({ t: 'warn', m: `„${esc(m[0])}" – a negation. What’s there instead when the problem is gone? Describe the picture.` });
        if ((m = g.match(OTHERS))) h.push({ t: 'warn', m: 'The goal depends on others’ behavior. What are <em>you</em>  doing in this situation?' });
        if ((m = g.match(VAGUE))) h.push({ t: 'info', m: `„${esc(m[0])}" is a comparison or feeling. How would you see it – specifically?` });
        if ((m = g.match(MODAL))) h.push({ t: 'info', m: `„${esc(m[0])}" weakens the goal. Phrase it in the present, as if it’s already so: “I …”` });
        if (g.trim().length > 8 && !h.length) h.push({ t: 'ok', m: 'Phrased positively and clearly.' });
        $('mg-poscheck').innerHTML = h.map(x => `<div class="mk-note ${x.t}"><i class="fas ${x.t === 'ok' ? 'fa-check-circle' : x.t === 'warn' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i><span>${x.m}</span></div>`).join('');
        renderScore();
    }
    function renderPairs() {
        $('mg-pairs').innerHTML = PAIRS.map(p => `<div class="mg-pair"><div class="bad"><i class="fas fa-times"></i> ${esc(p.bad)}</div><div class="good"><i class="fas fa-check"></i> ${esc(p.good)}</div></div>`).join('');
    }

    /* ---------- 2 ---------- */
    function renderCtrlCheck() {
        const c = S.control || '';
        $('mg-ctrlcheck').innerHTML = c.trim().length > 10 ? (/\b(ich)\b/i.test(c) ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>You describe your own actions – that’s the part you can control.</span></div>' : '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Phrase it in I-form: “I …” – that makes clear what’s in your hands.</span></div>') : '';
        renderScore();
    }
    function renderContext() {
        const row = (k, l) => `<div class="mk-section-label">${l}</div><div class="mk-chips">${CTX[k].map(c => `<button class="mk-chip ${(S.ctx[k] || []).includes(c) ? 'selected' : ''}" data-ck="${k}" data-cv="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
        $('mg-context').innerHTML = row('where', 'Where?') + row('when', 'When?') + row('who', 'With whom?') + `
            <div class="mk-field" style="margin-top:14px"><label for="mg-notctx">Where or when do you want the goal expressly <strong>not</strong>?</label><span class="hint">Example: “Assertive in the meeting” – but not at dinner with the kids.</span><textarea class="mk-textarea" id="mg-notctx" placeholder="…">${esc(S.notctx || '')}</textarea></div>`;
        $('mg-context').querySelectorAll('[data-ck]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.ck, v = b.dataset.cv; const a = S.ctx[k] || (S.ctx[k] = []); const i = a.indexOf(v); i > -1 ? a.splice(i, 1) : a.push(v); MethodKit.save(); renderContext(); }));
        $('mg-notctx').addEventListener('input', e => { S.notctx = e.target.value; MethodKit.save(); renderScore(); });
        MethodKit._autosizeAll(); renderScore();
    }

    /* ---------- 3 ---------- */
    function renderVakog() {
        $('mg-vakog').innerHTML = VAKOG.map(v => `<div class="mk-field mg-vak"><label><span class="ic">${v.ic}</span> ${v.l}</label><span class="hint">${v.h}</span><textarea class="mk-textarea" data-vk="${v.k}" placeholder="…">${esc(S.vakog[v.k] || '')}</textarea></div>`).join('') +
            `<div id="mg-vaknote"></div>`;
        $('mg-vakog').querySelectorAll('[data-vk]').forEach(t => t.addEventListener('input', () => { S.vakog[t.dataset.vk] = t.value; MethodKit.save(); vakNote(); }));
        vakNote(); MethodKit._autosizeAll();
    }
    function vakNote() {
        const n = VAKOG.filter(v => (S.vakog[v.k] || '').trim()).length;
        $('mg-vaknote').innerHTML = n >= 3 ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Three or more sensory channels – your goal is now a lived image, not an abstract sentence.</span></div>' : n ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>${n}  of 4 channels. The more senses, the stronger the goal pulls.</span></div>` : '';
        renderScore();
    }

    /* ---------- 4 ---------- */
    function renderMeta() {
        const g = S.positive || 'your goal';
        const levels = [0, 1, 2];
        $('mg-meta').innerHTML = `
            <div class="mg-chain">
                <div class="mg-chain-goal"><span class="mk-badge">Goal</span> ${esc(g)}</div>
                ${levels.map(i => `<div class="mg-chain-arrow"><i class="fas fa-arrow-down"></i> Wozu?</div><div class="mg-chain-lvl"><label>${i === 0 ? 'What do you want that for?' : i === 1 ? 'And what for that?' : 'And what does that ultimately give you?'}</label><input class="mk-input" data-meta="${i}" value="${esc(S.meta[i] || '')}" placeholder="${i === 0 ? 'Damit ich …' : i === 1 ? 'Weil ich dann …' : 'Im Kern geht es mir um …'}" ${i > 0 && !(S.meta[i - 1] || '').trim() ? 'disabled' : ''}></div>`).join('')}
            </div>
            ${(S.meta[1] || '').trim() ? `<div class="mk-result"><h4>Dein Meta-Ziel</h4><strong>${esc(S.meta[2] || S.meta[1])}</strong><div class="mk-faint" style="margin-top:8px">Frage: Ist „${esc(g.slice(0, 60))}${g.length > 60 ? '…' : ''}" der beste Weg dorthin – oder gäbe es noch andere?</div></div>
            <div class="mk-field" style="margin-top:12px"><label for="mg-altways">Welche anderen Wege zum Meta-Ziel fallen dir ein?</label><textarea class="mk-textarea" id="mg-altways" placeholder="Optional – expands the solution space.">${esc(S.altways || '')}</textarea></div>` : ''}`;
        $('mg-meta').querySelectorAll('[data-meta]').forEach(el => { el.addEventListener('input', () => { S.meta[+el.dataset.meta] = el.value; MethodKit.save(); renderScore(); }); el.addEventListener('change', renderMeta); });
        const a = $('mg-altways'); if (a) a.addEventListener('input', () => { S.altways = a.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }

    /* ---------- 5 ---------- */
    function renderResources() {
        $('mg-resources').innerHTML = RES_CATS.map(c => {
            const items = S.res.filter(r => r.cat === c.k);
            return `<div class="mg-res"><div class="mg-res-head"><span>${c.ic}</span><strong>${c.l}</strong></div>
                ${items.map(r => `<div class="mk-row mg-res-row"><input class="mk-input grow" data-rt="${r.id}" value="${esc(r.text)}" placeholder="…"><button class="mg-have ${r.have ? 'on' : ''}" data-rh="${r.id}">${r.have ? '✓ I have' : 'I need'}</button><button class="mk-iconbtn" data-rr="${r.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>`).join('')}
                <button class="mk-btn mk-btn-outline mk-btn-sm" data-ra="${c.k}"><i class="fas fa-plus"></i></button></div>`;
        }).join('') + resNote();
        $('mg-resources').querySelectorAll('[data-ra]').forEach(b => b.addEventListener('click', () => { S.res.push({ id: MethodKit.uid(), cat: b.dataset.ra, text: '', have: false }); MethodKit.save(); renderResources(); const el = $('mg-resources').querySelector(`[data-rt="${S.res[S.res.length - 1].id}"]`); if (el) el.focus(); }));
        $('mg-resources').querySelectorAll('[data-rt]').forEach(el => el.addEventListener('input', () => { const r = S.res.find(x => x.id === el.dataset.rt); if (r) { r.text = el.value; MethodKit.save(); renderScore(); } }));
        $('mg-resources').querySelectorAll('[data-rh]').forEach(b => b.addEventListener('click', () => { const r = S.res.find(x => x.id === b.dataset.rh); if (r) { r.have = !r.have; MethodKit.save(); renderResources(); } }));
        $('mg-resources').querySelectorAll('[data-rr]').forEach(b => b.addEventListener('click', () => { S.res = S.res.filter(x => x.id !== b.dataset.rr); MethodKit.save(); renderResources(); }));
    }
    function resNote() {
        const all = S.res.filter(r => r.text.trim()); if (!all.length) return '';
        const have = all.filter(r => r.have).length, need = all.length - have;
        return `<div class="mk-note ${need === 0 ? 'ok' : 'info'}" style="margin-top:8px"><i class="fas fa-info-circle"></i><span>${have} of ${all.length} Ressourcen hast du bereits.${need ? ` Die ${need} fehlende${need > 1 ? 'n' : ''} ${need > 1 ? 'sind' : 'ist'} oft der eigentliche erste Schritt.` : ''}</span></div>`;
    }
    function renderEco() {
        $('mg-eco').innerHTML = ECO.map(e => `<div class="mg-eco ${S.eco[e.k] || ''}"><div class="q">${e.q}</div>
            <div class="mg-eco-btns">${Object.entries(ANS).map(([k, a]) => `<button class="${S.eco[e.k] === k ? 'on' : ''}" data-ek="${e.k}" data-ev="${k}">${a.ic} ${a.l}</button>`).join('')}</div>
            ${S.eco[e.k] && S.eco[e.k] !== 'yes' ? `<textarea class="mk-textarea" data-en="${e.k}" placeholder="${S.eco[e.k] === 'no' ? e.bad + ' – was genau? Und wie könntest du das Ziel anpassen?' : 'Was müsstest du klären, um sicher zu sein?'}">${esc(S.econ[e.k] || '')}</textarea>` : ''}</div>`).join('') +
            (ECO.some(e => S.eco[e.k] === 'no') ? '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>A goal with ecological resistance is usually sabotaged. Adjust it – smaller, different, with the resistance instead of against it – before you start.</span></div>' : ECO.every(e => S.eco[e.k] === 'yes') ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Ecologically congruent – all parts of you can come along.</span></div>' : '');
        $('mg-eco').querySelectorAll('[data-ek]').forEach(b => b.addEventListener('click', () => { S.eco[b.dataset.ek] = b.dataset.ev; MethodKit.save(); renderEco(); renderScore(); }));
        $('mg-eco').querySelectorAll('[data-en]').forEach(t => t.addEventListener('input', () => { S.econ[t.dataset.en] = t.value; MethodKit.save(); }));
        MethodKit._autosizeAll();
    }

    /* ---------- 6 ---------- */
    function renderSummary() {
        const C = criteria(); const open = C.filter(c => !c.ok);
        const ctx = ['where', 'when', 'who'].map(k => (S.ctx[k] || []).join(', ')).filter(Boolean).join(' · ');
        $('mg-summary').innerHTML = `
            <div class="mg-final"><div class="mk-kicker">Mein Ziel</div><div class="mg-final-g">${esc(S.positive) || '–'}</div>
            ${ctx ? `<div class="mg-final-row"><b>Kontext</b>${esc(ctx)}</div>` : ''}
            ${S.date ? `<div class="mg-final-row"><b>Bis</b>${fmt(S.date)}${S.measure ? ' · ' + esc(S.measure) : ''}</div>` : ''}
            ${VAKOG.some(v => S.vakog[v.k]) ? `<div class="mg-final-row"><b>Evidenz</b>${VAKOG.filter(v => S.vakog[v.k]).map(v => v.ic + ' ' + esc(S.vakog[v.k])).join('<br>')}</div>` : ''}
            ${(S.meta[1] || S.meta[0]) ? `<div class="mg-final-row"><b>Wozu</b>${esc(S.meta[2] || S.meta[1] || S.meta[0])}</div>` : ''}</div>
            ${open.length ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Noch offen: ${open.map(c => `<button class="mk-chip" data-go="${c.step}">${c.l}</button>`).join(' ')}</span></div>` : '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>All eight criteria met. Now only the first step counts.</span></div>'}`;
        $('mg-summary').querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => MethodKit.goTo(+b.dataset.go)));
    }
    function renderLinks() {
        const ecoBad = ECO.some(e => S.eco[e.k] === 'no');
        const list = ecoBad ? [LINKS[3], ...LINKS.filter(l => l !== LINKS[3])] : LINKS;
        $('mg-links').innerHTML = list.map(l => `<a class="mk-option mg-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join('');
    }
    function exportAll() {
        const C = criteria();
        const L = ['WELL-FORMED OUTCOME (NLP)', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'GOAL', S.positive || '–', '', 'Criteria: ' + C.map(c => (c.ok ? '✓ ' : '○ ') + c.l).join(' · '), ''];
        L.push('SELF-INITIATIVE', 'I do: ' + (S.control || '–'), 'Depends on others: ' + (S.others || '–'), '');
        L.push('CONTEXT', ['where', 'when', 'who'].map(k => (S.ctx[k] || []).join(', ')).filter(Boolean).join(' · ') || '–', S.notctx ? 'Not: ' + S.notctx : '', '');
        L.push('EVIDENCE'); VAKOG.forEach(v => { if (S.vakog[v.k]) L.push(`${v.ic} ${S.vakog[v.k]}`); }); if (S.outside) L.push('Outsider test: ' + S.outside); if (S.date || S.measure) L.push('By: ' + fmt(S.date) + (S.measure ? ' · ' + S.measure : '')); L.push('');
        L.push('META-GOAL'); S.meta.forEach((m, i) => { if (m) L.push('  '.repeat(i) + '→ ' + m); }); if (S.altways) L.push('Other paths: ' + S.altways); if (S.secondary) L.push('Secondary gain: ' + S.secondary, S.keep ? 'Kept by: ' + S.keep : ''); L.push('');
        L.push('RESOURCES'); RES_CATS.forEach(c => { const it = S.res.filter(r => r.cat === c.k && r.text); if (it.length) L.push(c.l + ': ' + it.map(r => r.text + (r.have ? ' ✓' : ' (fehlt)')).join(', ')); }); L.push('');
        L.push('ECOLOGY'); ECO.forEach(e => { if (S.eco[e.k]) L.push(`${ANS[S.eco[e.k]].ic} ${e.q}` + (S.econ[e.k] ? ' → ' + S.econ[e.k] : '')); }); L.push('');
        L.push('FIRST STEP', (S.firststep || '–') + (S.firstdate ? ' · ' + fmt(S.firstdate) : ''));
        MethodKit.exportText('wohlgeformtes-ziel.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'nlp-meta-goal', accent: '#8b5cf6', accent2: '#06b6d4',
            steps: [{ icon: '➕', label: 'Positive' }, { icon: '🧭', label: 'Context' }, { icon: '👁️', label: 'Evidence' }, { icon: '🪜', label: 'Meta-goal' }, { icon: '🌱', label: 'Ecology' }, { icon: '🎯', label: 'Goal' }],
            defaultState: { positive: '', control: '', others: '', ctx: {}, notctx: '', vakog: {}, outside: '', date: '', measure: '', meta: ['', '', ''], altways: '', secondary: '', keep: '', res: [], eco: {}, econ: {}, firststep: '', firstdate: '' }
        });
        S = MethodKit.state;
        ['ctx', 'vakog', 'eco', 'econ'].forEach(k => { if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {}; });
        if (!Array.isArray(S.meta)) S.meta = ['', '', '']; if (!Array.isArray(S.res)) S.res = [];
        // Migration alter Felder
        if (typeof S.context === 'string' && S.context.trim() && !S.notctx) { S.notctx = ''; S.ctxLegacy = S.context; delete S.context; }
        ['see', 'hear', 'feel'].forEach(k => { if (typeof S[k] === 'string') { if (S[k].trim() && !S.vakog[k]) S.vakog[k] = S[k]; delete S[k]; } });
        if (typeof S.resources === 'string') { if (S.resources.trim() && !S.res.length) S.res.push({ id: MethodKit.uid(), cat: 'skills', text: S.resources.trim().slice(0, 120), have: false }); delete S.resources; }
        if (typeof S.ecology === 'string') { if (S.ecology.trim() && !S.econ.cost) S.econ.cost = S.ecology; delete S.ecology; }

        MethodKit.bindFields();
        $('mg-positive').addEventListener('input', renderPosCheck);
        $('mg-control').addEventListener('input', renderCtrlCheck);
        ['mg-measure', 'mg-date', 'mg-outside'].forEach(id => $(id).addEventListener('input', renderScore));
        renderPairs(); renderPosCheck(); renderScore();
        MethodKit.onStep = function (k) {
            if (k === 2) { renderCtrlCheck(); renderContext(); }
            if (k === 3) renderVakog();
            if (k === 4) renderMeta();
            if (k === 5) { renderResources(); renderEco(); }
            if (k === 6) { renderSummary(); renderLinks(); }
            renderScore();
        };
        MethodKit.onStep(MethodKit.step);
        $('mg-export').addEventListener('click', exportAll);
    })();
})();
