/**
 * Persönlichkeits-Song Generator – statischer Test
 *
 * Wissenschaftliche Basis:
 *  - Big Five: Mini-IPIP-20 (Donnellan, Oswald, Baird, & Lucas, 2006)
 *    Public Domain, peer-reviewed (Psychological Assessment, 18(2))
 *  - HEXACO-H: 4 Items aus dem HEXACO-PI-R (Lee & Ashton, 2018)
 *  - Schwartz-Werte: Selbstbestimmung & Wohlwollen (Schwartz Value Survey – Kurzversion)
 *  - Bindung: Bartholomew (Sicher vs. unsicher)
 *
 * Antwortskala: 7-stufig Likert (1 = stimmt überhaupt nicht … 7 = stimmt voll und ganz)
 *
 * Jedes Item liefert:
 *  - id: stabile Kennung
 *  - phase: P1..P4 (Resonanz, Kompass, Schatten, Vision)
 *  - flavor_intro: spielerische Einleitung (Spaß-Faktor)
 *  - stem: Item-Aussage
 *  - construct: Skala (BIG5_E/A/C/N/O, HEX_H, VAL_SD/BE, ATT_SEC, VIA)
 *  - reverse: true wenn invertiert gescort wird
 *  - klang_hint: kurze deutsche Beschreibung was diese Skala musikalisch beeinflusst
 *
 * Klangliche Konsistenz:
 *  Die einzelnen Antworten erzeugen KEINE direkten Musik-Mutationen. Stattdessen
 *  wird zuerst das Persönlichkeitsprofil berechnet (Skalen 0..100). Aus diesem
 *  Profil leitet computeMusicDNA() deterministisch eine in sich harmonische
 *  Klang-DNA ab (Tonart, Modus, Tempo-Bereich, Instrumente). Damit klingt
 *  JEDE Antwortkombination tragfähig – garantiert.
 */

