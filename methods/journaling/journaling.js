/* Journaling · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S, timer = null, tLeft = 0;

    const MODES = {
        morning: { ic: '🌅', t: 'Morgenseiten', d: 'Drei Seiten, ungefiltert, ohne Absetzen. Kopf leeren, bevor der Tag ihn füllt.', c: '#f59e0b', p: ['Schreib einfach los – was ist gerade im Kopf?', 'Was will ich heute wirklich – jenseits der To-do-Liste?', 'Was macht mir heute Sorge, und was davon kann ich beeinflussen?', 'Wie fühlt sich mein Körper gerade an?'] },
        evening: { ic: '🌙', t: 'Abendreflexion', d: 'Den Tag sortieren, bevor er sich im Schlaf festsetzt.', c: '#6366f1', p: ['Was ist heute gut gelaufen – und was habe ich dazu beigetragen?', 'Was hat mich heute geärgert, und was sagt das über mich?', 'Was lasse ich heute bewusst liegen?', 'Welcher Moment heute war echt?', 'Was würde ich heute anders machen?'] },
        gratitude: { ic: '🙏', t: 'Dankbarkeit', d: 'Drei konkrete Dinge. Nicht „meine Familie", sondern „wie meine Tochter heute gelacht hat".', c: '#10b981', p: ['Drei Dinge, für die ich heute dankbar bin – so konkret wie möglich.', 'Wer hat mir heute etwas Gutes getan, ohne es zu müssen?', 'Was habe ich heute als selbstverständlich genommen, das es nicht ist?', 'Was hat mir heute Freude gemacht, das nichts gekostet hat?'] },
        free: { ic: '✍️', t: 'Frei', d: 'Kein Impuls, keine Regel. Du weisst, worum es geht.', c: '#22c55e', p: [''] },
        prompt: { ic: '💡', t: 'Impuls', d: 'Eine Frage, die tiefer geht als der Alltag.', c: '#ec4899', p: ['Was würde ich tun, wenn ich keine Angst hätte?', 'Welche Geschichte erzähle ich mir über mich, die nicht mehr stimmt?', 'Was will ich in einem Jahr über heute sagen können?', 'Wem müsste ich etwas sagen – und was?', 'Was beneide ich an anderen, und was verrät mir das über meine Wünsche?', 'Wofür würde ich mich in zehn Jahren danken?', 'Was vermeide ich gerade – und was kostet mich das?', 'Wann war ich zuletzt ganz bei mir? Was war da anders?'] }
    };
    const MOOD = ['😞', '😕', '😐', '🙂', '😄'];
    const STOP = new Set('aber alle allem allen aller alles also auch auf aus bei bin bis bist dann das dass dem den der des die dies diese diesem diesen dieser dieses doch dort durch ein eine einem einen einer eines er es etwas euch für gegen gewesen hab habe haben hat hatte hatten hier hin hinter ich ihm ihn ihnen ihr ihre ihrem ihren ihrer ihres im immer in indem ins ist ja jede jedem jeden jeder jedes jetzt kann kein keine keinem keinen keiner keines könnte machen man mehr mein meine meinem meinen meiner meines mich mir mit muss musste nach nicht nichts noch nun nur ob oder ohne sehr sein seine seinem seinen seiner seines selbst sich sie sind so solche sollte sondern sonst über um und uns unse unser unsere unserem unseren unserer unseres unter viel vom von vor war waren warst was weil weiter welche welchem welchen welcher welches wenn werde werden wie wieder will wir wird wirst wo wollen wollte würde würden zu zum zur zwar zwischen heute morgen gestern einfach eigentlich wirklich mal schon dabei dafür damit darauf daran dazu denn dessen deshalb deren eben etwa gerade ganz gar genau gut halt kommt kommen lassen lässt macht mache machte geht gehen ging gibt gab sagen sagt sagte seit sowie trotzdem vielleicht wäre weniger wurde wurden zwei drei vier fünf'.split(' '));
    const POS = /\b(dankbar|froh|freu\w*|glücklich|zufrieden|stolz|ruhig|gelassen|leicht|erleichtert|liebe|lachen|gelacht|schön|wunderbar|energie|kraft|klar|frei|verbunden|gut|besser|gelungen|geschafft|mutig|hoffnung|neugierig|inspiriert|warm|wohl)\w*/gi;
    const NEG = /(?<![a-zäöüß])(angst|sorge\w*|müde|erschöpft|traurig|wütend|ärger\w*|genervt|frustriert|allein|einsam|überfordert|druck|stress\w*|schwer|schlecht|schlimm|hilflos|leer|zweifel\w*|scham|schuld\w*|verletzt|enttäuscht|unsicher|panik|nervös|streit|verloren)\w*/gi;
    const LINKS = [
        { m: 'Emotionale Intelligenz', l: '../emotional-intelligence/emotional-intelligence.html', why: 'Das Gefühlstagebuch mit präzisen Wörtern.' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Das Schreiben zur täglichen Routine machen.' },
        { m: 'Achtsamkeit', l: '../mindfulness/mindfulness.html', why: 'Wahrnehmen, bevor du schreibst.' },
        { m: 'Werte-Kompass', l: '../values-clarification/values-clarification.html', why: 'Wenn ein Thema immer wiederkommt: Welcher Wert steckt dahinter?' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const words = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;
    const dayKey = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
    const M = (k) => MODES[k] || MODES.free;
    function streak() { const days = new Set(S.entries.map(e => dayKey(e.date))); let s = 0; const d = new Date(); if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1); while (days.has(dayKey(d))) { s++; d.setDate(d.getDate() - 1); } return s; }
    function themes(entries, k) { const f = {}; entries.forEach(e => (e.text || '').toLowerCase().replace(/[^a-zäöüß\s-]/g, ' ').split(/\s+/).forEach(w => { if (w.length >= 4 && !STOP.has(w)) f[w] = (f[w] || 0) + 1; })); return Object.entries(f).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, k || 8); }
    const emo = (t) => ({ p: ((t || '').match(POS) || []).length, n: ((t || '').match(NEG) || []).length });

    /* ---------- 1 ---------- */
    function renderWrite() {
        const D = S.draft, m = M(D.mode); const prompts = m.p.filter(Boolean); const prompt = prompts.length ? prompts[n(D.pi, 0) % prompts.length] : '';
        const w = words(D.text);
        $('jo-write').innerHTML = `<div class="jo-modes">${Object.entries(MODES).map(([k, x]) => `<button class="jo-mode ${D.mode === k ? 'on' : ''}" style="--c:${x.c}" data-mode="${k}"><span>${x.ic}</span><b>${x.t}</b></button>`).join('')}</div><p class="mk-sub">${m.d}</p>` +
            (prompt ? `<div class="jo-prompt" style="--c:${m.c}"><span>${esc(prompt)}</span>${prompts.length > 1 ? `<button class="mk-iconbtn" id="jo-next-p" aria-label="Anderer Impuls" title="Anderer Impuls"><i class="fas fa-shuffle"></i></button>` : ''}</div>` : '') +
            `<div class="jo-mood"><span>Stimmung jetzt</span><div>${MOOD.map((f, i) => `<button class="${D.before === i + 1 ? 'on' : ''}" data-mb="${i + 1}" aria-label="Stimmung ${i + 1}">${f}</button>`).join('')}</div></div>` +
            `<textarea class="mk-textarea jo-ta" id="jo-text" rows="8" placeholder="${D.mode === 'morning' ? 'Nicht nachdenken. Schreiben. Auch „ich weiss nicht, was ich schreiben soll" zählt.' : 'Schreib, wie du sprichst. Niemand liest mit.'}">${esc(D.text || '')}</textarea>` +
            `<div class="jo-bar"><span id="jo-wc">${w} Wörter</span><div class="jo-timer">${timer ? `<b id="jo-tl">${fmt(tLeft)}</b><button class="mk-btn mk-btn-outline mk-btn-sm" id="jo-tstop">Stopp</button>` : `<button class="mk-btn mk-btn-outline mk-btn-sm" id="jo-t5"><i class="fas fa-stopwatch"></i> 5-Min-Sprint</button><button class="mk-btn mk-btn-outline mk-btn-sm" id="jo-t10">10 Min</button>`}</div></div>` +
            (w >= 20 ? `<div class="jo-mood"><span>Stimmung danach</span><div>${MOOD.map((f, i) => `<button class="${D.after === i + 1 ? 'on' : ''}" data-ma="${i + 1}" aria-label="Stimmung danach ${i + 1}">${f}</button>`).join('')}</div></div>` : '') +
            writeNote(D, w) + `<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:10px"><button class="mk-btn mk-btn-primary" id="jo-save" ${w >= 5 ? '' : 'disabled'}><i class="fas fa-check"></i> Eintrag speichern</button><span class="mk-faint">${S.entries.length ? `${S.entries.length} Einträge · 🔥 ${streak()} Tage` : 'Noch kein Eintrag'}</span></div>`;
        const host = $('jo-write');
        host.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { D.mode = b.dataset.mode; D.pi = Math.floor(Math.random() * 10); MethodKit.save(); renderWrite(); }));
        const np = $('jo-next-p'); if (np) np.addEventListener('click', () => { D.pi = n(D.pi, 0) + 1; MethodKit.save(); renderWrite(); });
        host.querySelectorAll('[data-mb]').forEach(b => b.addEventListener('click', () => { D.before = +b.dataset.mb; MethodKit.save(); renderWrite(); }));
        host.querySelectorAll('[data-ma]').forEach(b => b.addEventListener('click', () => { D.after = +b.dataset.ma; MethodKit.save(); renderWrite(); }));
        const ta = $('jo-text'); ta.addEventListener('input', () => { D.text = ta.value; const w2 = words(ta.value); $('jo-wc').textContent = w2 + ' Wörter'; $('jo-save').disabled = w2 < 5; MethodKit.save(); if ((w2 >= 20) !== (w >= 20)) renderWrite(); });
        const t5 = $('jo-t5'), t10 = $('jo-t10'), ts = $('jo-tstop'); if (t5) t5.addEventListener('click', () => startTimer(300)); if (t10) t10.addEventListener('click', () => startTimer(600)); if (ts) ts.addEventListener('click', stopTimer);
        $('jo-save').addEventListener('click', saveEntry);
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    function startTimer(sec) { tLeft = sec; stopTimer(false); timer = setInterval(() => { tLeft--; const el = $('jo-tl'); if (el) el.textContent = fmt(tLeft); if (tLeft <= 0) { stopTimer(); MethodKit.toast('Sprint vorbei – noch den Satz zu Ende, dann speichern', 'ok'); } }, 1000); renderWrite(); $('jo-text').focus(); }
    function stopTimer(rerender) { if (timer) clearInterval(timer); timer = null; if (rerender !== false) renderWrite(); }
    function writeNote(D, w) {
        if (!w) return '';
        const t = D.text || '';
        if (D.mode === 'morning' && w < 150) return note('info', `${w} Wörter. Morgenseiten leben von der Menge – Ziel sind 300+, ohne Pause. Der Kopf wird erst leer, wenn der Zensor aufgibt.`);
        if (D.mode === 'gratitude' && !/\b(heute|gestern|als|wie|weil)\b/i.test(t) && w > 10) return note('info', 'Noch allgemein. Dankbarkeit wirkt, wenn sie konkret ist: Was genau, wann, wie hat es sich angefühlt?');
        const q = (t.match(/\?/g) || []).length;
        if (q >= 4 && w < 120) return note('info', `${q} Fragen, wenig Antworten. Nimm eine davon und schreib drei Sätze, die mit „Vielleicht …" beginnen.`);
        const you = (t.match(/\b(man|du)\b/gi) || []).length, me = (t.match(/\b(ich|mir|mich)\b/gi) || []).length;
        if (w > 60 && you > me) return note('info', 'Viel „man" und „du", wenig „ich". Das hält auf Abstand. Was ist mit dir?');
        const e = emo(t);
        if (w > 50 && e.n >= 3 && !/\b(brauche|wünsche|möchte|will|könnte|werde|nächster? schritt)\b/i.test(t)) return note('info', 'Viel Belastung im Text – gut, dass es raus ist. Zum Schluss ein Satz: „Was ich jetzt brauche, ist …"');
        if (w >= 100 && D.after && D.before && D.after > D.before) return note('ok', `Stimmung von ${MOOD[D.before - 1]} auf ${MOOD[D.after - 1]} – das Schreiben hat gewirkt.`);
        if (w >= 100) return note('ok', `${w} Wörter. Trag die Stimmung danach ein – der Unterschied ist der eigentliche Messwert.`);
        return '';
    }
    function saveEntry() {
        const D = S.draft; const w = words(D.text); if (w < 5) return;
        const m = M(D.mode); const prompts = m.p.filter(Boolean);
        S.entries.push({ id: MethodKit.uid(), date: Date.now(), mode: D.mode || 'free', prompt: prompts.length ? prompts[n(D.pi, 0) % prompts.length] : '', text: D.text.trim(), before: D.before || 0, after: D.after || 0, words: w });
        const lift = D.after && D.before ? D.after - D.before : 0;
        S.draft = { mode: D.mode, pi: n(D.pi, 0) + 1, text: '', before: 0, after: 0 };
        MethodKit.save({ now: true }); MethodKit.toast(lift > 0 ? `Gespeichert · Stimmung +${lift}` : `Gespeichert · 🔥 ${streak()} Tage`, 'ok'); renderWrite();
    }

    /* ---------- 2 ---------- */
    function renderStats() {
        const E = S.entries; if (E.length < 3) { $('jo-stats').innerHTML = note('info', `${E.length} Einträge. Muster zeigen sich ab etwa drei – schreib weiter.`); return; }
        const tw = E.reduce((a, e) => a + (e.words || words(e.text)), 0), withMood = E.filter(e => e.before && e.after), lift = withMood.length ? withMood.reduce((a, e) => a + e.after - e.before, 0) / withMood.length : null;
        const byMode = {}; E.forEach(e => { const k = e.mode || 'free'; byMode[k] = byMode[k] || { n: 0, lift: 0, nl: 0, w: 0 }; byMode[k].n++; byMode[k].w += e.words || words(e.text); if (e.before && e.after) { byMode[k].lift += e.after - e.before; byMode[k].nl++; } });
        const best = Object.entries(byMode).filter(([, v]) => v.nl >= 2).sort((a, b) => b[1].lift / b[1].nl - a[1].lift / a[1].nl)[0];
        const th = themes(E); const recent = E.slice(-7), older = E.slice(0, -7);
        const er = recent.reduce((a, e) => { const x = emo(e.text); a.p += x.p; a.n += x.n; return a; }, { p: 0, n: 0 }), eo = older.reduce((a, e) => { const x = emo(e.text); a.p += x.p; a.n += x.n; return a; }, { p: 0, n: 0 });
        const ratio = (x) => (x.p + x.n) ? Math.round(x.p / (x.p + x.n) * 100) : null;
        const wd = [0, 0, 0, 0, 0, 0, 0]; E.forEach(e => wd[new Date(e.date).getDay()]++); const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        const hours = E.map(e => new Date(e.date).getHours()); const morningShare = hours.filter(h => h < 12).length / E.length;
        $('jo-stats').innerHTML = `<div class="jo-stats"><div><b>${E.length}</b><span>Einträge</span></div><div><b>${streak()}</b><span>Tage Streak</span></div><div><b>${Math.round(tw / E.length)}</b><span>Ø Wörter</span></div><div><b>${lift === null ? '–' : (lift > 0 ? '+' : '') + lift.toFixed(1)}</b><span>Ø Stimmung</span></div></div>` +
            `<div class="mk-section-label">Modi</div><div class="jo-modestats">${Object.entries(byMode).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `<div style="--c:${M(k).c}"><span>${M(k).ic}</span><b>${M(k).t}</b><small>${v.n}× · Ø ${Math.round(v.w / v.n)} W.${v.nl ? ` · Stimmung ${v.lift === 0 ? '±0' : (v.lift / v.nl > 0 ? '+' : '') + (v.lift / v.nl).toFixed(1)}` : ''}</small></div>`).join('')}</div>` +
            (th.length ? `<div class="mk-section-label">Themen, die wiederkommen</div><div class="jo-themes">${th.map(([w, c]) => `<button class="mk-chip" data-theme="${esc(w)}" style="font-size:${12 + Math.min(c, 6)}px">${esc(w)} <small>${c}</small></button>`).join('')}</div>` : '') +
            `<div class="mk-section-label">Wochentage</div><div class="jo-wd">${WD.map((d, i) => `<div><i style="height:${Math.max(3, wd[i] / Math.max(...wd) * 40)}px"></i><span>${d}</span></div>`).join('')}</div>` +
            statsNote({ E, lift, best, th, ratio, er, eo, morningShare, byMode });
        $('jo-stats').querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => { S.deep.theme = b.dataset.theme; MethodKit.save(); MethodKit.goTo(4); }));
    }
    function statsNote(x) {
        let out = '';
        if (x.best && x.best[1].lift / x.best[1].nl >= 0.8) out += note('ok', `<strong>${M(x.best[0]).t}</strong> bringt dir am meisten: Stimmung im Schnitt +${(x.best[1].lift / x.best[1].nl).toFixed(1)}. Wenn es dir schlecht geht, ist das dein Modus.`);
        if (x.lift !== null && x.lift <= 0 && x.E.filter(e => e.before && e.after).length >= 4) out += note('info', 'Die Stimmung steigt beim Schreiben nicht. Prüf: Kreist du oder sortierst du? Grübeln in Schriftform hilft nicht – ein Satz „Was ich jetzt brauche" am Ende schon.');
        const rr = x.ratio(x.er), ro = x.ratio(x.eo);
        if (rr !== null && ro !== null && x.eo.p + x.eo.n >= 5) { if (rr - ro >= 20) out += note('ok', `Der Ton hat sich aufgehellt: ${ro} % → ${rr} % positive Gefühlswörter in den letzten Einträgen.`); else if (ro - rr >= 20) out += note('warn', `Die letzten Einträge sind deutlich schwerer als früher (${ro} % → ${rr} % positiv). Nimm das ernst – und sprich mit jemandem, nicht nur mit dem Papier.`); }
        if (x.th.length && x.th[0][1] >= 4) out += note('info', `„<strong>${esc(x.th[0][0])}</strong>" taucht ${x.th[0][1]}× auf. Ein Thema, das so oft wiederkommt, ist nicht erledigt. Tipp auf das Wort – Schritt 4 geht dem nach.`);
        if (Object.keys(x.byMode).length === 1 && x.E.length >= 6) out += note('info', `Du schreibst immer im selben Modus (${M(Object.keys(x.byMode)[0]).t}). Probier einen anderen – Dankbarkeit und Morgenseiten wirken völlig verschieden.`);
        if (x.morningShare >= 0.8 && x.E.length >= 5 && !x.byMode.evening) out += note('info', 'Du schreibst fast nur morgens. Ein Abendeintrag ab und zu schliesst den Tag – und du schläfst besser.');
        return out || note('ok', 'Weiter sammeln – je mehr Einträge, desto klarer die Muster.');
    }

    /* ---------- 3 ---------- */
    function renderLog() {
        const E = [...S.entries].reverse(); const f = S.filter || {}; const list = E.filter(e => (!f.mode || e.mode === f.mode) && (!f.q || (e.text || '').toLowerCase().includes(f.q.toLowerCase())));
        $('jo-log').innerHTML = `<div class="jo-filter"><input class="mk-input" id="jo-q" value="${esc(f.q || '')}" placeholder="Suchen …"><div class="mk-chips"><button class="mk-chip ${!f.mode ? 'selected' : ''}" data-fm="">Alle</button>${Object.entries(MODES).map(([k, x]) => `<button class="mk-chip ${f.mode === k ? 'selected' : ''}" data-fm="${k}">${x.ic} ${x.t}</button>`).join('')}</div></div>` +
            (!list.length ? '<div class="mk-empty">Keine Einträge.</div>' : list.map(e => { const open = S.open === e.id; const m = M(e.mode); return `<div class="jo-e ${open ? 'open' : ''}" style="--c:${m.c}"><button class="jo-e-h" data-open="${e.id}"><span>${m.ic}</span><div><b>${new Date(e.date).toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · ${new Date(e.date).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</b><small>${esc((e.text || '').slice(0, open ? 0 : 110))}${!open && (e.text || '').length > 110 ? '…' : ''}</small></div><em>${e.before ? MOOD[e.before - 1] : ''}${e.before && e.after ? '→' + MOOD[e.after - 1] : ''}</em></button>${open ? `<div class="jo-e-b">${e.prompt ? `<div class="jo-e-p">${esc(e.prompt)}</div>` : ''}<p>${esc(e.text).replace(/\n/g, '<br>')}</p><div class="jo-e-f"><span class="mk-faint">${e.words || words(e.text)} Wörter</span><button class="mk-btn mk-btn-outline mk-btn-sm" data-deep="${e.id}"><i class="fas fa-magnifying-glass"></i> Vertiefen</button><button class="mk-btn mk-btn-danger mk-btn-sm" data-del="${e.id}"><i class="fas fa-trash"></i></button></div></div>` : ''}</div>`; }).join(''));
        const host = $('jo-log');
        $('jo-q').addEventListener('input', e => { S.filter = S.filter || {}; S.filter.q = e.target.value; MethodKit.save(); renderLog(); const i = $('jo-q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); });
        host.querySelectorAll('[data-fm]').forEach(b => b.addEventListener('click', () => { S.filter = S.filter || {}; S.filter.mode = b.dataset.fm; MethodKit.save(); renderLog(); }));
        host.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { S.open = S.open === b.dataset.open ? '' : b.dataset.open; MethodKit.save(); renderLog(); }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { if (!confirm('Eintrag löschen?')) return; S.entries = S.entries.filter(e => e.id !== b.dataset.del); MethodKit.save(); renderLog(); }));
        host.querySelectorAll('[data-deep]').forEach(b => b.addEventListener('click', () => { const e = S.entries.find(x => x.id === b.dataset.deep); S.deep.entry = e.id; S.deep.theme = ''; MethodKit.save(); MethodKit.goTo(4); }));
    }

    /* ---------- 4 ---------- */
    function renderDeep() {
        const D = S.deep; const th = themes(S.entries, 10); const entry = D.entry ? S.entries.find(e => e.id === D.entry) : null;
        const related = D.theme ? S.entries.filter(e => (e.text || '').toLowerCase().includes(D.theme)) : [];
        $('jo-deep').innerHTML = `<div class="mk-field"><label>Welches Thema?</label><div class="mk-chips">${th.map(([w, c]) => `<button class="mk-chip ${D.theme === w ? 'selected' : ''}" data-th="${esc(w)}">${esc(w)} <small>${c}</small></button>`).join('')}<input class="mk-input jo-th-in" id="jo-th-custom" value="${th.some(([w]) => w === D.theme) ? '' : esc(D.theme || '')}" placeholder="oder eigenes Thema …"></div></div>` +
            (entry ? `<div class="jo-e-p">Ausgangspunkt: Eintrag vom ${new Date(entry.date).toLocaleDateString('de-CH')}<br><small>${esc(entry.text.slice(0, 200))}${entry.text.length > 200 ? '…' : ''}</small></div>` : '') +
            (related.length ? `<div class="jo-rel">${related.slice(-3).reverse().map(e => { const i = e.text.toLowerCase().indexOf(D.theme); const s = Math.max(0, i - 60); return `<div><small>${new Date(e.date).toLocaleDateString('de-CH')}</small>…${esc(e.text.slice(s, i))}<mark>${esc(e.text.slice(i, i + D.theme.length))}</mark>${esc(e.text.slice(i + D.theme.length, i + D.theme.length + 60))}…</div>`; }).join('')}</div>` : '') +
            ((D.theme || entry) ? `<div class="mk-field"><label>1 · Was ist der Kern? Worum geht es wirklich – unter dem, was ich schreibe?</label><textarea class="mk-textarea" data-dq="core" rows="2">${esc(D.core || '')}</textarea></div><div class="mk-field"><label>2 · Was brauche ich – nicht: was sollen andere tun?</label><textarea class="mk-textarea" data-dq="need" rows="2">${esc(D.need || '')}</textarea></div><div class="mk-field"><label>3 · Ein kleiner Schritt in den nächsten drei Tagen</label><input class="mk-input" data-dq="step" value="${esc(D.step || '')}" placeholder="Konkret: Was, wann, mit wem?"></div>${deepNote(D)}<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center"><button class="mk-btn mk-btn-primary" id="jo-deep-save" ${(D.core || '').trim() && (D.step || '').trim() ? '' : 'disabled'}><i class="fas fa-check"></i> Vertiefung speichern</button></div>` : note('info', 'Wähle ein Thema aus deinen Einträgen – oder gib eines ein.')) +
            (S.reflections.length ? `<div class="mk-section-label" style="margin-top:16px">Bisherige Vertiefungen</div>${S.reflections.slice().reverse().slice(0, 5).map(r => `<div class="jo-refl"><b>${esc(r.theme || 'Eintrag')}</b> <small>${new Date(r.date).toLocaleDateString('de-CH')}</small><div>${esc(r.core)}</div>${r.step ? `<div class="mk-faint">→ ${esc(r.step)}</div>` : ''}</div>`).join('')}` : '');
        const host = $('jo-deep');
        host.querySelectorAll('[data-th]').forEach(b => b.addEventListener('click', () => { D.theme = D.theme === b.dataset.th ? '' : b.dataset.th; D.entry = ''; MethodKit.save(); renderDeep(); }));
        $('jo-th-custom').addEventListener('change', e => { D.theme = e.target.value.trim().toLowerCase(); D.entry = ''; MethodKit.save(); renderDeep(); });
        host.querySelectorAll('[data-dq]').forEach(el => { el.addEventListener('input', () => { D[el.dataset.dq] = el.value; MethodKit.save(); const b = $('jo-deep-save'); if (b) b.disabled = !((D.core || '').trim() && (D.step || '').trim()); }); el.addEventListener('change', renderDeep); });
        const sv = $('jo-deep-save'); if (sv) sv.addEventListener('click', () => { S.reflections.push({ id: MethodKit.uid(), date: Date.now(), theme: D.theme, entry: D.entry, core: D.core, need: D.need, step: D.step }); S.deep = { theme: '', entry: '', core: '', need: '', step: '' }; MethodKit.save({ now: true }); MethodKit.toast('Vertiefung gespeichert', 'ok'); renderDeep(); });
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function deepNote(D) {
        const c = (D.core || '').trim(), nd = (D.need || '').trim(), s = (D.step || '').trim();
        if (!c) return '';
        if (c.length < 25) return note('info', 'Noch an der Oberfläche. Frag „Und worum geht es dabei wirklich?" – zweimal.');
        if (nd && /\b(er|sie|man|andere|chef|partner|kollege|mein mann|meine frau)\b.*\b(soll|sollte|muss|müsste)\b/i.test(nd)) return note('info', 'Das ist, was andere tun sollen. Was brauchst <em>du</em> – unabhängig davon, ob sie es tun?');
        if (s && /(?<![a-zäöüß])(überlegen|nachdenken|schauen|versuchen|mehr|weniger)\b/i.test(s) && s.length < 50) return note('info', '„Überlegen / versuchen / mehr" ist kein Schritt. Was tust du konkret, wann?');
        if (c && nd && s) return note('ok', 'Kern, Bedürfnis, Schritt – das Thema hat jetzt eine Richtung.');
        return '';
    }

    /* ---------- 5 ---------- */
    function renderRitual() {
        const R = S.ritual || {}; const E = S.entries;
        $('jo-ritual').innerHTML = `<p class="mk-sub">Journaling wirkt durch Regelmässigkeit, nicht durch Länge. Wann ist dein Platz dafür?</p><div class="mk-chips">${[['morning', '🌅 Morgens, vor dem Handy'], ['lunch', '☀️ Mittagspause'], ['evening', '🌙 Abends, vor dem Schlafen'], ['weekly', '📅 Sonntags, länger']].map(([k, t]) => `<button class="mk-chip ${R.slot === k ? 'selected' : ''}" data-slot="${k}">${t}</button>`).join('')}</div><div class="mk-field" style="margin-top:12px"><label>Mindestmass an schlechten Tagen</label><input class="mk-input" id="jo-min" value="${esc(R.min || '')}" placeholder="z. B. drei Sätze – mehr nicht"></div>` +
            `<div class="mk-result"><h4>Dein Journal</h4><div class="jo-stats small"><div><b>${E.length}</b><span>Einträge</span></div><div><b>${streak()}</b><span>Tage Streak</span></div><div><b>${E.reduce((a, e) => a + (e.words || words(e.text)), 0).toLocaleString('de-CH')}</b><span>Wörter</span></div><div><b>${S.reflections.length}</b><span>Vertiefungen</span></div></div>${E.length ? `<div class="mk-faint" style="font-size:13px">Seit ${new Date(Math.min(...E.map(e => e.date))).toLocaleDateString('de-CH')} · Lieblingsmodus: ${M(Object.entries(E.reduce((a, e) => { a[e.mode] = (a[e.mode] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1])[0][0]).t}</div>` : ''}</div>` +
            (R.slot && (R.min || '').trim() ? note('ok', 'Fester Platz und ein Mindestmass – so überlebt das Ritual auch volle Wochen.') : note('info', 'Das Mindestmass ist der Trick: An schlechten Tagen drei Sätze – und die Kette reisst nicht.'));
        $('jo-ritual').querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', () => { S.ritual = S.ritual || {}; S.ritual.slot = S.ritual.slot === b.dataset.slot ? '' : b.dataset.slot; MethodKit.save(); renderRitual(); }));
        $('jo-min').addEventListener('input', e => { S.ritual = S.ritual || {}; S.ritual.min = e.target.value; MethodKit.save(); }); $('jo-min').addEventListener('change', renderRitual);
    }
    function renderLinks() { $('jo-links').innerHTML = LINKS.map(x => `<a class="mk-option jo-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['MEIN JOURNAL', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), `${S.entries.length} Einträge`, ''];
        S.entries.forEach(e => { L.push(`── ${new Date(e.date).toLocaleString('de-CH')} · ${M(e.mode).t}${e.before ? ` · Stimmung ${e.before}${e.after ? '→' + e.after : ''}` : ''}`); if (e.prompt) L.push(`[${e.prompt}]`); L.push(e.text, ''); });
        if (S.reflections.length) { L.push('', 'VERTIEFUNGEN'); S.reflections.forEach(r => L.push(`── ${new Date(r.date).toLocaleDateString('de-CH')} · ${r.theme || 'Eintrag'}`, `Kern: ${r.core}`, r.need ? `Bedürfnis: ${r.need}` : '', r.step ? `Schritt: ${r.step}` : '', '')); }
        MethodKit.exportText('journal.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'journaling', accent: '#22c55e', accent2: '#84cc16',
            steps: [{ icon: '✍️', label: 'Schreiben' }, { icon: '🔍', label: 'Muster' }, { icon: '📖', label: 'Verlauf' }, { icon: '🪞', label: 'Vertiefen' }, { icon: '🔁', label: 'Ritual' }],
            defaultState: { entries: [], draft: { mode: 'evening', pi: 0, text: '', before: 0, after: 0 }, filter: {}, open: '', deep: { theme: '', entry: '', core: '', need: '', step: '' }, reflections: [], ritual: {} }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.entries)) S.entries = [];
        S.entries = S.entries.filter(e => e && (e.text || '').trim()).map(e => Object.assign({ id: MethodKit.uid(), date: Date.now(), mode: 'free', prompt: '', before: 0, after: 0 }, e, { words: e.words || words(e.text), date: typeof e.date === 'string' ? (Date.parse(e.date) || Date.now()) : e.date }));
        if (!S.draft || typeof S.draft !== 'object') S.draft = { mode: 'evening', pi: 0, text: '', before: 0, after: 0 }; if (!S.deep || typeof S.deep !== 'object') S.deep = { theme: '', entry: '', core: '', need: '', step: '' };
        if (!Array.isArray(S.reflections)) S.reflections = []; if (!S.filter) S.filter = {}; if (!S.ritual) S.ritual = {}; delete S.promptIdx;
        $('jo-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k !== 1 && timer) stopTimer(false);
            if (k === 1) renderWrite();
            if (k === 2) renderStats();
            if (k === 3) renderLog();
            if (k === 4) renderDeep();
            if (k === 5) { renderRitual(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
