/**
 * Prüfkatalog-Kacheln nach Kotter — Beschreibungen & Reflexionsfragen (neutral, workshoptauglich).
 * Die acht Kacheln entsprechen den typischen Ursachen stockender Veränderungsinitiativen.
 */

export const KOTTER_CATALOG_ITEMS = [
  {
    slug: 'dringlichkeit',
    order: 1,
    label: 'Dringlichkeit',
    kotterChapter: '1 · Dringlichkeit spürbar machen',
    description:
      'Ohne echte Orientierung zur Notwendigkeit bleiben energische Massnahmen im Betrieb häufig in «noch mehr zu tun» ohne Priorität oder verbindliche Entscheide stecken.',
    moderationHint:
      'Nach «Was passiert ohne Veränderung?», «Worauf drückt der Markt bzw. Regulatorik?», «Welche Daten machen das sichtbar?» fragen.',
    prompts: [
      {
        key: 'spuerbarkeit',
        question:
          'Wie spürbar ist die «echte» Dringlichkeit für Führungsteam und Betroffene — nicht nur in Folien?',
        placeholder: 'Beispiele, Signale oder Gegenargumente kurz festhalten.',
      },
      {
        key: 'momentum',
        question: 'Was nährt Zweifel an der Dringlichkeit — oder hält noch «weiter wie bisher» als Option lebendig?',
      },
      {
        key: 'hebel',
        question: 'Welcher konkrete Hebel würde Dringlichkeit in den nächsten 90 Tagen sichtbarer machen (ohne neue PowerPoint)?',
      },
    ],
  },
  {
    slug: 'fuehrungsnetz',
    order: 2,
    label: 'Führungs‑netz',
    kotterChapter: '2 · Leitende Koalition / Führungsnetzwerk',
    description:
      'Veränderung braucht glaubwürdige Multiplikatoren quer durch Funktionen und Hierarchie — keine Insellösung Projektstab vs. Organisation.',
    moderationHint:
      'Rollen wie Sponsor, Produkt-/Programmowner und Key User zusammen mit Führungs-/Fachschaft benennen; Fehltöne ohne Schuldzuweisungen benennen.',
    prompts: [
      {
        key: 'glue',
        question: 'Welche Kombination aus Entscheiding, Sachkompetenz und «Menschen, die angehört werden» fehlt euch konkret?',
      },
      {
        key: 'visibilität',
        question: 'Wo seid ihr heute mit «Sichtbarkeit & Verbindlichkeit» des Führungsnetzes zufrieden — wo klafft?',
      },
      {
        key: 'nächsten_schritte',
        question: 'Wer hätte die nächste Woche konkret aktiv mitreden können (Name/Rolle/Türöffnung)?',
      },
    ],
  },
  {
    slug: 'vision',
    order: 3,
    label: 'Vision',
    kotterChapter: '3 · Vision & strategische Botschaft',
    description:
      'Klare Bilder eines besseren Zielzustandes verbinden technische Änderungen mit dem «Warum» — sonst verschwindet Momentum beim ersten Sprint.',
    moderationHint:
      'Vision maximal knapp formulieren («in einem Satz begreift meine Mutter nicht IT, aber Orientierung») und mit messbaren Wirkungen verknüpfen.',
    prompts: [
      {
        key: 'klarheit',
        question: 'Ist bei eurer Zielstellung klar «wohin» und «warum wir» gemeint sind — ohne Jargonwand?',
      },
      {
        key: 'glue',
        question: 'Wo widersprechen operative Ziele noch der Geschichte (zum Beispiel «sparen» vs «Qualität erhöhen»)?',
      },
      {
        key: 'teilbarkeit',
        question: 'Können Schlüsselanwender diese Vision ohne Folien in eigene Worte übersetzen?',
      },
    ],
  },
  {
    slug: 'kommunikation',
    order: 4,
    label: 'Kommunikation',
    kotterChapter: '4 · Botschaften vervielfachen',
    description:
      'Einmaliges Townhall-Releases reicht kaum; Kanäle müssen zweckmässig sein und Dialogräume zulassen, sonst gilt «niemand sagt mir was» weiter.',
    moderationHint:
      '«Gehört wird» vor «informiert worden» klären: Feedbackmechanismus, Rhythmik, Eskalationswege definieren.',
    prompts: [
      {
        key: 'ressonanz',
        question: 'Was fragt ihr euch derzeit zu oft zurück, weil echte Zweifelsräume fehlen oder zu spät adressiert werden?',
      },
      {
        key: 'kanaele',
        question: 'Welche Zielgruppen hören ihr schlecht erreicht oder zu spät?',
      },
      {
        key: 'verbesserungsidee',
        question: 'Eine Kommunikationsänderung, die wenig Aufwand hätte aber grosse Orientierungswirkung:',
      },
    ],
  },
  {
    slug: 'befaehigung',
    order: 5,
    label: 'Befähigung',
    kotterChapter: '5 · Befähigung (Strukturen, Skills, Mittel)',
    description:
      'Neue Arbeit braucht Time-to-Learn — Budget für Experimente und Freiräume, sonst kippt Adoption in «Pflicht ohne Spielraum».',
    moderationHint:
      'Zwischen Schulung («wissen wir jetzt mehr») und Befähigung («können entscheiden & handeln») differenzieren.',
    prompts: [
      {
        key: 'freiräume',
        question: 'Wo blockieren Prozesse oder Genehmigungsschleifen reale Nutzer heute bereits vor Go‑live?',
      },
      {
        key: 'skills',
        question: 'Welche konkreten Fähigkeiten fehlen in welchen Segmenten?',
      },
      {
        key: 'enablement_massnahmen',
        question: 'Drei gezielte Massnahmen, die echte Arbeit entlasten würden (nicht noch ein Info-Mail):',
      },
    ],
  },
  {
    slug: 'quick-wins',
    order: 6,
    label: 'Quick Wins',
    kotterChapter: '6 · Kurzfristige Erfolge sichern und sichtbar machen',
    description:
      'Frühe Wirksamkeit erhöht Bereitschaft weiterzumachen; Quick Wins sollten legitim und ohne «Show» auf Kosten späterer Schulden sein.',
    moderationHint:
      '«Sichtbare Wirkung in <12 Wochen» vs «technisch trivial» abstimmen; Misserfolgskultur («wir haben es probiert») vermeiden.',
    prompts: [
      {
        key: 'liste',
        question: 'Welche Erfolgsbelege habt ihr in den nächsten Monaten konkret dokumentierbar (Zahlen oder Nutzerstimmen)?',
      },
      {
        key: 'risiko_quickwin',
        question: 'Wo droht Scheinbewegung (nur Zahlen ohne Nutzen) oder technische Schulden zurückzuschwingen?',
      },
      {
        key: 'nächsten_meilenstein',
        question: 'Nächste Meilenlage, die ohne übertriebene Bürokratie sichtbar wäre?',
      },
    ],
  },
  {
    slug: 'vertiefung',
    order: 7,
    label: 'Vertiefung',
    kotterChapter: '7 · Bewegungen vertiefen, nicht verkünden',
    description:
      'Nach Launch droht Projektmentalität («abgehakt»). Verankerung heisst neue Verhaltensnormen aktiv pflegen bis sie «selbstverständlich» wirken.',
    moderationHint:
      'Coaching-Spiele, iterative Roadmaps, iterative Retrospektiven kombinieren; «Change ist Produktarbeit» formulieren.',
    prompts: [
      {
        key: 'risiko_stop',
        question: 'Was würde euch im Alltag sehr schnell wieder in Altverhalten zurückwerfen wenn ihr nicht aktiv nachsteuert?',
      },
      {
        key: 'vertiefende_praktiken',
        question: 'Welche konkreten Praktiken («Rituale») hätten bleibenden Charakter ohne grossen Overhead?',
      },
      {
        key: 'verantwortung',
        question: 'Wer trägt explizite Change-Verantwortung nach «Projekt-Ende formal»?',
      },
    ],
  },
  {
    slug: 'verankerung',
    order: 8,
    label: 'Verankerung',
    kotterChapter: '8 · In Kultur & System einbetten',
    description:
      'Neue Arbeitsweise muss Budget, Steuerungsindikatoren, Rollenbeschrieb und Bewertungslogiken erreichen sonst verkümmert sie beim nächsten Reorg.',
    moderationHint:
      'HR-, Finance- und Prozesssteuerungshebel explizit nennen; «Change Budget» oder Review-Slot im Operativboard verankern.',
    prompts: [
      {
        key: 'systemkopplung',
        question: 'An welchen Steuerinstrumenten («wer wird belohnt, wer gemessen») hängt eure neue Arbeitsweise noch nicht?',
      },
      {
        key: 'widerstände strukturell',
        question: 'Wo belohnt eure Organisation unversehens noch Altverhalten (KPI-Konflikte)?',
      },
      {
        key: 'verankerungsschritt',
        question: 'Der eine strukturelle Schritt («im System sichtbar»), der echte Kraft verleihen würde:',
      },
    ],
  },
];

/** @returns {typeof KOTTER_CATALOG_ITEMS[number] | undefined} */
export function getKotterItemBySlug(slug) {
  return KOTTER_CATALOG_ITEMS.find((x) => x.slug === slug);
}

export function kotterSlugList() {
  return KOTTER_CATALOG_ITEMS.map((x) => x.slug);
}
