/* Lösungsfokussiertes Coaching · Logik (Kit-basiert) */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const NEG = /\b(nicht|nie|kein|keine|keinen|weniger|aufhören|loswerden|ohne|vermeiden|weg|los|endlich nicht)\b/i;
    const VAGUE = /\b(entspannter|glücklicher|besser|zufriedener|ruhiger|gelassener|selbstbewusster|erfolgreicher)\b/i;
    const CRIT = [
        { id: 'positive', l: 'Phrased positively', d: 'It describes what will be there – not what should be missing.' },
        { id: 'concrete', l: 'Concrete & observable', d: 'Someone with a camera could see it.' },
        { id: 'mine', l: 'In my hands', d: 'It depends on my behavior, not on others.' }
    ];
    const PERSP = [
        { id: 'self', icon: '🪞', l: 'You yourself', q: 'What do you do differently on miracle day – from waking up to falling asleep?' },
        { id: 'close', icon: '🤍', l: 'Someone close to you', q: 'How would your partner, best friend, or child notice the miracle has happened – without you saying it?' },
        { id: 'work', icon: '💼', l: 'Someone from work', q: 'How would a colleague or a supervisor notice the difference?' },
        { id: 'stranger', icon: '👤', l: 'A stranger', q: 'What would someone see who doesn’t know you and watches you that day?' }
    ];
    const SCALE_Q = [
        { k: 'already', l: 'Why are you already at this number and not at 0? What already works?', h: 'Everything that separates you from 0 is already solution.' },
        { k: 'onepoint', l: 'How would you notice you’ve moved one point further?', h: 'Not at 10 – just one point. What would be different then?' },
        { k: 'others', l: 'How would others notice you’ve moved one point further?', h: '' },
        { k: 'enough', l: 'At which number would you be satisfied enough to stop?', h: 'Rarely 10. Often 7 or 8.' }
    ];
    const COMPL_SEEDS = ['I have looked at the topic honestly', 'I have persisted when it was hard', 'I have asked for help', 'I have recognized exceptions', 'I have not given up', 'I have still taken care of others', 'I have made a start'];
    const STEP_TYPES = [
        { id: 'do', icon: '▶️', l: 'Do something', d: 'Consciously repeat a behavior from an exception or the miracle day.' },
        { id: 'observe', icon: '👀', l: 'Observe', d: 'Just watch: when is it a bit better this week – and what’s different then?' },
        { id: 'pretend', icon: '🎭', l: 'Act as if', d: 'On a secret day, act as if the scale were one point higher. Watch who notices.' },
        { id: 'coin', icon: '🪙', l: 'Coin toss', d: 'Toss every morning: heads = play miracle day, tails = normal. Compare in the evening.' }
    ];
    const LINKS = [
        { m: 'SMART goals', l: '../goal-setting/goal-setting.html', why: 'Make the next step measurable.' },
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'Make exceptions the rule.' },
        { m: 'Resource analysis', l: '../resource-analysis/resource-analysis.html', why: 'Systematically collect what carries you.' },
        { m: 'Rubicon model', l: '../rubikon-model/rubikon-model.html', why: 'Get from wanting to doing.' },
        { m: 'Systemic coaching', l: '../systemic-coaching/systemic-coaching.html', why: 'When other people play a role.' }
    ];
    const todayKey = () => new Date().toISOString().slice(0, 10);
    const fmt = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }); };
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };

    /* ---------- 1 · Ziel-Check ---------- */
    function renderGoalCheck() {
        const g = (S.goal || '').trim();
        const hints = [];
        if (g && NEG.test(g)) hints.push({ t: 'warn', m: 'There’s a negation in there (“' + g.match(NEG)[0] + '"). Try: What do you do <em>instead</em>, when the problem is gone?' });
        if (g && VAGUE.test(g)) hints.push({ t: 'info', m: '„' + g.match(VAGUE)[0] + '" is a feeling. How would you <em>see it</em>? What do you then do, specifically?' });
        if (g && !hints.length && g.length > 20) hints.push({ t: 'ok', m: 'Sounds like a goal, not a problem. Check it below with the three questions.' });
        $('sf-goal-check').innerHTML = hints.map(h => `<div class="mk-note ${h.t}"><i class="fas ${h.t === 'ok' ? 'fa-check-circle' : h.t === 'warn' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i><span>${h.m}</span></div>`).join('');
        $('sf-goal-crit').innerHTML = CRIT.map(c => `<button class="sf-check ${S.crit[c.id] ? 'on' : ''}" data-crit="${c.id}"><span class="box"><i class="fas fa-check"></i></span><span><strong>${c.l}</strong><small>${c.d}</small></span></button>`).join('');
        $('sf-goal-crit').querySelectorAll('[data-crit]').forEach(b => b.addEventListener('click', () => { S.crit[b.dataset.crit] = !S.crit[b.dataset.crit]; MethodKit.save(); renderGoalCheck(); }));
    }

    /* ---------- 2 · Wunderfrage ---------- */
    function renderMiracle() {
        $('sf-miracle').innerHTML = PERSP.map(p => `<div class="sf-persp"><div class="sf-persp-head"><span class="ic">${p.icon}</span><div><strong>${p.l}</strong><div class="mk-faint">${p.q}</div></div></div><textarea class="mk-textarea" data-mp="${p.id}" placeholder="…">${esc(S.miracleP[p.id] || '')}</textarea></div>`).join('');
        $('sf-miracle').querySelectorAll('[data-mp]').forEach(t => t.addEventListener('input', () => { S.miracleP[t.dataset.mp] = t.value; MethodKit.save(); }));
        MethodKit._autosizeAll();
    }
    function renderSigns() {
        const list = S.signs;
        $('sf-signs').innerHTML = `
            ${list.length ? list.map(s => `<div class="mk-row sf-sign"><span class="sf-sign-ic">✨</span><span class="grow">${esc(s.text)}</span><label class="sf-sign-now" title="Does this already happen sometimes today?"><input type="checkbox" data-now="${s.id}" ${s.now ? 'checked' : ''}> schon manchmal</label><button class="mk-iconbtn" data-rm="${s.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>`).join('') : '<div class="mk-empty">No signs yet. Take one or two concrete things from each of the four perspectives above.</div>'}
            <div class="sf-add"><input class="mk-input" id="sf-sign-add" placeholder="e.g. At 9 a.m. I open the most important task before I read emails" maxlength="140"><button class="mk-btn mk-btn-primary" id="sf-sign-addbtn"><i class="fas fa-plus"></i></button></div>
            ${list.some(s => s.now) ? `<div class="mk-note ok" style="margin-top:12px"><i class="fas fa-check-circle"></i><span>${list.filter(s => s.now).length} deiner Wunderzeichen passieren heute schon manchmal. Das sind deine Ausnahmen – wir schauen sie in Schritt 4 genauer an.</span></div>` : ''}`;
        const add = () => { const v = $('sf-sign-add').value.trim(); if (!v) return; S.signs.push({ id: MethodKit.uid(), text: v, now: false }); MethodKit.save(); renderSigns(); $('sf-sign-add').focus(); };
        $('sf-sign-addbtn').addEventListener('click', add);
        $('sf-sign-add').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(); } });
        $('sf-signs').querySelectorAll('[data-now]').forEach(cb => cb.addEventListener('change', () => { const s = S.signs.find(x => x.id === cb.dataset.now); if (s) { s.now = cb.checked; MethodKit.save(); renderSigns(); } }));
        $('sf-signs').querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { S.signs = S.signs.filter(x => x.id !== b.dataset.rm); MethodKit.save(); renderSigns(); }));
    }

    /* ---------- 3 · Skala ---------- */
    function renderScale() {
        const cur = n(S.scale, 3), low = S.lowest == null ? null : n(S.lowest, 0), enough = S.enoughN == null ? null : n(S.enoughN, 8);
        $('sf-scale').innerHTML = `
            <div class="sf-scale-vis">
                <div class="sf-track"><i class="fill" style="width:${cur * 10}%"></i>
                    ${low != null ? `<span class="mark low" style="left:${low * 10}%" title="Low point">${low}</span>` : ''}
                    <span class="mark cur" style="left:${cur * 10}%">${cur}</span>
                    ${enough != null ? `<span class="mark enough" style="left:${enough * 10}%" title="Good enough">${enough}</span>` : ''}
                </div>
                <div class="sf-ticks">${Array.from({ length: 11 }, (_, i) => `<span>${i}</span>`).join('')}</div>
                <div class="sf-ends"><span>Decision to change something</span><span>Miracle has happened</span></div>
            </div>
            <div class="sf-scale-rows">
                <label><span>Today</span><input type="range" class="mk-range" min="0" max="10" value="${cur}" data-sc="scale"><b>${cur}</b></label>
                <label><span>Lowest point so far</span><input type="range" class="mk-range low" min="0" max="10" value="${low == null ? 0 : low}" data-sc="lowest"><b>${low == null ? '–' : low}</b></label>
                <label><span>Good enough to stop</span><input type="range" class="mk-range enough" min="0" max="10" value="${enough == null ? 8 : enough}" data-sc="enoughN"><b>${enough == null ? '–' : enough}</b></label>
            </div>
            ${low != null && cur > low ? `<div class="mk-note ok"><i class="fas fa-arrow-up"></i><span>Du bist schon ${cur - low} Punkt${cur - low > 1 ? 'e' : ''} über deinem Tiefpunkt. <strong>Wie hast du das geschafft?</strong> – das gehört in die erste Frage unten.</span></div>` : ''}
            ${enough != null && cur >= enough ? `<div class="mk-note ok"><i class="fas fa-flag-checkered"></i><span>Du stehst bei oder über deinem „gut genug". Vielleicht geht es jetzt eher ums Halten als ums Weiterkommen.</span></div>` : ''}`;
        $('sf-scale').querySelectorAll('[data-sc]').forEach(r => r.addEventListener('input', () => { S[r.dataset.sc] = n(r.value, 0); MethodKit.save(); renderScale(); }));
    }
    function renderScaleQ() {
        $('sf-scale-q').innerHTML = SCALE_Q.map(q => `<div class="mk-field"><label for="sf-q-${q.k}">${q.l}</label>${q.h ? `<span class="hint">${q.h}</span>` : ''}<textarea class="mk-textarea" id="sf-q-${q.k}" data-sq="${q.k}" placeholder="…">${esc(S[q.k] || '')}</textarea></div>`).join('');
        $('sf-scale-q').querySelectorAll('[data-sq]').forEach(t => t.addEventListener('input', () => { S[t.dataset.sq] = t.value; MethodKit.save(); }));
        MethodKit._autosizeAll();
    }
    function renderSide() {
        const c = n(S.confidence, 5), i = n(S.importance, 7);
        let hint = '';
        if (i >= 7 && c <= 4) hint = 'Important, but little confidence: make the next step smaller – so small that confidence rises to 7.';
        else if (i <= 4) hint = 'Low importance: maybe this isn’t the topic that really occupies you. What would be more important?';
        else if (c >= 8 && i >= 7) hint = 'Important and confident – good conditions. What are you waiting for?';
        $('sf-side').innerHTML = `
            <div class="sf-side-grid">
                <label><span>How <strong>confident</strong> are you (0–10) that you’ll move one point further?</span><div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" value="${c}" data-side="confidence"><span class="mk-range-val">${c}</span></div></label>
                <label><span>How <strong>important</strong> is this topic to you (0–10)?</span><div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" value="${i}" data-side="importance"><span class="mk-range-val">${i}</span></div></label>
            </div>
            ${hint ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>${hint}</span></div>` : ''}`;
        $('sf-side').querySelectorAll('[data-side]').forEach(r => r.addEventListener('input', () => { S[r.dataset.side] = n(r.value, 5); MethodKit.save(); renderSide(); }));
    }

    /* ---------- 4 · Ausnahmen ---------- */
    function renderExceptions() {
        const list = S.exc;
        $('sf-exceptions').innerHTML = `
            ${list.map((e, i) => `<div class="sf-exc">
                <div class="sf-exc-head"><strong>Ausnahme ${i + 1}</strong><button class="mk-iconbtn" data-rme="${e.id}" aria-label="Delete"><i class="fas fa-trash"></i></button></div>
                <div class="mk-grid-2">
                    <div class="mk-field"><label>Wann war es besser?</label><input class="mk-input" data-e="${e.id}" data-f="when" value="${esc(e.when || '')}" placeholder="e.g. Last Tuesday morning"></div>
                    <div class="mk-field"><label>Was war da anders?</label><input class="mk-input" data-e="${e.id}" data-f="what" value="${esc(e.what || '')}" placeholder="Circumstances, place, people, mood"></div>
                </div>
                <div class="mk-field"><label>Was hast <strong>du</strong> dazu beigetragen?</label><span class="hint">Die wichtigste Spalte. Auch „zufällige" Exceptions usually contain something you did.</span><input class="mk-input" data-e="${e.id}" data-f="me" value="${esc(e.me || '')}" placeholder="e.g. Ich hatte den Abend davor den Schreibtisch aufgeräumt"></div>
                <label class="sf-repeat"><input type="checkbox" data-rep="${e.id}" ${e.repeat ? 'checked' : ''}> Das könnte ich bewusst wiederholen</label>
            </div>`).join('')}
            <button class="mk-btn mk-btn-outline" id="sf-exc-add"><i class="fas fa-plus"></i> Add exception</button>
            ${S.signs.some(s => s.now) && !list.length ? `<div class="mk-note info" style="margin-top:12px"><i class="fas fa-lightbulb"></i><span>Du hast in Schritt 2 markiert, dass „${esc(S.signs.find(s => s.now).text)}" heute schon manchmal passiert. Wann zuletzt? Das ist deine erste Ausnahme.</span></div>` : ''}`;
        $('sf-exc-add').addEventListener('click', () => { S.exc.push({ id: MethodKit.uid(), when: '', what: '', me: '', repeat: false }); MethodKit.save(); renderExceptions(); const inputs = $('sf-exceptions').querySelectorAll('input.mk-input'); if (inputs.length) inputs[inputs.length - 3].focus(); });
        $('sf-exceptions').querySelectorAll('[data-e]').forEach(el => el.addEventListener('input', () => { const e = S.exc.find(x => x.id === el.dataset.e); if (e) { e[el.dataset.f] = el.value; MethodKit.save(); renderInsight(); } }));
        $('sf-exceptions').querySelectorAll('[data-rep]').forEach(cb => cb.addEventListener('change', () => { const e = S.exc.find(x => x.id === cb.dataset.rep); if (e) { e.repeat = cb.checked; MethodKit.save(); renderInsight(); } }));
        $('sf-exceptions').querySelectorAll('[data-rme]').forEach(b => b.addEventListener('click', () => { S.exc = S.exc.filter(x => x.id !== b.dataset.rme); MethodKit.save(); renderExceptions(); renderInsight(); }));
        renderInsight();
    }
    function renderInsight() {
        const mine = S.exc.filter(e => (e.me || '').trim());
        const rep = S.exc.filter(e => e.repeat && (e.me || '').trim());
        $('sf-exc-insight').innerHTML = !S.exc.length ? '<div class="mk-empty">Once you enter exceptions, you’ll see here what they have in common.</div>' : `
            <div class="sf-insight">
                <div><b>${S.exc.length}</b><span>Ausnahme${S.exc.length > 1 ? 'n' : ''}</span></div>
                <div><b>${mine.length}</b><span>with your own contribution</span></div>
                <div><b>${rep.length}</b><span>repeatable</span></div>
            </div>
            ${rep.length ? `<div class="mk-result"><h4>Deine wiederholbaren Lösungsbausteine</h4><ul class="sf-list">${rep.map(e => `<li>${esc(e.me)}</li>`).join('')}</ul><div class="mk-faint" style="margin-top:6px;font-size:13px">Einer davon ist vermutlich dein nächster Schritt (Schritt 6).</div></div>` : mine.length ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Mark the exceptions you could consciously repeat.</span></div>' : '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>None of the exceptions so far mention what <strong>you</strong>  did. Look again carefully – “chance” is rarely the whole answer.</span></div>'}`;
    }

    /* ---------- 5 · Komplimente ---------- */
    function renderCompliments() {
        $('sf-compliments').innerHTML = `
            <div class="mk-chips">${S.compl.map((c, i) => `<span class="mk-chip selected sf-compl">${esc(c)}<button data-rmc="${i}" aria-label="Remove"><i class="fas fa-times"></i></button></span>`).join('')}</div>
            <div class="sf-add" style="margin-top:10px"><input class="mk-input" id="sf-compl-add" placeholder="I have … (specifically)" maxlength="120"><button class="mk-btn mk-btn-primary" id="sf-compl-addbtn"><i class="fas fa-plus"></i></button></div>
            <div class="mk-section-label" style="margin-top:14px">Suggestions</div>
            <div class="mk-chips">${COMPL_SEEDS.filter(s => !S.compl.includes(s)).map(s => `<button class="mk-chip" data-seed="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div>`;
        const add = (v) => { v = (v || '').trim(); if (!v || S.compl.includes(v)) return; S.compl.push(v); MethodKit.save(); renderCompliments(); };
        $('sf-compl-addbtn').addEventListener('click', () => add($('sf-compl-add').value));
        $('sf-compl-add').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(ev.target.value); } });
        $('sf-compliments').querySelectorAll('[data-seed]').forEach(b => b.addEventListener('click', () => add(b.dataset.seed)));
        $('sf-compliments').querySelectorAll('[data-rmc]').forEach(b => b.addEventListener('click', () => { S.compl.splice(+b.dataset.rmc, 1); MethodKit.save(); renderCompliments(); }));
    }

    /* ---------- 6 · Schritt & Verlauf ---------- */
    function renderStep() {
        const rep = S.exc.filter(e => e.repeat && (e.me || '').trim());
        const st = S.nextStep;
        $('sf-step').innerHTML = `
            <div class="mk-section-label">Type of step</div>
            <div class="mk-grid sf-types">${STEP_TYPES.map(t => `<button class="mk-option ${st.type === t.id ? 'selected' : ''}" data-type="${t.id}"><span class="ic">${t.icon}</span><span class="t">${t.l}</span><span class="d">${t.d}</span></button>`).join('')}</div>
            ${rep.length && !st.text ? `<div class="mk-note info" style="margin-top:12px"><i class="fas fa-lightbulb"></i><span>Aus deinen Ausnahmen: ${rep.map(e => `<button class="mk-chip sf-sugg" data-sugg="${esc(e.me)}">${esc(e.me)}</button>`).join(' ')}</span></div>` : ''}
            <div class="mk-field" style="margin-top:14px"><label for="sf-step-text">What exactly do you do?</label><input class="mk-input" id="sf-step-text" value="${esc(st.text || '')}" placeholder="Small, concrete, in the next 7 days"></div>
            <div class="mk-grid-2">
                <div class="mk-field"><label for="sf-step-when">When?</label><input class="mk-input" type="date" id="sf-step-when" value="${esc(st.when || '')}"></div>
                <div class="mk-field"><label for="sf-step-sign">How do you notice it has worked?</label><input class="mk-input" id="sf-step-sign" value="${esc(st.sign || '')}" placeholder="A miracle sign or +1 on the scale"></div>
            </div>
            ${st.text ? `<div class="mk-result"><h4>Dein Plan</h4>${STEP_TYPES.find(t => t.id === st.type)?.icon || '▶️'} <strong>${esc(st.text)}</strong>${st.when ? ' · to ' + fmt(st.when) : ''}${st.sign ? '<br><span class="mk-faint">Success sign: ' + esc(st.sign) + '</span>' : ''}</div>` : ''}`;
        $('sf-step').querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => { st.type = b.dataset.type; MethodKit.save(); renderStep(); }));
        $('sf-step').querySelectorAll('[data-sugg]').forEach(b => b.addEventListener('click', () => { st.text = b.dataset.sugg; st.type = st.type || 'do'; MethodKit.save(); renderStep(); }));
        $('sf-step-text').addEventListener('input', e => { st.text = e.target.value; MethodKit.save(); });
        $('sf-step-text').addEventListener('change', renderStep);
        $('sf-step-when').addEventListener('input', e => { st.when = e.target.value; MethodKit.save(); renderStep(); });
        $('sf-step-sign').addEventListener('input', e => { st.sign = e.target.value; MethodKit.save(); });
    }
    function renderLog() {
        const log = S.log; const cur = n(S.scale, 3);
        const last = log[log.length - 1];
        const canLog = !last || last.date !== todayKey();
        let chart = '';
        if (log.length >= 2) {
            const W = 520, H = 140, P = 24; const xs = (i) => P + (i / (log.length - 1)) * (W - 2 * P); const ys = (v) => H - P - (v / 10) * (H - 2 * P);
            chart = `<svg viewBox="0 0 ${W} ${H}" class="sf-chart" role="img" aria-label="Skalenverlauf">${[0, 5, 10].map(v => `<line x1="${P}" x2="${W - P}" y1="${ys(v)}" y2="${ys(v)}" class="grid"/><text x="${P - 6}" y="${ys(v) + 4}" class="ax">${v}</text>`).join('')}<polyline points="${log.map((e, i) => `${xs(i)},${ys(e.v)}`).join(' ')}" class="line"/>${log.map((e, i) => `<circle cx="${xs(i)}" cy="${ys(e.v)}" r="4" class="pt"><title>${fmt(e.date)} · ${e.v}</title></circle>`).join('')}${log.map((e, i) => (i === 0 || i === log.length - 1 || log.length <= 7) ? `<text x="${xs(i)}" y="${H - 6}" class="ax" text-anchor="middle">${fmt(e.date)}</text>` : '').join('')}</svg>`;
        }
        $('sf-log').innerHTML = `
            ${chart || `<div class="mk-empty">${log.length ? 'From the second entry you’ll see your history here.' : 'No entry yet.'}</div>`}
            <div class="sf-log-row">
                <span>Today I’m at</span>
                <div class="mk-range-wrap" style="flex:1"><input type="range" class="mk-range" min="0" max="10" id="sf-log-v" value="${cur}"><span class="mk-range-val" id="sf-log-val">${cur}</span></div>
                <button class="mk-btn mk-btn-primary mk-btn-sm" id="sf-log-save" ${canLog ? '' : 'disabled title="Already entered today"'}><i class="fas fa-plus"></i> Enter</button>
            </div>
            ${last && log.length >= 2 ? `<div class="mk-field" style="margin-top:12px"><label for="sf-better">Was ist seit dem letzten Mal besser geworden – auch nur ein bisschen?</label><textarea class="mk-textarea" id="sf-better" placeholder="…">${esc(S.better || '')}</textarea></div>` : ''}
            ${log.length ? `<div class="sf-log-list">${log.slice().reverse().slice(0, 6).map(e => `<span class="mk-chip">${fmt(e.date)} · <b>${e.v}</b></span>`).join('')}</div>` : ''}`;
        $('sf-log-v').addEventListener('input', e => { $('sf-log-val').textContent = e.target.value; });
        $('sf-log-save').addEventListener('click', () => {
            const v = n($('sf-log-v').value, cur); const prev = last ? last.v : null;
            S.log.push({ date: todayKey(), v }); S.scale = v; MethodKit.save({ now: true });
            MethodKit.toast(prev != null && v > prev ? `Logged · +${v - prev} since ${fmt(last.date)} 🎉` : 'Entered', 'success'); renderLog();
        });
        const b = $('sf-better'); if (b) b.addEventListener('input', () => { S.better = b.value; MethodKit.save(); });
    }
    function renderLinks() { $('sf-links').innerHTML = LINKS.map(l => `<a class="mk-option sf-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }

    /* ---------- Export ---------- */
    function exportAll() {
        const L = ['SOLUTION-FOCUSED COACHING', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), ''];
        if (S.topic) L.push('CONCERN', S.topic, ''); if (S.goal) L.push('GOAL (instead)', S.goal, 'Check questions: ' + CRIT.map(c => (S.crit[c.id] ? '✓ ' : '○ ') + c.l).join(' · '), '');
        L.push('MIRACLE QUESTION'); PERSP.forEach(p => { if (S.miracleP[p.id]) L.push('- ' + p.l + ': ' + S.miracleP[p.id]); }); if (S.signs.length) L.push('Miracle signs: ' + S.signs.map(s => s.text + (s.now ? ' (already sometimes)' : '')).join('; ')); L.push('');
        L.push('SCALE', `Today: ${n(S.scale, 3)}/10` + (S.lowest != null ? ` · Low point: ${S.lowest}` : '') + (S.enoughN != null ? ` · Good enough: ${S.enoughN}` : '') + ` · Confidence: ${n(S.confidence, 5)} · Importance: ${n(S.importance, 7)}`);
        SCALE_Q.forEach(q => { if (S[q.k]) L.push('- ' + q.l, '  ' + S[q.k]); }); L.push('');
        if (S.exc.length) { L.push('EXCEPTIONS'); S.exc.forEach((e, i) => L.push(`${i + 1}. ${e.when || '?'} – ${e.what || ''}${e.me ? ' · Mein Beitrag: ' + e.me : ''}${e.repeat ? ' · wiederholbar' : ''}`)); L.push(''); }
        if (S.compl.length) L.push('COMPLIMENTS', ...S.compl.map(c => '- ' + c), ''); if (S.coping) L.push('Coping: ' + S.coping); if (S.keep) L.push('Should stay as is: ' + S.keep);
        const st = S.nextStep; if (st.text) L.push('', 'NEXT STEP', `${STEP_TYPES.find(t => t.id === st.type)?.l || ''}: ${st.text}${st.when ? ' · bis ' + st.when : ''}${st.sign ? ' · Erfolgszeichen: ' + st.sign : ''}`);
        if (S.log.length) L.push('', 'HISTORY', ...S.log.map(e => `${e.date}: ${e.v}/10`)); if (S.better) L.push('Got better: ' + S.better);
        MethodKit.exportText('loesungsfokus.txt', L.join('\n'));
    }

    /* ---------- Init ---------- */
    (async function () {
        await MethodKit.init({
            method: 'solution-focused',
            accent: '#10b981', accent2: '#0ea5e9',
            steps: [{ icon: '🎯', label: 'Concern' }, { icon: '✨', label: 'Miracle' }, { icon: '📏', label: 'Scale' }, { icon: '🔍', label: 'Exceptions' }, { icon: '💐', label: 'Resources' }, { icon: '👣', label: 'Step' }],
            defaultState: { topic: '', goal: '', crit: {}, miracle: '', miracleP: {}, signs: [], scale: 3, lowest: null, enoughN: null, already: '', onepoint: '', others: '', enough: '', confidence: 5, importance: 7, exc: [], compl: [], coping: '', keep: '', nextStep: {}, log: [], better: '' }
        });
        S = MethodKit.state;
        ['crit', 'miracleP', 'nextStep'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        ['signs', 'exc', 'compl', 'log'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        // Migration: altes Freitext-Wunder und alte Ausnahmen/Step übernehmen
        if (S.miracle && !S.miracleP.self) S.miracleP.self = S.miracle;
        if (typeof S.exceptions === 'string' && S.exceptions.trim() && !S.exc.length) { S.exc.push({ id: MethodKit.uid(), when: '', what: S.exceptions.trim(), me: '', repeat: false }); delete S.exceptions; }
        if (typeof S.step === 'string' && S.step.trim() && !S.nextStep.text) { S.nextStep.text = S.step.trim(); S.nextStep.type = 'do'; delete S.step; }

        MethodKit.bindFields();
        $('sf-goal').addEventListener('input', renderGoalCheck);
        renderGoalCheck(); renderMiracle(); renderSigns();
        MethodKit.onStep = function (k) {
            if (k === 2) renderSigns();
            if (k === 3) { renderScale(); renderScaleQ(); renderSide(); }
            if (k === 4) renderExceptions();
            if (k === 5) renderCompliments();
            if (k === 6) { renderStep(); renderLog(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
        $('sf-export').addEventListener('click', exportAll);
    })();
})();
