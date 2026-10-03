/* Werte-Kompass · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const GROUPS = [
        { id: 'free', t: 'Freiheit & Selbstbestimmung', ic: '🪁', c: '#0ea5e9', v: ['Freiheit', 'Unabhängigkeit', 'Autonomie', 'Abenteuer', 'Flexibilität', 'Kreativität', 'Authentizität'] },
        { id: 'bond', t: 'Verbindung', ic: '🤝', c: '#ec4899', v: ['Familie', 'Freundschaft', 'Liebe', 'Zugehörigkeit', 'Loyalität', 'Vertrauen', 'Fürsorge'] },
        { id: 'grow', t: 'Leistung & Wachstum', ic: '🚀', c: '#f59e0b', v: ['Leistung', 'Erfolg', 'Wachstum', 'Lernen', 'Exzellenz', 'Einfluss', 'Anerkennung'] },
        { id: 'safe', t: 'Sicherheit & Stabilität', ic: '🏠', c: '#64748b', v: ['Sicherheit', 'Stabilität', 'Gesundheit', 'Ordnung', 'Verlässlichkeit', 'Wohlstand', 'Tradition'] },
        { id: 'mean', t: 'Sinn & Beitrag', ic: '🌱', c: '#10b981', v: ['Sinn', 'Beitrag', 'Gerechtigkeit', 'Nachhaltigkeit', 'Spiritualität', 'Ehrlichkeit', 'Integrität'] },
        { id: 'joy', t: 'Genuss & Lebendigkeit', ic: '🎉', c: '#a855f7', v: ['Genuss', 'Humor', 'Schönheit', 'Ruhe', 'Natur', 'Spontaneität', 'Lebensfreude'] }
    ];
    const TENSION = [['Freiheit', 'Sicherheit', 'Jede Bindung kostet Freiheit, jede Freiheit kostet Sicherheit. Entscheide bewusst, wo du welche Seite gewichtest – sonst fühlst du dich überall halb.'], ['Unabhängigkeit', 'Zugehörigkeit', 'Du willst dazugehören und dich nicht anpassen müssen. Das geht – aber nur mit Menschen, die deine Eigenart aushalten.'], ['Abenteuer', 'Stabilität', 'Die Lösung ist meistens Rhythmus: feste Basis, regelmässige Ausbrüche. Nicht beides gleichzeitig wollen.'], ['Leistung', 'Ruhe', 'Leistung frisst Ruhe, wenn du sie nicht aktiv schützt. Ruhe muss im Kalender stehen, nicht übrig bleiben.'], ['Erfolg', 'Familie', 'Der Klassiker. Frag deine Familie, was sie unter „Zeit mit dir" versteht – meist ist es weniger, aber präsenter, als du denkst.'], ['Spontaneität', 'Ordnung', 'Ordnung im Grossen schafft Raum für Spontaneität im Kleinen. Umgekehrt entsteht Chaos.'], ['Einfluss', 'Authentizität', 'Einfluss verlangt Anpassung an das System. Zieh eine Linie: Was tust du für Wirkung – und was nie?'], ['Anerkennung', 'Authentizität', 'Wenn du Anerkennung willst, wirst du dich verbiegen wollen. Such Anerkennung von Menschen, die dich echt sehen.'], ['Wohlstand', 'Sinn', 'Nicht zwingend ein Widerspruch – aber frag ehrlich, welcher von beiden deine letzten drei grossen Entscheidungen bestimmt hat.'], ['Flexibilität', 'Verlässlichkeit', 'Sei verlässlich im Was und flexibel im Wie. Dann beisst sich das nicht.'], ['Autonomie', 'Loyalität', 'Loyal sein und trotzdem Nein sagen können – das ist die Reife-Version dieses Paars.'], ['Exzellenz', 'Genuss', 'Exzellenz ohne Genuss wird Perfektionismus. Genuss ohne Exzellenz wird flach. Wechsle bewusst zwischen Werkbank und Terrasse.']];
    const AREAS = ['Arbeit', 'Partnerschaft', 'Familie', 'Freunde', 'Körper', 'Freizeit', 'Geld', 'Ich-Zeit'];
    const PEAKS = [['proud', 'Ein Moment, in dem ich richtig stolz auf mich war', 'Welcher Wert wurde da gelebt?'], ['angry', 'Etwas, das mich zuletzt richtig wütend gemacht hat', 'Wut zeigt, welcher Wert verletzt wurde.'], ['envy', 'Jemand, den ich insgeheim beneide – und wofür', 'Neid zeigt, was du dir selbst nicht erlaubst.']];
    const LINKS = [
        { m: 'Ziele setzen', l: '../goal-setting/goal-setting.html', why: 'Aus der Wochenentscheidung ein echtes Ziel machen.' },
        { m: 'Lebensrad', l: '../wheel-of-life/wheel-of-life.html', why: 'Die Lebensbereiche, in denen deine Werte Platz brauchen.' },
        { m: 'Ikigai', l: '../ikigai/ikigai.html', why: 'Werte und Beitrag zusammenbringen.' },
        { m: 'Journaling', l: '../journaling/journaling.html', why: 'Wöchentlich prüfen: Hat der Wert Platz bekommen?' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const groupOf = (v) => GROUPS.find(g => g.v.includes(v));
    const colorOf = (v) => (groupOf(v) || { c: '#14b8a6' }).c;
    const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
    function pairs() { const s = S.sel; const P = []; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) P.push([s[i], s[j]]); return P; }
    const pk = (a, b) => [a, b].sort().join('|');
    function ranking() {
        if (S.order && S.order.length && S.order.every(v => S.sel.includes(v)) && S.order.length === S.sel.length) return S.order;
        const wins = {}; S.sel.forEach(v => wins[v] = 0); Object.entries(S.pairs).forEach(([k, w]) => { if (k.split('|').every(v => S.sel.includes(v)) && wins[w] !== undefined) wins[w]++; });
        return [...S.sel].sort((a, b) => wins[b] - wins[a] || S.sel.indexOf(a) - S.sel.indexOf(b));
    }
    const top = () => ranking().slice(0, 5);
    const imp = (i) => 10 - i;
    function cycles() { const P = pairs(); const beats = (a, b) => S.pairs[pk(a, b)] === a; let c = 0; const s = S.sel; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) for (let k = j + 1; k < s.length; k++) { const [a, b, d] = [s[i], s[j], s[k]]; if (!S.pairs[pk(a, b)] || !S.pairs[pk(b, d)] || !S.pairs[pk(a, d)]) continue; if ((beats(a, b) && beats(b, d) && beats(d, a)) || (beats(b, a) && beats(d, b) && beats(a, d))) c++; } return P.length ? c : 0; }

    /* ---------- 1 ---------- */
    function renderPick() {
        const sel = S.sel;
        $('vc-pick').innerHTML = `<div class="vc-peaks">${PEAKS.map(([k, q, h]) => `<div class="mk-field"><label>${q}</label><input class="mk-input" data-peak="${k}" value="${esc(S.peaks[k] || '')}" placeholder="${h}"></div>`).join('')}</div>` +
            GROUPS.map(g => `<div class="vc-group" style="--c:${g.c}"><div class="vc-group-h"><span>${g.ic}</span><b>${g.t}</b><small>${g.v.filter(v => sel.includes(v)).length}/${g.v.length}</small></div><div class="mk-chips">${g.v.map(v => `<button class="mk-chip ${sel.includes(v) ? 'selected' : ''}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`).join('') +
            `<div class="vc-group" style="--c:#14b8a6"><div class="vc-group-h"><span>✏️</span><b>Eigene Werte</b></div><div class="mk-chips">${S.custom.map(v => `<button class="mk-chip ${sel.includes(v) ? 'selected' : ''}" data-v="${esc(v)}">${esc(v)} <i class="fas fa-xmark" data-rm="${esc(v)}" aria-label="Entfernen"></i></button>`).join('')}<input class="mk-input vc-custom" id="vc-custom" placeholder="Wert eingeben + Enter"></div></div>` + pickNote();
        const host = $('vc-pick');
        host.querySelectorAll('[data-peak]').forEach(i => i.addEventListener('input', () => { S.peaks[i.dataset.peak] = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', (e) => { if (e.target.dataset.rm) { S.custom = S.custom.filter(x => x !== e.target.dataset.rm); S.sel = S.sel.filter(x => x !== e.target.dataset.rm); MethodKit.save(); renderPick(); return; } const v = b.dataset.v; S.sel = sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v]; S.order = []; MethodKit.save(); renderPick(); }));
        $('vc-custom').addEventListener('keydown', e => { if (e.key !== 'Enter') return; e.preventDefault(); const v = e.target.value.trim(); if (!v) return; const name = v[0].toUpperCase() + v.slice(1); if (!S.custom.includes(name) && !GROUPS.some(g => g.v.includes(name))) S.custom.push(name); if (!S.sel.includes(name)) S.sel.push(name); S.order = []; MethodKit.save(); renderPick(); $('vc-custom').focus(); });
    }
    function pickNote() {
        const k = S.sel.length; if (!k) return note('info', 'Tipp: Starte mit den drei Fragen oben – stolz, wütend, neidisch. Darin stecken deine Werte schon.');
        const gc = {}; S.sel.forEach(v => { const g = groupOf(v); if (g) gc[g.id] = (gc[g.id] || 0) + 1; }); const dom = Object.entries(gc).sort((a, b) => b[1] - a[1])[0];
        let out = '';
        if (k > 15) out += note('warn', `${k} Werte – das ist eine Wunschliste, kein Kompass. Streich alles, was du „auch noch schön" findest. Ziel: höchstens 10 für den Paarvergleich.`);
        else if (k > 10) out += note('info', `${k} Werte. Für den Paarvergleich wären höchstens 10 gut (${k * (k - 1) / 2} Vergleiche sonst). Frag bei jedem: Würde mir etwas fehlen, wenn er weg wäre?`);
        else if (k < 5) out += note('info', `${k} Werte. Nimm mindestens 5 bis 6 – sonst gibt es nichts zu verdichten.`);
        else out += note('ok', `${k} Werte – gute Grösse. ${k * (k - 1) / 2} Vergleiche im nächsten Schritt.`);
        if (dom && dom[1] >= 4 && k >= 6 && dom[1] / k >= 0.5) out += note('info', `Die Hälfte kommt aus „${GROUPS.find(g => g.id === dom[0]).t}". Vermutlich meinst du dort Nuancen desselben – prüf, ob zwei davon reichen.`);
        const ten = TENSION.filter(([a, b]) => S.sel.includes(a) && S.sel.includes(b)); if (ten.length) out += note('info', `Spannungspaar gewählt: ${ten.map(([a, b]) => `<strong>${a} ↔ ${b}</strong>`).join(', ')}. Normal – aber genau da wird der Paarvergleich spannend.`);
        return out;
    }

    /* ---------- 2 ---------- */
    function renderRank() {
        const sel = S.sel; if (sel.length < 3) { $('vc-rank').innerHTML = note('info', 'Wähle in Schritt 1 mindestens drei Werte.'); return; }
        const P = pairs(); const done = P.filter(([a, b]) => S.pairs[pk(a, b)]); const open = P.filter(([a, b]) => !S.pairs[pk(a, b)]);
        const manual = S.order && S.order.length === sel.length;
        let h = '';
        if (sel.length > 10 && !manual) h += note('warn', `${sel.length} Werte → ${P.length} Vergleiche. Entferne hier welche oder sortiere direkt von Hand.`) + `<div class="mk-chips" style="margin-bottom:12px">${sel.map(v => `<button class="mk-chip selected" data-rm="${esc(v)}">${esc(v)} <i class="fas fa-xmark"></i></button>`).join('')}</div>`;
        if (!manual && open.length && sel.length <= 10) {
            const [a, b] = open[0];
            h += `<div class="vc-progress"><i style="width:${done.length / P.length * 100}%"></i><span>${done.length} / ${P.length}</span></div><p class="vc-q">Wenn du nur <em>einen</em> davon wirklich leben könntest:</p><div class="vc-duel"><button class="vc-duel-b" data-win="${esc(a)}" data-lose="${esc(b)}" style="--c:${colorOf(a)}">${esc(a)}<small>${(groupOf(a) || {}).t || 'eigener Wert'}</small></button><span>oder</span><button class="vc-duel-b" data-win="${esc(b)}" data-lose="${esc(a)}" style="--c:${colorOf(b)}">${esc(b)}<small>${(groupOf(b) || {}).t || 'eigener Wert'}</small></button></div>` +
                (done.length ? `<div class="mk-faint" style="text-align:center;font-size:13px">Schnell entscheiden – der erste Impuls ist meist der ehrliche.</div>` : '');
        }
        const R = ranking();
        if (manual || !open.length || sel.length > 10) {
            const cyc = !manual && !open.length ? cycles() : 0;
            h += `<div class="mk-section-label">${manual ? 'Deine Rangfolge' : !open.length ? 'Rangfolge aus dem Paarvergleich' : 'Vorläufige Rangfolge'}</div><div class="vc-rank">${R.map((v, i) => `<div class="vc-rank-i ${i < 5 ? 'top' : ''}" style="--c:${colorOf(v)}"><b>${i + 1}</b><span>${esc(v)}</span>${i < 5 ? '<em>Top 5</em>' : ''}<div class="vc-ud"><button class="mk-iconbtn" data-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Nach oben"><i class="fas fa-chevron-up"></i></button><button class="mk-iconbtn" data-dn="${i}" ${i === R.length - 1 ? 'disabled' : ''} aria-label="Nach unten"><i class="fas fa-chevron-down"></i></button></div></div>`).join('')}</div>` +
                (cyc >= 3 ? note('info', `${cyc} Zirkel in deinen Entscheidungen (A vor B, B vor C, aber C vor A). Da bist du dir nicht sicher – nutze die Pfeile, um die Rangfolge von Hand zu korrigieren.`) : '') +
                (!open.length && !manual ? note('ok', `Fertig verglichen. Platz 1: <strong>${esc(R[0])}</strong>. Stimmt das Bauchgefühl? Sonst korrigier mit den Pfeilen.`) : '') +
                (R.length > 5 ? `<div class="mk-faint" style="font-size:13px;margin-top:8px">Weiter geht es mit den Top 5. ${R.slice(5).map(esc).join(', ')} bleiben wichtig – aber nicht leitend.</div>` : '');
            if (!open.length || manual) h += `<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="mk-btn mk-btn-outline mk-btn-sm" id="vc-redo"><i class="fas fa-rotate-left"></i> Paarvergleich neu starten</button></div>`;
        } else if (open.length && sel.length <= 10) {
            h += `<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="mk-btn mk-btn-outline mk-btn-sm" id="vc-manual"><i class="fas fa-list-ol"></i> Lieber direkt von Hand sortieren</button></div>`;
        }
        $('vc-rank').innerHTML = h;
        const host = $('vc-rank');
        host.querySelectorAll('[data-win]').forEach(b => b.addEventListener('click', () => { S.pairs[pk(b.dataset.win, b.dataset.lose)] = b.dataset.win; MethodKit.save(); renderRank(); }));
        host.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { S.sel = S.sel.filter(x => x !== b.dataset.rm); S.order = []; MethodKit.save(); renderRank(); }));
        host.querySelectorAll('[data-up],[data-dn]').forEach(b => b.addEventListener('click', () => { const o = [...ranking()]; const i = n(b.dataset.up !== undefined ? b.dataset.up : b.dataset.dn, 0); const j = b.dataset.up !== undefined ? i - 1 : i + 1; if (j < 0 || j >= o.length) return;[o[i], o[j]] = [o[j], o[i]]; S.order = o; MethodKit.save(); renderRank(); }));
        const m = $('vc-manual'); if (m) m.addEventListener('click', () => { S.order = [...ranking()]; MethodKit.save(); renderRank(); });
        const rd = $('vc-redo'); if (rd) rd.addEventListener('click', () => { S.pairs = {}; S.order = []; MethodKit.save(); renderRank(); });
    }

    /* ---------- 3 ---------- */
    function renderDefine() {
        const T = top(); if (T.length < 3) { $('vc-define').innerHTML = note('info', 'Erst Werte wählen und verdichten.'); return; }
        $('vc-define').innerHTML = T.map((v, i) => { const d = S.def[v] || {}; return `<div class="vc-def" style="--c:${colorOf(v)}"><div class="vc-def-h"><b>${i + 1}</b><span>${esc(v)}</span>${defState(d)}</div><div class="mk-field"><label>Was heisst ${esc(v)} für dich – in einem Satz?</label><input class="mk-input" data-d="${esc(v)}|mean" value="${esc(d.mean || '')}" placeholder="${esc(v)} bedeutet für mich, dass …"></div><div class="mk-field"><label>Woran merkt man, dass du ${esc(v)} lebst? Ein beobachtbares Verhalten.</label><input class="mk-input" data-d="${esc(v)}|behave" value="${esc(d.behave || '')}" placeholder="z. B. Ich sage Termine ab, wenn …"></div><div class="mk-field"><label>Wann hast du ${esc(v)} zuletzt verraten – und wofür?</label><input class="mk-input" data-d="${esc(v)}|betray" value="${esc(d.betray || '')}" placeholder="Ehrlich. Das zeigt, welcher Wert in der Praxis stärker war."></div></div>`; }).join('') + defineNote(T);
        $('vc-define').querySelectorAll('[data-d]').forEach(el => { el.addEventListener('input', () => { const [v, k] = el.dataset.d.split('|'); S.def[v] = S.def[v] || {}; S.def[v][k] = el.value; MethodKit.save(); }); el.addEventListener('change', renderDefine); });
    }
    const defState = (d) => { const k = ['mean', 'behave', 'betray'].filter(x => (d[x] || '').trim().length >= 10).length; return `<em class="${k === 3 ? 'ok' : ''}">${k}/3</em>`; };
    function defineNote(T) {
        let out = '';
        const gc = {}; T.forEach(v => { const g = groupOf(v); if (g) gc[g.id] = (gc[g.id] || 0) + 1; }); const dom = Object.entries(gc).find(([, c]) => c >= 3);
        if (dom) out += note('info', `Drei deiner Top 5 kommen aus „${GROUPS.find(g => g.id === dom[0]).t}". Das ist dein Kern-Motiv – aber prüf, ob die drei im Verhalten wirklich verschieden sind. Wenn nicht, rückt ein anderer Wert nach.`);
        TENSION.filter(([a, b]) => T.includes(a) && T.includes(b)).forEach(([a, b, txt]) => out += note('warn', `<strong>${a} ↔ ${b}</strong> – beide in deinen Top 5. ${txt}`));
        T.forEach(v => { const d = S.def[v] || {}; const b = (d.behave || '').trim(); if (b && (b.length < 20 || /\b(wichtig|bewusst|mehr|achte|versuche|offen)\b/i.test(b)) && !/\b(sage|mache|gehe|nehme|rufe|schreibe|lehne|frage|plane|blocke|kündige|stehe|höre|lasse|setze|verzichte)\b/i.test(b)) out += note('info', `„${esc(b)}" bei <strong>${esc(v)}</strong> ist eine Haltung, kein Verhalten. Was tust du – sichtbar von aussen?`); });
        const betrayed = T.filter(v => (S.def[v] || {}).betray && (S.def[v].betray || '').trim().length >= 10);
        betrayed.forEach(v => { const other = T.find(o => o !== v && new RegExp(o, 'i').test(S.def[v].betray)); if (other) out += note('info', `Du hast <strong>${esc(v)}</strong> für <strong>${esc(other)}</strong> verraten – im Zweifel ist ${esc(other)} also praktisch stärker. Steht die Rangfolge so?`); });
        const full = T.filter(v => ['mean', 'behave', 'betray'].every(k => ((S.def[v] || {})[k] || '').trim().length >= 10)).length;
        if (full === T.length) out += note('ok', 'Alle Werte sind definiert – mit Verhalten und Verrat. Das ist mehr Klarheit, als die meisten je erreichen.');
        return out;
    }

    /* ---------- 4 ---------- */
    function renderLive() {
        const T = top(); if (T.length < 3) { $('vc-live').innerHTML = note('info', 'Erst Werte wählen und verdichten.'); return; }
        $('vc-live').innerHTML = T.map((v, i) => { const l = S.lived[v] || {}; const sc = n(l.score, 5); return `<div class="vc-live" style="--c:${colorOf(v)}"><div class="vc-def-h"><b>${i + 1}</b><span>${esc(v)}</span><em>Wichtigkeit ${imp(i)}/10</em></div><div class="mk-range-wrap"><label>Wie stark lebst du ${esc(v)} derzeit?</label><input type="range" class="mk-range" min="1" max="10" value="${sc}" data-l="${esc(v)}|score"><span class="mk-range-val ${sc <= 3 ? 'low' : sc >= 8 ? 'high' : ''}">${sc}</span></div><div class="vc-live-row"><div class="mk-chips">${AREAS.map(a => `<button class="mk-chip mk-chip-sm ${(l.areas || []).includes(a) ? 'selected' : ''}" data-la="${esc(v)}|${a}">${a}</button>`).join('')}</div><label class="vc-hours"><input type="number" class="mk-input" min="0" max="168" data-l="${esc(v)}|hours" value="${l.hours !== undefined && l.hours !== '' ? esc(String(l.hours)) : ''}" placeholder="0"> Std./Woche</label></div></div>`; }).join('') + liveNote(T);
        const host = $('vc-live');
        host.querySelectorAll('[data-l]').forEach(el => { el.addEventListener('input', () => { const [v, k] = el.dataset.l.split('|'); S.lived[v] = S.lived[v] || {}; S.lived[v][k] = el.value; MethodKit.save(); if (k === 'score') { const sv = el.parentElement.querySelector('.mk-range-val'); sv.textContent = el.value; sv.className = 'mk-range-val ' + (el.value <= 3 ? 'low' : el.value >= 8 ? 'high' : ''); } }); el.addEventListener('change', renderLive); });
        host.querySelectorAll('[data-la]').forEach(b => b.addEventListener('click', () => { const [v, a] = b.dataset.la.split('|'); S.lived[v] = S.lived[v] || {}; const A = S.lived[v].areas || []; S.lived[v].areas = A.includes(a) ? A.filter(x => x !== a) : [...A, a]; MethodKit.save(); renderLive(); }));
    }
    function liveNote(T) {
        let out = ''; const L = T.map((v, i) => ({ v, i, s: n((S.lived[v] || {}).score, 5), h: n((S.lived[v] || {}).hours, -1), a: ((S.lived[v] || {}).areas || []).length }));
        const touched = L.some(x => (S.lived[x.v] || {}).score !== undefined); if (!touched) return note('info', 'Die Schieberegler: 10 = der Wert bestimmt meinen Alltag sichtbar, 1 = er existiert nur im Kopf. Stunden: grob schätzen reicht.');
        const sumH = L.filter(x => x.h >= 0).reduce((a, x) => a + x.h, 0); if (sumH > 112) out += note('warn', `${sumH} Stunden pro Woche – mehr als wach verfügbar ist. Dieselbe Stunde zählt bei zwei Werten? Dann rechne sie nur beim dominanten.`);
        const first = L[0]; const most = [...L].filter(x => x.h >= 0).sort((a, b) => b.h - a.h)[0];
        if (most && first.h >= 0 && most.v !== first.v && most.h >= first.h * 2 && most.h >= 10) out += note('warn', `Dein Platz 1 (<strong>${esc(first.v)}</strong>) bekommt ${first.h} Std., <strong>${esc(most.v)}</strong> (Platz ${most.i + 1}) bekommt ${most.h}. Dein Kalender hat andere Prioritäten als dein Kopf.`);
        L.filter(x => x.s <= 3 && x.i < 3).forEach(x => out += note('warn', `<strong>${esc(x.v)}</strong> auf Platz ${x.i + 1}, gelebt nur ${x.s}/10. Das ist die Art Lücke, aus der Unzufriedenheit wird – oft ohne dass man den Grund nennen kann.`));
        if (L.every(x => x.s >= 8)) out += note('info', 'Alles 8+? Entweder sehr stimmig – oder zu freundlich. Frag bei jedem Wert: Wann habe ich ihn diese Woche konkret gelebt?');
        L.filter(x => x.s >= 7 && x.a === 0 && (S.lived[x.v] || {}).score !== undefined).forEach(x => out += note('info', `<strong>${esc(x.v)}</strong> ${x.s}/10 gelebt, aber kein Lebensbereich markiert – wo genau findet das statt?`));
        const areaCount = {}; L.forEach(x => ((S.lived[x.v] || {}).areas || []).forEach(a => areaCount[a] = (areaCount[a] || 0) + 1)); const hub = Object.entries(areaCount).find(([, c]) => c >= 4);
        if (hub) out += note('info', `${hub[1]} deiner Top-Werte leben in „${hub[0]}". Klumpenrisiko: Wenn dieser Bereich wegbricht, bricht fast alles. Wo könnten zwei davon zusätzlich Platz finden?`);
        if (!out) out = note('ok', 'Wichtigkeit und Alltag passen weitgehend zusammen. Der Kompass zeigt, wo trotzdem Luft ist.');
        return out;
    }

    /* ---------- 5 ---------- */
    function renderCompass() {
        const T = top(); if (T.length < 3) { $('vc-compass').innerHTML = note('info', 'Erst Werte wählen und verdichten.'); return; }
        const C = S.compass; const rows = T.map((v, i) => ({ v, i, imp: imp(i), s: n((S.lived[v] || {}).score, 5), gap: imp(i) - n((S.lived[v] || {}).score, 5) }));
        const big = [...rows].sort((a, b) => b.gap - a.gap)[0]; const strong = [...rows].sort((a, b) => a.gap - b.gap)[0];
        $('vc-compass').innerHTML = `<div class="vc-bars">${rows.map(r => `<div class="vc-bar" style="--c:${colorOf(r.v)}"><span>${esc(r.v)}</span><div><i class="imp" style="width:${r.imp * 10}%"></i><i class="liv" style="width:${r.s * 10}%"></i></div><em class="${r.gap >= 4 ? 'bad' : r.gap <= 0 ? 'good' : ''}">${r.gap > 0 ? '−' + r.gap : r.gap < 0 ? '+' + Math.abs(r.gap) : '±0'}</em></div>`).join('')}<div class="vc-legend"><span><i class="imp"></i> Wichtigkeit</span><span><i class="liv"></i> Gelebt</span></div></div>` +
            (big.gap >= 2 ? note(big.gap >= 4 ? 'warn' : 'info', `Grösste Lücke: <strong>${esc(big.v)}</strong> (wichtig ${big.imp}, gelebt ${big.s}). ${(S.def[big.v] || {}).behave ? `Du hast selbst gesagt, woran man es merkt: „${esc(S.def[big.v].behave)}". Wann passiert das diese Woche?` : 'Hier bewegt eine Entscheidung am meisten.'}`) : note('ok', 'Keine grosse Lücke – deine Werte haben Platz. Jetzt geht es ums Halten.')) +
            (strong.gap <= -2 ? note('info', `<strong>${esc(strong.v)}</strong> lebst du stärker, als es dir laut Rangfolge wichtig ist (${strong.s} vs. ${strong.imp}). Entweder ist der Wert wichtiger als gedacht – oder er frisst Zeit, die ${esc(big.v)} bräuchte.`) : '') +
            `<div class="mk-section-label" style="margin-top:14px">Eine Entscheidung diese Woche</div><div class="mk-field"><label>Was tust du konkret, damit <strong>${esc(C.focus || big.v)}</strong> mehr Platz bekommt?</label><div class="mk-chips" style="margin-bottom:8px">${T.map(v => `<button class="mk-chip mk-chip-sm ${(C.focus || big.v) === v ? 'selected' : ''}" data-cf="${esc(v)}">${esc(v)}</button>`).join('')}</div><input class="mk-input" data-c="decision" value="${esc(C.decision || '')}" placeholder="z. B. Freitag 14 Uhr blocken für …"></div><div class="mk-field"><label>Wozu sagst du dafür Nein?</label><input class="mk-input" data-c="no" value="${esc(C.no || '')}" placeholder="Jedes Ja zu einem Wert ist ein Nein zu etwas anderem. Was ist es?"></div><div class="mk-field"><label>Woran merkst du am Sonntag, dass es geklappt hat?</label><input class="mk-input" data-c="sign" value="${esc(C.sign || '')}" placeholder="Ein beobachtbares Zeichen"></div>` + compassNote(C, big) +
            `<div class="mk-result vc-sum"><h4>Dein Kompass</h4><ol>${T.map((v, i) => `<li><b>${esc(v)}</b>${(S.def[v] || {}).mean ? `<span>${esc(S.def[v].mean)}</span>` : ''}</li>`).join('')}</ol>${S.peaks.angry ? `<div class="mk-faint" style="font-size:13px;margin-top:6px">Was dich wütend macht: „${esc(S.peaks.angry)}" – dort wird vermutlich <strong>${esc(T[0])}</strong> oder <strong>${esc(T[1])}</strong> verletzt.</div>` : ''}</div>`;
        const host = $('vc-compass');
        host.querySelectorAll('[data-cf]').forEach(b => b.addEventListener('click', () => { C.focus = b.dataset.cf; MethodKit.save(); renderCompass(); }));
        host.querySelectorAll('[data-c]').forEach(el => { el.addEventListener('input', () => { C[el.dataset.c] = el.value; MethodKit.save(); }); el.addEventListener('change', renderCompass); });
    }
    function compassNote(C, big) {
        const d = (C.decision || '').trim(), no = (C.no || '').trim(), sg = (C.sign || '').trim();
        if (!d) return '';
        if (!/\d|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|morgen|abend|mittag|wochenende|täglich|jeden/i.test(d)) return note('info', 'Ohne Zeitpunkt bleibt es Absicht. Wann genau?');
        if (/(?<![a-zäöüß])(mehr|weniger|öfter|bewusster|versuchen|achten)\b/i.test(d) && d.length < 45) return note('info', '„Mehr / öfter / bewusster" ist keine Entscheidung. Was ist das Erste, Konkrete?');
        if (!no) return note('info', 'Und das Nein? Ohne Nein wird die Woche nur voller – und der Wert bekommt doch keinen Platz.');
        if (d && no && sg) return note('ok', `Entscheidung, Nein und Zeichen – ${esc(C.focus || big.v)} hat diese Woche eine echte Chance. Sonntag kurz prüfen.`);
        return '';
    }
    function renderLinks() { $('vc-links').innerHTML = LINKS.map(x => `<a class="mk-option vc-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const T = top(); const C = S.compass;
        const L = ['MEIN WERTE-KOMPASS', '='.repeat(40), 'Erstellt: ' + new Date().toLocaleDateString('de-CH'), '', `Ausgewählt (${S.sel.length}): ${S.sel.join(', ')}`, '', 'TOP 5'];
        T.forEach((v, i) => { const d = S.def[v] || {}, l = S.lived[v] || {}; L.push(`${i + 1}. ${v}  (wichtig ${imp(i)}/10 · gelebt ${n(l.score, 5)}/10${l.hours ? ` · ${l.hours} Std./Wo` : ''})`); if (d.mean) L.push(`   Bedeutung: ${d.mean}`); if (d.behave) L.push(`   Verhalten: ${d.behave}`); if (d.betray) L.push(`   Verraten: ${d.betray}`); if ((l.areas || []).length) L.push(`   Bereiche: ${l.areas.join(', ')}`); });
        if (ranking().length > 5) L.push('', `Weitere: ${ranking().slice(5).join(', ')}`);
        if (C.decision) L.push('', 'DIESE WOCHE', `Fokus: ${C.focus || T[0]}`, `Entscheidung: ${C.decision}`, C.no ? `Nein zu: ${C.no}` : '', C.sign ? `Zeichen: ${C.sign}` : '');
        PEAKS.forEach(([k, q]) => { if (S.peaks[k]) L.push('', q + ':', S.peaks[k]); });
        MethodKit.exportText('werte-kompass.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'values-clarification', accent: '#14b8a6', accent2: '#06b6d4',
            steps: [{ icon: '🔎', label: 'Entdecken' }, { icon: '⚖️', label: 'Verdichten' }, { icon: '✍️', label: 'Bedeutung' }, { icon: '📅', label: 'Alltag' }, { icon: '🧭', label: 'Kompass' }],
            defaultState: { sel: [], custom: [], peaks: {}, pairs: {}, order: [], def: {}, lived: {}, compass: {} }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.sel)) S.sel = Array.isArray(S.selected) ? uniq(S.selected) : [];
        if (!Array.isArray(S.custom)) S.custom = S.sel.filter(v => !GROUPS.some(g => g.v.includes(v)));
        if (!S.peaks || typeof S.peaks !== 'object') S.peaks = {}; if (!S.pairs || typeof S.pairs !== 'object') S.pairs = {};
        if (!Array.isArray(S.order)) S.order = Array.isArray(S.top) && S.top.length ? uniq([...S.top, ...S.sel]) : []; if (S.order.length && S.order.length !== S.sel.length) S.order = [];
        if (!S.def || typeof S.def !== 'object') { S.def = {}; if (S.meaning && typeof S.meaning === 'object') Object.entries(S.meaning).forEach(([v, m]) => { if (m) S.def[v] = { mean: String(m) }; }); }
        if (!S.lived || typeof S.lived !== 'object' || Object.values(S.lived).some(x => typeof x !== 'object')) { const old = S.lived || {}; S.lived = {}; Object.entries(old).forEach(([v, x]) => { if (typeof x !== 'object') S.lived[v] = { score: n(x, 5) }; else S.lived[v] = x; }); }
        if (!S.compass || typeof S.compass !== 'object') S.compass = {};
        ['pool', 'selected', 'top', 'meaning'].forEach(k => delete S[k]);
        $('vc-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) renderPick();
            if (k === 2) renderRank();
            if (k === 3) renderDefine();
            if (k === 4) renderLive();
            if (k === 5) { renderCompass(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
