/* Therapieform-Finder · Kit-Oberfläche. Daten & Scoring kommen aus /js/therapy-form-finder.js (TherapyFormFinder). */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S, F, Q, T;

    const GROUPS = [
        { id: 'cbt', label: 'Behavioral', desc: 'Structured, exercise-based, well researched. Changes thinking and action in the here and now.', ids: ['cbt', 'dbt', 'act', 'schema', 'mbct', 'trauma-cbt', 'cbasp'], color: '#0ea5e9' },
        { id: 'psy', label: 'Psychodynamic', desc: 'Understand unconscious patterns, biography and relationship experiences – usually longer-term.', ids: ['psychoanalysis', 'mbt'], color: '#8b5cf6' },
        { id: 'hum', label: 'Humanistic & experiential', desc: 'Growth, meaning, feelings and experience are at the center. Less technique, more encounter.', ids: ['person-centered', 'gestalt', 'psychodrama', 'logotherapy'], color: '#10b981' },
        { id: 'sys', label: 'Systemic & interpersonal', desc: 'Relationships, roles and communication – alone, as a couple or family.', ids: ['systemic', 'ipt', 'couple-sexual'], color: '#f59e0b' },
        { id: 'spec', label: 'Specialized & focused', desc: 'Short or clearly defined approaches for specific concerns.', ids: ['sfbt', 'emdr', 'mi', 'hypnotherapy'], color: '#ec4899' }
    ];
    const CHECKLIST = [
        'Clarify funding – CH: prescription model (medical prescription for psychological psychotherapy, basic insurance) · DE: licensed practice seat, psychotherapy consultation hour, probatory sessions',
        'Find 2–3 professionals with a matching approach (CH: FSP, ASP, SBAP · DE: therapist search of the psychotherapist chambers or the KBV)',
        'Get in touch: your concern in two sentences, desired approach, availability, urgency',
        'Book first sessions – ideally with two people, to compare',
        'After the first session, note: Do I feel understood? Does the person explain their approach clearly? Is there chemistry?',
        'After 3–5 sessions, take stock deliberately – switching is allowed and normal'
    ];
    const GENERAL_Q = [
        'How do you work in practice – what does a typical session with you look like?',
        'What experience do you have with concerns like mine?',
        'How long does therapy typically last with you, and how do we know if it is working?',
        'What does a session cost, and how does billing work?'
    ];
    const FORM_Q = {
        cbt: 'How much practice and “homework” do you expect between sessions?',
        dbt: 'Is there skills training in a group in addition to individual therapy?',
        act: 'How do you work with values – and with thoughts I cannot let go of?',
        schema: 'How do we identify my schemas, and how long does that typically take?',
        mbct: 'How much daily mindfulness practice is part of it?',
        'trauma-cbt': 'How do you prepare for confronting distressing memories?',
        cbasp: 'How do you work with the therapeutic relationship in chronic depression?',
        psychoanalysis: 'How often per week, over what period – and how do you handle transference?',
        mbt: 'How do you foster mentalizing concretely in the session?',
        'person-centered': 'How much structure is there – and what if I get stuck in the conversation?',
        gestalt: 'What experiments or exercises do you use, and may I say no?',
        psychodrama: 'Do you work in a group or individually, and how does a constellation session go?',
        logotherapy: 'How do we work on questions of meaning without it staying abstract?',
        systemic: 'Do you involve family members – and if so, how?',
        ipt: 'Which relationship area would we focus on, and for how long?',
        'couple-sexual': 'How do you work when both partners have different motivation?',
        sfbt: 'How many sessions do you plan, and how does progress become visible?',
        emdr: 'How do you stabilize before we begin processing?',
        mi: 'How do you handle my ambivalence without pushing me?',
        hypnotherapy: 'How does a trance work, and do I stay in control?'
    };

    /* ---------- Scoring (nutzt die bestehende Logik) ---------- */
    function rankWith(answers) { F.answers = answers; return F.calculateRanking(); }
    function answeredCount() { return Q.filter(q => { const a = S.answers[q.id]; return Array.isArray(a) ? a.length > 0 : !!a; }).length; }
    function optionLabel(q, v) { const o = q.options.find(x => x.value === v); return o ? o.label : v; }
    function shortLabel(l) { return String(l).replace(/\s*\(.*?\)\s*/g, '').trim(); }
    const TOPIC = { symptoms: 'Concern', priorities: 'Important', 'therapy-style': 'Style', timeframe: 'Timeframe', 'focus-area': 'Focus', 'relationship-focus': 'Relationships', structure: 'Structure', 'emotions-work': 'Feelings', trauma: 'Trauma', evidence: 'Evidenz', 'body-awareness': 'Body', addiction: 'Addiction', mindfulness: 'Mindfulness', motivation: 'Motivation', chronic: 'History', 'therapy-format': 'Format', creativity: 'Creativity' };
    const reasonLabel = (q, v) => (TOPIC[q.id] ? TOPIC[q.id] + ': ' : '') + shortLabel(optionLabel(q, v));
    /* Beiträge: Score-Differenz, wenn eine Antwort(option) entfernt wird */
    function contributions() {
        const base = rankWith(S.answers); const baseScore = {}; base.forEach(t => baseScore[t.id] = t.score);
        const out = {}; T.forEach(t => out[t.id] = []);
        Q.forEach(q => {
            const a = S.answers[q.id]; if (!a || (Array.isArray(a) && !a.length)) return;
            const variants = Array.isArray(a) ? a.map(v => ({ v, answers: Object.assign({}, S.answers, { [q.id]: a.filter(x => x !== v) }) })) : [{ v: a, answers: Object.assign({}, S.answers, { [q.id]: null }) }];
            variants.forEach(({ v, answers }) => { const r = rankWith(answers); r.forEach(t => { const d = baseScore[t.id] - t.score; if (d > 0) out[t.id].push({ label: reasonLabel(q, v), d }); }); });
        });
        Object.keys(out).forEach(id => out[id].sort((a, b) => b.d - a.d));
        return { base, out };
    }

    /* ---------- Step 1 · Landkarte ---------- */
    function renderMap() {
        $('tff-map').innerHTML = GROUPS.map(g => `
            <div class="tff-group" style="--c:${g.color}">
                <div class="tff-group-head"><strong>${esc(g.label)}</strong><span class="mk-faint">${esc(g.desc)}</span></div>
                <div class="tff-group-items">${g.ids.map(id => { const t = T.find(x => x.id === id); if (!t) return ''; return `<details class="tff-form"><summary>${esc(t.shortName)}</summary><div class="tff-form-body"><div class="nm">${esc(t.name)}</div><p>${esc(t.description)}</p><div class="mk-chips">${(t.tags || []).map(x => `<span class="mk-chip">${esc(x)}</span>`).join('')}</div></div></details>`; }).join('')}</div>
            </div>`).join('');
    }

    /* ---------- Step 2 · Fragebogen ---------- */
    const CAT = { situation: 'Your situation', approach: 'Your working style', preferences: 'Your preferences', format: 'Setting' };
    function renderQuiz() {
        const i = Math.min(Math.max(0, S.qi | 0), Q.length - 1); S.qi = i;
        const q = Q[i]; const a = S.answers[q.id];
        const isMulti = q.type === 'multiple';
        const selected = (v) => isMulti ? Array.isArray(a) && a.includes(v) : a === v;
        const answered = isMulti ? Array.isArray(a) && a.length > 0 : !!a;
        const done = answeredCount();
        $('tff-quiz').innerHTML = `
            <div class="tff-qhead">
                <div><div class="mk-kicker">${esc(CAT[q.category] || 'Frage')} · ${i + 1} of ${Q.length}</div><h2>${esc(q.text)}</h2><p class="mk-sub" style="margin:4px 0 0">${isMulti ? 'Mehrfachauswahl möglich.' : 'Wähle eine Option – es geht automatisch weiter.'}</p></div>
                <div class="tff-qprog" title="${done} of ${Q.length} beantwortet"><span style="width:${(done / Q.length * 100).toFixed(0)}%"></span></div>
            </div>
            <div class="tff-options ${isMulti ? 'multi' : ''}">${q.options.map(o => `<button class="mk-option ${selected(o.value) ? 'selected' : ''}" data-v="${esc(o.value)}" role="${isMulti ? 'checkbox' : 'radio'}" aria-checked="${selected(o.value)}"><span class="chk"><i class="fas fa-check"></i></span><span class="t">${esc(o.label)}</span></button>`).join('')}</div>
            <div class="tff-qnav">
                <button class="mk-btn mk-btn-outline mk-btn-sm" id="tff-qprev" ${i === 0 ? 'disabled' : ''}><i class="fas fa-arrow-left"></i> Previous</button>
                <span class="mk-faint">${answered ? '' : (isMulti ? 'Nichts passend? Einfach weiter.' : 'Bitte eine Option wählen.')}</span>
                <button class="mk-btn ${answered || isMulti ? 'mk-btn-primary' : 'mk-btn-outline'} mk-btn-sm" id="tff-qnext" ${answered || isMulti ? '' : 'disabled'}>${i === Q.length - 1 ? 'Zum Ergebnis <i class="fas fa-arrow-right"></i>' : 'Nächste <i class="fas fa-arrow-right"></i>'}</button>
            </div>`;
        $('tff-quiz').querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => {
            const v = b.dataset.v;
            if (isMulti) { const cur = Array.isArray(a) ? a.slice() : []; S.answers[q.id] = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]; MethodKit.save(); renderQuiz(); }
            else { S.answers[q.id] = v; MethodKit.save(); renderQuiz(); setTimeout(() => advance(), 260); }
        }));
        $('tff-qprev').addEventListener('click', () => { S.qi = Math.max(0, i - 1); MethodKit.save(); renderQuiz(); scrollQuiz(); });
        $('tff-qnext').addEventListener('click', advance);
    }
    function advance() {
        if (S.qi >= Q.length - 1) { S.qi = Q.length - 1; MethodKit.save({ now: true }); MethodKit.goTo(3); MethodKit.toast('Questionnaire complete', 'success'); return; }
        S.qi++; MethodKit.save(); renderQuiz(); scrollQuiz();
    }
    function scrollQuiz() { const el = $('tff-quiz'); const top = el.getBoundingClientRect().top; if (top < 60) window.scrollTo({ top: window.scrollY + top - 80, behavior: 'smooth' }); }

    /* ---------- Step 3 · Ergebnis ---------- */
    function renderResult() {
        const done = answeredCount();
        if (done < 5) { $('tff-result').innerHTML = `<div class="mk-card"><div class="mk-empty">You have only answered ${done} of ${Q.length}  questions. For a reliable result you need at least 5 – better all of them.<br><br><button class="mk-btn mk-btn-primary" id="tff-goquiz"><i class="fas fa-arrow-left"></i> To the questionnaire</button></div></div>`; $('tff-goquiz').addEventListener('click', () => MethodKit.goTo(2)); return; }
        const { base, out } = contributions();
        const top = base.slice(0, 3); const max = Math.max(1, base[0].score);
        const grp = (id) => GROUPS.find(g => g.ids.includes(id));
        $('tff-result').innerHTML = `
            ${done < Q.length ? `<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>${Q.length - done} Fragen sind noch offen – das Ranking wird mit jeder Antwort genauer. <button class="mk-btn mk-btn-outline mk-btn-sm" id="tff-goquiz2" style="margin-left:6px">Weiter ausfüllen</button></span></div>` : ''}
            <div class="mk-card">
                <h2>Your three best matches</h2>
                <p class="mk-sub">Ranked by points from your answers. Below you see, <em>which</em> answers made the difference.</p>
                ${top.map((t, i) => { const g = grp(t.id); const reasons = out[t.id].slice(0, 4); return `
                <div class="tff-top ${i === 0 ? 'first' : ''}" style="--c:${g ? g.color : 'var(--mk-accent)'}">
                    <div class="tff-top-head"><span class="rk">${i + 1}</span><div><h3>${esc(t.name)}</h3><span class="mk-faint">${g ? esc(g.label) : ''} · ${t.matchPercentage}% Passung</span></div></div>
                    <div class="tff-bar"><i style="width:${(t.score / max * 100).toFixed(0)}%"></i></div>
                    <p>${esc(t.description)}</p>
                    ${reasons.length ? `<div class="mk-section-label">Why for you</div><ul class="tff-reasons">${reasons.map(r => `<li><i class="fas fa-check"></i>${esc(r.label)}</li>`).join('')}</ul>` : ''}
                    <div class="mk-chips">${(t.tags || []).map(x => `<span class="mk-chip">${esc(x)}</span>`).join('')}</div>
                </div>`; }).join('')}
            </div>
            <div class="mk-card">
                <h3>All 20 compared</h3>
                <div class="tff-all">${base.map((t, i) => { const g = grp(t.id); return `<div class="tff-all-row ${i < 3 ? 'top' : ''}"><span class="n">${i + 1}</span><span class="nm">${esc(t.shortName)}</span><span class="bar"><i style="width:${(t.score / max * 100).toFixed(0)}%; background:${g ? g.color : 'var(--mk-accent)'}"></i></span><span class="pct">${t.matchPercentage}%</span></div>`; }).join('')}</div>
            </div>
            <div class="mk-result"><h4>How to read this result</h4>If the first three are close, the method matters less than the person – go to first sessions with two different approaches. If one approach is clearly ahead, search for it specifically.</div>`;
        const b = $('tff-goquiz2'); if (b) b.addEventListener('click', () => MethodKit.goTo(2));
    }

    /* ---------- Step 4 · Next steps ---------- */
    function renderNext() {
        $('tff-checklist').innerHTML = CHECKLIST.map((c, i) => `<label class="tff-check ${S.checks[i] ? 'done' : ''}"><input type="checkbox" data-ck="${i}" ${S.checks[i] ? 'checked' : ''}><span>${esc(c)}</span></label>`).join('');
        $('tff-checklist').querySelectorAll('[data-ck]').forEach(cb => cb.addEventListener('change', () => { S.checks[+cb.dataset.ck] = cb.checked; MethodKit.save(); renderNext(); }));
        const base = answeredCount() ? rankWith(S.answers).slice(0, 3) : [];
        const sugg = [...GENERAL_Q, ...base.map(t => FORM_Q[t.id]).filter(Boolean)];
        $('tff-questions').innerHTML = `
            ${sugg.map(q => `<label class="tff-check small ${S.qpick.includes(q) ? 'done' : ''}"><input type="checkbox" data-qp="${esc(q)}" ${S.qpick.includes(q) ? 'checked' : ''}><span>${esc(q)}</span></label>`).join('')}
            ${S.ownq.map((q, i) => `<div class="mk-row"><span class="grow">${esc(q)}</span><button class="mk-iconbtn" data-rmq="${i}" aria-label="Delete"><i class="fas fa-times"></i></button></div>`).join('')}
            <div class="tff-add"><input class="mk-input" id="tff-q-add" placeholder="Own question …" maxlength="200"><button class="mk-btn mk-btn-outline" id="tff-q-addbtn"><i class="fas fa-plus"></i></button></div>`;
        $('tff-questions').querySelectorAll('[data-qp]').forEach(cb => cb.addEventListener('change', () => { const q = cb.dataset.qp; S.qpick = cb.checked ? [...S.qpick, q] : S.qpick.filter(x => x !== q); MethodKit.save(); renderNext(); }));
        $('tff-questions').querySelectorAll('[data-rmq]').forEach(b => b.addEventListener('click', () => { S.ownq.splice(+b.dataset.rmq, 1); MethodKit.save(); renderNext(); }));
        const add = () => { const v = $('tff-q-add').value.trim(); if (!v) return; S.ownq.push(v); MethodKit.save(); renderNext(); $('tff-q-add').focus(); };
        $('tff-q-addbtn').addEventListener('click', add);
        $('tff-q-add').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(); } });
    }

    /* ---------- Export ---------- */
    function exportAll() {
        const L = ['THERAPY FINDER', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'YOUR ANSWERS'];
        Q.forEach(q => { const a = S.answers[q.id]; if (!a || (Array.isArray(a) && !a.length)) return; L.push('- ' + q.text); (Array.isArray(a) ? a : [a]).forEach(v => L.push('    · ' + optionLabel(q, v))); });
        if (answeredCount() >= 5) {
            const { base, out } = contributions();
            L.push('', 'RANKING');
            base.forEach((t, i) => { L.push(`${i + 1}. ${t.name} – ${t.matchPercentage}%`); if (i < 3) { out[t.id].slice(0, 4).forEach(r => L.push('     + ' + r.label)); } });
        }
        L.push('', 'CHECKLIST'); CHECKLIST.forEach((c, i) => L.push(`[${S.checks[i] ? 'x' : ' '}] ${c}`));
        const qs = [...S.qpick, ...S.ownq]; if (qs.length) { L.push('', 'QUESTIONS FOR THE FIRST SESSION'); qs.forEach(q => L.push('- ' + q)); }
        if (S.notes) L.push('', 'NOTES', S.notes);
        L.push('', 'Note: orientation aid, not diagnostics.');
        MethodKit.exportText('therapieform-finder.txt', L.join('\n'));
    }

    /* ---------- Init ---------- */
    (async function () {
        if (typeof TherapyFormFinder === 'undefined') { document.querySelector('.mk-shell').insertAdjacentHTML('afterbegin', '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>The questions could not be loaded. Please reload the page.</span></div>'); return; }
        F = new TherapyFormFinder(); Q = F.questions; T = F.therapyForms;
        await MethodKit.init({
            method: 'therapy-form-finder',
            accent: '#0d9488', accent2: '#0ea5e9',
            steps: [{ icon: '🧭', label: 'Intro' }, { icon: '📝', label: 'Questionnaire' }, { icon: '🎯', label: 'outcome' }, { icon: '🚀', label: 'Next steps' }],
            defaultState: { answers: {}, qi: 0, checks: {}, qpick: [], ownq: [], notes: '' }
        });
        S = MethodKit.state;
        if (!S.answers || typeof S.answers !== 'object') S.answers = {};
        if (!S.checks || typeof S.checks !== 'object') S.checks = {};
        ['qpick', 'ownq'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        MethodKit.bindFields();
        renderMap();
        MethodKit.onStep = function (n) { if (n === 2) renderQuiz(); if (n === 3) renderResult(); if (n === 4) renderNext(); };
        MethodKit.onStep(MethodKit.step);
        $('tff-export').addEventListener('click', exportAll);
        $('tff-restart').addEventListener('click', () => { if (!confirm('Delete all answers and restart?')) return; S.answers = {}; S.qi = 0; MethodKit.save({ now: true }); MethodKit.goTo(2); });
    })();
})();
