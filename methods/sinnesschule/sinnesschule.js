/* =========================================================
   Die Schule der Sinne
   Ein lebenslanger Meisterschaftsweg zur Schulung der Sinne.

   - Graduierung ohne sichtbares Limit: superlineare XP-Kurve,
     jede Stufe kostet spürbar mehr (battle-fähig fürs ganze Leben).
   - Aufstieg ist an Prüfungen gekoppelt ("Tür" zur nächsten Stufe).
   - Anonyme Arena: Vergleich der "Schärfe" unter Pseudonym.

   Persistenz: window.workflowAPI (DynamoDB) + localStorage-Fallback.
   Rangliste: /snowflake-highscores?game=sinnesschule (anonym).
   ========================================================= */

const SS_METHOD = 'sinnesschule';

/* ---------------- Graduierungs-System (→ ∞) ---------------- */
const SS_TITLES = [
    'Erwachen', 'Aufmerksamkeit', 'Unterscheidung', 'Schärfe', 'Feinheit',
    'Tiefe', 'Präsenz', 'Klarheit', 'Meisterschaft', 'Vollendung',
    'Großmeister', 'Hüter der Sinne', 'Seher', 'Lauschender', 'Spürender',
    'Wahrer Kenner', 'Erleuchteter Sinn', 'Wandler der Wahrnehmung', 'Zeitloser', 'Vollkommener'
];

// XP, um von Stufe g zur Stufe g+1 zu gelangen – wächst superlinear.
function SS_gap(g) { return Math.round(120 * Math.pow(g, 1.45)); }

// Kumulierte XP, um Stufe g überhaupt zu erreichen (g>=1 → 0 bei g=1).
const _ssTcache = [0, 0];
function SS_T(g) {
    if (g < 1) return 0;
    for (let k = _ssTcache.length; k <= g; k++) _ssTcache[k] = _ssTcache[k - 1] + SS_gap(k - 1);
    return _ssTcache[g];
}
function SS_gradeFromXP(xp) {
    let g = 1;
    while (g < 2000 && xp >= SS_T(g + 1)) g++;
    return g;
}
function SS_roman(n) {
    if (n <= 0) return '';
    const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let r = ''; for (const [v, s] of map) while (n >= v) { r += s; n -= v; } return r;
}
function SS_titleFor(g) {
    if (g <= SS_TITLES.length) return SS_TITLES[g - 1];
    const tier = g - SS_TITLES.length; // 1, 2, 3 …
    return `${SS_TITLES[SS_TITLES.length - 1]} ${SS_roman(tier + 1)}`;
}
// Geforderte Prüfungs-Punktzahl, um die nächste Stufe zu öffnen – steigt mit der Stufe.
function SS_reqExam(g) { return Math.min(96, 64 + g * 2); }

/* ---------------- Die sechs Disziplinen ---------------- */
const SS_SENSES = [
    { id: 'sehen',     name: 'Sehen',     icon: '👁️', accent: '#60a5fa', soft: 'rgba(96,165,250,.16)', glow: 'rgba(96,165,250,.18)' },
    { id: 'hoeren',    name: 'Hören',     icon: '👂', accent: '#a78bfa', soft: 'rgba(167,139,250,.16)', glow: 'rgba(167,139,250,.18)' },
    { id: 'riechen',   name: 'Riechen',   icon: '👃', accent: '#f472b6', soft: 'rgba(244,114,182,.16)', glow: 'rgba(244,114,182,.18)' },
    { id: 'schmecken', name: 'Schmecken', icon: '👅', accent: '#fb923c', soft: 'rgba(251,146,60,.16)',  glow: 'rgba(251,146,60,.18)' },
    { id: 'tasten',    name: 'Tasten',    icon: '🖐️', accent: '#34d399', soft: 'rgba(52,211,153,.16)',  glow: 'rgba(52,211,153,.18)' },
    { id: 'innensinn', name: 'Innensinn', icon: '🌀', accent: '#e0b04a', soft: 'rgba(224,176,74,.16)',  glow: 'rgba(224,176,74,.18)' },
    { id: 'empathie',  name: 'Empathie',  icon: '🫂', accent: '#fb7185', soft: 'rgba(251,113,133,.16)', glow: 'rgba(251,113,133,.18)' }
];
const SS_SENSE_MAP = Object.fromEntries(SS_SENSES.map(s => [s.id, s]));

/* ---------------- Verbundene Persönlichkeitsentwicklungs-Methoden ----------------
   Als geführter Pfad nach Empathie-Aspekt: jede Methode vertieft einen Teilbereich. */
const SS_LINKED_METHODS = {
    empathie: [
        { tag: 'Kognitiv', label: 'Johari-Fenster', href: '../johari-window/johari-window.html',
          desc: 'Blinde Flecken erkennen – Selbst- und Fremdbild abgleichen, um andere klarer zu verstehen.' },
        { tag: 'Kognitiv', label: 'Zirkuläres Interview', href: '../circular-interview/circular-interview.html',
          desc: 'Perspektiven wechseln durch zirkuläre Fragen – die Welt aus den Augen des anderen sehen.' },
        { tag: 'Emotional', label: 'Emotionale Intelligenz', href: '../emotional-intelligence/emotional-intelligence.html',
          desc: 'Gefühle – eigene wie fremde – genauer wahrnehmen und präzise benennen.' },
        { tag: 'Zuhören', label: 'Gewaltfreie Kommunikation', href: '../nonviolent-communication/nonviolent-communication.html',
          desc: 'Beobachtung, Gefühl, Bedürfnis, Bitte – empathisch sprechen und hören.' },
        { tag: 'Zuhören', label: 'Aktiv-Empathisch Kommunizieren', href: '../aek-communication/aek-communication.html',
          desc: 'Aktives Zuhören und Spiegeln gezielt als Fähigkeit trainieren.' },
        { tag: 'Innerer Halt', label: 'Achtsamkeit', href: '../mindfulness/mindfulness.html',
          desc: 'Stabil bleiben – mitfühlen, ohne sich im Gefühl des anderen zu verlieren.' },
        { tag: 'Innerer Halt', label: 'Die fünf Säulen der Identität', href: '../five-pillars/five-pillars.html',
          desc: 'Den eigenen Stand stärken, der Mitgefühl ohne Selbstverlust erst möglich macht.' }
    ],
    innensinn: [
        { tag: 'Vertiefen', label: 'Achtsamkeit & Meditation', href: '../mindfulness/mindfulness.html',
          desc: 'Körper, Atem und Gegenwart bewusst spüren – die Heimat des Innensinns.' },
        { tag: 'Reflexion', label: 'Journaling', href: '../journaling/journaling.html',
          desc: 'Inneres Erleben schriftlich klären und immer feiner unterscheiden.' }
    ],
    hoeren: [
        { tag: 'Anwenden', label: 'Kommunikation', href: '../communication/communication.html',
          desc: 'Bewusst hören im Gespräch – die Basis echter Verständigung.' },
        { tag: 'Anwenden', label: 'Aktiv-Empathisch Kommunizieren', href: '../aek-communication/aek-communication.html',
          desc: 'Zuhören als trainierbare Fähigkeit schärfen.' }
    ]
};

