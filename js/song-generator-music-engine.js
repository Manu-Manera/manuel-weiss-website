/**
 * Persönlichkeits-Song Generator – Music-Engine (Audio-Produktion)
 *
 * Wandelt die persona + den komponierten Song in einen Suno-API-Request um
 * und ruft Suno (V5.5) über einen Drittanbieter-Wrapper auf.
 *
 * Primärprovider: sunoapi.org (POST /api/v1/generate, polling /generate/record-info)
 *
 * Architektur:
 *  - PROVIDERS: Map provider-id → Adapter (createTask, pollTask)
 *  - buildEngineRequest(persona, song, opts): erzeugt model, title, style, lyrics
 *    mit transparenter 50:50-Gewichtungsmatrix:
 *      • 50 % wissenschaftliche Schicht (Big-Five-Domänen, Top-Facetten, music_dna)
 *      • 50 % astrologische Bildersprache (Elemente, Aszendent, dominante Planeten)
 *      • +0–30 % Methoden-Bonus (Themen-Tags je nach Anzahl bearbeiteter Methoden)
 *  - Die Berechnung der Gewichte gibt zusätzlich eine `weights`-Erklärung zurück,
 *    die im UI als Balken angezeigt wird.
 *
 * API-Key: identisches Pattern wie OpenAI-Key
 *   GET /api-settings?action=key&provider=suno&global=true
 *   Fallback: localStorage 'suno-api-key'
 */

