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
    test: 'sg_test_state_v2',
    externalInputs: 'sg_external_inputs_v1',
    persona: 'sg_persona_v2',
    song: 'sg_song_v1',
    birth: 'sg_birth_data_v1',
    variant: 'sg_test_variant_v1',
    audio: 'sg_audio_v1'
  };

  const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';

  // ────────────────────────────────────────────────────────────
  // API-Key-Pfad – IDENTISCH zur Onboarding-App
  // (Onboarding Valkeen/onboarding-app/src/services/awsService.js)
  //
  //   1. GET /api-settings?action=key&provider=openai&global=true  (kein Login nötig)
  //   2. Fallback: localStorage 'openai-api-key'
  //
  // Kein „Anmelden", kein User-Pool, keine Cognito-Tokens.
  // Der globale Key ist im Admin-Panel hinterlegt.
  // ────────────────────────────────────────────────────────────
  function _isValid(k) { return typeof k === 'string' && k.startsWith('sk-') && k.length > 20; }

  // Cache (5 Min)
  const _keyCache = { value: null, expiresAt: 0 };
  function invalidateApiKeyCache() { _keyCache.value = null; _keyCache.expiresAt = 0; }

  async function getApiKey() {
    if (_keyCache.value && _keyCache.expiresAt > Date.now()) return _keyCache.value;

    // 1) AWS API Settings – global, ohne Auth
    try {
      const res = await fetch(API_BASE + '/api-settings?action=key&provider=openai&global=true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const k = data && data.apiKey;
        if (_isValid(k)) {
          _keyCache.value = k;
          _keyCache.expiresAt = Date.now() + 5 * 60 * 1000;
          return k;
        }
      }
    } catch (_e) { /* fall through */ }

    // 2) Fallback: localStorage (gleicher Key-Name wie Onboarding-App)
    try {
      const lk = localStorage.getItem('openai-api-key');
      if (_isValid(lk)) {
        _keyCache.value = lk;
        _keyCache.expiresAt = Date.now() + 5 * 60 * 1000;
        return lk;
      }
    } catch (_e) {}

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
  // Modell-Reihenfolge identisch zur Onboarding-App (AICoach.jsx,
  // JourneyPublicShell.jsx, ChangeJourney.jsx, StakeholderAnalysis.jsx) –
  // gpt-4.1 ist das einzige Modell, das der globale Project-Key freigeschaltet hat.
  // ────────────────────────────────────────────────────────────
  const MODEL_FALLBACKS = ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

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

  function _parseOpenAIError(errText) {
    if (!errText) return '';
    try {
      const j = JSON.parse(errText);
      if (j && j.error) {
        const code = j.error.code || j.error.type || '';
        const msg = j.error.message || '';
        return code ? `[${code}] ${msg}` : msg;
      }
    } catch (_e) {}
    return errText.slice(0, 240);
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
      } catch (err) {
        errors.push({ model, msg: 'Netzwerk: ' + err.message });
        continue;
      }
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        const parsed = safeJsonParse(text);
        if (parsed) return parsed;
        errors.push({ model, msg: 'KI-Antwort war kein gültiges JSON' });
        continue;
      }
      let errText = '';
      try { errText = await res.text(); } catch (_e) {}
      const human = _parseOpenAIError(errText);
      errors.push({ model, status: res.status, msg: human });
      // Bei diesen Status macht es keinen Sinn, weitere Modelle zu probieren
      if (res.status === 401 || res.status === 403 || res.status === 429) break;
    }

    // Aussagekräftige Fehlermeldung bauen
    const first = errors[0] || {};
    let userMsg;
    if (first.status === 401) {
      userMsg = 'Dein OpenAI API-Key ist ungültig oder abgelaufen. Bitte im Admin-Panel unter „API-Keys" einen neuen eintragen. Detail: ' + (first.msg || '');
    } else if (first.status === 429) {
      userMsg = 'OpenAI-Limit erreicht (Quota oder Rate-Limit). Bitte Guthaben prüfen oder kurz warten. Detail: ' + (first.msg || '');
    } else if (first.status === 403) {
      userMsg = 'Zugriff verweigert. Vermutlich hat dein API-Key keinen Zugang zu dem Modell. Detail: ' + (first.msg || '');
    } else if (first.msg && first.msg.includes('Netzwerk')) {
      userMsg = 'Verbindung zu OpenAI fehlgeschlagen. Bitte Internetverbindung prüfen.';
    } else {
      const summary = errors.map(e => `${e.model}${e.status ? ' (' + e.status + ')' : ''}: ${e.msg || ''}`).join(' | ');
      userMsg = 'OpenAI-Aufruf fehlgeschlagen. ' + summary;
    }
    const e = new Error(userMsg);
    e.details = errors;
    throw e;
  }

  /**
   * Health-Check: minimal-Call (1 Token), um API-Key + Modell zu validieren.
   * Liefert { ok: true, model } oder wirft mit user-readbarer Message.
   */
  async function healthCheckOpenAI(apiKey) {
    const errors = [];
    for (const model of MODEL_FALLBACKS) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
          body: JSON.stringify({
            model, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1
          })
        });
        if (res.ok) return { ok: true, model };
        const txt = await res.text().catch(() => '');
        const human = _parseOpenAIError(txt);
        errors.push({ model, status: res.status, msg: human });
        if (res.status === 401 || res.status === 403 || res.status === 429) break;
      } catch (err) {
        errors.push({ model, msg: 'Netzwerk: ' + err.message });
      }
    }
    const e = new Error('Health-Check fehlgeschlagen: ' + errors.map(x => `${x.model}${x.status ? ' (' + x.status + ')' : ''}: ${x.msg}`).join(' | '));
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
        temperature: 0.95, top_p: 0.98, maxTokens: 2500, model: 'gpt-4.1'
      });
    }
    throw new Error('Unbekannte action: ' + action);
  }

  async function callApi(action, payload, opts) {
    const apiKey = await getApiKey();
    if (!apiKey) {
      const err = new Error(
        'Es ist kein globaler OpenAI API-Key hinterlegt. Bitte im Admin-Panel unter „API-Keys" einen Key als „global" eintragen ' +
        '(gleicher Speicherort wie bei der Onboarding-App).'
      );
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
  // Auth-Helfer
  // ────────────────────────────────────────────────────────────
  function isLoggedIn() {
    if (window.SongGeneratorImport && window.SongGeneratorImport.isLoggedIn) {
      return window.SongGeneratorImport.isLoggedIn();
    }
    if (window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()) return true;
    if (window.awsAuth && window.awsAuth.isLoggedIn && window.awsAuth.isLoggedIn()) return true;
    return false;
  }

  function openLoginModal() {
    if (window.authModals && window.authModals.showLogin) return window.authModals.showLogin();
    if (window.awsAuth && window.awsAuth.showLoginModal) return window.awsAuth.showLoginModal();
    alert('Login-System wird geladen, bitte einen Moment warten und erneut klicken.');
  }

  // ────────────────────────────────────────────────────────────
  // SongGenerator (Hauptklasse)
  // ────────────────────────────────────────────────────────────
  class SongGenerator {
    constructor(rootId) {
      this.root = document.getElementById(rootId);
      if (!this.root) throw new Error('Root-Element nicht gefunden: ' + rootId);
      this.state = {
        step: 0,                  // 0=Welcome, 1=Test, 2=Geburtsdaten, 3=Inputs, 4=Profil&Karte, 5=Compose, 6=Editor
        questions: null,
        answers: {},
        testVariant: loadState(STORAGE_KEYS.variant, 'medium'),
        externalInputs: loadState(STORAGE_KEYS.externalInputs, []),
        persona: loadState(STORAGE_KEYS.persona),
        song: loadState(STORAGE_KEYS.song),
        birthData: loadState(STORAGE_KEYS.birth, null),
        astrology: null,
        facets: null,
        audio: loadState(STORAGE_KEYS.audio, null),
        audioState: { phase: 'idle' },
        importedMethods: null,
        importedNarrative: '',
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

      // Auf Login-State-Änderungen reagieren – einzige saubere Quelle ist
      // 'songGenerator:authChanged' (vom HTML-Code dispatched).
      // KEIN Listener auf 'userLoggedIn'/'authStateChanged', sonst Schleife.
      window.addEventListener('songGenerator:authChanged', () => {
        this.refreshAuthAndImport();
      });

      // Bei Init bereits eingeloggt? → Cloud + Import
      if (isLoggedIn()) {
        setTimeout(() => this.refreshAuthAndImport(), 300);
      }

      this.render();
    }

    syncLocalCache() {
      if (this.state.questions) {
        saveState(STORAGE_KEYS.test, { questions: this.state.questions, answers: this.state.answers });
      }
      saveState(STORAGE_KEYS.variant, this.state.testVariant);
      saveState(STORAGE_KEYS.externalInputs, this.state.externalInputs);
      saveState(STORAGE_KEYS.persona, this.state.persona);
      saveState(STORAGE_KEYS.song, this.state.song);
      saveState(STORAGE_KEYS.birth, this.state.birthData);
      saveState(STORAGE_KEYS.audio, this.state.audio);
    }

    _cloudSave(milestone, opts) {
      if (!window.SongGeneratorCloud || !window.SongGeneratorCloud.isLoggedIn()) return;
      this.syncLocalCache();
      window.SongGeneratorCloud.scheduleSave(this.state, milestone, opts);
    }

    async loadCloudState() {
      if (!window.SongGeneratorCloud || !window.SongGeneratorCloud.isLoggedIn()) return;
      try {
        const loaded = await window.SongGeneratorCloud.loadLatest();
        if (!loaded || !loaded.snapshot) return;
        window.SongGeneratorCloud.applySnapshotToState(this.state, loaded.snapshot);
        this.syncLocalCache();
        if (window.SongMusicEngine && window.SongMusicEngine.invalidateSunoKeyCache) {
          window.SongMusicEngine.invalidateSunoKeyCache();
        }
        console.log('[SongGenerator] Cloud-Snapshot geladen:', loaded.version && loaded.version.label);
      } catch (err) {
        console.warn('[SongGenerator] Cloud-Laden fehlgeschlagen:', err && err.message);
      }
    }

    async refreshAuthAndImport() {
      if (!isLoggedIn()) {
        this.state.importedMethods = null;
        this.render();
        return;
      }
      await this.loadCloudState();
      if (window.SongMusicEngine && window.SongMusicEngine.invalidateSunoKeyCache) {
        window.SongMusicEngine.invalidateSunoKeyCache();
      }
      if (window.SongMusicEngine && window.SongMusicEngine.getSunoApiKey) {
        window.SongMusicEngine.getSunoApiKey().catch(function () {});
      }
      if (window.SongGeneratorImport) {
        try {
          const result = await window.SongGeneratorImport.importAllMethodData();
          this.state.importedMethods = result.methods;
          this.state.importedNarrative = result.narrative;
        } catch (err) {
          console.warn('[SongGenerator] Datenimport fehlgeschlagen:', err && err.message);
        }
      }
      this.render();
    }

    setStep(n) { this.state.step = n; this.render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

    persistTest() {
      saveState(STORAGE_KEYS.test, { questions: this.state.questions, answers: this.state.answers });
      this._cloudSave('draft', { updateCurrent: true });
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
        case 2: this.root.appendChild(this.renderBirthForm()); break;
        case 3: this.root.appendChild(this.renderInputs()); break;
        case 4: this.root.appendChild(this.renderProfileMap()); break;
        case 5: this.root.appendChild(this.renderCompose()); break;
        case 6: this.root.appendChild(this.renderEditor()); break;
      }
    }

    renderProgressBar() {
      const wrap = el('div', 'sg-progress');
      const labels = ['Start', 'Test', 'Geburt', 'Inputs', 'Karte', 'Song', 'Editor'];
      labels.forEach((label, idx) => {
        const dot = el('div', 'sg-progress-step' + (idx === this.state.step ? ' active' : (idx < this.state.step ? ' done' : '')));
        dot.append(el('span', 'sg-progress-dot', String(idx + 1)));
        dot.append(el('span', 'sg-progress-label', label));
        if (idx < this.state.step + 1 && (idx <= this.state.step || (idx === 6 && this.state.song))) {
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
      // Login-Wall: ohne Anmeldung kein Zugriff (User-Anforderung)
      if (!isLoggedIn()) {
        return this.renderLoginWall();
      }

      const wrap = el('div', 'sg-card sg-welcome');
      wrap.append(el('h2', null, 'Dein Persönlichkeits-Song'));
      wrap.append(el('p', 'sg-lead',
        'Wissenschaftlich validierter Test (IPIP-NEO mit 30 Facetten, HEXACO, Schwartz-Werte, Bindungsstile) ' +
        'plus automatische Auswertung aller bearbeiteten Persönlichkeitsentwicklungs-Methoden auf manuel-weiss.ch. ' +
        'Optional ergänzt durch eine astrologische Karte als poetische Bilder-Schicht.'
      ));

      wrap.append(this.renderImportedDataBox());

      // Test-Varianten-Auswahl
      const variantHead = el('h3', null, 'Test-Tiefe wählen');
      variantHead.style.marginTop = '1rem';
      wrap.append(variantHead);
      const variantsWrap = el('div', 'sg-variants');
      const VAR = (window.SongTestData && window.SongTestData.VARIANTS) || {};
      const variantKeys = ['short', 'medium', 'long'];
      variantKeys.forEach(vk => {
        const v = VAR[vk];
        if (!v) return;
        const card = el('button', 'sg-variant' + (this.state.testVariant === vk ? ' selected' : ''));
        const head = el('div', 'sg-variant-head');
        head.append(el('span', 'sg-variant-title', v.label));
        head.append(el('span', 'sg-variant-min', v.minutes));
        card.append(head);
        card.append(el('div', 'sg-variant-count', v.itemCount + ' Fragen'));
        card.append(el('div', 'sg-variant-desc', v.description));
        card.onclick = () => {
          this.state.testVariant = vk;
          saveState(STORAGE_KEYS.variant, vk);
          // Wenn schon angefangen: warnen + zurücksetzen, falls Antworten den neuen Set sprengen
          if (this.state.questions && this.state.questions.variant !== vk) {
            this.state.questions = null;
            this.state.answers = {};
            this.persistTest();
          }
          this.render();
        };
        variantsWrap.append(card);
      });
      wrap.append(variantsWrap);

      // Schrittweise Erklärung
      const steps = el('div', 'sg-steps');
      [
        { n: '1', t: 'Test', d: 'IPIP-NEO-Items, HEXACO, Schwartz-Werte – wissenschaftlich validiert' },
        { n: '2', t: 'Geburtsdaten', d: 'Optional: Datum + Zeit + Ort für die astrologische Karte' },
        { n: '3', t: 'Profil & Karte', d: 'Big-Five-Radar + Natal-Wheel + Klang-DNA in einer großen Darstellung' },
        { n: '4', t: 'Song', d: 'KI komponiert Text + Akkorde aus allem zusammen, jede Zeile editierbar' }
      ].forEach(s => {
        const it = el('div', 'sg-step-item');
        it.append(el('span', 'sg-step-num', s.n));
        const tx = el('div');
        tx.append(el('strong', null, s.t));
        tx.append(el('span', 'sg-step-desc', s.d));
        it.append(tx);
        steps.append(it);
      });
      wrap.append(steps);

      const actions = el('div', 'sg-actions');
      const startBtn = el('button', 'sg-btn sg-btn-primary', this.state.questions ? 'Test fortsetzen' : 'Test starten');
      startBtn.onclick = () => this.startTest();
      actions.append(startBtn);

      const skipBtn = el('button', 'sg-btn sg-btn-ghost', 'Test überspringen – nur importierte Daten nutzen');
      skipBtn.onclick = () => this.setStep(3);
      actions.append(skipBtn);

      wrap.append(actions);
      return wrap;
    }

    renderLoginWall() {
      const wrap = el('div', 'sg-card sg-login-wall');
      const icon = el('div', 'sg-login-icon');
      icon.innerHTML = '<i class="fas fa-lock"></i>';
      wrap.append(icon);
      wrap.append(el('h2', null, 'Bitte zuerst anmelden'));
      wrap.append(el('p', 'sg-lead',
        'Der Persönlichkeits-Song wird aus deinen Daten der Persönlichkeitsentwicklungs-Methoden auf ' +
        'manuel-weiss.ch komponiert (Ikigai, RAISEC, Werte-Klärung, Lebensrad und mehr). ' +
        'Damit wir auf dein Profil zugreifen können, melde dich bitte mit deinem Konto an.'
      ));
      wrap.append(el('p', 'sg-hint',
        'Noch kein Konto? Beim Klick auf „Anmelden" kannst du dich auch kostenlos registrieren.'
      ));
      const actions = el('div', 'sg-actions');
      const loginBtn = el('button', 'sg-btn sg-btn-primary', 'Anmelden / Registrieren');
      loginBtn.onclick = () => openLoginModal();
      actions.append(loginBtn);
      wrap.append(actions);
      return wrap;
    }

    renderImportedDataBox() {
      const box = el('div', 'sg-import-box');
      const head = el('div', 'sg-import-head');
      head.append(el('h3', null, 'Deine Persönlichkeitsentwicklungs-Daten'));
      const refresh = el('button', 'sg-btn-tiny', '↻ Aktualisieren');
      refresh.onclick = async () => {
        refresh.disabled = true;
        refresh.textContent = '… lade';
        await this.refreshAuthAndImport();
        refresh.disabled = false;
        refresh.textContent = '↻ Aktualisieren';
      };
      head.append(refresh);
      box.append(head);

      const methods = this.state.importedMethods;
      if (!methods) {
        box.append(el('p', 'sg-import-status', 'Daten werden geladen …'));
        return box;
      }
      if (methods.length === 0) {
        box.append(el('p', 'sg-import-status',
          'Noch keine Methoden-Daten in deinem Profil gefunden. ' +
          'Du kannst trotzdem starten – der Test alleine reicht. ' +
          'Mehr Tiefe bekommst du, wenn du z.B. Ikigai oder die Werte-Klärung vorher ausfüllst.'));
        const link = el('a', 'sg-link', 'Zu den Methoden →');
        link.href = 'persoenlichkeitsentwicklung-uebersicht.html';
        box.append(link);
        return box;
      }

      box.append(el('p', 'sg-import-status',
        methods.length + ' Methode' + (methods.length === 1 ? '' : 'n') +
        ' aus deinem Profil importiert – die Erkenntnisse fließen direkt in deinen Song ein.'));

      const list = el('div', 'sg-import-list');
      methods.forEach(m => {
        const chip = el('div', 'sg-import-chip');
        chip.append(el('strong', null, m.name));
        if (m.completion !== null) chip.append(el('span', 'sg-import-pct', m.completion + '%'));
        chip.append(el('span', 'sg-import-count', m.findings.length + ' Inhalte'));
        chip.title = m.findings.join(' · ');
        list.append(chip);
      });
      box.append(list);

      // Ausklappbare ausformulierte Zusammenfassung – editierbar
      if (this.state.importedNarrative) {
        const details = el('details', 'sg-import-details');
        details.append(el('summary', null, 'Zusammenfassung anzeigen / vor dem Komponieren bearbeiten'));
        const ta = el('textarea', 'sg-textarea sg-import-textarea');
        ta.rows = 12;
        ta.value = this.state.importedNarrative;
        ta.onchange = () => { this.state.importedNarrative = ta.value; };
        details.append(ta);
        details.append(el('p', 'sg-hint',
          'Du kannst diesen Text manuell anpassen – die KI nutzt genau diesen Inhalt für die Persona-Synthese und Songkomposition.'));
        box.append(details);
      }
      return box;
    }

    // ── Step 1: Test ────────────────────────────────────────────
    startTest() {
      if (!isLoggedIn()) { this.setStep(0); return; }
      if (!this.state.questions || this.state.questions.variant !== this.state.testVariant) {
        if (!window.SongTestData) {
          const wrap0 = this.root.querySelector('.sg-card') || this.root;
          const s = this.showStatus('Test-Daten konnten nicht geladen werden. Bitte Seite neu laden.', wrap0);
          s.classList.add('sg-status-error');
          return;
        }
        this.state.questions = window.SongTestData.getStaticTest(this.state.testVariant);
        // Antworten zurücksetzen, wenn Variante gewechselt wurde und neue IDs nicht passen
        this.persistTest();
      }
      this.setStep(1);
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
      head.append(el('p', 'sg-lead', `${answered} von ${total} beantwortet · jede Antwort beeinflusst Tonart, Tempo und Instrumentierung`));
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

      const continueBtn = el('button', 'sg-btn sg-btn-primary', 'Weiter zu Geburtsdaten →');
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

    // ── Step 2: Geburtsdaten (optional, für astrologische Karte) ─
    renderBirthForm() {
      const wrap = el('div', 'sg-card sg-birth');
      wrap.append(el('h2', null, 'Geburtsdaten (optional)'));
      wrap.append(el('p', 'sg-lead',
        'Wenn du Datum, Zeit und Ort deiner Geburt angibst, berechnen wir eine astrologische Karte ' +
        '(Sonne, Mond, Aszendent, Planeten in Zeichen und Häusern). Diese fließt rein als ' +
        'poetische Bildsprache in deinen Songtext ein – wissenschaftlich ist sie nicht. ' +
        'Wenn du das überspringst, läuft alles ohne Astro-Schicht weiter.'
      ));

      const bd = this.state.birthData || {};
      const form = el('div', 'sg-birth-form');

      // Datum
      const fDate = el('div', 'sg-field');
      fDate.append(el('label', null, 'Geburtsdatum'));
      const date = el('input');
      date.type = 'date';
      if (bd.date) date.value = bd.date;
      fDate.append(date);
      form.append(fDate);

      // Zeit
      const fTime = el('div', 'sg-field');
      fTime.append(el('label', null, 'Geburtszeit (sofern bekannt)'));
      const time = el('input');
      time.type = 'time';
      if (bd.time && bd.timeKnown !== false) time.value = bd.time;
      fTime.append(time);
      const timeKnownWrap = el('label', 'sg-birth-skip');
      const tk = el('input'); tk.type = 'checkbox'; tk.id = 'sg-time-unknown';
      tk.checked = bd.timeKnown === false;
      timeKnownWrap.append(tk);
      timeKnownWrap.append(document.createTextNode('Zeit unbekannt (Aszendent dann nicht berechenbar)'));
      tk.onchange = () => { time.disabled = tk.checked; };
      time.disabled = tk.checked;
      fTime.append(timeKnownWrap);
      form.append(fTime);

      // Ort (mit Geocoding)
      const fPlace = el('div', 'sg-field');
      fPlace.append(el('label', null, 'Geburtsort'));
      const place = el('input');
      place.type = 'text';
      place.placeholder = 'z. B. Zürich, Schweiz';
      if (bd.place) place.value = bd.place;
      fPlace.append(place);
      const suggestions = el('div', 'sg-birth-suggestions');
      suggestions.style.display = 'none';
      fPlace.append(suggestions);
      form.append(fPlace);

      // Versteckte Felder
      const meta = { lat: bd.lat || null, lon: bd.lon || null, place: bd.place || null, tzOffsetMinutes: bd.tzOffsetMinutes || null };

      // TZ-Info-Zeile
      const tzInfo = el('div', 'sg-birth-tz');
      function refreshTz() {
        if (typeof meta.lat === 'number' && typeof meta.lon === 'number') {
          const offsetMin = window.SongGeocoding
            ? window.SongGeocoding.estimateTimezoneOffsetMinutes(meta.lat, meta.lon, date.value)
            : 0;
          meta.tzOffsetMinutes = offsetMin;
          tzInfo.innerHTML = '🌍 Koordinaten: <strong>' + meta.lat.toFixed(2) + '°, ' + meta.lon.toFixed(2) +
            '°</strong> · Zeitzone geschätzt: <strong>' + window.SongGeocoding.formatOffset(offsetMin) + '</strong>';
        } else {
          tzInfo.textContent = 'Noch keine Koordinaten gewählt.';
        }
      }
      refreshTz();
      form.append(tzInfo);

      // Geocoding live
      let debounce = null;
      place.oninput = () => {
        const q = place.value.trim();
        clearTimeout(debounce);
        if (q.length < 2 || !window.SongGeocoding) {
          suggestions.style.display = 'none';
          return;
        }
        debounce = setTimeout(async () => {
          const results = await window.SongGeocoding.searchPlace(q);
          suggestions.innerHTML = '';
          if (!results.length) { suggestions.style.display = 'none'; return; }
          results.slice(0, 6).forEach(r => {
            const b = el('button', null, r.label);
            b.onclick = (e) => {
              e.preventDefault();
              place.value = r.label;
              meta.lat = r.lat; meta.lon = r.lon; meta.place = r.label;
              suggestions.style.display = 'none';
              refreshTz();
            };
            suggestions.append(b);
          });
          suggestions.style.display = 'block';
        }, 350);
      };
      date.onchange = refreshTz;

      const hint = el('div', 'sg-birth-hint',
        'Hinweis: Die Astrologie nutzt OpenStreetMap zur Ortssuche (kostenlos, kein Tracking) und ' +
        'astronomy-engine für die Berechnung. Für eine vollständige Karte brauchen wir Datum + Zeit + Ort. ' +
        'Wenn die Zeit unbekannt ist, berechnen wir Sonne/Mond/Planeten in Zeichen (kein Aszendent).'
      );
      form.append(hint);

      wrap.append(form);

      const actions = el('div', 'sg-actions');
      const back = el('button', 'sg-btn sg-btn-ghost', '← Zurück zum Test');
      back.onclick = () => this.setStep(1);
      actions.append(back);

      const skip = el('button', 'sg-btn sg-btn-ghost', 'Überspringen');
      skip.onclick = () => {
        this.state.birthData = null;
        clearState(STORAGE_KEYS.birth);
        this.setStep(3);
      };
      actions.append(skip);

      const save = el('button', 'sg-btn sg-btn-primary', 'Weiter zu externen Inputs →');
      save.onclick = () => {
        if (!date.value) { alert('Bitte mindestens das Geburtsdatum angeben oder „Überspringen" klicken.'); return; }
        const bd = {
          date: date.value,
          time: time.value || null,
          timeKnown: !tk.checked && !!time.value,
          place: meta.place,
          lat: meta.lat,
          lon: meta.lon,
          tzOffsetMinutes: meta.tzOffsetMinutes
        };
        this.state.birthData = bd;
        saveState(STORAGE_KEYS.birth, bd);
        this.setStep(3);
      };
      actions.append(save);
      wrap.append(actions);
      return wrap;
    }

    // ── Step 3: External Inputs ─────────────────────────────────
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
          del.setAttribute('aria-label', 'Input ' + (sig.source_type || '') + ' entfernen');
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
      const back = el('button', 'sg-btn sg-btn-ghost', '← Zurück zu Geburtsdaten');
      back.onclick = () => this.setStep(2);
      actions.append(back);

      const next = el('button', 'sg-btn sg-btn-primary', 'Profil berechnen →');
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
    /**
     * Sammelt alle externen Signale für die Synthese. Inkludiert die
     * automatisch importierten Persönlichkeitsentwicklungs-Daten als
     * pseudo-PERSONA_SIGNAL_SCHEMA-Eintrag.
     */
    _collectExternalSignals() {
      const sigs = (this.state.externalInputs || []).slice();
      // Importierte Methoden-Daten als zusätzliches Signal
      if (this.state.importedNarrative && this.state.importedMethods && this.state.importedMethods.length) {
        sigs.unshift({
          source_type: 'personality_methods_history',
          lang: 'de',
          scrubbed_excerpt: this.state.importedNarrative.slice(0, 500),
          full_text: this.state.importedNarrative,
          method_summary: this.state.importedMethods.map(m => ({
            name: m.name, completion: m.completion, findings: m.findings
          })),
          confidence_overall: 0.9,
          notes: 'Automatischer Import aus AWS-Profil + localStorage'
        });
      }
      return sigs;
    }

    async runSynthesis() {
      this.setStep(4);

      // 1. Skoring + Facetten + DNA (clientseitig, deterministisch)
      const T = window.SongTestData;
      const variant = this.state.testVariant || 'medium';
      const scoring = T ? T.computeScores(this.state.answers, variant) : { scales: {}, facets: {} };
      const scales = scoring.scales || {};
      const facets = scoring.facets || {};
      this.state.facets = facets;
      const baseDNA = T ? T.computeMusicDNA(scales, facets) : null;
      const baseArchetype = T ? T.computeArchetype(scales, facets) : 'Nordstern';

      // 2. Astrologische Karte (optional, nur wenn Geburtsdaten + astronomy-engine vorhanden)
      let astroChart = null;
      const bd = this.state.birthData;
      if (bd && bd.date && window.SongAstrology && window.Astronomy) {
        try {
          astroChart = window.SongAstrology.computeChart(bd);
          this.state.astrology = astroChart;
        } catch (err) {
          console.warn('[SongGenerator] Astrologie-Berechnung fehlgeschlagen:', err && err.message);
          this.state.astrology = null;
        }
      } else {
        this.state.astrology = null;
      }

      const externalSignals = this._collectExternalSignals();
      const importedCount = Array.isArray(this.state.importedMethods) ? this.state.importedMethods.length : 0;

      // Direct-Persona als Fallback
      const directPersona = {
        archetype: baseArchetype,
        scales_final: Object.assign({}, scales, { VIA_TOP: this._topVIAFromScales(scales) }),
        facets_final: facets,
        tensions: [],
        core_narrative: this._buildNarrative(baseArchetype, scales),
        motifs: this._buildMotifs(scales, astroChart),
        music_dna: baseDNA,
        astrology: astroChart || null,
        test_variant: variant,
        imported_narrative: this.state.importedNarrative || null,
        imported_methods: this.state.importedMethods || [],
        imported_methods_count: importedCount,
        rationale: 'Profil aus IPIP-NEO-Items (' + variant + '), HEXACO-H, Schwartz-Werten und Bindung berechnet.' +
          (astroChart ? ' Astrologische Bildsprache als Zusatz-Schicht.' : '') +
          (externalSignals.length ? ' Plus ' + externalSignals.length + ' externe(r) Signal(e).' : '')
      };

      const hasExt = externalSignals.length > 0;
      if (!hasExt) {
        this.state.persona = directPersona;
        saveState(STORAGE_KEYS.persona, directPersona);
        this._cloudSave('persona', { forceNewVersion: true });
        this.render();
        return;
      }

      try {
        const persona = await callApi('synthesize', {
          test_results: this._asConfidenceMap(scales),
          facets: facets,
          astrology: astroChart ? this._compactAstro(astroChart) : null,
          external_signals: externalSignals,
          user_meta: this.state.userMeta,
          base_dna: baseDNA,
          base_archetype: baseArchetype,
          imported_narrative: this.state.importedNarrative || null
        });
        if (this.state.importedNarrative) persona.imported_narrative = this.state.importedNarrative;
        persona.astrology = astroChart || null;
        persona.facets_final = persona.facets_final || facets;
        persona.test_variant = variant;
        persona.imported_methods = this.state.importedMethods || [];
        persona.imported_methods_count = importedCount;
        this.state.persona = persona;
        saveState(STORAGE_KEYS.persona, persona);
        this._cloudSave('persona', { forceNewVersion: true });
        this.render();
      } catch (err) {
        console.warn('[SongGenerator] KI-Synthese fehlgeschlagen, nutze Direct-Persona:', err && err.message);
        this.state.persona = directPersona;
        saveState(STORAGE_KEYS.persona, directPersona);
        this._cloudSave('persona', { forceNewVersion: true });
        this.render();
        const s = this.showStatus('Hinweis: KI-Synthese war nicht verfügbar. Profil basiert auf clientseitiger Berechnung ohne KI-Verfeinerung.', this.root.querySelector('.sg-card') || this.root);
        s.classList.add('sg-status-error');
      }
    }

    // Kompakte Astro-Darstellung für den Prompt (Token-sparsam)
    _compactAstro(chart) {
      if (!chart) return null;
      return {
        ascSign: chart.ascSign, mcSign: chart.mcSign,
        placements: (chart.placements || []).map(p => ({
          planet: p.planet, sign: p.sign, house: p.house, deg: p.degInSign
        })),
        aspects: (chart.aspects || []).slice(0, 8).map(a => ({
          a: a.a, b: a.b, type: a.type, meaning: a.meaning
        })),
        elementBalance: chart.elementBalance,
        modalityBalance: chart.modalityBalance,
        hints: chart.hints
      };
    }

    // Skalen → Confidence-Map für die Synthese-Lambda
    _asConfidenceMap(scales) {
      const out = {};
      Object.keys(scales || {}).forEach(k => {
        out[k] = { value: scales[k], confidence: 0.85 };
      });
      return out;
    }

    // Top-3 VIA-Stärken aus Skalenwerten ableiten (deterministisch)
    _topVIAFromScales(s) {
      const candidates = [
        { name: 'Mut', score: s.VIA + (100 - s.BIG5_N) * 0.2 },
        { name: 'Liebe', score: s.BIG5_A * 0.6 + s.ATT_SEC * 0.4 },
        { name: 'Neugier', score: s.BIG5_O },
        { name: 'Zielstrebigkeit', score: s.BIG5_C },
        { name: 'Ehrlichkeit', score: s.HEX_H },
        { name: 'Selbstbestimmung', score: s.VAL_SD },
        { name: 'Großzügigkeit', score: s.VAL_BE },
        { name: 'Begeisterung', score: s.BIG5_E }
      ].filter(x => typeof x.score === 'number');
      candidates.sort((a, b) => b.score - a.score);
      return candidates.slice(0, 3).map(c => c.name);
    }

    // Kurze Persona-Erzählung (3 Sätze, deterministisch aus Top-Skalen)
    _buildNarrative(archetype, s) {
      const E = s.BIG5_E, O = s.BIG5_O, A = s.BIG5_A, C = s.BIG5_C, N = s.BIG5_N, H = s.HEX_H;
      const energy = E >= 65 ? 'Du gibst Räumen Energie' : E <= 35 ? 'Deine Stärke liegt im Stillen' : 'Du bewegst dich zwischen Bühne und Rückzug';
      const tiefe = O >= 65 ? 'liebst Bilder und Bedeutungen' : O <= 35 ? 'magst Klarheit und das Greifbare' : 'verbindest Konkretes mit Bedeutung';
      const halt = N >= 65 ? 'auch wenn manches in dir wogt' : N <= 35 ? 'mit ruhigem inneren Boden' : 'manchmal ruhig, manchmal aufgewühlt';
      const wert = H >= 60 ? 'Aufrichtigkeit ist dein Kompass' : A >= 65 ? 'andere Menschen sind dein Maßstab' : C >= 65 ? 'Disziplin trägt deine Vision' : 'du gehst eigene Wege';
      return `Du bist ein ${archetype}: ${energy} und ${tiefe}. ${wert.charAt(0).toUpperCase() + wert.slice(1)} – ${halt}.`;
    }

    // Bilder/Motive für den Songtext (deterministisch, mit optionaler Astro-Schicht)
    _buildMotifs(s, astro) {
      const pool = [];
      if (s.BIG5_O >= 60) pool.push('Sterne', 'Karten', 'Brücken');
      if (s.BIG5_O < 50) pool.push('Heimweg', 'Küche', 'Werkbank');
      if (s.BIG5_E >= 60) pool.push('Stimmen', 'Tanzfläche');
      if (s.BIG5_E < 50) pool.push('Stille', 'Fenster');
      if (s.BIG5_A >= 60) pool.push('Hände', 'Wärme');
      if (s.BIG5_N >= 60) pool.push('Wasser', 'Schatten');
      if (s.BIG5_N < 50) pool.push('Licht', 'Atem');
      if (s.HEX_H >= 60) pool.push('Wurzeln');
      if (s.ATT_SEC >= 60) pool.push('Hafen');
      if (s.ATT_SEC < 50) pool.push('Weite');

      // Astro-Motive (symbolisch, bewusst als Bild markiert)
      if (astro && Array.isArray(astro.motifs)) {
        astro.motifs.slice(0, 2).forEach(m => pool.push(m));
      }

      const unique = Array.from(new Set(pool));
      while (unique.length < 5) unique.push(['Anker', 'Spur', 'Funken', 'Wege', 'Echo'][unique.length % 5]);
      return unique.slice(0, 6);
    }

    renderProfileMap() {
      const wrap = el('div', 'sg-profile-card');
      if (!this.state.persona) {
        wrap.append(el('h2', null, 'Profil & Karte werden berechnet …'));
        wrap.append(this.showSpinner());
        wrap.append(this.showStatus('Test-Antworten, importierte Methoden und – falls vorhanden – die astrologische Karte werden zusammengeführt.', null));
        return wrap;
      }
      const p = this.state.persona;
      wrap.append(el('h2', null, 'Profil & Karte'));

      // Archetyp + Kernsatz
      const arche = el('div', 'sg-archetype');
      arche.append(el('span', 'sg-arche-label', 'Archetyp'));
      arche.append(el('span', 'sg-arche-name', p.archetype || '—'));
      wrap.append(arche);
      if (p.core_narrative) wrap.append(el('p', 'sg-narrative', p.core_narrative));

      // ── Zwei-Spalten-Bereich: Radar + Wheel ────────────────────
      const grid = el('div', 'sg-profile-grid');

      // Big-Five-Radar
      const radarPanel = el('div', 'sg-profile-panel');
      const radarHead = el('h3', null, 'Big-Five-Profil');
      radarHead.append(el('span', 'sg-tag', 'wissenschaftlich'));
      radarPanel.append(radarHead);
      const sf = p.scales_final || {};
      if (window.SongChartRenderer && window.SongChartRenderer.renderBigFiveRadar) {
        const radarSvg = window.SongChartRenderer.renderBigFiveRadar(sf, p.facets_final || {});
        radarPanel.append(radarSvg);
      }
      // Top-Facetten
      if (p.facets_final && Object.keys(p.facets_final).length) {
        const T = window.SongTestData;
        const top = T && T.topFacets ? T.topFacets(p.facets_final, 6) : [];
        if (top.length) {
          const flist = el('div', 'sg-facet-list');
          flist.append(el('div', null, 'Top-Facetten'));
          top.forEach(f => {
            const row = el('div', 'sg-facet-row');
            row.append(el('span', 'sg-facet-label', f.label));
            const bg = el('div', 'sg-facet-bar');
            const fg = el('div', 'sg-facet-bar-fill');
            fg.style.width = Math.max(0, Math.min(100, f.value)) + '%';
            bg.append(fg);
            row.append(bg);
            row.append(el('span', 'sg-facet-val', String(Math.round(f.value))));
            flist.append(row);
          });
          radarPanel.append(flist);
        }
      }
      // VIA-Stärken
      if (Array.isArray(sf.VIA_TOP) && sf.VIA_TOP.length) {
        const via = el('div', 'sg-via');
        via.append(el('span', 'sg-via-label', 'Top-Stärken: '));
        sf.VIA_TOP.forEach(s => via.append(el('span', 'sg-via-tag', s)));
        radarPanel.append(via);
      }
      grid.append(radarPanel);

      // Natal-Wheel (nur wenn Astro-Karte vorhanden)
      const wheelPanel = el('div', 'sg-profile-panel');
      const wheelHead = el('h3', null, 'Astrologische Karte');
      wheelHead.append(el('span', 'sg-tag', 'symbolisch'));
      wheelPanel.append(wheelHead);
      if (p.astrology) {
        // Meta-Zeile
        const meta = el('div', 'sg-astro-meta');
        if (p.astrology.input && p.astrology.input.date) {
          meta.append(el('span', null, 'Datum: '));
          meta.append(el('strong', null, p.astrology.input.date + (p.astrology.input.time ? ' · ' + p.astrology.input.time : '')));
        }
        if (p.astrology.input && p.astrology.input.place) {
          meta.append(el('span', null, ' · '));
          meta.append(el('strong', null, p.astrology.input.place));
        }
        if (p.astrology.ascSign) {
          meta.append(el('span', 'sg-astro-chip', 'AC: ' + p.astrology.ascSign));
        }
        if (p.astrology.mcSign) {
          meta.append(el('span', 'sg-astro-chip', 'MC: ' + p.astrology.mcSign));
        }
        wheelPanel.append(meta);
        if (window.SongChartRenderer && window.SongChartRenderer.renderNatalWheel) {
          wheelPanel.append(window.SongChartRenderer.renderNatalWheel(p.astrology));
        }
        // Planeten kompakt
        const placements = el('div', 'sg-astro-placements');
        (p.astrology.placements || []).forEach(pl => {
          const c = el('div', 'sg-astro-pl');
          const head = el('div', 'sg-astro-pl-head');
          head.append(el('span', 'sg-astro-pl-sym', pl.symbol));
          head.append(document.createTextNode(' ' + pl.de));
          c.append(head);
          c.append(el('span', 'sg-astro-pl-sub', pl.sign + (pl.house ? ' · H' + pl.house : '')));
          placements.append(c);
        });
        wheelPanel.append(placements);
        // Element-Balance
        if (p.astrology.elementBalance) {
          const eb = p.astrology.elementBalance;
          const total = (eb.fire || 0) + (eb.earth || 0) + (eb.air || 0) + (eb.water || 0);
          if (total > 0) {
            const bal = el('div', 'sg-balance');
            [['fire','Feuer'], ['earth','Erde'], ['air','Luft'], ['water','Wasser']].forEach(([k, lbl]) => {
              const row = el('div', 'sg-balance-row ' + k);
              row.append(el('span', 'sg-balance-key', lbl));
              const bg = el('div', 'sg-balance-bar');
              const fg = el('div', 'sg-balance-bar-fill');
              fg.style.width = Math.round((eb[k] || 0) / total * 100) + '%';
              bg.append(fg);
              row.append(bg);
              bal.append(row);
            });
            wheelPanel.append(bal);
          }
        }
      } else {
        wheelPanel.append(el('p', 'sg-hint',
          'Keine Geburtsdaten angegeben. Wenn du in Schritt 2 Datum + Ort einträgst, ' +
          'erscheint hier deine astrologische Karte als poetische Zusatz-Schicht.'));
      }
      grid.append(wheelPanel);

      wrap.append(grid);

      // ── Klang-DNA ────────────────────────────────────────────
      if (p.music_dna) {
        const dnaPanel = el('div', 'sg-profile-panel');
        const dh = el('h3', null, 'Klang-DNA');
        dh.append(el('span', 'sg-tag', 'aus Profil abgeleitet'));
        dnaPanel.append(dh);
        if (window.SongChartRenderer && window.SongChartRenderer.renderMusicDNAcard) {
          dnaPanel.append(window.SongChartRenderer.renderMusicDNAcard(p.music_dna));
        }
        wrap.append(dnaPanel);
      }

      // ── Motive (Bilder für den Songtext) ─────────────────────
      if (Array.isArray(p.motifs) && p.motifs.length) {
        const m = el('div', 'sg-motifs');
        m.append(el('h3', null, 'Bilder, die im Songtext auftauchen werden'));
        p.motifs.forEach(x => m.append(el('span', 'sg-motif-chip', x)));
        wrap.append(m);
      }

      // ── Spannungsfelder ──────────────────────────────────────
      if (Array.isArray(p.tensions) && p.tensions.length) {
        const tw = el('div', 'sg-tensions');
        tw.append(el('h3', null, 'Spannungsfelder'));
        p.tensions.forEach(t => {
          tw.append(el('p', 'sg-tension', `${t.scale}: Δ${t.delta} – ${t.note || ''}`));
        });
        wrap.append(tw);
      }

      // ── Quellen-Hinweis ──────────────────────────────────────
      const sources = el('div', 'sg-profile-sources');
      sources.innerHTML = '<strong>Quellen:</strong> Big-Five & 30 Facetten nach IPIP-NEO (Johnson 2014, Maples-Keller 2019), ' +
        'HEXACO-Honesty-Humility (Ashton & Lee 2009), Schwartz-Werte (Schwartz 2012), Bindung (ECR-S, Wei et al. 2007), ' +
        'VIA-Stärken (Peterson & Seligman 2004). ' +
        (p.astrology
          ? 'Astrologische Karte berechnet mit astronomy-engine; Häuser im Whole-Sign-System. <em>Astrologie ist wissenschaftlich nicht validiert und fließt nur als poetische Bildersprache in den Song ein.</em>'
          : '');
      wrap.append(sources);

      const actions = el('div', 'sg-actions');
      const back = el('button', 'sg-btn sg-btn-ghost', '← Zurück');
      back.onclick = () => this.setStep(3);
      actions.append(back);
      const redo = el('button', 'sg-btn sg-btn-ghost', 'Neu berechnen');
      redo.onclick = () => { this.state.persona = null; this.runSynthesis(); };
      actions.append(redo);
      const next = el('button', 'sg-btn sg-btn-primary', 'Song komponieren →');
      next.onclick = () => this.runCompose();
      actions.append(next);
      wrap.append(actions);
      return wrap;
    }

    // Alias für Rückwärtskompatibilität (falls irgendwo noch renderSynthesis erwartet wird)
    renderSynthesis() { return this.renderProfileMap(); }

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

    // ── Step 5: Compose ─────────────────────────────────────────
    async runCompose() {
      this.setStep(5);
      const wrap = this.root.querySelector('.sg-card') || this.root;

      const key = await getApiKey();
      if (!key) {
        const s = this.showStatus(
          'Für die Songtext-Komposition wird der globale OpenAI API-Key benötigt. ' +
          'Bitte einmalig im Admin-Panel unter „API-Keys" einen Key als „global" eintragen ' +
          '(gleicher Speicherort wie bei der Onboarding-App).', wrap);
        s.classList.add('sg-status-error');
        const back = el('button', 'sg-btn sg-btn-ghost', '← Zurück zum Profil');
        back.onclick = () => this.setStep(4);
        const link = el('a', 'sg-btn sg-btn-primary', 'Admin-Panel öffnen');
        link.href = 'admin.html#api-keys';
        const actions = el('div', 'sg-actions');
        actions.append(back, link);
        wrap.append(actions);
        return;
      }

      try {
        // Persona für Compose: Astrologie ggf. kompakt mitschicken
        const personaForCompose = Object.assign({}, this.state.persona);
        if (personaForCompose.astrology) {
          personaForCompose.astrology = this._compactAstro(personaForCompose.astrology);
        }
        const song = await callApi('compose', {
          persona: personaForCompose,
          creativity: 0.78
        });
        this.state.song = song;
        saveState(STORAGE_KEYS.song, song);
        this._cloudSave('song', { forceNewVersion: true });
        this.setStep(6);
      } catch (err) {
        const s = wrap.querySelector('.sg-status') || this.showStatus('', wrap);
        s.textContent = '⚠️ ' + err.message;
        s.classList.add('sg-status-error');
        const back = el('button', 'sg-btn sg-btn-ghost', '← Zurück');
        back.onclick = () => this.setStep(4);
        const retry = el('button', 'sg-btn sg-btn-primary', 'Erneut versuchen');
        retry.onclick = () => this.runCompose();
        const actions = el('div', 'sg-actions');
        actions.append(back, retry);
        wrap.append(actions);
      }
    }

    renderCompose() {
      const wrap = el('div', 'sg-card sg-compose');
      wrap.append(el('h2', null, 'Song wird komponiert …'));
      wrap.append(this.showSpinner());
      wrap.append(el('p', 'sg-lead', 'Songtext, Akkorde und Produktions-Spezifikation werden geschrieben. Das dauert ungefähr 15–25 Sekunden.'));
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

      if (window.SongGeneratorCloud && window.SongGeneratorCloud.isLoggedIn()) {
        wrap.append(el('p', 'sg-lead', '☁️ Test, Profil und Song werden automatisch in deinem AWS-Profil versioniert gespeichert.'));
      }

      if (s.rationale) wrap.append(el('p', 'sg-rationale', s.rationale));

      // Sections
      (s.sections || []).forEach(section => wrap.append(this.renderSongSection(section)));

      // ════════════════════════════════════════════════════════
      // AUDIO-PRODUKTION (KI komponiert echtes Musikstück mit Stimme)
      // ════════════════════════════════════════════════════════
      wrap.append(this.renderProduction());

      // Produktions-Spezifikation (Roh-Daten, ausklappbar)
      if (s.production_spec) {
        const ps = el('details', 'sg-production');
        ps.append(el('summary', null, 'Produktions-Spezifikation & Engine-Prompts (Roh-Daten)'));
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
      const back = el('button', 'sg-btn sg-btn-ghost', '← Profil ändern');
      back.onclick = () => this.setStep(4);
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
      rwBtn.setAttribute('aria-label', 'Sektion ' + (section.label || section.id) + ' umschreiben');
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
      if (btnEl) { btnEl.disabled = true; btnEl.textContent = '… einen Moment'; }
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

    // ════════════════════════════════════════════════════════════
    // AUDIO-PRODUKTION (KI komponiert echtes Musikstück + Stimme)
    // ════════════════════════════════════════════════════════════
    renderProduction() {
      const box = el('div', 'sg-prod-box');
      const head = el('div', 'sg-prod-head');
      head.append(el('h3', null, '🎙️ KI-Audio-Produktion'));
      const subtitle = el('p', 'sg-prod-sub',
        'Aus dem komponierten Text + Akkorden + deinem Profil entsteht ein fertiges Musikstück mit Stimme. ' +
        'Die Mischung folgt einer festen Matrix: 50 % Persönlichkeit, 50 % Astrologie' +
        (this.state.persona && this.state.persona.imported_methods_count
          ? ', plus ein Methoden-Bonus aus deinen ' + this.state.persona.imported_methods_count + ' bearbeiteten Methoden.'
          : '.'));
      head.append(subtitle);
      box.append(head);

      // Mix-Matrix anzeigen
      if (this.state.persona && window.SongMusicEngine) {
        try {
          const preview = window.SongMusicEngine.buildStylePrompt(this.state.persona);
          box.append(this._renderMixMatrix(preview));
        } catch (_e) {}
      }

      // Optionen
      const opts = el('div', 'sg-prod-opts');
      const vgPersona = (window.SongMusicEngine && this.state.persona)
        ? (this.state.persona.music_dna && this.state.persona.music_dna.vocal &&
           this.state.persona.music_dna.vocal.register === 'high' ? 'f' : 'auto') : 'auto';
      // Vocal Gender Selector
      const vgWrap = el('div', 'sg-field');
      vgWrap.append(el('label', null, 'Stimme'));
      const vgSel = el('select');
      [['auto', 'Automatisch aus Profil'], ['f', 'Weiblich'], ['m', 'Männlich']].forEach(([v, l]) => {
        const o = el('option', null, l); o.value = v; vgSel.append(o);
      });
      vgSel.value = (this.state.audioState && this.state.audioState.vocalGender) || 'auto';
      vgSel.onchange = () => {
        this.state.audioState = Object.assign({}, this.state.audioState, { vocalGender: vgSel.value });
      };
      vgWrap.append(vgSel);
      opts.append(vgWrap);

      // Modell-Wahl
      const mWrap = el('div', 'sg-field');
      mWrap.append(el('label', null, 'Modell'));
      const mSel = el('select');
      [['V5_5', 'Suno V5.5 (neueste)'], ['V5', 'Suno V5'], ['V4_5PLUS', 'Suno V4.5 Plus (schneller)']].forEach(([v, l]) => {
        const o = el('option', null, l); o.value = v; mSel.append(o);
      });
      mSel.value = (this.state.audioState && this.state.audioState.model) || 'V5_5';
      mSel.onchange = () => {
        this.state.audioState = Object.assign({}, this.state.audioState, { model: mSel.value });
      };
      mWrap.append(mSel);
      opts.append(mWrap);

      box.append(opts);

      // Status / Actions / Player
      const stateBox = el('div', 'sg-prod-state');
      const phase = (this.state.audioState && this.state.audioState.phase) || 'idle';

      if (phase === 'idle' && !this.state.audio) {
        const act = el('div', 'sg-actions');
        const startBtn = el('button', 'sg-btn sg-btn-primary', '🎵 Audio jetzt produzieren');
        startBtn.onclick = () => {
          const o = {
            model: mSel.value,
            vocalGender: vgSel.value === 'auto' ? undefined : vgSel.value
          };
          this.runProduction(o);
        };
        act.append(startBtn);
        const hint = el('p', 'sg-hint',
          'Generierung dauert ca. 30–90 Sekunden. Es entstehen 2 Varianten zur Auswahl. ' +
          'Kosten pro Generation ca. $0.05–0.10 (über deinen API-Key bei sunoapi.org).');
        stateBox.append(act, hint);
      } else if (phase === 'submitting' || phase === 'polling') {
        stateBox.append(this.showSpinner());
        const st = (this.state.audioState && this.state.audioState.status) || 'PENDING';
        const phaseLabel = {
          PENDING: 'In Warteschlange …',
          TEXT_SUCCESS: 'Lyrics-Layer fertig, Audio wird gerendert …',
          FIRST_SUCCESS: 'Erste Variante fertig! Zweite läuft …',
          GENERATING: 'KI generiert Audio …'
        }[st] || ('Status: ' + st);
        stateBox.append(el('p', 'sg-prod-status', phaseLabel));
        const cancel = el('button', 'sg-btn sg-btn-ghost', 'Abbrechen');
        cancel.onclick = () => {
          this.state.audioState = { phase: 'idle' };
          this.render();
        };
        stateBox.append(cancel);
      } else if (phase === 'error') {
        const err = (this.state.audioState && this.state.audioState.error) || 'Unbekannter Fehler';
        const e = el('div', 'sg-status sg-status-error', '⚠️ ' + err);
        stateBox.append(e);
        const retry = el('button', 'sg-btn sg-btn-primary', 'Erneut versuchen');
        retry.onclick = () => {
          this.state.audioState = { phase: 'idle' };
          this.render();
        };
        stateBox.append(retry);
      }

      // Audio-Player wenn Tracks vorhanden
      if (this.state.audio && Array.isArray(this.state.audio.tracks) && this.state.audio.tracks.length) {
        stateBox.append(this._renderAudioPlayer(this.state.audio));
      }
      box.append(stateBox);
      return box;
    }

    _renderMixMatrix(preview) {
      const box = el('div', 'sg-mix-matrix');
      box.append(el('div', 'sg-mix-title', 'So wird dein Sound gemischt'));
      const rows = [
        { key: 'personality', label: 'Persönlichkeit', color: '#6366f1',
          text: preview.personality_text },
        { key: 'astrology', label: 'Astrologie', color: '#a78bfa',
          text: preview.astrology_text || '— (Geburtsdaten nicht angegeben)' },
        { key: 'methods', label: 'Methoden-Bonus', color: '#34d399',
          text: preview.methods_text ||
            (preview.weights && preview.weights.methodsCount
              ? '— (Tags konnten nicht extrahiert werden)'
              : '— (noch keine Methoden bearbeitet)') }
      ];
      rows.forEach(r => {
        const w = preview.weights[r.key] || 0;
        const row = el('div', 'sg-mix-row');
        const label = el('div', 'sg-mix-label');
        label.append(el('span', 'sg-mix-name', r.label));
        label.append(el('span', 'sg-mix-pct', Math.round(w * 100) + '%'));
        row.append(label);
        const bar = el('div', 'sg-mix-bar');
        const fill = el('div', 'sg-mix-bar-fill');
        fill.style.width = Math.round(w * 100) + '%';
        fill.style.background = r.color;
        bar.append(fill);
        row.append(bar);
        if (r.text) {
          const desc = el('div', 'sg-mix-desc', r.text);
          row.append(desc);
        }
        box.append(row);
      });
      return box;
    }

    _renderAudioPlayer(audio) {
      const box = el('div', 'sg-audio-results');
      box.append(el('h4', null, 'Deine Songs (' + (audio.tracks || []).length + ' Varianten)'));
      (audio.tracks || []).forEach((t, i) => {
        const card = el('div', 'sg-audio-card');
        const title = el('div', 'sg-audio-card-head');
        title.append(el('strong', null, 'Variante ' + (i + 1) + (t.title ? ' – ' + t.title : '')));
        if (t.duration) title.append(el('span', 'sg-audio-duration', this._formatDuration(t.duration)));
        card.append(title);
        const url = t.audio_url || t.audioUrl || t.source_audio_url || t.sourceAudioUrl || t.stream_audio_url || t.streamAudioUrl;
        if (url) {
          const audioEl = document.createElement('audio');
          audioEl.controls = true;
          audioEl.preload = 'none';
          audioEl.src = url;
          audioEl.style.width = '100%';
          card.append(audioEl);
          const actions = el('div', 'sg-audio-actions');
          const dl = document.createElement('a');
          dl.href = url; dl.download = (t.title || 'song-' + (i+1)) + '.mp3';
          dl.className = 'sg-btn sg-btn-ghost'; dl.textContent = '⬇ MP3 herunterladen';
          actions.append(dl);
          card.append(actions);
        }
        if (t.image_url || t.imageUrl) {
          const img = document.createElement('img');
          img.src = t.image_url || t.imageUrl;
          img.alt = t.title || 'Cover';
          img.className = 'sg-audio-cover';
          card.prepend(img);
        }
        box.append(card);
      });
      const reroll = el('button', 'sg-btn sg-btn-ghost', '↻ Neue Variation generieren');
      reroll.onclick = () => {
        this.state.audio = null;
        clearState(STORAGE_KEYS.audio);
        this.state.audioState = { phase: 'idle' };
        this.render();
      };
      box.append(reroll);
      return box;
    }

    _formatDuration(seconds) {
      const s = Math.round(seconds || 0);
      const m = Math.floor(s / 60);
      const r = s % 60;
      return m + ':' + String(r).padStart(2, '0');
    }

    async runProduction(opts) {
      if (!window.SongMusicEngine) {
        alert('Music-Engine-Modul wurde nicht geladen.');
        return;
      }
      this.state.audioState = { phase: 'submitting', model: opts.model, vocalGender: opts.vocalGender };
      this.render();
      try {
        const result = await window.SongMusicEngine.generateAudio(
          this.state.persona,
          this.state.song,
          opts,
          (evt) => {
            // UI-Update bei Status-Wechseln
            if (evt.phase === 'submitting') {
              this.state.audioState = Object.assign({}, this.state.audioState, { phase: 'submitting' });
            } else if (evt.phase === 'polling') {
              this.state.audioState = Object.assign({}, this.state.audioState, {
                phase: 'polling',
                taskId: evt.taskId || this.state.audioState.taskId,
                status: evt.status,
                weights: evt.weights || this.state.audioState.weights
              });
            } else if (evt.phase === 'first_ready') {
              // Erste Variante schon verfügbar: zeige sie schonmal
              this.state.audio = { tracks: evt.tracks || [], partial: true };
              saveState(STORAGE_KEYS.audio, this.state.audio);
              this.state.audioState = Object.assign({}, this.state.audioState, { phase: 'polling', status: evt.status });
            }
            // Throttled re-render: nur wenn wir gerade nicht gerade gerendert haben
            this.render();
          }
        );
        this.state.audio = {
          tracks: result.tracks || [],
          taskId: result.taskId,
          weights: result.weights,
          generatedAt: new Date().toISOString(),
          provider: 'sunoapi_org',
          model: opts.model
        };
        saveState(STORAGE_KEYS.audio, this.state.audio);
        this._cloudSave('audio', { forceNewVersion: true });
        this.state.audioState = { phase: 'success' };
        this.render();
      } catch (err) {
        console.error('[SongGenerator] Audio-Produktion fehlgeschlagen:', err);
        this.state.audioState = { phase: 'error', error: err.message || String(err) };
        this.render();
      }
    }

    exportJson() {
      const blob = new Blob([JSON.stringify({
        persona: this.state.persona,
        song: this.state.song,
        audio: this.state.audio,
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
