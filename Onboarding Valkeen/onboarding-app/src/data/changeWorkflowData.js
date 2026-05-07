/** Geführter Moderationsablauf für Change-Sessions — neutral formuliert. */

export const CHANGE_WORKFLOW_META = {
  title: 'Change Workflow',
  subtitle:
    'Geführter Ablauf für eine kompakte Change-Session: von gemeinsamen Grundlagen über Ausgangslage und Stakeholder bis zu Kommunikation und Planung.',
};

export const CHANGE_PHASES = [
  {
    id: 'orient',
    label: 'Orientierung',
    hint: 'Einstieg & Ziele',
    durationHint: '~15 Min.',
    goals: [
      'Gemeinsames Bild: Was ist mit „Change“ in eurem Kontext gemeint?',
      'Heutige Lernergebnisse und Arbeitsformate abstimmen',
    ],
    steps: [
      {
        title: 'Check-in',
        body:
          'Kurze Vorstellrunde oder Status: Was erwartet ihr von der Session? Welche laufenden Veränderungen sind für euch gerade präsent?',
      },
      {
        title: 'Ziele für heute',
        bullets: [
          'Gemeinsames Verständnis von Change und typischen Wirkungsmechanismen',
          'Erfolgsfaktoren und häufige Stolpersteine kennen',
          'Ausgangslage und Stakeholder bei eurem Vorhaben schärfen',
          'Kommunikation und Geschichte (Story) strukturiert angehen',
          'Konkrete nächste Schritte und Verantwortlichkeiten definieren',
        ],
      },
    ],
    facilitatorChecklist: [
      'Moderationsmaterial (Zeitnehmer, Dokumentationsfläche) bereit',
      'Digitale Vorlage oder Protokoll für Gruppenergebnisse',
    ],
    exercisePrompt:
      'Sammelt in 10 Minuten 3–5 Stichworte zu euren bisherigen Erfahrungen mit Veränderungsprojekten: Was hat gut funktioniert? Wo ist es gehakt?',
  },

  {
    id: 'basics',
    label: 'Grundlagen',
    hint: 'Change & Dynamik',
    durationHint: '~45 Min.',
    goals: [
      'Verständnis für typische menschliche Reaktionen auf Veränderung',
      'Bewusstsein für klassische Erfolgs- und Risikofaktoren',
    ],
    steps: [
      {
        title: 'Veränderung als Dauerzustand',
        body:
          'Organisationen und Systeme stehen nie still. Change-Management adressiert nicht nur die technische oder fachliche Seite, sondern vor allem Nutzung, Akzeptanz und Verhalten.',
      },
      {
        title: 'Typische emotionale Phasen',
        body:
          'Bei grösseren organisatorischen oder technischen Umstellungen lassen sich oft Phasen beobachten — von Unsicherheit und Widerstand über Rückschläge bis zu experimentierender Nutzung und Integration. Kein starres Modell, aber ein nützliches Gesprächsinstrument mit den Betroffenen.',
        bullets: [
          'Frühe Signale / Unsicherheit',
          'Schock oder Zurückweisung',
          'Sachliche Auseinandersetzung und Frust',
          'Erste Schritte, Versuch, vorsichtige Akzeptanz',
          'Verankerung im Alltag',
        ],
      },
      {
        title: 'Häufige Gründe für Scheitern (nach Kotter u. a.)',
        bullets: [
          'Unzureichend spürbare Dringlichkeit',
          'Führungsgremium zu schwach oder zu wenig eingebunden',
          'Keine klare, greifbare Vision',
          'Vision wird nicht konsequent kommuniziert',
          'Menschen werden nicht befähigt (Ressourcen, Kompetenzen, Freiräume)',
          'Kurzfristige Erfolge fehlen oder werden nicht sichtbar gemacht',
          'Erfolg wird zu früh „abgehakt“',
          'Neues Verhalten wird nicht in Kultur und Prozesse verankert',
        ],
      },
      {
        title: 'Was Erfolg bedeuten kann',
        body:
          'Technische Lieferung allein reicht oft nicht. Sinnvolle Zielgrösse: vereinbarte Qualität der Lösung und gleichzeitig echte Überzeugung und Nutzung bei den Menschen.',
        bullets: [
          'Qualität: Anforderungen erfüllt, Prozesse stabil, Technik zuverlässig',
          'Begeisterung & Nutzung: relevante Nutzergruppen verstehen das Warum und arbeiten mit dem Neuen verlässlich',
        ],
      },
    ],
    exercisePrompt:
      'Diskutiert kurz anhand eurer eigene Situation: In welcher Phase stehen verschiedene Gruppen vermutlich — und warum?',
    facilitatorChecklist: [
      'Eskalationspfade klar haben, falls Diskussion sehr emotional wird',
      'Beispiele aus eurer Organisation anonymisiert einplanen',
    ],
  },

  {
    id: 'success_formula',
    label: 'Zusammenspiel',
    hint: 'Projekt × Change',
    durationHint: '~25 Min.',
    goals: ['Projekt- und Changearbeit als ergänzende Säulen verstehen', 'Kopf–Herz–Hand als Orientierung'],
    steps: [
      {
        title: 'Zwei Strange',
        bullets: [
          'Projektmanagement: Initiierung, Planung, Steuerung, Design, Tests, Übergabe, Betrieb',
          'Change Management: Sinn («Warum»), Führung, Stakeholder, Kommunikation, Aktivierung, Adoption',
        ],
      },
      {
        title: 'Kopf, Herz, Hand',
        bullets: [
          'Kopf — Verstehen: Die Logik des Vorhabens und die eigene Rolle sind klar',
          'Herz — Beteiligung: Motivation und Vorteile für die Betroffenen greifbar',
          'Hand — Verhalten: Konkretes Tun, Ritual, Schulung und Erfolgsmessung im Alltag',
        ],
      },
    ],
    exercisePrompt:
      'Ordnet bei eurem aktuellen Thema zu: Wo stehen wir bei Kopf / Herz / Hand — und was ist der nächste sinnvolle Schritt?',
    facilitatorChecklist: ['Zeichnung oder Matrix auf gemeinsamer Fläche bereithalten'],
  },

  {
    id: 'why',
    label: 'Ausgangslage',
    hint: 'Warum & Sinn',
    durationHint: '~40 Min.',
    goals: ['Gemeinsames «Warum» schärfen', 'Ausgangslage transparent machen'],
    steps: [
      {
        title: 'Warum zuerst?',
        body:
          'Motivation wirkt stark auf Akzeptanz und Qualität der Umsetzung. Zwischen organisationaler Zielrichtung («Warum wirkt sich das aus?»), Team-Sinn («Warum wir?») und persönlicher Relevanz gilt es Brücken zu bauen.',
      },
      {
        title: 'Hebel für gelingende Veränderung',
        bullets: [
          'Menschen: Vertrauen, Kompetenzentwicklung, Experimentierraum',
          'Technologie / Lösung: verständlich, befähigend, zum Zweck passend',
          'Organisation: Transparenz, Feedback, Balance Steuerung und Selbstorganisation',
          'Gesamtbild: gemeinsamer Sinn, früh Beteiligte statt nur «Betroffene», möglichst Freiwilligkeit wo sinnvoll',
        ],
      },
    ],
    exercisePrompt:
      'Team-Reflexion (20 Min.): Welche Ausgangslage haben wir heute? Welches Problem lösen wir? Was passiert bei «weiter wie bisher»? Was wäre das beste erreichbare Bild in 12 Monaten?',
    facilitatorChecklist: [
      'Vorab Fakten und Rahmen (Scope, Zeit, Budget) kurz teilen',
      'Diskussion auf eine dokumentierbare Fläche lenken',
    ],
  },

  {
    id: 'stakeholders',
    label: 'Stakeholder',
    hint: 'Einfluss & Unterstützung',
    durationHint: '~50 Min.',
    goals: ['Stakeholder identifizieren und priorisieren', 'Strategie je Segment skizzieren'],
    steps: [
      {
        title: 'Definition',
        body:
          'Stakeholder sind Personen, Gruppen oder Organisationen, die Einfluss auf das Ergebnis haben und/oder davon betroffen sind (nach gängiger Projektmanagement-Praxis).',
      },
      {
        title: 'Mini-Mapping',
        bullets: [
          'Achsen: Einfluss (niedrig ↔ hoch) und Einstellung / Unterstützung (kritisch ↔ treibend)',
          'Quadranten nutzen: wen priorisieren, wen informieren, wen einbinden, wen aktiv nutzen',
        ],
      },
      {
        title: 'Verschiedene Change-Typen',
        body:
          'Technische Rollouts, Prozesswechsel, Kulturthemen oder hybride Vorhaben — die Stakeholder-Landschaft und die passende Taktik unterscheiden sich. Passt die Intensität der Beteiligung an die Wirkung an.',
      },
    ],
    exercisePrompt:
      '1) Liste in 5 Min. primäre Stakeholder. 2) Tragt sie in die Matrix ein. 3) Pro «kritischem» oder «hoch Einfluss / wenig Support»-Feld: eine konkrete Massnahme notieren.',
    facilitatorChecklist: ['Matrix-Vorlage (digital oder Flipchart) vorbereiten'],
  },

  {
    id: 'comms',
    label: 'Kommunikation',
    hint: 'Kanäle & Story',
    durationHint: '~55 Min.',
    goals: ['Passende Kanäle wählen', 'Narrative für das Vorhaben entwerfen'],
    steps: [
      {
        title: 'Zwei Richtungen',
        bullets: [
          'Grosser Einfluss, geringe Unterstützung: gezielt entlasten, Bedenken adressieren, Einbindung suchen',
          'Grosser oder mittlerer Einfluss, hohe Unterstützung: nutzen, informieren, sichtbar machen',
        ],
      },
      {
        title: 'Kanal vs. Publikum',
        body:
          'Grosses Publikum / wenig Detail: Townhall, kurze Videos, Newsletter. Kleines Publikum / viel Detail: Workshops, Teambesprechungen, schriftliche Vertiefung. Dazwischen: E-Mail, Roadshow, Präsenztermine je nach Kultur.',
      },
      {
        title: 'Storytelling: Reihenfolge der Botschaften',
        bullets: [
          'Zuerst Warum und Relevanz',
          'Dann Wie (Vorgehen, Beteiligung, was erwartet wird)',
          'Zuletzt Was (konkrete Lieferobjekte, Termine, Systeme)',
        ],
      },
      {
        title: 'Roter Faden',
        bullets: [
          'Einleitung: Ausgangssituation, Auslöser, offene Frage',
          'Hauptteil: Kernbotschaft und Begründung',
          'Schluss: konkreter Call-to-Action oder nächster Termin',
        ],
      },
      {
        title: 'Glaubwürdige Geschichte',
        bullets: [
          'Wo kommen wir her — was hat funktioniert, was nicht?',
          'Wo stehen wir — was ist der Gap zum Ziel?',
          'Wo wollen wir hin — wie sieht der Zielzustand aus?',
          'Warum jetzt — was passiert ohne Veränderung; wie betrifft es Rollen und Teams?',
        ],
      },
    ],
    exercisePrompt:
      'Arbeitet 30 Min. an «Unsere Story»: Ausgangssituation, Projektbegründung, Kernbotschaft, 3 Schlüsselargumente. Dokumentiert auf der gemeinsamen Fläche.',
    facilitatorChecklist: [
      'Beispiel-Good-Story (anonymisiert) als Orientierung optional',
      'Zeitbox für Präsentation der Gruppenergebnisse einplanen',
    ],
  },

  {
    id: 'pitch_plan',
    label: 'Pitch & Plan',
    hint: 'Kurz präsentieren & Planen',
    durationHint: '~35 Min.',
    goals: ['Elevator Pitch strukturieren', 'Kommunikationsplan grob befüllen'],
    steps: [
      {
        title: 'Elevator Pitch',
        body:
          'Sehr kurze, mündliche Einordnung für Entscheidungsträger oder wenig involvierte Stakeholder: Problem, Lösungsidee, Nutzen, nächster Schritt — typisch in unter zwei Minuten.',
        bullets: [
          'Welches Problem besteht (faktenbasiert, knapp)?',
          'Was schlagt ihr vor?',
          'Was sind Ziele und grober Plan?',
          'Was braucht ihr (Zeit, Budget, Entscheid)?',
        ],
      },
      {
        title: 'Kommunikationsplan',
        body:
          'Meilensteine des Vorhabens mit Botschaften und Zielgruppen verknüpfen: Wer erfährt wann was, über welchen Kanal, mit welchem Ziel (Informieren, Mitgestalten, Freigeben)?',
      },
    ],
    exercisePrompt:
      '15 Min.: Pro Team ein 90-Sekunden-Pitch testen. Danach: erste Zeilen des Kommunikationsplans (3 Meilensteine × Zielgruppe × Kanal).',
    facilitatorChecklist: ['Timer 90 s', 'Feedback-Regeln: zuerst Was wirkte, dann Verbesserung'],
  },

  {
    id: 'wrap',
    label: 'Abschluss',
    hint: 'Verdichtung & Fahrplan',
    durationHint: '~20 Min.',
    goals: ['Change begleitet das Projekt über Go-Live hinaus', 'Nächste Termine und Artefakte festhalten'],
    steps: [
      {
        title: 'Change ist fortlaufend',
        body:
          'Von Kick-off über regelmässige Check-ins bis Vorbereitung Go-Live und Nachlauf: die gleichen Themen (Stakeholder, Kommunikation, Adoption, Support) brauchen Slots im Projektplan.',
        bullets: [
          'Start: heutige Ergebnisse (Situation, Warum, Stakeholder-Entwurf, Story, Plan-Skelett)',
          'Check-ins: Fortschritt, Widerstände, Anpassung der Botschaften',
          'Vor Go-Live: Training, Support-Modell, Eskalation',
          'Nach Go-Live: Verankerung, Lessons Learned, kontinuierliche Verbesserung',
        ],
      },
      {
        title: 'Nächste Schritte festhalten',
        bullets: [
          'Verantwortliche und Fälligkeiten für Ausarbeitung Ausgangslage / Stakeholderliste',
          'Review-Termin für Story und Kommunikationsplan',
          'Regelmässiger Change-Slot in Projekt- oder Steuerungsrunden',
        ],
      },
    ],
    exercisePrompt:
      'Jede Person: eine konkrete nächste Aktion mit Datum. Moderation: auf Protokoll schreiben und Versand klären.',
    facilitatorChecklist: ['Protokollverteiler und Archiv-Ort festlegen'],
  },
];
