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
    audio: 'sg_audio_v1',
    playlist: 'sg_playlist_v1',
    favorites: 'sg_favorites_v1',
    voiceProfile: 'sg_voice_profile_v1',
    useCustomVoice: 'sg_use_custom_voice_v1'
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
  const MODEL_FALLBACKS = ['gpt-4.1'];

  function mergeRerollIntoSong(song, partial) {
    if (!partial || !partial.sections || !song) return partial || song;
    const sectionMap = {};
    partial.sections.forEach(function (s) { sectionMap[s.id] = s; });
    return Object.assign({}, song, {
      sections: (song.sections || []).map(function (sec) {
        const upd = sectionMap[sec.id];
        if (!upd || !upd.lines) return sec;
        const lineMap = {};
        upd.lines.forEach(function (l) { lineMap[l.id] = l; });
        return Object.assign({}, sec, {
          lines: (sec.lines || []).map(function (line) {
            return lineMap[line.id] ? Object.assign({}, line, lineMap[line.id]) : line;
          })
        });
      })
    });
  }

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
        if (!opts._jsonRetried) {
          errors.push({ model, msg: 'KI-Antwort war kein gültiges JSON – Retry' });
          return callOpenAIDirect(Object.assign({}, opts, {
            _jsonRetried: true,
            temperature: Math.min(typeof opts.temperature === 'number' ? opts.temperature : 0.7, 0.55),
            user: (opts.user || '') + '\n\nWICHTIG: Antworte ausschließlich mit kompaktem gültigem JSON nach dem Schema. Kein Markdown.'
          }));
        }
        errors.push({ model, msg: 'KI-Antwort war kein gültiges JSON' });
        continue;
      }
      let errText = '';
      try { errText = await res.text(); } catch (_e) {}
      const human = _parseOpenAIError(errText);
      errors.push({ model, status: res.status, msg: human });
      if (res.status === 401 || res.status === 429) break;
      if (res.status === 403 && /model|access|not have access/i.test(human)) continue;
      if (res.status === 403) break;
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

  /** OpenAI-Aufruf für Fliesstext (kein JSON) – z. B. Persönlichkeitsanalyse */
  async function callOpenAIText(opts) {
    const apiKey = opts.apiKey;
    const candidates = [];
    if (opts.model) candidates.push(opts.model);
    MODEL_FALLBACKS.forEach(function (m) { if (candidates.indexOf(m) === -1) candidates.push(m); });
    const errors = [];
    for (let i = 0; i < candidates.length; i += 1) {
      const model = candidates[i];
      let res;
      try {
        const body = {
          model: model,
          messages: [
            { role: 'system', content: opts.system },
            { role: 'user', content: opts.user }
          ],
          temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.72,
          top_p: typeof opts.top_p === 'number' ? opts.top_p : 0.92,
          max_tokens: typeof opts.maxTokens === 'number' ? opts.maxTokens : 1200
        };
        res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify(body)
        });
      } catch (err) {
        errors.push({ model: model, msg: 'Netzwerk: ' + err.message });
        continue;
      }
      if (res.ok) {
        const data = await res.json().catch(function () { return null; });
        const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (text && String(text).trim()) return String(text).trim();
        errors.push({ model: model, msg: 'Leere KI-Antwort' });
        continue;
      }
      let errText = '';
      try { errText = await res.text(); } catch (_e) {}
      errors.push({ model: model, status: res.status, msg: _parseOpenAIError(errText) });
      if (res.status === 401 || res.status === 429) break;
      if (res.status === 403 && /model|access|not have access/i.test(human)) continue;
      if (res.status === 403) break;
    }
    const first = errors[0] || {};
    throw new Error(first.msg || 'OpenAI-Aufruf fehlgeschlagen');
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
      const rerollMode = mode || 'regenerate_lines';
      const userPrompt = P.buildSongRerollUserPrompt
        ? P.buildSongRerollUserPrompt({ persona, previous_song, edit_targets, mode: rerollMode, creativity })
        : P.buildSongComposerUserPrompt({ persona, mode: rerollMode, edit_targets, previous_song, creativity: typeof creativity === 'number' ? creativity : 0.95 });
      return callOpenAIDirect({
        apiKey, system: P.SYSTEM_CORE,
        user: userPrompt,
        temperature: rerollMode === 'rewrite_section' ? 0.82 : 0.78,
        top_p: 0.92,
        maxTokens: 1400,
        model: 'gpt-4.1'
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
        playlist: loadState(STORAGE_KEYS.playlist, null),
        favorites: loadState(STORAGE_KEYS.favorites, []),
        voiceProfile: loadState(STORAGE_KEYS.voiceProfile, null),
        useCustomVoice: !!loadState(STORAGE_KEYS.useCustomVoice, false),
        voiceWizard: { phase: 'idle' },
        audioLibrary: null,
        audioIdentity: null,
        audioState: { phase: 'idle' },
        _playlistAutoplay: false,
        _favoritesAutoplay: false,
        playlistPack: 'core',
        importedMethods: null,
        importedNarrative: '',
        analysisUi: { mode: 'integrated', length: 'medium' },
        analysisLoading: false,
        analysisError: null,
        audioIntent: 'personality',
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

      const self = this;
      if (window.SongPersistentPlayer && window.SongPersistentPlayer.onChange) {
        window.SongPersistentPlayer.onChange(function () {
          self._syncPlaybackUi();
        });
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
      saveState(STORAGE_KEYS.playlist, this.state.playlist);
      saveState(STORAGE_KEYS.favorites, this.state.favorites);
      saveState(STORAGE_KEYS.voiceProfile, this.state.voiceProfile);
      saveState(STORAGE_KEYS.useCustomVoice, this.state.useCustomVoice);
    }

    _cloudSave(milestone, opts) {
      if (!window.SongGeneratorCloud || !window.SongGeneratorCloud.isLoggedIn()) return;
      this.syncLocalCache();
      window.SongGeneratorCloud.scheduleSave(this.state, milestone, opts);
    }

    async loadCloudState() {
      if (!window.SongGeneratorCloud || !window.SongGeneratorCloud.isLoggedIn()) return;
      try {
        const localMerge = {
          playlist: loadState(STORAGE_KEYS.playlist, null),
          audio: loadState(STORAGE_KEYS.audio, null),
          favorites: loadState(STORAGE_KEYS.favorites, [])
        };
        const loaded = await window.SongGeneratorCloud.loadLatest();
        if (loaded && loaded.snapshot) {
          window.SongGeneratorCloud.applySnapshotToState(this.state, loaded.snapshot, localMerge);
          if (window.SongFavorites && localMerge.favorites && localMerge.favorites.length) {
            this.state.favorites = window.SongFavorites.mergeLists(
              this.state.favorites, localMerge.favorites
            );
          }
          this.syncLocalCache();
        }
        if (window.SongGeneratorCloud.syncAudioIdentity) {
          await window.SongGeneratorCloud.syncAudioIdentity(this.state);
          if (this.state.persona) saveState(STORAGE_KEYS.persona, this.state.persona);
          saveState(STORAGE_KEYS.favorites, this.state.favorites);
        }
        if (window.SongGeneratorCloud.loadVoiceProfile) {
          const vp = await window.SongGeneratorCloud.loadVoiceProfile();
          if (vp && vp.voiceId) {
            this.state.voiceProfile = vp;
            saveState(STORAGE_KEYS.voiceProfile, vp);
          }
        }
        if (window.SongMusicEngine && window.SongMusicEngine.invalidateSunoKeyCache) {
          window.SongMusicEngine.invalidateSunoKeyCache();
        }
        console.log('[SongGenerator] Cloud-Snapshot geladen:', loaded && loaded.version && loaded.version.label);
      } catch (err) {
        console.warn('[SongGenerator] Cloud-Laden fehlgeschlagen:', err && err.message);
      }
    }

    getEnrichedPersona() {
      if (!this.state.persona) return null;
      if (window.SongAudioIdentity && this.state.audioIdentity) {
        return window.SongAudioIdentity.enrichPersona(this.state.persona, this.state.audioIdentity);
      }
      return this.state.persona;
    }

    _fuseMusicDNA(baseDNA, astro, identity, tensions) {
      if (!baseDNA || !window.SongMusicDNAFusion) return baseDNA;
      return window.SongMusicDNAFusion.fuse({
        core: baseDNA,
        astro: astro || null,
        identity: identity != null ? identity : this.state.audioIdentity,
        tensions: tensions || []
      });
    }

    async _syncAudioIdentityAfterPersona() {
      if (!window.SongGeneratorCloud || !window.SongGeneratorCloud.syncAudioIdentity) return;
      try {
        await window.SongGeneratorCloud.syncAudioIdentity(this.state);
        if (this.state.persona) saveState(STORAGE_KEYS.persona, this.state.persona);
      } catch (err) {
        console.warn('[SongGenerator] Audio-Identität sync:', err && err.message);
      }
    }

    async _persistAudioToProfile(type, meta) {
      this.syncLocalCache();
      if (!window.SongGeneratorCloud || !window.SongGeneratorCloud.isLoggedIn()) return;
      try {
        const result = await window.SongGeneratorCloud.saveAudioToLibrary(this.state, type, meta || {});
        if (result) {
          if (result.identity) this.state.audioIdentity = result.identity;
          if (result.library) {
            this.state.audioLibrary = result.library;
            if (window.SongFavorites) {
              this.state.favorites = window.SongFavorites.mergeLists(
                result.library.favorites, this.state.favorites
              );
            } else if (Array.isArray(result.library.favorites)) {
              this.state.favorites = result.library.favorites;
            }
            saveState(STORAGE_KEYS.favorites, this.state.favorites);
          }
          if (this.state.persona) saveState(STORAGE_KEYS.persona, this.state.persona);
        }
        // Sofort in Cloud-Snapshot schreiben – debounced Save kann Playlist sonst verlieren
        await window.SongGeneratorCloud.saveSnapshot(this.state, 'audio', { updateCurrent: true });
      } catch (err) {
        console.warn('[SongGenerator] Profil-Audio-Speichern:', err && err.message);
        try {
          await window.SongGeneratorCloud.saveSnapshot(this.state, 'audio', { updateCurrent: true });
        } catch (_e2) {}
      }
    }

    _favoriteId(meta) {
      if (!meta) return '';
      if (meta.id) return meta.id;
      return window.SongFavorites ? window.SongFavorites.trackKey(meta) : '';
    }

    _isFavorite(id) {
      if (!id || !Array.isArray(this.state.favorites)) return false;
      return this.state.favorites.some(function (f) { return f.id === id; });
    }

    _buildFavoriteMeta(opts) {
      opts = opts || {};
      const url = opts.url || this._trackUrl(opts.raw || opts);
      if (!url) return null;
      const display = opts.customName || opts.userTitle || opts.label || opts.title || 'Track';
      const meta = {
        url: url,
        title: opts.title || display,
        label: display,
        customName: opts.customName || opts.userTitle || null,
        emoji: opts.emoji || '🎵',
        intentId: opts.intentId || null,
        cover: opts.cover || null,
        duration: opts.duration || null
      };
      if (window.SongFavorites) return window.SongFavorites.normalize(meta);
      meta.id = url.slice(-32);
      return meta;
    }

    _getDisplayName(item) {
      return window.SongFavorites && window.SongFavorites.getDisplayName
        ? window.SongFavorites.getDisplayName(item)
        : (item && (item.customName || item.label || item.title)) || 'Favorit';
    }

    _persistFavorites() {
      saveState(STORAGE_KEYS.favorites, this.state.favorites);
      if (window.SongGeneratorCloud && window.SongGeneratorCloud.isLoggedIn() &&
          window.SongGeneratorCloud.persistFavoritesList) {
        window.SongGeneratorCloud.persistFavoritesList(this.state.favorites).catch(function (err) {
          console.warn('[SongGenerator] Favoriten-Cloud:', err && err.message);
        });
      }
    }

    _renameFavorite(id, name) {
      if (!id || !window.SongFavorites) return;
      var trimmed = String(name || '').trim();
      if (!trimmed) return;
      var existing = (this.state.favorites || []).find(function (f) { return f.id === id; });
      if (existing && this._getDisplayName(existing) === trimmed) return;
      this.state.favorites = window.SongFavorites.updateName(this.state.favorites || [], id, trimmed);
      this._persistFavorites();
      this.render();
    }

    async _toggleFavorite(meta) {
      const norm = this._buildFavoriteMeta(meta);
      if (!norm || !norm.url) return;
      if (!window.SongFavorites) return;

      const result = window.SongFavorites.toggle(this.state.favorites || [], norm);
      const self = this;
      this.state.favorites = result.favorites;
      saveState(STORAGE_KEYS.favorites, this.state.favorites);
      this.render();

      if (result.added && this._favoritesPanelEl) {
        this._favoritesPanelEl.classList.add('sg-favorites-flash');
        this._favoritesPanelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(function () {
          if (self._favoritesPanelEl) self._favoritesPanelEl.classList.remove('sg-favorites-flash');
        }, 1200);
      }

      if (window.SongGeneratorCloud && window.SongGeneratorCloud.isLoggedIn()) {
        this._persistFavorites();
      }
    }

    _renderFavoriteBtn(meta) {
      const self = this;
      const norm = this._buildFavoriteMeta(meta);
      if (!norm) return el('span', null, '');
      const isFav = this._isFavorite(norm.id);
      const btn = el('button', 'sg-fav-btn' + (isFav ? ' active' : ''), isFav ? '♥' : '♡');
      btn.type = 'button';
      btn.title = isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen';
      btn.setAttribute('aria-label', btn.title);
      btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        self._toggleFavorite(norm);
      };
      return btn;
    }

    async _reorderFavorite(fromIndex, toIndex) {
      if (!window.SongFavorites) return;
      if (!window.SongGeneratorCloud || !window.SongGeneratorCloud.isLoggedIn()) {
        this.state.favorites = window.SongFavorites.reorder(this.state.favorites || [], fromIndex, toIndex);
        this._persistFavorites();
        this.render();
        return;
      }
      const result = await window.SongGeneratorCloud.reorderFavorites(this.state, fromIndex, toIndex);
      if (result) {
        this.state.favorites = result.favorites;
        this._persistFavorites();
        this.render();
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
      if (window.SongPersistentPlayer && window.SongPersistentPlayer.resetSlot) {
        window.SongPersistentPlayer.resetSlot();
      }
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
      if (this.state.step === 6) this._syncPlaybackUi();
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
      const self = this;
      allItems.forEach(function (row) {
        const item = row.item;
        if (self.state.answers[item.id] !== undefined) return;
        if (item.format === 'slider') self.state.answers[item.id] = 50;
        else if (item.format === 'forced_choice' || item.format === 'scenario_mc') self.state.answers[item.id] = 0;
        else self.state.answers[item.id] = 3;
      });
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
        this.renderAnswerSlider(w, item, 0, 100, function (v) { return String(v); }, '', 'Trifft gar nicht zu', 'Trifft voll zu');
      } else if (item.format === 'forced_choice' || item.format === 'scenario_mc') {
        const opts = item.options || [];
        const max = Math.max(0, opts.length - 1);
        const self = this;
        this.renderAnswerSlider(w, item, 0, max, function (v) { return String(v + 1); }, '/' + (max + 1),
          opts[0] && opts[0].label ? opts[0].label.slice(0, 28) : 'Option A',
          opts[max] && opts[max].label ? opts[max].label.slice(0, 28) : 'Option B');
      } else {
        // likert7 (Standard): Regler 0–6, Anzeige 1–7
        this.renderAnswerSlider(w, item, 0, 6, function (v) { return String(v + 1); }, '/7', 'Stimmt gar nicht', 'Stimmt voll');
      }
      return w;
    }

    renderAnswerSlider(wrap, item, min, max, displayFn, unitSuffix, labelLow, labelHigh) {
      const step = 1;
      const defaultVal = Math.round((min + max) / 2);
      const raw = this.state.answers[item.id];
      const val = typeof raw === 'number' ? raw : defaultVal;

      const sw = el('div', 'sg-slider-wrap');
      const labels = el('div', 'sg-slider-endpoints');
      labels.append(el('span', 'sg-slider-end low', labelLow || ''));
      labels.append(el('span', 'sg-slider-end high', labelHigh || ''));
      sw.append(labels);

      const row = el('div', 'sg-slider-row');
      const slider = el('input', 'sg-slider');
      slider.type = 'range';
      slider.min = String(min);
      slider.max = String(max);
      slider.step = String(step);
      slider.value = String(val);
      slider.setAttribute('aria-valuemin', String(min));
      slider.setAttribute('aria-valuemax', String(max));
      slider.setAttribute('aria-valuenow', String(val));

      const valEl = el('div', 'sg-slider-value');
      const numEl = el('span', 'sg-slider-num', displayFn(val));
      valEl.append(numEl);
      if (unitSuffix) valEl.append(el('span', 'sg-slider-unit', unitSuffix));

      const self = this;
      slider.oninput = function () {
        const n = Number(slider.value);
        numEl.textContent = displayFn(n);
        slider.setAttribute('aria-valuenow', String(n));
      };
      slider.onchange = function () {
        self.state.answers[item.id] = Number(slider.value);
        self.persistTest();
        wrap.classList.add('answered');
      };

      row.append(slider);
      row.append(valEl);
      sw.append(row);
      wrap.append(sw);
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
        music_dna: this._fuseMusicDNA(baseDNA, astroChart),
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
        await this._syncAudioIdentityAfterPersona();
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
        persona.music_dna = this._fuseMusicDNA(baseDNA, astroChart, this.state.audioIdentity, persona.tensions);
        this.state.persona = persona;
        saveState(STORAGE_KEYS.persona, persona);
        this._cloudSave('persona', { forceNewVersion: true });
        await this._syncAudioIdentityAfterPersona();
        this.render();
      } catch (err) {
        console.warn('[SongGenerator] KI-Synthese fehlgeschlagen, nutze Direct-Persona:', err && err.message);
        this.state.persona = directPersona;
        saveState(STORAGE_KEYS.persona, directPersona);
        this._cloudSave('persona', { forceNewVersion: true });
        await this._syncAudioIdentityAfterPersona();
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
      const chartSize = window.SongChartRenderer && window.SongChartRenderer.getResponsiveChartSize
        ? window.SongChartRenderer.getResponsiveChartSize(360, 260)
        : 320;
      const radarFrame = el('div', 'sg-chart-frame sg-chart-radar');
      if (window.SongChartRenderer && window.SongChartRenderer.renderBigFiveBars) {
        radarFrame.append(window.SongChartRenderer.renderBigFiveBars(sf));
      }
      if (window.SongChartRenderer && window.SongChartRenderer.renderBigFiveRadar) {
        const radarWrap = el('div', 'sg-chart-radar-svg');
        radarWrap.append(window.SongChartRenderer.renderBigFiveRadar(sf, p.facets_final || {}, { size: chartSize }));
        radarFrame.append(radarWrap);
      }
      radarPanel.append(radarFrame);
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
        const wheelFrame = el('div', 'sg-chart-frame sg-chart-wheel');
        if (window.SongChartRenderer && window.SongChartRenderer.renderNatalWheel) {
          const wheelSize = window.SongChartRenderer.getResponsiveChartSize
            ? window.SongChartRenderer.getResponsiveChartSize(440, 280)
            : 320;
          wheelFrame.append(window.SongChartRenderer.renderNatalWheel(p.astrology, { size: wheelSize }));
        }
        wheelPanel.append(wheelFrame);
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

      if (window.SongGeneratorCloud && window.SongGeneratorCloud.isLoggedIn()) {
        wrap.append(this.renderAudioIdentityPanel());
      }

      // ── Klang-DNA ────────────────────────────────────────────
      if (p.music_dna) {
        const dnaPanel = el('div', 'sg-profile-panel');
        const dh = el('h3', null, 'Klang-DNA');
        dh.append(el('span', 'sg-tag', 'fusioniert'));
        dnaPanel.append(dh);
        if (p.music_dna.evolution_phase && p.music_dna.evolution_phase.label) {
          dnaPanel.append(el('p', 'sg-dna-phase',
            'Entwicklungsphase: ' + p.music_dna.evolution_phase.label));
        }
        if (p.music_dna.evolution_narrative) {
          dnaPanel.append(el('p', 'sg-dna-evolution-narr', p.music_dna.evolution_narrative));
        }
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

      wrap.append(this.renderPersonalityAnalysisPanel(p));

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
    renderAudioIdentityPanel() {
      const ident = this.state.audioIdentity;
      const lib = this.state.audioLibrary;
      const panel = el('div', 'sg-audio-identity-panel');
      panel.append(el('h3', null, 'Deine Audio-Identität'));
      if (!ident) {
        panel.append(el('p', 'sg-hint', 'Melde dich an und speichere Produktionen – deine Klangschicht entwickelt sich mit jedem Stand weiter.'));
        return panel;
      }
      const phaseLabel = ident.evolutionPhaseLabel || 'Grundton';
      const head = el('div', 'sg-audio-identity-head');
      head.append(el('span', 'sg-audio-identity-phase', 'Phase · ' + phaseLabel));
      head.append(el('span', 'sg-audio-identity-depth', 'Tiefe ' + ident.depthLevel + ' / 10'));
      panel.append(head);
      panel.append(el('p', 'sg-audio-identity-narr', ident.evolutionNarrative || ''));
      const stats = el('div', 'sg-audio-identity-stats');
      stats.append(el('span', null, ident.sessionCount + ' Profil-Stände'));
      stats.append(el('span', null, ident.audioLibraryCount + ' Audio(s) im Profil'));
      if (ident.evolutionScore >= 4) {
        stats.append(el('span', 'sg-evolution-tag', '↗ Entwicklung +' + ident.evolutionScore));
      }
      panel.append(stats);
      if (lib && lib.entries && lib.entries.length) {
        panel.append(el('p', 'sg-hint', 'Zuletzt gespeichert: „' + (lib.entries[0].title || 'Audio') + '“'));
      }
      panel.append(el('p', 'sg-hint', 'Die Regeln für Komposition und Produktion passen sich deiner Entwicklungsphase an – nicht pauschal lauter, sondern passend weiter.'));
      return panel;
    }

    fmtBar(v) {
      const n = Math.round((typeof v === 'number' ? v : 0) * 100);
      return n + '%';
    }

    renderPersonalityAnalysisPanel(persona) {
      const panel = el('div', 'sg-analysis-panel');
      panel.append(el('h3', null, 'KI-Persönlichkeitsanalyse'));
      panel.append(el('p', 'sg-analysis-lead',
        'Generiere eine textliche Auswertung – aus deinen Testantworten, aus der Astrologie oder beides kombiniert. ' +
        'Jede Variante enthält einen Abschnitt zu Sexualität & Intimität (respektvoll, nicht explizit).'));

      const ui = this.state.analysisUi || { mode: 'integrated', length: 'medium' };
      const modes = [
        { key: 'psychometric', label: 'Aus Fragen', hint: 'Big Five, Bindung, Werte' },
        { key: 'astrology', label: 'Aus Astrologie', hint: 'Symbolische Geburtskarte' },
        { key: 'integrated', label: 'Kombiniert', hint: 'Test + Astro' }
      ];
      const lengths = [
        { key: 'short', label: 'Kurz' },
        { key: 'medium', label: 'Mittel' },
        { key: 'long', label: 'Lang' }
      ];

      const modeRow = el('div', 'sg-analysis-modes');
      const self = this;
      modes.forEach(function (m) {
        const b = el('button', 'sg-analysis-mode' + (ui.mode === m.key ? ' active' : ''), m.label);
        b.type = 'button';
        b.title = m.hint;
        b.onclick = function () {
          self.state.analysisUi.mode = m.key;
          self.render();
        };
        modeRow.append(b);
      });
      panel.append(modeRow);

      const lenRow = el('div', 'sg-analysis-lengths');
      lengths.forEach(function (l) {
        const b = el('button', 'sg-analysis-len' + (ui.length === l.key ? ' active' : ''), l.label);
        b.type = 'button';
        b.onclick = function () {
          self.state.analysisUi.length = l.key;
          self.render();
        };
        lenRow.append(b);
      });
      panel.append(lenRow);

      const genBtn = el('button', 'sg-btn sg-btn-primary sg-analysis-generate', 'Analyse generieren');
      genBtn.type = 'button';
      genBtn.disabled = !!this.state.analysisLoading;
      if (ui.mode === 'astrology' && !persona.astrology) {
        genBtn.disabled = true;
        genBtn.title = 'Geburtsdaten in Schritt 2 erforderlich';
      }
      genBtn.onclick = function () { self.runPersonalityAnalysis(); };
      panel.append(genBtn);

      if (this.state.analysisLoading) {
        panel.append(this.showSpinner());
        panel.append(el('p', 'sg-hint', 'Analyse wird erstellt …'));
      } else if (this.state.analysisError) {
        panel.append(el('div', 'sg-error', this.state.analysisError));
      }

      const stored = persona.ai_analyses && persona.ai_analyses[ui.mode] && persona.ai_analyses[ui.mode][ui.length];
      if (stored) {
        panel.append(this.renderAnalysisDocument(stored));
      } else if (!this.state.analysisLoading && !this.state.analysisError) {
        panel.append(el('p', 'sg-hint', 'Noch keine Analyse für diese Kombination. Wähle Modus und Länge, dann „Analyse generieren".'));
      }

      if (ui.mode === 'astrology' && !persona.astrology) {
        panel.append(el('p', 'sg-hint', 'Astrologie-Modus: Bitte Geburtsdatum und Ort in Schritt 2 angeben.'));
      }

      return panel;
    }

    renderAnalysisDocument(data) {
      const wrap = el('article', 'sg-analysis-output');
      if (typeof data === 'string') {
        data.split(/\n\n+/).forEach(function (para) {
          if (para.trim()) wrap.append(el('p', null, para.trim()));
        });
        return wrap;
      }
      if (data.headline) {
        const h = el('h4', 'sg-analysis-headline', data.headline);
        wrap.append(h);
      }
      if (data.lead) wrap.append(el('p', 'sg-analysis-lead-text', data.lead));
      (data.sections || []).forEach(function (sec) {
        const block = el('section', 'sg-analysis-section');
        if (sec.title) block.append(el('h5', 'sg-analysis-section-title', sec.title));
        if (sec.body) {
          sec.body.split(/\n\n+/).forEach(function (p) {
            if (p.trim()) block.append(el('p', null, p.trim()));
          });
        }
        wrap.append(block);
      });
      if (data.closing) wrap.append(el('p', 'sg-analysis-closing', data.closing));
      if (Array.isArray(data.music_hints) && data.music_hints.length) {
        const tags = el('div', 'sg-analysis-music-hints');
        tags.append(el('span', 'sg-analysis-hints-label', 'Klang-Signale: '));
        data.music_hints.forEach(function (t) {
          tags.append(el('span', 'sg-motif-chip', t));
        });
        wrap.append(tags);
      }
      return wrap;
    }

    async runPersonalityAnalysis() {
      const P = window.SONG_PROMPTS;
      if (!P || !P.buildPersonalityAnalysisUserPrompt) {
        this.state.analysisError = 'Prompt-Modul nicht geladen.';
        this.render();
        return;
      }
      const ui = this.state.analysisUi || { mode: 'integrated', length: 'medium' };
      if (ui.mode === 'astrology' && !(this.state.persona && this.state.persona.astrology)) {
        this.state.analysisError = 'Für die astrologische Analyse werden Geburtsdaten benötigt.';
        this.render();
        return;
      }

      this.state.analysisLoading = true;
      this.state.analysisError = null;
      this.render();

      try {
        const apiKey = await getApiKey();
        if (!apiKey) throw new Error('Kein OpenAI API-Key. Bitte im Admin-Panel unter API Keys speichern.');

        const variant = this.state.testVariant || 'medium';
        const scored = window.SongTestData && window.SongTestData.computeScores
          ? window.SongTestData.computeScores(this.state.answers, variant)
          : { scales: {}, facets: {} };

        const maxTokens = ui.length === 'short' ? 900 : (ui.length === 'long' ? 2200 : 1400);
        const topFacets = window.SongTestData && window.SongTestData.topFacets && this.state.persona.facets_final
          ? window.SongTestData.topFacets(this.state.persona.facets_final, 6)
          : [];

        const parsed = await callOpenAIDirect({
          apiKey: apiKey,
          system: P.ANALYSIS_SYSTEM || P.SYSTEM_CORE,
          user: P.buildPersonalityAnalysisUserPrompt({
            mode: ui.mode,
            length: ui.length,
            test_results: scored.scales || this.state.persona.scales_final || {},
            facets: scored.facets || this.state.persona.facets_final || {},
            top_facets: topFacets,
            astrology: this.state.persona.astrology ? this._compactAstro(this.state.persona.astrology) : null,
            persona: this.state.persona,
            answers_count: Object.keys(this.state.answers || {}).length,
            imported_narrative: this.state.importedNarrative || ''
          }),
          temperature: 0.78,
          maxTokens: maxTokens
        });

        if (!this.state.persona.ai_analyses) this.state.persona.ai_analyses = {};
        if (!this.state.persona.ai_analyses[ui.mode]) this.state.persona.ai_analyses[ui.mode] = {};
        this.state.persona.ai_analyses[ui.mode][ui.length] = parsed;
        saveState(STORAGE_KEYS.persona, this.state.persona);
        this._cloudSave('persona', { updateCurrent: true });
      } catch (err) {
        this.state.analysisError = (err && err.message) || 'Analyse fehlgeschlagen';
      } finally {
        this.state.analysisLoading = false;
        this.render();
      }
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
        const personaForCompose = Object.assign({}, this.getEnrichedPersona() || this.state.persona);
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
        const identHint = this.state.audioIdentity
          ? ' · Audio-Identität Tiefe ' + this.state.audioIdentity.depthLevel + '/10'
          : '';
        wrap.append(el('p', 'sg-lead', '☁️ Test, Profil, Song und Audio werden in deinem AWS-Profil gespeichert' + identHint + '.'));
        if (this.state.audioIdentity) wrap.append(this.renderAudioIdentityPanel());
      }

      if (s.rationale) wrap.append(el('p', 'sg-rationale', s.rationale));

      // Sections
      (s.sections || []).forEach(section => wrap.append(this.renderSongSection(section)));

      // ════════════════════════════════════════════════════════
      // AUDIO-PRODUKTION (KI komponiert echtes Musikstück mit Stimme)
      // ════════════════════════════════════════════════════════
      wrap.append(this.renderVoicePanel());
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
          persona: this.getEnrichedPersona() || this.state.persona,
          previous_song: this.state.song,
          edit_targets: [{ section_id: section.id, line_ids: [line.id], instruction: '' }],
          mode: 'regenerate_lines'
        });
        this.state.song = mergeRerollIntoSong(this.state.song, data);
        saveState(STORAGE_KEYS.song, this.state.song);
        this.render();
      } catch (err) {
        alert('Re-Roll fehlgeschlagen: ' + err.message);
      } finally {
        if (btnEl) { btnEl.disabled = false; btnEl.textContent = '↻ Neu vorschlagen'; }
      }
    }

    async customRewriteLine(section, line) {
      const instr = window.prompt('Wie soll die Zeile umgeschrieben werden? (z. B. „kantiger", „mehr Hoffnung")');
      if (!instr) return;
      try {
        const data = await callApi('reroll', {
          persona: this.getEnrichedPersona() || this.state.persona,
          previous_song: this.state.song,
          edit_targets: [{ section_id: section.id, line_ids: [line.id], instruction: instr }],
          mode: 'regenerate_lines'
        });
        this.state.song = mergeRerollIntoSong(this.state.song, data);
        saveState(STORAGE_KEYS.song, this.state.song);
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
          persona: this.getEnrichedPersona() || this.state.persona,
          previous_song: this.state.song,
          edit_targets: [{ section_id: section.id, line_ids: (section.lines || []).map(l => l.id), instruction: instr }],
          mode: 'rewrite_section'
        });
        this.state.song = mergeRerollIntoSong(this.state.song, data);
        saveState(STORAGE_KEYS.song, this.state.song);
        this.render();
      } catch (err) {
        alert('Sektion umschreiben fehlgeschlagen: ' + err.message);
      }
    }

    // ════════════════════════════════════════════════════════════
    // AUDIO-PRODUKTION (KI komponiert echtes Musikstück + Stimme)
    // ════════════════════════════════════════════════════════════

    _buildProductionOpts(base) {
      base = base || {};
      const intentId = base.intentId || this.state.audioIntent || 'personality';
      const ui = this.state.analysisUi || { mode: 'integrated', length: 'medium' };
      const opts = Object.assign({ intentId: intentId }, base);
      if (!window.SongPlaylistEngine || !this.state.persona) return opts;
      const persona = this.getEnrichedPersona() || this.state.persona;

      const excerpt = window.SongPlaylistEngine.pickAnalysisExcerpt(
        persona, ui.mode, ui.length
      );
      const mods = window.SongPlaylistEngine.computeIntentModifiers(
        persona, intentId, excerpt
      );
      const blueprint = window.SongPlaylistEngine.computePlaylistBlueprint(persona, {
        analysisMode: ui.mode,
        analysisLength: ui.length
      });
      const track = window.SongPlaylistEngine.getTrackSpec(blueprint, intentId);
      opts.intentModifiers = mods;
      opts.trackSpec = track;
      opts.analysisKeywords = mods.analysisKeywords;
      opts.instrumental = mods.instrumental;
      opts._persona = persona;
      if (this.state.useCustomVoice && this.state.voiceProfile && this.state.voiceProfile.voiceId &&
          !mods.instrumental && intentId !== 'focus' && intentId !== 'workout' &&
          intentId !== 'chill' && intentId !== 'healing' && intentId !== 'sleep') {
        opts.useCustomVoice = true;
        opts.voiceId = this.state.voiceProfile.voiceId;
        opts.personaId = this.state.voiceProfile.voiceId;
        opts.personaModel = 'voice_persona';
      }
      if (track && track.titleSuggestion && intentId !== 'personality') {
        opts.titleOverride = track.titleSuggestion.slice(0, 95);
      }
      return opts;
    }

    renderPlaylistIntentPanel() {
      const wrap = el('div', 'sg-playlist-panel');
      wrap.append(el('h4', null, 'Sound-Kontext & Playlist-Konzept'));
      wrap.append(el('p', 'sg-playlist-lead',
        '7 Modi aus Test, Astro, Methoden und KI-Analyse – Tempo, Energie und Kontext-DNA fliessen in die Suno-Produktion.'));

      const ui = this.state.analysisUi || { mode: 'integrated', length: 'medium' };
      const blueprint = window.SongPlaylistEngine.computePlaylistBlueprint(this.state.persona, {
        analysisMode: ui.mode,
        analysisLength: ui.length
      });
      const self = this;
      const intentId = this.state.audioIntent || 'personality';
      const groups = window.SongPlaylistEngine.INTENT_GROUPS || [];

      groups.forEach(function (group) {
        const groupWrap = el('div', 'sg-playlist-intent-group');
        groupWrap.append(el('span', 'sg-playlist-group-label', group.label));
        const tabs = el('div', 'sg-playlist-intents');
        (group.intents || []).forEach(function (key) {
          const track = blueprint.tracks.find(function (t) { return t.intentId === key; });
          if (!track) return;
          const b = el('button', 'sg-playlist-intent' + (intentId === track.intentId ? ' active' : ''));
          b.type = 'button';
          b.append(el('span', 'sg-playlist-emoji', track.emoji));
          b.append(el('span', 'sg-playlist-label', track.label));
          b.onclick = function () {
            self.state.audioIntent = track.intentId;
            self.render();
          };
          tabs.append(b);
        });
        groupWrap.append(tabs);
        wrap.append(groupWrap);
      });

      const active = blueprint.tracks.find(function (t) { return t.intentId === intentId; }) || blueprint.tracks[0];
      if (active) {
        const spec = el('div', 'sg-playlist-spec');
        spec.append(el('p', 'sg-playlist-desc', active.description));
        const metrics = el('div', 'sg-playlist-metrics');
        [
          ['Tempo', active.tempo + ' BPM'],
          ['Energie', Math.round((active.energy || 0) * 100) + '%'],
          ['Helligkeit', Math.round((active.brightness || 0) * 100) + '%'],
          ['Modus', active.instrumental ? 'Instrumental' : 'Mit Gesang']
        ].forEach(function (pair) {
          const m = el('div', 'sg-playlist-metric');
          m.append(el('span', 'sg-playlist-metric-k', pair[0]));
          m.append(el('span', 'sg-playlist-metric-v', pair[1]));
          metrics.append(m);
        });
        spec.append(metrics);

        if (active.contextDNA) {
          const dnaTitle = el('p', 'sg-context-dna-title', 'Kontext-DNA');
          spec.append(dnaTitle);
          const dnaGrid = el('div', 'sg-context-dna-grid');
          const labels = window.SongPlaylistEngine.CONTEXT_DNA_LABELS || {};
          const fmt = window.SongPlaylistEngine.formatContextDNAValue || function (_k, v) { return String(v); };
          Object.keys(active.contextDNA).forEach(function (key) {
            const cell = el('div', 'sg-context-dna-cell');
            cell.append(el('span', 'sg-context-dna-k', labels[key] || key));
            cell.append(el('span', 'sg-context-dna-v', fmt(key, active.contextDNA[key])));
            dnaGrid.append(cell);
          });
          spec.append(dnaGrid);
        }

        if (active.rationale) spec.append(el('p', 'sg-playlist-rationale', active.rationale));
        if (active.styleTags && active.styleTags.length) {
          const tags = el('div', 'sg-playlist-tags');
          active.styleTags.forEach(function (t) { tags.append(el('span', 'sg-motif-chip', t)); });
          spec.append(tags);
        }
        wrap.append(spec);
      }

      const packs = window.SongPlaylistEngine.PLAYLIST_PACKS || {};
      const packRow = el('div', 'sg-playlist-pack-row');
      packRow.append(el('span', 'sg-playlist-pack-label', 'Auto-Queue:'));
      Object.keys(packs).forEach(function (packId) {
        const pack = packs[packId];
        const pb = el('button', 'sg-playlist-pack-btn' + (self.state.playlistPack === packId ? ' active' : ''));
        pb.type = 'button';
        pb.textContent = (pack.emoji || '') + ' ' + pack.label;
        pb.title = pack.description || '';
        pb.onclick = function () {
          self.state.playlistPack = packId;
          self.render();
        };
        packRow.append(pb);
      });
      wrap.append(packRow);

      const activePack = window.SongPlaylistEngine.getPlaylistPack(this.state.playlistPack);
      wrap.append(el('p', 'sg-hint',
        'Auto-Queue „' + (activePack.label || 'Kern') + '": ' + (activePack.order || []).length +
        ' Kontexte nacheinander. Einzeln: Modus wählen und „Einzel-Song produzieren".'));
      return wrap;
    }

    renderVoicePanel() {
      const self = this;
      const panel = el('div', 'sg-voice-panel');
      panel.append(el('h4', null, '🎤 Meine Stimme (Optional)'));
      panel.append(el('p', 'sg-voice-lead',
        'Eigene Stimme via Suno Voice: Stimmprobe aufnehmen oder hochladen → Validierungssatz singen → bei Produktion aktivieren.'));

      const trainRow = el('div', 'sg-voice-train-row');
      const trainLink = el('a', 'sg-voice-train-link', '🎵 Gesangstraining mit Pitch-Feedback');
      trainLink.href = 'singing-trainer.html';
      trainLink.title = 'ADHS-optimiertes Gesangstraining auf manuel-weiss.ch';
      trainRow.append(trainLink);
      trainRow.append(el('span', 'sg-voice-train-hint', ' – Stimme warm machen vor der Aufnahme'));
      panel.append(trainRow);

      const vp = this.state.voiceProfile;
      const wiz = this.state.voiceWizard || { phase: 'idle' };

      if (vp && vp.voiceId) {
        const ready = el('div', 'sg-voice-ready');
        ready.append(el('p', 'sg-voice-status ok', '✓ Stimme registriert: ' + (vp.voiceName || 'Meine Stimme')));
        const useWrap = el('label', 'sg-voice-use-label');
        const useCb = document.createElement('input');
        useCb.type = 'checkbox';
        useCb.checked = !!this.state.useCustomVoice;
        useCb.onchange = function () {
          self.state.useCustomVoice = useCb.checked;
          saveState(STORAGE_KEYS.useCustomVoice, self.state.useCustomVoice);
        };
        useWrap.append(useCb);
        useWrap.append(document.createTextNode(' Bei Produktion meine Stimme verwenden'));
        ready.append(useWrap);
        panel.append(ready);
        return panel;
      }

      if (wiz.phase === 'need_verification' && wiz.validateInfo) {
        const box = el('div', 'sg-voice-verify-box');
        box.append(el('p', 'sg-voice-phrase-label', 'Sing jetzt genau diesen Satz (singend, in deiner normalen Tonhöhe):'));
        box.append(el('blockquote', 'sg-voice-phrase', wiz.validateInfo));
        box.append(el('p', 'sg-voice-guide-tip',
          'Nicht absichtlich tief oder hoch – singe so natürlich wie im Alltag. Ruhiger Raum, kein Flüstern.'));

        const recWrap = el('div', 'sg-voice-rec-block');
        box.append(el('p', 'sg-hint', 'Validierung aufnehmen (empfohlen) oder Datei hochladen (MP3/WAV):'));
        box.append(recWrap);
        if (window.SongVoiceEngine && window.SongVoiceEngine.mountVoiceRecorder) {
          self._voiceVerifyRecorder = window.SongVoiceEngine.mountVoiceRecorder(recWrap, {
            label: 'Validierung',
            maxSeconds: 25,
            onRecorded: function () {}
          });
        }

        const vFile = el('input');
        vFile.type = 'file';
        vFile.accept = 'audio/mpeg,audio/wav,audio/mp3,audio/x-wav,audio/mp4,audio/*';
        vFile.className = 'sg-voice-file';
        box.append(el('label', null, 'Oder Audiodatei wählen'));
        box.append(vFile);

        const btn = el('button', 'sg-btn sg-btn-primary', 'Verifikation senden & Stimme erstellen');
        btn.type = 'button';
        btn.onclick = async function () {
          var verifyFile = (vFile.files && vFile.files[0]) ||
            (self._voiceVerifyRecorder && self._voiceVerifyRecorder.getFile('validierung.webm'));
          if (!verifyFile) {
            alert('Bitte Validierung aufnehmen oder Audiodatei wählen.');
            return;
          }
          btn.disabled = true;
          btn.textContent = 'Stimme wird erstellt …';
          try {
            const result = await window.SongVoiceEngine.registerVoice({
              validateTaskId: wiz.validateTaskId,
              verifyFile: verifyFile,
              meta: { voiceName: 'Meine Stimme' },
              onPhase: function (p) {
                self.state.voiceWizard = Object.assign({}, wiz, p);
              }
            });
            if (result.voiceId) {
              self.state.voiceProfile = result;
              self.state.useCustomVoice = true;
              self.state.voiceWizard = { phase: 'idle' };
              saveState(STORAGE_KEYS.voiceProfile, result);
              saveState(STORAGE_KEYS.useCustomVoice, true);
              if (window.SongGeneratorCloud && window.SongGeneratorCloud.saveVoiceProfile) {
                await window.SongGeneratorCloud.saveVoiceProfile(self.state, result);
              }
            }
            self.render();
          } catch (err) {
            alert(err.message || String(err));
            btn.disabled = false;
            btn.textContent = 'Verifikation senden & Stimme erstellen';
          }
        };
        box.append(btn);
        panel.append(box);
        return panel;
      }

      if (wiz.phase && wiz.phase !== 'idle') {
        panel.append(el('p', 'sg-voice-status', '⏳ ' + (wiz.label || wiz.phase) + ' …'));
        panel.append(this.showSpinner());
        return panel;
      }

      const form = el('div', 'sg-voice-form');

      const guide = el('div', 'sg-voice-guide');
      guide.append(el('p', 'sg-voice-guide-title', 'Was soll ich aufnehmen?'));
      const guideList = el('ul', 'sg-voice-guide-list');
      [
        'Sing 10–20 Sekunden in deiner normalen Stimme – z. B. «La la la» oder: «Ich nehme meine Stimmprobe auf, klar und deutlich.»',
        'Tonhöhe: weder absichtlich tief noch hoch – so, wie du normal sprichst oder singst.',
        'Ruhiger Raum, kein Hintergrundgeräusch. Kurz im Gesangstraining warm machen hilft.',
        'Segment Start/Ende: Standard 0–10 s reicht, wenn du direkt am Anfang der Aufnahme singst.'
      ].forEach(function (t) { guideList.append(el('li', null, t)); });
      guide.append(guideList);
      form.append(guide);

      form.append(el('p', 'sg-hint', 'Stimmprobe: direkt aufnehmen (5–30 s) oder MP3/WAV hochladen.'));

      const sampleRecWrap = el('div', 'sg-voice-rec-block');
      form.append(sampleRecWrap);
      if (window.SongVoiceEngine && window.SongVoiceEngine.mountVoiceRecorder) {
        self._voiceSampleRecorder = window.SongVoiceEngine.mountVoiceRecorder(sampleRecWrap, {
          label: 'Stimmprobe',
          maxSeconds: 30,
          onRecorded: function () {}
        });
      }

      const fileIn = el('input');
      fileIn.type = 'file';
      fileIn.accept = 'audio/mpeg,audio/wav,audio/mp3,audio/x-wav,audio/mp4,audio/*';
      fileIn.className = 'sg-voice-file';
      form.append(el('label', null, 'Alternativ: Audiodatei hochladen'));
      form.append(fileIn);

      const segRow = el('div', 'sg-voice-seg-row');
      const startIn = el('input');
      startIn.type = 'number';
      startIn.min = '0';
      startIn.value = '0';
      startIn.className = 'sg-voice-seg-input';
      const endIn = el('input');
      endIn.type = 'number';
      endIn.min = '1';
      endIn.value = '10';
      endIn.className = 'sg-voice-seg-input';
      segRow.append(el('label', null, 'Segment Start (s)'));
      segRow.append(startIn);
      segRow.append(el('label', null, 'Ende (s)'));
      segRow.append(endIn);
      form.append(segRow);

      const startBtn = el('button', 'sg-btn sg-btn-secondary', 'Stimme registrieren starten');
      startBtn.type = 'button';
      startBtn.onclick = async function () {
        var file = (fileIn.files && fileIn.files[0]) ||
          (self._voiceSampleRecorder && self._voiceSampleRecorder.getFile('stimmprobe.webm'));
        if (!file) {
          alert('Bitte Stimmprobe aufnehmen oder Audiodatei wählen.');
          return;
        }
        startBtn.disabled = true;
        self.state.voiceWizard = { phase: 'upload', label: 'Stimmprobe wird hochgeladen' };
        self.render();
        try {
          let duration = parseInt(endIn.value, 10) || 10;
          const result = await window.SongVoiceEngine.registerVoice({
            file: file,
            vocalStartS: parseInt(startIn.value, 10) || 0,
            vocalEndS: parseInt(endIn.value, 10) || 10,
            duration: duration,
            meta: { voiceName: 'Meine Stimme' },
            onPhase: function (p) {
              var labels = {
                validate_start: 'Analyse gestartet',
                validate_poll: 'Validierungssatz wird erzeugt',
                voice_generate: 'Stimme wird erstellt',
                voice_poll: 'Stimme wird fertiggestellt'
              };
              self.state.voiceWizard = Object.assign({}, p, { label: labels[p.phase] || p.phase });
              self.render();
            }
          });
          if (result.phase === 'need_verification') {
            self.state.voiceWizard = Object.assign({}, result, { phase: 'need_verification' });
          } else if (result.voiceId) {
            self.state.voiceProfile = result;
            self.state.useCustomVoice = true;
            self.state.voiceWizard = { phase: 'idle' };
            saveState(STORAGE_KEYS.voiceProfile, result);
            saveState(STORAGE_KEYS.useCustomVoice, true);
            if (window.SongGeneratorCloud && window.SongGeneratorCloud.saveVoiceProfile) {
              await window.SongGeneratorCloud.saveVoiceProfile(self.state, result);
            }
          }
          self.render();
        } catch (err) {
          self.state.voiceWizard = { phase: 'idle' };
          alert(err.message || String(err));
          self.render();
        }
      };
      form.append(startBtn);
      form.append(el('p', 'sg-hint', 'Datenschutz: Stimmproben werden für Suno Voice verarbeitet. Nur deine eigene Stimme hochladen.'));
      panel.append(form);
      return panel;
    }

    renderFavoritesPlaylist() {
      const self = this;
      const favs = this.state.favorites || [];
      const panel = el('div', 'sg-favorites-panel');
      this._favoritesPanelEl = panel;
      panel.append(el('h4', null, '♥ Meine Favoriten-Playlist (' + favs.length + ')'));
      panel.append(el('p', 'sg-favorites-lead',
        'Lieblingssongs mit ♡ markieren und benennen – sie bleiben dauerhaft hier. Reihenfolge per Ziehen oder ↑/↓.'));

      if (!window.SongGeneratorCloud || !window.SongGeneratorCloud.isLoggedIn()) {
        panel.append(el('p', 'sg-hint', 'Favoriten werden lokal gespeichert. Anmelden für Cloud-Sync auf allen Geräten.'));
      }

      if (!favs.length) {
        panel.append(el('p', 'sg-hint', 'Noch keine Favoriten – tippe ♡ bei einem Song.'));
        return panel;
      }

      const playable = favs.filter(function (f) { return f && f.url; });
      if (!playable.length) {
        panel.append(el('p', 'sg-hint', 'Keine abspielbaren Favoriten.'));
        return panel;
      }

      const mainWrap = el('div', 'sg-favorites-main');
      const audioSlot = el('div', 'sg-favorites-audio-slot');
      mainWrap.append(audioSlot);
      const nowPlaying = el('div', 'sg-favorites-now', '▶ ' + (playable[0].emoji || '♥') + ' ' + self._getDisplayName(playable[0]));
      mainWrap.append(nowPlaying);
      panel.append(mainWrap);

      this._favoritesPlayable = playable;
      this._favoritesNowEl = nowPlaying;
      if (window.SongPersistentPlayer) {
        window.SongPersistentPlayer.mountSlot(audioSlot, { source: 'favorites' });
      }

      const controls = el('div', 'sg-favorites-controls');
      const playAll = el('button', 'sg-btn sg-btn-primary', '▶ Favoriten abspielen');
      playAll.type = 'button';
      playAll.onclick = function () {
        self._favoritesAutoplay = true;
        self._favoritesPlayIndex = 0;
        self._playFavoriteTrack(0);
      };
      controls.append(playAll);
      panel.append(controls);

      const list = el('div', 'sg-favorites-list');
      let dragFrom = null;

      playable.forEach(function (track, i) {
        const row = el('div', 'sg-favorites-row' + (i === 0 ? ' active' : ''));
        row.draggable = true;
        row.dataset.index = String(i);

        row.addEventListener('dragstart', function (e) {
          dragFrom = i;
          row.classList.add('dragging');
          if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        });
        row.addEventListener('dragend', function () {
          row.classList.remove('dragging');
          dragFrom = null;
        });
        row.addEventListener('dragover', function (e) {
          e.preventDefault();
          row.classList.add('drag-over');
        });
        row.addEventListener('dragleave', function () {
          row.classList.remove('drag-over');
        });
        row.addEventListener('drop', function (e) {
          e.preventDefault();
          row.classList.remove('drag-over');
          if (dragFrom == null || dragFrom === i) return;
          self._reorderFavorite(dragFrom, i);
        });

        const handle = el('span', 'sg-favorites-handle', '⋮⋮');
        handle.title = 'Ziehen zum Sortieren';
        row.append(handle);

        const playBtn = el('button', 'sg-favorites-play', String(i + 1));
        playBtn.type = 'button';
        playBtn.title = 'Abspielen';
        playBtn.onclick = function () {
          self._favoritesAutoplay = false;
          self._playFavoriteTrack(i);
          list.querySelectorAll('.sg-favorites-row').forEach(function (el, j) {
            el.classList.toggle('active', j === i);
          });
        };
        row.append(playBtn);

        const info = el('span', 'sg-favorites-info');
        info.append(el('span', 'sg-favorites-emoji', track.emoji || '♥'));
        const nameIn = el('input', 'sg-fav-name-input');
        nameIn.type = 'text';
        nameIn.value = self._getDisplayName(track);
        nameIn.placeholder = 'Song benennen …';
        nameIn.title = 'Name bearbeiten';
        nameIn.onchange = function () { self._renameFavorite(track.id, nameIn.value); };
        nameIn.onblur = function () { self._renameFavorite(track.id, nameIn.value); };
        info.append(nameIn);
        row.append(info);

        if (track.duration) {
          row.append(el('span', 'sg-favorites-dur', self._formatDuration(track.duration)));
        }

        const orderBtns = el('span', 'sg-favorites-order');
        const up = el('button', 'sg-btn-icon', '↑');
        up.type = 'button';
        up.title = 'Nach oben';
        up.disabled = i === 0;
        up.onclick = function (e) {
          e.stopPropagation();
          self._reorderFavorite(i, i - 1);
        };
        const down = el('button', 'sg-btn-icon', '↓');
        down.type = 'button';
        down.title = 'Nach unten';
        down.disabled = i === playable.length - 1;
        down.onclick = function (e) {
          e.stopPropagation();
          self._reorderFavorite(i, i + 1);
        };
        orderBtns.append(up, down);
        row.append(orderBtns);

        row.append(self._renderFavoriteBtn(track));
        list.append(row);
      });

      panel.append(list);
      return panel;
    }

    _playFavoriteTrack(index) {
      const playable = this._favoritesPlayable;
      if (!playable || index < 0 || index >= playable.length) return;
      const track = playable[index];
      this._favoritesPlayIndex = index;
      this._playPersistent({
        source: 'favorites',
        queue: playable,
        index: index,
        autoplayQueue: !!this._favoritesAutoplay,
        artist: 'Meine Favoriten',
        track: track
      });
      if (this._favoritesNowEl) {
        this._favoritesNowEl.textContent = '▶ ' + (track.emoji || '♥') + ' ' + this._getDisplayName(track);
      }
      if (window.SongPersistentPlayer) {
        window.SongPersistentPlayer.syncActiveRows(this._favoritesPanelEl, '.sg-favorites-row');
      }
    }

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

      box.append(this.renderFavoritesPlaylist());

      // Playlist-Intent & berechnetes Konzept
      if (this.state.persona && window.SongPlaylistEngine) {
        box.append(this.renderPlaylistIntentPanel());
      }

      // Mix-Matrix anzeigen
      if (this.state.persona && window.SongMusicEngine) {
        try {
          const prodOpts = this._buildProductionOpts({ model: 'V5_5' });
          const preview = window.SongMusicEngine.buildStylePrompt(
            prodOpts._persona || this.getEnrichedPersona() || this.state.persona,
            prodOpts
          );
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

      if (this.state.voiceProfile && this.state.voiceProfile.voiceId) {
        const voiceWrap = el('div', 'sg-field sg-field-voice');
        const voiceLabel = el('label', 'sg-voice-use-label');
        const voiceCb = document.createElement('input');
        voiceCb.type = 'checkbox';
        voiceCb.checked = !!this.state.useCustomVoice;
        voiceCb.onchange = () => {
          this.state.useCustomVoice = voiceCb.checked;
          saveState(STORAGE_KEYS.useCustomVoice, this.state.useCustomVoice);
        };
        voiceLabel.append(voiceCb);
        voiceLabel.append(document.createTextNode(' Meine registrierte Stimme verwenden'));
        voiceWrap.append(voiceLabel);
        opts.append(voiceWrap);
      }

      box.append(opts);

      // Status / Actions / Player
      const stateBox = el('div', 'sg-prod-state');
      const phase = (this.state.audioState && this.state.audioState.phase) || 'idle';

      if (phase === 'idle' && !this.state.audio && !this.state.playlist) {
        const act = el('div', 'sg-actions sg-actions-split sg-actions-queue');
        const startBtn = el('button', 'sg-btn sg-btn-primary', '🎵 Einzel-Song produzieren');
        startBtn.onclick = () => {
          const o = this._buildProductionOpts({
            model: mSel.value,
            vocalGender: vgSel.value === 'auto' ? undefined : vgSel.value
          });
          this.runProduction(o);
        };
        act.append(startBtn);

        const pack = window.SongPlaylistEngine
          ? window.SongPlaylistEngine.getPlaylistPack(this.state.playlistPack || 'core')
          : { label: 'Kern-Playlist', order: ['personality', 'soul', 'workout', 'focus'], emoji: '🎧' };
        const queueBtn = el('button', 'sg-btn sg-btn-secondary sg-btn-queue',
          (pack.emoji || '🎧') + ' ' + pack.label + ' (' + (pack.order || []).length + ' Songs)');
        queueBtn.onclick = () => {
          this.runPlaylistQueue({
            model: mSel.value,
            vocalGender: vgSel.value === 'auto' ? undefined : vgSel.value,
            pack: this.state.playlistPack || 'core'
          });
        };
        act.append(queueBtn);

        const hint = el('p', 'sg-hint',
          'Einzel-Song: ~30–90 s, 2 Varianten. Auto-Queue: gewähltes Paket oben im Kontext-Panel (~30–90 s pro Song). ' +
          'Abspielen auf Handy, Bluetooth-Box oder AirPlay.');
        stateBox.append(act, hint);
      } else if (phase === 'queue_running') {
        stateBox.append(this._renderPlaylistQueueProgress());
      } else if (phase === 'submitting' || phase === 'polling') {
        stateBox.append(el('p', 'sg-prod-status-lead', 'Song wird produziert …'));
        stateBox.append(this._renderProductionProgressBar(true));
        stateBox.append(this.showSpinner());
        const st = (this.state.audioState && this.state.audioState.status) || '';
        const friendly = this._humanProductionStatus(st);
        if (friendly) stateBox.append(el('p', 'sg-prod-status', friendly));
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

      // Audio-Player: Einzel-Song oder volle Playlist
      if (this.state.playlist && Array.isArray(this.state.playlist.tracks) && this.state.playlist.tracks.length) {
        stateBox.append(this._renderPlaylistPlayer(this.state.playlist));
      } else if (this.state.audio && Array.isArray(this.state.audio.tracks) && this.state.audio.tracks.length) {
        stateBox.append(this._renderAudioPlayer(this.state.audio));
      }
      box.append(stateBox);
      return box;
    }

    _renderPlaylistQueueProgress() {
      const st = this.state.audioState || {};
      const idx = (st.queueIndex || 0) + 1;
      const total = st.queueTotal || 4;
      const pct = Math.round(((st.queueIndex || 0) / total) * 100);
      const wrap = el('div', 'sg-queue-progress');
      wrap.append(el('h4', null, 'Playlist wird produziert …'));
      const friendly = this._humanProductionStatus(st.queueStatus, {
        songIndex: idx,
        songTotal: total,
        songLabel: st.queueLabel || 'Song'
      });
      wrap.append(el('p', 'sg-prod-status-lead',
        'Song ' + idx + ' von ' + total + (st.queueLabel ? ': ' + st.queueLabel : '')));
      if (friendly) wrap.append(el('p', 'sg-prod-status', friendly));
      const bar = el('div', 'sg-queue-bar');
      const fill = el('div', 'sg-queue-bar-fill');
      fill.style.width = pct + '%';
      bar.append(fill);
      wrap.append(bar);
      wrap.append(this.showSpinner());

      if (Array.isArray(st.queueDone) && st.queueDone.length) {
        const done = el('ul', 'sg-queue-done');
        st.queueDone.forEach(function (item) {
          const li = el('li', item.status === 'ok' ? 'ok' : 'fail',
            (item.status === 'ok' ? '✓ ' : '✗ ') + item.label);
          done.append(li);
        });
        wrap.append(done);
      }

      const self = this;
      const cancel = el('button', 'sg-btn sg-btn-ghost', 'Queue abbrechen');
      cancel.onclick = function () {
        self.state.audioState.cancelQueue = true;
        self.render();
      };
      wrap.append(cancel);
      return wrap;
    }

    _trackUrl(t) {
      return t && (t.audio_url || t.audioUrl || t.source_audio_url || t.sourceAudioUrl ||
        t.stream_audio_url || t.streamAudioUrl);
    }

    _renderPlaylistPlayer(playlist) {
      const box = el('div', 'sg-playlist-player');
      this._playlistPlayerEl = box;
      box.append(el('h4', null, '🎧 Deine Persönlichkeits-Playlist'));
      const okCount = playlist.tracks.filter(function (t) { return t.status === 'ok'; }).length;
      const labels = playlist.tracks.filter(function (t) { return t.status === 'ok'; })
        .map(function (t) { return (t.emoji || '') + ' ' + t.label; }).join(' → ');
      box.append(el('p', 'sg-playlist-player-sub', okCount + ' Songs · ' + (labels || '—')));
      if (window.SongGeneratorCloud && window.SongGeneratorCloud.isLoggedIn()) {
        box.append(el('p', 'sg-playlist-saved-hint',
          '☁️ Playlist gespeichert – im Profil unter Fortschritt → Persönlichkeits-Songs.'));
      } else {
        box.append(el('p', 'sg-hint',
          'Nur in diesem Browser gespeichert – anmelden für Cloud-Speicher im Profil.'));
      }
      box.append(this._renderBluetoothHint());

      const playable = playlist.tracks.filter(function (t) {
        return t.status === 'ok' && t.url;
      });
      if (!playable.length) {
        box.append(el('p', 'sg-hint', 'Keine abspielbaren Tracks in der Playlist.'));
        return box;
      }

      const mainWrap = el('div', 'sg-playlist-main');
      const audioSlot = el('div', 'sg-playlist-audio-slot');
      mainWrap.append(audioSlot);
      const first = playable[0];
      const nowPlaying = el('div', 'sg-playlist-now', '▶ ' + (first.emoji || '') + ' ' + first.label);
      mainWrap.append(nowPlaying);
      box.append(mainWrap);

      const self = this;
      this._playlistPlayable = playable;
      this._playlistNowEl = nowPlaying;
      if (window.SongPersistentPlayer) {
        window.SongPersistentPlayer.mountSlot(audioSlot, { source: 'playlist' });
      }

      const controls = el('div', 'sg-playlist-controls');
      const playAll = el('button', 'sg-btn sg-btn-primary', '▶ Alle abspielen');
      playAll.type = 'button';
      playAll.onclick = function () {
        self._playlistAutoplay = true;
        self._playlistPlayIndex = 0;
        self._playPlaylistTrack(0);
      };
      controls.append(playAll);
      box.append(controls);

      const list = el('div', 'sg-playlist-tracklist');
      playable.forEach(function (track, i) {
        const row = el('div', 'sg-playlist-track' + (i === 0 ? ' active' : ''));
        const left = el('button', 'sg-playlist-track-play');
        left.type = 'button';
        const leftInner = el('span', 'sg-playlist-track-left');
        leftInner.append(el('span', 'sg-playlist-track-num', String(i + 1)));
        leftInner.append(el('span', 'sg-playlist-track-emoji', track.emoji || '🎵'));
        const plName = el('input', 'sg-track-name-input sg-playlist-track-name-input');
        plName.type = 'text';
        plName.value = track.customName || track.label || track.title || ('Track ' + (i + 1));
        plName.placeholder = 'Benennen …';
        plName.onclick = function (e) { e.stopPropagation(); };
        plName.onchange = function () {
          track.customName = plName.value.trim();
          saveState(STORAGE_KEYS.playlist, self.state.playlist);
          var fid = window.SongFavorites ? window.SongFavorites.trackKey({ url: track.url }) : '';
          if (fid && self._isFavorite(fid)) self._renameFavorite(fid, plName.value);
        };
        leftInner.append(plName);
        left.append(leftInner);
        if (track.duration) {
          left.append(el('span', 'sg-playlist-track-dur', self._formatDuration(track.duration)));
        }
        row.append(left);
        row.append(self._renderFavoriteBtn({
          url: track.url,
          title: track.title,
          userTitle: track.customName,
          label: track.customName || track.label,
          emoji: track.emoji,
          intentId: track.intentId,
          cover: track.cover,
          duration: track.duration
        }));
        left.onclick = function () {
          self._playlistAutoplay = false;
          self._playPlaylistTrack(i);
          list.querySelectorAll('.sg-playlist-track').forEach(function (el, j) {
            el.classList.toggle('active', j === i);
          });
        };
        list.append(row);
      });
      box.append(list);

      const actions = el('div', 'sg-audio-actions');
      const regen = el('button', 'sg-btn sg-btn-ghost', '↻ Playlist neu generieren');
      regen.onclick = function () {
        const pack = window.SongPlaylistEngine
          ? window.SongPlaylistEngine.getPlaylistPack(self.state.playlistPack || 'core')
          : { order: [] };
        const n = (pack.order || []).length || 4;
        if (!confirm('Playlist verwerfen und neu produzieren? (' + n + ' Suno-Generierungen)')) return;
        self.state.playlist = null;
        clearState(STORAGE_KEYS.playlist);
        self.state.audioState = { phase: 'idle' };
        self.render();
      };
      actions.append(regen);
      box.append(actions);

      return box;
    }

    _playPlaylistTrack(index) {
      const playable = this._playlistPlayable;
      if (!playable || index < 0 || index >= playable.length) return;
      const track = playable[index];
      this._playlistPlayIndex = index;
      this._playPersistent({
        source: 'playlist',
        queue: playable,
        index: index,
        autoplayQueue: !!this._playlistAutoplay,
        artist: 'Persönlichkeits-Playlist',
        track: track
      });
      if (this._playlistNowEl) {
        this._playlistNowEl.textContent = '▶ ' + (track.emoji || '') + ' ' + (track.customName || track.label);
      }
      if (window.SongPersistentPlayer && this._playlistPlayerEl) {
        window.SongPersistentPlayer.syncActiveRows(this._playlistPlayerEl, '.sg-playlist-track');
      }
    }

    _renderMixMatrix(preview) {
      const box = el('div', 'sg-mix-matrix');
      box.append(el('div', 'sg-mix-title', 'So wird dein Sound gemischt'));
      const rows = [
        { key: 'personality', label: 'Persönlichkeit', color: '#6366f1',
          text: preview.personality_text },
        { key: 'astrology', label: 'Astrologie', color: '#a78bfa',
          text: preview.astrology_text || '— (keine Geburtsdaten)' },
        { key: 'methods', label: 'Methoden-Bonus', color: '#34d399',
          text: preview.methods_text || '—' },
        { key: 'intent', label: 'Playlist-Kontext', color: '#f59e0b',
          text: preview.intent_text || 'Kompositions-Song (Standard)' }
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

    _setupAudioForPlayback(audioEl, meta) {
      if (!audioEl) return;
      meta = meta || {};
      audioEl.setAttribute('playsinline', '');
      audioEl.setAttribute('webkit-playsinline', '');
      audioEl.preload = 'metadata';
      audioEl.controls = true;
      audioEl.className = 'sg-audio-player';
      if (meta.title) audioEl.setAttribute('title', meta.title);
      if ('mediaSession' in navigator) {
        const applyMeta = function () {
          try {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: meta.title || 'Persönlichkeitssong',
              artist: meta.artist || 'Persönlichkeits-Song Generator',
              album: meta.album || 'Manuel Weiss',
              artwork: meta.artwork ? [{ src: meta.artwork, sizes: '512x512', type: 'image/jpeg' }] : []
            });
            navigator.mediaSession.setActionHandler('play', function () { audioEl.play(); });
            navigator.mediaSession.setActionHandler('pause', function () { audioEl.pause(); });
            navigator.mediaSession.setActionHandler('seekbackward', function () {
              audioEl.currentTime = Math.max(0, audioEl.currentTime - 10);
            });
            navigator.mediaSession.setActionHandler('seekforward', function () {
              audioEl.currentTime = Math.min(audioEl.duration || 0, audioEl.currentTime + 10);
            });
          } catch (_e) {}
        };
        audioEl.addEventListener('play', applyMeta);
      }
    }

    _playPersistent(opts) {
      if (!window.SongPersistentPlayer) return;
      window.SongPersistentPlayer.play(opts);
    }

    _syncPlaybackUi() {
      if (!window.SongPersistentPlayer) return;
      var st = window.SongPersistentPlayer.getState();
      if (!st.url) return;
      if (st.source === 'favorites' && this._favoritesPanelEl) {
        window.SongPersistentPlayer.syncActiveRows(this._favoritesPanelEl, '.sg-favorites-row');
        var favTrack = (this._favoritesPlayable || [])[st.index];
        if (favTrack && this._favoritesNowEl) {
          this._favoritesNowEl.textContent = (st.paused ? '⏸ ' : '▶ ') +
            (favTrack.emoji || '♥') + ' ' + this._getDisplayName(favTrack);
        }
        this._favoritesPlayIndex = st.index;
        this._favoritesAutoplay = st.autoplayQueue;
      }
      if (st.source === 'playlist' && this._playlistPlayerEl) {
        window.SongPersistentPlayer.syncActiveRows(this._playlistPlayerEl, '.sg-playlist-track');
        var plTrack = (this._playlistPlayable || [])[st.index];
        if (plTrack && this._playlistNowEl) {
          this._playlistNowEl.textContent = (st.paused ? '⏸ ' : '▶ ') +
            (plTrack.emoji || '') + ' ' + (plTrack.customName || plTrack.label || plTrack.title);
        }
        this._playlistPlayIndex = st.index;
        this._playlistAutoplay = st.autoplayQueue;
      }
    }

    _renderBluetoothHint() {
      const box = el('div', 'sg-bt-hint');
      box.append(el('strong', null, '🔊 Auf Bluetooth-Box, AirPlay oder TV'));
      const ul = el('ul', 'sg-bt-steps');
      [
        'Play antippen – Ton läuft über das aktuell gewählte Ausgabegerät.',
        'iPhone/iPad: Kontrollzentrum → AirPlay → deine Box wählen.',
        'Android: Lautstärke → Ausgabe → Bluetooth-Gerät.',
        'Alternativ: MP3 laden und in Apple Music / Dateien abspielen – dort Bluetooth wählen.'
      ].forEach(function (t) { ul.append(el('li', null, t)); });
      box.append(ul);
      return box;
    }

    _renderAudioPlayer(audio) {
      const self = this;
      const box = el('div', 'sg-audio-results');
      box.append(el('h4', null, 'Deine Songs (' + (audio.tracks || []).length + ' Varianten)'));
      box.append(this._renderBluetoothHint());

      const intentLabel = (window.SongPlaylistEngine && audio.intentId)
        ? (window.SongPlaylistEngine.getIntent(audio.intentId).label || '')
        : '';
      if (intentLabel) {
        box.append(el('p', 'sg-audio-intent-tag', 'Kontext: ' + intentLabel));
      }

      (audio.tracks || []).forEach((t, i) => {
        const url = t.audio_url || t.audioUrl || t.source_audio_url || t.sourceAudioUrl || t.stream_audio_url || t.streamAudioUrl;
        const cover = t.image_url || t.imageUrl;
        const card = el('div', 'sg-audio-card');
        const title = el('div', 'sg-audio-card-head');
        const nameIn = el('input', 'sg-track-name-input');
        nameIn.type = 'text';
        nameIn.placeholder = 'Song benennen …';
        nameIn.value = t.userTitle || t.title || ('Variante ' + (i + 1));
        nameIn.onchange = function () {
          t.userTitle = nameIn.value.trim();
          saveState(STORAGE_KEYS.audio, self.state.audio);
          var fid = window.SongFavorites ? window.SongFavorites.trackKey({ url: url }) : '';
          if (fid && self._isFavorite(fid)) self._renameFavorite(fid, nameIn.value);
        };
        title.append(nameIn);
        if (t.duration) title.append(el('span', 'sg-audio-duration', this._formatDuration(t.duration)));
        title.append(this._renderFavoriteBtn({
          url: url,
          title: t.title,
          userTitle: t.userTitle,
          label: t.userTitle || intentLabel || ('Variante ' + (i + 1)),
          emoji: audio.intentId && window.SongPlaylistEngine
            ? (window.SongPlaylistEngine.getIntent(audio.intentId).emoji || '🎵') : '🎵',
          intentId: audio.intentId,
          cover: cover,
          duration: t.duration
        }));
        card.append(title);
        if (cover) {
          const img = document.createElement('img');
          img.src = cover;
          img.alt = t.title || 'Cover';
          img.className = 'sg-audio-cover';
          card.prepend(img);
        }
        if (url) {
          const actions = el('div', 'sg-audio-actions');
          const playBt = el('button', 'sg-btn sg-btn-primary sg-btn-bt', '▶ Abspielen');
          playBt.type = 'button';
          playBt.onclick = function () {
            self._playPersistent({
              source: 'single',
              queue: [{
                url: url,
                title: t.userTitle || t.title,
                label: t.userTitle || intentLabel || ('Variante ' + (i + 1)),
                cover: cover,
                duration: t.duration,
                emoji: audio.intentId && window.SongPlaylistEngine
                  ? (window.SongPlaylistEngine.getIntent(audio.intentId).emoji || '🎵') : '🎵'
              }],
              index: 0,
              autoplayQueue: false,
              artist: 'Persönlichkeits-Song Generator',
              track: {
                url: url,
                title: t.userTitle || t.title,
                cover: cover
              }
            });
          };
          actions.append(playBt);

          const slug = (t.title || 'persoenlichkeitssong-' + (i + 1))
            .toLowerCase().replace(/[^a-z0-9äöüß]+/gi, '-').replace(/^-|-$/g, '');
          const dl = document.createElement('a');
          dl.href = url;
          dl.download = slug + '.mp3';
          dl.className = 'sg-btn sg-btn-ghost';
          dl.textContent = '⬇ MP3 (offline / andere App)';
          dl.setAttribute('target', '_blank');
          dl.setAttribute('rel', 'noopener');
          actions.append(dl);

          if (navigator.share) {
            const shareBtn = el('button', 'sg-btn sg-btn-ghost', 'Teilen');
            shareBtn.type = 'button';
            shareBtn.onclick = async function () {
              try {
                await navigator.share({
                  title: t.title || 'Mein Persönlichkeitssong',
                  text: 'Mein Persönlichkeitssong – aus meinem Persönlichkeitsprofil.',
                  url: url
                });
              } catch (_e) {}
            };
            actions.append(shareBtn);
          }
          card.append(actions);
        }
        box.append(card);
      });
      const reroll = el('button', 'sg-btn sg-btn-ghost', '↻ Neue Variation generieren');
      reroll.onclick = () => {
        const self = this;
        const tracks = (this.state.audio && this.state.audio.tracks) || [];
        const unfav = tracks.filter(function (t) {
          const url = t.audio_url || t.audioUrl || t.stream_audio_url || t.streamAudioUrl;
          if (!url) return false;
          const id = window.SongFavorites ? window.SongFavorites.trackKey({ url: url }) : '';
          return id && !self._isFavorite(id);
        });
        if (unfav.length) {
          const ok = confirm(
            unfav.length + ' Variante(n) sind nicht in deiner Favoriten-Playlist (♡). ' +
            'Die verschwinden nach „Neue Variation". Lieblingssongs bleiben gespeichert. Fortfahren?'
          );
          if (!ok) return;
        }
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

    _humanProductionStatus(rawStatus, opts) {
      opts = opts || {};
      if (!rawStatus) return null;
      var st = String(rawStatus).trim();
      var map = {
        PENDING: 'In Warteschlange',
        TEXT_SUCCESS: 'Text fertig, Audio wird erstellt',
        FIRST_SUCCESS: 'Erste Variante fertig',
        GENERATING: 'Audio wird generiert',
        SUCCESS: 'Fertig',
        Start: 'Start',
        'Start …': 'Start',
        'Generiert …': 'Wird generiert'
      };
      var label = map[st];
      if (!label) {
        if (/^[A-Z][A-Z0-9_]+$/.test(st)) return null;
        label = st;
      }
      if (opts.songIndex != null && opts.songTotal != null && opts.songLabel) {
        return 'Song ' + opts.songIndex + ' von ' + opts.songTotal + ' (' + opts.songLabel + ') – ' + label;
      }
      if (opts.songLabel) return opts.songLabel + ' – ' + label;
      return label;
    }

    _renderProductionProgressBar(indeterminate) {
      const bar = el('div', 'sg-prod-progress-bar' + (indeterminate ? ' indeterminate' : ''));
      bar.append(el('div', 'sg-prod-progress-fill'));
      return bar;
    }

    async runPlaylistQueue(baseOpts) {
      if (!window.SongMusicEngine || !window.SongPlaylistEngine) {
        alert('Music-Engine oder Playlist-Modul nicht geladen.');
        return;
      }
      baseOpts = baseOpts || {};
      const packId = baseOpts.pack || this.state.playlistPack || 'core';
      const pack = window.SongPlaylistEngine.getPlaylistPack(packId);
      const order = pack.order || window.SongPlaylistEngine.PLAYLIST_INTENT_ORDER ||
        Object.keys(window.SongPlaylistEngine.INTENTS);
      const queueDone = [];
      const playlistTracks = [];

      this.state.audio = null;
      clearState(STORAGE_KEYS.audio);
      this.state.playlist = null;

      this.state.audioState = {
        phase: 'queue_running',
        queueIndex: 0,
        queueTotal: order.length,
        queuePack: packId,
        queueLabel: '',
        queueStatus: '',
        queueDone: queueDone,
        cancelQueue: false,
        model: baseOpts.model,
        vocalGender: baseOpts.vocalGender
      };
      this.render();

      for (let i = 0; i < order.length; i += 1) {
        if (this.state.audioState.cancelQueue) break;

        const intentId = order[i];
        const intent = window.SongPlaylistEngine.getIntent(intentId);
        this.state.audioState.queueIndex = i;
        this.state.audioState.queueLabel = intent.label;
        this.state.audioState.queueStatus = 'Start …';
        this.state.audioState.queueDone = queueDone.slice();
        this.render();

        const opts = this._buildProductionOpts(Object.assign({}, baseOpts, { intentId: intentId }));

        try {
          const result = await window.SongMusicEngine.generateAudio(
            opts._persona || this.getEnrichedPersona() || this.state.persona,
            this.state.song,
            opts,
            (evt) => {
              if (evt.phase === 'polling' || evt.phase === 'first_ready') {
                this.state.audioState.queueStatus = evt.status || 'Generiert …';
                this.render();
              }
            }
          );
          const raw = (result.tracks && result.tracks[0]) || null;
          const url = raw ? this._trackUrl(raw) : null;
          if (url) {
            const entry = {
              intentId: intentId,
              label: intent.label,
              emoji: intent.emoji,
              title: raw.title || intent.label,
              url: url,
              cover: raw.image_url || raw.imageUrl,
              duration: raw.duration,
              status: 'ok'
            };
            queueDone.push({ label: intent.label, status: 'ok' });
            playlistTracks.push(entry);
          } else {
            queueDone.push({ label: intent.label, status: 'fail' });
            playlistTracks.push({
              intentId: intentId,
              label: intent.label,
              emoji: intent.emoji,
              status: 'failed',
              error: 'Keine Audio-URL'
            });
          }
        } catch (err) {
          console.warn('[SongGenerator] Playlist-Track fehlgeschlagen:', intentId, err);
          queueDone.push({ label: intent.label, status: 'fail' });
          playlistTracks.push({
            intentId: intentId,
            label: intent.label,
            emoji: intent.emoji,
            status: 'failed',
            error: err.message || String(err)
          });
        }
        this.state.audioState.queueDone = queueDone.slice();
      }

      const cancelled = this.state.audioState.cancelQueue;
      this.state.playlist = {
        tracks: playlistTracks,
        generatedAt: new Date().toISOString(),
        model: baseOpts.model || 'V5_5',
        pack: packId,
        partial: cancelled || playlistTracks.filter(function (t) { return t.status === 'ok'; }).length < order.length
      };
      saveState(STORAGE_KEYS.playlist, this.state.playlist);
      this.syncLocalCache();
      await this._persistAudioToProfile('playlist', { title: pack.label || 'Persönlichkeits-Playlist' });

      if (!playlistTracks.some(function (t) { return t.status === 'ok'; })) {
        this.state.audioState = {
          phase: 'error',
          error: cancelled
            ? 'Playlist-Queue abgebrochen – kein Track fertig.'
            : 'Playlist konnte nicht erzeugt werden. Suno-Key und Guthaben prüfen.'
        };
      } else {
        this.state.audioState = { phase: 'idle' };
      }
      this.render();
    }

    async runProduction(opts) {
      if (!window.SongMusicEngine) {
        alert('Music-Engine-Modul wurde nicht geladen.');
        return;
      }
      this.state.audioState = { phase: 'submitting', model: opts.model, vocalGender: opts.vocalGender };
      this.render();
      try {
        const persona = opts._persona || this.getEnrichedPersona() || this.state.persona;
        const result = await window.SongMusicEngine.generateAudio(
          persona,
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
          intentId: opts.intentId || this.state.audioIntent,
          generatedAt: new Date().toISOString(),
          provider: 'sunoapi_org',
          model: opts.model
        };
        saveState(STORAGE_KEYS.audio, this.state.audio);
        const intent = window.SongPlaylistEngine && window.SongPlaylistEngine.getIntent
          ? window.SongPlaylistEngine.getIntent(opts.intentId || this.state.audioIntent)
          : null;
        await this._persistAudioToProfile('single', {
          intentId: opts.intentId || this.state.audioIntent,
          intentLabel: intent && intent.label,
          title: this.state.song && this.state.song.title
        });
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
        playlist: this.state.playlist,
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
