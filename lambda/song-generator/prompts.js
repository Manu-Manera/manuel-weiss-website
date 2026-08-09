/**
 * Personality Song Generator - Prompt Library
 * Spiegelt prompts/personality-song-generator.md 1:1 in Code wider.
 * Jeder Export ist ein vollständiger System- bzw. User-Prompt-Builder.
 */

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

// ────────────────────────────────────────────────────────────
// 1) TEST QUESTIONS
// ────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────
// 2) INPUT INTERPRETER
// ────────────────────────────────────────────────────────────
function buildInputInterpreterUserPrompt({ source_type, raw, lang }) {
  return `AUFTRAG: Du erhältst eine UNSTRUKTURIERTE Eingabe aus EINER der folgenden
Quellen (source_type):
- "personality_test_result" (16Personalities, Big5, MBTI, DISC, Enneagram, 16PF)
- "ai_chat_log" (ChatGPT/Claude/Gemini Konversationen)
- "social_media" (Instagram-Bio, Tweets, LinkedIn-About, TikTok-Captions)
- "messenger_export" (WhatsApp/Signal/Telegram .txt Exporte)
- "free_text" (Tagebuch, Selbstbeschreibung, Briefe)
- "music_history" (Spotify/Apple Music Top-Songs/Genres)

EINGABE-KONTEXT:
{ "source_type": "${source_type}", "lang": "${lang || 'de'}" }

RAW-INHALT (zwischen <<<RAW>>> und <<</RAW>>>):
<<<RAW>>>
${(raw || '').slice(0, 60000)}
<<</RAW>>>

SCHRITTE:
1. PII-Scrubbing: Ersetze Namen/Adressen/Telefonnummern durch Platzhalter.
2. Quellen-spezifische Extraktion (Tests: Skalen/Typcodes; Chats: Themen,
   Selbstbeschreibungen, Konflikte, Ambitionen; Social: Tonalität;
   Music: Genre/Energy/Valence/Tempo).
3. Mapping auf das einheitliche PERSONA_SIGNAL_SCHEMA.
4. Konfidenzbewertung pro Skala (0–1) + kurze Belegnotiz.
5. Wenn Eingabe unzureichend (<200 Zeichen substantiell): confidence_overall < 0.3.
6. O-TON-EXTRAKTION (kritisch für den Songtext!): Sammle die stärksten
   WÖRTLICHEN Zitate, Mantras, Sprachbilder und Kernbotschaften aus dem
   RAW-Text. Bewahre den Originalton – kraftvolle, umgangssprachliche oder
   derbe Formulierungen NICHT glätten, nur PII entfernen. Diese Fragmente
   sind später das Rohmaterial für die Lyrics.

OUTPUT (JSON, PERSONA_SIGNAL_SCHEMA):
{
  "source_type": "...",
  "lang": "de",
  "scrubbed_excerpt": "<≤500 Zeichen anonymisierter Auszug>",
  "signals": {
    "BIG5_O": { "value": 0..100, "confidence": 0..1, "evidence": "<≤120 Z.>" },
    "BIG5_C": {...}, "BIG5_E": {...}, "BIG5_A": {...}, "BIG5_N": {...},
    "HEX_H":  {...},
    "VAL_SD": {...}, "VAL_BE": {...},
    "ATT_SEC":{...},
    "VIA_TOP":{ "value": ["<Stärke1>","<Stärke2>","<Stärke3>"],
                "confidence": 0..1, "evidence": "..." }
  },
  "themes": ["<thema1>", ...],
  "key_quotes": ["<bis zu 20 wörtliche, prägnante Zitate/Phrasen aus dem Text – O-Ton, nur PII-bereinigt>"],
  "signature_words": ["<bis zu 15 typische Wörter/Wendungen der Person>"],
  "imagery_bank": ["<bis zu 12 konkrete Bilder/Metaphern aus dem Text>"],
  "core_messages": ["<bis zu 8 Kernbotschaften/Mantras, je 1 Satz, nah am Original>"],
  "tonality": { "warmth": 0..1, "grit": 0..1, "melancholy": 0..1, "playfulness": 0..1 },
  "music_hints": {
    "preferred_genres": [], "avoid_genres": [],
    "tempo_pref": [bpm_min, bpm_max], "energy_pref": 0..1
  },
  "confidence_overall": 0..1,
  "safety_flag": false,
  "notes": "<≤200 Zeichen>"
}`;
}

