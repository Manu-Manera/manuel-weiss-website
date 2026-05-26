/**
 * Persönlichkeits-Song Generator – Geocoding & Zeitzonen-Hilfe
 *
 * - Stadt-/Ort-Suche via Nominatim (OpenStreetMap, kostenlos, kein API-Key)
 * - Mit Debouncing und localStorage-Cache
 * - Zeitzonen-Offset: Heuristik aus Longitude / 15 (Standardzeit, gut genug
 *   für astrologisch-symbolische Anwendung). Nutzer:innen können den
 *   Offset manuell überschreiben.
 */

(function () {
  'use strict';

  const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
  const CACHE_KEY = 'sg_geocode_cache_v1';
  const CACHE_MAX = 100;
  const REQUEST_HEADERS = {
    'Accept': 'application/json',
    'Accept-Language': 'de,en'
  };

  // ────────────────────────────────────────────────────────────
  // Cache
  // ────────────────────────────────────────────────────────────
  function loadCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
    catch (_e) { return {}; }
  }
  function saveCache(obj) {
    try {
      const keys = Object.keys(obj);
      if (keys.length > CACHE_MAX) {
        // Älteste rauswerfen
        keys.slice(0, keys.length - CACHE_MAX).forEach(k => delete obj[k]);
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch (_e) {}
  }

  // ────────────────────────────────────────────────────────────
  // Search
  // ────────────────────────────────────────────────────────────
  async function searchPlace(query) {
    const q = (query || '').trim();
    if (q.length < 2) return [];

    const cache = loadCache();
    if (cache[q]) return cache[q];

    const url = NOMINATIM + '?format=jsonv2&limit=6&addressdetails=1&q=' + encodeURIComponent(q);
    let data = null;
    try {
      const res = await fetch(url, { headers: REQUEST_HEADERS });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (err) {
      console.warn('[Geocoding] Suche fehlgeschlagen:', err.message);
      return [];
    }
    const out = (data || []).map(d => ({
      label: d.display_name,
      lat: parseFloat(d.lat),
      lon: parseFloat(d.lon),
      type: d.type,
      country: (d.address && (d.address.country || '')) || ''
    })).filter(p => isFinite(p.lat) && isFinite(p.lon));
    cache[q] = out;
    saveCache(cache);
    return out;
  }

  // ────────────────────────────────────────────────────────────
  // Zeitzonen-Schätzung
  //  Standardzeit-Offset (in Minuten) anhand Longitude / 15.
  //  Für historische Geburtsdaten ist das oft ungenau (Sommerzeit, politische
  //  Verschiebungen) – wir geben deshalb einen Wert zurück, lassen die User:in
  //  aber explizit anzeigen und ggf. überschreiben.
  // ────────────────────────────────────────────────────────────
  function estimateTimezoneOffsetMinutes(lat, lon, dateStr) {
    if (typeof lon !== 'number' || !isFinite(lon)) return 0;
    // Basis: Standardzeit
    const stdOffset = Math.round(lon / 15) * 60;
    // Heuristisches DST: Nord-/Südhalbkugel + Datum
    // Pragmatisch: in Europa/Westafrika/Nordamerika 1. Sonntag Apr. – letzter Okt. (Sommer)
    if (typeof dateStr === 'string' && dateStr.length >= 10) {
      const month = parseInt(dateStr.substr(5, 2), 10);
      const northernSummer = month >= 4 && month <= 10;
      const southernSummer = month <= 3 || month >= 11;
      const inEuropeNA = lon >= -130 && lon <= 50;
      const isNorthern = lat >= 0;
      if (inEuropeNA && ((isNorthern && northernSummer) || (!isNorthern && southernSummer))) {
        return stdOffset + 60;
      }
    }
    return stdOffset;
  }

  function formatOffset(min) {
    const sign = min >= 0 ? '+' : '-';
    const m = Math.abs(min);
    const h = Math.floor(m / 60);
    const r = m % 60;
    return 'UTC' + sign + String(h).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  }

  window.SongGeocoding = {
    searchPlace,
    estimateTimezoneOffsetMinutes,
    formatOffset
  };
})();
