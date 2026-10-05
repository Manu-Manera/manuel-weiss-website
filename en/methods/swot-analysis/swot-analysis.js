/* Persönliche SWOT-Analyse · Logik */
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    let S;

    const Q = {
        S: { t: 'Strengths', ic: '💪', c: '#10b981', side: 'in', q: ['What comes more easily to you than to others?', 'What are you asked for?', 'What experience, what knowledge do you bring?'], ph: 'e.g. I explain complex things clearly' },
        W: { t: 'Weaknesses', ic: '🧩', c: '#f59e0b', side: 'in', q: ['What do you avoid?', 'Where do you need more time or help?', 'Which feedback do you hear repeatedly?'], ph: 'e.g. I delegate poorly' },
        O: { t: 'Opportunities', ic: '🌱', c: '#3b82f6', side: 'out', q: ['What is changing in your environment that could help you?', 'Which doors are open right now?', 'Who could you draw on?'], ph: 'e.g. The department is growing, new roles are emerging' },
        T: { t: 'Threats', ic: '⚠️', c: '#ef4444', side: 'out', q: ['What could cross your plans?', 'Which trends run against you?', 'What do you depend on?'], ph: 'e.g. A reorg could cut the role' }
    };
    const SCOPES = [['job', '💼 Work / career'], ['project', '🚀 Project / venture'], ['self', '🧭 Me as a person'], ['biz', '🏢 Self-employment']];
    const TOWS = [
        ['so', 'SO · Expand', 'S', 'O', 'Which strength uses which opportunity?', 'With … I use … by …'],
        ['st', 'ST · Protect', 'S', 'T', 'Which strength defuses which threat?', 'Against … I use … by …'],
        ['wo', 'WO · Catch up', 'W', 'O', 'Which opportunity helps overcome a weakness?', 'I use … to improve … by …'],
        ['wt', 'WT · Avoid', 'W', 'T', 'Where do weakness and threat meet – and what do you do about it?', 'So that … does not amplify …, I will …']
    ];
    const LINKS = [
        { m: 'Goal setting', l: '../goal-setting/goal-setting.html', why: 'Turn actions into measurable goals.' },
        { m: 'Finding strengths', l: '../strengths-finder/strengths-finder.html', why: 'Fill the S field more thoroughly.' },
        { m: 'Competence map', l: '../competence-map/competence-map.html', why: 'Plan weaknesses as learning fields.' },
        { m: 'Rubicon model', l: '../rubikon-model/rubikon-model.html', why: 'From the decision into action.' }
    ];
    const note = (t, m) => `<div class="mk-note ${t}"><i class="fas fa-${t === 'warn' ? 'exclamation-triangle' : t === 'ok' ? 'check-circle' : 'info-circle'}"></i><span>${m}</span></div>`;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) ? d : x; };
    const items = (k) => S.items.filter(i => i.q === k);
    const sum = (k) => items(k).reduce((a, i) => a + n(i.w, 2), 0);
    const top = (k, m) => [...items(k)].sort((a, b) => n(b.w, 2) - n(a.w, 2)).slice(0, m || 2);
    const INT = /\b(ich kann|ich bin|ich habe|mir fällt|meine?|mich|mir)\b/i;
    const EXT = /\b(markt|branche|trend|firma|unternehmen|chef|team|wirtschaft|ki\b|digitalisierung|konkurrenz|gesetz|umstrukturierung|kunden|nachfrage)\b/i;

    /* ---------- 1 ---------- */
    function renderScope() {
        $('sw-scope').innerHTML = SCOPES.map(([k, t]) => `<button class="mk-chip ${S.scope === k ? 'selected' : ''}" data-sc="${k}">${t}</button>`).join('');
        $('sw-scope').querySelectorAll('[data-sc]').forEach(b => b.addEventListener('click', () => { S.scope = b.dataset.sc; MethodKit.save(); renderScope(); }));
    }
    function renderContextNote() {
        const c = (S.context || '').trim();
        $('sw-context-note').innerHTML = !c ? '' : c.length < 15 ? note('info', 'Still too short – what exactly is it about?') : !/\?|soll|ob |wie |was |welche/i.test(c) ? note('info', 'Phrase it as a question: “Should I …?”, “How do I …?”, “Which path …?” A SWOT answers questions, not topics.') : /und|oder/.test(c) && c.length > 90 ? note('info', 'That sounds like two questions. One SWOT per question – otherwise the fields mix.') : note('ok', 'Clear question. Everything you collect now, you rate in relation to it.');
    }

    /* ---------- 2 ---------- */
    function renderGrid() {
        const cell = (k) => { const q = Q[k]; return `<div class="sw-cell" style="--c:${q.c}"><div class="sw-cell-h"><span>${q.ic}</span><b>${q.t}</b><small>${q.side === 'in' ? 'innen · jetzt' : 'aussen · künftig'}</small><span class="mk-badge">${items(k).length}</span></div><ul class="sw-qs">${q.q.map(x => `<li>${x}</li>`).join('')}</ul><div class="sw-items">${items(k).map(i => `<div class="sw-item"><span class="sw-item-t">${esc(i.text)}</span><div class="sw-w">${[1, 2, 3].map(w => `<button class="${n(i.w, 2) >= w ? 'on' : ''}" data-w="${i.id}" data-v="${w}" aria-label="Weight ${w}">●</button>`).join('')}</div><button class="mk-iconbtn" data-del="${i.id}" aria-label="Remove"><i class="fas fa-times"></i></button>${sideWarn(i)}</div>`).join('')}</div><div class="sw-add"><input class="mk-input" data-in="${k}" placeholder="${q.ph}"><button class="mk-btn mk-btn-outline mk-btn-sm" data-addbtn="${k}" aria-label="Add"><i class="fas fa-plus"></i></button></div></div>`; };
        $('sw-grid').innerHTML = `<div class="sw-axis-x"><span>Helpful</span><span>Hindering</span></div><div class="sw-matrix">${cell('S')}${cell('W')}${cell('O')}${cell('T')}</div>` + gridNote();
        const host = $('sw-grid');
        const add = (k, v) => { v = (v || '').trim(); if (!v) return; S.items.push({ id: MethodKit.uid(), q: k, text: v, w: 2 }); MethodKit.save(); renderGrid(); const i = host.querySelector(`[data-in="${k}"]`); i && i.focus(); };
        host.querySelectorAll('[data-addbtn]').forEach(b => b.addEventListener('click', () => add(b.dataset.addbtn, host.querySelector(`[data-in="${b.dataset.addbtn}"]`).value)));
        host.querySelectorAll('[data-in]').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(i.dataset.in, i.value); } }));
        host.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { S.items.find(i => i.id === b.dataset.w).w = +b.dataset.v; MethodKit.save(); renderGrid(); }));
        host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { S.items = S.items.filter(i => i.id !== b.dataset.del); MethodKit.save(); renderGrid(); }));
    }
    function sideWarn(i) {
        const q = Q[i.q];
        if (q.side === 'out' && INT.test(i.text) && !EXT.test(i.text)) return `<small class="sw-side">↑ sounds like inside (${q.t === 'Chancen' ? 'Stärke' : 'Schwäche'}?)</small>`;
        if (q.side === 'in' && EXT.test(i.text) && !INT.test(i.text)) return `<small class="sw-side">↓ sounds like outside (${q.t === 'Stärken' ? 'Chance' : 'Risiko'}?)</small>`;
        return '';
    }
    function gridNote() {
        const c = { S: items('S').length, W: items('W').length, O: items('O').length, T: items('T').length };
        const total = c.S + c.W + c.O + c.T;
        if (total < 4) return note('info', 'At least two points per field. The guiding questions help – and ask someone who knows you.');
        if (c.S >= 4 && c.W <= 1) return note('info', `${c.S} strengths, ${c.W} Weakness${c.W === 1 ? '' : 'n'}. Either you are nearly perfect – or being more honest about the weaknesses would be more useful. Which feedback do you hear again and again?`);
        if (c.W >= 4 && c.S <= 1) return note('warn', `${c.W} weaknesses, ${c.S} Strength${c.S === 1 ? '' : 'n'}. That is rarely realistic – more likely a strict inner critic. What would someone who values you say?`);
        if (!c.O && !c.T) return note('info', 'The outer half is empty. What is changing around you – in the company, in the industry, in your environment? Without an outside view the SWOT stays a self-description.');
        if (!c.T) return note('info', 'No threats? Ask: What would have to happen for my plan to fail? What do I depend on?');
        if (!c.O) return note('info', 'No opportunities? What is growing, what is opening, who do you know who could open a door for you?');
        if (S.items.every(i => n(i.w, 2) === 2)) return note('info', 'Everything weighted the same. Which two points really decide your question? Give them three points.');
        return note('ok', `${total} points, all fields filled. On to the position.`);
    }

    /* ---------- 3 ---------- */
    function position() {
        const si = sum('S') - sum('W'), so = sum('O') - sum('T');
        const key = si >= 0 && so >= 0 ? 'off' : si >= 0 && so < 0 ? 'def' : si < 0 && so >= 0 ? 'catch' : 'surv';
        const P = {
            off: ['Offensive', '🚀', 'Strengths and opportunities dominate. This is the position for bold steps: expand, apply, start. Main risk: overconfidence – still check the WT corner.'],
            def: ['Protect', '🛡️', 'You are strong, but the environment is rough. Use your strengths to defuse threats before you expand. Build alternatives before you need them.'],
            catch: ['Catch up', '🧗', 'The environment is favorable, but you are not ready yet. Now tackle the weaknesses that stand between you and the opportunity – with a date.'],
            surv: ['Stabilize', '⚓', 'Weaknesses and threats dominate. No big leaps: First minimize threats, get support, one weakness at a time. Then reassess.']
        }[key];
        return { si, so, key, label: P[0], ic: P[1], text: P[2] };
    }
    function renderPosition() {
        if (S.items.length < 4) { $('sw-position').innerHTML = note('info', 'Fill the four fields in step 2.'); return; }
        const p = position(); const mx = Math.max(6, Math.abs(p.si), Math.abs(p.so));
        $('sw-position').innerHTML = `<div class="sw-pos"><div class="sw-pos-chart"><div class="sw-pos-grid"><span class="q q1">Catch up</span><span class="q q2">Offensive</span><span class="q q3">Stabilize</span><span class="q q4">Protect</span><i class="sw-dot" style="left:${50 + p.si / mx * 45}%; top:${50 - p.so / mx * 45}%"></i></div><div class="sw-pos-ax"><span>← Weaknesses</span><span>Strengths →</span></div></div><div class="sw-pos-txt"><div class="sw-pos-l">${p.ic} ${p.label}</div><p>${p.text}</p><div class="sw-pos-n"><span>Inside (S−W): <b>${p.si > 0 ? '+' : ''}${p.si}</b></span><span>Outside (O−T): <b>${p.so > 0 ? '+' : ''}${p.so}</b></span></div></div></div>` +
            (S.context ? `<div class="mk-faint" style="font-size:13px; margin-top:8px">Related to: “${esc(S.context)}"</div>` : '');
    }
    function renderTows() {
        if (S.items.length < 4) { $('sw-tows').innerHTML = ''; return; }
        const p = position(); const main = { off: 'so', def: 'st', catch: 'wo', surv: 'wt' }[p.key];
        $('sw-tows').innerHTML = TOWS.map(([k, t, a, b, q, tpl]) => `<div class="sw-tows ${k === main ? 'main' : ''}" style="--a:${Q[a].c}; --b:${Q[b].c}"><div class="sw-tows-h"><b>${t}</b>${k === main ? '<span class="mk-badge">deine Hauptstrategie</span>' : ''}</div><div class="sw-tows-src"><div><small>${Q[a].ic} ${Q[a].t}</small>${top(a).map(i => `<span>${esc(i.text)}</span>`).join('') || '<span class="mk-faint">–</span>'}</div><div><small>${Q[b].ic} ${Q[b].t}</small>${top(b).map(i => `<span>${esc(i.text)}</span>`).join('') || '<span class="mk-faint">–</span>'}</div></div><div class="mk-field"><label>${q}</label><textarea class="mk-textarea" rows="2" data-strat="${k}" placeholder="${tpl}">${esc((S.strat || {})[k] || '')}</textarea></div></div>`).join('') + towsNote(main);
        $('sw-tows').querySelectorAll('[data-strat]').forEach(t => { t.addEventListener('input', () => { S.strat = S.strat || {}; S.strat[t.dataset.strat] = t.value; MethodKit.save(); }); t.addEventListener('change', () => { const m = $('sw-tows').querySelector('.mk-note'); if (m) m.outerHTML = towsNote(main); }); });
        MethodKit._autosizeAll && MethodKit._autosizeAll();
    }
    function towsNote(main) {
        const st = S.strat || {}, f = TOWS.filter(([k]) => (st[k] || '').trim()).length;
        if (!f) return note('info', `Start with your main strategy (${TOWS.find(([k]) => k === main)[1]}). Ein Satz, der eine Stärke/Schwäche mit einer Chance/einem Risiko verbindet.`);
        if (!(st[main] || '').trim()) return note('info', `The main strategy ${TOWS.find(([k]) => k === main)[1]} is still missing – it fits your position best.`);
        const weak = TOWS.filter(([k]) => (st[k] || '').trim() && !/indem|durch|mit|um .* zu|indem ich/i.test(st[k]));
        if (weak.length) return note('info', `${weak.map(x => x[1].split(' ·')[0]).join(', ')}: No “how” yet. Add “… by …” – otherwise it stays an intention.`);
        if (f < 4) return note('ok', `${f}/4 strategies. The rest are optional – but the WT corner is always worth a look.`);
        return note('ok', 'All four strategies written. Now they become action.');
    }

    /* ---------- 4 ---------- */
    function renderActions() {
        const st = S.strat || {}; const avail = TOWS.filter(([k]) => (st[k] || '').trim());
        if (!avail.length) { $('sw-actions').innerHTML = note('info', 'Write at least one strategy in step 3.'); return; }
        const p = S.items.length >= 4 ? position() : null; const main = p ? { off: 'so', def: 'st', catch: 'wo', surv: 'wt' }[p.key] : null;
        $('sw-actions').innerHTML = avail.map(([k, t]) => `<div class="sw-act-grp"><div class="sw-tows-h"><b>${t}</b><span class="mk-faint">${esc(st[k].trim().slice(0, 90))}${st[k].trim().length > 90 ? '…' : ''}</span></div>${S.actions.filter(a => a.strat === k).map(a => `<div class="sw-act"><input class="mk-input" data-at="${a.id}" value="${esc(a.text)}" placeholder="What exactly do you do?"><input class="mk-input sw-by" data-by="${a.id}" value="${esc(a.by || '')}" placeholder="by when"><div class="sw-prio">${[['A', 'now'], ['B', 'bald'], ['C', 'später']].map(([pv, pl]) => `<button class="${a.prio === pv ? 'on' : ''}" data-prio="${a.id}" data-v="${pv}" title="${pl}">${pv}</button>`).join('')}</div><button class="mk-iconbtn" data-adel="${a.id}" aria-label="Remove"><i class="fas fa-times"></i></button></div>`).join('')}<button class="mk-btn mk-btn-outline mk-btn-sm" data-aadd="${k}"><i class="fas fa-plus"></i> Action</button></div>`).join('') + actNote(main);
        const host = $('sw-actions');
        host.querySelectorAll('[data-aadd]').forEach(b => b.addEventListener('click', () => { S.actions.push({ id: MethodKit.uid(), strat: b.dataset.aadd, text: '', by: '', prio: 'B' }); MethodKit.save(); renderActions(); const last = host.querySelectorAll(`[data-at]`); last.length && last[last.length - 1].focus(); }));
        host.querySelectorAll('[data-at]').forEach(i => { i.addEventListener('input', () => { S.actions.find(a => a.id === i.dataset.at).text = i.value; MethodKit.save(); }); i.addEventListener('change', renderActions); });
        host.querySelectorAll('[data-by]').forEach(i => { i.addEventListener('input', () => { S.actions.find(a => a.id === i.dataset.by).by = i.value; MethodKit.save(); }); i.addEventListener('change', renderActions); });
        host.querySelectorAll('[data-prio]').forEach(b => b.addEventListener('click', () => { S.actions.find(a => a.id === b.dataset.prio).prio = b.dataset.v; MethodKit.save(); renderActions(); }));
        host.querySelectorAll('[data-adel]').forEach(b => b.addEventListener('click', () => { S.actions = S.actions.filter(a => a.id !== b.dataset.adel); MethodKit.save(); renderActions(); }));
    }
    function actNote(main) {
        const A = S.actions.filter(a => (a.text || '').trim());
        if (!A.length) return note('info', 'One or two actions per strategy. Concrete: verb + object + date.');
        if (main && !A.some(a => a.strat === main)) return note('info', `No action yet for your main strategy (${TOWS.find(([k]) => k === main)[1]}).`);
        const noBy = A.filter(a => !(a.by || '').trim());
        if (noBy.length) return note('info', `${noBy.length} Action${noBy.length > 1 ? 'n' : ''} without a date. Without “by when” it does not happen.`);
        const asCount = A.filter(a => a.prio === 'A').length;
        if (asCount > 3) return note('warn', `${asCount} A priorities. More than three “now” means: none is now. Which two are really first?`);
        if (!asCount) return note('info', 'No A priority. What do you do in the next seven days?');
        return note('ok', `${A.length} Action${A.length > 1 ? 'n' : ''}, ${asCount} of them immediately. That is a SWOT with consequence.`);
    }

    /* ---------- 5 ---------- */
    function renderSummary() {
        if (S.items.length < 4) { $('sw-summary').innerHTML = note('info', 'Still too little material.'); return; }
        const p = position(); const A = S.actions.filter(a => (a.text || '').trim()).sort((a, b) => (a.prio || 'B').localeCompare(b.prio || 'B'));
        $('sw-summary').innerHTML = `${S.context ? `<div class="sw-q">${esc(S.context)}</div>` : ''}<div class="sw-sum-grid">${['S', 'W', 'O', 'T'].map(k => `<div style="--c:${Q[k].c}"><b>${Q[k].ic} ${Q[k].t}</b>${top(k, 3).map(i => `<span>${esc(i.text)}${n(i.w, 2) === 3 ? ' <em>●●●</em>' : ''}</span>`).join('') || '<span class="mk-faint">–</span>'}</div>`).join('')}</div><div class="mk-result"><h4>${p.ic} Position: ${p.label}</h4>${p.text}</div>${A.length ? `<div class="mk-result"><h4>Massnahmen</h4><ul class="sw-ul">${A.map(a => `<li><b class="sw-p${a.prio}">${a.prio}</b> ${esc(a.text)}${a.by ? ` <small>bis ${esc(a.by)}</small>` : ''}</li>`).join('')}</ul></div>` : ''}`;
    }
    function renderLinks() { $('sw-links').innerHTML = LINKS.map(x => `<a class="mk-option sw-link" href="${x.l}"><span class="t">${x.m}</span><span class="d">${x.why}</span></a>`).join(''); }
    function exportAll() {
        const L = ['PERSONAL SWOT', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), ''];
        if (S.context) L.push('QUESTION: ' + S.context, ''); ['S', 'W', 'O', 'T'].forEach(k => { L.push(`${Q[k].ic} ${Q[k].t.toUpperCase()}`); items(k).sort((a, b) => n(b.w, 2) - n(a.w, 2)).forEach(i => L.push(`  ${'●'.repeat(n(i.w, 2))} ${i.text}`)); L.push(''); });
        if (S.items.length >= 4) { const p = position(); L.push(`POSITION: ${p.label} (innen ${p.si}, outside ${p.so})`, p.text, ''); }
        const st = S.strat || {}; if (Object.values(st).some(v => (v || '').trim())) { L.push('STRATEGIES'); TOWS.forEach(([k, t]) => { if ((st[k] || '').trim()) L.push(`  ${t}: ${st[k].trim()}`); }); L.push(''); }
        const A = S.actions.filter(a => (a.text || '').trim()); if (A.length) { L.push('ACTIONS'); A.sort((a, b) => (a.prio || 'B').localeCompare(b.prio || 'B')).forEach(a => L.push(`  [${a.prio}] ${a.text}${a.by ? ` – bis ${a.by}` : ''}`)); L.push(''); }
        if (S.answer) L.push('ANSWER', S.answer);
        MethodKit.exportText('swot-analyse.txt', L.join('\n'));
    }

    (async function () {
        await MethodKit.init({
            method: 'swot-analysis', accent: '#3b82f6', accent2: '#06b6d4',
            steps: [{ icon: '❓', label: 'Question' }, { icon: '▦', label: 'Fields' }, { icon: '♟️', label: 'Strategic' }, { icon: '🏁', label: 'Actions' }, { icon: '✅', label: 'Answer' }],
            defaultState: { scope: '', context: '', horizon: '', items: [], strat: { so: '', st: '', wo: '', wt: '' }, actions: [], answer: '' }
        });
        S = MethodKit.state;
        if (!Array.isArray(S.items)) S.items = [];
        // Migration: alte S/W/O/T-String-Arrays
        ['S', 'W', 'O', 'T'].forEach(k => { if (Array.isArray(S[k])) { S[k].forEach(t => { const text = typeof t === 'string' ? t : (t && t.text) || ''; if (text && !S.items.some(i => i.q === k && i.text === text)) S.items.push({ id: MethodKit.uid(), q: k, text, w: 2 }); }); delete S[k]; } });
        if (!S.strat || typeof S.strat !== 'object') S.strat = {}; if (!Array.isArray(S.actions)) S.actions = [];
        MethodKit.bindFields();
        $('sw-context').addEventListener('input', renderContextNote);
        $('sw-export').addEventListener('click', exportAll);
        MethodKit.onStep = function (k) {
            if (k === 1) { renderScope(); renderContextNote(); }
            if (k === 2) renderGrid();
            if (k === 3) { renderPosition(); renderTows(); }
            if (k === 4) renderActions();
            if (k === 5) { renderSummary(); renderLinks(); }
        };
        MethodKit.onStep(MethodKit.step);
    })();
})();
