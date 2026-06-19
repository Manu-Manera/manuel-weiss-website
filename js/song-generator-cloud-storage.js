/**
 * Persönlichkeits-Song Generator – Cloud-Speicher (AWS user-data/workflows)
 * Versionierte Snapshots im Benutzerprofil (DynamoDB via /user-data/workflows/…)
 */
(function () {
  'use strict';

  const WF_NAME = 'personalitySongGenerator';
  const FAVORITES_STEP = 'favoritesPlaylist';
  const VOICE_PROFILE_STEP = 'voiceProfile';
  const VOICE_WIZARD_STEP = 'voiceWizard';
  const MAX_VERSIONS = 25;
  const MAX_LIBRARY_ENTRIES = 40;
  const DEBOUNCE_MS = 1800;

  function unwrapStepData(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) &&
        !raw.items && !raw.favorites && !raw.entries) {
      return raw.data;
    }
    return raw;
  }

  function getUserDataBase() {
    try {
      if (window.getApiUrl && window.AWS_APP_CONFIG?.ENDPOINTS?.USER_DATA) {
        return window.getApiUrl('USER_DATA');
      }
    } catch (_e) {}
    const b = window.AWS_APP_CONFIG?.API_BASE;
    if (!b) return null;
    return (b.endsWith('/') ? b.slice(0, -1) : b) + '/user-data';
  }

  function isLoggedIn() {
    try {
      if (window.awsAuth?.isLoggedIn?.()) return true;
      if (window.realUserAuth?.isLoggedIn?.()) return true;
    } catch (_e) {}
    const session = localStorage.getItem('aws_auth_session');
    if (session) {
      try { return !!JSON.parse(session).idToken; } catch (_e) {}
    }
    return false;
  }

  async function getAuthToken() {
    if (window.awsAuth?.isLoggedIn?.()) {
      const u = window.awsAuth.getCurrentUser();
      if (u?.idToken) return u.idToken;
    }
    if (window.realUserAuth?.isLoggedIn?.()) {
      const u = window.realUserAuth.getCurrentUser();
      if (u?.idToken) return u.idToken;
    }
    const session = localStorage.getItem('aws_auth_session');
    if (session) {
      const p = JSON.parse(session);
      if (p.idToken) return p.idToken;
    }
    throw new Error('Nicht angemeldet');
  }

  function newVersionId() {
    return 'sg-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function milestoneLabel(m) {
    const map = {
      draft: 'Entwurf',
      test_done: 'Test abgeschlossen',
      persona: 'Profil erstellt',
      song: 'Song komponiert',
      audio: 'Audio produziert'
    };
    return map[m] || 'Snapshot';
  }

  function buildSnapshot(state) {
    if (!state) return null;
    const audio = state.audio;
    const slimAudio = audio ? {
      tracks: (audio.tracks || []).map(function (t) {
        return {
          title: t.title,
          duration: t.duration,
          audio_url: t.audio_url || t.audioUrl,
          stream_audio_url: t.stream_audio_url || t.streamAudioUrl,
          image_url: t.image_url || t.imageUrl
        };
      }),
      taskId: audio.taskId,
      model: audio.model,
      provider: audio.provider,
      generatedAt: audio.generatedAt,
      weights: audio.weights
    } : null;

    const playlist = state.playlist;
    const slimPlaylist = playlist && Array.isArray(playlist.tracks) ? {
      tracks: playlist.tracks.map(function (t) {
        return {
          intentId: t.intentId,
          label: t.label,
          emoji: t.emoji,
          title: t.title,
          url: t.url,
          cover: t.cover,
          duration: t.duration,
          status: t.status,
          error: t.error
        };
      }),
      generatedAt: playlist.generatedAt,
      model: playlist.model,
      partial: playlist.partial
    } : null;

    return {
      step: state.step,
      testVariant: state.testVariant,
      test: {
        questions: state.questions,
        answers: state.answers || {}
      },
      birthData: state.birthData,
      externalInputs: state.externalInputs || [],
      persona: state.persona,
      song: state.song,
      audio: slimAudio,
      playlist: slimPlaylist,
      facets: state.facets,
      astrology: state.astrology,
      userMeta: state.userMeta,
      importedNarrative: state.importedNarrative || '',
      favorites: Array.isArray(state.favorites)
        ? (window.SongFavorites
          ? window.SongFavorites.sanitizeList(state.favorites)
          : state.favorites.slice(0, 50))
        : [],
      voiceProfile: state.voiceProfile || null,
      voiceWizard: state.voiceWizard || null,
      useCustomVoice: !!state.useCustomVoice,
      audioStylePrefs: state.audioStylePrefs || null
    };
  }

  function normalizeVoiceProfile(profile) {
    if (!profile || typeof profile !== 'object') return null;
    var voiceId = profile.voiceId || profile.personaId || null;
    return {
      voiceId: voiceId,
      voiceName: profile.voiceName || 'Meine Stimme',
      validateTaskId: profile.validateTaskId || null,
      voiceUrl: profile.voiceUrl || null,
      verifyUrl: profile.verifyUrl || null,
      validateInfo: profile.validateInfo || null,
      vocalStartS: profile.vocalStartS != null ? profile.vocalStartS : 0,
      vocalEndS: profile.vocalEndS != null ? profile.vocalEndS : 10,
      personaId: profile.personaId || voiceId || null,
      personaModel: profile.personaModel || (voiceId ? 'voice_persona' : null),
      status: profile.status || (voiceId ? 'ready' : null),
      createdAt: profile.createdAt || null,
      updatedAt: profile.updatedAt || null
    };
  }

  function normalizeVoiceWizard(wizard) {
    if (!wizard || typeof wizard !== 'object') return { phase: 'idle' };
    return {
      phase: wizard.phase || 'idle',
      label: wizard.label || null,
      validateTaskId: wizard.validateTaskId || null,
      validateInfo: wizard.validateInfo || null,
      voiceUrl: wizard.voiceUrl || null,
      vocalStartS: wizard.vocalStartS != null ? wizard.vocalStartS : 0,
      vocalEndS: wizard.vocalEndS != null ? wizard.vocalEndS : 10,
      updatedAt: wizard.updatedAt || null
    };
  }

  function profileTimestamp(profile) {
    if (!profile) return '';
    return String(profile.updatedAt || profile.createdAt || '');
  }

  function mergeVoiceProfiles(primary, secondary) {
    var a = normalizeVoiceProfile(primary);
    var b = normalizeVoiceProfile(secondary);
    if (!a && !b) return null;
    if (!a) return b;
    if (!b) return a;
    if (a.voiceId && !b.voiceId) return a;
    if (b.voiceId && !a.voiceId) return b;
    if (a.voiceId && b.voiceId) {
      return profileTimestamp(b) >= profileTimestamp(a)
        ? Object.assign({}, a, b)
        : Object.assign({}, b, a);
    }
    return Object.assign({}, a, b);
  }

  function mergeVoiceWizard(primary, secondary) {
    var a = normalizeVoiceWizard(primary);
    var b = normalizeVoiceWizard(secondary);
    if (a.phase === 'idle' && b.phase !== 'idle') return b;
    if (b.phase === 'idle' && a.phase !== 'idle') return a;
    if (a.phase === 'need_verification' || b.phase === 'need_verification') {
      var pick = profileTimestamp(b) >= profileTimestamp(a) ? b : a;
      if (pick.phase === 'need_verification') return pick;
    }
    return profileTimestamp(b) >= profileTimestamp(a) ? b : a;
  }

  function mergeFavoritesIntoLibrary(library, favorites) {
    library = library || { entries: [] };
    if (!Array.isArray(library.entries)) library.entries = [];
    if (window.SongFavorites) {
      library.favorites = window.SongFavorites.mergeLists(library.favorites, favorites || []);
    } else if (Array.isArray(favorites) && favorites.length) {
      library.favorites = favorites.slice();
    } else if (!Array.isArray(library.favorites)) {
      library.favorites = [];
    }
    return library;
  }

  function hasPlayableTracks(media) {
    if (!media || !Array.isArray(media.tracks)) return false;
    return media.tracks.some(function (t) {
      return t && (t.status === 'ok' || t.url || t.audio_url || t.audioUrl ||
        t.stream_audio_url || t.streamAudioUrl);
    });
  }

  /** Beim Cloud-Laden: neuere/lokalere Playlist/Audio nicht mit leerem Snapshot überschreiben */
  function pickNewerMedia(cloudVal, localVal) {
    if (!localVal || !hasPlayableTracks(localVal)) return cloudVal;
    if (!cloudVal || !hasPlayableTracks(cloudVal)) return localVal;
    const localAt = localVal.generatedAt || '';
    const cloudAt = cloudVal.generatedAt || '';
    if (localAt && cloudAt) return localAt >= cloudAt ? localVal : cloudVal;
    const localOk = localVal.tracks.filter(function (t) { return t && t.status === 'ok'; }).length;
    const cloudOk = cloudVal.tracks.filter(function (t) { return t && t.status === 'ok'; }).length;
    if (localOk > cloudOk) return localVal;
    return cloudVal;
  }

  function applySnapshotToState(state, snap, localMerge) {
    if (!snap || !state) return false;
    if (snap.testVariant) state.testVariant = snap.testVariant;
    if (snap.test) {
      if (snap.test.questions) state.questions = snap.test.questions;
      if (snap.test.answers) state.answers = snap.test.answers;
    }
    if (snap.birthData !== undefined) state.birthData = snap.birthData;
    if (snap.externalInputs) state.externalInputs = snap.externalInputs;
    if (snap.persona) state.persona = snap.persona;
    if (snap.song) state.song = snap.song;
    if (snap.audio !== undefined) {
      state.audio = (localMerge && localMerge.audio != null)
        ? pickNewerMedia(snap.audio, localMerge.audio)
        : snap.audio;
    }
    if (snap.playlist !== undefined) {
      state.playlist = (localMerge && localMerge.playlist != null)
        ? pickNewerMedia(snap.playlist, localMerge.playlist)
        : snap.playlist;
    }
    if (snap.facets) state.facets = snap.facets;
    if (snap.astrology) state.astrology = snap.astrology;
    if (snap.userMeta) state.userMeta = Object.assign({}, state.userMeta || {}, snap.userMeta);
    if (typeof snap.importedNarrative === 'string') state.importedNarrative = snap.importedNarrative;
    if (typeof snap.step === 'number') state.step = snap.step;
    if (Array.isArray(snap.favorites)) {
      if (window.SongFavorites) {
        /* snap = Cloud, state.favorites = lokal – localList hat Vorrang */
        state.favorites = window.SongFavorites.mergeLists(snap.favorites, state.favorites);
      } else {
        state.favorites = snap.favorites.slice();
      }
    } else if (window.SongFavorites && Array.isArray(state.favorites)) {
      state.favorites = window.SongFavorites.sanitizeList(state.favorites);
    }
    if (snap.voiceProfile) {
      state.voiceProfile = mergeVoiceProfiles(state.voiceProfile, snap.voiceProfile);
    }
    if (snap.voiceWizard) {
      state.voiceWizard = mergeVoiceWizard(state.voiceWizard, snap.voiceWizard);
    }
    if (typeof snap.useCustomVoice === 'boolean') {
      state.useCustomVoice = snap.useCustomVoice;
    }
    if (snap.audioStylePrefs && typeof snap.audioStylePrefs === 'object') {
      state.audioStylePrefs = Object.assign({}, state.audioStylePrefs || {}, snap.audioStylePrefs);
    }
    return true;
  }

  async function fetchStore(token) {
    const base = getUserDataBase();
    if (!base) return null;
    const url = base + '/workflows/' + WF_NAME + '/results';
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (res.status === 401) throw new Error('auth');
    if (!res.ok) return null;
    const raw = await res.json();
    if (!raw || typeof raw !== 'object') return null;
    if (Array.isArray(raw.versions)) return raw;
    return { currentVersionId: null, versions: [], updatedAt: null };
  }

  async function writeStore(token, store) {
    const base = getUserDataBase();
    if (!base) throw new Error('Kein API-Endpunkt');
    const url = base + '/workflows/' + WF_NAME + '/results';
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(store)
    });
    if (res.status === 401) throw new Error('auth');
    if (!res.ok) throw new Error('HTTP ' + res.status);
  }

  async function writeProgress(token, progress) {
    const base = getUserDataBase();
    if (!base) return;
    const url = base + '/workflows/' + WF_NAME + '/progress';
    await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(progress)
    }).catch(function () {});
  }

  async function fetchWorkflowStep(stepName, token) {
    const base = getUserDataBase();
    if (!base) return null;
    const url = base + '/workflows/' + WF_NAME + '/steps/' + stepName;
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (res.status === 401) throw new Error('auth');
    if (!res.ok) return null;
    const data = unwrapStepData(await res.json());
    return data && typeof data === 'object' ? data : null;
  }

  function favoritesFromStepData(data) {
    if (!data || typeof data !== 'object') return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.favorites)) return data.favorites;
    return [];
  }

  async function loadFavoritesStep() {
    if (!isLoggedIn()) return [];
    try {
      const token = await getAuthToken();
      const data = await fetchWorkflowStep(FAVORITES_STEP, token);
      return favoritesFromStepData(data);
    } catch (err) {
      console.warn('[SongGeneratorCloud] loadFavoritesStep:', err.message);
      return [];
    }
  }

  async function saveFavoritesStep(favorites) {
    if (!isLoggedIn()) return null;
    const token = await getAuthToken();
    const items = Array.isArray(favorites) ? favorites : [];
    const body = {
      items: items,
      updatedAt: new Date().toISOString()
    };
    await writeWorkflowStep(FAVORITES_STEP, body, token);
    return body;
  }

  async function loadAndMergeFavorites(stateFavorites, localFavorites) {
    var merged = [];
    if (window.SongFavorites) {
      merged = window.SongFavorites.mergeLists(stateFavorites || [], localFavorites || []);
    } else if (Array.isArray(localFavorites) && localFavorites.length) {
      merged = localFavorites.slice();
    } else if (Array.isArray(stateFavorites)) {
      merged = stateFavorites.slice();
    }
    if (!isLoggedIn() || !window.SongFavorites) return merged;
    try {
      merged = window.SongFavorites.mergeLists(await loadFavoritesStep(), merged);
    } catch (_e) {}
    try {
      const library = await loadAudioLibrary();
      merged = window.SongFavorites.mergeLists(library.favorites, merged);
    } catch (_e) {}
    return window.SongFavorites.sanitizeList(merged);
  }

  async function writeWorkflowStep(stepName, body, token) {
    const base = getUserDataBase();
    if (!base) throw new Error('Kein API-Endpunkt');
    const url = base + '/workflows/' + WF_NAME + '/steps/' + stepName;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (res.status === 401) throw new Error('auth');
    if (!res.ok) throw new Error('HTTP ' + res.status);
  }

  async function loadAudioLibrary() {
    if (!isLoggedIn()) return { entries: [], identity: null, favorites: [], updatedAt: null };
    try {
      const token = await getAuthToken();
      const data = await fetchWorkflowStep('audioLibrary', token);
      if (!data || !Array.isArray(data.entries)) {
        return {
          entries: [],
          identity: data && data.identity || null,
          favorites: (data && data.favorites) || [],
          updatedAt: null
        };
      }
      if (!Array.isArray(data.favorites)) data.favorites = [];
      return data;
    } catch (err) {
      console.warn('[SongGeneratorCloud] loadAudioLibrary:', err.message);
      return { entries: [], identity: null, favorites: [], updatedAt: null };
    }
  }

  async function persistFavoritesList(favorites) {
    if (!isLoggedIn()) return null;
    const items = Array.isArray(favorites) ? favorites : [];
    await saveFavoritesStep(items);
    const token = await getAuthToken();
    let library = await loadAudioLibrary();
    library = mergeFavoritesIntoLibrary(library, items);
    library.updatedAt = new Date().toISOString();
    await writeWorkflowStep('audioLibrary', library, token);
    return { items: items, library: library };
  }

  async function toggleFavorite(state, trackMeta) {
    if (!window.SongFavorites) return null;
    const norm = window.SongFavorites.normalize(trackMeta);
    if (!norm) return null;
    const result = window.SongFavorites.toggle(state && state.favorites ? state.favorites : [], norm);
    if (state) state.favorites = result.favorites;
    if (!isLoggedIn()) return result;
    try {
      const token = await getAuthToken();
      await saveFavoritesStep(result.favorites);
      let library = await loadAudioLibrary();
      library = mergeFavoritesIntoLibrary(library, result.favorites);
      library.updatedAt = new Date().toISOString();
      await writeWorkflowStep('audioLibrary', library, token);
      if (state) state.audioLibrary = library;
      return result;
    } catch (err) {
      console.warn('[SongGeneratorCloud] toggleFavorite:', err.message);
      return result;
    }
  }

  async function reorderFavorites(state, fromIndex, toIndex) {
    if (!isLoggedIn() || !window.SongFavorites) return null;
    try {
      let library = await loadAudioLibrary();
      const base = window.SongFavorites.mergeLists(
        library.favorites || [],
        state && state.favorites ? state.favorites : []
      );
      const next = window.SongFavorites.reorder(base, fromIndex, toIndex);
      library.favorites = next;
      library.updatedAt = new Date().toISOString();
      const token = await getAuthToken();
      await saveFavoritesStep(next);
      await writeWorkflowStep('audioLibrary', library, token);
      if (state) {
        state.favorites = next;
        state.audioLibrary = library;
      }
      return { favorites: next, library: library };
    } catch (err) {
      console.warn('[SongGeneratorCloud] reorderFavorites:', err.message);
      return null;
    }
  }

  async function recomputeAudioIdentity(state, store, library) {
    if (!window.SongAudioIdentity) return null;
    store = store || await (async function () {
      if (!isLoggedIn()) return { versions: [] };
      const token = await getAuthToken();
      return (await fetchStore(token)) || { versions: [] };
    })();
    library = library || await loadAudioLibrary();
    return window.SongAudioIdentity.computeAudioIdentity({
      versions: store.versions || [],
      audioLibrary: library,
      currentPersona: state && state.persona
    });
  }

  async function persistAudioLibrary(state, identity) {
    if (!isLoggedIn()) return null;
    const token = await getAuthToken();
    let library = await loadAudioLibrary();
    if (!library.entries) library.entries = [];
    library = mergeFavoritesIntoLibrary(library, state && state.favorites || []);
    library.identity = identity;
    library.updatedAt = new Date().toISOString();
    await writeWorkflowStep('audioLibrary', library, token);
    return library;
  }

  async function saveAudioToLibrary(state, type, meta) {
    meta = meta || {};
    if (!isLoggedIn() || !window.SongAudioIdentity) return null;
    try {
      const token = await getAuthToken();
      const store = (await fetchStore(token)) || { versions: [] };
      let library = await loadAudioLibrary();
      if (!library.entries) library.entries = [];

      const identity = window.SongAudioIdentity.computeAudioIdentity({
        versions: store.versions || [],
        audioLibrary: library,
        currentPersona: state.persona
      });

      const entry = window.SongAudioIdentity.buildLibraryEntry(state, type, identity, meta);
      if (!entry.tracks || !entry.tracks.length) return null;

      library.entries.unshift(entry);
      while (library.entries.length > MAX_LIBRARY_ENTRIES) {
        library.entries.pop();
      }
      library = mergeFavoritesIntoLibrary(library, state.favorites || []);
      library.identity = identity;
      library.updatedAt = new Date().toISOString();
      await writeWorkflowStep('audioLibrary', library, token);

      if (state.persona && window.SongAudioIdentity.enrichPersona) {
        state.persona = window.SongAudioIdentity.enrichPersona(state.persona, identity);
        state.audioIdentity = identity;
      }

      return { library: library, entry: entry, identity: identity };
    } catch (err) {
      console.warn('[SongGeneratorCloud] saveAudioToLibrary:', err.message);
      return null;
    }
  }

  async function syncAudioIdentity(state) {
    if (!isLoggedIn() || !window.SongAudioIdentity) return null;
    try {
      const token = await getAuthToken();
      const store = (await fetchStore(token)) || { versions: [] };
      const library = await loadAudioLibrary();
      const identity = window.SongAudioIdentity.computeAudioIdentity({
        versions: store.versions || [],
        audioLibrary: library,
        currentPersona: state.persona
      });
      state.audioLibrary = library;
      state.audioIdentity = identity;
      if (window.SongFavorites) {
        var stepFav = await loadFavoritesStep();
        var prevFav = window.SongFavorites.sanitizeList(state.favorites || []);
        var mergedFav = window.SongFavorites.mergeLists(
          window.SongFavorites.mergeLists(library.favorites, stepFav),
          prevFav
        );
        mergedFav = window.SongFavorites.sanitizeList(mergedFav);
        if (!mergedFav.length && prevFav.length) {
          mergedFav = prevFav;
        }
        state.favorites = mergedFav;
        if (mergedFav.length) {
          if (JSON.stringify(mergedFav) !== JSON.stringify(library.favorites || [])) {
            library.favorites = mergedFav;
            library.updatedAt = new Date().toISOString();
            await writeWorkflowStep('audioLibrary', library, token);
          }
          await saveFavoritesStep(mergedFav);
          if (window.SongFavorites.backupToSession) {
            window.SongFavorites.backupToSession(mergedFav);
          }
        }
      } else if (Array.isArray(library.favorites) && library.favorites.length) {
        state.favorites = library.favorites;
      }
      if (state.persona) {
        state.persona = window.SongAudioIdentity.enrichPersona(state.persona, identity);
      }
      if (library.identity && JSON.stringify(library.identity) !== JSON.stringify(identity)) {
        library.identity = identity;
        await writeWorkflowStep('audioLibrary', library, token);
      }
      return identity;
    } catch (err) {
      console.warn('[SongGeneratorCloud] syncAudioIdentity:', err.message);
      return null;
    }
  }

  async function loadVoiceProfile() {
    if (!isLoggedIn()) return null;
    try {
      const token = await getAuthToken();
      const data = await fetchWorkflowStep(VOICE_PROFILE_STEP, token);
      return normalizeVoiceProfile(data);
    } catch (err) {
      console.warn('[SongGeneratorCloud] loadVoiceProfile:', err.message);
      return null;
    }
  }

  async function loadVoiceWizard() {
    if (!isLoggedIn()) return { phase: 'idle' };
    try {
      const token = await getAuthToken();
      const data = await fetchWorkflowStep(VOICE_WIZARD_STEP, token);
      return normalizeVoiceWizard(data);
    } catch (err) {
      console.warn('[SongGeneratorCloud] loadVoiceWizard:', err.message);
      return { phase: 'idle' };
    }
  }

  async function saveVoiceWizard(wizard) {
    if (!isLoggedIn()) return null;
    const token = await getAuthToken();
    wizard = normalizeVoiceWizard(wizard || { phase: 'idle' });
    wizard.updatedAt = new Date().toISOString();
    await writeWorkflowStep(VOICE_WIZARD_STEP, wizard, token);
    return wizard;
  }

  async function saveVoiceProfile(state, profile) {
    if (!isLoggedIn()) return null;
    try {
      const token = await getAuthToken();
      profile = normalizeVoiceProfile(profile || {});
      if (!profile) return null;
      profile.updatedAt = new Date().toISOString();
      if (!profile.createdAt) profile.createdAt = profile.updatedAt;
      if (profile.voiceId) {
        profile.status = 'ready';
        profile.personaId = profile.voiceId;
        profile.personaModel = 'voice_persona';
      }
      await writeWorkflowStep(VOICE_PROFILE_STEP, profile, token);
      if (state) state.voiceProfile = profile;
      if (profile.voiceId) {
        await saveVoiceWizard({ phase: 'idle', updatedAt: profile.updatedAt });
      }
      return profile;
    } catch (err) {
      console.warn('[SongGeneratorCloud] saveVoiceProfile:', err.message);
      return null;
    }
  }

  async function loadAndMergeVoiceState(stateProfile, stateWizard, localProfile, localWizard) {
    var profile = mergeVoiceProfiles(stateProfile, localProfile);
    var wizard = mergeVoiceWizard(stateWizard, localWizard);
    if (!isLoggedIn()) {
      return { profile: profile, wizard: wizard };
    }
    try {
      profile = mergeVoiceProfiles(await loadVoiceProfile(), profile);
    } catch (_e) {}
    try {
      wizard = mergeVoiceWizard(await loadVoiceWizard(), wizard);
    } catch (_e) {}
    if (profile && profile.voiceId) {
      wizard = { phase: 'idle' };
    } else if (wizard.phase === 'need_verification' && !wizard.validateTaskId) {
      wizard = { phase: 'idle' };
    }
    return { profile: profile, wizard: wizard };
  }

  async function persistVoiceState(state, opts) {
    opts = opts || {};
    if (!isLoggedIn()) return null;
    var result = {};
    if (opts.wizard !== undefined) {
      result.wizard = await saveVoiceWizard(opts.wizard);
      if (state) state.voiceWizard = result.wizard;
    }
    if (opts.profile) {
      result.profile = await saveVoiceProfile(state, opts.profile);
    }
    return result;
  }

  const Cloud = {
    _debounce: null,
    _pendingMilestone: 'draft',
    _loadedOnce: false,

    isLoggedIn: isLoggedIn,

    getVersions(store) {
      return (store && store.versions) ? store.versions.slice().reverse() : [];
    },

    async loadLatest() {
      if (!isLoggedIn()) return null;
      try {
        const token = await getAuthToken();
        const store = await fetchStore(token);
        if (!store || !store.versions || !store.versions.length) return null;
        let current = store.versions.find(function (v) { return v.id === store.currentVersionId; });
        if (!current) {
          current = store.versions.slice().sort(function (a, b) {
            return String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt));
          })[0];
        }
        this._loadedOnce = true;
        return { store: store, version: current, snapshot: current && current.snapshot };
      } catch (err) {
        console.warn('[SongGeneratorCloud] loadLatest:', err.message);
        return null;
      }
    },

    async saveSnapshot(state, milestone, opts) {
      opts = opts || {};
      if (!isLoggedIn()) return null;
      const snap = buildSnapshot(state);
      if (!snap) return null;

      try {
        const token = await getAuthToken();
        let store = await fetchStore(token);
        if (!store || !Array.isArray(store.versions)) {
          store = { currentVersionId: null, versions: [], updatedAt: null };
        }

        const now = new Date().toISOString();
        const ms = milestone || 'draft';
        let version = null;

        if (opts.updateCurrent && store.currentVersionId) {
          version = store.versions.find(function (v) { return v.id === store.currentVersionId; });
        }

        if (!version || opts.forceNewVersion) {
          const n = store.versions.length + 1;
          version = {
            id: newVersionId(),
            createdAt: now,
            updatedAt: now,
            label: milestoneLabel(ms) + ' #' + n,
            milestone: ms,
            snapshot: snap
          };
          store.versions.push(version);
          store.currentVersionId = version.id;
        } else {
          version.snapshot = snap;
          version.updatedAt = now;
          if (ms !== 'draft') {
            version.milestone = ms;
            version.label = milestoneLabel(ms) + ' (aktualisiert)';
          }
        }

        while (store.versions.length > MAX_VERSIONS) {
          const removed = store.versions.shift();
          if (removed && removed.id === store.currentVersionId && store.versions.length) {
            store.currentVersionId = store.versions[store.versions.length - 1].id;
          }
        }

        store.updatedAt = now;
        await writeStore(token, store);
        await writeProgress(token, {
          currentStep: state.step,
          currentVersionId: store.currentVersionId,
          versionCount: store.versions.length,
          updatedAt: now
        });

        return { store: store, version: version };
      } catch (err) {
        console.warn('[SongGeneratorCloud] saveSnapshot:', err.message);
        return null;
      }
    },

    scheduleSave(state, milestone, opts) {
      if (!isLoggedIn()) return;
      this._pendingMilestone = milestone || this._pendingMilestone || 'draft';
      const self = this;
      const ms = this._pendingMilestone;
      if (this._debounce) clearTimeout(this._debounce);
      this._debounce = setTimeout(function () {
        self._debounce = null;
        self.saveSnapshot(state, ms, opts || { updateCurrent: ms === 'draft' });
      }, DEBOUNCE_MS);
    },

    applySnapshotToState: applySnapshotToState,
    loadAudioLibrary: loadAudioLibrary,
    saveAudioToLibrary: saveAudioToLibrary,
    syncAudioIdentity: syncAudioIdentity,
    recomputeAudioIdentity: recomputeAudioIdentity,
    toggleFavorite: toggleFavorite,
    reorderFavorites: reorderFavorites,
    persistFavoritesList: persistFavoritesList,
    loadFavoritesStep: loadFavoritesStep,
    saveFavoritesStep: saveFavoritesStep,
    loadAndMergeFavorites: loadAndMergeFavorites,
    loadVoiceProfile: loadVoiceProfile,
    loadVoiceWizard: loadVoiceWizard,
    saveVoiceProfile: saveVoiceProfile,
    saveVoiceWizard: saveVoiceWizard,
    loadAndMergeVoiceState: loadAndMergeVoiceState,
    persistVoiceState: persistVoiceState
  };

  window.SongGeneratorCloud = Cloud;
})();
