/* Moment of Excellence · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S, timer = null;

    const ANCHORS = ['👌 Press thumb & middle finger', '✊ Clench left fist', '🤏 Rub earlobe', '👍 Press thumb into palm', '🖐️ Wrap around wrist', '🦶 Press toes into the floor'];
    const SUBMOD = [['big', '🔍 Image larger', 'Let the inner image grow until it surrounds you'], ['near', '➡️ Closer', 'Bring the image closer until you’re in the middle'], ['bright', '☀️ Brighter & more colorful', 'Turn up brightness and colors'], ['assoc', '👁️ Through your own eyes', 'Don’t see it from outside – see it as you saw it then'], ['loud', '🔊 Louder', 'Turn up the sounds and voices'], ['move', '🎬 In motion', 'Turn the still image into a film']];
    const LINKS = [
        { m: 'Finding strengths', l: '../strengths-finder/strengths-finder.html', why: 'Which strength was active in your moment?' },
        { m: 'Mindfulness', l: '../mindfulness/mindfulness.html', why: 'Train body awareness – makes anchors stronger.' },
        { m: 'Stress management', l: '../stress-management/stress-management.html', why: 'Build the anchor into the SOS plan.' },
        { m: 'Well-formed outcome (NLP)', l: '../nlp-meta-goal/nlp-meta-goal.html', why: 'Aim the state at a goal.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const moment = () => S.moments.find(m => m.id === S.chosen) || null;
    const anchorName = () => (S.anchorCustom || '').trim() || S.anchor || '';
    const days = (ts) => Math.floor((Date.now() - ts) / 864e5);

    /* ---------- 1 ---------- */
    function renderMoments() {
        $('me-moments').innerHTML = S.moments.map(m => `<div class="me-mom ${S.chosen === m.id ? 'on' : ''}"><button class="me-pick" data-pick="${m.id}" aria-label="Diesen Moment wählen">${S.chosen === m.id ? '⚡' : '○'}</button><div class="me-mom-b"><input class="mk-input" data-mt="${m.id}" value="${esc(m.text)}" placeholder="What kind of moment was it?"><div class="me-mom-r"><input class="mk-input" data-mw="${m.id}" value="${esc(m.when || '')}" placeholder="When / where"><div class="me-int"><span>Strength</span>${[1, 2, 3, 4, 5].map(v => `<button class="${n(m.power, 0) >= v ? 'on' : ''}" data-mp="${m.id}" data-v="${v}" aria-label="Stärke ${v}">●</button>`).join('')}</div></div></div><button class="mk-iconbtn" data-md="${m.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>`).join('') +
            `<button class="mk-btn mk-btn-outline mk-btn-sm" id="me-madd"><i class="fas fa-plus"></i> Add moment</button>` +
            (S.moments.length >= 3 && !S.chosen ? (() => { const best = [...S.moments].sort((a, b) => n(b.power, 0) - n(a.power, 0))[0]; return best && best.power ? note('info', `Your strongest: “${esc(best.text)}" (${best.power}/5). Choose it with ⚡ – or another that shows up in your body the moment you read it.`) : note('info', 'Rate the strength of each moment – then you know which one you’re working with.'); })() : S.chosen && moment() ? (n(moment().power, 0) <= 2 ? note('warn', 'The chosen moment is only moderately strong. Anchors need intensity – is there one that grabs you physically when you remember it?') : note('ok', `You’re working with: “${esc(moment().text)}". Continue to immersion.`)) : S.moments.length < 3 ? note('info', `${S.moments.length}/3 – collect  ${3 - S.moments.length} more. Even small moments count: a conversation that clicked; a run that flew.`) : '');
        const h = $('me-moments');
        $('me-madd').addEventListener('click', () => { S.moments.push({ id: MethodKit.uid(), text: '', when: '', power: 0 }); MethodKit.save(); renderMoments(); const last = h.querySelectorAll('[data-mt]'); if (last.length) last[last.length - 1].focus(); });
        h.querySelectorAll('[data-mt]').forEach(i => i.addEventListener('input', () => { S.moments.find(m => m.id === i.dataset.mt).text = i.value; MethodKit.save(); }));
        h.querySelectorAll('[data-mw]').forEach(i => i.addEventListener('input', () => { S.moments.find(m => m.id === i.dataset.mw).when = i.value; MethodKit.save(); }));
        h.querySelectorAll('[data-mp]').forEach(b => b.addEventListener('click', () => { S.moments.find(m => m.id === b.dataset.mp).power = +b.dataset.v; MethodKit.save(); renderMoments(); }));
        h.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { S.chosen = S.chosen === b.dataset.pick ? '' : b.dataset.pick; MethodKit.save(); renderMoments(); }));
        h.querySelectorAll('[data-md]').forEach(b => b.addEventListener('click', () => { S.moments = S.moments.filter(m => m.id !== b.dataset.md); if (S.chosen === b.dataset.md) S.chosen = ''; MethodKit.save(); renderMoments(); }));
    }

    /* ---------- 2 ---------- */
    function renderDive() {
        const m = moment();
        $('me-dive-intro').innerHTML = m ? `<div class="me-quote">⚡ ${esc(m.text)}${m.when ? `<small>${esc(m.when)}</small>` : ''}</div>${note('info', 'Schliess kurz die Augen. Geh zurück in diesen Moment – nicht als Zuschauer, sondern mittendrin. Dann beschreib, was da ist.')}` : note('info', 'Choose a moment in step 1.');
        renderVakNote(); renderSubmod(); renderIntNote();
    }
    function renderVakNote() {
        const f = ['see', 'hear', 'feel', 'think'].filter(k => (S[k] || '').trim()).length;
        const feel = (S.feel || '').trim();
        const shortFeel = note('info', 'The body part is thin. That’s exactly what carries the anchor: Where exactly does the feeling sit? Warm or cool? Wide or dense? How are you breathing?');
        $('me-vak-note').innerHTML = f === 4 ? (feel.length < 25 ? shortFeel : note('ok', 'All channels are there. The more precise, the faster you get back in when you practice.')) : f >= 2 && !feel ? note('info', 'The body feeling is still missing – it’s the most important channel. Without kinesthetics, no anchor holds.') : f >= 2 && feel.length < 25 ? shortFeel : '';
    }
    function renderSubmod() {
        const SM = S.submod;
        $('me-submod').innerHTML = `<div class="me-sm">${SUBMOD.map(([id, t, d]) => `<button class="me-sm-btn ${SM[id] === 'up' ? 'up' : SM[id] === 'down' ? 'down' : ''}" data-sm="${id}" title="${d}"><b>${t}</b><small>${SM[id] === 'up' ? '↑ stronger' : SM[id] === 'down' ? '↓ weaker / neutral' : 'ausprobieren'}</small></button>`).join('')}</div>` +
            (Object.values(SM).filter(v => v === 'up').length >= 2 ? note('ok', `Your amplifiers: ${SUBMOD.filter(([id]) => SM[id] === 'up').map(([, t]) => t.replace(/^\S+\s/, '')).join(', ')}. Use exactly these when anchoring.`) : Object.keys(SM).length ? '' : note('info', 'Click a switch, try the change inwardly – and mark whether the feeling gets stronger (↑) or not (↓).'));
        $('me-submod').querySelectorAll('[data-sm]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.sm; SM[k] = SM[k] === 'up' ? 'down' : SM[k] === 'down' ? undefined : 'up'; if (!SM[k]) delete SM[k]; MethodKit.save(); renderSubmod(); }));
    }
    function renderIntNote() {
        const i = n(S.intensity, 7);
        $('me-int-note').innerHTML = i >= 8 ? note('ok', `${i}/10 – strong enough to anchor. Remember this state: right here, just before the peak, you set the anchor.`) : i >= 6 ? note('info', `${i}/10 – okay, but more is possible. Another round with the amplifiers? Anchors below 7 fade fast.`) : note('warn', `${i}/10 – too weak for a stable anchor. Either immerse more deeply (submodalities, body!) or go back to step 1 and choose a stronger moment.`);
    }

    /* ---------- 3 ---------- */
    function renderAnchors() {
        $('me-anchors').innerHTML = `<div class="mk-chips">${ANCHORS.map(a => `<button class="mk-chip ${S.anchor === a && !S.anchorCustom ? 'selected' : ''}" data-a="${esc(a)}">${a}</button>`).join('')}</div>`;
        $('me-anchors').querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { S.anchor = b.dataset.a; S.anchorCustom = ''; $('me-anchor-custom').value = ''; MethodKit.save(); renderAnchors(); renderAnchorCheck(); }));
        renderAnchorCheck();
    }
    function renderAnchorCheck() {
        const a = anchorName(); const i = n(S.intensity, 7);
        const C = [['int', 'Intensity', i >= 7, i >= 7 ? `State at ${i}/10 – strong enough.` : `State at ${i}/10 – too weak. Back to step 2.`], ['uniq', 'Uniqueness', !!a && !/händeschütteln|nicken|lächeln|atmen/i.test(a), a ? 'A signal you don’t otherwise make by chance.' : 'No anchor chosen yet.'], ['time', 'Timing', true, 'Set it when the feeling is rising – just before the peak. Release before it fades.'], ['rep', 'Repetition', n(S.practiced, 0) >= 3, `${n(S.practiced, 0)}× practiced – ${n(S.practiced, 0) >= 3 ? 'gut.' : 'mindestens 3× in derselben Sitzung, dann täglich.'}`]];
        $('me-anchor-check').innerHTML = `<div class="me-crit">${C.map(([id, t, ok, d]) => `<div class="${ok ? 'ok' : ''}"><b>${ok ? '✓' : '○'} ${t}</b><small>${d}</small></div>`).join('')}</div>`;
    }
    function startPractice() {
        const btn = $('me-practice'), orb = $('me-orb'), guide = $('me-guide');
        if (!anchorName()) { MethodKit.toast('Choose an anchor first', 'warn'); return; }
        btn.disabled = true; orb.classList.add('run');
        const a = anchorName().replace(/^\S+\s/, '');
        const ups = SUBMOD.filter(([id]) => S.submod[id] === 'up').map(([, t]) => t.replace(/^\S+\s/, ''));
        const steps = [[0, 'Eyes closed. Two calm breaths.'], [4, `Go back: ${moment() ? moment().text : 'dein Moment'} …`], [9, S.see ? `See it: ${S.see.slice(0, 60)}` : 'See what you saw then.'], [14, ups.length ? `Amplify: ${ups.join(' · ')} – let it grow.` : 'Let the image become larger, closer, brighter.'], [19, S.feel ? `Feel it in your body: ${S.feel.slice(0, 60)}` : 'Feel where it sits in your body.'], [23, `It’s rising … NOW: ${a}!`], [27, 'Hold … and slowly release.'], [30, 'Eyes open. Shake it off briefly.']];
        orb.style.setProperty('--dur', '30s');
        steps.forEach(([t, m]) => setTimeout(() => { guide.textContent = m; if (t === 23) orb.classList.add('peak'); if (t === 27) orb.classList.remove('peak'); }, t * 1000));
        timer = setTimeout(() => { orb.classList.remove('run'); btn.disabled = false; S.practiced = n(S.practiced, 0) + 1; S.practiceLog.push(Date.now()); $('me-count').textContent = S.practiced; MethodKit.save({ now: true }); MethodKit.toast('Anchor set', 'ok'); renderAnchorCheck(); renderPracticeNote(); }, 31000);
    }
    function renderPracticeNote() {
        const p = n(S.practiced, 0);
        $('me-practice-note').innerHTML = p === 0 ? '' : p < 3 ? note('info', `${p}× –  ${3 - p}× more in this session, then test. Between rounds, briefly “clear”: think of something neutral.`) : note('ok', `${p}× set. Now test – below.`);
    }
    function renderTest() {
        $('me-test').innerHTML = `<div class="mk-field"><label>Fire the anchor. How strongly does the state come – without consciously thinking of the moment? <span class="mk-range-val" id="me-testval">${n(S.testVal, 0) || '–'}</span>/10</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" id="me-testrange" value="${n(S.testVal, 0)}"></div></div><button class="mk-btn mk-btn-outline mk-btn-sm" id="me-testsave"><i class="fas fa-flask"></i> Save test</button>` +
            (S.tests.length ? `<div class="me-tests">${S.tests.map(t => `<span class="${t.v >= 6 ? 'ok' : t.v >= 4 ? 'mid' : 'low'}" title="${new Date(t.date).toLocaleDateString('de-CH')}">${t.v}</span>`).join('')}</div>` + (() => { const last = S.tests[S.tests.length - 1].v; const trend = S.tests.length >= 2 ? last - S.tests[S.tests.length - 2].v : 0; return last >= 7 ? note('ok', `${last}/10 on firing – the anchor holds. ${trend > 0 ? 'Und er is getting stronger.' : ''} Continue to Future Pace.`) : last >= 4 ? note('info', `${last}/10 – the anchor takes, but isn’t stable yet. Two to three more rounds, then test again.${trend < 0 ? ' Der Wert ist gesunken – hast du zwischen den Durchgängen aufgeräumt?' : ''}`) : note('warn', `${last}/10 – barely a reaction. Most common causes: state too weak (step 2), anchor set too late (after the peak), or too few repetitions. Don’t give up – that’s normal the first time.`); })() : '');
        $('me-testrange').addEventListener('input', e => { $('me-testval').textContent = e.target.value; S.testVal = +e.target.value; });
        $('me-testsave').addEventListener('click', () => { S.tests.push({ date: Date.now(), v: n(S.testVal, 0), after: n(S.practiced, 0) }); MethodKit.save({ now: true }); renderTest(); });
    }

    /* ---------- 4 ---------- */
    function renderSits() {
        $('me-sits').innerHTML = S.situations.map(s => `<div class="me-sit"><div class="me-sit-h"><input class="mk-input" data-st="${s.id}" value="${esc(s.text)}" placeholder="Situation, e.g. salary talk on Thursday"><button class="mk-iconbtn" data-sd="${s.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div><div class="me-sit-r"><div class="me-sit-sc"><span>Without anchor – how does it feel when you imagine it?</span><div class="me-sc">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button class="${n(s.before, 0) === v ? 'on' : ''}" data-sb="${s.id}" data-v="${v}">${v}</button>`).join('')}</div><small>1 = very tense · 10 = fully in my power</small></div><div class="me-sit-sc"><span>Now: fire the anchor, imagine the situation again.</span><div class="me-sc after">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button class="${n(s.after, 0) === v ? 'on' : ''}" data-sa="${s.id}" data-v="${v}">${v}</button>`).join('')}</div>${s.before && s.after ? `<small class="${s.after - s.before >= 3 ? 'ok' : s.after > s.before ? 'mid' : 'low'}">${s.after - s.before > 0 ? '+' : ''}${s.after - s.before} ${s.after - s.before >= 3 ? '– clear effect' : s.after > s.before ? '– noticeable, can grow' : '– no effect: recharge the anchor again before the situation'}</small>` : ''}</div></div></div>`).join('') +
            `<button class="mk-btn mk-btn-outline mk-btn-sm" id="me-sadd"><i class="fas fa-plus"></i> Add situation</button>` +
            (() => { const done = S.situations.filter(s => s.before && s.after); if (!done.length) return S.situations.length ? '' : note('info', 'Three situations are enough. The more concrete (place, time, person), the better the transfer works.'); const avg = done.reduce((a, s) => a + (s.after - s.before), 0) / done.length; return avg >= 3 ? note('ok', `On average +${avg.toFixed(1)}  points with anchor. That’s the transfer – the state is no longer tied to the old moment.`) : avg > 0 ? note('info', `+${avg.toFixed(1)}  on average. It works. With each practice the jump gets bigger.`) : note('warn', 'No measurable effect. Back to step 3: the anchor still needs repetitions – or a stronger starting state.'); })();
        const h = $('me-sits');
        $('me-sadd').addEventListener('click', () => { S.situations.push({ id: MethodKit.uid(), text: '', before: 0, after: 0 }); MethodKit.save(); renderSits(); });
        h.querySelectorAll('[data-st]').forEach(i => i.addEventListener('input', () => { S.situations.find(s => s.id === i.dataset.st).text = i.value; MethodKit.save(); }));
        h.querySelectorAll('[data-sd]').forEach(b => b.addEventListener('click', () => { S.situations = S.situations.filter(s => s.id !== b.dataset.sd); MethodKit.save(); renderSits(); }));
        h.querySelectorAll('[data-sb]').forEach(b => b.addEventListener('click', () => { S.situations.find(s => s.id === b.dataset.sb).before = +b.dataset.v; MethodKit.save(); renderSits(); }));
        h.querySelectorAll('[data-sa]').forEach(b => b.addEventListener('click', () => { S.situations.find(s => s.id === b.dataset.sa).after = +b.dataset.v; MethodKit.save(); renderSits(); }));
    }

    /* ---------- 5 ---------- */
    function renderCare() {
        const last = S.practiceLog.length ? S.practiceLog[S.practiceLog.length - 1] : null; const d = last ? days(last) : null;
        const last14 = S.practiceLog.filter(ts => days(ts) < 14).length;
        $('me-care').innerHTML = `<div class="me-stats"><div><b>${n(S.practiced, 0)}</b><span> times set</span></div><div><b>${last14}</b><span>in 14 days</span></div><div><b>${S.tests.length ? S.tests[S.tests.length - 1].v : '–'}</b><span>last test</span></div><div><b>${d === null ? '–' : d === 0 ? 'heute' : d + ' T.'}</b><span>last</span></div></div>` +
            (d === null ? note('info', 'Never practiced. The anchor only exists once you’ve set it – step 3.') : d >= 7 ? note('warn', `${d}  days without practice. Anchors fade – after two weeks without a refresh, little is usually left. One minute is enough: moment, amplifiers, anchor.`) : d >= 3 ? note('info', 'A few days ago. Refresh it briefly today – 30 seconds.') : note('ok', 'Fresh. Rule of thumb: daily for the first two weeks, then once a week and always right before use.')) +
            `<button class="mk-btn mk-btn-outline mk-btn-sm" id="me-refresh"><i class="fas fa-bolt"></i> Refreshed today</button>` +
            (S.practiceLog.length >= 2 ? `<div class="me-cal">${Array.from({ length: 28 }, (_, i) => { const dayAgo = 27 - i; const hit = S.practiceLog.some(ts => days(ts) === dayAgo); return `<i class="${hit ? 'on' : ''}" title="vor ${dayAgo} Tagen"></i>`; }).join('')}<small>last 28 days</small></div>` : '');
        $('me-refresh').addEventListener('click', () => { S.practiceLog.push(Date.now()); S.practiced = n(S.practiced, 0) + 1; MethodKit.save({ now: true }); MethodKit.toast('Refreshed', 'ok'); renderCare(); });
    }
    function renderSummary() {
        const m = moment();
        $('me-summary').innerHTML = m || anchorName() ? `<div class="mk-result" style="margin-top:12px"><h4>Your anchor log</h4>${m ? `<div><b>Moment:</b> ${esc(m.text)}${m.when ? ` (${esc(m.when)})` : ''}</div>` : ''}${anchorName() ? `<div><b>Anker:</b> ${esc(anchorName())}</div>` : ''}<div><b>Intensity:</b> ${n(S.intensity, 7)}/10${S.tests.length ? ` · Test: ${S.tests[S.tests.length - 1].v}/10` : ''}</div>${Object.keys(S.submod).filter(k => S.submod[k] === 'up').length ? `<div><b>Verstärker:</b> ${SUBMOD.filter(([id]) => S.submod[id] === 'up').map(([, t]) => t.replace(/^\S+\s/, '')).join(', ')}</div>` : ''}${S.situations.filter(s => s.text).length ? `<div style="margin-top:6px"><b>Einsatz:</b><ul class="me-ul">${S.situations.filter(s => s.text).map(s => `<li>${esc(s.text)}${s.before && s.after ? ` <small>(${s.before} → ${s.after})</small>` : ''}</li>`).join('')}</ul></div>` : ''}</div>` : '';
    }
    function renderLinks() { $('me-links').innerHTML = LINKS.map(x => `<a class="mk-option me-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const m = moment();
        const L = ['MOMENT OF EXCELLENCE – ANCHOR LOG', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'MOMENTS'];
        S.moments.forEach(x => L.push(`${S.chosen === x.id ? '⚡ ' : '  '}${x.text}${x.when ? ' (' + x.when + ')' : ''} – Strength ${x.power || '–'}/5`));
        if (m) L.push('', 'IMMERSION', S.see ? 'See: ' + S.see : '', S.hear ? 'Hear: ' + S.hear : '', S.feel ? 'Feel: ' + S.feel : '', S.think ? 'Think: ' + S.think : '', 'Amplifiers: ' + (SUBMOD.filter(([id]) => S.submod[id] === 'up').map(([, t]) => t.replace(/^\S+\s/, '')).join(', ') || '–'), `Intensity: ${n(S.intensity, 7)}/10`);
        L.push('', 'ANCHOR: ' + (anchorName() || '–'), `Practiced: ${n(S.practiced, 0)}×`, S.tests.length ? 'Tests: ' + S.tests.map(t => t.v).join(' → ') : '');
        if (S.situations.length) L.push('', 'FUTURE PACE', ...S.situations.map(s => `- ${s.text}${s.before && s.after ? ` (ohne ${s.before} → mit ${s.after})` : ''}`));
        MethodKit.exportText('anker-protokoll.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'moment-excellence', accent: '#eab308', accent2: '#f59e0b',
            steps: [{ icon: '🔍', label: 'Moments' }, { icon: '🌊', label: 'Immerse' }, { icon: '⚓', label: 'Anchor' }, { icon: '⚡', label: 'Future Pace' }, { icon: '🔗', label: 'Maintain' }],
            defaultState: { moments: [], chosen: '', see: '', hear: '', feel: '', think: '', submod: {}, intensity: 7, anchor: '', anchorCustom: '', practiced: 0, practiceLog: [], testVal: 0, tests: [], situations: [] }
        });
        S = MethodKit.state;
        ['moments', 'practiceLog', 'tests', 'situations'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        if (!S.submod || typeof S.submod !== 'object') S.submod = {};
        // Migration: altes when/what → ein Moment
        if ((S.what || S.when) && !S.moments.length) { const id = MethodKit.uid(); S.moments.push({ id, text: S.what || S.when, when: S.what ? S.when : '', power: 4 }); S.chosen = id; delete S.what; delete S.when; }
        S.situations.forEach(s => { if (s.before === undefined) s.before = 0; if (s.after === undefined) s.after = 0; });
        MethodKit.bindFields();
        $('me-count').textContent = n(S.practiced, 0);
        $('me-export').addEventListener('click', exportAll);
        $('me-practice').addEventListener('click', startPractice);
        ['me-see', 'me-hear', 'me-feel', 'me-think'].forEach(id => $(id).addEventListener('input', renderVakNote));
        document.querySelector('[data-mk-field=intensity]').addEventListener('input', renderIntNote);
        $('me-anchor-custom').addEventListener('input', () => { if ($('me-anchor-custom').value.trim()) S.anchor = ''; renderAnchors(); });
        MethodKit.onStep = function (k) {
            if (timer && k !== 3) { clearTimeout(timer); timer = null; $('me-orb').classList.remove('run', 'peak'); $('me-practice').disabled = false; $('me-guide').textContent = 'Ready? Sit comfortably.'; }
            if (k === 1) renderMoments();
            if (k === 2) renderDive();
            if (k === 3) { renderAnchors(); renderPracticeNote(); renderTest(); }
            if (k === 4) renderSits();
            if (k === 5) { renderCare(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
