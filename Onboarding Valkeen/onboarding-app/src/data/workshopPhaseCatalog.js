/**
 * Workshop-Phasen als Detail-Kacheln — analog zu Kotter, mit Reflexionsfragen pro Phase.
 */

export const WORKSHOP_PHASE_CATALOG = [
  {
    id: 'orient',
    order: 1,
    label: 'Orientierung',
    subtitle: 'Einstieg & Ziele',
    durationHint: '~15 Min.',
    description:
      'Gemeinsames Bild: Was ist mit „Change" in eurem Kontext gemeint? Heutige Lernergebnisse und Arbeitsformate abstimmen.',
    moderationHint:
      'Kurze Vorstellrunde oder Status: Was erwartet ihr von der Session? Welche laufenden Veränderungen sind für euch gerade präsent?',
    prompts: [
      {
        key: 'erwartungen',
        question: 'Was sind eure wichtigsten Erwartungen an diesen Workshop?',
        placeholder: 'z. B. Klarheit über nächste Schritte, Stakeholder-Alignment, gemeinsame Story …',
      },
      {
        key: 'aktuelle_veraenderungen',
        question: 'Welche laufenden Veränderungen sind für euch gerade präsent?',
        placeholder: 'z. B. neues System, Reorganisation, Kulturwandel …',
      },
      {
        key: 'erfolg_definition',
        question: 'Wann wäre dieser Workshop für euch ein Erfolg?',
        placeholder: 'Konkrete Outcomes oder Ergebnisse, die ihr mitnehmen wollt …',
      },
    ],
  },
  {
    id: 'basics',
    order: 2,
    label: 'Grundlagen',
    subtitle: 'Change & Dynamik',
    durationHint: '~45 Min.',
    description:
      'Verständnis für typische menschliche Reaktionen auf Veränderung. Bewusstsein für klassische Erfolgs- und Risikofaktoren.',
    moderationHint:
      'Besprecht, wo eure Bereiche in der emotionalen Kurve etwa stehen. Eskalationspfade klar haben, falls Diskussion emotional wird.',
    prompts: [
      {
        key: 'emotionale_phase',
        question: 'In welcher emotionalen Phase stehen verschiedene Gruppen bei euch vermutlich — und warum?',
        placeholder: 'z. B. Führung = vorsichtige Akzeptanz, Fachbereich = noch Widerstand …',
      },
      {
        key: 'fruehe_erfahrungen',
        question: 'Was hat in früheren Veränderungsprojekten bei euch gut funktioniert?',
        placeholder: 'Konkrete Beispiele, Erfolgsfaktoren …',
      },
      {
        key: 'stolpersteine',
        question: 'Wo ist es in der Vergangenheit gehakt — welche Muster erkennt ihr?',
        placeholder: 'z. B. zu wenig Kommunikation, fehlende Ressourcen, Widerstand ignoriert …',
      },
    ],
  },
  {
    id: 'success_formula',
    order: 3,
    label: 'Zusammenspiel',
    subtitle: 'Projekt × Change',
    durationHint: '~25 Min.',
    description:
      'Projekt- und Changearbeit als ergänzende Säulen verstehen. Kopf–Herz–Hand als Orientierung für Aktivierung.',
    moderationHint:
      'Ordnet bei eurem aktuellen Thema zu: Wo stehen wir bei Kopf / Herz / Hand — und was ist der nächste sinnvolle Schritt?',
    prompts: [
      {
        key: 'kopf_status',
        question: 'KOPF (Verstehen): Wie klar ist die Logik des Vorhabens und die eigene Rolle für alle Beteiligten?',
        placeholder: 'z. B. Führung versteht es, aber Fachbereich hat noch Fragen …',
      },
      {
        key: 'herz_status',
        question: 'HERZ (Motivation): Sind die Vorteile für die Betroffenen greifbar? Gibt es echte Beteiligung?',
        placeholder: 'z. B. einige sehen den Nutzen, andere fühlen sich übergangen …',
      },
      {
        key: 'hand_status',
        question: 'HAND (Verhalten): Welches konkrete Tun, Training oder Ritual braucht es als nächstes?',
        placeholder: 'z. B. Pilotgruppe einrichten, erste Schulung planen, Quick Win definieren …',
      },
    ],
  },
  {
    id: 'why',
    order: 4,
    label: 'Ausgangslage',
    subtitle: 'Warum & Sinn',
    durationHint: '~40 Min.',
    description:
      'Gemeinsames «Warum» schärfen. Ausgangslage transparent machen und Brücken zwischen Organisation, Team und Person bauen.',
    moderationHint:
      'Welches Problem lösen wir? Was passiert bei «weiter wie bisher»? Was wäre das beste erreichbare Bild in 12 Monaten?',
    prompts: [
      {
        key: 'ausgangslage_heute',
        question: 'Welche Ausgangslage habt ihr heute? Was ist der Status quo?',
        placeholder: 'Aktuelle Situation, Schmerzpunkte, Treiber …',
      },
      {
        key: 'problem_definition',
        question: 'Welches konkrete Problem löst ihr mit diesem Vorhaben?',
        placeholder: 'Das Kernproblem in 2-3 Sätzen …',
      },
      {
        key: 'ohne_veraenderung',
        question: 'Was passiert ohne Veränderung — bei «weiter wie bisher»?',
        placeholder: 'Konsequenzen, Risiken, verpasste Chancen …',
      },
      {
        key: 'zielbild_12m',
        question: 'Welches beste erreichbare Bild stellt ihr euch in 12 Monaten vor?',
        placeholder: 'Konkreter Zielzustand, messbare Verbesserungen …',
      },
    ],
  },
  {
    id: 'stakeholders',
    order: 5,
    label: 'Stakeholder',
    subtitle: 'Einfluss & Unterstützung',
    durationHint: '~50 Min.',
    description:
      'Stakeholder identifizieren und priorisieren. Strategie je Segment skizzieren — wen einbinden, informieren, aktivieren.',
    moderationHint:
      'Matrix nutzen: Einfluss (niedrig ↔ hoch) × Unterstützung (kritisch ↔ treibend). Pro kritischem Quadrant eine Maßnahme.',
    prompts: [
      {
        key: 'stakeholder_liste',
        question: 'Welche Stakeholder-Gruppen sind für euer Vorhaben relevant?',
        placeholder: 'z. B. Geschäftsleitung, IT, Fachbereich, Betriebsrat, Key User, externe Partner …',
      },
      {
        key: 'kritische_stakeholder',
        question: 'Welche Stakeholder haben hohen Einfluss, aber (noch) wenig Unterstützung?',
        placeholder: 'Namen/Rollen und warum sie kritisch sind …',
      },
      {
        key: 'stakeholder_massnahmen',
        question: 'Welche konkreten Maßnahmen plant ihr für die kritischen Stakeholder?',
        placeholder: 'z. B. 1:1 Gespräch mit X, Workshop mit Abteilung Y, Einbindung in Pilotgruppe …',
      },
    ],
  },
  {
    id: 'comms',
    order: 6,
    label: 'Kommunikation',
    subtitle: 'Kanäle & Story',
    durationHint: '~55 Min.',
    description:
      'Passende Kanäle wählen und Narrative für das Vorhaben entwerfen. Storytelling-Struktur: Warum → Wie → Was.',
    moderationHint:
      'Arbeitet an «Unsere Story»: Ausgangssituation, Projektbegründung, Kernbotschaft, 3 Schlüsselargumente.',
    prompts: [
      {
        key: 'story_woher',
        question: 'Wo kommt ihr her — was hat funktioniert, was nicht?',
        placeholder: 'Kurze Historie, bisherige Versuche, Lessons Learned …',
      },
      {
        key: 'story_gap',
        question: 'Wo steht ihr — was ist der Gap zum Ziel?',
        placeholder: 'Aktuelle Lücke zwischen Ist und Soll …',
      },
      {
        key: 'story_wohin',
        question: 'Wo wollt ihr hin — wie sieht der Zielzustand aus?',
        placeholder: 'Konkretes Zielbild, das alle verstehen …',
      },
      {
        key: 'story_warum_jetzt',
        question: 'Warum jetzt — was passiert ohne Veränderung?',
        placeholder: 'Dringlichkeit, Timing, externe Treiber …',
      },
      {
        key: 'kernbotschaft',
        question: 'Was ist eure Kernbotschaft in einem Satz?',
        placeholder: 'Der eine Satz, den jeder mitnehmen soll …',
      },
    ],
  },
  {
    id: 'pitch_plan',
    order: 7,
    label: 'Pitch & Plan',
    subtitle: 'Präsentieren & Planen',
    durationHint: '~35 Min.',
    description:
      'Elevator Pitch strukturieren und Kommunikationsplan grob befüllen. Meilensteine mit Botschaften verknüpfen.',
    moderationHint:
      'Pro Team 90-Sekunden-Pitch testen. Danach: erste Zeilen des Kommunikationsplans (3 Meilensteine × Zielgruppe × Kanal).',
    prompts: [
      {
        key: 'pitch_problem',
        question: 'PITCH: Welches Problem besteht (faktenbasiert, knapp)?',
        placeholder: 'Das Problem in 1-2 Sätzen …',
      },
      {
        key: 'pitch_loesung',
        question: 'PITCH: Was schlagt ihr vor?',
        placeholder: 'Eure Lösung/Vorgehen in 1-2 Sätzen …',
      },
      {
        key: 'pitch_nutzen',
        question: 'PITCH: Was ist der konkrete Nutzen?',
        placeholder: 'Messbare Vorteile, Verbesserungen …',
      },
      {
        key: 'pitch_ask',
        question: 'PITCH: Was braucht ihr (Zeit, Budget, Entscheid)?',
        placeholder: 'Der konkrete Ask an Entscheider …',
      },
      {
        key: 'komm_meilensteine',
        question: 'Welche 3 Meilensteine wollt ihr kommunizieren (mit Zielgruppe und Kanal)?',
        placeholder: 'z. B. Kickoff (alle, Townhall) | Go-Live (Key User, Workshop) | Review (Führung, Präsentation)',
      },
    ],
  },
  {
    id: 'wrap',
    order: 8,
    label: 'Abschluss',
    subtitle: 'Verdichtung & Fahrplan',
    durationHint: '~20 Min.',
    description:
      'Change begleitet das Projekt über Go-Live hinaus. Nächste Termine, Verantwortlichkeiten und Artefakte festhalten.',
    moderationHint:
      'Jede Person: eine konkrete nächste Aktion mit Datum. Protokollverteiler und Archiv-Ort festlegen.',
    prompts: [
      {
        key: 'naechste_schritte',
        question: 'Welche konkreten nächsten Schritte habt ihr definiert (mit Verantwortlichen und Terminen)?',
        placeholder: 'z. B. Stakeholder-Liste finalisieren (Max, bis Fr) | Story-Review (Team, nächste Woche) …',
      },
      {
        key: 'offene_punkte',
        question: 'Welche offenen Punkte / «Parkplatz»-Themen müssen noch geklärt werden?',
        placeholder: 'Themen, die später vertieft werden müssen …',
      },
      {
        key: 'regeltermine',
        question: 'Welche Regeltermine / Check-ins plant ihr für die Change-Begleitung?',
        placeholder: 'z. B. wöchentliches Stand-up, monatliches Review, Retrospektive nach Go-Live …',
      },
    ],
  },
];

export function getWorkshopPhaseById(id) {
  return WORKSHOP_PHASE_CATALOG.find((p) => p.id === id);
}

export function workshopPhaseIdList() {
  return WORKSHOP_PHASE_CATALOG.map((p) => p.id);
}
