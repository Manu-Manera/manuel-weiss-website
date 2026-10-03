/* Walt-Disney-Methode · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const CRITIC_WORDS = /\b(aber|geht nicht|unrealistisch|unmöglich|zu teuer|keine zeit|niemals|schwierig|problem|leider|eigentlich|wahrscheinlich nicht|kann ich nicht|funktioniert nicht|zu gross|zu klein)\b/i;
    const DREAM_PROMPTS = ['Wenn alles gelingt, sehe ich …', 'In fünf Jahren erzählt man sich …', 'Das Beste daran wäre …', 'Verrückt, aber grossartig wäre …', 'Mein 10-jähriges Ich würde wollen, dass …', 'Ohne jede Grenze würde ich …'];
    const CRITIC_PROMPTS = ['Was passiert, wenn … nicht klappt?', 'Was fehlt in diesem Plan?', 'Wer könnte dagegen sein – und warum?', 'Was haben andere unterschätzt, die das versucht haben?', 'Wo ist der Plan zu optimistisch?', 'Welche Annahme ist nicht geprüft?'];
    const SEV = { 1: 'gering', 2: 'mittel', 3: 'hoch' };
    const LINKS = [
        { m: 'Rubikon-Modell', l: '../rubikon-model/rubikon-model.html', why: 'Aus dem Plan eine verbindliche Entscheidung machen.' },
        { m: 'SWOT-Analyse', l: '../swot-analysis/swot-analysis.html', why: 'Den Kritiker systematisch vertiefen.' },
        { m: 'Vision Board', l: '../vision-board/vision-board.html', why: 'Den Traum sichtbar halten.' },
        { m: 'GROW', l: '../target-coaching/target-coaching.html', why: 'Optionen bewerten und ins Handeln kommen.' },
        { m: 'Zeitmanagement', l: '../time-management/time-management.html', why: 'Den Plan in den Kalender bringen.' }
    ];
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const planOf = (id) => S.plans[id] || (S.plans[id] = {});
    const critsOf = (id) => S.crits[id] || (S.crits[id] = []);
    const dreams = () => S.dreams.filter(d => d.text.trim());

    /* ---------- 2 · Träumer ---------- */
    function renderDPrompts() {
        $('wd-dprompts').innerHTML = DREAM_PROMPTS.map(p => `<button class="mk-chip" data-dp="${esc(p)}">${esc(p)}</button>`).join('');
        $('wd-dprompts').querySelectorAll('[data-dp]').forEach(b => b.addEventListener('click', () => { const t = $('wd-dreamtext'); t.value = (t.value.trim() ? t.value.trimEnd() + '\n\n' : '') + b.dataset.dp + ' '; t.dispatchEvent(new Event('input', { bubbles: true })); t.focus(); t.setSelectionRange(t.value.length, t.value.length); }));
    }
    function renderDCheck() {
        const t = S.dreamer || ''; const m = t.match(CRITIC_WORDS);
        $('wd-dcheck').innerHTML = m ? `<div class="mk-note warn"><i class="fas fa-door-open"></i><span>„${esc(m[0])}" – da hat sich der Kritiker in den Traumraum geschlichen. Schick ihn raus: Er bekommt in Schritt 4 seinen eigenen Raum.</span></div>` : t.length > 80 ? '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Reiner Traumraum – kein Einwand weit und breit.</span></div>' : '';
    }
    function renderDreams() {
        $('wd-dreams').innerHTML = `
            ${S.dreams.map((d, i) => `<div class="mk-row wd-dream"><span class="wd-num d">${i + 1}</span><input class="mk-input grow" data-dt="${d.id}" value="${esc(d.text)}" placeholder="Ein Element der Vision"><button class="mk-iconbtn" data-dr="${d.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>`).join('')}
            <div class="wd-add"><input class="mk-input" id="wd-dream-in" placeholder="Neues Traum-Element" maxlength="140"><button class="mk-btn mk-btn-primary" id="wd-dream-add" aria-label="Traum-Element hinzufügen"><i class="fas fa-plus"></i></button></div>
            ${dreams().length < 3 ? `<div class="mk-faint" style="margin-top:8px">Drei bis sechs Elemente sind ideal – du hast ${dreams().length}.</div>` : ''}`;
        const add = () => { const v = $('wd-dream-in').value.trim(); if (!v) return; S.dreams.push({ id: MethodKit.uid(), text: v }); MethodKit.save(); renderDreams(); $('wd-dream-in').focus(); };
        $('wd-dream-add').addEventListener('click', add); $('wd-dream-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
        $('wd-dreams').querySelectorAll('[data-dt]').forEach(el => el.addEventListener('input', () => { const d = S.dreams.find(x => x.id === el.dataset.dt); if (d) { d.text = el.value; MethodKit.save(); } }));
        $('wd-dreams').querySelectorAll('[data-dr]').forEach(b => b.addEventListener('click', () => { S.dreams = S.dreams.filter(x => x.id !== b.dataset.dr); delete S.plans[b.dataset.dr]; delete S.crits[b.dataset.dr]; MethodKit.save(); renderDreams(); }));
    }

    /* ---------- 3 · Realist ---------- */
    function renderPlans() {
        const D = dreams();
        if (!D.length) { $('wd-plans').innerHTML = '<div class="mk-empty">Lege im Träumer-Schritt Elemente an – der Realist plant pro Element.</div>'; return; }
        $('wd-plans').innerHTML = D.map((d, i) => { const p = planOf(d.id); return `<div class="wd-plan"><div class="wd-plan-h"><span class="wd-num d">${i + 1}</span><strong>${esc(d.text)}</strong></div>
            <div class="mk-field"><label>Wie genau? Die ersten konkreten Schritte</label><textarea class="mk-textarea" data-pf="how" data-pid="${d.id}" placeholder="1. … 2. … 3. …">${esc(p.how || '')}</textarea></div>
            <div class="mk-grid-3">
                <div class="mk-field"><label>Was braucht es?</label><input class="mk-input" data-pf="needs" data-pid="${d.id}" value="${esc(p.needs || '')}" placeholder="Geld, Zeit, Wissen, Werkzeug"></div>
                <div class="mk-field"><label>Wer hilft?</label><input class="mk-input" data-pf="who" data-pid="${d.id}" value="${esc(p.who || '')}" placeholder="Personen, Partner"></div>
                <div class="mk-field"><label>Bis wann?</label><input class="mk-input" data-pf="when" data-pid="${d.id}" value="${esc(p.when || '')}" placeholder="Meilenstein"></div>
            </div>
            ${(p.how || '').match(CRITIC_WORDS) ? '<div class="mk-note warn"><i class="fas fa-door-open"></i><span>Da bewertet jemand. Der Realist fragt nur „wie" – das „ob" kommt im nächsten Raum.</span></div>' : ''}</div>`; }).join('');
        $('wd-plans').querySelectorAll('[data-pf]').forEach(el => { el.addEventListener('input', () => { planOf(el.dataset.pid)[el.dataset.pf] = el.value; MethodKit.save(); renderResources(); }); if (el.dataset.pf === 'how') el.addEventListener('change', renderPlans); });
        MethodKit._autosizeAll();
    }
    function renderResources() {
        const D = dreams(); const needs = D.map(d => planOf(d.id).needs).filter(Boolean), who = [...new Set(D.map(d => planOf(d.id).who).filter(Boolean).flatMap(x => x.split(/,|;/).map(s => s.trim())).filter(Boolean))];
        const planned = D.filter(d => (planOf(d.id).how || '').trim()).length;
        $('wd-resources').innerHTML = D.length ? `<div class="wd-res"><div><b>${planned}/${D.length}</b><span>Elemente geplant</span></div><div><b>${needs.length}</b><span>Ressourcen-Einträge</span></div><div><b>${who.length}</b><span>Beteiligte</span></div></div>
            ${who.length ? `<div class="mk-chips">${who.map(w => `<span class="mk-chip">${esc(w)}</span>`).join('')}</div>` : ''}
            ${planned === D.length && D.length ? '<div class="mk-note ok" style="margin-top:10px"><i class="fas fa-check-circle"></i><span>Alle Elemente haben einen Plan. Der Kritiker darf kommen.</span></div>' : ''}` : '';
    }

    /* ---------- 4 · Kritiker ---------- */
    function renderCritics() {
        const D = dreams().filter(d => (planOf(d.id).how || '').trim());
        if (!D.length) { $('wd-critics').innerHTML = '<div class="mk-empty">Der Kritiker prüft Pläne, keine Träume. Erst planen (Schritt 3), dann kritisieren.</div>'; return; }
        $('wd-critics').innerHTML = `<div class="mk-section-label">Kritiker-Fragen</div><div class="mk-chips" style="margin-bottom:14px">${CRITIC_PROMPTS.map(p => `<span class="mk-chip">${esc(p)}</span>`).join('')}</div>` +
            D.map((d, i) => { const p = planOf(d.id), C = critsOf(d.id); return `<div class="wd-crit"><div class="wd-plan-h"><span class="wd-num d">${dreams().indexOf(d) + 1}</span><div><strong>${esc(d.text)}</strong><div class="mk-faint">${esc((p.how || '').slice(0, 120))}${(p.how || '').length > 120 ? '…' : ''}</div></div></div>
                ${C.map(c => `<div class="wd-crit-row"><input class="mk-input" data-ct="${c.id}" data-did="${d.id}" value="${esc(c.text)}" placeholder="Was fehlt / was passiert, wenn …?"><div class="wd-sev">${[1, 2, 3].map(s => `<button class="${n(c.sev, 2) === s ? 'on s' + s : ''}" data-cs="${c.id}" data-did="${d.id}" data-s="${s}" title="${SEV[s]}">${s}</button>`).join('')}</div><button class="mk-iconbtn" data-cr="${c.id}" data-did="${d.id}" aria-label="Entfernen"><i class="fas fa-times"></i></button></div>${c.text && !/\?|was|wie|wer|wann|falls|wenn|fehlt/i.test(c.text) ? '<div class="mk-note info"><i class="fas fa-info-circle"></i><span>Formuliere die Kritik als Frage – dann kann der Realist sie in Runde 2 beantworten.</span></div>' : ''}`).join('')}
                <button class="mk-btn mk-btn-outline mk-btn-sm" data-ca="${d.id}"><i class="fas fa-plus"></i> Kritikpunkt</button></div>`; }).join('');
        $('wd-critics').querySelectorAll('[data-ca]').forEach(b => b.addEventListener('click', () => { critsOf(b.dataset.ca).push({ id: MethodKit.uid(), text: '', sev: 2 }); MethodKit.save(); renderCritics(); renderRisk(); const i = $('wd-critics').querySelectorAll(`[data-did="${b.dataset.ca}"][data-ct]`); i[i.length - 1].focus(); }));
        $('wd-critics').querySelectorAll('[data-ct]').forEach(el => { el.addEventListener('input', () => { const c = critsOf(el.dataset.did).find(x => x.id === el.dataset.ct); if (c) { c.text = el.value; MethodKit.save(); } }); el.addEventListener('change', () => { renderCritics(); renderRisk(); }); });
        $('wd-critics').querySelectorAll('[data-cs]').forEach(b => b.addEventListener('click', () => { const c = critsOf(b.dataset.did).find(x => x.id === b.dataset.cs); if (c) { c.sev = +b.dataset.s; MethodKit.save(); renderCritics(); renderRisk(); } }));
        $('wd-critics').querySelectorAll('[data-cr]').forEach(b => b.addEventListener('click', () => { S.crits[b.dataset.did] = critsOf(b.dataset.did).filter(x => x.id !== b.dataset.cr); MethodKit.save(); renderCritics(); renderRisk(); }));
    }
    function renderRisk() {
        const all = dreams().flatMap(d => critsOf(d.id).filter(c => c.text.trim()).map(c => ({ ...c, d })));
        if (!all.length) { $('wd-risk').innerHTML = '<div class="mk-empty">Noch keine Kritikpunkte. Ein Plan ohne Kritik ist meist ein ungeprüfter Plan.</div>'; return; }
        const high = all.filter(c => n(c.sev, 2) === 3);
        const byD = dreams().map(d => ({ d, k: critsOf(d.id).filter(c => c.text.trim()).reduce((a, c) => a + n(c.sev, 2), 0) })).sort((a, b) => b.k - a.k);
        $('wd-risk').innerHTML = `<div class="wd-res"><div><b>${all.length}</b><span>Kritikpunkte</span></div><div><b class="${high.length ? 'hi' : ''}">${high.length}</b><span>hohes Risiko</span></div><div><b>${byD[0].k ? dreams().indexOf(byD[0].d) + 1 : '–'}</b><span>kritischstes Element</span></div></div>
            ${high.length ? `<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>Hohe Risiken: ${high.map(c => `<em>${esc(c.text)}</em>`).join(' · ')} – die beantwortet der Realist in Runde 2 zuerst.</span></div>` : '<div class="mk-note ok"><i class="fas fa-check-circle"></i><span>Keine hohen Risiken – oder war der Kritiker zu freundlich?</span></div>'}`;
    }

    /* ---------- 5 · Synthese ---------- */
    function renderRound2() {
        const all = dreams().flatMap(d => critsOf(d.id).filter(c => c.text.trim()).map(c => ({ c, d }))).sort((a, b) => n(b.c.sev, 2) - n(a.c.sev, 2));
        if (!all.length) { $('wd-round2').innerHTML = '<div class="mk-empty">Keine Kritikpunkte – nichts zu beantworten. Prüfe, ob der Kritiker (Schritt 4) wirklich zu Wort kam.</div>'; return; }
        const answered = all.filter(x => (x.c.answer || '').trim()).length;
        $('wd-round2').innerHTML = `<div class="mk-faint" style="margin-bottom:10px">${answered}/${all.length} Kritikpunkte beantwortet</div>` + all.map(({ c, d }) => `<div class="wd-r2 s${n(c.sev, 2)}"><div class="wd-r2-q"><span class="mk-badge">🔍 ${SEV[n(c.sev, 2)]}</span> ${esc(c.text)}<div class="mk-faint">zu: ${esc(d.text)}</div></div>
            <div class="wd-r2-a"><span class="tag">🛠️</span><input class="mk-input" data-ans="${c.id}" data-did="${d.id}" value="${esc(c.answer || '')}" placeholder="Antwort des Realisten – Anpassung, Absicherung, oder: zurück zum Träumer"></div>
            <div class="wd-r2-dec">${[['keep', 'Plan hält'], ['adjust', 'Plan anpassen'], ['drop', 'Element streichen']].map(([k, l]) => `<button class="${c.dec === k ? 'on ' + k : ''}" data-dec="${c.id}" data-did="${d.id}" data-k="${k}">${l}</button>`).join('')}</div></div>`).join('');
        $('wd-round2').querySelectorAll('[data-ans]').forEach(el => el.addEventListener('input', () => { const c = critsOf(el.dataset.did).find(x => x.id === el.dataset.ans); if (c) { c.answer = el.value; MethodKit.save(); renderRecap(); } }));
        $('wd-round2').querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => { const c = critsOf(b.dataset.did).find(x => x.id === b.dataset.dec); if (c) { c.dec = c.dec === b.dataset.k ? '' : b.dataset.k; MethodKit.save(); renderRound2(); renderRecap(); } }));
    }
    function renderRecap() {
        const D = dreams();
        $('wd-recap').innerHTML = `<div class="mk-result" style="margin-bottom:12px"><h4>💡 Idee</h4>${esc(S.idea) || '–'}${S.horizon ? ' <span class="mk-badge">' + esc(S.horizon) + '</span>' : ''}</div>
            ${D.length ? `<div class="wd-table">${D.map((d, i) => { const p = planOf(d.id), C = critsOf(d.id).filter(c => c.text.trim()); const dropped = C.some(c => c.dec === 'drop'); const adj = C.some(c => c.dec === 'adjust'); return `<div class="wd-tr ${dropped ? 'drop' : adj ? 'adj' : ''}"><div class="c d"><span class="wd-num d">${i + 1}</span>${esc(d.text)}</div><div class="c r">${esc((p.how || '–').slice(0, 140))}${p.when ? '<br><small>bis ' + esc(p.when) + '</small>' : ''}</div><div class="c k">${C.length ? C.map(c => `<div>${c.dec === 'drop' ? '✂️' : c.dec === 'adjust' ? '🔧' : c.dec === 'keep' ? '✅' : '•'} ${esc(c.text)}${c.answer ? '<br><small>→ ' + esc(c.answer) + '</small>' : ''}</div>`).join('') : '<small>keine Kritik</small>'}</div></div>`; }).join('')}</div>` : '<div class="mk-empty">Noch keine Elemente.</div>'}`;
    }
    function renderLinks() { $('wd-links').innerHTML = LINKS.map(l => `<a class="mk-option wd-link" href="${l.l}"><span class="t">${esc(l.m)}</span><span class="d">${esc(l.why)}</span></a>`).join(''); }
    function exportAll() {
        const L = ['WALT-DISNEY-METHODE', '='.repeat(40), 'Exportiert: ' + new Date().toLocaleString('de-CH'), '', 'IDEE', (S.idea || '–') + (S.horizon ? ' [' + S.horizon + ']' : ''), '', '💭 TRÄUMER', S.dreamer || '', ''];
        dreams().forEach((d, i) => { const p = planOf(d.id), C = critsOf(d.id).filter(c => c.text.trim()); L.push(`${i + 1}. ${d.text}`, p.how ? '   🛠️ Wie: ' + p.how.replace(/\n/g, ' ') : '', p.needs ? '   Braucht: ' + p.needs : '', p.who ? '   Wer: ' + p.who : '', p.when ? '   Bis: ' + p.when : ''); C.forEach(c => L.push(`   🔍 [${SEV[n(c.sev, 2)]}] ${c.text}${c.answer ? ' → ' + c.answer : ''}${c.dec ? ' (' + { keep: 'hält', adjust: 'anpassen', drop: 'streichen' }[c.dec] + ')' : ''}`)); L.push(''); });
        L.push('✨ SYNTHESE', S.synthesis || '–', S.first ? 'Erster Schritt: ' + S.first : '');
        MethodKit.exportText('walt-disney-plan.txt', L.filter(x => x !== '').join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'walt-disney', accent: '#8b5cf6', accent2: '#ec4899',
            steps: [{ icon: '💡', label: 'Idee' }, { icon: '💭', label: 'Träumer' }, { icon: '🛠️', label: 'Realist' }, { icon: '🔍', label: 'Kritiker' }, { icon: '✨', label: 'Synthese' }],
            defaultState: { idea: '', horizon: '', dreamer: '', dreams: [], plans: {}, crits: {}, synthesis: '', first: '' }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.dreams)) S.dreams = []; ['plans', 'crits'].forEach(k => { if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {}; });
        // Migration: alte Freitexte realist/critic
        if (typeof S.realist === 'string') { if (S.realist.trim()) { if (!S.dreams.length) S.dreams.push({ id: MethodKit.uid(), text: 'Übernommen aus alter Version' }); planOf(S.dreams[0].id).how = planOf(S.dreams[0].id).how || S.realist; } delete S.realist; }
        if (typeof S.critic === 'string') { if (S.critic.trim() && S.dreams.length) critsOf(S.dreams[0].id).push({ id: MethodKit.uid(), text: S.critic.trim().slice(0, 160), sev: 2 }); delete S.critic; }

        MethodKit.bindFields();
        $('wd-dreamtext').addEventListener('input', renderDCheck);
        MethodKit.onStep = function (k) {
            if (k === 2) { renderDPrompts(); renderDCheck(); renderDreams(); }
            if (k === 3) { renderPlans(); renderResources(); }
            if (k === 4) { renderCritics(); renderRisk(); }
            if (k === 5) { renderRound2(); renderRecap(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
        $('wd-export').addEventListener('click', exportAll);
    })();
})();
