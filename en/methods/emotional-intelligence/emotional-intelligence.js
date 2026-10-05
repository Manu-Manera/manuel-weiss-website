/* Emotional intelligence · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const DOM = {
        self: { label: 'Self-awareness', ic: '🪞', c: '#a855f7', lo: 'Feelings tend to show up as bodily symptoms or reactions before you can name them. This is the basis for everything else – starting here pays off the most.', mid: 'You usually recognise your feelings, but often with a delay. Goal: catch the moment they arise.', hi: 'You generally know what you feel and why. Make sure awareness doesn’t turn into rumination.', ex: [['Three check-ins', 'Three times a day (alarm) one question: "What am I feeling right now – and where in my body?" One word, one place.'], ['Trigger list', 'For one week, note every strong emotional moment: What happened before? After seven days, look for patterns.'], ['Emotional granularity', 'Instead of “good/bad”: a more precise word. Disappointed instead of bad, relieved instead of good.']] },
        reg: { label: 'Self-regulation', ic: '🧘', c: '#6366f1', lo: 'Feelings steer you more often than you steer them. Impulses shoot through, anger lingers. The good news: regulation is the most trainable field.', mid: 'You usually catch yourself, but it costs energy. Techniques for the first seconds help you the most.', hi: 'You stay capable of acting under pressure. Check whether you regulate feelings or just suppress them – there is a difference.', ex: [['The 6-second pause', 'On an impulse: exhale, count to six, then react. The amygdala peak lasts about that long.'], ['Name it to tame it', '"I notice I\'m getting angry." Out loud or inwardly. Naming measurably lowers activation (Lieberman).'], ['Reappraisal', 'When angry, ask: “What would be a benevolent explanation for this behaviour?” You don’t have to believe it – just check.']] },
        motiv: { label: 'Motivation', ic: '🔥', c: '#f59e0b', lo: 'Your drive tends to come from outside – pressure, deadlines, expectations. Without them it is hard to keep going.', mid: 'You can motivate yourself, but setbacks throw you back. The lever: make progress visible.', hi: 'You draw energy from the doing itself and keep going through setbacks. Watch your recovery – intrinsic motivation can lead to exhaustion.', ex: [['Progress journal', 'Every evening one sentence: "Today I made progress on …" Small wins are the strongest motivator (Amabile).'], ['Why chain', 'For a tedious task ask “What for?” three times until you land on something that matters to you.'], ['Setback ritual', 'After a failure: What do I learn? What was outside my control? What will I do differently tomorrow?']] },
        emp: { label: 'Empathy', ic: '💞', c: '#ec4899', lo: 'You often notice late how others are doing – or interpret it through your own lens. Listening without your own agenda is the exercise.', mid: 'You sense others, but not always reliably. Asking instead of assuming makes you more accurate.', hi: 'You read people well and they feel understood by you. Limit: empathy must not tip into taking on others’ feelings.', ex: [['Listening without answering', 'In one conversation per day: don’t answer, just summarise: “So you mean …” Only when the person nods, your own view.'], ['Perspective switch', 'When annoyed with someone: write their view in the first person, two sentences. What do they need?'], ['Reading body language', 'In a meeting, consciously observe one person: posture, facial expression, pace. What do they feel – and does it match what they say?']] },
        social: { label: 'Social skills', ic: '🤝', c: '#10b981', lo: 'Relationships cost you energy or you avoid difficult conversations. A clear conversation framework helps you.', mid: 'You get along with people, but conflicts or feedback feel bumpy. Practise on small situations.', hi: 'You move confidently among people, give and take feedback. Make sure relationships don’t stay purely functional.', ex: [['One uncomfortable conversation', 'Have one this week that you have been putting off. Preparation: observation – effect – wish (three sentences).'], ['Concrete appreciation', 'Every day, tell one person what exactly they did well – not “great”, but what and why.'], ['Nurturing your network', 'One message per week to someone you need nothing from. Just: “Thought of you because …”']] }
    };
    // Reihenfolge bleibt stabil: 0–14 sind die alten Items (Migration), 15–19 neu und invers kodiert
    const ITEMS = [
        { d: 'self', t: 'I quickly notice when my mood changes.' }, { d: 'self', t: 'I usually know exactly why I feel the way I feel.' }, { d: 'self', t: 'I know my emotional triggers well.' },
        { d: 'reg', t: 'Even under stress I remain able to act.' }, { d: 'reg', t: 'I can hold back impulsive reactions.' }, { d: 'reg', t: 'After getting angry I calm down relatively quickly.' },
        { d: 'motiv', t: 'I keep pursuing my goals even after setbacks.' }, { d: 'motiv', t: 'I can motivate myself without outside pressure.' }, { d: 'motiv', t: 'I tend to see opportunities rather than threats in problems.' },
        { d: 'emp', t: 'I sense how others are doing even when they say nothing.' }, { d: 'emp', t: 'I can easily put myself in other points of view.' }, { d: 'emp', t: 'Others feel understood by me.' },
        { d: 'social', t: 'I find it easy to get along with different kinds of people.' }, { d: 'social', t: 'I can address conflicts without hurting anyone.' }, { d: 'social', t: 'I actively build and maintain relationships.' },
        { d: 'self', t: 'I often only realise afterwards that I was angry or hurt.', r: true }, { d: 'reg', t: 'When something annoys me, I say things I later regret.', r: true }, { d: 'motiv', t: 'Without outside pressure I rarely stick with something.', r: true }, { d: 'emp', t: 'I am told that I don’t really listen.', r: true }, { d: 'social', t: 'I put off difficult conversations as long as I can.', r: true }
    ];
    const ORDER = [0, 3, 9, 6, 12, 15, 1, 4, 10, 7, 13, 16, 2, 5, 11, 8, 14, 17, 18, 19];
    const SITS = [
        { t: 'In a meeting a colleague criticises you in front of everyone – unfairly, you think. Your pulse rises.', o: [['I counter immediately and make clear that he is wrong.', 'reg', 0, 'The impulse wins. Maybe you are right – but in front of everyone this escalates. What if you breathed first?'], ['I say nothing but am annoyed for the rest of the day.', 'reg', 1, 'You hold back – good – but the anger remains unprocessed. Regulation doesn’t mean swallowing it, but choosing the right moment.'], ['I take a breath, say: “I see that differently – let’s clarify it after the meeting”, and then actually do it.', 'reg', 2, 'Impulse stopped, boundary set, clarification planned. That is self-regulation in everyday life.'], ['I ask him what exactly bothers him – maybe he has a point.', 'emp', 2, 'Strong: you step into his perspective before defending yourself. Just make sure you don’t lose your own standpoint.']] },
        { t: 'A friend tells you she has lost her job. She seems composed.', o: [['I say it was surely for the best and she will quickly find something new.', 'emp', 0, 'Well meant, but you skip over her feeling. “Seeming composed” is not “being composed”.'], ['I tell her how I felt back then in a similar situation.', 'emp', 1, 'You seek closeness through your story – understandable, but right now it is about her. Her space first, then yours.'], ['I ask: “How are you really doing with this?” and hold the silence.', 'emp', 2, 'You give her the chance to go behind the facade. Holding silence is empathy in its purest form.'], ['I immediately offer to revise her CV.', 'social', 1, 'Helpful and action-oriented. But solution before feeling can come across as brushing off. Ask first what she needs.']] },
        { t: 'You resolved to exercise three times a week. It is the third week and you went once.', o: [['I give up the goal – apparently I’m not the type for it.', 'motiv', 0, 'A setback becomes a verdict about you. That is the most common reason why plans die – not the setback itself.'], ['I am annoyed with myself and resolve to go five times next week.', 'motiv', 1, 'Drive through self-reproach rarely lasts longer than two days. And five times after once is a setup for failure.'], ['I ask myself what got in the way and make the goal smaller: twice, fixed appointments.', 'motiv', 2, 'You analyse instead of judging and adjust the system. That is exactly how motivation stays stable.'], ['I find someone to make appointments with.', 'social', 2, 'Social commitment is one of the strongest motivators. Smart move – even better combined with a smaller goal.']] },
        { t: 'While reading an email you suddenly feel a lump in your throat and pressure in your chest.', o: [['I keep reading – it will pass.', 'self', 0, 'The signal is skipped. The body reports a feeling before the head has it. Whoever ignores that loses the information.'], ['I notice: something is there. I put the phone down briefly and ask myself what exactly hit me.', 'self', 2, 'You take the body signal seriously and translate it. That is self-awareness – the beginning of all regulation.'], ['I reply immediately so it’s done.', 'reg', 0, 'Acting under activation – the reply will probably turn out differently from the one you would write in an hour.'], ['I write down: “pressure in the chest, after sentence 3”. Later I look at what that was.', 'self', 1, 'You document – good. Even better: feel into it right away while the feeling is fresh.']] }
    ];
    const FEEL = {
        'Joy': ['content', 'relieved', 'proud', 'grateful', 'enthusiastic', 'calm', 'connected', 'curious', 'inspired', 'hopeful'],
        'Anger': ['irritated', 'frustrated', 'angry', 'outraged', 'impatient', 'bitter', 'annoyed', 'jealous'],
        'Fear': ['nervous', 'insecure', 'worried', 'overwhelmed', 'tense', 'panicky', 'suspicious', 'helpless'],
        'Sadness': ['disappointed', 'lonely', 'exhausted', 'dejected', 'hurt', 'empty', 'longing', 'ashamed'],
        'Surprise': ['confused', 'stunned', 'puzzled', 'fascinated']
    };
    const LINKS = [
        { m: 'Stress compass', l: '../stress-management/stress-management.html', why: 'Deepen regulation under pressure.' },
        { m: 'Four sides of a message', l: '../communication/communication.html', why: 'Apply empathy in conversation.' },
        { m: 'Mindfulness', l: '../mindfulness/mindfulness.html', why: 'Practise perception without judgement.' },
        { m: 'Johari window', l: '../johari-window/johari-window.html', why: 'How others experience you emotionally.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const val = (i) => { const a = n(S.answers[i], 0); if (!a) return 0; return ITEMS[i].r ? 6 - a : a; };
    const answered = () => ITEMS.filter((_, i) => n(S.answers[i], 0)).length;
    function scores() { const out = {}; Object.keys(DOM).forEach(d => { const idx = ITEMS.map((it, i) => it.d === d ? i : -1).filter(i => i >= 0 && val(i)); out[d] = idx.length ? Math.round(idx.reduce((a, i) => a + val(i), 0) / idx.length / 5 * 100) : 0; }); return out; }
    const level = (p) => p < 50 ? 'lo' : p < 75 ? 'mid' : 'hi';
    function consistency() { // Differenz zwischen direkten und inversen Items je Bereich
        const flags = []; Object.keys(DOM).forEach(d => { const dir = ITEMS.map((it, i) => (it.d === d && !it.r) ? i : -1).filter(i => i >= 0 && val(i)); const rev = ITEMS.map((it, i) => (it.d === d && it.r) ? i : -1).filter(i => i >= 0 && val(i)); if (dir.length && rev.length) { const a = dir.reduce((x, i) => x + val(i), 0) / dir.length, b = rev.reduce((x, i) => x + val(i), 0) / rev.length; if (Math.abs(a - b) >= 2) flags.push({ d, a, b }); } }); return flags;
    }

    /* ---------- 1 ---------- */
    function renderItems() {
        $('ei-items').innerHTML = ORDER.map((i, k) => { const it = ITEMS[i]; return `<div class="ei-item ${n(S.answers[i], 0) ? 'done' : ''}"><div class="ei-item-t"><span class="ei-num">${k + 1}</span>${it.t}</div><div class="ei-scale">${[1, 2, 3, 4, 5].map(v => `<button class="${n(S.answers[i], 0) === v ? 'sel' : ''}" data-i="${i}" data-v="${v}" aria-label="${v}">${v}</button>`).join('')}</div></div>`; }).join('');
        $('ei-items').querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => { S.answers[b.dataset.i] = +b.dataset.v; MethodKit.save(); renderItems(); const nx = $('ei-items').querySelector('.ei-item:not(.done)'); if (nx && answered() < ITEMS.length) nx.scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
        $('ei-progress').textContent = answered();
    }

    /* ---------- 2 ---------- */
    function radar(sc) {
        const ks = Object.keys(DOM), cx = 110, cy = 110, R = 80, N = ks.length;
        const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
        const rings = [25, 50, 75, 100].map(p => `<polygon points="${ks.map((_, i) => pt(i, R * p / 100).join(',')).join(' ')}" fill="none" stroke="var(--mk-line)" stroke-width="1"/>`).join('');
        const poly = ks.map((k, i) => pt(i, R * sc[k] / 100).join(',')).join(' ');
        const labels = ks.map((k, i) => { const [x, y] = pt(i, R + 18); return `<text x="${x}" y="${y}" font-size="16" text-anchor="middle" dominant-baseline="middle">${DOM[k].ic}</text>`; }).join('');
        return `<svg viewBox="0 0 220 220" class="ei-radar">${rings}<polygon points="${poly}" fill="var(--mk-accent-soft)" stroke="var(--mk-accent)" stroke-width="2.5" stroke-linejoin="round"/>${ks.map((k, i) => { const [x, y] = pt(i, R * sc[k] / 100); return `<circle cx="${x}" cy="${y}" r="4" fill="${DOM[k].c}"/>`; }).join('')}${labels}</svg>`;
    }
    function renderResults() {
        if (answered() < 10) { $('ei-results').innerHTML = note('info', `Only ${answered()}/20 answered. For a reliable profile you need all of them.`); return; }
        const sc = scores(); const sorted = Object.keys(DOM).sort((a, b) => sc[b] - sc[a]); const best = sorted[0], weak = sorted[sorted.length - 1];
        const allHi = Object.values(sc).every(v => v >= 85), allMid = Object.values(sc).every(v => v >= 55 && v <= 70), spread = sc[best] - sc[weak];
        const cons = consistency();
        $('ei-results').innerHTML = `<div class="ei-prof">${radar(sc)}<div class="ei-bars">${sorted.map(d => `<div class="ei-bar ${d === weak ? 'weak' : ''}" style="--c:${DOM[d].c}"><div class="ei-bar-h"><span>${DOM[d].ic} ${DOM[d].label}</span><b>${sc[d]}%</b></div><div class="ei-bar-t"><i style="width:${sc[d]}%"></i></div><small>${DOM[d][level(sc[d])]}</small></div>`).join('')}</div></div>` +
            (cons.length ? note('warn', `<strong>Check answer pattern:</strong> Bei ${cons.map(f => DOM[f.d].label).join(' und ')} your direct and reversed statements clearly contradict each other. Usually this means: the self-image is more positive than the behaviour. Look at step 3 to see what you actually do in situations.`) : '') +
            (allHi ? note('info', 'Everywhere above 85 %. Either you are exceptional – or the assessment is kinder than reality. Ask two people who know you for their assessment.') : '') +
            (allMid ? note('info', 'Everything in the middle. That may be true – or you chose a lot of “3”. Go through again and decide on a direction for every statement.') : '') +
            (!allHi && !allMid && spread >= 25 ? note('ok', `Clear profile: <strong>${DOM[best].label}</strong> carries you (${sc[best]} %), <strong>${DOM[weak].label}</strong> is the development field (${sc[weak]} %). Goleman: the areas build on each other – self-awareness first, then regulation, then the rest.`) : '') +
            (!allHi && !allMid && spread < 25 ? note('ok', `Balanced profile (${sc[weak]}–${sc[best]} %). Your development field is ${DOM[weak].label} – by a small margin.`) : '') +
            (weak !== 'self' && sc.self < 70 ? note('info', `Self-awareness is at ${sc.self} %. It is the foundation: whoever doesn’t notice what they feel cannot steer it. Consider starting there, even if ${DOM[weak].label} is lower.`) : '');
    }

    /* ---------- 3 ---------- */
    function renderSits() {
        $('ei-sits').innerHTML = SITS.map((s, si) => { const ch = S.sits[si]; return `<div class="ei-sit"><div class="ei-sit-t"><span class="ei-num">${si + 1}</span>${s.t}</div><div class="ei-opts">${s.o.map((o, oi) => `<button class="mk-option ${ch === oi ? 'selected' : ''} ${ch !== undefined && ch !== oi ? 'dim' : ''}" data-s="${si}" data-o="${oi}"><span class="t">${o[0]}</span>${ch === oi ? `<span class="d ei-fb ${o[2] === 2 ? 'ok' : o[2] === 1 ? 'mid' : 'low'}">${DOM[o[1]].ic} ${DOM[o[1]].label} · ${o[3]}</span>` : ''}</button>`).join('')}</div></div>`; }).join('') + sitNote();
        $('ei-sits').querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { S.sits[b.dataset.s] = +b.dataset.o; MethodKit.save(); renderSits(); }));
    }
    function sitNote() {
        const done = Object.keys(S.sits).length; if (done < SITS.length) return note('info', `${done}/${SITS.length} situations. Choose honestly – the value lies in comparing with your profile.`);
        const pts = SITS.reduce((a, s, i) => a + s.o[S.sits[i]][2], 0);
        const sc = answered() >= 10 ? scores() : null;
        const lowDom = SITS.map((s, i) => s.o[S.sits[i]]).filter(o => o[2] === 0).map(o => o[1]);
        let m = pts >= 7 ? `${pts}/8 points – your reactions are emotionally smart.` : pts >= 4 ? `${pts}/8 points – partly reflex, partly reflection.` : `${pts}/8 points – in situations the impulse often wins.`;
        if (sc && lowDom.length) { const mism = lowDom.filter(d => sc[d] >= 75); if (mism.length) m += ` Striking: at <strong>${[...new Set(mism)].map(d => DOM[d].label).join(', ')}</strong> you rated yourself high, but react impulsively in the situation. Exactly this gap between self-image and behaviour is your training field.`; }
        return note(pts >= 7 ? 'ok' : 'info', m);
    }

    /* ---------- 4 ---------- */
    function renderDiary() {
        const D = S.diary.slice().reverse().slice(0, 8);
        const words = new Set(S.diary.map(e => e.word)); const fams = new Set(S.diary.map(e => e.fam));
        $('ei-diary').innerHTML = `<div class="ei-feel">${Object.entries(FEEL).map(([fam, ws]) => `<div class="ei-fam"><b>${fam}</b><div class="mk-chips">${ws.map(w => `<button class="mk-chip ${S.draft.word === w ? 'selected' : ''}" data-w="${w}" data-fam="${fam}">${w}</button>`).join('')}</div></div>`).join('')}</div>` +
            `<div class="mk-grid-2" style="margin-top:10px"><div class="mk-field"><label>Trigger – what just happened?</label><input class="mk-input" id="ei-trig" value="${esc(S.draft.trigger || '')}" placeholder="e.g. email from the boss without greeting"></div><div class="mk-field"><label>Where in the body?</label><input class="mk-input" id="ei-body" value="${esc(S.draft.body || '')}" placeholder="e.g. tightness in the throat, heat in the face"></div></div><div class="mk-field"><label>Intensity <span class="mk-range-val" id="ei-intval">${n(S.draft.int, 5)}</span>/10</label><input type="range" class="mk-range" id="ei-int" min="1" max="10" value="${n(S.draft.int, 5)}"></div><button class="mk-btn mk-btn-primary" id="ei-save" ${S.draft.word ? '' : 'disabled'}><i class="fas fa-plus"></i> Enter</button>` +
            (S.diary.length ? `<div class="mk-section-label" style="margin-top:16px">Your entries (${S.diary.length}) · ${words.size} different words · ${fams.size}/5 families</div>${diaryNote(words, fams)}<div class="ei-log">${D.map(e => `<div class="ei-log-e"><span class="ei-log-w" style="--c:${famColor(e.fam)}">${e.word}</span><span class="ei-log-i">${e.int}/10</span><span class="ei-log-t">${esc(e.trigger || '')}${e.body ? ` · <i>${esc(e.body)}</i>` : ''}</span><small>${new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' })}</small></div>`).join('')}</div>` : note('info', 'No entries yet. What do you feel right now – find the most precise word.'));
        const host = $('ei-diary');
        host.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { S.draft.word = S.draft.word === b.dataset.w ? '' : b.dataset.w; S.draft.fam = b.dataset.fam; MethodKit.save(); renderDiary(); }));
        $('ei-trig').addEventListener('input', e => { S.draft.trigger = e.target.value; MethodKit.save(); });
        $('ei-body').addEventListener('input', e => { S.draft.body = e.target.value; MethodKit.save(); });
        $('ei-int').addEventListener('input', e => { S.draft.int = +e.target.value; $('ei-intval').textContent = e.target.value; MethodKit.save(); });
        $('ei-save').addEventListener('click', () => { if (!S.draft.word) return; S.diary.push({ date: Date.now(), word: S.draft.word, fam: S.draft.fam, trigger: S.draft.trigger || '', body: S.draft.body || '', int: n(S.draft.int, 5) }); S.draft = { word: '', fam: '', trigger: '', body: '', int: 5 }; MethodKit.save({ now: true }); MethodKit.toast('Entered', 'ok'); renderDiary(); });
    }
    const famColor = (f) => ({ 'Joy': '#10b981', 'Anger': '#ef4444', 'Fear': '#f59e0b', 'Sadness': '#6366f1', 'Surprise': '#a855f7' })[f] || '#94a3b8';
    function diaryNote(words, fams) {
        const N = S.diary.length; if (N < 3) return '';
        const neg = S.diary.filter(e => e.fam !== 'Joy').length / N, noBody = S.diary.filter(e => !e.body).length / N;
        if (words.size <= 2 && N >= 4) return note('info', `${N} entries, but only ${words.size === 1 ? 'a single word' : words.size + ' different words'}. Granularity is the lever: the finer you differentiate (irritated ≠ frustrated ≠ angry), the more precisely you can react.`);
        if (fams.size === 1 && N >= 4) return note('info', `All entries from one family (${[...fams][0]}). Either a lot is going on right now – or the other feelings are quieter and you overlook them. Enter the inconspicuous ones too.`);
        if (noBody > 0.6) return note('info', 'Most entries are missing the body. Feelings are physical first – whoever knows the place recognises them earlier.');
        if (neg >= 0.85 && N >= 5) return note('info', `${Math.round(neg * 100)} % unpleasant feelings. Normal for a diary – we note what bothers us. But: consciously enter one pleasant moment per day too, otherwise the picture gets distorted.`);
        return note('ok', `${words.size} different feeling words in ${fams.size} families – good granularity. Keep going: one entry per day is enough.`);
    }

    /* ---------- 5 ---------- */
    function renderTrain() {
        if (answered() < 10) { $('ei-train').innerHTML = note('info', 'Answer the self-assessment first.'); return; }
        const sc = scores(); const sorted = Object.keys(DOM).sort((a, b) => sc[a] - sc[b]);
        const focus = S.focus && DOM[S.focus] ? S.focus : (sc.self < 70 && sorted[0] !== 'self' && sc.self - sc[sorted[0]] < 15 ? 'self' : sorted[0]);
        const d = DOM[focus], T = S.train || {};
        $('ei-train').innerHTML = `<div class="mk-field"><label>Your training field</label><div class="mk-chips">${sorted.map(k => `<button class="mk-chip ${k === focus ? 'selected' : ''}" data-focus="${k}">${DOM[k].ic} ${DOM[k].label} · ${sc[k]} %</button>`).join('')}</div></div>` +
            `<div class="ei-train-h" style="--c:${d.c}"><span>${d.ic}</span><div><b>${d.label}</b><small>${d[level(sc[focus])]}</small></div></div><div class="mk-section-label">Choose one exercise for the next 14 days</div><div class="ei-ex">${d.ex.map((e, i) => `<button class="mk-option ${T.ex === i ? 'selected' : ''}" data-ex="${i}"><span class="t">${e[0]}</span><span class="d">${e[1]}</span></button>`).join('')}</div>` +
            `<div class="mk-grid-2" style="margin-top:10px"><div class="mk-field"><label>When exactly? (trigger in everyday life)</label><input class="mk-input" id="ei-when" value="${esc(T.when || '')}" placeholder="e.g. after every meeting / while brushing teeth"></div><div class="mk-field"><label>How will I notice a difference after 14 days?</label><input class="mk-input" id="ei-sign" value="${esc(T.sign || '')}" placeholder="e.g. I managed the pause three times before answering"></div></div>` + trainNote(T, d) +
            `<div class="mk-result" style="margin-top:14px"><h4>Your EQ profile</h4><div class="ei-sum">${Object.keys(DOM).sort((a, b) => sc[b] - sc[a]).map(k => `<span style="--c:${DOM[k].c}">${DOM[k].ic} ${DOM[k].label} <b>${sc[k]} %</b></span>`).join('')}</div>${Object.keys(S.sits).length === SITS.length ? `<div class="mk-faint" style="font-size:13px; margin-top:6px">Situationstest: ${SITS.reduce((a, s, i) => a + s.o[S.sits[i]][2], 0)}/8</div>` : ''}${S.diary.length ? `<div class="mk-faint" style="font-size:13px">Gefühlstagebuch: ${S.diary.length} Einträge · ${new Set(S.diary.map(e => e.word)).size} Wörter</div>` : ''}${T.ex !== undefined ? `<div style="margin-top:6px"><b>Training:</b> ${d.ex[T.ex][0]}${T.when ? ` – ${esc(T.when)}` : ''}</div>` : ''}</div>`;
        const host = $('ei-train');
        host.querySelectorAll('[data-focus]').forEach(b => b.addEventListener('click', () => { S.focus = b.dataset.focus; S.train = {}; MethodKit.save(); renderTrain(); }));
        host.querySelectorAll('[data-ex]').forEach(b => b.addEventListener('click', () => { S.train = S.train || {}; S.train.ex = +b.dataset.ex; MethodKit.save(); renderTrain(); }));
        $('ei-when').addEventListener('input', e => { S.train = S.train || {}; S.train.when = e.target.value; MethodKit.save(); }); $('ei-when').addEventListener('change', renderTrain);
        $('ei-sign').addEventListener('input', e => { S.train = S.train || {}; S.train.sign = e.target.value; MethodKit.save(); }); $('ei-sign').addEventListener('change', renderTrain);
    }
    function trainNote(T, d) {
        if (T.ex === undefined) return note('info', 'One exercise, not three. EQ grows through repetition in real situations – not through knowledge.');
        if (!(T.when || '').trim()) return note('info', 'Tie the exercise to a fixed moment – otherwise you will forget it on day two.');
        if (!(T.sign || '').trim()) return note('info', 'How will you recognise that it works? An observable sign, not a mood.');
        return note('ok', `14 days ${d.ex[T.ex][0]} – ${esc(T.when)}. Then repeat the test and compare.`);
    }
    function renderLinks() { $('ei-links').innerHTML = LINKS.map(x => `<a class="mk-option ei-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const sc = scores(); const L = ['EQ PROFILE', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), ''];
        Object.keys(DOM).sort((a, b) => sc[b] - sc[a]).forEach(d => L.push(`${DOM[d].ic} ${DOM[d].label}: ${sc[d]} % – ${DOM[d][level(sc[d])]}`));
        const cons = consistency(); if (cons.length) L.push('', 'Consistency note: ' + cons.map(f => DOM[f.d].label).join(', '));
        if (Object.keys(S.sits).length) { L.push('', 'SITUATIONS'); SITS.forEach((s, i) => { if (S.sits[i] !== undefined) L.push(`  ${i + 1}. ${s.o[S.sits[i]][0]} (${s.o[S.sits[i]][2]}/2)`); }); }
        if (S.diary.length) { L.push('', 'FEELINGS DIARY'); S.diary.forEach(e => L.push(`  ${new Date(e.date).toLocaleDateString('de-CH')} – ${e.word} (${e.int}/10)${e.trigger ? `: ${e.trigger}` : ''}${e.body ? ` [${e.body}]` : ''}`)); }
        const T = S.train || {}; if (S.focus && T.ex !== undefined) L.push('', 'TRAINING', `${DOM[S.focus].label}: ${DOM[S.focus].ex[T.ex][0]}`, DOM[S.focus].ex[T.ex][1], T.when ? `When: ${T.when}` : '', T.sign ? `Sign: ${T.sign}` : '');
        MethodKit.exportText('eq-profil.txt', L.filter(x => x !== undefined).join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'emotional-intelligence', accent: '#a855f7', accent2: '#ec4899',
            steps: [{ icon: '📝', label: 'Test' }, { icon: '📊', label: 'Profile' }, { icon: '🎭', label: 'Situations' }, { icon: '📓', label: 'Diary' }, { icon: '🏋️', label: 'Training' }],
            defaultState: { answers: {}, sits: {}, diary: [], draft: { word: '', fam: '', trigger: '', body: '', int: 5 }, focus: '', train: {} }
        });
        S = MethodKit.state;
        ['answers', 'sits', 'train'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        if (!Array.isArray(S.diary)) S.diary = []; if (!S.draft || typeof S.draft !== 'object') S.draft = { word: '', fam: '', trigger: '', body: '', int: 5 };
        $('ei-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) renderItems();
            if (k === 2) renderResults();
            if (k === 3) renderSits();
            if (k === 4) renderDiary();
            if (k === 5) { renderTrain(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