(function () {
  'use strict';

  const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';

  // ────────────────────────────────────────────────────────────
  // API-Key-Laden (analog OpenAI)
  // ────────────────────────────────────────────────────────────
  const _keyCache = { value: null, expiresAt: 0 };
  function isValidSunoKey(k) {
    return typeof k === 'string'
      && k.length >= 16
      && !k.includes('...')
      && !k.includes('••••');
  }
  function getAuthTokenFromSession() {
    try {
      if (window.awsAuth && window.awsAuth.isLoggedIn && window.awsAuth.isLoggedIn()) {
        const u = window.awsAuth.getCurrentUser();
        if (u && u.idToken) return u.idToken;
      }
      if (window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()) {
        const u = window.realUserAuth.getCurrentUser();
        if (u && u.idToken) return u.idToken;
      }
      const adminSession = localStorage.getItem('admin_auth_session');
      if (adminSession) {
        const s = JSON.parse(adminSession);
        if (s.user && s.user.idToken) return s.user.idToken;
        if (s.user && s.user.accessToken) return s.user.accessToken;
      }
      const storageKey = (window.AWS_AUTH_CONFIG && window.AWS_AUTH_CONFIG.token && window.AWS_AUTH_CONFIG.token.storageKey) || 'aws_auth_session';
      const session = localStorage.getItem(storageKey) || localStorage.getItem('aws_auth_session');
      if (session) {
        const p = JSON.parse(session);
        if (p.idToken) return p.idToken;
      }
    } catch (_e) {}
    return null;
  }

  function persistSunoKeyLocally(k) {
    if (!isValidSunoKey(k)) return;
    try {
      localStorage.setItem('suno-api-key', k);
      const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
      globalKeys.suno = Object.assign({}, globalKeys.suno || {}, {
        key: k,
        apiKey: k,
        enabled: true
      });
      localStorage.setItem('global_api_keys', JSON.stringify(globalKeys));
    } catch (_e) {}
  }

  async function fetchSunoKeyFromApiSettings(useGlobal) {
    const headers = { 'Content-Type': 'application/json' };
    if (!useGlobal) {
      const token = getAuthTokenFromSession();
      if (!token) return null;
      headers.Authorization = 'Bearer ' + token;
    }
    const url = API_BASE + '/api-settings?action=key&provider=suno' + (useGlobal ? '&global=true' : '');
    try {
      const res = await fetch(url, { method: 'GET', headers: headers });
      if (!res.ok) return null;
      const data = await res.json().catch(function () { return null; });
      const k = data && data.apiKey;
      return isValidSunoKey(k) ? k : null;
    } catch (_e) {
      return null;
    }
  }

  function readSunoKeyFromStorage() {
    const candidates = [];
    try {
      const direct = localStorage.getItem('suno-api-key');
      if (direct) candidates.push(direct);
    } catch (_e) {}
    try {
      const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
      const g = globalKeys.suno;
      if (g) {
        if (typeof g === 'string') candidates.push(g);
        if (g.key) candidates.push(g.key);
        if (g.apiKey) candidates.push(g.apiKey);
      }
    } catch (_e) {}
    try {
      const gm = window.globalAPIManager || window.GlobalAPIManager;
      if (gm && typeof gm.getAPIKey === 'function') {
        const k = gm.getAPIKey('suno');
        if (k) candidates.push(k);
      }
    } catch (_e) {}
    try {
      const state = JSON.parse(localStorage.getItem('admin_state') || 'null');
      const s = state && state.apiKeys && state.apiKeys.suno;
      if (s) {
        if (s.key) candidates.push(s.key);
        if (s.apiKey) candidates.push(s.apiKey);
      }
    } catch (_e) {}
    for (let i = 0; i < candidates.length; i += 1) {
      if (isValidSunoKey(candidates[i])) return candidates[i];
    }
    return null;
  }

  async function getSunoApiKey() {
    if (_keyCache.value && _keyCache.expiresAt > Date.now()) return _keyCache.value;

    function rememberKey(k) {
      if (!isValidSunoKey(k)) return null;
      _keyCache.value = k;
      _keyCache.expiresAt = Date.now() + 5 * 60 * 1000;
      return k;
    }

    // 1) localStorage (Admin „Speichern“ im gleichen Browser)
    const stored = readSunoKeyFromStorage();
    const cachedStored = rememberKey(stored);
    if (cachedStored) return cachedStored;

    // 2) user-data Workflow (zuverlässig für eingeloggte User, unabhängig von api-settings-Lambda)
    try {
      if (window.awsAPISettings && typeof window.awsAPISettings.loadSunoKeyFromUserWorkflow === 'function') {
        const wfKey = await window.awsAPISettings.loadSunoKeyFromUserWorkflow();
        const cachedWf = rememberKey(wfKey);
        if (cachedWf) {
          persistSunoKeyLocally(cachedWf);
          return cachedWf;
        }
      }
    } catch (_e) { /* fall through */ }

    // 3) AWS User-Key (Admin-Panel → DynamoDB, JWT des eingeloggten Users)
    const userKey = await fetchSunoKeyFromApiSettings(false);
    const cachedUser = rememberKey(userKey);
    if (cachedUser) {
      persistSunoKeyLocally(cachedUser);
      return cachedUser;
    }

    // 4) AWS global (api-settings#global)
    const globalKey = await fetchSunoKeyFromApiSettings(true);
    const cachedGlobal = rememberKey(globalKey);
    if (cachedGlobal) {
      persistSunoKeyLocally(cachedGlobal);
      return cachedGlobal;
    }

    // 5) awsAPISettings-Fallback
    try {
      if (window.awsAPISettings && typeof window.awsAPISettings.getFullApiKey === 'function') {
        let k = null;
        if (window.awsAPISettings.isUserLoggedIn && window.awsAPISettings.isUserLoggedIn()) {
          k = await window.awsAPISettings.getFullApiKey('suno', false);
        }
        if (!k) k = await window.awsAPISettings.getFullApiKey('suno', true);
        const cached = rememberKey(k);
        if (cached) {
          persistSunoKeyLocally(cached);
          return cached;
        }
      }
    } catch (_e) { /* fall through */ }

    return null;
  }

  function invalidateSunoKeyCache() {
    _keyCache.value = null;
    _keyCache.expiresAt = 0;
  }

  // ────────────────────────────────────────────────────────────
  // 50:50-Gewichtungsmatrix + Style-Prompt-Builder
  // ────────────────────────────────────────────────────────────

  // Element-Modifier für die astrologische Schicht
  const ELEMENT_MODIFIERS = {
    fire:  { tags: ['driving', 'bright highs', 'punchy attack'],      moodWord: 'glowing' },
    earth: { tags: ['grounded', 'acoustic warmth', 'steady tempo'],   moodWord: 'rooted' },
    air:   { tags: ['airy texture', 'spacious mix', 'crystalline'],   moodWord: 'luminous' },
    water: { tags: ['lush reverb', 'dynamic releases', 'cinematic'],  moodWord: 'flowing' }
  };

  // Aszendenten-Vibe für die ersten Takte
  const ASC_VIBES = {
    'Widder':      'bold opening, immediate forward motion',
    'Stier':       'patient intro, sensual textures',
    'Zwillinge':   'playful conversation between instruments',
    'Krebs':       'tender, water-soft entrance',
    'Löwe':        'cinematic entrance, generous warmth',
    'Jungfrau':    'precise, finely arranged opening',
    'Waage':       'balanced, lyrical intro',
    'Skorpion':    'low, mysterious low end',
    'Schütze':     'expansive horizon, lifted opening',
    'Steinbock':   'measured, structural intro',
    'Wassermann':  'unusual harmonic opening, modern textures',
    'Fische':      'dream-like, washed-out intro'
  };

  function topFacetTags(facets) {
    if (!facets) return [];
    const arr = Object.keys(facets).map(k => ({ key:k, v:facets[k] }))
                                   .sort((a,b) => b.v - a.v).slice(0, 4);
    const labels = (window.SongTestData && window.SongTestData.FACET_LABELS) || {};
    return arr.map(o => labels[o.key] || o.key);
  }

  function vocalGenderFromPersona(persona) {
    // Heuristik: höhere Vocal-Register tendiert zu f, sehr tiefe/grit zu m.
    // Final immer im UI überschreibbar.
    const dna = persona && persona.music_dna;
    if (!dna || !dna.vocal) return 'f';
    const reg = dna.vocal.register;
    if (reg === 'high') return 'f';
    if (reg === 'low') return 'm';
    // Mid: leichter Bias über Empathie/Wärme
    const sf = persona.scales_final || {};
    if ((sf.BIG5_A || 50) >= 60) return 'f';
    return 'm';
  }

  // Anzahl Methoden → Bonus-Faktor 0..0.30
  function methodsBonusFactor(methodsCount) {
    if (!methodsCount) return 0;
    if (methodsCount <= 3) return 0.10;
    if (methodsCount <= 6) return 0.20;
    return 0.30;
  }

  // Themen-Tags aus den importierten Methoden-Daten
  function methodsToTags(methodsArr, maxTags) {
    if (!Array.isArray(methodsArr) || !methodsArr.length) return [];
    const pool = [];
    methodsArr.forEach(m => {
      if (!m || !Array.isArray(m.findings)) return;
      m.findings.slice(0, 3).forEach(f => {
        const s = String(f).trim();
        // Erste 5-7 Wörter als Tag, ohne Sonderzeichen
        const tag = s.split(/[\s,;.:!?]+/).slice(0, 4).join(' ').toLowerCase()
                     .replace(/[^a-zäöüß\s]/g, '').trim();
        if (tag.length >= 3 && tag.length <= 40) pool.push(tag);
      });
    });
    // Eindeutige Tags, max N
    const unique = Array.from(new Set(pool));
    return unique.slice(0, maxTags || 5);
  }

  /**
   * Baut die Style-Beschreibung für Suno mit transparenter 50:50-Logik.
   * Liefert { style, weights, tags } – weights ist die Erklärung fürs UI.
   */
  function buildStylePrompt(persona, opts) {
    opts = opts || {};
    const dna = (persona && persona.music_dna) || {};
    const sf = (persona && persona.scales_final) || {};
    const facets = (persona && persona.facets_final) || {};
    const astro = persona && persona.astrology;
    const methods = (persona && persona.imported_methods_count) || opts.methodsCount || 0;
    const intentMods = opts.intentModifiers || null;
    const trackSpec = opts.trackSpec || null;
    const analysisKeywords = opts.analysisKeywords || (intentMods && intentMods.analysisKeywords) || [];

    // ── PERSÖNLICHKEIT (50%) ─────────────────────────────────
    const O = sf.BIG5_O || 50, E = sf.BIG5_E || 50, A = sf.BIG5_A || 50,
          C = sf.BIG5_C || 50, N = sf.BIG5_N || 50;
    const persParts = [];

    // Genre-Grundlinie aus Profil
    const akustisch = (dna.instrumentation && dna.instrumentation.core || []).includes('felt_piano');
    const elektro = (dna.instrumentation && dna.instrumentation.core || []).includes('analog_keys');
    if (akustisch) persParts.push('intimate acoustic singer-songwriter');
    else if (elektro) persParts.push('introspective electronic indie pop');
    else persParts.push('hybrid acoustic-electronic');

    // Mood-Hauptachsen
    if (E >= 65) persParts.push('uplifting');
    else if (E <= 35) persParts.push('contemplative');
    if (N >= 60) persParts.push('emotionally vulnerable');
    else if (N <= 40) persParts.push('grounded');
    if (O >= 70) persParts.push('with unusual harmonic colors');

    // Music-DNA Hard-Locks (Intent kann Tempo/Energy überschreiben)
    const tempoBpm = (intentMods && intentMods.tempo) || dna.tempo_bpm || 90;
    persParts.push(tempoBpm + ' BPM');
    persParts.push((dna.key || 'C') + ' ' + (dna.mode || 'ionian'));
    if (dna.time_signature && dna.time_signature !== '4/4') persParts.push(dna.time_signature + ' time signature');

    if (intentMods && intentMods.genreHints && intentMods.genreHints.length) {
      persParts.unshift(intentMods.genreHints[0]);
    }
    if (intentMods && intentMods.moodWords && intentMods.moodWords.length) {
      persParts.push(intentMods.moodWords.slice(0, 3).join(' '));
    }
    const ident = persona && persona.audio_identity;
    const dnaPhase = persona && persona.music_dna && persona.music_dna.evolution_phase;
    if (ident) {
      if (ident.productionTags && ident.productionTags.length) {
        persParts.push(ident.productionTags.slice(0, 4).join(', '));
      }
      if (dnaPhase && dnaPhase.label) {
        persParts.push('development phase ' + dnaPhase.id.replace(/_/g, ' '));
      }
      if (ident.evolutionScore >= 5) persParts.push('growth arc in dynamics');
      if (ident.depthLevel >= 6) persParts.push('textural evolution');
    }
    if (persona && persona.music_dna && persona.music_dna.production_evolution_tags) {
      persParts.push(persona.music_dna.production_evolution_tags.slice(0, 2).join(', '));
    }
    if (persona && persona.music_dna && persona.music_dna.tension_curve) {
      persParts.push(persona.music_dna.tension_curve.replace(/_/g, ' '));
    }
    if (analysisKeywords.length) {
      persParts.push('emotional palette: ' + analysisKeywords.slice(0, 3).join(', '));
    }

    // Instrumente (Whitelist)
    const allInstr = []
      .concat((dna.instrumentation && dna.instrumentation.core) || [])
      .concat((dna.instrumentation && dna.instrumentation.color) || [])
      .slice(0, 5)
      .map(humanizeInstrument);
    if (allInstr.length) persParts.push(allInstr.join(', '));

    // Vocal
    if (dna.vocal) {
      const reg = dna.vocal.register || 'mid';
      const deli = (intentMods && intentMods.vocalDelivery) || dna.vocal.delivery || 'sung';
      persParts.push(reg + ' register ' + deli + ' vocals');
    }

    // Top-Facetten als Microexpression
    const facetTags = topFacetTags(facets);
    if (facetTags.length) persParts.push(facetTags.slice(0, 2).join(' ').toLowerCase());

    const personalityText = persParts.join(', ');

    // ── ASTROLOGIE (50%) ─────────────────────────────────────
    const astroParts = [];
    if (astro && astro.elementBalance) {
      const eb = astro.elementBalance;
      const total = (eb.fire||0)+(eb.earth||0)+(eb.air||0)+(eb.water||0);
      if (total > 0) {
        // Stärkstes Element bestimmt Hauptmodifier
        const sorted = ['fire','earth','air','water']
          .map(k => ({ k, share: (eb[k]||0)/total }))
          .sort((a,b) => b.share - a.share);
        const dom = sorted[0];
        if (dom.share >= 0.30 && ELEMENT_MODIFIERS[dom.k]) {
          astroParts.push.apply(astroParts, ELEMENT_MODIFIERS[dom.k].tags.slice(0, 2));
        }
        // Zweitstärkstes Element gibt Sekundär-Texture
        const sec = sorted[1];
        if (sec.share >= 0.25 && ELEMENT_MODIFIERS[sec.k]) {
          astroParts.push(ELEMENT_MODIFIERS[sec.k].tags[0]);
        }
      }
    }
    if (astro && astro.ascSign && ASC_VIBES[astro.ascSign]) {
      astroParts.push(ASC_VIBES[astro.ascSign]);
    }
    // Auffällige Aspekte → 1 Beimischung
    if (astro && Array.isArray(astro.aspects) && astro.aspects.length) {
      const sunMoon = astro.aspects.find(a =>
        (a.a === 'Sun' && a.b === 'Moon') || (a.a === 'Moon' && a.b === 'Sun'));
      if (sunMoon) {
        if (sunMoon.type === 'conjunction' || sunMoon.type === 'trine') astroParts.push('cohesive emotional through-line');
        else if (sunMoon.type === 'square' || sunMoon.type === 'opposition') astroParts.push('subtle tonal tension between bright and shadow tones');
      }
    }
    const astroText = astroParts.length
      ? 'atmospheric layer: ' + astroParts.slice(0, 4).join(', ')
      : '';

    // ── METHODEN-BONUS (0–30%) ───────────────────────────────
    const bonus = methodsBonusFactor(methods);
    const methodTagCount = Math.round(bonus * 16); // 0, 2, 3, 5 Tags
    const methodTags = methodsToTags(persona && persona.imported_methods, methodTagCount);
    const methodsText = methodTags.length
      ? 'lyrical themes from personal work: ' + methodTags.slice(0, 4).join(', ')
      : '';

    // ── FINAL ZUSAMMENSETZEN ─────────────────────────────────
    const parts = [personalityText];
    if (astroText) parts.push(astroText);
    if (methodsText) parts.push(methodsText);
    if (trackSpec && trackSpec.label) {
      parts.unshift('context: ' + trackSpec.label + ' playlist intent');
    }
    let style = parts.join(' | ').replace(/\s+/g, ' ').trim();
    if (style.length > 950) style = style.slice(0, 947) + '...';

    // Negative tags: was wir nie wollen
    const avoid = (dna.instrumentation && dna.instrumentation.avoid) || [];
    const negativeTags = avoid.map(humanizeInstrument).slice(0, 5).join(', ');

    // Gewichte für UI
    const weights = {
      personality: 0.50,
      astrology:   astro ? 0.50 : 0.00,
      methods:     bonus,
      methodsCount: methods,
      intent:      trackSpec ? (trackSpec.weights && trackSpec.weights.intent) || 0.35 : 0
    };
    // Wenn keine Astrologie: Persönlichkeit nimmt deren 50% mit (transparent)
    if (!astro) weights.personality = 1.0 - weights.methods;

    return {
      style, negativeTags, weights,
      personality_text: personalityText,
      astrology_text:   astroText,
      methods_text:     methodsText,
      intent_text:      trackSpec ? (trackSpec.rationale || trackSpec.label) : '',
      identity_text:    (persona && persona.music_dna && persona.music_dna.evolution_narrative) ||
                        (persona && persona.audio_identity && persona.audio_identity.evolutionNarrative) || '',
      tempo_bpm:        tempoBpm,
      instrumental:     intentMods ? !!intentMods.instrumental : false
    };
  }

  function humanizeInstrument(slug) {
    return String(slug).replace(/_/g, ' ');
  }

  /**
   * Lyrics in Suno-Form bringen: Section-Marker [Verse 1] [Chorus] usw.
   * + reine Textzeilen. Max 4500 Zeichen für V5_5.
   */
  function buildLyricsFromSong(song) {
    if (!song || !Array.isArray(song.sections)) return '';
    const out = [];
    song.sections.forEach(sec => {
      const label = (sec.label || sec.id || 'Section').toString();
      out.push('[' + label + ']');
      (sec.lines || []).forEach(line => {
        if (line && line.text) out.push(line.text);
      });
      out.push(''); // Leerzeile zwischen Sektionen
    });
    let txt = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    if (txt.length > 4500) txt = txt.slice(0, 4497) + '...';
    return txt;
  }

  /**
   * Komplette Engine-Request bauen
   */
  function buildEngineRequest(persona, song, opts) {
    opts = opts || {};
    const model = opts.model || 'V5_5';
    const title = (song && song.title) ? String(song.title).slice(0, 95) : 'Persönlichkeits-Song';
    const style = buildStylePrompt(persona, opts);
    const lyrics = buildLyricsFromSong(song);
    let vocalGender = opts.vocalGender || vocalGenderFromPersona(persona);
    if (vocalGender !== 'm' && vocalGender !== 'f') vocalGender = undefined;
    const useInstrumental = opts.instrumental != null ? opts.instrumental : style.instrumental;
    const hasLyrics = lyrics && lyrics.length >= 30;

    return {
      model,
      title: opts.titleOverride || title,
      prompt: lyrics,
      style: style.style,
      customMode: true,
      instrumental: useInstrumental || !hasLyrics,
      vocalGender: useInstrumental ? undefined : vocalGender,
      negativeTags: style.negativeTags || undefined,
      styleWeight: opts.styleWeight != null ? opts.styleWeight : 0.72,
      weirdnessConstraint: opts.weirdnessConstraint != null ? opts.weirdnessConstraint : 0.42,
      _weights: style.weights,
      _personality_text: style.personality_text,
      _astrology_text:   style.astrology_text,
      _methods_text:     style.methods_text,
      _intent_text:      style.intent_text,
      _tempo_bpm:        style.tempo_bpm,
      _intentId:         opts.intentId || null
    };
  }

  const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';

  function normalizeTrack(track) {
    if (!track || typeof track !== 'object') return track;
    return Object.assign({}, track, {
      audio_url: track.audio_url || track.audioUrl || track.source_audio_url || track.sourceAudioUrl,
      stream_audio_url: track.stream_audio_url || track.streamAudioUrl || track.source_stream_audio_url || track.sourceStreamAudioUrl,
      image_url: track.image_url || track.imageUrl || track.source_image_url || track.sourceImageUrl
    });
  }

  function normalizeTracks(tracks) {
    return (tracks || []).map(normalizeTrack);
  }

  function suno_errorMsg(code, msg) {
    const map = {
      400: 'Ungültige Parameter',
      401: 'Suno-API-Key ungültig oder nicht autorisiert',
      404: 'Endpunkt nicht gefunden',
      405: 'Rate-Limit überschritten – kurz warten',
      413: 'Prompt zu lang',
      429: 'Suno-Credits aufgebraucht – im Provider-Dashboard aufladen',
      430: 'Anfrage-Frequenz zu hoch – bitte einen Moment warten',
      455: 'Suno-System wartet, bitte später erneut'
    };
    return (map[code] || 'Suno-Fehler') + (msg ? ' – ' + msg : '') + ' (Code ' + code + ')';
  }

  // ────────────────────────────────────────────────────────────
  // Provider-Adapter: sunoapi.org (docs: https://docs.sunoapi.org)
  // ────────────────────────────────────────────────────────────
  const PROVIDERS = {
    sunoapi_org: {
      label: 'Suno (via sunoapi.org)',
      base: SUNO_API_BASE,
      async createTask(apiKey, payload) {
        const body = {
          model: payload.model,
          title: payload.title,
          prompt: payload.prompt,
          style: payload.style,
          customMode: payload.customMode,
          instrumental: payload.instrumental,
          callBackUrl: 'https://manuel-weiss.ch/api/suno-noop'
        };
        if (payload.vocalGender) body.vocalGender = payload.vocalGender;
        if (payload.negativeTags) body.negativeTags = payload.negativeTags;
        if (typeof payload.styleWeight === 'number') body.styleWeight = payload.styleWeight;
        if (typeof payload.weirdnessConstraint === 'number') body.weirdnessConstraint = payload.weirdnessConstraint;
        const res = await fetch(this.base + '/generate', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          throw new Error('Suno-Request fehlgeschlagen: HTTP ' + res.status +
            (data && data.msg ? ' – ' + data.msg : ''));
        }
        if (data.code !== 200) {
          throw new Error(suno_errorMsg(data.code, data.msg));
        }
        const taskId = data.data && data.data.taskId;
        if (!taskId) throw new Error('Suno hat keine taskId zurückgegeben.');
        return { taskId, raw: data };
      },
      async pollTask(apiKey, taskId) {
        const res = await fetch(this.base + '/generate/record-info?taskId=' + encodeURIComponent(taskId), {
          headers: { 'Authorization': 'Bearer ' + apiKey }
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) throw new Error('Suno-Status nicht abrufbar: HTTP ' + res.status);
        if (data.code !== 200) throw new Error(suno_errorMsg(data.code, data.msg));
        const d = data.data || {};
        const status = d.status || 'PENDING';
        const tracks = normalizeTracks((d.response && d.response.sunoData) || (d.response && d.response.data) || []);
        return { status, tracks, raw: d };
      }
    }
  };

  /**
   * Hochlevel-Funktion: Generiert einen Song und liefert per onUpdate Status-Events.
   * Pollt bis SUCCESS oder Timeout (5 min Default).
   *
   * onUpdate({ phase: 'submitting'|'polling'|'first_ready'|'success'|'error', status, tracks, error })
   */
  async function generateAudio(persona, song, opts, onUpdate) {
    opts = opts || {};
    onUpdate = onUpdate || (() => {});

    const apiKey = await getSunoApiKey();
    if (!apiKey) {
      throw new Error('Kein Suno-API-Key gefunden. Bitte im Admin-Panel unter „API Keys → Suno" speichern (gleicher Browser) – oder warte auf AWS-Sync, falls der Key nur in der Cloud liegt.');
    }

    const provider = PROVIDERS[opts.provider || 'sunoapi_org'];
    if (!provider) throw new Error('Unbekannter Provider: ' + opts.provider);

    const payload = buildEngineRequest(persona, song, opts);
    onUpdate({ phase: 'submitting', payload });

    const { taskId } = await provider.createTask(apiKey, payload);
    onUpdate({ phase: 'polling', taskId, weights: payload._weights, payload });

    const maxWaitMs = opts.maxWaitMs || 5 * 60 * 1000;
    const pollIntervalMs = opts.pollIntervalMs || 8000;
    const start = Date.now();
    let lastStatus = null, firstSeen = false;

    while (Date.now() - start < maxWaitMs) {
      await new Promise(r => setTimeout(r, pollIntervalMs));
      let st;
      try { st = await provider.pollTask(apiKey, taskId); }
      catch (err) {
        // Netzwerkfehler: weiter pollen, aber max 3x toleriert
        onUpdate({ phase: 'polling', status: lastStatus, soft_error: err.message });
        continue;
      }
      lastStatus = st.status;

      if ((st.status === 'FIRST_SUCCESS' || st.status === 'TEXT_SUCCESS') && !firstSeen && st.tracks && st.tracks.length) {
        firstSeen = true;
        onUpdate({ phase: 'first_ready', tracks: st.tracks, status: st.status });
      } else {
        onUpdate({ phase: 'polling', status: st.status, tracks: st.tracks });
      }

      if (st.status === 'SUCCESS') {
        onUpdate({ phase: 'success', tracks: st.tracks, status: st.status, taskId, weights: payload._weights });
        return { taskId, tracks: st.tracks, weights: payload._weights, payload };
      }
      if (/FAILED|ERROR/i.test(st.status || '')) {
        const errMsg = (st.raw && st.raw.errorMessage) || ('Generierung fehlgeschlagen (' + st.status + ')');
        onUpdate({ phase: 'error', error: errMsg, status: st.status });
        throw new Error(errMsg);
      }
    }
    onUpdate({ phase: 'error', error: 'Timeout: Generierung hat länger als ' + Math.round(maxWaitMs/1000) + 's gedauert.' });
    throw new Error('Suno-Generierung Timeout');
  }

  // ────────────────────────────────────────────────────────────
  // Public-API
  // ────────────────────────────────────────────────────────────
  window.SongMusicEngine = {
    buildEngineRequest,
    buildStylePrompt,
    buildLyricsFromSong,
    generateAudio,
    getSunoApiKey,
    invalidateSunoKeyCache,
    PROVIDERS,
    ELEMENT_MODIFIERS,
    ASC_VIBES
  };
})();