// ────────────────────────────────────────────────────────────
// 3) PERSONA SYNTHESIS
// ────────────────────────────────────────────────────────────
function buildPersonaSynthesisUserPrompt({ test_results, facets, external_signals, astrology, salient_answers, imported_narrative, user_meta }) {
  return `AUFTRAG: Fusioniere folgende Quellen zu EINEM kohärenten Persona-Profil.

INPUT:
${JSON.stringify({
    test_results: test_results || {},
    facets: facets || {},
    external_signals: external_signals || [],
    astrology: astrology || null,
    salient_answers: salient_answers || [],
    imported_narrative: imported_narrative || null,
    user_meta: user_meta || {}
  }, null, 2)}

PRIMÄRQUELLEN (wissenschaftlich):
 - test_results: Big-Five-Domänen + HEXACO-H + Schwartz + Bindung + VIA. 0..100.
 - facets: 30 NEO-PI-R-Facetten (O1..O6 … N1..N6), wenn vorhanden – höchste
   diagnostische Auflösung. Nutze zur Schärfung der Narrative und Motive.
 - salient_answers: markante EINZELANTWORTEN aus dem Persönlichkeitstest
   (Frage-Kurzform, Ausprägung, Skala/Facette). Jede Antwort ist eine
   individuelle Nuance – nutze sie für nuance_fragments (siehe unten).
 - external_signals: optionale Zusatzhinweise (Tests, Tagebücher, Freitexte).
   Enthalten sie key_quotes / imagery_bank / core_messages, sind das O-Ton-
   Fragmente des Nutzers – übernimm die stärksten in motifs und
   nuance_fragments, ohne sie zu glätten.

SEKUNDÄRQUELLE (symbolisch, OPTIONAL):
 - astrology: nur als BILDERSPRACHE und MOTIV-RESERVOIR nutzen, nie als
   Persönlichkeitsaussage („du bist…").

FUSIONS-REGELN:
1. Pro Skala: gewichteter Mittelwert über alle wissenschaftlichen Quellen,
   Gewicht = confidence². Test-Quelle bekommt zusätzlich Faktor 1.5.
2. Bei Widersprüchen >25 Punkte: notiere in tensions[], wähle Wert mit höherer
   aggregierter Konfidenz, dokumentiere in rationale.
3. Leite Archetyp ab (NICHT MBTI-Buchstaben verwenden) – wähle 1 aus 12:
   ["Pilger","Kartograph","Funke","Hüter","Alchemist","Wanderer","Architekt",
    "Echo","Leuchtturm","Sturmreiter","Gärtner","Nordstern"]
4. Erzeuge core_narrative (3–4 Sätze, Du-Form, poetisch-präzise).
5. Erzeuge 5 motifs (semantische Bilder) für den Songtext.
6. Erzeuge eine music_dna als kompakten Steuervektor.
7. Setze harte Locks (tonality_lock, tempo_lock).
8. Erzeuge nuance_fragments: Für JEDE markante Einzelantwort in
   salient_answers (und für die stärksten key_quotes/core_messages aus
   external_signals) genau EIN konkretes, songtaugliches Bild oder Fragment
   (max. 12 Wörter). Kein Fragment doppelt, keine Allerweltsbilder
   (verboten: Anker, Funke, Echo, Sterne, Wege als Füller). Diese Fragmente
   sind später Pflicht-Material für den Songtext.

OUTPUT (JSON, PERSONA_PROFILE):
{
  "archetype": "<einer der 12>",
  "scales_final": { "BIG5_O": 0..100, ..., "VIA_TOP": ["...","...","..."] },
  "tensions": [{ "scale": "...", "delta": 12, "note": "..." }],
  "core_narrative": "<3 Sätze>",
  "motifs": ["<bild1>", "...", "<bild5>"],
  "nuance_fragments": [
    { "ref": "<item_id | quote | methode>", "source": "test|freitext|methode|astro",
      "fragment": "<konkretes Bild, max. 12 Wörter>" }
  ],
  "music_dna": {
    "key": "<C|C#|D|...>",
    "mode": "ionian|dorian|phrygian|lydian|mixolydian|aeolian|harmonic_minor",
    "tempo_bpm": 60..160,
    "tempo_lock": [bpm_min, bpm_max],
    "tonality_lock": ["allowed_chord_family_1","..."],
    "time_signature": "4/4|3/4|6/8|5/4",
    "energy": 0..1, "brightness": 0..1, "density": 0..1,
    "warmth": 0..1, "grit": 0..1,
    "instrumentation": {
      "core": ["<2-4 Instrumente>"],
      "color": ["<1-3 Farbinstrumente>"],
      "rhythm": ["<Drum-/Percussion-Setup>"],
      "avoid": ["<Instrumente, die NICHT passen>"]
    },
    "vocal": {
      "register": "low|mid|high",
      "delivery": "spoken|sung|whispered|belted|breathy|chant",
      "fx": ["reverb_hall","tape_sat","slap_delay","double_track"]
    },
    "structure": "INTRO-VERSE-PRECHORUS-CHORUS-VERSE-CHORUS-BRIDGE-CHORUS-OUTRO"
  },
  "rationale": "<≤300 Zeichen>"
}`;
}

