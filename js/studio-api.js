/**
 * Studio-API – Suno-Adapter für das Musik-Studio (sunoapi.org)
 *
 * Deckt alle Bearbeitungs-Endpunkte ab (Pfade gegen die OpenAPI-Spec
 * docs.sunoapi.org/suno-api/suno-api.json verifiziert):
 *
 *  - POST /generate/replace-section   Abschnitt 6–60 s ersetzen
 *  - POST /generate/extend            Song verlängern (audioId)
 *  - POST /generate/upload-extend     Song verlängern (beliebige Audio-URL)
 *  - POST /generate/upload-cover      Cover/Umstylen (beliebige Audio-URL)
 *  - POST /generate/add-vocals        Gesang auf Instrumental legen
 *  - POST /generate/add-instrumental  Begleitung unter Gesang legen
 *  - POST /vocal-removal/generate     Stem-Trennung (2 / 12 / gezielt)
 *  - POST /generate/get-timestamped-lyrics   wortgenaue Zeitstempel
 *  - POST /wav/generate               WAV-Konvertierung
 *  - GET  /generate/credit            Credits-Stand
 *
 * API-Key kommt über window.SongMusicEngine.getSunoApiKey() (Admin-Panel / AWS).
 */
(function () {
  'use strict';

  const BASE = 'https://api.sunoapi.org/api/v1';
  const NOOP_CALLBACK = 'https://manuel-weiss.ch/api/suno-noop';

  const ERROR_MAP = {
    400: 'Ungültige Parameter',
    401: 'Suno-API-Key ungültig oder nicht autorisiert',
    402: 'Suno-Credits aufgebraucht – im Provider-Dashboard aufladen',
    404: 'Endpunkt nicht gefunden',
    405: 'Rate-Limit überschritten – kurz warten',
    409: 'Ergebnis existiert bereits',
    413: 'Prompt zu lang',
    422: 'Parameter-Validierung fehlgeschlagen',
    429: 'Suno-Credits aufgebraucht oder Rate-Limit – im Provider-Dashboard prüfen',
    430: 'Anfrage-Frequenz zu hoch – bitte einen Moment warten',
    455: 'Suno-System wartet, bitte später erneut',
    451: 'Datei-Download nicht erlaubt (Zugriffsbeschränkung der Quelle)',
    500: 'Suno-Serverfehler'
  };

  function sunoError(code, msg) {
    return new Error((ERROR_MAP[code] || 'Suno-Fehler') + (msg ? ' – ' + msg : '') + ' (Code ' + code + ')');
  }

  async function getKey() {
    if (!window.SongMusicEngine || !window.SongMusicEngine.getSunoApiKey) {
      throw new Error('SongMusicEngine nicht geladen – Suno-Key nicht abrufbar.');
    }
    const key = await window.SongMusicEngine.getSunoApiKey();
    if (!key) {
      throw new Error('Kein Suno-API-Key gefunden. Bitte im Admin-Panel unter „API Keys → Suno" hinterlegen.');
    }
    return key;
  }

  async function request(method, path, body) {
    const key = await getKey();
    const opts = {
      method: method,
      headers: { 'Authorization': 'Bearer ' + key }
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(BASE + path, opts);
    const data = await res.json().catch(function () { return null; });
    if (!res.ok || !data) {
      throw new Error('Suno-Request fehlgeschlagen: HTTP ' + res.status +
        (data && data.msg ? ' – ' + data.msg : ''));
    }
    if (data.code !== 200) throw sunoError(data.code, data.msg);
    return data.data;
  }

  function post(path, body) { return request('POST', path, body); }
  function get(path) { return request('GET', path); }

  // ────────────────────────────────────────────────────────────
  // Polling – generisch für alle record-info-Endpunkte
  // ────────────────────────────────────────────────────────────

  /**
   * pollUntilDone(fetchStatus, opts)
   *  fetchStatus() → { done, failed, error, result }
   *  opts: { intervalMs, maxWaitMs, onTick(info), isCancelled() }
   * Rückgabe: result | null (bei Abbruch); Throw bei Fehler/Timeout.
   */
  async function pollUntilDone(fetchStatus, opts) {
    opts = opts || {};
    const intervalMs = opts.intervalMs || 8000;
    const maxWaitMs = opts.maxWaitMs || 8 * 60 * 1000;
    const onTick = opts.onTick || function () {};
    const isCancelled = opts.isCancelled || function () { return false; };
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
      await new Promise(function (r) { setTimeout(r, intervalMs); });
      if (isCancelled()) return null;
      let st;
      try {
        st = await fetchStatus();
      } catch (err) {
        // transienter Fehler → weiterpollen, aber melden
        onTick({ transient: true, error: err.message });
        continue;
      }
      if (isCancelled()) return null;
      onTick(st);
      if (st.failed) throw new Error(st.error || 'Suno-Task fehlgeschlagen');
      if (st.done) return st.result;
    }
    throw new Error('Zeitüberschreitung – Suno-Task wurde nicht rechtzeitig fertig.');
  }

  // Status eines Musik-Generierungs-Tasks (generate/extend/replace/cover …)
  async function fetchGenerateStatus(taskId) {
    const d = await get('/generate/record-info?taskId=' + encodeURIComponent(taskId));
    const status = (d && d.status) || 'PENDING';
    const rawTracks = (d && d.response && (d.response.sunoData || d.response.data)) || [];
    const tracks = rawTracks.map(normalizeTrack);
    const failed = /FAILED|ERROR|SENSITIVE/i.test(status) && status !== 'FIRST_SUCCESS';
    return {
      done: status === 'SUCCESS',
      failed: failed,
      error: failed ? ((d && d.errorMessage) || status) : null,
      result: { taskId: taskId, status: status, tracks: tracks, raw: d },
      status: status,
      tracks: tracks
    };
  }

  function normalizeTrack(t) {
    if (!t || typeof t !== 'object') return t;
    return Object.assign({}, t, {
      audio_url: t.audio_url || t.audioUrl || t.source_audio_url || t.sourceAudioUrl,
      stream_audio_url: t.stream_audio_url || t.streamAudioUrl || t.source_stream_audio_url || t.sourceStreamAudioUrl,
      image_url: t.image_url || t.imageUrl || t.source_image_url || t.sourceImageUrl
    });
  }

  function pollGenerateTask(taskId, opts) {
    return pollUntilDone(function () { return fetchGenerateStatus(taskId); }, opts);
  }

  // ────────────────────────────────────────────────────────────
  // Bearbeitungs-Aktionen (liefern alle { taskId })
  // ────────────────────────────────────────────────────────────

  /**
   * Abschnitt ersetzen (6–60 s).
   * Mode 1: { taskId, audioId } | Mode 2: { uploadUrl, model }
   * Gemeinsam: prompt (neue Lyrics des Abschnitts), tags, title,
   *            infillStartS, infillEndS, fullLyrics, negativeTags?
   */
  async function replaceSection(params) {
    const body = {
      prompt: params.prompt || '',
      tags: params.tags || 'pop',
      title: params.title || 'Studio Edit',
      infillStartS: Math.round(params.infillStartS * 100) / 100,
      infillEndS: Math.round(params.infillEndS * 100) / 100,
      fullLyrics: params.fullLyrics || params.prompt || '',
      callBackUrl: NOOP_CALLBACK
    };
    if (params.negativeTags) body.negativeTags = params.negativeTags;
    if (params.taskId && params.audioId) {
      body.taskId = params.taskId;
      body.audioId = params.audioId;
    } else if (params.uploadUrl) {
      body.uploadUrl = params.uploadUrl;
      body.model = params.model || 'V5_5';
    } else {
      throw new Error('Replace-Section braucht taskId+audioId oder uploadUrl.');
    }
    const d = await post('/generate/replace-section', body);
    return { taskId: d && d.taskId };
  }

  /** Song verlängern – audioId-Variante (in der App erzeugte Songs). */
  async function extend(params) {
    const body = {
      defaultParamFlag: true,
      audioId: params.audioId,
      prompt: params.prompt || '',
      style: params.style || '',
      title: params.title || 'Studio Extend',
      continueAt: typeof params.continueAt === 'number' ? Math.round(params.continueAt) : 60,
      model: params.model || 'V5_5',
      callBackUrl: NOOP_CALLBACK
    };
    if (params.negativeTags) body.negativeTags = params.negativeTags;
    if (params.vocalGender === 'm' || params.vocalGender === 'f') body.vocalGender = params.vocalGender;
    const d = await post('/generate/extend', body);
    return { taskId: d && d.taskId };
  }

  /** Song verlängern – Upload-Variante (beliebige Audio-URL). */
  async function uploadExtend(params) {
    const body = {
      uploadUrl: params.uploadUrl,
      defaultParamFlag: true,
      prompt: params.prompt || '',
      style: params.style || '',
      title: params.title || 'Studio Extend',
      continueAt: typeof params.continueAt === 'number' ? Math.round(params.continueAt) : 60,
      model: params.model || 'V5_5',
      callBackUrl: NOOP_CALLBACK
    };
    if (params.instrumental === true) body.instrumental = true;
    if (params.negativeTags) body.negativeTags = params.negativeTags;
    const d = await post('/generate/upload-extend', body);
    return { taskId: d && d.taskId };
  }

  /** Cover / Umstylen über Audio-URL (Melodie bleibt, Stil ändert sich). */
  async function uploadCover(params) {
    const body = {
      uploadUrl: params.uploadUrl,
      customMode: true,
      instrumental: params.instrumental === true,
      prompt: params.prompt || '',
      style: params.style || 'pop',
      title: params.title || 'Studio Cover',
      model: params.model || 'V5_5',
      callBackUrl: NOOP_CALLBACK
    };
    if (params.negativeTags) body.negativeTags = params.negativeTags;
    if (params.vocalGender === 'm' || params.vocalGender === 'f') body.vocalGender = params.vocalGender;
    if (typeof params.styleWeight === 'number') body.styleWeight = params.styleWeight;
    if (typeof params.audioWeight === 'number') body.audioWeight = params.audioWeight;
    const d = await post('/generate/upload-cover', body);
    return { taskId: d && d.taskId };
  }

  /** Gesang auf ein Instrumental legen. */
  async function addVocals(params) {
    const body = {
      uploadUrl: params.uploadUrl,
      prompt: params.prompt || '',
      title: params.title || 'Studio Vocals',
      style: params.style || 'pop',
      negativeTags: params.negativeTags || 'noise',
      model: params.model || 'V5_5',
      callBackUrl: NOOP_CALLBACK
    };
    if (params.vocalGender === 'm' || params.vocalGender === 'f') body.vocalGender = params.vocalGender;
    const d = await post('/generate/add-vocals', body);
    return { taskId: d && d.taskId };
  }

  /** Begleitung unter einen Gesang legen. */
  async function addInstrumental(params) {
    const body = {
      uploadUrl: params.uploadUrl,
      title: params.title || 'Studio Instrumental',
      tags: params.tags || params.style || 'pop',
      negativeTags: params.negativeTags || 'noise',
      model: params.model || 'V5_5',
      callBackUrl: NOOP_CALLBACK
    };
    const d = await post('/generate/add-instrumental', body);
    return { taskId: d && d.taskId };
  }

  // ────────────────────────────────────────────────────────────
  // Stem-Trennung
  // ────────────────────────────────────────────────────────────

  /**
   * separateStems({ taskId, audioId } | { audioUrl }, type, stemName)
   * type: 'separate_vocal' (2 Spuren) | 'split_stem' (bis 12) | 'split_stem_advanced'
   */
  async function separateStems(source, type, stemName) {
    const body = { type: type || 'separate_vocal', callBackUrl: NOOP_CALLBACK };
    if (source.taskId && source.audioId) {
      body.taskId = source.taskId;
      body.audioId = source.audioId;
    } else if (source.audioUrl) {
      body.audioUrl = source.audioUrl;
    } else {
      throw new Error('Stem-Trennung braucht taskId+audioId oder audioUrl.');
    }
    if (type === 'split_stem_advanced' && stemName) body.stemName = stemName;
    const d = await post('/vocal-removal/generate', body);
    return { taskId: d && d.taskId };
  }

  const STEM_URL_FIELDS = [
    ['vocalUrl', 'Vocals'],
    ['instrumentalUrl', 'Instrumental'],
    ['backingVocalsUrl', 'Backing Vocals'],
    ['drumsUrl', 'Drums'],
    ['bassUrl', 'Bass'],
    ['guitarUrl', 'Gitarre'],
    ['keyboardUrl', 'Keyboard'],
    ['percussionUrl', 'Percussion'],
    ['stringsUrl', 'Strings'],
    ['synthUrl', 'Synth'],
    ['fxUrl', 'FX'],
    ['brassUrl', 'Brass'],
    ['woodwindsUrl', 'Woodwinds']
  ];

  async function fetchStemStatus(taskId) {
    const d = await get('/vocal-removal/record-info?taskId=' + encodeURIComponent(taskId));
    const flag = (d && d.successFlag) || 'PENDING';
    const failed = /FAILED|EXCEPTION/i.test(flag);
    let stems = [];
    if (flag === 'SUCCESS' && d.response) {
      const r = d.response;
      if (Array.isArray(r.originData) && r.originData.length) {
        stems = r.originData
          .filter(function (s) { return s && s.audio_url; })
          .map(function (s) {
            return { name: s.stem_type_group_name || 'Stem', url: s.audio_url, duration: s.duration, id: s.id };
          });
      } else {
        STEM_URL_FIELDS.forEach(function (pair) {
          if (r[pair[0]]) stems.push({ name: pair[1], url: r[pair[0]] });
        });
      }
    }
    return {
      done: flag === 'SUCCESS',
      failed: failed,
      error: failed ? ((d && d.errorMessage) || flag) : null,
      result: { taskId: taskId, stems: stems, raw: d },
      status: flag
    };
  }

  function pollStemTask(taskId, opts) {
    return pollUntilDone(function () { return fetchStemStatus(taskId); }, opts);
  }

  // ────────────────────────────────────────────────────────────
  // Timestamped Lyrics, WAV, Credits
  // ────────────────────────────────────────────────────────────

  /** Wortgenaue Lyrics-Timestamps. Rückgabe: { alignedWords: [...], ... } */
  async function getTimestampedLyrics(taskId, audioId, musicIndex) {
    const body = { taskId: taskId };
    if (audioId) body.audioId = audioId;
    if (typeof musicIndex === 'number') body.musicIndex = musicIndex;
    return post('/generate/get-timestamped-lyrics', body);
  }

  async function convertWav(taskId, audioId) {
    const d = await post('/wav/generate', {
      taskId: taskId, audioId: audioId, callBackUrl: NOOP_CALLBACK
    });
    return { taskId: d && d.taskId };
  }

  async function fetchWavStatus(taskId) {
    const d = await get('/wav/record-info?taskId=' + encodeURIComponent(taskId));
    const flag = (d && d.successFlag) || 'PENDING';
    const failed = /FAILED|EXCEPTION/i.test(String(flag));
    const url = d && d.response && (d.response.audio_wav_url || d.response.audioWavUrl);
    return {
      done: String(flag) === 'SUCCESS' && !!url,
      failed: failed,
      error: failed ? ((d && d.errorMessage) || flag) : null,
      result: { taskId: taskId, wavUrl: url, raw: d },
      status: flag
    };
  }

  function pollWavTask(taskId, opts) {
    return pollUntilDone(function () { return fetchWavStatus(taskId); }, opts);
  }

  /** Credits-Stand (Zahl). */
  async function getCredits() {
    const d = await get('/generate/credit');
    return typeof d === 'number' ? d : (d && d.credits);
  }

  // ────────────────────────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────────────────────────
  window.StudioAPI = {
    BASE: BASE,
    getKey: getKey,
    getCredits: getCredits,
    replaceSection: replaceSection,
    extend: extend,
    uploadExtend: uploadExtend,
    uploadCover: uploadCover,
    addVocals: addVocals,
    addInstrumental: addInstrumental,
    separateStems: separateStems,
    getTimestampedLyrics: getTimestampedLyrics,
    convertWav: convertWav,
    pollGenerateTask: pollGenerateTask,
    pollStemTask: pollStemTask,
    pollWavTask: pollWavTask,
    fetchGenerateStatus: fetchGenerateStatus,
    fetchStemStatus: fetchStemStatus,
    fetchWavStatus: fetchWavStatus
  };
})();
