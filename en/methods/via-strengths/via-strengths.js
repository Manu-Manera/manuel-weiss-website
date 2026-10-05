/* VIA-Charakterstärken · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const VIRTUES = [
        { id: 'wis', ic: '🦉', t: 'Wisdom & knowledge', c: '#6366f1', s: [['Creativity', 'Finding new, productive ways of doing things', 'Cook without a recipe today · Solve an everyday problem in a way you have never tried'], ['Curiosity', 'Interest in everything that is; joy of discovery', 'Take an unfamiliar way home · Ask someone three questions you normally wouldn’t dare to'], ['Judgement', 'Thinking things through, looking at them from all sides', 'Consciously argue the opposite of your opinion today · Actively look for an argument against your conviction'], ['Love of learning', 'Acquiring new skills and knowledge – for their own sake', 'Learn ten words of a foreign language · Watch a documentary about something that never interested you'], ['Perspective', 'Giving wise counsel to others, seeing the big picture', 'Ask someone struggling with a decision three questions instead of giving an answer']] },
        { id: 'cou', ic: '🦁', t: 'Courage', c: '#ef4444', s: [['Bravery', 'Not shrinking from threat or pain, standing up for what is right', 'Address something uncomfortable you have been putting off for weeks'], ['Perseverance', 'Finishing what one has started', 'Finish a task that has been lying around today – completely'], ['Honesty', 'Telling the truth, being authentic', 'Say “I don’t know” or “I got that wrong” once today'], ['Zest', 'Living with energy and enthusiasm', 'Do something physical that wakes you up before the day really starts']] },
        { id: 'hum', ic: '❤️', t: 'Humanity', c: '#ec4899', s: [['Capacity to love', 'Valuing close relationships, giving and accepting closeness', 'Write to someone what you appreciate about them – for no reason'], ['Kindness', 'Doing favours for others, caring', 'Do something nice for someone who will never find out'], ['Social intelligence', 'Perceiving the motives and feelings of others', 'In a conversation, observe only the body language – and name what you see']] },
        { id: 'jus', ic: '⚖️', t: 'Justice', c: '#f59e0b', s: [['Teamwork', 'Working well as a member of a group, being loyal', 'Take on a task in the team that nobody wants'], ['Fairness', 'Treating everyone equally, without bias', 'Listen today to the position of someone you normally don’t listen to'], ['Leadership', 'Organising groups and leading them to the goal', 'Bring a meeting that is going in circles to the point']] },
        { id: 'tem', ic: '🧘', t: 'Temperance', c: '#10b981', s: [['Forgiveness', 'Forgiving those who have done wrong', 'Consciously let go of a small slight today – without commenting on it'], ['Modesty', 'Letting achievements speak for themselves', 'Talk about a success today without mentioning yourself – pass the praise on'], ['Prudence', 'Being careful, not saying or doing anything one might regret', 'Count to three before every answer in a difficult conversation'], ['Self-regulation', 'Steering feelings and actions', 'Skip a habit once today – coffee, phone, snack – and observe what happens']] },
        { id: 'tra', ic: '✨', t: 'Transcendence', c: '#8b5cf6', s: [['Appreciation of beauty', 'Perceiving and appreciating beauty and excellence', 'Stop for three minutes today in front of something beautiful you usually walk past'], ['Gratitude', 'Being aware of the good and expressing it', 'Write down three things that were good today – and why'], ['Hope', 'Expecting the best and working towards it', 'Describe what a problem looks like solved in a year – in detail'], ['Humour', 'Laughing and making others laugh', 'Tell someone what funny thing happened to you today'], ['Spirituality', 'Having beliefs about the meaning and purpose of life', 'Take five minutes of silence in which you do nothing – just be']] }
    ];
    const ALL = []; VIRTUES.forEach(v => v.s.forEach(([name, d, ex]) => ALL.push({ name, d, ex, v })));
    const LEVELS = [[1, 'kaum'], [2, 'etwas'], [3, 'teils'], [4, 'ziemlich'], [5, 'totally me']];
    const CRIT = [['real', 'Feels real', '“This is really me” – not “this is what I should be”'], ['energy', 'Gives energy', 'When using it I feel alive, not exhausted'], ['want', 'I like to use it', 'I look for opportunities to use it – voluntarily']];
    const LINKS = [
        { m: 'Finding strengths', l: '../strengths-finder/strengths-finder.html', why: 'Sort strengths by energy, performance and use.' },
        { m: 'Gratitude & mindfulness', l: '../mindfulness/mindfulness.html', why: 'Train transcendence strengths.' },
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'Turn the new application into a routine.' },
        { m: 'Ikigai', l: '../ikigai/ikigai.html', why: 'Connect strengths with meaning.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const r = (name) => n(S.ratings[name], 0);
    const ratedCount = () => ALL.filter(x => r(x.name)).length;
    const ranked = () => ALL.filter(x => r(x.name)).sort((a, b) => r(b.name) - r(a.name));
    const sigTest = (name) => { const c = S.sigTest[name] || {}; return CRIT.filter(k => c[k[0]]).length; };
    const signatures = () => ranked().filter(x => sigTest(x.name) === 3).map(x => x.name);

    /* ---------- 1 ---------- */
    function renderRate() {
        $('via-rate').innerHTML = VIRTUES.map(v => `<div class="via-grp" style="--c:${v.c}"><div class="via-grp-h"><span>${v.ic}</span><b>${v.t}</b></div>${v.s.map(([name, d]) => `<div class="via-row"><div class="via-row-l"><b>${name}</b><small>${d}</small></div><div class="via-lv">${LEVELS.map(([x, l]) => `<button class="${r(name) === x ? 'on' : ''}" data-rn="${name}" data-x="${x}" aria-label="${name} ${l}">${l}</button>`).join('')}</div></div>`).join('')}</div>`).join('') +
            (ratedCount() === ALL.length ? (() => { const vals = ALL.map(x => r(x.name)); const high = vals.filter(v => v === 5).length; return high > 8 ? note('info', `${high} strengths with “totally me”. With more than 8 a stricter look is worthwhile – signature strengths are the ones that stand out.`) : high === 0 ? note('info', 'Not a single “totally me”? Modesty is a strength – but somewhere you are more you than elsewhere. Which three would friends name?') : note('ok', 'All 24 rated. On to the profile.'); })() : `<div class="mk-faint" style="text-align:center">${ratedCount()}/24 rated</div>`);
        $('via-rate').querySelectorAll('[data-rn]').forEach(b => b.addEventListener('click', () => { S.ratings[b.dataset.rn] = +b.dataset.x; MethodKit.save(); renderRate(); }));
    }

    /* ---------- 2 ---------- */
    function renderProfile() {
        if (ratedCount() < 12) { $('via-profile').innerHTML = note('info', `Rate at least half of the strengths (${ratedCount()}/24) – then your profile appears.`); return; }
        const vs = VIRTUES.map(v => { const vals = v.s.map(([name]) => r(name)).filter(Boolean); return { v, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0, top: v.s.map(([name]) => name).filter(name => r(name) >= 4) }; }).sort((a, b) => b.avg - a.avg);
        const cx = 150, cy = 150, R = 110; const pt = (i, val) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(a) * R * val / 5, cy + Math.sin(a) * R * val / 5]; };
        const ordered = VIRTUES.map(v => vs.find(x => x.v.id === v.id));
        $('via-profile').innerHTML = `<div class="via-radar"><svg viewBox="0 0 300 300">${[1, 2, 3, 4, 5].map(val => `<polygon points="${ordered.map((_, i) => pt(i, val).join(',')).join(' ')}" fill="none" stroke="var(--mk-line)"/>`).join('')}<polygon points="${ordered.map((x, i) => pt(i, x.avg).join(',')).join(' ')}" fill="rgba(139,92,246,.2)" stroke="var(--mk-accent)" stroke-width="2.5"/>${ordered.map((x, i) => { const [px, py] = pt(i, 6); return `<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="middle" font-size="20">${x.v.ic}</text>`; }).join('')}</svg><div class="via-vlist">${vs.map((x, i) => `<div class="via-vrow ${i === 0 ? 'top' : ''}" style="--c:${x.v.c}"><span>${x.v.ic}</span><div><b>${x.v.t}</b><small>${x.top.join(', ') || '–'}</small></div><strong>${x.avg.toFixed(1)}</strong></div>`).join('')}</div></div>` +
            note('info', `Your strongest virtue: <strong>${vs[0].v.ic} ${vs[0].v.t}</strong> (${vs[0].avg.toFixed(1)}/5). ${{ wis: 'You understand the world through the head – knowledge, perspectives, ideas. Make sure the heart comes along.', cou: 'You go where it gets uncomfortable. That is rare and valuable – and needs recovery phases.', hum: 'Relationships are your element. Don’t forget that you too need someone who takes care of you.', jus: 'You think in terms of we. Fairness and community matter more to you than your own advantage – good, as long as you don’t forget yourself.', tem: 'You have yourself under control – moderation, patience, forgiveness. The challenge: sometimes it takes excess.', tra: 'You see the bigger picture – beauty, meaning, hope. Bring it into everyday life, otherwise it stays theory.' }[vs[0].v.id]}`) +
            (vs[5].avg < 2.5 ? note('info', `Weakest virtue: ${vs[5].v.ic} ${vs[5].v.t} (${vs[5].avg.toFixed(1)}). This is not a call to work on it – VIA focuses on strengths. But: who in your environment has it? These people complement you.`) : '') +
            (vs[0].avg - vs[5].avg < 0.8 ? note('ok', 'A balanced profile across all six virtues. Your signature strengths will show more at the level of individual strengths than at virtue level.') : '');
    }

    /* ---------- 3 ---------- */
    function renderSig() {
        const rk = ranked(); if (rk.length < 5) { $('via-sig').innerHTML = note('info', 'Rate more strengths in step 1 first.'); return; }
        const cutoff = rk[Math.min(6, rk.length - 1)] ? r(rk[Math.min(6, rk.length - 1)].name) : 4;
        const cands = rk.filter(x => r(x.name) >= Math.max(4, cutoff)).slice(0, 8);
        const sigs = signatures();
        $('via-sig').innerHTML = `<div class="via-cands">${cands.map(x => { const c = S.sigTest[x.name] || {}; const k = sigTest(x.name); return `<div class="via-cand ${k === 3 ? 'sig' : ''}" style="--c:${x.v.c}"><div class="via-cand-h"><span>${x.v.ic}</span><b>${x.name}</b><small>${r(x.name)}/5</small>${k === 3 ? '<span class="via-badge">🏅 Signature</span>' : ''}</div><div class="via-crit">${CRIT.map(([id, t, d]) => `<label class="${c[id] ? 'on' : ''}" title="${d}"><input type="checkbox" data-sc="${x.name}" data-c="${id}" ${c[id] ? 'checked' : ''}> ${t}</label>`).join('')}</div></div>`; }).join('')}</div>` +
            (sigs.length === 0 ? note('info', 'No strength meets all three criteria yet. That is normal – many high scores are learned strengths that cost energy. Check honestly.') : sigs.length > 5 ? note('warn', `${sigs.length} signature strengths – more than five is rarely genuine. Which ones feel least like you when you read them?`) : sigs.length >= 3 ? note('ok', `${sigs.length} Signaturstärke${sigs.length > 1 ? 'n' : ''}: <strong>${sigs.join(', ')}</strong>. These are the ones that make you who you are.`) : note('ok', `${sigs.length} Signaturstärke${sigs.length > 1 ? 'n' : ''}: <strong>${sigs.join(', ')}</strong>. Check the other candidates – usually there are three to five.`)) +
            (cands.some(x => r(x.name) === 5 && sigTest(x.name) > 0 && sigTest(x.name) < 3 && !(S.sigTest[x.name] || {}).energy) ? note('info', `${cands.filter(x => r(x.name) === 5 && sigTest(x.name) > 0 && sigTest(x.name) < 3 && !(S.sigTest[x.name] || {}).energy).map(x => x.name).join(', ')}: "totally me" but gives no energy? That looks like a strength you have trained yourself – or that others expect from you.`) : '');
        $('via-sig').querySelectorAll('[data-sc]').forEach(cb => cb.addEventListener('change', () => { (S.sigTest[cb.dataset.sc] = S.sigTest[cb.dataset.sc] || {})[cb.dataset.c] = cb.checked; MethodKit.save(); renderSig(); }));
    }

    /* ---------- 4 ---------- */
    function renderWeek() {
        const sigs = signatures(); const pool = sigs.length ? sigs : ranked().slice(0, 5).map(x => x.name);
        if (!pool.length) { $('via-week').innerHTML = note('info', 'Determine your signature strengths first.'); return; }
        if (!S.week.strength || !pool.includes(S.week.strength)) S.week.strength = pool[0];
        const st = ALL.find(x => x.name === S.week.strength);
        const W = S.week; W.days = W.days || {};
        const doneDays = Object.values(W.days).filter(d => d && d.done).length;
        const started = W.start ? new Date(W.start) : null;
        const todayIdx = started ? Math.floor((Date.now() - started.getTime()) / 864e5) : -1;
        $('via-week').innerHTML = `<div class="mk-field"><label>Which strength?</label><div class="mk-chips">${pool.map(nm => `<button class="mk-chip ${W.strength === nm ? 'selected' : ''}" data-ws="${nm}">${nm}</button>`).join('')}</div></div>` +
            (st ? `<div class="via-ex" style="--c:${st.v.c}"><b>${st.v.ic} ${st.name}</b><small>${st.d}</small><div class="via-ex-ideas"><span class="mk-section-label">Ideas for new applications</span>${st.ex.split(' · ').map(e => `<div>· ${e}</div>`).join('')}</div></div>` : '') +
            (!W.start ? `<button class="mk-btn mk-btn-primary" id="via-start"><i class="fas fa-play"></i> Start the week</button>` : `<div class="via-days">${[0, 1, 2, 3, 4, 5, 6].map(i => { const d = W.days[i] || {}; const date = new Date(started.getTime() + i * 864e5); const isToday = i === todayIdx; const past = i < todayIdx; return `<div class="via-day ${d.done ? 'done' : ''} ${isToday ? 'today' : ''} ${past && !d.done ? 'missed' : ''}"><div class="via-day-h"><b>Tag ${i + 1}</b><small>${date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'numeric' })}</small><button class="via-check" data-dd="${i}" aria-label="Day ${i + 1} done">${d.done ? '✓' : ''}</button></div><input class="mk-input" data-dn="${i}" value="${esc(d.note || '')}" placeholder="How did you use ${st ? st.name : 'the strength'} in a new way today?"></div>`; }).join('')}</div>` +
                (doneDays === 7 ? note('ok', 'Seven out of seven. Research says: the effect on your well-being lasts up to six months – if you keep going. Which strength is next?') : todayIdx > 6 ? note('info', `The week is over – ${doneDays} of 7 days. ${doneDays >= 4 ? 'Good enough to notice something. Reflect in step 5.' : 'That’s okay. Start again – with a different strength or the same one.'}`) : todayIdx >= 2 && doneDays === 0 ? note('warn', 'Day 3 and nothing entered yet. The trick: don’t think big. One minute, one new way – that counts.') : doneDays ? note('ok', `${doneDays} Day${doneDays > 1 ? 'e' : ''} done. ${(W.days[todayIdx] || {}).done ? 'Done today.' : 'Still open today.'}`) : '') +
                `<button class="mk-btn mk-btn-outline mk-btn-sm" id="via-restart" style="margin-top:10px"><i class="fas fa-rotate"></i> Restart</button>`);
        $('via-week').querySelectorAll('[data-ws]').forEach(b => b.addEventListener('click', () => { if (W.start && W.strength !== b.dataset.ws && !confirm('Switch strength? The current week will be reset.')) return; if (W.strength !== b.dataset.ws) { W.strength = b.dataset.ws; W.start = null; W.days = {}; } MethodKit.save(); renderWeek(); }));
        const s = $('via-start'); if (s) s.addEventListener('click', () => { W.start = Date.now(); W.days = {}; MethodKit.save({ now: true }); renderWeek(); });
        const rs = $('via-restart'); if (rs) rs.addEventListener('click', () => { if (!confirm('Restart the week? Entries will be lost.')) return; S.history.push({ strength: W.strength, start: W.start, done: doneDays }); W.start = Date.now(); W.days = {}; MethodKit.save({ now: true }); renderWeek(); });
        $('via-week').querySelectorAll('[data-dd]').forEach(b => b.addEventListener('click', () => { const i = b.dataset.dd; W.days[i] = W.days[i] || {}; W.days[i].done = !W.days[i].done; MethodKit.save(); renderWeek(); }));
        $('via-week').querySelectorAll('[data-dn]').forEach(inp => inp.addEventListener('input', () => { const i = inp.dataset.dn; W.days[i] = W.days[i] || {}; W.days[i].note = inp.value; if (inp.value.trim() && !W.days[i].done) { W.days[i].done = true; inp.closest('.via-day').classList.add('done'); inp.closest('.via-day').querySelector('.via-check').textContent = '✓'; } MethodKit.save(); }));
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        const sigs = signatures(); const W = S.week; const doneDays = Object.values(W.days || {}).filter(d => d && d.done).length;
        $('via-summary').innerHTML = sigs.length || W.start ? `<div class="mk-result"><h4>Your VIA profile</h4>${sigs.length ? `<div><b>🏅 Signature strengths:</b> ${sigs.join(', ')}</div>` : ''}${W.start ? `<div style="margin-top:6px"><b>7-Tage-Übung:</b> ${esc(W.strength)} – ${doneDays}/7 Tage</div>${Object.entries(W.days).filter(([, d]) => d && d.note).map(([i, d]) => `<div class="mk-faint" style="margin-left:12px">Day ${+i + 1}: ${esc(d.note)}</div>`).join('')}` : ''}${S.history.length ? `<div class="mk-faint" style="margin-top:6px">Earlier weeks: ${S.history.map(h => `${h.strength} (${h.done}/7)`).join(', ')}</div>` : ''}${S.reflect ? `<div style="margin-top:8px"><b>Reflexion:</b> ${esc(S.reflect)}</div>` : ''}${S.next ? `<div><b>Next:</b> ${esc(S.next)}</div>` : ''}</div>` : '<div class="mk-empty">The summary fills up from the previous steps.</div>';
    }
    function renderLinks() { $('via-links').innerHTML = LINKS.map(x => `<a class="mk-option via-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const sigs = signatures(); const W = S.week;
        const L = ['VIA CHARACTER STRENGTHS', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), ''];
        VIRTUES.forEach(v => { L.push(`${v.ic} ${v.t.toUpperCase()}`); v.s.forEach(([name]) => L.push(`  ${name}: ${r(name) || '–'}/5${sigs.includes(name) ? '  🏅 Signatur' : ''}`)); L.push(''); });
        if (W.start) { L.push(`7-DAY EXERCISE: ${W.strength} (ab ${new Date(W.start).toLocaleDateString('de-CH')})`); Object.entries(W.days || {}).forEach(([i, d]) => { if (d && (d.done || d.note)) L.push(`  Day ${+i + 1}: ${d.done ? '✓ ' : ''}${d.note || ''}`); }); L.push(''); }
        if (S.reflect) L.push('Reflection: ' + S.reflect); if (S.next) L.push('Next: ' + S.next);
        MethodKit.exportText('via-staerken.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'via-strengths', accent: '#8b5cf6', accent2: '#ec4899',
            steps: [{ icon: '📋', label: 'Rate' }, { icon: '🕸️', label: 'Profile' }, { icon: '🏅', label: 'Signature' }, { icon: '📅', label: '7 days' }, { icon: '🌱', label: 'Reflection' }],
            defaultState: { ratings: {}, sigTest: {}, week: { strength: '', start: null, days: {} }, history: [], reflect: '', next: '' }
        });
        S = MethodKit.state;
        ['ratings', 'sigTest'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        if (!S.week || typeof S.week !== 'object') S.week = { strength: '', start: null, days: {} };
        if (!Array.isArray(S.history)) S.history = [];
        // Migration: altes selected/top → ratings 4/5
        if (Array.isArray(S.selected)) { S.selected.forEach(nm => { if (!S.ratings[nm]) S.ratings[nm] = 4; }); delete S.selected; }
        if (Array.isArray(S.top)) { S.top.forEach(nm => { S.ratings[nm] = 5; }); delete S.top; }
        if (S.newway && !S.reflect) { S.reflect = S.newway; delete S.newway; }
        MethodKit.bindFields();
        $('via-export').addEventListener('click', exportAll);
        ['via-reflect', 'via-next'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 1) renderRate();
            if (k === 2) renderProfile();
            if (k === 3) renderSig();
            if (k === 4) renderWeek();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
