/* Kompetenz-Map · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const CATS = [
        { id: 'fach', ic: '🎓', t: 'Fachkompetenz', c: '#0ea5e9', items: ['Fachwissen', 'Digitale Tools', 'Sprachen'] },
        { id: 'meth', ic: '🧩', t: 'Methodenkompetenz', c: '#8b5cf6', items: ['Problemlösen', 'Projektmanagement', 'Analyse & Daten'] },
        { id: 'soz', ic: '🤝', t: 'Sozialkompetenz', c: '#ec4899', items: ['Kommunikation', 'Teamarbeit', 'Konfliktfähigkeit'] },
        { id: 'pers', ic: '🌱', t: 'Persönliche Kompetenz', c: '#10b981', items: ['Selbstorganisation', 'Resilienz', 'Lernbereitschaft'] }
    ];
    const WAYS = [['do', '🛠️', 'Learning by doing', 'Projekt, Aufgabe, Verantwortung übernehmen'], ['peer', '👥', 'Von anderen', 'Mentor, Shadowing, Feedback, Austausch'], ['course', '📚', 'Kurs / Lektüre', 'Schulung, Buch, Zertifikat, Online-Kurs'], ['teach', '🎤', 'Weitergeben', 'Erklären, dokumentieren, Workshop halten']];
    const LINKS = [
        { m: 'Selbsteinschätzung', l: '../self-assessment/self-assessment.html', why: 'Mit dem Fremdbild abgleichen.' },
        { m: 'Ziele setzen', l: '../goal-setting/goal-setting.html', why: 'Das Lernziel wohlgeformt machen.' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Lernzeit als feste Routine.' },
        { m: 'Zeitmanagement', l: '../time-management/time-management.html', why: 'Lernzeit im Wochenplan verankern.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseFloat(v); return isNaN(x) ? d : x; };
    const allItems = () => { const out = []; CATS.forEach(c => { c.items.forEach(it => out.push({ k: c.id + '|' + it, cat: c, name: it, custom: false })); (S.custom[c.id] || []).forEach(it => out.push({ k: c.id + '|' + it, cat: c, name: it, custom: true })); }); return out; };
    const ist = (k) => n(S.ist[k], 0), soll = (k) => n(S.soll[k], 0);
    const rated = () => allItems().filter(it => ist(it.k) && soll(it.k));
    const gaps = () => rated().map(it => ({ ...it, ist: ist(it.k), soll: soll(it.k), gap: soll(it.k) - ist(it.k) })).sort((a, b) => b.gap - a.gap || b.soll - a.soll);
    const prio = () => gaps().filter(g => g.gap > 0 && (S.prio.length ? S.prio.includes(g.k) : false));

    /* ---------- 2 ---------- */
    function renderFields() {
        $('cm-fields').innerHTML = CATS.map(c => `<div class="cm-cat" style="--c:${c.c}"><div class="cm-cat-h"><span>${c.ic}</span><b>${c.t}</b></div>${[...c.items.map(it => ({ it, custom: false })), ...(S.custom[c.id] || []).map(it => ({ it, custom: true }))].map(({ it, custom }) => { const k = c.id + '|' + it; return `<div class="cm-row"><div class="cm-row-l"><b>${esc(it)}</b>${custom ? `<button class="mk-iconbtn" data-del="${c.id}" data-it="${esc(it)}" aria-label="Entfernen"><i class="fas fa-times"></i></button>` : ''}</div><div class="cm-pair"><div class="cm-dots"><span>Ist</span>${[1, 2, 3, 4, 5].map(v => `<button class="${ist(k) >= v ? 'on' : ''} ${ist(k) === v ? 'cur' : ''}" data-ist="${esc(k)}" data-v="${v}" aria-label="Ist ${v}">${v}</button>`).join('')}</div><div class="cm-dots soll"><span>Soll</span>${[1, 2, 3, 4, 5].map(v => `<button class="${soll(k) >= v ? 'on' : ''} ${soll(k) === v ? 'cur' : ''}" data-soll="${esc(k)}" data-v="${v}" aria-label="Soll ${v}">${v}</button>`).join('')}</div></div>${ist(k) && soll(k) ? `<span class="cm-gap ${soll(k) - ist(k) >= 2 ? 'hi' : soll(k) - ist(k) <= 0 ? 'ok' : ''}">${soll(k) - ist(k) > 0 ? '+' : ''}${soll(k) - ist(k)}</span>` : '<span class="cm-gap"></span>'}</div>`; }).join('')}<div class="cm-add"><input class="mk-input" data-addin="${c.id}" placeholder="Eigene Kompetenz ergänzen …"><button class="mk-btn mk-btn-outline mk-btn-sm" data-add="${c.id}" aria-label="Hinzufügen"><i class="fas fa-plus"></i></button></div></div>`).join('') +
            (rated().length >= 6 ? (() => { const g = gaps(); const over = g.filter(x => x.gap < 0); const allSoll5 = g.filter(x => x.soll === 5).length; return (allSoll5 >= g.length * 0.6 ? note('info', `${allSoll5} von ${g.length} Kompetenzen auf Soll 5? Expertenniveau überall ist kein Ziel, sondern Überforderung. Für welche drei brauchst du es wirklich?`) : '') + (over.length ? note('ok', `${over.map(x => x.name).join(', ')}: Du bist schon über dem Soll. Das ist Kapital – nutze es, statt es weiter auszubauen.`) : ''); })() : `<div class="mk-faint" style="text-align:center">${rated().length} Kompetenzen vollständig bewertet</div>`);
        const host = $('cm-fields');
        host.querySelectorAll('[data-ist]').forEach(b => b.addEventListener('click', () => { S.ist[b.dataset.ist] = +b.dataset.v; MethodKit.save(); renderFields(); }));
        host.querySelectorAll('[data-soll]').forEach(b => b.addEventListener('click', () => { S.soll[b.dataset.soll] = +b.dataset.v; MethodKit.save(); renderFields(); }));
        host.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => add(b.dataset.add)));
        host.querySelectorAll('[data-addin]').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') add(i.dataset.addin); }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { const c = b.dataset.del, it = b.dataset.it; S.custom[c] = (S.custom[c] || []).filter(x => x !== it); delete S.ist[c + '|' + it]; delete S.soll[c + '|' + it]; S.prio = S.prio.filter(k => k !== c + '|' + it); MethodKit.save(); renderFields(); }));
        function add(c) { const inp = host.querySelector(`[data-addin="${c}"]`); const v = inp.value.trim(); if (!v) return; const cat = CATS.find(x => x.id === c); if (cat.items.includes(v) || (S.custom[c] || []).includes(v)) { MethodKit.toast('Gibt es schon', 'warn'); return; } (S.custom[c] = S.custom[c] || []).push(v); MethodKit.save(); renderFields(); const ni = host.querySelector(`[data-addin="${c}"]`); if (ni) ni.focus(); }
    }

    /* ---------- 3 ---------- */
    function renderRadar() {
        const cats = CATS.map(c => { const its = rated().filter(it => it.cat.id === c.id); return { c, ist: its.length ? its.reduce((a, it) => a + ist(it.k), 0) / its.length : 0, soll: its.length ? its.reduce((a, it) => a + soll(it.k), 0) / its.length : 0, nI: its.length }; });
        if (!cats.some(x => x.nI)) { $('cm-radar').innerHTML = ''; return; }
        const cx = 150, cy = 150, R = 110; const pt = (i, v) => { const a = -Math.PI / 2 + i * Math.PI / 2; return [cx + Math.cos(a) * R * v / 5, cy + Math.sin(a) * R * v / 5]; };
        const poly = (key) => cats.map((x, i) => pt(i, x[key]).join(',')).join(' ');
        $('cm-radar').innerHTML = `<div class="cm-radar"><svg viewBox="0 0 300 300">${[1, 2, 3, 4, 5].map(v => `<polygon points="${cats.map((_, i) => pt(i, v).join(',')).join(' ')}" fill="none" stroke="var(--mk-line)" stroke-width="1"/>`).join('')}${cats.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, 5)[0]}" y2="${pt(i, 5)[1]}" stroke="var(--mk-line)"/>`).join('')}<polygon points="${poly('soll')}" fill="rgba(245,158,11,.12)" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 3"/><polygon points="${poly('ist')}" fill="rgba(14,165,233,.25)" stroke="var(--mk-accent)" stroke-width="2.5"/>${cats.map((x, i) => { const [px, py] = pt(i, 5.8); return `<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="middle" font-size="20">${x.c.ic}</text>`; }).join('')}</svg><div class="cm-radar-legend">${cats.map(x => `<div style="--c:${x.c.c}"><b>${x.c.ic} ${x.c.t}</b><span>Ist ${x.ist.toFixed(1)} · Soll ${x.soll.toFixed(1)}${x.soll - x.ist >= 1.5 ? ' <em>grösste Lücke</em>' : ''}</span></div>`).join('')}<div class="mk-faint"><i style="display:inline-block;width:14px;height:3px;background:var(--mk-accent);vertical-align:middle"></i> Ist &nbsp; <i style="display:inline-block;width:14px;height:0;border-top:2px dashed #f59e0b;vertical-align:middle"></i> Soll</div></div></div>`;
    }
    function renderGaps() {
        const g = gaps();
        if (g.length < 3) { $('cm-gaps').innerHTML = note('info', 'Bewerte mindestens drei Kompetenzen vollständig (Ist und Soll) in Schritt 2.'); return; }
        const open = g.filter(x => x.gap > 0);
        if (!S.prio.length && open.length) S.prio = open.slice(0, Math.min(3, open.length)).map(x => x.k);
        $('cm-gaps').innerHTML = `<div class="mk-section-label">Lücken – wähle maximal 3 zum Fokussieren</div><div class="cm-gaplist">${g.map(x => `<button class="cm-gaprow ${S.prio.includes(x.k) ? 'sel' : ''} ${x.gap <= 0 ? 'done' : ''}" data-p="${esc(x.k)}" style="--c:${x.cat.c}" ${x.gap <= 0 ? 'disabled' : ''}><span class="cm-gaprow-l">${x.cat.ic} <b>${esc(x.name)}</b></span><span class="cm-gaprow-bar"><i class="ist" style="width:${x.ist * 20}%"></i><i class="soll" style="left:${x.soll * 20}%"></i></span><span class="cm-gap ${x.gap >= 2 ? 'hi' : x.gap <= 0 ? 'ok' : ''}">${x.gap > 0 ? '+' + x.gap : x.gap === 0 ? '✓' : x.gap}</span></button>`).join('')}</div>` +
            (S.prio.length > 3 ? note('warn', `${S.prio.length} Fokus-Lücken – mehr als drei parallel funktioniert selten. Welche kann warten?`) : S.prio.length ? note('ok', `Fokus: ${S.prio.map(k => (g.find(x => x.k === k) || {}).name).filter(Boolean).join(', ')}. ${(() => { const big = g.filter(x => S.prio.includes(x.k) && x.gap >= 3); return big.length ? `${big.map(x => x.name).join(', ')}: Lücke von ${big[0].gap} Stufen – das ist kein Kurs, das ist ein Jahr. Plane Zwischenziele.` : ''; })()}`) : !open.length ? note('ok', 'Keine offenen Lücken – du bist überall auf Soll oder darüber. Dann darf das Ziel grösser werden.') : '') +
            (() => { const byCat = {}; open.forEach(x => byCat[x.cat.id] = (byCat[x.cat.id] || 0) + x.gap); const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]; return top && Object.keys(byCat).length > 1 && top[1] >= Object.values(byCat).reduce((a, b) => a + b, 0) * 0.5 ? note('info', `Die Hälfte deines Entwicklungsbedarfs liegt in <strong>${CATS.find(c => c.id === top[0]).t}</strong>. Oft hängen diese Lücken zusammen – eine Massnahme kann mehrere schliessen.`) : ''; })();
        $('cm-gaps').querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.p; S.prio = S.prio.includes(k) ? S.prio.filter(x => x !== k) : [...S.prio, k]; MethodKit.save(); renderGaps(); }));
    }

    /* ---------- 4 ---------- */
    function renderPlan() {
        const P = prio();
        if (!P.length) { $('cm-plan').innerHTML = note('info', 'Wähle in Schritt 3 deine Fokus-Lücken.'); $('cm-mix').innerHTML = ''; return; }
        const budget = n(S.hours, 3);
        const used = P.reduce((a, x) => a + n((S.plan[x.k] || {}).h, 0), 0);
        $('cm-plan').innerHTML = P.map(x => { const p = S.plan[x.k] || {}; return `<div class="cm-planrow" style="--c:${x.cat.c}"><div class="cm-planrow-h"><span>${x.cat.ic}</span><b>${esc(x.name)}</b><small>${x.ist} → ${x.soll}</small></div><div class="cm-ways">${WAYS.map(([id, ic, t, d]) => `<button class="${(p.ways || []).includes(id) ? 'on' : ''}" data-way="${esc(x.k)}" data-w="${id}" title="${d}">${ic} ${t}</button>`).join('')}</div><div class="cm-planrow-f"><input class="mk-input" data-how="${esc(x.k)}" value="${esc(p.how || '')}" placeholder="Konkret: Welcher Kurs, welches Projekt, welche Person?"><div class="cm-hours"><input type="number" class="mk-input" min="0" max="20" step="0.5" data-h="${esc(x.k)}" value="${p.h || ''}" placeholder="0" aria-label="Stunden pro Woche"><span>h/Wo</span></div></div></div>`; }).join('') +
            `<div class="cm-budget"><div class="cm-budget-bar"><i style="width:${Math.min(100, budget ? used / budget * 100 : 0)}%" class="${used > budget ? 'over' : ''}"></i></div><span>${used} von ${budget} h/Woche verplant</span></div>` +
            (used > budget ? note('warn', `Du verplanst ${used} h, hast aber nur ${budget} h pro Woche. Entweder Budget erhöhen (Schritt 1) oder eine Lücke auf später schieben.`) : used && used < budget * 0.5 ? note('info', `Du nutzt nur ${used} von ${budget} h. Unterforderung ist auch ein Risiko – oder dein Budget war zu optimistisch.`) : used ? note('ok', 'Lernzeit und Budget passen zusammen.') : '') +
            (() => { const h = n(S.horizon, 0); if (!h || !used) return ''; const totalH = used * h * 4.3; const stages = P.reduce((a, x) => a + x.gap, 0); return note('info', `In ${h} Monaten sind das rund <strong>${Math.round(totalH)} Lernstunden</strong> für ${stages} Kompetenzstufen – etwa ${Math.round(totalH / stages)} h pro Stufe. ${totalH / stages < 20 ? 'Das ist knapp. Eine Stufe braucht realistisch 20–50 Stunden bewusste Übung.' : totalH / stages > 80 ? 'Das ist grosszügig – du könntest schneller sein oder eine Lücke mehr nehmen.' : 'Realistisch.'}`); })();
        const host = $('cm-plan');
        host.querySelectorAll('[data-way]').forEach(b => b.addEventListener('click', () => { const p = S.plan[b.dataset.way] = S.plan[b.dataset.way] || {}; p.ways = p.ways || []; p.ways = p.ways.includes(b.dataset.w) ? p.ways.filter(w => w !== b.dataset.w) : [...p.ways, b.dataset.w]; MethodKit.save(); renderPlan(); }));
        host.querySelectorAll('[data-how]').forEach(i => i.addEventListener('input', () => { (S.plan[i.dataset.how] = S.plan[i.dataset.how] || {}).how = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-h]').forEach(i => { i.addEventListener('input', () => { (S.plan[i.dataset.h] = S.plan[i.dataset.h] || {}).h = n(i.value, 0); MethodKit.save(); }); i.addEventListener('change', renderPlan); });
        renderMix();
    }
    function renderMix() {
        const P = prio(); const cnt = {}; WAYS.forEach(w => cnt[w[0]] = 0); let any = 0;
        P.forEach(x => ((S.plan[x.k] || {}).ways || []).forEach(w => { cnt[w]++; any++; }));
        if (!any) { $('cm-mix').innerHTML = note('info', 'Wähle oben Lernwege – dann siehst du deinen Mix.'); return; }
        $('cm-mix').innerHTML = `<div class="cm-mix">${WAYS.map(([id, ic, t]) => `<div class="${cnt[id] ? 'on' : ''}"><span>${ic}</span><b>${t}</b><small>${cnt[id]}×</small></div>`).join('')}</div>` +
            (cnt.course === any ? note('warn', 'Nur Kurse und Lektüre. Das 70-20-10-Prinzip sagt: 70 % lernt man durch Tun, 20 % von anderen, 10 % formal. Wo ist dein Projekt?') : !cnt.do ? note('info', 'Kein „Learning by doing" dabei. Wissen ohne Anwendung verfällt in Wochen – such dir für jede Lücke eine echte Aufgabe.') : !cnt.peer ? note('info', 'Niemand, der dir Feedback gibt? Ein Mentor oder ein Sparringspartner verdoppelt die Lerngeschwindigkeit.') : note('ok', 'Ein gesunder Mix aus Tun, Austausch und Struktur.'));
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        const P = prio();
        $('cm-summary').innerHTML = P.length ? `<div class="mk-result"><h4>Dein Lernplan${S.target ? ` für ${esc(S.target)}` : ''}</h4>${S.horizon ? `<div class="mk-faint">Horizont: ${S.horizon} Monate · ${n(S.hours, 3)} h/Woche</div>` : ''}<div class="cm-sum">${P.map(x => { const p = S.plan[x.k] || {}; return `<div style="border-left:3px solid ${x.cat.c}"><b>${x.cat.ic} ${esc(x.name)} · ${x.ist} → ${x.soll}</b>${(p.ways || []).map(w => (WAYS.find(y => y[0] === w) || [])[1]).join(' ')} ${p.how ? esc(p.how) : '<span class="mk-faint">noch kein konkreter Weg</span>'}${p.h ? ` · ${p.h} h/Wo` : ''}</div>`; }).join('')}</div>${S.first ? `<div style="margin-top:8px"><b>Diese Woche:</b> ${esc(S.first)}</div>` : ''}</div>` : '<div class="mk-empty">Die Zusammenfassung füllt sich aus den vorherigen Schritten.</div>';
    }
    function renderHistory() {
        $('cm-history').innerHTML = `<button class="mk-btn mk-btn-outline mk-btn-sm" id="cm-snap" ${rated().length < 3 ? 'disabled' : ''}><i class="fas fa-camera"></i> Stand speichern</button>` +
            (S.history.length ? `<div class="cm-hist">${[...S.history].reverse().map(h => `<div class="cm-hist-row"><small>${new Date(h.date).toLocaleDateString('de-CH')}</small><span>Ø Ist ${h.avgIst.toFixed(1)} · Ø Soll ${h.avgSoll.toFixed(1)} · offene Lücke ${h.gapSum}</span></div>`).join('')}</div>` +
                (S.history.length >= 2 ? (() => { const a = S.history[S.history.length - 2], b = S.history[S.history.length - 1]; const d = a.gapSum - b.gapSum; return d > 0 ? note('ok', `Die offene Lücke ist um ${d} Stufen kleiner geworden. Lernen wirkt.`) : d < 0 ? note('info', `Die Lücke ist um ${-d} grösser – entweder ist dein Soll gestiegen (gut, Ambition) oder dein Ist ehrlicher geworden (auch gut).`) : note('info', 'Unverändert. Hast du die Ist-Werte nach dem Lernen aktualisiert?'); })() : '') : '');
        $('cm-snap').addEventListener('click', () => { const g = gaps(); S.history.push({ date: Date.now(), avgIst: g.reduce((a, x) => a + x.ist, 0) / g.length, avgSoll: g.reduce((a, x) => a + x.soll, 0) / g.length, gapSum: g.reduce((a, x) => a + Math.max(0, x.gap), 0) }); MethodKit.save({ now: true }); MethodKit.toast('Stand gespeichert', 'ok'); renderHistory(); });
    }
    function renderLinks() { $('cm-links').innerHTML = LINKS.map(x => `<a class="mk-option cm-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['KOMPETENZ-MAP', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), S.target ? 'Ziel: ' + S.target : '', S.horizon ? `Horizont: ${S.horizon} Monate · ${n(S.hours, 3)} h/Woche` : '', ''];
        CATS.forEach(c => { L.push(`${c.ic} ${c.t.toUpperCase()}`); allItems().filter(it => it.cat.id === c.id).forEach(it => L.push(`  ${it.name}: Ist ${ist(it.k) || '–'} → Soll ${soll(it.k) || '–'}${S.prio.includes(it.k) ? '  ★ Fokus' : ''}`)); L.push(''); });
        const P = prio(); if (P.length) { L.push('LERNPLAN'); P.forEach(x => { const p = S.plan[x.k] || {}; L.push(`- ${x.name} (${x.ist} → ${x.soll}): ${(p.ways || []).map(w => (WAYS.find(y => y[0] === w) || [])[2]).join(', ') || '–'}${p.how ? ' · ' + p.how : ''}${p.h ? ` · ${p.h} h/Wo` : ''}`); }); L.push(''); }
        if (S.first) L.push('ERSTER SCHRITT: ' + S.first);
        MethodKit.exportText('kompetenz-map.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'competence-map', accent: '#0ea5e9', accent2: '#6366f1',
            steps: [{ icon: '🎯', label: 'Ziel' }, { icon: '📊', label: 'Ist / Soll' }, { icon: '🔍', label: 'Lücken' }, { icon: '📚', label: 'Lernplan' }, { icon: '📝', label: 'Fazit' }],
            defaultState: { target: '', horizon: '', hours: 3, ist: {}, soll: {}, custom: {}, prio: [], plan: {}, first: '', history: [] }
        });
        S = MethodKit.state;
        ['ist', 'soll', 'custom', 'plan'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        ['prio', 'history'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        // Migration alter Keys ("🎓 Fachkompetenz|Fachwissen" → "fach|Fachwissen")
        const oldMap = { '🎓 Fachkompetenz': 'fach', '🧩 Methodenkompetenz': 'meth', '🤝 Sozialkompetenz': 'soz', '🌱 Persönliche Kompetenz': 'pers' };
        const rename = { 'Digitale Skills': 'Digitale Tools', 'Analytik': 'Analyse & Daten' };
        ['ist', 'soll'].forEach(f => Object.keys(S[f]).forEach(k => { const [c, it] = k.split('|'); if (oldMap[c]) { const nk = oldMap[c] + '|' + (rename[it] || it); S[f][nk] = S[f][k]; delete S[f][k]; } }));
        MethodKit.bindFields();
        $('cm-export').addEventListener('click', exportAll);
        $('cm-first').addEventListener('input', renderSummary);
        MethodKit.onStep = function (k) {
            if (k === 2) renderFields();
            if (k === 3) { renderRadar(); renderGaps(); }
            if (k === 4) renderPlan();
            if (k === 5) { renderSummary(); renderHistory(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
