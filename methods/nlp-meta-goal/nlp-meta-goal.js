/* Wohlgeformtes Ziel (NLP) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const NEG = /\b(nicht|nie|kein|keine|keinen|weniger|aufhören|loswerden|ohne|vermeiden|weg|los|endlich nicht|nicht mehr)\b/i;
    const VAGUE = /\b(besser|glücklicher|entspannter|erfolgreicher|zufriedener|selbstbewusster|mehr|gesünder|ruhiger|gut)\b/i;
    const OTHERS = /\b(dass (er|sie|mein|meine|die|der|das|man)|soll(te)? (er|sie)|er soll|sie soll|die anderen|mein chef soll|endlich versteht|akzeptier)/i;
    const MODAL = /\b(sollte|müsste|könnte|eigentlich|vielleicht|versuchen|probieren)\b/i;
    const PAIRS = [
        { bad: 'Ich will nicht mehr nervös sein', good: 'Ich bin ruhig und präsent, wenn ich vor dem Team spreche' },
        { bad: 'Mein Partner soll mehr Zeit haben', good: 'Ich plane jede Woche einen festen Abend zu zweit und lade dazu ein' },
        { bad: 'Weniger Stress', good: 'Ich beende den Arbeitstag um 18 Uhr und schliesse den Laptop' },
        { bad: 'Erfolgreicher werden', good: 'Ich leite bis Juni ein eigenes Projekt mit drei Personen' }
    ];
    const CTX = { where: ['Arbeit', 'Zuhause', 'Partnerschaft', 'Freundeskreis', 'Sport', 'Öffentlich', 'Online', 'Überall'], when: ['Täglich', 'Wöchentlich', 'In Meetings', 'Unter Druck', 'Morgens', 'Abends', 'In Konflikten', 'Immer'], who: ['Allein', 'Partner:in', 'Familie', 'Team', 'Vorgesetzte', 'Kund:innen', 'Fremde', 'Alle'] };
    const VAKOG = [
        { k: 'see', ic: '👁️', l: 'Was siehst du?', h: 'Ort, Menschen, Gesichter, dein Körper, Licht …' },
        { k: 'hear', ic: '👂', l: 'Was hörst du – auch innerlich?', h: 'Stimmen, Sätze, Töne, dein innerer Kommentar …' },
        { k: 'feel', ic: '🫀', l: 'Was fühlst du?', h: 'Körperempfindung, Haltung, Atmung, Temperatur …' },
        { k: 'smell', ic: '👃', l: 'Riechst oder schmeckst du etwas?', h: 'Optional – oft überraschend stark verankert.' }
    ];
    const RES_CATS = [
        { k: 'skills', l: 'Fähigkeiten & Wissen', ic: '🧠' }, { k: 'people', l: 'Menschen & Unterstützung', ic: '🤝' }, { k: 'time', l: 'Zeit & Energie', ic: '⏱️' }, { k: 'means', l: 'Mittel & Geld', ic: '🧰' }, { k: 'states', l: 'Innere Zustände (Mut, Ruhe …)', ic: '🧘' }
    ];
    const ECO = [
        { k: 'cost', q: 'Was kostet dich das Ziel – an Zeit, Energie, Geld, Gewohnheiten?', bad: 'Der Preis ist mir zu hoch oder unklar' },
        { k: 'relations', q: 'Wie wirkt sich das Ziel auf wichtige Beziehungen aus?', bad: 'Jemand Wichtiges wird darunter leiden' },
        { k: 'values', q: 'Passt das Ziel zu deinen Werten und zu dem, wer du sein willst?', bad: 'Es widerspricht etwas, das mir wichtig ist' },
        { k: 'parts', q: 'Gibt es einen Teil in dir, der dagegen ist? Was will dieser Teil?', bad: 'Ja, da ist ein Widerstand' }
    ];
    const ANS = { yes: { l: 'Stimmig', ic: '✅' }, unsure: { l: 'Unsicher', ic: '🤔' }, no: { l: 'Problem', ic: '⚠️' } };
    const LINKS = [
        { m: 'SMART-Ziele', l: '../goal-setting/goal-setting.html', why: 'Das Ziel messbar und terminiert machen.' },
        { m: 'Rubikon-Modell', l: '../rubikon-model/rubikon-model.html', why: 'Vom Wollen zum verbindlichen Handeln.' },
        { m: 'Dilts-Pyramide', l: '../nlp-dilts/nlp-dilts.html', why: 'Das Ziel auf allen logischen Ebenen prüfen.' },
        { m: 'Werte-Klärung', l: '../values-clarification/values-clarification.html', why: 'Wenn der Ökologie-Check hakt.' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Den ersten Schritt zur Routine machen.' }
    ];
    const fmt = (iso) => { const d = new Date(iso); return isNaN(d) || !iso ? '' : d.toLocaleDateString('de-CH'); };

    /* ---------- Kriterien-Score ---------- */
    function criteria() {
        const g = S.positive || '';
        const vak = VAKOG.filter(v => (S.vakog[v.k] || '').trim()).length;
        const metaN = S.meta.filter(m => (m || '').trim()).length;
        const ecoBad = ECO.some(e => S.eco[e.k] === 'no');
        const ecoDone = ECO.every(e => S.eco[e.k]);
        return [
            { k: 'pos', l: 'Positiv', ok: g.trim().length > 8 && !NEG.test(g), step: 1 },
            { k: 'spec', l: 'Konkret', ok: g.trim().length > 8 && !VAGUE.test(g) || (S.measure || '').trim().length > 0, step: 1 },
            { k: 'own', l: 'Eigeninitiativ', ok: (S.control || '').trim().length > 10 && !OTHERS.test(g), step: 2 },
            { k: 'ctx', l: 'Kontext', ok: Object.values(S.ctx).some(a => a && a.length) || (S.notctx || '').trim(), step: 2 },
            { k: 'evi', l: 'Sinnesspezifisch', ok: vak >= 2, step: 3 },
            { k: 'meta', l: 'Meta-Ziel', ok: metaN >= 1, step: 4 },
            { k: 'res', l: 'Ressourcen', ok: S.res.some(r => r.text), step: 5 },
            { k: 'eco', l: 'Ökologisch', ok: ecoDone && !ecoBad, warn: ecoBad, step: 5 }
        ];
    }
    function renderScore() {
        const C = criteria(); const n = C.filter(c => c.ok).length; const pct = Math.round(n / C.length * 100);
        const r = 26, circ = 2 * Math.PI * r;
        $('mg-score').innerHTML = `
            <svg viewBox="0 0 64 64" class="mg-ring"><circle cx="32" cy="32" r="${r}" class="bg"/><circle cx="32" cy="32" r="${r}" class="fg" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - n / C.length)}"/><text x="32" y="36" class="t">${n}/${C.length}</text></svg>
            <div class="mg-crit">${C.map(c => `<button class="mg-crit-i ${c.ok ? 'ok' : c.warn ? 'warn' : ''}" data-go="${c.step}" title="Zu Schritt ${c.step}"><i class="fas ${c.ok ? 'fa-check' : c.warn ? 'fa-exclamation' : 'fa-minus'}"></i>${c.l}</button>`).join('')}</div>
            <div class="mg-score-l">${pct === 100 ? 'Wohlgeformt – dein Ziel erfüllt alle Kriterien.' : 'Wohlgeformtheit: ' + pct + ' %'}</div>`;
        $('mg-score').querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => MethodKit.goTo(+b.dataset.go)));
    }

    /* ---------- 1 ---------- */
    function renderPosCheck() {
        const g = S.positive || ''; const h = [];
        let m;
        if ((m = g.match(NEG))) h.push({ t: 'warn', m: `„${esc(m[0])}" – eine Verneinung. Was ist stattdessen da, wenn das Problem weg ist? Beschreibe das Bild.` });
        if ((m = g.match(OTHERS))) h.push({ t: 'warn', m: 'Das Ziel hängt vom Verhalten anderer ab. Was tust <em>du</em> in dieser Situation?' });
        if ((m = g.match(VAGUE))) h.push({ t: 'info', m: `„${esc(m[0])}" ist ein Vergleich oder Gefühl. Woran würde man es sehen – konkret?` });
        if ((m = g.match(MODAL))) h.push({ t: 'info', m: `„${esc(m[0])}" schwächt das Ziel. Formuliere es in der Gegenwart, als wäre es schon so: „Ich …"` });
        if (g.trim().length > 8 && !h.length) h.push({ t: 'ok', m: 'Positiv und klar formuliert.' });
        $('mg-poscheck').innerHTML = h.map(x => `<div class="mk-note ${x.t}"><i class="fas ${x.t === 'ok' ? 'fa-check-circle' : x.t === 'warn' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i><span>${x.m}</span></div>`).join('');
        renderScore();
    }
    function renderPairs() {
        $('mg-pairs').innerHTML = PAIRS.map(p => `<div class="mg-pair"><div class="bad"><i class="fas fa-times"></i> ${esc(p.bad)}</div><div class="good"><i class="fas fa-check"></i> ${esc(p.good)}</div></div>`).join('');
    }

    /* ---------- 2 ---------- */
    function renderCtrlCheck() {
        const c = S.control || '';
        $('mg-ctrlcheck').innerHTML = c.trim().length > 10 ? (/\b(ich)\b/i.test(c) ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Du beschreibst eigenes Handeln – das ist der Teil, den du steuern kannst.</span></div>' : '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Formuliere in der Ich-Form: „Ich …" – so wird klar, was in deiner Hand liegt.</span></div>') : '';
        renderScore();
    }
    function renderContext() {
        const row = (k, l) => `<div class="mk-section-label">${l}</div><div class="mk-chips">${CTX[k].map(c => `<button class="mk-chip ${(S.ctx[k] || []).includes(c) ? 'selected' : ''}" data-ck="${k}" data-cv="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
        $('mg-context').innerHTML = row('where', 'Wo?') + row('when', 'Wann?') + row('who', 'Mit wem?') + `
            <div class="mk-field" style="margin-top:14px"><label for="mg-notctx">Wo oder wann willst du das Ziel ausdrücklich <strong>nicht</strong>?</label><span class="hint">Beispiel: „Durchsetzungsstark im Meeting" – aber nicht beim Abendessen mit den Kindern.</span><textarea class="mk-textarea" id="mg-notctx" placeholder="…">${esc(S.notctx || '')}</textarea></div>`;
        $('mg-context').querySelectorAll('[data-ck]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.ck, v = b.dataset.cv; const a = S.ctx[k] || (S.ctx[k] = []); const i = a.indexOf(v); i > -1 ? a.splice(i, 1) : a.push(v); MethodKit.save(); renderContext(); }));
        $('mg-notctx').addEventListener('input', e => { S.notctx = e.target.value; MethodKit.save(); renderScore(); });
        MethodKit._autosizeAll(); renderScore();
    }

    /* ---------- 3 ---------- */
    function renderVakog() {
        $('mg-vakog').innerHTML = VAKOG.map(v => `<div class="mk-field mg-vak"><label><span class="ic">${v.ic}</span> ${v.l}</label><span class="hint">${v.h}</span><textarea class="mk-textarea" data-vk="${v.k}" placeholder="…">${esc(S.vakog[v.k] || '')}</textarea></div>`).join('') +
            `<div id="mg-vaknote"></div>`;
        $('mg-vakog').querySelectorAll('[data-vk]').forEach(t => t.addEventListener('input', () => { S.vakog[t.dataset.vk] = t.value; MethodKit.save(); vakNote(); }));
        vakNote(); MethodKit._autosizeAll();
    }
    function vakNote() {
        const n = VAKOG.filter(v => (S.vakog[v.k] || '').trim()).length;
        $('mg-vaknote').innerHTML = n >= 3 ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Drei oder mehr Sinneskanäle – dein Ziel ist jetzt ein erlebbares Bild, kein abstrakter Satz.</span></div>' : n ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>${n} von 4 Kanälen. Je mehr Sinne, desto stärker zieht das Ziel.</span></div>` : '';
        renderScore();
    }

    /* ---------- 4 ---------- */
    function renderMeta() {
        const g = S.positive || 'dein Ziel';
        const levels = [0, 1, 2];
        $('mg-meta').innerHTML = `
            <div class="mg-chain">
                <div class="mg-chain-goal"><span class="mk-badge">Ziel</span> ${esc(g)}</div>
                ${levels.map(i => `<div class="mg-chain-arrow"><i class="fas fa-arrow-down"></i> Wozu?</div><div class="mg-chain-lvl"><label>${i === 0 ? 'Wozu willst du das?' : i === 1 ? 'Und wozu das?' : 'Und was gibt dir das letztlich?'}</label><input class="mk-input" data-meta="${i}" value="${esc(S.meta[i] || '')}" placeholder="${i === 0 ? 'Damit ich …' : i === 1 ? 'Weil ich dann …' : 'Im Kern geht es mir um …'}" ${i > 0 && !(S.meta[i - 1] || '').trim() ? 'disabled' : ''}></div>`).join('')}
            </div>
            ${(S.meta[1] || '').trim() ? `<div class="mk-result"><h4>Dein Meta-Ziel</h4><strong>${esc(S.meta[2] || S.meta[1])}</strong><div class="mk-faint" style="margin-top:8px">Frage: Ist „${esc(g.slice(0, 60))}${g.length > 60 ? '…' : ''}" der beste Weg dorthin – oder gäbe es noch andere?</div></div>
            <div class="mk-field" style="margin-top:12px"><label for="mg-altways">Welche anderen Wege zum Meta-Ziel fallen dir ein?</label><textarea class="mk-textarea" id="mg-altways" placeholder="Optional – erweitert den Lösungsraum.">${esc(S.altways || '')}</textarea></div>` : ''}`;
        $('mg-meta').querySelectorAll('[data-meta]').forEach(el => { el.addEventListener('input', () => { S.meta[+el.dataset.meta] = el.value; MethodKit.save(); renderScore(); }); el.addEventListener('change', renderMeta); });
        const a = $('mg-altways'); if (a) a.addEventListener('input', () => { S.altways = a.value; MethodKit.save(); });
        MethodKit._autosizeAll();
    }

    /* ---------- 5 ---------- */
    function renderResources() {
        $('mg-resources').innerHTML = RES_CATS.map(c => {
            const items = S.res.filter(r => r.cat === c.k);
            return `<div class="mg-res"><div class="mg-res-head"><span>${c.ic}</span><strong>${c.l}</strong></div>
                ${items.map(r => `<div class="mk-row mg-res-row"><input class="mk-input grow" data-rt="${r.id}" value="${esc(r.text)}" placeholder="…"><button class="mg-have ${r.have ? 'on' : ''}" data-rh="${r.id}">${r.have ? '✓ habe ich' : 'brauche ich'}</button><button class="mk-iconbtn" data-rr="${r.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('')}
                <button class="mk-btn mk-btn-outline mk-btn-sm" data-ra="${c.k}"><i class="fas fa-plus"></i></button></div>`;
        }).join('') + resNote();
        $('mg-resources').querySelectorAll('[data-ra]').forEach(b => b.addEventListener('click', () => { S.res.push({ id: MethodKit.uid(), cat: b.dataset.ra, text: '', have: false }); MethodKit.save(); renderResources(); const el = $('mg-resources').querySelector(`[data-rt="${S.res[S.res.length - 1].id}"]`); if (el) el.focus(); }));
        $('mg-resources').querySelectorAll('[data-rt]').forEach(el => el.addEventListener('input', () => { const r = S.res.find(x => x.id === el.dataset.rt); if (r) { r.text = el.value; MethodKit.save(); renderScore(); } }));
        $('mg-resources').querySelectorAll('[data-rh]').forEach(b => b.addEventListener('click', () => { const r = S.res.find(x => x.id === b.dataset.rh); if (r) { r.have = !r.have; MethodKit.save(); renderResources(); } }));
        $('mg-resources').querySelectorAll('[data-rr]').forEach(b => b.addEventListener('click', () => { S.res = S.res.filter(x => x.id !== b.dataset.rr); MethodKit.save(); renderResources(); }));
    }
    function resNote() {
        const all = S.res.filter(r => r.text.trim()); if (!all.length) return '';
        const have = all.filter(r => r.have).length, need = all.length - have;
        return `<div class="mk-note ${need === 0 ? 'ok' : 'info'}" style="margin-top:8px"><i class="fas fa-info-circle"></i><span>${have} von ${all.length} Ressourcen hast du bereits.${need ? ` Die ${need} fehlende${need > 1 ? 'n' : ''} ${need > 1 ? 'sind' : 'ist'} oft der eigentliche erste Schritt.` : ''}</span></div>`;
    }
    function renderEco() {
        $('mg-eco').innerHTML = ECO.map(e => `<div class="mg-eco ${S.eco[e.k] || ''}"><div class="q">${e.q}</div>
            <div class="mg-eco-btns">${Object.entries(ANS).map(([k, a]) => `<button class="${S.eco[e.k] === k ? 'on' : ''}" data-ek="${e.k}" data-ev="${k}">${a.ic} ${a.l}</button>`).join('')}</div>
            ${S.eco[e.k] && S.eco[e.k] !== 'yes' ? `<textarea class="mk-textarea" data-en="${e.k}" placeholder="${S.eco[e.k] === 'no' ? e.bad + ' – was genau? Und wie könntest du das Ziel anpassen?' : 'Was müsstest du klären, um sicher zu sein?'}">${esc(S.econ[e.k] || '')}</textarea>` : ''}</div>`).join('') +
            (ECO.some(e => S.eco[e.k] === 'no') ? '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>Ein Ziel mit ökologischem Widerstand wird meist sabotiert. Passe es an – kleiner, anders, mit dem Widerstand statt gegen ihn – bevor du loslegst.</span></div>' : ECO.every(e => S.eco[e.k] === 'yes') ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Ökologisch stimmig – alle Teile in dir können mitgehen.</span></div>' : '');
        $('mg-eco').querySelectorAll('[data-ek]').forEach(b => b.addEventListener('click', () => { S.eco[b.dataset.ek] = b.dataset.ev; MethodKit.save(); renderEco(); renderScore(); }));
        $('mg-eco').querySelectorAll('[data-en]').forEach(t => t.addEventListener('input', () => { S.econ[t.dataset.en] = t.value; MethodKit.save(); }));
        MethodKit._autosizeAll();
    }

    /* ---------- 6 ---------- */
    function renderSummary() {
        const C = criteria(); const open = C.filter(c => !c.ok);
        const ctx = ['where', 'when', 'who'].map(k => (S.ctx[k] || []).join(', ')).filter(Boolean).join(' · ');
        $('mg-summary').innerHTML = `
            <div class="mg-final"><div class="mk-kicker">Mein Ziel</div><div class="mg-final-g">${esc(S.positive) || '–'}</div>
            ${ctx ? `<div class="mg-final-row"><b>Kontext</b>${esc(ctx)}</div>` : ''}
            ${S.date ? `<div class="mg-final-row"><b>Bis</b>${fmt(S.date)}${S.measure ? ' · ' + esc(S.measure) : ''}</div>` : ''}
            ${VAKOG.some(v => S.vakog[v.k]) ? `<div class="mg-final-row"><b>Evidenz</b>${VAKOG.filter(v => S.vakog[v.k]).map(v => v.ic + ' ' + esc(S.vakog[v.k])).join('<br>')}</div>` : ''}
            ${(S.meta[1] || S.meta[0]) ? `<div class="mg-final-row"><b>Wozu</b>${esc(S.meta[2] || S.meta[1] || S.meta[0])}</div>` : ''}</div>
            ${open.length ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Noch offen: ${open.map(c => `<button class="mk-chip" data-go="${c.step}">${c.l}</button>`).join(' ')}</span></div>` : '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Alle acht Kriterien erfüllt. Jetzt zählt nur noch der erste Schritt.</span></div>'}`;
        $('mg-summary').querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => MethodKit.goTo(+b.dataset.go)));
    }
    function renderLinks() {
        const ecoBad = ECO.some(e => S.eco[e.k] === 'no');
        const list = ecoBad ? [LINKS[3], ...LINKS.filter(l => l !== LINKS[3])] : LINKS;
        $('mg-links').innerHTML = list.map(l => `<a class="mk-option mg-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join('');
    }
    function exportAll() {
        const C = criteria();
        const L = ['WOHLGEFORMTES ZIEL (NLP)', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'ZIEL', S.positive || '–', '', 'Kriterien: ' + C.map(c => (c.ok ? '✓ ' : '○ ') + c.l).join(' · '), ''];
        L.push('EIGENINITIATIVE', 'Ich tue: ' + (S.control || '–'), 'Hängt von anderen ab: ' + (S.others || '–'), '');
        L.push('KONTEXT', ['where', 'when', 'who'].map(k => (S.ctx[k] || []).join(', ')).filter(Boolean).join(' · ') || '–', S.notctx ? 'Nicht: ' + S.notctx : '', '');
        L.push('EVIDENZ'); VAKOG.forEach(v => { if (S.vakog[v.k]) L.push(`${v.ic} ${S.vakog[v.k]}`); }); if (S.outside) L.push('Aussen-Test: ' + S.outside); if (S.date || S.measure) L.push('Bis: ' + fmt(S.date) + (S.measure ? ' · ' + S.measure : '')); L.push('');
        L.push('META-ZIEL'); S.meta.forEach((m, i) => { if (m) L.push('  '.repeat(i) + '→ ' + m); }); if (S.altways) L.push('Andere Wege: ' + S.altways); if (S.secondary) L.push('Sekundärgewinn: ' + S.secondary, S.keep ? 'Behalten durch: ' + S.keep : ''); L.push('');
        L.push('RESSOURCEN'); RES_CATS.forEach(c => { const it = S.res.filter(r => r.cat === c.k && r.text); if (it.length) L.push(c.l + ': ' + it.map(r => r.text + (r.have ? ' ✓' : ' (fehlt)')).join(', ')); }); L.push('');
        L.push('ÖKOLOGIE'); ECO.forEach(e => { if (S.eco[e.k]) L.push(`${ANS[S.eco[e.k]].ic} ${e.q}` + (S.econ[e.k] ? ' → ' + S.econ[e.k] : '')); }); L.push('');
        L.push('ERSTER SCHRITT', (S.firststep || '–') + (S.firstdate ? ' · ' + fmt(S.firstdate) : ''));
        MethodKit.exportText('wohlgeformtes-ziel.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'nlp-meta-goal', accent: '#8b5cf6', accent2: '#06b6d4',
            steps: [{ icon: '➕', label: 'Positiv' }, { icon: '🧭', label: 'Kontext' }, { icon: '👁️', label: 'Evidenz' }, { icon: '🪜', label: 'Meta-Ziel' }, { icon: '🌱', label: 'Ökologie' }, { icon: '🎯', label: 'Ziel' }],
            defaultState: { positive: '', control: '', others: '', ctx: {}, notctx: '', vakog: {}, outside: '', date: '', measure: '', meta: ['', '', ''], altways: '', secondary: '', keep: '', res: [], eco: {}, econ: {}, firststep: '', firstdate: '' }
        });
        S = MethodKit.state;
        ['ctx', 'vakog', 'eco', 'econ'].forEach(k => { if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {}; });
        if (!Array.isArray(S.meta)) S.meta = ['', '', '']; if (!Array.isArray(S.res)) S.res = [];
        // Migration alter Felder
        if (typeof S.context === 'string' && S.context.trim() && !S.notctx) { S.notctx = ''; S.ctxLegacy = S.context; delete S.context; }
        ['see', 'hear', 'feel'].forEach(k => { if (typeof S[k] === 'string') { if (S[k].trim() && !S.vakog[k]) S.vakog[k] = S[k]; delete S[k]; } });
        if (typeof S.resources === 'string') { if (S.resources.trim() && !S.res.length) S.res.push({ id: MethodKit.uid(), cat: 'skills', text: S.resources.trim().slice(0, 120), have: false }); delete S.resources; }
        if (typeof S.ecology === 'string') { if (S.ecology.trim() && !S.econ.cost) S.econ.cost = S.ecology; delete S.ecology; }

        MethodKit.bindFields();
        $('mg-positive').addEventListener('input', renderPosCheck);
        $('mg-control').addEventListener('input', renderCtrlCheck);
        ['mg-measure', 'mg-date', 'mg-outside'].forEach(id => $(id).addEventListener('input', renderScore));
        renderPairs(); renderPosCheck(); renderScore();
        MethodKit.onStep = function (k) {
            if (k === 2) { renderCtrlCheck(); renderContext(); }
            if (k === 3) renderVakog();
            if (k === 4) renderMeta();
            if (k === 5) { renderResources(); renderEco(); }
            if (k === 6) { renderSummary(); renderLinks(); }
            renderScore();
        };
        MethodKit.onStep(MethodKit.step);
        $('mg-export').addEventListener('click', exportAll);
    })();
})();
