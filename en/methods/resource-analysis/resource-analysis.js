/* Ressourcen-Analyse · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const CATS = [
        { id: 'pers', ic: '💪', t: 'Skills & personality', c: '#10b981', q: 'What are you good at? Which traits help you?', sug: ['Perseverance', 'Humour', 'Analytical thinking', 'Ability to learn', 'Calm', 'Arranger', 'Creativity', 'Courage', 'Empathy', 'Feel for language'] },
        { id: 'body', ic: '🫀', t: 'Body & energy', c: '#f59e0b', q: 'What keeps you physically and energetically stable?', sug: ['Health', 'Good sleep', 'Exercise routine', 'Nature', 'Nutrition', 'Breathing exercises', 'Walks', 'Music'] },
        { id: 'soc', ic: '🤝', t: 'People', c: '#ec4899', q: 'Who has your back, advises you, listens?', sug: ['Partner', 'Family', 'Best friend', 'Mentor', 'Colleagues', 'Coach / therapist', 'Neighbors', 'Community / club'] },
        { id: 'mat', ic: '🧰', t: 'Means & structures', c: '#3b82f6', q: 'Which material things and structures are available to you?', sug: ['Financial cushion', 'Time', 'Home / retreat', 'Education / degree', 'Tools & tech', 'Flexible working hours', 'Network access', 'Library / courses'] },
        { id: 'exp', ic: '🏔️', t: 'Experiences & successes', c: '#8b5cf6', q: 'What have you already gotten through? Which crises did you survive?', sug: ['Handled a job change', 'Move / fresh start', 'Passed an exam', 'Resolved a conflict', 'Got through illness', 'Brought a project to the end', 'Processed a breakup', 'Learned a foreign language'] },
        { id: 'mean', ic: '🧭', t: 'Meaning, values & stance', c: '#14b8a6', q: 'What gives you hold and direction when it gets hard?', sug: ['Faith / spirituality', 'Clear values', 'A vision', 'Gratitude', 'Responsibility for others', 'Curiosity', 'Nature / stillness', 'Rituals'] }
    ];
    const LINKS = [
        { m: 'Finding strengths', l: '../strengths-finder/strengths-finder.html', why: 'Sort your personal resources more precisely.' },
        { m: 'Stress compass', l: '../stress-management/stress-management.html', why: 'Put resources against stressors.' },
        { m: 'Solution focus', l: '../solution-focused/solution-focused.html', why: 'Use exceptions and successes as leverage.' },
        { m: 'Five pillars', l: '../five-pillars/five-pillars.html', why: 'Check stability in all areas of life.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const C = (id) => CATS.find(c => c.id === id) || CATS[0];
    const R = (id) => S.items.find(i => i.id === id);
    const byCat = (c) => S.items.filter(i => i.cat === c);
    const rated = (i) => n(i.avail, 0) && n(i.use, 0);
    const sleeping = () => S.items.filter(i => rated(i) && i.avail >= 4 && i.use <= 2);
    const pillars = () => S.items.filter(i => rated(i) && i.avail >= 4 && i.use >= 4);
    const fragile = () => S.items.filter(i => rated(i) && i.avail <= 2 && i.use >= 4);

    /* ---------- 1 ---------- */
    function renderInv() {
        $('ra-inv').innerHTML = CATS.map(c => `<div class="ra-cat" style="--c:${c.c}"><div class="ra-cat-h"><span>${c.ic}</span><div><b>${c.t}</b><small>${c.q}</small></div><span class="mk-badge">${byCat(c.id).length}</span></div><div class="ra-items">${byCat(c.id).map(i => `<span class="ra-item">${esc(i.text)}<button data-del="${i.id}" aria-label="Remove">×</button></span>`).join('')}</div><div class="ra-add"><input class="mk-input" data-in="${c.id}" placeholder="Own resource …"><button class="mk-btn mk-btn-outline mk-btn-sm" data-addbtn="${c.id}" aria-label="Add"><i class="fas fa-plus"></i></button></div><div class="mk-chips">${c.sug.filter(s => !byCat(c.id).some(i => i.text.toLowerCase() === s.toLowerCase())).map(s => `<button class="mk-chip" data-sug="${c.id}" data-v="${esc(s)}">${s}</button>`).join('')}</div></div>`).join('') + invNote();
        const host = $('ra-inv');
        const add = (cat, text) => { text = (text || '').trim(); if (!text) return; if (S.items.some(i => i.text.toLowerCase() === text.toLowerCase())) { MethodKit.toast('Already in', 'warn'); return; } S.items.push({ id: MethodKit.uid(), cat, text, avail: 0, use: 0 }); MethodKit.save(); renderInv(); };
        host.querySelectorAll('[data-sug]').forEach(b => b.addEventListener('click', () => add(b.dataset.sug, b.dataset.v)));
        host.querySelectorAll('[data-addbtn]').forEach(b => b.addEventListener('click', () => add(b.dataset.addbtn, host.querySelector(`[data-in="${b.dataset.addbtn}"]`).value)));
        host.querySelectorAll('[data-in]').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(i.dataset.in, i.value); } }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { S.items = S.items.filter(i => i.id !== b.dataset.del); S.picked = S.picked.filter(p => p !== b.dataset.del); MethodKit.save(); renderInv(); }));
    }
    function invNote() {
        const total = S.items.length, empty = CATS.filter(c => !byCat(c.id).length);
        if (total < 5) return note('info', 'Collect at least eight to ten resources. Tip: what would a good friend say about you that you overlook yourself?');
        if (empty.length >= 2) return note('info', `Still empty: ${empty.map(c => c.ic + ' ' + c.t).join(', ')}. The overlooked areas often carry the most – look there once more.`);
        if (!byCat('exp').length) return note('info', 'Experiences & successes is empty. You have already handled something hard – that is proof you can do it again.');
        return note('ok', `${total} resources in ${CATS.length - empty.length} areas. Next you'll see which ones you actually use.`);
    }

    /* ---------- 2 ---------- */
    function renderRate() {
        if (!S.items.length) { $('ra-rate').innerHTML = note('info', 'Collect resources in step 1.'); return; }
        const dots = (i, k, label) => `<div class="ra-dim"><span>${label}</span><div class="ra-dots">${[1, 2, 3, 4, 5].map(x => `<button class="${n(i[k], 0) >= x ? 'on' : ''}" data-r="${i.id}" data-k="${k}" data-x="${x}" aria-label="${label} ${x}">●</button>`).join('')}</div></div>`;
        $('ra-rate').innerHTML = CATS.filter(c => byCat(c.id).length).map(c => `<div class="mk-section-label" style="color:${c.c}">${c.ic} ${c.t}</div>${byCat(c.id).map(i => `<div class="ra-rate-row"><b>${esc(i.text)}</b>${dots(i, 'avail', 'Available')}${dots(i, 'use', 'Used')}<span class="ra-tag">${tag(i)}</span></div>`).join('')}`).join('') + rateNote();
        $('ra-rate').querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { R(b.dataset.r)[b.dataset.k] = +b.dataset.x; MethodKit.save(); renderRate(); }));
    }
    function tag(i) { if (!rated(i)) return ''; if (i.avail >= 4 && i.use <= 2) return '<em class="sleep">💤 dormant</em>'; if (i.avail >= 4 && i.use >= 4) return '<em class="pillar">🏛️ pillar</em>'; if (i.avail <= 2 && i.use >= 4) return '<em class="fragile">⚠️ overloaded</em>'; return ''; }
    function rateNote() {
        const r = S.items.filter(rated).length;
        if (r < S.items.length) return note('info', `${r}/${S.items.length} rated. Available = I could use it tomorrow · Used = I actually do.`);
        const sl = sleeping(), fr = fragile();
        return (sl.length ? note('ok', `<strong>${sl.length} dormant resource${sl.length > 1 ? 'n' : ''}:</strong> ${sl.map(i => esc(i.text)).join(', ')}. Available, but barely used – that is your biggest lever, because it needs nothing new.`) : '') +
            (fr.length ? note('warn', `<strong>Overloaded:</strong> ${fr.map(i => esc(i.text)).join(', ')} – you use them heavily, but they are barely available. That is risky: what happens if they fall away?`) : '') +
            (!sl.length && !fr.length ? note('ok', 'All rated. The map shows you the spread.') : '');
    }

    /* ---------- 3 ---------- */
    function renderMap() {
        if (S.items.filter(rated).length < 3) { $('ra-map').innerHTML = note('info', 'Rate at least three resources in step 2.'); return; }
        const max = Math.max(1, ...CATS.map(c => byCat(c.id).length));
        const bars = CATS.map(c => { const it = byCat(c.id); const avg = it.filter(rated).length ? (it.filter(rated).reduce((a, i) => a + i.use, 0) / it.filter(rated).length) : 0; return `<div class="ra-bar"><span class="ra-bar-l">${c.ic} ${c.t}</span><div class="ra-bar-t"><i style="width:${it.length / max * 100}%; background:${c.c}"></i></div><small>${it.length} · use ${avg ? avg.toFixed(1) : '–'}</small></div>`; }).join('');
        const sl = sleeping(), pi = pillars(), fr = fragile();
        const quad = (title, ic, list, d) => `<div class="ra-q"><b>${ic} ${title}</b><small>${d}</small><div>${list.map(i => `<span class="ra-item" style="--c:${C(i.cat).c}">${C(i.cat).ic} ${esc(i.text)}</span>`).join('') || '<span class="mk-faint">–</span>'}</div></div>`;
        const empty = CATS.filter(c => !byCat(c.id).length), dom = [...CATS].sort((a, b) => byCat(b.id).length - byCat(a.id).length)[0];
        const share = byCat(dom.id).length / S.items.length;
        $('ra-map').innerHTML = `<div class="ra-bars">${bars}</div><div class="ra-quads">${quad('Säulen', '🏛️', pi, 'verfügbar & genutzt – darauf stehst du')}${quad('Schlafend', '💤', sl, 'verfügbar, kaum genutzt – dein Hebel')}${quad('Überlastet', '⚠️', fr, 'stark genutzt, kaum verfügbar – Risiko')}${quad('Übrige', '◦', S.items.filter(i => rated(i) && !pi.includes(i) && !sl.includes(i) && !fr.includes(i)), 'mittlere Werte')}</div>` +
            (share >= 0.5 ? note('warn', `${Math.round(share * 100)} % of your resources sit in “${dom.t}". A one-sided resource mix is vulnerable – if this area wobbles, everything wobbles. Build out a second area.`) : '') +
            (empty.length ? note('info', `No resource in: ${empty.map(c => c.ic + ' ' + c.t).join(', ')}. That does not have to be a gap – but check: is there really nothing there?`) : '') +
            (!byCat('soc').filter(rated).some(i => i.use >= 3) && byCat('soc').length ? note('info', 'Your people are there, but you barely use them. Asking for help is not weakness – it is the most underestimated resource.') : '') +
            (sl.length ? note('ok', `Wake dormant resources: ${sl.slice(0, 3).map(i => esc(i.text)).join(', ')}. In step 4 you link them to your current challenge.`) : '');
    }

    /* ---------- 4 ---------- */
    function renderPick() {
        $('ra-past-note').innerHTML = (S.past || '').trim().length > 30 ? note('ok', 'That itself is a resource: you know how coping works. The strategy from then is available again today.') : '';
        if (!S.items.length) { $('ra-pick').innerHTML = note('info', 'Collect resources first.'); $('ra-plan').innerHTML = ''; return; }
        const sl = sleeping();
        $('ra-pick').innerHTML = `<div class="mk-chips">${[...S.items].sort((a, b) => (sl.includes(b) ? 1 : 0) - (sl.includes(a) ? 1 : 0)).map(i => `<button class="mk-chip ${S.picked.includes(i.id) ? 'selected' : ''}" data-p="${i.id}">${C(i.cat).ic} ${esc(i.text)}${sl.includes(i) ? ' 💤' : ''}</button>`).join('')}</div>`;
        $('ra-pick').querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.p; if (S.picked.includes(id)) S.picked = S.picked.filter(p => p !== id); else if (S.picked.length >= 5) { MethodKit.toast('Five max – focus beats abundance', 'warn'); return; } else S.picked.push(id); MethodKit.save(); renderPick(); }));
        renderPlan();
    }
    function renderPlan() {
        const P = S.picked.map(R).filter(Boolean);
        if (!P.length) { $('ra-plan').innerHTML = note('info', 'Pick two to five resources. Dormant ones (💤) first – they cost nothing new.'); return; }
        const cats = new Set(P.map(i => i.cat));
        $('ra-plan').innerHTML = P.map(i => { const a = S.plan[i.id] || {}; return `<div class="ra-plan" style="--c:${C(i.cat).c}"><b>${C(i.cat).ic} ${esc(i.text)}</b><div class="mk-grid-2"><div class="mk-field"><label>How do I use them concretely?</label><input class="mk-input" data-how="${i.id}" value="${esc(a.how || '')}" placeholder="…"></div><div class="mk-field"><label>First step (by when?)</label><input class="mk-input" data-first="${i.id}" value="${esc(a.first || '')}" placeholder="e.g. Call mentor by Friday"></div></div></div>`; }).join('') +
            (cats.size === 1 && P.length >= 2 ? note('info', `All chosen resources come from “${C(P[0].cat).t}". Mixing helps: one person, one means, one experience – that holds more stably.`) : '') +
            (!cats.has('soc') && P.length >= 2 && byCat('soc').length ? note('info', 'No person in the mix. Who could support you with exactly this challenge – and when will you ask?') : '') +
            (P.every(i => (S.plan[i.id] || {}).first) ? note('ok', 'A first step for each resource. That is activation – not just knowing they are there.') : '');
        $('ra-plan').querySelectorAll('[data-how]').forEach(x => x.addEventListener('input', () => { (S.plan[x.dataset.how] = S.plan[x.dataset.how] || {}).how = x.value; MethodKit.save(); }));
        $('ra-plan').querySelectorAll('[data-first]').forEach(x => { x.addEventListener('input', () => { (S.plan[x.dataset.first] = S.plan[x.dataset.first] || {}).first = x.value; MethodKit.save(); }); x.addEventListener('change', renderPlan); });
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        if (!S.items.length) { $('ra-summary').innerHTML = note('info', 'Nothing collected yet.'); return; }
        const pi = pillars(), sl = sleeping(), P = S.picked.map(R).filter(Boolean);
        $('ra-summary').innerHTML = `<div class="ra-stats"><div><b>${S.items.length}</b><span>Ressourcen</span></div><div><b>${CATS.filter(c => byCat(c.id).length).length}/6</b><span>areas</span></div><div><b>${pi.length}</b><span>pillars</span></div><div><b>${sl.length}</b><span>dormant</span></div></div>` +
            `<div class="mk-result"><h4>What I stand on</h4>${pi.length ? pi.map(i => `${C(i.cat).ic} ${esc(i.text)}`).join(' · ') : '<span class="mk-faint">no pillars rated yet</span>'}</div>` +
            (sl.length ? `<div class="mk-result"><h4>What I will wake</h4>${sl.map(i => `${C(i.cat).ic} ${esc(i.text)}`).join(' · ')}</div>` : '') +
            (S.challenge ? `<div class="mk-result"><h4>For: ${esc(S.challenge)}</h4>${P.length ? `<ul class="ra-ul">${P.map(i => `<li><b>${esc(i.text)}</b>${(S.plan[i.id] || {}).how ? ` – ${esc(S.plan[i.id].how)}` : ''}${(S.plan[i.id] || {}).first ? ` <small>→ ${esc(S.plan[i.id].first)}</small>` : ''}</li>`).join('')}</ul>` : '<span class="mk-faint">no resources chosen</span>'}${S.past ? `<div class="mk-faint" style="margin-top:6px">Schon einmal geschafft: ${esc(S.past)}</div>` : ''}</div>` : '');
    }
    function renderLinks() { $('ra-links').innerHTML = LINKS.map(x => `<a class="mk-option ra-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['RESOURCE MAP', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), ''];
        CATS.forEach(c => { const it = byCat(c.id); if (!it.length) return; L.push(`${c.ic} ${c.t.toUpperCase()}`); it.forEach(i => L.push(`  - ${i.text}${rated(i) ? ` (verfügbar ${i.avail}/5 · genutzt ${i.use}/5${sleeping().includes(i) ? ' · dormant' : pillars().includes(i) ? ' · pillar' : fragile().includes(i) ? ' · overloaded' : ''})` : ''}`)); L.push(''); });
        if (S.challenge) { L.push('CHALLENGE', S.challenge, ''); if (S.past) L.push('Already mastered once: ' + S.past, ''); L.push('ACTIVATION'); S.picked.map(R).filter(Boolean).forEach(i => { const a = S.plan[i.id] || {}; L.push(`  - ${i.text}${a.how ? `: ${a.how}` : ''}${a.first ? ` → ${a.first}` : ''}`); }); }
        MethodKit.exportText('ressourcen-karte.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'resource-analysis', accent: '#10b981', accent2: '#22c55e',
            steps: [{ icon: '📦', label: 'Inventory' }, { icon: '⚖️', label: 'Rate' }, { icon: '🗺️', label: 'Map' }, { icon: '🔑', label: 'Activate' }, { icon: '🧾', label: 'Card' }],
            defaultState: { items: [], picked: [], plan: {}, challenge: '', past: '' }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.items)) S.items = [];
        // Migration: alte inner/outer-Listen (Strings)
        if (Array.isArray(S.inner) || Array.isArray(S.outer)) {
            const old = []; (S.inner || []).forEach(t => old.push(['pers', t])); (S.outer || []).forEach(t => old.push(['soc', t]));
            old.forEach(([cat, t]) => { const text = typeof t === 'string' ? t : (t && t.text) || ''; if (text && !S.items.some(i => i.text === text)) S.items.push({ id: MethodKit.uid(), cat, text, avail: 0, use: 0 }); });
            const oldPicked = Array.isArray(S.picked) ? S.picked : [];
            S.picked = oldPicked.map(p => (S.items.find(i => i.text === p) || {}).id).filter(Boolean);
            delete S.inner; delete S.outer;
        }
        if (!Array.isArray(S.picked)) S.picked = []; if (!S.plan || typeof S.plan !== 'object') S.plan = {};
        S.picked = S.picked.filter(R);
        MethodKit.bindFields();
        $('ra-export').addEventListener('click', exportAll);
        $('ra-past').addEventListener('input', () => { $('ra-past-note').innerHTML = (S.past || '').trim().length > 30 ? note('ok', 'That itself is a resource: you know how coping works. The strategy from then is available again today.') : ''; });
        MethodKit.onStep = function (k) {
            if (k === 1) renderInv();
            if (k === 2) renderRate();
            if (k === 3) renderMap();
            if (k === 4) renderPick();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
