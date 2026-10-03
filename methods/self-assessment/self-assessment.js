/* Selbsteinschätzung · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const DIMS = [
        { id: 'fach', ic: '🎓', t: 'Fachkompetenz', d: 'Wissen und Können im eigenen Fachgebiet' },
        { id: 'komm', ic: '💬', t: 'Kommunikation', d: 'Klar sagen, aktiv zuhören, überzeugen' },
        { id: 'orga', ic: '🗂️', t: 'Selbstorganisation', d: 'Prioritäten, Zeit, Zuverlässigkeit' },
        { id: 'resil', ic: '🛡️', t: 'Resilienz', d: 'Mit Druck, Rückschlägen und Unsicherheit umgehen' },
        { id: 'kreativ', ic: '💡', t: 'Kreativität', d: 'Neue Wege finden, Probleme anders denken' },
        { id: 'team', ic: '🤝', t: 'Zusammenarbeit', d: 'Mit anderen Ergebnisse erzielen, Konflikte lösen' },
        { id: 'fuehrung', ic: '🧭', t: 'Führung / Initiative', d: 'Verantwortung übernehmen, Richtung geben' },
        { id: 'lernen', ic: '📈', t: 'Lernbereitschaft', d: 'Feedback annehmen, sich weiterentwickeln' }
    ];
    const REL = [['low', 'wenig'], ['mid', 'mittel'], ['high', 'zentral']];
    const LINKS = [
        { m: 'Johari-Fenster', l: '../johari-window/johari-window.html', why: 'Selbst- und Fremdbild systematisch vergleichen.' },
        { m: 'Kompetenz-Map', l: '../competence-map/competence-map.html', why: 'Ist/Soll pro Kompetenz mit Lernplan.' },
        { m: 'Stärken finden', l: '../strengths-finder/strengths-finder.html', why: 'Die Stärken-Seite vertiefen.' },
        { m: 'Ziele setzen', l: '../goal-setting/goal-setting.html', why: 'Das Entwicklungsfeld in ein Ziel übersetzen.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const r = (id) => n(S.ratings[id], 0);
    const o = (id) => n(S.othersRatings[id], 0);
    const rel = (id) => S.relevance[id] || '';
    const relW = (id) => ({ low: 1, mid: 2, high: 3 })[rel(id)] || 2;
    const rated = () => DIMS.filter(d => r(d.id));
    const extremes = () => { const s = rated().sort((a, b) => r(b.id) - r(a.id)); return { top: s.slice(0, 3), low: s.length > 3 ? s.slice(-3).reverse() : [] }; };

    /* ---------- 1 ---------- */
    function renderDims() {
        $('sa-dims').innerHTML = DIMS.map(d => `<div class="sa-dim"><div class="sa-dim-h"><span class="ic">${d.ic}</span><div><b>${d.t}</b><small>${d.d}</small></div><span class="sa-val">${r(d.id) || '–'}</span></div><div class="sa-dim-r"><input type="range" class="mk-range" min="1" max="10" value="${r(d.id) || 5}" data-r="${d.id}" ${r(d.id) ? '' : 'style="opacity:.6"'} aria-label="${d.t} Bewertung"><div class="sa-rel">${REL.map(([v, l]) => `<button class="${rel(d.id) === v ? 'on' : ''}" data-rel="${d.id}" data-v="${v}">${l}</button>`).join('')}</div></div></div>`).join('') +
            (rated().length === DIMS.length ? (() => { const vals = DIMS.map(d => r(d.id)); const spread = Math.max(...vals) - Math.min(...vals); const avg = vals.reduce((a, b) => a + b, 0) / vals.length; const highRel = DIMS.filter(d => rel(d.id) === 'high').length; return (spread <= 2 ? note('info', `Alle Werte zwischen ${Math.min(...vals)} und ${Math.max(...vals)} – sehr flach. Ehrliche Profile haben Ausschläge. Wo bist du wirklich stark, wo wirklich nicht?`) : avg >= 8.5 ? note('info', `Durchschnitt ${avg.toFixed(1)}/10. Möglich – aber Selbstüberschätzung ist die häufigste Verzerrung. Schritt 2 fragt nach Belegen.`) : avg <= 4 ? note('info', `Durchschnitt ${avg.toFixed(1)}/10. Strenge Selbstkritik oder gerade eine schwierige Phase? Schritt 3 holt das Fremdbild dazu.`) : note('ok', 'Ein differenziertes Profil.')) + (highRel >= 6 ? note('info', `${highRel} von 8 Feldern als „zentral" markiert. Wenn alles zentral ist, ist nichts zentral – welche drei sind es wirklich?`) : highRel === 0 && DIMS.some(d => rel(d.id)) ? note('info', 'Kein Feld ist „zentral"? Mindestens eines muss für deine Rolle entscheidend sein.') : ''); })() : `<div class="mk-faint" style="text-align:center">${rated().length}/8 bewertet</div>`);
        $('sa-dims').querySelectorAll('[data-r]').forEach(el => { el.addEventListener('input', () => { S.ratings[el.dataset.r] = +el.value; el.style.opacity = 1; el.closest('.sa-dim').querySelector('.sa-val').textContent = el.value; MethodKit.save(); }); el.addEventListener('change', renderDims); });
        $('sa-dims').querySelectorAll('[data-rel]').forEach(b => b.addEventListener('click', () => { S.relevance[b.dataset.rel] = rel(b.dataset.rel) === b.dataset.v ? '' : b.dataset.v; MethodKit.save(); renderDims(); }));
    }

    /* ---------- 2 ---------- */
    function renderEvidence() {
        const { top, low } = extremes();
        if (!top.length) { $('sa-evidence').innerHTML = note('info', 'Bewerte zuerst in Schritt 1.'); return; }
        const block = (title, list, ph) => `<div class="mk-section-label">${title}</div>${list.map(d => `<div class="sa-ev"><div class="sa-ev-h"><span>${d.ic}</span><b>${d.t}</b><span class="sa-val">${r(d.id)}</span></div><input class="mk-input" data-ev="${d.id}" value="${esc(S.evidence[d.id] || '')}" placeholder="${ph}">${S.evidence[d.id] && S.evidence[d.id].length < 15 ? '<div class="mk-faint">Konkreter: Wann, was, mit welchem Ergebnis?</div>' : ''}</div>`).join('')}`;
        const missing = [...top, ...low].filter(d => !(S.evidence[d.id] || '').trim());
        $('sa-evidence').innerHTML = block('Deine höchsten Werte', top, 'Eine Situation, in der das sichtbar war') + (low.length ? block('Deine tiefsten Werte', low, 'Eine Situation, in der es gefehlt hat') : '') +
            (missing.length === 0 ? note('ok', 'Jede Extrem-Einschätzung hat einen Beleg. Das macht dein Profil belastbar.') : missing.some(d => top.includes(d)) ? note('info', `Für ${missing.filter(d => top.includes(d)).map(d => d.t).join(', ')} fehlt der Beleg. Eine hohe Einschätzung ohne Beispiel ist ein Wunsch, kein Befund.`) : note('info', `Noch ohne Beleg: ${missing.map(d => d.t).join(', ')}.`));
        $('sa-evidence').querySelectorAll('[data-ev]').forEach(el => { el.addEventListener('input', () => { S.evidence[el.dataset.ev] = el.value; MethodKit.save(); }); el.addEventListener('change', renderEvidence); });
    }

    /* ---------- 3 ---------- */
    function renderOthers() {
        $('sa-others').innerHTML = DIMS.map(d => `<div class="sa-oth"><div class="sa-oth-l"><span>${d.ic}</span><b>${d.t}</b></div><div class="sa-oth-self" title="Mein Wert">ich ${r(d.id) || '–'}</div><input type="range" class="mk-range" min="1" max="10" value="${o(d.id) || r(d.id) || 5}" data-o="${d.id}" ${o(d.id) ? '' : 'style="opacity:.6"'} aria-label="${d.t} Fremdbild"><span class="sa-val ${o(d.id) && r(d.id) ? (o(d.id) - r(d.id) >= 2 ? 'up' : r(d.id) - o(d.id) >= 2 ? 'down' : '') : ''}">${o(d.id) || '–'}</span></div>`).join('') +
            (() => { const both = DIMS.filter(d => r(d.id) && o(d.id)); if (both.length < 4) return `<div class="mk-faint" style="text-align:center">${both.length}/8 – schätze für jedes Feld, wie ${esc(S.rater || 'diese Person')} dich sieht.</div>`; const over = both.filter(d => r(d.id) - o(d.id) >= 2), under = both.filter(d => o(d.id) - r(d.id) >= 2); return (over.length ? note('warn', `<strong>Mögliche Überschätzung:</strong> ${over.map(d => `${d.t} (ich ${r(d.id)} · andere ${o(d.id)})`).join(', ')}. Hier lohnt echtes Feedback – bevor es dich überrascht.`) : '') + (under.length ? note('ok', `<strong>Mögliche Unterschätzung:</strong> ${under.map(d => `${d.t} (ich ${r(d.id)} · andere ${o(d.id)})`).join(', ')}. Andere sehen hier mehr als du. Das ist oft eine versteckte Stärke.`) : '') + (!over.length && !under.length ? note('ok', 'Selbst- und Fremdbild liegen nah beieinander. Entweder kennst du dich gut – oder du hast das Fremdbild an dein Selbstbild angepasst. Prüf das mit einer echten Rückmeldung.') : ''); })();
        $('sa-others').querySelectorAll('[data-o]').forEach(el => { el.addEventListener('input', () => { S.othersRatings[el.dataset.o] = +el.value; el.style.opacity = 1; el.closest('.sa-oth').querySelector('.sa-val').textContent = el.value; MethodKit.save(); }); el.addEventListener('change', renderOthers); });
    }

    /* ---------- 4 ---------- */
    function renderProfile() {
        if (!rated().length) { $('sa-profile').innerHTML = note('info', 'Noch keine Bewertungen.'); return; }
        const sorted = [...DIMS].sort((a, b) => r(b.id) - r(a.id));
        $('sa-profile').innerHTML = `<div class="sa-prof">${sorted.map(d => `<div class="sa-prof-row"><div class="sa-prof-l"><span>${d.ic}</span><b>${d.t}</b>${rel(d.id) === 'high' ? '<i class="sa-star" title="zentral">★</i>' : ''}</div><div class="sa-prof-bars"><div class="sa-prof-bar"><i style="width:${r(d.id) * 10}%"></i><span>${r(d.id) || '–'}</span></div>${o(d.id) ? `<div class="sa-prof-bar oth"><i style="width:${o(d.id) * 10}%"></i><span>${o(d.id)}</span></div>` : ''}</div></div>`).join('')}</div><div class="sa-legend"><span><i class="me"></i> Selbstbild</span><span><i class="oth"></i> Fremdbild${S.rater ? ` (${esc(S.rater)})` : ''}</span><span>★ zentral für ${esc(S.goal || 'dein Ziel')}</span></div>`;
    }
    function quadrant(d) { const hi = r(d.id) >= 7; const w = relW(d.id); return w >= 3 ? (hi ? 'use' : 'grow') : w === 1 ? (hi ? 'bonus' : 'leave') : (hi ? 'use' : 'watch'); }
    function renderMatrix() {
        const withRel = rated().filter(d => rel(d.id));
        if (withRel.length < 4) { $('sa-matrix').innerHTML = note('info', 'Markiere in Schritt 1 die Relevanz der Felder – dann erscheint die Matrix.'); return; }
        const Q = { use: { t: 'Einsetzen', d: 'relevant & stark – dein Kapital', c: '#10b981' }, grow: { t: 'Entwickeln', d: 'zentral & ausbaufähig – hier zählt jeder Schritt', c: '#ef4444' }, watch: { t: 'Im Blick behalten', d: 'mittlere Relevanz, ausbaufähig', c: '#f59e0b' }, bonus: { t: 'Nice to have', d: 'stark, aber wenig relevant', c: '#8b5cf6' }, leave: { t: 'In Ruhe lassen', d: 'wenig relevant – keine Energie hier', c: '#94a3b8' } };
        const groups = {}; withRel.forEach(d => { const q = quadrant(d); (groups[q] = groups[q] || []).push(d); });
        const grow = groups.grow || [];
        $('sa-matrix').innerHTML = `<div class="sa-mx">${['grow', 'use', 'watch', 'bonus', 'leave'].filter(q => groups[q]).map(q => `<div class="sa-mx-box" style="--c:${Q[q].c}"><b>${Q[q].t}</b><small>${Q[q].d}</small><div class="sa-mx-items">${groups[q].map(d => `<span>${d.ic} ${d.t} <em>${r(d.id)}</em></span>`).join('')}</div></div>`).join('')}</div>` +
            (grow.length ? note('warn', `<strong>Entwicklungsfeld${grow.length > 1 ? 'er' : ''}:</strong> ${grow.map(d => d.t).join(', ')} – zentral für dein Ziel, aber unter 7. ${grow.length > 2 ? 'Mehr als zwei auf einmal funktioniert selten. Schritt 5 hilft beim Fokussieren.' : 'Genau hier setzt Schritt 5 an.'}`) : (groups.use || []).length ? note('ok', 'Alle zentralen Felder sind stark. Dein Hebel liegt dann nicht im Entwickeln, sondern im Sichtbarmachen – oder deine Ziele dürfen grösser werden.') : '');
    }

    /* ---------- 5 ---------- */
    function renderFocus() {
        const cands = rated().filter(d => rel(d.id) === 'high' && r(d.id) < 7).sort((a, b) => r(a.id) - r(b.id));
        const sugg = cands[0] || rated().filter(d => r(d.id) - o(d.id) >= 2)[0] || null;
        if (!S.focus && sugg) S.focus = sugg.id;
        const f = DIMS.find(d => d.id === S.focus);
        $('sa-focus').innerHTML = `${sugg ? note('info', `Vorschlag: <strong>${sugg.ic} ${sugg.t}</strong> – ${cands.includes(sugg) ? `zentral für dein Ziel, aktuell ${r(sugg.id)}/10.` : `hier liegt die grösste Lücke zwischen Selbst- (${r(sugg.id)}) und Fremdbild (${o(sugg.id)}).`}`) : ''}<div class="mk-field"><label>Dein Fokus-Feld</label><div class="mk-chips">${DIMS.map(d => `<button class="mk-chip ${S.focus === d.id ? 'selected' : ''}" data-f="${d.id}">${d.ic} ${d.t}</button>`).join('')}</div></div>${f ? `<div class="sa-focus-box"><b>${f.ic} ${f.t}</b> – heute ${r(f.id) || '–'}/10${o(f.id) ? `, Fremdbild ${o(f.id)}` : ''}${S.evidence[f.id] ? `<div class="mk-faint">Beleg: ${esc(S.evidence[f.id])}</div>` : ''}${rel(f.id) === 'low' ? '<div class="mk-faint">Du hast dieses Feld als wenig relevant markiert – bist du sicher, dass hier deine Energie am besten investiert ist?</div>' : ''}</div>` : ''}`;
        $('sa-focus').querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { S.focus = b.dataset.f; MethodKit.save(); renderFocus(); renderSummary(); }));
    }
    function renderSummary() {
        const f = DIMS.find(d => d.id === S.focus);
        $('sa-summary').innerHTML = f && (S.next || S.measure) ? `<div class="mk-result" style="margin-top:12px"><h4>Dein Entwicklungsschritt</h4><div><b>${f.ic} ${f.t}</b>${S.goal ? ` · für ${esc(S.goal)}` : ''}</div>${S.next ? `<div style="margin-top:6px">${esc(S.next)}</div>` : ''}${S.measure ? `<div class="mk-faint" style="margin-top:4px">Woran ich es merke: ${esc(S.measure)}</div>` : ''}</div>` : '';
    }
    function renderHistory() {
        $('sa-history').innerHTML = `<button class="mk-btn mk-btn-outline mk-btn-sm" id="sa-snap" ${rated().length < 8 ? 'disabled' : ''}><i class="fas fa-camera"></i> Momentaufnahme speichern</button>` +
            (S.history.length ? `<div class="sa-hist">${[...S.history].reverse().map((h, i) => `<div class="sa-hist-row"><small>${new Date(h.date).toLocaleDateString('de-CH')}</small><div class="sa-hist-vals">${DIMS.map(d => `<span title="${d.t}">${d.ic}<b>${h.r[d.id] || '–'}</b></span>`).join('')}</div><span class="mk-faint">Ø ${(DIMS.reduce((a, d) => a + (h.r[d.id] || 0), 0) / 8).toFixed(1)}</span></div>`).join('')}</div>` +
                (S.history.length >= 2 ? (() => { const a = S.history[S.history.length - 2].r, b = S.history[S.history.length - 1].r; const ups = DIMS.filter(d => (b[d.id] || 0) > (a[d.id] || 0)), downs = DIMS.filter(d => (b[d.id] || 0) < (a[d.id] || 0)); return note(ups.length >= downs.length ? 'ok' : 'info', `Seit der letzten Aufnahme: ${ups.length ? '↑ ' + ups.map(d => d.t).join(', ') : ''}${ups.length && downs.length ? ' · ' : ''}${downs.length ? '↓ ' + downs.map(d => d.t).join(', ') : ''}${!ups.length && !downs.length ? 'unverändert' : ''}.${S.focus && ups.some(d => d.id === S.focus) ? ' Dein Fokus-Feld hat sich verbessert.' : ''}`); })() : '') : '<div class="mk-faint" style="margin-top:8px">Noch keine Momentaufnahme. Speichere eine, wenn alle 8 Felder bewertet sind.</div>');
        $('sa-snap').addEventListener('click', () => { S.history.push({ date: Date.now(), r: { ...S.ratings }, o: { ...S.othersRatings }, focus: S.focus }); MethodKit.save({ now: true }); MethodKit.toast('Momentaufnahme gespeichert', 'ok'); renderHistory(); });
    }
    function renderLinks() { $('sa-links').innerHTML = LINKS.map(x => `<a class="mk-option sa-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const f = DIMS.find(d => d.id === S.focus);
        const L = ['SELBSTEINSCHÄTZUNG', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), S.goal ? 'Bezug: ' + S.goal : '', '', 'PROFIL (Selbst / Fremd / Relevanz)'];
        DIMS.forEach(d => L.push(`${d.ic} ${d.t}: ${r(d.id) || '–'} / ${o(d.id) || '–'} / ${(REL.find(x => x[0] === rel(d.id)) || ['', '–'])[1]}${S.evidence[d.id] ? '  – Beleg: ' + S.evidence[d.id] : ''}`));
        L.push('', S.strengths ? 'STÄRKEN: ' + S.strengths : '', S.growth ? 'WACHSTUMSFELDER: ' + S.growth : '', S.others ? 'FEEDBACK: ' + S.others : '', '');
        L.push('FOKUS: ' + (f ? f.t : '–'), 'Nächster Schritt: ' + (S.next || '–'), S.measure ? 'Messbar: ' + S.measure : '');
        if (S.history.length) L.push('', 'VERLAUF', ...S.history.map(h => `${new Date(h.date).toLocaleDateString('de-CH')}: ${DIMS.map(d => `${d.t.split(' ')[0]} ${h.r[d.id] || '–'}`).join(' · ')}`));
        MethodKit.exportText('selbsteinschaetzung.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'self-assessment', accent: '#6366f1', accent2: '#8b5cf6',
            steps: [{ icon: '📊', label: 'Selbstbild' }, { icon: '🔎', label: 'Belege' }, { icon: '👥', label: 'Fremdbild' }, { icon: '🧭', label: 'Profil' }, { icon: '🎯', label: 'Schritt' }],
            defaultState: { goal: '', ratings: {}, relevance: {}, evidence: {}, rater: '', othersRatings: {}, others: '', strengths: '', growth: '', focus: '', next: '', measure: '', history: [] }
        });
        S = MethodKit.state;
        ['ratings', 'relevance', 'evidence', 'othersRatings'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        if (!Array.isArray(S.history)) S.history = [];
        MethodKit.bindFields();
        $('sa-export').addEventListener('click', exportAll);
        ['sa-next', 'sa-measure'].forEach(id => $(id).addEventListener('input', renderSummary));
        MethodKit.onStep = function (k) {
            if (k === 1) renderDims();
            if (k === 2) renderEvidence();
            if (k === 3) renderOthers();
            if (k === 4) { renderProfile(); renderMatrix(); }
            if (k === 5) { renderFocus(); renderSummary(); renderHistory(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
