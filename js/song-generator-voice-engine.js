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

  function normalizeContentType(ct) {
    if (!ct) return 'audio/wav';
    var base = String(ct).split(';')[0].trim().toLowerCase();
    if (base === 'audio/mp3') return 'audio/mpeg';
    return base;
  }

  function audioBufferToWav(buffer) {
    var numChannels = buffer.numberOfChannels;
    var sampleRate = buffer.sampleRate;
    var format = 1;
    var bitDepth = 16;
    var samples = buffer.length * numChannels;
    var blockAlign = numChannels * bitDepth / 8;
    var byteRate = sampleRate * blockAlign;
    var dataSize = samples * bitDepth / 8;
    var ab = new ArrayBuffer(44 + dataSize);
    var view = new DataView(ab);
    function writeStr(off, str) {
      for (var i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
    }
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);
    var offset = 44;
    var chData = [];
    for (var c = 0; c < numChannels; c++) chData.push(buffer.getChannelData(c));
    for (var i = 0; i < buffer.length; i++) {
      for (var ch = 0; ch < numChannels; ch++) {
        var s = Math.max(-1, Math.min(1, chData[ch][i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([ab], { type: 'audio/wav' });
  }

  async function convertToWavFile(file) {
    var baseType = normalizeContentType(file.type);
    if (/^audio\/(mpeg|wav|x-wav|mp4|x-m4a|aac)$/.test(baseType)) return file;
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      throw new Error('Browser-Audio nicht verfügbar – bitte MP3 oder WAV hochladen.');
    }
    var ctx = new AudioCtx();
    try {
      var ab = await file.arrayBuffer();
      var decoded = await ctx.decodeAudioData(ab.slice(0));
      var wavBlob = audioBufferToWav(decoded);
      var baseName = (file.name || 'stimmprobe').replace(/\.[^.]+$/, '');
      return new File([wavBlob], baseName + '.wav', { type: 'audio/wav' });
    } finally {
      try { await ctx.close(); } catch (_e) {}
    }
  }

  async function uploadAudioFile(file) {
    if (!file) throw new Error('Keine Datei gewählt');
    file = await convertToWavFile(file);
    var ct = normalizeContentType(file.type || 'audio/wav');
    var endpoint = getApiBase() + '/profile-image/upload-url';
    var presignRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: ct,
        userId: getUserId(),
        fileType: 'voice',
        fileName: (file.name || 'voice-sample.wav').replace(/[^a-zA-Z0-9.-]/g, '_')
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

  function mountVoiceRecorder(container, opts) {
    opts = opts || {};
    var maxSec = opts.maxSeconds || 30;
    var label = opts.label || 'Aufnahme';
    var wrap = document.createElement('div');
    wrap.className = 'sg-voice-recorder';

    var status = document.createElement('span');
    status.className = 'sg-voice-rec-status';
    status.textContent = 'Bereit';

    var btnRow = document.createElement('div');
    btnRow.className = 'sg-voice-rec-btns';

    var startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.className = 'sg-btn sg-btn-secondary';
    startBtn.textContent = '🎙 ' + label + ' starten';

    var stopBtn = document.createElement('button');
    stopBtn.type = 'button';
    stopBtn.className = 'sg-btn sg-btn-ghost';
    stopBtn.textContent = '■ Stopp';
    stopBtn.disabled = true;

    var preview = document.createElement('audio');
    preview.className = 'sg-voice-rec-preview';
    preview.controls = true;
    preview.style.width = '100%';
    preview.style.display = 'none';

    var blob = null;
    var stream = null;
    var recorder = null;
    var chunks = [];
    var timer = null;

    function cleanupStream() {
      if (stream) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        stream = null;
      }
    }

    startBtn.onclick = async function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Mikrofon-Aufnahme wird in diesem Browser nicht unterstützt.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        blob = null;
        preview.style.display = 'none';
        preview.removeAttribute('src');
        var mime = null;
        var candidates = [
          'audio/mp4',
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus'
        ];
        for (var ci = 0; ci < candidates.length; ci++) {
          if (MediaRecorder.isTypeSupported(candidates[ci])) {
            mime = candidates[ci];
            break;
          }
        }
        recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        recorder.ondataavailable = function (e) {
          if (e.data && e.data.size) chunks.push(e.data);
        };
        recorder.onstop = function () {
          cleanupStream();
          blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          preview.src = URL.createObjectURL(blob);
          preview.style.display = 'block';
          status.textContent = 'Aufnahme fertig (' + Math.round(blob.size / 1024) + ' KB) – wird als WAV hochgeladen';
          startBtn.disabled = false;
          stopBtn.disabled = true;
          if (opts.onRecorded) opts.onRecorded(getFile());
        };
        recorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        status.textContent = 'Aufnahme läuft … (max. ' + maxSec + ' s)';
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          if (recorder && recorder.state === 'recording') stopBtn.click();
        }, maxSec * 1000);
      } catch (err) {
        cleanupStream();
        alert('Mikrofon-Zugriff fehlgeschlagen: ' + (err.message || 'Bitte Berechtigung erlauben.'));
      }
    };

    stopBtn.onclick = function () {
      if (timer) clearTimeout(timer);
      if (recorder && recorder.state === 'recording') recorder.stop();
    };

    btnRow.append(startBtn, stopBtn);
    wrap.append(status, btnRow, preview);
    if (container) container.appendChild(wrap);

    function getFile(filename) {
      if (!blob) return null;
      var ext = (blob.type && blob.type.indexOf('webm') >= 0) ? '.webm' : '.m4a';
      return new File([blob], filename || ('voice-' + Date.now() + ext), { type: blob.type || 'audio/webm' });
    }

    return {
      element: wrap,
      getFile: getFile,
      hasRecording: function () { return !!blob; },
      reset: function () {
        blob = null;
        chunks = [];
        cleanupStream();
        preview.style.display = 'none';
        preview.removeAttribute('src');
        status.textContent = 'Bereit';
        startBtn.disabled = false;
        stopBtn.disabled = true;
      }
    };
  }

  window.SongVoiceEngine = {
    uploadAudioFile: uploadAudioFile,
    mountVoiceRecorder: mountVoiceRecorder,
    startValidation: startValidation,
    pollValidatePhrase: pollValidatePhrase,
    generateCustomVoice: generateCustomVoice,
    pollVoiceId: pollVoiceId,
    registerVoice: registerVoice
  };
})();
