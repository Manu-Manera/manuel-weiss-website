/* Stages of change (Prochaska) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const PH = [
        { id: 'pre', ic: '😶', t: 'Precontemplation', sub: 'Not an issue', c: '#94a3b8', d: 'You don’t (yet) see a problem – or you have given up. Others may see it more clearly than you.', trap: 'Letting yourself be talked into it or driving yourself with pressure. Pressure creates resistance.', task: 'Don’t act – look. Gather information without deciding. What does the behavior really cost you? What do people you trust say?', q: ['I don’t really see a problem – others make more of it than it is', 'I have no intention of changing anything in the next six months'] },
        { id: 'con', ic: '🤔', t: 'Contemplation', sub: 'I’m considering', c: '#f59e0b', d: 'You know something should be different – and you swing between wanting and not wanting. This stage can last for years.', trap: 'Endless weighing (“chronic contemplation”). Or: rushing in too early and dropping everything at the first setback.', task: 'Let the decision ripen – with a system. Use the scale: what speaks for it, what against? What do you gain, what do you lose? Only move on once the pros honestly outweigh the cons.', q: ['I am seriously thinking about changing something – but I am torn', 'I see the downsides of my behavior, but I don’t have a plan yet'] },
        { id: 'prep', ic: '📋', t: 'Preparation', sub: 'I’m planning', c: '#0ea5e9', d: 'The decision is made. You want to start within the next weeks and may already have taken small steps.', trap: 'Planning too long so you don’t have to start. Or starting with no plan and going under.', task: 'Make a concrete plan: what exactly, from when, how often? Which hurdles will come – and what do you do then? Who knows about it? A start date in the next 14 days.', q: ['I have decided and want to start within the next month', 'I have already taken first small steps or planned concretely'] },
        { id: 'act', ic: '🏃', t: 'Action', sub: 'I’m doing it', c: '#22c55e', d: 'You have started and are visibly changing your behavior – for less than six months. This is the hardest stage.', trap: 'Wanting everything at once. Reading setbacks as failure. Building in no reward.', task: 'Make sticking easy: adapt the environment, remove triggers, make progress visible, small rewards. Use support actively. If-then plans for hard situations.', q: ['I have concretely changed something in the last six months and I am sticking with it', 'It still takes effort, but I am on it'] },
        { id: 'main', ic: '🌳', t: 'Maintenance', sub: 'I’m sticking with it', c: '#10b981', d: 'The new behavior has been running for over six months. It is slowly becoming a habit – but relapses are still possible.', trap: 'Getting careless (“I’ve already made it”). Underestimating risk situations.', task: 'Secure the new: keep routines, know relapse triggers, adjust identity (“I am someone who …”). And: support others – that strengthens you too.', q: ['The new behavior has been running for more than six months', 'It already feels almost normal, even if I still have to watch it'] }
    ];
    const RISKS = ['Stress / overload', 'Tiredness', 'Social situations', 'Boredom', 'Being alone', 'Wanting to celebrate success', 'Negative feelings', 'Old environment / old friends', 'Travel / broken routine', 'Illness'];
    const LINKS = [
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'For action & maintenance.' },
        { m: 'Rubicon model', l: '../rubikon-model/rubikon-model.html', why: 'From wishing to wanting – the step across the river.' },
        { m: 'Well-formed outcome (NLP)', l: '../nlp-meta-goal/nlp-meta-goal.html', why: 'Phrase the goal precisely.' },
        { m: 'Solution-focused', l: '../solution-focused/solution-focused.html', why: 'What already works? More of that.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const scores = () => PH.map(p => p.q.reduce((a, _, i) => a + n(S.quiz[`${p.id}${i}`], 0), 0));
    const quizDone = () => PH.every(p => p.q.every((_, i) => S.quiz[`${p.id}${i}`]));
    const suggested = () => { if (!quizDone()) return ''; const sc = scores(); let best = 0; sc.forEach((v, i) => { if (v >= sc[best]) best = i; }); return PH[best].id; };
    const cur = () => PH.find(p => p.id === (S.stage || suggested())) || null;
    const idx = (id) => PH.findIndex(p => p.id === id);

    /* ---------- 1 ---------- */
    function renderIC() {
        const i = n(S.importance, 5), c = n(S.confidence, 5);
        $('cs-ic-note').innerHTML = i <= 4 ? note('info', 'Low importance – then the question is less “how” and more “whether at all”. That is a sign of precontemplation or contemplation.') : i >= 7 && c <= 4 ? note('warn', 'Important, but little confidence – the classic pattern where good intentions fail. Your focus: smaller steps and quick wins, not more motivation.') : i >= 7 && c >= 7 ? note('ok', 'Important and confident – good conditions. If you haven’t started yet: what is holding you?') : c >= 7 && i <= 5 ? note('info', 'You could – but it doesn’t matter that much to you. Maybe it isn’t your goal, but someone else’s?') : '';
    }

    /* ---------- 2 ---------- */
    function renderQuiz() {
        const items = []; PH.forEach(p => p.q.forEach((q, i) => items.push({ k: `${p.id}${i}`, q })));
        const order = S.quizOrder && S.quizOrder.length === items.length ? S.quizOrder : (S.quizOrder = items.map(x => x.k).sort(() => Math.random() - .5));
        $('cs-quiz').innerHTML = order.map((k, j) => { const it = items.find(x => x.k === k); return `<div class="cs-q"><div class="cs-q-t"><span>${j + 1}</span> ${it.q}</div><div class="cs-q-opts">${[['1', 'Trifft nicht zu'], ['2', 'Eher nicht'], ['3', 'Teils'], ['4', 'Eher ja'], ['5', 'Trifft voll zu']].map(([v, l]) => `<button class="${n(S.quiz[k], 0) === +v ? 'on' : ''}" data-q="${k}" data-v="${v}">${l}</button>`).join('')}</div></div>`; }).join('') +
            (quizDone() ? note('ok', `All ${items.length} statements rated. Your stage: <strong>${PH.find(p => p.id === suggested()).t}</strong>. Continue to step 3.`) : `<div class="mk-faint" style="text-align:center">${Object.keys(S.quiz).filter(k => S.quiz[k]).length}/${items.length} rated</div>`);
        $('cs-quiz').querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { S.quiz[b.dataset.q] = +b.dataset.v; MethodKit.save(); renderQuiz(); }));
    }

    /* ---------- 3 ---------- */
    function renderStairs() {
        const c = cur(); const sc = scores(); const max = Math.max(1, ...sc); const sg = suggested();
        $('cs-stairs').innerHTML = `<div class="cs-stairs">${PH.map((p, i) => `<button class="cs-stair ${c && c.id === p.id ? 'on' : ''} ${sg === p.id && c && c.id !== sg ? 'sugg' : ''}" style="--c:${p.c};--i:${i}" data-ph="${p.id}"><span class="ic">${p.ic}</span><b>${p.t}</b><small>${p.sub}</small>${quizDone() ? `<div class="cs-score"><i style="width:${Math.round(sc[i] / max * 100)}%"></i></div>` : ''}</button>`).join('')}</div>` +
            (!quizDone() && !S.stage ? note('info', 'The quiz is not complete yet. You can also pick the stage here directly.') : '') +
            (sg && S.stage && S.stage !== sg ? note('info', `The quiz points to <strong>${PH.find(p => p.id === sg).t}</strong>, you chose <strong>${c.t}</strong> gewählt. ${idx(S.stage) > idx(sg) ? 'Vorsicht: Wer sich eine Phase zu weit vorne sieht, überspringt den Schritt, der gerade dran wäre.' : 'Du siehst dich weiter hinten als das Quiz – das ist oft ehrlich. Gut.'}`) : '');
        $('cs-stairs').querySelectorAll('[data-ph]').forEach(b => b.addEventListener('click', () => { S.stage = b.dataset.ph; MethodKit.save(); renderStairs(); renderPhase(); }));
    }
    function renderPhase() {
        const c = cur(); if (!c) { $('cs-phase').innerHTML = ''; return; }
        const i = n(S.importance, 5), cf = n(S.confidence, 5);
        $('cs-phase').innerHTML = `<div class="cs-phase" style="--c:${c.c}"><div class="cs-phase-ic">${c.ic}</div><div><div class="mk-section-label" style="color:${c.c}">Stage ${idx(c.id) + 1} of 5</div><h3>${c.t}</h3><p>${c.d}</p><div class="cs-trap"><b>Typical trap</b>${c.trap}</div></div></div>` +
            (c.id === 'pre' && i >= 7 ? note('info', 'You say the change is important to you (' + i + '/10) – and you are still at “not an issue”? Maybe you are further than the quiz shows. Or you have given up. Both deserve a second look.') : '') +
            (c.id === 'act' && cf <= 4 ? note('warn', 'You are acting, but with little confidence (' + cf + '/10). That is the relapse zone. Step 5 is especially important for you.') : '') +
            ((c.id === 'con' || c.id === 'prep') && (S.log || []).some(e => e.stage === 'act' || e.stage === 'main') ? note('info', 'According to your history you were further along once. A relapse is not a restart – you already know a lot that was unclear the first time.') : '');
    }

    /* ---------- 4 ---------- */
    function renderTask() {
        const c = cur(); if (!c) { $('cs-task').innerHTML = note('info', 'Please determine the stage in step 3 first.'); return; }
        $('cs-task').innerHTML = `<div class="mk-section-label" style="color:${c.c}">${c.ic} ${c.t}</div><div class="cs-task" style="--c:${c.c}"><b>Your job in this stage</b><p>${c.task}</p></div>` +
            (c.id === 'pre' ? note('info', 'No “next step” in the sense of acting. Your step is: observe for a week how often and when the behavior shows up – without changing it.') : '');
        $('cs-balance-card').style.display = c.id === 'pre' || c.id === 'con' || c.id === 'prep' ? '' : 'none';
    }
    function renderBalance() {
        const B = S.balance;
        const list = (k, title, ph) => `<div class="cs-bal-col"><b>${title}</b>${(B[k] || []).map((x, i) => `<div class="cs-bal-item"><span>${esc(x)}</span><button class="mk-iconbtn" data-bdel="${k}:${i}" aria-label="Remove"><i class="fas fa-times"></i></button></div>`).join('')}<div class="cs-bal-add"><input class="mk-input" data-badd="${k}" placeholder="${ph}"><button class="mk-btn mk-btn-outline mk-btn-sm" data-baddbtn="${k}" aria-label="Add"><i class="fas fa-plus"></i></button></div></div>`;
        const pro = (B.pro || []).length, con = (B.con || []).length;
        $('cs-balance').innerHTML = `<div class="cs-bal">${list('pro', '✅ Dafür – was gewinne ich?', 'Ein Vorteil der Veränderung')}${list('con', '⚠️ Dagegen – was kostet es mich?', 'Ein Nachteil / eine Hürde')}</div>` +
            (pro + con >= 3 ? `<div class="cs-scale"><div class="cs-scale-side" style="flex:${pro}"><b>${pro}</b></div><div class="cs-scale-side con" style="flex:${con}"><b>${con}</b></div></div>` + (pro > con + 1 ? note('ok', 'The pros clearly outweigh – the decision is basically made. What is still holding you?') : con >= pro ? note('warn', 'The cons are at least as strong as the pros. No wonder you hesitate. Two paths: deepen the pros honestly – or accept that it is not time yet.') : note('info', 'Close. Which hurdle on the cons side could you concretely shrink?')) : '');
        $('cs-balance').querySelectorAll('[data-baddbtn]').forEach(b => b.addEventListener('click', () => add(b.dataset.baddbtn)));
        $('cs-balance').querySelectorAll('[data-badd]').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') add(i.dataset.badd); }));
        $('cs-balance').querySelectorAll('[data-bdel]').forEach(b => b.addEventListener('click', () => { const [k, i] = b.dataset.bdel.split(':'); B[k].splice(+i, 1); MethodKit.save(); renderBalance(); }));
        function add(k) { const inp = $('cs-balance').querySelector(`[data-badd="${k}"]`); const v = inp.value.trim(); if (!v) return; (B[k] = B[k] || []).push(v); MethodKit.save(); renderBalance(); const ni = $('cs-balance').querySelector(`[data-badd="${k}"]`); if (ni) ni.focus(); }
    }

    /* ---------- 5 ---------- */
    function renderRisks() {
        $('cs-risks').innerHTML = `<div class="mk-section-label">My risk situations</div><div class="mk-chips">${RISKS.map((r, i) => `<button class="mk-chip ${S.risks.includes(i) ? 'selected' : ''}" data-r="${i}">${r}</button>`).join('')}</div>` +
            (S.risks.length ? note('info', `${S.risks.length} Risikosituation${S.risks.length > 1 ? 'en' : ''}. For the most important one you write an if-then plan below – <em>before</em> it happens.`) : '');
        $('cs-risks').querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.r; S.risks = S.risks.includes(i) ? S.risks.filter(x => x !== i) : [...S.risks, i]; MethodKit.save(); renderRisks(); }));
    }
    function renderRelapseNote() {
        const r = (S.relapse || '').trim();
        $('cs-relapse-note').innerHTML = !r ? '' : /nie wieder|aufgeben|scheitern|versagt|alles umsonst|darf nicht/i.test(r) ? note('warn', 'That sounds like all-or-nothing. A relapse is a slip, not proof. The plan should describe how you <em>keep going</em>: “If …, then …”') : !/wenn/i.test(r) ? note('info', 'An if-then plan starts with a concrete situation: “If I am stressed in the evening, then …”') : !/dann/i.test(r) ? note('info', 'And what do you do then? An action you can still manage in the worst moment.') : note('ok', 'Concrete situation, concrete action. That is how if-then plans work.');
    }
    function renderSummary() {
        const c = cur();
        $('cs-summary').innerHTML = S.behavior ? `<div class="mk-result" style="margin-top:12px"><h4>Your status</h4><div class="cs-sum"><div><b>Behavior</b>${esc(S.behavior)}</div>${c ? `<div><b>Phase</b><span style="color:${c.c};font-weight:700">${c.ic} ${c.t}</span></div>` : ''}<div><b>Importance / confidence</b>${n(S.importance, 5)}/10 · ${n(S.confidence, 5)}/10</div>${S.next ? `<div><b>Nächster Schritt</b>${esc(S.next)}${S.when ? ` – by ${esc(S.when)}` : ''}</div>` : ''}${S.relapse ? `<div><b>Rückfall-Plan</b>${esc(S.relapse)}</div>` : ''}${S.support ? `<div><b>Unterstützung</b>${esc(S.support)}</div>` : ''}</div></div>` : '';
    }
    function renderLog() {
        const c = cur();
        $('cs-log').innerHTML = `<div class="cs-logadd"><div class="cs-logph">${PH.map(p => `<button class="${(S.logStage || (c && c.id)) === p.id ? 'on' : ''}" style="--c:${p.c}" data-lp="${p.id}" title="${p.t}">${p.ic}</button>`).join('')}</div><input class="mk-input" id="cs-lognote" placeholder="How is it going? (optional)"><button class="mk-btn mk-btn-outline mk-btn-sm" id="cs-logsave"><i class="fas fa-plus"></i> Check-in</button></div>` +
            (S.log.length ? `<div class="cs-loglist">${[...S.log].reverse().map(e => { const p = PH.find(x => x.id === e.stage) || PH[0]; return `<div class="cs-logrow"><span style="--c:${p.c}">${p.ic}</span><div><small>${new Date(e.date).toLocaleDateString('en-GB')} · ${p.t}</small>${e.note ? `<div>${esc(e.note)}</div>` : ''}</div></div>`; }).join('')}</div>` +
                (S.log.length >= 2 ? (() => { const a = idx(S.log[S.log.length - 2].stage), b = idx(S.log[S.log.length - 1].stage); return b > a ? note('ok', 'One stage further than at the last check-in. That is what progress looks like.') : b < a ? note('info', 'One stage back. The model expects that – the spiral, not the ladder. What did you learn that you will use on the next attempt?') : note('info', 'Same stage. If this stays for a while: which step for exactly this stage is still missing?'); })() : '') : '');
        $('cs-log').querySelectorAll('[data-lp]').forEach(b => b.addEventListener('click', () => { S.logStage = b.dataset.lp; renderLog(); }));
        $('cs-logsave').addEventListener('click', () => { const st = S.logStage || (c && c.id); if (!st) { MethodKit.toast('Please choose a stage first', 'warn'); return; } S.log.push({ date: Date.now(), stage: st, note: $('cs-lognote').value.trim() }); S.logStage = ''; MethodKit.save({ now: true }); MethodKit.toast('Check-in saved', 'ok'); renderLog(); });
    }
    function renderLinks() { $('cs-links').innerHTML = LINKS.map(x => `<a class="mk-option cs-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const c = cur();
        const L = ['STAGES OF CHANGE (PROCHASKA)', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'BEHAVIOR: ' + (S.behavior || '–'), S.why ? 'Why now: ' + S.why : '', `Importance ${n(S.importance, 5)}/10 · Confidence ${n(S.confidence, 5)}/10`, ''];
        if (c) L.push(`STAGE: ${c.t} (${c.sub})`, c.d, 'Trap: ' + c.trap, 'Task: ' + c.task, '');
        const B = S.balance; if ((B.pro || []).length || (B.con || []).length) L.push('SCALE', ...(B.pro || []).map(x => '+ ' + x), ...(B.con || []).map(x => '- ' + x), '');
        L.push('NEXT STEP: ' + (S.next || '–'), S.when ? 'By: ' + S.when : '', '');
        if (S.risks.length) L.push('RISK SITUATIONS: ' + S.risks.map(i => RISKS[i]).join(', '));
        if (S.relapse) L.push('RELAPSE PLAN: ' + S.relapse); if (S.support) L.push('SUPPORT: ' + S.support);
        if (S.log.length) L.push('', 'HISTORY', ...S.log.map(e => `${new Date(e.date).toLocaleDateString('de-CH')} · ${(PH.find(p => p.id === e.stage) || {}).t || e.stage}${e.note ? ' · ' + e.note : ''}`));
        MethodKit.exportText('stufen-der-veraenderung.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'change-stages', accent: '#0ea5e9', accent2: '#22c55e',
            steps: [{ icon: '🎯', label: 'Behavior' }, { icon: '📍', label: 'Where you stand' }, { icon: '🪜', label: 'Stage' }, { icon: '👣', label: 'Step' }, { icon: '🔁', label: 'Sticking with it' }],
            defaultState: { behavior: '', why: '', importance: 5, confidence: 5, quiz: {}, quizOrder: [], stage: '', balance: { pro: [], con: [] }, next: '', when: '', risks: [], relapse: '', support: '', log: [], logStage: '' }
        });
        S = MethodKit.state;
        if (!S.quiz || typeof S.quiz !== 'object') S.quiz = {};
        if (!S.balance || typeof S.balance !== 'object') S.balance = { pro: [], con: [] };
        ['risks', 'log', 'quizOrder'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        if (S.stage && !PH.some(p => p.id === S.stage)) { const map = { precontemplation: 'pre', contemplation: 'con', preparation: 'prep', action: 'act', maintenance: 'main' }; S.stage = map[S.stage] || ''; }
        MethodKit.bindFields();
        $('cs-export').addEventListener('click', exportAll);
        document.querySelectorAll('[data-mk-field="importance"],[data-mk-field="confidence"]').forEach(r => r.addEventListener('input', renderIC));
        $('cs-relapse').addEventListener('input', () => { renderRelapseNote(); renderSummary(); });
        ['cs-support', 'cs-next', 'cs-when', 'cs-behavior'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 1) renderIC();
            if (k === 2) renderQuiz();
            if (k === 3) { renderStairs(); renderPhase(); }
            if (k === 4) { renderTask(); renderBalance(); }
            if (k === 5) { renderRisks(); renderRelapseNote(); renderSummary(); renderLog(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
