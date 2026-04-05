/**
 * Singing Exercises – Level 1-6 definitions
 * Types: breathing, sustained_tone, pitch_match, glide, scale, interval, melody, sovt_exercise
 */

const SINGING_EXERCISES = {

  // ============================
  // LEVEL 1 – Atem und Summen
  // ============================
  1: [
    {
      id: 'l1_breathing_1',
      level: 1,
      category: 'warmup',
      title: 'Zwerchfellatmung',
      description: 'Atme tief ein (4s), halte (4s), atme langsam aus (6s). Spüre, wie sich dein Bauch hebt.',
      duration_s: 45,
      xp_reward: 10,
      type: 'breathing',
      phases: [
        { action: 'inhale', duration_s: 4, label: 'Einatmen' },
        { action: 'hold', duration_s: 4, label: 'Halten' },
        { action: 'exhale', duration_s: 6, label: 'Ausatmen' }
      ],
      repeats: 3
    },
    {
      id: 'l1_hum_1',
      level: 1,
      category: 'sovt',
      title: 'Summen auf "mmm"',
      description: 'Summe einen bequemen Ton auf "mmm". Spüre die Vibration in Nase und Lippen.',
      duration_s: 30,
      xp_reward: 15,
      type: 'sustained_tone',
      notes: [
        { midi: 48, duration_beats: 8, tolerance_cents: 150 }
      ]
    },
    {
      id: 'l1_pitch_match_3',
      level: 1,
      category: 'pitch_matching',
      title: 'Drei Töne treffen',
      description: 'Höre den Referenzton und singe ihn nach. Versuche, die grüne Zone zu treffen.',
      duration_s: 30,
      xp_reward: 15,
      type: 'pitch_match',
      notes: [
        { midi: 48, duration_beats: 4, tolerance_cents: 100 },
        { midi: 50, duration_beats: 4, tolerance_cents: 100 },
        { midi: 52, duration_beats: 4, tolerance_cents: 100 }
      ]
    },
    {
      id: 'l1_pitch_match_5',
      level: 1,
      category: 'pitch_matching',
      title: 'Fünf Töne treffen',
      description: 'Fünf aufeinanderfolgende Töne – halte jeden für 3 Sekunden.',
      duration_s: 40,
      xp_reward: 20,
      type: 'pitch_match',
      notes: [
        { midi: 48, duration_beats: 3, tolerance_cents: 100 },
        { midi: 50, duration_beats: 3, tolerance_cents: 100 },
        { midi: 52, duration_beats: 3, tolerance_cents: 100 },
        { midi: 53, duration_beats: 3, tolerance_cents: 100 },
        { midi: 55, duration_beats: 3, tolerance_cents: 100 }
      ]
    },
    {
      id: 'l1_sustained_1',
      level: 1,
      category: 'tone_control',
      title: 'Ton halten (5s)',
      description: 'Halte einen einzelnen Ton möglichst stabil für 5 Sekunden.',
      duration_s: 20,
      xp_reward: 15,
      type: 'sustained_tone',
      notes: [
        { midi: 50, duration_beats: 10, tolerance_cents: 120 }
      ]
    },
    {
      id: 'l1_box_breathing',
      level: 1,
      category: 'warmup',
      title: 'Box-Atmung (4-4-4-4)',
      description: 'Gleichmässige Phasen: einatmen, halten, ausatmen, halten – beruhigt das Nervensystem und stabilisiert den Stütz.',
      duration_s: 48,
      xp_reward: 12,
      type: 'breathing',
      phases: [
        { action: 'inhale', duration_s: 4, label: 'Einatmen' },
        { action: 'hold', duration_s: 4, label: 'Halten' },
        { action: 'exhale', duration_s: 4, label: 'Ausatmen' },
        { action: 'hold', duration_s: 4, label: 'Halten' }
      ],
      repeats: 3
    },
    {
      id: 'l1_micro_siren',
      level: 1,
      category: 'sovt',
      title: 'Mini-Sirene',
      description: 'Sehr kleiner, langsamer Auf- und Ab-Glide auf einem weichen „uuu“ oder Summen – mobilisiert die Stimmlippen ohne Druck.',
      duration_s: 32,
      xp_reward: 15,
      type: 'glide',
      glide_start_midi: 48,
      glide_end_midi: 52,
      glide_duration_s: 3,
      repeats: 4,
      tolerance_cents: 180
    },
    {
      id: 'l1_pitch_match_2',
      level: 1,
      category: 'pitch_matching',
      title: 'Zwei Töne treffen',
      description: 'Nur zwei Referenztöne – gut für den Einstieg ins Pitch-Matching.',
      duration_s: 22,
      xp_reward: 12,
      type: 'pitch_match',
      notes: [
        { midi: 49, duration_beats: 5, tolerance_cents: 110 },
        { midi: 52, duration_beats: 5, tolerance_cents: 110 }
      ]
    },
    {
      id: 'l1_cooldown',
      level: 1,
      category: 'cooldown',
      title: 'Abklingendes Summen',
      description: 'Summe sanft auf "mmm" und werde langsam leiser bis zur Stille.',
      duration_s: 20,
      xp_reward: 5,
      type: 'sustained_tone',
      notes: [
        { midi: 48, duration_beats: 16, tolerance_cents: 200 }
      ]
    }
  ],

  // ============================
  // LEVEL 2 – SOVT Basics
  // ============================
  2: [
    {
      id: 'l2_lip_trill',
      level: 2,
      category: 'sovt',
      title: 'Lip Trill',
      description: 'Lass deine Lippen flattern wie ein Motorboot. Halte den Ton stabil dabei.',
      duration_s: 30,
      xp_reward: 15,
      type: 'sovt_exercise',
      notes: [
        { midi: 48, duration_beats: 8, tolerance_cents: 150 },
        { midi: 50, duration_beats: 8, tolerance_cents: 150 }
      ]
    },
    {
      id: 'l2_straw_glide',
      level: 2,
      category: 'sovt',
      title: 'Straw Phonation Glide',
      description: 'Summe durch einen Strohhalm und gleite langsam vom tiefen zum hohen Ton.',
      duration_s: 30,
      xp_reward: 20,
      type: 'glide',
      glide_start_midi: 43,
      glide_end_midi: 60,
      glide_duration_s: 5,
      repeats: 3,
      tolerance_cents: 200
    },
    {
      id: 'l2_ng_hum',
      level: 2,
      category: 'sovt',
      title: 'Summen auf "ng"',
      description: 'Summe auf "ng" (wie am Ende von "Klang"). Spüre die Resonanz im Nasenraum.',
      duration_s: 30,
      xp_reward: 15,
      type: 'sustained_tone',
      notes: [
        { midi: 50, duration_beats: 8, tolerance_cents: 120 },
        { midi: 52, duration_beats: 8, tolerance_cents: 120 }
      ]
    },
    {
      id: 'l2_tone_hold_8',
      level: 2,
      category: 'tone_control',
      title: 'Ton halten (8s)',
      description: 'Halte den Ton stabil für 8 Sekunden – Gleichmässigkeit zählt!',
      duration_s: 30,
      xp_reward: 20,
      type: 'sustained_tone',
      notes: [
        { midi: 48, duration_beats: 16, tolerance_cents: 100 },
        { midi: 52, duration_beats: 16, tolerance_cents: 100 }
      ]
    },
    {
      id: 'l2_pitch_match_stepwise',
      level: 2,
      category: 'pitch_matching',
      title: 'Tonleiter-Schritte',
      description: 'Singe die Töne der Tonleiter Schritt für Schritt nach.',
      duration_s: 35,
      xp_reward: 20,
      type: 'pitch_match',
      notes: [
        { midi: 48, duration_beats: 3, tolerance_cents: 80 },
        { midi: 50, duration_beats: 3, tolerance_cents: 80 },
        { midi: 52, duration_beats: 3, tolerance_cents: 80 },
        { midi: 53, duration_beats: 3, tolerance_cents: 80 },
        { midi: 55, duration_beats: 3, tolerance_cents: 80 }
      ]
    },
    {
      id: 'l2_tongue_trill',
      level: 2,
      category: 'sovt',
      title: 'Zungen-Triller',
      description: 'Weicher Zungen-Triller (ähnlich spanischem „rr“) auf einem bequemen Ton – alternative SOVT-Anregung neben Lip Trill.',
      duration_s: 28,
      xp_reward: 16,
      type: 'sovt_exercise',
      notes: [
        { midi: 49, duration_beats: 8, tolerance_cents: 160 },
        { midi: 51, duration_beats: 8, tolerance_cents: 160 }
      ]
    },
    {
      id: 'l2_glide_down',
      level: 2,
      category: 'sovt',
      title: 'Abwärts-Glide',
      description: 'Gleite von einem höheren zum tieferen Ton – oft angenehmer für die Kehle als nur aufwärts.',
      duration_s: 32,
      xp_reward: 18,
      type: 'glide',
      glide_start_midi: 58,
      glide_end_midi: 48,
      glide_duration_s: 5,
      repeats: 3,
      tolerance_cents: 200
    },
    {
      id: 'l2_open_vowel_ah',
      level: 2,
      category: 'resonance',
      title: 'Offenes „Ah“',
      description: 'Halte ein offenes „Ah“ mit weichem Gaumen – trainiert Mundstellung und Grundresonanz.',
      duration_s: 28,
      xp_reward: 18,
      type: 'sustained_tone',
      notes: [
        { midi: 50, duration_beats: 14, tolerance_cents: 110 }
      ]
    },
    {
      id: 'l2_pentatonic_up',
      level: 2,
      category: 'scales',
      title: 'Dur-Pentatonik (aufwärts)',
      description: 'Die fünf Töne der Dur-Pentatonik – melodisch und ohne Leitton, gut für sicheres Intonieren.',
      duration_s: 28,
      xp_reward: 22,
      type: 'scale',
      notes: [
        { midi: 48, duration_beats: 2, tolerance_cents: 85 },
        { midi: 50, duration_beats: 2, tolerance_cents: 85 },
        { midi: 52, duration_beats: 2, tolerance_cents: 85 },
        { midi: 55, duration_beats: 2, tolerance_cents: 85 },
        { midi: 57, duration_beats: 2, tolerance_cents: 85 }
      ]
    }
  ],

  // ============================
  // LEVEL 3 – Tonleitern
  // ============================
  3: [
    {
      id: 'l3_major_scale_up',
      level: 3,
      category: 'scales',
      title: 'Dur-Tonleiter aufwärts',
      description: 'Singe die C-Dur-Tonleiter aufwärts: Do Re Mi Fa Sol La Ti Do.',
      duration_s: 30,
      xp_reward: 25,
      type: 'scale',
      notes: [
        { midi: 48, duration_beats: 2, tolerance_cents: 60 },
        { midi: 50, duration_beats: 2, tolerance_cents: 60 },
        { midi: 52, duration_beats: 2, tolerance_cents: 60 },
        { midi: 53, duration_beats: 2, tolerance_cents: 60 },
        { midi: 55, duration_beats: 2, tolerance_cents: 60 },
        { midi: 57, duration_beats: 2, tolerance_cents: 60 },
        { midi: 59, duration_beats: 2, tolerance_cents: 60 },
        { midi: 60, duration_beats: 2, tolerance_cents: 60 }
      ]
    },
    {
      id: 'l3_major_scale_down',
      level: 3,
      category: 'scales',
      title: 'Dur-Tonleiter abwärts',
      description: 'Singe die C-Dur-Tonleiter abwärts: Do Ti La Sol Fa Mi Re Do.',
      duration_s: 30,
      xp_reward: 25,
      type: 'scale',
      notes: [
        { midi: 60, duration_beats: 2, tolerance_cents: 60 },
        { midi: 59, duration_beats: 2, tolerance_cents: 60 },
        { midi: 57, duration_beats: 2, tolerance_cents: 60 },
        { midi: 55, duration_beats: 2, tolerance_cents: 60 },
        { midi: 53, duration_beats: 2, tolerance_cents: 60 },
        { midi: 52, duration_beats: 2, tolerance_cents: 60 },
        { midi: 50, duration_beats: 2, tolerance_cents: 60 },
        { midi: 48, duration_beats: 2, tolerance_cents: 60 }
      ]
    },
    {
      id: 'l3_triad',
      level: 3,
      category: 'intervals',
      title: 'Dreiklänge',
      description: 'Singe Dreiklänge: Grundton – Terz – Quinte und zurück.',
      duration_s: 35,
      xp_reward: 25,
      type: 'scale',
      notes: [
        { midi: 48, duration_beats: 3, tolerance_cents: 60 },
        { midi: 52, duration_beats: 3, tolerance_cents: 60 },
        { midi: 55, duration_beats: 3, tolerance_cents: 60 },
        { midi: 52, duration_beats: 3, tolerance_cents: 60 },
        { midi: 48, duration_beats: 3, tolerance_cents: 60 }
      ]
    },
    {
      id: 'l3_interval_third',
      level: 3,
      category: 'intervals',
      title: 'Terz-Sprünge',
      description: 'Springe zwischen Tönen im Terz-Abstand.',
      duration_s: 30,
      xp_reward: 25,
      type: 'interval',
      notes: [
        { midi: 48, duration_beats: 2, tolerance_cents: 70 },
        { midi: 52, duration_beats: 2, tolerance_cents: 70 },
        { midi: 50, duration_beats: 2, tolerance_cents: 70 },
        { midi: 53, duration_beats: 2, tolerance_cents: 70 },
        { midi: 52, duration_beats: 2, tolerance_cents: 70 },
        { midi: 55, duration_beats: 2, tolerance_cents: 70 }
      ]
    },
    {
      id: 'l3_interval_fifth',
      level: 3,
      category: 'intervals',
      title: 'Quint-Sprünge',
      description: 'Springe zwischen Tönen im Quint-Abstand – eine grössere Herausforderung!',
      duration_s: 30,
      xp_reward: 30,
      type: 'interval',
      notes: [
        { midi: 48, duration_beats: 3, tolerance_cents: 80 },
        { midi: 55, duration_beats: 3, tolerance_cents: 80 },
        { midi: 50, duration_beats: 3, tolerance_cents: 80 },
        { midi: 57, duration_beats: 3, tolerance_cents: 80 },
        { midi: 48, duration_beats: 3, tolerance_cents: 80 }
      ]
    },
    {
      id: 'l3_minor_natural_up',
      level: 3,
      category: 'scales',
      title: 'Moll-Tonleiter (natürlich, aufwärts)',
      description: 'A-Moll natürlich aufwärts (La Ti Do Re Mi Fa Sol La) – anderes Tonmaterial als Dur, trainiert Gehör für Moll-Klänge.',
      duration_s: 36,
      xp_reward: 28,
      type: 'scale',
      notes: [
        { midi: 45, duration_beats: 2, tolerance_cents: 65 },
        { midi: 47, duration_beats: 2, tolerance_cents: 65 },
        { midi: 48, duration_beats: 2, tolerance_cents: 65 },
        { midi: 50, duration_beats: 2, tolerance_cents: 65 },
        { midi: 52, duration_beats: 2, tolerance_cents: 65 },
        { midi: 53, duration_beats: 2, tolerance_cents: 65 },
        { midi: 55, duration_beats: 2, tolerance_cents: 65 },
        { midi: 57, duration_beats: 2, tolerance_cents: 65 }
      ]
    },
    {
      id: 'l3_arpeggio_major',
      level: 3,
      category: 'intervals',
      title: 'Dur-Arpeggio',
      description: 'Gebrochener Akkord (Tonleiter-Töne des Dreiklangs) – typische Gesangs- und Hörfeld-Übung.',
      duration_s: 32,
      xp_reward: 28,
      type: 'scale',
      notes: [
        { midi: 48, duration_beats: 2, tolerance_cents: 65 },
        { midi: 52, duration_beats: 2, tolerance_cents: 65 },
        { midi: 55, duration_beats: 2, tolerance_cents: 65 },
        { midi: 60, duration_beats: 3, tolerance_cents: 65 },
        { midi: 55, duration_beats: 2, tolerance_cents: 65 },
        { midi: 52, duration_beats: 2, tolerance_cents: 65 },
        { midi: 48, duration_beats: 3, tolerance_cents: 65 }
      ]
    },
    {
      id: 'l3_octave_leaps',
      level: 3,
      category: 'intervals',
      title: 'Oktav-Sprünge',
      description: 'Springe die Oktave (gleicher Notenname) – wichtig für Register-Koordination und stabile Kopplage.',
      duration_s: 32,
      xp_reward: 32,
      type: 'interval',
      notes: [
        { midi: 48, duration_beats: 3, tolerance_cents: 90 },
        { midi: 60, duration_beats: 3, tolerance_cents: 90 },
        { midi: 50, duration_beats: 3, tolerance_cents: 90 },
        { midi: 62, duration_beats: 3, tolerance_cents: 90 },
        { midi: 52, duration_beats: 3, tolerance_cents: 90 },
        { midi: 64, duration_beats: 3, tolerance_cents: 90 }
      ]
    }
  ],

  // ============================
  // LEVEL 4 – Dynamik und Register
  // ============================
  4: [
    {
      id: 'l4_crescendo',
      level: 4,
      category: 'dynamics',
      title: 'Crescendo',
      description: 'Beginne ganz leise und werde langsam lauter – halte dabei den Ton stabil.',
      duration_s: 25,
      xp_reward: 25,
      type: 'sustained_tone',
      notes: [
        { midi: 50, duration_beats: 16, tolerance_cents: 80 }
      ],
      dynamic: 'crescendo'
    },
    {
      id: 'l4_decrescendo',
      level: 4,
      category: 'dynamics',
      title: 'Decrescendo',
      description: 'Beginne laut und werde langsam leiser – kontrollierter Rückgang.',
      duration_s: 25,
      xp_reward: 25,
      type: 'sustained_tone',
      notes: [
        { midi: 50, duration_beats: 16, tolerance_cents: 80 }
      ],
      dynamic: 'decrescendo'
    },
    {
      id: 'l4_register_low',
      level: 4,
      category: 'register',
      title: 'Bruststimme erkunden',
      description: 'Singe in deiner tiefen, kräftigen Bruststimme. Spüre die Vibration in der Brust.',
      duration_s: 30,
      xp_reward: 25,
      type: 'scale',
      notes: [
        { midi: 43, duration_beats: 3, tolerance_cents: 80 },
        { midi: 45, duration_beats: 3, tolerance_cents: 80 },
        { midi: 47, duration_beats: 3, tolerance_cents: 80 },
        { midi: 48, duration_beats: 3, tolerance_cents: 80 }
      ]
    },
    {
      id: 'l4_register_high',
      level: 4,
      category: 'register',
      title: 'Kopfstimme erkunden',
      description: 'Wechsle in deine Kopfstimme – leicht und schwebend.',
      duration_s: 30,
      xp_reward: 25,
      type: 'scale',
      notes: [
        { midi: 57, duration_beats: 3, tolerance_cents: 100 },
        { midi: 59, duration_beats: 3, tolerance_cents: 100 },
        { midi: 60, duration_beats: 3, tolerance_cents: 100 },
        { midi: 62, duration_beats: 3, tolerance_cents: 100 }
      ]
    },
    {
      id: 'l4_staccato',
      level: 4,
      category: 'articulation',
      title: 'Staccato-Übung',
      description: 'Singe kurze, abgehackte Töne – schnell an, schnell aus.',
      duration_s: 25,
      xp_reward: 25,
      type: 'pitch_match',
      notes: [
        { midi: 48, duration_beats: 1, tolerance_cents: 70 },
        { midi: 50, duration_beats: 1, tolerance_cents: 70 },
        { midi: 52, duration_beats: 1, tolerance_cents: 70 },
        { midi: 53, duration_beats: 1, tolerance_cents: 70 },
        { midi: 55, duration_beats: 1, tolerance_cents: 70 },
        { midi: 57, duration_beats: 1, tolerance_cents: 70 },
        { midi: 59, duration_beats: 1, tolerance_cents: 70 },
        { midi: 60, duration_beats: 1, tolerance_cents: 70 }
      ]
    },
    {
      id: 'l4_glide_full',
      level: 4,
      category: 'register',
      title: 'Register-Glide',
      description: 'Gleite nahtlos von der Bruststimme in die Kopfstimme und zurück.',
      duration_s: 30,
      xp_reward: 30,
      type: 'glide',
      glide_start_midi: 43,
      glide_end_midi: 62,
      glide_duration_s: 6,
      repeats: 2,
      tolerance_cents: 150
    },
    {
      id: 'l4_portamento',
      level: 4,
      category: 'register',
      title: 'Portamento (Terz)',
      description: 'Verbinde zwei Töne langsam ohne Zwischenhalt – trainiert weiche Übergänge wie im Pop/Belcanto.',
      duration_s: 28,
      xp_reward: 28,
      type: 'glide',
      glide_start_midi: 50,
      glide_end_midi: 53,
      glide_duration_s: 4,
      repeats: 5,
      tolerance_cents: 140
    },
    {
      id: 'l4_chromatic_steps',
      level: 4,
      category: 'agility',
      title: 'Chromatische Halbtonschritte',
      description: 'Vier aufeinanderfolgende Halbtonschritte – feine Stimmführung und Intonation.',
      duration_s: 28,
      xp_reward: 30,
      type: 'pitch_match',
      notes: [
        { midi: 50, duration_beats: 2, tolerance_cents: 55 },
        { midi: 51, duration_beats: 2, tolerance_cents: 55 },
        { midi: 52, duration_beats: 2, tolerance_cents: 55 },
        { midi: 53, duration_beats: 2, tolerance_cents: 55 }
      ]
    },
    {
      id: 'l4_sirens_two_way',
      level: 4,
      category: 'register',
      title: 'Doppel-Sirene',
      description: 'Zwei Durchgänge mit gleichem Aufwärts-Glide – zweite Runde bewusst weicher; gleichmässiger Luftstrom.',
      duration_s: 34,
      xp_reward: 28,
      type: 'glide',
      glide_start_midi: 46,
      glide_end_midi: 58,
      glide_duration_s: 5,
      repeats: 2,
      tolerance_cents: 160
    }
  ],

  // ============================
  // LEVEL 5 – Melodie-Phrasen
  // ============================
  5: [
    {
      id: 'l5_simple_melody',
      level: 5,
      category: 'melody',
      title: 'Einfache Melodie',
      description: 'Singe diese kurze Melodie nach – höre erst zu, dann singe.',
      duration_s: 30,
      xp_reward: 30,
      type: 'melody',
      notes: [
        { midi: 48, duration_beats: 2, tolerance_cents: 60 },
        { midi: 50, duration_beats: 2, tolerance_cents: 60 },
        { midi: 52, duration_beats: 4, tolerance_cents: 60 },
        { midi: 50, duration_beats: 2, tolerance_cents: 60 },
        { midi: 48, duration_beats: 4, tolerance_cents: 60 }
      ]
    },
    {
      id: 'l5_call_response',
      level: 5,
      category: 'melody',
      title: 'Call & Response',
      description: 'Höre die Phrase und wiederhole sie – wie ein Echo.',
      duration_s: 40,
      xp_reward: 30,
      type: 'melody',
      notes: [
        { midi: 48, duration_beats: 1, tolerance_cents: 60 },
        { midi: 52, duration_beats: 1, tolerance_cents: 60 },
        { midi: 55, duration_beats: 2, tolerance_cents: 60 },
        { midi: 53, duration_beats: 1, tolerance_cents: 60 },
        { midi: 52, duration_beats: 1, tolerance_cents: 60 },
        { midi: 50, duration_beats: 2, tolerance_cents: 60 },
        { midi: 48, duration_beats: 4, tolerance_cents: 60 }
      ]
    },
    {
      id: 'l5_vibrato_intro',
      level: 5,
      category: 'expression',
      title: 'Vibrato-Einführung',
      description: 'Halte einen Ton und versuche, eine leichte Schwingung (Vibrato) zu erzeugen.',
      duration_s: 30,
      xp_reward: 30,
      type: 'sustained_tone',
      notes: [
        { midi: 52, duration_beats: 16, tolerance_cents: 120 }
      ],
      vibrato: true
    },
    {
      id: 'l5_ascending_phrase',
      level: 5,
      category: 'melody',
      title: 'Aufsteigende Phrase',
      description: 'Eine emotional aufsteigende Melodielinie.',
      duration_s: 25,
      xp_reward: 30,
      type: 'melody',
      notes: [
        { midi: 48, duration_beats: 2, tolerance_cents: 60 },
        { midi: 50, duration_beats: 1, tolerance_cents: 60 },
        { midi: 52, duration_beats: 1, tolerance_cents: 60 },
        { midi: 55, duration_beats: 2, tolerance_cents: 60 },
        { midi: 57, duration_beats: 2, tolerance_cents: 60 },
        { midi: 60, duration_beats: 4, tolerance_cents: 60 }
      ]
    },
    {
      id: 'l5_legato',
      level: 5,
      category: 'articulation',
      title: 'Legato-Verbindung',
      description: 'Verbinde die Töne fliessend ohne Unterbrechung.',
      duration_s: 30,
      xp_reward: 30,
      type: 'melody',
      notes: [
        { midi: 48, duration_beats: 3, tolerance_cents: 60 },
        { midi: 52, duration_beats: 3, tolerance_cents: 60 },
        { midi: 50, duration_beats: 3, tolerance_cents: 60 },
        { midi: 55, duration_beats: 3, tolerance_cents: 60 },
        { midi: 53, duration_beats: 3, tolerance_cents: 60 },
        { midi: 48, duration_beats: 3, tolerance_cents: 60 }
      ]
    },
    {
      id: 'l5_descending_phrase',
      level: 5,
      category: 'melody',
      title: 'Absteigende Phrase',
      description: 'Eine klar abwärts führende Linie – oft emotional „erlösend“, trainiert kontrolliertes Absenken der Tonlage.',
      duration_s: 32,
      xp_reward: 32,
      type: 'melody',
      notes: [
        { midi: 60, duration_beats: 2, tolerance_cents: 58 },
        { midi: 57, duration_beats: 2, tolerance_cents: 58 },
        { midi: 55, duration_beats: 2, tolerance_cents: 58 },
        { midi: 52, duration_beats: 3, tolerance_cents: 58 },
        { midi: 50, duration_beats: 2, tolerance_cents: 58 },
        { midi: 48, duration_beats: 4, tolerance_cents: 58 }
      ]
    },
    {
      id: 'l5_syncopated_motif',
      level: 5,
      category: 'rhythm',
      title: 'Synkopierter Motivfaden',
      description: 'Kurze-lange Rhythmusmuster wie im Pop – achte auf präzise Einsätze (der Referenzton hilft).',
      duration_s: 34,
      xp_reward: 32,
      type: 'melody',
      notes: [
        { midi: 52, duration_beats: 1, tolerance_cents: 65 },
        { midi: 52, duration_beats: 1, tolerance_cents: 65 },
        { midi: 55, duration_beats: 3, tolerance_cents: 65 },
        { midi: 53, duration_beats: 1, tolerance_cents: 65 },
        { midi: 52, duration_beats: 3, tolerance_cents: 65 },
        { midi: 48, duration_beats: 4, tolerance_cents: 65 }
      ]
    },
    {
      id: 'l5_humming_melody',
      level: 5,
      category: 'sovt',
      title: 'Summ-Melodie',
      description: 'Die Melodie nur auf „mmm“ oder „ng“ summen – reduziert Stimmfalten-Belastung, Fokus auf Höhe und Phrasierung.',
      duration_s: 30,
      xp_reward: 30,
      type: 'melody',
      notes: [
        { midi: 50, duration_beats: 2, tolerance_cents: 70 },
        { midi: 52, duration_beats: 2, tolerance_cents: 70 },
        { midi: 55, duration_beats: 2, tolerance_cents: 70 },
        { midi: 53, duration_beats: 2, tolerance_cents: 70 },
        { midi: 50, duration_beats: 4, tolerance_cents: 70 }
      ]
    }
  ],

  // ============================
  // LEVEL 6 – Song Performance
  // ============================
  6: [
    {
      id: 'l6_chorus_simple',
      level: 6,
      category: 'performance',
      title: 'Einfacher Refrain',
      description: 'Singe einen einfachen Refrain mit Ausdruck und Emotion.',
      duration_s: 40,
      xp_reward: 40,
      type: 'melody',
      notes: [
        { midi: 48, duration_beats: 2, tolerance_cents: 50 },
        { midi: 52, duration_beats: 2, tolerance_cents: 50 },
        { midi: 55, duration_beats: 4, tolerance_cents: 50 },
        { midi: 53, duration_beats: 2, tolerance_cents: 50 },
        { midi: 52, duration_beats: 2, tolerance_cents: 50 },
        { midi: 48, duration_beats: 4, tolerance_cents: 50 },
        { midi: 50, duration_beats: 2, tolerance_cents: 50 },
        { midi: 55, duration_beats: 2, tolerance_cents: 50 },
        { midi: 57, duration_beats: 4, tolerance_cents: 50 },
        { midi: 55, duration_beats: 4, tolerance_cents: 50 }
      ]
    },
    {
      id: 'l6_emotional_phrase',
      level: 6,
      category: 'performance',
      title: 'Emotionaler Ausdruck',
      description: 'Singe die Phrase mit Gefühl – variiere Lautstärke und Intensität.',
      duration_s: 35,
      xp_reward: 40,
      type: 'melody',
      notes: [
        { midi: 48, duration_beats: 3, tolerance_cents: 50 },
        { midi: 50, duration_beats: 1, tolerance_cents: 50 },
        { midi: 52, duration_beats: 2, tolerance_cents: 50 },
        { midi: 57, duration_beats: 4, tolerance_cents: 50 },
        { midi: 55, duration_beats: 2, tolerance_cents: 50 },
        { midi: 52, duration_beats: 4, tolerance_cents: 50 }
      ],
      dynamic: 'crescendo'
    },
    {
      id: 'l6_full_range',
      level: 6,
      category: 'performance',
      title: 'Voller Stimmumfang',
      description: 'Nutze deinen gesamten Stimmumfang in einer grossen Melodie.',
      duration_s: 40,
      xp_reward: 50,
      type: 'melody',
      notes: [
        { midi: 43, duration_beats: 2, tolerance_cents: 60 },
        { midi: 48, duration_beats: 2, tolerance_cents: 60 },
        { midi: 52, duration_beats: 2, tolerance_cents: 60 },
        { midi: 55, duration_beats: 2, tolerance_cents: 60 },
        { midi: 60, duration_beats: 4, tolerance_cents: 60 },
        { midi: 57, duration_beats: 2, tolerance_cents: 60 },
        { midi: 55, duration_beats: 2, tolerance_cents: 60 },
        { midi: 52, duration_beats: 2, tolerance_cents: 60 },
        { midi: 48, duration_beats: 4, tolerance_cents: 60 }
      ]
    },
    {
      id: 'l6_improvisation',
      level: 6,
      category: 'performance',
      title: 'Freie Improvisation',
      description: 'Singe frei über die angezeigten Akkordtöne – lass deiner Kreativität freien Lauf!',
      duration_s: 45,
      xp_reward: 50,
      type: 'melody',
      notes: [
        { midi: 48, duration_beats: 4, tolerance_cents: 120 },
        { midi: 52, duration_beats: 4, tolerance_cents: 120 },
        { midi: 55, duration_beats: 4, tolerance_cents: 120 },
        { midi: 53, duration_beats: 4, tolerance_cents: 120 }
      ],
      freeform: true
    },
    {
      id: 'l6_chorus_power',
      level: 6,
      category: 'performance',
      title: 'Power-Refrain (länger)',
      description: 'Ein längerer hymnischer Verlauf – Atem planen, hohe Töne mit Unterstützung, nicht mit Druck.',
      duration_s: 48,
      xp_reward: 48,
      type: 'melody',
      notes: [
        { midi: 48, duration_beats: 2, tolerance_cents: 48 },
        { midi: 52, duration_beats: 2, tolerance_cents: 48 },
        { midi: 55, duration_beats: 2, tolerance_cents: 48 },
        { midi: 57, duration_beats: 2, tolerance_cents: 48 },
        { midi: 60, duration_beats: 3, tolerance_cents: 48 },
        { midi: 59, duration_beats: 1, tolerance_cents: 48 },
        { midi: 57, duration_beats: 2, tolerance_cents: 48 },
        { midi: 55, duration_beats: 2, tolerance_cents: 48 },
        { midi: 52, duration_beats: 2, tolerance_cents: 48 },
        { midi: 48, duration_beats: 4, tolerance_cents: 48 },
        { midi: 50, duration_beats: 2, tolerance_cents: 48 },
        { midi: 55, duration_beats: 4, tolerance_cents: 48 }
      ]
    },
    {
      id: 'l6_pop_riff',
      level: 6,
      category: 'performance',
      title: 'Pop-Riff (kurz)',
      description: 'Ein wiedererkennbares kurzes Motiv mit Sprüngen – typisch für Hooks; präzise Intonation.',
      duration_s: 36,
      xp_reward: 45,
      type: 'melody',
      notes: [
        { midi: 52, duration_beats: 1, tolerance_cents: 52 },
        { midi: 55, duration_beats: 1, tolerance_cents: 52 },
        { midi: 57, duration_beats: 1, tolerance_cents: 52 },
        { midi: 55, duration_beats: 1, tolerance_cents: 52 },
        { midi: 52, duration_beats: 2, tolerance_cents: 52 },
        { midi: 48, duration_beats: 2, tolerance_cents: 52 },
        { midi: 50, duration_beats: 2, tolerance_cents: 52 },
        { midi: 52, duration_beats: 4, tolerance_cents: 52 }
      ]
    },
    {
      id: 'l6_cooldown_hum',
      level: 6,
      category: 'cooldown',
      title: 'Ausklang: Summ-Oktave',
      description: 'Sanft eine Oktave summen und ausklingen lassen – für Level 6 als bewusster Ausklang nach intensiven Phrasen.',
      duration_s: 24,
      xp_reward: 15,
      type: 'pitch_match',
      notes: [
        { midi: 48, duration_beats: 6, tolerance_cents: 130 },
        { midi: 60, duration_beats: 6, tolerance_cents: 130 }
      ]
    }
  ]
};

