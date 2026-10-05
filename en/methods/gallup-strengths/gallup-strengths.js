/* Gallup-Stärkendomänen · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    // [Name, Kurzbeschreibung, Schattenseite]
    const DOMAINS = [
        { id: 'exec', ic: '⚙️', t: 'Executing', c: '#6366f1', insight: 'You make things happen: you implement and carry goals across the finish line.', need: 'People who turn ideas into results, meet deadlines and keep going.', t34: [['Achiever', 'You need a result every day, otherwise the day feels wasted', 'Restless, can\'t switch off, measures people by output'], ['Arranger', 'You juggle variables and find the best arrangement', 'Constantly changes plans, confuses others with optimizations'], ['Belief', 'Firm values guide your actions – meaning before money', 'Inflexible, moralizing, judges other priorities'], ['Consistency', 'You treat everyone the same and want clear, stable rules', 'Bureaucratic, too little room for exceptions and individuality'], ['Deliberative', 'You weigh risks carefully before you act', 'Hesitant, suspicious, slows down decisions'], ['Discipline', 'You need routine, structure and order', 'Rigid, perfectionist, copes poorly with chaos'], ['Focus', 'You set goals and filter out everything that distracts', 'Tunnel vision, impatient with detours, overlooks side issues'], ['Responsibility', 'What you commit to, you deliver – it\'s psychologically binding', 'Can\'t say no, overloads themselves, distrusts delegation'], ['Restorative', 'You love solving problems and fixing what\'s broken', 'Sees deficits everywhere, neglects what works']] },
        { id: 'infl', ic: '📣', t: 'Influencing', c: '#ec4899', insight: 'You bring others along: you speak up, persuade and carry ideas outward.', need: 'People who take the floor, sell, get heard and generate energy.', t34: [['Activator', 'You want to start – now. Action is the best teacher', 'Impatient, hasty, steamrolls the skeptics'], ['Command', 'You take the wheel and don\'t shy away from confrontation', 'Dominant, intimidating, doesn\'t listen enough'], ['Communication', 'You explain, tell stories, write – and bring ideas to life', 'Talks too much, listens too little, style over substance'], ['Competition', 'You measure yourself against others and want to win', 'Sore loser, turns everything into a race, loses cooperation'], ['Maximizer', 'You turn good into excellent – strengths over weaknesses', 'Elitist, impatient with mediocrity, avoids repair work'], ['Self-Assurance', 'You trust your judgment and steer your own life', 'Arrogant, resistant to advice, underestimates risks'], ['Significance', 'You want to be seen and leave a mark', 'Needs recognition, comes across as vain, ego before the cause'], ['Woo', 'You win strangers over – every room is an opportunity', 'Superficial, too many acquaintances, too little depth']] },
        { id: 'rel', ic: '🤝', t: 'Relationship Building', c: '#22c55e', insight: 'You\'re the glue in the team: you connect people and create cohesion.', need: 'People who build trust, sense moods and hold a team together.', t34: [['Adaptability', 'You live in the now and respond calmly to change', 'Directionless, unplanned, comes across as noncommittal'], ['Connectedness', 'You believe everything is connected and has meaning', 'Detached, not pragmatic enough, passively fatalistic'], ['Growth', 'You see potential in others and help them grow', 'Invests in hopeless cases, neglects own development'], ['Empathy', 'You feel other people\'s emotions as if they were your own', 'Overwhelmed, takes everything personally, can\'t set boundaries'], ['Harmony', 'You seek consensus and avoid friction', 'Conflict-averse, vague, lets problems fester'], ['Includer', 'You bring outsiders in – everyone belongs', 'Uncritical in selection, waters down standards'], ['Individualization', 'You see what makes each person unique', 'Makes too many exceptions, seems unfair'], ['Positivity', 'You infect others with enthusiasm', 'Naive, doesn\'t take problems seriously, seems fake'], ['Capacity to love', 'You prefer deep relationships with a few people', 'Closed off to newcomers, forms cliques']] },
        { id: 'strat', ic: '🧠', t: 'Strategic Thinking', c: '#0ea5e9', insight: 'You think ahead: you analyze, learn and make smart decisions.', need: 'People who gather information, spot patterns and think through the future.', t34: [['Analytical', 'You look for reasons and causes – evidence over claims', 'Cold, picks ideas apart, paralyzes with questions'], ['Context', 'You understand the present through its history', 'Backward-looking, slows down the new with “back in the day…”'], ['Futuristic', 'You see what could be and draw energy from it', 'Dreamer, neglects today, frustrated by slowness'], ['Ideation', 'You\'re fascinated by ideas and connections', 'Erratic, too many ideas, little follow-through'], ['Input', 'You collect information, things, relationships – anything could be useful', 'Hoards, doesn\'t get to the point, endless analysis'], ['Intellection', 'You need mental activity and like to think things through alone', 'Too much in your head, too little exchange, seems distant'], ['Learner', 'The process of learning excites you more than the result', 'Eternal beginner, learns instead of applying'], ['Strategic', 'You see patterns and find the best path through chaos', 'Skips steps, others can\'t follow, comes across as a know-it-all']] }
    ];
    const ALL = []; DOMAINS.forEach(d => d.t34.forEach(([name, desc, shadow]) => ALL.push({ name, desc, shadow, d })));
    const LINKS = [
        { m: 'Finding strengths', l: '../strengths-finder/strengths-finder.html', why: 'Rate strengths by energy and use.' },
        { m: 'VIA character strengths', l: '../via-strengths/via-strengths.html', why: 'Character strengths instead of work talents.' },
        { m: 'Johari window', l: '../johari-window/johari-window.html', why: 'Which talents do others see in you?' },
        { m: 'Competence map', l: '../competence-map/competence-map.html', why: 'Translate talents into competencies.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const T = (name) => ALL.find(x => x.name === name);
    const counts = (list) => { const c = {}; DOMAINS.forEach(d => c[d.id] = 0); list.forEach(nm => { const t = T(nm); if (t) c[t.d.id]++; }); return c; };

    /* ---------- 1 ---------- */
    function renderGroups() {
        $('gp-groups').innerHTML = DOMAINS.map(d => `<div class="gp-grp" style="--c:${d.c}"><div class="gp-grp-h"><span>${d.ic}</span><b>${d.t}</b><small>${d.t34.filter(([nm]) => S.selected.includes(nm)).length}/${d.t34.length}</small></div><div class="gp-talents">${d.t34.map(([nm, desc]) => `<button class="gp-tal ${S.selected.includes(nm) ? 'on' : ''}" data-s="${nm}"><b>${nm}</b><small>${desc}</small></button>`).join('')}</div></div>`).join('') +
            `<div class="gp-count ${S.selected.length >= 8 && S.selected.length <= 12 ? 'ok' : S.selected.length > 12 ? 'over' : ''}">${S.selected.length} chosen</div>` +
            (S.selected.length > 12 ? note('info', `${S.selected.length} talents – Gallup's standard report shows only the top 5, because those make the difference. Cut anything that only applies “a little”.`) : S.selected.length >= 8 ? note('ok', 'Good foundation. In the next step you pick and rank your top 5.') : S.selected.length ? note('info', `Still ${8 - S.selected.length} more for a solid profile.`) : '');
        $('gp-groups').querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.s; if (S.selected.includes(v)) { S.selected = S.selected.filter(x => x !== v); S.top = S.top.filter(x => x !== v); } else S.selected.push(v); MethodKit.save(); renderGroups(); }));
    }

    /* ---------- 2 ---------- */
    function renderTop() {
        if (S.selected.length < 5) { $('gp-top').innerHTML = note('info', 'First pick at least five talents in step 1.'); return; }
        S.top = S.top.filter(v => S.selected.includes(v));
        $('gp-top').innerHTML = `<div class="gp-toplist">${[0, 1, 2, 3, 4].map(i => { const nm = S.top[i]; const t = nm ? T(nm) : null; return `<div class="gp-slot ${t ? 'filled' : ''}" style="--c:${t ? t.d.c : 'var(--mk-line)'}"><span class="gp-rank">${i + 1}</span>${t ? `<div class="gp-slot-b"><b>${t.name}</b><small>${t.d.ic} ${t.d.t}</small></div><div class="gp-slot-act">${i > 0 ? `<button class="mk-iconbtn" data-up="${i}" aria-label="Move up"><i class="fas fa-arrow-up"></i></button>` : ''}${i < S.top.length - 1 ? `<button class="mk-iconbtn" data-down="${i}" aria-label="Move down"><i class="fas fa-arrow-down"></i></button>` : ''}<button class="mk-iconbtn" data-rm="${i}" aria-label="Remove"><i class="fas fa-times"></i></button></div>` : '<span class="mk-faint">empty</span>'}</div>`; }).join('')}</div><div class="mk-section-label" style="margin-top:12px">From your selection</div><div class="mk-chips">${S.selected.filter(v => !S.top.includes(v)).map(v => `<button class="mk-chip" data-add="${v}" style="--c:${T(v).d.c}">${T(v).d.ic} ${v}</button>`).join('') || '<span class="mk-faint">All selected talents are in the top 5.</span>'}</div>` +
            (S.top.length === 5 ? (() => { const c = counts(S.top); const doms = Object.values(c).filter(Boolean).length; return doms === 1 ? note('info', `All five from <strong>${DOMAINS.find(d => c[d.id]).t}</strong>. A very clear profile – and a clear gap. Step 4 will matter.`) : doms === 4 ? note('ok', 'Top 5 spread across all four domains – rare. You\'re a generalist; your challenge is focus, not complement.') : note('ok', `Top 5 complete – from ${doms} domains.`); })() : `<div class="mk-faint">${S.top.length}/5 – click talents below to add them.</div>`);
        const h = $('gp-top');
        h.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => { if (S.top.length >= 5) { MethodKit.toast('Top 5 is full – remove one first', 'warn'); return; } S.top.push(b.dataset.add); MethodKit.save(); renderTop(); }));
        h.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { S.top.splice(+b.dataset.rm, 1); MethodKit.save(); renderTop(); }));
        h.querySelectorAll('[data-up]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.up;[S.top[i - 1], S.top[i]] = [S.top[i], S.top[i - 1]]; MethodKit.save(); renderTop(); }));
        h.querySelectorAll('[data-down]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.down;[S.top[i + 1], S.top[i]] = [S.top[i], S.top[i + 1]]; MethodKit.save(); renderTop(); }));
    }

    /* ---------- 3 ---------- */
    function renderProfile() {
        const list = S.top.length === 5 ? S.top : S.selected;
        if (!list.length) { $('gp-profile').innerHTML = note('info', 'Pick talents first.'); return; }
        const c = counts(list); const total = list.length; const sorted = [...DOMAINS].sort((a, b) => c[b.id] - c[a.id]);
        const cAll = counts(S.selected);
        $('gp-profile').innerHTML = `<div class="mk-faint" style="margin-bottom:8px">Basis: ${S.top.length === 5 ? 'deine Top 5' : `alle ${total} gewählten Talente`}</div><div class="gp-bars">${sorted.map(d => `<div class="gp-bar-row"><span class="gp-bar-l">${d.ic} ${d.t}</span><div class="gp-bar"><i style="width:${c[d.id] / total * 100}%;background:${d.c}"></i></div><strong>${c[d.id]}</strong>${S.top.length === 5 && cAll[d.id] !== c[d.id] ? `<small>(${cAll[d.id]} gesamt)</small>` : '<small></small>'}</div>`).join('')}</div>` +
            `<div class="mk-result" style="margin-top:12px"><h4>${sorted[0].ic} Dominant domain: ${sorted[0].t}</h4>${sorted[0].insight}${c[sorted[1].id] && c[sorted[1].id] >= c[sorted[0].id] - 1 ? `<div style="margin-top:6px">Fast gleichauf: <strong>${sorted[1].t}</strong>. ${{ 'exec+infl': 'You get things done and get others to pull along – a doer profile.', 'exec+rel': 'You deliver – and bring people along. A profile for team leadership.', 'exec+strat': 'You think ahead and implement. You need someone to get it heard.', 'infl+rel': 'You move people – outward and inward. Make sure things actually get finished.', 'infl+strat': 'You see where things are heading and convince others of it. A visionary profile.', 'rel+strat': 'You understand people and connections. Your lever: someone who turns your insights into action.' }[[sorted[0].id, sorted[1].id].sort().join('+')] || ''}</div>` : ''}</div>` +
            (c[sorted[3].id] === 0 ? note('info', `<strong>${sorted[3].ic} ${sorted[3].t}: no talent.</strong> That's not a weakness, it's information: ${sorted[3].need} Step 4 shows who takes that on for you.`) : '');
    }
    function renderDetail() {
        if (!S.top.length) { $('gp-detail').innerHTML = note('info', 'First rank your top 5 in step 2.'); return; }
        $('gp-detail').innerHTML = S.top.map((nm, i) => { const t = T(nm); const m = S.mine[nm] || ''; return `<div class="gp-det" style="--c:${t.d.c}"><div class="gp-det-h"><span class="gp-rank">${i + 1}</span><b>${t.name}</b><small>${t.d.ic} ${t.d.t}</small></div><p>${t.desc}.</p><div class="gp-shadow"><b>Shadow side</b>${t.shadow}</div><input class="mk-input" data-mine="${nm}" value="${esc(m)}" placeholder="How do you notice ${t.name} bei dir konkret? Eine Situation."></div>`; }).join('');
        $('gp-detail').querySelectorAll('[data-mine]').forEach(inp => inp.addEventListener('input', () => { S.mine[inp.dataset.mine] = inp.value; MethodKit.save(); }));
    }

    /* ---------- 4 ---------- */
    function renderTeam() {
        const list = S.top.length === 5 ? S.top : S.selected;
        if (!list.length) { $('gp-team').innerHTML = note('info', 'Pick talents first.'); return; }
        const c = counts(list); const weak = [...DOMAINS].sort((a, b) => c[a.id] - c[b.id]).filter(d => c[d.id] <= Math.min(...Object.values(c)));
        $('gp-team').innerHTML = weak.map(d => `<div class="gp-need" style="--c:${d.c}"><div class="gp-need-h"><span>${d.ic}</span><div><b>${d.t}</b> – ${c[d.id] === 0 ? 'bei dir nicht vertreten' : `bei dir schwach (${c[d.id]})`}</div></div><p>${d.need}</p><div class="mk-faint">Typical talents: ${d.t34.slice(0, 4).map(x => x[0]).join(', ')} …</div><input class="mk-input" data-partner="${d.id}" value="${esc(S.partners[d.id] || '')}" placeholder="Who around you has this? Name – and what you'll involve them for."></div>`).join('') +
            (weak.every(d => (S.partners[d.id] || '').trim()) ? note('ok', 'You have someone for every weak domain. That\'s the Gallup way: don\'t fix weaknesses, complement them.') : note('info', 'Whoever you\'re missing doesn\'t have to be on your team – a mentor, a friend or a sparring partner is often enough.'));
        $('gp-team').querySelectorAll('[data-partner]').forEach(inp => { inp.addEventListener('input', () => { S.partners[inp.dataset.partner] = inp.value; MethodKit.save(); }); inp.addEventListener('change', renderTeam); });
    }
    function renderSummary() {
        if (!S.top.length) { $('gp-summary').innerHTML = ''; return; }
        const t1 = T(S.top[0]);
        $('gp-summary').innerHTML = `<div class="mk-result" style="margin-top:12px"><h4>Your profile</h4><div class="gp-sum">${S.top.map((nm, i) => `<span style="--c:${T(nm).d.c}">${i + 1}. ${nm}</span>`).join('')}</div>${S.aim ? `<div style="margin-top:8px"><b>Diese Woche (${t1.name}):</b> ${esc(S.aim)}</div>` : ''}${S.watch ? `<div><b>Achte auf:</b> ${esc(S.watch)}</div>` : `<div class="mk-faint">Schattenseite von ${t1.name}: ${t1.shadow}</div>`}</div>`;
    }
    function renderLinks() { $('gp-links').innerHTML = LINKS.map(x => `<a class="mk-option gp-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const c = counts(S.top.length === 5 ? S.top : S.selected);
        const L = ['CLIFTONSTRENGTHS DOMAINS', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '', 'TOP 5'];
        S.top.forEach((nm, i) => { const t = T(nm); L.push(`${i + 1}. ${nm} (${t.d.t})`, `   ${t.desc}`, `   Shadow side: ${t.shadow}`, S.mine[nm] ? `   For me: ${S.mine[nm]}` : ''); });
        L.push('', 'DOMAINS'); DOMAINS.forEach(d => L.push(`${d.ic} ${d.t}: ${c[d.id]} – ${d.t34.filter(x => S.selected.includes(x[0])).map(x => x[0]).join(', ') || '–'}`));
        const P = Object.entries(S.partners).filter(([, v]) => v); if (P.length) { L.push('', 'COMPLEMENT'); P.forEach(([id, v]) => L.push(`${DOMAINS.find(d => d.id === id).t}: ${v}`)); }
        if (S.aim) L.push('', 'This week: ' + S.aim); if (S.watch) L.push('Watch out for: ' + S.watch);
        MethodKit.exportText('gallup-staerken.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'gallup-strengths', accent: '#6366f1', accent2: '#0ea5e9',
            steps: [{ icon: '🔎', label: 'Talents' }, { icon: '🏆', label: 'Top 5' }, { icon: '📊', label: 'Profile' }, { icon: '🤝', label: 'Team' }],
            defaultState: { selected: [], top: [], mine: {}, partners: {}, aim: '', watch: '' }
        });
        S = MethodKit.state;
        ['selected', 'top'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        ['mine', 'partners'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        S.selected = S.selected.filter(nm => T(nm)); S.top = S.top.filter(nm => T(nm)).slice(0, 5);
        MethodKit.bindFields();
        $('gp-export').addEventListener('click', exportAll);
        ['gp-aim', 'gp-watch'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 1) renderGroups();
            if (k === 2) renderTop();
            if (k === 3) { renderProfile(); renderDetail(); }
            if (k === 4) { renderTeam(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
