/**
 * Personality Song Generator – Browser Prompt Library
 * Identische Prompts wie lambda/song-generator/prompts.js,
 * verfügbar als window.SONG_PROMPTS für den Direct-Mode (Browser → OpenAI).
 */

(function () {
  'use strict';

  const SYSTEM_CORE = `Du bist „SONUS" – ein hybrider Senior-Experte mit fünf integrierten Rollen,
die du gleichzeitig und kohärent verkörperst:

(1) Senior Prompt Engineer (deterministische, schemastreue Outputs).
(2) Diplom-Psychologe mit Schwerpunkt psychometrische Diagnostik
    (Big Five / IPIP-NEO-120, HEXACO-PI-R, 16PF-Adaption, Schwartz-Werte,
    Bindungsstile nach Bartholomew, Strengths-Profil VIA-IS).
(3) Musikproduzent & Komponist (Tonsatz, Mixing, Arrangement, Genrefluenz von
    Neoklassik bis Hyperpop, Mastering-bewusst, Suno/Udio/MusicLM-affin).
(4) Algorithmus-Ingenieur (deterministisches Mapping Persönlichkeit → Musik,
    inkl. Modulationsmatrix, harmonischer Konsistenz und Genre-Blending).
(5) Cloud / Software-Architekt (kennt das Zielsystem: AWS Lambda OpenAI-Proxy,
    statisches Frontend, JSON-Pipelines, sparsame Token-Nutzung).

GRUNDREGELN (gelten IMMER):
- Antworte ausschließlich mit gültigem JSON nach dem geforderten Schema.
- Keine Markdown-Auszeichnung, keine Codefences, keine Kommentare.
- Sprache: Deutsch (Du-Form, warm, klar, niemals therapeutisch-bevormundend),
  außer im Feld lang ist explizit "en" angegeben.
- Wissenschaftlichkeit > Bauchgefühl: Items, Skalen und Auswertungen müssen
  an etablierten, peer-reviewten Inventaren orientiert sein (Big Five / HEXACO
  als Primärgerüst, 16PF-Facetten als Schärfung, plus Werte/Bindung/Stärken).
- Tiefe vor Oberfläche: Fragen prüfen Verhalten, Werte, Schatten, Trigger,
  Sehnsucht, Identitätskerne – niemals Smalltalk.
- Sicherheit: keine Diagnostik klinischer Störungen, keine Suizid-/Krisen-
  Inhalte. Bei Hinweisen auf akute Krise → safety_flag: true setzen und
  safety_message mit Hinweis auf Hilfsangebote (DE: 0800 111 0 111).
- Datenschutz: Du erhältst niemals echte Klarnamen-PII zurück; falls
  doch enthalten, ersetze sie im Output durch [name], [ort] etc.
- Musikalische Konsistenz: Jede Antwortkombination MUSS klanglich tragfähig
  sein. Erzwinge das durch (a) Tonart-Locking, (b) Tempo-Range-Locking,
  (c) Mode-/Skala-Locking, (d) harmonische Familie, (e) Drum-Bus-Kompatibilität.
- Token-Effizienz: Antworte so kompakt wie schemakonform möglich.

WENN DAS SCHEMA NICHT EINGEHALTEN WERDEN KANN:
Gib { "error": "schema_violation", "reason": "<kurz>" } zurück.`;

  const PROMPT_TEST_QUESTIONS = `AUFTRAG: Erzeuge einen interaktiven, wissenschaftlich fundierten
Persönlichkeitstest mit GENAU 24 Items in 4 Phasen à 6 Items.

PHASEN (jeweils mit Ziel-Tonfall):
P1 "Resonanz"     – warm, neugierig, Eisbrecher (Big Five: O, E)
P2 "Kompass"      – wertorientiert, reflektiert (Schwartz + HEXACO H, C)
P3 "Schatten"     – mutig, ehrlich, tief (Neurotizismus, Bindung, Trigger)
P4 "Vision"       – zukunftsgerichtet, identitätsstiftend (VIA-Stärken, Sinn)

ITEM-DESIGN:
- Mische Formate: 8x Likert-7, 6x Forced-Choice (2 Optionen), 6x Slider 0–100,
  4x Szenario-Multiple-Choice (4 Optionen).
- Jedes Item misst 1 Primär- und bis zu 2 Sekundär-Konstrukte.
- Items sind reverse-scored, wo psychometrisch sinnvoll (markiere reverse: true).
- Sprache: konkret, sinnlich, mit Beispielen aus dem echten Leben.
  Verboten: "immer", "nie", doppelte Verneinungen, Suggestivfragen.
- Spaßfaktor: Jede Frage hat ein flavor_intro (max. 14 Wörter), das
  spielerisch hinführt (z. B. "Stell dir vor, dein Leben wäre ein Plattencover…").
- Jede Antwortoption trägt einen MMV (Musical Modulation Vector) mit:
  tempo_bias (-20..+20), mode_bias (-3..+3), energy (0..1), brightness (0..1),
  density (0..1), warmth (0..1), grit (0..1),
  instr_pull (1-3 Tags aus: piano, strings, 808, synthpad, acoustic_guitar,
  choir, upright_bass, drum_kit_jazz, trap_hats, shaker, hand_drums,
  analog_lead, granular_pad), lyric_themes (1-3 Tags aus: sehnsucht, aufbruch,
  stille, schatten, liebe, freiheit, wurzeln, erwachen, mut, heimat,
  zerbrechen, leuchten).

OUTPUT-SCHEMA (JSON):
{
  "version": "1.0",
  "lang": "de",
  "phases": [
    {
      "id": "P1",
      "title": "Resonanz",
      "intro": "<1 Satz>",
      "items": [
        {
          "id": "P1Q1",
          "format": "likert7" | "forced_choice" | "slider" | "scenario_mc",
          "flavor_intro": "<≤14 Wörter>",
          "stem": "<Frage / Aussage>",
          "reverse": false,
          "constructs": {
            "primary": { "scale": "BIG5_O", "weight": 1.0 },
            "secondary": [{ "scale": "HEX_H", "weight": 0.4 }]
          },
          "options": [
            { "label": "<Antworttext>", "value": 1, "mmv": { ... } }
          ],
          "ui": {
            "icon": "<lucide-name>",
            "color_hint": "#RRGGBB",
            "micro_anim": "pulse" | "wave" | "rise" | "shimmer"
          }
        }
      ]
    }
  ],
  "scales": [
    { "key": "BIG5_O", "label": "Offenheit", "min": 0, "max": 100 },
    { "key": "BIG5_C", "label": "Gewissenhaftigkeit", "min": 0, "max": 100 },
    { "key": "BIG5_E", "label": "Extraversion", "min": 0, "max": 100 },
    { "key": "BIG5_A", "label": "Verträglichkeit", "min": 0, "max": 100 },
    { "key": "BIG5_N", "label": "Neurotizismus", "min": 0, "max": 100 },
    { "key": "HEX_H", "label": "Ehrlichkeit-Demut", "min": 0, "max": 100 },
    { "key": "VAL_SD", "label": "Selbstbestimmung", "min": 0, "max": 100 },
    { "key": "VAL_BE", "label": "Wohlwollen", "min": 0, "max": 100 },
    { "key": "ATT_SEC", "label": "Bindungssicherheit", "min": 0, "max": 100 },
    { "key": "VIA_TOP", "label": "Top-Charakterstaerken", "list": true }
  ],
  "scoring": { "method": "weighted_sum_then_zscore_to_100", "norms": "internal_v1" }
}

QUALITAETS-CHECK (vor Ausgabe selbst durchlaufen):
- 24 Items? 4 Phasen à 6? Mischung der Formate eingehalten?
- Jedes Item hat 2–7 Optionen mit MMV?
- Keine doppelten Stems? Reverse-Scores plausibel?
- Jeder MMV-Wert im definierten Range?
Falls nein: korrigiere INTERN und gib erst dann das finale JSON aus.`;

  function buildInputInterpreterUserPrompt(args) {
    const source_type = args.source_type;
    const raw = args.raw || '';
    const lang = args.lang || 'de';
    return 'AUFTRAG: Du erhältst eine UNSTRUKTURIERTE Eingabe aus EINER der folgenden\n' +
      'Quellen (source_type):\n' +
      '- "personality_test_result" (16Personalities, Big5, MBTI, DISC, Enneagram, 16PF)\n' +
      '- "ai_chat_log" (ChatGPT/Claude/Gemini Konversationen)\n' +
      '- "social_media" (Instagram-Bio, Tweets, LinkedIn-About, TikTok-Captions)\n' +
      '- "messenger_export" (WhatsApp/Signal/Telegram .txt Exporte)\n' +
      '- "free_text" (Tagebuch, Selbstbeschreibung, Briefe)\n' +
      '- "music_history" (Spotify/Apple Music Top-Songs/Genres)\n\n' +
      'EINGABE-KONTEXT:\n{ "source_type": "' + source_type + '", "lang": "' + lang + '" }\n\n' +
      'RAW-INHALT (zwischen <<<RAW>>> und <<</RAW>>>):\n<<<RAW>>>\n' + raw.slice(0, 60000) + '\n<<</RAW>>>\n\n' +
      'SCHRITTE:\n1. PII-Scrubbing: Ersetze Namen/Adressen/Telefonnummern durch Platzhalter.\n' +
      '2. Quellen-spezifische Extraktion (Tests: Skalen/Typcodes; Chats: Themen,\n   Selbstbeschreibungen, Konflikte, Ambitionen; Social: Tonalität;\n   Music: Genre/Energy/Valence/Tempo).\n' +
      '3. Mapping auf das einheitliche PERSONA_SIGNAL_SCHEMA.\n' +
      '4. Konfidenzbewertung pro Skala (0–1) + kurze Belegnotiz.\n' +
      '5. Wenn Eingabe unzureichend (<200 Zeichen substantiell): confidence_overall < 0.3.\n\n' +
      'OUTPUT (JSON, PERSONA_SIGNAL_SCHEMA):\n' +
      '{\n  "source_type": "...",\n  "lang": "de",\n  "scrubbed_excerpt": "<≤500 Zeichen anonymisierter Auszug>",\n' +
      '  "signals": {\n    "BIG5_O": { "value": 0..100, "confidence": 0..1, "evidence": "<≤120 Z.>" },\n' +
      '    "BIG5_C": {...}, "BIG5_E": {...}, "BIG5_A": {...}, "BIG5_N": {...},\n' +
      '    "HEX_H":  {...},\n    "VAL_SD": {...}, "VAL_BE": {...},\n    "ATT_SEC":{...},\n' +
      '    "VIA_TOP":{ "value": ["<Stärke1>","<Stärke2>","<Stärke3>"],\n                "confidence": 0..1, "evidence": "..." }\n  },\n' +
      '  "themes": ["<thema1>", ...],\n' +
      '  "tonality": { "warmth": 0..1, "grit": 0..1, "melancholy": 0..1, "playfulness": 0..1 },\n' +
      '  "music_hints": {\n    "preferred_genres": [], "avoid_genres": [],\n    "tempo_pref": [bpm_min, bpm_max], "energy_pref": 0..1\n  },\n' +
      '  "confidence_overall": 0..1,\n  "safety_flag": false,\n  "notes": "<≤200 Zeichen>"\n}';
  }

  function buildPersonaSynthesisUserPrompt(args) {
    return 'AUFTRAG: Fusioniere folgende Quellen zu EINEM kohärenten Persona-Profil.\n\n' +
      'INPUT:\n' + JSON.stringify({
        test_results: args.test_results || {},
        facets: args.facets || {},
        external_signals: args.external_signals || [],
        astrology: args.astrology || null,
        user_meta: args.user_meta || {}
      }, null, 2) + '\n\n' +
      'PRIMÄRQUELLEN (wissenschaftlich):\n' +
      ' - test_results: Big-Five-Domänen + HEXACO-H + Schwartz (SD, BE, AC, ST) +\n' +
      '   Bindung (SEC/ANX/AVO) + VIA-Stärken-Marker. 0..100.\n' +
      ' - facets: 30 NEO-PI-R-Facetten (O1..O6, C1..C6, E1..E6, A1..A6, N1..N6),\n' +
      '   wenn vorhanden – höchste diagnostische Auflösung. Nutze zur Schärfung\n' +
      '   der Narrative und Motive.\n' +
      ' - external_signals: optionale Zusatzhinweise (Tests, Tagebücher etc.).\n\n' +
      'SEKUNDÄRQUELLE (symbolisch, OPTIONAL):\n' +
      ' - astrology: enthält Aszendent, MC, Planetenstände mit Zeichen und\n' +
      '   Whole-Sign-Häusern sowie auffällige Aspekte. Wenn vorhanden, nutze sie\n' +
      '   ausschließlich als BILDERSPRACHE und MOTIV-RESERVOIR für den Songtext\n' +
      '   (z. B. „Mond im Krebs" → Bild „Wasser, Erinnerung, Heim"). NIEMALS als\n' +
      '   Persönlichkeitsaussage formulieren („du bist…"), sondern als poetisches\n' +
      '   Bild verwenden. Behalte Big-Five/HEXACO als primäre Wahrheit.\n\n' +
      'FUSIONS-REGELN:\n1. Pro Skala: gewichteter Mittelwert über alle wissenschaftlichen Quellen,\n   Gewicht = confidence². Test-Quelle bekommt zusätzlich Faktor 1.5.\n' +
      '2. Bei Widersprüchen >25 Punkte: notiere in tensions[], wähle Wert mit höherer\n   aggregierter Konfidenz, dokumentiere in rationale.\n' +
      '3. Leite Archetyp ab (NICHT MBTI-Buchstaben verwenden) – wähle 1 aus 12:\n' +
      '   ["Pilger","Kartograph","Funke","Hüter","Alchemist","Wanderer","Architekt",\n    "Echo","Leuchtturm","Sturmreiter","Gärtner","Nordstern"]\n' +
      '4. Erzeuge core_narrative (3–4 Sätze, Du-Form, poetisch-präzise).\n' +
      '5. Erzeuge 5 motifs (semantische Bilder) für den Songtext. Wenn astrology\n   vorhanden, dürfen 1–2 Motive astrologische Bildersprache aufnehmen (z. B.\n   „Aszendent: erste Hülle, mit der du den Raum betrittst").\n' +
      '6. Erzeuge eine music_dna als kompakten Steuervektor.\n' +
      '7. Setze harte Locks (tonality_lock, tempo_lock).\n\n' +
      'OUTPUT (JSON, PERSONA_PROFILE):\n' +
      '{\n  "archetype": "<einer der 12>",\n  "scales_final": { "BIG5_O": 0..100, ..., "VIA_TOP": ["...","...","..."] },\n' +
      '  "tensions": [{ "scale": "...", "delta": 12, "note": "..." }],\n' +
      '  "core_narrative": "<3 Sätze>",\n  "motifs": ["<bild1>", "...", "<bild5>"],\n' +
      '  "music_dna": {\n    "key": "<C|C#|D|...>",\n    "mode": "ionian|dorian|phrygian|lydian|mixolydian|aeolian|harmonic_minor",\n' +
      '    "tempo_bpm": 60..160,\n    "tempo_lock": [bpm_min, bpm_max],\n    "tonality_lock": ["allowed_chord_family_1","..."],\n' +
      '    "time_signature": "4/4|3/4|6/8|5/4",\n    "energy": 0..1, "brightness": 0..1, "density": 0..1,\n    "warmth": 0..1, "grit": 0..1,\n' +
      '    "instrumentation": {\n      "core": ["<2-4 Instrumente>"],\n      "color": ["<1-3 Farbinstrumente>"],\n      "rhythm": ["<Drum-/Percussion-Setup>"],\n      "avoid": ["<Instrumente, die NICHT passen>"]\n    },\n' +
      '    "vocal": {\n      "register": "low|mid|high",\n      "delivery": "spoken|sung|whispered|belted|breathy|chant",\n      "fx": ["reverb_hall","tape_sat","slap_delay","double_track"]\n    },\n' +
      '    "structure": "INTRO-VERSE-PRECHORUS-CHORUS-VERSE-CHORUS-BRIDGE-CHORUS-OUTRO"\n  },\n  "rationale": "<≤300 Zeichen>"\n}';
  }

  function buildSongComposerUserPrompt(args) {
    const persona = args.persona || {};
    const mode = args.mode || 'full';
    const edit_targets = args.edit_targets || [];
    const previous_song = args.previous_song || null;
    const creativity = typeof args.creativity === 'number' ? args.creativity : 0.7;
    return 'AUFTRAG: Erzeuge einen tief persönlichen Song basierend auf PERSONA_PROFILE.\n\n' +
      'INPUT:\n' + JSON.stringify({ persona, mode, edit_targets, previous_song, creativity }, null, 2) + '\n\n' +
      'HINWEIS:\n' +
      'persona kann optional ein astrology-Feld enthalten (Geburtskarte). Wenn\n' +
      'vorhanden, NUTZE die Bildersprache (Element/Modus, Sonne/Mond/Aszendent,\n' +
      'auffällige Aspekte) als poetisches Reservoir für Metaphern und Bilder im\n' +
      'Songtext. Schreibe NIE Aussagen wie „du bist Skorpion" oder „weil dein\n' +
      'Aszendent…". Astrologie ist symbolisches Material, keine Diagnose.\n' +
      'Wenn nicht vorhanden, ignoriere die Schicht vollständig.\n\n' +
      'MUSIK-LOCK-MATRIX (nicht verhandelbar):\n' +
      '- Tonart bleibt innerhalb music_dna.key ± relative Moll/Dur-Variante.\n' +
      '- Akkorde nur aus tonality_lock-Familien (Standard: I, ii, IV, V, vi, iiø, VImaj7).\n' +
      '- Tempo bleibt im tempo_lock-Fenster.\n' +
      '- Instrumente nur aus core ∪ color ∪ rhythm; nie aus avoid.\n' +
      '- Bei jeder Re-Roll-Variation: Locks bleiben identisch.\n\n' +
      'LYRIK-REGELN:\n' +
      '- Du-Form ODER Ich-Form, konsistent über den ganzen Song.\n' +
      '- Bilder vor Abstrakta (zeige, behaupte nicht).\n' +
      '- Mindestens 3 von 5 motifs werden konkret aufgegriffen.\n' +
      '- must_include_keywords MÜSSEN vorkommen; must_avoid_keywords nicht.\n' +
      '- Reim: nicht erzwungen; Halbreime/Assonanzen/innere Reime bevorzugt.\n' +
      '- Refrain ist semantische Verdichtung der core_narrative.\n' +
      '- Eine Zeile = ein Atemzug. Max. 12 Silben pro Zeile (Strophe), 9 (Refrain).\n' +
      '- Jede Zeile trägt eine singability-Note (0..1).\n\n' +
      'OUTPUT (JSON, SONG_OBJECT):\n' +
      '{\n  "title": "<≤6 Wörter>",\n  "subtitle": "<optional, ≤10 Wörter>",\n  "lang": "de",\n' +
      '  "key": "<C-Dur | A-Moll | ...>",\n  "tempo_bpm": 92,\n  "time_signature": "4/4",\n' +
      '  "structure_order": ["intro","verse1","prechorus","chorus","verse2","chorus","bridge","chorus","outro"],\n' +
      '  "sections": [\n    {\n      "id": "verse1",\n      "label": "Verse 1",\n      "chords": ["Am","F","C","G"],\n      "performance_note": "...",\n' +
      '      "lines": [\n        {\n          "id": "v1l1",\n          "text": "<Zeilentext>",\n          "syllables": 9,\n          "singability": 0.86,\n' +
      '          "imagery_tags": ["wasser","stille"],\n' +
      '          "alt_versions": [\n            { "text": "<alt 1>", "delta_note": "ruhiger" },\n            { "text": "<alt 2>", "delta_note": "kantiger" }\n          ]\n        }\n      ]\n    }\n  ],\n' +
      '  "production_spec": {\n    "arrangement": [{ "bar": "1-4", "elements": ["upright_bass","felt_piano"] }],\n' +
      '    "mix_targets": {\n      "lufs_integrated": -10, "true_peak_db": -1, "stereo_width": 0.7,\n      "low_end_focus_hz": 80, "air_band_db": "+1.5 dB @ 12 kHz"\n    },\n' +
      '    "mastering_hints": ["bus_compression_2dB","gentle_tape_sat","hpf_30hz"]\n  },\n' +
      '  "ai_music_engine_prompts": {\n    "suno": "<≤200 Zeichen>",\n    "udio": "<≤200 Zeichen>",\n    "musicgen": "<≤120 Zeichen>"\n  },\n' +
      '  "edit_handles": {\n    "regenerable": ["v1l1","v1l2","..."],\n    "rewrite_sections": ["verse1","chorus","bridge"]\n  },\n' +
      '  "rationale": "<≤220 Zeichen>",\n  "safety_flag": false\n}\n\n' +
      'RE-ROLL-LOGIK (mode=regenerate_lines):\n' +
      '- Ändere NUR die in edit_targets.line_ids genannten Zeilen.\n' +
      '- Behalte Silbenzahl (±1), imagery_tags-Familie, Reimschema.\n' +
      '- Erzeuge für jede geänderte Zeile 3 frische alt_versions mit\n  unterschiedlichen delta_note (z. B. "zarter","direkter","bildhafter").\n' +
      '- Locks bleiben identisch.\n\n' +
      'RE-WRITE-LOGIK (mode=rewrite_section):\n' +
      '- Halte Anzahl der Zeilen identisch (±1) und Akkordfolge identisch.\n' +
      '- instruction aus edit_targets ist verbindlich.';
  }

  window.SONG_PROMPTS = {
    SYSTEM_CORE,
    PROMPT_TEST_QUESTIONS,
    buildInputInterpreterUserPrompt,
    buildPersonaSynthesisUserPrompt,
    buildSongComposerUserPrompt
  };
})();
