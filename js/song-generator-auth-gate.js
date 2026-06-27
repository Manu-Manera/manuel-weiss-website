/**
 * Persönlichkeits-Song – Login + Feature-Freischaltung (Admin-gesteuert).
 * Kacheln mit data-auth-gate="song-generator" nur sichtbar wenn freigeschaltet.
 */
(function (global) {
  'use strict';

  var SONG_URL = 'persoenlichkeits-song-generator.html';
  var ACCESS_CACHE_KEY = 'sg_feature_access_v1';
  var accessCache = null;
  var accessPromise = null;

  function getApiBase() {
    return (global.AWS_CONFIG && (global.AWS_CONFIG.apiBaseUrl || global.AWS_CONFIG.websiteApiV1Url || global.AWS_CONFIG.websiteApiUrl)) ||
      'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';
  }

  function getIdToken() {
    try {
      if (global.awsAuth && global.awsAuth.isLoggedIn && global.awsAuth.isLoggedIn()) {
        var u = global.awsAuth.getCurrentUser && global.awsAuth.getCurrentUser();
        if (u && u.idToken) return u.idToken;
      }
      if (global.realUserAuth && global.realUserAuth.isLoggedIn && global.realUserAuth.isLoggedIn()) {
        var r = global.realUserAuth.getCurrentUser && global.realUserAuth.getCurrentUser();
        if (r && r.idToken) return r.idToken;
      }
      var session = localStorage.getItem('aws_auth_session') || localStorage.getItem('admin_auth_session');
      if (session) {
        var p = JSON.parse(session);
        if (p.idToken) return p.idToken;
        if (p.user && p.user.idToken) return p.user.idToken;
      }
    } catch (_e) {}
    return null;
  }

  function getUserIdFromToken() {
    var token = getIdToken();
    if (!token) return null;
    try {
      var payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.email || payload['cognito:username'] || payload.sub || null;
    } catch (_e) {
      return null;
    }
  }

  function isLoggedIn() {
    // Wenn ein Auth-System vorhanden ist, ist dessen Urteil maßgeblich (konsistent
    // mit der Navigation). Nur wenn KEIN Auth-System geladen ist (z. B. interne
    // Admin-Seiten), greift der Token-Fallback aus dem localStorage.
    if (global.awsAuth && typeof global.awsAuth.isLoggedIn === 'function') {
      return !!global.awsAuth.isLoggedIn();
    }
    if (global.realUserAuth && typeof global.realUserAuth.isLoggedIn === 'function') {
      return !!global.realUserAuth.isLoggedIn();
    }
    return !!getIdToken();
  }

  function readCachedAccess() {
    if (accessCache) return accessCache;
    try {
      var raw = sessionStorage.getItem(ACCESS_CACHE_KEY);
      if (raw) accessCache = JSON.parse(raw);
    } catch (_e) {}
    return accessCache;
  }

  function writeCachedAccess(data) {
    accessCache = data;
    try {
      sessionStorage.setItem(ACCESS_CACHE_KEY, JSON.stringify(data || {}));
    } catch (_e) {}
  }

  function clearAccessCache() {
    accessCache = null;
    accessPromise = null;
    try { sessionStorage.removeItem(ACCESS_CACHE_KEY); } catch (_e) {}
  }

  function fetchUserAccess(force) {
    if (!force && readCachedAccess()) return Promise.resolve(readCachedAccess());
    if (accessPromise && !force) return accessPromise;

    var token = getIdToken();
    if (!token) {
      writeCachedAccess({ features: { personality_song: false } });
      return Promise.resolve(readCachedAccess());
    }

    accessPromise = fetch(getApiBase() + '/user/access?userId=' + encodeURIComponent(getUserIdFromToken() || ''), {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      writeCachedAccess({
        features: {
          personality_song: !!(data.features && data.features.personality_song) ||
            !!(data.access && data.access.features && data.access.features.personality_song)
        }
      });
      return readCachedAccess();
    }).catch(function () {
      writeCachedAccess({ features: { personality_song: false } });
      return readCachedAccess();
    }).finally(function () {
      accessPromise = null;
    });

    return accessPromise;
  }

  function hasPersonalitySongAccess(access) {
    access = access || readCachedAccess() || {};
    return !!(access.features && access.features.personality_song === true);
  }

  function canAccessPersonalitySong() {
    if (!isLoggedIn()) return false;
    return hasPersonalitySongAccess(readCachedAccess());
  }

  function showLogin() {
    if (global.authModals && global.authModals.showLogin) return global.authModals.showLogin();
    if (global.awsAuth && global.awsAuth.showLoginModal) return global.awsAuth.showLoginModal();
    alert('Bitte melde dich an.');
  }

  function showNotGrantedMessage() {
    alert(
      'Der Persönlichkeits-Song ist für dein Konto noch nicht freigeschaltet.\n\n' +
      'Bitte wende dich an den Administrator, wenn du Zugang erhalten möchtest.'
    );
  }

  function openSongGenerator(url) {
    if (!isLoggedIn()) {
      showLogin();
      return false;
    }
    return fetchUserAccess(false).then(function (access) {
      if (!hasPersonalitySongAccess(access)) {
        showNotGrantedMessage();
        return false;
      }
      global.location.href = url || SONG_URL;
      return true;
    });
  }

  function openMethod(methodId) {
    if (methodId === 'personality-song') {
      openSongGenerator();
      return;
    }
    if (typeof global.startMethod === 'function') global.startMethod(methodId);
  }

  function syncGatedTiles() {
    var loggedIn = isLoggedIn();
    if (!loggedIn) {
      document.querySelectorAll('[data-auth-gate="song-generator"]').forEach(function (el) {
        el.hidden = true;
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      });
      return Promise.resolve();
    }
    return fetchUserAccess(false).then(function (access) {
      var allowed = hasPersonalitySongAccess(access);
      document.querySelectorAll('[data-auth-gate="song-generator"]').forEach(function (el) {
        el.hidden = !allowed;
        el.style.display = allowed ? '' : 'none';
        el.setAttribute('aria-hidden', allowed ? 'false' : 'true');
      });
    });
  }

  function init() {
    syncGatedTiles();
    ['authStateChanged', 'userLoggedIn', 'songGenerator:authChanged'].forEach(function (ev) {
      global.addEventListener(ev, function () {
        clearAccessCache();
        syncGatedTiles();
      });
    });
    setTimeout(function () { syncGatedTiles(); }, 400);
    setTimeout(function () { syncGatedTiles(); }, 1500);
  }

  global.SongGeneratorAuthGate = {
    isLoggedIn: isLoggedIn,
    showLogin: showLogin,
    fetchUserAccess: fetchUserAccess,
    hasPersonalitySongAccess: hasPersonalitySongAccess,
    canAccessPersonalitySong: canAccessPersonalitySong,
    openSongGenerator: openSongGenerator,
    openMethod: openMethod,
    syncGatedTiles: syncGatedTiles,
    clearAccessCache: clearAccessCache,
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
