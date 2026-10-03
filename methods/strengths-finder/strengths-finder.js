/* Stärken finden · Logik (nach dem Realise2-Modell: Energie × Leistung × Nutzung) */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    // Stärke → Schattenseite bei Überdosis
    const POOL = {
        'Analytisch': 'Analyse-Paralyse: zu lange prüfen, zu spät entscheiden', 'Kreativ': 'Zu viele Ideen, zu wenig Umsetzung – andere verlieren den Faden', 'Empathisch': 'Grenzen verschwimmen, eigene Bedürfnisse bleiben auf der Strecke', 'Organisiert': 'Starrheit – Pläne werden wichtiger als das Ziel', 'Kommunikativ': 'Zu viel reden, zu wenig zuhören', 'Durchsetzungsstark': 'Überfahren – andere ziehen sich zurück statt mitzugehen', 'Geduldig': 'Dinge aussitzen, die eine Entscheidung bräuchten', 'Strategisch': 'Abgehoben – das Hier und Jetzt kommt zu kurz', 'Detailgenau': 'Perfektionismus, Mikromanagement, verpasste Deadlines', 'Begeisternd': 'Überversprechen – Erwartungen, die nicht gehalten werden', 'Verlässlich': 'Alles selbst machen, nicht delegieren, ausbrennen', 'Mutig': 'Leichtsinn – Risiken, die andere ausbaden', 'Diszipliniert': 'Rigidität, Härte gegen sich und andere', 'Neugierig': 'Verzetteln – zu viel anfangen, zu wenig abschliessen', 'Lösungsorientiert': 'Zu schnell lösen, bevor das Problem verstanden ist', 'Teamfähig': 'Konflikte vermeiden, eigene Meinung zurückhalten', 'Eigenständig': 'Einzelgänger – Hilfe weder holen noch annehmen', 'Belastbar': 'Grenzen ignorieren, bis der Körper sie setzt', 'Visionär': 'Luftschlösser ohne Bodenhaftung', 'Pragmatisch': 'Kurzfristig denken, Qualität opfern', 'Diplomatisch': 'Unklarheit – niemand weiss, wo du stehst', 'Lernbereit': 'Ewiger Student – lernen statt anwenden', 'Verantwortungsbewusst': 'Alles auf die eigenen Schultern, Schuldgefühle', 'Flexibel': 'Beliebigkeit – kein klarer Kurs', 'Fokussiert': 'Tunnelblick – Wichtiges am Rand übersehen', 'Inspirierend': 'Show statt Substanz', 'Humorvoll': 'Ernstes nicht ernst nehmen, Witze als Ausweichen', 'Entscheidungsstark': 'Vorschnell – andere nicht einbeziehen', 'Hilfsbereit': 'Nicht Nein sagen können, ausgenutzt werden', 'Beharrlich': 'Sturheit – an Totem festhalten'
    };
    const LINKS = [
        { m: 'VIA-Charakterstärken', l: '../via-strengths/via-strengths.html', why: 'Die 24 wissenschaftlich fundierten Charakterstärken.' },
        { m: 'Gallup-Domänen', l: '../gallup-strengths/gallup-strengths.html', why: 'Über welche Domäne wirkst du?' },
        { m: 'Johari-Fenster', l: '../johari-window/johari-window.html', why: 'Welche Stärken sehen andere, die du nicht siehst?' },
        { m: 'Moment of Excellence', l: '../moment-excellence/moment-excellence.html', why: 'Eine Stärke körperlich verankern.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const R = (v) => S.ratings[v] || {};
    const rated = (v) => R(v).e && R(v).p && R(v).u;
    const Q = { strength: { t: 'Echte Stärke', d: 'gibt Energie & gut darin & oft genutzt', c: '#10b981', ic: '⭐' }, unrealized: { t: 'Ungenutzte Stärke', d: 'gibt Energie & gut darin – aber selten genutzt', c: '#0ea5e9', ic: '💎' }, learned: { t: 'Erlernte Verhaltensweise', d: 'gut darin – aber kostet Energie', c: '#f59e0b', ic: '🔋' }, potential: { t: 'Potenzial', d: 'gibt Energie – aber noch nicht gut darin', c: '#8b5cf6', ic: '🌱' }, weakness: { t: 'Schwäche', d: 'weder Energie noch Leistung', c: '#94a3b8', ic: '·' } };
    const quad = (v) => { const r = R(v); if (!rated(v)) return null; const e = r.e >= 4, p = r.p >= 4, u = r.u >= 3; if (e && p) return u ? 'strength' : 'unrealized'; if (!e && p) return 'learned'; if (e && !p) return 'potential'; return 'weakness'; };
    const byQuad = (q) => S.selected.filter(v => quad(v) === q);

    /* ---------- 1 ---------- */
    function renderPool() {
        const all = [...Object.keys(POOL), ...S.custom];
        $('sf-pool').innerHTML = `<div class="mk-chips">${all.map(v => `<button class="mk-chip ${S.selected.includes(v) ? 'selected' : ''}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div><div class="sf-count ${S.selected.length >= 8 && S.selected.length <= 15 ? 'ok' : S.selected.length > 15 ? 'over' : ''}">${S.selected.length} gewählt</div>` +
            (S.selected.length > 15 ? note('info', 'Viele. Das ist okay – aber Schritt 2 wird lang. Streiche, was dir beim Lesen kein Nicken entlockt.') : S.selected.length >= 8 ? note('ok', 'Gute Auswahl. Weiter zum Bewerten.') : S.selected.length ? note('info', `Noch ${8 - S.selected.length} mehr – lieber grosszügig, aussortiert wird später.`) : '');
        $('sf-pool').querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.v; if (S.selected.includes(v)) { S.selected = S.selected.filter(x => x !== v); S.top = S.top.filter(x => x !== v); } else S.selected.push(v); MethodKit.save(); renderPool(); }));
    }

    /* ---------- 2 ---------- */
    function renderRate() {
        if (!S.selected.length) { $('sf-rate').innerHTML = note('info', 'Wähle zuerst Stärken in Schritt 1.'); return; }
        const dots = (v, k, label) => `<div class="sf-dim"><span>${label}</span><div class="sf-dots">${[1, 2, 3, 4, 5].map(x => `<button class="${n(R(v)[k], 0) >= x ? 'on' : ''} ${k}" data-rv="${esc(v)}" data-k="${k}" data-x="${x}" aria-label="${label} ${x}">●</button>`).join('')}</div></div>`;
        const done = S.selected.filter(rated).length;
        $('sf-rate').innerHTML = S.selected.map(v => { const q = quad(v); return `<div class="sf-rate ${q ? 'q-' + q : ''}"><div class="sf-rate-h"><b>${esc(v)}</b>${q ? `<span class="sf-qtag" style="--c:${Q[q].c}">${Q[q].ic} ${Q[q].t}</span>` : ''}</div><div class="sf-dims">${dots(v, 'e', '⚡ Energie')}${dots(v, 'p', '🎯 Leistung')}${dots(v, 'u', '🔁 Nutzung')}</div></div>`; }).join('') +
            (done === S.selected.length ? (() => { const st = byQuad('strength').length, un = byQuad('unrealized').length, le = byQuad('learned').length; return note('ok', `Alle bewertet: ${st} echte Stärke${st !== 1 ? 'n' : ''}, ${un} ungenutzt, ${le} erlernt. ${le > st ? '<strong>Mehr erlernte Verhaltensweisen als echte Stärken</strong> – das erklärt, warum du gut bist und trotzdem müde. Schritt 3 zeigt den Ausweg.' : un ? `${un} ungenutzte Stärke${un > 1 ? 'n' : ''} – das ist dein grösster Hebel: Du kannst es schon, es gibt dir Energie, du tust es nur zu selten.` : 'Weiter zur Landkarte.'}`); })() : `<div class="mk-faint" style="text-align:center">${done}/${S.selected.length} vollständig bewertet</div>`);
        $('sf-rate').querySelectorAll('[data-rv]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.rv; S.ratings[v] = S.ratings[v] || {}; S.ratings[v][b.dataset.k] = +b.dataset.x; MethodKit.save(); renderRate(); }));
    }

    /* ---------- 3 ---------- */
    function renderMap() {
        const r = S.selected.filter(rated);
        if (r.length < 3) { $('sf-map').innerHTML = note('info', 'Bewerte mindestens drei Stärken in Schritt 2.'); return; }
        const cell = (q, title) => `<div class="sf-cell" style="--c:${Q[q].c}"><b>${Q[q].ic} ${Q[q].t}</b><small>${Q[q].d}</small><div>${byQuad(q).map(v => `<span class="sf-tag ${S.top.includes(v) ? 'top' : ''}" ${q === 'unrealized' || q === 'strength' ? `style="--c:${Q[q].c}"` : ''}>${esc(v)}${q === 'unrealized' || q === 'strength' ? ` <em>${R(v).e}·${R(v).p}·${R(v).u}</em>` : ''}</span>`).join('') || '<span class="mk-faint">–</span>'}</div></div>`;
        $('sf-map').innerHTML = `<div class="sf-axes"><span></span><span>Leistung niedrig</span><span>Leistung hoch</span></div><div class="sf-mapgrid"><span class="sf-axis-y">Energie hoch</span>${cell('potential')}<div class="sf-cell-pair">${cell('unrealized')}${cell('strength')}</div><span class="sf-axis-y">Energie niedrig</span>${cell('weakness')}${cell('learned')}</div>` +
            (byQuad('learned').length ? note('warn', `<strong>${byQuad('learned').join(', ')}</strong>: Du bist gut darin – und es laugt dich aus. Genau diese Dinge werden dir immer wieder angetragen, weil du sie gut machst. Lerne, sie zu begrenzen oder abzugeben.`) : '') +
            (byQuad('unrealized').length ? note('ok', `<strong>${byQuad('unrealized').join(', ')}</strong>: Hier liegt Gold. Energie und Können sind da – es fehlt nur die Gelegenheit. Was müsste sich ändern, damit du das öfter tust?`) : '') +
            (byQuad('potential').length ? note('info', `<strong>${byQuad('potential').join(', ')}</strong>: Gibt dir Energie, du bist aber noch nicht gut darin. Wenn du etwas lernen willst – dann das. Hier zahlt sich Übung aus, weil die Motivation von selbst kommt.`) : '');
    }
    function renderTop() {
        const cands = [...byQuad('strength'), ...byQuad('unrealized')];
        if (!cands.length) { $('sf-top').innerHTML = note('info', 'Noch keine echten oder ungenutzten Stärken. Bewerte weiter – oder sei grosszügiger bei der Energie-Frage.'); return; }
        S.top = S.top.filter(v => cands.includes(v));
        $('sf-top').innerHTML = `<div class="mk-chips">${cands.map(v => `<button class="mk-chip ${S.top.includes(v) ? 'selected' : ''}" data-t="${esc(v)}">${S.top.includes(v) ? '⭐ ' : ''}${esc(v)}${quad(v) === 'unrealized' ? ' 💎' : ''}</button>`).join('')}</div><div class="sf-count ${S.top.length === 5 ? 'ok' : ''}">${S.top.length}/5</div>` +
            (S.top.length === 5 ? (byQuad('unrealized').some(v => S.top.includes(v)) ? note('ok', 'Top 5 komplett – inklusive mindestens einer ungenutzten Stärke. Die wird in Schritt 4 den grössten Unterschied machen.') : byQuad('unrealized').length ? note('info', 'Top 5 komplett, aber nur aus Bewährtem. Nimm eine ungenutzte Stärke (💎) hinein – da ist das Wachstum.') : note('ok', 'Top 5 komplett.')) : S.top.length > 5 ? note('warn', 'Mehr als fünf – das verwässert den Fokus.') : '');
        $('sf-top').querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.t; if (S.top.includes(v)) S.top = S.top.filter(x => x !== v); else if (S.top.length >= 5) { MethodKit.toast('Maximal 5 – erst eine abwählen', 'warn'); return; } else S.top.push(v); MethodKit.save(); renderTop(); renderMap(); }));
    }

    /* ---------- 4 ---------- */
    function renderUse() {
        if (!S.top.length) { $('sf-use').innerHTML = note('info', 'Wähle zuerst deine Top 5 in Schritt 3.'); return; }
        $('sf-use').innerHTML = S.top.map(v => { const u = S.use[v] || {}; const q = quad(v); return `<div class="sf-usebox" style="--c:${Q[q].c}"><div class="sf-usebox-h"><b>⭐ ${esc(v)}</b><span class="sf-qtag" style="--c:${Q[q].c}">${Q[q].ic} ${Q[q].t}</span></div><div class="mk-field"><label>Wo setze ich das (mehr) ein? ${q === 'unrealized' ? '<span class="mk-faint">– du nutzt es bisher selten: Welche Gelegenheit schaffst du dir?</span>' : ''}</label><input class="mk-input" data-uw="${esc(v)}" value="${esc(u.where || '')}" placeholder="Konkrete Situation, Projekt, Rolle"></div><div class="sf-shadow"><b>Überdosis-Risiko</b>${POOL[v] ? esc(POOL[v]) : '<em>Eigene Stärke – was passiert, wenn du davon zu viel hast?</em>'}<div class="sf-shadow-q">Erkennst du das bei dir?<div class="sf-yn"><button class="${u.over === 'yes' ? 'on' : ''}" data-ov="${esc(v)}" data-x="yes">Ja, manchmal</button><button class="${u.over === 'no' ? 'on' : ''}" data-ov="${esc(v)}" data-x="no">Eher nicht</button></div></div>${u.over === 'yes' ? `<input class="mk-input" data-ug="${esc(v)}" value="${esc(u.guard || '')}" placeholder="Mein Gegengewicht: Woran merke ich die Überdosis, und was tue ich dann?">` : ''}</div></div>`; }).join('') +
            (() => { const overs = S.top.filter(v => (S.use[v] || {}).over === 'yes'); return overs.length >= 3 ? note('info', `Bei ${overs.length} von ${S.top.length} Stärken erkennst du die Überdosis. Das ist typisch: Stärken, die man viel einsetzt, kippen am ehesten. Ein Gegengewicht pro Stärke reicht.`) : ''; })();
        const host = $('sf-use');
        host.querySelectorAll('[data-uw]').forEach(i => i.addEventListener('input', () => { (S.use[i.dataset.uw] = S.use[i.dataset.uw] || {}).where = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-ug]').forEach(i => i.addEventListener('input', () => { (S.use[i.dataset.ug] = S.use[i.dataset.ug] || {}).guard = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-ov]').forEach(b => b.addEventListener('click', () => { (S.use[b.dataset.ov] = S.use[b.dataset.ov] || {}).over = b.dataset.x; MethodKit.save(); renderUse(); }));
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        $('sf-summary').innerHTML = S.top.length ? `<div class="mk-result"><h4>Deine Top 5</h4><div class="sf-sum">${S.top.map((v, i) => { const u = S.use[v] || {}; const q = quad(v); return `<div style="border-left:3px solid ${Q[q].c}"><b>${i + 1}. ${esc(v)} <small>${Q[q].ic} ${Q[q].t}</small></b>${u.where ? `<div>→ ${esc(u.where)}</div>` : '<div class="mk-faint">noch kein Einsatzort</div>'}${u.over === 'yes' && u.guard ? `<div class="mk-faint">⚠ ${esc(u.guard)}</div>` : ''}</div>`; }).join('')}</div>${byQuad('learned').length ? `<div style="margin-top:10px"><b>🔋 Begrenzen oder abgeben:</b> ${byQuad('learned').map(esc).join(', ')}</div>` : ''}${byQuad('potential').length ? `<div style="margin-top:4px"><b>🌱 Lernen lohnt sich:</b> ${byQuad('potential').map(esc).join(', ')}</div>` : ''}${S.week ? `<div style="margin-top:10px"><b>Diese Woche:</b> ${esc(S.week)}</div>` : ''}${S.stop ? `<div><b>Lasse ich:</b> ${esc(S.stop)}</div>` : ''}</div>` : '<div class="mk-empty">Die Zusammenfassung füllt sich aus den vorherigen Schritten.</div>';
    }
    function renderLinks() { $('sf-links').innerHTML = LINKS.map(x => `<a class="mk-option sf-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['MEINE STÄRKEN', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        ['q1', 'q2', 'q3', 'q4'].forEach((k, i) => { if (S[k]) L.push(['Zeit vergessen: ', 'Komplimente: ', 'Als Kind: ', 'Stolzester Erfolg: '][i] + S[k]); });
        L.push('', 'LANDKARTE (Energie · Leistung · Nutzung)');
        Object.keys(Q).forEach(q => { const l = byQuad(q); if (l.length) L.push(`${Q[q].ic} ${Q[q].t}: ${l.map(v => `${v} (${R(v).e}·${R(v).p}·${R(v).u})`).join(', ')}`); });
        L.push('', 'TOP 5'); S.top.forEach((v, i) => { const u = S.use[v] || {}; L.push(`${i + 1}. ${v}${u.where ? ' → ' + u.where : ''}${u.over === 'yes' ? `  [Überdosis: ${POOL[v] || '–'}${u.guard ? ' | Gegengewicht: ' + u.guard : ''}]` : ''}`); });
        if (S.week) L.push('', 'Diese Woche: ' + S.week); if (S.stop) L.push('Lasse ich: ' + S.stop);
        MethodKit.exportText('meine-staerken.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'strengths-finder', accent: '#6366f1', accent2: '#a855f7',
            steps: [{ icon: '🔎', label: 'Sammeln' }, { icon: '⚖️', label: 'Bewerten' }, { icon: '🗺️', label: 'Landkarte' }, { icon: '🚀', label: 'Einsatz' }, { icon: '📝', label: 'Plan' }],
            defaultState: { q1: '', q2: '', q3: '', q4: '', custom: [], selected: [], ratings: {}, top: [], use: {}, week: '', stop: '' }
        });
        S = MethodKit.state;
        ['custom', 'selected', 'top'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        ['ratings', 'use'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        // Migration: alter pool (Array) → custom; altes use (String) → {where}
        if (Array.isArray(S.pool)) { S.pool.forEach(v => { if (!POOL[v] && !S.custom.includes(v)) S.custom.push(v); }); delete S.pool; }
        Object.keys(S.use).forEach(v => { if (typeof S.use[v] === 'string') S.use[v] = { where: S.use[v] }; });
        MethodKit.bindFields();
        $('sf-export').addEventListener('click', exportAll);
        const add = () => { const i = $('sf-custom'); const v = i.value.trim(); if (!v) return; if (POOL[v] || S.custom.includes(v)) { MethodKit.toast('Gibt es schon', 'warn'); return; } S.custom.push(v); S.selected.push(v); i.value = ''; MethodKit.save(); renderPool(); };
        $('sf-add').addEventListener('click', add); $('sf-custom').addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
        ['sf-week', 'sf-stop'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 1) renderPool();
            if (k === 2) renderRate();
            if (k === 3) { renderMap(); renderTop(); }
            if (k === 4) renderUse();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
