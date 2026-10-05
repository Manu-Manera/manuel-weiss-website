/* Vision-Board · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const AREAS = [
        { id: 'beruf', ic: '💼', label: 'Work & impact', c: '#6366f1', q: 'What do you do, for whom, and what does it achieve?' },
        { id: 'finanzen', ic: '💰', label: 'Finances', c: '#10b981', q: 'How does your relationship with money feel?' },
        { id: 'gesundheit', ic: '💪', label: 'Body & health', c: '#22c55e', q: 'How do you move, how do you feel in your body?' },
        { id: 'beziehung', ic: '❤️', label: 'Partnership', c: '#ef4444', q: 'How do you live together?' },
        { id: 'familie', ic: '👨‍👩‍👧', label: 'Family & friends', c: '#f97316', q: 'Who is around you – and how often?' },
        { id: 'lernen', ic: '📚', label: 'Growth & learning', c: '#8b5cf6', q: 'What can you do then that you can\'t do today?' },
        { id: 'creative', ic: '🎨', label: 'Creativity & play', c: '#ec4899', q: 'What do you create just because it brings joy?' },
        { id: 'zuhause', ic: '🏡', label: 'Home & surroundings', c: '#f59e0b', q: 'Where do you live, what does it look like there?' },
        { id: 'reisen', ic: '✈️', label: 'Experiences & travel', c: '#0ea5e9', q: 'Which places, which adventures?' },
        { id: 'koerper', ic: '🧘', label: 'Inner peace & meaning', c: '#14b8a6', q: 'What gets you out of bed in the morning?' }
    ];
    const EMO = ['🌅', '🏔️', '🌊', '🌳', '🔥', '⭐', '🌈', '🏡', '🚀', '🎯', '📖', '🎸', '🎨', '✍️', '🧘', '🏃', '🚴', '🌍', '✈️', '⛵', '💼', '💡', '🤝', '👨‍👩‍👧', '❤️', '🐕', '🍷', '☕', '🌻', '💎', '🏆', '🔑'];
    const HORIZONS = [[1, '1 year'], [3, '3 Jahre'], [5, '5 years'], [10, '10 years']];
    const LINKS = [
        { m: 'Goal setting', l: '../goal-setting/goal-setting.html', why: 'Turn focus blocks into measurable goals.' },
        { m: 'Ikigai', l: '../ikigai/ikigai.html', why: 'Check the work block for meaning.' },
        { m: 'Clarify values', l: '../values-clarification/values-clarification.html', why: 'Does the picture match what really matters to you?' },
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'Turn first steps into a routine.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const A = (id) => AREAS.find(a => a.id === id) || AREAS[0];
    const card = (area) => S.cards.find(c => c.area === area);
    const filled = () => S.cards.filter(c => (c.title || '').trim());
    const FUTURE = /\b(werde|werden|will|wollen|möchte|wünsche|hoffe|hoffentlich|irgendwann|vielleicht)\b/i;
    const NEG = /\b(nicht mehr|kein|keine|nie wieder|weg von|los von|ohne)\b/i;

    /* ---------- 1 ---------- */
    function renderHorizon() {
        $('vb-horizon').innerHTML = HORIZONS.map(([v, t]) => `<button class="mk-chip ${n(S.horizon, 3) === v ? 'selected' : ''}" data-h="${v}">${t}</button>`).join('');
        $('vb-horizon').querySelectorAll('[data-h]').forEach(b => b.addEventListener('click', () => { S.horizon = +b.dataset.h; MethodKit.save(); renderHorizon(); }));
    }
    function renderBigNotes() {
        const h = (S.headline || '').trim(), d = (S.day || '').trim();
        $('vb-headline-note').innerHTML = !h ? '' : NEG.test(h) ? note('info', 'That\'s an “away-from” sentence. What\'s there instead? A vision board shows where to – not what away from.') : FUTURE.test(h) ? note('info', 'You\'re writing in the future tense (“will”, “want”, “would like”). Write it as the present: “I work …”, “I live …”. The brain takes the present more seriously than intention.') : h.length < 30 ? note('info', 'Still brief. What do you do, with whom, and how does it feel?') : note('ok', 'One sentence in the present tense that gives direction.');
        $('vb-day-note').innerHTML = !d ? '' : d.length < 120 ? note('info', 'Walk through the day: waking up, morning, noon, afternoon, evening. The more sensory (light, sounds, people), the stronger the picture works.') : FUTURE.test(d) ? note('info', 'Here too: present tense. “I wake up …”, not “I will wake up”.') : note('ok', 'Concrete enough to picture it. That\'s exactly what a vision board should do.');
    }

    /* ---------- 2 ---------- */
    function renderAreas() {
        $('vb-areas').innerHTML = AREAS.map(a => { const c = card(a.id) || {}; const open = S.openArea === a.id; return `<div class="vb-area ${(c.title || '').trim() ? 'filled' : ''} ${open ? 'open' : ''}" style="--c:${a.c}"><button class="vb-area-h" data-open="${a.id}"><span class="vb-area-ic">${c.emoji || a.ic}</span><div><b>${a.label}</b><small>${(c.title || '').trim() ? esc(c.title) : a.q}</small></div><span class="vb-imp">${c.imp ? '★'.repeat(c.imp) : ''}</span><i class="fas fa-chevron-${open ? 'up' : 'down'}"></i></button>${open ? `<div class="vb-area-b"><div class="mk-field"><label>Bild</label><div class="vb-emo">${EMO.map(e => `<button class="${c.emoji === e ? 'on' : ''}" data-emo="${a.id}" data-v="${e}">${e}</button>`).join('')}</div></div><div class="mk-field"><label>Ein Satz im Präsens</label><input class="mk-input" data-title="${a.id}" value="${esc(c.title || '')}" placeholder="e.g. I run by the river three times a week and feel strong."></div><div class="mk-field"><label>Warum ist dir das wichtig?</label><input class="mk-input" data-desc="${a.id}" value="${esc(c.desc || '')}" placeholder="The reason behind the picture"></div><div class="mk-field"><label>Wichtigkeit</label><div class="vb-stars">${[1, 2, 3, 4, 5].map(x => `<button class="${n(c.imp, 0) >= x ? 'on' : ''}" data-imp="${a.id}" data-v="${x}" aria-label="Importance ${x}">★</button>`).join('')}</div></div>${(c.title || '').trim() && FUTURE.test(c.title) ? note('info', 'Present tense: “I am / I have / I live”.') : ''}</div>` : ''}</div>`; }).join('') + areaNote();
        const host = $('vb-areas');
        const ensure = (area) => { let c = card(area); if (!c) { c = { id: MethodKit.uid(), area, title: '', desc: '', emoji: '', imp: 0 }; S.cards.push(c); } return c; };
        host.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { S.openArea = S.openArea === b.dataset.open ? '' : b.dataset.open; MethodKit.save(); renderAreas(); if (S.openArea) { const i = host.querySelector(`[data-title="${S.openArea}"]`); i && i.focus(); } }));
        host.querySelectorAll('[data-emo]').forEach(b => b.addEventListener('click', () => { ensure(b.dataset.emo).emoji = b.dataset.v; MethodKit.save(); renderAreas(); }));
        host.querySelectorAll('[data-imp]').forEach(b => b.addEventListener('click', () => { ensure(b.dataset.imp).imp = +b.dataset.v; MethodKit.save(); renderAreas(); }));
        host.querySelectorAll('[data-title]').forEach(i => { i.addEventListener('input', () => { ensure(i.dataset.title).title = i.value; MethodKit.save(); }); i.addEventListener('change', renderAreas); });
        host.querySelectorAll('[data-desc]').forEach(i => i.addEventListener('input', () => { ensure(i.dataset.desc).desc = i.value; MethodKit.save(); }));
    }
    function areaNote() {
        const f = filled();
        if (f.length < 3) return note('info', `${f.length}/10 areas filled. Three to seven are enough – a board with ten equally important fields has no focus.`);
        const imps = f.filter(c => c.imp);
        if (imps.length && imps.every(c => c.imp >= 4)) return note('info', 'Everything is “very important”. Then nothing is. Which two would you sacrifice if you had to?');
        const notBody = !card('gesundheit') || !(card('gesundheit').title || '').trim();
        if (f.length >= 5 && notBody) return note('info', 'Body & health is empty. Every other vision rests on it – one sentence is enough.');
        return note('ok', `${f.length} building blocks. You'll see them together on the board.`);
    }

    /* ---------- 3 ---------- */
    function renderBoard() {
        const f = filled();
        if (!f.length) { $('vb-board').innerHTML = note('info', 'Fill in at least one area in step 2.'); return; }
        const sorted = [...f].sort((a, b) => n(b.imp, 0) - n(a.imp, 0));
        const focus = S.focus.filter(id => f.some(c => c.id === id));
        $('vb-board').innerHTML = (S.headline ? `<div class="vb-head">${esc(S.headline)}${S.feeling ? `<small>${esc(S.feeling)}</small>` : ''}</div>` : '') +
            `<div class="vb-grid">${sorted.map(c => { const a = A(c.area); const big = n(c.imp, 0) >= 4; return `<button class="vb-tile ${big ? 'big' : ''} ${focus.includes(c.id) ? 'focus' : ''}" style="--c:${a.c}" data-f="${c.id}"><span class="ic">${c.emoji || a.ic}</span><span class="a">${a.label}</span><span class="t">${esc(c.title)}</span>${c.desc ? `<span class="d">${esc(c.desc)}</span>` : ''}${focus.includes(c.id) ? '<span class="vb-focus-badge">Focus</span>' : ''}</button>`; }).join('')}</div>` +
            (focus.length === 0 ? note('info', 'Pick up to three focus blocks. Question: which one, if it came true, would make the others easier?') : focus.length === 1 ? note('info', '1 focus. A second or third may join – no more.') : note('ok', `${focus.length} Focus blocks: ${focus.map(id => esc(f.find(c => c.id === id).title)).join(' · ')}`));
        $('vb-board').querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.f; if (S.focus.includes(id)) S.focus = S.focus.filter(x => x !== id); else if (S.focus.length >= 3) { MethodKit.toast('Maximum three – deselect one first', 'warn'); return; } else S.focus.push(id); MethodKit.save(); renderBoard(); }));
    }

    /* ---------- 4 ---------- */
    function renderAction() {
        const F = S.focus.map(id => S.cards.find(c => c.id === id)).filter(c => c && (c.title || '').trim());
        if (!F.length) { $('vb-action').innerHTML = note('info', 'Pick your focus blocks in step 3.'); return; }
        $('vb-action').innerHTML = F.map(c => { const a = A(c.area), p = S.plan[c.id] || {}; return `<div class="vb-act" style="--c:${a.c}"><div class="vb-act-h"><span>${c.emoji || a.ic}</span><div><b>${esc(c.title)}</b><small>${a.label}</small></div></div><div class="mk-field"><label>How will I know it's coming true? (Evidence, measurable or visible)</label><input class="mk-input" data-ev="${c.id}" value="${esc(p.evidence || '')}" placeholder="e.g. I have three paying clients / I run 10 km without stopping"></div><div class="mk-grid-2"><div class="mk-field"><label>First step in the next 7 days</label><input class="mk-input" data-first="${c.id}" value="${esc(p.first || '')}" placeholder="Small enough for this week"></div><div class="mk-field"><label>What do I have to let go of for it?</label><input class="mk-input" data-drop="${c.id}" value="${esc(p.drop || '')}" placeholder="Time, habit, expectation …"></div></div>${actNote(p)}</div>`; }).join('');
        const host = $('vb-action');
        [['ev', 'evidence'], ['first', 'first'], ['drop', 'drop']].forEach(([d, k]) => host.querySelectorAll(`[data-${d}]`).forEach(i => { i.addEventListener('input', () => { (S.plan[i.dataset[d]] = S.plan[i.dataset[d]] || {})[k] = i.value; MethodKit.save(); }); i.addEventListener('change', renderAction); }));
    }
    function actNote(p) {
        const ev = (p.evidence || '').trim(), f = (p.first || '').trim(), d = (p.drop || '').trim();
        if (!ev && !f) return '';
        if (ev && !/\d|jede|täglich|wöchentlich|pro |mal\b|fertig|unterschrieben|gebucht|bestanden/i.test(ev)) return note('info', 'The evidence is still soft. A number, a date, a document, a visible change – how would an outsider recognize it?');
        if (f && /anfangen|überlegen|schauen|informieren|recherchieren|mich kümmern|planen/i.test(f) && f.length < 50) return note('info', '“Start / look into / find out” isn\'t a step yet. What exactly will you do, when, where? E.g. “Tuesday 6 pm: book course X”.');
        if (ev && f && !d) return note('info', 'Every yes is a no to something else. What are you giving up – time, a habit, an expectation?');
        if (ev && f && d) return note('ok', 'Evidence, step, price – that\'s a vision with its feet on the ground.');
        return '';
    }

    /* ---------- 5 ---------- */
    function renderRitual() {
        const R = S.ritual || {};
        const aff = (S.headline || '').trim();
        $('vb-ritual').innerHTML = `<div class="mk-section-label">Ritual</div><p class="mk-sub">A board only works if you see it. When will you look at it?</p><div class="mk-chips">${[['morning', '🌅 Morgens, vor dem Handy'], ['evening', '🌙 Abends, vor dem Schlafen'], ['weekly', '📅 Sonntags, Wochenplanung'], ['desk', '🖥️ Am Arbeitsplatz sichtbar']].map(([k, t]) => `<button class="mk-chip ${R[k] ? 'selected' : ''}" data-rit="${k}">${t}</button>`).join('')}</div>` +
            (aff ? `<div class="vb-aff">„${esc(aff)}"<small>Read this sentence out loud – as a ritual, every day.</small></div>` : '') +
            `<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:10px"><button class="mk-btn mk-btn-outline mk-btn-sm" id="vb-checkin"><i class="fas fa-eye"></i> Viewed today</button><span class="mk-faint">${S.checkins.length ? `${S.checkins.length}× angeschaut · zuletzt ${new Date(S.checkins[S.checkins.length - 1]).toLocaleDateString('en-GB')}` : 'no check-in yet'}</span></div>` +
            (S.checkins.length >= 7 ? note('ok', `${S.checkins.length} check-ins. Review every three months: does the picture still fit, or has it evolved?`) : '');
        $('vb-ritual').querySelectorAll('[data-rit]').forEach(b => b.addEventListener('click', () => { S.ritual = S.ritual || {}; S.ritual[b.dataset.rit] = !S.ritual[b.dataset.rit]; MethodKit.save(); renderRitual(); }));
        $('vb-checkin').addEventListener('click', () => { const t = new Date().toDateString(); if (S.checkins.some(x => new Date(x).toDateString() === t)) { MethodKit.toast('Already entered today', 'warn'); return; } S.checkins.push(Date.now()); MethodKit.save({ now: true }); MethodKit.toast('Seen ✓', 'ok'); renderRitual(); });
    }
    function renderSummary() {
        const f = filled(), F = S.focus.map(id => f.find(c => c.id === id)).filter(Boolean);
        if (!f.length && !S.headline) { $('vb-summary').innerHTML = ''; return; }
        $('vb-summary').innerHTML = `<div class="mk-result" style="margin-top:14px"><h4>Your board in ${n(S.horizon, 3)} Jahr${n(S.horizon, 3) > 1 ? 'en' : ''}</h4>${S.headline ? `<p><b>${esc(S.headline)}</b>${S.feeling ? ` · <i>${esc(S.feeling)}</i>` : ''}</p>` : ''}<div class="vb-sum">${f.map(c => `<span style="--c:${A(c.area).c}">${c.emoji || A(c.area).ic} ${esc(c.title)}</span>`).join('')}</div>${F.length ? `<div class="mk-section-label">Fokus</div><ul class="vb-ul">${F.map(c => { const p = S.plan[c.id] || {}; return `<li><b>${esc(c.title)}</b>${p.evidence ? ` – Beweis: ${esc(p.evidence)}` : ''}${p.first ? `<br><small>→ ${esc(p.first)}</small>` : ''}</li>`; }).join('')}</ul>` : ''}</div>`;
    }
    function renderLinks() { $('vb-links').innerHTML = LINKS.map(x => `<a class="mk-option vb-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['VISION BOARD', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), `Horizon: ${n(S.horizon, 3)} years`, ''];
        if (S.headline) L.push('GUIDING SENTENCE', S.headline, ''); if (S.feeling) L.push('Core feeling: ' + S.feeling, ''); if (S.day) L.push('ONE DAY', S.day, '');
        L.push('BUILDING BLOCKS'); filled().sort((a, b) => n(b.imp, 0) - n(a.imp, 0)).forEach(c => L.push(`  ${c.emoji || A(c.area).ic} ${A(c.area).label}${c.imp ? ` (${'★'.repeat(c.imp)})` : ''}: ${c.title}${c.desc ? ` – ${c.desc}` : ''}${S.focus.includes(c.id) ? ' [FOKUS]' : ''}`));
        const F = S.focus.map(id => S.cards.find(c => c.id === id)).filter(Boolean);
        if (F.length) { L.push('', 'FOCUS → ACTION'); F.forEach(c => { const p = S.plan[c.id] || {}; L.push(`  ■ ${c.title}`); if (p.evidence) L.push(`    Evidence: ${p.evidence}`); if (p.first) L.push(`    First step: ${p.first}`); if (p.drop) L.push(`    Letting go: ${p.drop}`); }); }
        MethodKit.exportText('vision-board.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'vision-board', accent: '#0ea5e9', accent2: '#6366f1',
            steps: [{ icon: '🌅', label: 'Big picture' }, { icon: '🧩', label: 'Bereiche' }, { icon: '🖼️', label: 'Board' }, { icon: '🎯', label: 'Handlung' }, { icon: '🔁', label: 'Ritual' }]
            , defaultState: { horizon: 3, headline: '', day: '', feeling: '', cards: [], focus: [], plan: {}, ritual: {}, checkins: [], openArea: '' }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.cards)) S.cards = [];
        // Migration: alte Karten (mehrere pro Bereich) → eine pro Bereich, Rest zusammenführen
        const seen = {}; S.cards = S.cards.filter(c => { if (!c || !c.area) return false; if (!AREAS.some(a => a.id === c.area)) c.area = 'lernen'; if (seen[c.area]) { if ((c.title || '').trim()) seen[c.area].title = [seen[c.area].title, c.title].filter(Boolean).join(' · '); return false; } seen[c.area] = c; c.id = c.id || MethodKit.uid(); c.emoji = c.emoji || ''; c.imp = n(c.imp, 0); return true; });
        ['focus', 'checkins'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        ['plan', 'ritual'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        delete S.pickArea;
        MethodKit.bindFields();
        ['vb-headline', 'vb-day'].forEach(id => $(id).addEventListener('input', renderBigNotes));
        $('vb-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) { renderHorizon(); renderBigNotes(); }
            if (k === 2) renderAreas();
            if (k === 3) renderBoard();
            if (k === 4) renderAction();
            if (k === 5) { renderRitual(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