// ────────────────────────────────────────────────────────────
// 4) SONG COMPOSER (full / regenerate / rewrite)
// ────────────────────────────────────────────────────────────
function buildSongComposerUserPrompt({ persona, mode, edit_targets, previous_song, creativity, source_material, song_directives, variation_seed, avoid_lines }) {
  persona = persona || {};
  const material = source_material || persona.source_material || null;
  const avoid = Array.isArray(avoid_lines) ? avoid_lines : [];

  // Direktiven: nur gesetzte (nicht-"auto") Werte in den Prompt
  const activeDirectives = {};
  if (song_directives) {
    Object.keys(song_directives).forEach((k) => {
      const v = song_directives[k];
      if (v === null || v === undefined || v === '' || v === 'auto') return;
      if (Array.isArray(v) && !v.length) return;
      activeDirectives[k] = v;
    });
  }
  const hasDirectives = Object.keys(activeDirectives).length > 0;

  const materialBlock = material
    ? `SOURCE_MATERIAL (O-Ton des Nutzers – WICHTIGSTE TEXTQUELLE):
${JSON.stringify(material, null, 2)}

SOURCE-MATERIAL-REGELN (verbindlich):
- Die key_quotes / core_messages sind der O-Ton des Nutzers. Baue die
  stärksten davon erkennbar in den Song ein – als Hook, Refrainzeile
  oder Punchline. Wörtlich oder minimal angepasst (Silben/Rhythmus).
- Nutze signature_words und imagery_bank als primäres Vokabular.
- Jede Sektion enthält mindestens 1 konkretes Bild oder Zitat aus dem Material.
- Glätte den Ton NICHT: wenn der Nutzer roh/derb formuliert und die
  Direktiven es nicht verbieten, bleibt der Song genauso roh.
- Generische Füllbilder (Anker, Funke, Echo, Sterne, Wege, Spur) sind
  VERBOTEN, solange Material aus SOURCE_MATERIAL verfügbar ist.

`
    : '';

  const directivesBlock = hasDirectives
    ? `SONG-DIREKTIVEN (vom Nutzer eingestellt – VERBINDLICH, überschreiben
music_dna und Standard-Regeln, wo sie kollidieren):
${JSON.stringify(activeDirectives, null, 2)}

DIREKTIVEN-LEGENDE:
- genre / style_reference: Ziel-Genre bzw. stilistische Referenz. Passe
  Akkorde, Rhythmik, Zeilenbau, Vokabular und engine-prompts daran an.
- mood, energy: emotionale Grundfarbe und Intensität.
- tempo_bpm, key_mode: feste musikalische Vorgaben (ersetzen die Locks).
- structure: exakte Sektionsfolge – übernimm sie 1:1 in structure_order.
- song_length: kurz≈8-12 Zeilen gesamt kompakt, mittel≈Standard, lang≈2 Verses+Bridge+Doppel-Chorus.
- language: de=Deutsch, en=Englisch, ch=Schweizerdeutsch (Mundart), mix=Sprachmix.
- perspective: ich/du/wir – konsequent im ganzen Song.
- explicitness: clean=jugendfrei, roh=direkt+umgangssprachlich inkl. „scheiß"/„verdammt", derb=ungefiltert explizit erlaubt.
- humor / pathos: 0-100. Hoch = ironisch-überdreht bzw. groß-emotional.
- rhyme_scheme: frei/paarreim/kreuzreim/assonanz/rap_multis.
- line_length: kurz≈max 8 Silben, mittel≈Standard, lang≈bis 16 Silben.
- vocal_style: gesungen/rap/gesprochen/mix – bestimmt Zeilenrhythmik und delivery.
- theme: Kernbotschaft des Songs – der Refrain verdichtet SIE (statt der core_narrative).
- hook_line: MUSS als zentrale Refrain-/Hookzeile vorkommen (wörtlich oder metrisch minimal angepasst).
- title: als Songtitel übernehmen.
- must_include: Wörter/Phrasen, die vorkommen MÜSSEN. must_avoid: verboten.
- quote_fidelity: 0-100. Hoch = Zitate möglichst wörtlich; niedrig = frei paraphrasieren.
- source_weights: relative Gewichtung der Quellen (test/freitext/methoden/astro)
  für die inhaltliche Mischung des Songtexts.

`
    : '';

  const avoidBlock = avoid.length
    ? `BEREITS VERWENDETE ZEILEN (aus früheren Versionen – NICHT wiederholen,
auch nicht leicht umformuliert; finde NEUE Bilder und Formulierungen):
${JSON.stringify(avoid.slice(0, 60), null, 1)}

`
    : '';

  return `AUFTRAG: Erzeuge einen tief persönlichen Song basierend auf PERSONA_PROFILE.

INPUT:
${JSON.stringify({
  persona,
  mode: mode || 'full',
  edit_targets: edit_targets || [],
  previous_song: previous_song || null,
  creativity: typeof creativity === 'number' ? creativity : 0.7,
  variation_seed: variation_seed || null
}, null, 2)}

${materialBlock}${directivesBlock}${avoidBlock}MUSIK-LOCK-MATRIX (gilt, sofern SONG-DIREKTIVEN nichts anderes vorgeben):
- Tonart bleibt innerhalb music_dna.key ± relative Moll/Dur-Variante.
- Akkorde nur aus tonality_lock-Familien (Standard: I, ii, IV, V, vi, iiø, VImaj7).
- Tempo bleibt im tempo_lock-Fenster.
- Instrumente nur aus core ∪ color ∪ rhythm; nie aus avoid.
- Bei jeder Re-Roll-Variation: Locks bleiben identisch.

LYRIK-REGELN:
- Du-Form ODER Ich-Form, konsistent über den ganzen Song (Direktive perspective hat Vorrang).
- Bilder vor Abstrakta (zeige, behaupte nicht).
- Mindestens 3 von 5 motifs werden konkret aufgegriffen.
- NUANCEN-PFLICHT: Enthält persona.nuance_fragments Einträge, verteile sie
  über den ganzen Song – jedes Fragment inspiriert mindestens eine Zeile.
  Trage die zugehörige ref als nuance_ref an der Zeile ein.
- must_include_keywords MÜSSEN vorkommen; must_avoid_keywords nicht.
- Reim: nicht erzwungen; Halbreime/Assonanzen/innere Reime bevorzugt (Direktive rhyme_scheme hat Vorrang).
- Refrain ist semantische Verdichtung der core_narrative (bzw. der Direktive theme/hook_line).
- Eine Zeile = ein Atemzug. Max. 12 Silben pro Zeile (Strophe), 9 (Refrain) – Direktive line_length hat Vorrang.
- Jede Zeile trägt eine singability-Note (0..1).

ANTI-REPETITION (verbindlich):
- Keine Phrase wiederholt sich im Song, außer als bewusster Refrain/Hook.
- Kein Wort außer Funktionswörtern kommt öfter als 4x vor (Refrain-Hook ausgenommen).
- Verbrauchte Song-Klischees vermeiden: „Anker", „Funke", „Echo", „Sterne",
  „Flügel", „Phönix", „brenn(t/en)", „Herz aus Gold" – außer sie stammen
  nachweislich aus SOURCE_MATERIAL oder must_include.
- variation_seed ist ein Zufallsanker: nutze ihn, um bewusst andere Bilder,
  Reime und Perspektiven zu wählen als bei einem früheren Durchlauf.

OUTPUT (JSON, SONG_OBJECT):
{
  "title": "<≤6 Wörter>",
  "subtitle": "<optional, ≤10 Wörter>",
  "lang": "<gemäß Direktive language, sonst de>",
  "key": "<C-Dur | A-Moll | ...>",
  "tempo_bpm": 92,
  "time_signature": "4/4",
  "structure_order": ["<Sektionsfolge gemäß Direktive structure, sonst music_dna.structure>"],
  "sections": [
    {
      "id": "verse1",
      "label": "Verse 1",
      "chords": ["<Akkord1>","<Akkord2>","<Akkord3>","<Akkord4>"],
      "performance_note": "...",
      "lines": [
        {
          "id": "v1l1",
          "text": "<Zeilentext>",
          "syllables": 9,
          "singability": 0.86,
          "imagery_tags": ["<tag1>","<tag2>"],
          "nuance_ref": "<optional: ref aus nuance_fragments oder quote>",
          "alt_versions": [
            { "text": "<alt 1>", "delta_note": "ruhiger" },
            { "text": "<alt 2>", "delta_note": "kantiger" }
          ]
        }
      ]
    }
  ],
  "production_spec": {
    "arrangement": [{ "bar": "1-4", "elements": ["upright_bass","felt_piano"] }],
    "mix_targets": {
      "lufs_integrated": -10, "true_peak_db": -1, "stereo_width": 0.7,
      "low_end_focus_hz": 80, "air_band_db": "+1.5 dB @ 12 kHz"
    },
    "mastering_hints": ["bus_compression_2dB","gentle_tape_sat","hpf_30hz"]
  },
  "ai_music_engine_prompts": {
    "suno": "<≤200 Zeichen>",
    "udio": "<≤200 Zeichen>",
    "musicgen": "<≤120 Zeichen>"
  },
  "edit_handles": {
    "regenerable": ["v1l1","v1l2","..."],
    "rewrite_sections": ["verse1","chorus","bridge"]
  },
  "rationale": "<≤220 Zeichen>",
  "safety_flag": false
}

RE-ROLL-LOGIK (mode=regenerate_lines):
- Ändere NUR die in edit_targets.line_ids genannten Zeilen.
- Behalte Silbenzahl (±1), imagery_tags-Familie, Reimschema.
- Erzeuge für jede geänderte Zeile 3 frische alt_versions mit
  unterschiedlichen delta_note (z. B. "zarter","direkter","bildhafter").
- Locks bleiben identisch.

RE-WRITE-LOGIK (mode=rewrite_section):
- Halte Anzahl der Zeilen identisch (±1) und Akkordfolge identisch.
- instruction aus edit_targets ist verbindlich.`;
}

