/**
 * Persönlichkeits-Song Generator – Audio-Identität
 * Entwickelt sich mit jedem Profil-Snapshot und jeder gespeicherten Produktion.
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

  function phaseProductionTags(phaseId, dev) {
    const tags = [];
    if (phaseId === 'verzweigung') tags.push('developing personal signature');
    if (phaseId === 'vertiefung') tags.push('branching arrangement');
    if (phaseId === 'reifung') tags.push('growth arc in dynamics');
    if (phaseId === 'integration') tags.push('integrated sonic narrative');
    if (dev >= 0.5 && phaseId !== 'grundton') tags.push('evolving instrumentation');
    return tags;
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

    const entwicklungsgrad = clamp(
      0.12 +
      depthLevel * 0.065 +
      Math.min(evolutionScore / 100, 0.2) +
      Math.min(audioCount * 0.03, 0.18),
      0.1,
      0.98
    );

    const phase = window.SongMusicDNAFusion && window.SongMusicDNAFusion.getEvolutionPhase
      ? window.SongMusicDNAFusion.getEvolutionPhase(depthLevel)
      : { id: 'grundton', label: 'Grundton' };

    const accumulatedMotifs = collectMotifs(personas);
    const accumulatedThemes = collectMusicHints(personas);
    const productionTags = phaseProductionTags(phase.id, entwicklungsgrad);
    if (audioCount >= 2) productionTags.push('continuity from prior productions');
    accumulatedThemes.slice(0, 2).forEach(function (t) { productionTags.push(t); });

    const archetype = (currentPersona && currentPersona.archetype) ||
      (personas[personas.length - 1] && personas[personas.length - 1].archetype) || 'Profil';

    const evolutionNarrative = sessionCount <= 1
      ? 'Erste Klangschicht – dein Profil bildet den Ausgangspunkt.'
      : 'Deine Audio-Identität entwickelt sich weiter: ' + sessionCount + ' Stände, ' +
        audioCount + ' gespeicherte Produktionen' +
        (evolutionScore >= 4 ? ', spürbare Verschiebung in deinem Profil' : '') +
        '. Phase: ' + phase.label + '.';

    const composeHints =
      'Entwicklungsphase „' + phase.label + '“ (Tiefe ' + Math.round(depthLevel) + '/10). ' +
      'Regeln folgen der Phase – nicht pauschal „mehr“, sondern passende Weiterentwicklung. ' +
      'Motive aus accumulatedMotifs einweben, wenn die Phase es erlaubt.';

    return {
      version: 2,
      depthLevel: Math.round(depthLevel * 10) / 10,
      entwicklungsgrad: Math.round(entwicklungsgrad * 1000) / 1000,
      richness: Math.round(entwicklungsgrad * 1000) / 1000,
      evolutionScore: Math.round(evolutionScore * 10) / 10,
      evolutionPhase: phase.id,
      evolutionPhaseLabel: phase.label,
      sessionCount: sessionCount,
      audioLibraryCount: audioCount,
      analysisCount: analysisCount,
      methodsPeak: methodsMax,
      accumulatedMotifs: accumulatedMotifs,
      accumulatedThemes: accumulatedThemes,
      productionTags: uniq(productionTags),
      evolutionNarrative: evolutionNarrative,
      composeHints: composeHints,
      archetype: archetype,
      updatedAt: new Date().toISOString()
    };
  }

  function enrichPersona(persona, identity) {
    if (!persona) return persona;
    const out = Object.assign({}, persona);
    if (identity) out.audio_identity = identity;

    var core = out.music_dna && out.music_dna.core ? out.music_dna.core : out.music_dna;
    if (window.SongMusicDNAFusion && core) {
      out.music_dna = window.SongMusicDNAFusion.fuse({
        core: core,
        astro: out.astrology,
        identity: identity,
        tensions: out.tensions
      });
    }

    if (identity) {
      out.motifs = uniq([].concat(out.motifs || [], identity.accumulatedMotifs || [])).slice(0, 8);
    }
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
      entwicklungsgrad: identity && identity.entwicklungsgrad,
      evolutionPhaseLabel: identity && identity.evolutionPhaseLabel,
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
