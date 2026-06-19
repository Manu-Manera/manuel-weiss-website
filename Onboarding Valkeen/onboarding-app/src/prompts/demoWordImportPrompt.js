export const DEMO_WORD_IMPORT_ANALYSIS_PROMPT = `Du analysierst ein hochgeladenes Demo-Skript (aus Word) für eine Tempus-Resource-Schulung bei Valkeen.

Antworte NUR mit gültigem JSON (kein Markdown). Schema:
{
  "summary": "2-4 Sätze: Thema, Zielgruppe, roter Faden",
  "audience": "pm|rm|bpafg|team|generic",
  "estimatedDurationMin": number,
  "proposedStructure": [
    { "kind": "hero|agenda|scene", "title": "string", "rationale": "kurz warum" }
  ],
  "warnings": ["string"]
}

Regeln:
- Erkenne PM vs RM vs BPAFG vs Team Resources aus Inhalt
- Agenda = nummerierte Blöcke / Schulungsablauf
- Szenen = Kapitel, "Block 01", große Überschriften, Demo-Schritte
- Nichts erfinden — nur aus dem Text ableiten`;

export const DEMO_WORD_IMPORT_STRUCTURE_PROMPT = `Du wandelst ein Demo-Skript in eine strukturierte Tempus-Demo um (für HTML-Builder).

Antworte NUR mit gültigem JSON. Schema:
{
  "hero": {
    "eyebrow": { "de": "", "en": "" },
    "title": { "de": "", "en": "" },
    "subtitle": { "de": "", "en": "" }
  },
  "agenda": {
    "kicker": { "de": "", "en": "" },
    "subtitle": { "de": "", "en": "" },
    "blocks": [
      { "num": 1, "title": { "de": "", "en": "" }, "bullets": [{ "de": "", "en": "" }] }
    ]
  },
  "scenes": [
    {
      "num": "01",
      "label": { "de": "", "en": "" },
      "act": { "de": "", "en": "" },
      "title": { "de": "", "en": "" },
      "subtitle": { "de": "", "en": "" },
      "tags": ["string"],
      "boxes": [
        {
          "type": "say|click|context|must|feedback|tip|warn",
          "header": { "de": "", "en": "" },
          "paragraphs": [{ "de": "", "en": "" }],
          "steps": [{ "de": "", "en": "" }]
        }
      ]
    }
  ],
  "catalogMeta": {
    "name": "Anzeigename",
    "description": "1-2 Sätze",
    "slug": "kebab-case-id",
    "badge": "z.B. 6 Szenen · DE",
    "features": ["3-5 Stichpunkte für Kachel"]
  }
}

Mapping aus Word:
- "Klick:" / "Click:" → type click, steps
- "Sagen:" / "Say:" → type say
- "Muss-Satz:" / "Must-use:" → type must
- "Hintergrund:" / "Background:" → type context
- [FEEDBACK: …] → type feedback
- Fließtext Moderator → say
- Nur Deutsch im Dokument → en leer lassen
- slug: nur a-z0-9-, max 48 Zeichen, kein pm/rm/bpafg/team-resources
- Mindestens 1 Agenda-Block und 1 Szene wenn im Text vorhanden`;

export const DEMO_WORD_IMPORT_REFINE_PROMPT = `Du passt einen Demo-Struktur-JSON-Entwurf an eine Trainer-Anweisung an.

Antworte NUR mit dem vollständigen aktualisierten JSON (gleiches Schema wie bei der Struktur-Generierung).
Ändere nur was nötig ist. Behalte Tempus-Fachbegriffe korrekt.`;
