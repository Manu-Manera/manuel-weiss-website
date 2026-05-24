/**
 * Personality Song Generator
 * Frontend-Modul für persoenlichkeits-song-generator.html
 *
 * Pipeline:
 *  0. Welcome
 *  1. Test (24 Items, 4 Phasen, gemischte Formate)
 *  2. Externe Inputs (Tests, Chats, Social, Music)
 *  3. Synthese → Persona-Profil mit Visualisierung
 *  4. Komposition → Song-Objekt
 *  5. Editor (per-Zeile Re-Roll, Sektionen umschreiben)
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    apiKey: 'openai_api_key',
    test: 'sg_test_state_v1',
    externalInputs: 'sg_external_inputs_v1',
    persona: 'sg_persona_v1',
    song: 'sg_song_v1'
  };

  // ────────────────────────────────────────────────────────────
  // API
  // ────────────────────────────────────────────────────────────
  async function getApiKey() {
    if (window.openaiService && typeof window.openaiService.getApiKeyAsync === 'function') {
      try {
        const k = await window.openaiService.getApiKeyAsync();
        if (k && k.startsWith('sk-')) return k;
      } catch (_e) { /* noop */ }
    }
    if (window.awsAPISettings && typeof window.awsAPISettings.getFullApiKey === 'function') {
      try {
        const k = await window.awsAPISettings.getFullApiKey('openai');
        if (k && k.startsWith('sk-')) return k;
      } catch (_e) { /* noop */ }
    }
    const ls = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEYS.apiKey)) || '';
    if (ls && ls.startsWith('sk-')) return ls;
    return null;
  }

  function apiUrl() {
    if (window.AWS_APP_CONFIG && typeof window.AWS_APP_CONFIG.getEndpointUrl === 'function') {
      const u = window.AWS_APP_CONFIG.getEndpointUrl('SONG_GENERATOR');
      if (u) return u;
    }
    return 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/song-generator';
  }

  // ────────────────────────────────────────────────────────────
  // Direct OpenAI (Browser → OpenAI) – Fallback wenn die Lambda
  // (noch) nicht deployed ist. Identische Prompts wie die Lambda.
  // ────────────────────────────────────────────────────────────
  const MODEL_FALLBACKS = ['gpt-5.2', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

  function safeJsonParse(text) {
    if (!text || typeof text !== 'string') return null;
    let candidate = text.trim();
    candidate = candidate.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
    try { return JSON.parse(candidate); } catch (_e) {}
    const start = candidate.indexOf('{');
    if (start === -1) return null;
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < candidate.length; i += 1) {
      const ch = candidate[i];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') { inStr = true; continue; }
      if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          try { return JSON.parse(candidate.slice(start, i + 1)); } catch (_err) { return null; }
        }
      }
    }
    return null;
  }

  async function callOpenAIDirect(opts) {
    const apiKey = opts.apiKey;
    const candidates = [];
    if (opts.model) candidates.push(opts.model);
    MODEL_FALLBACKS.forEach((m) => { if (!candidates.includes(m)) candidates.push(m); });
    const errors = [];
    for (const model of candidates) {
      let res;
      try {
        res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: opts.system },
              { role: 'user', content: opts.user }
            ],
            temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.7,
            top_p: typeof opts.top_p === 'number' ? opts.top_p : 0.95,
            max_tokens: typeof opts.maxTokens === 'number' ? opts.maxTokens : 4000,
            response_format: { type: 'json_object' }
          })
        });
      } catch (err) { errors.push({ model, msg: err.message }); continue; }
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        const parsed = safeJsonParse(text);
        if (parsed) return parsed;
        errors.push({ model, msg: 'parse failed' });
        continue;
      }
      let errText = '';
      try { errText = await res.text(); } catch (_e) {}
      errors.push({ model, status: res.status, msg: errText.slice(0, 300) });
      if (res.status === 401 || res.status === 403) break;
    }
    const e = new Error('OpenAI-Aufruf fehlgeschlagen');
    e.details = errors;
    throw e;
  }

  async function dispatchDirect(action, payload, apiKey) {
    if (!window.SONG_PROMPTS) {
      throw new Error('Direct-Mode: SONG_PROMPTS nicht geladen. Stelle sicher, dass js/song-generator-prompts.js eingebunden ist.');
    }
    const P = window.SONG_PROMPTS;
    if (action === 'test_questions') {
      return callOpenAIDirect({ apiKey, system: P.SYSTEM_CORE, user: P.PROMPT_TEST_QUESTIONS, temperature: 0.6, top_p: 0.9, maxTokens: 6000 });
    }
    if (action === 'interpret_input') {
      const { source_type, raw, lang } = payload || {};
      if (!source_type || !raw) throw new Error('source_type + raw nötig');
      return callOpenAIDirect({ apiKey, system: P.SYSTEM_CORE, user: P.buildInputInterpreterUserPrompt({ source_type, raw, lang }), temperature: 0.3, top_p: 0.9, maxTokens: 3000 });
    }
    if (action === 'synthesize') {
      const { test_results, external_signals, user_meta } = payload || {};
      return callOpenAIDirect({ apiKey, system: P.SYSTEM_CORE, user: P.buildPersonaSynthesisUserPrompt({ test_results, external_signals, user_meta }), temperature: 0.4, top_p: 0.9, maxTokens: 3000 });
    }
    if (action === 'compose') {
      const { persona, creativity } = payload || {};
      if (!persona) throw new Error('persona fehlt');
      return callOpenAIDirect({ apiKey, system: P.SYSTEM_CORE, user: P.buildSongComposerUserPrompt({ persona, mode: 'full', edit_targets: [], previous_song: null, creativity }), temperature: 0.85, top_p: 0.95, maxTokens: 4500 });
    }
    if (action === 'reroll') {
      const { persona, previous_song, edit_targets, mode, creativity } = payload || {};
      if (!persona || !previous_song || !Array.isArray(edit_targets) || !edit_targets.length) throw new Error('persona + previous_song + edit_targets nötig');
      return callOpenAIDirect({
        apiKey, system: P.SYSTEM_CORE,
        user: P.buildSongComposerUserPrompt({ persona, mode: mode || 'regenerate_lines', edit_targets, previous_song, creativity: typeof creativity === 'number' ? creativity : 0.95 }),
        temperature: 0.95, top_p: 0.98, maxTokens: 2500, model: 'gpt-4o-mini'
      });
    }
    throw new Error('Unbekannte action: ' + action);
  }

  async function callApi(action, payload, opts) {
    const apiKey = await getApiKey();
    if (!apiKey) {
      const err = new Error('Es ist kein OpenAI API-Key hinterlegt. Bitte oben einen Key eingeben oder im Admin-Panel speichern.');
      err.code = 'no_api_key';
      throw err;
    }
    // Versuche Lambda (zentral, geringere CORS-Risiken). Bei 4xx (404 Route fehlt etc.)
    // oder Netzwerkfehlern Fallback auf Direct-Modus (Browser → OpenAI).
    try {
      const res = await fetch(apiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload, apiKey, model: opts && opts.model })
      });
      let json;
      try { json = await res.json(); } catch (_e) { json = null; }
      if (res.ok && json && json.success) return json.data;
      // Bei 4xx Routing-Fehlern Fallback auf direct
      if (res.status === 404 || res.status === 403 || res.status === 502 || res.status === 503) {
        console.warn('[SongGenerator] Lambda nicht erreichbar (' + res.status + ') → Direct-Mode.');
        return await dispatchDirect(action, payload, apiKey);
      }
      const e = new Error(json && json.error ? json.error : 'API-Fehler ' + res.status);
      e.details = json && json.details;
      throw e;
    } catch (err) {
      if (err.code === 'no_api_key') throw err;
      // TypeError = Netzwerkfehler / CORS / Lambda fehlt komplett
      if (err instanceof TypeError) {
        console.warn('[SongGenerator] Netzwerkfehler bei Lambda → Direct-Mode:', err.message);
        return await dispatchDirect(action, payload, apiKey);
      }
      throw err;
    }
  }

  // ────────────────────────────────────────────────────────────
  // Storage helpers
  // ────────────────────────────────────────────────────────────
  function saveState(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_e) {}
  }
  function loadState(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : (fallback === undefined ? null : fallback);
    } catch (_e) { return fallback === undefined ? null : fallback; }
  }
  function clearState(key) { try { localStorage.removeItem(key); } catch (_e) {} }

  // ────────────────────────────────────────────────────────────
  // SongGenerator (Hauptklasse)
  // ────────────────────────────────────────────────────────────
  class SongGenerator {
    constructor(rootId) {
      this.root = document.getElementById(rootId);
      if (!this.root) throw new Error('Root-Element nicht gefunden: ' + rootId);
      this.state = {
        step: 0,                  // 0=Welcome, 1=Test, 2=Inputs, 3=Synthese, 4=Compose, 5=Editor
        questions: null,          // PROMPT_TEST_QUESTIONS Output
        answers: {},              // itemId → option index oder slider value
        externalInputs: loadState(STORAGE_KEYS.externalInputs, []),
        persona: loadState(STORAGE_KEYS.persona),
        song: loadState(STORAGE_KEYS.song),
        userMeta: {
          name_or_alias: '',
          lang: 'de',
          must_include_keywords: [],
          must_avoid_keywords: [],
          explicit: false
        }
      };
      const savedTest = loadState(STORAGE_KEYS.test);
      if (savedTest) {
        this.state.questions = savedTest.questions;
        this.state.answers = savedTest.answers || {};
      }
      this.render();
    }

    setStep(n) { this.state.step = n; this.render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

    persistTest() {
      saveState(STORAGE_KEYS.test, { questions: this.state.questions, answers: this.state.answers });
    }

    // ────────────────────────────────────────────────────────────
    // RENDER
    // ────────────────────────────────────────────────────────────
    render() {
      this.root.innerHTML = '';
      this.root.appendChild(this.renderProgressBar());
      switch (this.state.step) {
        case 0: this.root.appendChild(this.renderWelcome()); break;
        case 1: this.root.appendChild(this.renderTest()); break;
        case 2: this.root.appendChild(this.renderInputs()); break;
        case 3: this.root.appendChild(this.renderSynthesis()); break;
        case 4: this.root.appendChild(this.renderCompose()); break;
        case 5: this.root.appendChild(this.renderEditor()); break;
      }
    }

    renderProgressBar() {
      const wrap = el('div', 'sg-progress');
      const labels = ['Start', 'Test', 'Inputs', 'Persona', 'Song', 'Editor'];
      labels.forEach((label, idx) => {
        const dot = el('div', 'sg-progress-step' + (idx === this.state.step ? ' active' : (idx < this.state.step ? ' done' : '')));
        dot.append(el('span', 'sg-progress-dot', String(idx + 1)));
        dot.append(el('span', 'sg-progress-label', label));
        if (idx < this.state.step + 1 && (idx <= this.state.step || (idx === 5 && this.state.song))) {
          dot.style.cursor = 'pointer';
          dot.onclick = () => this.setStep(idx);
        }
        wrap.append(dot);
        if (idx < labels.length - 1) wrap.append(el('div', 'sg-progress-line' + (idx < this.state.step ? ' done' : '')));
      });
      return wrap;
    }

    // ── Step 0: Welcome ─────────────────────────────────────────
    renderWelcome() {
      const wrap = el('div', 'sg-card sg-welcome');
      wrap.append(el('h2', null, 'Dein Persönlichkeits-Song'));
      wrap.append(el('p', 'sg-lead',
        'In wenigen Schritten entsteht ein Song, der dich klingt. ' +
        'Erst ein wissenschaftlich fundierter Test (Big Five / HEXACO / Werte / Stärken), ' +
        'dann optional Inputs aus anderen Tests, Chats oder Social Media – ' +
        'und am Ende ein vollständiger Songtext mit Production-Spec, den du Zeile für Zeile editieren kannst.'
      ));

      const meta = el('div', 'sg-meta-grid');
      meta.append(this.field('Alias / Name (optional)', 'name', this.state.userMeta.name_or_alias, (v) => { this.state.userMeta.name_or_alias = v; }));
      meta.append(this.field('Pflicht-Wörter (komma)', 'must_include', (this.state.userMeta.must_include_keywords || []).join(', '), (v) => {
        this.state.userMeta.must_include_keywords = v.split(',').map(s => s.trim()).filter(Boolean);
      }));
      meta.append(this.field('Tabu-Wörter (komma)', 'must_avoid', (this.state.userMeta.must_avoid_keywords || []).join(', '), (v) => {
        this.state.userMeta.must_avoid_keywords = v.split(',').map(s => s.trim()).filter(Boolean);
      }));
      wrap.append(meta);

      const apiBox = el('div', 'sg-api-box');
      apiBox.append(el('label', null, 'OpenAI API-Key (sk-…)'));
      const inp = el('input', 'sg-input');
      inp.type = 'password';
      inp.placeholder = 'sk-...';
      inp.value = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEYS.apiKey)) || '';
      inp.oninput = () => {
        if (inp.value && inp.value.startsWith('sk-')) localStorage.setItem(STORAGE_KEYS.apiKey, inp.value.trim());
      };
      apiBox.append(inp);
      apiBox.append(el('p', 'sg-hint', 'Wird nur lokal gespeichert. Bist du eingeloggt, wird der Key automatisch aus deinem Profil geladen.'));
      wrap.append(apiBox);

      const actions = el('div', 'sg-actions');
      const startBtn = el('button', 'sg-btn sg-btn-primary', 'Test starten');
      startBtn.onclick = () => this.startTest();
      actions.append(startBtn);

      if (this.state.questions) {
        const resumeBtn = el('button', 'sg-btn sg-btn-ghost', 'Test fortsetzen');
        resumeBtn.onclick = () => this.setStep(1);
        actions.append(resumeBtn);
      }

      const skipBtn = el('button', 'sg-btn sg-btn-ghost', 'Direkt externe Inputs nutzen');
      skipBtn.onclick = () => this.setStep(2);
      actions.append(skipBtn);

      wrap.append(actions);
      return wrap;
    }

    field(label, name, value, onInput) {
      const w = el('div', 'sg-field');
      w.append(el('label', null, label));
      const i = el('input', 'sg-input');
      i.type = 'text';
      i.value = value || '';
      i.placeholder = label;
      i.oninput = (e) => onInput(e.target.value);
      w.append(i);
      return w;
    }

    // ── Step 1: Test ────────────────────────────────────────────
    async startTest() {
      this.setStep(1);
      if (this.state.questions) return;
      const wrap = this.root.querySelector('.sg-card') || this.root;
      const status = this.showStatus('Erstelle Test (24 tiefgehende Fragen) ...');
      try {
        const data = await callApi('test_questions');
        this.state.questions = data;
        this.persistTest();
        this.setStep(1);
      } catch (err) {
        status.textContent = '⚠️ ' + err.message;
        status.classList.add('sg-status-error');
      }
    }

    renderTest() {
      const wrap = el('div', 'sg-card sg-test');
      if (!this.state.questions) {
        wrap.append(el('h2', null, 'Test wird erstellt …'));
        wrap.append(this.showSpinner());
        return wrap;
      }
      const q = this.state.questions;
      const allItems = [];
      (q.phases || []).forEach((phase) => {
        (phase.items || []).forEach((it) => allItems.push({ phase, item: it }));
      });
      const total = allItems.length;
      const answered = Object.keys(this.state.answers).length;

      const head = el('div', 'sg-test-head');
      head.append(el('h2', null, 'Persönlichkeitstest'));
      head.append(el('p', 'sg-lead', `${answered} von ${total} beantwortet · in jeder Antwort steckt ein Klangfaktor`));
      wrap.append(head);

      (q.phases || []).forEach((phase) => {
        const phaseEl = el('div', 'sg-phase');
        const ph = el('div', 'sg-phase-head');
        ph.append(el('span', 'sg-phase-id', phase.id));
        ph.append(el('h3', null, phase.title));
        if (phase.intro) ph.append(el('p', 'sg-phase-intro', phase.intro));
        phaseEl.append(ph);

        (phase.items || []).forEach((item) => {
          phaseEl.append(this.renderTestItem(item));
        });
        wrap.append(phaseEl);
      });

      const actions = el('div', 'sg-actions sg-actions-sticky');
      const back = el('button', 'sg-btn sg-btn-ghost', '← Zurück');
      back.onclick = () => this.setStep(0);
      actions.append(back);

      const continueBtn = el('button', 'sg-btn sg-btn-primary', 'Weiter zu externen Inputs →');
      continueBtn.disabled = answered < total;
      if (answered < total) continueBtn.title = 'Bitte alle ' + total + ' Fragen beantworten';
      continueBtn.onclick = () => this.setStep(2);
      actions.append(continueBtn);

      wrap.append(actions);
      return wrap;
    }

    renderTestItem(item) {
      const w = el('div', 'sg-item' + (this.state.answers[item.id] !== undefined ? ' answered' : ''));
      const flavor = el('div', 'sg-item-flavor', item.flavor_intro || '');
      const stem = el('div', 'sg-item-stem', item.stem || '');
      w.append(flavor);
      w.append(stem);
      if (item.format === 'slider') {
        const sw = el('div', 'sg-slider-wrap');
        const slider = el('input', 'sg-slider');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = this.state.answers[item.id] !== undefined ? this.state.answers[item.id] : 50;
        const valEl = el('div', 'sg-slider-value', slider.value);
        slider.oninput = () => { valEl.textContent = slider.value; };
        slider.onchange = () => { this.state.answers[item.id] = Number(slider.value); this.persistTest(); this.render(); };
        sw.append(slider);
        sw.append(valEl);
        w.append(sw);
      } else if (item.format === 'likert7') {
        const opts = el('div', 'sg-options sg-likert');
        const labels = ['Stimmt gar nicht', '–', '–', 'Neutral', '+', '+', 'Stimmt voll'];
        for (let i = 0; i < 7; i += 1) {
          const o = el('button', 'sg-option' + (this.state.answers[item.id] === i ? ' selected' : ''), labels[i]);
          o.onclick = () => { this.state.answers[item.id] = i; this.persistTest(); this.render(); };
          opts.append(o);
        }
        w.append(opts);
      } else {
        const opts = el('div', 'sg-options');
        (item.options || []).forEach((opt, idx) => {
          const b = el('button', 'sg-option' + (this.state.answers[item.id] === idx ? ' selected' : ''), opt.label || ('Option ' + (idx + 1)));
          b.onclick = () => { this.state.answers[item.id] = idx; this.persistTest(); this.render(); };
          opts.append(b);
        });
        w.append(opts);
      }
      return w;
    }

    // ── Step 2: External Inputs ─────────────────────────────────
    renderInputs() {
      const wrap = el('div', 'sg-card sg-inputs');
      wrap.append(el('h2', null, 'Externe Inputs (optional, aber stark empfohlen)'));
      wrap.append(el('p', 'sg-lead',
        'Füge Ergebnisse aus anderen Tests (16Personalities, Big5, MBTI), ChatGPT-/Claude-Verläufe, ' +
        'Instagram-Bios, WhatsApp-Exporte, Tagebuch-Texte oder Spotify-Lieblingsgenres ein. ' +
        'Die KI extrahiert daraus zusätzliche Signale und gewichtet sie in deinem Profil.'
      ));

      // Liste bereits hinzugefügter Inputs
      if ((this.state.externalInputs || []).length) {
        const listWrap = el('div', 'sg-input-list');
        listWrap.append(el('h3', null, 'Bereits hinzugefügt'));
        this.state.externalInputs.forEach((sig, idx) => {
          const card = el('div', 'sg-input-chip');
          card.append(el('strong', null, sig.source_type));
          card.append(el('span', 'sg-input-conf', 'Konfidenz: ' + Math.round((sig.confidence_overall || 0) * 100) + '%'));
          if (sig.themes && sig.themes.length) {
            card.append(el('span', 'sg-input-themes', sig.themes.slice(0, 3).join(' · ')));
          }
          const del = el('button', 'sg-btn-icon', '✕');
          del.title = 'Entfernen';
          del.onclick = () => {
            this.state.externalInputs.splice(idx, 1);
            saveState(STORAGE_KEYS.externalInputs, this.state.externalInputs);
            this.render();
          };
          card.append(del);
          listWrap.append(card);
        });
        wrap.append(listWrap);
      }

      // Neuer Input
      const form = el('div', 'sg-input-form');
      const typeSelect = el('select', 'sg-input');
      [
        ['personality_test_result', 'Persönlichkeitstest-Ergebnis (16Personalities, Big5, MBTI, …)'],
        ['ai_chat_log', 'KI-Chatverlauf (ChatGPT / Claude / Gemini)'],
        ['social_media', 'Social Media (Insta-Bio, Tweets, LinkedIn, TikTok)'],
        ['messenger_export', 'Messenger-Export (WhatsApp / Signal / Telegram)'],
        ['free_text', 'Freitext / Tagebuch / Selbstbeschreibung'],
        ['music_history', 'Musikgeschmack (Spotify Top, Genres, Mood)']
      ].forEach(([v, l]) => {
        const o = el('option', null, l);
        o.value = v;
        typeSelect.append(o);
      });
      form.append(this.labeled('Quelle', typeSelect));

      const ta = el('textarea', 'sg-textarea');
      ta.rows = 8;
      ta.placeholder = 'Hier den rohen Text einfügen (Test-Auswertung, Chat-Auszug, Bio, etc.) …';
      form.append(this.labeled('Inhalt', ta));

      const addBtn = el('button', 'sg-btn sg-btn-primary', 'Analysieren & hinzufügen');
      addBtn.onclick = async () => {
        if (!ta.value.trim()) return;
        addBtn.disabled = true;
        const status = this.showStatus('Analysiere Input mit KI …', wrap);
        try {
          const sig = await callApi('interpret_input', {
            source_type: typeSelect.value,
            raw: ta.value,
            lang: 'de'
          });
          this.state.externalInputs.push(sig);
          saveState(STORAGE_KEYS.externalInputs, this.state.externalInputs);
          ta.value = '';
          this.render();
        } catch (err) {
          status.textContent = '⚠️ ' + err.message;
          status.classList.add('sg-status-error');
        } finally {
          addBtn.disabled = false;
        }
      };
      form.append(addBtn);
      wrap.append(form);

      // Navigation
      const actions = el('div', 'sg-actions');
      const back = el('button', 'sg-btn sg-btn-ghost', '← Zurück zum Test');
      back.onclick = () => this.setStep(1);
      actions.append(back);

      const next = el('button', 'sg-btn sg-btn-primary', 'Weiter zur Synthese →');
      const hasTest = this.state.questions && Object.keys(this.state.answers).length > 0;
      const hasExt = (this.state.externalInputs || []).length > 0;
      next.disabled = !hasTest && !hasExt;
      if (next.disabled) next.title = 'Mindestens Test ODER ein externer Input nötig';
      next.onclick = () => this.runSynthesis();
      actions.append(next);
      wrap.append(actions);
      return wrap;
    }

    // ── Step 3: Synthesis ───────────────────────────────────────
    async runSynthesis() {
      this.setStep(3);
      const wrap = this.root.querySelector('.sg-card') || this.root;
      // Test-Ergebnisse zu rohem Score-Bündel fusionieren (clientseitig grob)
      const test_results = this.computeRawTestResults();
      try {
        const persona = await callApi('synthesize', {
          test_results,
          external_signals: this.state.externalInputs || [],
          user_meta: this.state.userMeta
        });
        this.state.persona = persona;
        saveState(STORAGE_KEYS.persona, persona);
        this.render();
      } catch (err) {
        const s = wrap.querySelector('.sg-status') || this.showStatus('', wrap);
        s.textContent = '⚠️ ' + err.message;
        s.classList.add('sg-status-error');
      }
    }

    /**
     * Sehr einfache clientseitige Vor-Aggregation: pro Skala
     * weighted average aus Item-Antworten. Die Lambda macht den
     * eigentlichen psychometrischen Schritt; das hier ist nur das
     * unbearbeitete Roh-Bündel.
     */
    computeRawTestResults() {
      const out = {};
      if (!this.state.questions) return out;
      const items = [];
      (this.state.questions.phases || []).forEach(p => (p.items || []).forEach(i => items.push(i)));
      const acc = {};
      items.forEach((it) => {
        const ans = this.state.answers[it.id];
        if (ans === undefined) return;
        let normalized;
        if (it.format === 'slider') normalized = ans / 100;
        else if (it.format === 'likert7') normalized = ans / 6;
        else {
          const opts = it.options || [];
          if (!opts.length) return;
          normalized = ans / Math.max(1, opts.length - 1);
        }
        if (it.reverse) normalized = 1 - normalized;
        const constructs = [];
        if (it.constructs && it.constructs.primary) constructs.push(it.constructs.primary);
        if (it.constructs && Array.isArray(it.constructs.secondary)) constructs.push(...it.constructs.secondary);
        constructs.forEach(c => {
          const k = c && c.scale;
          if (!k) return;
          const w = typeof c.weight === 'number' ? c.weight : 1;
          if (!acc[k]) acc[k] = { sum: 0, w: 0 };
          acc[k].sum += normalized * w;
          acc[k].w += w;
        });
      });
      Object.keys(acc).forEach((k) => {
        const v = acc[k].w > 0 ? Math.round((acc[k].sum / acc[k].w) * 100) : 50;
        out[k] = { value: v, confidence: 0.8 };
      });
      return out;
    }

    renderSynthesis() {
      const wrap = el('div', 'sg-card sg-synthesis');
      if (!this.state.persona) {
        wrap.append(el('h2', null, 'Synthese läuft …'));
        wrap.append(this.showSpinner());
        wrap.append(this.showStatus('Fusioniere Test- und externe Signale, leite Archetyp und music_dna ab …', null));
        return wrap;
      }
      const p = this.state.persona;
      wrap.append(el('h2', null, 'Dein Profil'));
      const arche = el('div', 'sg-archetype');
      arche.append(el('span', 'sg-arche-label', 'Archetyp'));
      arche.append(el('span', 'sg-arche-name', p.archetype || '—'));
      wrap.append(arche);

      if (p.core_narrative) {
        wrap.append(el('p', 'sg-narrative', p.core_narrative));
      }

      // Skalen
      const scales = el('div', 'sg-scales');
      const sf = p.scales_final || {};
      const scaleLabels = {
        BIG5_O: 'Offenheit', BIG5_C: 'Gewissenhaftigkeit', BIG5_E: 'Extraversion',
        BIG5_A: 'Verträglichkeit', BIG5_N: 'Neurotizismus', HEX_H: 'Ehrlichkeit-Demut',
        VAL_SD: 'Selbstbestimmung', VAL_BE: 'Wohlwollen', ATT_SEC: 'Bindungssicherheit'
      };
      Object.keys(scaleLabels).forEach(k => {
        if (typeof sf[k] !== 'number') return;
        const row = el('div', 'sg-scale');
        row.append(el('span', 'sg-scale-label', scaleLabels[k]));
        const bar = el('div', 'sg-scale-bar');
        const fill = el('div', 'sg-scale-fill');
        fill.style.width = Math.max(0, Math.min(100, sf[k])) + '%';
        bar.append(fill);
        row.append(bar);
        row.append(el('span', 'sg-scale-val', String(Math.round(sf[k]))));
        scales.append(row);
      });
      if (Array.isArray(sf.VIA_TOP) && sf.VIA_TOP.length) {
        const via = el('div', 'sg-via');
        via.append(el('span', 'sg-via-label', 'Top-Stärken'));
        sf.VIA_TOP.forEach(s => via.append(el('span', 'sg-via-tag', s)));
        scales.append(via);
      }
      wrap.append(scales);

      // Motive
      if (Array.isArray(p.motifs) && p.motifs.length) {
        const m = el('div', 'sg-motifs');
        m.append(el('h3', null, 'Bilder, die im Song auftauchen'));
        p.motifs.forEach(x => m.append(el('span', 'sg-motif-chip', x)));
        wrap.append(m);
      }

      // Music-DNA Chip
      if (p.music_dna) {
        const dna = el('div', 'sg-dna');
        dna.append(el('h3', null, 'Music DNA'));
        const grid = el('div', 'sg-dna-grid');
        grid.append(this.dnaCell('Tonart', (p.music_dna.key || '?') + ' ' + (p.music_dna.mode || '')));
        grid.append(this.dnaCell('Tempo', (p.music_dna.tempo_bpm || '?') + ' BPM'));
        grid.append(this.dnaCell('Takt', p.music_dna.time_signature || '?'));
        grid.append(this.dnaCell('Energy', this.fmtBar(p.music_dna.energy)));
        grid.append(this.dnaCell('Brightness', this.fmtBar(p.music_dna.brightness)));
        grid.append(this.dnaCell('Warmth', this.fmtBar(p.music_dna.warmth)));
        if (p.music_dna.instrumentation) {
          const inst = [].concat(p.music_dna.instrumentation.core || [], p.music_dna.instrumentation.color || [], p.music_dna.instrumentation.rhythm || []);
          grid.append(this.dnaCell('Instrumente', inst.slice(0, 6).join(' · ')));
        }
        dna.append(grid);
        wrap.append(dna);
      }

      // Tensions
      if (Array.isArray(p.tensions) && p.tensions.length) {
        const tw = el('div', 'sg-tensions');
        tw.append(el('h3', null, 'Spannungsfelder'));
        p.tensions.forEach(t => {
          tw.append(el('p', 'sg-tension', `${t.scale}: Δ${t.delta} – ${t.note || ''}`));
        });
        wrap.append(tw);
      }

      const actions = el('div', 'sg-actions');
      const back = el('button', 'sg-btn sg-btn-ghost', '← Zurück');
      back.onclick = () => this.setStep(2);
      actions.append(back);
      const redo = el('button', 'sg-btn sg-btn-ghost', 'Synthese neu rechnen');
      redo.onclick = () => { this.state.persona = null; this.runSynthesis(); };
      actions.append(redo);
      const next = el('button', 'sg-btn sg-btn-primary', 'Song komponieren →');
      next.onclick = () => this.runCompose();
      actions.append(next);
      wrap.append(actions);
      return wrap;
    }

    dnaCell(label, value) {
      const c = el('div', 'sg-dna-cell');
      c.append(el('span', 'sg-dna-label', label));
      c.append(el('span', 'sg-dna-value', String(value)));
      return c;
    }
    fmtBar(v) {
      const n = Math.round((typeof v === 'number' ? v : 0) * 100);
      return n + '%';
    }

    // ── Step 4: Compose ─────────────────────────────────────────
    async runCompose() {
      this.setStep(4);
      const wrap = this.root.querySelector('.sg-card') || this.root;
      try {
        const song = await callApi('compose', {
          persona: this.state.persona,
          creativity: 0.78
        });
        this.state.song = song;
        saveState(STORAGE_KEYS.song, song);
        this.setStep(5);
      } catch (err) {
        const s = wrap.querySelector('.sg-status') || this.showStatus('', wrap);
        s.textContent = '⚠️ ' + err.message;
        s.classList.add('sg-status-error');
      }
    }

    renderCompose() {
      const wrap = el('div', 'sg-card sg-compose');
      wrap.append(el('h2', null, 'Komponiere Song …'));
      wrap.append(this.showSpinner());
      wrap.append(el('p', 'sg-lead', 'Ich schreibe Songtext, Akkorde und Production-Spec. Das dauert 15–25 Sekunden.'));
      return wrap;
    }

    // ── Step 5: Editor ──────────────────────────────────────────
    renderEditor() {
      const wrap = el('div', 'sg-card sg-editor');
      const s = this.state.song || {};
      const head = el('div', 'sg-song-head');
      head.append(el('h1', 'sg-song-title', s.title || '—'));
      if (s.subtitle) head.append(el('p', 'sg-song-subtitle', s.subtitle));
      const meta = el('div', 'sg-song-meta');
      meta.append(el('span', null, s.key || ''));
      meta.append(el('span', null, (s.tempo_bpm || '?') + ' BPM'));
      meta.append(el('span', null, s.time_signature || ''));
      head.append(meta);
      wrap.append(head);

      if (s.rationale) wrap.append(el('p', 'sg-rationale', s.rationale));

      // Sections
      (s.sections || []).forEach(section => wrap.append(this.renderSongSection(section)));

      // Production Spec
      if (s.production_spec) {
        const ps = el('details', 'sg-production');
        ps.append(el('summary', null, 'Production Spec & Engine-Prompts'));
        const pre = el('pre', null, JSON.stringify({
          production_spec: s.production_spec,
          ai_music_engine_prompts: s.ai_music_engine_prompts
        }, null, 2));
        ps.append(pre);
        const copyBtn = el('button', 'sg-btn sg-btn-ghost', 'Suno-Prompt kopieren');
        copyBtn.onclick = () => {
          if (s.ai_music_engine_prompts && s.ai_music_engine_prompts.suno) {
            navigator.clipboard.writeText(s.ai_music_engine_prompts.suno);
            copyBtn.textContent = '✓ kopiert';
            setTimeout(() => { copyBtn.textContent = 'Suno-Prompt kopieren'; }, 1500);
          }
        };
        ps.append(copyBtn);
        wrap.append(ps);
      }

      const actions = el('div', 'sg-actions');
      const back = el('button', 'sg-btn sg-btn-ghost', '← Persona ändern');
      back.onclick = () => this.setStep(3);
      actions.append(back);
      const newSong = el('button', 'sg-btn sg-btn-ghost', 'Komplett neu komponieren');
      newSong.onclick = () => this.runCompose();
      actions.append(newSong);
      const exportBtn = el('button', 'sg-btn sg-btn-primary', 'Als JSON exportieren');
      exportBtn.onclick = () => this.exportJson();
      actions.append(exportBtn);
      wrap.append(actions);
      return wrap;
    }

    renderSongSection(section) {
      const w = el('div', 'sg-section');
      const h = el('div', 'sg-section-head');
      h.append(el('h3', null, section.label || section.id));
      if (Array.isArray(section.chords) && section.chords.length) {
        const ch = el('span', 'sg-chords', section.chords.join(' · '));
        h.append(ch);
      }
      const rwBtn = el('button', 'sg-btn-icon', '↻');
      rwBtn.title = 'Sektion umschreiben';
      rwBtn.onclick = () => this.openRewriteSection(section);
      h.append(rwBtn);
      w.append(h);
      if (section.performance_note) w.append(el('p', 'sg-perf-note', section.performance_note));

      (section.lines || []).forEach(line => w.append(this.renderLine(section, line)));
      return w;
    }

    renderLine(section, line) {
      const w = el('div', 'sg-line');
      const txt = el('div', 'sg-line-text', line.text || '');
      txt.contentEditable = 'true';
      txt.spellcheck = false;
      txt.onblur = () => {
        const newText = txt.textContent.trim();
        if (newText && newText !== line.text) {
          line.text = newText;
          saveState(STORAGE_KEYS.song, this.state.song);
        }
      };
      w.append(txt);

      const meta = el('div', 'sg-line-meta');
      if (typeof line.syllables === 'number') meta.append(el('span', null, line.syllables + ' Silben'));
      if (typeof line.singability === 'number') meta.append(el('span', null, 'Singbarkeit ' + Math.round(line.singability * 100) + '%'));
      if (Array.isArray(line.imagery_tags)) line.imagery_tags.forEach(t => meta.append(el('span', 'sg-tag', t)));
      w.append(meta);

      // Alt versions
      if (Array.isArray(line.alt_versions) && line.alt_versions.length) {
        const alts = el('div', 'sg-alts');
        line.alt_versions.forEach((alt, idx) => {
          const a = el('button', 'sg-alt', alt.text);
          a.title = alt.delta_note || 'Variante';
          a.onclick = () => {
            line.text = alt.text;
            txt.textContent = alt.text;
            saveState(STORAGE_KEYS.song, this.state.song);
          };
          alts.append(a);
        });
        w.append(alts);
      }

      const actions = el('div', 'sg-line-actions');
      const reroll = el('button', 'sg-btn-tiny', '↻ Neu vorschlagen');
      reroll.onclick = () => this.rerollLine(section, line, reroll);
      actions.append(reroll);
      const customRewrite = el('button', 'sg-btn-tiny', '✎ Eigene Anweisung');
      customRewrite.onclick = () => this.customRewriteLine(section, line);
      actions.append(customRewrite);
      w.append(actions);

      return w;
    }

    async rerollLine(section, line, btnEl) {
      if (btnEl) { btnEl.disabled = true; btnEl.textContent = '… denkt nach'; }
      try {
        const data = await callApi('reroll', {
          persona: this.state.persona,
          previous_song: this.state.song,
          edit_targets: [{ section_id: section.id, line_ids: [line.id], instruction: '' }],
          mode: 'regenerate_lines'
        });
        // Lambda gibt ein vollständiges (oder geändertes) SONG_OBJECT zurück.
        const updatedSection = (data.sections || []).find(s => s.id === section.id);
        if (updatedSection) {
          const updatedLine = (updatedSection.lines || []).find(l => l.id === line.id);
          if (updatedLine) {
            line.text = updatedLine.text;
            line.alt_versions = updatedLine.alt_versions || [];
            line.syllables = updatedLine.syllables;
            line.singability = updatedLine.singability;
            line.imagery_tags = updatedLine.imagery_tags;
            saveState(STORAGE_KEYS.song, this.state.song);
            this.render();
            return;
          }
        }
        // Fallback: ganzes Song-Objekt ersetzen
        this.state.song = data;
        saveState(STORAGE_KEYS.song, data);
        this.render();
      } catch (err) {
        if (btnEl) { btnEl.disabled = false; btnEl.textContent = '↻ Neu vorschlagen'; }
        alert('Re-Roll fehlgeschlagen: ' + err.message);
      }
    }

    async customRewriteLine(section, line) {
      const instr = window.prompt('Wie soll die Zeile umgeschrieben werden? (z. B. „kantiger", „mehr Hoffnung")');
      if (!instr) return;
      try {
        const data = await callApi('reroll', {
          persona: this.state.persona,
          previous_song: this.state.song,
          edit_targets: [{ section_id: section.id, line_ids: [line.id], instruction: instr }],
          mode: 'regenerate_lines'
        });
        const updatedSection = (data.sections || []).find(s => s.id === section.id);
        if (updatedSection) {
          const updatedLine = (updatedSection.lines || []).find(l => l.id === line.id);
          if (updatedLine) {
            Object.assign(line, updatedLine);
            saveState(STORAGE_KEYS.song, this.state.song);
            this.render();
            return;
          }
        }
        this.state.song = data;
        saveState(STORAGE_KEYS.song, data);
        this.render();
      } catch (err) {
        alert('Umschreiben fehlgeschlagen: ' + err.message);
      }
    }

    async openRewriteSection(section) {
      const instr = window.prompt('Wie soll diese Sektion umgeschrieben werden?');
      if (!instr) return;
      try {
        const data = await callApi('reroll', {
          persona: this.state.persona,
          previous_song: this.state.song,
          edit_targets: [{ section_id: section.id, line_ids: (section.lines || []).map(l => l.id), instruction: instr }],
          mode: 'rewrite_section'
        });
        const updatedSection = (data.sections || []).find(s => s.id === section.id);
        if (updatedSection) {
          // Sektion ersetzen
          const idx = (this.state.song.sections || []).findIndex(s => s.id === section.id);
          if (idx >= 0) this.state.song.sections[idx] = updatedSection;
          saveState(STORAGE_KEYS.song, this.state.song);
          this.render();
          return;
        }
        this.state.song = data;
        saveState(STORAGE_KEYS.song, data);
        this.render();
      } catch (err) {
        alert('Sektion umschreiben fehlgeschlagen: ' + err.message);
      }
    }

    exportJson() {
      const blob = new Blob([JSON.stringify({
        persona: this.state.persona,
        song: this.state.song,
        externalInputs: this.state.externalInputs
      }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const slug = (this.state.song && this.state.song.title || 'persoenlichkeits-song')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      a.download = `${slug}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    // ── UI helpers ──────────────────────────────────────────────
    showStatus(text, parent) {
      const s = el('div', 'sg-status', text);
      (parent || this.root).appendChild(s);
      return s;
    }
    showSpinner() {
      const s = el('div', 'sg-spinner');
      s.innerHTML = '<span></span><span></span><span></span>';
      return s;
    }
    labeled(label, control) {
      const w = el('div', 'sg-field');
      w.append(el('label', null, label));
      w.append(control);
      return w;
    }
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = String(text);
    return e;
  }

  window.SongGenerator = SongGenerator;
})();
