/* Lösungsfokussiertes Coaching · Logik (Kit-basiert) */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const NEG = /\b(nicht|nie|kein|keine|keinen|weniger|aufhören|loswerden|ohne|vermeiden|weg|los|endlich nicht)\b/i;
    const VAGUE = /\b(entspannter|glücklicher|besser|zufriedener|ruhiger|gelassener|selbstbewusster|erfolgreicher)\b/i;
    const CRIT = [
        { id: 'positive', l: 'Positiv formuliert', d: 'Es beschreibt, was da sein wird – nicht, was fehlen soll.' },
        { id: 'concrete', l: 'Konkret & beobachtbar', d: 'Jemand mit einer Kamera könnte es sehen.' },
        { id: 'mine', l: 'In meiner Hand', d: 'Es hängt von meinem Verhalten ab, nicht von anderen.' }
    ];
    const PERSP = [
        { id: 'self', icon: '🪞', l: 'Du selbst', q: 'Was tust du am Wundertag anders – vom Aufwachen bis zum Einschlafen?' },
        { id: 'close', icon: '🤍', l: 'Ein nahestehender Mensch', q: 'Woran würde dein Partner, deine beste Freundin, dein Kind merken, dass das Wunder passiert ist – ohne dass du es sagst?' },
        { id: 'work', icon: '💼', l: 'Jemand aus dem Arbeitsumfeld', q: 'Woran würde ein Kollege oder eine Vorgesetzte den Unterschied bemerken?' },
        { id: 'stranger', icon: '👤', l: 'Ein Fremder', q: 'Was würde jemand sehen, der dich nicht kennt und dir an diesem Tag zusieht?' }
    ];
    const SCALE_Q = [
        { k: 'already', l: 'Warum stehst du schon bei dieser Zahl und nicht bei 0? Was funktioniert bereits?', h: 'Alles, was dich von der 0 trennt, ist bereits Lösung.' },
        { k: 'onepoint', l: 'Woran würdest du merken, dass du einen Punkt weiter bist?', h: 'Nicht bei 10 – nur ein Punkt. Was wäre dann anders?' },
        { k: 'others', l: 'Woran würden andere merken, dass du einen Punkt weiter bist?', h: '' },
        { k: 'enough', l: 'Bei welcher Zahl wärst du zufrieden genug, um aufzuhören?', h: 'Selten 10. Oft 7 oder 8.' }
    ];
    const COMPL_SEEDS = ['Ich habe das Thema ehrlich angeschaut', 'Ich habe durchgehalten, als es schwer war', 'Ich habe mir Hilfe geholt', 'Ich habe Ausnahmen erkannt', 'Ich habe nicht aufgegeben', 'Ich habe trotzdem für andere gesorgt', 'Ich habe einen Anfang gemacht'];
    const STEP_TYPES = [
        { id: 'do', icon: '▶️', l: 'Etwas tun', d: 'Ein Verhalten aus einer Ausnahme oder dem Wundertag bewusst wiederholen.' },
        { id: 'observe', icon: '👀', l: 'Beobachten', d: 'Nur hinschauen: Wann ist es diese Woche ein bisschen besser – und was ist dann anders?' },
        { id: 'pretend', icon: '🎭', l: 'So tun als ob', d: 'An einem geheimen Tag so handeln, als wäre die Skala einen Punkt höher. Beobachten, wer es merkt.' },
        { id: 'coin', icon: '🪙', l: 'Münzwurf', d: 'Jeden Morgen werfen: Kopf = Wundertag spielen, Zahl = normal. Abends vergleichen.' }
    ];
    const LINKS = [
        { m: 'SMART-Ziele', l: '../goal-setting/goal-setting.html', why: 'Den nächsten Schritt messbar machen.' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Ausnahmen zur Regel machen.' },
        { m: 'Ressourcen-Analyse', l: '../resource-analysis/resource-analysis.html', why: 'Was dich trägt, systematisch sammeln.' },
        { m: 'Rubikon-Modell', l: '../rubikon-model/rubikon-model.html', why: 'Vom Wollen ins Handeln kommen.' },
        { m: 'Systemisches Coaching', l: '../systemic-coaching/systemic-coaching.html', why: 'Wenn andere Beteiligte eine Rolle spielen.' }
    ];
    const todayKey = () => new Date().toISOString().slice(0, 10);
    const fmt = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }); };
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };

    /* ---------- 1 · Ziel-Check ---------- */
    function renderGoalCheck() {
        const g = (S.goal || '').trim();
        const hints = [];
        if (g && NEG.test(g)) hints.push({ t: 'warn', m: 'Da steckt eine Verneinung drin („' + g.match(NEG)[0] + '"). Versuch: Was tust du <em>stattdessen</em>, wenn das Problem weg ist?' });
        if (g && VAGUE.test(g)) hints.push({ t: 'info', m: '„' + g.match(VAGUE)[0] + '" ist ein Gefühl. Woran würde man es <em>sehen</em>? Was tust du dann konkret?' });
        if (g && !hints.length && g.length > 20) hints.push({ t: 'ok', m: 'Klingt nach einem Ziel, nicht nach einem Problem. Prüf es unten mit den drei Fragen.' });
        $('sf-goal-check').innerHTML = hints.map(h => `<div class="mk-note ${h.t}"><i class="fas ${h.t === 'ok' ? 'fa-check-circle' : h.t === 'warn' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i><span>${h.m}</span></div>`).join('');
        $('sf-goal-crit').innerHTML = CRIT.map(c => `<button class="sf-check ${S.crit[c.id] ? 'on' : ''}" data-crit="${c.id}"><span class="box"><i class="fas fa-check"></i></span><span><strong>${c.l}</strong><small>${c.d}</small></span></button>`).join('');
        $('sf-goal-crit').querySelectorAll('[data-crit]').forEach(b => b.addEventListener('click', () => { S.crit[b.dataset.crit] = !S.crit[b.dataset.crit]; MethodKit.save(); renderGoalCheck(); }));
    }

    /* ---------- 2 · Wunderfrage ---------- */
    function renderMiracle() {
        $('sf-miracle').innerHTML = PERSP.map(p => `<div class="sf-persp"><div class="sf-persp-head"><span class="ic">${p.icon}</span><div><strong>${p.l}</strong><div class="mk-faint">${p.q}</div></div></div><textarea class="mk-textarea" data-mp="${p.id}" placeholder="…">${esc(S.miracleP[p.id] || '')}</textarea></div>`).join('');
        $('sf-miracle').querySelectorAll('[data-mp]').forEach(t => t.addEventListener('input', () => { S.miracleP[t.dataset.mp] = t.value; MethodKit.save(); }));
        MethodKit._autosizeAll();
    }
    function renderSigns() {
        const list = S.signs;
        $('sf-signs').innerHTML = `
            ${list.length ? list.map(s => `<div class="mk-row sf-sign"><span class="sf-sign-ic">✨</span><span class="grow">${esc(s.text)}</span><label class="sf-sign-now" title="Passiert das heute schon manchmal?"><input type="checkbox" data-now="${s.id}" ${s.now ? 'checked' : ''}> schon manchmal</label><button class="mk-iconbtn" data-rm="${s.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('') : '<div class="mk-empty">Noch keine Zeichen. Nimm aus den vier Perspektiven oben je ein bis zwei konkrete Dinge.</div>'}
            <div class="sf-add"><input class="mk-input" id="sf-sign-add" placeholder="z. B. Ich öffne um 9 Uhr die wichtigste Aufgabe, bevor ich Mails lese" maxlength="140"><button class="mk-btn mk-btn-primary" id="sf-sign-addbtn"><i class="fas fa-plus"></i></button></div>
            ${list.some(s => s.now) ? `<div class="mk-note ok" style="margin-top:12px"><i class="fas fa-check-circle"></i><span>${list.filter(s => s.now).length} deiner Wunderzeichen passieren heute schon manchmal. Das sind deine Ausnahmen – wir schauen sie in Schritt 4 genauer an.</span></div>` : ''}`;
        const add = () => { const v = $('sf-sign-add').value.trim(); if (!v) return; S.signs.push({ id: MethodKit.uid(), text: v, now: false }); MethodKit.save(); renderSigns(); $('sf-sign-add').focus(); };
        $('sf-sign-addbtn').addEventListener('click', add);
        $('sf-sign-add').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(); } });
        $('sf-signs').querySelectorAll('[data-now]').forEach(cb => cb.addEventListener('change', () => { const s = S.signs.find(x => x.id === cb.dataset.now); if (s) { s.now = cb.checked; MethodKit.save(); renderSigns(); } }));
        $('sf-signs').querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { S.signs = S.signs.filter(x => x.id !== b.dataset.rm); MethodKit.save(); renderSigns(); }));
    }

    /* ---------- 3 · Skala ---------- */
    function renderScale() {
        const cur = n(S.scale, 3), low = S.lowest == null ? null : n(S.lowest, 0), enough = S.enoughN == null ? null : n(S.enoughN, 8);
        $('sf-scale').innerHTML = `
            <div class="sf-scale-vis">
                <div class="sf-track"><i class="fill" style="width:${cur * 10}%"></i>
                    ${low != null ? `<span class="mark low" style="left:${low * 10}%" title="Tiefpunkt">${low}</span>` : ''}
                    <span class="mark cur" style="left:${cur * 10}%">${cur}</span>
                    ${enough != null ? `<span class="mark enough" style="left:${enough * 10}%" title="Gut genug">${enough}</span>` : ''}
                </div>
                <div class="sf-ticks">${Array.from({ length: 11 }, (_, i) => `<span>${i}</span>`).join('')}</div>
                <div class="sf-ends"><span>Entschluss, etwas zu ändern</span><span>Wunder eingetreten</span></div>
            </div>
            <div class="sf-scale-rows">
                <label><span>Heute</span><input type="range" class="mk-range" min="0" max="10" value="${cur}" data-sc="scale"><b>${cur}</b></label>
                <label><span>Tiefster Stand bisher</span><input type="range" class="mk-range low" min="0" max="10" value="${low == null ? 0 : low}" data-sc="lowest"><b>${low == null ? '–' : low}</b></label>
                <label><span>Gut genug zum Aufhören</span><input type="range" class="mk-range enough" min="0" max="10" value="${enough == null ? 8 : enough}" data-sc="enoughN"><b>${enough == null ? '–' : enough}</b></label>
            </div>
            ${low != null && cur > low ? `<div class="mk-note ok"><i class="fas fa-arrow-up"></i><span>Du bist schon ${cur - low} Punkt${cur - low > 1 ? 'e' : ''} über deinem Tiefpunkt. <strong>Wie hast du das geschafft?</strong> – das gehört in die erste Frage unten.</span></div>` : ''}
            ${enough != null && cur >= enough ? `<div class="mk-note ok"><i class="fas fa-flag-checkered"></i><span>Du stehst bei oder über deinem „gut genug". Vielleicht geht es jetzt eher ums Halten als ums Weiterkommen.</span></div>` : ''}`;
        $('sf-scale').querySelectorAll('[data-sc]').forEach(r => r.addEventListener('input', () => { S[r.dataset.sc] = n(r.value, 0); MethodKit.save(); renderScale(); }));
    }
    function renderScaleQ() {
        $('sf-scale-q').innerHTML = SCALE_Q.map(q => `<div class="mk-field"><label for="sf-q-${q.k}">${q.l}</label>${q.h ? `<span class="hint">${q.h}</span>` : ''}<textarea class="mk-textarea" id="sf-q-${q.k}" data-sq="${q.k}" placeholder="…">${esc(S[q.k] || '')}</textarea></div>`).join('');
        $('sf-scale-q').querySelectorAll('[data-sq]').forEach(t => t.addEventListener('input', () => { S[t.dataset.sq] = t.value; MethodKit.save(); }));
        MethodKit._autosizeAll();
    }
    function renderSide() {
        const c = n(S.confidence, 5), i = n(S.importance, 7);
        let hint = '';
        if (i >= 7 && c <= 4) hint = 'Wichtig, aber wenig Zuversicht: Mach den nächsten Schritt kleiner – so klein, dass die Zuversicht auf 7 steigt.';
        else if (i <= 4) hint = 'Geringe Wichtigkeit: Vielleicht ist das nicht das Thema, das dich wirklich beschäftigt. Was wäre wichtiger?';
        else if (c >= 8 && i >= 7) hint = 'Wichtig und zuversichtlich – gute Voraussetzungen. Worauf wartest du noch?';
        $('sf-side').innerHTML = `
            <div class="sf-side-grid">
                <label><span>Wie <strong>zuversichtlich</strong> bist du (0–10), dass du einen Punkt weiterkommst?</span><div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" value="${c}" data-side="confidence"><span class="mk-range-val">${c}</span></div></label>
                <label><span>Wie <strong>wichtig</strong> ist dir das Thema (0–10)?</span><div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" value="${i}" data-side="importance"><span class="mk-range-val">${i}</span></div></label>
            </div>
            ${hint ? `<div class="mk-note info"><i class="fas fa-info-circle"></i><span>${hint}</span></div>` : ''}`;
        $('sf-side').querySelectorAll('[data-side]').forEach(r => r.addEventListener('input', () => { S[r.dataset.side] = n(r.value, 5); MethodKit.save(); renderSide(); }));
    }

    /* ---------- 4 · Ausnahmen ---------- */
    function renderExceptions() {
        const list = S.exc;
        $('sf-exceptions').innerHTML = `
            ${list.map((e, i) => `<div class="sf-exc">
                <div class="sf-exc-head"><strong>Ausnahme ${i + 1}</strong><button class="mk-iconbtn" data-rme="${e.id}" aria-label="Löschen"><i class="fas fa-trash"></i></button></div>
                <div class="mk-grid-2">
                    <div class="mk-field"><label>Wann war es besser?</label><input class="mk-input" data-e="${e.id}" data-f="when" value="${esc(e.when || '')}" placeholder="z. B. Letzten Dienstag Vormittag"></div>
                    <div class="mk-field"><label>Was war da anders?</label><input class="mk-input" data-e="${e.id}" data-f="what" value="${esc(e.what || '')}" placeholder="Umstände, Ort, Personen, Stimmung"></div>
                </div>
                <div class="mk-field"><label>Was hast <strong>du</strong> dazu beigetragen?</label><span class="hint">Die wichtigste Spalte. Auch „zufällige" Ausnahmen enthalten meist etwas, das du getan hast.</span><input class="mk-input" data-e="${e.id}" data-f="me" value="${esc(e.me || '')}" placeholder="z. B. Ich hatte den Abend davor den Schreibtisch aufgeräumt"></div>
                <label class="sf-repeat"><input type="checkbox" data-rep="${e.id}" ${e.repeat ? 'checked' : ''}> Das könnte ich bewusst wiederholen</label>
            </div>`).join('')}
            <button class="mk-btn mk-btn-outline" id="sf-exc-add"><i class="fas fa-plus"></i> Ausnahme hinzufügen</button>
            ${S.signs.some(s => s.now) && !list.length ? `<div class="mk-note info" style="margin-top:12px"><i class="fas fa-lightbulb"></i><span>Du hast in Schritt 2 markiert, dass „${esc(S.signs.find(s => s.now).text)}" heute schon manchmal passiert. Wann zuletzt? Das ist deine erste Ausnahme.</span></div>` : ''}`;
        $('sf-exc-add').addEventListener('click', () => { S.exc.push({ id: MethodKit.uid(), when: '', what: '', me: '', repeat: false }); MethodKit.save(); renderExceptions(); const inputs = $('sf-exceptions').querySelectorAll('input.mk-input'); if (inputs.length) inputs[inputs.length - 3].focus(); });
        $('sf-exceptions').querySelectorAll('[data-e]').forEach(el => el.addEventListener('input', () => { const e = S.exc.find(x => x.id === el.dataset.e); if (e) { e[el.dataset.f] = el.value; MethodKit.save(); renderInsight(); } }));
        $('sf-exceptions').querySelectorAll('[data-rep]').forEach(cb => cb.addEventListener('change', () => { const e = S.exc.find(x => x.id === cb.dataset.rep); if (e) { e.repeat = cb.checked; MethodKit.save(); renderInsight(); } }));
        $('sf-exceptions').querySelectorAll('[data-rme]').forEach(b => b.addEventListener('click', () => { S.exc = S.exc.filter(x => x.id !== b.dataset.rme); MethodKit.save(); renderExceptions(); renderInsight(); }));
        renderInsight();
    }
    function renderInsight() {
        const mine = S.exc.filter(e => (e.me || '').trim());
        const rep = S.exc.filter(e => e.repeat && (e.me || '').trim());
        $('sf-exc-insight').innerHTML = !S.exc.length ? '<div class="mk-empty">Sobald du Ausnahmen einträgst, erscheint hier, was sie gemeinsam haben.</div>' : `
            <div class="sf-insight">
                <div><b>${S.exc.length}</b><span>Ausnahme${S.exc.length > 1 ? 'n' : ''}</span></div>
                <div><b>${mine.length}</b><span>mit eigenem Beitrag</span></div>
                <div><b>${rep.length}</b><span>wiederholbar</span></div>
            </div>
            ${rep.length ? `<div class="mk-result"><h4>Deine wiederholbaren Lösungsbausteine</h4><ul class="sf-list">${rep.map(e => `<li>${esc(e.me)}</li>`).join('')}</ul><div class="mk-faint" style="margin-top:6px;font-size:13px">Einer davon ist vermutlich dein nächster Schritt (Schritt 6).</div></div>` : mine.length ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Markiere die Ausnahmen, die du bewusst wiederholen könntest.</span></div>' : '<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>In keiner Ausnahme steht bisher, was <strong>du</strong> getan hast. Schau noch einmal genau hin – „Zufall" ist selten die ganze Antwort.</span></div>'}`;
    }

    /* ---------- 5 · Komplimente ---------- */
    function renderCompliments() {
        $('sf-compliments').innerHTML = `
            <div class="mk-chips">${S.compl.map((c, i) => `<span class="mk-chip selected sf-compl">${esc(c)}<button data-rmc="${i}" aria-label="Entfernen"><i class="fas fa-times"></i></button></span>`).join('')}</div>
            <div class="sf-add" style="margin-top:10px"><input class="mk-input" id="sf-compl-add" placeholder="Ich habe … (konkret)" maxlength="120"><button class="mk-btn mk-btn-primary" id="sf-compl-addbtn"><i class="fas fa-plus"></i></button></div>
            <div class="mk-section-label" style="margin-top:14px">Anregungen</div>
            <div class="mk-chips">${COMPL_SEEDS.filter(s => !S.compl.includes(s)).map(s => `<button class="mk-chip" data-seed="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div>`;
        const add = (v) => { v = (v || '').trim(); if (!v || S.compl.includes(v)) return; S.compl.push(v); MethodKit.save(); renderCompliments(); };
        $('sf-compl-addbtn').addEventListener('click', () => add($('sf-compl-add').value));
        $('sf-compl-add').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(ev.target.value); } });
        $('sf-compliments').querySelectorAll('[data-seed]').forEach(b => b.addEventListener('click', () => add(b.dataset.seed)));
        $('sf-compliments').querySelectorAll('[data-rmc]').forEach(b => b.addEventListener('click', () => { S.compl.splice(+b.dataset.rmc, 1); MethodKit.save(); renderCompliments(); }));
    }

    /* ---------- 6 · Schritt & Verlauf ---------- */
    function renderStep() {
        const rep = S.exc.filter(e => e.repeat && (e.me || '').trim());
        const st = S.nextStep;
        $('sf-step').innerHTML = `
            <div class="mk-section-label">Art des Schritts</div>
            <div class="mk-grid sf-types">${STEP_TYPES.map(t => `<button class="mk-option ${st.type === t.id ? 'selected' : ''}" data-type="${t.id}"><span class="ic">${t.icon}</span><span class="t">${t.l}</span><span class="d">${t.d}</span></button>`).join('')}</div>
            ${rep.length && !st.text ? `<div class="mk-note info" style="margin-top:12px"><i class="fas fa-lightbulb"></i><span>Aus deinen Ausnahmen: ${rep.map(e => `<button class="mk-chip sf-sugg" data-sugg="${esc(e.me)}">${esc(e.me)}</button>`).join(' ')}</span></div>` : ''}
            <div class="mk-field" style="margin-top:14px"><label for="sf-step-text">Was genau tust du?</label><input class="mk-input" id="sf-step-text" value="${esc(st.text || '')}" placeholder="Klein, konkret, in den nächsten 7 Tagen"></div>
            <div class="mk-grid-2">
                <div class="mk-field"><label for="sf-step-when">Wann?</label><input class="mk-input" type="date" id="sf-step-when" value="${esc(st.when || '')}"></div>
                <div class="mk-field"><label for="sf-step-sign">Woran merkst du, dass es gewirkt hat?</label><input class="mk-input" id="sf-step-sign" value="${esc(st.sign || '')}" placeholder="Ein Wunderzeichen oder +1 auf der Skala"></div>
            </div>
            ${st.text ? `<div class="mk-result"><h4>Dein Plan</h4>${STEP_TYPES.find(t => t.id === st.type)?.icon || '▶️'} <strong>${esc(st.text)}</strong>${st.when ? ' · bis ' + fmt(st.when) : ''}${st.sign ? '<br><span class="mk-faint">Erfolgszeichen: ' + esc(st.sign) + '</span>' : ''}</div>` : ''}`;
        $('sf-step').querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => { st.type = b.dataset.type; MethodKit.save(); renderStep(); }));
        $('sf-step').querySelectorAll('[data-sugg]').forEach(b => b.addEventListener('click', () => { st.text = b.dataset.sugg; st.type = st.type || 'do'; MethodKit.save(); renderStep(); }));
        $('sf-step-text').addEventListener('input', e => { st.text = e.target.value; MethodKit.save(); });
        $('sf-step-text').addEventListener('change', renderStep);
        $('sf-step-when').addEventListener('input', e => { st.when = e.target.value; MethodKit.save(); renderStep(); });
        $('sf-step-sign').addEventListener('input', e => { st.sign = e.target.value; MethodKit.save(); });
    }
    function renderLog() {
        const log = S.log; const cur = n(S.scale, 3);
        const last = log[log.length - 1];
        const canLog = !last || last.date !== todayKey();
        let chart = '';
        if (log.length >= 2) {
            const W = 520, H = 140, P = 24; const xs = (i) => P + (i / (log.length - 1)) * (W - 2 * P); const ys = (v) => H - P - (v / 10) * (H - 2 * P);
            chart = `<svg viewBox="0 0 ${W} ${H}" class="sf-chart" role="img" aria-label="Skalenverlauf">${[0, 5, 10].map(v => `<line x1="${P}" x2="${W - P}" y1="${ys(v)}" y2="${ys(v)}" class="grid"/><text x="${P - 6}" y="${ys(v) + 4}" class="ax">${v}</text>`).join('')}<polyline points="${log.map((e, i) => `${xs(i)},${ys(e.v)}`).join(' ')}" class="line"/>${log.map((e, i) => `<circle cx="${xs(i)}" cy="${ys(e.v)}" r="4" class="pt"><title>${fmt(e.date)} · ${e.v}</title></circle>`).join('')}${log.map((e, i) => (i === 0 || i === log.length - 1 || log.length <= 7) ? `<text x="${xs(i)}" y="${H - 6}" class="ax" text-anchor="middle">${fmt(e.date)}</text>` : '').join('')}</svg>`;
        }
        $('sf-log').innerHTML = `
            ${chart || `<div class="mk-empty">${log.length ? 'Ab dem zweiten Eintrag siehst du hier deinen Verlauf.' : 'Noch kein Eintrag.'}</div>`}
            <div class="sf-log-row">
                <span>Heute stehe ich bei</span>
                <div class="mk-range-wrap" style="flex:1"><input type="range" class="mk-range" min="0" max="10" id="sf-log-v" value="${cur}"><span class="mk-range-val" id="sf-log-val">${cur}</span></div>
                <button class="mk-btn mk-btn-primary mk-btn-sm" id="sf-log-save" ${canLog ? '' : 'disabled title="Heute schon eingetragen"'}><i class="fas fa-plus"></i> Eintragen</button>
            </div>
            ${last && log.length >= 2 ? `<div class="mk-field" style="margin-top:12px"><label for="sf-better">Was ist seit dem letzten Mal besser geworden – auch nur ein bisschen?</label><textarea class="mk-textarea" id="sf-better" placeholder="…">${esc(S.better || '')}</textarea></div>` : ''}
            ${log.length ? `<div class="sf-log-list">${log.slice().reverse().slice(0, 6).map(e => `<span class="mk-chip">${fmt(e.date)} · <b>${e.v}</b></span>`).join('')}</div>` : ''}`;
        $('sf-log-v').addEventListener('input', e => { $('sf-log-val').textContent = e.target.value; });
        $('sf-log-save').addEventListener('click', () => {
            const v = n($('sf-log-v').value, cur); const prev = last ? last.v : null;
            S.log.push({ date: todayKey(), v }); S.scale = v; MethodKit.save({ now: true });
            MethodKit.toast(prev != null && v > prev ? `Eingetragen · +${v - prev} seit ${fmt(last.date)} 🎉` : 'Eingetragen', 'success'); renderLog();
        });
        const b = $('sf-better'); if (b) b.addEventListener('input', () => { S.better = b.value; MethodKit.save(); });
    }
    function renderLinks() { $('sf-links').innerHTML = LINKS.map(l => `<a class="mk-option sf-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }

    /* ---------- Export ---------- */
    function exportAll() {
        const L = ['LÖSUNGSFOKUSSIERTES COACHING', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), ''];
        if (S.topic) L.push('ANLIEGEN', S.topic, ''); if (S.goal) L.push('ZIEL (stattdessen)', S.goal, 'Prüffragen: ' + CRIT.map(c => (S.crit[c.id] ? '✓ ' : '○ ') + c.l).join(' · '), '');
        L.push('WUNDERFRAGE'); PERSP.forEach(p => { if (S.miracleP[p.id]) L.push('- ' + p.l + ': ' + S.miracleP[p.id]); }); if (S.signs.length) L.push('Wunderzeichen: ' + S.signs.map(s => s.text + (s.now ? ' (schon manchmal)' : '')).join('; ')); L.push('');
        L.push('SKALA', `Heute: ${n(S.scale, 3)}/10` + (S.lowest != null ? ` · Tiefpunkt: ${S.lowest}` : '') + (S.enoughN != null ? ` · Gut genug: ${S.enoughN}` : '') + ` · Zuversicht: ${n(S.confidence, 5)} · Wichtigkeit: ${n(S.importance, 7)}`);
        SCALE_Q.forEach(q => { if (S[q.k]) L.push('- ' + q.l, '  ' + S[q.k]); }); L.push('');
        if (S.exc.length) { L.push('AUSNAHMEN'); S.exc.forEach((e, i) => L.push(`${i + 1}. ${e.when || '?'} – ${e.what || ''}${e.me ? ' · Mein Beitrag: ' + e.me : ''}${e.repeat ? ' · wiederholbar' : ''}`)); L.push(''); }
        if (S.compl.length) L.push('KOMPLIMENTE', ...S.compl.map(c => '- ' + c), ''); if (S.coping) L.push('Bewältigung: ' + S.coping); if (S.keep) L.push('Soll so bleiben: ' + S.keep);
        const st = S.nextStep; if (st.text) L.push('', 'NÄCHSTER SCHRITT', `${STEP_TYPES.find(t => t.id === st.type)?.l || ''}: ${st.text}${st.when ? ' · bis ' + st.when : ''}${st.sign ? ' · Erfolgszeichen: ' + st.sign : ''}`);
        if (S.log.length) L.push('', 'VERLAUF', ...S.log.map(e => `${e.date}: ${e.v}/10`)); if (S.better) L.push('Besser geworden: ' + S.better);
        MethodKit.exportText('loesungsfokus.txt', L.join('\n'));
    }

    /* ---------- Init ---------- */
    (async function () {
        await MethodKit.init({
            method: 'solution-focused',
            accent: '#10b981', accent2: '#0ea5e9',
            steps: [{ icon: '🎯', label: 'Anliegen' }, { icon: '✨', label: 'Wunder' }, { icon: '📏', label: 'Skala' }, { icon: '🔍', label: 'Ausnahmen' }, { icon: '💐', label: 'Ressourcen' }, { icon: '👣', label: 'Schritt' }],
            defaultState: { topic: '', goal: '', crit: {}, miracle: '', miracleP: {}, signs: [], scale: 3, lowest: null, enoughN: null, already: '', onepoint: '', others: '', enough: '', confidence: 5, importance: 7, exc: [], compl: [], coping: '', keep: '', nextStep: {}, log: [], better: '' }
        });
        S = MethodKit.state;
        ['crit', 'miracleP', 'nextStep'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
        ['signs', 'exc', 'compl', 'log'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        // Migration: altes Freitext-Wunder und alte Ausnahmen/Step übernehmen
        if (S.miracle && !S.miracleP.self) S.miracleP.self = S.miracle;
        if (typeof S.exceptions === 'string' && S.exceptions.trim() && !S.exc.length) { S.exc.push({ id: MethodKit.uid(), when: '', what: S.exceptions.trim(), me: '', repeat: false }); delete S.exceptions; }
        if (typeof S.step === 'string' && S.step.trim() && !S.nextStep.text) { S.nextStep.text = S.step.trim(); S.nextStep.type = 'do'; delete S.step; }

        MethodKit.bindFields();
        $('sf-goal').addEventListener('input', renderGoalCheck);
        renderGoalCheck(); renderMiracle(); renderSigns();
        MethodKit.onStep = function (k) {
            if (k === 2) renderSigns();
            if (k === 3) { renderScale(); renderScaleQ(); renderSide(); }
            if (k === 4) renderExceptions();
            if (k === 5) renderCompliments();
            if (k === 6) { renderStep(); renderLog(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
        $('sf-export').addEventListener('click', exportAll);
    })();
})();
