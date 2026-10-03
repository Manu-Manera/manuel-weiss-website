/* Eisenhower · Zeitmanagement · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const MINS = [15, 30, 60, 120, 240];
    const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const Q = {
        1: { l: 'Wichtig & dringend', act: 'Sofort selbst tun', ic: '🔥', c: 'q1' },
        2: { l: 'Wichtig, nicht dringend', act: 'Fest einplanen', ic: '🌱', c: 'q2' },
        3: { l: 'Dringend, nicht wichtig', act: 'Delegieren oder minimieren', ic: '📨', c: 'q3' },
        4: { l: 'Weder noch', act: 'Streichen', ic: '🗑️', c: 'q4' }
    };
    const INTERRUPTS = ['Mails & Chat', 'Spontane Meetings', 'Andere Leute', 'Perfektionismus', 'Zu optimistisch geschätzt', 'Energie fehlte', 'Prioritäten verschoben', 'Social Media'];
    const LINKS = [
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Die Wochenplanung zur Routine machen.' },
        { m: 'GROW', l: '../target-coaching/target-coaching.html', why: 'Klären, was wirklich wichtig ist.' },
        { m: 'Stressmanagement', l: '../stress-management/stress-management.html', why: 'Wenn Quadrant I dauerhaft voll ist.' },
        { m: 'Werte-Klärung', l: '../values-clarification/values-clarification.html', why: 'Wichtigkeit braucht einen Massstab.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const quad = (t) => (t.imp >= 3 ? (t.urg >= 3 ? 1 : 2) : (t.urg >= 3 ? 3 : 4));
    const active = () => S.tasks.filter(t => t.name.trim() && !t.dropped);
    const sumMin = (arr) => arr.reduce((a, t) => a + n(t.min, 30), 0);
    const fmtH = (m) => (m >= 60 ? (m / 60).toFixed(m % 60 ? 1 : 0) + ' h' : m + ' min');
    const dots = (t, key, title) => `<div class="tm-dots" title="${title}">${[1, 2, 3, 4, 5].map(v => `<button class="${n(t[key], 0) >= v ? 'on ' + key : ''}" data-rate="${t.id}" data-key="${key}" data-v="${v}" aria-label="${title} ${v}">●</button>`).join('')}</div>`;

    /* ---------- 1 ---------- */
    function renderList() {
        const L = S.tasks.filter(t => !t.dropped);
        $('tm-list').innerHTML = L.length ? L.map(t => `
            <div class="tm-task">
                <input class="mk-input" data-tn="${t.id}" value="${esc(t.name)}" placeholder="Aufgabe">
                <div class="tm-task-r">
                    <div class="tm-rate"><span>Wichtig</span>${dots(t, 'imp', 'Wichtigkeit')}</div>
                    <div class="tm-rate"><span>Dringend</span>${dots(t, 'urg', 'Dringlichkeit')}</div>
                    <select class="mk-select tm-min" data-tm="${t.id}" aria-label="Dauer">${MINS.map(m => `<option value="${m}" ${n(t.min, 30) === m ? 'selected' : ''}>${fmtH(m)}</option>`).join('')}</select>
                    <input class="mk-input tm-due" type="date" data-td="${t.id}" value="${esc(t.due || '')}" aria-label="Frist">
                    <button class="mk-iconbtn" data-tr="${t.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button>
                </div>
                ${t.imp && t.urg ? `<div class="tm-badge ${Q[quad(t)].c}">${Q[quad(t)].ic} ${Q[quad(t)].l}</div>` : ''}
            </div>`).join('') : '<div class="mk-empty">Noch leer. Was liegt alles an – auch das Kleine, auch das Unangenehme?</div>';
        const host = $('tm-list');
        host.querySelectorAll('[data-tn]').forEach(el => el.addEventListener('input', () => { const t = S.tasks.find(x => x.id === el.dataset.tn); if (t) { t.name = el.value; MethodKit.save(); } }));
        host.querySelectorAll('[data-rate]').forEach(b => b.addEventListener('click', () => { const t = S.tasks.find(x => x.id === b.dataset.rate); if (t) { t[b.dataset.key] = +b.dataset.v; if (b.dataset.key === 'urg' && t.due === undefined) t.due = ''; MethodKit.save(); renderList(); } }));
        host.querySelectorAll('[data-tm]').forEach(el => el.addEventListener('change', () => { const t = S.tasks.find(x => x.id === el.dataset.tm); if (t) { t.min = +el.value; MethodKit.save(); } }));
        host.querySelectorAll('[data-td]').forEach(el => el.addEventListener('change', () => { const t = S.tasks.find(x => x.id === el.dataset.td); if (t) { t.due = el.value; autoUrg(t); MethodKit.save(); renderList(); } }));
        host.querySelectorAll('[data-tr]').forEach(b => b.addEventListener('click', () => { S.tasks = S.tasks.filter(x => x.id !== b.dataset.tr); MethodKit.save(); renderList(); }));
        const rated = L.filter(t => t.imp && t.urg).length;
        $('tm-collect-note').innerHTML = L.length ? `<div class="mk-note ${rated === L.length ? 'ok' : 'info'}" style="margin-top:10px"><i class="fas fa-${rated === L.length ? 'check-circle' : 'info-circle'}"></i><span>${L.length} Aufgaben · ${rated} bewertet · ${fmtH(sumMin(L))} geschätzt${rated < L.length ? ' – bewerte alle, damit die Matrix vollständig ist.' : ''}</span></div>` : '';
    }
    function autoUrg(t) {
        if (!t.due) return;
        const days = Math.round((new Date(t.due) - new Date()) / 864e5);
        if (days <= 2 && n(t.urg, 0) < 4) { t.urg = 5; MethodKit.toast('Frist in ≤ 2 Tagen – Dringlichkeit auf 5 gesetzt', 'info'); }
        else if (days <= 7 && n(t.urg, 0) < 3) { t.urg = 3; }
    }
    function addTask(name) {
        name = (name || '').trim(); if (!name) { MethodKit.toast('Bitte Aufgabe eingeben', 'warn'); return; }
        S.tasks.push({ id: MethodKit.uid(), name, imp: 0, urg: 0, min: 30, due: '', day: '', delegate: '', done: false, dropped: false });
        MethodKit.save(); $('tm-in').value = ''; renderList(); $('tm-in').focus();
    }

    /* ---------- 2 ---------- */
    function renderMatrix() {
        const A = active().filter(t => t.imp && t.urg);
        $('tm-matrix').innerHTML = `<div class="tm-axis-top">dringend →</div><div class="tm-grid">${[2, 1, 4, 3].map(q => { const L = A.filter(t => quad(t) === q); return `
            <div class="tm-quad ${Q[q].c}"><div class="tm-quad-h"><span>${Q[q].ic} ${Q[q].l}</span><small>${Q[q].act}</small></div>
            ${L.length ? L.map(t => `<div class="tm-qt"><span class="grow">${esc(t.name)}</span><small>${fmtH(n(t.min, 30))}</small><div class="tm-qt-mv">${q !== 2 ? `<button data-mv="${t.id}" data-to="imp" title="Ist doch wichtig" aria-label="Als wichtig markieren">★</button>` : ''}${q === 1 || q === 3 ? `<button data-mv="${t.id}" data-to="noturg" title="Doch nicht so dringend" aria-label="Als nicht dringend markieren">⏳</button>` : ''}</div></div>`).join('') : '<div class="tm-qempty">–</div>'}
            ${L.length ? `<div class="tm-qsum">${L.length} · ${fmtH(sumMin(L))}</div>` : ''}</div>`; }).join('')}</div><div class="tm-axis-left">wichtig →</div>`;
        $('tm-matrix').querySelectorAll('[data-mv]').forEach(b => b.addEventListener('click', () => { const t = S.tasks.find(x => x.id === b.dataset.mv); if (!t) return; if (b.dataset.to === 'imp') t.imp = 4; else t.urg = 2; MethodKit.save(); renderMatrix(); }));
        const tot = sumMin(A) || 1; const by = [1, 2, 3, 4].map(q => sumMin(A.filter(t => quad(t) === q)));
        const notes = [];
        if (!A.length) notes.push({ t: 'info', m: 'Bewerte zuerst deine Aufgaben in Schritt 1.' });
        else {
            if (by[0] / tot > 0.4) notes.push({ t: 'warn', m: `${Math.round(by[0] / tot * 100)} % deiner Zeit steckt in „wichtig & dringend" – Feuerwehr-Modus. Das ist meist vernachlässigter Quadrant II von letzter Woche.` });
            if (by[1] / tot < 0.2) notes.push({ t: 'warn', m: 'Quadrant II ist dünn besetzt. Hier liegen Vorbereitung, Beziehungen, Lernen, Gesundheit – nichts davon schreit, alles davon zählt.' });
            else if (by[1] / tot >= 0.4) notes.push({ t: 'ok', m: 'Starker Quadrant II – du arbeitest vorausschauend statt reaktiv.' });
            if (by[2] / tot > 0.25) notes.push({ t: 'info', m: `${Math.round(by[2] / tot * 100)} % dringend-aber-unwichtig. Wessen Prioritäten sind das? Delegieren, bündeln oder Nein sagen.` });
            if (by[3] > 0) notes.push({ t: 'info', m: `${fmtH(by[3])} in „weder noch" – das ist geschenkte Zeit, wenn du es streichst.` });
        }
        $('tm-insight').innerHTML = `<div class="tm-bar">${[1, 2, 3, 4].map(q => by[q - 1] ? `<i class="${Q[q].c}" style="width:${by[q - 1] / tot * 100}%" title="${Q[q].l}: ${fmtH(by[q - 1])}"></i>` : '').join('')}</div>` + notes.map(x => `<div class="mk-note ${x.t}"><i class="fas fa-${x.t === 'warn' ? 'exclamation-triangle' : x.t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${x.m}</span></div>`).join('');
    }

    /* ---------- 3 ---------- */
    function renderBudget() {
        const h = n(S.hours, 20); const A = active();
        const need = sumMin(A.filter(t => [1, 2].includes(quad(t)))); const q3 = sumMin(A.filter(t => quad(t) === 3));
        const pct = Math.min(100, Math.round(need / (h * 60) * 100));
        $('tm-budget').innerHTML = `
            <div class="mk-field"><label>Verfügbare Fokus-Stunden diese Woche</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="2" max="60" value="${h}" id="tm-hours"><span class="mk-range-val">${h} h</span></div><span class="hint">Faustregel: Netto etwa die Hälfte deiner Arbeitszeit – der Rest geht an Meetings, Mails, Unerwartetes.</span></div>
            <div class="tm-budget-bar"><i style="width:${pct}%" class="${need > h * 60 ? 'over' : ''}"></i></div>
            <div class="tm-budget-row"><span>Wichtig (I + II): <b>${fmtH(need)}</b></span><span>Budget: <b>${h} h</b></span><span>${need > h * 60 ? `<b class="over">${fmtH(need - h * 60)} zu viel</b>` : `<b class="ok">${fmtH(h * 60 - need)} Puffer</b>`}</span></div>
            ${need > h * 60 ? '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>Das passt nicht in die Woche. Was aus Quadrant I kann warten, was aus II verschiebst du bewusst auf nächste Woche – bevor es die Woche für dich entscheidet?</span></div>' : need > h * 60 * 0.8 ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Über 80 % verplant. Ohne Puffer kippt die erste Störung den ganzen Plan.</span></div>' : A.length ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Realistisch verplant. Nutze den Puffer nicht zum Nachfüllen.</span></div>' : ''}
            ${q3 ? `<div class="mk-faint" style="margin-top:8px">Zusätzlich ${fmtH(q3)} in Quadrant III – jede delegierte Stunde erhöht dein Budget.</div>` : ''}`;
        $('tm-hours').addEventListener('input', e => { S.hours = n(e.target.value, 20); MethodKit.save(); renderBudget(); });
    }
    function renderFocus() {
        const q2 = active().filter(t => quad(t) === 2);
        S.focus = S.focus.filter(id => q2.some(t => t.id === id));
        $('tm-focus').innerHTML = q2.length ? `<div class="tm-focus-list">${q2.map(t => `<button class="mk-option ${S.focus.includes(t.id) ? 'selected' : ''}" data-fc="${t.id}"><span class="ic">${S.focus.includes(t.id) ? '🪨' : '○'}</span><span class="t">${esc(t.name)}</span><span class="d">${fmtH(n(t.min, 30))}${t.due ? ' · bis ' + new Date(t.due).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) : ''}</span></button>`).join('')}</div>
            ${S.focus.length ? `<div class="mk-note ok"><i class="fas fa-mountain"></i><span>${S.focus.length} Big Rock${S.focus.length > 1 ? 's' : ''} gesetzt. Plane sie zuerst in die Woche – der Kies füllt sich von selbst.</span></div>` : '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Wähle bis zu drei. Mehr als drei Big Rocks sind Kies.</span></div>'}` : '<div class="mk-empty">Keine Aufgaben in Quadrant II. Frag dich: Was würde in einem Monat einen Unterschied machen, wenn ich es jetzt angehe?</div>';
        $('tm-focus').querySelectorAll('[data-fc]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.fc; if (S.focus.includes(id)) S.focus = S.focus.filter(x => x !== id); else if (S.focus.length >= 3) { MethodKit.toast('Maximal drei Big Rocks', 'warn'); return; } else S.focus.push(id); MethodKit.save(); renderFocus(); }));
    }

    /* ---------- 4 ---------- */
    function renderPlan() {
        const A = active().filter(t => t.imp && t.urg);
        const g = { do: A.filter(t => [1, 2].includes(quad(t))).sort((a, b) => (S.focus.includes(b.id) - S.focus.includes(a.id)) || quad(a) - quad(b)), del: A.filter(t => quad(t) === 3), drop: A.filter(t => quad(t) === 4) };
        $('tm-plan').innerHTML = (!A.length ? '<div class="mk-empty">Erst bewerten, dann planen.</div>' : '') +
            (g.do.length ? `<div class="mk-section-label">Selbst tun – welcher Tag?</div>${g.do.map(t => `<div class="tm-plan-row ${Q[quad(t)].c}"><span class="grow">${S.focus.includes(t.id) ? '🪨 ' : ''}${esc(t.name)} <small>${fmtH(n(t.min, 30))}</small></span><div class="tm-days">${DAYS.map(d => `<button class="${t.day === d ? 'on' : ''}" data-day="${t.id}" data-d="${d}">${d}</button>`).join('')}</div></div>`).join('')}` : '') +
            (g.del.length ? `<div class="mk-section-label">Delegieren – an wen?</div>${g.del.map(t => `<div class="tm-plan-row q3"><span class="grow">${esc(t.name)}</span><input class="mk-input tm-deleg" data-dg="${t.id}" value="${esc(t.delegate || '')}" placeholder="Person / Weg – oder „Nein sagen""></div>`).join('')}` : '') +
            (g.drop.length ? `<div class="mk-section-label">Streichen</div>${g.drop.map(t => `<div class="tm-plan-row q4"><span class="grow">${esc(t.name)}</span><button class="mk-btn mk-btn-sm mk-btn-danger" data-drop="${t.id}"><i class="fas fa-trash"></i> Streichen</button></div>`).join('')}` : '');
        const host = $('tm-plan');
        host.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', () => { const t = S.tasks.find(x => x.id === b.dataset.day); if (t) { t.day = t.day === b.dataset.d ? '' : b.dataset.d; MethodKit.save(); renderPlan(); renderWeek(); } }));
        host.querySelectorAll('[data-dg]').forEach(el => el.addEventListener('input', () => { const t = S.tasks.find(x => x.id === el.dataset.dg); if (t) { t.delegate = el.value; MethodKit.save(); } }));
        host.querySelectorAll('[data-drop]').forEach(b => b.addEventListener('click', () => { const t = S.tasks.find(x => x.id === b.dataset.drop); if (t) { t.dropped = true; MethodKit.save(); MethodKit.toast(`„${t.name}" gestrichen – ${fmtH(n(t.min, 30))} gewonnen`, 'success'); renderPlan(); renderWeek(); } }));
    }
    function renderWeek() {
        const A = active().filter(t => t.day); const daily = Math.round(n(S.hours, 20) * 60 / 5);
        const unplanned = active().filter(t => [1, 2].includes(quad(t)) && t.imp && t.urg && !t.day);
        $('tm-week').innerHTML = `<div class="tm-week">${DAYS.map(d => { const L = A.filter(t => t.day === d); const m = sumMin(L); return `<div class="tm-day ${m > daily && d !== 'Sa' && d !== 'So' ? 'over' : ''}"><div class="tm-day-h"><b>${d}</b><small>${m ? fmtH(m) : ''}</small></div>${L.map(t => `<div class="tm-day-t ${Q[quad(t)].c} ${t.done ? 'done' : ''}">${S.focus.includes(t.id) ? '🪨 ' : ''}${esc(t.name)}</div>`).join('')}</div>`; }).join('')}</div>
            ${unplanned.length ? `<div class="mk-note info" style="margin-top:10px"><i class="fas fa-info-circle"></i><span>${unplanned.length} wichtige Aufgabe${unplanned.length > 1 ? 'n' : ''} ohne Tag: ${unplanned.map(t => esc(t.name)).join(', ')}. Was keinen Tag hat, passiert nicht.</span></div>` : A.length ? '<div class="mk-note ok" style="margin-top:10px"><i class="fas fa-check-circle"></i><span>Alles Wichtige hat einen Platz. Tage über Tagesbudget sind rot markiert.</span></div>' : ''}`;
    }

    /* ---------- 5 ---------- */
    function renderReview() {
        const A = active().filter(t => t.imp && t.urg && [1, 2].includes(quad(t)));
        const done = A.filter(t => t.done); const pct = A.length ? Math.round(done.length / A.length * 100) : 0;
        const rocksDone = S.focus.filter(id => S.tasks.find(t => t.id === id && t.done)).length;
        $('tm-review').innerHTML = `
            ${A.length ? `<div class="tm-done-list">${A.map(t => `<label class="tm-done ${t.done ? 'on' : ''}"><input type="checkbox" data-done="${t.id}" ${t.done ? 'checked' : ''}><span>${S.focus.includes(t.id) ? '🪨 ' : ''}${esc(t.name)}</span><small>${t.day || '–'} · ${fmtH(n(t.min, 30))}</small></label>`).join('')}</div>
            <div class="tm-stats"><div><b>${pct} %</b><span>erledigt</span></div><div><b>${S.focus.length ? rocksDone + '/' + S.focus.length : '–'}</b><span>Big Rocks</span></div><div><b>${fmtH(sumMin(done))}</b><span>Fokuszeit</span></div></div>
            ${S.focus.length && rocksDone === S.focus.length ? '<div class="mk-note ok"><i class="fas fa-mountain"></i><span>Alle Big Rocks geschafft – das ist eine gute Woche, egal was sonst liegen blieb.</span></div>' : S.focus.length && !rocksDone && done.length ? '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>Erledigt, aber kein einziger Big Rock. Das Dringende hat gewonnen. Blockiere die Rocks nächste Woche als Erstes im Kalender.</span></div>' : ''}` : '<div class="mk-empty">Noch keine wichtigen Aufgaben – Review folgt, wenn die Woche geplant ist.</div>'}
            <div class="mk-section-label" style="margin-top:14px">Was hat Zeit gefressen?</div>
            <div class="mk-chips">${INTERRUPTS.map(i => `<button class="mk-chip ${S.interrupts.includes(i) ? 'selected' : ''}" data-int="${esc(i)}">${esc(i)}</button>`).join('')}</div>`;
        $('tm-review').querySelectorAll('[data-done]').forEach(cb => cb.addEventListener('change', () => { const t = S.tasks.find(x => x.id === cb.dataset.done); if (t) { t.done = cb.checked; MethodKit.save(); renderReview(); } }));
        $('tm-review').querySelectorAll('[data-int]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.int; S.interrupts = S.interrupts.includes(v) ? S.interrupts.filter(x => x !== v) : [...S.interrupts, v]; MethodKit.save(); renderReview(); }));
    }
    function closeWeek() {
        const A = active().filter(t => t.imp && t.urg && [1, 2].includes(quad(t)));
        if (!A.length) { MethodKit.toast('Nichts zum Abschliessen', 'warn'); return; }
        const done = A.filter(t => t.done);
        S.history.push({ date: new Date().toISOString().slice(0, 10), planned: A.length, done: done.length, rocks: S.focus.length, rocksDone: S.focus.filter(id => S.tasks.find(t => t.id === id && t.done)).length, minutes: sumMin(done), interrupts: [...S.interrupts], learn: S.learn || '' });
        S.tasks = S.tasks.filter(t => !t.done && !t.dropped).map(t => ({ ...t, day: '' }));
        S.focus = []; S.interrupts = []; S.learn = '';
        MethodKit.save({ now: true }); const l = $('tm-learn'); if (l) l.value = '';
        MethodKit.toast(`Woche abgeschlossen – ${A.length - done.length} offene Aufgabe${A.length - done.length === 1 ? '' : 'n'} übernommen`, 'success');
        renderReview(); renderHistory();
    }
    function renderHistory() {
        const H = S.history;
        $('tm-history').innerHTML = H.length ? `<div class="mk-section-label" style="margin-top:16px">Vergangene Wochen</div><div class="tm-hist">${H.slice(-8).reverse().map(h => `<div class="tm-hist-row"><span>${new Date(h.date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}</span><div class="tm-hist-bar"><i style="width:${h.planned ? h.done / h.planned * 100 : 0}%"></i></div><span>${h.done}/${h.planned}</span><small>${h.rocks ? '🪨 ' + h.rocksDone + '/' + h.rocks : ''}</small></div>`).join('')}</div>
            ${H.length >= 2 ? trendNote(H) : ''}` : '';
    }
    function trendNote(H) {
        const r = h => h.planned ? h.done / h.planned : 0; const last = r(H[H.length - 1]), prev = r(H[H.length - 2]);
        const allInt = H.slice(-4).flatMap(h => h.interrupts); const top = INTERRUPTS.map(i => [i, allInt.filter(x => x === i).length]).sort((a, b) => b[1] - a[1])[0];
        return `<div class="mk-note ${last >= prev ? 'ok' : 'info'}"><i class="fas fa-chart-line"></i><span>${last >= prev ? 'Erledigungsquote steigt' : 'Erledigungsquote sinkt'} (${Math.round(prev * 100)} % → ${Math.round(last * 100)} %).${top && top[1] >= 2 ? ` Häufigster Zeitfresser: <strong>${esc(top[0])}</strong> – dafür lohnt sich ein fester Gegenplan.` : ''}</span></div>`;
    }
    function renderLinks() { $('tm-links').innerHTML = LINKS.map(x => `<a class="mk-option tm-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const A = active(); const L = ['EISENHOWER-WOCHENPLAN', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', `Fokus-Budget: ${n(S.hours, 20)} h`, ''];
        [1, 2, 3, 4].forEach(q => { const T = A.filter(t => quad(t) === q); if (T.length) { L.push(`${Q[q].ic} ${Q[q].l.toUpperCase()} → ${Q[q].act}`); T.forEach(t => L.push(`  ${t.done ? '[x]' : '[ ]'} ${t.name} (${fmtH(n(t.min, 30))})${t.day ? ' · ' + t.day : ''}${t.delegate ? ' · an ' + t.delegate : ''}${S.focus.includes(t.id) ? ' · BIG ROCK' : ''}`)); L.push(''); } });
        if (S.interrupts.length) L.push('Zeitfresser: ' + S.interrupts.join(', '));
        if (S.learn) L.push('Für nächste Woche: ' + S.learn);
        MethodKit.exportText('eisenhower-woche.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'time-management', accent: '#0ea5e9', accent2: '#6366f1',
            steps: [{ icon: '📝', label: 'Sammeln' }, { icon: '🗂️', label: 'Matrix' }, { icon: '⏱️', label: 'Budget' }, { icon: '📅', label: 'Woche' }, { icon: '✅', label: 'Review' }],
            defaultState: { tasks: [], hours: 20, focus: [], interrupts: [], learn: '', history: [] }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.tasks)) S.tasks = []; ['focus', 'interrupts', 'history'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        // Migration: alte Tasks hatten imp/urg als 0/1
        S.tasks.forEach(t => { if (t.imp === 1 && t.urg !== undefined && t.min === undefined) { t.imp = 4; } if (t.urg === 1 && t.min === undefined) { t.urg = 4; } if (t.imp === 0 && t.min === undefined) t.imp = 2; if (t.urg === 0 && t.min === undefined) t.urg = 2; if (t.min === undefined) t.min = 30; if (t.done === undefined) t.done = false; if (t.dropped === undefined) t.dropped = false; if (t.day === undefined) t.day = ''; });
        MethodKit.bindFields();
        $('tm-add').addEventListener('click', () => addTask($('tm-in').value));
        $('tm-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTask(e.target.value); } });
        $('tm-close').addEventListener('click', closeWeek);
        $('tm-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) renderList();
            if (k === 2) renderMatrix();
            if (k === 3) { renderBudget(); renderFocus(); }
            if (k === 4) { renderPlan(); renderWeek(); }
            if (k === 5) { renderReview(); renderHistory(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
