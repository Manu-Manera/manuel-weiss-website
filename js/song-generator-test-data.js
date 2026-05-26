/**
 * Persönlichkeits-Song Generator – statischer Test (v2.0)
 *
 * Wissenschaftliche Basis:
 *  - Big Five & Facetten: International Personality Item Pool, NEO-Repräsentationen
 *      • Johnson (2014), IPIP-NEO-120 (J Res Pers 51, 78–89)
 *      • Maples-Keller et al. (2019), IPIP-NEO-60 (J Pers Assess 101, 4–15)
 *      • Donnellan, Oswald, Baird & Lucas (2006), Mini-IPIP-20 (Psychol Assess 18)
 *    Items aus dem IPIP-Itempool (Public Domain, http://ipip.ori.org), deutsch übersetzt
 *    nach Mlačić & Ostendorf (2005, Eur J Pers 19) und eigener Anpassung. Skalen-Zuordnung
 *    folgt strikt den Original-Schlüsseln.
 *  - HEXACO Honesty-Humility: Ashton & Lee (2009), HEXACO-PI-R Short Form.
 *  - Schwartz-Werte: Schwartz (2012), Theory of Basic Values, Kurz-Items.
 *  - Bindung: Wei et al. (2007), Experiences in Close Relationships – Short Form (ECR-S).
 *  - Charakterstärken: Peterson & Seligman (2004), VIA – ausgewählte Marker.
 *
 *  WICHTIG: Die Items sind nicht das Originalinventar, sondern sinngleiche Re-Formulierungen
 *  aus dem öffentlichen IPIP-Pool. Sie reproduzieren die Konstrukte, sind aber nicht zu
 *  klinischer Diagnostik geeignet – das ist hier auch nicht das Ziel (Songgenerator).
 *
 * Skala: 7-stufig Likert (1 = stimmt überhaupt nicht … 7 = stimmt voll und ganz).
 * Drei Varianten: short (20), medium (40), long (74).
 */

