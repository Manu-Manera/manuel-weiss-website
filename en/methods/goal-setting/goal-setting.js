/* Goal setting · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const CATS = { beruf: ['💼', 'Work'], gesundheit: ['💪', 'Health'], beziehungen: ['❤️', 'Relationships'], finanzen: ['💰', 'Finances'], bildung: ['📚', 'Learning'], hobby: ['🎨', 'Hobby'], persoenlich: ['🌱', 'Personal'] };
    const AVOID = /\b(nicht mehr|weniger|aufhören|loswerden|keine?n?|nie mehr|weg von|vermeiden|abnehmen|stoppen|los werden|kein)\b/i;
    const VAGUE = /(?<![a-zäöüß])(mehr|besser|öfter|gesünder|fitter|glücklicher|erfolgreicher|produktiver|entspannter|irgendwann|bald)\b/i;
    const VERB_STEP = /(?<![a-zäöüß])(anrufen|schreiben|buchen|anmelden|lesen|gehen|laufen|trainieren|kochen|planen|fragen|treffen|blocken|kündigen|beginnen|starten|recherchieren|aufsetzen|erstellen|einrichten|kaufen|bestellen|notieren|üben|üben|lernen|rufe|schreibe|buche|melde|lese|gehe|laufe|trainiere|koche|plane|frage|treffe|blocke|kündige|beginne|starte|recherchiere|erstelle|richte|kaufe|bestelle|notiere|übe|lerne|termin|mail|liste)\b/i;
    const LINKS = [
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'Anchor and track the supporting habit properly.' },
        { m: 'Values compass', l: '../values-clarification/values-clarification.html', why: 'If the why is thin: Which value sits behind the goal?' },
        { m: 'Rubicon model', l: '../rubikon-model/rubikon-model.html', why: 'From weighing options to action – when you hesitate.' },
        { m: 'Walt Disney method', l: '../walt-disney/walt-disney.html', why: 'Dreamer, realist, critic – when the goal is still big and fuzzy.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const tr = (s) => (s || '').trim();
    const days = (d) => d ? Math.round((new Date(d) - new Date().setHours(0, 0, 0, 0)) / 864e5) : null;
    const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '–';
    const isoPlus = (dd) => { const x = new Date(); x.setDate(x.getDate() + dd); return x.toISOString().slice(0, 10); };
    function smartScore() { const s = S.smart; let sc = 0; if (tr(S.title).length >= 15 && !VAGUE.test(S.title)) sc++; if (tr(s.m) && /\d/.test(s.m)) sc++; if (n(s.conf, 0) >= 5 && n(s.conf, 0) <= 9) sc++; if (tr(S.why).length >= 40) sc++; if (s.t && days(s.t) > 7) sc++; return sc; }
    function progress() { const ms = S.milestones.filter(m => tr(m.text)); const a = S.actions; const mp = ms.length ? ms.filter(m => m.done).length / ms.length : null; const ap = a.length ? a.filter(x => x.done).length / a.length : null; if (mp === null && ap === null) return null; if (mp === null) return Math.round(ap * 100); if (ap === null) return Math.round(mp * 100); return Math.round((mp * 0.7 + ap * 0.3) * 100); }
    function sentence() { const s = S.smart; if (!tr(S.title)) return ''; let out = `${tr(S.title).replace(/\.$/, '')} – by ${s.t ? fmtD(s.t) : '[Datum]'}`; if (tr(s.m)) out += `, measurable by: ${tr(s.m).replace(/\.$/, '')}`; if (tr(S.why)) out += `. Because ${tr(S.why).replace(/^weil\s+/i, '').replace(/\.$/, '')}`; return out + '.'; }

    /* ---------- 1 ---------- */
    function renderGoal() {
        $('gs-goal').innerHTML = `<div class="mk-field"><label>Life area</label><div class="mk-chips">${Object.entries(CATS).map(([k, [ic, t]]) => `<button class="mk-chip ${S.category === k ? 'selected' : ''}" data-cat="${k}">${ic} ${t}</button>`).join('')}</div></div>` +
            `<div class="mk-field"><label>My goal – one sentence, as concrete as possible</label><input class="mk-input gs-big" data-f="title" value="${esc(S.title || '')}" placeholder="e.g. Run a 10 km race in under 60 minutes"></div>` +
            `<div class="mk-field"><label>Why do I want this? What changes once I have achieved it?</label><textarea class="mk-textarea" data-f="why" rows="3" placeholder="Not “because it's healthy" – sondern: Was ist dann anders, in meinem Alltag, in mir?">${esc(S.why || '')}</textarea></div>` +
            `<div class="mk-field"><label>And why is <em>that</em> important to you? (One level deeper)</label><input class="mk-input" data-f="why2" value="${esc(S.why2 || '')}" placeholder="What's behind it – which value, which need?"></div>` + goalNote();
        const host = $('gs-goal');
        host.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => { S.category = S.category === b.dataset.cat ? '' : b.dataset.cat; MethodKit.save(); renderGoal(); }));
        host.querySelectorAll('[data-f]').forEach(el => { el.addEventListener('input', () => { S[el.dataset.f] = el.value; MethodKit.save(); }); el.addEventListener('change', renderGoal); });
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function goalNote() {
        const t = tr(S.title), w = tr(S.why), w2 = tr(S.why2);
        if (!t) return note('info', 'Write the goal so that a stranger could clearly say at the end: achieved or not.');
        let out = '';
        if (AVOID.test(t)) out += note('warn', `„${esc(t.match(AVOID)[0])}" – that's an away-from goal. The brain cannot steer toward “not”. Rephrase it: What do you do <em>instead</em>, what is then <em>there</em>?`);
        else if (VAGUE.test(t) && !/\d/.test(t)) out += note('info', `„${esc(t.match(VAGUE)[1])}" without a number – how would you notice that it's enough? Step 2 will clarify this, but the goal gets sharper if you name a measure now.`);
        else if (t.length < 15) out += note('info', 'Very short. A goal in three words is usually a topic, not a goal.');
        else if (t.split(/\bund\b/i).length >= 3) out += note('info', 'Several goals in one sentence. Take the most important one – the others come after.');
        if (w && w.length < 40) out += note('info', 'The why is still thin. It has to hold on a rainy day in February – write what is concretely different then.');
        else if (w && /\b(sollte|muss|man|erwartet|alle)\b/i.test(w) && !/\b(ich will|ich möchte|mir)\b/i.test(w)) out += note('info', 'Sounds like “should”. Other people\'s goals last about three weeks. Is there a why of your own behind it?');
        if (w.length >= 40 && w2.length >= 15) out += note('ok', 'Goal, why, and the why behind it – that holds. Now sharpen it.');
        else if (w.length >= 40 && !w2) out += note('info', 'Still the second level: Why does this matter to you? That\'s usually where the real drive sits.');
        return out;
    }

    /* ---------- 2 ---------- */
    function renderSmart() {
        const s = S.smart; const sc = smartScore(); const conf = n(s.conf, 7);
        $('gs-smart').innerHTML = `<div class="gs-score"><div class="gs-score-ring" style="--p:${sc / 5 * 100}"><b>${sc}</b><small>/5</small></div><div><b>SMART score</b><span>${['Noch ein Wunsch.', 'Erste Konturen.', 'Wird konkreter.', 'Fast ein Ziel.', 'Ein echtes Ziel.', 'Scharf. Los geht\'s.'][sc]}</span></div></div>` +
            `<div class="gs-smart"><div class="gs-s" style="--c:#f59e0b"><b>S</b><div><label>Specific – what exactly, where, with whom?</label><input class="mk-input" data-s="s" value="${esc(s.s || '')}" placeholder="Details that make the goal unambiguous"></div></div>` +
            `<div class="gs-s" style="--c:#f97316"><b>M</b><div><label>Measurable – a number or a clear yes/no criterion</label><input class="mk-input" data-s="m" value="${esc(s.m || '')}" placeholder="e.g. 10 km in 59:59 · 3× per week · 5'000 CHF saved"></div></div>` +
            `<div class="gs-s" style="--c:#ef4444"><b>A</b><div><label>Attractive & achievable – how sure are you that you'll make it?</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${conf}" data-s="conf"><span class="mk-range-val">${conf}</span></div></div></div>` +
            `<div class="gs-s" style="--c:#ec4899"><b>R</b><div><label>Relevant – how does it fit what matters to you right now?</label><input class="mk-input" data-s="r" value="${esc(s.r || '')}" placeholder="Which bigger picture does this belong to?"></div></div>` +
            `<div class="gs-s" style="--c:#a855f7"><b>T</b><div><label>Time-bound – by when?</label><input type="date" class="mk-input" data-s="t" value="${esc(s.t || '')}" style="max-width:200px"></div></div></div>` + smartNote() +
            (sentence() ? `<div class="mk-result gs-sentence"><h4>Your goal statement</h4><p>${esc(sentence())}</p></div>` : '');
        const host = $('gs-smart');
        host.querySelectorAll('[data-s]').forEach(el => { el.addEventListener('input', () => { s[el.dataset.s] = el.value; MethodKit.save(); if (el.dataset.s === 'conf') el.parentElement.querySelector('.mk-range-val').textContent = el.value; }); el.addEventListener('change', renderSmart); });
    }
    function smartNote() {
        const s = S.smart; let out = ''; const conf = n(s.conf, 0); const d = s.t ? days(s.t) : null;
        if (tr(s.m) && !/\d/.test(s.m) && !/\b(ja|nein|fertig|abgeschlossen|bestanden|erledigt|unterschrieben|veröffentlicht|gehalten)\b/i.test(s.m)) out += note('warn', 'No number and no yes/no criterion. “Better” is not measurable. What would you count, weigh, time, check off?');
        if (d !== null) { if (d < 0) out += note('warn', 'The date is in the past.'); else if (d < 7) out += note('info', `Only ${d} days – that's a task, not a goal. Or a very athletic sprint.`); else if (d > 365) out += note('info', `${Math.round(d / 30)} months. Beyond a year a goal loses pull. Set a midpoint goal for the next 90 days – the milestones in the next step help.`); else if (d > 90 && !tr(s.m)) out += note('info', `${d} days without a measure – you'll only notice at the end whether you were on track.`); }
        if (s.conf !== undefined && s.conf !== '') { if (conf <= 3) out += note('warn', `Confidence ${conf}/10 – you don't believe it yourself. Either make it smaller or clarify what's missing (time, knowledge, support?).`); else if (conf === 10) out += note('info', 'Confidence 10/10 – then it\'s probably too easy. A goal should pull a little.'); else if (conf >= 5 && conf <= 8) out += note('ok', `Confidence ${conf}/10 – the range where goals motivate: demanding, but doable.`); }
        if (tr(s.r) && /\b(sollte|muss|erwartet|chef|eltern|partner will)\b/i.test(s.r) && !/\b(ich|mir|mein)\b/i.test(s.r)) out += note('info', 'Relevance for others, not for you? That rarely holds.');
        if (smartScore() === 5) out += note('ok', 'All five criteria met. Now build the path.');
        return out;
    }

    /* ---------- 3 ---------- */
    function renderPath() {
        const s = S.smart; const d = s.t ? days(s.t) : null;
        if (!S.milestones.length && d && d > 14) { [0.25, 0.5, 0.75].forEach(p => S.milestones.push({ id: MethodKit.uid(), text: '', date: isoPlus(Math.round(d * p)), done: false })); MethodKit.save(); }
        const ms = S.milestones;
        $('gs-path').innerHTML = `<div class="mk-section-label">Milestones</div>` + (d && d > 14 ? `<p class="mk-faint" style="font-size:13px;margin:0 0 8px">By ${fmtD(s.t)} there are ${d} days. What is reached at 25 %, 50 %, 75 %?</p>` : '') +
            `<div class="gs-ms">${ms.map((m, i) => `<div class="gs-m ${m.done ? 'done' : ''}"><button class="gs-check" data-md="${m.id}" aria-label="Done"><i class="fas fa-check"></i></button><input class="mk-input" data-mt="${m.id}" value="${esc(m.text)}" placeholder="${['Erster sichtbarer Fortschritt', 'Halbzeit – was ist dann geschafft?', 'Fast am Ziel', 'Meilenstein'][Math.min(i, 3)]}"><input type="date" class="mk-input gs-date" data-mdt="${m.id}" value="${esc(m.date || '')}"><button class="mk-iconbtn" data-mx="${m.id}" aria-label="Remove"><i class="fas fa-xmark"></i></button></div>`).join('')}</div><button class="mk-btn mk-btn-outline mk-btn-sm" id="gs-add-m"><i class="fas fa-plus"></i> Milestone</button>` +
            `<div class="mk-section-label" style="margin-top:18px">What will go wrong?</div><p class="mk-faint" style="font-size:13px;margin:0 0 8px">Every obstacle gets an if-then plan. Research says that doubles the follow-through rate.</p>` +
            `<div class="gs-obs">${S.obstacles.map(o => `<div class="gs-o"><div class="gs-o-row"><span>Wenn</span><input class="mk-input" data-oi="${o.id}" value="${esc(o.if)}" placeholder="… I am too tired in the evening"></div><div class="gs-o-row"><span>dann</span><input class="mk-input" data-ot="${o.id}" value="${esc(o.then)}" placeholder="… I do the 10-minute version"></div><button class="mk-iconbtn" data-ox="${o.id}" aria-label="Remove"><i class="fas fa-xmark"></i></button></div>`).join('')}</div><button class="mk-btn mk-btn-outline mk-btn-sm" id="gs-add-o"><i class="fas fa-plus"></i> Obstacle</button>` + pathNote();
        const host = $('gs-path');
        host.querySelectorAll('[data-mt]').forEach(i => i.addEventListener('input', () => { ms.find(m => m.id === i.dataset.mt).text = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-mdt]').forEach(i => i.addEventListener('change', () => { ms.find(m => m.id === i.dataset.mdt).date = i.value; MethodKit.save(); renderPath(); }));
        host.querySelectorAll('[data-mt]').forEach(i => i.addEventListener('change', renderPath));
        host.querySelectorAll('[data-md]').forEach(b => b.addEventListener('click', () => { const m = ms.find(x => x.id === b.dataset.md); m.done = !m.done; MethodKit.save(); renderPath(); if (m.done) MethodKit.toast('Milestone reached', 'ok'); }));
        host.querySelectorAll('[data-mx]').forEach(b => b.addEventListener('click', () => { S.milestones = ms.filter(x => x.id !== b.dataset.mx); MethodKit.save(); renderPath(); }));
        $('gs-add-m').addEventListener('click', () => { ms.push({ id: MethodKit.uid(), text: '', date: '', done: false }); MethodKit.save(); renderPath(); const all = host.querySelectorAll('[data-mt]'); all[all.length - 1].focus(); });
        host.querySelectorAll('[data-oi]').forEach(i => { i.addEventListener('input', () => { S.obstacles.find(o => o.id === i.dataset.oi).if = i.value; MethodKit.save(); }); i.addEventListener('change', renderPath); });
        host.querySelectorAll('[data-ot]').forEach(i => { i.addEventListener('input', () => { S.obstacles.find(o => o.id === i.dataset.ot).then = i.value; MethodKit.save(); }); i.addEventListener('change', renderPath); });
        host.querySelectorAll('[data-ox]').forEach(b => b.addEventListener('click', () => { S.obstacles = S.obstacles.filter(o => o.id !== b.dataset.ox); MethodKit.save(); renderPath(); }));
        $('gs-add-o').addEventListener('click', () => { S.obstacles.push({ id: MethodKit.uid(), if: '', then: '' }); MethodKit.save(); renderPath(); const all = host.querySelectorAll('[data-oi]'); all[all.length - 1].focus(); });
    }
    function pathNote() {
        let out = ''; const ms = S.milestones.filter(m => tr(m.text)); const ob = S.obstacles.filter(o => tr(o.if));
        const dated = ms.filter(m => m.date).sort((a, b) => a.date.localeCompare(b.date));
        if (S.smart.t && dated.some(m => m.date > S.smart.t)) out += note('warn', 'A milestone is after the goal date.');
        const order = ms.filter(m => m.date); for (let i = 1; i < order.length; i++) if (order[i].date < order[i - 1].date) { out += note('info', 'The milestones are not chronological – is the order right?'); break; }
        if (dated.length >= 2) { const gaps = dated.map((m, i) => i ? (new Date(m.date) - new Date(dated[i - 1].date)) / 864e5 : null).filter(x => x !== null); if (Math.max(...gaps) > 60) out += note('info', `Between two milestones there are ${Math.round(Math.max(...gaps))} days. Longer than six weeks without a midpoint – motivation drifts. Add one in between?`); }
        ms.forEach(m => { if (!/\d/.test(m.text) && m.text.length < 25) out += note('info', `„${esc(m.text)}" – how do you know this milestone is reached? A number or a yes/no criterion helps.`); });
        if (!ob.length && ms.length) out += note('info', 'No obstacle? There is always one. The three most common: too little time, too tired, a bad week after a setback.');
        ob.forEach(o => { if (!tr(o.then)) out += note('info', `“If ${esc(o.if)}" – and then? Without a then-part it's only a worry.`); else if (/\b(trotzdem|einfach|zusammenreissen|zusammen|durchziehen|durchbeissen|disziplin|willenskraft|überwinde)/i.test(o.then)) out += note('info', `„${esc(o.then)}" relies on willpower – and in that moment it's gone. What's the smallest version that still works?`); });
        if (ms.length >= 3 && ob.length >= 2 && ob.every(o => tr(o.then))) out += note('ok', `${ms.length} milestones, ${ob.length} if-then plans. The path is built.`);
        return out;
    }

    /* ---------- 4 ---------- */
    function renderSteps() {
        const A = S.actions; const H = S.habits; const p = progress();
        $('gs-steps').innerHTML = (p !== null ? `<div class="gs-prog"><div><i style="width:${p}%"></i></div><span>${p} %</span></div>` : '') +
            `<div class="mk-section-label">The next concrete steps</div><p class="mk-faint" style="font-size:13px;margin:0 0 8px">Each step: under two hours, with a date, starts with a verb.</p>` +
            `<div class="gs-acts">${A.map(a => `<div class="gs-a ${a.done ? 'done' : ''}"><button class="gs-check" data-ad="${a.id}" aria-label="Done"><i class="fas fa-check"></i></button><input class="mk-input" data-at="${a.id}" value="${esc(a.text)}" placeholder="e.g. Try on running shoes at …"><input type="date" class="mk-input gs-date" data-adt="${a.id}" value="${esc(a.date || '')}"><button class="mk-iconbtn" data-ax="${a.id}" aria-label="Remove"><i class="fas fa-xmark"></i></button></div>`).join('')}</div><button class="mk-btn mk-btn-outline mk-btn-sm" id="gs-add-a"><i class="fas fa-plus"></i> Step</button>` +
            `<div class="mk-section-label" style="margin-top:18px">The habit that carries the goal</div><p class="mk-faint" style="font-size:13px;margin:0 0 8px">You don't reach goals, you work them – through something you do regularly. After [anchor], [action].</p>` +
            `<div class="gs-habs">${H.map(h => `<div class="gs-h"><div class="gs-o-row"><span>Nachdem</span><input class="mk-input" data-ha="${h.id}" value="${esc(h.anchor)}" placeholder="… I have made coffee in the morning"></div><div class="gs-o-row"><span>werde ich</span><input class="mk-input" data-hx="${h.id}" value="${esc(h.action)}" placeholder="… go for a 20-minute run"></div><button class="mk-iconbtn" data-hd="${h.id}" aria-label="Remove"><i class="fas fa-xmark"></i></button></div>`).join('')}</div><button class="mk-btn mk-btn-outline mk-btn-sm" id="gs-add-h"><i class="fas fa-plus"></i> Habit</button>` + stepsNote();
        const host = $('gs-steps');
        host.querySelectorAll('[data-at]').forEach(i => { i.addEventListener('input', () => { A.find(a => a.id === i.dataset.at).text = i.value; MethodKit.save(); }); i.addEventListener('change', renderSteps); });
        host.querySelectorAll('[data-adt]').forEach(i => i.addEventListener('change', () => { A.find(a => a.id === i.dataset.adt).date = i.value; MethodKit.save(); renderSteps(); }));
        host.querySelectorAll('[data-ad]').forEach(b => b.addEventListener('click', () => { const a = A.find(x => x.id === b.dataset.ad); a.done = !a.done; MethodKit.save(); renderSteps(); }));
        host.querySelectorAll('[data-ax]').forEach(b => b.addEventListener('click', () => { S.actions = A.filter(x => x.id !== b.dataset.ax); MethodKit.save(); renderSteps(); }));
        $('gs-add-a').addEventListener('click', () => { A.push({ id: MethodKit.uid(), text: '', date: '', done: false }); MethodKit.save(); renderSteps(); const all = host.querySelectorAll('[data-at]'); all[all.length - 1].focus(); });
        host.querySelectorAll('[data-ha]').forEach(i => { i.addEventListener('input', () => { H.find(h => h.id === i.dataset.ha).anchor = i.value; MethodKit.save(); }); i.addEventListener('change', renderSteps); });
        host.querySelectorAll('[data-hx]').forEach(i => { i.addEventListener('input', () => { H.find(h => h.id === i.dataset.hx).action = i.value; MethodKit.save(); }); i.addEventListener('change', renderSteps); });
        host.querySelectorAll('[data-hd]').forEach(b => b.addEventListener('click', () => { S.habits = H.filter(h => h.id !== b.dataset.hd); MethodKit.save(); renderSteps(); }));
        $('gs-add-h').addEventListener('click', () => { H.push({ id: MethodKit.uid(), anchor: '', action: '' }); MethodKit.save(); renderSteps(); const all = host.querySelectorAll('[data-ha]'); all[all.length - 1].focus(); });
    }
    function stepsNote() {
        let out = ''; const A = S.actions.filter(a => tr(a.text)); const open = A.filter(a => !a.done); const H = S.habits.filter(h => tr(h.action));
        if (!A.length) return note('info', 'The first step is the one you could do today or tomorrow – without preparation. What is that?');
        const soon = open.filter(a => a.date && days(a.date) <= 7 && days(a.date) >= 0); const overdue = open.filter(a => a.date && days(a.date) < 0);
        if (overdue.length) out += note('warn', `${overdue.length} ${overdue.length === 1 ? 'Schritt ist' : 'Schritte sind'} overdue. Reschedule or drop it – overdue items eat the list.`);
        if (open.length && open.some(a => a.date) && !soon.length && !overdue.length) out += note('info', 'No step in the next 7 days. A goal without movement this week is a plan, not a goal.');
        open.filter(a => !a.date).forEach(a => out += note('info', `„${esc(a.text)}" has no date. Without a date it becomes a someday.`));
        open.filter(a => a.text.length > 10 && !VERB_STEP.test(a.text) && /(?<![a-zäöüß])(mich|informieren|überlegen|schauen|kümmern|klären|vorbereiten)\b/i.test(a.text)).forEach(a => out += note('info', `„${esc(a.text)}" – what do you do there exactly, physically? “Get informed” is not a step. “Google three offers and write them into a list” is.`));
        if (!H.length && A.length >= 2) out += note('info', 'No habit yet. Which one thing, done regularly, almost automatically gets you to the goal?');
        H.forEach(h => { if (tr(h.anchor) && !/\b(nachdem|sobald|wenn|nach|um|jeden|jede)\b/i.test(h.anchor) && h.anchor.length < 15) out += note('info', `Anchor “${esc(h.anchor)}" is vague. What already happens every day, right before?`); if (/\b(\d{2,}|stunde|stunden)\b/i.test(h.action) && !/\b(5|10|15|20|minuten)\b/i.test(h.action)) out += note('info', `„${esc(h.action)}" is big for a start. Begin with the version that still works on a bad day – you can expand later.`); });
        if (S.habits.length > 2) out += note('info', `${S.habits.length} habits at once – usually one survives. Which is the most important?`);
        if (soon.length && H.length && !out) out += note('ok', `${soon.length} ${soon.length === 1 ? 'Schritt' : 'Schritte'} this week, habit anchored. The goal is in motion.`);
        return out;
    }

    /* ---------- 5 ---------- */
    function renderReview() {
        const s = S.smart; const p = progress(); const d = s.t ? days(s.t) : null; const sc = smartScore(); const cat = CATS[S.category];
        const nextM = S.milestones.filter(m => tr(m.text) && !m.done).sort((a, b) => (a.date || '9').localeCompare(b.date || '9'))[0];
        const nextA = S.actions.filter(a => tr(a.text) && !a.done).sort((a, b) => (a.date || '9').localeCompare(b.date || '9'))[0];
        const lastC = S.checkins[S.checkins.length - 1]; const dueC = !lastC || (Date.now() - lastC.date) / 864e5 >= 6;
        $('gs-review').innerHTML = `<div class="mk-result gs-over"><div class="gs-over-h">${cat ? `<span>${cat[0]}</span>` : ''}<h4>${esc(S.title || 'Noch kein Ziel')}</h4></div>${sentence() ? `<p class="gs-sent">${esc(sentence())}</p>` : ''}<div class="gs-kpis"><div><b>${p === null ? '–' : p + ' %'}</b><span>Progress</span></div><div><b>${d === null ? '–' : d < 0 ? 'vorbei' : d}</b><span>days left</span></div><div><b>${sc}/5</b><span>SMART</span></div><div><b>${S.milestones.filter(m => m.done).length}/${S.milestones.filter(m => tr(m.text)).length}</b><span>Milestones</span></div></div>${nextM ? `<div class="gs-next"><small>Nächster Meilenstein</small><b>${esc(nextM.text)}</b>${nextM.date ? `<em>${fmtD(nextM.date)}${days(nextM.date) < 0 ? ' · überfällig' : ''}</em>` : ''}</div>` : ''}${nextA ? `<div class="gs-next"><small>Next step</small><b>${esc(nextA.text)}</b>${nextA.date ? `<em>${fmtD(nextA.date)}</em>` : ''}</div>` : ''}</div>` + reviewNote(p, d) +
            `<div class="mk-section-label" style="margin-top:16px">Wochen-Check-in ${dueC ? '<span class="mk-badge" style="margin-left:6px">due</span>' : ''}</div><div class="gs-ci"><div class="mk-field"><label>What happened this week – toward the goal?</label><input class="mk-input" id="gs-ci-done" placeholder="Concrete, even if it was small"></div><div class="mk-field"><label>What held you back?</label><input class="mk-input" id="gs-ci-block" placeholder="Honest – next week this becomes an if-then"></div><div class="mk-range-wrap"><label>Confidence today</label><input type="range" class="mk-range" min="1" max="10" value="${n(s.conf, 7)}" id="gs-ci-conf"><span class="mk-range-val" id="gs-ci-cv">${n(s.conf, 7)}</span></div><button class="mk-btn mk-btn-primary mk-btn-sm" id="gs-ci-save"><i class="fas fa-check"></i> Save check-in</button></div>` +
            (S.checkins.length ? `<div class="gs-cis">${S.checkins.slice().reverse().slice(0, 6).map(c => `<div class="gs-c"><small>${new Date(c.date).toLocaleDateString('en-GB')} · Confidence ${c.conf}</small><div>${esc(c.done)}</div>${c.block ? `<div class="mk-faint">Held back: ${esc(c.block)}</div>` : ''}</div>`).join('')}</div>` + confTrend() : '');
        $('gs-ci-conf').addEventListener('input', e => $('gs-ci-cv').textContent = e.target.value);
        $('gs-ci-save').addEventListener('click', () => { const done = tr($('gs-ci-done').value); if (!done) { MethodKit.toast('What happened? “Nothing” is an answer too.', 'warn'); return; } S.checkins.push({ id: MethodKit.uid(), date: Date.now(), done, block: tr($('gs-ci-block').value), conf: n($('gs-ci-conf').value, 7) }); MethodKit.save({ now: true }); MethodKit.toast('Check-in saved', 'ok'); renderReview(); });
    }
    function reviewNote(p, d) {
        let out = ''; if (!tr(S.title)) return note('info', 'No goal yet – start in step 1.');
        if (d !== null && d > 0 && p !== null && S.milestones.filter(m => tr(m.text)).length >= 2) { const total = (new Date(S.smart.t) - S.created) / 864e5; const elapsed = total > 1 ? Math.min(100, Math.max(0, (total - d) / total * 100)) : null; if (elapsed !== null && elapsed > 40 && p < elapsed - 25) out += note('warn', `${Math.round(elapsed)} % of the time is gone, but ${p} % progress. Either adjust the goal date or take a big step this week – don't sit out both.`); else if (elapsed !== null && elapsed >= 10 && p > elapsed + 20 && p < 100) out += note('ok', `${p} % progress at ${Math.round(elapsed)} % of the time – you are ahead of plan.`); }
        if (p === 100) out += note('ok', 'All milestones and steps done. Celebrate – and then: What\'s the next goal that follows from this?');
        if (d !== null && d < 0 && p !== null && p < 100) out += note('warn', 'The goal date has passed. Not a problem – but decide now: new date or consciously set the goal aside. A quiet fade-out is the worst thing for the next goal.');
        const ov = S.milestones.filter(m => tr(m.text) && !m.done && m.date && days(m.date) < 0); if (ov.length && d >= 0) out += note('info', `${ov.length} ${ov.length === 1 ? 'Meilenstein ist' : 'Meilensteine sind'} overdue – check off or redate.`);
        return out;
    }
    function confTrend() { const C = S.checkins; if (C.length < 3) return ''; const last3 = C.slice(-3).map(c => c.conf); if (last3[2] < last3[0] && last3[2] < last3[1]) return note('info', `Confidence is dropping (${last3.join(' → ')}). Das ist kein Charakterproblem, sondern ein Signal: Ziel zu gross, Schritte zu vage, oder das Warum trägt nicht. Prüf Schritt 1 und 2 noch mal.`); if (last3[2] > last3[0] && last3[2] > last3[1]) return note('ok', `Confidence is rising (${last3.join(' → ')}) – Fortschritt macht Mut.`); const blocks = C.slice(-4).map(c => (c.block || '').toLowerCase()).filter(Boolean); const rep = blocks.find((b, i) => blocks.slice(i + 1).some(o => o && (o.includes(b.slice(0, 12)) || b.includes(o.slice(0, 12))))); return rep ? note('info', `„${esc(rep)}" keeps holding you back. That belongs as an if-then plan in step 3.`) : ''; }
    function renderLinks() { $('gs-links').innerHTML = LINKS.map(x => `<a class="mk-option gs-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const s = S.smart; const cat = CATS[S.category];
        const L = ['MY GOAL PLAN:', '='.repeat(40), 'Created: ' + new Date().toLocaleDateString('en-GB'), '', `ZIEL${cat ? ` (${cat[1]})` : ''}: ${S.title}`, sentence(), '', 'WHY', S.why || '–', S.why2 ? `Behind it: ${S.why2}` : '', '', 'SMART', `S: ${s.s || '–'}`, `M: ${s.m || '–'}`, `A: Confidence ${n(s.conf, '–')}/10`, `R: ${s.r || '–'}`, `T: ${fmtD(s.t)}`, `Score: ${smartScore()}/5`];
        const ms = S.milestones.filter(m => tr(m.text)); if (ms.length) { L.push('', 'MILESTONES'); ms.forEach(m => L.push(`${m.done ? '[x]' : '[ ]'} ${m.text}${m.date ? ` (${fmtD(m.date)})` : ''}`)); }
        const ob = S.obstacles.filter(o => tr(o.if)); if (ob.length) { L.push('', 'IF-THEN PLANS'); ob.forEach(o => L.push(`If ${o.if}, then ${o.then || '…'}`)); }
        const A = S.actions.filter(a => tr(a.text)); if (A.length) { L.push('', 'NEXT STEPS'); A.forEach(a => L.push(`${a.done ? '[x]' : '[ ]'} ${a.text}${a.date ? ` (${fmtD(a.date)})` : ''}`)); }
        const H = S.habits.filter(h => tr(h.action)); if (H.length) { L.push('', 'HABIT'); H.forEach(h => L.push(`After ${h.anchor}, I will ${h.action}.`)); }
        if (S.checkins.length) { L.push('', 'CHECK-INS'); S.checkins.forEach(c => L.push(`${new Date(c.date).toLocaleDateString('de-CH')} · Confidence ${c.conf} · ${c.done}${c.block ? ` · Gebremst: ${c.block}` : ''}`)); }
        const p = progress(); if (p !== null) L.push('', `Progress: ${p} %`);
        MethodKit.exportText('zielplan.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'goal-setting', accent: '#f59e0b', accent2: '#f97316',
            steps: [{ icon: '🎯', label: 'Goal' }, { icon: '🔍', label: 'SMART' }, { icon: '🛤️', label: 'Path' }, { icon: '👣', label: 'Steps' }, { icon: '📊', label: 'Review' }],
            defaultState: { title: '', why: '', why2: '', category: '', smart: { s: '', m: '', conf: '', r: '', t: '' }, milestones: [], obstacles: [], actions: [], habits: [], checkins: [] }
        });
        S = MethodKit.state;
        if (!S.smart || typeof S.smart !== 'object') { S.smart = { s: S.s || '', m: S.m || '', conf: '', r: S.r || '', t: S.t || '' }; if (S.a) S.smart.r = [S.a, S.smart.r].filter(Boolean).join(' · '); ['s', 'm', 'a', 'r', 't'].forEach(k => delete S[k]); }
        if (S.smart.t && !/^\d{4}-\d{2}-\d{2}$/.test(S.smart.t)) { const d = Date.parse(S.smart.t); S.smart.t = isNaN(d) ? '' : new Date(d).toISOString().slice(0, 10); }
        ['milestones', 'obstacles', 'actions', 'habits', 'checkins'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        S.actions = S.actions.map(a => Object.assign({ id: MethodKit.uid(), text: '', date: '', done: false }, a)); S.habits = S.habits.map(h => Object.assign({ id: MethodKit.uid(), anchor: '', action: '' }, h));
        if (S.why2 === undefined) S.why2 = ''; if (!S.created) S.created = Date.now();
        $('gs-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) renderGoal();
            if (k === 2) renderSmart();
            if (k === 3) renderPath();
            if (k === 4) renderSteps();
            if (k === 5) { renderReview(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
