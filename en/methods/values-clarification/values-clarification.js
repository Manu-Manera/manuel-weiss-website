/* Werte-Kompass · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const GROUPS = [
        { id: 'free', t: 'Freedom & self-determination', ic: '🪁', c: '#0ea5e9', v: ['Freedom', 'Independence', 'Autonomy', 'Adventure', 'Flexibility', 'Creativity', 'Authenticity'] },
        { id: 'bond', t: 'Connection', ic: '🤝', c: '#ec4899', v: ['Family', 'Friendship', 'Love', 'Belonging', 'Loyalty', 'Trust', 'Care'] },
        { id: 'grow', t: 'Achievement & growth', ic: '🚀', c: '#f59e0b', v: ['Achievement', 'Success', 'Growth', 'Learning', 'Excellence', 'Influence', 'Recognition'] },
        { id: 'safe', t: 'Security & stability', ic: '🏠', c: '#64748b', v: ['Security', 'Stability', 'Health', 'Order', 'Reliability', 'Prosperity', 'Tradition'] },
        { id: 'mean', t: 'Meaning & contribution', ic: '🌱', c: '#10b981', v: ['Meaning', 'Contribution', 'Justice', 'Sustainability', 'Spirituality', 'Honesty', 'Integrity'] },
        { id: 'joy', t: 'Enjoyment & aliveness', ic: '🎉', c: '#a855f7', v: ['Enjoyment', 'Humour', 'Beauty', 'Peace', 'Nature', 'Spontaneity', 'Joy of life'] }
    ];
    const TENSION = [['Freedom', 'Security', 'Every bond costs freedom, every freedom costs security. Decide consciously where you weight which side – otherwise you feel half everywhere.'], ['Independence', 'Belonging', 'You want to belong and not have to adapt. That works – but only with people who can bear your individuality.'], ['Adventure', 'Stability', 'The solution is usually rhythm: a fixed base, regular breakouts. Don’t want both at the same time.'], ['Achievement', 'Peace', 'Achievement eats rest if you don’t actively protect it. Rest has to be in the calendar, not left over.'], ['Success', 'Family', 'The classic. Ask your family what they understand by “time with you” – usually it is less, but more present, than you think.'], ['Spontaneity', 'Order', 'Order in the big picture creates room for spontaneity in the small. The other way round creates chaos.'], ['Influence', 'Authenticity', 'Influence demands adaptation to the system. Draw a line: what do you do for impact – and what never?'], ['Recognition', 'Authenticity', 'If you want recognition, you will want to bend yourself. Seek recognition from people who truly see you.'], ['Prosperity', 'Meaning', 'Not necessarily a contradiction – but ask honestly which of the two determined your last three big decisions.'], ['Flexibility', 'Reliability', 'Be reliable in the what and flexible in the how. Then they don’t clash.'], ['Autonomy', 'Loyalty', 'Being loyal and still being able to say no – that is the mature version of this pair.'], ['Excellence', 'Enjoyment', 'Excellence without enjoyment becomes perfectionism. Enjoyment without excellence becomes shallow. Switch consciously between workbench and terrace.']];
    const AREAS = ['Work', 'Partnership', 'Family', 'Friends', 'Body', 'Leisure', 'Money', 'Me-time'];
    const PEAKS = [['proud', 'A moment when I was really proud of myself', 'Which value was lived there?'], ['angry', 'Something that recently made me really angry', 'Anger shows which value was violated.'], ['envy', 'Someone I secretly envy – and for what', 'Envy shows what you don’t allow yourself.']];
    const LINKS = [
        { m: 'Goal setting', l: '../goal-setting/goal-setting.html', why: 'Turn the weekly decision into a real goal.' },
        { m: 'Wheel of Life', l: '../wheel-of-life/wheel-of-life.html', why: 'The life areas in which your values need room.' },
        { m: 'Ikigai', l: '../ikigai/ikigai.html', why: 'Bring values and contribution together.' },
        { m: 'Journaling', l: '../journaling/journaling.html', why: 'Check weekly: did the value get room?' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const groupOf = (v) => GROUPS.find(g => g.v.includes(v));
    const colorOf = (v) => (groupOf(v) || { c: '#14b8a6' }).c;
    const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
    function pairs() { const s = S.sel; const P = []; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) P.push([s[i], s[j]]); return P; }
    const pk = (a, b) => [a, b].sort().join('|');
    function ranking() {
        if (S.order && S.order.length && S.order.every(v => S.sel.includes(v)) && S.order.length === S.sel.length) return S.order;
        const wins = {}; S.sel.forEach(v => wins[v] = 0); Object.entries(S.pairs).forEach(([k, w]) => { if (k.split('|').every(v => S.sel.includes(v)) && wins[w] !== undefined) wins[w]++; });
        return [...S.sel].sort((a, b) => wins[b] - wins[a] || S.sel.indexOf(a) - S.sel.indexOf(b));
    }
    const top = () => ranking().slice(0, 5);
    const imp = (i) => 10 - i;
    function cycles() { const P = pairs(); const beats = (a, b) => S.pairs[pk(a, b)] === a; let c = 0; const s = S.sel; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) for (let k = j + 1; k < s.length; k++) { const [a, b, d] = [s[i], s[j], s[k]]; if (!S.pairs[pk(a, b)] || !S.pairs[pk(b, d)] || !S.pairs[pk(a, d)]) continue; if ((beats(a, b) && beats(b, d) && beats(d, a)) || (beats(b, a) && beats(d, b) && beats(a, d))) c++; } return P.length ? c : 0; }

    /* ---------- 1 ---------- */
    function renderPick() {
        const sel = S.sel;
        $('vc-pick').innerHTML = `<div class="vc-peaks">${PEAKS.map(([k, q, h]) => `<div class="mk-field"><label>${q}</label><input class="mk-input" data-peak="${k}" value="${esc(S.peaks[k] || '')}" placeholder="${h}"></div>`).join('')}</div>` +
            GROUPS.map(g => `<div class="vc-group" style="--c:${g.c}"><div class="vc-group-h"><span>${g.ic}</span><b>${g.t}</b><small>${g.v.filter(v => sel.includes(v)).length}/${g.v.length}</small></div><div class="mk-chips">${g.v.map(v => `<button class="mk-chip ${sel.includes(v) ? 'selected' : ''}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`).join('') +
            `<div class="vc-group" style="--c:#14b8a6"><div class="vc-group-h"><span>✏️</span><b>Own values</b></div><div class="mk-chips">${S.custom.map(v => `<button class="mk-chip ${sel.includes(v) ? 'selected' : ''}" data-v="${esc(v)}">${esc(v)} <i class="fas fa-xmark" data-rm="${esc(v)}" aria-label="Remove"></i></button>`).join('')}<input class="mk-input vc-custom" id="vc-custom" placeholder="Enter value + Enter"></div></div>` + pickNote();
        const host = $('vc-pick');
        host.querySelectorAll('[data-peak]').forEach(i => i.addEventListener('input', () => { S.peaks[i.dataset.peak] = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', (e) => { if (e.target.dataset.rm) { S.custom = S.custom.filter(x => x !== e.target.dataset.rm); S.sel = S.sel.filter(x => x !== e.target.dataset.rm); MethodKit.save(); renderPick(); return; } const v = b.dataset.v; S.sel = sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v]; S.order = []; MethodKit.save(); renderPick(); }));
        $('vc-custom').addEventListener('keydown', e => { if (e.key !== 'Enter') return; e.preventDefault(); const v = e.target.value.trim(); if (!v) return; const name = v[0].toUpperCase() + v.slice(1); if (!S.custom.includes(name) && !GROUPS.some(g => g.v.includes(name))) S.custom.push(name); if (!S.sel.includes(name)) S.sel.push(name); S.order = []; MethodKit.save(); renderPick(); $('vc-custom').focus(); });
    }
    function pickNote() {
        const k = S.sel.length; if (!k) return note('info', 'Tip: start with the three questions above – proud, angry, envious. Your values are already in there.');
        const gc = {}; S.sel.forEach(v => { const g = groupOf(v); if (g) gc[g.id] = (gc[g.id] || 0) + 1; }); const dom = Object.entries(gc).sort((a, b) => b[1] - a[1])[0];
        let out = '';
        if (k > 15) out += note('warn', `${k} values – that is a wish list, not a compass. Cross out everything you find “also nice”. Goal: at most 10 for the pairwise comparison.`);
        else if (k > 10) out += note('info', `${k} values. For the pairwise comparison at most 10 would be good (${k * (k - 1) / 2} comparisons otherwise). Ask for each: would I miss something if it were gone?`);
        else if (k < 5) out += note('info', `${k} values. Take at least 5 to 6 – otherwise there is nothing to condense.`);
        else out += note('ok', `${k} values – good size. ${k * (k - 1) / 2} comparisons in the next step.`);
        if (dom && dom[1] >= 4 && k >= 6 && dom[1] / k >= 0.5) out += note('info', `Half come from ”${GROUPS.find(g => g.id === dom[0]).t}”. You probably mean nuances of the same thing there – check whether two of them are enough.`);
        const ten = TENSION.filter(([a, b]) => S.sel.includes(a) && S.sel.includes(b)); if (ten.length) out += note('info', `Tension pair chosen: ${ten.map(([a, b]) => `<strong>${a} ↔ ${b}</strong>`).join(', ')}. Normal – but that is exactly where the pairwise comparison gets interesting.`);
        return out;
    }

    /* ---------- 2 ---------- */
    function renderRank() {
        const sel = S.sel; if (sel.length < 3) { $('vc-rank').innerHTML = note('info', 'Choose at least three values in step 1.'); return; }
        const P = pairs(); const done = P.filter(([a, b]) => S.pairs[pk(a, b)]); const open = P.filter(([a, b]) => !S.pairs[pk(a, b)]);
        const manual = S.order && S.order.length === sel.length;
        let h = '';
        if (sel.length > 10 && !manual) h += note('warn', `${sel.length} values → ${P.length} comparisons. Remove some here or sort directly by hand.`) + `<div class="mk-chips" style="margin-bottom:12px">${sel.map(v => `<button class="mk-chip selected" data-rm="${esc(v)}">${esc(v)} <i class="fas fa-xmark"></i></button>`).join('')}</div>`;
        if (!manual && open.length && sel.length <= 10) {
            const [a, b] = open[0];
            h += `<div class="vc-progress"><i style="width:${done.length / P.length * 100}%"></i><span>${done.length} / ${P.length}</span></div><p class="vc-q">If you could only <em>one</em> of them truly live:</p><div class="vc-duel"><button class="vc-duel-b" data-win="${esc(a)}" data-lose="${esc(b)}" style="--c:${colorOf(a)}">${esc(a)}<small>${(groupOf(a) || {}).t || 'own value'}</small></button><span>or</span><button class="vc-duel-b" data-win="${esc(b)}" data-lose="${esc(a)}" style="--c:${colorOf(b)}">${esc(b)}<small>${(groupOf(b) || {}).t || 'own value'}</small></button></div>` +
                (done.length ? `<div class="mk-faint" style="text-align:center;font-size:13px">Decide quickly – the first impulse is usually the honest one.</div>` : '');
        }
        const R = ranking();
        if (manual || !open.length || sel.length > 10) {
            const cyc = !manual && !open.length ? cycles() : 0;
            h += `<div class="mk-section-label">${manual ? 'Deine Rangfolge' : !open.length ? 'Ranking from the pairwise comparison' : 'Preliminary ranking'}</div><div class="vc-rank">${R.map((v, i) => `<div class="vc-rank-i ${i < 5 ? 'top' : ''}" style="--c:${colorOf(v)}"><b>${i + 1}</b><span>${esc(v)}</span>${i < 5 ? '<em>Top 5</em>' : ''}<div class="vc-ud"><button class="mk-iconbtn" data-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move up"><i class="fas fa-chevron-up"></i></button><button class="mk-iconbtn" data-dn="${i}" ${i === R.length - 1 ? 'disabled' : ''} aria-label="Move down"><i class="fas fa-chevron-down"></i></button></div></div>`).join('')}</div>` +
                (cyc >= 3 ? note('info', `${cyc} circles in your decisions (A before B, B before C, but C before A). You are not sure there – use the arrows to correct the ranking by hand.`) : '') +
                (!open.length && !manual ? note('ok', `Comparison complete. Rank 1: <strong>${esc(R[0])}</strong>. Does your gut agree? Otherwise correct with the arrows.`) : '') +
                (R.length > 5 ? `<div class="mk-faint" style="font-size:13px;margin-top:8px">Continue with the top 5. ${R.slice(5).map(esc).join(', ')} remain important – but not guiding.</div>` : '');
            if (!open.length || manual) h += `<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="mk-btn mk-btn-outline mk-btn-sm" id="vc-redo"><i class="fas fa-rotate-left"></i> Restart pairwise comparison</button></div>`;
        } else if (open.length && sel.length <= 10) {
            h += `<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="mk-btn mk-btn-outline mk-btn-sm" id="vc-manual"><i class="fas fa-list-ol"></i> Rather sort directly by hand</button></div>`;
        }
        $('vc-rank').innerHTML = h;
        const host = $('vc-rank');
        host.querySelectorAll('[data-win]').forEach(b => b.addEventListener('click', () => { S.pairs[pk(b.dataset.win, b.dataset.lose)] = b.dataset.win; MethodKit.save(); renderRank(); }));
        host.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { S.sel = S.sel.filter(x => x !== b.dataset.rm); S.order = []; MethodKit.save(); renderRank(); }));
        host.querySelectorAll('[data-up],[data-dn]').forEach(b => b.addEventListener('click', () => { const o = [...ranking()]; const i = n(b.dataset.up !== undefined ? b.dataset.up : b.dataset.dn, 0); const j = b.dataset.up !== undefined ? i - 1 : i + 1; if (j < 0 || j >= o.length) return;[o[i], o[j]] = [o[j], o[i]]; S.order = o; MethodKit.save(); renderRank(); }));
        const m = $('vc-manual'); if (m) m.addEventListener('click', () => { S.order = [...ranking()]; MethodKit.save(); renderRank(); });
        const rd = $('vc-redo'); if (rd) rd.addEventListener('click', () => { S.pairs = {}; S.order = []; MethodKit.save(); renderRank(); });
    }

    /* ---------- 3 ---------- */
    function renderDefine() {
        const T = top(); if (T.length < 3) { $('vc-define').innerHTML = note('info', 'Choose and condense values first.'); return; }
        $('vc-define').innerHTML = T.map((v, i) => { const d = S.def[v] || {}; return `<div class="vc-def" style="--c:${colorOf(v)}"><div class="vc-def-h"><b>${i + 1}</b><span>${esc(v)}</span>${defState(d)}</div><div class="mk-field"><label>What does ${esc(v)} mean for you – in one sentence?</label><input class="mk-input" data-d="${esc(v)}|mean" value="${esc(d.mean || '')}" placeholder="${esc(v)} means to me that …"></div><div class="mk-field"><label>How can one tell that you are living ${esc(v)} ? An observable behaviour.</label><input class="mk-input" data-d="${esc(v)}|behave" value="${esc(d.behave || '')}" placeholder="e.g. I cancel appointments when …"></div><div class="mk-field"><label>When did you last betray ${esc(v)} – and for what?</label><input class="mk-input" data-d="${esc(v)}|betray" value="${esc(d.betray || '')}" placeholder="Honestly. This shows which value was stronger in practice."></div></div>`; }).join('') + defineNote(T);
        $('vc-define').querySelectorAll('[data-d]').forEach(el => { el.addEventListener('input', () => { const [v, k] = el.dataset.d.split('|'); S.def[v] = S.def[v] || {}; S.def[v][k] = el.value; MethodKit.save(); }); el.addEventListener('change', renderDefine); });
    }
    const defState = (d) => { const k = ['mean', 'behave', 'betray'].filter(x => (d[x] || '').trim().length >= 10).length; return `<em class="${k === 3 ? 'ok' : ''}">${k}/3</em>`; };
    function defineNote(T) {
        let out = '';
        const gc = {}; T.forEach(v => { const g = groupOf(v); if (g) gc[g.id] = (gc[g.id] || 0) + 1; }); const dom = Object.entries(gc).find(([, c]) => c >= 3);
        if (dom) out += note('info', `Three of your top 5 come from ”${GROUPS.find(g => g.id === dom[0]).t}”. That is your core motive – but check whether the three really differ in behaviour. If not, another value moves up.`);
        TENSION.filter(([a, b]) => T.includes(a) && T.includes(b)).forEach(([a, b, txt]) => out += note('warn', `<strong>${a} ↔ ${b}</strong> – both in your top 5. ${txt}`));
        T.forEach(v => { const d = S.def[v] || {}; const b = (d.behave || '').trim(); if (b && (b.length < 20 || /\b(wichtig|bewusst|mehr|achte|versuche|offen)\b/i.test(b)) && !/\b(sage|mache|gehe|nehme|rufe|schreibe|lehne|frage|plane|blocke|kündige|stehe|höre|lasse|setze|verzichte)\b/i.test(b)) out += note('info', `„${esc(b)}” at <strong>${esc(v)}</strong> is an attitude, not a behaviour. What do you do – visible from outside?`); });
        const betrayed = T.filter(v => (S.def[v] || {}).betray && (S.def[v].betray || '').trim().length >= 10);
        betrayed.forEach(v => { const other = T.find(o => o !== v && new RegExp(o, 'i').test(S.def[v].betray)); if (other) out += note('info', `You have <strong>${esc(v)}</strong> for <strong>${esc(other)}</strong> betrayed – in doubt, ${esc(other)} is practically stronger. Does the ranking stand like this?`); });
        const full = T.filter(v => ['mean', 'behave', 'betray'].every(k => ((S.def[v] || {})[k] || '').trim().length >= 10)).length;
        if (full === T.length) out += note('ok', 'All values are defined – with behaviour and betrayal. That is more clarity than most people ever achieve.');
        return out;
    }

    /* ---------- 4 ---------- */
    function renderLive() {
        const T = top(); if (T.length < 3) { $('vc-live').innerHTML = note('info', 'Choose and condense values first.'); return; }
        $('vc-live').innerHTML = T.map((v, i) => { const l = S.lived[v] || {}; const sc = n(l.score, 5); return `<div class="vc-live" style="--c:${colorOf(v)}"><div class="vc-def-h"><b>${i + 1}</b><span>${esc(v)}</span><em>Importance ${imp(i)}/10</em></div><div class="mk-range-wrap"><label>How strongly do you live ${esc(v)} at the moment?</label><input type="range" class="mk-range" min="1" max="10" value="${sc}" data-l="${esc(v)}|score"><span class="mk-range-val ${sc <= 3 ? 'low' : sc >= 8 ? 'high' : ''}">${sc}</span></div><div class="vc-live-row"><div class="mk-chips">${AREAS.map(a => `<button class="mk-chip mk-chip-sm ${(l.areas || []).includes(a) ? 'selected' : ''}" data-la="${esc(v)}|${a}">${a}</button>`).join('')}</div><label class="vc-hours"><input type="number" class="mk-input" min="0" max="168" data-l="${esc(v)}|hours" value="${l.hours !== undefined && l.hours !== '' ? esc(String(l.hours)) : ''}" placeholder="0"> hrs/week</label></div></div>`; }).join('') + liveNote(T);
        const host = $('vc-live');
        host.querySelectorAll('[data-l]').forEach(el => { el.addEventListener('input', () => { const [v, k] = el.dataset.l.split('|'); S.lived[v] = S.lived[v] || {}; S.lived[v][k] = el.value; MethodKit.save(); if (k === 'score') { const sv = el.parentElement.querySelector('.mk-range-val'); sv.textContent = el.value; sv.className = 'mk-range-val ' + (el.value <= 3 ? 'low' : el.value >= 8 ? 'high' : ''); } }); el.addEventListener('change', renderLive); });
        host.querySelectorAll('[data-la]').forEach(b => b.addEventListener('click', () => { const [v, a] = b.dataset.la.split('|'); S.lived[v] = S.lived[v] || {}; const A = S.lived[v].areas || []; S.lived[v].areas = A.includes(a) ? A.filter(x => x !== a) : [...A, a]; MethodKit.save(); renderLive(); }));
    }
    function liveNote(T) {
        let out = ''; const L = T.map((v, i) => ({ v, i, s: n((S.lived[v] || {}).score, 5), h: n((S.lived[v] || {}).hours, -1), a: ((S.lived[v] || {}).areas || []).length }));
        const touched = L.some(x => (S.lived[x.v] || {}).score !== undefined); if (!touched) return note('info', 'The sliders: 10 = the value visibly determines my everyday life, 1 = it only exists in my head. Hours: a rough estimate is enough.');
        const sumH = L.filter(x => x.h >= 0).reduce((a, x) => a + x.h, 0); if (sumH > 112) out += note('warn', `${sumH} hours per week – more than is available awake. The same hour counts for two values? Then count it only for the dominant one.`);
        const first = L[0]; const most = [...L].filter(x => x.h >= 0).sort((a, b) => b.h - a.h)[0];
        if (most && first.h >= 0 && most.v !== first.v && most.h >= first.h * 2 && most.h >= 10) out += note('warn', `Your rank 1 (<strong>${esc(first.v)}</strong>) gets ${first.h} hrs, <strong>${esc(most.v)}</strong> (rank ${most.i + 1}) gets ${most.h}. Your calendar has different priorities than your head.`);
        L.filter(x => x.s <= 3 && x.i < 3).forEach(x => out += note('warn', `<strong>${esc(x.v)}</strong> at rank ${x.i + 1}, lived only ${x.s}/10. That is the kind of gap that turns into dissatisfaction – often without being able to name the reason.`));
        if (L.every(x => x.s >= 8)) out += note('info', 'Everything 8+? Either very coherent – or too kind. Ask for each value: when did I concretely live it this week?');
        L.filter(x => x.s >= 7 && x.a === 0 && (S.lived[x.v] || {}).score !== undefined).forEach(x => out += note('info', `<strong>${esc(x.v)}</strong> ${x.s}/10 lived, but no life area marked – where exactly does that take place?`));
        const areaCount = {}; L.forEach(x => ((S.lived[x.v] || {}).areas || []).forEach(a => areaCount[a] = (areaCount[a] || 0) + 1)); const hub = Object.entries(areaCount).find(([, c]) => c >= 4);
        if (hub) out += note('info', `${hub[1]} of your top values live in ”${hub[0]}”. Cluster risk: if this area breaks away, almost everything breaks. Where could two of them find additional room?`);
        if (!out) out = note('ok', 'Importance and everyday life largely fit together. The compass shows where there is still room.');
        return out;
    }

    /* ---------- 5 ---------- */
    function renderCompass() {
        const T = top(); if (T.length < 3) { $('vc-compass').innerHTML = note('info', 'Choose and condense values first.'); return; }
        const C = S.compass; const rows = T.map((v, i) => ({ v, i, imp: imp(i), s: n((S.lived[v] || {}).score, 5), gap: imp(i) - n((S.lived[v] || {}).score, 5) }));
        const big = [...rows].sort((a, b) => b.gap - a.gap)[0]; const strong = [...rows].sort((a, b) => a.gap - b.gap)[0];
        $('vc-compass').innerHTML = `<div class="vc-bars">${rows.map(r => `<div class="vc-bar" style="--c:${colorOf(r.v)}"><span>${esc(r.v)}</span><div><i class="imp" style="width:${r.imp * 10}%"></i><i class="liv" style="width:${r.s * 10}%"></i></div><em class="${r.gap >= 4 ? 'bad' : r.gap <= 0 ? 'good' : ''}">${r.gap > 0 ? '−' + r.gap : r.gap < 0 ? '+' + Math.abs(r.gap) : '±0'}</em></div>`).join('')}<div class="vc-legend"><span><i class="imp"></i> Importance</span><span><i class="liv"></i> Lived</span></div></div>` +
            (big.gap >= 2 ? note(big.gap >= 4 ? 'warn' : 'info', `Biggest gap: <strong>${esc(big.v)}</strong> (wichtig ${big.imp}, lived ${big.s}). ${(S.def[big.v] || {}).behave ? `You said yourself how one can tell: ”${esc(S.def[big.v].behave)}". When does that happen this week?` : 'Here a decision moves the most.'}`) : note('ok', 'No big gap – your values have room. Now it is about keeping it.')) +
            (strong.gap <= -2 ? note('info', `<strong>${esc(strong.v)}</strong> you live more strongly than it matters to you according to the ranking (${strong.s} vs. ${strong.imp}). Either the value is more important than you thought – or it eats time that ${esc(big.v)} would need.`) : '') +
            `<div class="mk-section-label" style="margin-top:14px">One decision this week</div><div class="mk-field"><label>What do you do concretely so that <strong>${esc(C.focus || big.v)}</strong> gets more room?</label><div class="mk-chips" style="margin-bottom:8px">${T.map(v => `<button class="mk-chip mk-chip-sm ${(C.focus || big.v) === v ? 'selected' : ''}" data-cf="${esc(v)}">${esc(v)}</button>`).join('')}</div><input class="mk-input" data-c="decision" value="${esc(C.decision || '')}" placeholder="e.g. block Friday 2 pm for …"></div><div class="mk-field"><label>What do you say no to for it?</label><input class="mk-input" data-c="no" value="${esc(C.no || '')}" placeholder="Every yes to a value is a no to something else. What is it?"></div><div class="mk-field"><label>How will you notice on Sunday that it worked?</label><input class="mk-input" data-c="sign" value="${esc(C.sign || '')}" placeholder="An observable sign"></div>` + compassNote(C, big) +
            `<div class="mk-result vc-sum"><h4>Your compass</h4><ol>${T.map((v, i) => `<li><b>${esc(v)}</b>${(S.def[v] || {}).mean ? `<span>${esc(S.def[v].mean)}</span>` : ''}</li>`).join('')}</ol>${S.peaks.angry ? `<div class="mk-faint" style="font-size:13px;margin-top:6px">What makes you angry: ”${esc(S.peaks.angry)}" – there, <strong>${esc(T[0])}</strong> oder <strong>${esc(T[1])}</strong> verletzt.</div>` : ''}</div>`;
        const host = $('vc-compass');
        host.querySelectorAll('[data-cf]').forEach(b => b.addEventListener('click', () => { C.focus = b.dataset.cf; MethodKit.save(); renderCompass(); }));
        host.querySelectorAll('[data-c]').forEach(el => { el.addEventListener('input', () => { C[el.dataset.c] = el.value; MethodKit.save(); }); el.addEventListener('change', renderCompass); });
    }
    function compassNote(C, big) {
        const d = (C.decision || '').trim(), no = (C.no || '').trim(), sg = (C.sign || '').trim();
        if (!d) return '';
        if (!/\d|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|morgen|abend|mittag|wochenende|täglich|jeden/i.test(d)) return note('info', 'Without a time it remains an intention. When exactly?');
        if (/(?<![a-zäöüß])(mehr|weniger|öfter|bewusster|versuchen|achten)\b/i.test(d) && d.length < 45) return note('info', '“More / more often / more consciously” is not a decision. What is the first, concrete thing?');
        if (!no) return note('info', 'And the no? Without a no the week only gets fuller – and the value still gets no room.');
        if (d && no && sg) return note('ok', `Decision, no and sign – ${esc(C.focus || big.v)} has a real chance this week. Check briefly on Sunday.`);
        return '';
    }
    function renderLinks() { $('vc-links').innerHTML = LINKS.map(x => `<a class="mk-option vc-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const T = top(); const C = S.compass;
        const L = ['MY VALUES COMPASS', '='.repeat(40), 'Created: ' + new Date().toLocaleDateString('en-GB'), '', `Selected (${S.sel.length}): ${S.sel.join(', ')}`, '', 'TOP 5'];
        T.forEach((v, i) => { const d = S.def[v] || {}, l = S.lived[v] || {}; L.push(`${i + 1}. ${v}  (wichtig ${imp(i)}/10 · lived ${n(l.score, 5)}/10${l.hours ? ` · ${l.hours} Std./Wo` : ''})`); if (d.mean) L.push(`   Meaning: ${d.mean}`); if (d.behave) L.push(`   Behaviour: ${d.behave}`); if (d.betray) L.push(`   Betrayed: ${d.betray}`); if ((l.areas || []).length) L.push(`   Areas: ${l.areas.join(', ')}`); });
        if (ranking().length > 5) L.push('', `Others: ${ranking().slice(5).join(', ')}`);
        if (C.decision) L.push('', 'THIS WEEK', `Focus: ${C.focus || T[0]}`, `Decision: ${C.decision}`, C.no ? `No to: ${C.no}` : '', C.sign ? `Sign: ${C.sign}` : '');
        PEAKS.forEach(([k, q]) => { if (S.peaks[k]) L.push('', q + ':', S.peaks[k]); });
        MethodKit.exportText('werte-kompass.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'values-clarification', accent: '#14b8a6', accent2: '#06b6d4',
            steps: [{ icon: '🔎', label: 'Discover' }, { icon: '⚖️', label: 'Condense' }, { icon: '✍️', label: 'Meaning' }, { icon: '📅', label: 'Everyday life' }, { icon: '🧭', label: 'Compass' }],
            defaultState: { sel: [], custom: [], peaks: {}, pairs: {}, order: [], def: {}, lived: {}, compass: {} }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.sel)) S.sel = Array.isArray(S.selected) ? uniq(S.selected) : [];
        if (!Array.isArray(S.custom)) S.custom = S.sel.filter(v => !GROUPS.some(g => g.v.includes(v)));
        if (!S.peaks || typeof S.peaks !== 'object') S.peaks = {}; if (!S.pairs || typeof S.pairs !== 'object') S.pairs = {};
        if (!Array.isArray(S.order)) S.order = Array.isArray(S.top) && S.top.length ? uniq([...S.top, ...S.sel]) : []; if (S.order.length && S.order.length !== S.sel.length) S.order = [];
        if (!S.def || typeof S.def !== 'object') { S.def = {}; if (S.meaning && typeof S.meaning === 'object') Object.entries(S.meaning).forEach(([v, m]) => { if (m) S.def[v] = { mean: String(m) }; }); }
        if (!S.lived || typeof S.lived !== 'object' || Object.values(S.lived).some(x => typeof x !== 'object')) { const old = S.lived || {}; S.lived = {}; Object.entries(old).forEach(([v, x]) => { if (typeof x !== 'object') S.lived[v] = { score: n(x, 5) }; else S.lived[v] = x; }); }
        if (!S.compass || typeof S.compass !== 'object') S.compass = {};
        ['pool', 'selected', 'top', 'meaning'].forEach(k => delete S[k]);
        $('vc-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) renderPick();
            if (k === 2) renderRank();
            if (k === 3) renderDefine();
            if (k === 4) renderLive();
            if (k === 5) { renderCompass(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
