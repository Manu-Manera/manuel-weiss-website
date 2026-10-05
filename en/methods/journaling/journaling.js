/* Journaling · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S, timer = null, tLeft = 0;

    const MODES = {
        morning: { ic: '🌅', t: 'Morning pages', d: 'Three pages, unfiltered, without stopping. Empty your head before the day fills it.', c: '#f59e0b', p: ['Just start writing – what\'s on your mind right now?', 'What do I really want today – beyond the to-do list?', 'What worries me today, and which part of it can I influence?', 'How does my body feel right now?'] },
        evening: { ic: '🌙', t: 'Evening reflection', d: 'Sort the day before it settles in your sleep.', c: '#6366f1', p: ['What went well today – and what did I contribute to it?', 'What annoyed me today, and what does that say about me?', 'What am I deliberately leaving undone today?', 'Which moment today was real?', 'What would I do differently today?'] },
        gratitude: { ic: '🙏', t: 'Gratitude', d: 'Three concrete things. Not “my family”, but “the way my daughter laughed today”.', c: '#10b981', p: ['Three things I\'m grateful for today – as concrete as possible.', 'Who did something good for me today without having to?', 'What did I take for granted today that isn\'t?', 'What brought me joy today that cost nothing?'] },
        free: { ic: '✍️', t: 'Free', d: 'No prompt, no rule. You know what it\'s about.', c: '#22c55e', p: [''] },
        prompt: { ic: '💡', t: 'Prompt', d: 'A question that goes deeper than everyday life.', c: '#ec4899', p: ['What would I do if I weren\'t afraid?', 'Which story do I tell myself about me that is no longer true?', 'What do I want to be able to say about today a year from now?', 'Who do I need to say something to – and what?', 'What do I envy in others, and what does that reveal about my wishes?', 'What would I thank myself for in ten years?', 'What am I avoiding right now – and what is it costing me?', 'When was I last fully myself? What was different then?'] }
    };
    const MOOD = ['😞', '😕', '😐', '🙂', '😄'];
    const STOP = new Set('the a an and or but if then than that this these those there here where when what which who whom whose why how all any both each few more most other some such only own same so too very can will just should now not no nor of at by for with about against between into through during before after above below to from up down in out on off over under again further once is are was were be been being have has had having do does did doing i me my myself we our ours ourselves you your yours yourself yourselves he him his himself she her hers herself it its itself they them their theirs themselves am would could might must shall may also because while until although though since really actually simply already even still yet always never often sometimes maybe perhaps quite rather pretty much many little less lot today tomorrow yesterday thing things something anything nothing everything someone anyone everyone get got getting go going went gone come came make made making say said saying know think thought feel felt want wanted like one two three four five'.split(' '));
    const POS = /\b(dankbar|froh|freu\w*|glücklich|zufrieden|stolz|ruhig|gelassen|leicht|erleichtert|liebe|lachen|gelacht|schön|wunderbar|energie|kraft|klar|frei|verbunden|gut|besser|gelungen|geschafft|mutig|hoffnung|neugierig|inspiriert|warm|wohl)\w*/gi;
    const NEG = /(?<![a-zäöüß])(angst|sorge\w*|müde|erschöpft|traurig|wütend|ärger\w*|genervt|frustriert|allein|einsam|überfordert|druck|stress\w*|schwer|schlecht|schlimm|hilflos|leer|zweifel\w*|scham|schuld\w*|verletzt|enttäuscht|unsicher|panik|nervös|streit|verloren)\w*/gi;
    const LINKS = [
        { m: 'Emotional intelligence', l: '../emotional-intelligence/emotional-intelligence.html', why: 'The feelings diary with precise words.' },
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'Make writing a daily routine.' },
        { m: 'Mindfulness', l: '../mindfulness/mindfulness.html', why: 'Notice before you write.' },
        { m: 'Values compass', l: '../values-clarification/values-clarification.html', why: 'When a topic keeps coming back: which value is behind it?' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const words = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;
    const dayKey = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
    const M = (k) => MODES[k] || MODES.free;
    function streak() { const days = new Set(S.entries.map(e => dayKey(e.date))); let s = 0; const d = new Date(); if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1); while (days.has(dayKey(d))) { s++; d.setDate(d.getDate() - 1); } return s; }
    function themes(entries, k) { const f = {}; entries.forEach(e => (e.text || '').toLowerCase().replace(/[^a-zäöüß\s-]/g, ' ').split(/\s+/).forEach(w => { if (w.length >= 4 && !STOP.has(w)) f[w] = (f[w] || 0) + 1; })); return Object.entries(f).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, k || 8); }
    const emo = (t) => ({ p: ((t || '').match(POS) || []).length, n: ((t || '').match(NEG) || []).length });

    /* ---------- 1 ---------- */
    function renderWrite() {
        const D = S.draft, m = M(D.mode); const prompts = m.p.filter(Boolean); const prompt = prompts.length ? prompts[n(D.pi, 0) % prompts.length] : '';
        const w = words(D.text);
        $('jo-write').innerHTML = `<div class="jo-modes">${Object.entries(MODES).map(([k, x]) => `<button class="jo-mode ${D.mode === k ? 'on' : ''}" style="--c:${x.c}" data-mode="${k}"><span>${x.ic}</span><b>${x.t}</b></button>`).join('')}</div><p class="mk-sub">${m.d}</p>` +
            (prompt ? `<div class="jo-prompt" style="--c:${m.c}"><span>${esc(prompt)}</span>${prompts.length > 1 ? `<button class="mk-iconbtn" id="jo-next-p" aria-label="Another prompt" title="Another prompt"><i class="fas fa-shuffle"></i></button>` : ''}</div>` : '') +
            `<div class="jo-mood"><span>Mood now</span><div>${MOOD.map((f, i) => `<button class="${D.before === i + 1 ? 'on' : ''}" data-mb="${i + 1}" aria-label="Stimmung ${i + 1}">${f}</button>`).join('')}</div></div>` +
            `<textarea class="mk-textarea jo-ta" id="jo-text" rows="8" placeholder="${D.mode === 'morning' ? 'Nicht nachdenken. Schreiben. Auch „ich weiss nicht, was ich schreiben soll" zählt.' : 'Schreib, wie du sprichst. Niemand liest mit.'}">${esc(D.text || '')}</textarea>` +
            `<div class="jo-bar"><span id="jo-wc">${w} Wörter</span><div class="jo-timer">${timer ? `<b id="jo-tl">${fmt(tLeft)}</b><button class="mk-btn mk-btn-outline mk-btn-sm" id="jo-tstop">Stopp</button>` : `<button class="mk-btn mk-btn-outline mk-btn-sm" id="jo-t5"><i class="fas fa-stopwatch"></i> 5-Min-Sprint</button><button class="mk-btn mk-btn-outline mk-btn-sm" id="jo-t10">10 Min</button>`}</div></div>` +
            (w >= 20 ? `<div class="jo-mood"><span>Mood afterwards</span><div>${MOOD.map((f, i) => `<button class="${D.after === i + 1 ? 'on' : ''}" data-ma="${i + 1}" aria-label="Mood afterwards ${i + 1}">${f}</button>`).join('')}</div></div>` : '') +
            writeNote(D, w) + `<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:10px"><button class="mk-btn mk-btn-primary" id="jo-save" ${w >= 5 ? '' : 'disabled'}><i class="fas fa-check"></i> Save entry</button><span class="mk-faint">${S.entries.length ? `${S.entries.length} Einträge · 🔥 ${streak()} Tage` : 'No entry yet'}</span></div>`;
        const host = $('jo-write');
        host.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { D.mode = b.dataset.mode; D.pi = Math.floor(Math.random() * 10); MethodKit.save(); renderWrite(); }));
        const np = $('jo-next-p'); if (np) np.addEventListener('click', () => { D.pi = n(D.pi, 0) + 1; MethodKit.save(); renderWrite(); });
        host.querySelectorAll('[data-mb]').forEach(b => b.addEventListener('click', () => { D.before = +b.dataset.mb; MethodKit.save(); renderWrite(); }));
        host.querySelectorAll('[data-ma]').forEach(b => b.addEventListener('click', () => { D.after = +b.dataset.ma; MethodKit.save(); renderWrite(); }));
        const ta = $('jo-text'); ta.addEventListener('input', () => { D.text = ta.value; const w2 = words(ta.value); $('jo-wc').textContent = w2 + ' Wörter'; $('jo-save').disabled = w2 < 5; MethodKit.save(); if ((w2 >= 20) !== (w >= 20)) renderWrite(); });
        const t5 = $('jo-t5'), t10 = $('jo-t10'), ts = $('jo-tstop'); if (t5) t5.addEventListener('click', () => startTimer(300)); if (t10) t10.addEventListener('click', () => startTimer(600)); if (ts) ts.addEventListener('click', stopTimer);
        $('jo-save').addEventListener('click', saveEntry);
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    function startTimer(sec) { tLeft = sec; stopTimer(false); timer = setInterval(() => { tLeft--; const el = $('jo-tl'); if (el) el.textContent = fmt(tLeft); if (tLeft <= 0) { stopTimer(); MethodKit.toast('Sprint over – finish the sentence, then save', 'ok'); } }, 1000); renderWrite(); $('jo-text').focus(); }
    function stopTimer(rerender) { if (timer) clearInterval(timer); timer = null; if (rerender !== false) renderWrite(); }
    function writeNote(D, w) {
        if (!w) return '';
        const t = D.text || '';
        if (D.mode === 'morning' && w < 150) return note('info', `${w} words. Morning pages live on quantity – aim for 300+, without pausing. The head only empties once the censor gives up.`);
        if (D.mode === 'gratitude' && !/\b(heute|gestern|als|wie|weil)\b/i.test(t) && w > 10) return note('info', 'Still general. Gratitude works when it\'s concrete: what exactly, when, how did it feel?');
        const q = (t.match(/\?/g) || []).length;
        if (q >= 4 && w < 120) return note('info', `${q} Questions, few answers. Take one of them and write three sentences that begin with “Maybe …”.`);
        const you = (t.match(/\b(man|du)\b/gi) || []).length, me = (t.match(/\b(ich|mir|mich)\b/gi) || []).length;
        if (w > 60 && you > me) return note('info', 'Lots of “one” and “you”, little “I”. That keeps things at a distance. What about you?');
        const e = emo(t);
        if (w > 50 && e.n >= 3 && !/\b(brauche|wünsche|möchte|will|könnte|werde|nächster? schritt)\b/i.test(t)) return note('info', 'A lot of weight in the text – good that it\'s out. One sentence to finish: “What I need now is …”');
        if (w >= 100 && D.after && D.before && D.after > D.before) return note('ok', `Mood from ${MOOD[D.before - 1]} auf ${MOOD[D.after - 1]} – the writing worked.`);
        if (w >= 100) return note('ok', `${w} words. Enter your mood afterwards – the difference is the real measure.`);
        return '';
    }
    function saveEntry() {
        const D = S.draft; const w = words(D.text); if (w < 5) return;
        const m = M(D.mode); const prompts = m.p.filter(Boolean);
        S.entries.push({ id: MethodKit.uid(), date: Date.now(), mode: D.mode || 'free', prompt: prompts.length ? prompts[n(D.pi, 0) % prompts.length] : '', text: D.text.trim(), before: D.before || 0, after: D.after || 0, words: w });
        const lift = D.after && D.before ? D.after - D.before : 0;
        S.draft = { mode: D.mode, pi: n(D.pi, 0) + 1, text: '', before: 0, after: 0 };
        MethodKit.save({ now: true }); MethodKit.toast(lift > 0 ? `Gespeichert · Stimmung +${lift}` : `Gespeichert · 🔥 ${streak()} Tage`, 'ok'); renderWrite();
    }

    /* ---------- 2 ---------- */
    function renderStats() {
        const E = S.entries; if (E.length < 3) { $('jo-stats').innerHTML = note('info', `${E.length} entries. Patterns show up from about three – keep writing.`); return; }
        const tw = E.reduce((a, e) => a + (e.words || words(e.text)), 0), withMood = E.filter(e => e.before && e.after), lift = withMood.length ? withMood.reduce((a, e) => a + e.after - e.before, 0) / withMood.length : null;
        const byMode = {}; E.forEach(e => { const k = e.mode || 'free'; byMode[k] = byMode[k] || { n: 0, lift: 0, nl: 0, w: 0 }; byMode[k].n++; byMode[k].w += e.words || words(e.text); if (e.before && e.after) { byMode[k].lift += e.after - e.before; byMode[k].nl++; } });
        const best = Object.entries(byMode).filter(([, v]) => v.nl >= 2).sort((a, b) => b[1].lift / b[1].nl - a[1].lift / a[1].nl)[0];
        const th = themes(E); const recent = E.slice(-7), older = E.slice(0, -7);
        const er = recent.reduce((a, e) => { const x = emo(e.text); a.p += x.p; a.n += x.n; return a; }, { p: 0, n: 0 }), eo = older.reduce((a, e) => { const x = emo(e.text); a.p += x.p; a.n += x.n; return a; }, { p: 0, n: 0 });
        const ratio = (x) => (x.p + x.n) ? Math.round(x.p / (x.p + x.n) * 100) : null;
        const wd = [0, 0, 0, 0, 0, 0, 0]; E.forEach(e => wd[new Date(e.date).getDay()]++); const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        const hours = E.map(e => new Date(e.date).getHours()); const morningShare = hours.filter(h => h < 12).length / E.length;
        $('jo-stats').innerHTML = `<div class="jo-stats"><div><b>${E.length}</b><span>Einträge</span></div><div><b>${streak()}</b><span>day streak</span></div><div><b>${Math.round(tw / E.length)}</b><span>Ø words</span></div><div><b>${lift === null ? '–' : (lift > 0 ? '+' : '') + lift.toFixed(1)}</b><span>Ø mood</span></div></div>` +
            `<div class="mk-section-label">Modes</div><div class="jo-modestats">${Object.entries(byMode).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `<div style="--c:${M(k).c}"><span>${M(k).ic}</span><b>${M(k).t}</b><small>${v.n}× · Ø ${Math.round(v.w / v.n)} W.${v.nl ? ` · Stimmung ${v.lift === 0 ? '±0' : (v.lift / v.nl > 0 ? '+' : '') + (v.lift / v.nl).toFixed(1)}` : ''}</small></div>`).join('')}</div>` +
            (th.length ? `<div class="mk-section-label">Topics that keep coming back</div><div class="jo-themes">${th.map(([w, c]) => `<button class="mk-chip" data-theme="${esc(w)}" style="font-size:${12 + Math.min(c, 6)}px">${esc(w)} <small>${c}</small></button>`).join('')}</div>` : '') +
            `<div class="mk-section-label">Weekdays</div><div class="jo-wd">${WD.map((d, i) => `<div><i style="height:${Math.max(3, wd[i] / Math.max(...wd) * 40)}px"></i><span>${d}</span></div>`).join('')}</div>` +
            statsNote({ E, lift, best, th, ratio, er, eo, morningShare, byMode });
        $('jo-stats').querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => { S.deep.theme = b.dataset.theme; MethodKit.save(); MethodKit.goTo(4); }));
    }
    function statsNote(x) {
        let out = '';
        if (x.best && x.best[1].lift / x.best[1].nl >= 0.8) out += note('ok', `<strong>${M(x.best[0]).t}</strong> helps you most: mood on average +${(x.best[1].lift / x.best[1].nl).toFixed(1)}. When you're feeling low, that's your mode.`);
        if (x.lift !== null && x.lift <= 0 && x.E.filter(e => e.before && e.after).length >= 4) out += note('info', 'Your mood doesn\'t rise while writing. Check: are you circling or sorting? Brooding in written form doesn\'t help – a sentence “What I need now” at the end does.');
        const rr = x.ratio(x.er), ro = x.ratio(x.eo);
        if (rr !== null && ro !== null && x.eo.p + x.eo.n >= 5) { if (rr - ro >= 20) out += note('ok', `The tone has brightened: ${ro} % → ${rr} % positive feeling words in the latest entries.`); else if (ro - rr >= 20) out += note('warn', `The latest entries are noticeably heavier than before (${ro} % → ${rr} % positive). Take that seriously – and talk to someone, not just to the paper.`); }
        if (x.th.length && x.th[0][1] >= 4) out += note('info', `„<strong>${esc(x.th[0][0])}</strong>" appears ${x.th[0][1]}×. A topic that comes back this often isn't done. Tap the word – step 4 follows up on it.`);
        if (Object.keys(x.byMode).length === 1 && x.E.length >= 6) out += note('info', `You always write in the same mode (${M(Object.keys(x.byMode)[0]).t}). Probier einen anderen – Dankbarkeit und Morgenseiten wirken völlig verschieden.`);
        if (x.morningShare >= 0.8 && x.E.length >= 5 && !x.byMode.evening) out += note('info', 'You write almost only in the morning. An evening entry now and then closes the day – and you sleep better.');
        return out || note('ok', 'Keep collecting – the more entries, the clearer the patterns.');
    }

    /* ---------- 3 ---------- */
    function renderLog() {
        const E = [...S.entries].reverse(); const f = S.filter || {}; const list = E.filter(e => (!f.mode || e.mode === f.mode) && (!f.q || (e.text || '').toLowerCase().includes(f.q.toLowerCase())));
        $('jo-log').innerHTML = `<div class="jo-filter"><input class="mk-input" id="jo-q" value="${esc(f.q || '')}" placeholder="Search …"><div class="mk-chips"><button class="mk-chip ${!f.mode ? 'selected' : ''}" data-fm="">All</button>${Object.entries(MODES).map(([k, x]) => `<button class="mk-chip ${f.mode === k ? 'selected' : ''}" data-fm="${k}">${x.ic} ${x.t}</button>`).join('')}</div></div>` +
            (!list.length ? '<div class="mk-empty">No entries.</div>' : list.map(e => { const open = S.open === e.id; const m = M(e.mode); return `<div class="jo-e ${open ? 'open' : ''}" style="--c:${m.c}"><button class="jo-e-h" data-open="${e.id}"><span>${m.ic}</span><div><b>${new Date(e.date).toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · ${new Date(e.date).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</b><small>${esc((e.text || '').slice(0, open ? 0 : 110))}${!open && (e.text || '').length > 110 ? '…' : ''}</small></div><em>${e.before ? MOOD[e.before - 1] : ''}${e.before && e.after ? '→' + MOOD[e.after - 1] : ''}</em></button>${open ? `<div class="jo-e-b">${e.prompt ? `<div class="jo-e-p">${esc(e.prompt)}</div>` : ''}<p>${esc(e.text).replace(/\n/g, '<br>')}</p><div class="jo-e-f"><span class="mk-faint">${e.words || words(e.text)} Wörter</span><button class="mk-btn mk-btn-outline mk-btn-sm" data-deep="${e.id}"><i class="fas fa-magnifying-glass"></i> Vertiefen</button><button class="mk-btn mk-btn-danger mk-btn-sm" data-del="${e.id}"><i class="fas fa-trash"></i></button></div></div>` : ''}</div>`; }).join(''));
        const host = $('jo-log');
        $('jo-q').addEventListener('input', e => { S.filter = S.filter || {}; S.filter.q = e.target.value; MethodKit.save(); renderLog(); const i = $('jo-q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); });
        host.querySelectorAll('[data-fm]').forEach(b => b.addEventListener('click', () => { S.filter = S.filter || {}; S.filter.mode = b.dataset.fm; MethodKit.save(); renderLog(); }));
        host.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { S.open = S.open === b.dataset.open ? '' : b.dataset.open; MethodKit.save(); renderLog(); }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { if (!confirm('Delete entry?')) return; S.entries = S.entries.filter(e => e.id !== b.dataset.del); MethodKit.save(); renderLog(); }));
        host.querySelectorAll('[data-deep]').forEach(b => b.addEventListener('click', () => { const e = S.entries.find(x => x.id === b.dataset.deep); S.deep.entry = e.id; S.deep.theme = ''; MethodKit.save(); MethodKit.goTo(4); }));
    }

    /* ---------- 4 ---------- */
    function renderDeep() {
        const D = S.deep; const th = themes(S.entries, 10); const entry = D.entry ? S.entries.find(e => e.id === D.entry) : null;
        const related = D.theme ? S.entries.filter(e => (e.text || '').toLowerCase().includes(D.theme)) : [];
        $('jo-deep').innerHTML = `<div class="mk-field"><label>Which topic?</label><div class="mk-chips">${th.map(([w, c]) => `<button class="mk-chip ${D.theme === w ? 'selected' : ''}" data-th="${esc(w)}">${esc(w)} <small>${c}</small></button>`).join('')}<input class="mk-input jo-th-in" id="jo-th-custom" value="${th.some(([w]) => w === D.theme) ? '' : esc(D.theme || '')}" placeholder="or your own topic …"></div></div>` +
            (entry ? `<div class="jo-e-p">Starting point: entry from ${new Date(entry.date).toLocaleDateString('de-CH')}<br><small>${esc(entry.text.slice(0, 200))}${entry.text.length > 200 ? '…' : ''}</small></div>` : '') +
            (related.length ? `<div class="jo-rel">${related.slice(-3).reverse().map(e => { const i = e.text.toLowerCase().indexOf(D.theme); const s = Math.max(0, i - 60); return `<div><small>${new Date(e.date).toLocaleDateString('en-GB')}</small>…${esc(e.text.slice(s, i))}<mark>${esc(e.text.slice(i, i + D.theme.length))}</mark>${esc(e.text.slice(i + D.theme.length, i + D.theme.length + 60))}…</div>`; }).join('')}</div>` : '') +
            ((D.theme || entry) ? `<div class="mk-field"><label>1 · What is the core? What is it really about – beneath what I write?</label><textarea class="mk-textarea" data-dq="core" rows="2">${esc(D.core || '')}</textarea></div><div class="mk-field"><label>2 · What do I need – not: what should others do?</label><textarea class="mk-textarea" data-dq="need" rows="2">${esc(D.need || '')}</textarea></div><div class="mk-field"><label>3 · One small step in the next three days</label><input class="mk-input" data-dq="step" value="${esc(D.step || '')}" placeholder="Concretely: what, when, with whom?"></div>${deepNote(D)}<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center"><button class="mk-btn mk-btn-primary" id="jo-deep-save" ${(D.core || '').trim() && (D.step || '').trim() ? '' : 'disabled'}><i class="fas fa-check"></i> Save deep dive</button></div>` : note('info', 'Pick a topic from your entries – or enter one.')) +
            (S.reflections.length ? `<div class="mk-section-label" style="margin-top:16px">Previous deep dives</div>${S.reflections.slice().reverse().slice(0, 5).map(r => `<div class="jo-refl"><b>${esc(r.theme || 'Eintrag')}</b> <small>${new Date(r.date).toLocaleDateString('en-GB')}</small><div>${esc(r.core)}</div>${r.step ? `<div class="mk-faint">→ ${esc(r.step)}</div>` : ''}</div>`).join('')}` : '');
        const host = $('jo-deep');
        host.querySelectorAll('[data-th]').forEach(b => b.addEventListener('click', () => { D.theme = D.theme === b.dataset.th ? '' : b.dataset.th; D.entry = ''; MethodKit.save(); renderDeep(); }));
        $('jo-th-custom').addEventListener('change', e => { D.theme = e.target.value.trim().toLowerCase(); D.entry = ''; MethodKit.save(); renderDeep(); });
        host.querySelectorAll('[data-dq]').forEach(el => { el.addEventListener('input', () => { D[el.dataset.dq] = el.value; MethodKit.save(); const b = $('jo-deep-save'); if (b) b.disabled = !((D.core || '').trim() && (D.step || '').trim()); }); el.addEventListener('change', renderDeep); });
        const sv = $('jo-deep-save'); if (sv) sv.addEventListener('click', () => { S.reflections.push({ id: MethodKit.uid(), date: Date.now(), theme: D.theme, entry: D.entry, core: D.core, need: D.need, step: D.step }); S.deep = { theme: '', entry: '', core: '', need: '', step: '' }; MethodKit.save({ now: true }); MethodKit.toast('Deep dive saved', 'ok'); renderDeep(); });
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function deepNote(D) {
        const c = (D.core || '').trim(), nd = (D.need || '').trim(), s = (D.step || '').trim();
        if (!c) return '';
        if (c.length < 25) return note('info', 'Still on the surface. Ask “And what is this really about?” – twice.');
        if (nd && /\b(er|sie|man|andere|chef|partner|kollege|mein mann|meine frau)\b.*\b(soll|sollte|muss|müsste)\b/i.test(nd)) return note('info', 'That\'s what others should do. What do <em>you</em> need – regardless of whether they do it?');
        if (s && /(?<![a-zäöüß])(überlegen|nachdenken|schauen|versuchen|mehr|weniger)\b/i.test(s) && s.length < 50) return note('info', '“Think about / try / more” is not a step. What exactly do you do, and when?');
        if (c && nd && s) return note('ok', 'Core, need, step – the topic now has a direction.');
        return '';
    }

    /* ---------- 5 ---------- */
    function renderRitual() {
        const R = S.ritual || {}; const E = S.entries;
        $('jo-ritual').innerHTML = `<p class="mk-sub">Journaling works through regularity, not length. When is your slot for it?</p><div class="mk-chips">${[['morning', '🌅 Morgens, vor dem Handy'], ['lunch', '☀️ Mittagspause'], ['evening', '🌙 Abends, vor dem Schlafen'], ['weekly', '📅 Sonntags, länger']].map(([k, t]) => `<button class="mk-chip ${R.slot === k ? 'selected' : ''}" data-slot="${k}">${t}</button>`).join('')}</div><div class="mk-field" style="margin-top:12px"><label>Minimum on bad days</label><input class="mk-input" id="jo-min" value="${esc(R.min || '')}" placeholder="e.g. three sentences – no more"></div>` +
            `<div class="mk-result"><h4>Your journal</h4><div class="jo-stats small"><div><b>${E.length}</b><span>Einträge</span></div><div><b>${streak()}</b><span>day streak</span></div><div><b>${E.reduce((a, e) => a + (e.words || words(e.text)), 0).toLocaleString('de-CH')}</b><span>Wörter</span></div><div><b>${S.reflections.length}</b><span>Deep dives</span></div></div>${E.length ? `<div class="mk-faint" style="font-size:13px">Seit ${new Date(Math.min(...E.map(e => e.date))).toLocaleDateString('en-GB')} · Lieblingsmodus: ${M(Object.entries(E.reduce((a, e) => { a[e.mode] = (a[e.mode] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1])[0][0]).t}</div>` : ''}</div>` +
            (R.slot && (R.min || '').trim() ? note('ok', 'A fixed slot and a minimum – that\'s how the ritual survives busy weeks too.') : note('info', 'The minimum is the trick: three sentences on bad days – and the chain doesn\'t break.'));
        $('jo-ritual').querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', () => { S.ritual = S.ritual || {}; S.ritual.slot = S.ritual.slot === b.dataset.slot ? '' : b.dataset.slot; MethodKit.save(); renderRitual(); }));
        $('jo-min').addEventListener('input', e => { S.ritual = S.ritual || {}; S.ritual.min = e.target.value; MethodKit.save(); }); $('jo-min').addEventListener('change', renderRitual);
    }
    function renderLinks() { $('jo-links').innerHTML = LINKS.map(x => `<a class="mk-option jo-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['MY JOURNAL', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), `${S.entries.length} Einträge`, ''];
        S.entries.forEach(e => { L.push(`── ${new Date(e.date).toLocaleString('de-CH')} · ${M(e.mode).t}${e.before ? ` · Stimmung ${e.before}${e.after ? '→' + e.after : ''}` : ''}`); if (e.prompt) L.push(`[${e.prompt}]`); L.push(e.text, ''); });
        if (S.reflections.length) { L.push('', 'DEEP DIVES'); S.reflections.forEach(r => L.push(`── ${new Date(r.date).toLocaleDateString('de-CH')} · ${r.theme || 'Eintrag'}`, `Core: ${r.core}`, r.need ? `Need: ${r.need}` : '', r.step ? `Step: ${r.step}` : '', '')); }
        MethodKit.exportText('journal.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'journaling', accent: '#22c55e', accent2: '#84cc16',
            steps: [{ icon: '✍️', label: 'Writing' }, { icon: '🔍', label: 'Patterns' }, { icon: '📖', label: 'Verlauf' }, { icon: '🪞', label: 'Go deeper' }, { icon: '🔁', label: 'Ritual' }],
            defaultState: { entries: [], draft: { mode: 'evening', pi: 0, text: '', before: 0, after: 0 }, filter: {}, open: '', deep: { theme: '', entry: '', core: '', need: '', step: '' }, reflections: [], ritual: {} }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.entries)) S.entries = [];
        S.entries = S.entries.filter(e => e && (e.text || '').trim()).map(e => Object.assign({ id: MethodKit.uid(), date: Date.now(), mode: 'free', prompt: '', before: 0, after: 0 }, e, { words: e.words || words(e.text), date: typeof e.date === 'string' ? (Date.parse(e.date) || Date.now()) : e.date }));
        if (!S.draft || typeof S.draft !== 'object') S.draft = { mode: 'evening', pi: 0, text: '', before: 0, after: 0 }; if (!S.deep || typeof S.deep !== 'object') S.deep = { theme: '', entry: '', core: '', need: '', step: '' };
        if (!Array.isArray(S.reflections)) S.reflections = []; if (!S.filter) S.filter = {}; if (!S.ritual) S.ritual = {}; delete S.promptIdx;
        $('jo-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k !== 1 && timer) stopTimer(false);
            if (k === 1) renderWrite();
            if (k === 2) renderStats();
            if (k === 3) renderLog();
            if (k === 4) renderDeep();
            if (k === 5) { renderRitual(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
