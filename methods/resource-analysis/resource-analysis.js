/* Ressourcen-Analyse · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const CATS = [
        { id: 'pers', ic: '💪', t: 'Fähigkeiten & Persönlichkeit', c: '#10b981', q: 'Was kannst du gut? Welche Eigenschaften helfen dir?', sug: ['Ausdauer', 'Humor', 'Analytisches Denken', 'Lernfähigkeit', 'Gelassenheit', 'Organisationstalent', 'Kreativität', 'Mut', 'Empathie', 'Sprachgefühl'] },
        { id: 'body', ic: '🫀', t: 'Körper & Energie', c: '#f59e0b', q: 'Was hält dich körperlich und energetisch stabil?', sug: ['Gesundheit', 'Guter Schlaf', 'Sport-Routine', 'Natur', 'Ernährung', 'Atemübungen', 'Spaziergänge', 'Musik'] },
        { id: 'soc', ic: '🤝', t: 'Menschen', c: '#ec4899', q: 'Wer steht hinter dir, berät dich, hört zu?', sug: ['Partner·in', 'Familie', 'Beste Freundin / bester Freund', 'Mentor·in', 'Kolleg·innen', 'Coach / Therapeut·in', 'Nachbarn', 'Community / Verein'] },
        { id: 'mat', ic: '🧰', t: 'Mittel & Strukturen', c: '#3b82f6', q: 'Welche materiellen Dinge und Strukturen stehen dir zur Verfügung?', sug: ['Finanzielles Polster', 'Zeit', 'Wohnung / Rückzugsort', 'Ausbildung / Abschluss', 'Werkzeuge & Technik', 'Flexible Arbeitszeit', 'Netzwerk-Zugang', 'Bibliothek / Kurse'] },
        { id: 'exp', ic: '🏔️', t: 'Erfahrungen & Erfolge', c: '#8b5cf6', q: 'Was hast du schon bewältigt? Welche Krisen überstanden?', sug: ['Jobwechsel gemeistert', 'Umzug / Neuanfang', 'Prüfung bestanden', 'Konflikt gelöst', 'Krankheit überstanden', 'Projekt zu Ende gebracht', 'Trennung verarbeitet', 'Fremdsprache gelernt'] },
        { id: 'mean', ic: '🧭', t: 'Sinn, Werte & Haltung', c: '#14b8a6', q: 'Was gibt dir Halt und Richtung, wenn es schwierig wird?', sug: ['Glaube / Spiritualität', 'Klare Werte', 'Eine Vision', 'Dankbarkeit', 'Verantwortung für andere', 'Neugier', 'Natur / Stille', 'Rituale'] }
    ];
    const LINKS = [
        { m: 'Stärken finden', l: '../strengths-finder/strengths-finder.html', why: 'Die persönlichen Ressourcen genauer sortieren.' },
        { m: 'Stress-Kompass', l: '../stress-management/stress-management.html', why: 'Ressourcen gegen Stressoren stellen.' },
        { m: 'Lösungsfokus', l: '../solution-focused/solution-focused.html', why: 'Ausnahmen und Erfolge als Hebel nutzen.' },
        { m: 'Fünf Säulen', l: '../five-pillars/five-pillars.html', why: 'Stabilität in allen Lebensbereichen prüfen.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const C = (id) => CATS.find(c => c.id === id) || CATS[0];
    const R = (id) => S.items.find(i => i.id === id);
    const byCat = (c) => S.items.filter(i => i.cat === c);
    const rated = (i) => n(i.avail, 0) && n(i.use, 0);
    const sleeping = () => S.items.filter(i => rated(i) && i.avail >= 4 && i.use <= 2);
    const pillars = () => S.items.filter(i => rated(i) && i.avail >= 4 && i.use >= 4);
    const fragile = () => S.items.filter(i => rated(i) && i.avail <= 2 && i.use >= 4);

    /* ---------- 1 ---------- */
    function renderInv() {
        $('ra-inv').innerHTML = CATS.map(c => `<div class="ra-cat" style="--c:${c.c}"><div class="ra-cat-h"><span>${c.ic}</span><div><b>${c.t}</b><small>${c.q}</small></div><span class="mk-badge">${byCat(c.id).length}</span></div><div class="ra-items">${byCat(c.id).map(i => `<span class="ra-item">${esc(i.text)}<button data-del="${i.id}" aria-label="Entfernen">×</button></span>`).join('')}</div><div class="ra-add"><input class="mk-input" data-in="${c.id}" placeholder="Eigene Ressource …"><button class="mk-btn mk-btn-outline mk-btn-sm" data-addbtn="${c.id}" aria-label="Hinzufügen"><i class="fas fa-plus"></i></button></div><div class="mk-chips">${c.sug.filter(s => !byCat(c.id).some(i => i.text.toLowerCase() === s.toLowerCase())).map(s => `<button class="mk-chip" data-sug="${c.id}" data-v="${esc(s)}">${s}</button>`).join('')}</div></div>`).join('') + invNote();
        const host = $('ra-inv');
        const add = (cat, text) => { text = (text || '').trim(); if (!text) return; if (S.items.some(i => i.text.toLowerCase() === text.toLowerCase())) { MethodKit.toast('Schon drin', 'warn'); return; } S.items.push({ id: MethodKit.uid(), cat, text, avail: 0, use: 0 }); MethodKit.save(); renderInv(); };
        host.querySelectorAll('[data-sug]').forEach(b => b.addEventListener('click', () => add(b.dataset.sug, b.dataset.v)));
        host.querySelectorAll('[data-addbtn]').forEach(b => b.addEventListener('click', () => add(b.dataset.addbtn, host.querySelector(`[data-in="${b.dataset.addbtn}"]`).value)));
        host.querySelectorAll('[data-in]').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(i.dataset.in, i.value); } }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { S.items = S.items.filter(i => i.id !== b.dataset.del); S.picked = S.picked.filter(p => p !== b.dataset.del); MethodKit.save(); renderInv(); }));
    }
    function invNote() {
        const total = S.items.length, empty = CATS.filter(c => !byCat(c.id).length);
        if (total < 5) return note('info', 'Sammle mindestens acht bis zehn Ressourcen. Tipp: Was würde eine gute Freundin über dich sagen, das du selbst übersiehst?');
        if (empty.length >= 2) return note('info', `Noch leer: ${empty.map(c => c.ic + ' ' + c.t).join(', ')}. Gerade die übersehenen Bereiche tragen oft am meisten – schau dort noch einmal hin.`);
        if (!byCat('exp').length) return note('info', 'Erfahrungen & Erfolge sind leer. Du hast Schwieriges schon einmal geschafft – das ist der Beweis, dass du es wieder kannst.');
        return note('ok', `${total} Ressourcen in ${CATS.length - empty.length} Bereichen. Im nächsten Schritt wird sichtbar, welche du wirklich nutzt.`);
    }

    /* ---------- 2 ---------- */
    function renderRate() {
        if (!S.items.length) { $('ra-rate').innerHTML = note('info', 'Sammle in Schritt 1 Ressourcen.'); return; }
        const dots = (i, k, label) => `<div class="ra-dim"><span>${label}</span><div class="ra-dots">${[1, 2, 3, 4, 5].map(x => `<button class="${n(i[k], 0) >= x ? 'on' : ''}" data-r="${i.id}" data-k="${k}" data-x="${x}" aria-label="${label} ${x}">●</button>`).join('')}</div></div>`;
        $('ra-rate').innerHTML = CATS.filter(c => byCat(c.id).length).map(c => `<div class="mk-section-label" style="color:${c.c}">${c.ic} ${c.t}</div>${byCat(c.id).map(i => `<div class="ra-rate-row"><b>${esc(i.text)}</b>${dots(i, 'avail', 'Verfügbar')}${dots(i, 'use', 'Genutzt')}<span class="ra-tag">${tag(i)}</span></div>`).join('')}`).join('') + rateNote();
        $('ra-rate').querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { R(b.dataset.r)[b.dataset.k] = +b.dataset.x; MethodKit.save(); renderRate(); }));
    }
    function tag(i) { if (!rated(i)) return ''; if (i.avail >= 4 && i.use <= 2) return '<em class="sleep">💤 schlafend</em>'; if (i.avail >= 4 && i.use >= 4) return '<em class="pillar">🏛️ Säule</em>'; if (i.avail <= 2 && i.use >= 4) return '<em class="fragile">⚠️ überlastet</em>'; return ''; }
    function rateNote() {
        const r = S.items.filter(rated).length;
        if (r < S.items.length) return note('info', `${r}/${S.items.length} bewertet. Verfügbar = könnte ich morgen nutzen · Genutzt = tue ich tatsächlich.`);
        const sl = sleeping(), fr = fragile();
        return (sl.length ? note('ok', `<strong>${sl.length} schlafende Ressource${sl.length > 1 ? 'n' : ''}:</strong> ${sl.map(i => esc(i.text)).join(', ')}. Verfügbar, aber kaum genutzt – das ist dein grösster Hebel, weil er nichts Neues braucht.`) : '') +
            (fr.length ? note('warn', `<strong>Überlastet:</strong> ${fr.map(i => esc(i.text)).join(', ')} – du nutzt sie stark, aber sie sind kaum verfügbar. Das ist riskant: Was passiert, wenn sie wegfallen?`) : '') +
            (!sl.length && !fr.length ? note('ok', 'Alles bewertet. Die Landkarte zeigt dir die Verteilung.') : '');
    }

    /* ---------- 3 ---------- */
    function renderMap() {
        if (S.items.filter(rated).length < 3) { $('ra-map').innerHTML = note('info', 'Bewerte mindestens drei Ressourcen in Schritt 2.'); return; }
        const max = Math.max(1, ...CATS.map(c => byCat(c.id).length));
        const bars = CATS.map(c => { const it = byCat(c.id); const avg = it.filter(rated).length ? (it.filter(rated).reduce((a, i) => a + i.use, 0) / it.filter(rated).length) : 0; return `<div class="ra-bar"><span class="ra-bar-l">${c.ic} ${c.t}</span><div class="ra-bar-t"><i style="width:${it.length / max * 100}%; background:${c.c}"></i></div><small>${it.length} · Nutzung ${avg ? avg.toFixed(1) : '–'}</small></div>`; }).join('');
        const sl = sleeping(), pi = pillars(), fr = fragile();
        const quad = (title, ic, list, d) => `<div class="ra-q"><b>${ic} ${title}</b><small>${d}</small><div>${list.map(i => `<span class="ra-item" style="--c:${C(i.cat).c}">${C(i.cat).ic} ${esc(i.text)}</span>`).join('') || '<span class="mk-faint">–</span>'}</div></div>`;
        const empty = CATS.filter(c => !byCat(c.id).length), dom = [...CATS].sort((a, b) => byCat(b.id).length - byCat(a.id).length)[0];
        const share = byCat(dom.id).length / S.items.length;
        $('ra-map').innerHTML = `<div class="ra-bars">${bars}</div><div class="ra-quads">${quad('Säulen', '🏛️', pi, 'verfügbar & genutzt – darauf stehst du')}${quad('Schlafend', '💤', sl, 'verfügbar, kaum genutzt – dein Hebel')}${quad('Überlastet', '⚠️', fr, 'stark genutzt, kaum verfügbar – Risiko')}${quad('Übrige', '◦', S.items.filter(i => rated(i) && !pi.includes(i) && !sl.includes(i) && !fr.includes(i)), 'mittlere Werte')}</div>` +
            (share >= 0.5 ? note('warn', `${Math.round(share * 100)} % deiner Ressourcen liegen in „${dom.t}". Einseitige Ressourcenlage ist verwundbar – wenn dieser Bereich wackelt, wackelt alles. Baue einen zweiten Bereich aus.`) : '') +
            (empty.length ? note('info', `Keine Ressource in: ${empty.map(c => c.ic + ' ' + c.t).join(', ')}. Das muss keine Lücke sein – aber prüf es: Gibt es dort wirklich nichts?`) : '') +
            (!byCat('soc').filter(rated).some(i => i.use >= 3) && byCat('soc').length ? note('info', 'Deine Menschen sind da, aber du nutzt sie kaum. Um Hilfe bitten ist keine Schwäche – es ist die am meisten unterschätzte Ressource.') : '') +
            (sl.length ? note('ok', `Schlafende Ressourcen wecken: ${sl.slice(0, 3).map(i => esc(i.text)).join(', ')}. In Schritt 4 koppelst du sie an deine aktuelle Herausforderung.`) : '');
    }

    /* ---------- 4 ---------- */
    function renderPick() {
        $('ra-past-note').innerHTML = (S.past || '').trim().length > 30 ? note('ok', 'Genau das ist eine Ressource: Du weisst, wie Bewältigen geht. Die Strategie von damals ist heute wieder verfügbar.') : '';
        if (!S.items.length) { $('ra-pick').innerHTML = note('info', 'Sammle zuerst Ressourcen.'); $('ra-plan').innerHTML = ''; return; }
        const sl = sleeping();
        $('ra-pick').innerHTML = `<div class="mk-chips">${[...S.items].sort((a, b) => (sl.includes(b) ? 1 : 0) - (sl.includes(a) ? 1 : 0)).map(i => `<button class="mk-chip ${S.picked.includes(i.id) ? 'selected' : ''}" data-p="${i.id}">${C(i.cat).ic} ${esc(i.text)}${sl.includes(i) ? ' 💤' : ''}</button>`).join('')}</div>`;
        $('ra-pick').querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.p; if (S.picked.includes(id)) S.picked = S.picked.filter(p => p !== id); else if (S.picked.length >= 5) { MethodKit.toast('Maximal fünf – Fokus schlägt Fülle', 'warn'); return; } else S.picked.push(id); MethodKit.save(); renderPick(); }));
        renderPlan();
    }
    function renderPlan() {
        const P = S.picked.map(R).filter(Boolean);
        if (!P.length) { $('ra-plan').innerHTML = note('info', 'Wähle zwei bis fünf Ressourcen. Schlafende (💤) zuerst – sie kosten nichts Neues.'); return; }
        const cats = new Set(P.map(i => i.cat));
        $('ra-plan').innerHTML = P.map(i => { const a = S.plan[i.id] || {}; return `<div class="ra-plan" style="--c:${C(i.cat).c}"><b>${C(i.cat).ic} ${esc(i.text)}</b><div class="mk-grid-2"><div class="mk-field"><label>Wie setze ich sie konkret ein?</label><input class="mk-input" data-how="${i.id}" value="${esc(a.how || '')}" placeholder="…"></div><div class="mk-field"><label>Erster Schritt (bis wann?)</label><input class="mk-input" data-first="${i.id}" value="${esc(a.first || '')}" placeholder="z. B. Mentor bis Freitag anrufen"></div></div></div>`; }).join('') +
            (cats.size === 1 && P.length >= 2 ? note('info', `Alle gewählten Ressourcen kommen aus „${C(P[0].cat).t}". Mischen hilft: eine Person, ein Mittel, eine Erfahrung – das trägt stabiler.`) : '') +
            (!cats.has('soc') && P.length >= 2 && byCat('soc').length ? note('info', 'Kein Mensch dabei. Wer könnte dich bei genau dieser Herausforderung unterstützen – und wann fragst du?') : '') +
            (P.every(i => (S.plan[i.id] || {}).first) ? note('ok', 'Für jede Ressource ein erster Schritt. Das ist Aktivierung – nicht nur Wissen, dass sie da ist.') : '');
        $('ra-plan').querySelectorAll('[data-how]').forEach(x => x.addEventListener('input', () => { (S.plan[x.dataset.how] = S.plan[x.dataset.how] || {}).how = x.value; MethodKit.save(); }));
        $('ra-plan').querySelectorAll('[data-first]').forEach(x => { x.addEventListener('input', () => { (S.plan[x.dataset.first] = S.plan[x.dataset.first] || {}).first = x.value; MethodKit.save(); }); x.addEventListener('change', renderPlan); });
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        if (!S.items.length) { $('ra-summary').innerHTML = note('info', 'Noch nichts gesammelt.'); return; }
        const pi = pillars(), sl = sleeping(), P = S.picked.map(R).filter(Boolean);
        $('ra-summary').innerHTML = `<div class="ra-stats"><div><b>${S.items.length}</b><span>Ressourcen</span></div><div><b>${CATS.filter(c => byCat(c.id).length).length}/6</b><span>Bereiche</span></div><div><b>${pi.length}</b><span>Säulen</span></div><div><b>${sl.length}</b><span>schlafend</span></div></div>` +
            `<div class="mk-result"><h4>Darauf stehe ich</h4>${pi.length ? pi.map(i => `${C(i.cat).ic} ${esc(i.text)}`).join(' · ') : '<span class="mk-faint">noch keine Säulen bewertet</span>'}</div>` +
            (sl.length ? `<div class="mk-result"><h4>Das wecke ich</h4>${sl.map(i => `${C(i.cat).ic} ${esc(i.text)}`).join(' · ')}</div>` : '') +
            (S.challenge ? `<div class="mk-result"><h4>Für: ${esc(S.challenge)}</h4>${P.length ? `<ul class="ra-ul">${P.map(i => `<li><b>${esc(i.text)}</b>${(S.plan[i.id] || {}).how ? ` – ${esc(S.plan[i.id].how)}` : ''}${(S.plan[i.id] || {}).first ? ` <small>→ ${esc(S.plan[i.id].first)}</small>` : ''}</li>`).join('')}</ul>` : '<span class="mk-faint">keine Ressourcen gewählt</span>'}${S.past ? `<div class="mk-faint" style="margin-top:6px">Schon einmal geschafft: ${esc(S.past)}</div>` : ''}</div>` : '');
    }
    function renderLinks() { $('ra-links').innerHTML = LINKS.map(x => `<a class="mk-option ra-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['RESSOURCEN-KARTE', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        CATS.forEach(c => { const it = byCat(c.id); if (!it.length) return; L.push(`${c.ic} ${c.t.toUpperCase()}`); it.forEach(i => L.push(`  - ${i.text}${rated(i) ? ` (verfügbar ${i.avail}/5 · genutzt ${i.use}/5${sleeping().includes(i) ? ' · schlafend' : pillars().includes(i) ? ' · Säule' : fragile().includes(i) ? ' · überlastet' : ''})` : ''}`)); L.push(''); });
        if (S.challenge) { L.push('HERAUSFORDERUNG', S.challenge, ''); if (S.past) L.push('Schon einmal gemeistert: ' + S.past, ''); L.push('AKTIVIERUNG'); S.picked.map(R).filter(Boolean).forEach(i => { const a = S.plan[i.id] || {}; L.push(`  - ${i.text}${a.how ? `: ${a.how}` : ''}${a.first ? ` → ${a.first}` : ''}`); }); }
        MethodKit.exportText('ressourcen-karte.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'resource-analysis', accent: '#10b981', accent2: '#22c55e',
            steps: [{ icon: '📦', label: 'Inventar' }, { icon: '⚖️', label: 'Bewerten' }, { icon: '🗺️', label: 'Landkarte' }, { icon: '🔑', label: 'Aktivieren' }, { icon: '🧾', label: 'Karte' }],
            defaultState: { items: [], picked: [], plan: {}, challenge: '', past: '' }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.items)) S.items = [];
        // Migration: alte inner/outer-Listen (Strings)
        if (Array.isArray(S.inner) || Array.isArray(S.outer)) {
            const old = []; (S.inner || []).forEach(t => old.push(['pers', t])); (S.outer || []).forEach(t => old.push(['soc', t]));
            old.forEach(([cat, t]) => { const text = typeof t === 'string' ? t : (t && t.text) || ''; if (text && !S.items.some(i => i.text === text)) S.items.push({ id: MethodKit.uid(), cat, text, avail: 0, use: 0 }); });
            const oldPicked = Array.isArray(S.picked) ? S.picked : [];
            S.picked = oldPicked.map(p => (S.items.find(i => i.text === p) || {}).id).filter(Boolean);
            delete S.inner; delete S.outer;
        }
        if (!Array.isArray(S.picked)) S.picked = []; if (!S.plan || typeof S.plan !== 'object') S.plan = {};
        S.picked = S.picked.filter(R);
        MethodKit.bindFields();
        $('ra-export').addEventListener('click', exportAll);
        $('ra-past').addEventListener('input', () => { $('ra-past-note').innerHTML = (S.past || '').trim().length > 30 ? note('ok', 'Genau das ist eine Ressource: Du weisst, wie Bewältigen geht. Die Strategie von damals ist heute wieder verfügbar.') : ''; });
        MethodKit.onStep = function (k) {
            if (k === 1) renderInv();
            if (k === 2) renderRate();
            if (k === 3) renderMap();
            if (k === 4) renderPick();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