/* ---------------- Übungen (Dojo) ---------------- */
const SS_EXERCISES = {
    sehen: [
        { id: 'sehen_farbtiefe', icon: '🎨', title: 'Farbtiefe', dur: 180, xp: 25, steps: [
            { text: 'Wähle einen Gegenstand in deiner Nähe und ruhe deinen Blick auf ihm.', sec: 25 },
            { text: 'Suche in seiner Farbe alle Abstufungen – wo ist sie heller, wo dunkler?', sec: 45 },
            { text: 'Finde mindestens drei verschiedene Töne in dieser einen Farbe.', sec: 45 },
            { text: 'Wandere zur nächsten Farbe und wiederhole das Spiel.', sec: 45 },
            { text: 'Atme aus und lass den Blick weich werden. Du hast feiner gesehen.', sec: 20 }
        ]},
        { id: 'sehen_detail', icon: '🔍', title: 'Detailgedächtnis', dur: 150, xp: 22, steps: [
            { text: 'Betrachte ein Objekt 60 Sekunden lang ganz genau.', sec: 60 },
            { text: 'Schließe die Augen und beschreibe es innerlich – Form, Kanten, Schatten.', sec: 45 },
            { text: 'Öffne die Augen und prüfe: Was hattest du übersehen?', sec: 45 }
        ]},
        { id: 'sehen_peripherie', icon: '↔️', title: 'Peripherie', dur: 120, xp: 18, steps: [
            { text: 'Fixiere einen Punkt geradeaus, ohne die Augen zu bewegen.', sec: 30 },
            { text: 'Werde dir bewusst, was am linken und rechten Rand geschieht.', sec: 45 },
            { text: 'Nimm Bewegung und Licht in der Peripherie wahr – ganz ohne hinzusehen.', sec: 45 }
        ]}
    ],
    hoeren: [
        { id: 'hoeren_landschaft', icon: '🎧', title: 'Klanglandschaft', dur: 180, xp: 25, steps: [
            { text: 'Schließe die Augen. Lausche nur dem nächsten Geräusch um dich.', sec: 40 },
            { text: 'Erweitere deinen Hörraum – was klingt mittlerer Entfernung?', sec: 50 },
            { text: 'Greife nach dem entferntesten Klang, den du finden kannst.', sec: 50 },
            { text: 'Halte alle Schichten gleichzeitig – nah, mittel, fern.', sec: 40 }
        ]},
        { id: 'hoeren_stille', icon: '🤫', title: 'Die leiseste Stimme', dur: 120, xp: 18, steps: [
            { text: 'Werde still. Suche das leiseste hörbare Geräusch im Raum.', sec: 60 },
            { text: 'Bleib bei ihm. Wird es klarer, je länger du lauschst?', sec: 60 }
        ]},
        { id: 'hoeren_instrument', icon: '🎻', title: 'Ein Instrument', dur: 150, xp: 22, steps: [
            { text: 'Höre Musik (oder erinnere dich an ein Stück) und wähle ein Instrument.', sec: 30 },
            { text: 'Folge nur diesem einen Instrument durch die ganze Passage.', sec: 70 },
            { text: 'Wechsle bewusst zu einem anderen und folge ihm.', sec: 50 }
        ]}
    ],
    riechen: [
        { id: 'riechen_blind', icon: '🌿', title: 'Blind-Riechen', dur: 150, xp: 22, steps: [
            { text: 'Nimm einen Duft (Gewürz, Kraut, Kaffee) mit geschlossenen Augen auf.', sec: 40 },
            { text: 'Benenne, was du riechst – und was darunter liegt.', sec: 55 },
            { text: 'Atme zwischendurch an deinem Arm, um die Nase zu „löschen".', sec: 55 }
        ]},
        { id: 'riechen_raum', icon: '🏠', title: 'Duft des Raumes', dur: 120, xp: 18, steps: [
            { text: 'Schließe die Augen und rieche den Raum, in dem du bist.', sec: 50 },
            { text: 'Welche Schichten findest du? Holz, Staub, Essen, Frische?', sec: 70 }
        ]}
    ],
    schmecken: [
        { id: 'schmecken_langsam', icon: '🍵', title: 'Der lange Bissen', dur: 150, xp: 22, steps: [
            { text: 'Nimm einen kleinen Bissen oder Schluck. Noch nicht schlucken.', sec: 20 },
            { text: 'Spüre zuerst die Süße, dann die Säure.', sec: 45 },
            { text: 'Suche Bitterkeit, Salz, Umami – jede für sich.', sec: 45 },
            { text: 'Lass den Nachgeschmack ausklingen und beobachte ihn.', sec: 40 }
        ]},
        { id: 'schmecken_vergleich', icon: '⚖️', title: 'Der Vergleich', dur: 120, xp: 18, steps: [
            { text: 'Lege zwei Varianten desselben bereit (z. B. zwei Äpfel, zwei Schokoladen).', sec: 25 },
            { text: 'Koste die erste – halte den Eindruck fest.', sec: 45 },
            { text: 'Koste die zweite – worin liegt der feine Unterschied?', sec: 50 }
        ]}
    ],
    tasten: [
        { id: 'tasten_material', icon: '🪵', title: 'Materialien lesen', dur: 150, xp: 22, steps: [
            { text: 'Schließe die Augen und ertaste einen Gegenstand.', sec: 40 },
            { text: 'Trenne Temperatur, Textur und Gewicht voneinander.', sec: 60 },
            { text: 'Folge jeder Kante, jeder Unebenheit mit den Fingerkuppen.', sec: 50 }
        ]},
        { id: 'tasten_temperatur', icon: '🌡️', title: 'Temperatur & Textur', dur: 120, xp: 18, steps: [
            { text: 'Berühre nacheinander drei Oberflächen mit geschlossenen Augen.', sec: 50 },
            { text: 'Was ist kühler, was rauer? Benenne die feinen Unterschiede.', sec: 70 }
        ]}
    ],
    innensinn: [
        { id: 'innensinn_bodyscan', icon: '🧘', title: 'Körperscan', dur: 240, xp: 30, steps: [
            { text: 'Schließe die Augen. Spüre den Kontakt deines Körpers zur Unterlage.', sec: 40 },
            { text: 'Wandere mit der Aufmerksamkeit von den Füßen aufwärts.', sec: 70 },
            { text: 'Halte an Spannungen – ohne sie zu bewerten.', sec: 70 },
            { text: 'Atme in jeden Bereich, der nach dir ruft.', sec: 60 }
        ]},
        { id: 'innensinn_atem', icon: '🌬️', title: 'Atem-Anker', dur: 180, xp: 22, breath: {
            repeats: 6,
            phases: [
                { label: 'Einatmen', action: 'inhale', sec: 4 },
                { label: 'Halten',   action: 'hold',   sec: 4 },
                { label: 'Ausatmen', action: 'exhale', sec: 6 }
            ]
        }},
        { id: 'innensinn_herz', icon: '❤️', title: 'Herzschlag spüren', dur: 120, xp: 18, steps: [
            { text: 'Sitze still. Versuche, deinen Herzschlag ohne Berührung zu spüren.', sec: 60 },
            { text: 'Findest du ihn in der Brust? Im Hals? In den Fingerspitzen?', sec: 60 }
        ]}
    ],
    empathie: [
        { id: 'empathie_perspektive', icon: '🧠', title: 'Perspektivwechsel (kognitiv)', dur: 180, xp: 25, steps: [
            { text: 'Denk an eine Reaktion eines Menschen, die dich zuletzt irritiert hat.', sec: 35 },
            { text: 'Frage dich nicht „Was ist mit dem falsch?", sondern: „Was könnte dahinterstehen?"', sec: 50 },
            { text: 'Welche Angst, Erwartung, Verletzung oder Sorge wäre denkbar?', sec: 50 },
            { text: 'Du musst nichts entschuldigen – du schaust nur tiefer als auf das Verhalten.', sec: 45 }
        ]},
        { id: 'empathie_granularitaet', icon: '🎭', title: 'Gefühls-Granularität', dur: 150, xp: 22, steps: [
            { text: 'Spüre nach: Was fühlst du genau in diesem Moment?', sec: 30 },
            { text: 'Benenne es präzise: traurig, gereizt, beschämt, nervös, berührt, neidisch …', sec: 45 },
            { text: 'Erinnere ein Gespräch. Was fühlte die andere Person – so genau wie möglich?', sec: 45 },
            { text: 'Je feiner du eigene Gefühle erkennst, desto feiner erkennst du sie bei anderen.', sec: 30 }
        ]},
        { id: 'empathie_mitgefuehl', icon: '🫂', title: 'Mitgefühl mit innerem Halt', dur: 180, xp: 26, steps: [
            { text: 'Denk an jemanden, dem es gerade nicht gut geht.', sec: 35 },
            { text: 'Lass dich berühren – fühle ein Stück weit mit.', sec: 45 },
            { text: 'Sage innerlich: „Ich bin bei dir, aber ich bin nicht du."', sec: 45 },
            { text: 'Bleib stabil und frage dich: „Was wäre jetzt wirklich hilfreich?"', sec: 55 }
        ]},
        { id: 'empathie_zuhoeren', icon: '👂', title: 'Aktives Zuhören (Spiegeln)', dur: 150, xp: 22, steps: [
            { text: 'Nimm dir vor: Im nächsten Gespräch erst spiegeln, dann bewerten.', sec: 30 },
            { text: 'Gib das Gehörte zurück: „Du warst nicht nur genervt, sondern eher enttäuscht?"', sec: 60 },
            { text: '„Ja, genau" = du warst nah dran. Eine Korrektur = du lernst dazu.', sec: 60 }
        ]},
        { id: 'empathie_regulation', icon: '🛟', title: 'Selbstregulation bei Überempathie', dur: 120, xp: 18, breath: {
            repeats: 5,
            phases: [
                { label: 'Einatmen – „Ich nehme wahr"', action: 'inhale', sec: 4 },
                { label: 'Halten', action: 'hold', sec: 2 },
                { label: 'Ausatmen – „ohne es zu übernehmen"', action: 'exhale', sec: 6 }
            ]
        }}
    ]
};

/* ---------------- Prüfungen ---------------- */
const SS_EXAMS = {
    sehen:     { type: 'color', title: 'Prüfung des Sehens', protocol: 'Finde in jeder Runde das Feld, dessen Farbe minimal abweicht. Es wird mit jeder Runde feiner – und mit jeder Stufe schwerer.' },
    hoeren:    { type: 'count', target: 8, unit: 'Klangschichten', title: 'Prüfung des Hörens',
                 protocol: 'Schließe 90 Sekunden die Augen und zähle so viele klar unterscheidbare Klangschichten wie möglich (nah, mittel, fern). Trage danach deine ehrliche Zahl ein.' },
    riechen:   { type: 'count', target: 6, unit: 'Düfte', title: 'Prüfung des Riechens',
                 protocol: 'Lass dir blind mehrere Düfte reichen (Gewürze, Kräuter, Obst). Identifiziere so viele wie möglich und trage die Zahl der korrekt erkannten ein.' },
    schmecken: { type: 'count', target: 5, unit: 'Aromen', title: 'Prüfung des Schmeckens',
                 protocol: 'Koste blind eine Speise und benenne ihre einzelnen Aromen/Komponenten. Trage ein, wie viele du klar unterscheiden konntest.' },
    tasten:    { type: 'count', target: 8, unit: 'Materialien', title: 'Prüfung des Tastens',
                 protocol: 'Lass dir blind verschiedene Materialien geben. Trage ein, wie viele du allein durch Tasten korrekt erkannt hast.' },
    innensinn: { type: 'scale', title: 'Prüfung des Innensinns',
                 protocol: 'Führe einen 3-minütigen Körperscan durch. Bewerte danach ehrlich, wie klar und vollständig du deinen Körper von innen wahrnehmen konntest.' },
    empathie:  { type: 'scenario', title: 'Prüfung der Empathie',
                 protocol: 'Wähle in jeder Situation die Deutung, die am ehesten empathisch ist – die tiefer schaut, statt das Verhalten persönlich zu nehmen, zu urteilen oder vorschnell zu „reparieren".' }
};