const LEVEL_INFO = {
  1: { name: 'Atem & Summen', description: 'Grundlagen: Atmung, Summen, erste Töne treffen', icon: '🌬️', xp_required: 0 },
  2: { name: 'SOVT Basics', description: 'Lip Trills, Straw Phonation, Resonanz-Übungen', icon: '💨', xp_required: 100 },
  3: { name: 'Tonleitern', description: 'Dur-Tonleitern, Dreiklänge, Intervall-Sprünge', icon: '🎵', xp_required: 300 },
  4: { name: 'Dynamik & Register', description: 'Crescendo, Register-Wechsel, Staccato', icon: '🎭', xp_required: 600 },
  5: { name: 'Melodie-Phrasen', description: 'Liedzeilen, Call & Response, Vibrato', icon: '🎶', xp_required: 1000 },
  6: { name: 'Song Performance', description: 'Refrains, Ausdruck, Improvisation', icon: '🎤', xp_required: 1500 }
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToNoteName(midi) {
    const octave = Math.floor(midi / 12) - 1;
    const note = NOTE_NAMES[midi % 12];
    return `${note}${octave}`;
}

function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

function frequencyToMidi(freq) {
    return 69 + 12 * Math.log2(freq / 440);
}

function getExercisesForLevel(level) {
    return SINGING_EXERCISES[level] || [];
}

function getWarmupExercises(level) {
    const exercises = SINGING_EXERCISES[level] || SINGING_EXERCISES[1];
    return exercises.filter(e => e.category === 'warmup' || e.category === 'sovt').slice(0, 2);
}

function getCooldownExercise(level) {
    const exercises = SINGING_EXERCISES[level] || SINGING_EXERCISES[1];
    const cooldown = exercises.find(e => e.category === 'cooldown');
    return cooldown || SINGING_EXERCISES[1].find(e => e.category === 'cooldown');
}

function buildSession(level, durationMinutes) {
    const warmup = getWarmupExercises(Math.min(level, 2));
    const cooldown = getCooldownExercise(level);
    const available = (SINGING_EXERCISES[level] || []).filter(
        e => e.category !== 'warmup' && e.category !== 'cooldown'
    );

    const warmupTime = warmup.reduce((s, e) => s + e.duration_s, 0);
    const cooldownTime = cooldown ? cooldown.duration_s : 0;
    const mainTime = (durationMinutes * 60) - warmupTime - cooldownTime;

    const session = [...warmup];
    let remaining = mainTime;
    const shuffled = [...available].sort(() => Math.random() - 0.5);

    for (const ex of shuffled) {
        if (remaining <= 0) break;
        session.push(ex);
        remaining -= ex.duration_s;
    }

    if (cooldown) session.push(cooldown);
    return session;
}

function adaptExerciseToRange(exercise, calibration) {
    if (!calibration || !calibration.comfortLow) return exercise;
    const adapted = JSON.parse(JSON.stringify(exercise));

    if (adapted.notes) {
        const comfortMid = Math.round((calibration.comfortLow + calibration.comfortHigh) / 2);
        const exerciseMids = adapted.notes.map(n => n.midi);
        const exerciseMid = Math.round(exerciseMids.reduce((a, b) => a + b, 0) / exerciseMids.length);
        const shift = Math.round((comfortMid - exerciseMid) / 12) * 12;

        adapted.notes.forEach(n => { n.midi += shift; });
    }

    if (adapted.glide_start_midi) {
        const range = adapted.glide_end_midi - adapted.glide_start_midi;
        adapted.glide_start_midi = calibration.comfortLow;
        adapted.glide_end_midi = Math.min(calibration.comfortHigh, calibration.comfortLow + range);
    }

    return adapted;
}
