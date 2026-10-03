/* Rubikon-Modell · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const PHASES = [{ l: 'Abwägen', ic: '⚖️' }, { l: 'Entscheiden', ic: '🌊' }, { l: 'Planen', ic: '🗺️' }, { l: 'Handeln', ic: '🚀' }, { l: 'Bewerten', ic: '🏁' }];
    const OBS_SEEDS = ['Keine Zeit', 'Müdigkeit am Abend', 'Jemand lädt mich ein', 'Ich habe keine Lust', 'Es läuft nicht sofort gut', 'Andere Prioritäten dazwischen'];
    const LINKS = [
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Aus Handeln eine Routine machen.' },
        { m: 'GROW', l: '../target-coaching/target-coaching.html', why: 'Wenn die Optionen noch unklar sind.' },
        { m: 'Wohlgeformtes Ziel (NLP)', l: '../nlp-meta-goal/nlp-meta-goal.html', why: 'Das Vorhaben auf Stimmigkeit prüfen.' },
        { m: 'Zeitmanagement', l: '../time-management/time-management.html', why: 'Platz im Kalender schaffen.' },
        { m: 'Lösungsfokus', l: '../solution-focused/solution-focused.html', why: 'Wenn du beim Bewerten hängst.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const todayKey = () => new Date().toISOString().slice(0, 10);
    const fmt = (iso) => { const d = new Date(iso); return isNaN(d) || !iso ? '' : d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }); };
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const weightPro = () => sum(S.pro.filter(x => x.text.trim()).map(x => n(x.w, 3)));
    const weightCon = () => sum(S.con.filter(x => x.text.trim()).map(x => n(x.w, 3)));

    /* ---------- Fluss-Grafik ---------- */
    function renderRiver() {
        const step = MethodKit.step; const crossed = !!S.committed;
        $('rk-river').innerHTML = `<div class="rk-river-in">${PHASES.map((p, i) => `<div class="rk-ph ${i + 1 === step ? 'cur' : ''} ${i + 1 < step ? 'done' : ''}"><span class="ic">${p.ic}</span><span class="l">${p.l}</span></div>${i === 0 ? `<div class="rk-water ${crossed ? 'crossed' : ''}" title="Der Rubikon"><i class="fas fa-water"></i>${crossed ? '<small>überschritten</small>' : ''}</div>` : ''}`).join('')}</div>`;
    }

    /* ---------- 1 ---------- */
    function renderList(side) {
        const host = $(side === 'pro' ? 'rk-pro' : 'rk-con'); const L = S[side];
        host.innerHTML = `${L.map(it => `<div class="rk-arg"><input class="mk-input" data-at="${it.id}" data-s="${side}" value="${esc(it.text)}" placeholder="${side === 'pro' ? 'Was spricht dafür?' : 'Was spricht dagegen?'}"><div class="rk-w">${[1, 2, 3, 4, 5].map(w => `<button class="${n(it.w, 3) >= w ? 'on' : ''}" data-aw="${it.id}" data-s="${side}" data-w="${w}" title="Gewicht ${w}">●</button>`).join('')}</div><button class="mk-iconbtn" data-ar="${it.id}" data-s="${side}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('')}
            <button class="mk-btn mk-btn-outline mk-btn-sm" data-aa="${side}" aria-label="Argument hinzufügen"><i class="fas fa-plus"></i></button>`;
        host.querySelector('[data-aa]').addEventListener('click', () => { L.push({ id: MethodKit.uid(), text: '', w: 3 }); MethodKit.save(); renderList(side); const i = host.querySelectorAll('[data-at]'); i[i.length - 1].focus(); });
        host.querySelectorAll('[data-at]').forEach(el => el.addEventListener('input', () => { const it = L.find(x => x.id === el.dataset.at); if (it) { it.text = el.value; MethodKit.save(); renderBalance(); } }));
        host.querySelectorAll('[data-aw]').forEach(b => b.addEventListener('click', () => { const it = L.find(x => x.id === b.dataset.aw); if (it) { it.w = +b.dataset.w; MethodKit.save(); renderList(side); renderBalance(); } }));
        host.querySelectorAll('[data-ar]').forEach(b => b.addEventListener('click', () => { S[side] = L.filter(x => x.id !== b.dataset.ar); MethodKit.save(); renderList(side); renderBalance(); }));
    }
    function renderBalance() {
        const p = weightPro(), c = weightCon(), t = p + c;
        if (!t) { $('rk-balance').innerHTML = ''; return; }
        const tilt = Math.max(-14, Math.min(14, (c - p) / Math.max(t, 1) * 14));
        let msg = Math.abs(p - c) <= Math.max(2, t * 0.15) ? 'Die Waage steht fast gleich – typisch für ein Dilemma. Frag dich: Welche Seite würdest du in einem Jahr bereuen?' : p > c ? `Deutlich mehr Gewicht dafür (${p} zu ${c}). Wenn du trotzdem zögerst, liegt es vermutlich nicht an den Argumenten, sondern an der Angst vor dem Verzicht – Schritt 2.` : `Mehr Gewicht dagegen (${c} zu ${p}). Vielleicht ist es ehrlicher, das Vorhaben zu verkleinern oder bewusst zu verwerfen – auch das ist ein Rubikon.`;
        $('rk-balance').innerHTML = `<svg viewBox="0 0 320 130" class="rk-scale" role="img" aria-label="Waage"><line x1="160" y1="40" x2="160" y2="118" class="post"/><rect x="120" y="116" width="80" height="8" rx="3" class="base"/><g transform="rotate(${tilt} 160 40)"><line x1="40" y1="40" x2="280" y2="40" class="beam"/><line x1="40" y1="40" x2="40" y2="70" class="str"/><line x1="280" y1="40" x2="280" y2="70" class="str"/><rect x="10" y="70" width="60" height="10" rx="3" class="pan pro"/><rect x="250" y="70" width="60" height="10" rx="3" class="pan con"/><text x="40" y="96" class="pt">👍 ${p}</text><text x="280" y="96" class="pt">👎 ${c}</text></g><circle cx="160" cy="40" r="5" class="pivot"/></svg>
            <div class="mk-note info"><i class="fas fa-info-circle"></i><span>${msg}</span></div>`;
    }
    function renderMotiv() {
        const i = n(S.importance, 5), ch = n(S.chance, 5), m = i * ch;
        let msg;
        if (m >= 56) msg = { t: 'ok', m: 'Hohe Motivation – wichtig und machbar. Beste Voraussetzung, den Fluss zu überqueren.' };
        else if (i >= 7 && ch <= 4) msg = { t: 'warn', m: 'Wichtig, aber du glaubst nicht daran. Mach das Vorhaben kleiner oder hol dir Unterstützung, bis die Erfolgserwartung steigt – sonst bleibst du am Ufer.' };
        else if (i <= 4 && ch >= 7) msg = { t: 'info', m: 'Leicht machbar, aber nicht so wichtig. Vielleicht ein Nebenprojekt – oder es gibt ein wichtigeres Thema?' };
        else if (i <= 4 && ch <= 4) msg = { t: 'warn', m: 'Weder wichtig noch wahrscheinlich – ehrlich gesagt: Warum darüber nachdenken?' };
        else msg = { t: 'info', m: 'Mittlere Motivation. Beide Hebel helfen: Warum ist es dir wichtig (Wert)? Was macht es machbarer (Erwartung)?' };
        $('rk-motiv').innerHTML = `
            <div class="mk-grid-2">
                <div class="mk-field"><label>Wie <strong>wichtig</strong> ist es dir? (Wert)</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${i}" data-mv="importance"><span class="mk-range-val">${i}</span></div></div>
                <div class="mk-field"><label>Wie <strong>wahrscheinlich</strong> schaffst du es? (Erwartung)</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${ch}" data-mv="chance"><span class="mk-range-val">${ch}</span></div></div>
            </div>
            <div class="rk-motiv"><div class="rk-motiv-bar"><i style="width:${m}%"></i></div><div class="rk-motiv-l">Motivations-Score <b>${m}</b>/100</div></div>
            <div class="mk-note ${msg.t}"><i class="fas fa-info-circle"></i><span>${msg.m}</span></div>`;
        $('rk-motiv').querySelectorAll('[data-mv]').forEach(el => el.addEventListener('input', () => { S[el.dataset.mv] = n(el.value, 5); MethodKit.save(); renderMotiv(); }));
    }

    /* ---------- 2 ---------- */
    function renderCommit() {
        const d = (S.decision || '').trim(); const weak = /\b(versuche|vielleicht|mal schauen|eventuell|könnte|sollte|probiere)\b/i.test(d);
        $('rk-commit').innerHTML = `
            ${weak ? '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>„Versuchen / vielleicht / könnte" – das ist noch Abwägen. Eine Entscheidung klingt so: „Ich werde …"</span></div>' : ''}
            <label class="rk-commit ${S.committed ? 'on' : ''}"><input type="checkbox" id="rk-commit-cb" ${S.committed ? 'checked' : ''}><span class="box"><i class="fas fa-check"></i></span><span><strong>Ich überschreite den Rubikon.</strong><small>${S.committed ? 'Entschieden am ' + fmt(S.committedAt) + '. Ab jetzt wird nicht mehr abgewogen, sondern geplant und gehandelt.' : 'Ich habe abgewogen, ich habe entschieden – und ich werde nicht mehr darüber nachdenken, ob, sondern nur noch wie.'}</small></span></label>
            ${S.committed ? `<div class="mk-field" style="margin-top:12px"><label for="rk-witness">Wem sagst du es?</label><span class="hint">Eine ausgesprochene Entscheidung ist verbindlicher als eine gedachte.</span><input class="mk-input" id="rk-witness" value="${esc(S.witness || '')}" placeholder="Name"></div>` : ''}`;
        $('rk-commit-cb').addEventListener('change', e => { S.committed = e.target.checked; S.committedAt = e.target.checked ? todayKey() : null; MethodKit.save({ now: true }); if (e.target.checked) MethodKit.toast('Rubikon überschritten 🌊', 'success'); renderCommit(); renderRiver(); });
        const w = $('rk-witness'); if (w) w.addEventListener('input', e => { S.witness = e.target.value; MethodKit.save(); });
    }

    /* ---------- 3 ---------- */
    function renderStartPlan() {
        const where = S.where || '[Situation]', dec = (S.decision || '[Vorhaben]').replace(/^ich werde\s*/i, '');
        $('rk-startplan').innerHTML = `<div class="rk-ift-prev"><span class="mk-badge">Wenn</span> ${esc(where)}${S.startDate ? ' ab ' + fmt(S.startDate) : ''} <span class="mk-badge">dann</span> ${esc(dec)}</div>
            <div class="mk-field" style="margin-top:10px"><label for="rk-firstact">Die allererste Handlung – so klein, dass sie nicht scheitern kann</label><input class="mk-input" id="rk-firstact" value="${esc(S.firstact || '')}" placeholder="z. B. Laufschuhe neben die Tür stellen"></div>`;
        $('rk-firstact').addEventListener('input', e => { S.firstact = e.target.value; MethodKit.save(); });
    }
    function renderIfThen() {
        $('rk-ifthen').innerHTML = `
            ${S.plans.map(p => `<div class="rk-ift"><div class="row"><span class="mk-badge">Wenn</span><input class="mk-input" data-pi="${p.id}" value="${esc(p.if)}" placeholder="Hindernis / Situation"></div><div class="row"><span class="mk-badge">dann</span><input class="mk-input" data-pt="${p.id}" value="${esc(p.then)}" placeholder="Konkrete Handlung"><button class="mk-iconbtn" data-pr="${p.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div></div>`).join('')}
            <div class="mk-chips" style="margin-top:8px">${OBS_SEEDS.filter(s => !S.plans.some(p => p.if === s)).map(s => `<button class="mk-chip" data-ps="${esc(s)}">+ ${esc(s)}</button>`).join('')}<button class="mk-chip" data-ps="">+ Eigenes</button></div>
            ${S.plans.filter(p => p.if && p.then).length >= 2 ? '<div class="mk-note ok" style="margin-top:10px"><i class="fas fa-check-circle"></i><span>Zwei oder mehr Wenn-Dann-Pläne – du bist auf die typischen Stolpersteine vorbereitet.</span></div>' : ''}`;
        $('rk-ifthen').querySelectorAll('[data-ps]').forEach(b => b.addEventListener('click', () => { S.plans.push({ id: MethodKit.uid(), if: b.dataset.ps, then: '' }); MethodKit.save(); renderIfThen(); const i = $('rk-ifthen').querySelectorAll(b.dataset.ps ? '[data-pt]' : '[data-pi]'); i[i.length - 1].focus(); }));
        $('rk-ifthen').querySelectorAll('[data-pi]').forEach(el => el.addEventListener('input', () => { const p = S.plans.find(x => x.id === el.dataset.pi); if (p) { p.if = el.value; MethodKit.save(); } }));
        $('rk-ifthen').querySelectorAll('[data-pt]').forEach(el => { el.addEventListener('input', () => { const p = S.plans.find(x => x.id === el.dataset.pt); if (p) { p.then = el.value; MethodKit.save(); } }); el.addEventListener('change', renderIfThen); });
        $('rk-ifthen').querySelectorAll('[data-pr]').forEach(b => b.addEventListener('click', () => { S.plans = S.plans.filter(x => x.id !== b.dataset.pr); MethodKit.save(); renderIfThen(); }));
    }

    /* ---------- 4 ---------- */
    function renderActions() {
        const A = S.actions; const done = A.filter(a => a.done).length;
        const streakDays = [...new Set(A.filter(a => a.done && a.doneAt).map(a => a.doneAt))].length;
        $('rk-actions').innerHTML = `
            ${A.length ? `<div class="rk-prog"><i style="width:${Math.round(done / A.length * 100)}%"></i></div><div class="mk-faint" style="margin-bottom:10px">${done}/${A.length} erledigt${streakDays ? ' · an ' + streakDays + ' Tag' + (streakDays > 1 ? 'en' : '') + ' aktiv' : ''}</div>` : ''}
            ${A.map(a => `<div class="rk-act ${a.done ? 'done' : ''}"><input type="checkbox" data-ad="${a.id}" ${a.done ? 'checked' : ''}><input class="mk-input grow" data-at2="${a.id}" value="${esc(a.text)}" placeholder="Aktion"><input class="mk-input date" type="date" data-adt="${a.id}" value="${esc(a.due || '')}"><button class="mk-iconbtn" data-ar2="${a.id}"><i class="fas fa-times"></i></button></div>`).join('')}
            <div class="rk-add"><input class="mk-input" id="rk-act-in" placeholder="Nächste Aktion …" maxlength="140"><button class="mk-btn mk-btn-primary" id="rk-act-add" aria-label="Aktion hinzufügen"><i class="fas fa-plus"></i></button></div>
            ${!A.length && S.firstact ? `<div class="mk-note info" style="margin-top:10px"><i class="fas fa-lightbulb"></i><span>Dein Start aus Schritt 3: <button class="mk-chip" id="rk-act-first">${esc(S.firstact)}</button></span></div>` : ''}`;
        const add = (v) => { v = (v || '').trim(); if (!v) return; A.push({ id: MethodKit.uid(), text: v, done: false, due: '' }); MethodKit.save(); renderActions(); const i = $('rk-act-in'); if (i) i.focus(); };
        $('rk-act-add').addEventListener('click', () => add($('rk-act-in').value)); $('rk-act-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(e.target.value); } });
        const f = $('rk-act-first'); if (f) f.addEventListener('click', () => add(S.firstact));
        $('rk-actions').querySelectorAll('[data-ad]').forEach(cb => cb.addEventListener('change', () => { const a = A.find(x => x.id === cb.dataset.ad); if (a) { a.done = cb.checked; a.doneAt = cb.checked ? todayKey() : null; MethodKit.save(); renderActions(); if (cb.checked) MethodKit.toast('Erledigt ✓', 'success'); } }));
        $('rk-actions').querySelectorAll('[data-at2]').forEach(el => el.addEventListener('input', () => { const a = A.find(x => x.id === el.dataset.at2); if (a) { a.text = el.value; MethodKit.save(); } }));
        $('rk-actions').querySelectorAll('[data-adt]').forEach(el => el.addEventListener('input', () => { const a = A.find(x => x.id === el.dataset.adt); if (a) { a.due = el.value; MethodKit.save(); } }));
        $('rk-actions').querySelectorAll('[data-ar2]').forEach(b => b.addEventListener('click', () => { S.actions = A.filter(x => x.id !== b.dataset.ar2); MethodKit.save(); renderActions(); }));
    }

    /* ---------- 5 ---------- */
    function renderReview() {
        const A = S.actions, done = A.filter(a => a.done).length, pct = A.length ? Math.round(done / A.length * 100) : null;
        const R = S.review;
        $('rk-review').innerHTML = `
            ${pct != null ? `<div class="mk-note ${pct >= 70 ? 'ok' : 'info'}"><i class="fas fa-chart-simple"></i><span>${done} von ${A.length} Aktionen erledigt (${pct} %).${pct >= 70 ? ' Du hast gehandelt – egal, wie das Ergebnis aussieht.' : pct > 0 ? ' Was hat die restlichen verhindert? Fehlte ein Wenn-Dann-Plan?' : ' Noch nichts abgehakt – zurück zu Schritt 4.'}</span></div>` : ''}
            <div class="mk-field"><label>Wie weit bist du am Ziel? (0–10)</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" value="${n(R.progress, 0)}" id="rk-progress"><span class="mk-range-val">${n(R.progress, 0)}</span></div></div>
            <div class="mk-field"><label for="rk-worked">Was hat funktioniert?</label><textarea class="mk-textarea" id="rk-worked" placeholder="…">${esc(R.worked || '')}</textarea></div>
            <div class="mk-field"><label for="rk-learn">Was lernst du für den nächsten Rubikon?</label><textarea class="mk-textarea" id="rk-learn" placeholder="…">${esc(R.learn || '')}</textarea></div>
            <div class="mk-section-label">Und jetzt?</div>
            <div class="mk-grid rk-next">${[['continue', '🔁', 'Weitermachen', 'Das Vorhaben läuft – dranbleiben.'], ['adjust', '🔧', 'Anpassen', 'Ziel oder Plan verändern, neu planen.'], ['done', '🏁', 'Abschliessen', 'Erreicht oder bewusst beendet.']].map(([k, ic, l, d]) => `<button class="mk-option ${R.next === k ? 'selected' : ''}" data-nx="${k}"><span class="ic">${ic}</span><span class="t">${l}</span><span class="d">${d}</span></button>`).join('')}</div>`;
        $('rk-progress').addEventListener('input', e => { R.progress = n(e.target.value, 0); e.target.nextElementSibling.textContent = e.target.value; MethodKit.save(); renderSummary(); });
        $('rk-worked').addEventListener('input', e => { R.worked = e.target.value; MethodKit.save(); }); $('rk-learn').addEventListener('input', e => { R.learn = e.target.value; MethodKit.save(); });
        $('rk-review').querySelectorAll('[data-nx]').forEach(b => b.addEventListener('click', () => { R.next = b.dataset.nx; MethodKit.save(); renderReview(); renderSummary(); }));
        MethodKit._autosizeAll();
    }
    function renderSummary() {
        $('rk-summary').innerHTML = `<div class="rk-sum">
            <div><b>⚖️</b><span>👍 ${weightPro()} vs. 👎 ${weightCon()} · Motivation ${n(S.importance, 5) * n(S.chance, 5)}/100</span></div>
            <div><b>🌊</b><span>${esc(S.decision) || '–'}${S.committed ? ' <span class="mk-badge">überschritten ' + fmt(S.committedAt) + '</span>' : ' <span class="mk-badge" style="opacity:.6">noch am Ufer</span>'}</span></div>
            <div><b>🗺️</b><span>${S.plans.filter(p => p.if && p.then).length} Wenn-Dann-Pläne${S.startDate ? ' · Start ' + fmt(S.startDate) : ''}</span></div>
            <div><b>🚀</b><span>${S.actions.filter(a => a.done).length}/${S.actions.length} Aktionen</span></div>
            <div><b>🏁</b><span>${S.review.progress != null ? S.review.progress + '/10' : '–'}${S.review.next ? ' · ' + { continue: 'Weitermachen', adjust: 'Anpassen', done: 'Abgeschlossen' }[S.review.next] : ''}</span></div>
        </div>`;
    }
    function renderLinks() { $('rk-links').innerHTML = LINKS.map(l => `<a class="mk-option rk-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }
    function exportAll() {
        const L = ['RUBIKON-MODELL', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', '1 · ABWÄGEN', S.topic || '–', 'Dafür:', ...S.pro.filter(x => x.text).map(x => `  + ${x.text} (${n(x.w, 3)})`), 'Dagegen:', ...S.con.filter(x => x.text).map(x => `  - ${x.text} (${n(x.w, 3)})`), `Gewicht: ${weightPro()} vs. ${weightCon()} · Wichtigkeit ${n(S.importance, 5)} × Chance ${n(S.chance, 5)} = ${n(S.importance, 5) * n(S.chance, 5)}`, ''];
        L.push('2 · ENTSCHEIDEN', S.decision || '–', S.giveup ? 'Loslassen: ' + S.giveup : '', S.committed ? `Rubikon überschritten am ${S.committedAt}${S.witness ? ' · gesagt: ' + S.witness : ''}` : 'Noch nicht überschritten', '');
        L.push('3 · PLANEN', `Start: ${S.startDate || '–'} · ${S.where || '–'}`, S.firstact ? 'Erste Handlung: ' + S.firstact : '', ...S.plans.filter(p => p.if || p.then).map(p => `Wenn ${p.if} → dann ${p.then}`), '');
        L.push('4 · HANDELN', ...S.actions.map(a => `[${a.done ? 'x' : ' '}] ${a.text}${a.due ? ' · bis ' + a.due : ''}`), S.evidence ? 'Dranbleiben: ' + S.evidence : '', S.shield ? 'Schutz: ' + S.shield : '', '');
        L.push('5 · BEWERTEN', S.success ? 'Erfolg: ' + S.success : '', S.review.progress != null ? `Stand: ${S.review.progress}/10` : '', S.review.worked ? 'Funktioniert: ' + S.review.worked : '', S.review.learn ? 'Gelernt: ' + S.review.learn : '', S.review.next ? 'Weiter: ' + S.review.next : '');
        MethodKit.exportText('rubikon-plan.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'rubikon-model', accent: '#3b82f6', accent2: '#6366f1',
            steps: [{ icon: '⚖️', label: 'Abwägen' }, { icon: '🌊', label: 'Entscheiden' }, { icon: '🗺️', label: 'Planen' }, { icon: '🚀', label: 'Handeln' }, { icon: '🏁', label: 'Bewerten' }],
            defaultState: { topic: '', pro: [], con: [], importance: 5, chance: 5, decision: '', giveup: '', committed: false, committedAt: null, witness: '', startDate: '', where: '', firstact: '', plans: [], actions: [], evidence: '', shield: '', success: '', review: {} }
        });
        S = MethodKit.state;
        if (!S.review || typeof S.review !== 'object') S.review = {};
        // Migration alter Freitexte
        ['pro', 'con'].forEach(k => { if (typeof S[k] === 'string') { const t = S[k]; S[k] = t.trim() ? t.split(/\n|;|,/).map(x => x.trim()).filter(Boolean).slice(0, 8).map(x => ({ id: MethodKit.uid(), text: x, w: 3 })) : []; } if (!Array.isArray(S[k])) S[k] = []; });
        if (typeof S.contra === 'string') { if (S.contra.trim() && !S.con.length) S.con = S.contra.split(/\n|;|,/).map(x => x.trim()).filter(Boolean).slice(0, 8).map(x => ({ id: MethodKit.uid(), text: x, w: 3 })); delete S.contra; }
        ['plans', 'actions'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        if (typeof S.whenwhere === 'string') { if (S.whenwhere.trim() && !S.where) S.where = S.whenwhere; delete S.whenwhere; }
        if (typeof S.ifthen === 'string') { if (S.ifthen.trim() && !S.plans.length) { const m = S.ifthen.match(/wenn\s+(.+?),?\s+dann\s+(.+)/i); S.plans.push(m ? { id: MethodKit.uid(), if: m[1], then: m[2] } : { id: MethodKit.uid(), if: S.ifthen, then: '' }); } delete S.ifthen; }
        if (typeof S.obstacles === 'string') { if (S.obstacles.trim() && !S.plans.some(p => p.if === S.obstacles.trim())) S.plans.push({ id: MethodKit.uid(), if: S.obstacles.trim().slice(0, 120), then: '' }); delete S.obstacles; }
        if (typeof S.firststep === 'string') { if (S.firststep.trim() && !S.firstact) S.firstact = S.firststep; delete S.firststep; }

        MethodKit.bindFields();
        $('rk-topic').addEventListener('input', () => {}); $('rk-decision').addEventListener('input', renderCommit); $('rk-where').addEventListener('input', renderStartPlan); $('rk-start').addEventListener('input', renderStartPlan);
        renderRiver(); renderList('pro'); renderList('con'); renderBalance(); renderMotiv();
        MethodKit.onStep = function (k) {
            renderRiver();
            if (k === 1) { renderBalance(); renderMotiv(); }
            if (k === 2) renderCommit();
            if (k === 3) { renderStartPlan(); renderIfThen(); }
            if (k === 4) renderActions();
            if (k === 5) { renderReview(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
        $('rk-export').addEventListener('click', exportAll);
    })();
})();