(function () {
  'use strict';

  const TEST_VERSION = '2.0-static';

  const SCALE_LABELS = {
    BIG5_O: 'Offenheit',
    BIG5_C: 'Gewissenhaftigkeit',
    BIG5_E: 'Extraversion',
    BIG5_A: 'Verträglichkeit',
    BIG5_N: 'Neurotizismus',
    HEX_H:  'Ehrlichkeit-Demut',
    VAL_SD: 'Selbstbestimmung',
    VAL_BE: 'Wohlwollen',
    VAL_AC: 'Leistung',
    VAL_ST: 'Stimulation',
    ATT_SEC: 'Bindungssicherheit',
    ATT_ANX: 'Bindungsangst',
    ATT_AVO: 'Bindungsvermeidung',
    VIA:    'Charakterstärke'
  };

  // Facetten (NEO-PI-R Nomenklatur): 6 pro Domäne. Werden gleich gemittelt
  // und Domäne-Score zusätzlich aus den Facetten berechnet (Gold-Standard).
  const FACET_LABELS = {
    O1: 'Phantasie', O2: 'Ästhetik', O3: 'Gefühle', O4: 'Handlungen', O5: 'Ideen', O6: 'Werte',
    C1: 'Kompetenz', C2: 'Ordnungsliebe', C3: 'Pflichtbewusstsein', C4: 'Leistungsstreben', C5: 'Selbstdisziplin', C6: 'Besonnenheit',
    E1: 'Herzlichkeit', E2: 'Geselligkeit', E3: 'Durchsetzungsfähigkeit', E4: 'Aktivität', E5: 'Erlebnishunger', E6: 'Positive Emotionen',
    A1: 'Vertrauen', A2: 'Freimütigkeit', A3: 'Altruismus', A4: 'Entgegenkommen', A5: 'Bescheidenheit', A6: 'Empfindsamkeit',
    N1: 'Ängstlichkeit', N2: 'Reizbarkeit', N3: 'Depressivität', N4: 'Soziale Befangenheit', N5: 'Impulsivität', N6: 'Verletzlichkeit'
  };

  // Mapping Facette → Domäne
  const FACET_TO_DOMAIN = {};
  Object.keys(FACET_LABELS).forEach(f => {
    FACET_TO_DOMAIN[f] = 'BIG5_' + f[0]; // O1..O6 → BIG5_O usw.
  });

  // ────────────────────────────────────────────────────────────
  // Master-Itemset (74 Items, deutsch)
  //
  // Spalten:
  //  id, phase, flavor_intro, stem, construct (Skala), facet (optional),
  //  reverse, klang_hint, tier ('short'|'medium'|'long')
  //   short  ⊂ medium ⊂ long
  // ────────────────────────────────────────────────────────────
  const ITEMS = [
    // ═══════════════ PHASE 1 „Resonanz" – Erste Begegnung ═══════════════
    { id:'O1a', phase:'P1', tier:'short', construct:'BIG5_O', facet:'O1', reverse:false,
      flavor_intro:'Ein leeres Notizbuch liegt vor dir.',
      stem:'Ich habe eine lebhafte Vorstellungskraft.',
      klang_hint:'Hohe Phantasie → Klangfarben, ungewöhnliche Modi.' },
    { id:'O2a', phase:'P1', tier:'short', construct:'BIG5_O', facet:'O2', reverse:false,
      flavor_intro:'Ein Museum oder ein Konzert?',
      stem:'Kunst, Musik oder Poesie berühren mich tief.',
      klang_hint:'Ästhetik → Streicher, Pads, ornamentale Layer.' },
    { id:'E1a', phase:'P1', tier:'short', construct:'BIG5_E', facet:'E2', reverse:false,
      flavor_intro:'Stell dir einen vollen Raum vor.',
      stem:'Ich bin in Gesellschaft anderer schnell der Mittelpunkt der Aufmerksamkeit.',
      klang_hint:'Geselligkeit → mehr Tempo, helle Instrumente.' },
    { id:'E2a', phase:'P1', tier:'short', construct:'BIG5_E', facet:'E1', reverse:false,
      flavor_intro:'Eine Begegnung mit jemand Neuem.',
      stem:'Ich gehe warm und offen auf andere zu.',
      klang_hint:'Herzlichkeit → weiche Anschläge, doppelte Stimm-Layer.' },
    { id:'E3a', phase:'P1', tier:'long', construct:'BIG5_E', facet:'E2', reverse:true,
      flavor_intro:'Ein Sonntag ohne Plan.',
      stem:'Ich halte mich lieber im Hintergrund.',
      klang_hint:'Eher introvertiert → intimere Klangbilder.' },
    { id:'O3a', phase:'P1', tier:'medium', construct:'BIG5_O', facet:'O5', reverse:true,
      flavor_intro:'Eine philosophische Diskussion zieht sich in die Länge.',
      stem:'Abstrakte Ideen interessieren mich nicht besonders.',
      klang_hint:'Niedrige Offenheit für Ideen → eingängige Hooks, Dur/Moll-Welt.' },
    { id:'E4a', phase:'P1', tier:'long', construct:'BIG5_E', facet:'E5', reverse:false,
      flavor_intro:'Ein spontanes Abenteuer steht im Raum.',
      stem:'Ich suche aktiv nach neuen, aufregenden Erfahrungen.',
      klang_hint:'Erlebnishunger → Risiko-Akkorde, ungewöhnliche Wechsel.' },
    { id:'O4a', phase:'P1', tier:'long', construct:'BIG5_O', facet:'O4', reverse:false,
      flavor_intro:'Eine andere Route nach Hause als sonst.',
      stem:'Ich probiere gerne neue Dinge aus.',
      klang_hint:'Offenheit für Handlungen → Wechsel der Sounds zwischen Sektionen.' },
    { id:'E5a', phase:'P1', tier:'medium', construct:'BIG5_E', facet:'E6', reverse:false,
      flavor_intro:'Wenn eine kleine Sache am Tag dich freut.',
      stem:'Ich erlebe häufig Freude und Begeisterung.',
      klang_hint:'Positive Emotionen → Major-Tendenz, Lift in den Refrains.' },
    { id:'O5a', phase:'P1', tier:'long', construct:'BIG5_O', facet:'O3', reverse:false,
      flavor_intro:'Wenn dich ein Lied tief trifft.',
      stem:'Ich nehme meine eigenen Gefühle stark wahr.',
      klang_hint:'Offenheit für Gefühle → Crescendi, dynamische Spannweite.' },

    // ═══════════════ PHASE 2 „Struktur" – Werte & Disziplin ═══════════════
    { id:'C1a', phase:'P2', tier:'short', construct:'BIG5_C', facet:'C5', reverse:false,
      flavor_intro:'Eine Liste am Sonntagabend.',
      stem:'Ich erledige meine Aufgaben sofort und sorgfältig.',
      klang_hint:'Selbstdisziplin → klare Strukturen, präzises Timing.' },
    { id:'C2a', phase:'P2', tier:'short', construct:'BIG5_C', facet:'C2', reverse:false,
      flavor_intro:'Dein Schreibtisch zum Wochenstart.',
      stem:'Ich liebe Ordnung und ein klares System.',
      klang_hint:'Ordnungsliebe → klare Form, saubere Mischung.' },
    { id:'C3a', phase:'P2', tier:'long', construct:'BIG5_C', facet:'C1', reverse:false,
      flavor_intro:'Eine Aufgabe, die du nie zuvor gemacht hast.',
      stem:'Ich vertraue darauf, dass ich Aufgaben gut bewältigen kann.',
      klang_hint:'Kompetenz-Selbstwirksamkeit → klare Hooks, stabile Form.' },
    { id:'C4a', phase:'P2', tier:'medium', construct:'BIG5_C', facet:'C4', reverse:false,
      flavor_intro:'Wenn du dir ein Ziel setzt.',
      stem:'Ich verfolge meine Ziele beharrlich, bis sie erreicht sind.',
      klang_hint:'Leistungsstreben → drängende Rhythmen, klare Auflösungen.' },
    { id:'C5a', phase:'P2', tier:'long', construct:'BIG5_C', facet:'C3', reverse:false,
      flavor_intro:'Ein Versprechen, das du gegeben hast.',
      stem:'Ich halte mich an meine Verpflichtungen, auch wenn es unangenehm ist.',
      klang_hint:'Pflichtbewusstsein → klares Songfundament.' },
    { id:'C6a', phase:'P2', tier:'long', construct:'BIG5_C', facet:'C6', reverse:false,
      flavor_intro:'Eine schnelle Entscheidung im Affekt.',
      stem:'Ich denke gründlich nach, bevor ich handle.',
      klang_hint:'Besonnenheit → weniger Tempo-Spitzen, gezielte Builds.' },

    { id:'H1a', phase:'P2', tier:'short', construct:'HEX_H', reverse:false,
      flavor_intro:'Eine Quittung, die niemand prüft.',
      stem:'Ich würde keinem Geld wegnehmen, selbst wenn ich sicher wäre, niemals erwischt zu werden.',
      klang_hint:'Ehrlichkeit-Demut → akustische Instrumente, transparente Produktion.' },
    { id:'H2a', phase:'P2', tier:'medium', construct:'HEX_H', reverse:true,
      flavor_intro:'Ein Job-Angebot mit fragwürdigen Methoden.',
      stem:'Ich würde manchmal lügen, wenn es mir einen Vorteil verschafft.',
      klang_hint:'Niedrige H → mehr Distortion, schmutzigere Texturen.' },
    { id:'H3a', phase:'P2', tier:'long', construct:'HEX_H', reverse:true,
      flavor_intro:'Ein Foto mit Filter, das viral gehen könnte.',
      stem:'Es ist mir wichtig, dass andere mich für etwas Besonderes halten.',
      klang_hint:'Hohe Modesty → schlichtere Hooks, kein Bombast.' },
    { id:'H4a', phase:'P2', tier:'long', construct:'HEX_H', reverse:false,
      flavor_intro:'Wenn du einen Vorteil erkennst, den andere nicht sehen.',
      stem:'Ich nutze die Schwächen anderer Menschen nicht aus.',
      klang_hint:'Fairness → klare, ehrliche Linienführung.' },

    { id:'VSD', phase:'P2', tier:'short', construct:'VAL_SD', reverse:false,
      flavor_intro:'Wenn niemand zuschaut.',
      stem:'Es ist mir wichtig, eigene Entscheidungen zu treffen und meinen Weg selbst zu wählen.',
      klang_hint:'Selbstbestimmung → eigenständige Solo-Lines, weniger Schema.' },
    { id:'VBE', phase:'P2', tier:'short', construct:'VAL_BE', reverse:false,
      flavor_intro:'Ein Freund braucht spät nachts Hilfe.',
      stem:'Sich um das Wohl anderer Menschen zu kümmern, ist mir wichtig.',
      klang_hint:'Wohlwollen → wärmere Frequenzen, Choir-Pads.' },
    { id:'VAC', phase:'P2', tier:'medium', construct:'VAL_AC', reverse:false,
      flavor_intro:'Eine Bühne mit deinem Namen drauf.',
      stem:'Erfolg zu haben und anerkannt zu werden, ist mir wichtig.',
      klang_hint:'Leistung → kraftvolle Hooks, klare Climax.' },
    { id:'VST', phase:'P2', tier:'medium', construct:'VAL_ST', reverse:false,
      flavor_intro:'Eine Tür, die ins Unbekannte führt.',
      stem:'Ein abwechslungsreiches Leben voller Reize und Überraschungen ist mir wichtig.',
      klang_hint:'Stimulation → schnelle Wechsel, Modulationen.' },

    { id:'A1a', phase:'P2', tier:'short', construct:'BIG5_A', facet:'A3', reverse:false,
      flavor_intro:'Eine fremde Person bittet um etwas.',
      stem:'Ich habe ein gutes Gespür für die Gefühle anderer.',
      klang_hint:'Altruismus → weichere Drums, weniger Grit.' },
    { id:'A2a', phase:'P2', tier:'long', construct:'BIG5_A', facet:'A1', reverse:false,
      flavor_intro:'Wenn jemand dir etwas erzählt, das ungewöhnlich klingt.',
      stem:'Ich glaube grundsätzlich an die guten Absichten anderer.',
      klang_hint:'Vertrauen → offene Voicings.' },
    { id:'A3a', phase:'P2', tier:'long', construct:'BIG5_A', facet:'A4', reverse:false,
      flavor_intro:'In einem hitzigen Gespräch.',
      stem:'Ich gebe lieber nach, als einen Streit weiterzuführen.',
      klang_hint:'Entgegenkommen → weiche Übergänge.' },

    // ═══════════════ PHASE 3 „Schatten" – Neurotizismus, Bindung ═══════════════
    { id:'N1a', phase:'P3', tier:'short', construct:'BIG5_N', facet:'N1', reverse:false,
      flavor_intro:'Ein unerwarteter Anruf.',
      stem:'Ich werde leicht aufgewühlt oder nervös.',
      klang_hint:'Ängstlichkeit → rauhere Texturen, kürzere Phrasen.' },
    { id:'N2a', phase:'P3', tier:'short', construct:'BIG5_N', facet:'N3', reverse:false,
      flavor_intro:'Wenn etwas nicht so läuft wie geplant.',
      stem:'Ich bin häufig traurig oder niedergeschlagen.',
      klang_hint:'Depressivität → melancholische Modi, langsamere Tempi.' },
    { id:'N3a', phase:'P3', tier:'short', construct:'BIG5_N', facet:'N6', reverse:true,
      flavor_intro:'Stress am Limit.',
      stem:'Ich bleibe meistens ruhig und ausgeglichen.',
      klang_hint:'Resilienz → fließende Linien, klare Auflösungen.' },
    { id:'N4a', phase:'P3', tier:'medium', construct:'BIG5_N', facet:'N2', reverse:false,
      flavor_intro:'Wenn dich etwas wirklich ärgert.',
      stem:'Ich gerate schnell in Wut oder Frustration.',
      klang_hint:'Reizbarkeit → kantige Akkordwechsel, Distortion.' },
    { id:'N5a', phase:'P3', tier:'long', construct:'BIG5_N', facet:'N4', reverse:false,
      flavor_intro:'Vor einer fremden Gruppe sprechen.',
      stem:'Ich fühle mich in Gesellschaft anderer leicht unsicher.',
      klang_hint:'Soziale Befangenheit → zurückhaltendere Stimm-Delivery.' },
    { id:'N6a', phase:'P3', tier:'long', construct:'BIG5_N', facet:'N5', reverse:false,
      flavor_intro:'Ein Impuls, dem du nachgegeben hast.',
      stem:'Es fällt mir schwer, meinen Impulsen zu widerstehen.',
      klang_hint:'Impulsivität → asymmetrische Phrasen.' },
    { id:'N7a', phase:'P3', tier:'medium', construct:'BIG5_N', facet:'N6', reverse:false,
      flavor_intro:'Wenn du an die letzte schwierige Woche denkst.',
      stem:'Meine Stimmung wechselt häufig und schnell.',
      klang_hint:'Verletzlichkeit → Tempo- und Dynamikschwankungen.' },

    { id:'AT1', phase:'P3', tier:'short', construct:'ATT_SEC', reverse:false,
      flavor_intro:'Wenn jemand dir wirklich nahe kommt.',
      stem:'Ich kann mich anderen Menschen leicht öffnen und ihnen vertrauen.',
      klang_hint:'Bindungssicherheit → Open-Voicings, weicher Hall.' },
    { id:'AT2', phase:'P3', tier:'short', construct:'ATT_ANX', reverse:false,
      flavor_intro:'Vor dem Einschlafen, ehrlich.',
      stem:'Ich habe Angst, verlassen oder zurückgewiesen zu werden.',
      klang_hint:'Bindungsangst → längere Releases, melancholische Pads.' },
    { id:'AT3', phase:'P3', tier:'medium', construct:'ATT_AVO', reverse:false,
      flavor_intro:'Wenn jemand emotional näher rückt.',
      stem:'Ich fühle mich unwohl, wenn Beziehungen zu eng werden.',
      klang_hint:'Bindungsvermeidung → mehr Distanz im Mix, kühlere Reverbs.' },
    { id:'AT4', phase:'P3', tier:'long', construct:'ATT_SEC', reverse:false,
      flavor_intro:'Eine Erinnerung, die dich getragen hat.',
      stem:'Es gibt Menschen in meinem Leben, mit denen ich tief verbunden bin.',
      klang_hint:'Sicherheit → Wärme im Mid-Bass.' },
    { id:'AT5', phase:'P3', tier:'long', construct:'ATT_ANX', reverse:true,
      flavor_intro:'Wenn dein/e Partner/in einmal nicht antwortet.',
      stem:'Ich kann auch mit Unsicherheit in Beziehungen gut umgehen.',
      klang_hint:'Geringe Bindungsangst → klarere Auflösungen.' },

    // ═══════════════ PHASE 4 „Tiefe" – Facetten-Vertiefung ═══════════════
    { id:'O6a', phase:'P4', tier:'long', construct:'BIG5_O', facet:'O6', reverse:false,
      flavor_intro:'Eine Tradition, die du hinterfragt hast.',
      stem:'Ich überprüfe gesellschaftliche Regeln auch dann, wenn andere sie selbstverständlich nehmen.',
      klang_hint:'Offene Werte → Modulationen, Genre-Mix.' },
    { id:'A4a', phase:'P4', tier:'long', construct:'BIG5_A', facet:'A5', reverse:false,
      flavor_intro:'Wenn du etwas gut gemacht hast.',
      stem:'Ich rede nicht groß über meine eigenen Erfolge.',
      klang_hint:'Bescheidenheit → schlichtere Voicings.' },
    { id:'A5a', phase:'P4', tier:'medium', construct:'BIG5_A', facet:'A6', reverse:false,
      flavor_intro:'Ein Mensch in Schwierigkeiten, den du nicht kennst.',
      stem:'Das Leid anderer Menschen rührt mich.',
      klang_hint:'Empfindsamkeit → emotionale Höhepunkte, Streicher.' },
    { id:'E6a', phase:'P4', tier:'long', construct:'BIG5_E', facet:'E3', reverse:false,
      flavor_intro:'Wenn eine Gruppe Orientierung braucht.',
      stem:'Ich übernehme von Natur aus die Führung in einer Gruppe.',
      klang_hint:'Durchsetzung → klare Lead-Stimme, präsenter Mix.' },
    { id:'E7a', phase:'P4', tier:'long', construct:'BIG5_E', facet:'E4', reverse:false,
      flavor_intro:'Dein Wochentag von außen betrachtet.',
      stem:'Mein Leben ist voll und schnell, mit wenig Leerlauf.',
      klang_hint:'Aktivität → höhere Note-Dichte, Drive.' },
    { id:'C7a', phase:'P4', tier:'long', construct:'BIG5_C', facet:'C5', reverse:true,
      flavor_intro:'Eine Sache, die du vor dir herschiebst.',
      stem:'Ich schiebe Dinge oft länger auf, als ich sollte.',
      klang_hint:'Geringe Selbstdisziplin → unkonventionelle Form, freier Aufbau.' },
    { id:'N8a', phase:'P4', tier:'long', construct:'BIG5_N', facet:'N1', reverse:true,
      flavor_intro:'Vor einer wichtigen Entscheidung.',
      stem:'Ich bleibe auch in unsicheren Lagen relativ gelassen.',
      klang_hint:'Geringe Ängstlichkeit → klarere Hooks.' },

    // ═══════════════ PHASE 5 „Vision" – Stärken, Sinn ═══════════════
    { id:'V1', phase:'P5', tier:'short', construct:'VIA', reverse:false,
      flavor_intro:'Wenn du an deine Talente denkst.',
      stem:'Ich habe Mut, für das einzustehen, was mir wichtig ist.',
      klang_hint:'VIA-Mut → kraftvolle Akkorde, klare Linien.' },
    { id:'V2', phase:'P5', tier:'medium', construct:'VIA', reverse:false,
      flavor_intro:'Eine neue Sache fasziniert dich.',
      stem:'Ich entdecke immer wieder Neues, das mich begeistert.',
      klang_hint:'Neugier → mehr Klangfarbenwechsel.' },
    { id:'V3', phase:'P5', tier:'medium', construct:'VIA', reverse:false,
      flavor_intro:'Wenn jemand dich um Rat fragt.',
      stem:'Ich begegne anderen mit Geduld und Freundlichkeit.',
      klang_hint:'Güte → weichere Dynamik, weniger Kompression.' },
    { id:'V4', phase:'P5', tier:'long', construct:'VIA', reverse:false,
      flavor_intro:'Dein größter Wunsch dieses Jahr.',
      stem:'Ich strebe nach persönlichem Wachstum und Sinn.',
      klang_hint:'Sinnstreben → Bridge mit moduliertem Höhepunkt.' },
    { id:'V5', phase:'P5', tier:'long', construct:'VIA', reverse:false,
      flavor_intro:'Eine Sache, für die du dankbar bist.',
      stem:'Ich nehme das Gute in meinem Leben bewusst wahr.',
      klang_hint:'Dankbarkeit → tragende Pads, Wärme.' },
    { id:'V6', phase:'P5', tier:'long', construct:'VIA', reverse:false,
      flavor_intro:'Wenn etwas schwer war.',
      stem:'Ich gebe nicht auf, auch wenn etwas anstrengend wird.',
      klang_hint:'Beharrlichkeit → durchgehender Bass-Puls.' },

    // ═══════════════ Reserve / Lang-Variante: weitere Facetten ═══════════════
    { id:'O7', phase:'P4', tier:'long', construct:'BIG5_O', facet:'O1', reverse:true,
      flavor_intro:'Wenn andere von ihren Tagträumen erzählen.',
      stem:'Ich verbringe wenig Zeit mit Tagträumen oder Phantasien.',
      klang_hint:'Niedrige Phantasie → reduzierte Klangbilder.' },
    { id:'O8', phase:'P4', tier:'long', construct:'BIG5_O', facet:'O5', reverse:false,
      flavor_intro:'Eine knifflige Frage, ohne klare Antwort.',
      stem:'Ich beschäftige mich gern mit komplexen Ideen und Theorien.',
      klang_hint:'Ideen-Offenheit → komplexere Harmonik.' },
    { id:'C8', phase:'P4', tier:'long', construct:'BIG5_C', facet:'C2', reverse:true,
      flavor_intro:'Ein Wohnzimmer Mitte der Woche.',
      stem:'Mein Umfeld wirkt eher chaotisch als ordentlich.',
      klang_hint:'Geringe Ordnungsliebe → freieres Arrangement.' },
    { id:'A6', phase:'P4', tier:'long', construct:'BIG5_A', facet:'A2', reverse:true,
      flavor_intro:'Wenn etwas unangenehm ehrlich gesagt werden müsste.',
      stem:'Ich nutze in Gesprächen manchmal kleine Tricks, um Dinge zu erreichen.',
      klang_hint:'Niedrige Freimütigkeit → mehr Subtext im Klang.' },
    { id:'E8', phase:'P4', tier:'long', construct:'BIG5_E', facet:'E1', reverse:true,
      flavor_intro:'Ein Treffen mit vielen Bekannten.',
      stem:'Es kostet mich Anstrengung, herzlich auf andere zuzugehen.',
      klang_hint:'Reserviertheit → kühlere Mid-Range.' },

    { id:'VAC2', phase:'P4', tier:'long', construct:'VAL_AC', reverse:true,
      flavor_intro:'Wenn keiner deine Leistung sieht.',
      stem:'Es ist mir egal, ob andere meine Erfolge anerkennen.',
      klang_hint:'Geringe Leistungsorientierung → ruhigere Builds.' },
    { id:'VST2', phase:'P4', tier:'long', construct:'VAL_ST', reverse:true,
      flavor_intro:'Wenn der Tag genau planbar ist.',
      stem:'Ich bevorzuge ruhige, vorhersehbare Lebensumstände.',
      klang_hint:'Geringe Stimulation → konstanter Puls.' },
    { id:'V7', phase:'P5', tier:'long', construct:'VIA', reverse:false,
      flavor_intro:'Ein guter Moment im Alltag.',
      stem:'Ich kann mich an kleinen Dingen freuen.',
      klang_hint:'Lebensfreude → Major-Hooks, Lifts.' },
    { id:'V8', phase:'P5', tier:'long', construct:'VIA', reverse:false,
      flavor_intro:'Wenn du mit anderen zusammenarbeitest.',
      stem:'Ich kann gut zusammenarbeiten und Teil eines Teams sein.',
      klang_hint:'Teamwork → Call-and-Response zwischen Stimmen.' },
    { id:'AT6', phase:'P3', tier:'long', construct:'ATT_AVO', reverse:true,
      flavor_intro:'Wenn jemand dir Hilfe anbietet.',
      stem:'Ich kann Hilfe von anderen annehmen, ohne mich unwohl zu fühlen.',
      klang_hint:'Geringe Vermeidung → wärmerer Mix.' }
  ];

  // Phasen-Metadaten
  const PHASE_META = {
    P1: { id:'P1', title:'Resonanz',
          intro:'Erste Begegnung. Wie kommst du in Verbindung mit der Welt?' },
    P2: { id:'P2', title:'Struktur',
          intro:'Was hält dich zusammen? Werte, Disziplin, Haltung.' },
    P3: { id:'P3', title:'Schatten',
          intro:'Was liegt unter der Oberfläche? Wahrhaftigkeit über Komfort.' },
    P4: { id:'P4', title:'Tiefe',
          intro:'Feine Schattierungen deiner Persönlichkeit.' },
    P5: { id:'P5', title:'Vision',
          intro:'Wohin willst du? Was trägt dich?' }
  };

  // ────────────────────────────────────────────────────────────
  // Test-Varianten
  // ────────────────────────────────────────────────────────────
  const VARIANTS = {
    short:  { key:'short',  label:'Kurz',   minutes:'4–6 Min',   itemCount: ITEMS.filter(i => i.tier === 'short').length,
              description:'Big-Five-Basis, Bindung, ein Wertekern. Schneller Einstieg.' },
    medium: { key:'medium', label:'Mittel', minutes:'7–9 Min',
              itemCount: ITEMS.filter(i => i.tier !== 'long').length,
              description:'Erweiterte Facetten, mehr Differenzierung.' },
    long:   { key:'long',   label:'Lang',   minutes:'12–15 Min', itemCount: ITEMS.length,
              description:'Volle 30 Facetten + HEXACO-H + Schwartz + Bindung + VIA – tiefster Song.' }
  };

  function getStaticTest(variantKey) {
    const v = VARIANTS[variantKey] || VARIANTS.medium;
    const allow = v.key === 'short' ? ['short']
              : v.key === 'medium' ? ['short','medium']
              : ['short','medium','long'];

    const phases = {};
    Object.keys(PHASE_META).forEach(pid => {
      phases[pid] = Object.assign({ items: [] }, PHASE_META[pid]);
    });

    ITEMS.forEach(it => {
      if (allow.indexOf(it.tier) === -1) return;
      phases[it.phase].items.push({
        id: it.id, format:'likert7',
        flavor_intro: it.flavor_intro,
        stem: it.stem,
        reverse: !!it.reverse,
        construct: it.construct,
        facet: it.facet || null,
        klang_hint: it.klang_hint
      });
    });

    return {
      version: TEST_VERSION,
      lang: 'de',
      variant: v.key,
      variantLabel: v.label,
      variantMinutes: v.minutes,
      phases: Object.values(phases).filter(ph => ph.items.length > 0),
      scales: Object.keys(SCALE_LABELS).map(k => ({ key:k, label:SCALE_LABELS[k] })),
      facets: Object.keys(FACET_LABELS).map(k => ({ key:k, label:FACET_LABELS[k], domain:FACET_TO_DOMAIN[k] })),
      itemCount: Object.values(phases).reduce((n, ph) => n + ph.items.length, 0)
    };
  }

  // ────────────────────────────────────────────────────────────
  // Skoring – Skalenwerte 0..100 + Facetten-Scores (Gold-Standard)
  // ────────────────────────────────────────────────────────────
  function computeScores(answers, variantKey) {
    const v = VARIANTS[variantKey] || VARIANTS.medium;
    const allow = v.key === 'short' ? ['short']
              : v.key === 'medium' ? ['short','medium']
              : ['short','medium','long'];

    const constructSums = {}, constructCounts = {};
    const facetSums = {}, facetCounts = {};

    ITEMS.forEach(it => {
      if (allow.indexOf(it.tier) === -1) return;
      const a = answers[it.id];
      if (typeof a !== 'number') return;
      let v01 = a / 6; if (it.reverse) v01 = 1 - v01;

      constructSums[it.construct] = (constructSums[it.construct] || 0) + v01;
      constructCounts[it.construct] = (constructCounts[it.construct] || 0) + 1;

      if (it.facet) {
        facetSums[it.facet] = (facetSums[it.facet] || 0) + v01;
        facetCounts[it.facet] = (facetCounts[it.facet] || 0) + 1;
      }
    });

    const scales = {}, facets = {};
    Object.keys(constructSums).forEach(k => {
      scales[k] = Math.round((constructSums[k] / constructCounts[k]) * 100);
    });
    Object.keys(facetSums).forEach(f => {
      facets[f] = Math.round((facetSums[f] / facetCounts[f]) * 100);
    });

    // Defaults für nicht abgedeckte Skalen
    Object.keys(SCALE_LABELS).forEach(k => { if (!(k in scales)) scales[k] = 50; });

    return { scales, facets };
  }

  // ────────────────────────────────────────────────────────────
  // Music-DNA aus Persönlichkeit (deterministisch)
  // ────────────────────────────────────────────────────────────
  function computeMusicDNA(scales, facets) {
    facets = facets || {};
    const O = scales.BIG5_O || 50, C = scales.BIG5_C || 50, E = scales.BIG5_E || 50,
          A = scales.BIG5_A || 50, N = scales.BIG5_N || 50, H = scales.HEX_H || 50,
          SEC = scales.ATT_SEC || 50;

    const keyPool = ['C', 'D', 'E', 'F', 'G', 'A'];
    const keyIdx = Math.round(((O + E) / 2) / 100 * (keyPool.length - 1));
    const key = keyPool[Math.max(0, Math.min(keyPool.length-1, keyIdx))];

    let mode;
    if (N >= 65) mode = 'aeolian';
    else if (SEC <= 35) mode = 'aeolian';
    else if (O >= 70 && N < 50) mode = 'lydian';
    else if (O >= 60) mode = 'dorian';
    else if (E >= 65) mode = 'mixolydian';
    else mode = 'ionian';

    const energyProxy = (E + (100 - N)) / 2;
    const tempo = Math.round(70 + energyProxy * 0.48);
    const tempoLock = [Math.max(60, tempo - 6), Math.min(160, tempo + 6)];

    const timeSig = (O >= 80 && N < 40) ? '6/8' : (O >= 75 ? '3/4' : '4/4');

    const energy = clamp01((E * 0.5 + (100 - N) * 0.3 + O * 0.2) / 100);
    const brightness = clamp01((E * 0.4 + O * 0.4 + (100 - N) * 0.2) / 100);
    const density = clamp01((O * 0.5 + C * 0.3 + E * 0.2) / 100);
    const warmth = clamp01((A * 0.5 + H * 0.3 + SEC * 0.2) / 100);
    const grit = clamp01(((100 - H) * 0.5 + N * 0.3 + (100 - A) * 0.2) / 100);

    const core = [], color = [], rhythm = [], avoid = [];

    const akustisch = warmth >= 0.55 || H >= 60;
    if (akustisch) {
      core.push('felt_piano', 'acoustic_guitar');
      if (warmth >= 0.65) color.push('strings_quartet');
      if (A >= 60) color.push('choir');
      avoid.push('808', 'trap_hats');
    } else {
      core.push('analog_keys', 'synth_bass');
      color.push('granular_pad');
      if (E >= 60) color.push('analog_lead');
      avoid.push('felt_piano');
    }

    if (A >= 55) core.push('upright_bass'); else core.push('sub_bass');

    if (C >= 65) rhythm.push('drum_kit_studio');
    else if (E >= 65) rhythm.push('drum_kit_jazz');
    else rhythm.push('shaker', 'hand_drums');

    // Facetten-Feinheiten
    if (facets.O2 >= 70) color.push('felt_strings');
    if (facets.E5 >= 70) color.push('arp_synth');
    if (facets.N3 >= 65) color.push('rhodes_warm');
    if (facets.C2 >= 70) rhythm.push('metronomic_click_soft');

    let vocalDelivery = 'sung';
    if (N >= 65) vocalDelivery = 'breathy';
    else if (E >= 70) vocalDelivery = 'belted';
    else if (O >= 70 && SEC < 50) vocalDelivery = 'whispered';
    const vocalRegister = E >= 60 ? 'mid' : (N >= 60 ? 'low' : 'mid');
    const vocalFx = ['reverb_hall'];
    if (N >= 60) vocalFx.push('tape_sat');
    if (O >= 70) vocalFx.push('slap_delay');

    const tonalityLock = mode === 'aeolian'
      ? ['i', 'iv', 'v', 'VI', 'VII', 'III']
      : mode === 'lydian'
        ? ['I', 'II', 'iii', 'IV', 'V', 'vi']
        : mode === 'dorian'
          ? ['i', 'ii', 'III', 'IV', 'v', 'VII']
          : mode === 'mixolydian'
            ? ['I', 'ii', 'iii', 'IV', 'v', 'VII']
            : ['I', 'ii', 'iii', 'IV', 'V', 'vi'];

    const structure = energy >= 0.65
      ? 'INTRO-VERSE-PRECHORUS-CHORUS-VERSE-CHORUS-BRIDGE-CHORUS-OUTRO'
      : 'INTRO-VERSE-CHORUS-VERSE-CHORUS-BRIDGE-CHORUS-OUTRO';

    return {
      key, mode,
      tempo_bpm: tempo, tempo_lock: tempoLock,
      time_signature: timeSig, tonality_lock: tonalityLock,
      energy: round2(energy), brightness: round2(brightness),
      density: round2(density), warmth: round2(warmth), grit: round2(grit),
      instrumentation: { core, color, rhythm, avoid },
      vocal: { register: vocalRegister, delivery: vocalDelivery, fx: vocalFx },
      structure
    };
  }

  // ────────────────────────────────────────────────────────────
  // Archetyp aus dominanten Skalen + Top-Facetten
  // ────────────────────────────────────────────────────────────
  function computeArchetype(scales, facets) {
    facets = facets || {};
    const O = scales.BIG5_O, C = scales.BIG5_C, E = scales.BIG5_E,
          A = scales.BIG5_A, N = scales.BIG5_N, H = scales.HEX_H,
          SEC = scales.ATT_SEC;

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

  function topFacets(facets, n) {
    n = n || 5;
    return Object.keys(facets)
      .map(f => ({ key:f, label:FACET_LABELS[f], value:facets[f] }))
      .sort((a,b) => b.value - a.value)
      .slice(0, n);
  }

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function round2(x) { return Math.round(x * 100) / 100; }

  window.SongTestData = {
    getStaticTest,
    computeScores,
    computeMusicDNA,
    computeArchetype,
    topFacets,
    VARIANTS,
    SCALE_LABELS,
    FACET_LABELS,
    FACET_TO_DOMAIN,
    TEST_VERSION,
    TOTAL_ITEMS: ITEMS.length
  };
})();
