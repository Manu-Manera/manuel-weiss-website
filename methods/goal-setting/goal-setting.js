/* Ziele setzen · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const CATS = { beruf: ['💼', 'Beruf'], gesundheit: ['💪', 'Gesundheit'], beziehungen: ['❤️', 'Beziehungen'], finanzen: ['💰', 'Finanzen'], bildung: ['📚', 'Lernen'], hobby: ['🎨', 'Hobby'], persoenlich: ['🌱', 'Persönlich'] };
    const AVOID = /\b(nicht mehr|weniger|aufhören|loswerden|keine?n?|nie mehr|weg von|vermeiden|abnehmen|stoppen|los werden|kein)\b/i;
    const VAGUE = /(?<![a-zäöüß])(mehr|besser|öfter|gesünder|fitter|glücklicher|erfolgreicher|produktiver|entspannter|irgendwann|bald)\b/i;
    const VERB_STEP = /(?<![a-zäöüß])(anrufen|schreiben|buchen|anmelden|lesen|gehen|laufen|trainieren|kochen|planen|fragen|treffen|blocken|kündigen|beginnen|starten|recherchieren|aufsetzen|erstellen|einrichten|kaufen|bestellen|notieren|üben|üben|lernen|rufe|schreibe|buche|melde|lese|gehe|laufe|trainiere|koche|plane|frage|treffe|blocke|kündige|beginne|starte|recherchiere|erstelle|richte|kaufe|bestelle|notiere|übe|lerne|termin|mail|liste)\b/i;
    const LINKS = [
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Die Trägergewohnheit richtig verankern und tracken.' },
        { m: 'Werte-Kompass', l: '../values-clarification/values-clarification.html', why: 'Wenn das Warum dünn ist: Welcher Wert steckt hinter dem Ziel?' },
        { m: 'Rubikon-Modell', l: '../rubikon-model/rubikon-model.html', why: 'Vom Abwägen ins Handeln – wenn du zögerst.' },
        { m: 'Walt-Disney-Methode', l: '../walt-disney/walt-disney.html', why: 'Träumer, Realist, Kritiker – wenn das Ziel noch gross und unscharf ist.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const tr = (s) => (s || '').trim();
    const days = (d) => d ? Math.round((new Date(d) - new Date().setHours(0, 0, 0, 0)) / 864e5) : null;
    const fmtD = (d) => d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) : '–';
    const isoPlus = (dd) => { const x = new Date(); x.setDate(x.getDate() + dd); return x.toISOString().slice(0, 10); };
    function smartScore() { const s = S.smart; let sc = 0; if (tr(S.title).length >= 15 && !VAGUE.test(S.title)) sc++; if (tr(s.m) && /\d/.test(s.m)) sc++; if (n(s.conf, 0) >= 5 && n(s.conf, 0) <= 9) sc++; if (tr(S.why).length >= 40) sc++; if (s.t && days(s.t) > 7) sc++; return sc; }
    function progress() { const ms = S.milestones.filter(m => tr(m.text)); const a = S.actions; const mp = ms.length ? ms.filter(m => m.done).length / ms.length : null; const ap = a.length ? a.filter(x => x.done).length / a.length : null; if (mp === null && ap === null) return null; if (mp === null) return Math.round(ap * 100); if (ap === null) return Math.round(mp * 100); return Math.round((mp * 0.7 + ap * 0.3) * 100); }
    function sentence() { const s = S.smart; if (!tr(S.title)) return ''; let out = `${tr(S.title).replace(/\.$/, '')} – bis ${s.t ? fmtD(s.t) : '[Datum]'}`; if (tr(s.m)) out += `, messbar an: ${tr(s.m).replace(/\.$/, '')}`; if (tr(S.why)) out += `. Weil ${tr(S.why).replace(/^weil\s+/i, '').replace(/\.$/, '')}`; return out + '.'; }

    /* ---------- 1 ---------- */
    function renderGoal() {
        $('gs-goal').innerHTML = `<div class="mk-field"><label>Lebensbereich</label><div class="mk-chips">${Object.entries(CATS).map(([k, [ic, t]]) => `<button class="mk-chip ${S.category === k ? 'selected' : ''}" data-cat="${k}">${ic} ${t}</button>`).join('')}</div></div>` +
            `<div class="mk-field"><label>Mein Ziel – ein Satz, so konkret wie möglich</label><input class="mk-input gs-big" data-f="title" value="${esc(S.title || '')}" placeholder="z. B. Einen 10-km-Lauf unter 60 Minuten laufen"></div>` +
            `<div class="mk-field"><label>Warum will ich das? Was ändert sich, wenn ich es erreicht habe?</label><textarea class="mk-textarea" data-f="why" rows="3" placeholder="Nicht „weil es gesund ist" – sondern: Was ist dann anders, in meinem Alltag, in mir?">${esc(S.why || '')}</textarea></div>` +
            `<div class="mk-field"><label>Und warum ist dir <em>das</em> wichtig? (Eine Ebene tiefer)</label><input class="mk-input" data-f="why2" value="${esc(S.why2 || '')}" placeholder="Was steckt dahinter – welcher Wert, welches Bedürfnis?"></div>` + goalNote();
        const host = $('gs-goal');
        host.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => { S.category = S.category === b.dataset.cat ? '' : b.dataset.cat; MethodKit.save(); renderGoal(); }));
        host.querySelectorAll('[data-f]').forEach(el => { el.addEventListener('input', () => { S[el.dataset.f] = el.value; MethodKit.save(); }); el.addEventListener('change', renderGoal); });
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function goalNote() {
        const t = tr(S.title), w = tr(S.why), w2 = tr(S.why2);
        if (!t) return note('info', 'Schreib das Ziel so, dass jemand Fremdes am Ende eindeutig sagen könnte: erreicht oder nicht.');
        let out = '';
        if (AVOID.test(t)) out += note('warn', `„${esc(t.match(AVOID)[0])}" – das ist ein Weg-von-Ziel. Das Gehirn kann auf „nicht" nicht zusteuern. Formulier es um: Was tust du <em>stattdessen</em>, was ist dann <em>da</em>?`);
        else if (VAGUE.test(t) && !/\d/.test(t)) out += note('info', `„${esc(t.match(VAGUE)[1])}" ohne Zahl – woran würdest du merken, dass es reicht? Das klärt Schritt 2, aber das Ziel wird schärfer, wenn du jetzt schon eine Grösse nennst.`);
        else if (t.length < 15) out += note('info', 'Sehr kurz. Ein Ziel in drei Wörtern ist meist ein Thema, kein Ziel.');
        else if (t.split(/\bund\b/i).length >= 3) out += note('info', 'Mehrere Ziele in einem Satz. Nimm das wichtigste – die anderen kommen danach.');
        if (w && w.length < 40) out += note('info', 'Das Warum ist noch dünn. Es muss an einem Regentag im Februar tragen – schreib, was dann konkret anders ist.');
        else if (w && /\b(sollte|muss|man|erwartet|alle)\b/i.test(w) && !/\b(ich will|ich möchte|mir)\b/i.test(w)) out += note('info', 'Klingt nach „sollte". Fremde Ziele halten etwa drei Wochen. Gibt es ein eigenes Warum dahinter?');
        if (w.length >= 40 && w2.length >= 15) out += note('ok', 'Ziel, Warum und das Warum dahinter – das trägt. Jetzt schärfen.');
        else if (w.length >= 40 && !w2) out += note('info', 'Noch die zweite Ebene: Warum ist dir das wichtig? Da steht meistens der eigentliche Antrieb.');
        return out;
    }

    /* ---------- 2 ---------- */
    function renderSmart() {
        const s = S.smart; const sc = smartScore(); const conf = n(s.conf, 7);
        $('gs-smart').innerHTML = `<div class="gs-score"><div class="gs-score-ring" style="--p:${sc / 5 * 100}"><b>${sc}</b><small>/5</small></div><div><b>SMART-Score</b><span>${['Noch ein Wunsch.', 'Erste Konturen.', 'Wird konkreter.', 'Fast ein Ziel.', 'Ein echtes Ziel.', 'Scharf. Los geht\'s.'][sc]}</span></div></div>` +
            `<div class="gs-smart"><div class="gs-s" style="--c:#f59e0b"><b>S</b><div><label>Spezifisch – was genau, wo, mit wem?</label><input class="mk-input" data-s="s" value="${esc(s.s || '')}" placeholder="Details, die das Ziel eindeutig machen"></div></div>` +
            `<div class="gs-s" style="--c:#f97316"><b>M</b><div><label>Messbar – Zahl oder klares Ja/Nein-Kriterium</label><input class="mk-input" data-s="m" value="${esc(s.m || '')}" placeholder="z. B. 10 km in 59:59 · 3× pro Woche · 5'000 CHF gespart"></div></div>` +
            `<div class="gs-s" style="--c:#ef4444"><b>A</b><div><label>Attraktiv & erreichbar – wie sicher bist du, dass du es schaffst?</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="1" max="10" value="${conf}" data-s="conf"><span class="mk-range-val">${conf}</span></div></div></div>` +
            `<div class="gs-s" style="--c:#ec4899"><b>R</b><div><label>Relevant – wie passt es zu dem, was dir gerade wichtig ist?</label><input class="mk-input" data-s="r" value="${esc(s.r || '')}" placeholder="Zu welchem grösseren Bild gehört das?"></div></div>` +
            `<div class="gs-s" style="--c:#a855f7"><b>T</b><div><label>Terminiert – bis wann?</label><input type="date" class="mk-input" data-s="t" value="${esc(s.t || '')}" style="max-width:200px"></div></div></div>` + smartNote() +
            (sentence() ? `<div class="mk-result gs-sentence"><h4>Dein Zielsatz</h4><p>${esc(sentence())}</p></div>` : '');
        const host = $('gs-smart');
        host.querySelectorAll('[data-s]').forEach(el => { el.addEventListener('input', () => { s[el.dataset.s] = el.value; MethodKit.save(); if (el.dataset.s === 'conf') el.parentElement.querySelector('.mk-range-val').textContent = el.value; }); el.addEventListener('change', renderSmart); });
    }
    function smartNote() {
        const s = S.smart; let out = ''; const conf = n(s.conf, 0); const d = s.t ? days(s.t) : null;
        if (tr(s.m) && !/\d/.test(s.m) && !/\b(ja|nein|fertig|abgeschlossen|bestanden|erledigt|unterschrieben|veröffentlicht|gehalten)\b/i.test(s.m)) out += note('warn', 'Keine Zahl und kein Ja/Nein-Kriterium. „Besser" ist nicht messbar. Was würdest du zählen, wiegen, timen, abhaken?');
        if (d !== null) { if (d < 0) out += note('warn', 'Das Datum liegt in der Vergangenheit.'); else if (d < 7) out += note('info', `Nur ${d} Tage – das ist eine Aufgabe, kein Ziel. Oder ein sehr sportlicher Sprint.`); else if (d > 365) out += note('info', `${Math.round(d / 30)} Monate. Über ein Jahr hinaus verliert ein Ziel Zug. Setz ein Zwischenziel für die nächsten 90 Tage – die Meilensteine im nächsten Schritt helfen.`); else if (d > 90 && !tr(s.m)) out += note('info', `${d} Tage ohne Messgrösse – da merkst du erst am Ende, ob du auf Kurs warst.`); }
        if (s.conf !== undefined && s.conf !== '') { if (conf <= 3) out += note('warn', `Zuversicht ${conf}/10 – du glaubst selbst nicht daran. Entweder kleiner machen oder klären, was fehlt (Zeit, Wissen, Unterstützung?).`); else if (conf === 10) out += note('info', 'Zuversicht 10/10 – dann ist es wahrscheinlich zu leicht. Ein Ziel soll ein bisschen ziehen.'); else if (conf >= 5 && conf <= 8) out += note('ok', `Zuversicht ${conf}/10 – der Bereich, in dem Ziele motivieren: anspruchsvoll, aber machbar.`); }
        if (tr(s.r) && /\b(sollte|muss|erwartet|chef|eltern|partner will)\b/i.test(s.r) && !/\b(ich|mir|mein)\b/i.test(s.r)) out += note('info', 'Relevanz für andere, nicht für dich? Das hält selten durch.');
        if (smartScore() === 5) out += note('ok', 'Alle fünf Kriterien erfüllt. Jetzt den Weg bauen.');
        return out;
    }

    /* ---------- 3 ---------- */
    function renderPath() {
        const s = S.smart; const d = s.t ? days(s.t) : null;
        if (!S.milestones.length && d && d > 14) { [0.25, 0.5, 0.75].forEach(p => S.milestones.push({ id: MethodKit.uid(), text: '', date: isoPlus(Math.round(d * p)), done: false })); MethodKit.save(); }
        const ms = S.milestones;
        $('gs-path').innerHTML = `<div class="mk-section-label">Meilensteine</div>` + (d && d > 14 ? `<p class="mk-faint" style="font-size:13px;margin:0 0 8px">Bis ${fmtD(s.t)} sind es ${d} Tage. Was ist bei 25 %, 50 %, 75 % erreicht?</p>` : '') +
            `<div class="gs-ms">${ms.map((m, i) => `<div class="gs-m ${m.done ? 'done' : ''}"><button class="gs-check" data-md="${m.id}" aria-label="Erledigt"><i class="fas fa-check"></i></button><input class="mk-input" data-mt="${m.id}" value="${esc(m.text)}" placeholder="${['Erster sichtbarer Fortschritt', 'Halbzeit – was ist dann geschafft?', 'Fast am Ziel', 'Meilenstein'][Math.min(i, 3)]}"><input type="date" class="mk-input gs-date" data-mdt="${m.id}" value="${esc(m.date || '')}"><button class="mk-iconbtn" data-mx="${m.id}" aria-label="Entfernen"><i class="fas fa-xmark"></i></button></div>`).join('')}</div><button class="mk-btn mk-btn-outline mk-btn-sm" id="gs-add-m"><i class="fas fa-plus"></i> Meilenstein</button>` +
            `<div class="mk-section-label" style="margin-top:18px">Was wird schiefgehen?</div><p class="mk-faint" style="font-size:13px;margin:0 0 8px">Jedes Hindernis bekommt einen Wenn-dann-Plan. Das verdoppelt laut Forschung die Umsetzungsrate.</p>` +
            `<div class="gs-obs">${S.obstacles.map(o => `<div class="gs-o"><div class="gs-o-row"><span>Wenn</span><input class="mk-input" data-oi="${o.id}" value="${esc(o.if)}" placeholder="… ich abends zu müde bin"></div><div class="gs-o-row"><span>dann</span><input class="mk-input" data-ot="${o.id}" value="${esc(o.then)}" placeholder="… mache ich die 10-Minuten-Version"></div><button class="mk-iconbtn" data-ox="${o.id}" aria-label="Entfernen"><i class="fas fa-xmark"></i></button></div>`).join('')}</div><button class="mk-btn mk-btn-outline mk-btn-sm" id="gs-add-o"><i class="fas fa-plus"></i> Hindernis</button>` + pathNote();
        const host = $('gs-path');
        host.querySelectorAll('[data-mt]').forEach(i => i.addEventListener('input', () => { ms.find(m => m.id === i.dataset.mt).text = i.value; MethodKit.save(); }));
        host.querySelectorAll('[data-mdt]').forEach(i => i.addEventListener('change', () => { ms.find(m => m.id === i.dataset.mdt).date = i.value; MethodKit.save(); renderPath(); }));
        host.querySelectorAll('[data-mt]').forEach(i => i.addEventListener('change', renderPath));
        host.querySelectorAll('[data-md]').forEach(b => b.addEventListener('click', () => { const m = ms.find(x => x.id === b.dataset.md); m.done = !m.done; MethodKit.save(); renderPath(); if (m.done) MethodKit.toast('Meilenstein erreicht', 'ok'); }));
        host.querySelectorAll('[data-mx]').forEach(b => b.addEventListener('click', () => { S.milestones = ms.filter(x => x.id !== b.dataset.mx); MethodKit.save(); renderPath(); }));
        $('gs-add-m').addEventListener('click', () => { ms.push({ id: MethodKit.uid(), text: '', date: '', done: false }); MethodKit.save(); renderPath(); const all = host.querySelectorAll('[data-mt]'); all[all.length - 1].focus(); });
        host.querySelectorAll('[data-oi]').forEach(i => { i.addEventListener('input', () => { S.obstacles.find(o => o.id === i.dataset.oi).if = i.value; MethodKit.save(); }); i.addEventListener('change', renderPath); });
        host.querySelectorAll('[data-ot]').forEach(i => { i.addEventListener('input', () => { S.obstacles.find(o => o.id === i.dataset.ot).then = i.value; MethodKit.save(); }); i.addEventListener('change', renderPath); });
        host.querySelectorAll('[data-ox]').forEach(b => b.addEventListener('click', () => { S.obstacles = S.obstacles.filter(o => o.id !== b.dataset.ox); MethodKit.save(); renderPath(); }));
        $('gs-add-o').addEventListener('click', () => { S.obstacles.push({ id: MethodKit.uid(), if: '', then: '' }); MethodKit.save(); renderPath(); const all = host.querySelectorAll('[data-oi]'); all[all.length - 1].focus(); });
    }
    function pathNote() {
        let out = ''; const ms = S.milestones.filter(m => tr(m.text)); const ob = S.obstacles.filter(o => tr(o.if));
        const dated = ms.filter(m => m.date).sort((a, b) => a.date.localeCompare(b.date));
        if (S.smart.t && dated.some(m => m.date > S.smart.t)) out += note('warn', 'Ein Meilenstein liegt nach dem Zieldatum.');
        const order = ms.filter(m => m.date); for (let i = 1; i < order.length; i++) if (order[i].date < order[i - 1].date) { out += note('info', 'Die Meilensteine sind nicht chronologisch – stimmt die Reihenfolge?'); break; }
        if (dated.length >= 2) { const gaps = dated.map((m, i) => i ? (new Date(m.date) - new Date(dated[i - 1].date)) / 864e5 : null).filter(x => x !== null); if (Math.max(...gaps) > 60) out += note('info', `Zwischen zwei Meilensteinen liegen ${Math.round(Math.max(...gaps))} Tage. Länger als sechs Wochen ohne Zwischenziel – da verläuft sich Motivation. Noch einen dazwischen?`); }
        ms.forEach(m => { if (!/\d/.test(m.text) && m.text.length < 25) out += note('info', `„${esc(m.text)}" – woran erkennst du, dass dieser Meilenstein erreicht ist? Eine Zahl oder ein Ja/Nein-Kriterium hilft.`); });
        if (!ob.length && ms.length) out += note('info', 'Kein Hindernis? Es gibt immer eins. Die drei häufigsten: zu wenig Zeit, zu müde, schlechte Woche nach einem Rückschlag.');
        ob.forEach(o => { if (!tr(o.then)) out += note('info', `„Wenn ${esc(o.if)}" – und dann? Ohne Dann-Teil ist es nur eine Sorge.`); else if (/\b(trotzdem|einfach|zusammenreissen|zusammen|durchziehen|durchbeissen|disziplin|willenskraft|überwinde)/i.test(o.then)) out += note('info', `„${esc(o.then)}" verlässt sich auf Willenskraft – die ist in dem Moment gerade weg. Was ist die kleinste Version, die trotzdem geht?`); });
        if (ms.length >= 3 && ob.length >= 2 && ob.every(o => tr(o.then))) out += note('ok', `${ms.length} Meilensteine, ${ob.length} Wenn-dann-Pläne. Der Weg ist gebaut.`);
        return out;
    }

    /* ---------- 4 ---------- */
    function renderSteps() {
        const A = S.actions; const H = S.habits; const p = progress();
        $('gs-steps').innerHTML = (p !== null ? `<div class="gs-prog"><div><i style="width:${p}%"></i></div><span>${p} %</span></div>` : '') +
            `<div class="mk-section-label">Die nächsten konkreten Schritte</div><p class="mk-faint" style="font-size:13px;margin:0 0 8px">Jeder Schritt: unter zwei Stunden, mit Datum, startet mit einem Verb.</p>` +
            `<div class="gs-acts">${A.map(a => `<div class="gs-a ${a.done ? 'done' : ''}"><button class="gs-check" data-ad="${a.id}" aria-label="Erledigt"><i class="fas fa-check"></i></button><input class="mk-input" data-at="${a.id}" value="${esc(a.text)}" placeholder="z. B. Laufschuhe anprobieren bei …"><input type="date" class="mk-input gs-date" data-adt="${a.id}" value="${esc(a.date || '')}"><button class="mk-iconbtn" data-ax="${a.id}" aria-label="Entfernen"><i class="fas fa-xmark"></i></button></div>`).join('')}</div><button class="mk-btn mk-btn-outline mk-btn-sm" id="gs-add-a"><i class="fas fa-plus"></i> Schritt</button>` +
            `<div class="mk-section-label" style="margin-top:18px">Die Gewohnheit, die das Ziel trägt</div><p class="mk-faint" style="font-size:13px;margin:0 0 8px">Ziele erreicht man nicht, man erarbeitet sie – durch etwas, das du regelmässig tust. Nachdem [Anker], [Handlung].</p>` +
            `<div class="gs-habs">${H.map(h => `<div class="gs-h"><div class="gs-o-row"><span>Nachdem</span><input class="mk-input" data-ha="${h.id}" value="${esc(h.anchor)}" placeholder="… ich morgens Kaffee gemacht habe"></div><div class="gs-o-row"><span>werde ich</span><input class="mk-input" data-hx="${h.id}" value="${esc(h.action)}" placeholder="… 20 Minuten laufen gehen"></div><button class="mk-iconbtn" data-hd="${h.id}" aria-label="Entfernen"><i class="fas fa-xmark"></i></button></div>`).join('')}</div><button class="mk-btn mk-btn-outline mk-btn-sm" id="gs-add-h"><i class="fas fa-plus"></i> Gewohnheit</button>` + stepsNote();
        const host = $('gs-steps');
        host.querySelectorAll('[data-at]').forEach(i => { i.addEventListener('input', () => { A.find(a => a.id === i.dataset.at).text = i.value; MethodKit.save(); }); i.addEventListener('change', renderSteps); });
        host.querySelectorAll('[data-adt]').forEach(i => i.addEventListener('change', () => { A.find(a => a.id === i.dataset.adt).date = i.value; MethodKit.save(); renderSteps(); }));
        host.querySelectorAll('[data-ad]').forEach(b => b.addEventListener('click', () => { const a = A.find(x => x.id === b.dataset.ad); a.done = !a.done; MethodKit.save(); renderSteps(); }));
        host.querySelectorAll('[data-ax]').forEach(b => b.addEventListener('click', () => { S.actions = A.filter(x => x.id !== b.dataset.ax); MethodKit.save(); renderSteps(); }));
        $('gs-add-a').addEventListener('click', () => { A.push({ id: MethodKit.uid(), text: '', date: '', done: false }); MethodKit.save(); renderSteps(); const all = host.querySelectorAll('[data-at]'); all[all.length - 1].focus(); });
        host.querySelectorAll('[data-ha]').forEach(i => { i.addEventListener('input', () => { H.find(h => h.id === i.dataset.ha).anchor = i.value; MethodKit.save(); }); i.addEventListener('change', renderSteps); });
        host.querySelectorAll('[data-hx]').forEach(i => { i.addEventListener('input', () => { H.find(h => h.id === i.dataset.hx).action = i.value; MethodKit.save(); }); i.addEventListener('change', renderSteps); });
        host.querySelectorAll('[data-hd]').forEach(b => b.addEventListener('click', () => { S.habits = H.filter(h => h.id !== b.dataset.hd); MethodKit.save(); renderSteps(); }));
        $('gs-add-h').addEventListener('click', () => { H.push({ id: MethodKit.uid(), anchor: '', action: '' }); MethodKit.save(); renderSteps(); const all = host.querySelectorAll('[data-ha]'); all[all.length - 1].focus(); });
    }
    function stepsNote() {
        let out = ''; const A = S.actions.filter(a => tr(a.text)); const open = A.filter(a => !a.done); const H = S.habits.filter(h => tr(h.action));
        if (!A.length) return note('info', 'Der erste Schritt ist der, den du heute oder morgen tun könntest – ohne Vorbereitung. Was ist das?');
        const soon = open.filter(a => a.date && days(a.date) <= 7 && days(a.date) >= 0); const overdue = open.filter(a => a.date && days(a.date) < 0);
        if (overdue.length) out += note('warn', `${overdue.length} ${overdue.length === 1 ? 'Schritt ist' : 'Schritte sind'} überfällig. Neu terminieren oder streichen – überfällige Punkte zersetzen die Liste.`);
        if (open.length && open.some(a => a.date) && !soon.length && !overdue.length) out += note('info', 'Kein Schritt in den nächsten 7 Tagen. Ein Ziel ohne Bewegung diese Woche ist ein Plan, kein Ziel.');
        open.filter(a => !a.date).forEach(a => out += note('info', `„${esc(a.text)}" hat kein Datum. Ohne Datum wird es ein Irgendwann.`));
        open.filter(a => a.text.length > 10 && !VERB_STEP.test(a.text) && /(?<![a-zäöüß])(mich|informieren|überlegen|schauen|kümmern|klären|vorbereiten)\b/i.test(a.text)).forEach(a => out += note('info', `„${esc(a.text)}" – was tust du da genau, physisch? „Mich informieren" ist kein Schritt. „Drei Angebote googeln und in eine Liste schreiben" schon.`));
        if (!H.length && A.length >= 2) out += note('info', 'Noch keine Gewohnheit. Welche eine Sache, regelmässig getan, bringt dich fast automatisch ans Ziel?');
        H.forEach(h => { if (tr(h.anchor) && !/\b(nachdem|sobald|wenn|nach|um|jeden|jede)\b/i.test(h.anchor) && h.anchor.length < 15) out += note('info', `Anker „${esc(h.anchor)}" ist vage. Was passiert jeden Tag ohnehin, direkt davor?`); if (/\b(\d{2,}|stunde|stunden)\b/i.test(h.action) && !/\b(5|10|15|20|minuten)\b/i.test(h.action)) out += note('info', `„${esc(h.action)}" ist für den Anfang gross. Starte mit der Version, die auch an einem schlechten Tag geht – ausbauen kannst du später.`); });
        if (S.habits.length > 2) out += note('info', `${S.habits.length} Gewohnheiten gleichzeitig – meistens überlebt eine. Welche ist die wichtigste?`);
        if (soon.length && H.length && !out) out += note('ok', `${soon.length} ${soon.length === 1 ? 'Schritt' : 'Schritte'} diese Woche, Gewohnheit verankert. Das Ziel ist in Bewegung.`);
        return out;
    }

    /* ---------- 5 ---------- */
    function renderReview() {
        const s = S.smart; const p = progress(); const d = s.t ? days(s.t) : null; const sc = smartScore(); const cat = CATS[S.category];
        const nextM = S.milestones.filter(m => tr(m.text) && !m.done).sort((a, b) => (a.date || '9').localeCompare(b.date || '9'))[0];
        const nextA = S.actions.filter(a => tr(a.text) && !a.done).sort((a, b) => (a.date || '9').localeCompare(b.date || '9'))[0];
        const lastC = S.checkins[S.checkins.length - 1]; const dueC = !lastC || (Date.now() - lastC.date) / 864e5 >= 6;
        $('gs-review').innerHTML = `<div class="mk-result gs-over"><div class="gs-over-h">${cat ? `<span>${cat[0]}</span>` : ''}<h4>${esc(S.title || 'Noch kein Ziel')}</h4></div>${sentence() ? `<p class="gs-sent">${esc(sentence())}</p>` : ''}<div class="gs-kpis"><div><b>${p === null ? '–' : p + ' %'}</b><span>Fortschritt</span></div><div><b>${d === null ? '–' : d < 0 ? 'vorbei' : d}</b><span>Tage übrig</span></div><div><b>${sc}/5</b><span>SMART</span></div><div><b>${S.milestones.filter(m => m.done).length}/${S.milestones.filter(m => tr(m.text)).length}</b><span>Meilensteine</span></div></div>${nextM ? `<div class="gs-next"><small>Nächster Meilenstein</small><b>${esc(nextM.text)}</b>${nextM.date ? `<em>${fmtD(nextM.date)}${days(nextM.date) < 0 ? ' · überfällig' : ''}</em>` : ''}</div>` : ''}${nextA ? `<div class="gs-next"><small>Nächster Schritt</small><b>${esc(nextA.text)}</b>${nextA.date ? `<em>${fmtD(nextA.date)}</em>` : ''}</div>` : ''}</div>` + reviewNote(p, d) +
            `<div class="mk-section-label" style="margin-top:16px">Wochen-Check-in ${dueC ? '<span class="mk-badge" style="margin-left:6px">fällig</span>' : ''}</div><div class="gs-ci"><div class="mk-field"><label>Was ist diese Woche passiert – Richtung Ziel?</label><input class="mk-input" id="gs-ci-done" placeholder="Konkret, auch wenn es klein war"></div><div class="mk-field"><label>Was hat gebremst?</label><input class="mk-input" id="gs-ci-block" placeholder="Ehrlich – das wird nächste Woche ein Wenn-dann"></div><div class="mk-range-wrap"><label>Zuversicht heute</label><input type="range" class="mk-range" min="1" max="10" value="${n(s.conf, 7)}" id="gs-ci-conf"><span class="mk-range-val" id="gs-ci-cv">${n(s.conf, 7)}</span></div><button class="mk-btn mk-btn-primary mk-btn-sm" id="gs-ci-save"><i class="fas fa-check"></i> Check-in speichern</button></div>` +
            (S.checkins.length ? `<div class="gs-cis">${S.checkins.slice().reverse().slice(0, 6).map(c => `<div class="gs-c"><small>${new Date(c.date).toLocaleDateString('de-CH')} · Zuversicht ${c.conf}</small><div>${esc(c.done)}</div>${c.block ? `<div class="mk-faint">Gebremst: ${esc(c.block)}</div>` : ''}</div>`).join('')}</div>` + confTrend() : '');
        $('gs-ci-conf').addEventListener('input', e => $('gs-ci-cv').textContent = e.target.value);
        $('gs-ci-save').addEventListener('click', () => { const done = tr($('gs-ci-done').value); if (!done) { MethodKit.toast('Was ist passiert? Auch „nichts" ist eine Antwort.', 'warn'); return; } S.checkins.push({ id: MethodKit.uid(), date: Date.now(), done, block: tr($('gs-ci-block').value), conf: n($('gs-ci-conf').value, 7) }); MethodKit.save({ now: true }); MethodKit.toast('Check-in gespeichert', 'ok'); renderReview(); });
    }
    function reviewNote(p, d) {
        let out = ''; if (!tr(S.title)) return note('info', 'Noch kein Ziel – fang in Schritt 1 an.');
        if (d !== null && d > 0 && p !== null && S.milestones.filter(m => tr(m.text)).length >= 2) { const total = (new Date(S.smart.t) - S.created) / 864e5; const elapsed = total > 1 ? Math.min(100, Math.max(0, (total - d) / total * 100)) : null; if (elapsed !== null && elapsed > 40 && p < elapsed - 25) out += note('warn', `${Math.round(elapsed)} % der Zeit sind um, aber ${p} % Fortschritt. Entweder das Zieldatum anpassen oder diese Woche einen grossen Schritt machen – nicht beides aussitzen.`); else if (elapsed !== null && elapsed >= 10 && p > elapsed + 20 && p < 100) out += note('ok', `${p} % Fortschritt bei ${Math.round(elapsed)} % der Zeit – du bist vor dem Plan.`); }
        if (p === 100) out += note('ok', 'Alle Meilensteine und Schritte erledigt. Feiern – und dann: Was ist das nächste Ziel, das daraus folgt?');
        if (d !== null && d < 0 && p !== null && p < 100) out += note('warn', 'Das Zieldatum ist vorbei. Nicht schlimm – aber entscheide jetzt: neues Datum oder Ziel bewusst ablegen. Ein stilles Auslaufen ist das Schlimmste für die nächste Zielsetzung.');
        const ov = S.milestones.filter(m => tr(m.text) && !m.done && m.date && days(m.date) < 0); if (ov.length && d >= 0) out += note('info', `${ov.length} ${ov.length === 1 ? 'Meilenstein ist' : 'Meilensteine sind'} überfällig – abhaken oder neu datieren.`);
        return out;
    }
    function confTrend() { const C = S.checkins; if (C.length < 3) return ''; const last3 = C.slice(-3).map(c => c.conf); if (last3[2] < last3[0] && last3[2] < last3[1]) return note('info', `Zuversicht sinkt (${last3.join(' → ')}). Das ist kein Charakterproblem, sondern ein Signal: Ziel zu gross, Schritte zu vage, oder das Warum trägt nicht. Prüf Schritt 1 und 2 noch mal.`); if (last3[2] > last3[0] && last3[2] > last3[1]) return note('ok', `Zuversicht steigt (${last3.join(' → ')}) – Fortschritt macht Mut.`); const blocks = C.slice(-4).map(c => (c.block || '').toLowerCase()).filter(Boolean); const rep = blocks.find((b, i) => blocks.slice(i + 1).some(o => o && (o.includes(b.slice(0, 12)) || b.includes(o.slice(0, 12))))); return rep ? note('info', `„${esc(rep)}" bremst wiederholt. Das gehört als Wenn-dann-Plan in Schritt 3.`) : ''; }
    function renderLinks() { $('gs-links').innerHTML = LINKS.map(x => `<a class="mk-option gs-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const s = S.smart; const cat = CATS[S.category];
        const L = ['MEIN ZIELPLAN', '='.repeat(40), 'Erstellt: ' + new Date().toLocaleDateString('de-CH'), '', `ZIEL${cat ? ` (${cat[1]})` : ''}: ${S.title}`, sentence(), '', 'WARUM', S.why || '–', S.why2 ? `Dahinter: ${S.why2}` : '', '', 'SMART', `S: ${s.s || '–'}`, `M: ${s.m || '–'}`, `A: Zuversicht ${n(s.conf, '–')}/10`, `R: ${s.r || '–'}`, `T: ${fmtD(s.t)}`, `Score: ${smartScore()}/5`];
        const ms = S.milestones.filter(m => tr(m.text)); if (ms.length) { L.push('', 'MEILENSTEINE'); ms.forEach(m => L.push(`${m.done ? '[x]' : '[ ]'} ${m.text}${m.date ? ` (${fmtD(m.date)})` : ''}`)); }
        const ob = S.obstacles.filter(o => tr(o.if)); if (ob.length) { L.push('', 'WENN-DANN-PLÄNE'); ob.forEach(o => L.push(`Wenn ${o.if}, dann ${o.then || '…'}`)); }
        const A = S.actions.filter(a => tr(a.text)); if (A.length) { L.push('', 'NÄCHSTE SCHRITTE'); A.forEach(a => L.push(`${a.done ? '[x]' : '[ ]'} ${a.text}${a.date ? ` (${fmtD(a.date)})` : ''}`)); }
        const H = S.habits.filter(h => tr(h.action)); if (H.length) { L.push('', 'GEWOHNHEIT'); H.forEach(h => L.push(`Nachdem ${h.anchor}, werde ich ${h.action}.`)); }
        if (S.checkins.length) { L.push('', 'CHECK-INS'); S.checkins.forEach(c => L.push(`${new Date(c.date).toLocaleDateString('de-CH')} · Zuversicht ${c.conf} · ${c.done}${c.block ? ` · Gebremst: ${c.block}` : ''}`)); }
        const p = progress(); if (p !== null) L.push('', `Fortschritt: ${p} %`);
        MethodKit.exportText('zielplan.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'goal-setting', accent: '#f59e0b', accent2: '#f97316',
            steps: [{ icon: '🎯', label: 'Ziel' }, { icon: '🔍', label: 'SMART' }, { icon: '🛤️', label: 'Weg' }, { icon: '👣', label: 'Schritte' }, { icon: '📊', label: 'Review' }],
            defaultState: { title: '', why: '', why2: '', category: '', smart: { s: '', m: '', conf: '', r: '', t: '' }, milestones: [], obstacles: [], actions: [], habits: [], checkins: [] }
        });
        S = MethodKit.state;
        if (!S.smart || typeof S.smart !== 'object') { S.smart = { s: S.s || '', m: S.m || '', conf: '', r: S.r || '', t: S.t || '' }; if (S.a) S.smart.r = [S.a, S.smart.r].filter(Boolean).join(' · '); ['s', 'm', 'a', 'r', 't'].forEach(k => delete S[k]); }
        if (S.smart.t && !/^\d{4}-\d{2}-\d{2}$/.test(S.smart.t)) { const d = Date.parse(S.smart.t); S.smart.t = isNaN(d) ? '' : new Date(d).toISOString().slice(0, 10); }
        ['milestones', 'obstacles', 'actions', 'habits', 'checkins'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        S.actions = S.actions.map(a => Object.assign({ id: MethodKit.uid(), text: '', date: '', done: false }, a)); S.habits = S.habits.map(h => Object.assign({ id: MethodKit.uid(), anchor: '', action: '' }, h));
        if (S.why2 === undefined) S.why2 = ''; if (!S.created) S.created = Date.now();
        $('gs-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) renderGoal();
            if (k === 2) renderSmart();
            if (k === 3) renderPath();
            if (k === 4) renderSteps();
            if (k === 5) { renderReview(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
