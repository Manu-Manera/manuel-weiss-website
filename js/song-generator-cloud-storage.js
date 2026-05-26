/**
 * Persönlichkeits-Song Generator – Cloud-Speicher (AWS user-data/workflows)
 * Versionierte Snapshots im Benutzerprofil (DynamoDB via /user-data/workflows/…)
 */
(function () {
  'use strict';

  const WF_NAME = 'personalitySongGenerator';
  const MAX_VERSIONS = 25;
  const DEBOUNCE_MS = 1800;

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
      facets: state.facets,
      astrology: state.astrology,
      userMeta: state.userMeta,
      importedNarrative: state.importedNarrative || ''
    };
  }

  function applySnapshotToState(state, snap) {
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
    if (snap.audio !== undefined) state.audio = snap.audio;
    if (snap.facets) state.facets = snap.facets;
    if (snap.astrology) state.astrology = snap.astrology;
    if (snap.userMeta) state.userMeta = Object.assign({}, state.userMeta || {}, snap.userMeta);
    if (typeof snap.importedNarrative === 'string') state.importedNarrative = snap.importedNarrative;
    if (typeof snap.step === 'number') state.step = snap.step;
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

    applySnapshotToState: applySnapshotToState
  };

  window.SongGeneratorCloud = Cloud;
})();