/* Empathie-Szenarien (fein): alle vier Optionen klingen zugewandt oder plausibel.
   Nur EINE trifft die feine Balance – präzise Wahrnehmung, tentativ, präsent,
   eigene Regung haltend. Die Distraktoren sind die subtilen Fallen:
   projizieren, sich übergehen / verschmelzen, von sich reden, vorschnell lösen/trösten,
   Worte über Körpersignale stellen. `w` erklärt das Warum nach der Antwort. */
const SS_EMP_SCENARIOS = [
    { s: 'Eine Freundin erzählt von einem Streit mit ihrer Mutter. Sie wirkt gefasst, aber ihre Stimme zittert leicht.',
      o: [
        'Das zerreißt dich bestimmt innerlich, ich kenne dieses Gefühl gut.',
        'Du wirkst gefasst, und doch höre ich etwas Zittriges – was ist näher?',
        'Bei mir war das früher ganz genauso, irgendwann ging es vorbei.',
        'Wichtig ist vor allem, dass ihr beide möglichst bald wieder ins Reden kommt.'
      ], a: 1,
      w: 'Empathie heißt hier: die Doppelbotschaft – gefasst und zugleich bewegt – benennen und offen rückfragen, statt die Intensität zu projizieren, von sich selbst zu reden oder gleich in die Lösung zu springen.' },

    { s: 'Ein Freund sagt am Telefon mehrmals „alles gut", wechselt aber schnell das Thema, wenn du nachfragst.',
      o: [
        'Wenn er sagt, alles sei gut, dann glaube ich ihm das einfach.',
        'Das wird schon nichts Ernstes sein, mach dir keine großen Sorgen.',
        'Ich spüre, du weichst aus – ich dränge nicht, bin aber da.',
        'Jetzt sag mir doch endlich, was wirklich mit dir los ist.'
      ], a: 2,
      w: 'Das Signal – das Ausweichen – ernst nehmen, ohne zu drängen: Präsenz anbieten, statt die Worte für bare Münze zu nehmen, zu beschwichtigen oder Druck zu machen.' },

    { s: 'Ein Kollege bekommt eine Beförderung, auf die du selbst gehofft hattest. Er strahlt und erzählt begeistert.',
      o: [
        'Ich freue mich wirklich total für dich, ganz ohne den kleinsten Hintergedanken!',
        'Glückwunsch – ich merke gemischte Gefühle und freue mich trotzdem ehrlich.',
        'Glückwunsch, auch wenn die Stelle bestimmt jede Menge Stress bringt.',
        'Glückwunsch, du hattest durch den Chef ja ohnehin einen Vorteil.'
      ], a: 1,
      w: 'Reife Empathie schließt Ehrlichkeit mit dir selbst ein: die eigene Regung wahrnehmen und trotzdem zugewandt bleiben – statt sie zu verleugnen, zu relativieren oder den anderen abzuwerten.' },

    { s: 'Eine Freundin weint nach einer Trennung. Du spürst, wie dich ihre Trauer stark mitzieht.',
      o: [
        'Du weinst so sehr mit, dass du selbst kaum noch reden kannst.',
        'Komm, lass uns rausgehen, das lenkt dich bestimmt schnell ab.',
        'Mach dir bloß keine Sorgen, du findest ganz sicher bald jemand viel Besseren.',
        'Du bleibst still bei ihr, fühlst mit und bleibst doch innerlich stabil.'
      ], a: 3,
      w: 'Der schmale Grat: emotionale Empathie ohne Abstand zieht dich hinein, Ablenkung und Trost-Floskeln überspringen das Gefühl. Mitgefühl bleibt da – mit innerem Halt.' },

    { s: 'Deine Partnerin erzählt aufgeregt von einem Projekt. Du bist müde und unkonzentriert.',
      o: [
        '„Mhm, klingt gut" – während dein Blick immer wieder zum Handy wandert.',
        '„Können wir das vielleicht später machen?" – ohne weitere Erklärung dazu.',
        '„Ich bin gerade müde, will aber zuhören – gibst du mir zehn Minuten?"',
        'Du hörst dich zwingend an und wirst dabei innerlich immer gereizter.'
      ], a: 2,
      w: 'Echte Nähe braucht Ehrlichkeit über den eigenen Zustand – statt Pseudo-Zuhören, grundlosem Abweisen oder dich zu übergehen, bis Groll entsteht.' },

    { s: 'Ein Teamkollege wird im Meeting ungewohnt still, nachdem seine Idee abgelehnt wurde.',
      o: [
        'Nimm es bloß nicht persönlich, das war doch nur sachliches Feedback.',
        'Deine Idee war richtig gut, die anderen haben sie nur nicht verstanden.',
        'Er wirkt ganz ruhig, also ist ihm die Ablehnung vermutlich egal.',
        'Mir fällt auf, dass du still geworden bist – wie geht es dir damit?'
      ], a: 3,
      w: 'Die Veränderung wahrnehmen und behutsam ansprechen – statt zu verharmlosen, reflexhaft Partei gegen andere zu ergreifen oder das stille Signal zu übersehen.' },

    { s: 'Deine Mutter ruft zum dritten Mal an, obwohl du mitten in einer dringenden Aufgabe steckst.',
      o: [
        'Du gehst genervt ran und klingst dabei ziemlich kurz angebunden.',
        '„Ich stecke gerade fest – ruf ich dich in einer Stunde zurück?"',
        'Du gehst nicht ran, nur um bloß keinen Streit zu riskieren.',
        'Du brichst alles ab, auch wenn du dadurch deine Deadline reißt.'
      ], a: 1,
      w: 'Empathie ohne Selbstverlust: die eigene Grenze klar und warm setzen – statt den Stress in die Beziehung kippen zu lassen, zu vermeiden oder dich selbst aufzugeben.' },

    { s: 'Eine Bekannte erzählt stolz von etwas, das dir eher unbedeutend erscheint.',
      o: [
        'Ach komm, das ist doch nun wirklich überhaupt nichts Besonderes.',
        'Bei mir war das damals ehrlich gesagt eine ganze Nummer größer.',
        'Ich sehe, dass dir das richtig viel bedeutet – erzähl mehr davon.',
        'Du nickst freundlich und höflich, bist innerlich aber ganz woanders.'
      ], a: 2,
      w: 'Empathie misst mit ihrem Maßstab, nicht mit deinem: den Wert aus ihrer Welt sehen – statt abzuwerten, zu übertrumpfen oder nur höflich abwesend zu bleiben.' },

    { s: 'Jemand reagiert in einer Diskussion plötzlich gereizt auf eine eigentlich harmlose Frage.',
      o: [
        'Warum reagierst du jetzt gleich so aggressiv auf eine harmlose Frage?',
        'Ich glaube, ich habe da einen wunden Punkt berührt.',
        'Du wirst selbst gereizt und schießt sofort genauso scharf zurück.',
        'Du ziehst dich zurück und sagst lieber gar nichts mehr dazu.'
      ], a: 1,
      w: 'Hinter der Gereiztheit eine Verletzung vermuten und benennen, ohne dich klein zu machen – statt zu etikettieren, die Erregung zu spiegeln oder dich ganz zurückzuziehen.' },

    { s: 'Dein Gegenüber sagt „mir geht es gut", seufzt dabei aber hörbar.',
      o: [
        'Schön zu hören, dass bei dir gerade wirklich einmal alles in Ordnung ist.',
        'Ach, jeder von uns hat doch mal einen richtig schlechten Tag.',
        'Die Worte sagen „gut", der Seufzer klingt anders – magst du erzählen?',
        'Komm schon, raus mit der Sprache, was ist denn wirklich los?'
      ], a: 2,
      w: 'Bei einer Diskrepanz zählt oft das Körpersignal mehr als die Worte: die Lücke sanft benennen – statt den Worten zu glauben, allgemein abzutun oder zu drängen.' }
];

/* ---------------- Philosophie ---------------- */
const SS_QUOTES = [
    { t: 'Der Anfänger sieht viele Möglichkeiten, der Meister wenige – aber er sieht sie ganz.', w: 'Zen-Geist' },
    { t: 'Wer einen Sinn schärft, schärft alle.', w: 'Shokunin-Weg' },
    { t: 'Nicht die Wiederholung macht den Meister, sondern die Aufmerksamkeit in der Wiederholung.', w: 'Kaizen' },
    { t: 'Die Welt ist nicht arm an Wundern, sondern an Aufmerksamkeit.', w: 'Alte Weisheit' },
    { t: 'Übe, als hättest du alle Zeit – und als wäre dieser Atemzug der einzige.', w: 'Die Schule der Sinne' }
];

