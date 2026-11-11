/**
 * Stellensuche im Admin Panel (#applications), nur für Admins.
 *
 * Ablauf: Suchen (Lambda website-job-search) → KI-Bewertung (OpenAI im Browser,
 * Key aus «API Keys») → Stellen anklicken → für die Auswahl Anschreiben-Entwürfe
 * erzeugen, die im Bewerbungsmanager unter «Anschreiben» und im Tracking landen.
 */
(function () {
  'use strict';

  const JS = {
    criteria: null,
    results: [],
    lastRun: null,
    stats: null,
    seenCount: 0,
    selected: new Set(),
    filter: 'all',
    busy: false,
    loaded: false
  };

  const FOCUS_LABELS = ['UKG/HRSD', 'HR-Prozesse', 'HR-Strategie'];

  // ─────────────────────────────────────────────────────────── Helfer

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function toast(msg, type = 'info') {
    let box = document.getElementById('jsToasts');
    if (!box) {
      box = document.createElement('div');
      box.id = 'jsToasts';
      box.className = 'js-toasts';
      document.body.appendChild(box);
    }
    const el = document.createElement('div');
    el.className = `js-toast ${type}`;
    el.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i><span>${esc(msg)}</span>`;
    box.appendChild(el);
    setTimeout(() => el.remove(), type === 'error' ? 9000 : 4500);
  }

  function endpoint() {
    return window.AWS_APP_CONFIG?.JOB_SEARCH_URL || '';
  }

  function authToken() {
    return window.adminAuth?.getSession?.()?.idToken || null;
  }

  async function api(action, payload = {}) {
    const token = authToken();
    if (!token) throw new Error('Admin-Sitzung abgelaufen, bitte neu anmelden.');
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);
    return data;
  }

  async function userData(path, body) {
    const base = window.getApiUrl ? window.getApiUrl('USER_DATA') : `${window.AWS_APP_CONFIG?.API_BASE || ''}/user-data`;
    const res = await fetch(`${base}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Speichern fehlgeschlagen (${res.status})`);
    return data;
  }

  async function openAIKey() {
    try {
      if (window.resolveOpenAIApiKey) {
        const k = await window.resolveOpenAIApiKey();
        if (k) return k;
      }
      if (window.awsAPISettings?.getFullApiKey) {
        const k = await window.awsAPISettings.getFullApiKey('openai');
        if (typeof k === 'string' && k.startsWith('sk-')) return k;
      }
      const g = window.GlobalAPIManager?.getAPIKey?.('openai');
      if (g) return g;
      const parsed = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
      return parsed.openai?.key || parsed.openai?.apiKey || localStorage.getItem('openai_api_key') || null;
    } catch {
      return null;
    }
  }

  async function chat(messages, { json = false, model } = {}) {
    const key = await openAIKey();
    if (!key) throw new Error('Kein OpenAI-Key. Im Admin Panel unter «API Keys» hinterlegen.');
    const configured = window.GlobalAPIManager?.getServiceConfig?.('openai')?.model;
    const models = [...new Set([model, configured, 'gpt-5.2', 'gpt-4o-mini'].filter(Boolean))];
    let lastErr;
    for (const m of models) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: m, messages, ...(json ? { response_format: { type: 'json_object' } } : {}) })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return data.choices?.[0]?.message?.content || '';
      lastErr = new Error(data.error?.message || `OpenAI-Fehler ${res.status}`);
    }
    throw lastErr;
  }

  function profileText() {
    return (JS.criteria?.candidateProfile || '').trim();
  }

  function candidateName() {
    return window.adminAuth?.getCurrentUser?.()?.name || 'Manuel Weiss';
  }

  function isLoggedIn() {
    return !!authToken();
  }

  // ─────────────────────────────────────────────────────────── Laden / Suchen

  async function load() {
    if (!isLoggedIn()) { renderLogin(); return; }
    setStatus('<i class="fas fa-spinner fa-spin"></i> Lade …');
    try {
      const s = await api('state');
      Object.assign(JS, { criteria: s.criteria, results: s.results || [], lastRun: s.lastRun, stats: s.stats, seenCount: s.seenCount, loaded: true });
      renderCriteria();
      render();
    } catch (e) {
      setStatus(`<i class="fas fa-exclamation-triangle"></i> ${esc(e.message)}`);
    }
  }

  async function search() {
    if (JS.busy) return;
    collectCriteria();
    setBusy(true, '<i class="fas fa-spinner fa-spin"></i> Suche läuft (LinkedIn, jobs.ch, Arbeitsagentur, Remote-Börsen, Firmen-Feeds) … das dauert bis zu 90 Sekunden');
    try {
      const r = await api('search', { criteria: JS.criteria });
      Object.assign(JS, { results: r.results, lastRun: r.lastRun, stats: r.stats, criteria: r.criteria });
      JS.selected.clear();
      render();
      toast(`${r.results.length} neue passende Stellen gefunden`, 'success');
      if (r.results.length && await openAIKey()) await rate();
    } catch (e) {
      toast(`Suche fehlgeschlagen: ${e.message}`, 'error');
    } finally {
      setBusy(false);
      render();
    }
  }

  async function rate() {
    const open = JS.results.filter((j) => j.status === 'offen');
    if (!open.length) return;
    setBusy(true, '<i class="fas fa-spinner fa-spin"></i> KI bewertet die Stellen …');
    try {
      const batch = open.slice(0, 30).map((j) => ({
        id: j.id, title: j.title, company: j.company, location: j.location,
        remote: j.remote, source: j.source, text: (j.snippet || '').slice(0, 220)
      }));
      const content = await chat([
        {
          role: 'system',
          content: `Du bewertest Stellenanzeigen für eine Person anhand ihres Profils. Antworte als JSON {"jobs":[{"id","score","focus","why","recommended"}]}.
- score 0–100: inhaltliche Passung zum Profil und realistische Chance (Seniorität, Muss-Anforderungen, Sprache, Standort).
- focus: genau einer von ${FOCUS_LABELS.map((f) => `"${f}"`).join(', ')} wenn die Rolle klar dieses Fokusthema hat, sonst "".
- Fokusthemen (${(JS.criteria?.focusKeywords || []).slice(0, 12).join(', ')}) klar bevorzugen (+10).
- Abwerten: Führungsrollen ohne passende Führungserfahrung, Sales/Recruiting/Entwicklerrollen, Französisch als Muttersprache, Standort ausserhalb CH/DE/AT ohne Remote.
- why: ein Satz auf Deutsch, konkret: was passt, was fehlt.
- recommended: true ab score 70.`
        },
        { role: 'user', content: `PROFIL:\n${profileText() || '(kein Profil hinterlegt)'}\n\nSTELLEN:\n${JSON.stringify(batch)}` }
      ], { json: true });
      const rated = new Map((JSON.parse(content).jobs || []).map((x) => [x.id, x]));
      JS.results = JS.results.map((j) => {
        const r = rated.get(j.id);
        return r ? { ...j, aiScore: Math.max(0, Math.min(100, Math.round(r.score))), focusLabel: r.focus || '', why: r.why || '', recommended: !!r.recommended } : j;
      });
      sortResults();
      await api('saveResults', { results: JS.results });
      toast('KI-Bewertung fertig', 'success');
    } catch (e) {
      toast(`KI-Bewertung fehlgeschlagen: ${e.message}`, 'error');
    } finally {
      setBusy(false);
      render();
    }
  }

  function sortResults() {
    const rank = (j) => (j.status === 'offen' ? 0 : 1);
    JS.results.sort((a, b) => rank(a) - rank(b)
      || ((b.aiScore ?? -1) - (a.aiScore ?? -1))
      || ((b.focus ? 1 : 0) - (a.focus ? 1 : 0))
      || ((b.baseScore || 0) - (a.baseScore || 0)));
  }

  async function mark(jobs, status) {
    await api('mark', { items: jobs.map((j) => ({ url: j.url, title: j.title, company: j.company, status })) });
    const label = { applied: 'beworben', dismissed: 'ausgeblendet', open: 'offen' }[status];
    const ids = new Set(jobs.map((j) => j.id));
    JS.results = JS.results.map((j) => (ids.has(j.id) ? { ...j, status: label } : j));
    jobs.forEach((j) => JS.selected.delete(j.id));
  }

  // ─────────────────────────────────────────────────────────── Bewerbungen erstellen

  function localeFor(job, text) {
    const english = (text.match(/\b(the|and|you|with|our|will|team|experience)\b/gi) || []).length;
    const german = (text.match(/\b(und|die|der|wir|mit|sie|für|erfahrung)\b/gi) || []).length;
    if (english > german * 1.5 && english > 15) return 'en';
    return /schweiz|switzerland|zürich|zurich|bern|basel|luzern|zug|genf|lausanne|aarau|winterthur|st\. ?gallen/i.test(job.location) ? 'de-CH' : 'de-DE';
  }

  const LOCALE_RULES = {
    'de-CH': 'Schweizer Hochdeutsch: immer ss statt ß. Anrede ohne Komma («Guten Tag Frau X» bzw. «Guten Tag»), erster Satz danach gross. Gruss: «Freundliche Grüsse».',
    'de-DE': 'Deutsch nach DIN 5008: Komma nach der Anrede («Guten Tag Frau X,»), erster Satz danach klein (ausser Substantiv). ß verwenden. Gruss: «Freundliche Grüße».',
    en: 'English. "Dear Hiring Team," or the named contact. Closing: "Kind regards".'
  };

  async function writeLetter(job, posting, locale) {
    const name = candidateName();
    const text = await chat([
      {
        role: 'system',
        content: `Du schreibst Bewerbungsanschreiben in der Stimme der Bewerberin bzw. des Bewerbers: direkt, warm, professionell.
Regeln (verbindlich):
- 180 bis 280 Wörter Brieftext, maximal eine Seite.
- Erster Satz mit konkretem Bezug zur Firma bzw. Rolle, nicht «ich habe Ihre Anzeige gelesen».
- 2 bis 3 zentrale Anforderungen der Anzeige mit deren Keywords aufgreifen und jede mit genau einem konkreten Beleg aus dem Profil beantworten. Kein Lebenslauf-Nacherzählen.
- Schluss mit aktivem Gesprächsangebot, kein Bittsteller-Ton.
- Keine Kundennamen, Branchen statt Namen. Nichts erfinden, was nicht im Profil steht (keine Zertifikate, Kennzahlen, Führungsrollen).
- Keine Gedankenstriche (– oder —) im Text. Keine Floskeln wie «hiermit bewerbe ich mich», «dynamisches Umfeld», «spannende Herausforderung», «mit Begeisterung».
- Ansprechperson namentlich, wenn sie in der Anzeige steht, sonst «Guten Tag».
- ${LOCALE_RULES[locale]}
Format: reiner Text. Zeile 1: Betreff (z. B. «Bewerbung als …»). Leerzeile. Anrede. Absätze. Gruss. ${name ? `Name: ${name}.` : ''}`
      },
      {
        role: 'user',
        content: `PROFIL:\n${profileText() || '(kein Profil hinterlegt)'}\n\nSTELLE: ${job.title} bei ${job.company} (${job.location})\nLINK: ${job.url}\n\nANZEIGE:\n${(posting || job.snippet || '').slice(0, 6000)}`
      }
    ]);
    let letter = text.trim().replace(/\s[–—]\s/g, ', ').replace(/[–—]/g, '-');
    if (locale === 'de-CH') letter = letter.replace(/ß/g, 'ss');
    return letter;
  }

  async function createApplications() {
    const jobs = JS.results.filter((j) => JS.selected.has(j.id));
    if (!jobs.length || JS.busy) return;
    if (!(await openAIKey())) {
      toast('Für Anschreiben wird ein OpenAI-Key benötigt (Admin Panel → API Keys).', 'error');
      return;
    }
    if (!profileText()) {
      toast('Bitte zuerst unter «Suchkriterien» ein Profil für die KI hinterlegen.', 'error');
      $('jsCriteria').open = true;
      return;
    }
    setBusy(true, `<i class="fas fa-spinner fa-spin"></i> Erstelle ${jobs.length} Bewerbung(en) …`);
    setStep(3);
    const box = $('jsProgress');
    box.innerHTML = `<h3 style="margin:0 0 10px">Bewerbungen werden erstellt</h3><div class="js-progress">${jobs.map((j) => `
      <div class="js-prow" id="jsp-${j.id}"><span class="st"><i class="fas fa-circle-notch fa-spin"></i></span>
      <span class="grow"><b>${esc(j.title)}</b> · ${esc(j.company)}</span><span class="info">Anzeige wird gelesen …</span></div>`).join('')}</div>`;
    box.style.display = 'block';
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const done = [];
    for (const job of jobs) {
      const row = $(`jsp-${job.id}`);
      const info = (html) => { row.querySelector('.info').innerHTML = html; };
      try {
        const posting = await api('posting', { url: job.url }).then((r) => r.text || '').catch(() => '');
        const locale = localeFor(job, posting || job.snippet || '');
        info('Anschreiben wird geschrieben …');
        const letter = await writeLetter(job, posting, locale);
        const now = new Date().toISOString();
        const coverId = `cl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
        const country = locale === 'de-CH' ? 'CH' : (/österreich|austria|wien/i.test(job.location) ? 'AT' : 'DE');
        await userData('/cover-letters', {
          id: coverId, content: letter, version: '1.0', createdAt: now, updatedAt: now, source: 'stellensuche',
          jobData: {
            title: job.title, jobTitle: job.title, position: job.title, company: job.company, companyName: job.company,
            location: job.location, url: job.url, country, jobDescription: (posting || job.snippet || '').slice(0, 4000)
          },
          options: { locale }
        });
        await saveTracking(job, letter, coverId);
        await mark([job], 'applied');
        done.push(job);
        row.querySelector('.st').innerHTML = '<i class="fas fa-check"></i>';
        info(`<a href="applications/cover-letter-editor.html?edit=${encodeURIComponent(coverId)}" target="_blank">Im Editor öffnen</a> · <a href="${esc(job.url)}" target="_blank">Anzeige</a>`);
      } catch (e) {
        row.querySelector('.st').innerHTML = '<i class="fas fa-times"></i>';
        info(`Fehler: ${esc(e.message)}`);
      }
    }
    window.AdminApp?.sections?.applications?.loadApplications?.();
    box.insertAdjacentHTML('beforeend', `<div class="js-actions" style="margin-top:14px">
      <button class="js-btn primary" type="button" data-show-pane="manager" data-manager-target="cover"><i class="fas fa-file-alt"></i> Anschreiben im Bewerbungsmanager</button>
      <button class="js-btn" type="button" data-show-pane="tracking"><i class="fas fa-tasks"></i> Zu meinen Bewerbungen</button></div>`);
    setBusy(false);
    render();
    toast(`${done.length} von ${jobs.length} Bewerbung(en) erstellt`, done.length ? 'success' : 'error');
  }

  function saveTracking(job, letter, coverId) {
    return userData('/applications', {
      id: `app_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      position: job.title, company: job.company, location: job.location, url: job.url,
      date: new Date().toISOString().split('T')[0], status: 'pending', coverLetter: letter, coverLetterId: coverId,
      source: 'stellensuche', notes: 'Entwurf aus der Stellensuche, noch nicht versendet', createdAt: new Date().toISOString()
    });
  }

  // ─────────────────────────────────────────────────────────── Kriterien

  function chipEditor(id, values) {
    const el = $(id);
    if (!el) return;
    el.innerHTML = `${values.map((v, i) => `<span class="js-chip">${esc(v)}<button type="button" data-i="${i}" aria-label="entfernen">×</button></span>`).join('')}
      <input type="text" placeholder="Begriff + Enter">`;
    el.dataset.values = JSON.stringify(values);
    el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const vals = JSON.parse(el.dataset.values);
      vals.splice(Number(b.dataset.i), 1);
      chipEditor(id, vals);
    }));
    el.querySelector('input').addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ',') return;
      ev.preventDefault();
      const v = ev.target.value.trim();
      if (!v) return;
      const vals = JSON.parse(el.dataset.values);
      if (!vals.includes(v)) vals.push(v);
      chipEditor(id, vals);
      $(id).querySelector('input').focus();
    });
  }

  const chipValues = (id) => JSON.parse($(id)?.dataset.values || '[]');

  function renderCriteria() {
    const c = JS.criteria;
    if (!c) return;
    chipEditor('jsTerms', c.terms);
    chipEditor('jsFocus', c.focusKeywords);
    chipEditor('jsExclude', c.excludeTitle || []);
    for (const k of Object.keys(c.regions)) { const cb = $(`jsReg-${k}`); if (cb) cb.checked = c.regions[k] !== false; }
    for (const k of Object.keys(c.sources)) { const cb = $(`jsSrc-${k}`); if (cb) cb.checked = c.sources[k] !== false; }
    $('jsMaxAge').value = String(c.maxAgeDays || 30);
    $('jsProfile').value = c.candidateProfile || '';
  }

  function collectCriteria() {
    if (!JS.criteria) return;
    const c = JS.criteria;
    c.terms = chipValues('jsTerms');
    c.focusKeywords = chipValues('jsFocus');
    c.excludeTitle = chipValues('jsExclude');
    for (const k of Object.keys(c.regions)) { const cb = $(`jsReg-${k}`); if (cb) c.regions[k] = cb.checked; }
    for (const k of Object.keys(c.sources)) { const cb = $(`jsSrc-${k}`); if (cb) c.sources[k] = cb.checked; }
    c.maxAgeDays = Number($('jsMaxAge').value) || 30;
    c.candidateProfile = $('jsProfile').value.trim();
  }

  async function saveCriteria() {
    collectCriteria();
    try {
      const r = await api('saveCriteria', { criteria: JS.criteria });
      JS.criteria = r.criteria;
      toast('Suchkriterien gespeichert', 'success');
    } catch (e) {
      toast(`Speichern fehlgeschlagen: ${e.message}`, 'error');
    }
  }

  // ─────────────────────────────────────────────────────────── Rendering

  function setStatus(html) { const s = $('jsStatus'); if (s) s.innerHTML = html; }

  function setBusy(on, html) {
    JS.busy = on;
    ['jsSearchBtn', 'jsRateBtn', 'jsPackBtn'].forEach((id) => { const b = $(id); if (b) b.disabled = on; });
    if (on) setStatus(html);
    else render();
  }

  function setStep(n) {
    document.querySelectorAll('.js-step').forEach((el) => {
      const s = Number(el.dataset.step);
      el.classList.toggle('on', s === n);
      el.classList.toggle('done', s < n);
    });
  }

  function renderLogin() {
    $('jsList').innerHTML = `<div class="js-login"><i class="fas fa-lock"></i>
      <p>Die Admin-Sitzung ist abgelaufen.</p>
      <a class="js-btn primary" href="admin-login.html">Neu anmelden</a></div>`;
    setStatus('');
  }

  function visibleJobs() {
    return JS.results.filter((j) => {
      if (JS.filter === 'focus') return j.status === 'offen' && (j.focus || j.focusLabel);
      if (JS.filter === 'rec') return j.status === 'offen' && j.recommended;
      if (JS.filter === 'done') return j.status !== 'offen';
      return j.status === 'offen';
    });
  }

  function render() {
    if (!$('jsList')) return;
    if (!isLoggedIn()) { renderLogin(); return; }
    if (!JS.busy) {
      const when = JS.lastRun ? new Date(JS.lastRun).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' }) : null;
      const st = JS.stats;
      setStatus(when
        ? `Letzte Suche ${when}${st ? ` · ${st.loaded} geladen, ${st.relevant} relevant, ${st.alreadySeen} schon gesehen` : ''}`
        : 'Noch keine Suche. Starte mit «Stellen suchen».');
    }
    const rateBtn = $('jsRateBtn');
    if (rateBtn && !JS.busy) rateBtn.disabled = !JS.results.some((j) => j.status === 'offen');

    const counts = {
      all: JS.results.filter((j) => j.status === 'offen').length,
      focus: JS.results.filter((j) => j.status === 'offen' && (j.focus || j.focusLabel)).length,
      rec: JS.results.filter((j) => j.status === 'offen' && j.recommended).length,
      done: JS.results.filter((j) => j.status !== 'offen').length
    };
    document.querySelectorAll('#jsSeg button').forEach((b) => {
      b.classList.toggle('on', b.dataset.f === JS.filter);
      b.querySelector('em').textContent = counts[b.dataset.f];
    });

    const jobs = visibleJobs();
    $('jsList').innerHTML = jobs.length ? jobs.map(jobRow).join('') : `<div class="js-empty"><i class="fas fa-search"></i>${
      JS.results.length ? 'In diesem Filter gibt es keine Stellen.' : 'Noch keine Treffer. Passe bei Bedarf die Suchkriterien an und starte die Suche.'}</div>`;
    $('jsList').querySelectorAll('.js-job').forEach((row) => {
      const job = JS.results.find((j) => j.id === row.dataset.id);
      row.addEventListener('click', (ev) => {
        if (ev.target.closest('a, button') || job.status !== 'offen') return;
        JS.selected.has(job.id) ? JS.selected.delete(job.id) : JS.selected.add(job.id);
        render();
      });
      row.querySelector('[data-act=hide]')?.addEventListener('click', async () => {
        try { await mark([job], 'dismissed'); render(); } catch (e) { toast(e.message, 'error'); }
      });
      row.querySelector('[data-act=reopen]')?.addEventListener('click', async () => {
        try { await mark([job], 'open'); render(); } catch (e) { toast(e.message, 'error'); }
      });
    });

    const n = JS.selected.size;
    $('jsPackbar').classList.toggle('show', n > 0);
    $('jsPackCount').textContent = `${n} Stelle${n === 1 ? '' : 'n'} ausgewählt`;
    setStep(JS.busy && $('jsProgress').style.display === 'block' ? 3 : (n ? 2 : 1));
  }

  function jobRow(j) {
    const open = j.status === 'offen';
    const sel = JS.selected.has(j.id);
    const score = j.aiScore ?? null;
    const cls = score == null ? '' : score >= 70 ? '' : score >= 55 ? 'mid' : 'low';
    const focus = j.focusLabel || (j.focus ? 'Fokus' : '');
    const date = j.published ? new Date(j.published).toLocaleDateString('de-CH') : '';
    const meta = [j.company, j.location, date, j.source].filter(Boolean).map(esc).join(' · ');
    return `<div class="js-job${sel ? ' sel' : ''}${open ? '' : ' done'}" data-id="${esc(j.id)}">
      <input type="checkbox" ${sel ? 'checked' : ''} ${open ? '' : 'disabled'} aria-label="auswählen">
      <div class="js-score"><b class="${cls}">${score ?? j.baseScore ?? ''}</b><span>${score == null ? 'Treffer' : 'KI-Score'}</span></div>
      <div>
        <div class="js-title"><a href="${esc(j.url)}" target="_blank" rel="noopener">${esc(j.title)}</a>
          ${focus ? `<span class="js-badge focus">★ ${esc(focus)}</span>` : ''}
          ${j.recommended && open ? '<span class="js-badge rec">empfohlen</span>' : ''}
          ${j.track === 'entwicklung' ? '<span class="js-badge dev">↗ Entwicklung</span>' : ''}
          ${j.wfa ? '<span class="js-badge remote">weltweit remote</span>' : j.remote ? '<span class="js-badge remote">remote</span>' : ''}
          ${open ? '' : `<span class="js-badge done">${esc(j.status)}</span>`}</div>
        <div class="js-meta">${meta}</div>
        ${j.why ? `<div class="js-why">${esc(j.why)}</div>` : ''}
      </div>
      <div class="js-row-actions">${open
        ? `<button class="js-btn small ghost" data-act="hide" title="Nicht mehr anzeigen"><i class="fas fa-eye-slash"></i> Ausblenden</button>`
        : `<button class="js-btn small ghost" data-act="reopen"><i class="fas fa-undo"></i> Wieder öffnen</button>`}</div>
    </div>`;
  }

  // ─────────────────────────────────────────────────────────── Init

  function bind() {
    $('jsSearchBtn')?.addEventListener('click', search);
    $('jsRateBtn')?.addEventListener('click', rate);
    $('jsPackBtn')?.addEventListener('click', createApplications);
    $('jsSaveCriteria')?.addEventListener('click', saveCriteria);
    $('jsClearSel')?.addEventListener('click', () => { JS.selected.clear(); render(); });
    $('jsSelectRec')?.addEventListener('click', () => {
      JS.results.filter((j) => j.status === 'offen' && (j.recommended || (j.aiScore == null && j.focus))).forEach((j) => JS.selected.add(j.id));
      render();
    });
    document.querySelectorAll('#jsSeg button').forEach((b) => b.addEventListener('click', () => { JS.filter = b.dataset.f; render(); }));
  }

  function mount() {
    const root = $('jobSearchRoot');
    if (!root || root.dataset.bound) return;
    root.dataset.bound = '1';
    bind();
    if (JS.loaded) { renderCriteria(); render(); } else load();
  }

  window.JobSearch = { mount, load, search, rate, state: JS };
})();
