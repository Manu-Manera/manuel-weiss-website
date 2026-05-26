/**
 * Persönlichkeits-Song Generator – Playlist & Intent-Engine
 *
 * Berechnet aus Persona + Test + Astro + Methoden + KI-Analyse
 * ein transparentes Track-/Playlist-Konzept pro Nutzungskontext.
 * Die Spec fließt in buildStylePrompt / Suno-API.
 */
(function () {
  'use strict';

  const INTENTS = {
    personality: {
      id: 'personality',
      label: 'Kompositions-Song',
      emoji: '📝',
      description: 'Dein komponierter Song mit Text – volle Balance aus Profil, Astro und Lyrics.',
      tempoBias: 0,
      energyTarget: null,
      brightnessTarget: null,
      densityTarget: null,
      instrumental: false,
      vocalDelivery: null,
      genreHints: [],
      moodWords: ['authentic', 'personal', 'layered'],
      lyricFocus: ['identity', 'motifs', 'core narrative']
    },
    soul: {
      id: 'soul',
      label: 'Persönlichkeitssong',
      emoji: '🎵',
      description: 'Dein Klang aus dem Persönlichkeitsprofil – warm, persönlich, zum Nachdenken und Träumen.',
      tempoBias: -12,
      energyTarget: 0.32,
      brightnessTarget: 0.42,
      densityTarget: 0.38,
      instrumental: false,
      vocalDelivery: 'breathy',
      genreHints: ['intimate singer-songwriter', 'ambient folk', 'soft piano ballad'],
      moodWords: ['vulnerable', 'warm', 'cinematic slow burn'],
      lyricFocus: ['sehnsucht', 'inner world', 'healing']
    },
    workout: {
      id: 'workout',
      label: 'Workout',
      emoji: '⚡',
      description: 'Pulsierend, antreibend – Extraversion & Feuer-Element verstärkt.',
      tempoBias: 28,
      energyTarget: 0.88,
      brightnessTarget: 0.72,
      densityTarget: 0.75,
      instrumental: true,
      vocalDelivery: 'belted',
      genreHints: ['electronic pop', 'driving four-on-the-floor', 'motivational hybrid'],
      moodWords: ['powerful', 'forward motion', 'adrenaline', 'punchy'],
      lyricFocus: ['mut', 'kraft', 'durchhalten']
    },
    focus: {
      id: 'focus',
      label: 'Konzentration',
      emoji: '🎯',
      description: 'Stabil, wenig Ablenkung – Gewissenhaftigkeit & Erd-Element.',
      tempoBias: -6,
      energyTarget: 0.38,
      brightnessTarget: 0.55,
      densityTarget: 0.42,
      instrumental: true,
      vocalDelivery: null,
      genreHints: ['lo-fi study beats', 'minimal ambient', 'steady pulse', 'no vocal hooks'],
      moodWords: ['focused', 'clear', 'steady', 'low distraction'],
      lyricFocus: ['instrumental only']
    }
  };

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function round(n) { return Math.round(n); }

  function pickAnalysisExcerpt(persona, mode, length) {
    if (!persona || !persona.ai_analyses) return '';
    const modes = [mode, 'integrated', 'psychometric', 'astrology'];
    const lengths = [length, 'medium', 'long', 'short'];
    for (let i = 0; i < modes.length; i += 1) {
      const block = persona.ai_analyses[modes[i]];
      if (!block) continue;
      for (let j = 0; j < lengths.length; j += 1) {
        const entry = block[lengths[j]];
        if (!entry) continue;
        if (typeof entry === 'string') return entry.slice(0, 600);
        if (entry.lead) return (entry.lead + ' ' + (entry.closing || '')).slice(0, 600);
        if (entry.sections && entry.sections[0]) return entry.sections[0].body.slice(0, 600);
      }
    }
    return persona.core_narrative || '';
  }

  function analysisKeywords(text) {
    if (!text) return [];
    const stop = new Set(['dein', 'deine', 'eine', 'einer', 'sich', 'dass', 'oder', 'aber', 'auch', 'sehr', 'mehr', 'wird', 'kann', 'nicht', 'dies', 'diese']);
    const words = text.toLowerCase().replace(/[^a-zäöüß\s-]/g, ' ').split(/\s+/);
    const freq = {};
    words.forEach(function (w) {
      if (w.length < 5 || stop.has(w)) return;
      freq[w] = (freq[w] || 0) + 1;
    });
    return Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 6);
  }

  function computeIntentModifiers(persona, intentId, analysisText) {
    const intent = INTENTS[intentId] || INTENTS.personality;
    const sf = (persona && persona.scales_final) || {};
    const dna = (persona && persona.music_dna) || {};
    const astro = persona && persona.astrology;
    const O = sf.BIG5_O || 50, E = sf.BIG5_E || 50, C = sf.BIG5_C || 50,
          N = sf.BIG5_N || 50, A = sf.BIG5_A || 50;
    const SEC = sf.ATT_SEC || 50;

    const baseTempo = dna.tempo_bpm || 92;
    let tempo = baseTempo + intent.tempoBias;

    if (intentId === 'workout') tempo += round((E - 50) * 0.35);
    if (intentId === 'focus') tempo += round((C - 50) * 0.2);
    if (intentId === 'soul') tempo -= round((N - 50) * 0.15);
    tempo = clamp(tempo, 58, 168);

    let energy = intent.energyTarget != null ? intent.energyTarget : (dna.energy != null ? dna.energy : 0.55);
    let brightness = intent.brightnessTarget != null ? intent.brightnessTarget : (dna.brightness != null ? dna.brightness : 0.5);
    let density = intent.densityTarget != null ? intent.densityTarget : (dna.density != null ? dna.density : 0.5);

    if (intentId === 'workout') {
      energy = clamp(energy + (E - 50) / 200 + 0.08, 0.65, 0.98);
      if (astro && astro.elementBalance) {
        const eb = astro.elementBalance;
        const fire = eb.fire || 0;
        const total = (eb.fire || 0) + (eb.earth || 0) + (eb.air || 0) + (eb.water || 0);
        if (total > 0 && fire / total >= 0.28) energy = clamp(energy + 0.06, 0, 1);
      }
    }
    if (intentId === 'focus') {
      density = clamp(density - (O - 50) / 250, 0.25, 0.55);
      brightness = clamp(brightness + (C - 50) / 300, 0.4, 0.7);
    }
    if (intentId === 'soul') {
      energy = clamp(energy - (E - 50) / 220, 0.2, 0.55);
      brightness = clamp(brightness - (N - 50) / 280, 0.3, 0.6);
      if (SEC < 40) density = clamp(density + 0.08, 0, 1);
    }

    const keywords = analysisKeywords(analysisText);
    const motifs = (persona && persona.motifs) || [];
    const rationaleParts = [
      'Basis-Tempo ' + baseTempo + ' BPM → ' + tempo + ' BPM für „' + intent.label + '"',
      'E=' + round(E) + ', N=' + round(N) + ', C=' + round(C)
    ];
    if (keywords.length) rationaleParts.push('Analyse-Signale: ' + keywords.slice(0, 3).join(', '));
    if (motifs.length && intentId !== 'focus') rationaleParts.push('Motiv: „' + motifs[0] + '"');

    return {
      intentId: intent.id,
      intentLabel: intent.label,
      tempo,
      tempoRange: [clamp(tempo - 5, 55, 165), clamp(tempo + 5, 60, 170)],
      energy: round(energy * 100) / 100,
      brightness: round(brightness * 100) / 100,
      density: round(density * 100) / 100,
      instrumental: !!intent.instrumental,
      vocalDelivery: intent.vocalDelivery,
      genreHints: intent.genreHints.slice(),
      moodWords: intent.moodWords.slice(),
      lyricFocus: intent.lyricFocus.slice(),
      analysisKeywords: keywords,
      rationale: rationaleParts.join(' · ')
    };
  }

  /**
   * Vollständiges Playlist-Konzept: je Intent ein berechneter Track-Slot.
   */
  function computePlaylistBlueprint(persona, opts) {
    opts = opts || {};
    const analysisMode = opts.analysisMode || 'integrated';
    const analysisLength = opts.analysisLength || 'medium';
    const excerpt = pickAnalysisExcerpt(persona, analysisMode, analysisLength);
    const methods = (persona && persona.imported_methods_count) || 0;

    const tracks = Object.keys(INTENTS).map(function (key) {
      const intent = INTENTS[key];
      const mods = computeIntentModifiers(persona, key, excerpt);
      const titleBase = (persona && persona.archetype) || 'Profil';
      return {
        intentId: key,
        label: intent.label,
        emoji: intent.emoji,
        description: intent.description,
        titleSuggestion: intent.emoji + ' ' + titleBase + ' – ' + intent.label,
        tempo: mods.tempo,
        tempoRange: mods.tempoRange,
        energy: mods.energy,
        brightness: mods.brightness,
        density: mods.density,
        instrumental: mods.instrumental,
        rationale: mods.rationale,
        styleTags: []
          .concat(intent.genreHints.slice(0, 2))
          .concat(mods.moodWords.slice(0, 2))
          .concat(mods.analysisKeywords.slice(0, 2)),
        weights: {
          personality: astroPresent(persona) ? 0.5 : 0.72,
          astrology: astroPresent(persona) ? 0.5 : 0,
          methods: Math.min(0.28, methods * 0.04),
          intent: 0.35
        }
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      analysisExcerpt: excerpt.slice(0, 280),
      tracks: tracks
    };
  }

  function astroPresent(persona) {
    return !!(persona && persona.astrology && persona.astrology.placements && persona.astrology.placements.length);
  }

  function getIntent(id) {
    return INTENTS[id] || INTENTS.personality;
  }

  function getTrackSpec(blueprint, intentId) {
    if (!blueprint || !blueprint.tracks) return null;
    return blueprint.tracks.find(function (t) { return t.intentId === intentId; }) || null;
  }

  /** Reihenfolge für Auto-Playlist-Queue (4 Suno-Generierungen) */
  const PLAYLIST_INTENT_ORDER = ['personality', 'soul', 'workout', 'focus'];

  window.SongPlaylistEngine = {
    INTENTS: INTENTS,
    PLAYLIST_INTENT_ORDER: PLAYLIST_INTENT_ORDER,
    computeIntentModifiers: computeIntentModifiers,
    computePlaylistBlueprint: computePlaylistBlueprint,
    getIntent: getIntent,
    getTrackSpec: getTrackSpec,
    pickAnalysisExcerpt: pickAnalysisExcerpt
  };
})();
