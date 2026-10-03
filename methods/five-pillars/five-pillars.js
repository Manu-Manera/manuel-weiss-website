/* Fünf Säulen der Identität (Petzold) · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const P = [
        { id: 'body', ic: '💪', t: 'Leiblichkeit', d: 'Gesundheit, Energie, Schlaf, Bewegung, Körpergefühl', c: '#22c55e', q: 'Wie wohl fühlst du dich in deinem Körper – und wie sorgst du für ihn?', help: ['Schlaf vor allem anderen: eine Woche feste Zeiten', 'Täglich 20 Minuten draussen gehen', 'Einen Arzttermin, den du aufschiebst, buchen'] },
        { id: 'social', ic: '🤝', t: 'Soziales Netz', d: 'Familie, Freunde, Partnerschaft, Kolleg·innen, Zugehörigkeit', c: '#ec4899', q: 'Wer ist da, wenn es schwierig wird – und wie oft seid ihr wirklich in Kontakt?', help: ['Eine Person pro Woche aktiv anrufen', 'Eine Verabredung fest in den Kalender', 'Einer Gruppe oder einem Verein beitreten'] },
        { id: 'work', ic: '💼', t: 'Arbeit & Leistung', d: 'Beruf, Aufgaben, Können, Anerkennung, Wirksamkeit', c: '#6366f1', q: 'Erlebst du dich als wirksam – und wird gesehen, was du leistest?', help: ['Ein Gespräch über Rolle und Erwartungen führen', 'Eine Fähigkeit gezielt vertiefen', 'Ehrenamt oder Projekt ausserhalb des Jobs'] },
        { id: 'mat', ic: '🏠', t: 'Materielle Sicherheit', d: 'Einkommen, Wohnen, Rücklagen, Besitz, Absicherung', c: '#f59e0b', q: 'Kannst du ruhig schlafen, was Geld und Wohnen angeht?', help: ['Einen Monat lang Ausgaben erfassen', 'Notgroschen-Ziel definieren (3 Monatsausgaben)', 'Versicherungen und Verträge einmal prüfen'] },
        { id: 'values', ic: '🧭', t: 'Werte & Sinn', d: 'Überzeugungen, Glaube, Sinnerleben, Ideale, Zugehörigkeit zu etwas Grösserem', c: '#14b8a6', q: 'Weisst du, wofür du morgens aufstehst – und lebst du danach?', help: ['Werte klären (Methode Werte-Kompass)', 'Ein Engagement für etwas, das grösser ist als du', 'Täglich 5 Minuten Stille oder Dankbarkeit'] }
    ];
    const TREND = [['down', '↘', 'wird schwächer'], ['flat', '→', 'stabil'], ['up', '↗', 'wird stärker']];
    const EFF = [['s', 'klein (≤ 30 Min)'], ['m', 'mittel (ein Nachmittag)'], ['l', 'gross (mehrere Wochen)']];
    const LINKS = [
        { m: 'Ressourcen-Analyse', l: '../resource-analysis/resource-analysis.html', why: 'Was trägt in jeder Säule konkret?' },
        { m: 'Werte-Kompass', l: '../values-clarification/values-clarification.html', why: 'Die Säule Werte & Sinn vertiefen.' },
        { m: 'Stress-Kompass', l: '../stress-management/stress-management.html', why: 'Wenn eine Säule akut wackelt.' },
        { m: 'Lebensrad', l: '../wheel-of-life/wheel-of-life.html', why: 'Feinere Aufteilung der Lebensbereiche.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const R = (id) => S.r[id] || (S.r[id] = { sat: 0, trend: '', note: '' });
    const PI = (id) => P.find(p => p.id === id);
    const rated = () => P.filter(p => n(R(p.id).sat, 0));
    const sorted = () => [...rated()].sort((a, b) => R(a.id).sat - R(b.id).sat);
    const avg = () => { const r = rated(); return r.length ? r.reduce((a, p) => a + R(p.id).sat, 0) / r.length : 0; };

    /* ---------- 1 ---------- */
    function renderRate() {
        $('fp-rate').innerHTML = P.map(p => { const r = R(p.id); return `<div class="fp-p" style="--c:${p.c}"><div class="fp-p-h"><span>${p.ic}</span><div><b>${p.t}</b><small>${p.d}</small></div><em>${r.sat ? r.sat + '/10' : '–'}</em></div><div class="fp-q">${p.q}</div><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${r.sat || 5}" data-sat="${p.id}" aria-label="${p.t} Zufriedenheit"><span class="mk-range-val">${r.sat || '–'}</span></div><div class="fp-trend">${TREND.map(([k, s, l]) => `<button class="${r.trend === k ? 'on ' + k : ''}" data-tr="${p.id}" data-v="${k}">${s} ${l}</button>`).join('')}</div><input class="mk-input" data-note="${p.id}" value="${esc(r.note || '')}" placeholder="Was trägt hier – und was wackelt?"></div>`; }).join('') + rateNote();
        const host = $('fp-rate');
        host.querySelectorAll('[data-sat]').forEach(i => { i.addEventListener('input', () => { R(i.dataset.sat).sat = +i.value; i.nextElementSibling.textContent = i.value; i.closest('.fp-p').querySelector('em').textContent = i.value + '/10'; MethodKit.save(); }); i.addEventListener('change', renderRate); });
        host.querySelectorAll('[data-tr]').forEach(b => b.addEventListener('click', () => { R(b.dataset.tr).trend = b.dataset.v; MethodKit.save(); renderRate(); }));
        host.querySelectorAll('[data-note]').forEach(i => i.addEventListener('input', () => { R(i.dataset.note).note = i.value; MethodKit.save(); }));
    }
    function rateNote() {
        const r = rated(); if (r.length < 5) return note('info', `${r.length}/5 Säulen eingeschätzt. Bewege jeden Regler bewusst – auch wenn „5" bequem ist.`);
        const noTrend = P.filter(p => !R(p.id).trend); if (noTrend.length) return note('info', `Trend fehlt bei ${noTrend.map(p => p.t).join(', ')}. Der Trend ist oft wichtiger als der Stand: Eine 7, die fällt, braucht mehr Aufmerksamkeit als eine 5, die steigt.`);
        return note('ok', 'Alle Säulen eingeschätzt. Das Bild im nächsten Schritt zeigt, wie dein Dach steht.');
    }

    /* ---------- 2 ---------- */
    function analysis() {
        const out = []; const r = rated(); if (r.length < 5) return out;
        const so = sorted(), low = so[0], high = so[so.length - 1], a = avg(), spread = R(high.id).sat - R(low.id).sat;
        const weak = P.filter(p => R(p.id).sat <= 4), falling = P.filter(p => R(p.id).trend === 'down');
        if (weak.length >= 2) out.push(['warn', `<strong>${weak.slice(0, -1).map(p => p.t).join(', ')} und ${weak[weak.length - 1].t}</strong> liegen bei 4 oder darunter. ${['', '', 'Zwei', 'Drei', 'Vier', 'Fünf'][weak.length]} schwache Säulen gleichzeitig – da trägt das Dach nicht mehr allein. Hol dir Unterstützung, bevor du alles selbst stemmst.`]);
        else if (weak.length === 1) out.push(['warn', `<strong>${weak[0].t}</strong> ist mit ${R(weak[0].id).sat}/10 die Belastungsstelle. Die anderen tragen gerade mit – das geht eine Weile, aber nicht dauerhaft.`]);
        if (R(high.id).sat >= 8 && so.slice(0, 4).every(p => R(p.id).sat <= 5)) out.push(['warn', `<strong>Klumpenrisiko:</strong> Deine Identität ruht fast ganz auf <strong>${high.t}</strong> (${R(high.id).sat}/10), die anderen liegen bei ≤ 5. Fällt diese Säule – Kündigung, Krankheit, Trennung – fällt alles. Baue jetzt eine zweite auf, solange es dir gut geht.`]);
        else if (spread >= 5) out.push(['info', `Grosse Spannweite: ${high.t} ${R(high.id).sat} vs. ${low.t} ${R(low.id).sat}. Oft wird eine Säule überbaut, um eine andere zu kompensieren. Frag dich: Flüchte ich in ${high.t}?`]);
        if (falling.length >= 2) out.push(['warn', `${falling.map(p => p.t).join(' und ')} werden schwächer. Mehrere fallende Trends gleichzeitig sind ein Frühwarnsignal – auch wenn die Werte noch okay sind.`]);
        else if (falling.length === 1 && R(falling[0].id).sat >= 6) out.push(['info', `${falling[0].t} steht bei ${R(falling[0].id).sat}, fällt aber. Jetzt ist der günstige Moment, gegenzusteuern – nicht erst bei 4.`]);
        if (R('work').sat >= 8 && R('body').sat <= 5 && R('body').trend !== 'up') out.push(['info', 'Arbeit stark, Körper schwach – das klassische Muster vor dem Burnout. Die Leiblichkeit ist die Säule, auf der alle anderen physisch stehen.']);
        if (R('values').sat <= 4 && a >= 6) out.push(['info', 'Alles läuft, aber Sinn fehlt. Das ist die „Leere trotz Erfolg". Die Werte-Säule braucht keine grossen Schritte, sondern Klarheit: Wofür das alles?']);
        if (R('social').sat <= 4 && R('mat').sat >= 7) out.push(['info', 'Materiell sicher, sozial dünn. Geld federt vieles ab – aber in einer Krise brauchst du Menschen, nicht Kontostand.']);
        if (!out.length) out.push(spread <= 2 && a >= 7 ? ['ok', `Ausgeglichen und stabil (Ø ${a.toFixed(1)}). Das ist das Ziel des Modells: kein Dach auf einer Säule, sondern auf fünf. Pflege, was da ist.`] : ['ok', `Ø ${a.toFixed(1)}/10, keine akute Schieflage. Die schwächste Säule (${low.t}, ${R(low.id).sat}) ist dein natürlicher Fokus.`]);
        return out;
    }
    function renderChart() {
        if (rated().length < 5) { $('fp-chart').innerHTML = note('info', 'Schätze in Schritt 1 alle fünf Säulen ein.'); return; }
        const a = avg(), last = S.history.length ? S.history[S.history.length - 1] : null;
        $('fp-chart').innerHTML = `<div class="fp-house"><div class="fp-roof"><span>Identität</span><small>Ø ${a.toFixed(1)}</small></div><div class="fp-cols">${P.map(p => { const r = R(p.id); const d = last && last.r[p.id] ? r.sat - last.r[p.id].sat : null; return `<div class="fp-col"><div class="fp-col-t"><i style="height:${r.sat * 10}%; background:${p.c}" class="${r.sat <= 4 ? 'weak' : ''}"><b>${r.sat}</b></i></div><span class="fp-col-ic">${p.ic}</span><span class="fp-col-l">${p.t}</span><span class="fp-col-tr ${r.trend}">${(TREND.find(t => t[0] === r.trend) || ['', '·'])[1]}${d !== null && d !== 0 ? ` <em>${d > 0 ? '+' : ''}${d}</em>` : ''}</span></div>`; }).join('')}</div><div class="fp-ground"></div></div>` + analysis().map(([t, m]) => note(t, m)).join('');
    }

    /* ---------- 3 ---------- */
    function renderFocus() {
        if (rated().length < 5) { $('fp-focus').innerHTML = note('info', 'Schätze zuerst alle Säulen ein.'); return; }
        const so = sorted(); const sugg = P.find(p => R(p.id).trend === 'down' && R(p.id).sat <= 5) || so[0];
        const focus = S.focus && PI(S.focus) ? PI(S.focus) : null;
        const strong = focus ? P.filter(p => p.id !== focus.id && R(p.id).sat >= 6).sort((a, b) => R(b.id).sat - R(a.id).sat) : [];
        $('fp-focus').innerHTML = `<div class="mk-field"><label>Welche Säule stärkst du zuerst?</label><div class="fp-pick">${so.map(p => `<button class="fp-pick-b ${S.focus === p.id ? 'on' : ''}" style="--c:${p.c}" data-f="${p.id}"><span>${p.ic}</span><b>${p.t}</b><small>${R(p.id).sat}/10 ${(TREND.find(t => t[0] === R(p.id).trend) || ['', ''])[1]}</small>${p.id === sugg.id ? '<em>Vorschlag</em>' : ''}</button>`).join('')}</div></div>` +
            (!focus ? note('info', `Vorschlag: <strong>${sugg.t}</strong> – ${R(sugg.id).trend === 'down' ? 'sie fällt und ist schon unter 6' : 'die niedrigste Säule'}. Du darfst aber auch eine andere wählen, wenn sie dir wichtiger ist.`) :
                `<div class="fp-focus-card" style="--c:${focus.c}"><div class="fp-p-h"><span>${focus.ic}</span><div><b>${focus.t}</b><small>${R(focus.id).sat}/10 · ${(TREND.find(t => t[0] === R(focus.id).trend) || ['', '', 'kein Trend'])[2]}</small></div></div>${R(focus.id).note ? `<div class="fp-quote">„${esc(R(focus.id).note)}"</div>` : ''}<div class="mk-field"><label>Wenn diese Säule weiter schwächer wird – was passiert mit den anderen vier?</label><textarea class="mk-textarea" id="fp-impact" rows="2" placeholder="z. B. Ohne Energie leidet die Arbeit, und für Freunde bleibt nichts übrig">${esc(S.impact || '')}</textarea></div><div class="mk-field"><label>Welche starke Säule kann stützen?</label><div class="mk-chips">${strong.length ? strong.map(p => `<button class="mk-chip ${S.support === p.id ? 'selected' : ''}" data-sup="${p.id}">${p.ic} ${p.t} (${R(p.id).sat})</button>`).join('') : '<span class="mk-faint">Keine Säule über 5 – dann hol dir Stütze von aussen: eine Person, eine Beratung.</span>'}</div></div>${S.support && PI(S.support) ? `<div class="mk-field"><label>Wie konkret hilft ${PI(S.support).t} bei ${focus.t}?</label><input class="mk-input" id="fp-how" value="${esc(S.how || '')}" placeholder="${howHint(focus.id, S.support)}"></div>` : ''}${focusNote(focus)}</div>`);
        const host = $('fp-focus');
        host.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { if (S.focus !== b.dataset.f) { S.focus = b.dataset.f; S.support = ''; S.how = ''; } MethodKit.save(); renderFocus(); }));
        host.querySelectorAll('[data-sup]').forEach(b => b.addEventListener('click', () => { S.support = S.support === b.dataset.sup ? '' : b.dataset.sup; MethodKit.save(); renderFocus(); }));
        const im = $('fp-impact'); if (im) { im.addEventListener('input', () => { S.impact = im.value; MethodKit.save(); }); im.addEventListener('change', renderFocus); }
        const hw = $('fp-how'); if (hw) { hw.addEventListener('input', () => { S.how = hw.value; MethodKit.save(); }); hw.addEventListener('change', renderFocus); }
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function howHint(f, s) {
        const M = { 'body|social': 'z. B. Mit einer Freundin zum Sport verabreden', 'body|work': 'z. B. Mittagspause als festen Spaziergang blocken', 'body|mat': 'z. B. Geld für Physio oder Fitnessstudio freigeben', 'body|values': 'z. B. Bewegung als Selbstfürsorge-Ritual verstehen', 'social|work': 'z. B. Mit Kolleg·innen ausserhalb der Arbeit treffen', 'social|body': 'z. B. Laufgruppe statt allein', 'social|mat': 'z. B. Freunde zum Essen einladen', 'social|values': 'z. B. Gemeinschaft über ein Engagement finden', 'work|social': 'z. B. Mentor·in im Netzwerk um Rat fragen', 'work|body': 'z. B. Energie durch Schlaf zurück in den Job holen', 'work|values': 'z. B. Aufgaben suchen, die zu deinen Werten passen', 'work|mat': 'z. B. Rücklagen nutzen für eine Weiterbildung', 'mat|work': 'z. B. Gehaltsgespräch oder Nebenprojekt', 'mat|social': 'z. B. Finanzcheck mit jemandem, der sich auskennt', 'mat|values': 'z. B. Klären, was „genug" für dich ist', 'mat|body': 'z. B. Gesundheit als beste Absicherung sehen', 'values|social': 'z. B. Mit nahen Menschen über Sinn sprechen', 'values|work': 'z. B. Den Sinn-Anteil im Job benennen', 'values|body': 'z. B. Stille, Natur, Atem als Zugang zu Sinn', 'values|mat': 'z. B. Geld für etwas geben, das dir wichtig ist' };
        return M[f + '|' + s] || 'Wie genau?';
    }
    function focusNote(f) {
        const i = (S.impact || '').trim();
        if (!i) return note('info', 'Die Wechselwirkung zu benennen, macht die Dringlichkeit sichtbar. Welche Säule reisst diese mit?');
        if (!S.support) return note('info', 'Petzold: Säulen stützen einander. Wähle die stärkste – sie ist deine Ressource für den Umbau.');
        const h = (S.how || '').trim();
        if (!h) return note('info', 'Noch ein „Wie" – dann hast du den Hebel.');
        if (h.length < 25 || (/(?<![a-zäöüß])(mehr|weniger|öfter|besser|bewusster|versuchen|achten)(?![a-zäöüß])/i.test(h) && !/\d|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|jeden|täglich|wöchentlich|uhr/i.test(h))) return note('info', `„${esc(h)}" – das ist eine Richtung, noch kein Hebel. Wann, wie oft, mit wem?`);
        return note('ok', `${f.t} stärken mit Hilfe von ${PI(S.support).t}. Im nächsten Schritt werden daraus Schritte.`);
    }

    /* ---------- 4 ---------- */
    function renderPlan() {
        const focus = S.focus && PI(S.focus) ? PI(S.focus) : null;
        if (!focus) { $('fp-plan').innerHTML = note('info', 'Wähle in Schritt 3 eine Fokus-Säule.'); return; }
        const strong = sorted()[4];
        $('fp-plan').innerHTML = `<div class="fp-focus-card" style="--c:${focus.c}"><div class="fp-p-h"><span>${focus.ic}</span><div><b>${focus.t} stärken</b><small>Ideen: ${focus.help.join(' · ')}</small></div></div>${S.actions.map(a => `<div class="fp-act"><input class="mk-input" data-at="${a.id}" value="${esc(a.text)}" placeholder="Was genau?"><input class="mk-input fp-by" type="date" data-by="${a.id}" value="${esc(a.by || '')}"><div class="fp-eff">${EFF.map(([k, l]) => `<button class="${a.eff === k ? 'on' : ''}" data-eff="${a.id}" data-v="${k}" title="${l}">${k === 's' ? 'S' : k === 'm' ? 'M' : 'L'}</button>`).join('')}</div><button class="mk-iconbtn" data-del="${a.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('')}${S.actions.length < 3 ? `<button class="mk-btn mk-btn-outline mk-btn-sm" id="fp-add"><i class="fas fa-plus"></i> Schritt</button>` : ''}${planNote()}</div>` +
            (strong && strong.id !== focus.id ? `<div class="fp-focus-card" style="--c:${strong.c}; margin-top:12px"><div class="fp-p-h"><span>${strong.ic}</span><div><b>${strong.t} schützen</b><small>Deine stärkste Säule (${R(strong.id).sat}/10). Starke Säulen wackeln aus Vernachlässigung – was tust du, damit sie stark bleibt?</small></div></div><input class="mk-input" id="fp-protect" value="${esc(S.protect || '')}" placeholder="z. B. Wöchentlich eine Stunde nur dafür reservieren"></div>` : '');
        const host = $('fp-plan');
        const add = $('fp-add'); if (add) add.addEventListener('click', () => { S.actions.push({ id: MethodKit.uid(), text: '', by: '', eff: '' }); MethodKit.save(); renderPlan(); const l = host.querySelectorAll('[data-at]'); l.length && l[l.length - 1].focus(); });
        host.querySelectorAll('[data-at]').forEach(i => { i.addEventListener('input', () => { S.actions.find(a => a.id === i.dataset.at).text = i.value; MethodKit.save(); }); i.addEventListener('change', renderPlan); });
        host.querySelectorAll('[data-by]').forEach(i => i.addEventListener('change', () => { S.actions.find(a => a.id === i.dataset.by).by = i.value; MethodKit.save(); renderPlan(); }));
        host.querySelectorAll('[data-eff]').forEach(b => b.addEventListener('click', () => { S.actions.find(a => a.id === b.dataset.eff).eff = b.dataset.v; MethodKit.save(); renderPlan(); }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { S.actions = S.actions.filter(a => a.id !== b.dataset.del); MethodKit.save(); renderPlan(); }));
        const pr = $('fp-protect'); if (pr) pr.addEventListener('input', () => { S.protect = pr.value; MethodKit.save(); });
    }
    function planNote() {
        const A = S.actions.filter(a => (a.text || '').trim());
        if (!A.length) return note('info', 'Ein Schritt reicht für den Anfang. Klein genug, dass du ihn diese Woche tust.');
        if (A.every(a => a.eff === 'l')) return note('warn', 'Nur grosse Schritte. Grosse Vorhaben für eine schwache Säule scheitern oft an der Energie, die genau dort fehlt. Füge einen kleinen Schritt hinzu – für diese Woche.');
        if (A.some(a => !(a.by || '').trim())) return note('info', 'Ohne Datum bleibt es Absicht. Wann?');
        if (!A.some(a => a.eff === 's')) return note('info', 'Kein kleiner Schritt dabei. Was kannst du in 30 Minuten tun?');
        return note('ok', `${A.length} Schritt${A.length > 1 ? 'e' : ''} mit Termin, mindestens einer klein. Das ist ein Plan, der hält.`);
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        if (rated().length < 5) { $('fp-summary').innerHTML = note('info', 'Noch keine vollständige Einschätzung.'); return; }
        const focus = S.focus && PI(S.focus) ? PI(S.focus) : null; const A = S.actions.filter(a => (a.text || '').trim());
        $('fp-summary').innerHTML = `<div class="fp-sum">${P.map(p => `<div style="--c:${p.c}"><span>${p.ic}</span><b>${R(p.id).sat}</b><small>${p.t}</small><em class="${R(p.id).trend}">${(TREND.find(t => t[0] === R(p.id).trend) || ['', '·'])[1]}</em></div>`).join('')}</div><div class="mk-result"><h4>Ø ${avg().toFixed(1)}/10</h4>${analysis()[0] ? analysis()[0][1] : ''}</div>` +
            (focus ? `<div class="mk-result"><h4>${focus.ic} Fokus: ${focus.t}</h4>${S.support && PI(S.support) ? `Gestützt durch ${PI(S.support).t}${S.how ? ` – ${esc(S.how)}` : ''}<br>` : ''}${A.length ? `<ul class="fp-ul">${A.map(a => `<li>${esc(a.text)}${a.by ? ` <small>bis ${new Date(a.by).toLocaleDateString('de-CH')}</small>` : ''}</li>`).join('')}</ul>` : '<span class="mk-faint">noch keine Schritte</span>'}${S.protect ? `<div class="mk-faint" style="margin-top:6px">Schutz: ${esc(S.protect)}</div>` : ''}</div>` : '') +
            (S.history.length ? `<div class="mk-section-label">Verlauf (${S.history.length} Snapshot${S.history.length > 1 ? 's' : ''})</div><div class="fp-hist">${S.history.slice(-6).map(h => `<div><small>${new Date(h.date).toLocaleDateString('de-CH', { day: 'numeric', month: 'numeric', year: '2-digit' })}</small>${P.map(p => `<i style="height:${(h.r[p.id] ? h.r[p.id].sat : 0) * 3}px; background:${p.c}" title="${p.t}: ${h.r[p.id] ? h.r[p.id].sat : '–'}"></i>`).join('')}</div>`).join('')}</div>` : note('info', 'Speichere einen Snapshot – in drei Monaten siehst du, was sich bewegt hat.'));
    }
    function snapshot() { const r = {}; P.forEach(p => r[p.id] = { sat: R(p.id).sat, trend: R(p.id).trend }); const t = new Date().toDateString(); S.history = S.history.filter(h => new Date(h.date).toDateString() !== t); S.history.push({ date: Date.now(), r }); MethodKit.save({ now: true }); MethodKit.toast('Snapshot gespeichert', 'ok'); renderSummary(); }
    function renderLinks() { $('fp-links').innerHTML = LINKS.map(x => `<a class="mk-option fp-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['FÜNF SÄULEN DER IDENTITÄT', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        P.forEach(p => { const r = R(p.id); L.push(`${p.ic} ${p.t}: ${r.sat || '–'}/10 ${(TREND.find(t => t[0] === r.trend) || ['', ''])[1]}${r.note ? ` – ${r.note}` : ''}`); });
        analysis().forEach(([, m]) => L.push('', m.replace(/<[^>]+>/g, '')));
        if (S.focus && PI(S.focus)) { L.push('', `FOKUS: ${PI(S.focus).t}`); if (S.impact) L.push(`Wechselwirkung: ${S.impact}`); if (S.support && PI(S.support)) L.push(`Stütze: ${PI(S.support).t}${S.how ? ` – ${S.how}` : ''}`); S.actions.filter(a => a.text).forEach(a => L.push(`  - ${a.text}${a.by ? ` (bis ${a.by})` : ''}${a.eff ? ` [${a.eff.toUpperCase()}]` : ''}`)); if (S.protect) L.push(`Schutz: ${S.protect}`); }
        if (S.history.length) { L.push('', 'VERLAUF'); S.history.forEach(h => L.push(`  ${new Date(h.date).toLocaleDateString('de-CH')}: ${P.map(p => `${p.t} ${h.r[p.id] ? h.r[p.id].sat : '–'}`).join(' · ')}`)); }
        MethodKit.exportText('fuenf-saeulen.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'five-pillars', accent: '#16a34a', accent2: '#10b981',
            steps: [{ icon: '📊', label: 'Bestand' }, { icon: '🏛️', label: 'Bild' }, { icon: '🔗', label: 'Wirkung' }, { icon: '🛠️', label: 'Plan' }, { icon: '🧾', label: 'Profil' }],
            defaultState: { r: {}, focus: '', support: '', how: '', impact: '', actions: [], protect: '', history: [] }
        });
        S = MethodKit.state;
        if (!S.r || typeof S.r !== 'object') S.r = {};
        // Migration: altes ratings{body,mind,soul,rel,career} → r{}
        if (S.ratings && typeof S.ratings === 'object') { const map = { body: 'body', rel: 'social', career: 'work', soul: 'values' }; Object.entries(map).forEach(([o, k]) => { if (S.ratings[o] && !S.r[k]) S.r[k] = { sat: n(S.ratings[o], 0), trend: '', note: (S.notes || {})[o] || '' }; }); delete S.ratings; delete S.notes; if (S.focus && map[S.focus]) S.focus = map[S.focus]; else if (S.focus && !PI(S.focus)) S.focus = ''; }
        if (!Array.isArray(S.actions)) S.actions = []; S.actions = S.actions.map(a => typeof a === 'string' ? { id: MethodKit.uid(), text: a, by: '', eff: '' } : Object.assign({ id: MethodKit.uid(), text: '', by: '', eff: '' }, a));
        if (!Array.isArray(S.history)) S.history = [];
        $('fp-export').addEventListener('click', exportAll); $('fp-snapshot').addEventListener('click', snapshot);
        MethodKit.onStep = function (k) {
            if (k === 1) renderRate();
            if (k === 2) renderChart();
            if (k === 3) renderFocus();
            if (k === 4) renderPlan();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
