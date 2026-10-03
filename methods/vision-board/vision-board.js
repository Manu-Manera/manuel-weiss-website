/* Vision-Board · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const AREAS = [
        { id: 'beruf', ic: '💼', label: 'Beruf & Wirkung', c: '#6366f1', q: 'Was tust du, für wen, und was bewirkt es?' },
        { id: 'finanzen', ic: '💰', label: 'Finanzen', c: '#10b981', q: 'Wie fühlt sich dein Verhältnis zu Geld an?' },
        { id: 'gesundheit', ic: '💪', label: 'Körper & Gesundheit', c: '#22c55e', q: 'Wie bewegst du dich, wie fühlst du dich im Körper?' },
        { id: 'beziehung', ic: '❤️', label: 'Partnerschaft', c: '#ef4444', q: 'Wie lebt ihr miteinander?' },
        { id: 'familie', ic: '👨‍👩‍👧', label: 'Familie & Freunde', c: '#f97316', q: 'Wer ist um dich – und wie oft?' },
        { id: 'lernen', ic: '📚', label: 'Wachstum & Lernen', c: '#8b5cf6', q: 'Was kannst du dann, was du heute nicht kannst?' },
        { id: 'kreativ', ic: '🎨', label: 'Kreativität & Spiel', c: '#ec4899', q: 'Was erschaffst du nur, weil es Freude macht?' },
        { id: 'zuhause', ic: '🏡', label: 'Zuhause & Umfeld', c: '#f59e0b', q: 'Wo lebst du, wie sieht es dort aus?' },
        { id: 'reisen', ic: '✈️', label: 'Erlebnisse & Reisen', c: '#0ea5e9', q: 'Welche Orte, welche Abenteuer?' },
        { id: 'koerper', ic: '🧘', label: 'Innere Ruhe & Sinn', c: '#14b8a6', q: 'Wofür stehst du morgens auf?' }
    ];
    const EMO = ['🌅', '🏔️', '🌊', '🌳', '🔥', '⭐', '🌈', '🏡', '🚀', '🎯', '📖', '🎸', '🎨', '✍️', '🧘', '🏃', '🚴', '🌍', '✈️', '⛵', '💼', '💡', '🤝', '👨‍👩‍👧', '❤️', '🐕', '🍷', '☕', '🌻', '💎', '🏆', '🔑'];
    const HORIZONS = [[1, '1 Jahr'], [3, '3 Jahre'], [5, '5 Jahre'], [10, '10 Jahre']];
    const LINKS = [
        { m: 'Ziele setzen', l: '../goal-setting/goal-setting.html', why: 'Aus Fokus-Bausteinen messbare Ziele machen.' },
        { m: 'Ikigai', l: '../ikigai/ikigai.html', why: 'Den Beruf-Baustein auf Sinn prüfen.' },
        { m: 'Werte klären', l: '../values-clarification/values-clarification.html', why: 'Passt das Bild zu dem, was dir wirklich wichtig ist?' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Erste Schritte zur Routine machen.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const A = (id) => AREAS.find(a => a.id === id) || AREAS[0];
    const card = (area) => S.cards.find(c => c.area === area);
    const filled = () => S.cards.filter(c => (c.title || '').trim());
    const FUTURE = /\b(werde|werden|will|wollen|möchte|wünsche|hoffe|hoffentlich|irgendwann|vielleicht)\b/i;
    const NEG = /\b(nicht mehr|kein|keine|nie wieder|weg von|los von|ohne)\b/i;

    /* ---------- 1 ---------- */
    function renderHorizon() {
        $('vb-horizon').innerHTML = HORIZONS.map(([v, t]) => `<button class="mk-chip ${n(S.horizon, 3) === v ? 'selected' : ''}" data-h="${v}">${t}</button>`).join('');
        $('vb-horizon').querySelectorAll('[data-h]').forEach(b => b.addEventListener('click', () => { S.horizon = +b.dataset.h; MethodKit.save(); renderHorizon(); }));
    }
    function renderBigNotes() {
        const h = (S.headline || '').trim(), d = (S.day || '').trim();
        $('vb-headline-note').innerHTML = !h ? '' : NEG.test(h) ? note('info', 'Das ist ein „Weg-von"-Satz. Was ist stattdessen da? Ein Vision-Board zeigt, wohin – nicht, wovon weg.') : FUTURE.test(h) ? note('info', 'Du schreibst in der Zukunft („werde", „will", „möchte"). Schreib es als Gegenwart: „Ich arbeite …", „Ich lebe …". Das Gehirn nimmt Gegenwart ernster als Absicht.') : h.length < 30 ? note('info', 'Noch knapp. Was tust du, mit wem, und wie fühlt es sich an?') : note('ok', 'Ein Satz im Präsens, der Richtung gibt.');
        $('vb-day-note').innerHTML = !d ? '' : d.length < 120 ? note('info', 'Geh durch den Tag: Aufwachen, Vormittag, Mittag, Nachmittag, Abend. Je sinnlicher (Licht, Geräusche, Menschen), desto stärker wirkt das Bild.') : FUTURE.test(d) ? note('info', 'Auch hier: Präsens. „Ich wache auf …", nicht „ich werde aufwachen".') : note('ok', 'Konkret genug, dass man es sich vorstellen kann. Genau das soll ein Vision-Board.');
    }

    /* ---------- 2 ---------- */
    function renderAreas() {
        $('vb-areas').innerHTML = AREAS.map(a => { const c = card(a.id) || {}; const open = S.openArea === a.id; return `<div class="vb-area ${(c.title || '').trim() ? 'filled' : ''} ${open ? 'open' : ''}" style="--c:${a.c}"><button class="vb-area-h" data-open="${a.id}"><span class="vb-area-ic">${c.emoji || a.ic}</span><div><b>${a.label}</b><small>${(c.title || '').trim() ? esc(c.title) : a.q}</small></div><span class="vb-imp">${c.imp ? '★'.repeat(c.imp) : ''}</span><i class="fas fa-chevron-${open ? 'up' : 'down'}"></i></button>${open ? `<div class="vb-area-b"><div class="mk-field"><label>Bild</label><div class="vb-emo">${EMO.map(e => `<button class="${c.emoji === e ? 'on' : ''}" data-emo="${a.id}" data-v="${e}">${e}</button>`).join('')}</div></div><div class="mk-field"><label>Ein Satz im Präsens</label><input class="mk-input" data-title="${a.id}" value="${esc(c.title || '')}" placeholder="z. B. Ich laufe dreimal die Woche am Fluss und fühle mich stark."></div><div class="mk-field"><label>Warum ist dir das wichtig?</label><input class="mk-input" data-desc="${a.id}" value="${esc(c.desc || '')}" placeholder="Der Grund hinter dem Bild"></div><div class="mk-field"><label>Wichtigkeit</label><div class="vb-stars">${[1, 2, 3, 4, 5].map(x => `<button class="${n(c.imp, 0) >= x ? 'on' : ''}" data-imp="${a.id}" data-v="${x}" aria-label="Wichtigkeit ${x}">★</button>`).join('')}</div></div>${(c.title || '').trim() && FUTURE.test(c.title) ? note('info', 'Präsens: „Ich bin / Ich habe / Ich lebe".') : ''}</div>` : ''}</div>`; }).join('') + areaNote();
        const host = $('vb-areas');
        const ensure = (area) => { let c = card(area); if (!c) { c = { id: MethodKit.uid(), area, title: '', desc: '', emoji: '', imp: 0 }; S.cards.push(c); } return c; };
        host.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { S.openArea = S.openArea === b.dataset.open ? '' : b.dataset.open; MethodKit.save(); renderAreas(); if (S.openArea) { const i = host.querySelector(`[data-title="${S.openArea}"]`); i && i.focus(); } }));
        host.querySelectorAll('[data-emo]').forEach(b => b.addEventListener('click', () => { ensure(b.dataset.emo).emoji = b.dataset.v; MethodKit.save(); renderAreas(); }));
        host.querySelectorAll('[data-imp]').forEach(b => b.addEventListener('click', () => { ensure(b.dataset.imp).imp = +b.dataset.v; MethodKit.save(); renderAreas(); }));
        host.querySelectorAll('[data-title]').forEach(i => { i.addEventListener('input', () => { ensure(i.dataset.title).title = i.value; MethodKit.save(); }); i.addEventListener('change', renderAreas); });
        host.querySelectorAll('[data-desc]').forEach(i => i.addEventListener('input', () => { ensure(i.dataset.desc).desc = i.value; MethodKit.save(); }));
    }
    function areaNote() {
        const f = filled();
        if (f.length < 3) return note('info', `${f.length}/10 Bereiche gefüllt. Drei bis sieben reichen – ein Board mit zehn gleich wichtigen Feldern hat keinen Fokus.`);
        const imps = f.filter(c => c.imp);
        if (imps.length && imps.every(c => c.imp >= 4)) return note('info', 'Alles ist „sehr wichtig". Dann ist nichts wichtig. Welche zwei würdest du opfern, wenn du müsstest?');
        const notBody = !card('gesundheit') || !(card('gesundheit').title || '').trim();
        if (f.length >= 5 && notBody) return note('info', 'Körper & Gesundheit ist leer. Jede andere Vision steht darauf – ein Satz reicht.');
        return note('ok', `${f.length} Bausteine. Im Board siehst du sie zusammen.`);
    }

    /* ---------- 3 ---------- */
    function renderBoard() {
        const f = filled();
        if (!f.length) { $('vb-board').innerHTML = note('info', 'Fülle in Schritt 2 mindestens einen Bereich.'); return; }
        const sorted = [...f].sort((a, b) => n(b.imp, 0) - n(a.imp, 0));
        const focus = S.focus.filter(id => f.some(c => c.id === id));
        $('vb-board').innerHTML = (S.headline ? `<div class="vb-head">${esc(S.headline)}${S.feeling ? `<small>${esc(S.feeling)}</small>` : ''}</div>` : '') +
            `<div class="vb-grid">${sorted.map(c => { const a = A(c.area); const big = n(c.imp, 0) >= 4; return `<button class="vb-tile ${big ? 'big' : ''} ${focus.includes(c.id) ? 'focus' : ''}" style="--c:${a.c}" data-f="${c.id}"><span class="ic">${c.emoji || a.ic}</span><span class="a">${a.label}</span><span class="t">${esc(c.title)}</span>${c.desc ? `<span class="d">${esc(c.desc)}</span>` : ''}${focus.includes(c.id) ? '<span class="vb-focus-badge">Fokus</span>' : ''}</button>`; }).join('')}</div>` +
            (focus.length === 0 ? note('info', 'Wähle bis zu drei Fokus-Bausteine. Frage: Welcher würde, wenn er wahr wird, die anderen leichter machen?') : focus.length === 1 ? note('info', '1 Fokus. Ein zweiter oder dritter darf dazu – mehr nicht.') : note('ok', `${focus.length} Fokus-Bausteine: ${focus.map(id => esc(f.find(c => c.id === id).title)).join(' · ')}`));
        $('vb-board').querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.f; if (S.focus.includes(id)) S.focus = S.focus.filter(x => x !== id); else if (S.focus.length >= 3) { MethodKit.toast('Maximal drei – erst einen abwählen', 'warn'); return; } else S.focus.push(id); MethodKit.save(); renderBoard(); }));
    }

    /* ---------- 4 ---------- */
    function renderAction() {
        const F = S.focus.map(id => S.cards.find(c => c.id === id)).filter(c => c && (c.title || '').trim());
        if (!F.length) { $('vb-action').innerHTML = note('info', 'Wähle in Schritt 3 deine Fokus-Bausteine.'); return; }
        $('vb-action').innerHTML = F.map(c => { const a = A(c.area), p = S.plan[c.id] || {}; return `<div class="vb-act" style="--c:${a.c}"><div class="vb-act-h"><span>${c.emoji || a.ic}</span><div><b>${esc(c.title)}</b><small>${a.label}</small></div></div><div class="mk-field"><label>Woran merke ich, dass es wahr wird? (Beweis, messbar oder sichtbar)</label><input class="mk-input" data-ev="${c.id}" value="${esc(p.evidence || '')}" placeholder="z. B. Ich habe drei zahlende Kunden / Ich laufe 10 km ohne Pause"></div><div class="mk-grid-2"><div class="mk-field"><label>Erster Schritt in den nächsten 7 Tagen</label><input class="mk-input" data-first="${c.id}" value="${esc(p.first || '')}" placeholder="Klein genug für diese Woche"></div><div class="mk-field"><label>Was muss ich dafür loslassen?</label><input class="mk-input" data-drop="${c.id}" value="${esc(p.drop || '')}" placeholder="Zeit, Gewohnheit, Erwartung …"></div></div>${actNote(p)}</div>`; }).join('');
        const host = $('vb-action');
        [['ev', 'evidence'], ['first', 'first'], ['drop', 'drop']].forEach(([d, k]) => host.querySelectorAll(`[data-${d}]`).forEach(i => { i.addEventListener('input', () => { (S.plan[i.dataset[d]] = S.plan[i.dataset[d]] || {})[k] = i.value; MethodKit.save(); }); i.addEventListener('change', renderAction); }));
    }
    function actNote(p) {
        const ev = (p.evidence || '').trim(), f = (p.first || '').trim(), d = (p.drop || '').trim();
        if (!ev && !f) return '';
        if (ev && !/\d|jede|täglich|wöchentlich|pro |mal\b|fertig|unterschrieben|gebucht|bestanden/i.test(ev)) return note('info', 'Der Beweis ist noch weich. Eine Zahl, ein Datum, ein Dokument, eine sichtbare Veränderung – woran würde ein Aussenstehender es erkennen?');
        if (f && /anfangen|überlegen|schauen|informieren|recherchieren|mich kümmern|planen/i.test(f) && f.length < 50) return note('info', '„Anfangen / schauen / informieren" ist noch kein Schritt. Was genau tust du, wann, wo? Z. B. „Dienstag 18 Uhr: Kurs X buchen".');
        if (ev && f && !d) return note('info', 'Jedes Ja ist ein Nein zu etwas anderem. Was gibst du her – Zeit, eine Gewohnheit, einen Anspruch?');
        if (ev && f && d) return note('ok', 'Beweis, Schritt, Preis – das ist eine Vision mit Bodenhaftung.');
        return '';
    }

    /* ---------- 5 ---------- */
    function renderRitual() {
        const R = S.ritual || {};
        const aff = (S.headline || '').trim();
        $('vb-ritual').innerHTML = `<div class="mk-section-label">Ritual</div><p class="mk-sub">Ein Board wirkt nur, wenn du es siehst. Wann schaust du drauf?</p><div class="mk-chips">${[['morning', '🌅 Morgens, vor dem Handy'], ['evening', '🌙 Abends, vor dem Schlafen'], ['weekly', '📅 Sonntags, Wochenplanung'], ['desk', '🖥️ Am Arbeitsplatz sichtbar']].map(([k, t]) => `<button class="mk-chip ${R[k] ? 'selected' : ''}" data-rit="${k}">${t}</button>`).join('')}</div>` +
            (aff ? `<div class="vb-aff">„${esc(aff)}"<small>Lies diesen Satz laut – im Ritual, jeden Tag.</small></div>` : '') +
            `<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:10px"><button class="mk-btn mk-btn-outline mk-btn-sm" id="vb-checkin"><i class="fas fa-eye"></i> Heute angeschaut</button><span class="mk-faint">${S.checkins.length ? `${S.checkins.length}× angeschaut · zuletzt ${new Date(S.checkins[S.checkins.length - 1]).toLocaleDateString('de-CH')}` : 'noch kein Check-in'}</span></div>` +
            (S.checkins.length >= 7 ? note('ok', `${S.checkins.length} Check-ins. Prüf alle drei Monate: Stimmt das Bild noch, oder hat es sich weiterentwickelt?`) : '');
        $('vb-ritual').querySelectorAll('[data-rit]').forEach(b => b.addEventListener('click', () => { S.ritual = S.ritual || {}; S.ritual[b.dataset.rit] = !S.ritual[b.dataset.rit]; MethodKit.save(); renderRitual(); }));
        $('vb-checkin').addEventListener('click', () => { const t = new Date().toDateString(); if (S.checkins.some(x => new Date(x).toDateString() === t)) { MethodKit.toast('Heute schon eingetragen', 'warn'); return; } S.checkins.push(Date.now()); MethodKit.save({ now: true }); MethodKit.toast('Gesehen ✓', 'ok'); renderRitual(); });
    }
    function renderSummary() {
        const f = filled(), F = S.focus.map(id => f.find(c => c.id === id)).filter(Boolean);
        if (!f.length && !S.headline) { $('vb-summary').innerHTML = ''; return; }
        $('vb-summary').innerHTML = `<div class="mk-result" style="margin-top:14px"><h4>Dein Board in ${n(S.horizon, 3)} Jahr${n(S.horizon, 3) > 1 ? 'en' : ''}</h4>${S.headline ? `<p><b>${esc(S.headline)}</b>${S.feeling ? ` · <i>${esc(S.feeling)}</i>` : ''}</p>` : ''}<div class="vb-sum">${f.map(c => `<span style="--c:${A(c.area).c}">${c.emoji || A(c.area).ic} ${esc(c.title)}</span>`).join('')}</div>${F.length ? `<div class="mk-section-label">Fokus</div><ul class="vb-ul">${F.map(c => { const p = S.plan[c.id] || {}; return `<li><b>${esc(c.title)}</b>${p.evidence ? ` – Beweis: ${esc(p.evidence)}` : ''}${p.first ? `<br><small>→ ${esc(p.first)}</small>` : ''}</li>`; }).join('')}</ul>` : ''}</div>`;
    }
    function renderLinks() { $('vb-links').innerHTML = LINKS.map(x => `<a class="mk-option vb-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['VISION-BOARD', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), `Horizont: ${n(S.horizon, 3)} Jahre`, ''];
        if (S.headline) L.push('LEITSATZ', S.headline, ''); if (S.feeling) L.push('Grundgefühl: ' + S.feeling, ''); if (S.day) L.push('EIN TAG', S.day, '');
        L.push('BAUSTEINE'); filled().sort((a, b) => n(b.imp, 0) - n(a.imp, 0)).forEach(c => L.push(`  ${c.emoji || A(c.area).ic} ${A(c.area).label}${c.imp ? ` (${'★'.repeat(c.imp)})` : ''}: ${c.title}${c.desc ? ` – ${c.desc}` : ''}${S.focus.includes(c.id) ? ' [FOKUS]' : ''}`));
        const F = S.focus.map(id => S.cards.find(c => c.id === id)).filter(Boolean);
        if (F.length) { L.push('', 'FOKUS → HANDLUNG'); F.forEach(c => { const p = S.plan[c.id] || {}; L.push(`  ■ ${c.title}`); if (p.evidence) L.push(`    Beweis: ${p.evidence}`); if (p.first) L.push(`    Erster Schritt: ${p.first}`); if (p.drop) L.push(`    Loslassen: ${p.drop}`); }); }
        MethodKit.exportText('vision-board.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'vision-board', accent: '#0ea5e9', accent2: '#6366f1',
            steps: [{ icon: '🌅', label: 'Big Picture' }, { icon: '🧩', label: 'Bereiche' }, { icon: '🖼️', label: 'Board' }, { icon: '🎯', label: 'Handlung' }, { icon: '🔁', label: 'Ritual' }]
            , defaultState: { horizon: 3, headline: '', day: '', feeling: '', cards: [], focus: [], plan: {}, ritual: {}, checkins: [], openArea: '' }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.cards)) S.cards = [];
        // Migration: alte Karten (mehrere pro Bereich) → eine pro Bereich, Rest zusammenführen
        const seen = {}; S.cards = S.cards.filter(c => { if (!c || !c.area) return false; if (!AREAS.some(a => a.id === c.area)) c.area = 'lernen'; if (seen[c.area]) { if ((c.title || '').trim()) seen[c.area].title = [seen[c.area].title, c.title].filter(Boolean).join(' · '); return false; } seen[c.area] = c; c.id = c.id || MethodKit.uid(); c.emoji = c.emoji || ''; c.imp = n(c.imp, 0); return true; });
        ['focus', 'checkins'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        ['plan', 'ritual'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        delete S.pickArea;
        MethodKit.bindFields();
        ['vb-headline', 'vb-day'].forEach(id => $(id).addEventListener('input', renderBigNotes));
        $('vb-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) { renderHorizon(); renderBigNotes(); }
            if (k === 2) renderAreas();
            if (k === 3) renderBoard();
            if (k === 4) renderAction();
            if (k === 5) { renderRitual(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
