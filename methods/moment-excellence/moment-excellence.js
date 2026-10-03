/* Moment of Excellence · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S, timer = null;

    const ANCHORS = ['👌 Daumen & Mittelfinger drücken', '✊ Linke Faust ballen', '🤏 Ohrläppchen reiben', '👍 Daumen in die Handfläche drücken', '🖐️ Handgelenk umfassen', '🦶 Zehen in den Boden pressen'];
    const SUBMOD = [['big', '🔍 Bild grösser', 'Lass das innere Bild wachsen, bis es dich umgibt'], ['near', '➡️ Näher heran', 'Hol das Bild näher, bis du mittendrin bist'], ['bright', '☀️ Heller & farbiger', 'Dreh Helligkeit und Farben auf'], ['assoc', '👁️ Aus eigenen Augen', 'Sieh es nicht von aussen – sieh es, wie du es damals gesehen hast'], ['loud', '🔊 Lauter', 'Dreh die Geräusche und Stimmen auf'], ['move', '🎬 In Bewegung', 'Mach aus dem Standbild einen Film']];
    const LINKS = [
        { m: 'Stärken finden', l: '../strengths-finder/strengths-finder.html', why: 'Welche Stärke war in deinem Moment aktiv?' },
        { m: 'Achtsamkeit', l: '../mindfulness/mindfulness.html', why: 'Körperwahrnehmung trainieren – macht Anker stärker.' },
        { m: 'Stressmanagement', l: '../stress-management/stress-management.html', why: 'Den Anker in den SOS-Plan einbauen.' },
        { m: 'Wohlgeformtes Ziel (NLP)', l: '../nlp-meta-goal/nlp-meta-goal.html', why: 'Den Zustand auf ein Ziel richten.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const moment = () => S.moments.find(m => m.id === S.chosen) || null;
    const anchorName = () => (S.anchorCustom || '').trim() || S.anchor || '';
    const days = (ts) => Math.floor((Date.now() - ts) / 864e5);

    /* ---------- 1 ---------- */
    function renderMoments() {
        $('me-moments').innerHTML = S.moments.map(m => `<div class="me-mom ${S.chosen === m.id ? 'on' : ''}"><button class="me-pick" data-pick="${m.id}" aria-label="Diesen Moment wählen">${S.chosen === m.id ? '⚡' : '○'}</button><div class="me-mom-b"><input class="mk-input" data-mt="${m.id}" value="${esc(m.text)}" placeholder="Was war das für ein Moment?"><div class="me-mom-r"><input class="mk-input" data-mw="${m.id}" value="${esc(m.when || '')}" placeholder="Wann / wo"><div class="me-int"><span>Stärke</span>${[1, 2, 3, 4, 5].map(v => `<button class="${n(m.power, 0) >= v ? 'on' : ''}" data-mp="${m.id}" data-v="${v}" aria-label="Stärke ${v}">●</button>`).join('')}</div></div></div><button class="mk-iconbtn" data-md="${m.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('') +
            `<button class="mk-btn mk-btn-outline mk-btn-sm" id="me-madd"><i class="fas fa-plus"></i> Moment hinzufügen</button>` +
            (S.moments.length >= 3 && !S.chosen ? (() => { const best = [...S.moments].sort((a, b) => n(b.power, 0) - n(a.power, 0))[0]; return best && best.power ? note('info', `Dein stärkster: „${esc(best.text)}" (${best.power}/5). Wähle ihn mit ⚡ – oder einen anderen, der sich beim Lesen sofort im Körper meldet.`) : note('info', 'Bewerte die Stärke jedes Moments – dann weisst du, mit welchem du arbeitest.'); })() : S.chosen && moment() ? (n(moment().power, 0) <= 2 ? note('warn', 'Der gewählte Moment ist nur mässig stark. Anker brauchen Intensität – gibt es einen, bei dem es dich beim Erinnern körperlich packt?') : note('ok', `Du arbeitest mit: „${esc(moment().text)}". Weiter zum Eintauchen.`)) : S.moments.length < 3 ? note('info', `${S.moments.length}/3 – sammle noch ${3 - S.moments.length}. Auch kleine Momente zählen: ein Gespräch, das sass; ein Lauf, der flog.`) : '');
        const h = $('me-moments');
        $('me-madd').addEventListener('click', () => { S.moments.push({ id: MethodKit.uid(), text: '', when: '', power: 0 }); MethodKit.save(); renderMoments(); const last = h.querySelectorAll('[data-mt]'); if (last.length) last[last.length - 1].focus(); });
        h.querySelectorAll('[data-mt]').forEach(i => i.addEventListener('input', () => { S.moments.find(m => m.id === i.dataset.mt).text = i.value; MethodKit.save(); }));
        h.querySelectorAll('[data-mw]').forEach(i => i.addEventListener('input', () => { S.moments.find(m => m.id === i.dataset.mw).when = i.value; MethodKit.save(); }));
        h.querySelectorAll('[data-mp]').forEach(b => b.addEventListener('click', () => { S.moments.find(m => m.id === b.dataset.mp).power = +b.dataset.v; MethodKit.save(); renderMoments(); }));
        h.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { S.chosen = S.chosen === b.dataset.pick ? '' : b.dataset.pick; MethodKit.save(); renderMoments(); }));
        h.querySelectorAll('[data-md]').forEach(b => b.addEventListener('click', () => { S.moments = S.moments.filter(m => m.id !== b.dataset.md); if (S.chosen === b.dataset.md) S.chosen = ''; MethodKit.save(); renderMoments(); }));
    }

    /* ---------- 2 ---------- */
    function renderDive() {
        const m = moment();
        $('me-dive-intro').innerHTML = m ? `<div class="me-quote">⚡ ${esc(m.text)}${m.when ? `<small>${esc(m.when)}</small>` : ''}</div>${note('info', 'Schliess kurz die Augen. Geh zurück in diesen Moment – nicht als Zuschauer, sondern mittendrin. Dann beschreib, was da ist.')}` : note('info', 'Wähle in Schritt 1 einen Moment.');
        renderVakNote(); renderSubmod(); renderIntNote();
    }
    function renderVakNote() {
        const f = ['see', 'hear', 'feel', 'think'].filter(k => (S[k] || '').trim()).length;
        const feel = (S.feel || '').trim();
        const shortFeel = note('info', 'Der Körper-Teil ist knapp. Genau der trägt den Anker: Wo genau sitzt das Gefühl? Warm oder kühl? Weit oder dicht? Wie atmest du?');
        $('me-vak-note').innerHTML = f === 4 ? (feel.length < 25 ? shortFeel : note('ok', 'Alle Kanäle da. Je präziser, desto schneller kommst du beim Üben wieder hinein.')) : f >= 2 && !feel ? note('info', 'Das Körpergefühl fehlt noch – es ist der wichtigste Kanal. Ohne Kinästhetik hält kein Anker.') : f >= 2 && feel.length < 25 ? shortFeel : '';
    }
    function renderSubmod() {
        const SM = S.submod;
        $('me-submod').innerHTML = `<div class="me-sm">${SUBMOD.map(([id, t, d]) => `<button class="me-sm-btn ${SM[id] === 'up' ? 'up' : SM[id] === 'down' ? 'down' : ''}" data-sm="${id}" title="${d}"><b>${t}</b><small>${SM[id] === 'up' ? '↑ stärker' : SM[id] === 'down' ? '↓ schwächer / neutral' : 'ausprobieren'}</small></button>`).join('')}</div>` +
            (Object.values(SM).filter(v => v === 'up').length >= 2 ? note('ok', `Deine Verstärker: ${SUBMOD.filter(([id]) => SM[id] === 'up').map(([, t]) => t.replace(/^\S+\s/, '')).join(', ')}. Nutze genau diese beim Ankern.`) : Object.keys(SM).length ? '' : note('info', 'Klick einen Schalter, probier die Veränderung innerlich aus – und markiere, ob das Gefühl stärker wird (↑) oder nicht (↓).'));
        $('me-submod').querySelectorAll('[data-sm]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.sm; SM[k] = SM[k] === 'up' ? 'down' : SM[k] === 'down' ? undefined : 'up'; if (!SM[k]) delete SM[k]; MethodKit.save(); renderSubmod(); }));
    }
    function renderIntNote() {
        const i = n(S.intensity, 7);
        $('me-int-note').innerHTML = i >= 8 ? note('ok', `${i}/10 – stark genug zum Ankern. Merk dir diesen Zustand: Genau hier, kurz vor dem Höhepunkt, setzt du den Anker.`) : i >= 6 ? note('info', `${i}/10 – okay, aber mehr geht. Noch eine Runde mit den Verstärkern? Anker unter 7 verblassen schnell.`) : note('warn', `${i}/10 – zu schwach für einen stabilen Anker. Entweder tiefer eintauchen (Submodalitäten, Körper!) oder zurück zu Schritt 1 und einen stärkeren Moment wählen.`);
    }

    /* ---------- 3 ---------- */
    function renderAnchors() {
        $('me-anchors').innerHTML = `<div class="mk-chips">${ANCHORS.map(a => `<button class="mk-chip ${S.anchor === a && !S.anchorCustom ? 'selected' : ''}" data-a="${esc(a)}">${a}</button>`).join('')}</div>`;
        $('me-anchors').querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { S.anchor = b.dataset.a; S.anchorCustom = ''; $('me-anchor-custom').value = ''; MethodKit.save(); renderAnchors(); renderAnchorCheck(); }));
        renderAnchorCheck();
    }
    function renderAnchorCheck() {
        const a = anchorName(); const i = n(S.intensity, 7);
        const C = [['int', 'Intensität', i >= 7, i >= 7 ? `Zustand bei ${i}/10 – stark genug.` : `Zustand bei ${i}/10 – zu schwach. Zurück zu Schritt 2.`], ['uniq', 'Einzigartigkeit', !!a && !/händeschütteln|nicken|lächeln|atmen/i.test(a), a ? 'Ein Signal, das du sonst nicht zufällig machst.' : 'Noch kein Anker gewählt.'], ['time', 'Timing', true, 'Setzen, wenn das Gefühl steigt – kurz vor dem Höhepunkt. Lösen, bevor es abflaut.'], ['rep', 'Wiederholung', n(S.practiced, 0) >= 3, `${n(S.practiced, 0)}× geübt – ${n(S.practiced, 0) >= 3 ? 'gut.' : 'mindestens 3× in derselben Sitzung, dann täglich.'}`]];
        $('me-anchor-check').innerHTML = `<div class="me-crit">${C.map(([id, t, ok, d]) => `<div class="${ok ? 'ok' : ''}"><b>${ok ? '✓' : '○'} ${t}</b><small>${d}</small></div>`).join('')}</div>`;
    }
    function startPractice() {
        const btn = $('me-practice'), orb = $('me-orb'), guide = $('me-guide');
        if (!anchorName()) { MethodKit.toast('Wähle zuerst einen Anker', 'warn'); return; }
        btn.disabled = true; orb.classList.add('run');
        const a = anchorName().replace(/^\S+\s/, '');
        const ups = SUBMOD.filter(([id]) => S.submod[id] === 'up').map(([, t]) => t.replace(/^\S+\s/, ''));
        const steps = [[0, 'Augen zu. Zwei ruhige Atemzüge.'], [4, `Geh zurück: ${moment() ? moment().text : 'dein Moment'} …`], [9, S.see ? `Sieh es: ${S.see.slice(0, 60)}` : 'Sieh, was du damals gesehen hast.'], [14, ups.length ? `Verstärke: ${ups.join(' · ')} – lass es wachsen.` : 'Lass das Bild grösser, näher, heller werden.'], [19, S.feel ? `Spür es im Körper: ${S.feel.slice(0, 60)}` : 'Spür, wo es im Körper sitzt.'], [23, `Es steigt … JETZT: ${a}!`], [27, 'Halten … und langsam lösen.'], [30, 'Augen auf. Schüttel dich kurz aus.']];
        orb.style.setProperty('--dur', '30s');
        steps.forEach(([t, m]) => setTimeout(() => { guide.textContent = m; if (t === 23) orb.classList.add('peak'); if (t === 27) orb.classList.remove('peak'); }, t * 1000));
        timer = setTimeout(() => { orb.classList.remove('run'); btn.disabled = false; S.practiced = n(S.practiced, 0) + 1; S.practiceLog.push(Date.now()); $('me-count').textContent = S.practiced; MethodKit.save({ now: true }); MethodKit.toast('Anker gesetzt', 'ok'); renderAnchorCheck(); renderPracticeNote(); }, 31000);
    }
    function renderPracticeNote() {
        const p = n(S.practiced, 0);
        $('me-practice-note').innerHTML = p === 0 ? '' : p < 3 ? note('info', `${p}× – noch ${3 - p}× in dieser Sitzung, dann testen. Zwischen den Durchgängen kurz „aufräumen": an etwas Neutrales denken.`) : note('ok', `${p}× gesetzt. Jetzt testen – unten.`);
    }
    function renderTest() {
        $('me-test').innerHTML = `<div class="mk-field"><label>Löse den Anker aus. Wie stark kommt der Zustand – ohne bewusst an den Moment zu denken? <span class="mk-range-val" id="me-testval">${n(S.testVal, 0) || '–'}</span>/10</label><div class="mk-range-wrap"><input type="range" class="mk-range" min="0" max="10" id="me-testrange" value="${n(S.testVal, 0)}"></div></div><button class="mk-btn mk-btn-outline mk-btn-sm" id="me-testsave"><i class="fas fa-flask"></i> Test speichern</button>` +
            (S.tests.length ? `<div class="me-tests">${S.tests.map(t => `<span class="${t.v >= 6 ? 'ok' : t.v >= 4 ? 'mid' : 'low'}" title="${new Date(t.date).toLocaleDateString('de-CH')}">${t.v}</span>`).join('')}</div>` + (() => { const last = S.tests[S.tests.length - 1].v; const trend = S.tests.length >= 2 ? last - S.tests[S.tests.length - 2].v : 0; return last >= 7 ? note('ok', `${last}/10 beim Auslösen – der Anker sitzt. ${trend > 0 ? 'Und er wird stärker.' : ''} Weiter zum Future Pace.`) : last >= 4 ? note('info', `${last}/10 – der Anker greift, ist aber noch nicht stabil. Zwei bis drei weitere Durchgänge, dann nochmal testen.${trend < 0 ? ' Der Wert ist gesunken – hast du zwischen den Durchgängen aufgeräumt?' : ''}`) : note('warn', `${last}/10 – kaum Reaktion. Häufigste Ursachen: Zustand zu schwach (Schritt 2), Anker zu spät gesetzt (nach dem Höhepunkt), oder zu wenig Wiederholungen. Nicht aufgeben – das ist beim ersten Mal normal.`); })() : '');
        $('me-testrange').addEventListener('input', e => { $('me-testval').textContent = e.target.value; S.testVal = +e.target.value; });
        $('me-testsave').addEventListener('click', () => { S.tests.push({ date: Date.now(), v: n(S.testVal, 0), after: n(S.practiced, 0) }); MethodKit.save({ now: true }); renderTest(); });
    }

    /* ---------- 4 ---------- */
    function renderSits() {
        $('me-sits').innerHTML = S.situations.map(s => `<div class="me-sit"><div class="me-sit-h"><input class="mk-input" data-st="${s.id}" value="${esc(s.text)}" placeholder="Situation, z. B. Gehaltsgespräch am Donnerstag"><button class="mk-iconbtn" data-sd="${s.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div><div class="me-sit-r"><div class="me-sit-sc"><span>Ohne Anker – wie fühlt es sich an, wenn du es dir vorstellst?</span><div class="me-sc">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button class="${n(s.before, 0) === v ? 'on' : ''}" data-sb="${s.id}" data-v="${v}">${v}</button>`).join('')}</div><small>1 = sehr angespannt · 10 = völlig in meiner Kraft</small></div><div class="me-sit-sc"><span>Jetzt: Anker auslösen, Situation nochmal vorstellen.</span><div class="me-sc after">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button class="${n(s.after, 0) === v ? 'on' : ''}" data-sa="${s.id}" data-v="${v}">${v}</button>`).join('')}</div>${s.before && s.after ? `<small class="${s.after - s.before >= 3 ? 'ok' : s.after > s.before ? 'mid' : 'low'}">${s.after - s.before > 0 ? '+' : ''}${s.after - s.before} ${s.after - s.before >= 3 ? '– deutlicher Effekt' : s.after > s.before ? '– spürbar, ausbaufähig' : '– kein Effekt: Anker vor der Situation nochmal aufladen'}</small>` : ''}</div></div></div>`).join('') +
            `<button class="mk-btn mk-btn-outline mk-btn-sm" id="me-sadd"><i class="fas fa-plus"></i> Situation hinzufügen</button>` +
            (() => { const done = S.situations.filter(s => s.before && s.after); if (!done.length) return S.situations.length ? '' : note('info', 'Drei Situationen reichen. Je konkreter (Ort, Zeit, Person), desto besser funktioniert der Transfer.'); const avg = done.reduce((a, s) => a + (s.after - s.before), 0) / done.length; return avg >= 3 ? note('ok', `Durchschnittlich +${avg.toFixed(1)} Punkte mit Anker. Das ist der Transfer – der Zustand ist nicht mehr an den alten Moment gebunden.`) : avg > 0 ? note('info', `+${avg.toFixed(1)} im Schnitt. Es wirkt. Mit jeder Übung wird der Sprung grösser.`) : note('warn', 'Kein messbarer Effekt. Zurück zu Schritt 3: Der Anker braucht noch Wiederholungen – oder einen stärkeren Ausgangszustand.'); })();
        const h = $('me-sits');
        $('me-sadd').addEventListener('click', () => { S.situations.push({ id: MethodKit.uid(), text: '', before: 0, after: 0 }); MethodKit.save(); renderSits(); });
        h.querySelectorAll('[data-st]').forEach(i => i.addEventListener('input', () => { S.situations.find(s => s.id === i.dataset.st).text = i.value; MethodKit.save(); }));
        h.querySelectorAll('[data-sd]').forEach(b => b.addEventListener('click', () => { S.situations = S.situations.filter(s => s.id !== b.dataset.sd); MethodKit.save(); renderSits(); }));
        h.querySelectorAll('[data-sb]').forEach(b => b.addEventListener('click', () => { S.situations.find(s => s.id === b.dataset.sb).before = +b.dataset.v; MethodKit.save(); renderSits(); }));
        h.querySelectorAll('[data-sa]').forEach(b => b.addEventListener('click', () => { S.situations.find(s => s.id === b.dataset.sa).after = +b.dataset.v; MethodKit.save(); renderSits(); }));
    }

    /* ---------- 5 ---------- */
    function renderCare() {
        const last = S.practiceLog.length ? S.practiceLog[S.practiceLog.length - 1] : null; const d = last ? days(last) : null;
        const last14 = S.practiceLog.filter(ts => days(ts) < 14).length;
        $('me-care').innerHTML = `<div class="me-stats"><div><b>${n(S.practiced, 0)}</b><span>Mal gesetzt</span></div><div><b>${last14}</b><span>in 14 Tagen</span></div><div><b>${S.tests.length ? S.tests[S.tests.length - 1].v : '–'}</b><span>letzter Test</span></div><div><b>${d === null ? '–' : d === 0 ? 'heute' : d + ' T.'}</b><span>zuletzt</span></div></div>` +
            (d === null ? note('info', 'Noch nie geübt. Der Anker existiert erst, wenn du ihn gesetzt hast – Schritt 3.') : d >= 7 ? note('warn', `${d} Tage ohne Übung. Anker verblassen – nach zwei Wochen ohne Auffrischung ist meist nur noch wenig da. Eine Minute reicht: Moment, Verstärker, Anker.`) : d >= 3 ? note('info', 'Ein paar Tage her. Frisch ihn heute kurz auf – 30 Sekunden.') : note('ok', 'Frisch. Faustregel: in den ersten zwei Wochen täglich, danach einmal pro Woche und immer direkt vor dem Einsatz.')) +
            `<button class="mk-btn mk-btn-outline mk-btn-sm" id="me-refresh"><i class="fas fa-bolt"></i> Heute aufgefrischt</button>` +
            (S.practiceLog.length >= 2 ? `<div class="me-cal">${Array.from({ length: 28 }, (_, i) => { const dayAgo = 27 - i; const hit = S.practiceLog.some(ts => days(ts) === dayAgo); return `<i class="${hit ? 'on' : ''}" title="vor ${dayAgo} Tagen"></i>`; }).join('')}<small>letzte 28 Tage</small></div>` : '');
        $('me-refresh').addEventListener('click', () => { S.practiceLog.push(Date.now()); S.practiced = n(S.practiced, 0) + 1; MethodKit.save({ now: true }); MethodKit.toast('Aufgefrischt', 'ok'); renderCare(); });
    }
    function renderSummary() {
        const m = moment();
        $('me-summary').innerHTML = m || anchorName() ? `<div class="mk-result" style="margin-top:12px"><h4>Dein Anker-Protokoll</h4>${m ? `<div><b>Moment:</b> ${esc(m.text)}${m.when ? ` (${esc(m.when)})` : ''}</div>` : ''}${anchorName() ? `<div><b>Anker:</b> ${esc(anchorName())}</div>` : ''}<div><b>Intensität:</b> ${n(S.intensity, 7)}/10${S.tests.length ? ` · Test: ${S.tests[S.tests.length - 1].v}/10` : ''}</div>${Object.keys(S.submod).filter(k => S.submod[k] === 'up').length ? `<div><b>Verstärker:</b> ${SUBMOD.filter(([id]) => S.submod[id] === 'up').map(([, t]) => t.replace(/^\S+\s/, '')).join(', ')}</div>` : ''}${S.situations.filter(s => s.text).length ? `<div style="margin-top:6px"><b>Einsatz:</b><ul class="me-ul">${S.situations.filter(s => s.text).map(s => `<li>${esc(s.text)}${s.before && s.after ? ` <small>(${s.before} → ${s.after})</small>` : ''}</li>`).join('')}</ul></div>` : ''}</div>` : '';
    }
    function renderLinks() { $('me-links').innerHTML = LINKS.map(x => `<a class="mk-option me-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const m = moment();
        const L = ['MOMENT OF EXCELLENCE – ANKER-PROTOKOLL', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'MOMENTE'];
        S.moments.forEach(x => L.push(`${S.chosen === x.id ? '⚡ ' : '  '}${x.text}${x.when ? ' (' + x.when + ')' : ''} – Stärke ${x.power || '–'}/5`));
        if (m) L.push('', 'EINTAUCHEN', S.see ? 'Sehen: ' + S.see : '', S.hear ? 'Hören: ' + S.hear : '', S.feel ? 'Fühlen: ' + S.feel : '', S.think ? 'Denken: ' + S.think : '', 'Verstärker: ' + (SUBMOD.filter(([id]) => S.submod[id] === 'up').map(([, t]) => t.replace(/^\S+\s/, '')).join(', ') || '–'), `Intensität: ${n(S.intensity, 7)}/10`);
        L.push('', 'ANKER: ' + (anchorName() || '–'), `Geübt: ${n(S.practiced, 0)}×`, S.tests.length ? 'Tests: ' + S.tests.map(t => t.v).join(' → ') : '');
        if (S.situations.length) L.push('', 'FUTURE PACE', ...S.situations.map(s => `- ${s.text}${s.before && s.after ? ` (ohne ${s.before} → mit ${s.after})` : ''}`));
        MethodKit.exportText('anker-protokoll.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'moment-excellence', accent: '#eab308', accent2: '#f59e0b',
            steps: [{ icon: '🔍', label: 'Momente' }, { icon: '🌊', label: 'Eintauchen' }, { icon: '⚓', label: 'Ankern' }, { icon: '⚡', label: 'Future Pace' }, { icon: '🔗', label: 'Pflegen' }],
            defaultState: { moments: [], chosen: '', see: '', hear: '', feel: '', think: '', submod: {}, intensity: 7, anchor: '', anchorCustom: '', practiced: 0, practiceLog: [], testVal: 0, tests: [], situations: [] }
        });
        S = MethodKit.state;
        ['moments', 'practiceLog', 'tests', 'situations'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
        if (!S.submod || typeof S.submod !== 'object') S.submod = {};
        // Migration: altes when/what → ein Moment
        if ((S.what || S.when) && !S.moments.length) { const id = MethodKit.uid(); S.moments.push({ id, text: S.what || S.when, when: S.what ? S.when : '', power: 4 }); S.chosen = id; delete S.what; delete S.when; }
        S.situations.forEach(s => { if (s.before === undefined) s.before = 0; if (s.after === undefined) s.after = 0; });
        MethodKit.bindFields();
        $('me-count').textContent = n(S.practiced, 0);
        $('me-export').addEventListener('click', exportAll);
        $('me-practice').addEventListener('click', startPractice);
        ['me-see', 'me-hear', 'me-feel', 'me-think'].forEach(id => $(id).addEventListener('input', renderVakNote));
        document.querySelector('[data-mk-field=intensity]').addEventListener('input', renderIntNote);
        $('me-anchor-custom').addEventListener('input', () => { if ($('me-anchor-custom').value.trim()) S.anchor = ''; renderAnchors(); });
        MethodKit.onStep = function (k) {
            if (timer && k !== 3) { clearTimeout(timer); timer = null; $('me-orb').classList.remove('run', 'peak'); $('me-practice').disabled = false; $('me-guide').textContent = 'Bereit? Setz dich bequem hin.'; }
            if (k === 1) renderMoments();
            if (k === 2) renderDive();
            if (k === 3) { renderAnchors(); renderPracticeNote(); renderTest(); }
            if (k === 4) renderSits();
            if (k === 5) { renderCare(); renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
