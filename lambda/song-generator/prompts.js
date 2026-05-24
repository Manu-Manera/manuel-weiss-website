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
function buildPersonaSynthesisUserPrompt({ test_results, external_signals, user_meta }) {
  return `AUFTRAG: Fusioniere folgende Quellen zu EINEM kohärenten Persona-Profil.

INPUT:
${JSON.stringify({ test_results: test_results || {}, external_signals: external_signals || [], user_meta: user_meta || {} }, null, 2)}

FUSIONS-REGELN:
1. Pro Skala: gewichteter Mittelwert über alle Quellen, Gewicht = confidence².
   Test-Quelle bekommt zusätzlich Faktor 1.5.
2. Bei Widersprüchen >25 Punkte: notiere in tensions[], wähle Wert mit höherer
   aggregierter Konfidenz, dokumentiere in rationale.
3. Leite Archetyp ab (NICHT MBTI-Buchstaben verwenden) – wähle 1 aus 12:
   ["Pilger","Kartograph","Funke","Hüter","Alchemist","Wanderer","Architekt",
    "Echo","Leuchtturm","Sturmreiter","Gärtner","Nordstern"]
4. Erzeuge core_narrative (3 Sätze, Du-Form, poetisch-präzise).
5. Erzeuge 5 motifs (semantische Bilder) für den Songtext.
6. Erzeuge eine music_dna als kompakten Steuervektor.
7. Setze harte Locks (tonality_lock, tempo_lock).

OUTPUT (JSON, PERSONA_PROFILE):
{
  "archetype": "<einer der 12>",
  "scales_final": { "BIG5_O": 0..100, ..., "VIA_TOP": ["...","...","..."] },
  "tensions": [{ "scale": "...", "delta": 12, "note": "..." }],
  "core_narrative": "<3 Sätze>",
  "motifs": ["<bild1>", "...", "<bild5>"],
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
function buildSongComposerUserPrompt({ persona, mode, edit_targets, previous_song, creativity }) {
  return `AUFTRAG: Erzeuge einen tief persönlichen Song basierend auf PERSONA_PROFILE.

INPUT:
${JSON.stringify({
  persona: persona || {},
  mode: mode || 'full',
  edit_targets: edit_targets || [],
  previous_song: previous_song || null,
  creativity: typeof creativity === 'number' ? creativity : 0.7
}, null, 2)}

MUSIK-LOCK-MATRIX (nicht verhandelbar):
- Tonart bleibt innerhalb music_dna.key ± relative Moll/Dur-Variante.
- Akkorde nur aus tonality_lock-Familien (Standard: I, ii, IV, V, vi, iiø, VImaj7).
- Tempo bleibt im tempo_lock-Fenster.
- Instrumente nur aus core ∪ color ∪ rhythm; nie aus avoid.
- Bei jeder Re-Roll-Variation: Locks bleiben identisch.

LYRIK-REGELN:
- Du-Form ODER Ich-Form, konsistent über den ganzen Song.
- Bilder vor Abstrakta (zeige, behaupte nicht).
- Mindestens 3 von 5 motifs werden konkret aufgegriffen.
- must_include_keywords MÜSSEN vorkommen; must_avoid_keywords nicht.
- Reim: nicht erzwungen; Halbreime/Assonanzen/innere Reime bevorzugt.
- Refrain ist semantische Verdichtung der core_narrative.
- Eine Zeile = ein Atemzug. Max. 12 Silben pro Zeile (Strophe), 9 (Refrain).
- Jede Zeile trägt eine singability-Note (0..1).

OUTPUT (JSON, SONG_OBJECT):
{
  "title": "<≤6 Wörter>",
  "subtitle": "<optional, ≤10 Wörter>",
  "lang": "de",
  "key": "<C-Dur | A-Moll | ...>",
  "tempo_bpm": 92,
  "time_signature": "4/4",
  "structure_order": ["intro","verse1","prechorus","chorus","verse2","chorus","bridge","chorus","outro"],
  "sections": [
    {
      "id": "verse1",
      "label": "Verse 1",
      "chords": ["Am","F","C","G"],
      "performance_note": "...",
      "lines": [
        {
          "id": "v1l1",
          "text": "<Zeilentext>",
          "syllables": 9,
          "singability": 0.86,
          "imagery_tags": ["wasser","stille"],
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

module.exports = {
  SYSTEM_CORE,
  PROMPT_TEST_QUESTIONS,
  buildInputInterpreterUserPrompt,
  buildPersonaSynthesisUserPrompt,
  buildSongComposerUserPrompt
};