/* ---------------- Pseudonym-Generator (anonym) ---------------- */
const SS_ALIAS_ADJ = ['Stiller', 'Wacher', 'Feiner', 'Klarer', 'Tiefer', 'Leiser', 'Heller', 'Geduldiger', 'Wandernder', 'Zeitloser', 'Lauschender', 'Spürender', 'Scharfer', 'Sanfter', 'Wahrer'];
const SS_ALIAS_NOUN = ['Fuchs', 'Kranich', 'Luchs', 'Falke', 'Wolf', 'Reiher', 'Dachs', 'Eule', 'Hirsch', 'Otter', 'Marder', 'Rabe', 'Steinbock', 'Wal', 'Mönch'];

/* =========================================================
   App
   ========================================================= */
class Sinnesschule {
    constructor() {
        this.view = 'dashboard';
        this.activeSense = 'sehen';
        this.timer = null;
        this.exam = null;
        this.leaderboard = null;
        this.state = this._defaultState();
    }

    _defaultState() {
        const senses = {};
        SS_SENSES.forEach(s => {
            senses[s.id] = { xp: 0, sessions: 0, doorGrade: 0, bestExam: 0, examScores: [] };
        });
        return {
            startedAt: new Date().toISOString().slice(0, 10),
            alias: null,
            senses,
            streak: 0,
            lastPracticeDate: null,
            totalSessions: 0,
            totalMinutes: 0,
            log: [],
            practiceDays: []
        };
    }

    async init() {
        await this._load();
        if (!this.state.alias) this.state.alias = this._generateAlias();
        this._bindNav();
        this.render();
    }

    /* ---------------- Persistenz ---------------- */
    _merge(base, incoming) {
        const out = JSON.parse(JSON.stringify(base));
        if (!incoming) return out;
        Object.keys(incoming).forEach(k => {
            if (k === 'senses' && incoming.senses) {
                SS_SENSES.forEach(s => {
                    out.senses[s.id] = Object.assign({}, out.senses[s.id], incoming.senses[s.id] || {});
                });
            } else {
                out[k] = incoming[k];
            }
        });
        return out;
    }

    async _load() {
        try {
            const local = JSON.parse(localStorage.getItem('ss_state'));
            if (local && local.startedAt) this.state = this._merge(this._defaultState(), local);
        } catch (e) { /* ignore */ }

        try {
            if (window.workflowAPI) {
                const res = await window.workflowAPI.getWorkflowResults(SS_METHOD);
                const remote = res && (res.results || res.state || (res.startedAt ? res : null));
                if (remote && remote.startedAt) {
                    this.state = this._merge(this._defaultState(), remote);
                    localStorage.setItem('ss_state', JSON.stringify(this.state));
                }
            }
        } catch (e) { console.warn('Cloud-Load fehlgeschlagen:', e); }
    }

    async _save() {
        localStorage.setItem('ss_state', JSON.stringify(this.state));
        let synced = false;
        try {
            if (window.workflowAPI) {
                const loggedIn = this._isLoggedIn();
                await window.workflowAPI.saveWorkflowResults(SS_METHOD, this.state);
                synced = !!loggedIn;
            }
        } catch (e) { console.warn('Cloud-Save fehlgeschlagen:', e); }
        this._setSyncBadge(synced);
    }

    _setSyncBadge(synced) {
        const badge = document.getElementById('ss-sync-badge');
        const text = document.getElementById('ss-sync-text');
        if (!badge || !text) return;
        if (synced) {
            badge.classList.add('synced');
            badge.querySelector('i').className = 'fas fa-cloud';
            text.textContent = 'Geräteübergreifend gespeichert';
        } else {
            badge.classList.remove('synced');
            badge.querySelector('i').className = 'fas fa-cloud-slash';
            text.textContent = 'Lokal gespeichert';
        }
    }

    /* ---------------- Identität / Anmeldung ---------------- */
    _isLoggedIn() {
        try { return !!(window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()); }
        catch (e) { return false; }
    }
    _identityId() {
        try {
            if (!this._isLoggedIn()) return null;
            const u = window.realUserAuth.getCurrentUser ? window.realUserAuth.getCurrentUser() : null;
            return (u && (u.id || u.sub || u.email)) || null;
        } catch (e) { return null; }
    }
    _openLogin() {
        try {
            if (window.realUserAuth && window.realUserAuth.showAuthModal) return window.realUserAuth.showAuthModal();
            if (window.realUserAuth && window.realUserAuth.openModal) return window.realUserAuth.openModal();
        } catch (e) { /* ignore */ }
        this._toast('Bitte melde dich über die Website an.');
    }

    _generateAlias() {
        const a = SS_ALIAS_ADJ[Math.floor(Math.random() * SS_ALIAS_ADJ.length)];
        const n = SS_ALIAS_NOUN[Math.floor(Math.random() * SS_ALIAS_NOUN.length)];
        const num = Math.floor(1000 + Math.random() * 9000);
        return `${a} ${n} #${num}`;
    }

    /* ---------------- Praxis-Tage / Streak ---------------- */
    _registerPracticeDay(minutes) {
        const today = this._today();
        const yest = this._dayOffset(-1);
        if (this.state.lastPracticeDate !== today) {
            if (this.state.lastPracticeDate === yest || !this.state.lastPracticeDate) {
                this.state.streak = (this.state.streak || 0) + 1;
            } else {
                this.state.streak = 1;
            }
            this.state.lastPracticeDate = today;
        }
        if (!this.state.practiceDays.includes(today)) this.state.practiceDays.push(today);
        this.state.totalSessions++;
        this.state.totalMinutes += minutes;
    }

    _today() { return new Date().toISOString().slice(0, 10); }
    _dayOffset(d) { return new Date(Date.now() + d * 86400000).toISOString().slice(0, 10); }

    /* ---------------- Graduierung (→ ∞) ---------------- */
    _rawGrade(id) { return SS_gradeFromXP(this.state.senses[id].xp); }
    _grade(id) { return Math.min(this._rawGrade(id), (this.state.senses[id].doorGrade || 0) + 1); }
    _needsExam(id) { return this._rawGrade(id) > this._grade(id); }
    _title(id) { return SS_titleFor(this._grade(id)); }

    _gradeProgress(id) {
        if (this._needsExam(id)) return 100;
        const g = this._grade(id);
        const base = SS_T(g), next = SS_T(g + 1);
        const xp = this.state.senses[id].xp;
        return Math.max(0, Math.min(100, Math.round(((xp - base) / (next - base)) * 100)));
    }
    _xpToNext(id) {
        const g = this._grade(id);
        return Math.max(0, SS_T(g + 1) - this.state.senses[id].xp);
    }

    _totalXP() { return SS_SENSES.reduce((a, s) => a + (this.state.senses[s.id].xp || 0), 0); }
    _overallGrade() { return SS_gradeFromXP(Math.round(this._totalXP() / SS_SENSES.length)); }
    _overallTitle() { return SS_titleFor(this._overallGrade()); }

