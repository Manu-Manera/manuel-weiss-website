/* Achtsamkeit · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const MOODS = ['calm', 'müde', 'restless', 'gestresst', 'sad', 'irritated', 'neutral', 'glad', 'zerstreut', 'tense', 'grateful', 'anxious'];
    const PATTERNS = {
        calm: { l: 'Calming 4-7-8', d: '4 in · 7 hold · 8 out – for tension and before sleep', ph: [['Inhale', 4], ['Hold', 7], ['Exhale', 8]] },
        box: { l: 'Box 4-4-4-4', d: 'Even – for focus and clarity', ph: [['Inhale', 4], ['Hold', 4], ['Exhale', 4], ['Hold', 4]] },
        simple: { l: 'Simple 4-6', d: 'Longer exhale – the classic for in-between', ph: [['Inhale', 4], ['Exhale', 6]] }
    };
    const SENSES = [{ k: 'see', ic: '👁️', l: 'Things you see', c: 5, h: 'Colors, shapes, light – the unremarkable too.' }, { k: 'feel', ic: '🖐️', l: 'Things you feel', c: 4, h: 'Chair under you, fabric on skin, temperature.' }, { k: 'hear', ic: '👂', l: 'Sounds you hear', c: 3, h: 'Near and far. Also the hush in between.' }, { k: 'smell', ic: '👃', l: 'Things you smell', c: 2, h: 'If nothing: how does the air smell?' }, { k: 'taste', ic: '👅', l: 'What you taste', c: 1, h: 'The taste in your mouth – now.' }];
    const BODY = ['Head & face', 'Jaw', 'Neck & shoulders', 'Chest', 'Belly', 'Hands & arms', 'Back', 'Legs', 'Feet'];
    const SENS = [{ k: 'tense', l: 'tense', c: '#ef4444' }, { k: 'heavy', l: 'schwer', c: '#f59e0b' }, { k: 'neutral', l: 'neutral', c: '#94a3b8' }, { k: 'warm', l: 'warm', c: '#f97316' }, { k: 'tingle', l: 'kribbelnd', c: '#8b5cf6' }, { k: 'light', l: 'leicht', c: '#10b981' }];
    const LINKS = [
        { m: 'Stressmanagement', l: '../stress-management/stress-management.html', why: 'When the tension has a pattern.' },
        { m: 'Journaling', l: '../journaling/journaling.html', why: 'Capture the reflection daily.' },
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'Anchor mindfulness as a fixed routine.' },
        { m: 'Emotional intelligence', l: '../emotional-intelligence/emotional-intelligence.html', why: 'Perceive feelings more precisely.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const todayKey = () => new Date().toISOString().slice(0, 10);

    /* ---------- 1 ---------- */
    function renderMood() {
        $('mf-mood').innerHTML = `<div class="mk-chips">${MOODS.map(m => `<button class="mk-chip ${S.mood.includes(m) ? 'selected' : ''}" data-m="${m}">${m}</button>`).join('')}</div>`;
        $('mf-mood').querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { const m = b.dataset.m; S.mood = S.mood.includes(m) ? S.mood.filter(x => x !== m) : [...S.mood, m].slice(-3); MethodKit.save(); renderMood(); }));
    }

    /* ---------- 2 · Atem ---------- */
    let timer = null, phaseT = null, startAt = 0, cycles = 0;
    function renderPattern() {
        $('mf-pattern').innerHTML = `<div class="mk-grid mf-pat">${Object.entries(PATTERNS).map(([k, p]) => `<button class="mk-option ${S.pattern === k ? 'selected' : ''}" data-pat="${k}"><span class="t">${p.l}</span><span class="d">${p.d}</span></button>`).join('')}</div>
            <div class="mk-field" style="margin-top:10px"><label>Duration</label><div class="mk-chips">${[1, 2, 3, 5, 10].map(m => `<button class="mk-chip ${n(S.minutes, 3) === m ? 'selected' : ''}" data-min="${m}">${m} min</button>`).join('')}</div></div>`;
        $('mf-pattern').querySelectorAll('[data-pat]').forEach(b => b.addEventListener('click', () => { if (timer) return; S.pattern = b.dataset.pat; MethodKit.save(); renderPattern(); }));
        $('mf-pattern').querySelectorAll('[data-min]').forEach(b => b.addEventListener('click', () => { if (timer) return; S.minutes = +b.dataset.min; MethodKit.save(); renderPattern(); }));
        if (n(S.before, 5) >= 7 && S.pattern !== 'calm') $('mf-breath-note').innerHTML = '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>At high tension, 4-7-8 works fastest – the long exhale activates the parasympathetic system.</span></div>';
        else $('mf-breath-note').innerHTML = '';
    }
    function startBreath() {
        const P = PATTERNS[S.pattern] || PATTERNS.simple; const total = n(S.minutes, 3) * 60;
        startAt = Date.now(); cycles = 0; $('mf-start').disabled = true; $('mf-stop').disabled = false; $('mf-circle').classList.add('on');
        let pi = 0;
        const phase = () => {
            const [label, sec] = P.ph[pi]; const c = $('mf-circle');
            $('mf-circle-t').textContent = label; $('mf-circle-c').textContent = sec + ' s';
            c.style.transition = `transform ${sec}s ease-in-out`;
            c.style.transform = label === 'Inhale' ? 'scale(1.35)' : label === 'Exhale' ? 'scale(0.75)' : c.style.transform;
            phaseT = setTimeout(() => { pi = (pi + 1) % P.ph.length; if (pi === 0) cycles++; phase(); }, sec * 1000);
        };
        phase();
        timer = setInterval(() => { const el = Math.floor((Date.now() - startAt) / 1000); $('mf-timer').textContent = `${Math.floor(el / 60)}:${String(el % 60).padStart(2, '0')}`; if (el >= total) stopBreath(true); }, 500);
    }
    function stopBreath(done) {
        clearInterval(timer); clearTimeout(phaseT); timer = null;
        const el = Math.round((Date.now() - startAt) / 1000);
        $('mf-start').disabled = false; $('mf-stop').disabled = true; const c = $('mf-circle'); c.classList.remove('on'); c.style.transition = 'transform 1.5s ease'; c.style.transform = 'scale(1)';
        $('mf-circle-t').textContent = done ? 'Arrived 🌿' : 'Pause'; $('mf-circle-c').textContent = `${cycles} Breath cycles`;
        S.breathSec = n(S.breathSec, 0) + el; S.breathCycles = n(S.breathCycles, 0) + cycles; MethodKit.save();
        $('mf-breath-note').innerHTML = `<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>${cycles} cycles in ${Math.floor(el / 60)}:${String(el % 60).padStart(2, '0')}. ${done ? 'Bleib noch einen Moment, bevor du weitergehst.' : 'Auch eine Minute zählt.'}</span></div>`;
    }

    /* ---------- 3 ---------- */
    function renderSenses() {
        const V = S.senses;
        const total = SENSES.reduce((a, s) => a + s.c, 0), filled = SENSES.reduce((a, s) => a + (V[s.k] || []).filter(x => x.trim()).length, 0);
        $('mf-senses').innerHTML = SENSES.map(s => { const arr = V[s.k] || []; const done = arr.filter(x => x.trim()).length; return `<div class="mf-sense ${done >= s.c ? 'done' : ''}"><div class="mf-sense-h"><span class="ic">${s.ic}</span><b>${s.c} ${s.l}</b><small>${done}/${s.c}</small></div><div class="hint">${s.h}</div><div class="mf-sense-in">${Array.from({ length: s.c }, (_, i) => `<input class="mk-input" data-sk="${s.k}" data-i="${i}" value="${esc(arr[i] || '')}" placeholder="${i + 1}.">`).join('')}</div></div>`; }).join('') +
            `<div class="mf-prog"><i style="width:${filled / total * 100}%"></i></div>` + (filled === total ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>All 15 perceptions. Do you notice how the thoughts have gone quieter? That\'s the effect: attention can only be in one place.</span></div>' : filled >= 8 ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Over halfway. The small senses (smell, taste) are the strongest anchors, because we otherwise never notice them.</span></div>' : '');
        $('mf-senses').querySelectorAll('[data-sk]').forEach(el => { el.addEventListener('input', () => { const arr = V[el.dataset.sk] || (V[el.dataset.sk] = []); arr[+el.dataset.i] = el.value; MethodKit.save(); }); el.addEventListener('change', renderSenses); });
    }

    /* ---------- 4 ---------- */
    function renderBody() {
        const B = S.body; const tense = BODY.filter(p => ['tense', 'heavy'].includes(B[p]));
        $('mf-body').innerHTML = `<div class="mf-body">${BODY.map(p => `<div class="mf-part"><span class="mf-part-l">${p}</span><div class="mf-part-s">${SENS.map(s => `<button class="${B[p] === s.k ? 'on' : ''}" data-bp="${esc(p)}" data-s="${s.k}" style="--c:${s.c}">${s.l}</button>`).join('')}</div></div>`).join('')}</div>
            ${Object.keys(B).length >= 5 ? `<div class="mf-map">${BODY.map(p => { const s = SENS.find(x => x.k === B[p]); return `<span style="background:${s ? s.c : 'var(--mk-line)'}" title="${p}: ${s ? s.l : '–'}"></span>`; }).join('')}</div>` : ''}
            ${tense.length ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Spannung in <strong>${tense.join(', ')}</strong>. Atme beim nächsten Ausatmen bewusst dorthin – nicht um sie wegzumachen, sondern um ihr Raum zu geben. ${tense.includes('Jaw') || tense.includes('Neck & shoulders') ? 'Jaw and shoulders are the classic stress stores: unstick the tongue from the palate, pull the shoulders up once and let them drop.' : ''}</span></div>` : Object.keys(B).length >= 5 ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Hardly any tension – a relaxed body. Notice this deliberately so you recognize the state again.</span></div>' : ''}`;
        $('mf-body').querySelectorAll('[data-bp]').forEach(b => b.addEventListener('click', () => { const p = b.dataset.bp; B[p] = B[p] === b.dataset.s ? undefined : b.dataset.s; if (!B[p]) delete B[p]; MethodKit.save(); renderBody(); }));
    }

    /* ---------- 5 ---------- */
    function renderDelta() {
        const b = n(S.before, 5), a = n(S.after, 4), d = b - a;
        $('mf-delta').innerHTML = `<div class="mf-delta"><div><b>${b}</b><span>before</span></div><div class="arr">${d > 0 ? '↘' : d < 0 ? '↗' : '→'}</div><div><b class="${d > 0 ? 'ok' : ''}">${a}</b><span>after</span></div></div>
            <div class="mk-note ${d >= 2 ? 'ok' : d > 0 ? 'info' : 'info'}"><i class="fas fa-${d >= 2 ? 'check-circle' : 'info-circle'}"></i><span>${d >= 3 ? `Minus ${d} Punkte – das ist ein spürbarer Unterschied in wenigen Minuten.` : d > 0 ? `Minus ${d}. Kleine Schritte zählen – die Wirkung wächst mit der Regelmässigkeit.` : d === 0 ? 'Keine Veränderung – auch das ist eine ehrliche Beobachtung. Manchmal zeigt sich die Wirkung erst später am Tag.' : 'Mehr Anspannung als vorher? Das passiert, wenn man zum ersten Mal wirklich hinspürt. Es ist nicht mehr geworden – du nimmst es nur wahr.'}</span></div>`;
    }
    function renderGrat() {
        $('mf-grat').innerHTML = `<div class="mf-grat">${[0, 1, 2].map(i => `<input class="mk-input" data-g="${i}" value="${esc(S.gratitude[i] || '')}" placeholder="${['Etwas Kleines von heute …', 'Jemand …', 'Etwas an dir selbst …'][i]}">`).join('')}</div>`;
        $('mf-grat').querySelectorAll('[data-g]').forEach(el => el.addEventListener('input', () => { S.gratitude[+el.dataset.g] = el.value; MethodKit.save(); }));
    }
    function saveSession() {
        const b = n(S.before, 5), a = n(S.after, 4);
        S.log.push({ date: todayKey(), before: b, after: a, sec: n(S.breathSec, 0), pattern: S.pattern, mood: [...S.mood], intention: S.intention || '' });
        S.breathSec = 0; S.breathCycles = 0; S.senses = {}; S.body = {}; S.mood = []; S.park = ''; S.reflect = ''; S.gratitude = []; S.intention = ''; S.before = a; S.after = Math.max(1, a - 1);
        MethodKit.save({ now: true });
        document.querySelectorAll('[data-mk-field]').forEach(el => { el.value = S[el.dataset.mkField] || ''; });
        $('mf-before').value = S.before; $('mf-before-v').textContent = S.before; $('mf-after').value = S.after; $('mf-after-v').textContent = S.after;
        MethodKit.toast('Exercise saved 🌿', 'success'); renderDelta(); renderGrat(); renderLog();
    }
    function renderLog() {
        const L = S.log; if (!L.length) { $('mf-log').innerHTML = '<div class="mk-empty">No completed exercise yet. After finishing you\'ll see here how tension changes over time.</div>'; return; }
        const last = L.slice(-14); const W = 520, H = 150, P = 24; const x = i => P + i * ((W - 2 * P) / Math.max(1, last.length - 1)); const y = v => H - P - (v - 1) / 9 * (H - 2 * P);
        const avgDrop = (L.reduce((a, e) => a + (e.before - e.after), 0) / L.length).toFixed(1);
        const days = [...new Set(L.map(e => e.date))]; let streak = 0; const d = new Date(); for (; ;) { const k = d.toISOString().slice(0, 10); if (days.includes(k)) { streak++; d.setDate(d.getDate() - 1); } else break; }
        const totalMin = Math.round(L.reduce((a, e) => a + (e.sec || 0), 0) / 60);
        $('mf-log').innerHTML = `<div class="mf-stats"><div><b>${L.length}</b><span>Exercises</span></div><div><b>${streak}</b><span>Days in a row</span></div><div><b>−${avgDrop}</b><span>Ø tension</span></div><div><b>${totalMin}</b><span>Min. breathed</span></div></div>
            <svg viewBox="0 0 ${W} ${H}" class="mf-chart" aria-label="Verlauf Anspannung">${last.length > 1 ? `<polyline points="${last.map((e, i) => x(i) + ',' + y(e.before)).join(' ')}" class="before"/><polyline points="${last.map((e, i) => x(i) + ',' + y(e.after)).join(' ')}" class="after"/>` : ''}${last.map((e, i) => `<line x1="${x(i)}" y1="${y(e.before)}" x2="${x(i)}" y2="${y(e.after)}" class="drop"/><circle cx="${x(i)}" cy="${y(e.before)}" r="4" class="before"/><circle cx="${x(i)}" cy="${y(e.after)}" r="4" class="after"/><text x="${x(i)}" y="${H - 6}">${e.date.slice(8, 10)}.${e.date.slice(5, 7)}</text>`).join('')}</svg>
            <div class="mf-legend"><span><i class="before"></i> before</span><span><i class="after"></i> after</span></div>
            ${L.length >= 3 ? `<div class="mk-note ${+avgDrop >= 2 ? 'ok' : 'info'}"><i class="fas fa-chart-line"></i><span>${+avgDrop >= 2 ? `On average ${avgDrop} points less tension per exercise – the practice works reliably.` : 'The effect per exercise is still small. Consistency beats duration: better three minutes daily than twenty once a week.'}${streak >= 3 ? ` ${streak} days in a row – this is becoming a habit.` : ''}</span></div>` : ''}`;
    }
    function renderLinks() { $('mf-links').innerHTML = LINKS.map(x => `<a class="mk-option mf-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['MINDFULNESS', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', `Tension: ${n(S.before, 5)} → ${n(S.after, 4)}`, S.mood.length ? 'Mood: ' + S.mood.join(', ') : '', S.park ? 'Parked: ' + S.park : '', ''];
        L.push('5-4-3-2-1'); SENSES.forEach(s => { const a = (S.senses[s.k] || []).filter(Boolean); if (a.length) L.push(`${s.ic} ${a.join(', ')}`); }); L.push('');
        const B = Object.entries(S.body); if (B.length) { L.push('BODY SCAN:'); B.forEach(([p, s]) => L.push(`${p}: ${(SENS.find(x => x.k === s) || {}).l || s}`)); L.push(''); }
        L.push('REFLECTION:', S.reflect || '–', S.gratitude.filter(Boolean).length ? 'Grateful: ' + S.gratitude.filter(Boolean).join(' · ') : '', S.intention ? 'Attitude: ' + S.intention : '', '');
        if (S.log.length) { L.push('HISTORY'); S.log.forEach(e => L.push(`${e.date}: ${e.before} → ${e.after}${e.sec ? ' · ' + Math.round(e.sec / 60) + ' min Atem' : ''}`)); }
        MethodKit.exportText('achtsamkeit.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'mindfulness', accent: '#8b5cf6', accent2: '#06b6d4',
            steps: [{ icon: '🌅', label: 'Arrive' }, { icon: '🫁', label: 'Breath' }, { icon: '🖐️', label: 'Senses' }, { icon: '🧘', label: 'Body' }, { icon: '🌿', label: 'Reflection' }],
            defaultState: { before: 5, after: 4, mood: [], park: '', pattern: 'simple', minutes: 3, breathSec: 0, breathCycles: 0, senses: {}, body: {}, reflect: '', gratitude: [], intention: '', log: [] }
        });
        S = MethodKit.state;
        ['mood', 'gratitude', 'log'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; }); ['senses', 'body'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        // Migration: alte Einzelfelder see/feel/hear/smell/taste (Strings) und gratitude als String
        SENSES.forEach(s => { if (typeof S[s.k] === 'string') { if (S[s.k].trim() && !S.senses[s.k]) S.senses[s.k] = S[s.k].split(/[,;\n]/).map(x => x.trim()).filter(Boolean).slice(0, s.c); delete S[s.k]; } });
        if (typeof S.gratitude === 'string') S.gratitude = S.gratitude.split(/[,;\n]/).map(x => x.trim()).filter(Boolean).slice(0, 3);
        MethodKit.bindFields();
        $('mf-before').value = n(S.before, 5); $('mf-before-v').textContent = n(S.before, 5); $('mf-after').value = n(S.after, 4); $('mf-after-v').textContent = n(S.after, 4);
        $('mf-before').addEventListener('input', e => { S.before = n(e.target.value, 5); $('mf-before-v').textContent = S.before; MethodKit.save(); });
        $('mf-after').addEventListener('input', e => { S.after = n(e.target.value, 4); $('mf-after-v').textContent = S.after; MethodKit.save(); renderDelta(); });
        $('mf-start').addEventListener('click', startBreath); $('mf-stop').addEventListener('click', () => stopBreath(false));
        $('mf-save').addEventListener('click', saveSession); $('mf-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (timer && k !== 2) stopBreath(false);
            if (k === 1) renderMood();
            if (k === 2) renderPattern();
            if (k === 3) renderSenses();
            if (k === 4) renderBody();
            if (k === 5) { renderDelta(); renderGrat(); renderLog(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
