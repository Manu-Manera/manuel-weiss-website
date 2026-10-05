/* Ikigai · Logik (Kit-basiert) */
(function () {
    'use strict';
    const D = window.IKIGAI_DATA;
    const C = D.CIRCLES;
    const CID = C.map(c => c.id);
    const $ = (id) => document.getElementById(id);
    const esc = (s) => MethodKit.esc(s);
    const byId = (id) => C.find(c => c.id === id);
    let S;

    /* ---------- Helpers ---------- */
    const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    function itemsIn(cid) { return S.items.filter(it => it.c[cid]); }
    function circleCount(it) { return CID.filter(id => it.c[id]).length; }
    function missingOf(it) { return CID.filter(id => !it.c[id]); }
    function addItem(label, cid) {
        const n = norm(label); if (!n) return null;
        let it = S.items.find(x => norm(x.label) === n);
        if (it) { if (it.c[cid]) { MethodKit.toast('Already in', 'warn'); return it; } it.c[cid] = 1; }
        else { it = { id: MethodKit.uid(), label: label.trim(), c: { [cid]: 1 } }; S.items.push(it); }
        MethodKit.save(); return it;
    }
    function filledPrompts(cid) { const t = S.text[cid] || {}; return byId(cid).prompts.filter(p => (t[p.k] || '').trim().length > 2).length; }
    function completeness(cid) {
        const p = filledPrompts(cid) / byId(cid).prompts.length;
        const i = Math.min(itemsIn(cid).length, 5) / 5;
        return Math.round((p * 0.5 + i * 0.5) * 100);
    }
    function zoneItems(ids, exact) {
        return S.items.filter(it => ids.every(id => it.c[id]) && (!exact || circleCount(it) === ids.length));
    }
    const ikigaiItems = () => S.items.filter(it => circleCount(it) === 4);
    const almostItems = () => S.items.filter(it => circleCount(it) === 3);

    /* ---------- Step 1 · Modell & Reflexion ---------- */
    function renderModel() {
        $('ikg-model').innerHTML = `
            <div class="ikg-model-grid">
                ${C.map(c => `<div class="ikg-model-circle" style="--c:${c.color}"><span class="ic">${c.icon}</span><strong>${esc(c.label)}</strong><span class="mk-faint">${esc(c.lead)}</span></div>`).join('')}
            </div>
            <div class="ikg-model-zones">
                ${D.INTERSECTIONS.map(z => { const a = byId(z.of[0]), b = byId(z.of[1]); return `<div class="ikg-zone-pill"><span class="dots"><i style="background:${a.color}"></i><i style="background:${b.color}"></i></span><strong>${z.label}</strong><span>${esc(z.desc)}</span></div>`; }).join('')}
            </div>`;
    }
    function renderReflect() {
        $('ikg-reflect').innerHTML = D.REFLECT.map(r => `
            <div class="mk-field">
                <label for="ikg-r-${r.k}">${esc(r.l)}</label>
                <span class="hint">${esc(r.h)}</span>
                <textarea class="mk-textarea" id="ikg-r-${r.k}" data-r="${r.k}" placeholder="Keywords are enough …">${esc(S.reflect[r.k] || '')}</textarea>
                <div class="ikg-hints">${r.hints.map(h => `<button type="button" class="ikg-hint" data-hint-for="${r.k}" data-hint="${esc(h)}">${esc(h)}</button>`).join('')}</div>
            </div>`).join('');
        $('ikg-reflect').querySelectorAll('textarea').forEach(t => t.addEventListener('input', () => { S.reflect[t.dataset.r] = t.value; MethodKit.save(); }));
        $('ikg-reflect').querySelectorAll('.ikg-hint').forEach(b => b.addEventListener('click', () => {
            const t = $('ikg-r-' + b.dataset.hintFor); const cur = t.value.trim();
            if (cur.toLowerCase().includes(b.dataset.hint.toLowerCase())) return;
            t.value = cur ? cur.replace(/[,\s]+$/, '') + ', ' + b.dataset.hint + ': ' : b.dataset.hint + ': ';
            S.reflect[b.dataset.hintFor] = t.value; MethodKit.save(); t.focus(); MethodKit._autosize(t);
        }));
    }

    /* ---------- Steps 2–5 · Kreise ---------- */
    function renderCircle(cid) {
        const c = byId(cid); const host = $('ikg-circle-' + cid); if (!host) return;
        const txt = S.text[cid] || (S.text[cid] = {});
        const its = itemsIn(cid);
        const link = D.LINKS.find(l => l.for === cid);
        const otherSuggest = S.items.filter(it => !it.c[cid]).slice(0, 8);
        host.innerHTML = `
            <div class="mk-card ikg-circle-head" style="--c:${c.color}">
                <div class="ikg-circle-title"><span class="ic">${c.icon}</span><div><div class="mk-kicker" style="color:var(--c)">Circle ${CID.indexOf(cid) + 1} of 4</div><h2>${esc(c.label)}</h2></div><div class="ikg-complete" title="Completeness"><span>${completeness(cid)}%</span><i style="width:${completeness(cid)}%"></i></div></div>
                <p class="mk-sub" style="margin:10px 0 0;">${esc(c.lead)}</p>
            </div>
            <div class="mk-card">
                <h3>Guiding questions</h3>
                ${c.prompts.map(p => `
                    <div class="mk-field">
                        <label for="ikg-${cid}-${p.k}">${esc(p.l)}</label>
                        <span class="hint">${esc(p.h)}</span>
                        <textarea class="mk-textarea" id="ikg-${cid}-${p.k}" data-k="${p.k}" placeholder="…">${esc(txt[p.k] || '')}</textarea>
                    </div>`).join('')}
            </div>
            <div class="mk-card">
                <h3>Your keywords <span class="ikg-count">${its.length}</span></h3>
                <p class="mk-sub">Condense your answers into keywords – one term per chip. They are the material for the synthesis. Aim for at least 5.</p>
                <div class="ikg-add"><input class="mk-input" id="ikg-add-${cid}" placeholder="e.g. ${esc(c.seeds[0])}" maxlength="60"><button class="mk-btn mk-btn-primary" id="ikg-addbtn-${cid}"><i class="fas fa-plus"></i> Add</button></div>
                <div class="mk-chips ikg-items" id="ikg-items-${cid}" style="margin-top:12px;">${its.length ? its.map(it => `<span class="mk-chip selected ikg-item" style="--c:${c.color}">${esc(it.label)}<button data-rm="${it.id}" aria-label="Remove"><i class="fas fa-times"></i></button></span>`).join('') : '<span class="mk-faint">No keywords yet.</span>'}</div>
                <div class="mk-section-label" style="margin-top:16px;">Suggestions</div>
                <div class="mk-chips">${c.seeds.filter(s => !S.items.some(it => norm(it.label) === norm(s) && it.c[cid])).map(s => `<button class="mk-chip" data-seed="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div>
                ${otherSuggest.length ? `<div class="mk-section-label" style="margin-top:16px;">From your other circles – does it fit here too?</div><div class="mk-chips">${otherSuggest.map(it => `<button class="mk-chip" data-seed="${esc(it.label)}" style="border-style:dashed">+ ${esc(it.label)}</button>`).join('')}</div>` : ''}
            </div>
            ${link ? `<div class="mk-note info"><i class="fas fa-link"></i><span>Vertiefen: <a href="${link.l}"><strong>${esc(link.m)}</strong></a> – ${esc(link.why)}</span></div>` : ''}`;

        host.querySelectorAll('textarea[data-k]').forEach(t => t.addEventListener('input', () => { txt[t.dataset.k] = t.value; MethodKit.save(); }));
        const inp = $('ikg-add-' + cid);
        const add = () => { if (!inp.value.trim()) return; addItem(inp.value, cid); inp.value = ''; renderCircle(cid); $('ikg-add-' + cid).focus(); };
        $('ikg-addbtn-' + cid).addEventListener('click', add);
        inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(); } });
        host.querySelectorAll('[data-seed]').forEach(b => b.addEventListener('click', () => { addItem(b.dataset.seed, cid); renderCircle(cid); }));
        host.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
            const it = S.items.find(x => x.id === b.dataset.rm); if (!it) return;
            delete it.c[cid]; if (!circleCount(it)) S.items = S.items.filter(x => x.id !== it.id);
            MethodKit.save(); renderCircle(cid);
        }));
        MethodKit._autosizeAll();
    }

    /* ---------- Step 6 · Synthese ---------- */
    const POS = { love: [160, 108], good: [108, 160], world: [212, 160], paid: [160, 212] };
    const ZONE_POS = { passion: [118, 116], mission: [202, 116], profession: [118, 204], vocation: [202, 204] };
    const PURE_POS = { love: [160, 62], good: [58, 164], world: [262, 164], paid: [160, 266] };
    const LBL_POS = { love: [160, 12, 'middle'], paid: [160, 326, 'middle'], good: [14, 164, 'end'], world: [306, 164, 'start'] };
    function renderVenn() {
        const r = 88;
        const pure = (id) => zoneItems([id], true).length;
        const zone = (z) => zoneItems(z.of, true).length;
        const center = ikigaiItems().length;
        $('ikg-venn').innerHTML = `
        <svg viewBox="-70 -4 460 340" class="ikg-venn" role="img" aria-label="Ikigai diagram">
            ${C.map(c => `<circle cx="${POS[c.id][0]}" cy="${POS[c.id][1]}" r="${r}" fill="${c.color}" fill-opacity=".16" stroke="${c.color}" stroke-width="1.5"/>`).join('')}
            ${C.map(c => `<text x="${PURE_POS[c.id][0]}" y="${PURE_POS[c.id][1]}" class="n pure" fill="${c.color}">${pure(c.id) || ''}</text>`).join('')}
            ${C.map(c => { const [lx, ly, an] = LBL_POS[c.id]; return `<text x="${lx}" y="${ly}" text-anchor="${an}" class="lbl" fill="${c.color}">${c.icon} ${esc(c.short)}</text>`; }).join('')}
            ${D.INTERSECTIONS.map(z => `<g class="zone" data-zone="${z.id}"><text x="${ZONE_POS[z.id][0]}" y="${ZONE_POS[z.id][1]}" class="n">${zone(z) || ''}</text><text x="${ZONE_POS[z.id][0]}" y="${ZONE_POS[z.id][1] + 13}" class="zl">${z.label}</text></g>`).join('')}
            <circle cx="160" cy="160" r="26" fill="#fff" fill-opacity=".85" stroke="var(--mk-accent)" stroke-width="2"/>
            <text x="160" y="157" class="n big" fill="var(--mk-accent)">${center}</text>
            <text x="160" y="172" class="zl" fill="var(--mk-accent)">Ikigai</text>
        </svg>`;
    }
    function renderZones() {
        const ik = ikigaiItems(), al = almostItems();
        const total = S.items.length;
        $('ikg-zones').innerHTML = `
            <div class="ikg-zone ikg-zone-ikigai">
                <div class="t"><strong>Ikigai</strong><span class="mk-faint">all four circles</span></div>
                ${ik.length ? `<div class="mk-chips">${ik.map(it => `<span class="mk-chip selected">${esc(it.label)}</span>`).join('')}</div>` : `<div class="mk-faint">${total ? 'No keyword in all four circles yet. Check the matrix to see which ones are “almost there”.' : 'Enter keywords in the circles first.'}</div>`}
            </div>
            ${al.length ? `<div class="ikg-zone"><div class="t"><strong>Fast da</strong><span class="mk-faint">three of four</span></div>${al.map(it => { const m = byId(missingOf(it)[0]); return `<div class="ikg-almost"><span class="mk-chip">${esc(it.label)}</span><span class="mk-faint">missing <strong style="color:${m.color}">${esc(m.short)}</strong> – ${esc(m.ask)}</span></div>`; }).join('')}</div>` : ''}
            ${D.INTERSECTIONS.map(z => { const its = zoneItems(z.of, true); const a = byId(z.of[0]), b = byId(z.of[1]); return `<div class="ikg-zone"><div class="t"><span class="dots"><i style="background:${a.color}"></i><i style="background:${b.color}"></i></span><strong>${z.label}</strong><span class="mk-faint">${its.length}</span></div>${its.length ? `<div class="mk-chips">${its.map(it => `<span class="mk-chip">${esc(it.label)}</span>`).join('')}</div><div class="mk-faint" style="margin-top:6px;font-size:12px;">${esc(z.ask)}</div>` : `<div class="mk-faint" style="font-size:12px;">${esc(z.desc)}</div>`}</div>`; }).join('')}`;
    }
    function renderMatrix() {
        const f = S.__mf || 'all';
        const filters = [['all', 'All'], ['4', 'Ikigai'], ['3', 'Almost there'], ...C.map(c => [c.id, c.icon + ' ' + c.short])];
        $('ikg-matrix-filter').innerHTML = filters.map(([k, l]) => `<button class="mk-chip ${f === k ? 'selected' : ''}" data-f="${k}">${l}</button>`).join('');
        $('ikg-matrix-filter').querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { S.__mf = b.dataset.f; MethodKit.save(); renderMatrix(); }));
        let list = S.items.slice().sort((a, b) => circleCount(b) - circleCount(a) || a.label.localeCompare(b.label, 'de'));
        if (f === '4') list = list.filter(it => circleCount(it) === 4);
        else if (f === '3') list = list.filter(it => circleCount(it) === 3);
        else if (CID.includes(f)) list = list.filter(it => it.c[f]);
        if (!S.items.length) { $('ikg-matrix').innerHTML = '<div class="mk-empty">No keywords yet. Go back to the circles and collect 5 in each.</div>'; return; }
        $('ikg-matrix').innerHTML = `
            <div class="ikg-mx-head"><span></span>${C.map(c => `<span style="color:${c.color}" title="${esc(c.label)}">${c.icon}</span>`).join('')}<span></span></div>
            ${list.map(it => { const n = circleCount(it); return `<div class="ikg-mx-row ${n === 4 ? 'is4' : n === 3 ? 'is3' : ''}"><span class="lb">${esc(it.label)}</span>${C.map(c => `<button class="ikg-tg ${it.c[c.id] ? 'on' : ''}" style="--c:${c.color}" data-tg="${it.id}:${c.id}" aria-label="${esc(c.short)}"></button>`).join('')}<span class="n">${n === 4 ? '✨' : n + '/4'}</span><button class="mk-iconbtn" data-del="${it.id}" aria-label="Delete"><i class="fas fa-trash"></i></button></div>`; }).join('') || '<div class="mk-empty">Nothing in this filter.</div>'}
            <div class="ikg-add" style="margin-top:12px;"><input class="mk-input" id="ikg-mx-add" placeholder="New keyword (goes into &quot;Love", then assign)" maxlength="60"><button class="mk-btn mk-btn-outline" id="ikg-mx-addbtn"><i class="fas fa-plus"></i></button></div>`;
        $('ikg-matrix').querySelectorAll('[data-tg]').forEach(b => b.addEventListener('click', () => {
            const [id, cid] = b.dataset.tg.split(':'); const it = S.items.find(x => x.id === id); if (!it) return;
            if (it.c[cid]) { if (circleCount(it) === 1) { MethodKit.toast('At least one circle – or delete the keyword', 'warn'); return; } delete it.c[cid]; } else it.c[cid] = 1;
            MethodKit.save(); renderSynth();
            if (circleCount(it) === 4) MethodKit.toast(`✨ „${it.label}” is in all four circles`, 'success');
        }));
        $('ikg-matrix').querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { S.items = S.items.filter(x => x.id !== b.dataset.del); MethodKit.save(); renderSynth(); }));
        const add = () => { const v = $('ikg-mx-add').value; if (!v.trim()) return; addItem(v, 'love'); renderSynth(); };
        $('ikg-mx-addbtn').addEventListener('click', add);
        $('ikg-mx-add').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(); } });
    }
    function renderBuilder() {
        const st = S.statement;
        const sel = (cid, ph) => { const its = itemsIn(cid); const c = byId(cid); return its.length
            ? `<select class="mk-select ikg-sel" data-st="${cid}" style="--c:${c.color}"><option value="">${c.icon} ${esc(ph)}</option>${its.map(it => `<option ${st[cid] === it.label ? 'selected' : ''}>${esc(it.label)}</option>`).join('')}</select>`
            : `<input class="mk-input ikg-sel" data-st="${cid}" placeholder="${c.icon} ${esc(ph)}" value="${esc(st[cid] || '')}">`; };
        $('ikg-builder').innerHTML = `
            <div class="ikg-builder">
                <div class="row"><span>I use my skill in</span>${sel('good', 'Choose skill')}</div>
                <div class="row"><span>to</span>${sel('world', 'Choose need')}</div>
                <div class="row"><span>– because I love</span>${sel('love', 'Choose love')}<span>love</span></div>
                <div class="row"><span>and</span>${sel('paid', 'Choose income source')}<span>provides me with an income.</span></div>
            </div>
            <div class="ikg-sentence" id="ikg-sentence"></div>
            <button class="mk-btn mk-btn-outline mk-btn-sm" id="ikg-apply" style="margin-top:10px;"><i class="fas fa-arrow-down"></i> Use as ikigai sentence</button>`;
        const upd = () => {
            const g = st.good || '…', w = st.world || '…', l = st.love || '…', p = st.paid || '…';
            $('ikg-sentence').innerHTML = `I use my skill in <b style="color:${byId('good').color}">${esc(g)}</b> to <b style="color:${byId('world').color}">${esc(w)}</b> – because I love <b style="color:${byId('love').color}">${esc(l)}</b> and <b style="color:${byId('paid').color}">${esc(p)}</b> provides me with an income.`;
        };
        $('ikg-builder').querySelectorAll('[data-st]').forEach(el => el.addEventListener('input', () => { st[el.dataset.st] = el.value; MethodKit.save(); upd(); }));
        $('ikg-apply').addEventListener('click', () => {
            if (!st.good && !st.world && !st.love && !st.paid) { MethodKit.toast('Select keywords first', 'warn'); return; }
            S.ikigai = $('ikg-sentence').textContent; $('ikg-ikigai').value = S.ikigai; MethodKit.save({ now: true }); MethodKit._autosize($('ikg-ikigai')); MethodKit.toast('Adopted – now put it in your own words', 'success');
        });
        upd();
    }
    function renderSynth() { renderVenn(); renderZones(); renderMatrix(); renderBuilder(); }

    /* ---------- Step 7 · Aktionsplan ---------- */
    function renderFirst() {
        const f = S.first;
        const ik = ikigaiItems();
        $('ikg-first').innerHTML = `
            ${S.ikigai ? `<div class="mk-result" style="margin-bottom:14px;"><h4>Dein Ikigai</h4>${esc(S.ikigai)}</div>` : `<div class="mk-note warn"><i class="fas fa-exclamation-triangle"></i><span>You haven’t phrased an ikigai sentence yet. That happens in step 6 – but the plan works without it too.</span></div>`}
            <div class="ikg-first">
                <div class="mk-section-label">The first small step – this week</div>
                <div class="ikg-first-row">
                    <input class="mk-input" id="ikg-first-text" placeholder="${ik.length ? 'e.g. ask one person about ”' + esc(ik[0].label) + '" for a conversation' : 'e.g. Have a 20-minute conversation with someone who already does what attracts me'}" value="${esc(f.text || '')}">
                    <input class="mk-input" type="date" id="ikg-first-date" value="${esc(f.date || '')}">
                    <label class="ikg-check"><input type="checkbox" id="ikg-first-done" ${f.done ? 'checked' : ''}> done</label>
                </div>
                <span class="hint">Small enough that you will surely manage it. Big enough that it moves something.</span>
            </div>`;
        $('ikg-first-text').addEventListener('input', e => { f.text = e.target.value; MethodKit.save(); });
        $('ikg-first-date').addEventListener('input', e => { f.date = e.target.value; MethodKit.save(); });
        $('ikg-first-done').addEventListener('change', e => { f.done = e.target.checked; MethodKit.save({ now: true }); if (f.done) MethodKit.toast('First step done 🎉', 'success'); });
    }
    function renderHorizons() {
        $('ikg-horizons').innerHTML = D.HORIZONS.map(h => { const list = S.plan[h.id] || (S.plan[h.id] = []); const done = list.filter(x => x.done).length; return `
            <div class="mk-card">
                <h3>${h.icon} ${esc(h.label)} ${list.length ? `<span class="ikg-count">${done}/${list.length}</span>` : ''}</h3>
                <p class="mk-sub">${esc(h.hint)}</p>
                ${list.map(x => `<div class="mk-row ikg-plan-row ${x.done ? 'done' : ''}"><input type="checkbox" data-done="${h.id}:${x.id}" ${x.done ? 'checked' : ''}><span class="grow">${esc(x.text)}</span>${x.date ? `<span class="mk-faint" style="font-size:12px;white-space:nowrap">${esc(x.date)}</span>` : ''}<button class="mk-iconbtn" data-rmp="${h.id}:${x.id}" aria-label="Delete"><i class="fas fa-times"></i></button></div>`).join('')}
                <div class="ikg-add"><input class="mk-input" id="ikg-h-${h.id}" placeholder="What exactly?" maxlength="140"><input class="mk-input ikg-date" type="month" id="ikg-hd-${h.id}" title="When (optional)"><button class="mk-btn mk-btn-outline" data-addp="${h.id}"><i class="fas fa-plus"></i></button></div>
            </div>`; }).join('');
        $('ikg-horizons').querySelectorAll('[data-addp]').forEach(b => {
            const add = () => { const t = $('ikg-h-' + b.dataset.addp), d = $('ikg-hd-' + b.dataset.addp); if (!t.value.trim()) return; S.plan[b.dataset.addp].push({ id: MethodKit.uid(), text: t.value.trim(), date: d.value, done: false }); MethodKit.save(); renderHorizons(); $('ikg-h-' + b.dataset.addp).focus(); };
            b.addEventListener('click', add);
            $('ikg-h-' + b.dataset.addp).addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(); } });
        });
        $('ikg-horizons').querySelectorAll('[data-done]').forEach(cb => cb.addEventListener('change', () => { const [h, id] = cb.dataset.done.split(':'); const x = S.plan[h].find(y => y.id === id); if (x) { x.done = cb.checked; MethodKit.save(); renderHorizons(); } }));
        $('ikg-horizons').querySelectorAll('[data-rmp]').forEach(b => b.addEventListener('click', () => { const [h, id] = b.dataset.rmp.split(':'); S.plan[h] = S.plan[h].filter(y => y.id !== id); MethodKit.save(); renderHorizons(); }));
    }
    function renderLinks() {
        const weakest = CID.slice().sort((a, b) => completeness(a) - completeness(b))[0];
        $('ikg-links').innerHTML = `<div class="mk-grid">${D.LINKS.map(l => { const hot = l.for === weakest; const c = l.for ? byId(l.for) : null; return `<a class="mk-option ikg-link ${hot ? 'selected' : ''}" href="${l.l}"><span class="t">${esc(l.m)} ${hot ? '<span class="mk-badge" style="margin-left:6px">recommended</span>' : ''}</span><span class="d">${esc(l.why)}${c ? ` <span style="color:${c.color}">· ${c.icon} ${esc(c.short)}</span>` : ''}</span></a>`; }).join('')}</div>`;
    }
    function renderPlan() { renderFirst(); renderHorizons(); renderLinks(); }

    /* ---------- Export ---------- */
    function exportAll() {
        const L = [];
        L.push('IKIGAI', '='.repeat(40), 'Exported: ' + new Date().toLocaleString('en-GB'), '');
        L.push('WHERE YOU STAND');
        D.REFLECT.forEach(r => { if (S.reflect[r.k]) L.push('- ' + r.l, '  ' + S.reflect[r.k].replace(/\n/g, '\n  ')); });
        C.forEach(c => { L.push('', c.label.toUpperCase() + ' (' + c.short + ')'); c.prompts.forEach(p => { const v = (S.text[c.id] || {})[p.k]; if (v) L.push('- ' + p.l, '  ' + v.replace(/\n/g, '\n  ')); }); const its = itemsIn(c.id); if (its.length) L.push('  Keywords: ' + its.map(i => i.label).join(', ')); });
        L.push('', 'SYNTHESIS');
        const ik = ikigaiItems(); L.push('Ikigai (all 4 circles): ' + (ik.length ? ik.map(i => i.label).join(', ') : '–'));
        almostItems().forEach(it => L.push('Almost there: ' + it.label + ' (fehlt: ' + byId(missingOf(it)[0]).short + ')'));
        D.INTERSECTIONS.forEach(z => { const its = zoneItems(z.of, true); if (its.length) L.push(z.label + ': ' + its.map(i => i.label).join(', ')); });
        if (S.ikigai) L.push('', 'MY IKIGAI', S.ikigai);
        if (S.vision) L.push('', 'VISION', S.vision);
        L.push('', 'ACTION PLAN');
        if (S.first.text) L.push('First step: ' + S.first.text + (S.first.date ? ' (bis ' + S.first.date + ')' : '') + (S.first.done ? ' ✓' : ''));
        D.HORIZONS.forEach(h => { const l = S.plan[h.id] || []; if (l.length) { L.push(h.label + ':'); l.forEach(x => L.push('  [' + (x.done ? 'x' : ' ') + '] ' + x.text + (x.date ? ' (' + x.date + ')' : ''))); } });
        if (S.obstacles) L.push('Obstacles: ' + S.obstacles);
        if (S.support) L.push('Support: ' + S.support);
        MethodKit.exportText('ikigai.txt', L.join('\n'));
    }

    /* ---------- Migration alter Einzelseiten (ikigaiStep1..7) ---------- */
    function migrateLegacy() {
        if (S.__migrated) return;
        S.__migrated = 1;
        let got = 0;
        const rd = (n) => { try { return JSON.parse(localStorage.getItem('ikigaiStep' + n) || 'null'); } catch (e) { return null; } };
        const put = (obj, k, v) => { if (v && String(v).trim() && !obj[k]) { obj[k] = String(v).trim(); got++; } };
        const s1 = rd(1); if (s1) { put(S.reflect, 'values', s1.values); put(S.reflect, 'experiences', s1.experiences); put(S.reflect, 'dreams', s1.goals); put(S.reflect, 'fears', s1.fears); put(S.text.good, 'strengths', s1.strengths); put(S.text.love, 'activities', s1.passions); }
        const s2 = rd(2); if (s2) { put(S.text.love, 'activities', s2.activities); put(S.text.love, 'interests', s2.interests); put(S.text.love, 'energy', s2.energy); put(S.reflect, 'values', s2.values); }
        const s3 = rd(3); if (s3) { put(S.text.world, 'problems', s3.problems); put(S.text.world, 'contribution', s3.contribution); put(S.text.world, 'legacy', s3.legacy); }
        const s4 = rd(4); if (s4) { put(S.text.paid, 'market', s4.market); put(S.text.paid, 'income', s4.income); put(S.text.paid, 'network', s4.network); }
        const s5 = rd(5); if (s5) { put(S.text.good, 'talents', s5.talents); put(S.text.good, 'skills', s5.skills); put(S.text.good, 'strengths', s5.strengths); }
        const s6 = rd(6); if (s6) { const o = {}; put(o, 'i', s6.ikigai); put(o, 'v', s6.vision); if (o.i && !S.ikigai) S.ikigai = o.i; if (o.v && !S.vision) S.vision = o.v; }
        const s7 = rd(7); if (s7) { [['short', s7.shortTerm], ['mid', s7.mediumTerm], ['long', s7.longTerm]].forEach(([h, v]) => { if (v && String(v).trim() && !(S.plan[h] || []).length) { S.plan[h] = [{ id: MethodKit.uid(), text: String(v).trim(), date: '', done: false }]; got++; } }); put(S, 'obstacles', s7.obstacles); put(S, 'support', s7.support); }
        if (got) { MethodKit.save({ now: true }); setTimeout(() => MethodKit.toast('Earlier ikigai answers adopted', 'success'), 600); }
    }

    /* ---------- Init ---------- */
    (async function () {
        await MethodKit.init({
            method: 'ikigai',
            accent: '#e11d48', accent2: '#8b5cf6',
            steps: [
                { icon: '🧭', label: 'Where you stand' }, { icon: '❤️', label: 'Love' }, { icon: '💪', label: 'Skill' },
                { icon: '🌍', label: 'World' }, { icon: '💰', label: 'Pay' }, { icon: '🔀', label: 'Synthesis' }, { icon: '🚀', label: 'Plan' }
            ],
            defaultState: { reflect: {}, text: { love: {}, good: {}, world: {}, paid: {} }, items: [], statement: {}, ikigai: '', vision: '', plan: { short: [], mid: [], long: [] }, first: {}, obstacles: '', support: '' }
        });
        S = MethodKit.state;
        if (!S.reflect || typeof S.reflect !== 'object') S.reflect = {};
        if (!S.text || typeof S.text !== 'object') S.text = {};
        CID.forEach(id => { if (!S.text[id] || typeof S.text[id] !== 'object') S.text[id] = {}; });
        if (!Array.isArray(S.items)) S.items = [];
        S.items.forEach(it => { if (!it.c || typeof it.c !== 'object') it.c = {}; });
        if (!S.statement || typeof S.statement !== 'object') S.statement = {};
        if (!S.plan || typeof S.plan !== 'object') S.plan = {};
        ['short', 'mid', 'long'].forEach(h => { if (!Array.isArray(S.plan[h])) S.plan[h] = []; });
        if (!S.first || typeof S.first !== 'object') S.first = {};
        migrateLegacy();

        MethodKit.bindFields();
        renderModel(); renderReflect();
        CID.forEach(renderCircle);

        MethodKit.onStep = function (n) {
            if (n >= 2 && n <= 5) renderCircle(CID[n - 2]);
            if (n === 6) renderSynth();
            if (n === 7) renderPlan();
        };
        MethodKit.onStep(MethodKit.step);
        $('ikg-export').addEventListener('click', exportAll);
    })();
})();
