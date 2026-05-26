/**
 * Persönlichkeits-Song Generator – Suno Custom Voice
 * Workflow: Stimmprobe → Validierungssatz → Verifikations-Aufnahme → voiceId
 */
(function () {
  'use strict';

  var BASE = 'https://api.sunoapi.org/api/v1';
  var NOOP_CB = 'https://manuel-weiss.ch/api/suno-noop';

  function sunoErr(code, msg) {
    var map = {
      400: 'Ungültige Parameter',
      401: 'Suno-API-Key ungültig',
      429: 'Suno-Credits aufgebraucht',
      455: 'Suno-System wartet'
    };
    return (map[code] || 'Suno Voice-Fehler') + (msg ? ' – ' + msg : '') + ' (Code ' + code + ')';
  }

  async function sunoFetch(apiKey, method, path, body) {
    var opts = {
      method: method,
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
    };
    if (body) opts.body = JSON.stringify(body);
    var res = await fetch(BASE + path, opts);
    var data = await res.json().catch(function () { return null; });
    if (!res.ok || !data) {
      throw new Error('Suno Voice HTTP ' + res.status + (data && data.msg ? ' – ' + data.msg : ''));
    }
    if (data.code !== 200) throw new Error(sunoErr(data.code, data.msg));
    return data.data || data;
  }

  function getApiBase() {
    try {
      if (window.AWS_APP_CONFIG && window.AWS_APP_CONFIG.API_BASE) {
        return window.AWS_APP_CONFIG.API_BASE.replace(/\/$/, '');
      }
    } catch (_e) {}
    return 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
  }

  function getUserId() {
    try {
      if (window.awsAuth && window.awsAuth.getCurrentUser) {
        var u = window.awsAuth.getCurrentUser();
        if (u && u.userId) return u.userId;
        if (u && u.sub) return u.sub;
        if (u && u.email) return u.email;
      }
      if (window.realUserAuth && window.realUserAuth.getCurrentUser) {
        var r = window.realUserAuth.getCurrentUser();
        if (r && r.userId) return r.userId;
        if (r && r.sub) return r.sub;
      }
    } catch (_e) {}
    return 'anonymous';
  }

  async function uploadAudioFile(file) {
    if (!file) throw new Error('Keine Datei gewählt');
    var ct = file.type || 'audio/mpeg';
    var endpoint = getApiBase() + '/profile-image/upload-url';
    var presignRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: ct,
        userId: getUserId(),
        fileType: 'voice',
        fileName: (file.name || 'voice-sample').replace(/[^a-zA-Z0-9.-]/g, '_')
      })
    });
    var presign = await presignRes.json().catch(function () { return null; });
    if (!presignRes.ok || !presign || !presign.uploadUrl) {
      throw new Error('Upload-URL nicht verfügbar' +
        (presign && presign.error ? ': ' + presign.error : ' (HTTP ' + presignRes.status + ')'));
    }
    var putRes = await fetch(presign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': ct },
      body: file
    });
    if (!putRes.ok) throw new Error('Audio-Upload fehlgeschlagen (HTTP ' + putRes.status + ')');
    return presign.publicUrl;
  }

  async function startValidation(voiceUrl, vocalStartS, vocalEndS, apiKey, language) {
    return sunoFetch(apiKey, 'POST', '/voice/validate', {
      voiceUrl: voiceUrl,
      vocalStartS: Math.max(0, Math.floor(vocalStartS)),
      vocalEndS: Math.max(1, Math.floor(vocalEndS)),
      language: language || 'de',
      callBackUrl: NOOP_CB
    });
  }

  async function getValidateInfo(taskId, apiKey) {
    return sunoFetch(apiKey, 'GET', '/voice/validate-info?taskId=' + encodeURIComponent(taskId), null);
  }

  async function pollValidatePhrase(taskId, apiKey, onUpdate, maxWaitMs) {
    maxWaitMs = maxWaitMs || 120000;
    var start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      var info = await getValidateInfo(taskId, apiKey);
      if (onUpdate) onUpdate(info);
      if (info.validateInfo && info.status === 'wait_validating') {
        return info;
      }
      if (/fail/i.test(info.status || '')) {
        throw new Error(info.errorMessage || 'Validierungssatz fehlgeschlagen');
      }
      await new Promise(function (r) { setTimeout(r, 4000); });
    }
    throw new Error('Timeout: Validierungssatz');
  }

  async function generateCustomVoice(taskId, verifyUrl, apiKey, meta) {
    meta = meta || {};
    return sunoFetch(apiKey, 'POST', '/voice/generate', {
      taskId: taskId,
      verifyUrl: verifyUrl,
      voiceName: meta.voiceName || 'Meine Stimme',
      description: meta.description || 'Persönlichkeits-Song Generator',
      style: meta.style || 'Pop, personal vocal',
      singerSkillLevel: meta.singerSkillLevel || 'intermediate',
      callBackUrl: NOOP_CB
    });
  }

  async function getVoiceRecord(taskId, apiKey) {
    return sunoFetch(apiKey, 'GET', '/voice/record-info?taskId=' + encodeURIComponent(taskId), null);
  }

  async function pollVoiceId(taskId, apiKey, onUpdate, maxWaitMs) {
    maxWaitMs = maxWaitMs || 180000;
    var start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      var rec = await getVoiceRecord(taskId, apiKey);
      if (onUpdate) onUpdate(rec);
      if (rec.status === 'success' && rec.voiceId) {
        return rec;
      }
      if (/fail/i.test(rec.status || '')) {
        throw new Error(rec.errorMessage || 'Stimm-Erstellung fehlgeschlagen');
      }
      await new Promise(function (r) { setTimeout(r, 5000); });
    }
    throw new Error('Timeout: Custom Voice');
  }

  async function registerVoice(opts) {
    opts = opts || {};
    var apiKey = opts.apiKey;
    if (!apiKey && window.SongMusicEngine && window.SongMusicEngine.getSunoApiKey) {
      apiKey = await window.SongMusicEngine.getSunoApiKey();
    }
    if (!apiKey) throw new Error('Kein Suno-API-Key');

    var validateTaskId = opts.validateTaskId || null;
    var voiceUrl = opts.voiceUrl;
    var phraseInfo = null;

    if (!validateTaskId) {
      if (opts.file && !voiceUrl) {
        voiceUrl = await uploadAudioFile(opts.file);
      }
      if (!voiceUrl) throw new Error('Keine Stimmprobe');

      var startS = opts.vocalStartS != null ? opts.vocalStartS : 0;
      var endS = opts.vocalEndS != null ? opts.vocalEndS : Math.min(12, opts.duration || 12);
      if (endS <= startS) endS = startS + 8;

      if (opts.onPhase) opts.onPhase({ phase: 'validate_start' });
      var val = await startValidation(voiceUrl, startS, endS, apiKey, opts.language || 'de');
      validateTaskId = val.taskId;
      if (!validateTaskId) throw new Error('Keine validate taskId');

      if (opts.onPhase) opts.onPhase({ phase: 'validate_poll', taskId: validateTaskId });
      phraseInfo = await pollValidatePhrase(validateTaskId, apiKey, opts.onValidateUpdate);

      if (!opts.verifyFile && !opts.verifyUrl) {
        return {
          phase: 'need_verification',
          validateTaskId: validateTaskId,
          validateInfo: phraseInfo.validateInfo,
          voiceUrl: voiceUrl,
          vocalStartS: startS,
          vocalEndS: endS
        };
      }
    }

    var verifyUrl = opts.verifyUrl;
    if (opts.verifyFile && !verifyUrl) {
      verifyUrl = await uploadAudioFile(opts.verifyFile);
    }
    if (!verifyUrl) throw new Error('Keine Verifikations-Aufnahme');
    if (!validateTaskId) throw new Error('Kein Validierungs-Task');

    if (opts.onPhase) opts.onPhase({ phase: 'voice_generate' });
    var gen = await generateCustomVoice(validateTaskId, verifyUrl, apiKey, opts.meta);
    var genTaskId = gen.taskId || validateTaskId;

    if (opts.onPhase) opts.onPhase({ phase: 'voice_poll', taskId: genTaskId });
    var record = await pollVoiceId(genTaskId, apiKey, opts.onVoiceUpdate);

    return {
      phase: 'ready',
      voiceId: record.voiceId,
      validateTaskId: validateTaskId,
      voiceName: (opts.meta && opts.meta.voiceName) || 'Meine Stimme',
      createdAt: new Date().toISOString(),
      voiceUrl: voiceUrl,
      validateInfo: phraseInfo && phraseInfo.validateInfo
    };
  }

  window.SongVoiceEngine = {
    uploadAudioFile: uploadAudioFile,
    startValidation: startValidation,
    pollValidatePhrase: pollValidatePhrase,
    generateCustomVoice: generateCustomVoice,
    pollVoiceId: pollVoiceId,
    registerVoice: registerVoice
  };
})();
