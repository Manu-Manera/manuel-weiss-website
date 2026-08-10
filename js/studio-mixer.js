/**
 * Studio-Mixer – Multitrack-Wiedergabe der getrennten Stems mit
 * Mute/Solo/Gain/Pan und Mixdown zu WAV (OfflineAudioContext).
 *
 * Zwei Betriebsmodi (automatisch):
 *  - Buffer-Modus: alle Stems per fetch+decodeAudioData geladen →
 *    samplegenaue Synchronität, Pan, Mixdown/WAV-Export.
 *  - Element-Modus (CORS-Fallback): HTMLAudio-Elemente → Mute/Solo/Gain
 *    funktionieren, Pan + Mixdown sind deaktiviert.
 */
(function () {
  'use strict';

  function StudioMixer() {
    this.tracks = [];      // { name, url, buffer|audioEl, gain, pan, muted, solo }
    this.mode = null;      // 'buffer' | 'element'
    this.ctx = null;
    this.duration = 0;
    this.playing = false;
    this._startCtxTime = 0;
    this._startOffset = 0;
    this._sources = [];
    this.onTimeUpdate = function () {};
    this.onEnded = function () {};
    this._raf = null;
  }

  // ────────────────────────────────────────────────────────────
  // Laden
  // ────────────────────────────────────────────────────────────

  StudioMixer.prototype.loadStems = async function (stems, onProgress) {
    this.stop();
    this.tracks = [];
    this.duration = 0;
    onProgress = onProgress || function () {};

    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = this.ctx || new AC();

    let bufferModeOk = true;
    for (let i = 0; i < stems.length; i++) {
      const s = stems[i];
      onProgress({ index: i, total: stems.length, name: s.name, phase: 'loading' });
      const track = { name: s.name, url: s.url, gain: 1, pan: 0, muted: false, solo: false };
      try {
        const res = await fetch(s.url, { mode: 'cors' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const buf = await res.arrayBuffer();
        track.buffer = await this.ctx.decodeAudioData(buf);
        this.duration = Math.max(this.duration, track.buffer.duration);
      } catch (err) {
        console.warn('[StudioMixer] Buffer-Laden fehlgeschlagen für', s.name, err.message);
        bufferModeOk = false;
        track.buffer = null;
      }
      this.tracks.push(track);
    }

    if (bufferModeOk && this.tracks.length) {
      this.mode = 'buffer';
    } else {
      // Fallback: HTMLAudio-Elemente
      this.mode = 'element';
      const self = this;
      this.tracks.forEach(function (t) {
        const el = new Audio();
        el.crossOrigin = 'anonymous';
        el.preload = 'auto';
        el.src = t.url;
        el.addEventListener('loadedmetadata', function () {
          self.duration = Math.max(self.duration, el.duration || 0);
        });
        t.audioEl = el;
      });
    }
    onProgress({ phase: 'done', mode: this.mode });
    return this.mode;
  };

  // ────────────────────────────────────────────────────────────
  // Effektive Lautstärke (Mute/Solo)
  // ────────────────────────────────────────────────────────────

  StudioMixer.prototype._effectiveGain = function (track) {
    const anySolo = this.tracks.some(function (t) { return t.solo; });
    if (track.muted) return 0;
    if (anySolo && !track.solo) return 0;
    return track.gain;
  };

  StudioMixer.prototype._applyLiveGains = function () {
    const self = this;
    if (this.mode === 'buffer') {
      this._sources.forEach(function (s) {
        if (!s.gainNode) return;
        s.gainNode.gain.setTargetAtTime(self._effectiveGain(s.track), self.ctx.currentTime, 0.02);
        if (s.panNode) s.panNode.pan.setTargetAtTime(s.track.pan, self.ctx.currentTime, 0.02);
      });
    } else {
      this.tracks.forEach(function (t) {
        if (t.audioEl) t.audioEl.volume = Math.max(0, Math.min(1, self._effectiveGain(t)));
      });
    }
  };

  // ────────────────────────────────────────────────────────────
  // Transport
  // ────────────────────────────────────────────────────────────

  StudioMixer.prototype.play = function (offsetS) {
    if (!this.tracks.length) return;
    this.stop(true);
    const offset = typeof offsetS === 'number' ? offsetS : this._startOffset;
    const self = this;

    if (this.mode === 'buffer') {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this._sources = this.tracks.map(function (t) {
        if (!t.buffer) return null;
        const src = self.ctx.createBufferSource();
        src.buffer = t.buffer;
        const gainNode = self.ctx.createGain();
        gainNode.gain.value = self._effectiveGain(t);
        let panNode = null;
        if (self.ctx.createStereoPanner) {
          panNode = self.ctx.createStereoPanner();
          panNode.pan.value = t.pan;
          src.connect(gainNode).connect(panNode).connect(self.ctx.destination);
        } else {
          src.connect(gainNode).connect(self.ctx.destination);
        }
        src.start(0, Math.min(offset, t.buffer.duration));
        return { src: src, gainNode: gainNode, panNode: panNode, track: t };
      }).filter(Boolean);
      this._startCtxTime = this.ctx.currentTime;
      this._startOffset = offset;
    } else {
      this.tracks.forEach(function (t) {
        if (!t.audioEl) return;
        t.audioEl.currentTime = offset;
        t.audioEl.volume = Math.max(0, Math.min(1, self._effectiveGain(t)));
        t.audioEl.play().catch(function () {});
      });
      this._startOffset = offset;
    }

    this.playing = true;
    this._tick();
  };

  StudioMixer.prototype.pause = function () {
    if (!this.playing) return;
    this._startOffset = this.getTime();
    this.stop(true);
  };

  StudioMixer.prototype.stop = function (keepOffset) {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    if (this.mode === 'buffer') {
      this._sources.forEach(function (s) {
        try { s.src.stop(); } catch (_e) {}
        try { s.src.disconnect(); } catch (_e) {}
      });
      this._sources = [];
    } else {
      this.tracks.forEach(function (t) { if (t.audioEl) t.audioEl.pause(); });
    }
    this.playing = false;
    if (!keepOffset) this._startOffset = 0;
  };

  StudioMixer.prototype.seek = function (t) {
    const wasPlaying = this.playing;
    this._startOffset = Math.max(0, Math.min(t, this.duration || t));
    if (wasPlaying) this.play(this._startOffset);
    else this.onTimeUpdate(this._startOffset);
  };

  StudioMixer.prototype.getTime = function () {
    if (!this.playing) return this._startOffset;
    if (this.mode === 'buffer') {
      return this._startOffset + (this.ctx.currentTime - this._startCtxTime);
    }
    const el = this.tracks.length && this.tracks[0].audioEl;
    return el ? el.currentTime : this._startOffset;
  };

  StudioMixer.prototype._tick = function () {
    const self = this;
    function frame() {
      if (!self.playing) return;
      const t = self.getTime();
      self.onTimeUpdate(t);
      if (self.duration && t >= self.duration - 0.05) {
        self.stop();
        self.onTimeUpdate(0);
        self.onEnded();
        return;
      }
      self._raf = requestAnimationFrame(frame);
    }
    this._raf = requestAnimationFrame(frame);
  };

  // ────────────────────────────────────────────────────────────
  // Regler
  // ────────────────────────────────────────────────────────────

  StudioMixer.prototype.setGain = function (index, v) {
    if (!this.tracks[index]) return;
    this.tracks[index].gain = Math.max(0, Math.min(2, v));
    this._applyLiveGains();
  };

  StudioMixer.prototype.setPan = function (index, v) {
    if (!this.tracks[index]) return;
    this.tracks[index].pan = Math.max(-1, Math.min(1, v));
    this._applyLiveGains();
  };

  StudioMixer.prototype.toggleMute = function (index) {
    if (!this.tracks[index]) return;
    this.tracks[index].muted = !this.tracks[index].muted;
    this._applyLiveGains();
    return this.tracks[index].muted;
  };

  StudioMixer.prototype.toggleSolo = function (index) {
    if (!this.tracks[index]) return;
    this.tracks[index].solo = !this.tracks[index].solo;
    this._applyLiveGains();
    return this.tracks[index].solo;
  };

  // ────────────────────────────────────────────────────────────
  // Mixdown → WAV (nur Buffer-Modus)
  // ────────────────────────────────────────────────────────────

  StudioMixer.prototype.canMixdown = function () {
    return this.mode === 'buffer' && this.tracks.some(function (t) { return t.buffer; });
  };

  StudioMixer.prototype.mixdownWav = async function () {
    if (!this.canMixdown()) {
      throw new Error('Mixdown nicht möglich – Stems konnten wegen CORS nicht dekodiert werden.');
    }
    const sampleRate = 44100;
    const length = Math.ceil(this.duration * sampleRate);
    const OfflineAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const off = new OfflineAC(2, length, sampleRate);
    const self = this;

    this.tracks.forEach(function (t) {
      if (!t.buffer) return;
      const g = self._effectiveGain(t);
      if (g <= 0) return;
      const src = off.createBufferSource();
      src.buffer = t.buffer;
      const gainNode = off.createGain();
      gainNode.gain.value = g;
      if (off.createStereoPanner) {
        const panNode = off.createStereoPanner();
        panNode.pan.value = t.pan;
        src.connect(gainNode).connect(panNode).connect(off.destination);
      } else {
        src.connect(gainNode).connect(off.destination);
      }
      src.start(0);
    });

    const rendered = await off.startRendering();
    return encodeWav(rendered);
  };

  // AudioBuffer → WAV-Blob (16-bit PCM, interleaved)
  function encodeWav(audioBuffer) {
    const numCh = Math.min(2, audioBuffer.numberOfChannels);
    const sampleRate = audioBuffer.sampleRate;
    const len = audioBuffer.length;
    const bytesPerSample = 2;
    const dataSize = len * numCh * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeStr(offset, str) {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numCh, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numCh * bytesPerSample, true);
    view.setUint16(32, numCh * bytesPerSample, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);

    const channels = [];
    for (let c = 0; c < numCh; c++) channels.push(audioBuffer.getChannelData(c));
    let offset = 44;
    for (let i = 0; i < len; i++) {
      for (let c = 0; c < numCh; c++) {
        let v = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, v < 0 ? v * 0x8000 : v * 0x7FFF, true);
        offset += 2;
      }
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  StudioMixer.prototype.destroy = function () {
    this.stop();
    this.tracks = [];
    if (this.ctx) { try { this.ctx.close(); } catch (_e) {} this.ctx = null; }
  };

  window.StudioMixer = StudioMixer;
})();
