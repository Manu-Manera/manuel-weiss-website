/**
 * Studio-Waveform – Canvas-Waveform mit Zoom, Playhead, Region-Selektion
 * und optionaler Lyrics-Spur (wortgenaue Timestamps).
 *
 * Verwendung:
 *   const wf = new StudioWaveform(containerEl, {
 *     onSeek: (timeS) => {},
 *     onRegionChange: ({ start, end } | null) => {}
 *   });
 *   await wf.load(audioUrl, durationHintS);
 *   wf.setTime(t); wf.setRegion(a, b); wf.setWords(alignedWords);
 *
 * Fällt decodeAudioData aus (CORS bei fremden CDNs), wird eine neutrale
 * Balken-Silhouette gezeichnet – Seek/Region funktionieren trotzdem über
 * die bekannte Dauer.
 */
(function () {
  'use strict';

  const COLORS = {
    bg: '#101322',
    wave: '#4f5f8f',
    waveProgress: '#8b5cf6',
    playhead: '#f472b6',
    region: 'rgba(236, 72, 153, 0.22)',
    regionEdge: '#ec4899',
    grid: 'rgba(255,255,255,0.06)',
    text: 'rgba(255,255,255,0.45)',
    word: 'rgba(255,255,255,0.75)',
    wordActive: '#f9a8d4'
  };

  function StudioWaveform(container, opts) {
    opts = opts || {};
    this.container = container;
    this.onSeek = opts.onSeek || function () {};
    this.onRegionChange = opts.onRegionChange || function () {};

    this.duration = 0;
    this.time = 0;
    this.peaks = null;          // Float32Array (max je Bucket)
    this.peaksAvailable = false;
    this.region = null;         // { start, end } in Sekunden
    this.words = null;          // alignedWords: [{ word, startS/start_s, endS/end_s }]
    this.zoom = 1;              // 1 = alles sichtbar; >1 = reingezoomt
    this.scrollS = 0;           // linker Rand in Sekunden

    this._buildDom();
    this._bindEvents();
  }

  StudioWaveform.prototype._buildDom = function () {
    this.container.classList.add('stw-wrap');
    this.container.innerHTML =
      '<div class="stw-toolbar">' +
        '<button type="button" class="stw-btn" data-act="zoom-out" title="Rauszoomen"><i class="fas fa-search-minus"></i></button>' +
        '<button type="button" class="stw-btn" data-act="zoom-in" title="Reinzoomen"><i class="fas fa-search-plus"></i></button>' +
        '<button type="button" class="stw-btn" data-act="zoom-fit" title="Alles anzeigen"><i class="fas fa-expand"></i></button>' +
        '<span class="stw-hint">Klick = Position · Ziehen = Abschnitt wählen</span>' +
        '<span class="stw-region-label"></span>' +
      '</div>' +
      '<div class="stw-canvas-wrap"><canvas class="stw-canvas"></canvas></div>' +
      '<div class="stw-lyrics-track" style="display:none;"></div>';
    this.canvas = this.container.querySelector('.stw-canvas');
    this.canvasWrap = this.container.querySelector('.stw-canvas-wrap');
    this.lyricsTrack = this.container.querySelector('.stw-lyrics-track');
    this.regionLabel = this.container.querySelector('.stw-region-label');
    this.ctx = this.canvas.getContext('2d');
  };

  StudioWaveform.prototype._bindEvents = function () {
    const self = this;

    this.container.querySelector('[data-act="zoom-in"]').addEventListener('click', function () {
      self.setZoom(Math.min(32, self.zoom * 1.6));
    });
    this.container.querySelector('[data-act="zoom-out"]').addEventListener('click', function () {
      self.setZoom(Math.max(1, self.zoom / 1.6));
    });
    this.container.querySelector('[data-act="zoom-fit"]').addEventListener('click', function () {
      self.setZoom(1);
    });

    let dragStartX = null;
    let dragStartTime = null;
    let dragging = false;
    let edgeDrag = null; // 'start' | 'end'

    function evtTime(e) {
      const rect = self.canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      return self._xToTime(x, rect.width);
    }

    function nearRegionEdge(e) {
      if (!self.region) return null;
      const rect = self.canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const sx = self._timeToX(self.region.start, rect.width);
      const ex = self._timeToX(self.region.end, rect.width);
      if (Math.abs(x - sx) < 8) return 'start';
      if (Math.abs(x - ex) < 8) return 'end';
      return null;
    }

    function onDown(e) {
      if (!self.duration) return;
      edgeDrag = nearRegionEdge(e);
      dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
      dragStartTime = evtTime(e);
      dragging = false;
      e.preventDefault();
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    }

    function onMove(e) {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      if (Math.abs(x - dragStartX) > 4) dragging = true;
      if (!dragging) return;
      e.preventDefault();
      const t = evtTime(e);
      if (edgeDrag && self.region) {
        const r = Object.assign({}, self.region);
        if (edgeDrag === 'start') r.start = Math.min(t, r.end - 0.5);
        else r.end = Math.max(t, r.start + 0.5);
        self.region = self._clampRegion(r);
      } else {
        self.region = self._clampRegion({
          start: Math.min(dragStartTime, t),
          end: Math.max(dragStartTime, t)
        });
      }
      self._updateRegionLabel();
      self.draw();
    }

    function onUp(e) {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      if (dragging) {
        if (self.region && self.region.end - self.region.start >= 0.5) {
          self.onRegionChange(self.region);
        }
      } else {
        // Klick = Seek (Region bleibt bestehen, außer Klick außerhalb löscht sie nicht)
        const t = dragStartTime;
        self.time = t;
        self.draw();
        self.onSeek(t);
      }
      dragStartX = null;
      dragging = false;
      edgeDrag = null;
    }

    this.canvas.addEventListener('mousedown', onDown);
    this.canvas.addEventListener('touchstart', onDown, { passive: false });

    this._resizeObserver = new ResizeObserver(function () { self.draw(); });
    this._resizeObserver.observe(this.canvasWrap);
  };

  StudioWaveform.prototype._clampRegion = function (r) {
    const d = this.duration || 0;
    return {
      start: Math.max(0, Math.min(r.start, d)),
      end: Math.max(0, Math.min(r.end, d))
    };
  };

  StudioWaveform.prototype._updateRegionLabel = function () {
    if (!this.regionLabel) return;
    if (!this.region) { this.regionLabel.textContent = ''; return; }
    const len = this.region.end - this.region.start;
    this.regionLabel.textContent = fmtTime(this.region.start) + ' – ' + fmtTime(this.region.end) +
      ' (' + len.toFixed(1) + 's)';
  };

  // Sichtbares Zeitfenster
  StudioWaveform.prototype._window = function () {
    const total = this.duration || 1;
    const visible = total / this.zoom;
    let start = this.scrollS;
    // Playhead im Fenster halten, wenn gezoomt
    if (this.zoom > 1) {
      if (this.time < start || this.time > start + visible) {
        start = Math.max(0, Math.min(this.time - visible / 2, total - visible));
        this.scrollS = start;
      }
    } else {
      start = 0;
      this.scrollS = 0;
    }
    return { start: start, end: Math.min(total, start + visible), visible: visible };
  };

  StudioWaveform.prototype._xToTime = function (x, width) {
    const w = this._window();
    return w.start + (x / width) * w.visible;
  };

  StudioWaveform.prototype._timeToX = function (t, width) {
    const w = this._window();
    return ((t - w.start) / w.visible) * width;
  };

  // ────────────────────────────────────────────────────────────
  // Laden + Peaks
  // ────────────────────────────────────────────────────────────

  StudioWaveform.prototype.load = async function (url, durationHintS) {
    this.duration = durationHintS || this.duration || 0;
    this.peaks = null;
    this.peaksAvailable = false;
    this.region = null;
    this._updateRegionLabel();
    this.draw();
    if (!url) return false;

    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = await res.arrayBuffer();
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const audio = await ctx.decodeAudioData(buf);
      this.duration = audio.duration;
      this.peaks = computePeaks(audio, 1200);
      this.peaksAvailable = true;
      try { ctx.close(); } catch (_e) {}
    } catch (err) {
      console.warn('[StudioWaveform] Peaks nicht verfügbar (CORS?):', err.message);
      this.peaksAvailable = false;
    }
    this.draw();
    return this.peaksAvailable;
  };

  function computePeaks(audioBuffer, buckets) {
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null;
    const out = new Float32Array(buckets);
    const per = Math.floor(ch0.length / buckets) || 1;
    for (let b = 0; b < buckets; b++) {
      let max = 0;
      const from = b * per;
      const to = Math.min(from + per, ch0.length);
      for (let i = from; i < to; i += 4) {
        let v = Math.abs(ch0[i]);
        if (ch1) v = Math.max(v, Math.abs(ch1[i]));
        if (v > max) max = v;
      }
      out[b] = max;
    }
    return out;
  }

  // ────────────────────────────────────────────────────────────
  // Zeichnen
  // ────────────────────────────────────────────────────────────

  StudioWaveform.prototype.draw = function () {
    const wrap = this.canvasWrap;
    if (!wrap) return;
    const width = wrap.clientWidth || 600;
    const height = wrap.clientHeight || 120;
    const dpr = window.devicePixelRatio || 1;
    if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
    }
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    const win = this._window();
    const total = this.duration || 1;

    // Zeit-Raster
    const step = niceStep(win.visible);
    ctx.strokeStyle = COLORS.grid;
    ctx.fillStyle = COLORS.text;
    ctx.font = '10px Inter, sans-serif';
    for (let t = Math.ceil(win.start / step) * step; t <= win.end; t += step) {
      const x = this._timeToX(t, width);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.fillText(fmtTime(t), x + 3, 11);
    }

    const mid = height / 2;
    const progressT = this.time;

    if (this.peaks && this.peaksAvailable) {
      const buckets = this.peaks.length;
      for (let px = 0; px < width; px++) {
        const t0 = win.start + (px / width) * win.visible;
        const idx = Math.min(buckets - 1, Math.floor((t0 / total) * buckets));
        const amp = Math.max(0.015, this.peaks[idx]) * (mid - 8);
        ctx.fillStyle = t0 <= progressT ? COLORS.waveProgress : COLORS.wave;
        ctx.fillRect(px, mid - amp, 1, amp * 2);
      }
    } else {
      // Fallback: neutrale Silhouette (deterministisch aus Index)
      for (let px = 0; px < width; px += 3) {
        const t0 = win.start + (px / width) * win.visible;
        const h = (0.25 + 0.55 * Math.abs(Math.sin(px * 0.37) * Math.sin(px * 0.11))) * (mid - 10);
        ctx.fillStyle = t0 <= progressT ? COLORS.waveProgress : COLORS.wave;
        ctx.fillRect(px, mid - h, 2, h * 2);
      }
    }

    // Region
    if (this.region) {
      const sx = this._timeToX(this.region.start, width);
      const ex = this._timeToX(this.region.end, width);
      ctx.fillStyle = COLORS.region;
      ctx.fillRect(sx, 0, ex - sx, height);
      ctx.fillStyle = COLORS.regionEdge;
      ctx.fillRect(sx - 1, 0, 3, height);
      ctx.fillRect(ex - 1, 0, 3, height);
    }

    // Playhead
    const phx = this._timeToX(progressT, width);
    if (phx >= 0 && phx <= width) {
      ctx.fillStyle = COLORS.playhead;
      ctx.fillRect(phx - 1, 0, 2, height);
    }

    this._drawWords();
  };

  StudioWaveform.prototype._drawWords = function () {
    if (!this.lyricsTrack) return;
    if (!this.words || !this.words.length) {
      this.lyricsTrack.style.display = 'none';
      return;
    }
    this.lyricsTrack.style.display = '';
    const win = this._window();
    const width = this.canvasWrap.clientWidth || 600;
    const frag = [];
    const cur = this.time;
    for (let i = 0; i < this.words.length; i++) {
      const w = this.words[i];
      const ws = wordStart(w);
      const we = wordEnd(w);
      if (we < win.start || ws > win.end) continue;
      const x = ((ws - win.start) / win.visible) * width;
      const active = cur >= ws && cur <= we;
      frag.push('<span class="stw-word' + (active ? ' active' : '') + '" style="left:' +
        x.toFixed(1) + 'px" data-t="' + ws + '">' + escapeHtml(String(w.word || '')) + '</span>');
    }
    this.lyricsTrack.innerHTML = frag.join('');
    const self = this;
    this.lyricsTrack.querySelectorAll('.stw-word').forEach(function (el) {
      el.addEventListener('click', function () {
        const t = parseFloat(el.getAttribute('data-t'));
        self.time = t;
        self.draw();
        self.onSeek(t);
      });
    });
  };

  function wordStart(w) { return num(w.startS, w.start_s, w.start, 0); }
  function wordEnd(w) { return num(w.endS, w.end_s, w.end, wordStart(w) + 0.4); }
  function num() {
    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'number' && isFinite(arguments[i])) return arguments[i];
    }
    return 0;
  }

  // ────────────────────────────────────────────────────────────
  // Public Setter
  // ────────────────────────────────────────────────────────────

  StudioWaveform.prototype.setTime = function (t) {
    this.time = t || 0;
    this.draw();
  };

  StudioWaveform.prototype.setDuration = function (d) {
    if (d && isFinite(d)) { this.duration = d; this.draw(); }
  };

  StudioWaveform.prototype.setRegion = function (start, end) {
    this.region = this._clampRegion({ start: start, end: end });
    this._updateRegionLabel();
    this.draw();
    this.onRegionChange(this.region);
  };

  StudioWaveform.prototype.clearRegion = function () {
    this.region = null;
    this._updateRegionLabel();
    this.draw();
    this.onRegionChange(null);
  };

  StudioWaveform.prototype.setWords = function (alignedWords) {
    this.words = Array.isArray(alignedWords) && alignedWords.length ? alignedWords : null;
    this.draw();
  };

  StudioWaveform.prototype.setZoom = function (z) {
    this.zoom = Math.max(1, Math.min(32, z || 1));
    this.draw();
  };

  StudioWaveform.prototype.destroy = function () {
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this.container.innerHTML = '';
  };

  // ────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────

  function fmtTime(s) {
    s = Math.max(0, s || 0);
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function niceStep(visibleS) {
    const targets = [1, 2, 5, 10, 15, 30, 60, 120, 300];
    const ideal = visibleS / 8;
    for (let i = 0; i < targets.length; i++) {
      if (targets[i] >= ideal) return targets[i];
    }
    return 300;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  window.StudioWaveform = StudioWaveform;
  window.StudioWaveform.fmtTime = fmtTime;
})();