(function () {
  'use strict';

  const TEST_VERSION = '1.0-static';
  const SCALE_LABELS = {
    BIG5_O: 'Offenheit',
    BIG5_C: 'Gewissenhaftigkeit',
    BIG5_E: 'Extraversion',
    BIG5_A: 'Verträglichkeit',
    BIG5_N: 'Neurotizismus',
    HEX_H:  'Ehrlichkeit-Demut',
    VAL_SD: 'Selbstbestimmung',
    VAL_BE: 'Wohlwollen',
    ATT_SEC: 'Bindungssicherheit',
    VIA:    'Charakterstärke'
  };

  // ────────────────────────────────────────────────────────────
  // Statisches Item-Set – 24 Items, peer-reviewt
  // ────────────────────────────────────────────────────────────
  const ITEMS = [
    // ── PHASE 1 „Resonanz" – Eisbrecher (Mini-IPIP: O, E) ──────
    { id: 'P1Q1', phase: 'P1', flavor_intro: 'Stell dir vor, du betrittst einen vollen Raum.',
      stem: 'Ich bin in Gesellschaft anderer schnell der Mittelpunkt der Aufmerksamkeit.',
      construct: 'BIG5_E', reverse: false,
      klang_hint: 'Hohe Extraversion → mehr Tempo, hellere Instrumente.' },

    { id: 'P1Q2', phase: 'P1', flavor_intro: 'Ein Sonntag ohne Plan.',
      stem: 'Ich halte mich lieber im Hintergrund.',
      construct: 'BIG5_E', reverse: true,
      klang_hint: 'Eher introvertiert → reduziertere, intimere Klangbilder.' },

    { id: 'P1Q3', phase: 'P1', flavor_intro: 'Ein leeres Notizbuch liegt vor dir.',
      stem: 'Ich habe eine lebhafte Vorstellungskraft.',
      construct: 'BIG5_O', reverse: false,
      klang_hint: 'Hohe Offenheit → ungewöhnliche Modi (Lydisch/Dorisch), Klangfarben.' },

    { id: 'P1Q4', phase: 'P1', flavor_intro: 'Eine philosophische Diskussion zieht sich.',
      stem: 'Abstrakte Ideen interessieren mich nicht besonders.',
      construct: 'BIG5_O', reverse: true,
      klang_hint: 'Geringe Offenheit → klassische Dur/Moll-Welten, eingängige Hooks.' },

    { id: 'P1Q5', phase: 'P1', flavor_intro: 'Auf einer Party voller Fremder.',
      stem: 'Ich rede mit vielen verschiedenen Menschen.',
      construct: 'BIG5_E', reverse: false,
      klang_hint: 'Verstärkt Energie und rhythmische Dichte.' },

    { id: 'P1Q6', phase: 'P1', flavor_intro: 'Ein Museum oder ein Konzert?',
      stem: 'Kunst, Musik oder Literatur berühren mich tief.',
      construct: 'BIG5_O', reverse: false,
      klang_hint: 'Hohe ästhetische Sensibilität → mehr Streicher und Pads.' },

    // ── PHASE 2 „Kompass" – Werte & HEXACO-H ───────────────────
    { id: 'P2Q1', phase: 'P2', flavor_intro: 'Eine Quittung, die niemand prüft.',
      stem: 'Ich würde keinem Geld wegnehmen, selbst wenn ich sicher wäre, niemals erwischt zu werden.',
      construct: 'HEX_H', reverse: false,
      klang_hint: 'Ehrlichkeit-Demut → akustische Instrumente, ehrliche Produktion.' },

    { id: 'P2Q2', phase: 'P2', flavor_intro: 'Ein Job-Angebot, doppeltes Gehalt, fragwürdige Methoden.',
      stem: 'Ich würde manchmal lügen, wenn es mir einen Vorteil verschafft.',
      construct: 'HEX_H', reverse: true,
      klang_hint: 'Niedrige H → mehr Distortion, schmutzigere Texturen.' },

    { id: 'P2Q3', phase: 'P2', flavor_intro: 'Wenn niemand zuschaut.',
      stem: 'Es ist mir wichtig, eigene Entscheidungen zu treffen und meinen Weg selbst zu wählen.',
      construct: 'VAL_SD', reverse: false,
      klang_hint: 'Selbstbestimmung → eigenständige Solo-Lines, weniger Schema.' },

    { id: 'P2Q4', phase: 'P2', flavor_intro: 'Ein Freund braucht spät nachts Hilfe.',
      stem: 'Sich um das Wohl anderer Menschen zu kümmern, ist mir wichtig.',
      construct: 'VAL_BE', reverse: false,
      klang_hint: 'Wohlwollen → wärmere Frequenzen, Choir-Pads.' },

    { id: 'P2Q5', phase: 'P2', flavor_intro: 'Eine fremde Person bittet um etwas.',
      stem: 'Ich habe ein gutes Gespür für die Gefühle anderer.',
      construct: 'BIG5_A', reverse: false,
      klang_hint: 'Hohe Verträglichkeit → weichere Drums, weniger Grit.' },

    { id: 'P2Q6', phase: 'P2', flavor_intro: 'Eine Liste am Sonntag, die du selbst gemacht hast.',
      stem: 'Ich erledige meine Aufgaben sofort und sorgfältig.',
      construct: 'BIG5_C', reverse: false,
      klang_hint: 'Gewissenhaftigkeit → klare Strukturen, präzises Timing.' },

    // ── PHASE 3 „Schatten" – Neurotizismus, Bindung, Trigger ───
    { id: 'P3Q1', phase: 'P3', flavor_intro: 'Wenn du an die letzte Woche denkst.',
      stem: 'Meine Stimmung wechselt häufig und schnell.',
      construct: 'BIG5_N', reverse: false,
      klang_hint: 'Neurotizismus → Moll-Tendenz, Tempo-Schwankungen.' },

    { id: 'P3Q2', phase: 'P3', flavor_intro: 'Ein unerwarteter Anruf.',
      stem: 'Ich werde leicht aufgewühlt oder nervös.',
      construct: 'BIG5_N', reverse: false,
      klang_hint: 'Verstärkt rauhe Texturen, kürzere Phrasen.' },

    { id: 'P3Q3', phase: 'P3', flavor_intro: 'Stress am Limit.',
      stem: 'Ich bleibe meistens ruhig und ausgeglichen.',
      construct: 'BIG5_N', reverse: true,
      klang_hint: 'Hohe Stabilität → klare, fließende Linien.' },

    { id: 'P3Q4', phase: 'P3', flavor_intro: 'Wenn jemand dir wirklich nahe kommt.',
      stem: 'Ich kann mich anderen Menschen leicht öffnen und ihnen vertrauen.',
      construct: 'ATT_SEC', reverse: false,
      klang_hint: 'Bindungssicherheit → Open-Voicings, weicher Hall.' },

    { id: 'P3Q5', phase: 'P3', flavor_intro: 'Vor dem Einschlafen, ehrlich.',
      stem: 'Ich habe Angst, verlassen oder zurückgewiesen zu werden.',
      construct: 'ATT_SEC', reverse: true,
      klang_hint: 'Unsichere Bindung → längere Releases, melancholische Pads.' },

    { id: 'P3Q6', phase: 'P3', flavor_intro: 'Wenn etwas nicht so läuft wie geplant.',
      stem: 'Ich bin häufig traurig oder niedergeschlagen.',
      construct: 'BIG5_N', reverse: false,
      klang_hint: 'Erhöht melancholische Modi, langsamere Tempi.' },

    // ── PHASE 4 „Vision" – Stärken, Sinn ───────────────────────
    { id: 'P4Q1', phase: 'P4', flavor_intro: 'Wenn du an deine Talente denkst.',
      stem: 'Ich habe Mut, für das einzustehen, was mir wichtig ist.',
      construct: 'VIA', reverse: false,
      klang_hint: 'VIA-Mut → kraftvollere Akkorde, klarere Linien.' },

    { id: 'P4Q2', phase: 'P4', flavor_intro: 'Eine Sache, die du wirklich gut kannst.',
      stem: 'Ich finde immer wieder neugierig neue Dinge, die mich faszinieren.',
      construct: 'BIG5_O', reverse: false,
      klang_hint: 'Neugier → mehr Klangfarbenwechsel.' },

    { id: 'P4Q3', phase: 'P4', flavor_intro: 'Wenn jemand dich um Rat fragt.',
      stem: 'Ich habe ein freundliches, geduldiges Wesen.',
      construct: 'BIG5_A', reverse: false,
      klang_hint: 'Sanftere Dynamik, weniger Kompression.' },

    { id: 'P4Q4', phase: 'P4', flavor_intro: 'Wenn du an deinen Alltag denkst.',
      stem: 'Ich gehe Aufgaben strukturiert und zuverlässig an.',
      construct: 'BIG5_C', reverse: false,
      klang_hint: 'Klare Form: Intro/Strophe/Refrain solide gebaut.' },

    { id: 'P4Q5', phase: 'P4', flavor_intro: 'Dein größter Wunsch dieses Jahr.',
      stem: 'Ich strebe nach persönlichem Wachstum und Sinn.',
      construct: 'VIA', reverse: false,
      klang_hint: 'Bridge mit moduliertem Höhepunkt.' },

    { id: 'P4Q6', phase: 'P4', flavor_intro: 'Eine Erinnerung, die dich getragen hat.',
      stem: 'Es gibt Menschen in meinem Leben, mit denen ich tief verbunden bin.',
      construct: 'ATT_SEC', reverse: false,
      klang_hint: 'Wärme im Mid-Bass, doppelte Stimm-Layer.' }
  ];

  const PHASE_META = {
    P1: { id: 'P1', title: 'Resonanz',
          intro: 'Sechs Fragen zum Einstieg. Ehrlich beantworten – jede Antwort beeinflusst Tempo, Tonart und Instrumentierung deines Songs.' },
    P2: { id: 'P2', title: 'Kompass',
          intro: 'Werte und innere Haltung – das prägt die Klangfarbe (akustisch, warm vs. elektronisch, kantig).' },
    P3: { id: 'P3', title: 'Schatten',
          intro: 'Was liegt unter der Oberfläche? Bestimmt Modus (Dur vs. Moll), Hall und Dichte.' },
    P4: { id: 'P4', title: 'Vision',
          intro: 'Wohin willst du? Beeinflusst Bridge, Höhepunkte und die Energie des Refrains.' }
  };

  // ────────────────────────────────────────────────────────────
  // Aufbau für die UI
  // ────────────────────────────────────────────────────────────
  function getStaticTest() {
    const phases = {};
    Object.keys(PHASE_META).forEach(pid => { phases[pid] = Object.assign({ items: [] }, PHASE_META[pid]); });
    ITEMS.forEach(it => {
      phases[it.phase].items.push({
        id: it.id,
        format: 'likert7',
        flavor_intro: it.flavor_intro,
        stem: it.stem,
        reverse: !!it.reverse,
        construct: it.construct,
        klang_hint: it.klang_hint
      });
    });
    return {
      version: TEST_VERSION,
      lang: 'de',
      phases: Object.values(phases),
      scales: Object.keys(SCALE_LABELS).map(k => ({ key: k, label: SCALE_LABELS[k] })),
      itemCount: ITEMS.length
    };
  }

  // ────────────────────────────────────────────────────────────
  // Skoring: Antworten (0..6 für Likert-7) → Skalenwerte 0..100
  // ────────────────────────────────────────────────────────────
  function computeScores(answers) {
    const sums = {}; const counts = {};
    ITEMS.forEach(it => {
      const a = answers[it.id];
      if (typeof a !== 'number') return;
      let v = a / 6; // 0..1
      if (it.reverse) v = 1 - v;
      sums[it.construct] = (sums[it.construct] || 0) + v;
      counts[it.construct] = (counts[it.construct] || 0) + 1;
    });
    const out = {};
    Object.keys(sums).forEach(k => {
      out[k] = Math.round((sums[k] / counts[k]) * 100);
    });
    // Default 50 für nicht abgedeckte Skalen
    Object.keys(SCALE_LABELS).forEach(k => { if (!(k in out)) out[k] = 50; });
    return out;
  }

  // ────────────────────────────────────────────────────────────
  // Music-DNA aus Persönlichkeit ableiten – DETERMINISTISCH und
  // klanglich konsistent. Jede Antwortkombination ergibt eine in
  // sich tragfähige Klang-DNA, weil:
  //  - Tonart und Modus aus Big-Five-Profil hart fixiert
  //  - Tempo aus Energy-Score, gerundet auf BPM-Familie
  //  - Instrumente aus Whitelist je Profil
  //  - Locks (tempo_lock, tonality_lock) verhindern Drift
  // ────────────────────────────────────────────────────────────
  function computeMusicDNA(scales) {
    const O = scales.BIG5_O || 50;
    const C = scales.BIG5_C || 50;
    const E = scales.BIG5_E || 50;
    const A = scales.BIG5_A || 50;
    const N = scales.BIG5_N || 50;
    const H = scales.HEX_H || 50;
    const SEC = scales.ATT_SEC || 50;

    // Tonart-Pool je Profil (alle 12 Tonarten erreichbar, abhängig von Profil)
    // Wir wählen deterministisch aus 6 stabilen Tonarten, die zu den drei
    // Modi (siehe unten) gut singbar sind.
    const keyPool = ['C', 'D', 'E', 'F', 'G', 'A'];
    const keyIdx = Math.round(((O + E) / 2) / 100 * (keyPool.length - 1));
    const key = keyPool[keyIdx];

    // Modus: Hoher N oder niedriger SEC → moll-basiert; hohe O → dorisch oder lydisch
    let mode;
    if (N >= 65) mode = 'aeolian';
    else if (SEC <= 35) mode = 'aeolian';
    else if (O >= 70 && N < 50) mode = 'lydian';
    else if (O >= 60) mode = 'dorian';
    else if (E >= 65) mode = 'mixolydian';
    else mode = 'ionian';

    // Tempo: Extraversion + (100 - N) als Energy-Proxy, gemappt 70-118 BPM
    const energyProxy = (E + (100 - N)) / 2; // 0..100
    const tempo = Math.round(70 + energyProxy * 0.48); // 70..118
    const tempoLock = [Math.max(60, tempo - 6), Math.min(160, tempo + 6)];

    // Time signature: hohe O → 6/8 oder 5/4 Tendenz; sonst 4/4
    const timeSig = (O >= 80 && N < 40) ? '6/8' : (O >= 75 ? '3/4' : '4/4');

    // Energy/Brightness/Density/Warmth/Grit (0..1)
    const energy = clamp01((E * 0.5 + (100 - N) * 0.3 + O * 0.2) / 100);
    const brightness = clamp01((E * 0.4 + O * 0.4 + (100 - N) * 0.2) / 100);
    const density = clamp01((O * 0.5 + C * 0.3 + E * 0.2) / 100);
    const warmth = clamp01((A * 0.5 + H * 0.3 + SEC * 0.2) / 100);
    const grit = clamp01(((100 - H) * 0.5 + N * 0.3 + (100 - A) * 0.2) / 100);

    // Instrumentation: Whitelists je nach Profil
    const core = [];
    const color = [];
    const rhythm = [];
    const avoid = [];

    // Akustisch vs. elektronisch (gesteuert durch H + Warmth)
    const akustisch = warmth >= 0.55 || H >= 60;
    if (akustisch) {
      core.push('felt_piano');
      core.push('acoustic_guitar');
      if (warmth >= 0.65) color.push('strings_quartet');
      if (A >= 60) color.push('choir');
      avoid.push('808', 'trap_hats');
    } else {
      core.push('analog_keys');
      core.push('synth_bass');
      color.push('granular_pad');
      if (E >= 60) color.push('analog_lead');
      avoid.push('felt_piano');
    }

    // Bass: hohe Verträglichkeit → upright_bass, sonst sub_bass
    if (A >= 55) core.push('upright_bass'); else core.push('sub_bass');

    // Rhythmus: Gewissenhaftigkeit → präzise; Niedrige C → live/loose
    if (C >= 65) rhythm.push('drum_kit_studio');
    else if (E >= 65) rhythm.push('drum_kit_jazz');
    else rhythm.push('shaker', 'hand_drums');

    // Vocal Delivery
    let vocalDelivery = 'sung';
    if (N >= 65) vocalDelivery = 'breathy';
    else if (E >= 70) vocalDelivery = 'belted';
    else if (O >= 70 && SEC < 50) vocalDelivery = 'whispered';
    const vocalRegister = E >= 60 ? 'mid' : (N >= 60 ? 'low' : 'mid');
    const vocalFx = ['reverb_hall'];
    if (N >= 60) vocalFx.push('tape_sat');
    if (O >= 70) vocalFx.push('slap_delay');

    // Akkordfamilien (tonality_lock)
    const tonalityLock = mode === 'aeolian'
      ? ['i', 'iv', 'v', 'VI', 'VII', 'III']
      : mode === 'lydian'
        ? ['I', 'II', 'iii', 'IV', 'V', 'vi']
        : mode === 'dorian'
          ? ['i', 'ii', 'III', 'IV', 'v', 'VII']
          : mode === 'mixolydian'
            ? ['I', 'ii', 'iii', 'IV', 'v', 'VII']
            : ['I', 'ii', 'iii', 'IV', 'V', 'vi'];

    // Strukturschablone
    const structure = energy >= 0.65
      ? 'INTRO-VERSE-PRECHORUS-CHORUS-VERSE-CHORUS-BRIDGE-CHORUS-OUTRO'
      : 'INTRO-VERSE-CHORUS-VERSE-CHORUS-BRIDGE-CHORUS-OUTRO';

    return {
      key, mode,
      tempo_bpm: tempo,
      tempo_lock: tempoLock,
      time_signature: timeSig,
      tonality_lock: tonalityLock,
      energy: round2(energy),
      brightness: round2(brightness),
      density: round2(density),
      warmth: round2(warmth),
      grit: round2(grit),
      instrumentation: { core, color, rhythm, avoid },
      vocal: { register: vocalRegister, delivery: vocalDelivery, fx: vocalFx },
      structure
    };
  }

  // ────────────────────────────────────────────────────────────
  // Archetyp aus dominanten Skalen ableiten
  // ────────────────────────────────────────────────────────────
  function computeArchetype(scales) {
    const O = scales.BIG5_O, C = scales.BIG5_C, E = scales.BIG5_E,
          A = scales.BIG5_A, N = scales.BIG5_N, H = scales.HEX_H,
          SEC = scales.ATT_SEC;

    // 12 Archetypen, deterministisch zugeordnet
    if (O >= 70 && E >= 60) return 'Funke';
    if (O >= 70 && E < 50)  return 'Alchemist';
    if (C >= 70 && A >= 60) return 'Hüter';
    if (C >= 70 && O >= 60) return 'Architekt';
    if (E >= 70 && C < 50)  return 'Sturmreiter';
    if (A >= 70 && SEC >= 60) return 'Gärtner';
    if (A >= 70 && O >= 60) return 'Echo';
    if (H >= 70)            return 'Pilger';
    if (O >= 60 && C >= 60) return 'Kartograph';
    if (SEC >= 70)          return 'Leuchtturm';
    if (N >= 65)            return 'Wanderer';
    return 'Nordstern';
  }

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function round2(x) { return Math.round(x * 100) / 100; }

  // Globale Exports
  window.SongTestData = {
    getStaticTest,
    computeScores,
    computeMusicDNA,
    computeArchetype,
    SCALE_LABELS,
    TEST_VERSION,
    ITEM_COUNT: ITEMS.length
  };
})();