// ────────────────────────────────────────────────────────────
// 5) SONG REROLL (kompakt – nur betroffene Zeilen/Sektion)
// ────────────────────────────────────────────────────────────
function buildSongRerollUserPrompt({ persona, previous_song, edit_targets, mode, song_directives }) {
  persona = persona || {};
  previous_song = previous_song || {};
  edit_targets = edit_targets || [];
  mode = mode || 'regenerate_lines';

  const styleBrief = {};
  if (song_directives) {
    ['language', 'perspective', 'explicitness', 'rhyme_scheme', 'humor', 'pathos', 'vocal_style', 'genre', 'style_reference'].forEach((k) => {
      const v = song_directives[k];
      if (v !== null && v !== undefined && v !== '' && v !== 'auto') styleBrief[k] = v;
    });
  }

  const targets = edit_targets.map((et) => {
    const sec = (previous_song.sections || []).find((s) => s.id === et.section_id);
    const lineIds = et.line_ids || [];
    const lines = ((sec && sec.lines) || []).filter((l) => lineIds.length === 0 || lineIds.indexOf(l.id) !== -1);
    return {
      section_id: et.section_id,
      section_label: sec && sec.label,
      chords: sec && sec.chords,
      performance_note: sec && sec.performance_note,
      instruction: et.instruction || '',
      lines: lines.map((l) => ({
        id: l.id, text: l.text, syllables: l.syllables,
        singability: l.singability, imagery_tags: l.imagery_tags
      }))
    };
  });

  const personaBrief = {
    archetype: persona.archetype,
    motifs: persona.motifs,
    core_narrative: persona.core_narrative,
    key_quotes: (persona.source_material && Array.isArray(persona.source_material.key_quotes))
      ? persona.source_material.key_quotes.slice(0, 8)
      : undefined,
    music_dna: persona.music_dna
      ? { key: persona.music_dna.key, mode: persona.music_dna.mode, tempo_bpm: persona.music_dna.tempo_bpm }
      : null
  };

  return `AUFTRAG: Songzeilen neu formulieren (mode=${mode}).

PERSONA (Kurz):
${JSON.stringify(personaBrief, null, 2)}

${Object.keys(styleBrief).length ? 'STIL-DIREKTIVEN (verbindlich):\n' + JSON.stringify(styleBrief, null, 2) + '\n\n' : ''}ZIELE (nur diese Zeilen/Sektionen ändern):
${JSON.stringify(targets, null, 2)}

REGELN:
- Nur die genannten line_ids ändern${mode === 'rewrite_section' ? ' (ganze Sektion)' : ''}.
- Silbenzahl pro Zeile ±1 beibehalten.
- imagery_tags-Familie beibehalten.
- Neue Zeile darf KEINE Formulierung aus dem restlichen Song wiederholen.
- Bei regenerate_lines: pro Zeile neuer text + genau 3 alt_versions (delta_note: zarter, direkter, bildhafter).
- instruction aus edit_targets ist verbindlich.
- Sprache und Perspektive wie im Original bzw. gemäß Stil-Direktiven.

OUTPUT: NUR gültiges JSON, kein Markdown, keine Codefences.
Schema:
{
  "sections": [
    {
      "id": "<section_id>",
      "lines": [
        {
          "id": "<line_id>",
          "text": "<neuer Text>",
          "syllables": 9,
          "singability": 0.86,
          "imagery_tags": ["tag1","tag2"],
          "alt_versions": [
            { "text": "...", "delta_note": "zarter" },
            { "text": "...", "delta_note": "direkter" },
            { "text": "...", "delta_note": "bildhafter" }
          ]
        }
      ]
    }
  ]
}`;
}

module.exports = {
  SYSTEM_CORE,
  PROMPT_TEST_QUESTIONS,
  buildInputInterpreterUserPrompt,
  buildPersonaSynthesisUserPrompt,
  buildSongComposerUserPrompt,
  buildSongRerollUserPrompt
};
