/**
 * Persönlichkeits-Song Generator – Klang-DNA Fusion
 * Psychometrie = harte Locks (core), Astro + Entwicklung = weiche Modifikatoren.
 * Regeln ändern sich mit der Entwicklungsphase – nicht „mehr“, sondern „weiter“.
 */
(function () {
  'use strict';

  var EVOLUTION_PHASES = [
    {
      id: 'grundton',
      minDepth: 1,
      maxDepth: 2.9,
      label: 'Grundton',
      narrative: 'Dein Klangprofil steht am Anfang – klar und aus dem Test abgeleitet.',
      composeRule: 'Halte das Arrangement reduziert; Bilder aus den Kernmotiven.',
      astroCap: 0.08,
      identityCap: 0.05
    },
    {
      id: 'verzweigung',
      minDepth: 3,
      maxDepth: 4.9,
      label: 'Verzweigung',
      narrative: 'Neue Facetten verbinden sich – erste Resonanz mit symbolischen Schichten.',
      composeRule: 'Verse und Refrain dürfen leicht kontrastieren; Astro nur als Atmosphäre.',
      astroCap: 0.10,
      identityCap: 0.08
    },
    {
      id: 'vertiefung',
      minDepth: 5,
      maxDepth: 6.9,
      label: 'Vertiefung',
      narrative: 'Dein Sound gewinnt Spannweite – frühere Stände hallen mit.',
      composeRule: 'Bridge als Entwicklungsmoment; Motive aus früheren Ständen einweben.',
      astroCap: 0.12,
      identityCap: 0.10
    },
    {
      id: 'reifung',
      minDepth: 7,
      maxDepth: 8.9,
      label: 'Reifung',
      narrative: 'Die Audio-Identität findet Form – Kontinuität über Produktionen hinweg.',
      composeRule: 'Dynamik folgt einer Wachstumskurve; jede Produktion baut auf der letzten auf.',
      astroCap: 0.15,
      identityCap: 0.12
    },
    {
      id: 'integration',
      minDepth: 9,
      maxDepth: 10,
      label: 'Integration',
      narrative: 'Persönlichkeit, Symbolik und Erfahrung verschmelzen zu einer durchgängigen Signatur.',
      composeRule: 'Volle Entwicklungsdramaturgie; Spannungsfelder als Wendepunkte im Song.',
      astroCap: 0.15,
      identityCap: 0.15
    }
  ];

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function round2(x) { return Math.round(x * 100) / 100; }
  function uniq(arr) {
    var s = new Set();
    return (arr || []).filter(function (x) {
      if (!x || s.has(x)) return false;
      s.add(x);
      return true;
    });
  }

  function getEvolutionPhase(depthLevel) {
    var d = depthLevel || 1;
    for (var i = 0; i < EVOLUTION_PHASES.length; i++) {
      var p = EVOLUTION_PHASES[i];
      if (d >= p.minDepth && d <= p.maxDepth) return p;
    }
    return EVOLUTION_PHASES[EVOLUTION_PHASES.length - 1];
  }

  function computeAstroModifiers(astro, phase) {
    if (!astro || !phase) return null;
    var cap = phase.astroCap;
    var mod = {
      tempo_bpm: 0,
      energy: 0,
      brightness: 0,
      warmth: 0,
      density: 0,
      grit: 0,
      reverb_wet: 0,
      tags: [],
      intro_style: null,
      tension_hint: null
    };

    var eb = astro.elementBalance || {};
    var total = (eb.fire || 0) + (eb.earth || 0) + (eb.air || 0) + (eb.water || 0);
    if (total > 0) {
      var shares = {
        fire: (eb.fire || 0) / total,
        earth: (eb.earth || 0) / total,
        air: (eb.air || 0) / total,
        water: (eb.water || 0) / total
      };
      mod.tempo_bpm += Math.round((shares.fire - shares.earth) * 12 * cap / 0.15);
      mod.energy += round2((shares.fire - shares.water) * cap);
      mod.brightness += round2((shares.fire + shares.air - shares.water) * 0.5 * cap);
      mod.warmth += round2((shares.earth + shares.water - shares.air) * 0.4 * cap);
      mod.density += round2((shares.earth - shares.air) * 0.3 * cap);
      if (shares.water >= 0.30) {
        mod.reverb_wet += round2(0.08 * cap / 0.15);
        mod.tags.push('atmospheric release');
      }
      if (shares.fire >= 0.30) mod.tags.push('forward motion');
      if (shares.earth >= 0.30) mod.tags.push('grounded acoustic body');
      if (shares.air >= 0.30) mod.tags.push('spacious mix');
    }

    (astro.hints || []).slice(0, 2).forEach(function (h) {
      if (/Drive|hell/i.test(h)) mod.brightness += round2(0.04 * cap / 0.15);
      if (/Hall|Spannweite/i.test(h)) mod.reverb_wet += round2(0.05 * cap / 0.15);
      if (/akustisch|Wärme/i.test(h)) mod.warmth += round2(0.05 * cap / 0.15);
    });

    var aspects = astro.aspects || [];
    var hard = aspects.filter(function (a) {
      return a.type === 'square' || a.type === 'opposition';
    });
    if (hard.length >= 2) mod.tension_hint = 'bridge_dissonance';
    else if (hard.length === 1) mod.tension_hint = 'subtle_verse_chorus_contrast';

    var ascMap = {
      aries: 'percussive_entry', taurus: 'slow_swell', gemini: 'light_staccato',
      cancer: 'pad_swell', leo: 'bold_opening', virgo: 'minimal_click_in',
      libra: 'balanced_dual_tone', scorpio: 'deep_sub_entry', sagittarius: 'wide_reverb_in',
      capricorn: 'structured_count_in', aquarius: 'synthetic_stab', pisces: 'wave_fade_in'
    };
    if (astro.ascSign && ascMap[astro.ascSign]) mod.intro_style = ascMap[astro.ascSign];

    return mod;
  }

  function computeIdentityModifiers(identity, phase) {
    if (!identity || !phase) return null;
    var cap = phase.identityCap;
    var mod = {
      tempo_bpm: 0,
      energy: 0,
      density: 0,
      section_layers: 0,
      extra_instruments: [],
      structure_note: null,
      tags: []
    };
    var depth = identity.depthLevel || 1;
    var dev = identity.entwicklungsgrad != null
      ? identity.entwicklungsgrad
      : (identity.richness || 0.2);
    var evo = identity.evolutionScore || 0;

    if (phase.id === 'grundton') {
      mod.structure_note = 'linear';
    } else if (phase.id === 'verzweigung') {
      mod.section_layers = 1;
      mod.tags.push('developing personal signature');
    } else if (phase.id === 'vertiefung') {
      mod.section_layers = 2;
      mod.density += round2(dev * cap * 0.8);
      if (depth >= 5) mod.extra_instruments.push('strings');
      mod.tags.push('branching harmonic palette');
    } else if (phase.id === 'reifung') {
      mod.section_layers = 3;
      mod.density += round2(dev * cap);
      if (depth >= 6) mod.extra_instruments.push('ambient_pad');
      if ((identity.audioLibraryCount || 0) >= 2) {
        mod.tags.push('continuity from prior productions');
      }
      mod.structure_note = 'growth_arc';
    } else if (phase.id === 'integration') {
      mod.section_layers = 4;
      mod.density += round2(dev * cap * 1.1);
      if (depth >= 7) mod.extra_instruments.push('subtle_choir');
      if (evo >= 5) mod.tags.push('personality shift dramaturgy');
      mod.structure_note = 'full_development_arc';
    }

    (identity.productionTags || []).slice(0, 3).forEach(function (t) {
      mod.tags.push(t);
    });
    return mod;
  }

  function buildEvolutionNarrative(phase, identity, astro) {
    var s = phase.narrative;
    if (identity && identity.sessionCount > 1) {
      s += ' ' + identity.sessionCount + ' Entwicklungsstände prägen diese Fassung.';
    }
    if (astro) s += ' Symbolische Resonanz ergänzt die psychometrische Grundlage.';
    return s;
  }

  function buildComposeHints(phase, identityMod, astroMod) {
    var h = phase.composeRule;
    if (identityMod && identityMod.structure_note) {
      h += ' Struktur: ' + identityMod.structure_note.replace(/_/g, ' ') + '.';
    }
    if (astroMod && astroMod.tension_hint) {
      h += ' Spannung: ' + astroMod.tension_hint.replace(/_/g, ' ') + '.';
    }
    return h;
  }

  /**
   * Fusioniert core (Psychometrie) mit Astro-Resonanz und Entwicklungs-Identität.
   */
  function fuse(opts) {
    opts = opts || {};
    var core = opts.core;
    if (!core) return null;

    var identity = opts.identity || null;
    var depthLevel = identity ? identity.depthLevel : 1;
    var phase = getEvolutionPhase(depthLevel);
    var astroMod = computeAstroModifiers(opts.astro, phase);
    var identityMod = computeIdentityModifiers(identity, phase);
    var prov = {};
    var fusedScalars = {};

    var tempoBase = core.tempo_bpm || 90;
    var tempoAstro = astroMod ? astroMod.tempo_bpm : 0;
    var tempoFinal = clamp(tempoBase + tempoAstro, 60, 160);
    fusedScalars.tempo_bpm = tempoFinal;
    prov.tempo_bpm = {
      base: tempoBase,
      astro: tempoAstro,
      identity: 0,
      final: tempoFinal,
      phase: phase.id
    };

    ['energy', 'brightness', 'warmth', 'density', 'grit'].forEach(function (k) {
      var b = core[k] != null ? core[k] : 0.5;
      var a = astroMod ? (astroMod[k] || 0) : 0;
      var i = identityMod && k === 'density' ? (identityMod.density || 0) : 0;
      var f = round2(clamp(b + a + i, 0, 1));
      fusedScalars[k] = f;
      prov[k] = { base: b, astro: round2(a), identity: round2(i), final: f, phase: phase.id };
    });

    var inst = core.instrumentation || {};
    var coreInst = [].concat(inst.core || []);
    var colorInst = [].concat(inst.color || []);
    if (identityMod && identityMod.extra_instruments) {
      identityMod.extra_instruments.forEach(function (x) {
        if (coreInst.indexOf(x) === -1 && coreInst.length < 6) coreInst.push(x);
      });
    }

    var tempoLock = core.tempo_lock;
    if (tempoLock) {
      tempoLock = [
        clamp((tempoLock[0] || tempoFinal - 6) + tempoAstro, 55, 155),
        clamp((tempoLock[1] || tempoFinal + 6) + tempoAstro, 65, 165)
      ];
    }

    var productionTags = uniq([]
      .concat(astroMod && astroMod.tags ? astroMod.tags : [])
      .concat(identityMod && identityMod.tags ? identityMod.tags : []));

    return {
      version: 2,
      key: core.key,
      mode: core.mode,
      tempo_bpm: tempoFinal,
      tempo_lock: tempoLock,
      time_signature: core.time_signature,
      tonality_lock: core.tonality_lock,
      energy: fusedScalars.energy,
      brightness: fusedScalars.brightness,
      warmth: fusedScalars.warmth,
      density: fusedScalars.density,
      grit: fusedScalars.grit,
      instrumentation: {
        core: coreInst,
        color: colorInst,
        rhythm: inst.rhythm || [],
        avoid: inst.avoid || []
      },
      vocal: core.vocal,
      structure: core.structure,
      core: JSON.parse(JSON.stringify(core)),
      modifiers: {
        astro: astroMod,
        identity: identityMod,
        evolution_phase: phase.id
      },
      fused: Object.assign({}, fusedScalars, {
        tempo_bpm: tempoFinal,
        instrumentation: {
          core: coreInst,
          color: colorInst,
          rhythm: inst.rhythm || [],
          avoid: inst.avoid || []
        }
      }),
      provenance: prov,
      evolution_phase: phase,
      evolution_narrative: buildEvolutionNarrative(phase, identity, opts.astro),
      compose_hints: buildComposeHints(phase, identityMod, astroMod),
      tension_curve: astroMod && astroMod.tension_hint || null,
      intro_style: astroMod && astroMod.intro_style || null,
      production_evolution_tags: productionTags
    };
  }

  function resolveFlat(dna) {
    if (!dna) return null;
    if (dna.version >= 2) return dna;
    return dna;
  }

  window.SongMusicDNAFusion = {
    fuse: fuse,
    resolveFlat: resolveFlat,
    getEvolutionPhase: getEvolutionPhase,
    EVOLUTION_PHASES: EVOLUTION_PHASES
  };
})();
