/**
 * Persönlichkeits-Song Generator – Audio-Identität
 * Wächst mit jedem Profil-Snapshot und jedem gespeicherten Audio in der Cloud.
 */
(function () {
  'use strict';

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function uniq(arr) {
    const s = new Set();
    return (arr || []).filter(function (x) {
      if (!x || s.has(x)) return false;
      s.add(x);
      return true;
    });
  }

  function extractPersonasFromVersions(versions) {
    return (versions || [])
      .map(function (v) { return v && v.snapshot && v.snapshot.persona; })
      .filter(Boolean);
  }

  function scaleDelta(first, latest) {
    if (!first || !latest) return 0;
    const keys = ['BIG5_O', 'BIG5_C', 'BIG5_E', 'BIG5_A', 'BIG5_N'];
    let sum = 0;
    keys.forEach(function (k) {
      sum += Math.abs((latest[k] || 50) - (first[k] || 50));
    });
    return sum / keys.length;
  }

  function collectMotifs(personas) {
    const out = [];
    personas.forEach(function (p) {
      (p.motifs || []).forEach(function (m) { out.push(m); });
    });
    return uniq(out).slice(0, 12);
  }

  function collectMusicHints(personas) {
    const out = [];
    personas.forEach(function (p) {
      const analyses = p.ai_analyses || {};
      Object.keys(analyses).forEach(function (mode) {
        const block = analyses[mode] || {};
        Object.keys(block).forEach(function (len) {
          const a = block[len];
          if (a && Array.isArray(a.music_hints)) out.push.apply(out, a.music_hints);
        });
      });
    });
    return uniq(out).slice(0, 10);
  }

  function countAnalyses(personas) {
    let n = 0;
    personas.forEach(function (p) {
      const analyses = p.ai_analyses || {};
      Object.keys(analyses).forEach(function (mode) {
        n += Object.keys(analyses[mode] || {}).length;
      });
    });
    return n;
  }

  /**
   * Berechnet die kumulative Audio-Identität aus Versions-Historie + Bibliothek.
   */
  function computeAudioIdentity(opts) {
    opts = opts || {};
    const versions = opts.versions || [];
    const library = opts.audioLibrary || { entries: [] };
    const currentPersona = opts.currentPersona || null;
    const personas = extractPersonasFromVersions(versions);
    if (currentPersona) personas.push(currentPersona);

    const sessionCount = versions.length;
    const audioCount = (library.entries || []).length;
    const analysisCount = countAnalyses(personas);
    const methodsMax = personas.reduce(function (m, p) {
      return Math.max(m, p.imported_methods_count || 0);
    }, 0);

    const firstScales = personas[0] && personas[0].scales_final;
    const lastScales = (currentPersona && currentPersona.scales_final) ||
      (personas[personas.length - 1] && personas[personas.length - 1].scales_final);
    const evolutionScore = scaleDelta(firstScales, lastScales);

    const depthLevel = clamp(
      1 +
      Math.min(sessionCount, 10) * 0.45 +
      Math.min(audioCount, 12) * 0.35 +
      Math.min(analysisCount, 8) * 0.25 +
      Math.min(methodsMax, 15) * 0.08 +
      (evolutionScore > 8 ? 1.2 : evolutionScore > 4 ? 0.6 : 0),
      1,
      10
    );

    const richness = clamp(
      0.12 +
      depthLevel * 0.065 +
      Math.min(evolutionScore / 100, 0.2) +
      Math.min(audioCount * 0.03, 0.18),
      0.1,
      0.98
    );

    const accumulatedMotifs = collectMotifs(personas);
    const accumulatedThemes = collectMusicHints(personas);
    const styleLayers = [];
    if (depthLevel >= 3) styleLayers.push('evolving personal signature');
    if (depthLevel >= 5) styleLayers.push('multi-layered harmonic palette');
    if (depthLevel >= 7) styleLayers.push('mature textural depth');
    if (evolutionScore >= 6) styleLayers.push('growth arc in dynamics');
    if (audioCount >= 2) styleLayers.push('continuity from prior productions');
    accumulatedThemes.slice(0, 3).forEach(function (t) { styleLayers.push(t); });

    const productionTags = styleLayers.slice(0, 6);
    if (richness >= 0.45) productionTags.push('richer arrangement');
    if (richness >= 0.65) productionTags.push('expanded instrumentation');

    const archetype = (currentPersona && currentPersona.archetype) ||
      (personas[personas.length - 1] && personas[personas.length - 1].archetype) || 'Profil';

    const evolutionNarrative = sessionCount <= 1
      ? 'Erste Klangschicht – dein Profil bildet die Grundlage.'
      : 'Deine Audio-Identität wächst: ' + sessionCount + ' Entwicklungsstände, ' +
        audioCount + ' gespeicherte Produktionen' +
        (evolutionScore >= 4 ? ', spürbare Persönlichkeitsverschiebung im Profil' : '') + '.';

    const composeHints =
      'Nutze audio_identity: Tiefe ' + Math.round(depthLevel) + '/10, Reichtum ' +
      Math.round(richness * 100) + '%. Mehr Schichten in Arrangement und Bildern, ' +
      'wenn depthLevel >= 5. Motive aus accumulatedMotifs einweben.';

    return {
      version: 1,
      depthLevel: Math.round(depthLevel * 10) / 10,
      richness: Math.round(richness * 1000) / 1000,
      evolutionScore: Math.round(evolutionScore * 10) / 10,
      sessionCount: sessionCount,
      audioLibraryCount: audioCount,
      analysisCount: analysisCount,
      methodsPeak: methodsMax,
      accumulatedMotifs: accumulatedMotifs,
      accumulatedThemes: accumulatedThemes,
      styleLayers: styleLayers,
      productionTags: uniq(productionTags),
      evolutionNarrative: evolutionNarrative,
      composeHints: composeHints,
      archetype: archetype,
      updatedAt: new Date().toISOString()
    };
  }

  function enrichPersona(persona, identity) {
    if (!persona) return persona;
    if (!identity) return persona;
    const out = Object.assign({}, persona);
    out.audio_identity = identity;

    if (out.music_dna && typeof out.music_dna === 'object') {
      out.music_dna = Object.assign({}, out.music_dna);
      out.music_dna.identity_depth = identity.depthLevel;
      out.music_dna.richness = identity.richness;
      const inst = out.music_dna.instrumentation || {};
      out.music_dna.instrumentation = Object.assign({}, inst);
      const core = [].concat(inst.core || []);
      if (identity.depthLevel >= 4 && core.indexOf('strings') === -1) core.push('strings');
      if (identity.depthLevel >= 6 && core.indexOf('ambient_pad') === -1) core.push('ambient_pad');
      if (identity.richness >= 0.55 && core.indexOf('subtle_choir') === -1) core.push('subtle_choir');
      out.music_dna.instrumentation.core = core.slice(0, 6);
      if (identity.richness >= 0.4) {
        out.music_dna.density = clamp((out.music_dna.density || 0.5) + identity.richness * 0.12, 0, 1);
      }
    }

    out.motifs = uniq([].concat(out.motifs || [], identity.accumulatedMotifs || [])).slice(0, 8);
    return out;
  }

  function buildLibraryEntry(state, type, identity, meta) {
    meta = meta || {};
    const persona = state.persona || {};
    const now = new Date().toISOString();
    let tracks = [];
    let title = meta.title || 'Persönlichkeitssong';

    if (type === 'playlist' && state.playlist && state.playlist.tracks) {
      tracks = state.playlist.tracks.filter(function (t) {
        return t.status === 'ok' && t.url;
      }).map(function (t) {
        return {
          title: t.title || t.label,
          url: t.url,
          cover: t.cover,
          duration: t.duration,
          intentId: t.intentId,
          label: t.label,
          emoji: t.emoji
        };
      });
      title = 'Persönlichkeits-Playlist · ' + (persona.archetype || 'Profil');
    } else if (state.audio && state.audio.tracks) {
      tracks = state.audio.tracks.map(function (t) {
        return {
          title: t.title,
          url: t.audio_url || t.audioUrl || t.stream_audio_url || t.streamAudioUrl,
          cover: t.image_url || t.imageUrl,
          duration: t.duration,
          intentId: state.audio.intentId || meta.intentId,
          label: meta.intentLabel
        };
      }).filter(function (t) { return t.url; });
      title = (state.song && state.song.title) || title;
    }

    return {
      id: 'aud-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      type: type,
      createdAt: now,
      title: title,
      tracks: tracks,
      depthLevel: identity && identity.depthLevel,
      richness: identity && identity.richness,
      archetype: persona.archetype,
      testVariant: state.testVariant,
      personaVersionId: meta.personaVersionId || null
    };
  }

  window.SongAudioIdentity = {
    computeAudioIdentity: computeAudioIdentity,
    enrichPersona: enrichPersona,
    buildLibraryEntry: buildLibraryEntry
  };
})();
