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
      lyricFocus: ['identity', 'motifs', 'core narrative'],
      contextProfile: {
        arousal: 0.55, movement: 0.58, reverb_space: 0.45,
        vocal_presence: 0.72, harmonic_motion: 0.62, circadian_band: 'day'
      }
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
      lyricFocus: ['sehnsucht', 'inner world', 'healing'],
      contextProfile: {
        arousal: 0.42, movement: 0.38, reverb_space: 0.58,
        vocal_presence: 0.68, harmonic_motion: 0.48, circadian_band: 'evening'
      }
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
      lyricFocus: ['mut', 'kraft', 'durchhalten'],
      contextProfile: {
        arousal: 0.92, movement: 0.88, reverb_space: 0.28,
        vocal_presence: 0.15, harmonic_motion: 0.72, circadian_band: 'day'
      }
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
      lyricFocus: ['instrumental only'],
      contextProfile: {
        arousal: 0.38, movement: 0.42, reverb_space: 0.35,
        vocal_presence: 0.05, harmonic_motion: 0.45, circadian_band: 'day'
      }
    },
    chill: {
      id: 'chill',
      label: 'Chill / Runterkommen',
      emoji: '🌿',
      description: 'Sanftes Runterfahren – warm, entspannt, abgestimmt auf dein Profil.',
      tempoBias: -18,
      energyTarget: 0.28,
      brightnessTarget: 0.48,
      densityTarget: 0.32,
      instrumental: true,
      vocalDelivery: null,
      genreHints: ['downtempo', 'lo-fi chill', 'soft ambient pads'],
      moodWords: ['relaxed', 'warm ease', 'gentle groove'],
      lyricFocus: ['instrumental only'],
      contextProfile: {
        arousal: 0.22, movement: 0.25, reverb_space: 0.72,
        vocal_presence: 0.05, harmonic_motion: 0.35, circadian_band: 'evening'
      }
    },
    healing: {
      id: 'healing',
      label: 'Klangmeditation',
      emoji: '🕊️',
      description: 'Langsame Klangreise – beruhigend und profilnah, ohne Heilversprechen.',
      tempoBias: -24,
      energyTarget: 0.18,
      brightnessTarget: 0.52,
      densityTarget: 0.28,
      instrumental: true,
      vocalDelivery: null,
      genreHints: ['sound healing textures', 'slow ambient meditation', 'bowls and pads'],
      moodWords: ['calm', 'spacious', 'grounding breath'],
      lyricFocus: ['instrumental only'],
      contextProfile: {
        arousal: 0.12, movement: 0.15, reverb_space: 0.88,
        vocal_presence: 0, harmonic_motion: 0.22, circadian_band: 'rest'
      }
    },
    sleep: {
      id: 'sleep',
      label: 'Einschlafen',
      emoji: '🌙',
      description: 'Sehr ruhig, statisch, instrumental – für den Übergang in die Nacht.',
      tempoBias: -38,
      energyTarget: 0.08,
      brightnessTarget: 0.38,
      densityTarget: 0.18,
      instrumental: true,
      vocalDelivery: null,
      genreHints: ['sleep ambient', 'minimal drone', 'no percussion', 'static harmonic bed'],
      moodWords: ['hypnotic', 'still', 'night drift'],
      lyricFocus: ['instrumental only'],
      contextProfile: {
        arousal: 0.05, movement: 0.08, reverb_space: 0.92,
        vocal_presence: 0, harmonic_motion: 0.12, circadian_band: 'night'
      }
    },
    flow: {
      id: 'flow',
      label: 'Deep Flow',
      emoji: '🌀',
      description: 'Mittleres Tempo, wenig Ablenkung – für längeres Eintauchen in eine Aufgabe.',
      tempoBias: -4,
      energyTarget: 0.42,
      brightnessTarget: 0.52,
      densityTarget: 0.38,
      instrumental: true,
      vocalDelivery: null,
      genreHints: ['deep focus beats', 'ambient techno pulse', 'steady hypnotic groove'],
      moodWords: ['flow state', 'immersive', 'steady pulse'],
      lyricFocus: ['instrumental only'],
      contextProfile: {
        arousal: 0.4, movement: 0.48, reverb_space: 0.42,
        vocal_presence: 0.04, harmonic_motion: 0.5, circadian_band: 'day'
      }
    },
    drive: {
      id: 'drive',
      label: 'Produktivität',
      emoji: '🚀',
      description: 'Antrieb ohne Workout-Intensität – fokussiert vorwärts, strukturiert.',
      tempoBias: 10,
      energyTarget: 0.58,
      brightnessTarget: 0.6,
      densityTarget: 0.52,
      instrumental: true,
      vocalDelivery: null,
      genreHints: ['motivational electronic', 'uptempo lo-fi', 'productive groove'],
      moodWords: ['forward', 'determined', 'clear momentum'],
      lyricFocus: ['instrumental only'],
      contextProfile: {
        arousal: 0.58, movement: 0.62, reverb_space: 0.32,
        vocal_presence: 0.06, harmonic_motion: 0.58, circadian_band: 'day'
      }
    },
    creative: {
      id: 'creative',
      label: 'Kreative Session',
      emoji: '✏️',
      description: 'Offen, inspirierend – für Ideen, Schreiben, Brainstorming mit Persönlichkeitsbezug.',
      tempoBias: 4,
      energyTarget: 0.52,
      brightnessTarget: 0.58,
      densityTarget: 0.48,
      instrumental: false,
      vocalDelivery: 'expressive',
      genreHints: ['indie pop', 'art pop', 'creative singer-songwriter'],
      moodWords: ['curious', 'inspired', 'open colors'],
      lyricFocus: ['ideas', 'metaphors', 'creative self'],
      contextProfile: {
        arousal: 0.52, movement: 0.55, reverb_space: 0.48,
        vocal_presence: 0.62, harmonic_motion: 0.65, circadian_band: 'day'
      }
    },
    hype: {
      id: 'hype',
      label: 'Power / Hype',
      emoji: '🔥',
      description: 'Hohe Energie, club-nah – Pump ohne reines Fitness-Tracking.',
      tempoBias: 22,
      energyTarget: 0.9,
      brightnessTarget: 0.75,
      densityTarget: 0.78,
      instrumental: true,
      vocalDelivery: null,
      genreHints: ['EDM pop hybrid', 'big room energy', 'euphoric drop build'],
      moodWords: ['euphoric', 'power surge', 'peak energy'],
      lyricFocus: ['instrumental only'],
      contextProfile: {
        arousal: 0.94, movement: 0.9, reverb_space: 0.25,
        vocal_presence: 0.1, harmonic_motion: 0.78, circadian_band: 'day'
      }
    },
    electro: {
      id: 'electro',
      label: 'Electro / Club',
      emoji: '🎛️',
      description: 'Deep House, Minimal, Synth – standardmässig instrumental oder mit wenigen sinnlichen Vocal-Fragmenten.',
      tempoBias: 6,
      energyTarget: 0.62,
      brightnessTarget: 0.68,
      densityTarget: 0.55,
      instrumental: true,
      vocalDelivery: 'minimal breathy fragments',
      genreHints: ['deep house', 'minimal techno', 'synthwave', 'club electro'],
      moodWords: ['hypnotic groove', 'neon night', 'body pulse'],
      lyricFocus: ['instrumental or minimal vocal hooks'],
      contextProfile: {
        arousal: 0.62, movement: 0.72, reverb_space: 0.38,
        vocal_presence: 0.12, harmonic_motion: 0.55, circadian_band: 'evening'
      }
    },
    hiphop: {
      id: 'hiphop',
      label: 'Hip-Hop',
      emoji: '🎤',
      description: 'Beats + persönliche Story – dein Profil liefert Motive und Haltung, nicht Standard-Rap-Klischees.',
      tempoBias: -2,
      energyTarget: 0.55,
      brightnessTarget: 0.5,
      densityTarget: 0.58,
      instrumental: false,
      vocalDelivery: 'confident spoken flow',
      genreHints: ['boom bap hip hop', 'lo-fi hip hop', 'conscious rap', 'jazz rap'],
      moodWords: ['authentic', 'groove', 'personal narrative'],
      lyricFocus: ['identity', 'real talk', 'profile motifs'],
      contextProfile: {
        arousal: 0.55, movement: 0.6, reverb_space: 0.35,
        vocal_presence: 0.78, harmonic_motion: 0.52, circadian_band: 'day'
      }
    },
    reggae: {
      id: 'reggae',
      label: 'Reggae / Dub',
      emoji: '🌴',
      description: 'Laid-back Groove – warm, entspannt; Texte können persönlich-positiv aus deinem Profil kommen.',
      tempoBias: -8,
      energyTarget: 0.4,
      brightnessTarget: 0.55,
      densityTarget: 0.42,
      instrumental: false,
      vocalDelivery: 'easy melodic',
      genreHints: ['roots reggae', 'dub reggae', 'one drop groove', 'warm bass'],
      moodWords: ['easy skank', 'sun warmth', 'grounded joy'],
      lyricFocus: ['hope', 'ease', 'personal truth'],
      contextProfile: {
        arousal: 0.38, movement: 0.45, reverb_space: 0.55,
        vocal_presence: 0.65, harmonic_motion: 0.42, circadian_band: 'day'
      }
    },
    funk: {
      id: 'funk',
      label: 'Funk / Groove',
      emoji: '🕺',
      description: 'Syncopierter Groove, Bass-Lines – leicht verspielt, profilnah.',
      tempoBias: 4,
      energyTarget: 0.64,
      brightnessTarget: 0.62,
      densityTarget: 0.6,
      instrumental: false,
      vocalDelivery: 'playful',
      genreHints: ['neo funk', 'disco funk', 'slap bass groove'],
      moodWords: ['groovy', 'syncopated', 'feel-good'],
      lyricFocus: ['playfulness', 'confidence'],
      contextProfile: {
        arousal: 0.66, movement: 0.75, reverb_space: 0.3,
        vocal_presence: 0.58, harmonic_motion: 0.68, circadian_band: 'day'
      }
    },
    jazz: {
      id: 'jazz',
      label: 'Jazz / Neo-Soul',
      emoji: '🎷',
      description: 'Warme Harmonien, Raum – elegant und persönlich.',
      tempoBias: -6,
      energyTarget: 0.38,
      brightnessTarget: 0.48,
      densityTarget: 0.45,
      instrumental: false,
      vocalDelivery: 'smooth',
      genreHints: ['neo soul', 'jazz hop', 'smoky lounge', 'Rhodes chords'],
      moodWords: ['sophisticated', 'warm velvet', 'late evening'],
      lyricFocus: ['intimacy', 'reflection'],
      contextProfile: {
        arousal: 0.35, movement: 0.4, reverb_space: 0.62,
        vocal_presence: 0.6, harmonic_motion: 0.72, circadian_band: 'evening'
      }
    },
    rock: {
      id: 'rock',
      label: 'Rock / Indie',
      emoji: '🎸',
      description: 'Gitarren, Druck, Emotion – Alternative/Indie mit deiner Geschichte.',
      tempoBias: 8,
      energyTarget: 0.68,
      brightnessTarget: 0.58,
      densityTarget: 0.65,
      instrumental: false,
      vocalDelivery: 'passionate',
      genreHints: ['indie rock', 'alternative rock', 'anthemic guitars'],
      moodWords: ['driving', 'raw emotion', 'anthemic'],
      lyricFocus: ['conviction', 'inner fire'],
      contextProfile: {
        arousal: 0.72, movement: 0.7, reverb_space: 0.35,
        vocal_presence: 0.75, harmonic_motion: 0.62, circadian_band: 'day'
      }
    },
    celebrate: {
      id: 'celebrate',
      label: 'Feiern / Sieg',
      emoji: '🎉',
      description: 'Triumph, Durchbruch – uplifting und persönlich.',
      tempoBias: 14,
      energyTarget: 0.75,
      brightnessTarget: 0.7,
      densityTarget: 0.62,
      instrumental: false,
      vocalDelivery: 'anthemic',
      genreHints: ['celebration pop', 'victory anthem', 'euphoric chorus'],
      moodWords: ['triumphant', 'joy burst', 'shared win'],
      lyricFocus: ['achievement', 'gratitude', 'breakthrough'],
      contextProfile: {
        arousal: 0.78, movement: 0.72, reverb_space: 0.4,
        vocal_presence: 0.7, harmonic_motion: 0.68, circadian_band: 'day'
      }
    },
    romance: {
      id: 'romance',
      label: 'Romantik / Sinnlich',
      emoji: '💋',
      description: 'Langsam, warm, sinnlich – optional mit minimalen breathy Vocals.',
      tempoBias: -14,
      energyTarget: 0.32,
      brightnessTarget: 0.45,
      densityTarget: 0.36,
      instrumental: false,
      vocalDelivery: 'sensual breathy',
      genreHints: ['slow R&B', 'sensual downtempo', 'intimate late night'],
      moodWords: ['sensual', 'tender', 'close warmth'],
      lyricFocus: ['desire', 'tenderness', 'connection'],
      contextProfile: {
        arousal: 0.32, movement: 0.28, reverb_space: 0.65,
        vocal_presence: 0.45, harmonic_motion: 0.38, circadian_band: 'evening'
      }
    },
    wander: {
      id: 'wander',
      label: 'Roadtrip / Entdecken',
      emoji: '🗺️',
      description: 'Weite, Bewegung, Neugier – für Unterwegssein und Perspektivwechsel.',
      tempoBias: 2,
      energyTarget: 0.48,
      brightnessTarget: 0.58,
      densityTarget: 0.44,
      instrumental: false,
      vocalDelivery: 'storytelling',
      genreHints: ['indie folk travel', 'cinematic road song', 'open highway'],
      moodWords: ['wandering', 'horizon', 'curious motion'],
      lyricFocus: ['journey', 'change', 'new views'],
      contextProfile: {
        arousal: 0.48, movement: 0.58, reverb_space: 0.52,
        vocal_presence: 0.62, harmonic_motion: 0.55, circadian_band: 'day'
      }
    },
    morning: {
      id: 'morning',
      label: 'Morgen / Start',
      emoji: '🌅',
      description: 'Sanfter Start in den Tag – klar, hoffnungsvoll, nicht zu laut.',
      tempoBias: -4,
      energyTarget: 0.36,
      brightnessTarget: 0.62,
      densityTarget: 0.38,
      instrumental: false,
      vocalDelivery: 'gentle',
      genreHints: ['morning acoustic pop', 'soft sunrise pads', 'fresh start'],
      moodWords: ['fresh', 'hopeful dawn', 'gentle lift'],
      lyricFocus: ['new day', 'intention', 'clarity'],
      contextProfile: {
        arousal: 0.38, movement: 0.42, reverb_space: 0.45,
        vocal_presence: 0.55, harmonic_motion: 0.48, circadian_band: 'day'
      }
    }
  };

  const STYLE_PREFS_DEFAULTS = {
    genreAccent: 'auto',
    vocalMode: 'auto'
  };

  const GENRE_ACCENTS = {
    auto: { label: 'Automatisch (aus Kontext)', tags: [] },
    electro: { label: 'Electro / Club', tags: ['deep house', 'minimal techno', 'synthwave'] },
    hiphop: { label: 'Hip-Hop', tags: ['boom bap hip hop', 'lo-fi beats'] },
    reggae: { label: 'Reggae / Dub', tags: ['roots reggae', 'dub groove'] },
    funk: { label: 'Funk', tags: ['neo funk', 'slap bass'] },
    jazz: { label: 'Jazz / Neo-Soul', tags: ['neo soul', 'jazz hop', 'Rhodes piano', 'smoky lounge', 'live drums', 'warm bass'] },
    rock: { label: 'Rock / Indie', tags: ['indie rock', 'alt rock'] },
    pop: { label: 'Pop / Mainstream', tags: ['modern pop', 'radio friendly'] }
  };

  const VOCAL_MODES = {
    auto: { label: 'Automatisch (Kontext)', instrumental: null, tags: [] },
    full: { label: 'Voller Gesang', instrumental: false, tags: ['full vocal performance', 'clear lyrics'] },
    minimal: { label: 'Wenig Vocals / Hooks', instrumental: false, tags: ['sparse vocal hooks', 'mostly instrumental bed', 'minimal singing'] },
    sexy_minimal: { label: 'Sinnlich-minimal', instrumental: false, tags: ['sensual breathy vocal fragments', 'minimal lyrics', 'mostly instrumental electro bed'] },
    instrumental: { label: 'Nur Instrumental', instrumental: true, tags: ['instrumental no vocals', 'no singing'] }
  };

  const INTENT_GROUPS = [
    { id: 'identity', label: 'Identität', intents: ['personality', 'soul'] },
    { id: 'performance', label: 'Leistung & Kreation', intents: ['workout', 'focus', 'flow', 'drive', 'creative', 'hype'] },
    { id: 'genres', label: 'Genres', intents: ['electro', 'hiphop', 'reggae', 'funk', 'jazz', 'rock'] },
    { id: 'mood', label: 'Stimmung', intents: ['celebrate', 'romance', 'wander', 'morning'] },
    { id: 'regulation', label: 'Regulation', intents: ['chill', 'healing', 'sleep'] }
  ];

  const PLAYLIST_PACKS = {
    core: {
      id: 'core',
      label: 'Kern-Playlist',
      emoji: '🎧',
      order: ['personality', 'soul', 'workout', 'focus'],
      description: 'Kompositions-Song → Persönlichkeitssong → Workout → Konzentration'
    },
    performance: {
      id: 'performance',
      label: 'Leistungs-Paket',
      emoji: '🚀',
      order: ['creative', 'flow', 'drive', 'focus', 'workout', 'hype'],
      description: 'Kreation → Flow → Produktivität → Fokus → Workout → Hype'
    },
    genres: {
      id: 'genres',
      label: 'Genre-Paket',
      emoji: '🎛️',
      order: ['electro', 'hiphop', 'reggae', 'funk'],
      description: 'Electro → Hip-Hop → Reggae → Funk (Profil steuert Text & Motive)'
    },
    regulation: {
      id: 'regulation',
      label: 'Regulations-Paket',
      emoji: '🌿',
      order: ['chill', 'healing', 'sleep'],
      description: 'Chill → Klangmeditation → Einschlafen'
    },
    mood: {
      id: 'mood',
      label: 'Stimmungs-Paket',
      emoji: '✨',
      order: ['morning', 'celebrate', 'romance', 'wander'],
      description: 'Morgen → Feiern → Romantik → Roadtrip'
    },
    full: {
      id: 'full',
      label: 'Komplett (alle Kontexte)',
      emoji: '🌈',
      order: ['personality', 'soul', 'creative', 'electro', 'hiphop', 'reggae', 'workout', 'focus', 'flow', 'drive', 'hype', 'celebrate', 'romance', 'wander', 'morning', 'funk', 'jazz', 'rock', 'chill', 'healing', 'sleep'],
      description: 'Alle 21 Kontexte – lange Session'
    }
  };

  const CONTEXT_DNA_LABELS = {
    arousal: 'Erregung',
    movement: 'Bewegung',
    reverb_space: 'Raum / Hall',
    vocal_presence: 'Stimme',
    harmonic_motion: 'Harmonie-Flow',
    circadian_band: 'Tagesrhythmus'
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
    if (intentId === 'chill') {
      tempo = clamp(tempo + round((50 - E) * 0.12), 58, 95);
      energy = clamp(energy - (E - 50) / 180, 0.15, 0.42);
      brightness = clamp(brightness + (A - 50) / 350, 0.35, 0.62);
    }
    if (intentId === 'healing') {
      tempo = clamp(tempo, 50, 72);
      energy = clamp(energy - (N - 50) / 200, 0.08, 0.28);
      density = clamp(density - 0.1, 0.15, 0.38);
    }
    if (intentId === 'sleep') {
      tempo = clamp(tempo, 45, 58);
      energy = clamp(energy - 0.12, 0.04, 0.15);
      brightness = clamp(brightness - 0.08, 0.22, 0.48);
      density = clamp(density - 0.15, 0.08, 0.28);
    }
    if (intentId === 'flow') {
      density = clamp(density - (O - 50) / 260, 0.22, 0.48);
      tempo = clamp(tempo + round((C - 50) * 0.08), 72, 108);
    }
    if (intentId === 'drive') {
      energy = clamp(energy + (C - 50) / 180, 0.48, 0.72);
      tempo = clamp(tempo + round((E - 50) * 0.12), 88, 128);
    }
    if (intentId === 'creative') {
      brightness = clamp(brightness + (O - 50) / 220, 0.45, 0.72);
      if (O >= 62) density = clamp(density + 0.06, 0, 1);
    }
    if (intentId === 'hype') {
      energy = clamp(energy + (E - 50) / 160, 0.78, 0.98);
      tempo = clamp(tempo + round((E - 50) * 0.2), 118, 145);
    }
    if (intentId === 'electro') {
      energy = clamp(energy + 0.04, 0.52, 0.78);
      brightness = clamp(brightness + 0.06, 0.55, 0.82);
    }
    if (intentId === 'hiphop') {
      tempo = clamp(tempo, 78, 102);
      density = clamp(density + 0.05, 0.45, 0.72);
    }
    if (intentId === 'reggae') {
      tempo = clamp(tempo, 68, 92);
      energy = clamp(energy - (E - 50) / 200, 0.28, 0.52);
    }
    if (intentId === 'funk') {
      tempo = clamp(tempo, 95, 118);
      energy = clamp(energy + (E - 50) / 220, 0.52, 0.78);
    }
    if (intentId === 'jazz') {
      tempo = clamp(tempo, 70, 98);
      energy = clamp(energy - (E - 50) / 250, 0.25, 0.48);
    }
    if (intentId === 'rock') {
      energy = clamp(energy + (E - 50) / 180, 0.55, 0.85);
      if (N >= 55) brightness = clamp(brightness - 0.04, 0, 1);
    }
    if (intentId === 'celebrate') {
      energy = clamp(energy + (E - 50) / 150, 0.62, 0.88);
      brightness = clamp(brightness + 0.08, 0, 1);
    }
    if (intentId === 'romance') {
      energy = clamp(energy - (E - 50) / 220, 0.22, 0.42);
      brightness = clamp(brightness - 0.04, 0.35, 0.55);
    }
    if (intentId === 'wander') {
      brightness = clamp(brightness + (O - 50) / 250, 0.48, 0.68);
    }
    if (intentId === 'morning') {
      brightness = clamp(brightness + 0.1, 0.55, 0.78);
      energy = clamp(energy + 0.04, 0.28, 0.48);
    }

    const contextDNA = computeContextDNA(persona, intentId, {
      tempo: tempo,
      energy: energy,
      instrumental: !!intent.instrumental
    });

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
      contextDNA: contextDNA,
      rationale: rationaleParts.join(' · ')
    };
  }

  function computeContextDNA(persona, intentId, mods) {
    mods = mods || {};
    const intent = INTENTS[intentId] || INTENTS.personality;
    const base = intent.contextProfile || {
      arousal: mods.energy != null ? mods.energy : 0.5,
      movement: 0.5,
      reverb_space: 0.4,
      vocal_presence: intent.instrumental ? 0.05 : 0.55,
      harmonic_motion: 0.5,
      circadian_band: 'day'
    };
    const sf = (persona && persona.scales_final) || {};
    const N = sf.BIG5_N || 50, E = sf.BIG5_E || 50;
    let arousal = base.arousal;
    let movement = base.movement;
    let reverb = base.reverb_space;
    let vocal = base.vocal_presence;
    let harmonic = base.harmonic_motion;
    const circadian = base.circadian_band;

    if (N >= 60 && (intentId === 'sleep' || intentId === 'healing')) {
      arousal = clamp(arousal - 0.03, 0, 1);
    }
    if (E >= 65 && intentId === 'chill') {
      movement = clamp(movement + 0.04, 0, 1);
    }
    if (mods.instrumental) vocal = Math.min(vocal, 0.08);
    if (persona && persona.astrology && persona.astrology.elementBalance) {
      const eb = persona.astrology.elementBalance;
      const total = (eb.fire || 0) + (eb.earth || 0) + (eb.air || 0) + (eb.water || 0);
      if (total > 0 && (eb.water || 0) / total >= 0.28) {
        reverb = clamp(reverb + 0.04, 0, 1);
      }
    }

    return {
      arousal: round(arousal * 100) / 100,
      movement: round(movement * 100) / 100,
      reverb_space: round(reverb * 100) / 100,
      vocal_presence: round(vocal * 100) / 100,
      harmonic_motion: round(harmonic * 100) / 100,
      circadian_band: circadian
    };
  }

  function formatContextDNAValue(key, val) {
    if (key === 'circadian_band') {
      const map = { day: 'Tag', evening: 'Abend', rest: 'Ruhe', night: 'Nacht' };
      return map[val] || String(val);
    }
    if (typeof val === 'number') return Math.round(val * 100) + '%';
    return String(val);
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
        contextDNA: mods.contextDNA,
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

  /** Standard-Reihenfolge (Kern-Playlist, 4 Suno-Generierungen) */
  const PLAYLIST_INTENT_ORDER = PLAYLIST_PACKS.core.order;

  function getPlaylistPack(packId) {
    return PLAYLIST_PACKS[packId] || PLAYLIST_PACKS.core;
  }

  function normalizeStylePrefs(prefs) {
    prefs = prefs || {};
    return {
      genreAccent: GENRE_ACCENTS[prefs.genreAccent] ? prefs.genreAccent : 'auto',
      vocalMode: VOCAL_MODES[prefs.vocalMode] ? prefs.vocalMode : 'auto'
    };
  }

  function applyStylePrefs(mods, prefs, intentId) {
    prefs = normalizeStylePrefs(prefs);
    mods = Object.assign({}, mods);
    var accent = GENRE_ACCENTS[prefs.genreAccent];
    var vocal = VOCAL_MODES[prefs.vocalMode];
    if (accent && accent.tags && accent.tags.length) {
      if (prefs.genreAccent === 'jazz') {
        mods.genreHints = accent.tags.concat(
          (mods.genreHints || []).filter(function (h) {
            return h && !/electro|techno|edm|house|synthwave|minimal techno|deep house/i.test(h);
          })
        ).slice(0, 6);
      } else {
        mods.genreHints = accent.tags.concat(mods.genreHints || []).slice(0, 6);
      }
    }
    if (vocal && vocal.tags && vocal.tags.length) {
      mods.moodWords = (mods.moodWords || []).concat(vocal.tags);
    }
    if (vocal && vocal.instrumental === true) {
      mods.instrumental = true;
      if (mods.contextDNA) {
        mods.contextDNA = Object.assign({}, mods.contextDNA, { vocal_presence: 0.02 });
      }
    } else if (vocal && vocal.instrumental === false) {
      mods.instrumental = false;
    }
    if (prefs.vocalMode === 'minimal' || prefs.vocalMode === 'sexy_minimal') {
      mods.instrumental = false;
      if (mods.contextDNA) {
        mods.contextDNA = Object.assign({}, mods.contextDNA, {
          vocal_presence: prefs.vocalMode === 'sexy_minimal' ? 0.28 : 0.18
        });
      }
      mods.vocalDelivery = prefs.vocalMode === 'sexy_minimal' ? 'sensual breathy fragments' : 'sparse hooks';
    }
    if (['hiphop', 'reggae', 'electro'].indexOf(intentId) >= 0 && prefs.genreAccent === 'auto') {
      mods.personalGenreNote = 'Profile-driven lyrics and motifs inside ' + (INTENTS[intentId] && INTENTS[intentId].label || intentId) + ' production';
    }
    return mods;
  }

  function resolveInstrumental(mods, prefs, intentId) {
    prefs = normalizeStylePrefs(prefs);
    var vocal = VOCAL_MODES[prefs.vocalMode];
    if (vocal && vocal.instrumental === true) return true;
    if (vocal && vocal.instrumental === false) return false;
    return !!(mods && mods.instrumental);
  }

  function allowsCustomVoice(intentId, prefs, instrumental) {
    if (instrumental) return false;
    prefs = normalizeStylePrefs(prefs);
    if (prefs.vocalMode === 'instrumental') return false;
    var noVoice = ['focus', 'workout', 'chill', 'healing', 'sleep', 'flow', 'drive', 'hype'];
    if (noVoice.indexOf(intentId) >= 0 && prefs.vocalMode === 'auto') return false;
    if (intentId === 'electro' && prefs.vocalMode === 'auto') return false;
    return true;
  }

  window.SongPlaylistEngine = {
    INTENTS: INTENTS,
    INTENT_GROUPS: INTENT_GROUPS,
    PLAYLIST_PACKS: PLAYLIST_PACKS,
    PLAYLIST_INTENT_ORDER: PLAYLIST_INTENT_ORDER,
    CONTEXT_DNA_LABELS: CONTEXT_DNA_LABELS,
    STYLE_PREFS_DEFAULTS: STYLE_PREFS_DEFAULTS,
    GENRE_ACCENTS: GENRE_ACCENTS,
    VOCAL_MODES: VOCAL_MODES,
    computeIntentModifiers: computeIntentModifiers,
    computeContextDNA: computeContextDNA,
    formatContextDNAValue: formatContextDNAValue,
    computePlaylistBlueprint: computePlaylistBlueprint,
    getIntent: getIntent,
    getTrackSpec: getTrackSpec,
    getPlaylistPack: getPlaylistPack,
    pickAnalysisExcerpt: pickAnalysisExcerpt,
    normalizeStylePrefs: normalizeStylePrefs,
    applyStylePrefs: applyStylePrefs,
    resolveInstrumental: resolveInstrumental,
    allowsCustomVoice: allowsCustomVoice
  };
})();
