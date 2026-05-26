/**
 * Pitch-Guide für Stimmprobe – Melodielinie + Echtzeit-Treffer-Feedback
 * Nutzt PitchDetector (YIN) aus pitch-detector.js
 */
(function (global) {
  'use strict';

  var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  function midiToNoteName(midi) {
    var m = Math.round(midi);
    return NOTE_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  }

  /** Einfache «La-la-la»-Melodie – mittlerer Bereich, für Stimmprobe geeignet */
  var DEFAULT_MELODY = [
    { midi: 60, durationMs: 1400, syllable: 'La' },
    { midi: 62, durationMs: 1400, syllable: 'la' },
    { midi: 64, durationMs: 1400, syllable: 'la' },
    { midi: 65, durationMs: 1400, syllable: 'la' },
    { midi: 67, durationMs: 1800, syllable: 'La' },
    { midi: 64, durationMs: 1400, syllable: 'la' },
    { midi: 62, durationMs: 1400, syllable: 'la' },
    { midi: 60, durationMs: 1800, syllable: 'La' }
  ];

  function mountPitchGuide(container, opts) {
    opts = opts || {};
    var melody = opts.melody || DEFAULT_MELODY;
    var toleranceCents = opts.toleranceCents || 80;
    var detector = null;
    var running = false;
    var practiceStart = 0;
    var totalDuration = melody.reduce(function (s, n) { return s + n.durationMs; }, 0);
    var pitchHistory = [];
    var stats = { hits: 0, total: 0 };
    var canvas = null;
    var ctx = null;
    var rafId = null;

    var wrap = document.createElement('div');
    wrap.className = 'sg-pitch-guide';

    var head = document.createElement('div');
    head.className = 'sg-pitch-guide-head';
    head.innerHTML = '<strong>🎼 Melodie zum Mitsingen</strong><span class="sg-pitch-guide-sub">Sing die grüne Linie nach – deine Stimme erscheint in Farbe.</span>';
    wrap.appendChild(head);

    canvas = document.createElement('canvas');
    canvas.className = 'sg-pitch-guide-canvas';
    wrap.appendChild(canvas);

    var info = document.createElement('div');
    info.className = 'sg-pitch-guide-info';
    info.innerHTML =
      '<div class="sg-pitch-guide-stat"><span class="sg-pitch-label">Zielton</span><span class="sg-pitch-target" id="sg-pg-target">—</span></div>' +
      '<div class="sg-pitch-guide-stat"><span class="sg-pitch-label">Du singst</span><span class="sg-pitch-current" id="sg-pg-current">—</span></div>' +
      '<div class="sg-pitch-guide-stat"><span class="sg-pitch-label">Text</span><span class="sg-pitch-syllable" id="sg-pg-syllable">La la la …</span></div>' +
      '<div class="sg-pitch-guide-stat"><span class="sg-pitch-label">Treffer</span><span class="sg-pitch-score" id="sg-pg-score">—</span></div>';
    wrap.appendChild(info);

    var syllables = document.createElement('div');
    syllables.className = 'sg-pitch-syllable-row';
    melody.forEach(function (n, i) {
      var sp = document.createElement('span');
      sp.className = 'sg-pitch-syl';
      sp.textContent = n.syllable;
      sp.dataset.idx = String(i);
      syllables.appendChild(sp);
    });
    wrap.appendChild(syllables);

    var btnRow = document.createElement('div');
    btnRow.className = 'sg-pitch-guide-btns';
    var startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.className = 'sg-btn sg-btn-secondary';
    startBtn.textContent = '▶ Melodie üben';
    var stopBtn = document.createElement('button');
    stopBtn.type = 'button';
    stopBtn.className = 'sg-btn sg-btn-ghost';
    stopBtn.textContent = '■ Stop';
    stopBtn.disabled = true;
    btnRow.append(startBtn, stopBtn);
    wrap.appendChild(btnRow);

    if (container) container.appendChild(wrap);

    function getMelodyState(elapsed) {
      var t = 0;
      for (var i = 0; i < melody.length; i++) {
        t += melody[i].durationMs;
        if (elapsed < t) {
          return { index: i, note: melody[i], elapsedInNote: elapsed - (t - melody[i].durationMs) };
        }
      }
      return { index: melody.length - 1, note: melody[melody.length - 1], done: true };
    }

    function updateInfo(state, data) {
      var targetEl = wrap.querySelector('#sg-pg-target');
      var currentEl = wrap.querySelector('#sg-pg-current');
      var syllEl = wrap.querySelector('#sg-pg-syllable');
      var scoreEl = wrap.querySelector('#sg-pg-score');
      if (state && state.note) {
        if (targetEl) targetEl.textContent = midiToNoteName(state.note.midi);
        if (syllEl) syllEl.textContent = state.note.syllable;
      }
      syllables.querySelectorAll('.sg-pitch-syl').forEach(function (sp, i) {
        sp.classList.toggle('active', state && i === state.index);
      });
      if (data && data.midi != null) {
        if (currentEl) {
          currentEl.textContent = data.noteName || midiToNoteName(data.midi);
          var diff = Math.abs(data.midi - (state && state.note ? state.note.midi : data.midi)) * 100;
          currentEl.className = 'sg-pitch-current ' +
            (diff <= toleranceCents ? 'hit' : diff <= toleranceCents * 2 ? 'close' : 'miss');
        }
      } else if (currentEl) {
        currentEl.textContent = '—';
        currentEl.className = 'sg-pitch-current';
      }
      if (scoreEl) {
        var pct = stats.total ? Math.round(stats.hits / stats.total * 100) : 0;
        scoreEl.textContent = stats.total ? pct + ' %' : '—';
        scoreEl.className = 'sg-pitch-score ' + (pct >= 70 ? 'good' : pct >= 40 ? 'ok' : '');
      }
    }

    function initCanvas() {
      if (!canvas) return;
      var w = canvas.offsetWidth || 320;
      var h = canvas.offsetHeight || 140;
      canvas.width = w * 2;
      canvas.height = h * 2;
      ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(2, 2);
    }

    function drawFrame(elapsed, data) {
      if (!ctx || !canvas) return;
      var w = canvas.offsetWidth || 320;
      var h = canvas.offsetHeight || 140;
      var midis = melody.map(function (n) { return n.midi; });
      var minMidi = Math.min.apply(null, midis) - 2;
      var maxMidi = Math.max.apply(null, midis) + 2;
      var range = maxMidi - minMidi || 1;

      function midiToY(m) {
        return h - ((m - minMidi) / range) * (h - 16) - 8;
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Raster-Linien
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      for (var g = Math.ceil(minMidi); g <= Math.floor(maxMidi); g++) {
        var gy = midiToY(g);
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Ziel-Melodie (grüne Linie)
      var x = 0;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      melody.forEach(function (n, i) {
        var x0 = (x / totalDuration) * w;
        x += n.durationMs;
        var x1 = (x / totalDuration) * w;
        var y = midiToY(n.midi);
        if (i === 0) ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
      });
      ctx.stroke();

      // Notenpunkte auf der Linie
      x = 0;
      melody.forEach(function (n) {
        var cx = ((x + n.durationMs / 2) / totalDuration) * w;
        x += n.durationMs;
        ctx.beginPath();
        ctx.arc(cx, midiToY(n.midi), 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.fill();
      });

      // Fortschritts-Cursor
      var progressX = Math.min(elapsed / totalDuration, 1) * w;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Aktuelle Zielzone
      var state = getMelodyState(elapsed);
      if (state && state.note) {
        var ty = midiToY(state.note.midi);
        var tol = toleranceCents / 100;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
        ctx.fillRect(0, ty - (tol / range) * h, w, (2 * tol / range) * h);
      }

      // Nutzer-Pitch-Verlauf
      pitchHistory.push({ t: elapsed, midi: data && data.midi != null ? data.midi : null });
      if (pitchHistory.length > 120) pitchHistory.shift();

      if (pitchHistory.length > 1) {
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        var started = false;
        pitchHistory.forEach(function (p) {
          if (p.midi == null) return;
          var px = Math.min(p.t / totalDuration, 1) * w;
          var py = midiToY(p.midi);
          if (!started) { ctx.moveTo(px, py); started = true; }
          else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = '#818cf8';
        ctx.stroke();

        var last = pitchHistory[pitchHistory.length - 1];
        if (last.midi != null && state && state.note) {
          var lx = Math.min(last.t / totalDuration, 1) * w;
          var ly = midiToY(last.midi);
          var diff = Math.abs(last.midi - state.note.midi);
          var col = diff <= toleranceCents / 100 ? '#22c55e' : diff <= (toleranceCents * 2) / 100 ? '#eab308' : '#ef4444';
          ctx.beginPath();
          ctx.arc(lx, ly, 7, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
        }
      }
    }

    function tick() {
      if (!running) return;
      var elapsed = Date.now() - practiceStart;
      if (elapsed >= totalDuration) {
        stopPractice();
        return;
      }
      var state = getMelodyState(elapsed);
      drawFrame(elapsed, lastPitch);
      updateInfo(state, lastPitch);

      var prevIdx = tick._lastIdx;
      if (state.index !== prevIdx && detector && state.note) {
        detector.playReferenceNote(state.note.midi, Math.min(state.note.durationMs, 800));
      }
      tick._lastIdx = state.index;

      rafId = requestAnimationFrame(tick);
    }

    var lastPitch = null;

    async function startPractice() {
      if (running) return;
      if (typeof PitchDetector === 'undefined') {
        alert('Pitch-Erkennung nicht geladen – Seite neu laden.');
        return;
      }
      try {
        if (!detector) {
          detector = new PitchDetector();
          await detector.init();
        }
        stats = { hits: 0, total: 0 };
        pitchHistory = [];
        practiceStart = Date.now();
        tick._lastIdx = -1;
        running = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;

        detector.start(function (data) {
          lastPitch = data;
          var elapsed = Date.now() - practiceStart;
          var state = getMelodyState(elapsed);
          if (data.midi != null && state && state.note) {
            stats.total++;
            if (Math.abs(data.midi - state.note.midi) * 100 <= toleranceCents) stats.hits++;
          }
        });

        if (melody[0] && detector) {
          detector.playReferenceNote(melody[0].midi, 600);
        }
        rafId = requestAnimationFrame(tick);
      } catch (err) {
        alert('Mikrofon für Pitch-Guide: ' + (err.message || 'Berechtigung fehlt'));
        running = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
      }
    }

    function stopPractice() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (detector) detector.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
      drawFrame(Math.min(Date.now() - practiceStart, totalDuration), lastPitch);
    }

    function destroy() {
      stopPractice();
      if (detector) {
        detector.destroy();
        detector = null;
      }
    }

    startBtn.onclick = startPractice;
    stopBtn.onclick = stopPractice;

    window.addEventListener('resize', initCanvas);
    setTimeout(initCanvas, 50);
    drawFrame(0, null);

    return {
      element: wrap,
      start: startPractice,
      stop: stopPractice,
      destroy: destroy,
      getStats: function () {
        return {
          hits: stats.hits,
          total: stats.total,
          percent: stats.total ? Math.round(stats.hits / stats.total * 100) : 0
        };
      },
      getMelody: function () { return melody.slice(); }
    };
  }

  global.SongPitchGuide = {
    mount: mountPitchGuide,
    DEFAULT_MELODY: DEFAULT_MELODY,
    midiToNoteName: midiToNoteName
  };
})(window);
