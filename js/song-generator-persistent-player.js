/**
 * Persistenter Audio-Player für den Persönlichkeits-Song-Generator.
 * Überlebt UI-Neu-Render (innerHTML) und bleibt bis Pause/Stopp aktiv.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'sg_persistent_player_v1';
  var audio = null;
  var barEl = null;
  var titleEl = null;
  var pauseBtn = null;
  var stopBtn = null;
  var slotEl = null;
  var slotSource = null;
  var changeListeners = [];
  var saveTimer = null;

  var state = {
    url: '',
    meta: {},
    queue: [],
    index: 0,
    autoplayQueue: false,
    source: '',
    visible: false
  };

  function ensureAudio() {
    if (audio) return audio;
    audio = document.createElement('audio');
    audio.id = 'sg-persistent-audio';
    audio.className = 'sg-audio-player sg-persistent-audio-el';
    audio.setAttribute('playsinline', '');
    audio.setAttribute('webkit-playsinline', '');
    audio.preload = 'metadata';
    audio.controls = true;
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlaybackChange);
    audio.addEventListener('pause', onPlaybackChange);
    audio.addEventListener('timeupdate', scheduleSave);
    audio.addEventListener('loadedmetadata', applyMediaSession);
    document.body.appendChild(audio);
    return audio;
  }

  function ensureBar() {
    if (barEl) return barEl;
    barEl = document.createElement('div');
    barEl.id = 'sg-persistent-player-bar';
    barEl.className = 'sg-persistent-player';
    barEl.hidden = true;

    var inner = document.createElement('div');
    inner.className = 'sg-persistent-player-inner';

    titleEl = document.createElement('div');
    titleEl.className = 'sg-persistent-player-title';
    titleEl.textContent = 'Wiedergabe';

    var actions = document.createElement('div');
    actions.className = 'sg-persistent-player-actions';

    pauseBtn = document.createElement('button');
    pauseBtn.type = 'button';
    pauseBtn.className = 'sg-btn sg-btn-ghost sg-persistent-player-pause';
    pauseBtn.textContent = '⏸ Pause';
    pauseBtn.onclick = function () { togglePause(); };

    stopBtn = document.createElement('button');
    stopBtn.type = 'button';
    stopBtn.className = 'sg-btn sg-btn-ghost sg-persistent-player-stop';
    stopBtn.textContent = '⏹ Stopp';
    stopBtn.onclick = function () { stop(); };

    actions.append(pauseBtn, stopBtn);
    inner.append(titleEl, actions);
    barEl.append(inner);
    document.body.appendChild(barEl);
    return barEl;
  }

  function trackLabel(track) {
    if (!track) return 'Song';
    return track.customName || track.userTitle || track.label || track.title || 'Song';
  }

  function trackMeta(track, fallbackArtist) {
    return {
      title: trackLabel(track),
      artist: fallbackArtist || 'Persönlichkeits-Song Generator',
      album: 'Manuel Weiss',
      artwork: track && track.cover ? track.cover : undefined
    };
  }

  function applyMediaSession() {
    if (!('mediaSession' in navigator) || !audio) return;
    var meta = state.meta || {};
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.title || 'Persönlichkeitssong',
        artist: meta.artist || 'Persönlichkeits-Song Generator',
        album: meta.album || 'Manuel Weiss',
        artwork: meta.artwork ? [{ src: meta.artwork, sizes: '512x512', type: 'image/jpeg' }] : []
      });
      navigator.mediaSession.setActionHandler('play', function () { audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
      navigator.mediaSession.setActionHandler('seekbackward', function () {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
      });
      navigator.mediaSession.setActionHandler('seekforward', function () {
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
      });
    } catch (_e) {}
  }

  function updateBar() {
    ensureBar();
    if (!state.url) {
      barEl.hidden = true;
      document.body.classList.remove('sg-has-persistent-player');
      return;
    }
    barEl.hidden = false;
    document.body.classList.add('sg-has-persistent-player');
    var emoji = (state.queue[state.index] && state.queue[state.index].emoji) || '🎵';
    titleEl.textContent = (audio.paused ? '⏸ ' : '▶ ') + emoji + ' ' + (state.meta.title || 'Song');
    pauseBtn.textContent = audio.paused ? '▶ Weiter' : '⏸ Pause';
  }

  function notifyChange() {
    changeListeners.forEach(function (fn) {
      try { fn(getPublicState()); } catch (_e) {}
    });
  }

  function onPlaybackChange() {
    updateBar();
    notifyChange();
    scheduleSave();
  }

  function onEnded() {
    if (state.autoplayQueue && state.queue.length && state.index + 1 < state.queue.length) {
      playAtIndex(state.index + 1, { resume: true });
      return;
    }
    state.autoplayQueue = false;
    updateBar();
    notifyChange();
    scheduleSave();
  }

  function playAtIndex(index, opts) {
    opts = opts || {};
    var track = state.queue[index];
    if (!track || !track.url) return;
    ensureAudio();
    state.index = index;
    state.url = track.url;
    state.meta = trackMeta(track, state.meta.artist);
    if (audio.src !== track.url) audio.src = track.url;
    applyMediaSession();
    updateBar();
    notifyChange();
    if (opts.resume !== false) {
      audio.play().catch(function () {});
    }
    placeAudioElement();
    scheduleSave();
  }

  function play(options) {
    options = options || {};
    var track = options.track || {};
    var url = options.url || track.url;
    if (!url) return;

    ensureAudio();
    state.source = options.source || '';
    state.autoplayQueue = !!options.autoplayQueue;
    state.queue = Array.isArray(options.queue) && options.queue.length
      ? options.queue.slice()
      : [Object.assign({}, track, { url: url })];
    state.index = typeof options.index === 'number' ? options.index : 0;
    state.meta = options.meta || trackMeta(state.queue[state.index], options.artist);

    playAtIndex(state.index, { resume: options.autoPlay !== false });
  }

  function togglePause() {
    if (!audio || !state.url) return;
    if (audio.paused) audio.play().catch(function () {});
    else audio.pause();
  }

  function pause() {
    if (audio) audio.pause();
  }

  function stop() {
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      try { audio.load(); } catch (_e) {}
    }
    state.url = '';
    state.queue = [];
    state.index = 0;
    state.autoplayQueue = false;
    state.source = '';
    state.meta = {};
    slotSource = null;
    updateBar();
    notifyChange();
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_e) {}
    placeAudioElement();
  }

  function isActiveUrl(url) {
    return !!(url && state.url && state.url === url);
  }

  function isPlaying() {
    return !!(audio && state.url && !audio.paused);
  }

  function getPublicState() {
    return {
      url: state.url,
      source: state.source,
      index: state.index,
      queueLength: state.queue.length,
      autoplayQueue: state.autoplayQueue,
      paused: !audio || audio.paused,
      meta: Object.assign({}, state.meta)
    };
  }

  function onChange(fn) {
    if (typeof fn === 'function') changeListeners.push(fn);
    return function () {
      changeListeners = changeListeners.filter(function (f) { return f !== fn; });
    };
  }

  function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(function () {
      saveTimer = null;
      persistSession();
    }, 400);
  }

  function persistSession() {
    if (!state.url || !audio) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        url: state.url,
        currentTime: audio.currentTime || 0,
        paused: audio.paused,
        source: state.source,
        index: state.index,
        autoplayQueue: state.autoplayQueue,
        queue: state.queue.map(function (t) {
          return {
            url: t.url,
            title: t.title,
            label: t.label,
            customName: t.customName,
            userTitle: t.userTitle,
            emoji: t.emoji,
            cover: t.cover,
            duration: t.duration,
            intentId: t.intentId
          };
        }),
        meta: state.meta
      }));
    } catch (_e) {}
  }

  function restoreSession() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (!saved || !saved.url || !saved.queue || !saved.queue.length) return;
      state.source = saved.source || '';
      state.queue = saved.queue;
      state.index = saved.index || 0;
      state.autoplayQueue = !!saved.autoplayQueue;
      state.meta = saved.meta || trackMeta(state.queue[state.index]);
      ensureAudio();
      state.url = saved.url;
      audio.src = saved.url;
      audio.currentTime = saved.currentTime || 0;
      updateBar();
      if (!saved.paused) {
        audio.play().catch(function () {});
      }
    } catch (_e) {}
  }

  function placeAudioElement() {
    ensureAudio();
    if (slotEl && slotEl.isConnected) {
      slotEl.appendChild(audio);
      audio.classList.add('sg-persistent-audio-in-slot');
      audio.style.width = '100%';
      return;
    }
    audio.classList.remove('sg-persistent-audio-in-slot');
    audio.style.width = '';
    ensureBar();
    if (!barEl.querySelector('.sg-persistent-audio-wrap')) {
      var wrap = document.createElement('div');
      wrap.className = 'sg-persistent-audio-wrap';
      barEl.querySelector('.sg-persistent-player-inner').appendChild(wrap);
    }
    barEl.querySelector('.sg-persistent-audio-wrap').appendChild(audio);
  }

  /** Slot im UI – shared <audio> wird hier angezeigt, wenn sichtbar. */
  function mountSlot(container, options) {
    options = options || {};
    if (!container) return null;
    slotEl = container;
    slotSource = options.source || null;
    container.classList.add('sg-persistent-audio-slot');
    if (options.source && state.source && options.source !== state.source && state.url) {
      container.appendChild(elHint('Läuft im Player unten – andere Wiedergabe aktiv.'));
      return container;
    }
    placeAudioElement();
    if (state.url) updateBar();
    return container;
  }

  function resetSlot() {
    slotEl = null;
    slotSource = null;
    placeAudioElement();
  }

  function elHint(text) {
    var p = document.createElement('p');
    p.className = 'sg-hint sg-persistent-slot-hint';
    p.textContent = text;
    return p;
  }

  function syncActiveRows(root, rowSelector, activeClass) {
    if (!root || !state.url) return;
    root.querySelectorAll(rowSelector).forEach(function (row, i) {
      row.classList.toggle(activeClass || 'active', i === state.index);
    });
  }

  ensureBar();
  restoreSession();

  global.SongPersistentPlayer = {
    play: play,
    pause: pause,
    stop: stop,
    togglePause: togglePause,
    mountSlot: mountSlot,
    resetSlot: resetSlot,
    isActiveUrl: isActiveUrl,
    isPlaying: isPlaying,
    getState: getPublicState,
    onChange: onChange,
    syncActiveRows: syncActiveRows,
    getAudio: ensureAudio
  };
})(window);
