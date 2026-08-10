/**
 * Musik-Studio – Hauptapp
 *
 * Bibliothek (alle Song-Quellen) → Projekt mit Versionskette (nicht-destruktiv)
 * → Waveform + Transport → Bearbeitungs-Aktionen (Replace/Extend/Cover/
 * Vocals/Instrumental/WAV) → Stem-Mixer → KI-Assistent.
 *
 * Abhängigkeiten (window): StudioAPI, StudioWaveform, StudioMixer, StudioAI,
 * SongMusicEngine (Suno-Key), optional SongGeneratorCloud (Cloud-Bibliothek).
 */
(function () {
  'use strict';

  const PROJECTS_KEY = 'sg_studio_projects_v1';
  const CLOUD_STEP = 'studioProjects';

  const SRC_KEYS = {
    audio: 'sg_audio_v1',
    playlist: 'sg_playlist_v1',
    favorites: 'sg_favorites_v1',
    song: 'sg_song_v1'
  };

  const STEM_ADVANCED_NAMES = [
    'Lead Vocal', 'Backing Vocals', 'Drum Kit', 'Bass', 'Guitar', 'Electric Guitar',
    'Acoustic Guitar', 'Piano', 'Keyboards', 'Synth', 'String Section', 'Brass Section',
    'Woodwinds', 'Percussion', 'Sound Effects', 'Organ', 'Choir', 'Violin', 'Cello',
    'Saxophone', 'Trumpet', 'Flute', 'Harp', 'Accordion', 'Ukulele', 'Banjo', 'Mandolin'
  ];

  const COST_HINTS = {
    replace_section: 'kostet Credits wie eine normale Generierung',
    extend: 'kostet Credits wie eine normale Generierung',
    cover: 'kostet Credits wie eine normale Generierung',
    add_vocals: 'kostet Credits wie eine normale Generierung',
    add_instrumental: 'kostet Credits wie eine normale Generierung',
    separate_vocal: 'ca. 10 Credits',
    split_stem: 'ca. 20–50 Credits',
    split_stem_advanced: 'ca. 20–50 Credits',
    wav: 'geringe Kosten'
  };

  function loadJson(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) { return null; }
  }

  function saveJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_e) {}
  }

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtTime(s) { return window.StudioWaveform.fmtTime(s); }

  function uid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function trackUrl(t) {
    return t && (t.audio_url || t.audioUrl || t.url ||
      t.source_audio_url || t.sourceAudioUrl ||
      t.stream_audio_url || t.streamAudioUrl) || '';
  }

  // ══════════════════════════════════════════════════════════════
  // MusicStudio
  // ══════════════════════════════════════════════════════════════

  function MusicStudio(rootId) {
    this.root = document.getElementById(rootId);
    if (!this.root) throw new Error('Root-Element nicht gefunden: ' + rootId);

    this.library = [];
    this.projects = loadJson(PROJECTS_KEY) || {};
    this.current = null;          // aktuelles Projekt
    this.tasks = [];              // laufende/fertige Studio-Tasks
    this.credits = null;
    this.activeTab = 'edit';
    this.region = null;
    this._taskRunId = 0;
    this.audioEl = new Audio();
    this.audioEl.crossOrigin = 'anonymous';
    this.audioEl.preload = 'metadata';
    this.mixer = null;
    this.waveform = null;
    this._libFilter = '';

    this._buildLayout();
    this._bindTransport();
    const self = this;
    this._loadLibrary().then(function () { self._openFromUrl(); });
    this._refreshCredits();
    this._loadCloudProjects();
  }

  /** Deep-Link: musik-studio.html?open=<audio-url> öffnet den Song direkt. */
  MusicStudio.prototype._openFromUrl = function () {
    try {
      const url = new URLSearchParams(window.location.search).get('open');
      if (!url) return;
      const item = this.library.find(function (it) { return it.url === url; });
      if (item) this.openSong(item);
      else {
        this.openSong({
          id: 'link-' + uid(),
          source: 'Direktlink',
          title: 'Verlinkter Song',
          url: url
        });
      }
    } catch (_e) {}
  };

  // ────────────────────────────────────────────────────────────
  // Layout (einmalig; Panels werden gezielt aktualisiert)
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype._buildLayout = function () {
    this.root.innerHTML =
      '<div class="ms-app">' +
        '<div class="ms-topbar">' +
          '<div class="ms-topbar-title"><i class="fas fa-sliders-h"></i> Musik-Studio</div>' +
          '<div class="ms-topbar-song" id="msCurrentTitle">Kein Song geladen</div>' +
          '<div class="ms-topbar-right">' +
            '<span class="ms-credits" id="msCredits" title="Suno-Credits">–</span>' +
            '<a class="ms-btn ms-btn-ghost" href="persoenlichkeits-song-generator.html"><i class="fas fa-magic"></i> Zum Generator</a>' +
          '</div>' +
        '</div>' +
        '<div class="ms-body">' +
          '<aside class="ms-library">' +
            '<div class="ms-panel-head">Song-Bibliothek</div>' +
            '<input type="search" class="ms-lib-search" id="msLibSearch" placeholder="Suchen …">' +
            '<div class="ms-lib-list" id="msLibList"><div class="ms-empty">Lade Bibliothek …</div></div>' +
          '</aside>' +
          '<section class="ms-center">' +
            '<div class="ms-versions" id="msVersions"></div>' +
            '<div class="ms-waveform" id="msWaveform"></div>' +
            '<div class="ms-tabs">' +
              '<button class="ms-tab active" data-tab="edit"><i class="fas fa-cut"></i> Bearbeiten</button>' +
              '<button class="ms-tab" data-tab="stems"><i class="fas fa-layer-group"></i> Stems &amp; Mixer</button>' +
              '<button class="ms-tab ms-tab-ai-mobile" data-tab="ai"><i class="fas fa-robot"></i> KI</button>' +
            '</div>' +
            '<div class="ms-tab-content" id="msTabEdit"></div>' +
            '<div class="ms-tab-content" id="msTabStems" style="display:none;"></div>' +
            '<div class="ms-tab-content ms-tab-ai-mobile-content" id="msTabAiMobile" style="display:none;"></div>' +
            '<div class="ms-tasks" id="msTasks"></div>' +
          '</section>' +
          '<aside class="ms-ai" id="msAiPanel">' +
            '<div class="ms-panel-head"><i class="fas fa-robot"></i> KI-Assistent</div>' +
            '<div class="ms-ai-body" id="msAiBody"></div>' +
          '</aside>' +
        '</div>' +
        '<div class="ms-transport">' +
          '<button class="ms-btn ms-play" id="msPlayBtn" disabled><i class="fas fa-play"></i></button>' +
          '<span class="ms-time" id="msTime">0:00 / 0:00</span>' +
          '<input type="range" class="ms-seek" id="msSeek" min="0" max="1000" value="0" disabled>' +
          '<input type="range" class="ms-vol" id="msVol" min="0" max="100" value="90" title="Lautstärke">' +
          '<a class="ms-btn ms-btn-ghost" id="msDownload" style="display:none;" download><i class="fas fa-download"></i> MP3</a>' +
        '</div>' +
      '</div>';

    const self = this;
    this.root.querySelectorAll('.ms-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { self._switchTab(btn.getAttribute('data-tab')); });
    });
    const search = document.getElementById('msLibSearch');
    search.addEventListener('input', function () {
      self._libFilter = search.value.toLowerCase();
      self.renderLibrary();
    });

    this.waveform = new window.StudioWaveform(document.getElementById('msWaveform'), {
      onSeek: function (t) { self._seekTo(t); },
      onRegionChange: function (r) {
        self.region = r;
        self._syncRegionForm();
      }
    });

    this.renderEditTab();
    this.renderStemsTab();
    this.renderAiPanel();
    this.renderVersions();
    this.renderTasks();
  };

  MusicStudio.prototype._switchTab = function (tab) {
    this.activeTab = tab;
    this.root.querySelectorAll('.ms-tab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });
    document.getElementById('msTabEdit').style.display = tab === 'edit' ? '' : 'none';
    document.getElementById('msTabStems').style.display = tab === 'stems' ? '' : 'none';
    document.getElementById('msTabAiMobile').style.display = tab === 'ai' ? '' : 'none';
    if (tab === 'ai') this.renderAiPanel();
    if (tab !== 'stems' && this.mixer && this.mixer.playing) this.mixer.pause();
    if (tab === 'stems' && !this.audioEl.paused) this.audioEl.pause();
  };

  // ────────────────────────────────────────────────────────────
  // Bibliothek
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype._loadLibrary = async function () {
    const items = [];
    const seen = {};

    function add(item) {
      if (!item.url || seen[item.url]) return;
      seen[item.url] = true;
      items.push(item);
    }

    // 1) Aktuelle Produktion (mit taskId + audioId → volle Bearbeitung)
    const audio = loadJson(SRC_KEYS.audio);
    if (audio && Array.isArray(audio.tracks)) {
      audio.tracks.forEach(function (t, i) {
        const url = trackUrl(t);
        if (!url) return;
        add({
          id: 'audio-' + (t.id || i),
          source: 'Aktuelle Produktion',
          title: t.userTitle || t.title || 'Variante ' + (i + 1),
          url: url,
          cover: t.image_url || t.imageUrl || '',
          duration: t.duration,
          taskId: audio.taskId || null,
          audioId: t.id || null,
          model: audio.model || 'V5_5',
          style: t.tags || ''
        });
      });
    }

    // 2) Playlist
    const playlist = loadJson(SRC_KEYS.playlist);
    if (playlist && Array.isArray(playlist.tracks)) {
      playlist.tracks.forEach(function (t, i) {
        if (!t || t.status !== 'ok' || !t.url) return;
        add({
          id: 'pl-' + i,
          source: 'Playlist',
          title: t.title || t.label || 'Playlist-Track ' + (i + 1),
          url: t.url,
          cover: t.cover || '',
          duration: t.duration,
          model: playlist.model || 'V5_5'
        });
      });
    }

    // 3) Favoriten
    const favorites = loadJson(SRC_KEYS.favorites);
    if (Array.isArray(favorites)) {
      favorites.forEach(function (f, i) {
        if (!f || !f.url) return;
        add({
          id: 'fav-' + (f.id || i),
          source: 'Favoriten',
          title: f.title || 'Favorit ' + (i + 1),
          url: f.url,
          cover: f.cover || '',
          duration: f.duration
        });
      });
    }

    // 4) Studio-Projekte (frühere Bearbeitungen)
    const projects = this.projects;
    Object.keys(projects).forEach(function (pid) {
      const p = projects[pid];
      const v = p.versions && p.versions[p.activeVersion || 0];
      if (v && v.url) {
        add({
          id: 'proj-' + pid,
          source: 'Studio-Projekte',
          title: p.title + ' (' + p.versions.length + ' Versionen)',
          url: v.url,
          cover: v.cover || '',
          duration: v.duration,
          projectId: pid
        });
      }
    });

    this.library = items;
    this.renderLibrary();

    // 5) Cloud-Bibliothek (async nachladen)
    try {
      if (window.SongGeneratorCloud && window.SongGeneratorCloud.isLoggedIn &&
          window.SongGeneratorCloud.isLoggedIn()) {
        const lib = await window.SongGeneratorCloud.loadAudioLibrary();
        const self = this;
        (lib.entries || []).forEach(function (entry, ei) {
          (entry.tracks || []).forEach(function (t, ti) {
            if (!t || !t.url || seen[t.url]) return;
            seen[t.url] = true;
            self.library.push({
              id: 'cloud-' + ei + '-' + ti,
              source: 'Cloud-Bibliothek',
              title: t.title || entry.title || 'Cloud-Song',
              url: t.url,
              cover: t.cover || '',
              duration: t.duration
            });
          });
        });
        this.renderLibrary();
      }
    } catch (err) {
      console.warn('[MusicStudio] Cloud-Bibliothek:', err.message);
    }
  };

  MusicStudio.prototype.renderLibrary = function () {
    const el = document.getElementById('msLibList');
    if (!el) return;
    const filter = this._libFilter;
    const items = this.library.filter(function (it) {
      return !filter || (it.title + ' ' + it.source).toLowerCase().indexOf(filter) >= 0;
    });
    if (!items.length) {
      el.innerHTML = '<div class="ms-empty">Keine Songs gefunden.<br>Erzeuge zuerst Songs im ' +
        '<a href="persoenlichkeits-song-generator.html">Song-Generator</a>.</div>';
      return;
    }
    const groups = {};
    items.forEach(function (it) {
      (groups[it.source] = groups[it.source] || []).push(it);
    });
    const self = this;
    const html = [];
    Object.keys(groups).forEach(function (src) {
      html.push('<div class="ms-lib-group">' + esc(src) + '</div>');
      groups[src].forEach(function (it) {
        const active = self.current && self.current.sourceUrl === it.url;
        const editable = it.taskId && it.audioId;
        html.push(
          '<div class="ms-lib-item' + (active ? ' active' : '') + '" data-id="' + esc(it.id) + '">' +
            (it.cover ? '<img class="ms-lib-cover" src="' + esc(it.cover) + '" alt="">' :
              '<span class="ms-lib-cover ms-lib-cover-ph"><i class="fas fa-music"></i></span>') +
            '<span class="ms-lib-meta">' +
              '<span class="ms-lib-title">' + esc(it.title) + '</span>' +
              '<span class="ms-lib-sub">' +
                (it.duration ? fmtTime(it.duration) : '') +
                (editable ? ' · <i class="fas fa-bolt" title="Volle Bearbeitung (taskId vorhanden)"></i>' : '') +
              '</span>' +
            '</span>' +
          '</div>'
        );
      });
    });
    el.innerHTML = html.join('');
    el.querySelectorAll('.ms-lib-item').forEach(function (node) {
      node.addEventListener('click', function () {
        const it = self.library.find(function (x) { return x.id === node.getAttribute('data-id'); });
        if (it) self.openSong(it);
      });
    });
  };

  // ────────────────────────────────────────────────────────────
  // Projekt öffnen / Versionen
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype.openSong = function (item) {
    // Bestehendes Projekt für diesen Song?
    let project = null;
    if (item.projectId && this.projects[item.projectId]) {
      project = this.projects[item.projectId];
    } else {
      const projects = this.projects;
      const found = Object.keys(projects).find(function (pid) {
        return projects[pid].sourceUrl === item.url;
      });
      if (found) project = projects[found];
    }

    if (!project) {
      project = {
        id: uid(),
        title: item.title,
        sourceUrl: item.url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versions: [{
          id: uid(),
          label: 'Original',
          action: 'original',
          createdAt: new Date().toISOString(),
          url: item.url,
          cover: item.cover || '',
          duration: item.duration || 0,
          taskId: item.taskId || null,
          audioId: item.audioId || null,
          model: item.model || 'V5_5',
          style: item.style || ''
        }],
        activeVersion: 0,
        stems: null,
        timestamps: null,
        aiHistory: []
      };
      this.projects[project.id] = project;
      this._saveProjects();
    }

    this.current = project;
    this.region = null;
    this._loadLyricsHint();
    this._activateVersion(project.activeVersion || 0);
    this.renderLibrary();
    this.renderEditTab();
    this.renderStemsTab();
    this.renderAiPanel();
  };

  /** Lyrics des aktuellen Generator-Songs übernehmen, falls dieses Projekt dazugehört. */
  MusicStudio.prototype._loadLyricsHint = function () {
    if (!this.current || this.current.lyrics) return;
    try {
      const audio = loadJson(SRC_KEYS.audio);
      const song = loadJson(SRC_KEYS.song);
      const v0 = this.current.versions[0];
      if (audio && song && v0.taskId && audio.taskId === v0.taskId &&
          window.SongMusicEngine && window.SongMusicEngine.buildLyricsFromSong) {
        this.current.lyrics = window.SongMusicEngine.buildLyricsFromSong(song);
        this._saveProjects();
      }
    } catch (_e) {}
  };

  MusicStudio.prototype._activeVersion = function () {
    if (!this.current) return null;
    return this.current.versions[this.current.activeVersion || 0] || this.current.versions[0];
  };

  MusicStudio.prototype._activateVersion = function (index) {
    if (!this.current) return;
    this.current.activeVersion = Math.max(0, Math.min(index, this.current.versions.length - 1));
    this._saveProjects();
    const v = this._activeVersion();

    document.getElementById('msCurrentTitle').textContent =
      this.current.title + ' – ' + v.label;

    // Transport
    this.audioEl.pause();
    this.audioEl.src = v.url;
    document.getElementById('msPlayBtn').disabled = false;
    document.getElementById('msSeek').disabled = false;
    const dl = document.getElementById('msDownload');
    dl.style.display = '';
    dl.href = v.url;
    dl.setAttribute('download', (this.current.title + ' - ' + v.label + '.mp3').replace(/[/\\]/g, '-'));

    // Waveform
    const self = this;
    this.waveform.load(v.url, v.duration).then(function () {
      if (!v.duration && self.waveform.duration) {
        v.duration = self.waveform.duration;
        self._saveProjects();
      }
    });
    // Timestamps zur Version?
    if (this.current.timestamps && this.current.timestamps.forVersionId === v.id) {
      this.waveform.setWords(this.current.timestamps.alignedWords);
    } else {
      this.waveform.setWords(null);
    }

    this.renderVersions();
    this.renderEditTab();
  };

  MusicStudio.prototype.renderVersions = function () {
    const el = document.getElementById('msVersions');
    if (!el) return;
    if (!this.current) {
      el.innerHTML = '<div class="ms-empty ms-empty-center">Wähle links einen Song aus der Bibliothek – ' +
        'jede Bearbeitung erzeugt hier eine neue Version, das Original bleibt erhalten.</div>';
      return;
    }
    const self = this;
    const html = this.current.versions.map(function (v, i) {
      const active = i === (self.current.activeVersion || 0);
      return '<button class="ms-version' + (active ? ' active' : '') + '" data-i="' + i + '" ' +
        'title="' + esc(v.action + ' · ' + new Date(v.createdAt).toLocaleString('de-CH')) + '">' +
        (i === 0 ? '<i class="fas fa-star"></i> ' : '') + esc(v.label) +
        '</button>';
    });
    el.innerHTML = '<span class="ms-versions-label">Versionen:</span>' + html.join('');
    el.querySelectorAll('.ms-version').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self._activateVersion(parseInt(btn.getAttribute('data-i'), 10));
      });
    });
  };

  MusicStudio.prototype._addVersion = function (data) {
    if (!this.current) return;
    const v = Object.assign({
      id: uid(),
      createdAt: new Date().toISOString()
    }, data);
    this.current.versions.push(v);
    this.current.updatedAt = new Date().toISOString();
    this._saveProjects();
    this._activateVersion(this.current.versions.length - 1);
    this.renderLibrary();
  };

  MusicStudio.prototype._saveProjects = function () {
    saveJson(PROJECTS_KEY, this.projects);
    this._scheduleCloudSave();
  };

  MusicStudio.prototype._scheduleCloudSave = function () {
    const self = this;
    if (this._cloudSaveTimer) clearTimeout(this._cloudSaveTimer);
    this._cloudSaveTimer = setTimeout(function () {
      try {
        if (window.SongGeneratorCloud && window.SongGeneratorCloud.writeStep &&
            window.SongGeneratorCloud.isLoggedIn()) {
          window.SongGeneratorCloud.writeStep(CLOUD_STEP, {
            projects: self.projects, updatedAt: new Date().toISOString()
          }).catch(function (e) { console.warn('[MusicStudio] Cloud-Save:', e.message); });
        }
      } catch (_e) {}
    }, 2500);
  };

  MusicStudio.prototype._loadCloudProjects = async function () {
    try {
      if (!(window.SongGeneratorCloud && window.SongGeneratorCloud.readStep &&
            window.SongGeneratorCloud.isLoggedIn())) return;
      const data = await window.SongGeneratorCloud.readStep(CLOUD_STEP);
      if (data && data.projects) {
        // Lokale Projekte gewinnen bei Konflikt (neuere updatedAt)
        const self = this;
        Object.keys(data.projects).forEach(function (pid) {
          const remote = data.projects[pid];
          const local = self.projects[pid];
          if (!local || (remote.updatedAt || '') > (local.updatedAt || '')) {
            self.projects[pid] = remote;
          }
        });
        saveJson(PROJECTS_KEY, this.projects);
        this._loadLibrary();
      }
    } catch (err) {
      console.warn('[MusicStudio] Cloud-Projekte:', err.message);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Transport
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype._bindTransport = function () {
    const self = this;
    const playBtn = document.getElementById('msPlayBtn');
    const seek = document.getElementById('msSeek');
    const vol = document.getElementById('msVol');
    const timeEl = document.getElementById('msTime');

    playBtn.addEventListener('click', function () {
      if (self.activeTab === 'stems' && self.mixer && self.mixer.tracks.length) {
        if (self.mixer.playing) self.mixer.pause();
        else self.mixer.play();
        self._updatePlayIcon();
        return;
      }
      if (self.audioEl.paused) self.audioEl.play().catch(function () {});
      else self.audioEl.pause();
    });

    this.audioEl.addEventListener('play', function () { self._updatePlayIcon(); });
    this.audioEl.addEventListener('pause', function () { self._updatePlayIcon(); });
    this.audioEl.addEventListener('timeupdate', function () {
      const d = self.audioEl.duration || (self.waveform ? self.waveform.duration : 0) || 0;
      const t = self.audioEl.currentTime || 0;
      timeEl.textContent = fmtTime(t) + ' / ' + fmtTime(d);
      if (!self._seekDragging && d) seek.value = Math.round((t / d) * 1000);
      if (self.waveform) self.waveform.setTime(t);
    });
    this.audioEl.addEventListener('loadedmetadata', function () {
      if (self.waveform && self.audioEl.duration) self.waveform.setDuration(self.audioEl.duration);
    });

    seek.addEventListener('input', function () { self._seekDragging = true; });
    seek.addEventListener('change', function () {
      self._seekDragging = false;
      const d = self.audioEl.duration || 0;
      if (d) self._seekTo((seek.value / 1000) * d);
    });
    vol.addEventListener('input', function () {
      self.audioEl.volume = vol.value / 100;
    });
    this.audioEl.volume = 0.9;
  };

  MusicStudio.prototype._updatePlayIcon = function () {
    const playBtn = document.getElementById('msPlayBtn');
    const playing = (this.activeTab === 'stems' && this.mixer) ?
      this.mixer.playing : !this.audioEl.paused;
    playBtn.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
  };

  MusicStudio.prototype._seekTo = function (t) {
    if (this.activeTab === 'stems' && this.mixer && this.mixer.tracks.length) {
      this.mixer.seek(t);
      return;
    }
    try { this.audioEl.currentTime = t; } catch (_e) {}
    if (this.waveform) this.waveform.setTime(t);
  };

  // ────────────────────────────────────────────────────────────
  // Credits
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype._refreshCredits = async function () {
    const el = document.getElementById('msCredits');
    try {
      this.credits = await window.StudioAPI.getCredits();
      el.innerHTML = '<i class="fas fa-coins"></i> ' + this.credits + ' Credits';
    } catch (err) {
      el.innerHTML = '<i class="fas fa-coins"></i> –';
      el.title = err.message;
    }
  };

  // ────────────────────────────────────────────────────────────
  // Task-Manager
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype._startTask = async function (label, runner) {
    const task = { id: uid(), label: label, status: 'running', info: 'gestartet …', startedAt: Date.now() };
    this.tasks.unshift(task);
    this.tasks = this.tasks.slice(0, 6);
    this.renderTasks();
    const self = this;
    const runId = ++this._taskRunId;
    try {
      const result = await runner({
        onTick: function (st) {
          task.info = st && st.transient ? ('Warte … (' + (st.error || '') + ')') :
            ('Status: ' + ((st && st.status) || 'PENDING'));
          self.renderTasks();
        },
        isCancelled: function () { return task.cancelled; }
      });
      if (task.cancelled) {
        task.status = 'cancelled';
        task.info = 'Abgebrochen';
      } else {
        task.status = 'done';
        task.info = 'Fertig (' + Math.round((Date.now() - task.startedAt) / 1000) + 's)';
      }
      this.renderTasks();
      this._refreshCredits();
      return task.cancelled ? null : result;
    } catch (err) {
      task.status = 'failed';
      task.info = err.message || String(err);
      this.renderTasks();
      this._refreshCredits();
      throw err;
    } finally {
      void runId;
    }
  };

  MusicStudio.prototype.renderTasks = function () {
    const el = document.getElementById('msTasks');
    if (!el) return;
    if (!this.tasks.length) { el.innerHTML = ''; return; }
    const self = this;
    el.innerHTML = '<div class="ms-panel-head">Aufgaben</div>' + this.tasks.map(function (t) {
      const icon = t.status === 'running' ? '<i class="fas fa-spinner fa-spin"></i>' :
        t.status === 'done' ? '<i class="fas fa-check" style="color:#34d399"></i>' :
        t.status === 'cancelled' ? '<i class="fas fa-ban" style="color:#fbbf24"></i>' :
        '<i class="fas fa-times" style="color:#f87171"></i>';
      return '<div class="ms-task">' + icon +
        '<span class="ms-task-label">' + esc(t.label) + '</span>' +
        '<span class="ms-task-info">' + esc(t.info) + '</span>' +
        (t.status === 'running' ?
          '<button class="ms-btn ms-btn-ghost ms-task-cancel" data-id="' + t.id + '">Abbrechen</button>' : '') +
        '</div>';
    }).join('');
    el.querySelectorAll('.ms-task-cancel').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const t = self.tasks.find(function (x) { return x.id === btn.getAttribute('data-id'); });
        if (t) { t.cancelled = true; t.info = 'Wird abgebrochen …'; self.renderTasks(); }
      });
    });
  };

  // ────────────────────────────────────────────────────────────
  // S3-Archivierung (dauerhafte URLs – Suno-CDN läuft ab)
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype._archiveUrl = async function (url, idHint) {
    try {
      if (!url || /manuel-weiss-public-media/.test(url)) return url;
      const apiBase = (window.AWS_CONFIG && window.AWS_CONFIG.apiBaseUrl) ||
        'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Download HTTP ' + resp.status);
      const blob = await resp.blob();
      if (!blob.size || blob.size > 9.5 * 1024 * 1024) throw new Error('Datei zu groß für Upload');
      const key = String(idHint || uid()).replace(/[^a-zA-Z0-9_-]/g, '') + '.mp3';
      const put = await fetch(apiBase + '/songs/' + encodeURIComponent(key), {
        method: 'PUT',
        headers: { 'Content-Type': 'audio/mpeg' },
        body: blob
      });
      if (!put.ok) throw new Error('Upload HTTP ' + put.status);
      return 'https://manuel-weiss-public-media.s3.eu-central-1.amazonaws.com/public/songs/' + key;
    } catch (err) {
      console.warn('[MusicStudio] S3-Archivierung fehlgeschlagen:', err.message);
      return url;
    }
  };

  // ────────────────────────────────────────────────────────────
  // Tab: Bearbeiten (Aktions-Formulare)
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype.renderEditTab = function () {
    const el = document.getElementById('msTabEdit');
    if (!el) return;
    if (!this.current) {
      el.innerHTML = '<div class="ms-empty ms-empty-center">Lade zuerst einen Song aus der Bibliothek.</div>';
      return;
    }
    const v = this._activeVersion();
    const hasIds = !!(v.taskId && v.audioId);
    const dur = v.duration || (this.waveform ? this.waveform.duration : 0) || 0;
    const style = v.style || '';
    const self = this;

    el.innerHTML =
      // Timestamps
      '<div class="ms-action-row">' +
        '<button class="ms-btn" id="msLoadTimestamps"' + (hasIds ? '' : ' disabled title="Nur für in der App erzeugte Songs (taskId nötig)"') + '>' +
          '<i class="fas fa-align-left"></i> Lyrics-Timestamps laden</button>' +
        '<span class="ms-hint">Zeigt die Wörter unter der Waveform – hilfreich, um Abschnitte exakt zu wählen.</span>' +
      '</div>' +

      // Replace Section
      '<details class="ms-action" open>' +
        '<summary><i class="fas fa-cut"></i> Abschnitt ersetzen <span class="ms-cost">' + COST_HINTS.replace_section + '</span></summary>' +
        '<div class="ms-form">' +
          '<p class="ms-hint">Wähle in der Waveform per Ziehen einen Abschnitt (6–60 s, max. 50 % des Songs). ' +
          'Der neue Abschnitt fügt sich nahtlos ins Original.</p>' +
          '<div class="ms-form-grid">' +
            '<label>Start (s)<input type="number" id="msRepStart" step="0.1" min="0" value="' + (this.region ? this.region.start.toFixed(1) : '') + '"></label>' +
            '<label>Ende (s)<input type="number" id="msRepEnd" step="0.1" min="0" value="' + (this.region ? this.region.end.toFixed(1) : '') + '"></label>' +
          '</div>' +
          '<label>Neue Lyrics für diesen Abschnitt<textarea id="msRepPrompt" rows="3" placeholder="Text, der im gewählten Abschnitt gesungen werden soll"></textarea></label>' +
          '<label>Stil-Tags<input type="text" id="msRepTags" value="' + esc(style) + '" placeholder="z. B. warm pop, emotional vocals"></label>' +
          '<label>Komplette Lyrics nach der Änderung<textarea id="msRepFull" rows="5" placeholder="Gesamter Songtext inkl. geändertem Abschnitt">' + esc(this.current.lyrics || '') + '</textarea></label>' +
          '<button class="ms-btn ms-btn-primary" id="msRepGo"><i class="fas fa-cut"></i> Abschnitt ersetzen</button>' +
          (hasIds ? '' : '<p class="ms-hint"><i class="fas fa-info-circle"></i> Kein taskId vorhanden – es wird die Upload-Variante mit der Audio-URL genutzt.</p>') +
        '</div>' +
      '</details>' +

      // Extend
      '<details class="ms-action">' +
        '<summary><i class="fas fa-arrows-alt-h"></i> Song verlängern <span class="ms-cost">' + COST_HINTS.extend + '</span></summary>' +
        '<div class="ms-form">' +
          '<div class="ms-form-grid">' +
            '<label>Fortsetzen ab (s)<input type="number" id="msExtAt" step="1" min="0" max="' + Math.max(0, Math.floor(dur)) + '" value="' + Math.max(0, Math.floor(dur * 0.9)) + '"></label>' +
            '<label>Titel<input type="text" id="msExtTitle" value="' + esc(this.current.title + ' (Extended)') + '"></label>' +
          '</div>' +
          '<label>Wie soll es weitergehen?<textarea id="msExtPrompt" rows="3" placeholder="Beschreibung oder Lyrics der Fortsetzung"></textarea></label>' +
          '<label>Stil<input type="text" id="msExtStyle" value="' + esc(style) + '" placeholder="z. B. uplifting pop, warm synths"></label>' +
          '<button class="ms-btn ms-btn-primary" id="msExtGo"><i class="fas fa-arrows-alt-h"></i> Verlängern</button>' +
        '</div>' +
      '</details>' +

      // Cover
      '<details class="ms-action">' +
        '<summary><i class="fas fa-sync-alt"></i> Cover / Umstylen <span class="ms-cost">' + COST_HINTS.cover + '</span></summary>' +
        '<div class="ms-form">' +
          '<p class="ms-hint">Die Melodie bleibt erhalten, der Stil wird neu – z. B. Akustik-Version, Orchester, Lo-Fi.</p>' +
          '<label>Neuer Stil<input type="text" id="msCovStyle" placeholder="z. B. acoustic guitar ballad, soft female vocals"></label>' +
          '<label>Beschreibung / Lyrics<textarea id="msCovPrompt" rows="3" placeholder="Optional: Beschreibung oder kompletter Text">' + esc(this.current.lyrics || '') + '</textarea></label>' +
          '<div class="ms-form-grid">' +
            '<label>Titel<input type="text" id="msCovTitle" value="' + esc(this.current.title + ' (Cover)') + '"></label>' +
            '<label class="ms-check"><input type="checkbox" id="msCovInstr"> Instrumental (ohne Gesang)</label>' +
          '</div>' +
          '<button class="ms-btn ms-btn-primary" id="msCovGo"><i class="fas fa-sync-alt"></i> Cover erzeugen</button>' +
        '</div>' +
      '</details>' +

      // Add Vocals / Instrumental
      '<details class="ms-action">' +
        '<summary><i class="fas fa-microphone-alt"></i> Gesang / Begleitung hinzufügen <span class="ms-cost">' + COST_HINTS.add_vocals + '</span></summary>' +
        '<div class="ms-form">' +
          '<p class="ms-hint">„Gesang hinzufügen" legt KI-Vocals auf ein Instrumental. „Begleitung hinzufügen" baut Musik unter eine Gesangsspur.</p>' +
          '<label>Lyrics / Beschreibung<textarea id="msAvPrompt" rows="3" placeholder="Lyrics für den Gesang bzw. Beschreibung der Begleitung"></textarea></label>' +
          '<label>Stil<input type="text" id="msAvStyle" value="' + esc(style) + '" placeholder="z. B. soulful pop"></label>' +
          '<div class="ms-action-row">' +
            '<button class="ms-btn ms-btn-primary" id="msAvVocalsGo"><i class="fas fa-microphone-alt"></i> Gesang hinzufügen</button>' +
            '<button class="ms-btn ms-btn-primary" id="msAvInstrGo"><i class="fas fa-guitar"></i> Begleitung hinzufügen</button>' +
          '</div>' +
        '</div>' +
      '</details>' +

      // WAV
      '<div class="ms-action-row">' +
        '<button class="ms-btn" id="msWavGo"' + (hasIds ? '' : ' disabled title="Nur für in der App erzeugte Songs (taskId nötig)"') + '>' +
          '<i class="fas fa-file-audio"></i> Als WAV exportieren</button>' +
        '<span class="ms-hint">Hochauflösendes WAV der aktiven Version (' + COST_HINTS.wav + ').</span>' +
      '</div>';

    // ── Handler ──
    document.getElementById('msLoadTimestamps').addEventListener('click', function () { self._loadTimestamps(); });

    const repStart = document.getElementById('msRepStart');
    const repEnd = document.getElementById('msRepEnd');
    function syncRegionFromInputs() {
      const a = parseFloat(repStart.value);
      const b = parseFloat(repEnd.value);
      if (isFinite(a) && isFinite(b) && b > a) self.waveform.setRegion(a, b);
    }
    repStart.addEventListener('change', syncRegionFromInputs);
    repEnd.addEventListener('change', syncRegionFromInputs);

    document.getElementById('msRepGo').addEventListener('click', function () { self._doReplaceSection(); });
    document.getElementById('msExtGo').addEventListener('click', function () { self._doExtend(); });
    document.getElementById('msCovGo').addEventListener('click', function () { self._doCover(); });
    document.getElementById('msAvVocalsGo').addEventListener('click', function () { self._doAddVocals(); });
    document.getElementById('msAvInstrGo').addEventListener('click', function () { self._doAddInstrumental(); });
    const wavBtn = document.getElementById('msWavGo');
    if (!wavBtn.disabled) wavBtn.addEventListener('click', function () { self._doWav(); });
  };

  MusicStudio.prototype._syncRegionForm = function () {
    const repStart = document.getElementById('msRepStart');
    const repEnd = document.getElementById('msRepEnd');
    if (repStart && repEnd && this.region) {
      repStart.value = this.region.start.toFixed(1);
      repEnd.value = this.region.end.toFixed(1);
    }
  };

  MusicStudio.prototype._toast = function (msg, isError) {
    let el = document.getElementById('msToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'msToast';
      el.className = 'ms-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(function () { el.classList.remove('show'); }, 5000);
  };

  // ── Aktionen ──

  MusicStudio.prototype._doReplaceSection = async function () {
    const v = this._activeVersion();
    if (!v) return;
    const start = parseFloat(document.getElementById('msRepStart').value);
    const end = parseFloat(document.getElementById('msRepEnd').value);
    const prompt = document.getElementById('msRepPrompt').value.trim();
    const tags = document.getElementById('msRepTags').value.trim() || 'pop';
    const fullLyrics = document.getElementById('msRepFull').value.trim();
    const dur = v.duration || this.waveform.duration || 0;

    if (!isFinite(start) || !isFinite(end) || end <= start) {
      return this._toast('Bitte gültigen Abschnitt wählen (Start < Ende).', true);
    }
    const len = end - start;
    if (len < 6 || len > 60) {
      return this._toast('Der Abschnitt muss zwischen 6 und 60 Sekunden lang sein (aktuell ' + len.toFixed(1) + 's).', true);
    }
    if (dur && len > dur * 0.5) {
      return this._toast('Der Abschnitt darf höchstens 50 % der Songlänge umfassen.', true);
    }
    if (!prompt) return this._toast('Bitte neue Lyrics für den Abschnitt eingeben.', true);

    const params = {
      prompt: prompt,
      tags: tags,
      title: this.current.title,
      infillStartS: start,
      infillEndS: end,
      fullLyrics: fullLyrics || prompt
    };
    if (v.taskId && v.audioId) {
      params.taskId = v.taskId;
      params.audioId = v.audioId;
    } else {
      params.uploadUrl = v.url;
      params.model = v.model || 'V5_5';
    }

    const self = this;
    try {
      await this._startTask('Abschnitt ersetzen (' + fmtTime(start) + '–' + fmtTime(end) + ')', async function (ctrl) {
        const t = await window.StudioAPI.replaceSection(params);
        const result = await window.StudioAPI.pollGenerateTask(t.taskId, ctrl);
        if (!result) return null;
        await self._addResultVersions(result, 'Abschnitt ersetzt', 'replace_section', tags);
        return result;
      });
    } catch (err) { this._toast(err.message, true); }
  };

  MusicStudio.prototype._doExtend = async function () {
    const v = this._activeVersion();
    if (!v) return;
    const continueAt = parseFloat(document.getElementById('msExtAt').value) || 0;
    const prompt = document.getElementById('msExtPrompt').value.trim();
    const style = document.getElementById('msExtStyle').value.trim() || 'pop';
    const title = document.getElementById('msExtTitle').value.trim() || this.current.title;
    const self = this;
    try {
      await this._startTask('Song verlängern (ab ' + fmtTime(continueAt) + ')', async function (ctrl) {
        let t;
        if (v.taskId && v.audioId) {
          t = await window.StudioAPI.extend({
            audioId: v.audioId, prompt: prompt, style: style, title: title,
            continueAt: continueAt, model: v.model || 'V5_5'
          });
        } else {
          t = await window.StudioAPI.uploadExtend({
            uploadUrl: v.url, prompt: prompt, style: style, title: title,
            continueAt: continueAt, model: v.model || 'V5_5'
          });
        }
        const result = await window.StudioAPI.pollGenerateTask(t.taskId, ctrl);
        if (!result) return null;
        await self._addResultVersions(result, 'Verlängert', 'extend', style);
        return result;
      });
    } catch (err) { this._toast(err.message, true); }
  };

  MusicStudio.prototype._doCover = async function () {
    const v = this._activeVersion();
    if (!v) return;
    const style = document.getElementById('msCovStyle').value.trim();
    const prompt = document.getElementById('msCovPrompt').value.trim();
    const title = document.getElementById('msCovTitle').value.trim() || this.current.title;
    const instrumental = document.getElementById('msCovInstr').checked;
    if (!style) return this._toast('Bitte neuen Stil angeben.', true);
    const self = this;
    try {
      await this._startTask('Cover: ' + style, async function (ctrl) {
        const t = await window.StudioAPI.uploadCover({
          uploadUrl: v.url, style: style, prompt: prompt, title: title,
          instrumental: instrumental, model: v.model || 'V5_5'
        });
        const result = await window.StudioAPI.pollGenerateTask(t.taskId, ctrl);
        if (!result) return null;
        await self._addResultVersions(result, 'Cover', 'cover', style);
        return result;
      });
    } catch (err) { this._toast(err.message, true); }
  };

  MusicStudio.prototype._doAddVocals = async function () {
    const v = this._activeVersion();
    if (!v) return;
    const prompt = document.getElementById('msAvPrompt').value.trim();
    const style = document.getElementById('msAvStyle').value.trim() || 'pop';
    if (!prompt) return this._toast('Bitte Lyrics für den Gesang eingeben.', true);
    const self = this;
    try {
      await this._startTask('Gesang hinzufügen', async function (ctrl) {
        const t = await window.StudioAPI.addVocals({
          uploadUrl: v.url, prompt: prompt, style: style,
          title: self.current.title + ' (Vocals)', model: v.model || 'V5_5'
        });
        const result = await window.StudioAPI.pollGenerateTask(t.taskId, ctrl);
        if (!result) return null;
        await self._addResultVersions(result, 'Mit Gesang', 'add_vocals', style);
        return result;
      });
    } catch (err) { this._toast(err.message, true); }
  };

  MusicStudio.prototype._doAddInstrumental = async function () {
    const v = this._activeVersion();
    if (!v) return;
    const style = document.getElementById('msAvStyle').value.trim() || 'pop';
    const self = this;
    try {
      await this._startTask('Begleitung hinzufügen', async function (ctrl) {
        const t = await window.StudioAPI.addInstrumental({
          uploadUrl: v.url, tags: style,
          title: self.current.title + ' (Instrumental)', model: v.model || 'V5_5'
        });
        const result = await window.StudioAPI.pollGenerateTask(t.taskId, ctrl);
        if (!result) return null;
        await self._addResultVersions(result, 'Mit Begleitung', 'add_instrumental', style);
        return result;
      });
    } catch (err) { this._toast(err.message, true); }
  };

  MusicStudio.prototype._doWav = async function () {
    const v = this._activeVersion();
    if (!v || !v.taskId || !v.audioId) return;
    const self = this;
    try {
      const result = await this._startTask('WAV-Export', async function (ctrl) {
        const t = await window.StudioAPI.convertWav(v.taskId, v.audioId);
        return window.StudioAPI.pollWavTask(t.taskId, ctrl);
      });
      if (result && result.wavUrl) {
        const a = document.createElement('a');
        a.href = result.wavUrl;
        a.download = (this.current.title + '.wav').replace(/[/\\]/g, '-');
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
        this._toast('WAV bereit – Download gestartet.');
      }
    } catch (err) { this._toast(err.message, true); }
  };

  /** Ergebnis-Tracks eines Generate-Tasks als neue Versionen anhängen. */
  MusicStudio.prototype._addResultVersions = async function (result, labelBase, action, style) {
    const tracks = (result.tracks || []).filter(function (t) { return trackUrl(t); });
    if (!tracks.length) throw new Error('Suno hat keine Audio-URL geliefert.');
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      const suffix = tracks.length > 1 ? ' V' + (i + 1) : '';
      // dauerhafte S3-URL (Suno-CDN läuft nach ~14 Tagen ab)
      const url = await this._archiveUrl(trackUrl(t), t.id || (result.taskId + '-' + i));
      this._addVersion({
        label: labelBase + suffix,
        action: action,
        url: url,
        cover: t.image_url || '',
        duration: t.duration || 0,
        taskId: result.taskId,
        audioId: t.id || null,
        model: this._activeVersion() ? this._activeVersion().model : 'V5_5',
        style: style || ''
      });
    }
    this._toast(labelBase + ': ' + tracks.length + ' neue Version(en) erstellt.');
  };

  // ────────────────────────────────────────────────────────────
  // Timestamps
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype._loadTimestamps = async function () {
    const v = this._activeVersion();
    if (!v || !v.taskId || !v.audioId) return;
    const self = this;
    try {
      const data = await this._startTask('Lyrics-Timestamps laden', async function () {
        return window.StudioAPI.getTimestampedLyrics(v.taskId, v.audioId);
      });
      const words = data && (data.alignedWords || data.aligned_words);
      if (!words || !words.length) throw new Error('Keine Timestamps verfügbar.');
      this.current.timestamps = { forVersionId: v.id, alignedWords: words };
      this._saveProjects();
      this.waveform.setWords(words);
      this._toast(words.length + ' Wort-Timestamps geladen.');
    } catch (err) {
      this._toast(err.message, true);
    }
  };

  /** Timestamps als Zeilen für den KI-Kontext gruppieren. */
  MusicStudio.prototype._timestampSections = function () {
    const ts = this.current && this.current.timestamps;
    if (!ts || !ts.alignedWords) return [];
    const lines = [];
    let cur = null;
    ts.alignedWords.forEach(function (w) {
      const word = String(w.word || '');
      const start = w.startS != null ? w.startS : (w.start_s != null ? w.start_s : w.start);
      if (!cur) cur = { time: start || 0, text: '' };
      cur.text += word;
      if (/\n/.test(word) || cur.text.length > 60) {
        lines.push({ time: cur.time, text: cur.text.replace(/\n/g, ' ').trim() });
        cur = null;
      }
    });
    if (cur && cur.text.trim()) lines.push({ time: cur.time, text: cur.text.trim() });
    return lines.filter(function (l) { return l.text; });
  };

  // ────────────────────────────────────────────────────────────
  // Tab: Stems & Mixer
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype.renderStemsTab = function () {
    const el = document.getElementById('msTabStems');
    if (!el) return;
    if (!this.current) {
      el.innerHTML = '<div class="ms-empty ms-empty-center">Lade zuerst einen Song aus der Bibliothek.</div>';
      return;
    }
    const self = this;
    const v = this._activeVersion();
    const stems = this.current.stems && this.current.stems.forVersionId === v.id ?
      this.current.stems : null;

    let html =
      '<div class="ms-form">' +
        '<div class="ms-form-grid ms-form-grid-3">' +
          '<label>Trennung<select id="msStemType">' +
            '<option value="separate_vocal">Vocals + Instrumental (2 Spuren, ' + COST_HINTS.separate_vocal + ')</option>' +
            '<option value="split_stem">Alle Instrumente (bis 12 Spuren, ' + COST_HINTS.split_stem + ')</option>' +
            '<option value="split_stem_advanced">Gezieltes Instrument (' + COST_HINTS.split_stem_advanced + ')</option>' +
          '</select></label>' +
          '<label id="msStemNameWrap" style="display:none;">Instrument<select id="msStemName">' +
            STEM_ADVANCED_NAMES.map(function (n) { return '<option>' + esc(n) + '</option>'; }).join('') +
          '</select></label>' +
          '<label>&nbsp;<button class="ms-btn ms-btn-primary" id="msStemGo"><i class="fas fa-layer-group"></i> Stems trennen</button></label>' +
        '</div>' +
      '</div>';

    if (stems && stems.items && stems.items.length) {
      html += '<div class="ms-mixer" id="msMixer">' +
        '<div class="ms-panel-head">Mixer (' + stems.items.length + ' Spuren)</div>' +
        '<div class="ms-mixer-hint" id="msMixerHint">Stems werden geladen …</div>' +
        '<div class="ms-mixer-tracks" id="msMixerTracks"></div>' +
        '<div class="ms-action-row">' +
          '<button class="ms-btn ms-btn-primary" id="msMixdownGo" disabled><i class="fas fa-file-export"></i> Mixdown als WAV</button>' +
        '</div>' +
      '</div>';
    }

    el.innerHTML = html;

    const typeSel = document.getElementById('msStemType');
    typeSel.addEventListener('change', function () {
      document.getElementById('msStemNameWrap').style.display =
        typeSel.value === 'split_stem_advanced' ? '' : 'none';
    });
    document.getElementById('msStemGo').addEventListener('click', function () { self._doStems(); });

    if (stems && stems.items && stems.items.length) {
      this._initMixer(stems.items);
    }
  };

  MusicStudio.prototype._doStems = async function () {
    const v = this._activeVersion();
    if (!v) return;
    const type = document.getElementById('msStemType').value;
    const stemName = type === 'split_stem_advanced' ?
      document.getElementById('msStemName').value : null;
    const source = (v.taskId && v.audioId) ?
      { taskId: v.taskId, audioId: v.audioId } : { audioUrl: v.url };
    const self = this;
    try {
      const result = await this._startTask('Stem-Trennung (' + type + ')', async function (ctrl) {
        const t = await window.StudioAPI.separateStems(source, type, stemName);
        return window.StudioAPI.pollStemTask(t.taskId, ctrl);
      });
      if (!result) return;
      if (!result.stems || !result.stems.length) throw new Error('Keine Stems erhalten.');
      this.current.stems = {
        forVersionId: v.id,
        type: type,
        createdAt: new Date().toISOString(),
        items: result.stems
      };
      this._saveProjects();
      this.renderStemsTab();
      this._toast(result.stems.length + ' Stems getrennt.');
    } catch (err) {
      this._toast(err.message, true);
    }
  };

  MusicStudio.prototype._initMixer = async function (stems) {
    const tracksEl = document.getElementById('msMixerTracks');
    const hintEl = document.getElementById('msMixerHint');
    if (!tracksEl) return;
    const self = this;

    if (!this.mixer) this.mixer = new window.StudioMixer();
    this.mixer.onTimeUpdate = function (t) {
      if (self.activeTab === 'stems') {
        self.waveform.setTime(t);
        const d = self.mixer.duration || 0;
        document.getElementById('msTime').textContent = fmtTime(t) + ' / ' + fmtTime(d);
        if (!self._seekDragging && d) {
          document.getElementById('msSeek').value = Math.round((t / d) * 1000);
        }
      }
    };
    this.mixer.onEnded = function () { self._updatePlayIcon(); };

    const mode = await this.mixer.loadStems(stems, function (p) {
      if (p.phase === 'loading' && hintEl) {
        hintEl.textContent = 'Lade Spur ' + (p.index + 1) + '/' + p.total + ': ' + p.name + ' …';
      }
    });

    if (hintEl) {
      hintEl.textContent = mode === 'buffer' ?
        'Samplegenaue Wiedergabe aktiv – Pan und WAV-Mixdown verfügbar.' :
        'Hinweis: Stems konnten nicht dekodiert werden (CORS) – Mute/Solo/Lautstärke funktionieren, Pan/Mixdown nicht.';
    }
    const mixBtn = document.getElementById('msMixdownGo');
    if (mixBtn) {
      mixBtn.disabled = !this.mixer.canMixdown();
      mixBtn.addEventListener('click', function () { self._doMixdown(); });
    }

    tracksEl.innerHTML = this.mixer.tracks.map(function (t, i) {
      return '<div class="ms-strip" data-i="' + i + '">' +
        '<span class="ms-strip-name">' + esc(t.name) + '</span>' +
        '<button class="ms-strip-btn ms-mute" title="Mute">M</button>' +
        '<button class="ms-strip-btn ms-solo" title="Solo">S</button>' +
        '<label class="ms-strip-fader">Vol<input type="range" class="ms-gain" min="0" max="150" value="100"></label>' +
        '<label class="ms-strip-fader">Pan<input type="range" class="ms-pan" min="-100" max="100" value="0"' +
          (mode === 'buffer' ? '' : ' disabled') + '></label>' +
        '<a class="ms-strip-dl" href="' + esc(t.url) + '" download title="Stem herunterladen"><i class="fas fa-download"></i></a>' +
      '</div>';
    }).join('');

    tracksEl.querySelectorAll('.ms-strip').forEach(function (strip) {
      const i = parseInt(strip.getAttribute('data-i'), 10);
      strip.querySelector('.ms-mute').addEventListener('click', function () {
        const muted = self.mixer.toggleMute(i);
        strip.querySelector('.ms-mute').classList.toggle('on', muted);
      });
      strip.querySelector('.ms-solo').addEventListener('click', function () {
        const solo = self.mixer.toggleSolo(i);
        strip.querySelector('.ms-solo').classList.toggle('on', solo);
      });
      strip.querySelector('.ms-gain').addEventListener('input', function (e) {
        self.mixer.setGain(i, e.target.value / 100);
      });
      strip.querySelector('.ms-pan').addEventListener('input', function (e) {
        self.mixer.setPan(i, e.target.value / 100);
      });
    });
  };

  MusicStudio.prototype._doMixdown = async function () {
    if (!this.mixer || !this.mixer.canMixdown()) return;
    const self = this;
    try {
      const blob = await this._startTask('Mixdown → WAV', async function () {
        return self.mixer.mixdownWav();
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (this.current.title + ' (Mixdown).wav').replace(/[/\\]/g, '-');
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
      this._toast('Mixdown fertig – Download gestartet.');
    } catch (err) {
      this._toast(err.message, true);
    }
  };

  // ────────────────────────────────────────────────────────────
  // KI-Assistent
  // ────────────────────────────────────────────────────────────

  MusicStudio.prototype._aiContext = function () {
    const v = this._activeVersion();
    const caps = [];
    if (v) {
      caps.push('extend', 'cover', 'stems', 'add_vocals', 'add_instrumental', 'mix');
      caps.push('replace_section');
      if (v.taskId && v.audioId) caps.push('wav');
    }
    return {
      title: this.current ? this.current.title : '',
      style: v ? v.style : '',
      duration: v ? (v.duration || this.waveform.duration) : 0,
      model: v ? v.model : '',
      lyrics: this.current ? this.current.lyrics : '',
      versionCount: this.current ? this.current.versions.length : 0,
      stems: this.current && this.current.stems ? this.current.stems.items : null,
      region: this.region,
      capabilities: caps,
      timestampSections: this._timestampSections()
    };
  };

  MusicStudio.prototype.renderAiPanel = function () {
    const self = this;
    const bodies = [document.getElementById('msAiBody'), document.getElementById('msTabAiMobile')];
    bodies.forEach(function (body) {
      if (!body) return;
      if (!self.current) {
        body.innerHTML = '<div class="ms-empty">Lade einen Song, dann analysiert die KI ihn und schlägt konkrete Bearbeitungen vor.</div>';
        return;
      }
      const history = self.current.aiHistory || [];
      let html =
        '<button class="ms-btn ms-btn-primary ms-ai-suggest"><i class="fas fa-lightbulb"></i> Song analysieren &amp; Vorschläge</button>' +
        '<div class="ms-ai-log">';
      history.slice(-12).forEach(function (h) {
        if (h.role === 'user') {
          html += '<div class="ms-ai-msg user">' + esc(h.text) + '</div>';
        } else {
          html += '<div class="ms-ai-msg ai">' + esc(h.text) + '</div>';
          if (h.suggestions && h.suggestions.length) {
            h.suggestions.forEach(function (s, si) {
              html += '<div class="ms-ai-sugg" data-h="' + h.id + '" data-s="' + si + '">' +
                '<div class="ms-ai-sugg-title">' + esc(s.title || s.type) + '</div>' +
                '<div class="ms-ai-sugg-desc">' + esc(s.description || '') + '</div>' +
                '<button class="ms-btn ms-ai-apply"><i class="fas fa-play"></i> Übernehmen</button>' +
              '</div>';
            });
          }
        }
      });
      html += '</div>' +
        '<div class="ms-ai-input">' +
          '<input type="text" class="ms-ai-text" placeholder="Frag die KI oder gib eine Anweisung …">' +
          '<button class="ms-btn ms-ai-send"><i class="fas fa-paper-plane"></i></button>' +
        '</div>';
      body.innerHTML = html;

      body.querySelector('.ms-ai-suggest').addEventListener('click', function () { self._aiSuggest(); });
      const input = body.querySelector('.ms-ai-text');
      const send = body.querySelector('.ms-ai-send');
      function doSend() {
        const msg = input.value.trim();
        if (!msg) return;
        input.value = '';
        self._aiChat(msg);
      }
      send.addEventListener('click', doSend);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSend(); });

      body.querySelectorAll('.ms-ai-sugg').forEach(function (card) {
        card.querySelector('.ms-ai-apply').addEventListener('click', function () {
          const h = (self.current.aiHistory || []).find(function (x) {
            return x.id === card.getAttribute('data-h');
          });
          const s = h && h.suggestions && h.suggestions[parseInt(card.getAttribute('data-s'), 10)];
          if (s) self._applySuggestion(s);
        });
      });

      const log = body.querySelector('.ms-ai-log');
      if (log) log.scrollTop = log.scrollHeight;
    });
  };

  MusicStudio.prototype._aiPush = function (entry) {
    if (!this.current.aiHistory) this.current.aiHistory = [];
    entry.id = uid();
    this.current.aiHistory.push(entry);
    this.current.aiHistory = this.current.aiHistory.slice(-24);
    this._saveProjects();
    this.renderAiPanel();
  };

  MusicStudio.prototype._aiSuggest = async function () {
    if (!this.current) return;
    this._aiPush({ role: 'user', text: 'Analysiere den Song und mach Vorschläge.' });
    this._aiPush({ role: 'ai', text: 'Analysiere …' });
    try {
      const res = await window.StudioAI.suggest(this._aiContext());
      this.current.aiHistory.pop();
      this._aiPush({
        role: 'ai',
        text: res.summary || 'Hier sind meine Vorschläge:',
        suggestions: res.suggestions || []
      });
    } catch (err) {
      this.current.aiHistory.pop();
      this._aiPush({ role: 'ai', text: 'Fehler: ' + err.message });
    }
  };

  MusicStudio.prototype._aiChat = async function (msg) {
    if (!this.current) return;
    const history = (this.current.aiHistory || []).map(function (h) {
      return { role: h.role === 'user' ? 'user' : 'assistant', text: h.text };
    });
    this._aiPush({ role: 'user', text: msg });
    this._aiPush({ role: 'ai', text: 'Denke nach …' });
    try {
      const res = await window.StudioAI.chat(this._aiContext(), msg, history);
      this.current.aiHistory.pop();
      this._aiPush({
        role: 'ai',
        text: res.answer || res.summary || 'Vorschläge:',
        suggestions: res.suggestions || []
      });
    } catch (err) {
      this.current.aiHistory.pop();
      this._aiPush({ role: 'ai', text: 'Fehler: ' + err.message });
    }
  };

  /** 1-Klick: Vorschlag in die passenden Formulare übernehmen bzw. ausführen. */
  MusicStudio.prototype._applySuggestion = function (s) {
    const p = s.params || {};
    const self = this;
    switch (s.type) {
      case 'replace_section': {
        this._switchTab('edit');
        if (typeof p.infillStartS === 'number' && typeof p.infillEndS === 'number') {
          this.waveform.setRegion(p.infillStartS, p.infillEndS);
        }
        setVal('msRepPrompt', p.prompt);
        setVal('msRepTags', p.tags);
        this._toast('Formular „Abschnitt ersetzen" vorbefüllt – prüfen und starten.');
        openDetails('msRepGo');
        break;
      }
      case 'extend': {
        this._switchTab('edit');
        if (typeof p.continueAt === 'number') setVal('msExtAt', p.continueAt);
        setVal('msExtPrompt', p.prompt);
        setVal('msExtStyle', p.style);
        this._toast('Formular „Verlängern" vorbefüllt – prüfen und starten.');
        openDetails('msExtGo');
        break;
      }
      case 'cover': {
        this._switchTab('edit');
        setVal('msCovStyle', p.style);
        if (p.prompt) setVal('msCovPrompt', p.prompt);
        this._toast('Formular „Cover" vorbefüllt – prüfen und starten.');
        openDetails('msCovGo');
        break;
      }
      case 'add_vocals':
      case 'add_instrumental': {
        this._switchTab('edit');
        setVal('msAvPrompt', p.prompt);
        setVal('msAvStyle', p.style || p.tags);
        this._toast('Formular „Gesang/Begleitung" vorbefüllt – prüfen und starten.');
        openDetails('msAvVocalsGo');
        break;
      }
      case 'stems': {
        this._switchTab('stems');
        if (p.type) {
          const sel = document.getElementById('msStemType');
          if (sel) { sel.value = p.type; sel.dispatchEvent(new Event('change')); }
        }
        this._toast('Stems-Tab geöffnet – Trennung starten.');
        break;
      }
      case 'mix': {
        this._switchTab('stems');
        if (this.mixer && p.stem) {
          const idx = this.mixer.tracks.findIndex(function (t) {
            return t.name.toLowerCase().indexOf(String(p.stem).toLowerCase()) >= 0;
          });
          if (idx >= 0 && typeof p.gain === 'number') {
            this.mixer.setGain(idx, p.gain);
            const strip = document.querySelector('.ms-strip[data-i="' + idx + '"] .ms-gain');
            if (strip) strip.value = Math.round(p.gain * 100);
            this._toast('Mixer: ' + p.stem + ' auf ' + Math.round(p.gain * 100) + '% gesetzt.');
            break;
          }
        }
        this._toast(p.hinweis || 'Trenne zuerst die Stems, dann kann die KI den Mix anpassen.');
        break;
      }
      case 'wav':
        this._doWav();
        break;
      default:
        this._toast('Unbekannter Vorschlagstyp: ' + s.type, true);
    }

    function setVal(id, val) {
      const el = document.getElementById(id);
      if (el && val != null && val !== '') el.value = val;
    }
    function openDetails(btnId) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      const details = btn.closest('details');
      if (details) details.open = true;
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      void self;
    }
  };

  window.MusicStudio = MusicStudio;
})();
