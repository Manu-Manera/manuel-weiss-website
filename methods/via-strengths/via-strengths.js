/* VIA-Charakterstärken · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const VIRTUES = [
        { id: 'wis', ic: '🦉', t: 'Weisheit & Wissen', c: '#6366f1', s: [['Kreativität', 'Neue, produktive Wege finden, Dinge zu tun', 'Koch heute ohne Rezept · Löse ein Alltagsproblem auf eine Art, die du noch nie probiert hast'], ['Neugier', 'Interesse an allem, was ist; Entdeckerfreude', 'Nimm einen unbekannten Heimweg · Stell jemandem drei Fragen, die du dich sonst nicht traust'], ['Urteilsvermögen', 'Dinge durchdenken, von allen Seiten betrachten', 'Vertritt heute bewusst die Gegenposition zu deiner Meinung · Suche aktiv nach einem Argument gegen deine Überzeugung'], ['Liebe zum Lernen', 'Neue Fähigkeiten und Wissen erwerben – um ihrer selbst willen', 'Lerne zehn Wörter einer fremden Sprache · Schau eine Dokumentation zu etwas, das dich nie interessiert hat'], ['Weitsicht', 'Anderen weisen Rat geben, das grosse Ganze sehen', 'Frag jemanden, der bei einer Entscheidung ringt, drei Fragen statt eine Antwort zu geben']] },
        { id: 'cou', ic: '🦁', t: 'Mut', c: '#ef4444', s: [['Tapferkeit', 'Vor Bedrohung oder Schmerz nicht zurückschrecken, für Richtiges eintreten', 'Sprich etwas Unbequemes an, das du seit Wochen aufschiebst'], ['Ausdauer', 'Beenden, was man angefangen hat', 'Bring heute eine liegengebliebene Aufgabe zu Ende – komplett'], ['Ehrlichkeit', 'Die Wahrheit sagen, authentisch sein', 'Sag heute einmal „Ich weiss es nicht" oder „Ich habe das falsch gemacht"'], ['Enthusiasmus', 'Mit Energie und Begeisterung leben', 'Mach etwas Körperliches, das dich wach macht, bevor der Tag richtig losgeht']] },
        { id: 'hum', ic: '❤️', t: 'Menschlichkeit', c: '#ec4899', s: [['Bindungsfähigkeit', 'Nahe Beziehungen schätzen, Nähe geben und annehmen', 'Schreib jemandem, was du an ihm oder ihr schätzt – ohne Anlass'], ['Freundlichkeit', 'Anderen Gefallen tun, sich kümmern', 'Tu etwas Nettes für jemanden, der es nie erfährt'], ['Soziale Intelligenz', 'Motive und Gefühle anderer wahrnehmen', 'Beobachte in einem Gespräch nur die Körpersprache – und benenne, was du siehst']] },
        { id: 'jus', ic: '⚖️', t: 'Gerechtigkeit', c: '#f59e0b', s: [['Teamwork', 'Als Mitglied einer Gruppe gut arbeiten, loyal sein', 'Übernimm im Team eine Aufgabe, die niemand will'], ['Fairness', 'Alle gleich behandeln, unvoreingenommen', 'Hör dir heute die Position von jemandem an, dem du normalerweise nicht zuhörst'], ['Führungsvermögen', 'Gruppen organisieren und zum Ziel führen', 'Bring ein Treffen auf den Punkt, das sich im Kreis dreht']] },
        { id: 'tem', ic: '🧘', t: 'Mässigung', c: '#10b981', s: [['Vergebungsbereitschaft', 'Denen vergeben, die Unrecht getan haben', 'Lass heute eine kleine Kränkung bewusst los – ohne es zu kommentieren'], ['Bescheidenheit', 'Leistungen für sich sprechen lassen', 'Erzähl heute von einem Erfolg, ohne dich selbst zu erwähnen – gib das Lob weiter'], ['Besonnenheit', 'Vorsichtig sein, nichts sagen oder tun, was man bereuen könnte', 'Zähl vor jeder Antwort in einem schwierigen Gespräch bis drei'], ['Selbstregulation', 'Gefühle und Handeln steuern', 'Lass eine Gewohnheit heute einmal aus – Kaffee, Handy, Snack – und beobachte, was passiert']] },
        { id: 'tra', ic: '✨', t: 'Transzendenz', c: '#8b5cf6', s: [['Sinn für das Schöne', 'Schönheit und Exzellenz wahrnehmen und schätzen', 'Bleib heute drei Minuten vor etwas Schönem stehen, an dem du sonst vorbeigehst'], ['Dankbarkeit', 'Sich des Guten bewusst sein und es ausdrücken', 'Schreib drei Dinge auf, die heute gut waren – und warum'], ['Hoffnung', 'Das Beste erwarten und darauf hinarbeiten', 'Beschreib, wie ein Problem in einem Jahr gelöst aussieht – im Detail'], ['Humor', 'Lachen und andere zum Lachen bringen', 'Erzähl jemandem, was dir heute Komisches passiert ist'], ['Spiritualität', 'Überzeugungen über Sinn und Zweck des Lebens haben', 'Nimm dir fünf Minuten Stille, in denen du nichts tust – nur da bist']] }
    ];
    const ALL = []; VIRTUES.forEach(v => v.s.forEach(([name, d, ex]) => ALL.push({ name, d, ex, v })));
    const LEVELS = [[1, 'kaum'], [2, 'etwas'], [3, 'teils'], [4, 'ziemlich'], [5, 'ganz ich']];
    const CRIT = [['real', 'Fühlt sich echt an', '„Das bin wirklich ich" – nicht „das sollte ich sein"'], ['energy', 'Gibt Energie', 'Beim Einsatz fühle ich mich lebendig, nicht erschöpft'], ['want', 'Nutze ich gern', 'Ich suche Gelegenheiten dafür – freiwillig']];
    const LINKS = [
        { m: 'Stärken finden', l: '../strengths-finder/strengths-finder.html', why: 'Stärken nach Energie, Leistung und Nutzung sortieren.' },
        { m: 'Dankbarkeit & Achtsamkeit', l: '../mindfulness/mindfulness.html', why: 'Transzendenz-Stärken trainieren.' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Die neue Anwendung zur Routine machen.' },
        { m: 'Ikigai', l: '../ikigai/ikigai.html', why: 'Stärken mit Sinn verbinden.' }
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
            (ratedCount() === ALL.length ? (() => { const vals = ALL.map(x => r(x.name)); const high = vals.filter(v => v === 5).length; return high > 8 ? note('info', `${high} Stärken mit „ganz ich". Bei mehr als 8 lohnt sich ein strengerer Blick – Signaturstärken sind die, die herausragen.`) : high === 0 ? note('info', 'Kein einziges „ganz ich"? Bescheidenheit ist eine Stärke – aber irgendwo bist du mehr du als anderswo. Welche drei würden Freunde nennen?') : note('ok', 'Alle 24 bewertet. Weiter zum Profil.'); })() : `<div class="mk-faint" style="text-align:center">${ratedCount()}/24 bewertet</div>`);
        $('via-rate').querySelectorAll('[data-rn]').forEach(b => b.addEventListener('click', () => { S.ratings[b.dataset.rn] = +b.dataset.x; MethodKit.save(); renderRate(); }));
    }

    /* ---------- 2 ---------- */
    function renderProfile() {
        if (ratedCount() < 12) { $('via-profile').innerHTML = note('info', `Bewerte mindestens die Hälfte der Stärken (${ratedCount()}/24) – dann erscheint dein Profil.`); return; }
        const vs = VIRTUES.map(v => { const vals = v.s.map(([name]) => r(name)).filter(Boolean); return { v, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0, top: v.s.map(([name]) => name).filter(name => r(name) >= 4) }; }).sort((a, b) => b.avg - a.avg);
        const cx = 150, cy = 150, R = 110; const pt = (i, val) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(a) * R * val / 5, cy + Math.sin(a) * R * val / 5]; };
        const ordered = VIRTUES.map(v => vs.find(x => x.v.id === v.id));
        $('via-profile').innerHTML = `<div class="via-radar"><svg viewBox="0 0 300 300">${[1, 2, 3, 4, 5].map(val => `<polygon points="${ordered.map((_, i) => pt(i, val).join(',')).join(' ')}" fill="none" stroke="var(--mk-line)"/>`).join('')}<polygon points="${ordered.map((x, i) => pt(i, x.avg).join(',')).join(' ')}" fill="rgba(139,92,246,.2)" stroke="var(--mk-accent)" stroke-width="2.5"/>${ordered.map((x, i) => { const [px, py] = pt(i, 6); return `<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="middle" font-size="20">${x.v.ic}</text>`; }).join('')}</svg><div class="via-vlist">${vs.map((x, i) => `<div class="via-vrow ${i === 0 ? 'top' : ''}" style="--c:${x.v.c}"><span>${x.v.ic}</span><div><b>${x.v.t}</b><small>${x.top.join(', ') || '–'}</small></div><strong>${x.avg.toFixed(1)}</strong></div>`).join('')}</div></div>` +
            note('info', `Deine stärkste Tugend: <strong>${vs[0].v.ic} ${vs[0].v.t}</strong> (${vs[0].avg.toFixed(1)}/5). ${{ wis: 'Du verstehst die Welt über den Kopf – Wissen, Perspektiven, Ideen. Achte darauf, dass das Herz mitkommt.', cou: 'Du gehst dahin, wo es unbequem wird. Das ist selten und wertvoll – und braucht Erholungsphasen.', hum: 'Beziehungen sind dein Element. Vergiss nicht, dass auch du jemanden brauchst, der sich um dich kümmert.', jus: 'Du denkst in Wir. Fairness und Gemeinschaft sind dir wichtiger als der eigene Vorteil – gut, solange du dich nicht selbst vergisst.', tem: 'Du hast dich im Griff – Mass, Geduld, Vergebung. Die Herausforderung: manchmal braucht es Unmass.', tra: 'Du siehst das Grössere – Schönheit, Sinn, Hoffnung. Hol es in den Alltag, sonst bleibt es Theorie.' }[vs[0].v.id]}`) +
            (vs[5].avg < 2.5 ? note('info', `Schwächste Tugend: ${vs[5].v.ic} ${vs[5].v.t} (${vs[5].avg.toFixed(1)}). Das ist keine Aufforderung, daran zu arbeiten – VIA setzt auf Stärken. Aber: Wer in deinem Umfeld hat das? Diese Menschen ergänzen dich.`) : '') +
            (vs[0].avg - vs[5].avg < 0.8 ? note('ok', 'Ein ausgewogenes Profil über alle sechs Tugenden. Deine Signaturstärken werden sich eher auf Ebene der einzelnen Stärken zeigen als auf Tugend-Ebene.') : '');
    }

    /* ---------- 3 ---------- */
    function renderSig() {
        const rk = ranked(); if (rk.length < 5) { $('via-sig').innerHTML = note('info', 'Bewerte zuerst mehr Stärken in Schritt 1.'); return; }
        const cutoff = rk[Math.min(6, rk.length - 1)] ? r(rk[Math.min(6, rk.length - 1)].name) : 4;
        const cands = rk.filter(x => r(x.name) >= Math.max(4, cutoff)).slice(0, 8);
        const sigs = signatures();
        $('via-sig').innerHTML = `<div class="via-cands">${cands.map(x => { const c = S.sigTest[x.name] || {}; const k = sigTest(x.name); return `<div class="via-cand ${k === 3 ? 'sig' : ''}" style="--c:${x.v.c}"><div class="via-cand-h"><span>${x.v.ic}</span><b>${x.name}</b><small>${r(x.name)}/5</small>${k === 3 ? '<span class="via-badge">🏅 Signatur</span>' : ''}</div><div class="via-crit">${CRIT.map(([id, t, d]) => `<label class="${c[id] ? 'on' : ''}" title="${d}"><input type="checkbox" data-sc="${x.name}" data-c="${id}" ${c[id] ? 'checked' : ''}> ${t}</label>`).join('')}</div></div>`; }).join('')}</div>` +
            (sigs.length === 0 ? note('info', 'Noch keine Stärke erfüllt alle drei Kriterien. Das ist normal – viele hohe Werte sind erlernte Stärken, die Energie kosten. Prüfe ehrlich.') : sigs.length > 5 ? note('warn', `${sigs.length} Signaturstärken – mehr als fünf ist selten echt. Welche fühlen sich beim Lesen am wenigsten nach dir an?`) : sigs.length >= 3 ? note('ok', `${sigs.length} Signaturstärke${sigs.length > 1 ? 'n' : ''}: <strong>${sigs.join(', ')}</strong>. Das sind die, die dich ausmachen.`) : note('ok', `${sigs.length} Signaturstärke${sigs.length > 1 ? 'n' : ''}: <strong>${sigs.join(', ')}</strong>. Prüfe die anderen Kandidaten – meist sind es drei bis fünf.`)) +
            (cands.some(x => r(x.name) === 5 && sigTest(x.name) > 0 && sigTest(x.name) < 3 && !(S.sigTest[x.name] || {}).energy) ? note('info', `${cands.filter(x => r(x.name) === 5 && sigTest(x.name) > 0 && sigTest(x.name) < 3 && !(S.sigTest[x.name] || {}).energy).map(x => x.name).join(', ')}: „ganz ich", aber gibt keine Energie? Das sieht nach einer Stärke aus, die du dir antrainiert hast – oder die andere von dir erwarten.`) : '');
        $('via-sig').querySelectorAll('[data-sc]').forEach(cb => cb.addEventListener('change', () => { (S.sigTest[cb.dataset.sc] = S.sigTest[cb.dataset.sc] || {})[cb.dataset.c] = cb.checked; MethodKit.save(); renderSig(); }));
    }

    /* ---------- 4 ---------- */
    function renderWeek() {
        const sigs = signatures(); const pool = sigs.length ? sigs : ranked().slice(0, 5).map(x => x.name);
        if (!pool.length) { $('via-week').innerHTML = note('info', 'Bestimme zuerst deine Signaturstärken.'); return; }
        if (!S.week.strength || !pool.includes(S.week.strength)) S.week.strength = pool[0];
        const st = ALL.find(x => x.name === S.week.strength);
        const W = S.week; W.days = W.days || {};
        const doneDays = Object.values(W.days).filter(d => d && d.done).length;
        const started = W.start ? new Date(W.start) : null;
        const todayIdx = started ? Math.floor((Date.now() - started.getTime()) / 864e5) : -1;
        $('via-week').innerHTML = `<div class="mk-field"><label>Welche Stärke?</label><div class="mk-chips">${pool.map(nm => `<button class="mk-chip ${W.strength === nm ? 'selected' : ''}" data-ws="${nm}">${nm}</button>`).join('')}</div></div>` +
            (st ? `<div class="via-ex" style="--c:${st.v.c}"><b>${st.v.ic} ${st.name}</b><small>${st.d}</small><div class="via-ex-ideas"><span class="mk-section-label">Ideen für neue Anwendungen</span>${st.ex.split(' · ').map(e => `<div>· ${e}</div>`).join('')}</div></div>` : '') +
            (!W.start ? `<button class="mk-btn mk-btn-primary" id="via-start"><i class="fas fa-play"></i> Woche starten</button>` : `<div class="via-days">${[0, 1, 2, 3, 4, 5, 6].map(i => { const d = W.days[i] || {}; const date = new Date(started.getTime() + i * 864e5); const isToday = i === todayIdx; const past = i < todayIdx; return `<div class="via-day ${d.done ? 'done' : ''} ${isToday ? 'today' : ''} ${past && !d.done ? 'missed' : ''}"><div class="via-day-h"><b>Tag ${i + 1}</b><small>${date.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'numeric' })}</small><button class="via-check" data-dd="${i}" aria-label="Tag ${i + 1} erledigt">${d.done ? '✓' : ''}</button></div><input class="mk-input" data-dn="${i}" value="${esc(d.note || '')}" placeholder="Wie hast du ${st ? st.name : 'die Stärke'} heute neu eingesetzt?"></div>`; }).join('')}</div>` +
                (doneDays === 7 ? note('ok', 'Sieben von sieben. Die Forschung sagt: Der Effekt auf dein Wohlbefinden hält bis zu sechs Monate – wenn du weitermachst. Welche Stärke kommt als Nächstes?') : todayIdx > 6 ? note('info', `Die Woche ist vorbei – ${doneDays} von 7 Tagen. ${doneDays >= 4 ? 'Gut genug, um etwas zu merken. Reflektiere in Schritt 5.' : 'Das ist okay. Starte neu – mit einer anderen Stärke oder derselben.'}`) : todayIdx >= 2 && doneDays === 0 ? note('warn', 'Tag 3 und noch nichts eingetragen. Der Trick: nicht gross denken. Eine Minute, eine neue Art – das zählt.') : doneDays ? note('ok', `${doneDays} Tag${doneDays > 1 ? 'e' : ''} geschafft. ${(W.days[todayIdx] || {}).done ? 'Heute erledigt.' : 'Heute noch offen.'}`) : '') +
                `<button class="mk-btn mk-btn-outline mk-btn-sm" id="via-restart" style="margin-top:10px"><i class="fas fa-rotate"></i> Neu starten</button>`);
        $('via-week').querySelectorAll('[data-ws]').forEach(b => b.addEventListener('click', () => { if (W.start && W.strength !== b.dataset.ws && !confirm('Stärke wechseln? Die laufende Woche wird zurückgesetzt.')) return; if (W.strength !== b.dataset.ws) { W.strength = b.dataset.ws; W.start = null; W.days = {}; } MethodKit.save(); renderWeek(); }));
        const s = $('via-start'); if (s) s.addEventListener('click', () => { W.start = Date.now(); W.days = {}; MethodKit.save({ now: true }); renderWeek(); });
        const rs = $('via-restart'); if (rs) rs.addEventListener('click', () => { if (!confirm('Woche neu starten? Einträge gehen verloren.')) return; S.history.push({ strength: W.strength, start: W.start, done: doneDays }); W.start = Date.now(); W.days = {}; MethodKit.save({ now: true }); renderWeek(); });
        $('via-week').querySelectorAll('[data-dd]').forEach(b => b.addEventListener('click', () => { const i = b.dataset.dd; W.days[i] = W.days[i] || {}; W.days[i].done = !W.days[i].done; MethodKit.save(); renderWeek(); }));
        $('via-week').querySelectorAll('[data-dn]').forEach(inp => inp.addEventListener('input', () => { const i = inp.dataset.dn; W.days[i] = W.days[i] || {}; W.days[i].note = inp.value; if (inp.value.trim() && !W.days[i].done) { W.days[i].done = true; inp.closest('.via-day').classList.add('done'); inp.closest('.via-day').querySelector('.via-check').textContent = '✓'; } MethodKit.save(); }));
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        const sigs = signatures(); const W = S.week; const doneDays = Object.values(W.days || {}).filter(d => d && d.done).length;
        $('via-summary').innerHTML = sigs.length || W.start ? `<div class="mk-result"><h4>Dein VIA-Profil</h4>${sigs.length ? `<div><b>🏅 Signaturstärken:</b> ${sigs.join(', ')}</div>` : ''}${W.start ? `<div style="margin-top:6px"><b>7-Tage-Übung:</b> ${esc(W.strength)} – ${doneDays}/7 Tage</div>${Object.entries(W.days).filter(([, d]) => d && d.note).map(([i, d]) => `<div class="mk-faint" style="margin-left:12px">Tag ${+i + 1}: ${esc(d.note)}</div>`).join('')}` : ''}${S.history.length ? `<div class="mk-faint" style="margin-top:6px">Frühere Wochen: ${S.history.map(h => `${h.strength} (${h.done}/7)`).join(', ')}</div>` : ''}${S.reflect ? `<div style="margin-top:8px"><b>Reflexion:</b> ${esc(S.reflect)}</div>` : ''}${S.next ? `<div><b>Als Nächstes:</b> ${esc(S.next)}</div>` : ''}</div>` : '<div class="mk-empty">Die Zusammenfassung füllt sich aus den vorherigen Schritten.</div>';
    }
    function renderLinks() { $('via-links').innerHTML = LINKS.map(x => `<a class="mk-option via-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const sigs = signatures(); const W = S.week;
        const L = ['VIA-CHARAKTERSTÄRKEN', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        VIRTUES.forEach(v => { L.push(`${v.ic} ${v.t.toUpperCase()}`); v.s.forEach(([name]) => L.push(`  ${name}: ${r(name) || '–'}/5${sigs.includes(name) ? '  🏅 Signatur' : ''}`)); L.push(''); });
        if (W.start) { L.push(`7-TAGE-ÜBUNG: ${W.strength} (ab ${new Date(W.start).toLocaleDateString('de-CH')})`); Object.entries(W.days || {}).forEach(([i, d]) => { if (d && (d.done || d.note)) L.push(`  Tag ${+i + 1}: ${d.done ? '✓ ' : ''}${d.note || ''}`); }); L.push(''); }
        if (S.reflect) L.push('Reflexion: ' + S.reflect); if (S.next) L.push('Als Nächstes: ' + S.next);
        MethodKit.exportText('via-staerken.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'via-strengths', accent: '#8b5cf6', accent2: '#ec4899',
            steps: [{ icon: '📋', label: 'Bewerten' }, { icon: '🕸️', label: 'Profil' }, { icon: '🏅', label: 'Signatur' }, { icon: '📅', label: '7 Tage' }, { icon: '🌱', label: 'Reflexion' }],
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
