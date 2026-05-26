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

  /** Kurze Melodie – weniger Töne, länger halten, mittlerer Bereich */
  var DEFAULT_MELODY = [
    { midi: 57, durationMs: 2200, syllable: 'La' },
    { midi: 59, durationMs: 2200, syllable: 'la' },
    { midi: 60, durationMs: 2200, syllable: 'la' },
    { midi: 62, durationMs: 2800, syllable: 'La' }
  ];

  function cloneMelody(m) {
    return m.map(function (n) {
      return { midi: n.midi, durationMs: n.durationMs, syllable: n.syllable };
    });
  }

  function transposeMelody(m, semitones) {
    return m.map(function (n) {
      return {
        midi: n.midi + semitones,
        durationMs: n.durationMs,
        syllable: n.syllable
      };
    });
  }

  /** Gleicher Tonname in nächster Oktave zum Ziel – behebt Oktav-Fehler der Erkennung */
  function nearestMidiToTarget(detectedMidi, targetMidi) {
    if (detectedMidi == null || targetMidi == null) return null;
    var best = detectedMidi;
    var bestDiff = Infinity;
    var o;
    for (o = -36; o <= 36; o += 12) {
      var candidate = targetMidi + o;
      var diff = Math.abs(detectedMidi - candidate);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = candidate;
      }
    }
    return { midi: best, diffCents: bestDiff * 100 };
  }

  function median(arr) {
    if (!arr.length) return null;
    var s = arr.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  function mountPitchGuide(container, opts) {
    opts = opts || {};
    var baseMelody = cloneMelody(opts.melody || DEFAULT_MELODY);
    var melody = cloneMelody(baseMelody);
    var transpose = 0;
    var toleranceCents = opts.toleranceCents || 100;
    var detector = null;
    var running = false;
    var calibrating = false;
    var practiceStart = 0;
    var totalDuration = 0;
    var pitchHistory = [];
    var stats = { hits: 0, total: 0 };
    var canvas = null;
    var ctx = null;
    var rafId = null;
    var lastPitch = null;
    var statusEl = null;
    var calSamples = [];

    function recalcDuration() {
      totalDuration = melody.reduce(function (s, n) { return s + n.durationMs; }, 0);
    }
    recalcDuration();

    var wrap = document.createElement('div');
    wrap.className = 'sg-pitch-guide';

    var head = document.createElement('div');
    head.className = 'sg-pitch-guide-head';
    head.innerHTML = '<strong>🎼 Melodie zum Mitsingen</strong><span class="sg-pitch-guide-sub">Erst Tonhöhe kalibrieren, dann die grüne Linie nachsingend halten. Kopfhörer helfen.</span>';
    wrap.appendChild(head);

    statusEl = document.createElement('p');
    statusEl.className = 'sg-pitch-guide-status';
    statusEl.textContent = 'Tippe «Melodie üben» – sing danach einen bequemen «La»-Ton zur Kalibrierung.';
    wrap.appendChild(statusEl);

    var transposeRow = document.createElement('div');
    transposeRow.className = 'sg-pitch-transpose-row';
    var downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'sg-btn sg-btn-ghost sg-pitch-transpose-btn';
    downBtn.textContent = '♭ Tiefer';
    var upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'sg-btn sg-btn-ghost sg-pitch-transpose-btn';
    upBtn.textContent = '♯ Höher';
    var hearBtn = document.createElement('button');
    hearBtn.type = 'button';
    hearBtn.className = 'sg-btn sg-btn-ghost sg-pitch-transpose-btn';
    hearBtn.textContent = '🔊 Vorhörton';
    transposeRow.append(downBtn, upBtn, hearBtn);
    wrap.appendChild(transposeRow);

    canvas = document.createElement('canvas');
    canvas.className = 'sg-pitch-guide-canvas';
    wrap.appendChild(canvas);

    var info = document.createElement('div');
    info.className = 'sg-pitch-guide-info';
    info.innerHTML =
      '<div class="sg-pitch-guide-stat"><span class="sg-pitch-label">Zielton</span><span class="sg-pitch-target" id="sg-pg-target">—</span></div>' +
      '<div class="sg-pitch-guide-stat"><span class="sg-pitch-label">Du singst</span><span class="sg-pitch-current" id="sg-pg-current">—</span></div>' +
      '<div class="sg-pitch-guide-stat"><span class="sg-pitch-label">Abweichung</span><span class="sg-pitch-cents" id="sg-pg-cents">—</span></div>' +
      '<div class="sg-pitch-guide-stat"><span class="sg-pitch-label">Treffer</span><span class="sg-pitch-score" id="sg-pg-score">—</span></div>';
    wrap.appendChild(info);

    var syllables = document.createElement('div');
    syllables.className = 'sg-pitch-syllable-row';
    function renderSyllables() {
      syllables.innerHTML = '';
      melody.forEach(function (n, i) {
        var sp = document.createElement('span');
        sp.className = 'sg-pitch-syl';
        sp.textContent = n.syllable + ' (' + midiToNoteName(n.midi) + ')';
        sp.dataset.idx = String(i);
        syllables.appendChild(sp);
      });
    }
    renderSyllables();
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

    function applyTranspose(delta) {
      transpose += delta;
      melody = transposeMelody(baseMelody, transpose);
      recalcDuration();
      renderSyllables();
      drawFrame(0, null);
    }

    downBtn.onclick = function () { applyTranspose(-2); };
    upBtn.onclick = function () {
      applyTranspose(2);
    };
    hearBtn.onclick = function () {
      if (!detector) return;
      var note = melody[0];
      if (note) detector.playReferenceNote(note.midi, 700);
    };

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
      var centsEl = wrap.querySelector('#sg-pg-cents');
      var scoreEl = wrap.querySelector('#sg-pg-score');
      if (state && state.note) {
        if (targetEl) targetEl.textContent = midiToNoteName(state.note.midi);
      }
      syllables.querySelectorAll('.sg-pitch-syl').forEach(function (sp, i) {
        sp.classList.toggle('active', state && i === state.index);
      });

      if (data && data.tooQuiet) {
        if (currentEl) {
          currentEl.textContent = 'Zu leise';
          currentEl.className = 'sg-pitch-current miss';
        }
        if (centsEl) centsEl.textContent = '—';
        if (statusEl) statusEl.textContent = 'Sing etwas lauter und deutlicher «La» – Mikrofon nah am Mund.';
        return;
      }

      if (data && data.midi != null && state && state.note) {
        var match = nearestMidiToTarget(data.midi, state.note.midi);
        var diffCents = match ? match.diffCents : 999;
        if (currentEl) {
          currentEl.textContent = midiToNoteName(data.midi);
          currentEl.className = 'sg-pitch-current ' +
            (diffCents <= toleranceCents ? 'hit' : diffCents <= toleranceCents * 1.5 ? 'close' : 'miss');
        }
        if (centsEl) {
          var signed = Math.round(data.midi - state.note.midi);
          centsEl.textContent = (signed > 0 ? '+' : '') + Math.round((data.midi - state.note.midi) * 100) + ' ct';
          centsEl.className = 'sg-pitch-cents ' +
            (diffCents <= toleranceCents ? 'hit' : diffCents <= toleranceCents * 1.5 ? 'close' : 'miss');
        }
        if (statusEl && running && !calibrating) {
          if (diffCents <= toleranceCents) statusEl.textContent = '✓ Gut getroffen – Ton halten.';
          else if (diffCents <= toleranceCents * 1.5) statusEl.textContent = 'Fast – etwas ' + (data.midi < state.note.midi ? 'tiefer' : 'höher') + ' singen.';
          else statusEl.textContent = 'Ziel: ' + midiToNoteName(state.note.midi) + ' – du bist ' + (data.midi < state.note.midi ? 'zu tief' : 'zu hoch') + '.';
        }
      } else if (currentEl) {
        currentEl.textContent = calibrating ? '…' : '—';
        currentEl.className = 'sg-pitch-current';
        if (centsEl) centsEl.textContent = '—';
        if (statusEl && running && calibrating) {
          statusEl.textContent = 'Sing einen bequemen «La»-Ton (3 Sekunden) – normal laut, nicht flüstern.';
        }
      }

      if (scoreEl && !calibrating) {
        var pct = stats.total ? Math.round(stats.hits / stats.total * 100) : 0;
        scoreEl.textContent = stats.total ? pct + ' %' : '—';
        scoreEl.className = 'sg-pitch-score ' + (pct >= 60 ? 'good' : pct >= 35 ? 'ok' : '');
      }
    }

    function initCanvas() {
      if (!canvas) return;
      var w = canvas.offsetWidth || 320;
      var h = canvas.offsetHeight || 160;
      canvas.width = w * 2;
      canvas.height = h * 2;
      ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(2, 2);
    }

    function drawFrame(elapsed, data) {
      if (!ctx || !canvas) return;
      var w = canvas.offsetWidth || 320;
      var h = canvas.offsetHeight || 160;
      var midis = melody.map(function (n) { return n.midi; });
      var minMidi = Math.min.apply(null, midis) - 3;
      var maxMidi = Math.max.apply(null, midis) + 3;
      var range = maxMidi - minMidi || 1;

      function midiToY(m) {
        return h - ((m - minMidi) / range) * (h - 16) - 8;
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      for (var g = Math.ceil(minMidi); g <= Math.floor(maxMidi); g++) {
        var gy = midiToY(g);
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

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

      x = 0;
      melody.forEach(function (n) {
        var cx = ((x + n.durationMs / 2) / totalDuration) * w;
        x += n.durationMs;
        ctx.beginPath();
        ctx.arc(cx, midiToY(n.midi), 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.fill();
      });

      if (running && !calibrating) {
        var progressX = Math.min(elapsed / totalDuration, 1) * w;
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, h);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      var state = running && !calibrating ? getMelodyState(elapsed) : { note: melody[0], index: 0 };
      if (state && state.note) {
        var ty = midiToY(state.note.midi);
        var tol = toleranceCents / 100;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
        ctx.fillRect(0, ty - (tol / range) * h * 0.5, w, (tol / range) * h);
      }

      if (running) {
        pitchHistory.push({ t: elapsed, midi: data && data.midi != null ? data.midi : null });
        if (pitchHistory.length > 150) pitchHistory.shift();
      }

      if (pitchHistory.length > 1) {
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        var started = false;
        pitchHistory.forEach(function (p) {
          if (p.midi == null) return;
          var px = calibrating ? w - 20 : Math.min(p.t / totalDuration, 1) * w;
          var py = midiToY(p.midi);
          if (!started) { ctx.moveTo(px, py); started = true; }
          else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = '#818cf8';
        ctx.stroke();

        var last = pitchHistory[pitchHistory.length - 1];
        if (last.midi != null && state && state.note) {
          var lx = calibrating ? w - 20 : Math.min(last.t / totalDuration, 1) * w;
          var ly = midiToY(last.midi);
          var match = nearestMidiToTarget(last.midi, state.note.midi);
          var diff = match ? match.diffCents / 100 : 99;
          var col = diff <= toleranceCents / 100 ? '#22c55e' : diff <= (toleranceCents * 1.5) / 100 ? '#eab308' : '#ef4444';
          ctx.beginPath();
          ctx.arc(lx, ly, 8, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
        }
      }
    }

    function tick() {
      if (!running) return;
      if (calibrating) {
        drawFrame(0, lastPitch);
        updateInfo({ note: melody[0], index: 0 }, lastPitch);
        rafId = requestAnimationFrame(tick);
        return;
      }
      var elapsed = Date.now() - practiceStart;
      if (elapsed >= totalDuration) {
        stopPractice(true);
        return;
      }
      var state = getMelodyState(elapsed);
      drawFrame(elapsed, lastPitch);
      updateInfo(state, lastPitch);
      rafId = requestAnimationFrame(tick);
    }

    function scorePitch(data, targetMidi) {
      if (!data || data.midi == null || !targetMidi) return;
      var match = nearestMidiToTarget(data.midi, targetMidi);
      if (!match) return;
      stats.total++;
      if (match.diffCents <= toleranceCents) stats.hits++;
    }

    async function runCalibration() {
      calibrating = true;
      stats = { hits: 0, total: 0 };
      pitchHistory = [];
      calSamples = [];
      var start = Date.now();
      statusEl.textContent = 'Sing einen bequemen «La»-Ton – 3 Sekunden …';

      return new Promise(function (resolve) {
        var iv = setInterval(function () {
          var left = Math.max(0, 3 - Math.floor((Date.now() - start) / 1000));
          if (left > 0) {
            statusEl.textContent = 'Sing «La» in deiner normalen Tonhöhe … ' + left + ' s';
          }
        }, 250);

        setTimeout(function () {
          clearInterval(iv);
          calibrating = false;
          if (calSamples.length >= 5) {
            var med = median(calSamples);
            var shift = Math.round(med - melody[0].midi);
            if (Math.abs(shift) >= 1) {
              transpose += shift;
              melody = transposeMelody(baseMelody, transpose);
              recalcDuration();
              renderSyllables();
              statusEl.textContent = 'Tonhöhe angepasst (±' + Math.abs(shift) + ' Halbtöne). Jetzt Melodie nachsingend.';
            } else {
              statusEl.textContent = 'Tonhöhe passt. Sing jetzt die Melodie – jeden Ton ca. 2 s halten.';
            }
          } else {
            statusEl.textContent = 'Wenig Signal – sing lauter oder Mikrofon näher. Melodie startet trotzdem.';
          }
          resolve();
        }, 3200);
      });
    }

    async function startPractice() {
      if (running) return;
      if (typeof PitchDetector === 'undefined') {
        alert('Pitch-Erkennung nicht geladen – Seite neu laden.');
        return;
      }
      try {
        if (!detector) {
          detector = new PitchDetector();
          await detector.init({
            forVoice: true,
            threshold: 0.12,
            minClarity: 0.28,
            rmsThreshold: 0.004,
            minFreq: 80,
            maxFreq: 1200
          });
        }
        pitchHistory = [];
        practiceStart = Date.now();
        running = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        downBtn.disabled = true;
        upBtn.disabled = true;

        detector.start(function (data) {
          lastPitch = data;
          if (calibrating) {
            if (data.midi != null && !data.tooQuiet) calSamples.push(data.midi);
            return;
          }
          var elapsed = Date.now() - practiceStart;
          var state = getMelodyState(elapsed);
          if (data.midi != null && state && state.note) scorePitch(data, state.note.midi);
        });

        await runCalibration();
        practiceStart = Date.now();
        pitchHistory = [];
        stats = { hits: 0, total: 0 };
        if (statusEl) statusEl.textContent = 'Los – halte jeden grünen Ton, bis der Cursor weitergeht.';
        rafId = requestAnimationFrame(tick);
      } catch (err) {
        alert('Mikrofon für Pitch-Guide: ' + (err.message || 'Bitte Berechtigung erlauben.'));
        running = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        downBtn.disabled = false;
        upBtn.disabled = false;
      }
    }

    function stopPractice(finished) {
      running = false;
      calibrating = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (detector) detector.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
      downBtn.disabled = false;
      upBtn.disabled = false;
      if (finished && statusEl) {
        var pct = stats.total ? Math.round(stats.hits / stats.total * 100) : 0;
        statusEl.textContent = 'Übung fertig (' + pct + ' % Treffer). Jetzt Stimmprobe aufnehmen.';
      }
      drawFrame(0, lastPitch);
    }

    function destroy() {
      stopPractice(false);
      if (detector) {
        detector.destroy();
        detector = null;
      }
    }

    startBtn.onclick = startPractice;
    stopBtn.onclick = function () { stopPractice(false); };

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
