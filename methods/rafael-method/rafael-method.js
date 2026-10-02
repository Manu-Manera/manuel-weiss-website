/* RAFAEL-Methode · Logik (Kit-basiert)
   Report · Alternativen · Feedback · Austausch · Erarbeitung · Lernschritte */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const TYPES = ['Präsentation', 'Schwieriges Gespräch', 'Meeting geleitet', 'Verhandlung', 'Konflikt', 'Bewerbungsgespräch', 'Workshop / Training', 'Entscheidung', 'Kundentermin', 'Sonstiges'];
    const JUDGE = /\b(schlecht|peinlich|katastrophal|furchtbar|versagt|dumm|unfähig|total|völlig|immer|nie|wie immer)\b/i;
    const POS_SEEDS = ['Ich war gut vorbereitet', 'Ich habe pünktlich begonnen', 'Ich habe Fragen zugelassen', 'Ich bin beim Thema geblieben', 'Ich habe Blickkontakt gehalten', 'Ich habe das Ziel klar genannt', 'Ich bin ruhig geblieben', 'Ich habe zugehört'];
    const SORT = { agree: { l: 'Wusste ich', icon: '✅', d: 'Deckt sich mit meinem Bild' }, new: { l: 'Neu für mich', icon: '💡', d: 'Blinder Fleck – das sehe ich selbst nicht' }, differ: { l: 'Sehe ich anders', icon: '🤔', d: 'Ich nehme es ernst, teile es aber (noch) nicht' } };
    const LINKS = [
        { m: 'Johari-Fenster', l: '../johari-window/johari-window.html', why: 'Blinde Flecken systematisch verkleinern.' },
        { m: 'Kommunikationsmodelle', l: '../communication/communication.html', why: 'Wenn es um Wirkung im Gespräch geht.' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Einen Lernschritt zur Routine machen.' },
        { m: 'Journaling', l: '../journaling/journaling.html', why: 'Reflexion als tägliche Gewohnheit.' },
        { m: 'Stressmanagement', l: '../stress-management/stress-management.html', why: 'Wenn das Muster „unter Druck" heisst.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const fmt = (iso) => { const d = new Date(iso); return isNaN(d) || !iso ? '' : d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
    const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null;
    const fbRatings = () => S.feedback.map(f => n(f.rating, NaN)).filter(x => !isNaN(x));

    /* ---------- Listen-Helfer ---------- */
    function listEditor(host, items, opts) {
        host.innerHTML = `
            ${items.map((it, i) => `<div class="mk-row rf-item"><span class="rf-num">${i + 1}</span><input class="mk-input grow" data-li="${it.id}" value="${esc(it.text)}" placeholder="${opts.ph}">${opts.extra ? opts.extra(it) : ''}<button class="mk-iconbtn" data-lrm="${it.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('')}
            <div class="rf-add"><input class="mk-input" data-ladd placeholder="${opts.addPh || opts.ph}" maxlength="160"><button class="mk-btn mk-btn-primary" data-laddbtn><i class="fas fa-plus"></i></button></div>
            ${opts.seeds ? `<div class="mk-chips" style="margin-top:10px">${opts.seeds.filter(s => !items.some(it => it.text === s)).map(s => `<button class="mk-chip" data-lseed="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div>` : ''}
            ${opts.footer ? opts.footer(items) : ''}`;
        const add = (v) => { v = (v || '').trim(); if (!v) return; items.push({ id: MethodKit.uid(), text: v }); MethodKit.save(); opts.rerender(); const inp = host.querySelector('[data-ladd]'); if (inp) inp.focus(); };
        host.querySelector('[data-laddbtn]').addEventListener('click', () => add(host.querySelector('[data-ladd]').value));
        host.querySelector('[data-ladd]').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(ev.target.value); } });
        host.querySelectorAll('[data-lseed]').forEach(b => b.addEventListener('click', () => add(b.dataset.lseed)));
        host.querySelectorAll('[data-li]').forEach(el => el.addEventListener('input', () => { const it = items.find(x => x.id === el.dataset.li); if (it) { it.text = el.value; MethodKit.save(); } }));
        host.querySelectorAll('[data-lrm]').forEach(b => b.addEventListener('click', () => { const idx = items.findIndex(x => x.id === b.dataset.lrm); if (idx > -1) { items.splice(idx, 1); MethodKit.save(); opts.rerender(); } }));
    }

    /* ---------- 1 · Report ---------- */
    function renderTypes() {
        $('rf-types').innerHTML = TYPES.map(t => `<button class="mk-chip ${S.type === t ? 'selected' : ''}" data-type="${esc(t)}">${esc(t)}</button>`).join('');
        $('rf-types').querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => { S.type = S.type === b.dataset.type ? '' : b.dataset.type; MethodKit.save(); renderTypes(); }));
    }
    function renderReportCheck() {
        const r = S.report || ''; const m = r.match(JUDGE);
        $('rf-report-check').innerHTML = m ? `<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>„${esc(m[0])}" ist eine Bewertung. Im Report bleibst du bei dem, was beobachtbar war – die Bewertung kommt in Schritt 1c und 5.</span></div>` : (r.length > 120 ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Beschreibend – gut so.</span></div>' : '');
    }
    function renderPositives() {
        listEditor($('rf-positives'), S.positives, { ph: 'Was lief gut – konkret', seeds: POS_SEEDS, rerender: renderPositives, footer: (items) => items.length < 3 ? `<div class="mk-note info" style="margin-top:12px"><i class="fas fa-info-circle"></i><span>Noch ${3 - items.length} – auch kleine Dinge zählen. Das ist kein Schönreden, sondern die Basis, auf der du aufbaust.</span></div>` : '' });
    }
    function renderWeak() {
        listEditor($('rf-weak'), S.weak, { ph: 'Konkreter Moment, der nicht gut lief', rerender: () => { renderWeak(); }, footer: (items) => items.length > 4 ? '<div class="mk-note info" style="margin-top:12px"><i class="fas fa-info-circle"></i><span>Mehr als vier Punkte verwässern. Welche zwei bis drei sind wirklich relevant?</span></div>' : '' });
    }

    /* ---------- 2 · Alternativen ---------- */
    function renderAlts() {
        if (!S.weak.length) { $('rf-alts').innerHTML = '<div class="mk-empty">Trage in Schritt 1 ein, was weniger gut lief – dann kannst du hier Alternativen entwickeln.</div>'; return; }
        $('rf-alts').innerHTML = S.weak.map((w, i) => {
            const alts = S.alts[w.id] || (S.alts[w.id] = []);
            return `<div class="rf-alt">
                <div class="rf-alt-head"><span class="rf-num">${i + 1}</span><strong>${esc(w.text || '(ohne Text)')}</strong></div>
                <div class="rf-alt-list">${alts.map(a => `<div class="mk-row"><span class="rf-arrow"><i class="fas fa-arrow-turn-up fa-rotate-90"></i></span><input class="mk-input grow" data-alt="${a.id}" data-w="${w.id}" value="${esc(a.text)}" placeholder="Stattdessen hätte ich …"><button class="rf-star ${a.pick ? 'on' : ''}" data-pick="${a.id}" data-w="${w.id}" title="Diese Alternative probiere ich"><i class="fas fa-star"></i></button><button class="mk-iconbtn" data-altrm="${a.id}" data-w="${w.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('')}</div>
                <button class="mk-btn mk-btn-outline mk-btn-sm" data-altadd="${w.id}"><i class="fas fa-plus"></i> Alternative</button>
            </div>`;
        }).join('') + (Object.values(S.alts).some(a => a.some(x => x.pick)) ? '<div class="mk-note ok"><i class="fas fa-star"></i><span>Markierte Alternativen (★) werden dir in Schritt 6 als Lernschritte vorgeschlagen.</span></div>' : '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Sammle erst breit, dann markiere mit ★ die ein bis zwei, die du wirklich ausprobieren würdest.</span></div>');
        $('rf-alts').querySelectorAll('[data-altadd]').forEach(b => b.addEventListener('click', () => { S.alts[b.dataset.altadd].push({ id: MethodKit.uid(), text: '', pick: false }); MethodKit.save(); renderAlts(); const inputs = $('rf-alts').querySelectorAll(`[data-w="${b.dataset.altadd}"][data-alt]`); if (inputs.length) inputs[inputs.length - 1].focus(); }));
        $('rf-alts').querySelectorAll('[data-alt]').forEach(el => el.addEventListener('input', () => { const a = S.alts[el.dataset.w].find(x => x.id === el.dataset.alt); if (a) { a.text = el.value; MethodKit.save(); } }));
        $('rf-alts').querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { const a = S.alts[b.dataset.w].find(x => x.id === b.dataset.pick); if (a) { a.pick = !a.pick; MethodKit.save(); renderAlts(); } }));
        $('rf-alts').querySelectorAll('[data-altrm]').forEach(b => b.addEventListener('click', () => { S.alts[b.dataset.w] = S.alts[b.dataset.w].filter(x => x.id !== b.dataset.altrm); MethodKit.save(); renderAlts(); }));
    }

    /* ---------- 3 · Feedback ---------- */
    function renderRequest() {
        const title = S.title || 'die Situation';
        const txt = `Hallo …,\n\ndu warst bei ${title}${S.date ? ' am ' + fmt(S.date) : ''} dabei. Ich reflektiere das gerade strukturiert und würde mich über dein ehrliches Feedback freuen – drei kurze Fragen:\n\n1. Was ist dir positiv aufgefallen?\n2. Was hätte ich besser machen können – möglichst an einer konkreten Stelle?\n3. Wie würdest du die Situation insgesamt bewerten (1–10)?\n\nZwei, drei Sätze reichen völlig. Danke dir!`;
        $('rf-request').innerHTML = `<div class="mk-section-label">Vorlage für deine Feedback-Anfrage</div><pre class="rf-pre">${esc(txt)}</pre><button class="mk-btn mk-btn-outline mk-btn-sm" id="rf-copy"><i class="fas fa-copy"></i> Text kopieren</button>`;
        $('rf-copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(txt); MethodKit.toast('Kopiert', 'success'); } catch (e) { MethodKit.toast('Kopieren nicht möglich – bitte markieren und kopieren', 'error'); } });
    }
    function renderFeedback() {
        const F = S.feedback;
        $('rf-feedback').innerHTML = `
            ${F.map((f, i) => `<div class="rf-fb">
                <div class="rf-fb-head"><input class="mk-input" data-fb="${f.id}" data-f="from" value="${esc(f.from || '')}" placeholder="Von wem? (Name / Rolle)"><div class="mk-range-wrap rf-fb-rate"><input type="range" class="mk-range" min="1" max="10" value="${n(f.rating, 6)}" data-fb="${f.id}" data-f="rating"><span class="mk-range-val">${n(f.rating, 6)}</span></div><button class="mk-iconbtn" data-fbrm="${f.id}" aria-label="Löschen"><i class="fas fa-trash"></i></button></div>
                <div class="mk-grid-2">
                    <div class="mk-field"><label>Positiv</label><textarea class="mk-textarea" data-fb="${f.id}" data-f="pos" placeholder="…">${esc(f.pos || '')}</textarea></div>
                    <div class="mk-field"><label>Entwicklungsfeld</label><textarea class="mk-textarea" data-fb="${f.id}" data-f="dev" placeholder="…">${esc(f.dev || '')}</textarea></div>
                </div>
            </div>`).join('')}
            <button class="mk-btn mk-btn-outline" id="rf-fb-add"><i class="fas fa-plus"></i> Feedback eintragen</button>
            ${!F.length ? '<div class="mk-note info" style="margin-top:12px"><i class="fas fa-info-circle"></i><span>Ohne Fremdfeedback bleibt RAFAEL eine Selbstreflexion. Ein einziges ehrliches Feedback verändert das Bild oft deutlich.</span></div>' : ''}`;
        $('rf-fb-add').addEventListener('click', () => { S.feedback.push({ id: MethodKit.uid(), from: '', rating: 6, pos: '', dev: '' }); MethodKit.save(); renderFeedback(); renderCompare(); const el = $('rf-feedback').querySelectorAll('[data-f="from"]'); if (el.length) el[el.length - 1].focus(); });
        $('rf-feedback').querySelectorAll('[data-fb][data-f]').forEach(el => el.addEventListener('input', () => { const f = F.find(x => x.id === el.dataset.fb); if (!f) return; f[el.dataset.f] = el.dataset.f === 'rating' ? n(el.value, 6) : el.value; if (el.dataset.f === 'rating') el.nextElementSibling.textContent = el.value; MethodKit.save(); renderCompare(); }));
        $('rf-feedback').querySelectorAll('[data-fbrm]').forEach(b => b.addEventListener('click', () => { S.feedback = F.filter(x => x.id !== b.dataset.fbrm); MethodKit.save(); renderFeedback(); renderCompare(); }));
        MethodKit._autosizeAll();
    }
    function renderCompare() {
        const self = n(S.selfRating, 6), rs = fbRatings(), a = avg(rs);
        if (a == null) { $('rf-compare').innerHTML = '<div class="mk-empty">Sobald Feedback mit Bewertung eingetragen ist, siehst du hier den Vergleich.</div>'; return; }
        const diff = Math.round((a - self) * 10) / 10;
        let msg;
        if (Math.abs(diff) < 1) msg = 'Selbst- und Fremdbild liegen nah beieinander – deine Selbsteinschätzung ist realistisch.';
        else if (diff > 0) msg = `Andere bewerten die Situation um ${diff} Punkte <strong>besser</strong> als du. Du bist streng mit dir – schau in Schritt 4, welche Stärken dir die anderen zuschreiben, die du selbst kleinredest.`;
        else msg = `Andere bewerten die Situation um ${Math.abs(diff)} Punkte <strong>kritischer</strong> als du. Hier liegt vermutlich ein blinder Fleck – die Entwicklungsfelder im Feedback verdienen besondere Aufmerksamkeit.`;
        const bar = (v, c) => `<div class="rf-bar"><i style="width:${v * 10}%;background:${c}"></i></div>`;
        $('rf-compare').innerHTML = `
            <div class="rf-cmp">
                <div><span>Selbstbild</span>${bar(self, 'var(--mk-accent)')}<b>${self}</b></div>
                <div><span>Fremdbild (Ø ${rs.length})</span>${bar(a, 'var(--mk-accent-2)')}<b>${a}</b></div>
                ${rs.length > 1 ? `<div class="mk-faint">Spanne ${Math.min(...rs)}–${Math.max(...rs)}</div>` : ''}
            </div>
            <div class="mk-note ${Math.abs(diff) < 1 ? 'ok' : 'info'}"><i class="fas ${Math.abs(diff) < 1 ? 'fa-check-circle' : 'fa-info-circle'}"></i><span>${msg}</span></div>`;
    }

    /* ---------- 4 · Austausch ---------- */
    function renderSort() {
        const items = [];
        S.feedback.forEach(f => { if ((f.pos || '').trim()) items.push({ id: f.id + ':pos', from: f.from, kind: 'Positiv', text: f.pos }); if ((f.dev || '').trim()) items.push({ id: f.id + ':dev', from: f.from, kind: 'Entwicklung', text: f.dev }); });
        if (!items.length) { $('rf-sort').innerHTML = '<div class="mk-empty">Trage in Schritt 3 Feedback ein, dann kannst du es hier einordnen.</div>'; return; }
        const counts = { agree: 0, new: 0, differ: 0 }; items.forEach(it => { if (S.sort[it.id]) counts[S.sort[it.id]]++; });
        $('rf-sort').innerHTML = `
            <div class="rf-sort-sum">${Object.entries(SORT).map(([k, s]) => `<div class="${counts[k] ? 'has' : ''}"><span class="ic">${s.icon}</span><b>${counts[k]}</b><span>${s.l}</span></div>`).join('')}</div>
            ${items.map(it => `<div class="rf-sort-item ${it.kind === 'Positiv' ? 'pos' : 'dev'}">
                <div class="rf-sort-text"><span class="mk-badge">${it.kind}</span> ${esc(it.text)}<div class="mk-faint">${esc(it.from || 'anonym')}</div></div>
                <div class="rf-sort-btns">${Object.entries(SORT).map(([k, s]) => `<button class="${S.sort[it.id] === k ? 'on' : ''}" data-sort="${it.id}" data-k="${k}" title="${s.d}">${s.icon} ${s.l}</button>`).join('')}</div>
            </div>`).join('')}
            ${counts.new ? `<div class="mk-note ok"><i class="fas fa-lightbulb"></i><span>${counts.new} blinde${counts.new === 1 ? 'r Fleck' : ' Flecken'} entdeckt. Das ist der wertvollste Ertrag von Fremdfeedback – nimm ${counts.new === 1 ? 'ihn' : 'sie'} mit in die Erarbeitung.</span></div>` : ''}
            ${counts.differ && !(S.questions || '').trim() ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Zu dem, was du anders siehst: Formuliere unten eine Nachfrage statt eine Rechtfertigung.</span></div>' : ''}`;
        $('rf-sort').querySelectorAll('[data-sort]').forEach(b => b.addEventListener('click', () => { S.sort[b.dataset.sort] = S.sort[b.dataset.sort] === b.dataset.k ? null : b.dataset.k; MethodKit.save(); renderSort(); }));
    }

    /* ---------- 5 · Erarbeitung ---------- */
    function renderThemes() {
        const own = S.weak.filter(w => w.text.trim());
        const fb = S.feedback.filter(f => (f.dev || '').trim());
        const fbPos = S.feedback.filter(f => (f.pos || '').trim());
        const newOnes = Object.entries(S.sort).filter(([, v]) => v === 'new').map(([id]) => { const [fid, k] = id.split(':'); const f = S.feedback.find(x => x.id === fid); return f ? f[k] : null; }).filter(Boolean);
        $('rf-themes').innerHTML = `
            <div class="rf-themes">
                <div><div class="mk-section-label">Deine Sicht · Schwachstellen</div>${own.length ? `<ul>${own.map(w => `<li>${esc(w.text)}</li>`).join('')}</ul>` : '<div class="mk-faint">–</div>'}</div>
                <div><div class="mk-section-label">Fremdsicht · Entwicklungsfelder</div>${fb.length ? `<ul>${fb.map(f => `<li>${esc(f.dev)} <span class="mk-faint">(${esc(f.from || 'anonym')})</span></li>`).join('')}</ul>` : '<div class="mk-faint">–</div>'}</div>
            </div>
            ${newOnes.length ? `<div class="mk-result"><h4>Blinde Flecken</h4><ul class="rf-ul">${newOnes.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
            <div class="rf-themes" style="margin-top:14px">
                <div><div class="mk-section-label">Deine Sicht · Stärken</div>${S.positives.length ? `<ul>${S.positives.map(p => `<li>${esc(p.text)}</li>`).join('')}</ul>` : '<div class="mk-faint">–</div>'}</div>
                <div><div class="mk-section-label">Fremdsicht · Positiv</div>${fbPos.length ? `<ul>${fbPos.map(f => `<li>${esc(f.pos)} <span class="mk-faint">(${esc(f.from || 'anonym')})</span></li>`).join('')}</ul>` : '<div class="mk-faint">–</div>'}</div>
            </div>`;
    }

    /* ---------- 6 · Lernschritte ---------- */
    function renderSteps() {
        const picks = []; Object.entries(S.alts).forEach(([wid, arr]) => arr.filter(a => a.pick && a.text.trim()).forEach(a => picks.push(a.text)));
        const st = S.steps;
        $('rf-steps').innerHTML = `
            ${picks.length && st.length < 3 ? `<div class="mk-note info"><i class="fas fa-star"></i><span>Deine markierten Alternativen: ${picks.filter(p => !st.some(s => s.text === p)).map(p => `<button class="mk-chip rf-sugg" data-sugg="${esc(p)}">${esc(p)}</button>`).join(' ') || '<em>alle übernommen</em>'}</span></div>` : ''}
            ${st.map((s, i) => `<div class="rf-step">
                <div class="rf-step-head"><span class="rf-num big">${i + 1}</span><input class="mk-input grow" data-st="${s.id}" data-f="text" value="${esc(s.text || '')}" placeholder="Beim nächsten Mal werde ich …"><button class="mk-iconbtn" data-strm="${s.id}" aria-label="Löschen"><i class="fas fa-trash"></i></button></div>
                <div class="mk-grid-2">
                    <div class="mk-field"><label>Wie übe ich das vorher?</label><input class="mk-input" data-st="${s.id}" data-f="practice" value="${esc(s.practice || '')}" placeholder="z. B. Dreimal laut durchsprechen, Timer stellen"></div>
                    <div class="mk-field"><label>Woran merke ich, dass es geklappt hat?</label><input class="mk-input" data-st="${s.id}" data-f="sign" value="${esc(s.sign || '')}" placeholder="Beobachtbares Zeichen"></div>
                </div>
            </div>`).join('')}
            ${st.length < 3 ? `<button class="mk-btn mk-btn-outline" id="rf-st-add"><i class="fas fa-plus"></i> Lernschritt hinzufügen</button>` : '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Drei Lernschritte – das ist das Maximum. Mehr würde die Wirkung verwässern.</span></div>'}`;
        const addBtn = $('rf-st-add'); if (addBtn) addBtn.addEventListener('click', () => { st.push({ id: MethodKit.uid(), text: '', practice: '', sign: '' }); MethodKit.save(); renderSteps(); const el = $('rf-steps').querySelectorAll('[data-f="text"]'); if (el.length) el[el.length - 1].focus(); });
        $('rf-steps').querySelectorAll('[data-sugg]').forEach(b => b.addEventListener('click', () => { if (st.length >= 3) return; st.push({ id: MethodKit.uid(), text: b.dataset.sugg, practice: '', sign: '' }); MethodKit.save(); renderSteps(); }));
        $('rf-steps').querySelectorAll('[data-st][data-f]').forEach(el => el.addEventListener('input', () => { const s = st.find(x => x.id === el.dataset.st); if (s) { s[el.dataset.f] = el.value; MethodKit.save(); } }));
        $('rf-steps').querySelectorAll('[data-strm]').forEach(b => b.addEventListener('click', () => { S.steps = st.filter(x => x.id !== b.dataset.strm); MethodKit.save(); renderSteps(); }));
    }
    function renderHistory() {
        const H = S.history;
        $('rf-history').innerHTML = !H.length ? '<div class="mk-empty">Noch keine abgeschlossenen Durchläufe. Mit „Abschliessen & neue Situation" landet der aktuelle hier.</div>' : `<div class="rf-hist">${H.slice().reverse().map(h => `<div class="rf-hist-item"><div><strong>${esc(h.title || h.type || 'Situation')}</strong><div class="mk-faint">${fmt(h.date) || ''}${h.type ? ' · ' + esc(h.type) : ''}</div></div><div class="rf-hist-r"><span title="Selbstbild">${h.self ?? '–'}</span>${h.fb != null ? `<span title="Fremdbild">${h.fb}</span>` : ''}</div><div class="rf-hist-steps">${(h.steps || []).map(s => `<span class="mk-chip">${esc(s)}</span>`).join('')}</div></div>`).join('')}</div>`;
    }
    function renderLinks() { $('rf-links').innerHTML = LINKS.map(l => `<a class="mk-option rf-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }

    function archive() {
        if (!(S.title || S.report || S.steps.length)) { MethodKit.toast('Noch nichts zum Abschliessen', 'error'); return; }
        if (!confirm('Aktuellen Durchlauf archivieren und eine neue Situation beginnen?')) return;
        S.history.push({ id: MethodKit.uid(), title: S.title, type: S.type, date: S.date || new Date().toISOString().slice(0, 10), self: n(S.selfRating, null), fb: avg(fbRatings()), pattern: S.pattern, steps: S.steps.map(s => s.text).filter(Boolean) });
        const keep = S.history;
        Object.assign(S, fresh()); S.history = keep;
        MethodKit.save({ now: true }); MethodKit.toast('Archiviert – neue Situation', 'success');
        document.querySelectorAll('[data-mk-field]').forEach(el => { const v = S[el.dataset.mkField]; el.value = v == null ? '' : v; });
        const out = document.querySelector('[data-mk-rangeval="selfRating"]'); if (out) out.textContent = S.selfRating;
        MethodKit.goTo(1); renderTypes(); renderReportCheck(); renderPositives(); renderWeak();
    }
    const fresh = () => ({ type: '', title: '', date: '', report: '', positives: [], weak: [], selfRating: 6, alts: {}, feedback: [], sort: {}, questions: '', pattern: '', strength: '', steps: [], nextOccasion: '', nextDate: '', review: '' });

    /* ---------- Export ---------- */
    function exportAll() {
        const L = ['RAFAEL-METHODE', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        L.push('R · REPORT', (S.title || '') + (S.type ? ' [' + S.type + ']' : '') + (S.date ? ' · ' + fmt(S.date) : ''), S.report || '', '');
        if (S.positives.length) L.push('Gut gelaufen:', ...S.positives.map(p => '+ ' + p.text)); if (S.weak.length) L.push('Weniger gut:', ...S.weak.map(w => '- ' + w.text)); L.push('Selbstbewertung: ' + n(S.selfRating, 6) + '/10', '');
        L.push('A · ALTERNATIVEN'); S.weak.forEach(w => { const a = S.alts[w.id] || []; if (a.length) { L.push('• ' + w.text); a.forEach(x => L.push('   → ' + x.text + (x.pick ? ' ★' : ''))); } }); L.push('');
        L.push('F · FEEDBACK'); S.feedback.forEach(f => L.push(`• ${f.from || 'anonym'} (${n(f.rating, '?')}/10)`, f.pos ? '   + ' + f.pos : '', f.dev ? '   - ' + f.dev : '')); const a = avg(fbRatings()); if (a != null) L.push(`Selbstbild ${n(S.selfRating, 6)} vs. Fremdbild Ø ${a}`); L.push('');
        L.push('A · AUSTAUSCH'); Object.entries(S.sort).forEach(([id, v]) => { if (!v) return; const [fid, k] = id.split(':'); const f = S.feedback.find(x => x.id === fid); if (f) L.push(`${SORT[v].icon} ${SORT[v].l}: ${f[k]}`); }); if (S.questions) L.push('Nachfragen: ' + S.questions); L.push('');
        L.push('E · ERARBEITUNG', S.pattern ? 'Muster: ' + S.pattern : '', S.strength ? 'Stärke: ' + S.strength : '', '');
        L.push('L · LERNSCHRITTE'); S.steps.forEach((s, i) => L.push(`${i + 1}. ${s.text}`, s.practice ? '   Üben: ' + s.practice : '', s.sign ? '   Erfolgszeichen: ' + s.sign : '')); if (S.nextOccasion || S.nextDate) L.push('Nächste Gelegenheit: ' + [S.nextOccasion, fmt(S.nextDate)].filter(Boolean).join(' · ')); if (S.review) L.push('Rückblick: ' + S.review);
        if (S.history.length) { L.push('', 'FRÜHERE DURCHLÄUFE'); S.history.forEach(h => L.push(`- ${h.title || h.type || 'Situation'} (${fmt(h.date)}) · Selbst ${h.self ?? '–'}${h.fb != null ? ' / Fremd ' + h.fb : ''} · ${(h.steps || []).join('; ')}`)); }
        MethodKit.exportText('rafael-methode.txt', L.filter(x => x !== '').join('\n'));
    }

    /* ---------- Init ---------- */
    (async function () {
        await MethodKit.init({
            method: 'rafael-method',
            accent: '#f97316', accent2: '#8b5cf6',
            steps: [{ icon: '📋', label: 'Report' }, { icon: '🔀', label: 'Alternativen' }, { icon: '🗣️', label: 'Feedback' }, { icon: '⚖️', label: 'Austausch' }, { icon: '🧠', label: 'Erarbeitung' }, { icon: '🎯', label: 'Lernschritte' }],
            defaultState: Object.assign(fresh(), { history: [] })
        });
        S = MethodKit.state;
        // Migration: alte generische Felder (problem/when/who/impact/causes/factors/sol1-3/choice/step1/steps)
        const legacy = {}; ['problem', 'when', 'who', 'impact', 'causes', 'factors', 'sol1', 'sol2', 'sol3', 'choice', 'step1', 'responsible', 'deadline'].forEach(k => { if (typeof S[k] === 'string') { legacy[k] = S[k]; delete S[k]; } });
        if (typeof S.steps === 'string') { legacy.steps = S.steps; S.steps = []; }
        if (typeof S.history === 'string') { legacy.historyTxt = S.history; S.history = []; }
        ['alts', 'sort'].forEach(k => { if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {}; });
        ['positives', 'weak', 'feedback', 'steps', 'history'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        if (!S.report && (legacy.problem || '').trim()) S.report = [legacy.problem, legacy.when, legacy.who, legacy.impact, legacy.causes, legacy.factors, legacy.historyTxt].filter(x => (x || '').trim()).join('\n');
        const sols = ['sol1', 'sol2', 'sol3'].filter(k => (legacy[k] || '').trim());
        if (sols.length && !Object.keys(S.alts).length) { if (!S.weak.length) S.weak.push({ id: MethodKit.uid(), text: 'Übernommen aus alter Version' }); const wid = S.weak[0].id; S.alts[wid] = sols.map(k => ({ id: MethodKit.uid(), text: legacy[k].trim(), pick: legacy.choice === k })); }
        if (!S.steps.length) [legacy.step1, legacy.steps].filter(x => (x || '').trim()).slice(0, 3).forEach(t => S.steps.push({ id: MethodKit.uid(), text: t.trim(), practice: '', sign: '' }));

        MethodKit.bindFields();
        $('rf-report').addEventListener('input', renderReportCheck);
        renderTypes(); renderReportCheck(); renderPositives(); renderWeak();
        MethodKit.onStep = function (k) {
            if (k === 2) renderAlts();
            if (k === 3) { renderRequest(); renderFeedback(); renderCompare(); }
            if (k === 4) renderSort();
            if (k === 5) renderThemes();
            if (k === 6) { renderSteps(); renderHistory(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
        $('rf-export').addEventListener('click', exportAll);
        $('rf-archive').addEventListener('click', archive);
    })();
})();
