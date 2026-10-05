/* Conflict escalation (Glasl) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const STAGES = [
        { n: 1, t: 'Hardening', ph: 1, d: 'Positions clash and harden. You still believe a conversation can lead to a solution.', sym: ['We go in circles – the same arguments, over and over', 'There is noticeable tension, but we still talk to each other', 'We both believe a good conversation can still solve this'] },
        { n: 2, t: 'Debate & polemic', ph: 1, d: 'It\'s no longer just about the issue, but about being right. Black-and-white thinking, tactical arguments, barbs.', sym: ['We want to win, not just clarify the issue', 'There are barbs, irony, verbal fouls', 'We argue tactically – even with things we don\'t actually believe'] },
        { n: 3, t: 'Actions instead of words', ph: 1, d: 'Talking no longer helps, so people act – without agreement. Empathy is lost, misinterpretations pile up.', sym: ['We create facts instead of talking', 'We barely talk to each other directly anymore', 'I interpret the other side\'s behavior as negative by reflex'] },
        { n: 4, t: 'Coalitions', ph: 2, d: 'People look for allies. It\'s about image: the others are seen as stereotypes, you yourself are “the good one”.', sym: ['I look for allies and tell others my version', 'The other side has become “that kind of person” in my eyes', 'It\'s about image and face, no longer about the issue'] },
        { n: 5, t: 'Loss of face', ph: 2, d: 'Direct and public attacks on moral integrity. Trust is destroyed – you want to expose the other.', sym: ['There were public attacks or humiliations', 'I believe the other side has a bad character', 'Trust is gone – I believe they are capable of anything'] },
        { n: 6, t: 'Threat strategies', ph: 2, d: 'Threats and counter-threats. The conflict speeds up through ultimata.', sym: ['Threats or ultimata have been issued', 'I have threatened myself or am about to', 'The situation feels like an arms race'] },
        { n: 7, t: 'Limited destruction', ph: 3, d: 'The other is no longer seen as a person. You accept your own damage as long as theirs is greater.', sym: ['I accept my own damage if it hits the other side harder', 'To me the other side is “no longer a person”, only an opponent', 'It\'s only about causing damage now'] },
        { n: 8, t: 'Fragmentation', ph: 3, d: 'The goal is to destroy the opponent\'s system – supporters, resources, livelihood.', sym: ['I want to destroy the other side\'s base (network, resources, position)', 'Anything is allowed to take the other side out'] },
        { n: 9, t: 'Together into the abyss', ph: 3, d: 'Total confrontation with no way back – destroying the opponent at any cost, including your own.', sym: ['I would lose everything if I take the other side down with me'] }
    ];
    const PHASES = {
        1: { t: 'Win-win', c: '#22c55e', d: 'Both can still win. Self-help or facilitation is enough.', help: 'Facilitation / clarification talk' },
        2: { t: 'Win-Lose', c: '#f59e0b', d: 'One side loses. Without a neutral third party it rarely goes back.', help: 'Process support or mediation' },
        3: { t: 'Lose-Lose', c: '#ef4444', d: 'Both lose. Only an outside power intervention still helps.', help: 'Arbitration / power intervention' }
    };
    const OWN = ['I interrupt or don\'t listen to the end', 'I talk about the other side behind their back', 'I assume intentions without asking', 'I become ironic or sarcastic', 'I create facts without informing', 'I avoid direct contact', 'I have threatened or hinted at consequences', 'I collect evidence against the other side', 'I look for allies', 'I put down the person, not just the behavior'];
    const STRAT = {
        1: [
            { ic: '🗣️', t: 'Address it directly', d: 'A one-on-one conversation – with I-messages, no witnesses, no time pressure.' },
            { ic: '👂', t: 'First understand, then be understood', d: 'Restate the other side\'s position in your own words before you present yours.' },
            { ic: '🤝', t: 'Name a shared goal', d: 'What do you both want? That puts the issue ahead of the person again.' },
            { ic: '🧊', t: 'Pause instead of debate', d: 'When it gets heated: postpone, don\'t try to win.' }
        ],
        2: [
            { ic: '🧑‍⚖️', t: 'Neutral third person', d: 'From stage 4, self-help is usually no longer enough. Facilitation or mediation brings structure and safety.' },
            { ic: '🛑', t: 'Dissolve coalitions', d: 'Stop gathering allies – and ask people around you to stay out of it.' },
            { ic: '🙏', t: 'Let them save face', d: 'Offer a way out where nobody loses in public.' },
            { ic: '🚫', t: 'No threats', d: 'Every threat speeds things up. Name limits and needs instead.' }
        ],
        3: [
            { ic: '🚨', t: 'Outside help – now', d: 'At this stage any further solo initiative does harm. Involve a manager, HR, a mediation office or legal advice.' },
            { ic: '🛡️', t: 'Protect yourself', d: 'Distance, documentation, support. It\'s no longer about a solution, but about damage control.' },
            { ic: '🚪', t: 'Consider exiting', d: 'Sometimes the smartest move is to leave the field.' }
        ]
    };
    const LINKS = [
        { m: 'Nonviolent communication', l: '../nonviolent-communication/nonviolent-communication.html', why: 'For the direct conversation (stages 1–3).' },
        { m: 'Harvard method', l: '../harvard-method/harvard-method.html', why: 'Negotiate interests instead of positions.' },
        { m: 'Circular questioning', l: '../circular-interview/circular-interview.html', why: 'Explore the other side\'s perspective.' },
        { m: 'Stress management', l: '../stress-management/stress-management.html', why: 'When the conflict is eating you up.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const stage = (k) => STAGES.find(s => s.n === k);
    const suggested = () => { let max = 0; STAGES.forEach(s => s.sym.forEach((_, i) => { if (S.symptoms.includes(`${s.n}-${i}`)) max = Math.max(max, s.n); })); return max; };
    const cur = () => S.stage || suggested() || 0;

    /* ---------- 2 ---------- */
    function renderSymptoms() {
        $('ce-symptoms').innerHTML = STAGES.map(s => `<div class="ce-symgrp" style="--c:${PHASES[s.ph].c}"><div class="ce-symgrp-h"><b>${s.n}</b> ${s.t}</div>${s.sym.map((x, i) => { const k = `${s.n}-${i}`; return `<label class="ce-sym ${S.symptoms.includes(k) ? 'on' : ''}"><input type="checkbox" data-sym="${k}" ${S.symptoms.includes(k) ? 'checked' : ''}> <span>${x}</span></label>`; }).join('')}</div>`).join('') +
            (suggested() ? note(suggested() <= 3 ? 'ok' : suggested() <= 6 ? 'warn' : 'warn', `Highest checked stage: <strong>${suggested()} – ${stage(suggested()).t}</strong> (${PHASES[stage(suggested()).ph].t}). ${S.symptoms.length === 1 ? 'Ein einzelnes Symptom reicht nicht – prüfe im nächsten Schritt, ob die Stufe stimmt.' : 'Im nächsten Schritt kannst du die Stufe bestätigen oder anpassen.'}`) : note('info', 'Nothing checked yet.'));
        $('ce-symptoms').querySelectorAll('[data-sym]').forEach(c => c.addEventListener('change', () => { if (c.checked) S.symptoms.push(c.dataset.sym); else S.symptoms = S.symptoms.filter(x => x !== c.dataset.sym); MethodKit.save(); renderSymptoms(); }));
    }

    /* ---------- 3 ---------- */
    function renderThermo() {
        const k = cur(); const sg = suggested();
        $('ce-thermo').innerHTML = `<div class="ce-thermo">${STAGES.map(s => `<button class="ce-th ${k === s.n ? 'on' : ''} ${k >= s.n ? 'lit' : ''} ${sg === s.n && S.stage && S.stage !== sg ? 'sugg' : ''}" style="--c:${PHASES[s.ph].c}" data-st="${s.n}" aria-label="Stufe ${s.n} ${s.t}"><b>${s.n}</b><span>${s.t}</span></button>`).join('')}</div><div class="ce-phases"><span style="--c:#22c55e">Win-Win · 1–3</span><span style="--c:#f59e0b">Win-Lose · 4–6</span><span style="--c:#ef4444">Lose-Lose · 7–9</span></div>` +
            (sg && S.stage && S.stage !== sg ? note('info', `The symptom check points to stage ${sg}, you chose stage ${S.stage} . Both are valid – your feeling counts. Just be careful not to make the conflict smaller than it is.`) : '');
        $('ce-thermo').querySelectorAll('[data-st]').forEach(b => b.addEventListener('click', () => { S.stage = +b.dataset.st; MethodKit.save(); renderThermo(); renderStageCard(); }));
    }
    function renderStageCard() {
        const k = cur(); if (!k) { $('ce-stagecard').innerHTML = note('info', 'Choose the stage above that fits best – or go back to the symptom check.'); return; }
        const s = stage(k), p = PHASES[s.ph];
        $('ce-stagecard').innerHTML = `<div class="ce-stagecard" style="--c:${p.c}"><div class="ce-stage-n">${s.n}</div><div><div class="mk-section-label" style="color:${p.c}">${p.t}</div><h3>${s.t}</h3><p>${s.d}</p><p class="mk-faint">${p.d} <strong>Recommended: ${p.help}.</strong></p></div></div>` +
            (S.load >= 8 && k <= 3 ? note('info', 'The stage is still low, but the strain is high (' + S.load + '/10). That speaks for acting now – while win-win is still possible.') : '') +
            (S.since === 'years' && k <= 2 ? note('info', 'On stage 1–2 for years? Hardening over a long time often runs deeper than it looks. Recheck the symptoms of stages 3–4 honestly.') : '');
    }
    function renderOwn() {
        $('ce-own').innerHTML = `<div class="mk-chips">${OWN.map((o, i) => `<button class="mk-chip ${S.own.includes(i) ? 'selected' : ''}" data-own="${i}">${o}</button>`).join('')}</div>` +
            (S.own.length >= 4 ? note('warn', `${S.own.length} own escalation patterns. This is not about blame – but it is your lever: you can drop each of them starting tomorrow.`) : S.own.length ? note('ok', `${S.own.length} patterns spotted. Looking honestly is the first step toward de-escalation.`) : note('info', 'Nothing? Almost every conflict has two sides – look again.'));
        $('ce-own').querySelectorAll('[data-own]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.own; S.own = S.own.includes(i) ? S.own.filter(x => x !== i) : [...S.own, i]; MethodKit.save(); renderOwn(); }));
    }

    /* ---------- 4 ---------- */
    function renderStrategy() {
        const k = cur(); if (!k) { $('ce-strategy').innerHTML = note('info', 'No stage, no strategy – please do step 3 first.'); return; }
        const ph = stage(k).ph, p = PHASES[ph];
        $('ce-strategy').innerHTML = `<div class="mk-section-label" style="color:${p.c}">Stage ${k} · ${p.t}</div>` +
            (ph === 3 ? note('warn', 'At this stage self-help is no longer useful – it can even do harm. This page is not a substitute for counseling. Get support.') : ph === 2 ? note('warn', 'From stage 4 Glasl recommends a neutral third person. What you can still do yourself: don\'t escalate further.') : note('ok', 'You can still solve this yourselves. The earlier, the easier.')) +
            `<div class="mk-grid">${STRAT[ph].map((x, i) => `<button class="mk-option ${S.strategies.includes(`${ph}-${i}`) ? 'selected' : ''}" data-str="${ph}-${i}"><span class="ic">${x.ic}</span><span class="t">${x.t}</span><span class="d">${x.d}</span></button>`).join('')}</div>` +
            (S.own.length ? `<div class="mk-result" style="margin-top:12px"><h4>And from now on you drop this</h4><ul class="ce-ul">${S.own.map(i => `<li>${OWN[i]}</li>`).join('')}</ul></div>` : '');
        $('ce-strategy').querySelectorAll('[data-str]').forEach(b => b.addEventListener('click', () => { const k2 = b.dataset.str; S.strategies = S.strategies.includes(k2) ? S.strategies.filter(x => x !== k2) : [...S.strategies, k2]; MethodKit.save(); renderStrategy(); }));
    }
    function renderInterest() {
        const w = (S.want || '').trim(), t = (S.theirs || '').trim();
        $('ce-interest-note').innerHTML = w && /recht|gewinn|beweis|zeigen|durchsetz/i.test(w) ? note('warn', '“Being right” or “winning” is a position, not an interest. What do you get if you are right – and why does that matter?') : w && t ? note('ok', 'Two interests side by side – is there a solution that serves both? That is the core of the Harvard method.') : w && !t ? note('info', 'You know your interest. What the other side needs is a hypothesis – but without it there is no solution that lasts.') : '';
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        const k = cur(); const s = k ? stage(k) : null;
        $('ce-summary').innerHTML = s ? `<div class="mk-result" style="margin-top:8px"><h4>Your plan</h4><div class="ce-sum"><div><b>Conflict</b>${esc(S.conflict || '–')}${S.who ? ` <span class="mk-faint">(mit ${esc(S.who)})</span>` : ''}</div><div><b>Stage</b><span style="color:${PHASES[s.ph].c};font-weight:700">${s.n} · ${s.t}</span> – ${PHASES[s.ph].help}</div>${S.strategies.length ? `<div><b>Strategie</b>${S.strategies.map(x => { const [p, i] = x.split('-'); return STRAT[p] && STRAT[p][i] ? STRAT[p][i].t : ''; }).filter(Boolean).join(' · ')}</div>` : ''}${S.own.length ? `<div><b>Lasse ich</b>${S.own.map(i => OWN[i]).join(' · ')}</div>` : ''}${S.next ? `<div><b>Nächster Schritt</b>${esc(S.next)}${S.when ? ` – ${esc(S.when)}` : ''}</div>` : ''}${S.stop ? `<div><b>Stopp-Regel</b>${esc(S.stop)}</div>` : ''}</div></div>` : '';
    }
    function renderLog() {
        const k = cur();
        $('ce-log').innerHTML = `<div class="ce-logadd"><label class="mk-faint">Today the conflict is at stage</label><div class="ce-logst">${STAGES.map(s => `<button class="${S.logStage === s.n ? 'on' : ''}" style="--c:${PHASES[s.ph].c}" data-ls="${s.n}">${s.n}</button>`).join('')}</div><input class="mk-input" id="ce-lognote" placeholder="What happened? (optional)"><button class="mk-btn mk-btn-outline mk-btn-sm" id="ce-logsave"><i class="fas fa-plus"></i> Entry</button></div>` +
            (S.log.length ? `<div class="ce-loglist">${[...S.log].reverse().map(e => `<div class="ce-logrow"><span class="ce-logn" style="--c:${PHASES[stage(e.stage).ph].c}">${e.stage}</span><div><small>${new Date(e.date).toLocaleDateString('en-GB')}</small>${e.note ? `<div>${esc(e.note)}</div>` : ''}</div></div>`).join('')}</div>` +
                (S.log.length >= 2 ? (() => { const a = S.log[S.log.length - 2].stage, b = S.log[S.log.length - 1].stage; return b < a ? note('ok', `From stage ${a} to ${b} – it's going in the right direction. Keep going.`) : b > a ? note('warn', `From stage ${a} to ${b} – the conflict is still escalating. Time to rethink the strategy or get help.`) : note('info', 'Unchanged. Standstill is not a solution – but not a step back either.'); })() : '') : '');
        $('ce-log').querySelectorAll('[data-ls]').forEach(b => b.addEventListener('click', () => { S.logStage = +b.dataset.ls; renderLog(); }));
        $('ce-logsave').addEventListener('click', () => { const st = S.logStage || k; if (!st) { MethodKit.toast('Please choose a stage first', 'warn'); return; } S.log.push({ date: Date.now(), stage: st, note: $('ce-lognote').value.trim() }); S.logStage = 0; MethodKit.save({ now: true }); MethodKit.toast('Entry saved', 'ok'); renderLog(); });
    }
    function renderLinks() { $('ce-links').innerHTML = LINKS.map(x => `<a class="mk-option ce-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const k = cur(); const s = k ? stage(k) : null;
        const L = ['CONFLICT ESCALATION (GLASL)', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'CONFLICT: ' + (S.conflict || '–'), S.who ? 'With: ' + S.who : '', S.trigger ? 'Trigger: ' + S.trigger : '', 'Strain: ' + S.load + '/10', ''];
        if (s) L.push(`STAGE ${s.n} – ${s.t} (${PHASES[s.ph].t})`, s.d, 'Recommended: ' + PHASES[s.ph].help, '');
        if (S.own.length) L.push('YOUR OWN PART', ...S.own.map(i => '- ' + OWN[i]), S.ownNote ? S.ownNote : '', '');
        if (S.strategies.length) L.push('STRATEGY', ...S.strategies.map(x => { const [p, i] = x.split('-'); return STRAT[p] && STRAT[p][i] ? `- ${STRAT[p][i].t}: ${STRAT[p][i].d}` : ''; }), '');
        if (S.want || S.theirs) L.push('INTERESTS', S.want ? 'Me: ' + S.want : '', S.theirs ? 'Other side: ' + S.theirs : '', '');
        L.push('PLAN', 'Next step: ' + (S.next || '–'), S.when ? 'When: ' + S.when : '', S.stop ? 'Stop rule: ' + S.stop : '');
        if (S.log.length) L.push('', 'HISTORY', ...S.log.map(e => `${new Date(e.date).toLocaleDateString('de-CH')} · Stage ${e.stage}${e.note ? ' · ' + e.note : ''}`));
        MethodKit.exportText('konflikt-glasl.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'conflict-escalation', accent: '#f97316', accent2: '#ef4444',
            steps: [{ icon: '🔥', label: 'Conflict' }, { icon: '🔍', label: 'Symptoms' }, { icon: '🌡️', label: 'Stage' }, { icon: '🧯', label: 'De-escalation' }, { icon: '📝', label: 'Plan' }],
            defaultState: { conflict: '', who: '', since: '', trigger: '', load: 5, symptoms: [], stage: 0, own: [], ownNote: '', strategies: [], want: '', theirs: '', next: '', when: '', stop: '', log: [], logStage: 0 }
        });
        S = MethodKit.state;
        ['symptoms', 'own', 'strategies', 'log'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        if (typeof S.stage === 'string') S.stage = parseInt(S.stage, 10) || 0;
        S.load = parseInt(S.load, 10) || 5;
        MethodKit.bindFields();
        $('ce-export').addEventListener('click', exportAll);
        ['ce-want', 'ce-theirs'].forEach(id => $(id).addEventListener('input', renderInterest));
        ['ce-next', 'ce-when', 'ce-stop'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 2) renderSymptoms();
            if (k === 3) { renderThermo(); renderStageCard(); renderOwn(); }
            if (k === 4) { renderStrategy(); renderInterest(); }
            if (k === 5) { renderSummary(); renderLog(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
