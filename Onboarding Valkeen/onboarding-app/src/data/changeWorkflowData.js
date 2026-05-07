/** Geführter Moderationsablauf für Change-Sessions — neutral formuliert. */

export const CHANGE_WORKFLOW_META = {
  title: 'Change Workflow',
  subtitle:
    'Geführter Ablauf für eine kompakte Change-Session: von gemeinsamen Grundlagen über Ausgangslage und Stakeholder bis zu Kommunikation und Planung.',
};

/** Remote-Moderation: Checklisten & Kurzcodes unabhängig vom Meeting-Tool. */
export const CHANGE_WORKFLOW_REMOTE_META = {
  screenShareChecklist: [
    'Eigenes Moderationsfenster: nur diese Oberfläche oder die geplanten Folien zeigen — private Tabs und Benachrichtigungen schließen.',
    'Vor Slot: Teilnehmenden-Link, Aufzeichnung (falls genutzt) und Chat-/Q&A-Moderation geklärt.',
    'Breakouts: Zuweisung kurz demonstrieren oder Alternativformat (Geschlossene Gruppen / async) vereinbart.',
    'Audio: Kopfhörer nutzen, Mikrofon stumm wenn nicht gesprochen wird; klare Signal-Regel (Hand heben, Reaktionen).',
  ],
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
    remotePlaybook: {
      facilitatorSetup: [
        'Gemeinsame Dokumentationsfläche oder Board öffnen; Chat- oder Kurz-Reaktions-Regel («Hand heben») in 30 Sekunden erklären.',
        'Optional: Teilnehmenden bitten, die Kamera im Check-in kurz einzuschalten — wer nicht kann, erhält Platz im Chat.',
      ],
      workFormat:
        'Plenum für Check-in und Ziele (~5–7 Min.), danach synchrone Arbeit in Kleingruppen oder still einzeln mit Ergebnis auf der gemeinsamen Fläche (~10 Min.).',
      breakoutInvite:
        'Ihr habt jetzt 10 Minuten. Sammelt 3–5 Stichworte: Was hat in früheren Veränderungsprojekten gut funktioniert? Wo ist es gehakt?\n\nEine Person trägt in der geteilten Fläche zusammen — die anderen bereichern mit. Bei Rückfragen nutzt ihr den Chat; wir sammeln offene Punkte am Schluss dieser Phase («Parkplatz»).',
      parkPlatePrompt:
        'Parkplatz: Alles, was wir vertiefen aber jetzt nicht blockieren soll, gleich hier im Protokoll oder auf dem Board unter «Parkplatz» festhalten.',
      timerSuggestionMinutes: 15,
    },
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
      'Beispiele aus euer Organisation anonymisiert einplanen',
    ],
    remotePlaybook: {
      workFormat:
        'Kurzvortrag oder Dialog im Plenum, danach kleine Reflexionsrunde (Partner:innen oder Breakouts, je nach Grösse).',
      breakoutInvite:
        'Jetzt habt ihr 15 Minuten — in Zweiergruppen, Kleingruppen oder still für euch allein mit anschliessender Kurzvorstellung im Plenum:\n\nIn welcher der besprochenen Phasen stehen typische Nutzer-, Fach- oder Führungsgruppen bei euch aktuell — und was deutet darauf hin? Notiert zwei Teams oder Rollen und eine Vermutung pro Eintrag.',
      timerSuggestionMinutes: 45,
    },
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
    neutralDualTrackExamples: {
      heading: 'Neutraler Abgleich: «Steuerung» und «Mitgehen» ergänzen sich',
      intro:
        'Viele Organisationen nutzen strukturierte Pläne, Portfolios und Terminlogiken parallel zu Change-Themen. Gemeint sind typische Kombinationen — nicht ein bestimmtes Produkt.',
      rows: [
        {
          pillar: 'Planung / Ressourcen / Termine',
          examples:
            'Umfang strukturieren, Abhängigkeiten sichtbar machen, Status und Reporting zusammenhalten.',
        },
        {
          pillar: 'Nutzung, Beteiligung, Verfügbarkeit',
          examples:
            'Reale Teilnahme, Rollen beim Mitgestalten, klares «Warum» und Übungen statt nur Ankündigungen.',
        },
        {
          pillar: 'PMO / Projekt-Core',
          examples:
            'Scope, Risiko, Releases, operative Steuerungsrunden — dort Change-Slots oder Adoption-Tasks verankern.',
        },
        {
          pillar: 'Fachbereich, IT, Schlüsselanwender:innen',
          examples:
            'Botschaften verdichten, Widerstände zeitnah klären, Feedback in den Plan zurückspielen.',
        },
      ],
    },
    remotePlaybook: {
      workFormat:
        'Kurzes Plenum zu den beiden Strängen, dann Partner- oder Kleingruppenarbeit für Zuordnung «Kopf / Herz / Hand».',
      breakoutInvite:
        'Ihr habt 18 Minuten. Ordnet gemeinsam euer konkretes Vorhaben zu:\n• Wo ist «Kopf» schon klar?\n• Wo hapert «Herz» (Motivation)?\n• Was braucht es bei «Hand» als nächstes konkretes Tun?\n\nEine Person präsentiert in 90 Sekunden pro Gruppe einen Satz zum grössten nächsten Hebel.',
      timerSuggestionMinutes: 25,
    },
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
    remotePlaybook: {
      workFormat:
        'Input im Plenum, gefolgt von 20 Minuten Gruppenarbeit (Breakouts oder ein gemeinsamer Abschnitt im Dokument mit stiller Arbeit).',
      breakoutInvite:
        '20 Minuten Arbeitszeit: Beantwortet gemeinsam — Welche Ausgangslage haben wir heute?\nWelches Problem lösen wir mit dem Vorhaben?\nWas passiert ohne Veränderung («weiter wie bisher»)?\nWelches beste erreichbare Bild stellen wir uns in etwa 12 Monaten vor?\n\nTragt vier knappe Stichwort-Antworten auf dem Board zusammen.',
      timerSuggestionMinutes: 40,
    },
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
    remotePlaybook: {
      workFormat:
        'Kurzdurchgang Matrix-Logik, dann Arbeit in Kleingruppen mit anschliessendem Peer-Feedback (optional 2×2 Minute).',
      breakoutInvite:
        '15 Minuten: Listet erst gemeinschaftlich eure primären Stakeholder auf. Vergesst keine «stillen», aber mächtigen Gruppen (z. B. Support).\nDanach tragt ihr sie in Matrix & Felder ein. Pro «kritischem» Quadranten: eine Massnahme in einem Satz.\nNach der Zeit kurz austauschen, wer was präsentiert.',
      timerSuggestionMinutes: 50,
    },
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
    remotePlaybook: {
      workFormat:
        'Plenum zur Story-Line, dann geschlossene 30 Minuten Arbeit (Breakouts ~4–6 Personen, je nach Kultur gleiche oder gemischte Rollen).',
      breakoutInvite:
        'Ab jetzt 30 Minuten: Erarbeitet als Team «Unsere Story» nach der Struktur — Ausgangssituation • Projektbegründung • Kernbotschaft • drei Schlüsselargumente • Call-to-Action.\nNutzt gemeinsamen Texteditor oder Kartensystem. Wir hören später vier Kurz pitches à 120 Sekunden (ohne Zwischenfragen — Feedback folgt strukturiert).',
      recapPrompt:
        'Nach den Pitches zwei Runden Feedback: erst «Was wirkt bereits glaubhaft», dann höchstens zwei Verbesserungsimpulse.',
      timerSuggestionMinutes: 55,
    },
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
    remotePlaybook: {
      workFormat:
        'Straffe Pitches mit sichtbarem Countdown und anschliessendem Schnell-Schreib-Moment für Kommunikationsplan.',
      breakoutInvite:
        'Zwei Runden á 90 Sekunden Pitches aus den Kleingruppen — ich gebe Zwischenstände durch den Timer bekannt. Danach noch 15 Minuten, um drei Meilensteine × Zielgruppe × Kanal grob auszuarbeiten (Stichwortformat).',
      timerSuggestionMinutes: 35,
    },
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
    remotePlaybook: {
      workFormat:
        'Runde im Plenum: jeweils eine nächste Aktion mit Datum verbal abgeben — Moderationsduo dokumentiert simultan auf der gemeinsamen Fläche.',
      breakoutInvite:
        'Letzte Übung zusammen ohne Breakouts:\n• Jede Person nennt der Reihe nach eine konkrete nächste Aktion bis zu einem konkreten Termin oder Review.\n• Pro Person maximal 45 Sekunden — Details gehen später in Tasks.\nModeration dokumentiert direkt hier im Protokoll.',
      recapPrompt:
        'Klärt Ende offen: Protokollversand bis wann — wer folgt verschobenen Parkplatz-Themen?',
      timerSuggestionMinutes: 20,
    },
  },
];