    /* ---------------- Navigation ---------------- */
    _bindNav() {
        document.querySelectorAll('.ss-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.go(btn.dataset.view));
        });
    }

    go(view) {
        this._stopTimer();
        this.view = view;
        document.querySelectorAll('.ss-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    render() {
        const main = document.getElementById('ss-main');
        if (!main) return;
        switch (this.view) {
            case 'dashboard': main.innerHTML = this._renderDashboard(); this._afterDashboard(); break;
            case 'practice':  main.innerHTML = this._renderPractice(); this._afterPractice(); break;
            case 'exams':     main.innerHTML = this._renderExams(); this._afterExams(); break;
            case 'journal':   main.innerHTML = this._renderJournal(); this._afterJournal(); break;
            case 'journey':   main.innerHTML = this._renderJourney(); break;
            case 'arena':     main.innerHTML = this._renderArena(); this._afterArena(); break;
        }
        this._setSyncBadge(document.getElementById('ss-sync-badge')?.classList.contains('synced'));
    }

    /* ===================== DASHBOARD ===================== */
    _renderDashboard() {
        const days = (this.state.practiceDays || []).length;
        const hours = Math.floor(this.state.totalMinutes / 60);
        const mins = this.state.totalMinutes % 60;
        const quote = SS_QUOTES[days % SS_QUOTES.length];

        return `
        <div class="ss-hero">
            <div class="ss-kicker">Lebenslanger Weg · seit ${this._fmtDate(this.state.startedAt)}</div>
            <h1>Schule deine Sinne, schule deine Wahrnehmung</h1>
            <p>Sieben Disziplinen – von den fünf Sinnen über den Innensinn bis zur Empathie. Wähle täglich eine, übe sie bewusst und öffne durch Prüfungen die Tür zur nächsten Stufe. Der Weg endet nie – er wird nur tiefer.</p>
        </div>

        <div class="ss-stats">
            <div class="ss-stat"><div class="ss-stat-value">${this.state.streak > 0 ? '<span class="flame">🔥</span> ' : ''}${this.state.streak || 0}</div><div class="ss-stat-label">Tage in Folge</div></div>
            <div class="ss-stat"><div class="ss-stat-value">${days}</div><div class="ss-stat-label">Übungstage</div></div>
            <div class="ss-stat"><div class="ss-stat-value">${hours}h ${mins}m</div><div class="ss-stat-label">Gesamte Praxis</div></div>
            <div class="ss-stat"><div class="ss-stat-value">${this._totalXP().toLocaleString('de-DE')}</div><div class="ss-stat-label">Schärfe gesamt</div></div>
        </div>

        <p class="ss-section-title">Deine Disziplinen</p>
        <div class="ss-grid">
            ${SS_SENSES.map(s => this._senseCard(s)).join('')}
        </div>

        <div class="ss-quote">„${quote.t}"<span class="who">— ${quote.w}</span></div>
        `;
    }

    _senseCard(s) {
        const st = this.state.senses[s.id];
        const grade = this._grade(s.id);
        const prog = this._gradeProgress(s.id);
        const needsExam = this._needsExam(s.id);
        return `
        <div class="ss-sense-card" data-sense="${s.id}" style="--accent:${s.accent};--accent-soft:${s.soft};--accent-glow:${s.glow}">
            <div class="ss-sense-head">
                <div class="ss-sense-icon">${s.icon}</div>
                <div>
                    <div class="ss-sense-name">${s.name}</div>
                    <div class="ss-sense-grade-name">${SS_titleFor(grade)}</div>
                </div>
                <div class="ss-sense-rank">${this._romanGrade(grade)}</div>
            </div>
            <div class="ss-progress-track"><div class="ss-progress-fill" style="width:${prog}%"></div></div>
            <div class="ss-sense-meta">
                <span>${st.xp.toLocaleString('de-DE')} Schärfe</span>
                <span>${needsExam ? '⚑ Prüfung öffnet die Tür' : `noch ${this._xpToNext(s.id).toLocaleString('de-DE')}`}</span>
            </div>
        </div>`;
    }

    _romanGrade(g) {
        // dezente Stufenanzeige (Grad), nie ein Maximum – nur ein wachsender Rang
        return 'Grad ' + g;
    }

    _afterDashboard() {
        document.querySelectorAll('.ss-sense-card').forEach(card => {
            card.addEventListener('click', () => {
                this.activeSense = card.dataset.sense;
                this.go('practice');
            });
        });
    }

    /* ===================== PRACTICE (Dojo) ===================== */
    _renderPractice() {
        const s = SS_SENSE_MAP[this.activeSense];
        const grade = this._grade(this.activeSense);
        const exs = SS_EXERCISES[this.activeSense] || [];
        const needsExam = this._needsExam(this.activeSense);
        const linked = SS_LINKED_METHODS[this.activeSense] || [];
        const linkedHtml = linked.length ? `
        <div class="ss-panel" style="--accent:${s.accent};--accent-soft:${s.soft}">
            <h3><i class="fas fa-route"></i> Vertiefe deinen Weg</h3>
            <p class="sub">${this.activeSense === 'empathie'
                ? 'Empathie fließt nahtlos in deine Persönlichkeitsentwicklung. Dieser Pfad vertieft jeden Aspekt – vom Verstehen über das Fühlen bis zum inneren Halt:'
                : 'Diese Disziplin fließt nahtlos in deine Persönlichkeitsentwicklung. Vertiefe sie mit passenden Methoden:'}</p>
            <div class="ss-link-list">
                ${linked.map(m => `
                <a class="ss-link-item" href="${m.href}">
                    <span class="ss-link-tag">${this._esc(m.tag || '')}</span>
                    <span class="ss-link-body">
                        <span class="ss-link-label">${this._esc(m.label)}</span>
                        <span class="ss-link-desc">${this._esc(m.desc || '')}</span>
                    </span>
                    <i class="fas fa-arrow-right-long"></i>
                </a>`).join('')}
            </div>
        </div>` : '';

        return `
        <div class="ss-sense-picker">
            ${SS_SENSES.map(x => `<button class="ss-chip ${x.id === this.activeSense ? 'active' : ''}" data-sense="${x.id}">${x.icon} ${x.name}</button>`).join('')}
        </div>

        <div class="ss-panel" style="--accent:${s.accent};--accent-soft:${s.soft}">
            <h2>${s.icon} ${s.name} — ${SS_titleFor(grade)} (Grad ${grade})</h2>
            <p class="sub">Wähle eine Übung und führe sie bewusst aus. Jede abgeschlossene Übung bringt Schärfe-Punkte und einen Logbuch-Eintrag.</p>
            ${needsExam ? `<div style="background:rgba(224,176,74,.12);border:1px solid rgba(224,176,74,.35);color:#e0b04a;padding:12px 16px;border-radius:12px;margin-bottom:16px;font-size:14px"><i class="fas fa-medal"></i> Du hast genug geübt – die <strong>Prüfung des ${s.name}s</strong> öffnet die Tür zum nächsten Grad. <button class="ss-btn ss-btn-gold" style="margin-left:10px;padding:6px 14px;font-size:13px" id="ss-goto-exam">Zur Prüfung</button></div>` : ''}
            <div class="ss-exercise-list">
                ${exs.map(ex => `
                    <div class="ss-exercise-item" data-ex="${ex.id}">
                        <div class="ic">${ex.icon}</div>
                        <div class="body">
                            <div class="title">${ex.title}</div>
                            <div class="desc">${ex.breath ? 'Geführte Atem-Übung' : ex.steps.length + ' Schritte'} · +${ex.xp} Schärfe</div>
                        </div>
                        <div class="dur">${Math.round(ex.dur / 60)} Min</div>
                    </div>`).join('')}
            </div>
        </div>
        ${linkedHtml}`;
    }

    _afterPractice() {
        document.querySelectorAll('.ss-chip').forEach(c => c.addEventListener('click', () => {
            this.activeSense = c.dataset.sense; this.render();
        }));
        document.querySelectorAll('.ss-exercise-item').forEach(item => {
            item.addEventListener('click', () => this._startExercise(item.dataset.ex));
        });
        const examBtn = document.getElementById('ss-goto-exam');
        if (examBtn) examBtn.addEventListener('click', () => this.go('exams'));
    }

    _findExercise(id) {
        return (SS_EXERCISES[this.activeSense] || []).find(e => e.id === id);
    }

    /* ---------------- Übungs-Player ---------------- */
    _startExercise(exId) {
        const ex = this._findExercise(exId);
        if (!ex) return;
        const s = SS_SENSE_MAP[this.activeSense];
        const R = 110, C = 2 * Math.PI * R;

        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel ss-player" style="--accent:${s.accent}">
            <h2>${ex.icon} ${ex.title}</h2>
            <div class="ss-ring-wrap" ${ex.breath ? 'style="display:none"' : ''}>
                <svg width="240" height="240">
                    <defs><linearGradient id="ssGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/>
                    </linearGradient></defs>
                    <circle class="ss-ring-bg" cx="120" cy="120" r="${R}"/>
                    <circle class="ss-ring-fg" id="ss-ring" cx="120" cy="120" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="0"/>
                </svg>
                <div class="ss-ring-time" id="ss-time">${this._mmss(ex.dur)}</div>
            </div>
            ${ex.breath ? `<div class="ss-breath-orb" id="ss-orb">Bereit</div>` : ''}
            <div class="ss-instruction" id="ss-instr">${ex.breath ? 'Folge dem Atemrhythmus des Kreises.' : ex.steps[0].text}</div>
            <div class="ss-player-controls">
                <button class="ss-btn ss-btn-ghost" id="ss-stop"><i class="fas fa-xmark"></i> Beenden</button>
            </div>
        </div>`;

        document.getElementById('ss-stop').addEventListener('click', () => { this._stopTimer(); this.render(); });

        if (ex.breath) this._runBreath(ex);
        else this._runGuided(ex, R, C);
    }

    _runGuided(ex, R, C) {
        let elapsed = 0;
        const total = ex.dur;
        let stepIdx = 0;
        let stepEnd = ex.steps[0].sec;
        const ring = document.getElementById('ss-ring');
        const timeEl = document.getElementById('ss-time');
        const instr = document.getElementById('ss-instr');

        this.timer = setInterval(() => {
            elapsed++;
            const left = total - elapsed;
            if (timeEl) timeEl.textContent = this._mmss(Math.max(0, left));
            if (ring) ring.style.strokeDashoffset = C * (elapsed / total);

            if (elapsed >= stepEnd && stepIdx < ex.steps.length - 1) {
                stepIdx++;
                stepEnd += ex.steps[stepIdx].sec;
                if (instr) { instr.style.opacity = 0; setTimeout(() => { instr.textContent = ex.steps[stepIdx].text; instr.style.opacity = 1; }, 350); }
            }
            if (elapsed >= total) { this._stopTimer(); this._completeExercise(ex); }
        }, 1000);
    }

    async _runBreath(ex) {
        const orb = document.getElementById('ss-orb');
        const instr = document.getElementById('ss-instr');
        let stopped = false;
        this._breathStop = () => { stopped = true; };

        for (let r = 0; r < ex.breath.repeats && !stopped; r++) {
            for (const ph of ex.breath.phases) {
                if (stopped) break;
                if (orb) { orb.className = 'ss-breath-orb ' + ph.action; orb.textContent = ph.label; }
                if (instr) instr.textContent = `${ph.label} … (${r + 1}/${ex.breath.repeats})`;
                await this._wait(ph.sec * 1000, () => stopped);
            }
        }
        if (!stopped) this._completeExercise(ex);
    }

    _completeExercise(ex) {
        const id = this.activeSense;
        const before = this._grade(id);
        const minutes = Math.max(1, Math.round(ex.dur / 60));
        this._registerPracticeDay(minutes);
        this.state.senses[id].xp += ex.xp;
        this.state.senses[id].sessions++;
        const after = this._grade(id);

        this._save();
        this._chime();

        if (after > before) this._showLevelUp(id, after);
        else this._toast(`+${ex.xp} Schärfe · ${SS_SENSE_MAP[id].name}`, 'success');

        this._openReflection(ex);
    }

    _openReflection(ex) {
        const s = SS_SENSE_MAP[this.activeSense];
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent};--accent-soft:${s.soft}">
            <h2><i class="fas fa-feather"></i> Was hast du wahrgenommen?</h2>
            <p class="sub">Halte fest, was dir heute auffiel – etwas, das du gestern übersehen hättest. Das schärft den Sinn mehr als die Übung selbst.</p>
            <div class="ss-field">
                <label>Deine Beobachtung (${s.name})</label>
                <textarea class="ss-textarea" id="ss-refl" placeholder="z. B. Ich hörte zum ersten Mal das leise Summen des Kühlschranks unter dem Verkehr …"></textarea>
            </div>
            <div class="ss-field">
                <label>Wie klar war deine Wahrnehmung?</label>
                <div class="ss-rating" id="ss-refl-rating">
                    ${[1,2,3,4,5].map(i => `<span class="star" data-v="${i}">★</span>`).join('')}
                </div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
                <button class="ss-btn ss-btn-primary" id="ss-refl-save"><i class="fas fa-check"></i> Eintrag speichern</button>
                <button class="ss-btn ss-btn-ghost" id="ss-refl-skip">Überspringen</button>
            </div>
        </div>`;

        let rating = 3;
        const stars = main.querySelectorAll('#ss-refl-rating .star');
        const paint = () => stars.forEach(st => st.classList.toggle('on', +st.dataset.v <= rating));
        stars.forEach(st => st.addEventListener('click', () => { rating = +st.dataset.v; paint(); }));
        paint();

        main.querySelector('#ss-refl-save').addEventListener('click', () => {
            const text = main.querySelector('#ss-refl').value.trim();
            this.state.log.unshift({
                id: Date.now(), date: this._today(), sense: this.activeSense,
                exercise: ex.title, text: text || '(ohne Notiz)', rating
            });
            this._save();
            this._toast('Logbuch-Eintrag gespeichert', 'success');
            this.go('dashboard');
        });
        main.querySelector('#ss-refl-skip').addEventListener('click', () => this.go('dashboard'));
    }

    _showLevelUp(senseId, grade) {
        const s = SS_SENSE_MAP[senseId];
        let ov = document.querySelector('.ss-levelup');
        if (!ov) { ov = document.createElement('div'); ov.className = 'ss-levelup'; document.body.appendChild(ov); }
        ov.innerHTML = `
        <div class="ss-levelup-card">
            <div class="seal">${s.icon}</div>
            <h2>Aufstieg!</h2>
            <p>${s.name} · Grad ${grade}<br><strong style="color:#e0b04a;font-size:18px">${SS_titleFor(grade)}</strong></p>
            <button class="ss-btn ss-btn-gold ss-btn-lg" id="ss-lvl-ok">Weiter auf dem Weg</button>
        </div>`;
        ov.classList.add('show');
        ov.querySelector('#ss-lvl-ok').addEventListener('click', () => ov.classList.remove('show'));
        this._chime(true);
    }

    /* ===================== EXAMS ===================== */
    _renderExams() {
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Prüfungen</div>
            <h1>Öffne die nächste Tür</h1>
            <p>Jede Disziplin hat ihre Prüfung. Bestehe sie, um – wenn du genug geübt hast – in den nächsten Grad aufzusteigen. Die geforderte Punktzahl steigt mit jedem Grad: ein Weg, der nie zu Ende geht.</p>
        </div>
        <div class="ss-grid">
            ${SS_SENSES.map(s => {
                const st = this.state.senses[s.id];
                const grade = this._grade(s.id);
                const req = SS_reqExam(grade);
                const best = st.examScores.length ? Math.max(...st.examScores.map(e => e.score)) : 0;
                const needsExam = this._needsExam(s.id);
                return `
                <div class="ss-sense-card" data-exam="${s.id}" style="--accent:${s.accent};--accent-soft:${s.soft};--accent-glow:${s.glow}">
                    <div class="ss-sense-head">
                        <div class="ss-sense-icon">${s.icon}</div>
                        <div>
                            <div class="ss-sense-name">${SS_EXAMS[s.id].title}</div>
                            <div class="ss-sense-grade-name">${st.examScores.length} Versuche · Best ${best}</div>
                        </div>
                        <div class="ss-sense-rank">≥ ${req}</div>
                    </div>
                    <p class="ss-sense-meta" style="margin-top:8px">${needsExam ? '⚑ Tür wartet auf dich' : `Grad ${grade} · ${SS_titleFor(grade)}`}</p>
                </div>`;
            }).join('')}
        </div>`;
    }

    _afterExams() {
        document.querySelectorAll('[data-exam]').forEach(c => {
            c.addEventListener('click', () => this._startExam(c.dataset.exam));
        });
    }

    _startExam(senseId) {
        this.activeSense = senseId;
        const exam = SS_EXAMS[senseId];
        if (exam.type === 'color') return this._examColor(senseId);
        if (exam.type === 'count') return this._examCount(senseId);
        if (exam.type === 'scale') return this._examScale(senseId);
        if (exam.type === 'scenario') return this._examScenario(senseId);
    }

    // --- Empathie-Prüfung (Szenarien, kognitive Empathie) ---
    _examScenario(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const grade = this._grade(senseId);
        const rounds = Math.min(SS_EMP_SCENARIOS.length, 6 + Math.floor(grade / 4));
        const pool = SS_EMP_SCENARIOS.slice().sort(() => Math.random() - 0.5).slice(0, rounds);
        this.exam = { round: 0, total: pool.length, correct: 0, pool, locked: false };
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${SS_EXAMS[senseId].title}</h2>
            <p class="sub">${SS_EXAMS[senseId].protocol} · Bestehen ab ${SS_reqExam(grade)} Punkten.</p>
            <div id="ss-exam-stage"></div>
        </div>`;
        this._renderScenarioRound();
    }

    _renderScenarioRound() {
        const ex = this.exam;
        const stage = document.getElementById('ss-exam-stage');
        if (ex.round >= ex.total) return this._finishExam(Math.round(ex.correct / ex.total * 100));

        const item = ex.pool[ex.round];
        ex.locked = false;
        const order = item.o.map((text, idx) => ({ text, idx })).sort(() => Math.random() - 0.5);

        stage.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <strong>Situation ${ex.round + 1}/${ex.total}</strong>
                <span style="color:var(--ss-text-dim);font-size:13px">Was ist am ehesten empathisch?</span>
            </div>
            <div class="ss-scenario">${this._esc(item.s)}</div>
            <div class="ss-options">
                ${order.map(op => `<button class="ss-option" data-idx="${op.idx}">${this._esc(op.text)}</button>`).join('')}
            </div>
            <div id="ss-scenario-feedback"></div>`;

        stage.querySelectorAll('.ss-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (ex.locked) return;
                ex.locked = true;
                const chosen = +btn.dataset.idx;
                const correct = item.a;
                const right = chosen === correct;
                stage.querySelectorAll('.ss-option').forEach(b => {
                    const i = +b.dataset.idx;
                    if (i === correct) b.classList.add('correct');
                    else if (i === chosen) b.classList.add('wrong');
                    b.disabled = true;
                });
                if (right) ex.correct++;

                const last = ex.round >= ex.total - 1;
                const fb = document.getElementById('ss-scenario-feedback');
                if (fb) {
                    fb.innerHTML = `
                    <div class="ss-scenario-why ${right ? 'right' : 'wrong'}">
                        <div class="head">${right ? '<i class="fas fa-check-circle"></i> Fein wahrgenommen' : '<i class="fas fa-lightbulb"></i> Schau genauer hin'}</div>
                        <p>${this._esc(item.w)}</p>
                    </div>
                    <button class="ss-btn ss-btn-primary" id="ss-scenario-next">${last ? '<i class="fas fa-flag-checkered"></i> Auswerten' : 'Weiter'} <i class="fas fa-arrow-right-long"></i></button>`;
                    const next = document.getElementById('ss-scenario-next');
                    next.addEventListener('click', () => { ex.round++; this._renderScenarioRound(); });
                    next.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
    }

    // --- Farb-Prüfung (interaktiv, skaliert mit Grad) ---
    _examColor(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const grade = this._grade(senseId);
        const rounds = Math.min(8 + Math.floor(grade / 2), 20);
        this.exam = { round: 0, total: rounds, correct: 0, grade };
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${SS_EXAMS[senseId].title}</h2>
            <p class="sub">${SS_EXAMS[senseId].protocol} · Bestehen ab ${SS_reqExam(grade)} Punkten.</p>
            <div id="ss-exam-stage"></div>
        </div>`;
        this._renderColorRound();
    }

    _renderColorRound() {
        const ex = this.exam;
        const stage = document.getElementById('ss-exam-stage');
        if (ex.round >= ex.total) return this._finishExam(Math.round(ex.correct / ex.total * 100));

        const count = 9;
        const hue = Math.floor(Math.random() * 360);
        const sat = 45 + Math.random() * 20;
        const light = 50 + Math.random() * 10;
        // wird mit Runde UND Grad feiner
        const delta = Math.max(2.2, 20 - ex.round * 2 - ex.grade * 0.6);
        const odd = Math.floor(Math.random() * count);
        const base = `hsl(${hue}, ${sat}%, ${light}%)`;
        const oddC = `hsl(${hue}, ${sat}%, ${light + delta}%)`;

        stage.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <strong>Runde ${ex.round + 1}/${ex.total}</strong>
                <span style="color:var(--ss-text-dim);font-size:13px">Welches Feld weicht ab?</span>
            </div>
            <div class="ss-swatch-grid">
                ${Array.from({ length: count }, (_, i) => `<div class="ss-swatch" data-i="${i}" style="background:${i === odd ? oddC : base}"></div>`).join('')}
            </div>`;
        stage.querySelectorAll('.ss-swatch').forEach(sw => {
            sw.addEventListener('click', () => {
                if (+sw.dataset.i === odd) ex.correct++;
                else sw.style.outline = '3px solid #ef4444';
                ex.round++;
                setTimeout(() => this._renderColorRound(), 180);
            });
        });
    }

    _examCount(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const exam = SS_EXAMS[senseId];
        const grade = this._grade(senseId);
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${exam.title}</h2>
            <p class="sub">${exam.protocol} · Bestehen ab ${SS_reqExam(grade)} Punkten.</p>
            <div class="ss-field">
                <label>Wie viele ${exam.unit} konntest du klar unterscheiden / erkennen?</label>
                <div class="ss-slider-row">
                    <input type="range" id="ss-count" min="0" max="${exam.target + 6}" value="0">
                    <span class="ss-slider-val" id="ss-count-val">0</span>
                </div>
                <p style="color:var(--ss-text-faint);font-size:13px;margin-top:6px">Richtwert für volle Punktzahl: ${exam.target} ${exam.unit}. Sei ehrlich – nur so misst du echten Fortschritt.</p>
            </div>
            <button class="ss-btn ss-btn-primary" id="ss-count-submit"><i class="fas fa-flag-checkered"></i> Prüfung abschließen</button>
        </div>`;
        const slider = main.querySelector('#ss-count');
        const val = main.querySelector('#ss-count-val');
        slider.addEventListener('input', () => val.textContent = slider.value);
        main.querySelector('#ss-count-submit').addEventListener('click', () => {
            const score = Math.min(100, Math.round((+slider.value / exam.target) * 100));
            this._finishExam(score);
        });
    }

    _examScale(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const exam = SS_EXAMS[senseId];
        const grade = this._grade(senseId);
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${exam.title}</h2>
            <p class="sub">${exam.protocol} · Bestehen ab ${SS_reqExam(grade)} Punkten.</p>
            <div class="ss-field">
                <label>Klarheit deiner inneren Wahrnehmung (0–10)</label>
                <div class="ss-slider-row">
                    <input type="range" id="ss-scale" min="0" max="10" value="5">
                    <span class="ss-slider-val" id="ss-scale-val">5</span>
                </div>
            </div>
            <button class="ss-btn ss-btn-primary" id="ss-scale-submit"><i class="fas fa-flag-checkered"></i> Prüfung abschließen</button>
        </div>`;
        const slider = main.querySelector('#ss-scale');
        const val = main.querySelector('#ss-scale-val');
        slider.addEventListener('input', () => val.textContent = slider.value);
        main.querySelector('#ss-scale-submit').addEventListener('click', () => this._finishExam(+slider.value * 10));
    }

    _finishExam(score) {
        const senseId = this.activeSense;
        const s = SS_SENSE_MAP[senseId];
        const st = this.state.senses[senseId];
        const before = this._grade(senseId);
        const req = SS_reqExam(before);

        st.examScores.push({ date: this._today(), grade: before, score });
        if (score > (st.bestExam || 0)) st.bestExam = score;

        const passed = score >= req;
        if (passed) st.doorGrade = Math.max(st.doorGrade || 0, before); // Tür von 'before' → 'before+1' geöffnet

        const xpGain = Math.round(score); // Prüfungen geben kräftig Schärfe
        st.xp += xpGain;

        const after = this._grade(senseId);
        this._save();
        this._chime(passed);

        const deg = Math.round(score * 3.6);
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="text-align:center;--accent:${s.accent}">
            <h2>${s.icon} Prüfungsergebnis</h2>
            <div class="ss-score-circle" style="--deg:${deg}deg"><span class="val">${score}</span></div>
            <p class="sub" style="text-align:center">${passed
                ? '<strong style="color:#34d399">Tür geöffnet!</strong> +' + xpGain + ' Schärfe'
                : `Noch nicht bestanden (≥ ${req} nötig). +${xpGain} Schärfe. Übe weiter – jeder Versuch zählt und wird festgehalten.`}</p>
            ${after > before ? `<p style="color:#e0b04a;font-weight:600">Aufstieg in Grad ${after}: ${SS_titleFor(after)}!</p>` : ''}
            <div class="ss-player-controls">
                <button class="ss-btn ss-btn-ghost" id="ss-exam-retry">Nochmal</button>
                <button class="ss-btn ss-btn-primary" id="ss-exam-back">Zur Übersicht</button>
            </div>
        </div>`;
        main.querySelector('#ss-exam-retry').addEventListener('click', () => this._startExam(senseId));
        main.querySelector('#ss-exam-back').addEventListener('click', () => this.go('dashboard'));
        if (after > before) setTimeout(() => this._showLevelUp(senseId, after), 400);
    }

    /* ===================== JOURNAL ===================== */
    _renderJournal() {
        const log = this.state.log || [];
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Logbuch</div>
            <h1>Dein Wahrnehmungs-Tagebuch</h1>
            <p>${log.length} Einträge. Jede Notiz ist ein Beweis, dass du heute etwas wahrgenommen hast, das anderen entgangen wäre.</p>
        </div>
        <div class="ss-panel">
            <div class="ss-field">
                <label>Freier Eintrag</label>
                <select class="ss-select" id="ss-j-sense" style="margin-bottom:10px">
                    ${SS_SENSES.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
                </select>
                <textarea class="ss-textarea" id="ss-j-text" placeholder="Was hast du heute bewusst wahrgenommen?"></textarea>
            </div>
            <button class="ss-btn ss-btn-primary" id="ss-j-save"><i class="fas fa-plus"></i> Eintrag hinzufügen</button>
        </div>
        <div id="ss-journal-list">
            ${log.length === 0
                ? `<div class="ss-empty"><i class="fas fa-feather"></i>Noch keine Einträge. Beginne mit einer Übung im Dojo.</div>`
                : log.map(e => this._logEntry(e)).join('')}
        </div>`;
    }

    _logEntry(e) {
        const s = SS_SENSE_MAP[e.sense] || SS_SENSES[0];
        const stars = e.rating ? ' · ' + '★'.repeat(e.rating) : '';
        return `
        <div class="ss-log-entry" style="--accent:${s.accent};--accent-soft:${s.soft}">
            <div class="ss-log-meta">
                <span class="ss-log-tag">${s.icon} ${s.name}</span>
                <span>${this._fmtDate(e.date)}</span>
                ${e.exercise ? `<span>· ${e.exercise}</span>` : ''}
                <span style="color:#e0b04a">${stars}</span>
            </div>
            <div class="ss-log-text">${this._esc(e.text)}</div>
        </div>`;
    }

    _afterJournal() {
        const btn = document.getElementById('ss-j-save');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const text = document.getElementById('ss-j-text').value.trim();
            if (!text) { this._toast('Bitte schreibe etwas.'); return; }
            const sense = document.getElementById('ss-j-sense').value;
            this.state.log.unshift({ id: Date.now(), date: this._today(), sense, text, rating: 0 });
            this._save();
            this._toast('Eintrag gespeichert', 'success');
            this.render();
        });
    }

    /* ===================== JOURNEY (Timeline) ===================== */
    _renderJourney() {
        const startYear = new Date(this.state.startedAt).getFullYear();
        const thisYear = new Date().getFullYear();
        const years = [];
        for (let y = startYear; y <= thisYear; y++) years.push(y);
        const daySet = new Set(this.state.practiceDays || []);

        const yearRows = years.map(y => {
            const cells = [];
            for (let w = 0; w < 53; w++) {
                let lit = false;
                for (let d = 0; d < 7; d++) {
                    const dd = new Date(y, 0, 1 + w * 7 + d).toISOString().slice(0, 10);
                    if (daySet.has(dd)) { lit = true; break; }
                }
                cells.push(`<div class="ss-day-cell ${lit ? 'lit' : ''}"></div>`);
            }
            return `<div class="ss-year-row"><div class="ss-year-label">${y}</div><div class="ss-year-track">${cells.join('')}</div></div>`;
        }).join('');

        const masteryRows = SS_SENSES.map(s => {
            const grade = this._grade(s.id);
            const prog = this._gradeProgress(s.id);
            return `
            <div class="ss-mastery-row">
                <div class="name">${s.icon} ${s.name}</div>
                <div class="bar"><span style="width:${prog}%"></span></div>
                <div class="rank">Grad ${grade}</div>
            </div>`;
        }).join('');

        const days = (this.state.practiceDays || []).length;
        const yearsActive = years.length;

        return `
        <div class="ss-hero">
            <div class="ss-kicker">Deine Reise</div>
            <h1>Ein Leben der Wahrnehmung</h1>
            <p>Begonnen ${this._fmtDate(this.state.startedAt)} · ${days} Übungstage über ${yearsActive} ${yearsActive === 1 ? 'Jahr' : 'Jahre'}. Der Weg ist nicht eilig – er ist stetig und ohne Ende.</p>
        </div>

        <div class="ss-panel">
            <h3><i class="fas fa-mountain-sun"></i> Stand der Meisterschaft</h3>
            <div class="ss-mastery-bar">${masteryRows}</div>
        </div>

        <div class="ss-panel">
            <h3><i class="fas fa-calendar-days"></i> Übungs-Chronik</h3>
            ${yearRows}
            <div class="ss-legend"><span>Weniger</span>
                <span class="ss-day-cell" style="width:11px;opacity:.5"></span>
                <span class="ss-day-cell lit" style="width:11px"></span>
                <span>Mehr</span>
            </div>
        </div>

        <div class="ss-quote">„${SS_QUOTES[4].t}"<span class="who">— ${SS_QUOTES[4].w}</span></div>`;
    }

    /* ===================== ARENA (anonyme Rangliste) ===================== */
    _renderArena() {
        const total = this._totalXP();
        const loggedIn = this._isLoggedIn();

        const head = `
        <div class="ss-hero">
            <div class="ss-kicker">Arena · anonym</div>
            <h1>Wer hat die feinsten Sinne?</h1>
            <p>Miss dich anonym mit allen Übenden. Verglichen wird deine <strong>Schärfe</strong> – die Summe aus Praxis und bestandenen Prüfungen. Niemand sieht, wer du bist; nur dein selbstgewähltes Pseudonym.</p>
        </div>`;

        const aliasPanel = `
        <div class="ss-panel">
            <h3><i class="fas fa-user-secret"></i> Dein Pseudonym</h3>
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
                <div style="font-size:22px;font-weight:800">${this._esc(this.state.alias)}</div>
                <button class="ss-btn ss-btn-ghost" id="ss-alias-reroll" style="padding:8px 14px;font-size:13px"><i class="fas fa-dice"></i> Neu würfeln</button>
            </div>
            <div style="margin-top:14px;display:flex;gap:20px;flex-wrap:wrap">
                <div><div style="font-size:24px;font-weight:800">${total.toLocaleString('de-DE')}</div><div style="color:var(--ss-text-dim);font-size:12px">Deine Schärfe</div></div>
                <div><div style="font-size:24px;font-weight:800;color:#e0b04a">${this._overallTitle()}</div><div style="color:var(--ss-text-dim);font-size:12px">Dein Titel (Grad ${this._overallGrade()})</div></div>
            </div>
            ${loggedIn
                ? `<button class="ss-btn ss-btn-gold ss-btn-block" id="ss-arena-submit" style="margin-top:18px"><i class="fas fa-trophy"></i> In die Arena eintragen / aktualisieren</button>`
                : `<div style="margin-top:18px;background:rgba(99,102,241,.12);border:1px solid var(--ss-line);padding:14px 16px;border-radius:12px;color:var(--ss-text-dim);font-size:14px">
                     <i class="fas fa-lock"></i> Melde dich an, um anonym anzutreten – so bleibt dein Rang geräteübergreifend erhalten.
                     <button class="ss-btn ss-btn-primary" id="ss-arena-login" style="margin-top:10px;padding:9px 16px;font-size:14px">Anmelden</button>
                   </div>`}
        </div>`;

        const board = `
        <div class="ss-panel">
            <h3><i class="fas fa-ranking-star"></i> Rangliste der feinsten Sinne</h3>
            <div id="ss-lb-list"><div class="ss-empty"><i class="fas fa-circle-notch fa-spin"></i>Lade Rangliste …</div></div>
        </div>`;

        return head + aliasPanel + board;
    }

    _afterArena() {
        const reroll = document.getElementById('ss-alias-reroll');
        if (reroll) reroll.addEventListener('click', () => {
            this.state.alias = this._generateAlias();
            this._save();
            this.render();
        });
        const login = document.getElementById('ss-arena-login');
        if (login) login.addEventListener('click', () => this._openLogin());
        const submit = document.getElementById('ss-arena-submit');
        if (submit) submit.addEventListener('click', async () => {
            submit.disabled = true;
            submit.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Wird eingetragen …';
            await this._lbSubmit();
            await this._lbRefresh();
            this._toast('In der Arena eingetragen!', 'gold');
            this.render();
        });

        // Auto-Submit, wenn eingeloggt und Schärfe vorhanden – hält den Rang aktuell
        if (this._isLoggedIn() && this._totalXP() > 0) this._lbSubmit();
        this._lbRefresh();
    }

    _lbBase() {
        const base = (window.AWS_APP_CONFIG && window.AWS_APP_CONFIG.API_BASE) || 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
        return base.replace(/\/$/, '') + '/snowflake-highscores';
    }

    async _lbSubmit() {
        const id = this._identityId();
        if (!id) return;
        try {
            await fetch(this._lbBase(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game: 'sinnesschule',
                    userId: id,
                    name: this.state.alias,
                    title: this._overallTitle(),
                    score: this._totalXP()
                })
            });
        } catch (e) { console.warn('Arena-Submit fehlgeschlagen:', e); }
    }

    async _lbRefresh() {
        const listEl = document.getElementById('ss-lb-list');
        if (!listEl) return;
        try {
            const res = await fetch(this._lbBase() + '?game=sinnesschule&limit=25');
            const data = await res.json();
            this.leaderboard = (data && data.highscores) || [];
        } catch (e) {
            this.leaderboard = [];
            console.warn('Arena-Load fehlgeschlagen:', e);
        }
        this._renderLeaderboardList();
    }

    _renderLeaderboardList() {
        const listEl = document.getElementById('ss-lb-list');
        if (!listEl) return;
        const board = this.leaderboard || [];
        if (board.length === 0) {
            listEl.innerHTML = `<div class="ss-empty"><i class="fas fa-trophy"></i>Noch keine Einträge. Sei die / der Erste!</div>`;
            return;
        }
        const myAlias = this.state.alias;
        const medals = ['🥇', '🥈', '🥉'];
        listEl.innerHTML = `<div class="ss-lb">${board.map((e, i) => {
            const mine = e.name === myAlias;
            const rank = i < 3 ? medals[i] : (i + 1);
            return `
            <div class="ss-lb-row ${mine ? 'me' : ''}">
                <div class="ss-lb-rank">${rank}</div>
                <div class="ss-lb-name">${this._esc(e.name)}${e.title ? `<span class="ss-lb-title">${this._esc(e.title)}</span>` : ''}</div>
                <div class="ss-lb-score">${Number(e.score).toLocaleString('de-DE')}</div>
            </div>`;
        }).join('')}</div>`;
    }

    /* ===================== Utils ===================== */
    _stopTimer() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        if (this._breathStop) { this._breathStop(); this._breathStop = null; }
    }

    _wait(ms, abort) {
        return new Promise(res => {
            const start = Date.now();
            const tick = () => {
                if (abort && abort()) return res();
                if (Date.now() - start >= ms) return res();
                setTimeout(tick, 100);
            };
            tick();
        });
    }

    _mmss(sec) {
        const m = Math.floor(sec / 60), s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    _fmtDate(iso) {
        try { return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return iso; }
    }

    _esc(str) {
        const d = document.createElement('div'); d.textContent = str == null ? '' : String(str); return d.innerHTML;
    }

    _toast(msg, type) {
        const t = document.getElementById('ss-toast');
        if (!t) return;
        t.textContent = msg;
        t.className = 'ss-toast show' + (type ? ' ' + type : '');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.className = 'ss-toast', 2200);
    }

    _chime(big) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = big ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 880];
            notes.forEach((f, i) => {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.connect(g); g.connect(ctx.destination);
                o.type = 'sine'; o.frequency.value = f;
                const t0 = ctx.currentTime + i * 0.12;
                g.gain.setValueAtTime(0.0001, t0);
                g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.03);
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
                o.start(t0); o.stop(t0 + 0.5);
            });
        } catch (e) { /* ignore */ }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sinnesschule = new Sinnesschule();
    window.sinnesschule.init();
});
