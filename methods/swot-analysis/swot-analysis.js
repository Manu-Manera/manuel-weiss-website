/* Persönliche SWOT-Analyse · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const Q = {
        S: { t: 'Stärken', ic: '💪', c: '#10b981', side: 'in', q: ['Was gelingt dir leichter als anderen?', 'Wofür wirst du gefragt?', 'Welche Erfahrung, welches Wissen bringst du mit?'], ph: 'z. B. Ich erkläre Komplexes verständlich' },
        W: { t: 'Schwächen', ic: '🧩', c: '#f59e0b', side: 'in', q: ['Was vermeidest du?', 'Wo brauchst du länger oder Hilfe?', 'Welches Feedback hörst du wiederholt?'], ph: 'z. B. Ich delegiere schlecht' },
        O: { t: 'Chancen', ic: '🌱', c: '#3b82f6', side: 'out', q: ['Was verändert sich in deinem Umfeld, das dir helfen könnte?', 'Welche Türen stehen gerade offen?', 'Wen könntest du nutzen?'], ph: 'z. B. Die Abteilung wächst, neue Rollen entstehen' },
        T: { t: 'Risiken', ic: '⚠️', c: '#ef4444', side: 'out', q: ['Was könnte deine Pläne durchkreuzen?', 'Welche Trends laufen gegen dich?', 'Wovon bist du abhängig?'], ph: 'z. B. Umstrukturierung könnte die Stelle streichen' }
    };
    const SCOPES = [['job', '💼 Beruf / Karriere'], ['project', '🚀 Projekt / Vorhaben'], ['self', '🧭 Ich als Person'], ['biz', '🏢 Selbstständigkeit']];
    const TOWS = [
        ['so', 'SO · Ausbauen', 'S', 'O', 'Welche Stärke nutzt welche Chance?', 'Mit … nutze ich …, indem ich …'],
        ['st', 'ST · Absichern', 'S', 'T', 'Welche Stärke entschärft welches Risiko?', 'Gegen … setze ich … ein, indem ich …'],
        ['wo', 'WO · Aufholen', 'W', 'O', 'Welche Chance hilft, eine Schwäche zu überwinden?', 'Ich nutze …, um … zu verbessern, indem ich …'],
        ['wt', 'WT · Vermeiden', 'W', 'T', 'Wo treffen Schwäche und Risiko aufeinander – und was tust du dagegen?', 'Damit … nicht … verstärkt, werde ich …']
    ];
    const LINKS = [
        { m: 'Ziele setzen', l: '../goal-setting/goal-setting.html', why: 'Massnahmen zu messbaren Zielen machen.' },
        { m: 'Stärken finden', l: '../strengths-finder/strengths-finder.html', why: 'Das S-Feld gründlicher füllen.' },
        { m: 'Kompetenz-Landkarte', l: '../competence-map/competence-map.html', why: 'Schwächen als Lernfelder planen.' },
        { m: 'Rubikon-Modell', l: '../rubikon-model/rubikon-model.html', why: 'Von der Entscheidung in die Umsetzung.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const items = (k) => S.items.filter(i => i.q === k);
    const sum = (k) => items(k).reduce((a, i) => a + n(i.w, 2), 0);
    const top = (k, m) => [...items(k)].sort((a, b) => n(b.w, 2) - n(a.w, 2)).slice(0, m || 2);
    const INT = /\b(ich kann|ich bin|ich habe|mir fällt|meine?|mich|mir)\b/i;
    const EXT = /\b(markt|branche|trend|firma|unternehmen|chef|team|wirtschaft|ki\b|digitalisierung|konkurrenz|gesetz|umstrukturierung|kunden|nachfrage)\b/i;

    /* ---------- 1 ---------- */
    function renderScope() {
        $('sw-scope').innerHTML = SCOPES.map(([k, t]) => `<button class="mk-chip ${S.scope === k ? 'selected' : ''}" data-sc="${k}">${t}</button>`).join('');
        $('sw-scope').querySelectorAll('[data-sc]').forEach(b => b.addEventListener('click', () => { S.scope = b.dataset.sc; MethodKit.save(); renderScope(); }));
    }
    function renderContextNote() {
        const c = (S.context || '').trim();
        $('sw-context-note').innerHTML = !c ? '' : c.length < 15 ? note('info', 'Noch zu kurz – worum geht es genau?') : !/\?|soll|ob |wie |was |welche/i.test(c) ? note('info', 'Formuliere es als Frage: „Soll ich …?", „Wie schaffe ich …?", „Welchen Weg …?" Eine SWOT beantwortet Fragen, nicht Themen.') : /und|oder/.test(c) && c.length > 90 ? note('info', 'Das klingt nach zwei Fragen. Eine SWOT pro Frage – sonst vermischen sich die Felder.') : note('ok', 'Klare Frage. Alles, was du jetzt sammelst, bewertest du in Bezug darauf.');
    }

    /* ---------- 2 ---------- */
    function renderGrid() {
        const cell = (k) => { const q = Q[k]; return `<div class="sw-cell" style="--c:${q.c}"><div class="sw-cell-h"><span>${q.ic}</span><b>${q.t}</b><small>${q.side === 'in' ? 'innen · jetzt' : 'aussen · künftig'}</small><span class="mk-badge">${items(k).length}</span></div><ul class="sw-qs">${q.q.map(x => `<li>${x}</li>`).join('')}</ul><div class="sw-items">${items(k).map(i => `<div class="sw-item"><span class="sw-item-t">${esc(i.text)}</span><div class="sw-w">${[1, 2, 3].map(w => `<button class="${n(i.w, 2) >= w ? 'on' : ''}" data-w="${i.id}" data-v="${w}" aria-label="Gewicht ${w}">●</button>`).join('')}</div><button class="mk-iconbtn" data-del="${i.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button>${sideWarn(i)}</div>`).join('')}</div><div class="sw-add"><input class="mk-input" data-in="${k}" placeholder="${q.ph}"><button class="mk-btn mk-btn-outline mk-btn-sm" data-addbtn="${k}" aria-label="Hinzufügen"><i class="fas fa-plus"></i></button></div></div>`; };
        $('sw-grid').innerHTML = `<div class="sw-axis-x"><span>Hilfreich</span><span>Hinderlich</span></div><div class="sw-matrix">${cell('S')}${cell('W')}${cell('O')}${cell('T')}</div>` + gridNote();
        const host = $('sw-grid');
        const add = (k, v) => { v = (v || '').trim(); if (!v) return; S.items.push({ id: MethodKit.uid(), q: k, text: v, w: 2 }); MethodKit.save(); renderGrid(); const i = host.querySelector(`[data-in="${k}"]`); i && i.focus(); };
        host.querySelectorAll('[data-addbtn]').forEach(b => b.addEventListener('click', () => add(b.dataset.addbtn, host.querySelector(`[data-in="${b.dataset.addbtn}"]`).value)));
        host.querySelectorAll('[data-in]').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(i.dataset.in, i.value); } }));
        host.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { S.items.find(i => i.id === b.dataset.w).w = +b.dataset.v; MethodKit.save(); renderGrid(); }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { S.items = S.items.filter(i => i.id !== b.dataset.del); MethodKit.save(); renderGrid(); }));
    }
    function sideWarn(i) {
        const q = Q[i.q];
        if (q.side === 'out' && INT.test(i.text) && !EXT.test(i.text)) return `<small class="sw-side">↑ klingt nach innen (${q.t === 'Chancen' ? 'Stärke' : 'Schwäche'}?)</small>`;
        if (q.side === 'in' && EXT.test(i.text) && !INT.test(i.text)) return `<small class="sw-side">↓ klingt nach aussen (${q.t === 'Stärken' ? 'Chance' : 'Risiko'}?)</small>`;
        return '';
    }
    function gridNote() {
        const c = { S: items('S').length, W: items('W').length, O: items('O').length, T: items('T').length };
        const total = c.S + c.W + c.O + c.T;
        if (total < 4) return note('info', 'Mindestens zwei Punkte pro Feld. Die Leitfragen helfen – und frag jemanden, der dich kennt.');
        if (c.S >= 4 && c.W <= 1) return note('info', `${c.S} Stärken, ${c.W} Schwäche${c.W === 1 ? '' : 'n'}. Entweder bist du nahezu perfekt – oder ehrlicher mit den Schwächen wäre nützlicher. Welches Feedback hörst du immer wieder?`);
        if (c.W >= 4 && c.S <= 1) return note('warn', `${c.W} Schwächen, ${c.S} Stärke${c.S === 1 ? '' : 'n'}. Das ist selten realistisch – eher ein strenger innerer Kritiker. Was würde jemand sagen, der dich schätzt?`);
        if (!c.O && !c.T) return note('info', 'Die äussere Hälfte ist leer. Was verändert sich um dich herum – im Unternehmen, in der Branche, im Umfeld? Ohne Aussenblick bleibt die SWOT eine Selbstbeschreibung.');
        if (!c.T) return note('info', 'Keine Risiken? Frag: Was müsste passieren, damit mein Plan scheitert? Wovon hänge ich ab?');
        if (!c.O) return note('info', 'Keine Chancen? Was wächst, was öffnet sich, wen kennst du, der dir eine Tür öffnen könnte?');
        if (S.items.every(i => n(i.w, 2) === 2)) return note('info', 'Alles gleich gewichtet. Welche zwei Punkte entscheiden wirklich über deine Frage? Gib ihnen drei Punkte.');
        return note('ok', `${total} Punkte, alle Felder belegt. Weiter zur Position.`);
    }

    /* ---------- 3 ---------- */
    function position() {
        const si = sum('S') - sum('W'), so = sum('O') - sum('T');
        const key = si >= 0 && so >= 0 ? 'off' : si >= 0 && so < 0 ? 'def' : si < 0 && so >= 0 ? 'catch' : 'surv';
        const P = {
            off: ['Offensiv', '🚀', 'Stärken und Chancen überwiegen. Das ist die Position für mutige Schritte: ausbauen, bewerben, starten. Hauptrisiko: Übermut – prüf die WT-Ecke trotzdem.'],
            def: ['Absichern', '🛡️', 'Du bist stark, aber das Umfeld ist rau. Nutze deine Stärken, um Risiken zu entschärfen, bevor du expandierst. Baue Alternativen, bevor du sie brauchst.'],
            catch: ['Aufholen', '🧗', 'Das Umfeld ist günstig, aber du bist noch nicht bereit. Jetzt gezielt die Schwächen angehen, die zwischen dir und der Chance stehen – mit Termin.'],
            surv: ['Stabilisieren', '⚓', 'Schwächen und Risiken dominieren. Keine grossen Sprünge: Zuerst Risiken minimieren, Unterstützung holen, eine Schwäche nach der anderen. Dann neu bewerten.']
        }[key];
        return { si, so, key, label: P[0], ic: P[1], text: P[2] };
    }
    function renderPosition() {
        if (S.items.length < 4) { $('sw-position').innerHTML = note('info', 'Fülle in Schritt 2 die vier Felder.'); return; }
        const p = position(); const mx = Math.max(6, Math.abs(p.si), Math.abs(p.so));
        $('sw-position').innerHTML = `<div class="sw-pos"><div class="sw-pos-chart"><div class="sw-pos-grid"><span class="q q1">Aufholen</span><span class="q q2">Offensiv</span><span class="q q3">Stabilisieren</span><span class="q q4">Absichern</span><i class="sw-dot" style="left:${50 + p.si / mx * 45}%; top:${50 - p.so / mx * 45}%"></i></div><div class="sw-pos-ax"><span>← Schwächen</span><span>Stärken →</span></div></div><div class="sw-pos-txt"><div class="sw-pos-l">${p.ic} ${p.label}</div><p>${p.text}</p><div class="sw-pos-n"><span>Innen (S−W): <b>${p.si > 0 ? '+' : ''}${p.si}</b></span><span>Aussen (O−T): <b>${p.so > 0 ? '+' : ''}${p.so}</b></span></div></div></div>` +
            (S.context ? `<div class="mk-faint" style="font-size:13px; margin-top:8px">Bezogen auf: „${esc(S.context)}"</div>` : '');
    }
    function renderTows() {
        if (S.items.length < 4) { $('sw-tows').innerHTML = ''; return; }
        const p = position(); const main = { off: 'so', def: 'st', catch: 'wo', surv: 'wt' }[p.key];
        $('sw-tows').innerHTML = TOWS.map(([k, t, a, b, q, tpl]) => `<div class="sw-tows ${k === main ? 'main' : ''}" style="--a:${Q[a].c}; --b:${Q[b].c}"><div class="sw-tows-h"><b>${t}</b>${k === main ? '<span class="mk-badge">deine Hauptstrategie</span>' : ''}</div><div class="sw-tows-src"><div><small>${Q[a].ic} ${Q[a].t}</small>${top(a).map(i => `<span>${esc(i.text)}</span>`).join('') || '<span class="mk-faint">–</span>'}</div><div><small>${Q[b].ic} ${Q[b].t}</small>${top(b).map(i => `<span>${esc(i.text)}</span>`).join('') || '<span class="mk-faint">–</span>'}</div></div><div class="mk-field"><label>${q}</label><textarea class="mk-textarea" rows="2" data-strat="${k}" placeholder="${tpl}">${esc((S.strat || {})[k] || '')}</textarea></div></div>`).join('') + towsNote(main);
        $('sw-tows').querySelectorAll('[data-strat]').forEach(t => { t.addEventListener('input', () => { S.strat = S.strat || {}; S.strat[t.dataset.strat] = t.value; MethodKit.save(); }); t.addEventListener('change', () => { const m = $('sw-tows').querySelector('.mk-note'); if (m) m.outerHTML = towsNote(main); }); });
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function towsNote(main) {
        const st = S.strat || {}, f = TOWS.filter(([k]) => (st[k] || '').trim()).length;
        if (!f) return note('info', `Beginn mit deiner Hauptstrategie (${TOWS.find(([k]) => k === main)[1]}). Ein Satz, der eine Stärke/Schwäche mit einer Chance/einem Risiko verbindet.`);
        if (!(st[main] || '').trim()) return note('info', `Die Hauptstrategie ${TOWS.find(([k]) => k === main)[1]} fehlt noch – sie passt am besten zu deiner Position.`);
        const weak = TOWS.filter(([k]) => (st[k] || '').trim() && !/indem|durch|mit|um .* zu|indem ich/i.test(st[k]));
        if (weak.length) return note('info', `${weak.map(x => x[1].split(' ·')[0]).join(', ')}: Noch kein „Wie". Ergänze „… indem ich …" – sonst bleibt es eine Absicht.`);
        if (f < 4) return note('ok', `${f}/4 Strategien. Die restlichen sind optional – aber die WT-Ecke lohnt immer einen Blick.`);
        return note('ok', 'Alle vier Strategien formuliert. Jetzt wird daraus Handlung.');
    }

    /* ---------- 4 ---------- */
    function renderActions() {
        const st = S.strat || {}; const avail = TOWS.filter(([k]) => (st[k] || '').trim());
        if (!avail.length) { $('sw-actions').innerHTML = note('info', 'Formuliere in Schritt 3 mindestens eine Strategie.'); return; }
        const p = S.items.length >= 4 ? position() : null; const main = p ? { off: 'so', def: 'st', catch: 'wo', surv: 'wt' }[p.key] : null;
        $('sw-actions').innerHTML = avail.map(([k, t]) => `<div class="sw-act-grp"><div class="sw-tows-h"><b>${t}</b><span class="mk-faint">${esc(st[k].trim().slice(0, 90))}${st[k].trim().length > 90 ? '…' : ''}</span></div>${S.actions.filter(a => a.strat === k).map(a => `<div class="sw-act"><input class="mk-input" data-at="${a.id}" value="${esc(a.text)}" placeholder="Was genau tust du?"><input class="mk-input sw-by" data-by="${a.id}" value="${esc(a.by || '')}" placeholder="bis wann"><div class="sw-prio">${[['A', 'jetzt'], ['B', 'bald'], ['C', 'später']].map(([pv, pl]) => `<button class="${a.prio === pv ? 'on' : ''}" data-prio="${a.id}" data-v="${pv}" title="${pl}">${pv}</button>`).join('')}</div><button class="mk-iconbtn" data-adel="${a.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('')}<button class="mk-btn mk-btn-outline mk-btn-sm" data-aadd="${k}"><i class="fas fa-plus"></i> Massnahme</button></div>`).join('') + actNote(main);
        const host = $('sw-actions');
        host.querySelectorAll('[data-aadd]').forEach(b => b.addEventListener('click', () => { S.actions.push({ id: MethodKit.uid(), strat: b.dataset.aadd, text: '', by: '', prio: 'B' }); MethodKit.save(); renderActions(); const last = host.querySelectorAll(`[data-at]`); last.length && last[last.length - 1].focus(); }));
        host.querySelectorAll('[data-at]').forEach(i => { i.addEventListener('input', () => { S.actions.find(a => a.id === i.dataset.at).text = i.value; MethodKit.save(); }); i.addEventListener('change', renderActions); });
        host.querySelectorAll('[data-by]').forEach(i => { i.addEventListener('input', () => { S.actions.find(a => a.id === i.dataset.by).by = i.value; MethodKit.save(); }); i.addEventListener('change', renderActions); });
        host.querySelectorAll('[data-prio]').forEach(b => b.addEventListener('click', () => { S.actions.find(a => a.id === b.dataset.prio).prio = b.dataset.v; MethodKit.save(); renderActions(); }));
        host.querySelectorAll('[data-adel]').forEach(b => b.addEventListener('click', () => { S.actions = S.actions.filter(a => a.id !== b.dataset.adel); MethodKit.save(); renderActions(); }));
    }
    function actNote(main) {
        const A = S.actions.filter(a => (a.text || '').trim());
        if (!A.length) return note('info', 'Pro Strategie ein bis zwei Massnahmen. Konkret: Verb + Objekt + Termin.');
        if (main && !A.some(a => a.strat === main)) return note('info', `Noch keine Massnahme zu deiner Hauptstrategie (${TOWS.find(([k]) => k === main)[1]}).`);
        const noBy = A.filter(a => !(a.by || '').trim());
        if (noBy.length) return note('info', `${noBy.length} Massnahme${noBy.length > 1 ? 'n' : ''} ohne Termin. Ohne „bis wann" passiert es nicht.`);
        const asCount = A.filter(a => a.prio === 'A').length;
        if (asCount > 3) return note('warn', `${asCount} A-Prioritäten. Mehr als drei „jetzt" heisst: keines ist jetzt. Welche zwei sind wirklich zuerst?`);
        if (!asCount) return note('info', 'Keine A-Priorität. Was tust du in den nächsten sieben Tagen?');
        return note('ok', `${A.length} Massnahme${A.length > 1 ? 'n' : ''}, ${asCount} davon sofort. Das ist eine SWOT mit Konsequenz.`);
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        if (S.items.length < 4) { $('sw-summary').innerHTML = note('info', 'Noch zu wenig Material.'); return; }
        const p = position(); const A = S.actions.filter(a => (a.text || '').trim()).sort((a, b) => (a.prio || 'B').localeCompare(b.prio || 'B'));
        $('sw-summary').innerHTML = `${S.context ? `<div class="sw-q">${esc(S.context)}</div>` : ''}<div class="sw-sum-grid">${['S', 'W', 'O', 'T'].map(k => `<div style="--c:${Q[k].c}"><b>${Q[k].ic} ${Q[k].t}</b>${top(k, 3).map(i => `<span>${esc(i.text)}${n(i.w, 2) === 3 ? ' <em>●●●</em>' : ''}</span>`).join('') || '<span class="mk-faint">–</span>'}</div>`).join('')}</div><div class="mk-result"><h4>${p.ic} Position: ${p.label}</h4>${p.text}</div>${A.length ? `<div class="mk-result"><h4>Massnahmen</h4><ul class="sw-ul">${A.map(a => `<li><b class="sw-p${a.prio}">${a.prio}</b> ${esc(a.text)}${a.by ? ` <small>bis ${esc(a.by)}</small>` : ''}</li>`).join('')}</ul></div>` : ''}`;
    }
    function renderLinks() { $('sw-links').innerHTML = LINKS.map(x => `<a class="mk-option sw-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['PERSÖNLICHE SWOT', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        if (S.context) L.push('FRAGE: ' + S.context, ''); ['S', 'W', 'O', 'T'].forEach(k => { L.push(`${Q[k].ic} ${Q[k].t.toUpperCase()}`); items(k).sort((a, b) => n(b.w, 2) - n(a.w, 2)).forEach(i => L.push(`  ${'●'.repeat(n(i.w, 2))} ${i.text}`)); L.push(''); });
        if (S.items.length >= 4) { const p = position(); L.push(`POSITION: ${p.label} (innen ${p.si}, aussen ${p.so})`, p.text, ''); }
        const st = S.strat || {}; if (Object.values(st).some(v => (v || '').trim())) { L.push('STRATEGIEN'); TOWS.forEach(([k, t]) => { if ((st[k] || '').trim()) L.push(`  ${t}: ${st[k].trim()}`); }); L.push(''); }
        const A = S.actions.filter(a => (a.text || '').trim()); if (A.length) { L.push('MASSNAHMEN'); A.sort((a, b) => (a.prio || 'B').localeCompare(b.prio || 'B')).forEach(a => L.push(`  [${a.prio}] ${a.text}${a.by ? ` – bis ${a.by}` : ''}`)); L.push(''); }
        if (S.answer) L.push('ANTWORT', S.answer);
        MethodKit.exportText('swot-analyse.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'swot-analysis', accent: '#3b82f6', accent2: '#06b6d4',
            steps: [{ icon: '❓', label: 'Frage' }, { icon: '▦', label: 'Felder' }, { icon: '♟️', label: 'Strategie' }, { icon: '🏁', label: 'Massnahmen' }, { icon: '✅', label: 'Antwort' }],
            defaultState: { scope: '', context: '', horizon: '', items: [], strat: { so: '', st: '', wo: '', wt: '' }, actions: [], answer: '' }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.items)) S.items = [];
        // Migration: alte S/W/O/T-String-Arrays
        ['S', 'W', 'O', 'T'].forEach(k => { if (Array.isArray(S[k])) { S[k].forEach(t => { const text = typeof t === 'string' ? t : (t && t.text) || ''; if (text && !S.items.some(i => i.q === k && i.text === text)) S.items.push({ id: MethodKit.uid(), q: k, text, w: 2 }); }); delete S[k]; } });
        if (!S.strat || typeof S.strat !== 'object') S.strat = {}; if (!Array.isArray(S.actions)) S.actions = [];
        MethodKit.bindFields();
        $('sw-context').addEventListener('input', renderContextNote);
        $('sw-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) { renderScope(); renderContextNote(); }
            if (k === 2) renderGrid();
            if (k === 3) { renderPosition(); renderTows(); }
            if (k === 4) renderActions();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