/** Pro Phase: Liste eingebetteter SVG‑Diagramme (id siehe DIAGRAM_REGISTRY in ChangeWorkflowDiagrams.jsx). */
export const CHANGE_PHASE_DIAGRAMS = {
  orient: [
    {
      id: 'orient-flow',
      caption: 'Analog zu Präsentationsfolien für den Ablauf: vom Check‑in zur Verdichtung der nächsten Schritte.',
    },
  ],
  basics: [
    {
      id: 'emotion-curve',
      caption: 'Orientierend — kein Zeitmodell. Besprecht, wo eure Bereiche etwa stehen können.',
    },
    {
      id: 'kotter-8',
      caption: 'Gängige Ursachenliste für stockende Change‑Programme als Moderationshilfe.',
    },
  ],
  success_formula: [
    {
      id: 'pm-cm-rails',
      caption: 'Projekt‑Lieferzyklen liegen oft in Change‑Begleitung: beide Strange brauchen slots im Plan.',
    },
    {
      id: 'head-heart-hand',
      caption: 'Dreiklange aus Verstehen, Mitgehen und konkretem Tun — häufige Präsentationsgrafik zur Verquickung.',
    },
  ],
  why: [
    {
      id: 'why-layers',
      caption: 'Schichtweise Warum‑Ebenen: Organisation, Team und Einzelperson sprechen ihr eigenes Narrativ.',
    },
  ],
  stakeholders: [
    {
      id: 'stakeholder-matrix',
      caption: 'Quadrantenlogik zur Priorisierung: wen einbinden, wen informieren, wen aktivieren.',
    },
  ],
  comms: [
    {
      id: 'comms-pyramid',
      caption: 'Prinzipdiagramm: höhere Interaktionsintensität vs. höhere Reichweite.',
    },
    {
      id: 'story-arc',
      caption: 'Dramaturgie für Storytelling rund um euer Vorhaben.',
    },
  ],
  pitch_plan: [
    {
      id: 'elevator-pitch',
      caption: 'Strukturkette für sehr kurzen Vorstellungs‑ und Entscheider‑Pitch.',
    },
  ],
  wrap: [
    {
      id: 'change-lifecycle',
      caption: 'Change Arbeitspakte als Leitlinie quer durch den Projektverlauf (nicht erst „bei Go‑live«).',
    },
  ],
};
