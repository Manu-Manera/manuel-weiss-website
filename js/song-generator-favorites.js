/**
 * Persönlichkeits-Song Generator – Favoriten-Playlist
 * Herz-Toggle, Cloud-Sync, arrangierbare Reihenfolge.
 */
(function () {
  'use strict';

  const MAX_FAVORITES = 50;

  function trackKey(item) {
    const url = (item && (item.url || item.audio_url || item.audioUrl ||
      item.stream_audio_url || item.streamAudioUrl)) || '';
    if (!url) return 'sgf-' + Date.now().toString(36);
    var hash = 0;
    for (var i = 0; i < url.length; i += 1) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i);
      hash |= 0;
    }
    return 'sgf-' + Math.abs(hash).toString(36);
  }

  function normalize(item) {
    if (!item) return null;
    var url = item.url || item.audio_url || item.audioUrl ||
      item.stream_audio_url || item.streamAudioUrl || '';
    if (!url) return null;
    var display = item.customName || item.userTitle || item.label || item.title || 'Favorit';
    return {
      id: item.id || trackKey({ url: url }),
      url: url,
      title: item.title || display,
      label: display,
      customName: item.customName || null,
      emoji: item.emoji || '🎵',
      intentId: item.intentId || null,
      cover: item.cover || item.image_url || item.imageUrl || null,
      duration: item.duration || null,
      addedAt: item.addedAt || new Date().toISOString()
    };
  }

  function isFavorite(favorites, id) {
    if (!Array.isArray(favorites) || !id) return false;
    return favorites.some(function (f) { return f.id === id; });
  }

  function toggle(favorites, item) {
    favorites = Array.isArray(favorites) ? favorites.slice() : [];
    var norm = normalize(item);
    if (!norm) return { favorites: favorites, added: false };
    var idx = favorites.findIndex(function (f) { return f.id === norm.id; });
    if (idx >= 0) {
      favorites.splice(idx, 1);
      return { favorites: favorites, added: false, removed: norm };
    }
    favorites.unshift(norm);
    while (favorites.length > MAX_FAVORITES) favorites.pop();
    return { favorites: favorites, added: true, addedItem: norm };
  }

  function reorder(favorites, fromIndex, toIndex) {
    if (!Array.isArray(favorites)) return favorites;
    if (fromIndex < 0 || fromIndex >= favorites.length) return favorites;
    if (toIndex < 0 || toIndex >= favorites.length) return favorites;
    if (fromIndex === toIndex) return favorites.slice();
    var next = favorites.slice();
    var item = next.splice(fromIndex, 1)[0];
    next.splice(toIndex, 0, item);
    return next;
  }

  function moveUp(favorites, index) {
    if (index <= 0) return favorites;
    return reorder(favorites, index, index - 1);
  }

  function moveDown(favorites, index) {
    if (!Array.isArray(favorites) || index >= favorites.length - 1) return favorites;
    return reorder(favorites, index, index + 1);
  }

  /** Cloud + local zusammenführen – nie leere Cloud-Liste überschreibt lokale Favoriten */
  function mergeLists(cloudList, localList) {
    var byId = {};
    (cloudList || []).forEach(function (f) {
      if (f && f.id) byId[f.id] = f;
    });
    (localList || []).forEach(function (f) {
      if (!f || !f.id) return;
      var ex = byId[f.id];
      if (!ex || (f.addedAt && (!ex.addedAt || f.addedAt >= ex.addedAt))) {
        byId[f.id] = f;
      }
    });
    var ordered = [];
    var seen = {};
    (localList || []).forEach(function (f) {
      if (f && f.id && byId[f.id] && !seen[f.id]) {
        ordered.push(byId[f.id]);
        seen[f.id] = true;
      }
    });
    (cloudList || []).forEach(function (f) {
      if (f && f.id && !seen[f.id]) {
        ordered.push(byId[f.id]);
        seen[f.id] = true;
      }
    });
    while (ordered.length > MAX_FAVORITES) ordered.pop();
    return ordered;
  }

  function getDisplayName(item) {
    if (!item) return 'Favorit';
    return item.customName || item.userTitle || item.label || item.title || 'Favorit';
  }

  function updateName(favorites, id, name) {
    if (!Array.isArray(favorites) || !id) return favorites;
    var trimmed = String(name || '').trim();
    if (!trimmed) return favorites;
    return favorites.map(function (f) {
      if (!f || f.id !== id) return f;
      return Object.assign({}, f, { customName: trimmed, label: trimmed, title: trimmed });
    });
  }

  window.SongFavorites = {
    MAX_FAVORITES: MAX_FAVORITES,
    trackKey: trackKey,
    normalize: normalize,
    getDisplayName: getDisplayName,
    updateName: updateName,
    isFavorite: isFavorite,
    toggle: toggle,
    reorder: reorder,
    moveUp: moveUp,
    moveDown: moveDown,
    mergeLists: mergeLists
  };
})();
