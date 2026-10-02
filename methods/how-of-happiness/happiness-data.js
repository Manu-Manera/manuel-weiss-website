/* =====================================================================
   The How of Happiness · Datenbasis
   Nach Sonja Lyubomirsky, "The How of Happiness" (dt. "Glücklich sein").
   Enthält: Glückskuchen, Subjective Happiness Scale, Fit-Diagnostik-
   Dimensionen, die 12 Glücksaktivitäten mit je 4–6 konkreten Übungen
   (Dauer, Dosierung, Prompts, Timer), die "Five Hows" und Querverweise
   auf bestehende Methoden der Persönlichkeitsentwicklung.
   ===================================================================== */
(function (global) {
    'use strict';

    const PIE = [
        { id: 'setpoint', label: 'Genetischer Sollwert', pct: 50, color: '#cbd5e1', d: 'Dein angeborenes Glücksniveau – Zwillingsstudien zeigen: rund die Hälfte der Unterschiede zwischen Menschen ist vererbt. Daran lässt sich wenig drehen.' },
        { id: 'circ', label: 'Lebensumstände', pct: 10, color: '#94a3b8', d: 'Einkommen, Wohnort, Aussehen, Familienstand – überraschend klein, weil wir uns an fast alles gewöhnen (hedonische Adaptation).' },
        { id: 'activity', label: 'Absichtsvolles Handeln', pct: 40, color: '#f59e0b', d: 'Was du täglich denkst und tust. Dieses Stück ist beeinflussbar – genau hier setzt diese Methode an.' }
    ];

    /* Subjective Happiness Scale (Lyubomirsky & Lepper, 1999) · 4 Items, 1–7 */
    const SHS = [
        { id: 'shs1', q: 'Im Allgemeinen halte ich mich für …', lo: 'keinen sehr glücklichen Menschen', hi: 'einen sehr glücklichen Menschen', rev: false },
        { id: 'shs2', q: 'Verglichen mit den meisten Menschen in meinem Umfeld halte ich mich für …', lo: 'weniger glücklich', hi: 'glücklicher', rev: false },
        { id: 'shs3', q: 'Manche Menschen sind grundsätzlich sehr glücklich. Sie geniessen das Leben, egal was passiert, und holen das Beste aus allem heraus. Wie sehr trifft das auf dich zu?', lo: 'überhaupt nicht', hi: 'sehr stark', rev: false },
        { id: 'shs4', q: 'Manche Menschen sind grundsätzlich nicht sehr glücklich. Sie sind nicht depressiv, wirken aber nie so glücklich, wie sie sein könnten. Wie sehr trifft das auf dich zu?', lo: 'überhaupt nicht', hi: 'sehr stark', rev: true }
    ];

    /* Person-Activity-Fit · 5 Dimensionen, 1–7 */
    const FIT_DIMS = [
        { id: 'nat', label: 'Natürlich', sign: 1, q: 'Ich werde dabeibleiben, weil sich diese Tätigkeit für mich natürlich anfühlt.' },
        { id: 'enj', label: 'Freude', sign: 1, q: 'Ich werde dabeibleiben, weil sie mir Spass macht – ich finde sie interessant und herausfordernd.' },
        { id: 'val', label: 'Wert', sign: 1, q: 'Ich werde dabeibleiben, weil ich sie wertschätze und mich damit identifiziere – auch wenn sie mal keinen Spass macht.' },
        { id: 'gui', label: 'Schuld', sign: -1, q: 'Ich werde dabeibleiben, weil ich mich sonst schuldig, beschämt oder ängstlich fühlen würde – ich müsste mich zwingen.' },
        { id: 'sit', label: 'Situation', sign: -1, q: 'Ich werde dabeibleiben, weil jemand anderes es will oder meine Situation mich dazu zwingt.' }
    ];

    /* Die 12 Glücksaktivitäten */
    const ACTIVITIES = [
        {
            id: 'gratitude', n: 1, ic: '🙏', title: 'Dankbarkeit ausdrücken', color: '#f59e0b',
            short: 'Das Gute bewusst wahrnehmen – und es aussprechen.',
            why: 'Dankbarkeit verstärkt das Auskosten positiver Erlebnisse, stärkt Selbstwert, hilft beim Umgang mit Stress, fördert moralisches Verhalten, baut Beziehungen auf, hemmt Neid und wirkt der hedonischen Adaptation entgegen.',
            research: 'Emmons & McCullough (2003): Wer wöchentlich fünf Dinge aufschreibt, für die er dankbar ist, ist nach 10 Wochen optimistischer, zufriedener und sogar körperlich gesünder. Seligman (2005): Ein Dankbarkeitsbesuch hob die Stimmung einen Monat lang.',
            dose: 'Tagebuch: 1× pro Woche wirkt besser als 3× (Abnutzung!). Brief/Besuch: alle paar Wochen. Direkt aussprechen: täglich klein.',
            links: [{ m: 'journaling', l: 'Journaling-Methode' }],
            exercises: [
                { id: 'gr_journal', title: 'Dankbarkeits-Tagebuch', min: 10, timer: 0, dose: '1× pro Woche', intro: 'Denk an die vergangene Woche zurück. Notiere fünf Dinge, für die du dankbar bist – gross oder klein. Wichtig: Nicht abhaken, sondern kurz spüren und begründen.', prompts: [
                    { l: '1. Wofür bin ich dankbar – und warum?', p: 'z. B. „Für das Gespräch mit Lena – weil sie mir wirklich zugehört hat"' },
                    { l: '2.', p: '' }, { l: '3.', p: '' }, { l: '4.', p: '' }, { l: '5.', p: '' }
                ], tip: 'Variiere die Lebensbereiche (Beziehungen, Körper, Arbeit, Natur, Kleinigkeiten), damit die Übung frisch bleibt.' },
                { id: 'gr_letter', title: 'Dankbarkeitsbrief', min: 30, timer: 0, dose: 'alle 4–6 Wochen', intro: 'Wähle einen Menschen, dem du nie richtig gedankt hast. Schreib einen konkreten Brief: Was hat die Person getan, was hat es in deinem Leben bewirkt, wo spürst du es heute noch?', prompts: [
                    { l: 'An wen?', p: 'Name' },
                    { l: 'Was hat diese Person konkret für mich getan?', p: '' },
                    { l: 'Wie hat es mein Leben verändert? Wo wirkt es heute noch?', p: '' },
                    { l: 'Der Brief', p: 'Liebe/r …' }
                ], tip: 'Ob du den Brief abschickst, entscheidest du. Allein das Schreiben hebt die Stimmung messbar.' },
                { id: 'gr_visit', title: 'Dankbarkeitsbesuch', min: 60, timer: 0, dose: '1× pro Quartal', intro: 'Die stärkste Dankbarkeitsübung, die wir kennen: Lies deinen Brief der Person persönlich vor. Plane Zeitpunkt und Ort – und reflektiere danach.', prompts: [
                    { l: 'Wem lese ich vor? Wann und wo?', p: '' },
                    { l: 'Wie hat die Person reagiert?', p: '' },
                    { l: 'Wie ging es mir danach?', p: '' }
                ], tip: 'Kündige nur ein Treffen an, nicht den Zweck – die Überraschung gehört dazu.' },
                { id: 'gr_say', title: 'Dankbarkeit direkt aussprechen', min: 2, timer: 0, dose: 'täglich', intro: 'Sag heute einem Menschen konkret Danke – nicht höflich-automatisch, sondern für etwas Bestimmtes.', prompts: [
                    { l: 'Wem habe ich heute wofür gedankt?', p: '' },
                    { l: 'Wie war die Reaktion?', p: '' }
                ], tip: 'Formel: „Danke, dass du … – das hat für mich bedeutet, dass …"' },
                { id: 'gr_subtract', title: 'Was wäre, wenn nicht? (mentale Subtraktion)', min: 10, timer: 0, dose: 'alle 2 Wochen', intro: 'Wähle etwas Gutes in deinem Leben (Mensch, Fähigkeit, Umstand). Stell dir lebhaft vor, es wäre nie passiert. Wie sähe dein Leben aus? Dann kehre zurück – mit frischem Blick.', prompts: [
                    { l: 'Welches Gute nehme ich mir vor?', p: '' },
                    { l: 'Wie wäre mein Leben ohne es?', p: '' },
                    { l: 'Was fühle ich jetzt, da ich es habe?', p: '' }
                ], tip: 'Wirkt stärker als blosses „Dankbar sein", weil es die Gewöhnung aufbricht (Koo et al., 2008).' }
            ]
        },
        {
            id: 'optimism', n: 2, ic: '🌅', title: 'Optimismus kultivieren', color: '#f97316',
            short: 'Die Zukunft so sehen, dass du handeln willst.',
            why: 'Optimismus ist kein Schönreden, sondern die Erwartung, dass Anstrengung sich lohnt. Optimisten verfolgen Ziele hartnäckiger, bewältigen Rückschläge besser und sind gesünder.',
            research: 'King (2001): 20 Minuten „Best Possible Self"-Schreiben an 4 Tagen hebt Stimmung und Wohlbefinden über Wochen. Seligman: Optimismus ist lernbar (erklärender Stil).',
            dose: 'Best Possible Self: 20 Min an 4 aufeinanderfolgenden Tagen, dann 1× pro Woche auffrischen. Barrieren-Gedanken: bei Bedarf.',
            links: [{ m: 'vision-board', l: 'Vision Board' }, { m: 'goal-setting', l: 'Ziel-Setting' }],
            exercises: [
                { id: 'op_bps', title: 'Mein bestmögliches Ich (Best Possible Self)', min: 20, timer: 20, dose: '4 Tage in Folge, dann wöchentlich', intro: 'Stell dir dein Leben in 5–10 Jahren vor. Du hast hart gearbeitet, alles ist so gut gelaufen, wie es realistisch möglich war. Schreib 20 Minuten ununterbrochen – in Gegenwartsform, konkret, sinnlich.', prompts: [
                    { l: 'Welcher Lebensbereich heute? (Beruf, Beziehung, Gesundheit, Wohnen, …)', p: '' },
                    { l: 'Mein bestmögliches Ich in diesem Bereich', p: 'Es ist 2031. Ich wache auf und …' },
                    { l: 'Welche Stärken von mir machen das möglich?', p: '' }
                ], tip: 'Es geht nicht um Tagträume, sondern darum, Ziele und Prioritäten zu klären. Pro Sitzung einen Bereich.' },
                { id: 'op_paths', title: 'Ziel- & Wege-Denken', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Hoffnung = Ziel + mehrere Wege + Zutrauen (Snyder). Nimm ein Ziel und finde bewusst drei verschiedene Wege dorthin – und was du tust, wenn Weg 1 blockiert ist.', prompts: [
                    { l: 'Mein Ziel', p: '' },
                    { l: 'Weg 1 / Weg 2 / Weg 3', p: '' },
                    { l: 'Wenn der erste Weg scheitert, dann …', p: '' }
                ], tip: 'Mehrere Wege zu kennen, macht Hindernisse zu Umwegen statt zu Sackgassen.' },
                { id: 'op_dispute', title: 'Barrieren-Gedanken hinterfragen', min: 10, timer: 0, dose: 'bei Bedarf', intro: 'Pessimistische Gedanken sind Hypothesen, keine Fakten. Behandle sie wie ein Anwalt: Beweise dafür, Beweise dagegen, alternative Erklärung.', prompts: [
                    { l: 'Der pessimistische Gedanke', p: '„Das schaffe ich nie, weil …"' },
                    { l: 'Beweise, die dafür sprechen', p: '' },
                    { l: 'Beweise, die dagegen sprechen', p: '' },
                    { l: 'Eine realistischere, hilfreiche Sichtweise', p: '' }
                ], tip: 'Achte auf die drei P des Pessimismus: permanent („immer"), pervasiv („alles"), persönlich („nur ich").' },
                { id: 'op_silver', title: 'Silberstreifen-Suche', min: 5, timer: 0, dose: 'nach Rückschlägen', intro: 'Nicht alles ist gut – aber in fast allem steckt etwas Nützliches. Finde zu einem heutigen Ärger den Silberstreifen.', prompts: [
                    { l: 'Was ist heute schiefgelaufen?', p: '' },
                    { l: 'Was ist trotzdem gut daran / was habe ich gelernt?', p: '' },
                    { l: 'Welche Tür öffnet das?', p: '' }
                ], tip: 'Formuliere laut: „Das ist ärgerlich – und gleichzeitig …"' }
            ]
        },
        {
            id: 'overthinking', n: 3, ic: '🌀', title: 'Grübeln & Vergleiche vermeiden', color: '#64748b',
            short: 'Aus der Gedankenschleife aussteigen.',
            why: 'Grübeln (Rumination) verschlimmert Traurigkeit, verzerrt das Denken, lähmt die Problemlösung und vertreibt Unterstützer. Soziale Vergleiche nach oben machen unzufrieden – egal wie gut es dir geht.',
            research: 'Nolen-Hoeksema: Grübler sind anfälliger für Depression und lösen Probleme schlechter. Lyubomirsky: Glückliche Menschen nutzen soziale Vergleiche kaum als Massstab.',
            dose: 'Ablenkung sofort bei Grübelbeginn. Grübel-Termin max. 1× täglich 30 Min. Vergleichs-Detox: täglich kurz.',
            links: [{ m: 'mindfulness', l: 'Achtsamkeit & Meditation' }, { m: 'stress-management', l: 'Stress-Management' }],
            exercises: [
                { id: 'ov_distract', title: 'Ablenkungs-Toolbox', min: 15, timer: 15, dose: 'bei Grübelbeginn', intro: 'Grübeln lässt sich nicht wegdenken, aber unterbrechen. Wähle eine absorbierende Tätigkeit (Bewegung, Musik, Aufräumen, Anruf, Rätsel) und bleib 15 Minuten dran.', prompts: [
                    { l: 'Worüber kreise ich gerade?', p: '' },
                    { l: 'Meine Ablenkung für die nächsten 15 Min', p: '' },
                    { l: 'Intensität des Grübelns danach (1–10)', p: '' }
                ], tip: 'Fernsehen und Scrollen zählen nicht – sie absorbieren nicht genug.' },
                { id: 'ov_stop', title: '„Stopp!"-Technik', min: 1, timer: 0, dose: 'jederzeit', intro: 'Sobald du dich beim Grübeln ertappst: Sag innerlich (oder laut) „Stopp!", stell dir ein rotes Stoppschild vor, atme dreimal tief – und lenk die Aufmerksamkeit bewusst auf etwas Konkretes im Raum.', prompts: [
                    { l: 'Wie oft heute gebraucht? Was hat geholfen?', p: '' }
                ], tip: 'Ein Gummiband am Handgelenk kann als physischer Anker dienen.' },
                { id: 'ov_appointment', title: 'Grübel-Termin', min: 30, timer: 30, dose: 'max. 1× täglich', intro: 'Gib dem Grübeln einen festen Platz: 30 Minuten, in denen du alle Sorgen aufschreibst. Taucht ausserhalb eine Sorge auf: „Nicht jetzt – um 18 Uhr."', prompts: [
                    { l: 'Alle Sorgen, ungefiltert', p: '' },
                    { l: 'Welche davon kann ich beeinflussen?', p: '' },
                    { l: 'Erster kleiner Schritt für eine davon', p: '' }
                ], tip: 'Termin pünktlich beenden – auch mitten im Satz.' },
                { id: 'ov_step', title: 'Kleinster erster Schritt', min: 10, timer: 0, dose: 'bei Problemen', intro: 'Grübeln fühlt sich an wie Problemlösen, ist es aber nicht. Der Ausweg: eine winzige Handlung. Was kannst du in den nächsten 10 Minuten tun, das das Problem 1 % kleiner macht?', prompts: [
                    { l: 'Das Problem in einem Satz', p: '' },
                    { l: 'Mein 10-Minuten-Schritt', p: 'z. B. „E-Mail-Entwurf schreiben"' },
                    { l: 'Erledigt? Wie fühlt es sich an?', p: '' }
                ], tip: 'Handlung schlägt Analyse – fast immer.' },
                { id: 'ov_compare', title: 'Vergleichs-Detox', min: 5, timer: 0, dose: 'täglich abends', intro: 'Wo hast du dich heute mit anderen verglichen (Social Media, Kolleginnen, Freunde)? Ersetze den Fremdmassstab durch deinen eigenen.', prompts: [
                    { l: 'Wo habe ich mich heute verglichen?', p: '' },
                    { l: 'Welchen Auslöser könnte ich reduzieren?', p: 'z. B. Instagram vor dem Schlafen' },
                    { l: 'Mein eigener Massstab: Bin ich heute weitergekommen als gestern?', p: '' }
                ], tip: 'Vergleiche dich mit deinem früheren Ich – das ist der einzige faire Vergleich.' }
            ]
        },
        {
            id: 'kindness', n: 4, ic: '💛', title: 'Freundlichkeit üben', color: '#eab308',
            short: 'Gutes tun – gezielt, abwechslungsreich, gebündelt.',
            why: 'Gute Taten lassen dich dich selbst als grosszügig und fähig erleben, bauen Beziehungen auf, lösen Dankbarkeit und Gegenseitigkeit aus und lenken von eigenen Problemen ab.',
            research: 'Lyubomirsky et al. (2005): Fünf gute Taten an einem einzigen Tag pro Woche steigern das Glück deutlich – verteilt über die Woche verpufft der Effekt. Vielfalt der Taten verhindert Gewöhnung.',
            dose: 'Kindness Day: 5 Taten an einem Tag, 1× pro Woche. Wechsle die Art der Taten alle paar Wochen.',
            links: [{ m: 'values-clarification', l: 'Werte-Klärung' }],
            exercises: [
                { id: 'ki_day', title: 'Kindness Day – 5 gute Taten', min: 60, timer: 0, dose: '1× pro Woche', intro: 'Wähle einen Tag. Tu fünf Dinge für andere, die über dein normales Verhalten hinausgehen – gross oder klein, für Bekannte oder Fremde.', prompts: [
                    { l: '1. gute Tat', p: 'z. B. Kaffee für die Person hinter mir' },
                    { l: '2.', p: '' }, { l: '3.', p: '' }, { l: '4.', p: '' }, { l: '5.', p: '' },
                    { l: 'Wie habe ich mich danach gefühlt?', p: '' }
                ], tip: 'Fünf an einem Tag – nicht eine pro Tag. Die Bündelung macht den Unterschied.' },
                { id: 'ki_random', title: 'Zufällige gute Tat', min: 5, timer: 0, dose: 'spontan', intro: 'Eine unerwartete Freundlichkeit für jemanden, der nichts zurückgeben kann oder es nicht erwartet.', prompts: [
                    { l: 'Was habe ich getan, für wen?', p: '' },
                    { l: 'Reaktion / mein Gefühl', p: '' }
                ], tip: 'Anonyme Taten wirken oft am stärksten auf dich selbst.' },
                { id: 'ki_chain', title: 'Freundlichkeits-Kette (Pay it forward)', min: 10, timer: 0, dose: 'monatlich', intro: 'Hat dir jemand kürzlich geholfen? Gib es an eine dritte Person weiter – und erzähl ihr, warum.', prompts: [
                    { l: 'Was wurde mir Gutes getan?', p: '' },
                    { l: 'An wen gebe ich es weiter – wie?', p: '' }
                ], tip: 'Freundlichkeit ist ansteckend: Empfänger werden selbst grosszügiger (Fowler & Christakis).' },
                { id: 'ki_volunteer', title: 'Zeit schenken (Ehrenamt)', min: 120, timer: 0, dose: 'monatlich oder öfter', intro: 'Regelmässiges Engagement ist eine der stabilsten Glücksquellen – besonders, wenn es zu deinen Stärken passt. Plane es konkret.', prompts: [
                    { l: 'Wo / für wen will ich mich engagieren?', p: '' },
                    { l: 'Welche Stärke von mir kommt dabei zum Einsatz?', p: '' },
                    { l: 'Nächster konkreter Schritt (Termin, Anruf)', p: '' }
                ], tip: 'Ab ca. 100 Stunden pro Jahr zeigen Studien deutliche Wohlbefindens-Effekte.' },
                { id: 'ki_reflect', title: 'Mitgefühls-Reflexion', min: 5, timer: 0, dose: 'nach guten Taten', intro: 'Schau zurück auf deine guten Taten der Woche. Was haben sie mit dir gemacht? Was mit den anderen?', prompts: [
                    { l: 'Welche Tat hat mich selbst am meisten bewegt?', p: '' },
                    { l: 'Wie sehe ich mich selbst nach dieser Woche?', p: '' }
                ], tip: 'Das Reflektieren verankert die Identität „Ich bin ein grosszügiger Mensch".' }
            ]
        },
        {
            id: 'relationships', n: 5, ic: '🤝', title: 'Soziale Beziehungen pflegen', color: '#ec4899',
            short: 'Die stärkste Glücksquelle bewusst investieren.',
            why: 'Alle sehr glücklichen Menschen haben eines gemeinsam: enge, verlässliche Beziehungen. Beziehungen sind Puffer gegen Stress, Quelle von Sinn, Freude und Gesundheit.',
            research: 'Diener & Seligman (2002): Die glücklichsten 10 % unterscheiden sich vor allem durch reiche, erfüllende Beziehungen. Gable (2004): Aktiv-konstruktives Reagieren auf gute Nachrichten stärkt Partnerschaften mehr als Trost bei schlechten.',
            dose: 'Mind. 5 Stunden pro Woche bewusste Beziehungszeit (Gottman). ACR: bei jeder guten Nachricht. Wertschätzung: täglich.',
            links: [{ m: 'nonviolent-communication', l: 'Gewaltfreie Kommunikation' }, { m: 'communication', l: 'Kommunikation' }],
            exercises: [
                { id: 're_time', title: 'Beziehungs-Date planen', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Beziehungen wachsen mit Zeit. Plane diese Woche bewusst ungestörte Zeit mit einem Menschen, der dir wichtig ist – ohne Handy, ohne Agenda.', prompts: [
                    { l: 'Mit wem? Wann? Was?', p: '' },
                    { l: 'Danach: Was war der schönste Moment?', p: '' }
                ], tip: 'Gottmans „magische 5 Stunden": tägliches Verabschieden/Begrüssen, Wertschätzung, Zuneigung, wöchentliches Date.' },
                { id: 're_acr', title: 'Aktiv-konstruktiv reagieren', min: 5, timer: 0, dose: 'bei guten Nachrichten', intro: 'Wenn jemand dir etwas Gutes erzählt: nicht „schön" sagen und weitermachen, sondern begeistert nachfragen, mitfreuen, Details erfragen. Reflektiere heute eine Situation.', prompts: [
                    { l: 'Wer hat mir heute eine gute Nachricht erzählt?', p: '' },
                    { l: 'Wie habe ich reagiert?', p: '' },
                    { l: 'Wie hätte ich aktiv-konstruktiv reagieren können / habe ich reagiert?', p: '„Erzähl – wie war der Moment, als du es erfahren hast?"' }
                ], tip: 'Die vier Stile: aktiv-konstruktiv (gut), passiv-konstruktiv, aktiv-destruktiv, passiv-destruktiv.' },
                { id: 're_appreciate', title: 'Bewunderung, Wertschätzung, Zuneigung', min: 5, timer: 0, dose: 'täglich', intro: 'Drücke heute drei Dinge aus: etwas, das du an einer Person bewunderst, etwas, wofür du sie schätzt, und ein Zeichen von Zuneigung.', prompts: [
                    { l: 'Bewunderung – wem, was?', p: '' },
                    { l: 'Wertschätzung – wem, wofür?', p: '' },
                    { l: 'Zuneigung – wie gezeigt?', p: '' }
                ], tip: 'Gottman: Stabile Paare haben ein Verhältnis von 5 positiven zu 1 negativer Interaktion.' },
                { id: 're_share', title: 'Innere Welt teilen', min: 15, timer: 0, dose: 'wöchentlich', intro: 'Nähe entsteht durch Selbstoffenbarung. Teile diese Woche mit einem vertrauten Menschen etwas, das du normalerweise für dich behältst – einen Wunsch, eine Sorge, eine Freude.', prompts: [
                    { l: 'Was teile ich – mit wem?', p: '' },
                    { l: 'Wie hat es sich angefühlt? Was kam zurück?', p: '' }
                ], tip: 'Gegenseitigkeit: Frag auch nach der inneren Welt der anderen Person.' },
                { id: 're_hug', title: 'Umarmungs-Übung', min: 2, timer: 0, dose: 'täglich, 5 Umarmungen', intro: 'Körperkontakt setzt Oxytocin frei. Ziel: fünf echte Umarmungen heute (mind. 6 Sekunden) – Partner, Kinder, Freunde, Eltern.', prompts: [
                    { l: 'Wie viele heute? Mit wem?', p: '' }
                ], tip: 'Studie (Lyubomirsky): Studierende mit 5 Umarmungen täglich über 4 Wochen waren deutlich glücklicher.' },
                { id: 're_conflict', title: 'Konflikt fair führen', min: 15, timer: 0, dose: 'bei Bedarf', intro: 'Konflikte sind normal – entscheidend ist das Wie. Vermeide die „vier apokalyptischen Reiter": Kritik, Verachtung, Rechtfertigung, Mauern. Bereite ein schwieriges Gespräch vor.', prompts: [
                    { l: 'Worum geht es wirklich (Bedürfnis hinter dem Ärger)?', p: '' },
                    { l: 'Sanfter Einstieg: „Ich fühle … wenn … Ich brauche …"', p: '' },
                    { l: 'Was schätze ich an der Person trotz allem?', p: '' }
                ], tip: 'Nutze dafür auch die Gewaltfreie Kommunikation (Link oben).' }
            ]
        },
        {
            id: 'coping', n: 6, ic: '🛡️', title: 'Bewältigungsstrategien entwickeln', color: '#0ea5e9',
            short: 'Mit Stress, Verlust und Trauma konstruktiv umgehen.',
            why: 'Niemand ist vor Krisen gefeit. Glückliche Menschen unterscheiden sich darin, wie sie bewältigen: problemorientiert, wo etwas veränderbar ist; emotionsorientiert, wo nicht; und mit Sinnfindung.',
            research: 'Pennebaker: Expressives Schreiben über belastende Erlebnisse (15–20 Min, 3–4 Tage) verbessert Gesundheit, Stimmung und Immunfunktion. Benefit-Finding nach Krisen fördert posttraumatisches Wachstum.',
            dose: 'Expressives Schreiben: 15–20 Min an 3–4 aufeinanderfolgenden Tagen. Benefit-Finding: wenn genug Abstand da ist. ABCDE: akut.',
            links: [{ m: 'stress-management', l: 'Stress-Management' }, { m: 'resource-analysis', l: 'Ressourcen-Analyse' }],
            exercises: [
                { id: 'co_write', title: 'Expressives Schreiben', min: 20, timer: 20, dose: '3–4 Tage in Folge', intro: 'Schreib 20 Minuten über ein belastendes Erlebnis – deine tiefsten Gedanken und Gefühle dazu. Rechtschreibung egal, Zensur aus. Niemand liest es.', prompts: [
                    { l: 'Mein Text', p: 'Schreib einfach los …' },
                    { l: 'Nach dem Schreiben: Was ist mir klarer geworden?', p: '' }
                ], tip: 'Wenn es zu schwer wird, wechsle das Thema. Kurzzeitig traurig ist normal – der Effekt kommt mit Verzögerung.' },
                { id: 'co_benefit', title: 'Sinn & Nutzen finden (Benefit-Finding)', min: 10, timer: 0, dose: 'wenn Abstand da ist', intro: 'Ohne das Schwere kleinzureden: Was hat diese Erfahrung dir gegeben – an Stärke, Nähe, Prioritäten, Perspektive?', prompts: [
                    { l: 'Die Erfahrung', p: '' },
                    { l: 'Was habe ich über mich gelernt?', p: '' },
                    { l: 'Welche Beziehungen sind daran gewachsen?', p: '' },
                    { l: 'Was ist mir seither wichtiger?', p: '' }
                ], tip: 'Diese Übung braucht Timing – nicht mitten in der akuten Krise.' },
                { id: 'co_choose', title: 'Problem- oder emotionsorientiert?', min: 10, timer: 0, dose: 'bei Stress', intro: 'Die Kernfrage: Kann ich die Situation ändern? Wenn ja: Problem lösen (Plan, Schritte, Hilfe). Wenn nein: Umgang mit dem Gefühl (Akzeptanz, Umdeutung, Ablenkung, Trost).', prompts: [
                    { l: 'Der Stressor', p: '' },
                    { l: 'Veränderbar? Was genau liegt in meiner Hand?', p: '' },
                    { l: 'Meine Strategie (Problem- oder Emotionsfokus)', p: '' },
                    { l: 'Erster Schritt heute', p: '' }
                ], tip: 'Die meisten Fehler: Grübeln über Unveränderbares, Vermeiden von Veränderbarem.' },
                { id: 'co_abcde', title: 'ABCDE-Disputation', min: 10, timer: 0, dose: 'akut', intro: 'Nach Ellis/Seligman: A = Adversity (Ereignis), B = Belief (Überzeugung), C = Consequence (Gefühl/Verhalten), D = Disputation (Widerlegung), E = Energization (neue Energie).', prompts: [
                    { l: 'A – Was ist passiert?', p: '' },
                    { l: 'B – Was habe ich mir dazu gesagt?', p: '' },
                    { l: 'C – Wie habe ich mich gefühlt / verhalten?', p: '' },
                    { l: 'D – Welche Beweise sprechen gegen B? Alternative Erklärung?', p: '' },
                    { l: 'E – Wie fühle ich mich mit der neuen Sicht?', p: '' }
                ], tip: 'Nicht das Ereignis bestimmt das Gefühl, sondern die Deutung.' },
                { id: 'co_support', title: 'Unterstützung aktivieren', min: 10, timer: 0, dose: 'bei Belastung', intro: 'Soziale Unterstützung ist der wirksamste Puffer. Wen rufst du heute an? Was genau brauchst du – zuhören, Rat, praktische Hilfe?', prompts: [
                    { l: 'Wen kontaktiere ich?', p: '' },
                    { l: 'Was brauche ich konkret?', p: '„Ich brauche kein Rat, nur ein offenes Ohr."' },
                    { l: 'Erledigt? Wie war es?', p: '' }
                ], tip: 'Sag klar, welche Art Unterstützung du willst – das macht es für beide leichter.' }
            ]
        },
        {
            id: 'forgiveness', n: 7, ic: '🕊️', title: 'Vergeben lernen', color: '#8b5cf6',
            short: 'Den Groll loslassen – für dich, nicht für die anderen.',
            why: 'Vergebung heisst nicht vergessen, entschuldigen oder versöhnen. Es heisst, die eigenen Rache- und Vermeidungsgedanken loszulassen. Wer vergibt, ist weniger ängstlich, feindselig und depressiv – und körperlich gesünder.',
            research: 'Worthington (REACH-Modell): Strukturierte Vergebungsinterventionen senken Groll und Stress messbar. McCullough: Vergebung korreliert mit Lebenszufriedenheit und besseren Beziehungen.',
            dose: 'Grosser Groll: Vergebungsbrief + REACH über 2–3 Wochen. Kleine Kränkungen: Empathie-Übung sofort.',
            links: [{ m: 'nonviolent-communication', l: 'Gewaltfreie Kommunikation' }, { m: 'emotional-intelligence', l: 'Emotionale Intelligenz' }],
            exercises: [
                { id: 'fo_received', title: 'Erinnern, wie mir vergeben wurde', min: 10, timer: 0, dose: 'zum Einstieg', intro: 'Denk an eine Situation, in der du jemanden verletzt hast und dir vergeben wurde. Wie fühlte es sich an? Was hat es ermöglicht?', prompts: [
                    { l: 'Die Situation', p: '' },
                    { l: 'Wie hat sich die Vergebung angefühlt?', p: '' },
                    { l: 'Was nehme ich daraus für mein eigenes Vergeben?', p: '' }
                ], tip: 'Das macht Vergebung zu etwas, das du selbst schon erlebt hast – nicht zu einem abstrakten Ideal.' },
                { id: 'fo_letter', title: 'Vergebungsbrief (nicht abschicken)', min: 20, timer: 0, dose: 'bei grossem Groll', intro: 'Schreib der Person, die dich verletzt hat. Beschreib, was passiert ist und wie es dich getroffen hat. Dann: ein Satz des Verstehens, und die Entscheidung, den Groll loszulassen.', prompts: [
                    { l: 'An wen? Was ist passiert?', p: '' },
                    { l: 'Wie hat es mich getroffen – damals und heute?', p: '' },
                    { l: 'Was verstehe ich (nicht: billige) an ihrem Verhalten?', p: '' },
                    { l: 'Meine Entscheidung', p: '„Ich entscheide mich, den Groll loszulassen, weil …"' }
                ], tip: 'Nicht abschicken. Der Brief ist für dich.' },
                { id: 'fo_empathy', title: 'Perspektivwechsel', min: 10, timer: 0, dose: 'bei Kränkungen', intro: 'Versetz dich in die Person: Welchen Druck, welche Angst, welche Geschichte hatte sie? Welche Erklärung ausser Bosheit ist möglich?', prompts: [
                    { l: 'Die Kränkung', p: '' },
                    { l: 'Wie könnte die Situation aus ihrer Sicht ausgesehen haben?', p: '' },
                    { l: 'Eine wohlwollende Erklärung', p: '' }
                ], tip: 'Verstehen ist nicht Zustimmen. Es entlastet vor allem dich.' },
                { id: 'fo_reach', title: 'REACH-Modell durchlaufen', min: 25, timer: 0, dose: 'bei tiefem Groll', intro: 'Worthingtons fünf Schritte: Recall (erinnern), Empathize (einfühlen), Altruistic gift (Vergebung als Geschenk), Commit (sich öffentlich festlegen), Hold (dranbleiben).', prompts: [
                    { l: 'R – Erinnern, möglichst sachlich', p: '' },
                    { l: 'E – Einfühlen: Warum könnte sie so gehandelt haben?', p: '' },
                    { l: 'A – Altruistisches Geschenk: Wann wurde mir vergeben? Kann ich dieses Geschenk weitergeben?', p: '' },
                    { l: 'C – Festlegen: Mein Vergebungs-Satz', p: '„Ich habe … vergeben für …"' },
                    { l: 'H – Dranbleiben: Was tue ich, wenn der Groll zurückkommt?', p: '' }
                ], tip: 'Vergebung ist ein Prozess, kein Ereignis. Zurückkehrender Groll heisst nicht, dass du versagt hast.' },
                { id: 'fo_hold', title: 'Vergebungs-Erinnerung', min: 3, timer: 0, dose: 'wenn Groll zurückkommt', intro: 'Grollgedanken kommen wieder. Erinnere dich an deine Entscheidung – lies deinen Vergebungs-Satz, atme, lass den Gedanken ziehen.', prompts: [
                    { l: 'Was hat den Groll getriggert?', p: '' },
                    { l: 'Mein Vergebungs-Satz (nochmals)', p: '' }
                ], tip: 'Groll zu spüren ist kein Rückfall. Ihn zu füttern wäre einer.' }
            ]
        },
        {
            id: 'flow', n: 8, ic: '🌊', title: 'Flow-Erlebnisse steigern', color: '#06b6d4',
            short: 'Ganz in einer Tätigkeit aufgehen.',
            why: 'Flow (Csikszentmihalyi) ist der Zustand völliger Vertiefung, in dem Zeit und Selbst verschwinden. Er entsteht, wenn Herausforderung und Fähigkeit hoch und im Gleichgewicht sind. Flow-reiche Leben sind erfüllter – nicht während, sondern durch den Flow.',
            research: 'Csikszentmihalyi (ESM-Studien): Menschen erleben mehr Flow bei der Arbeit als in der Freizeit – und sind in der Freizeit oft apathisch (TV). Aktive Freizeit erhöht Wohlbefinden.',
            dose: 'Täglich mind. ein Flow-Block (25–45 Min) ohne Unterbrechung. Wöchentlich: eine passive Freizeitaktivität durch eine aktive ersetzen.',
            links: [{ m: 'time-management', l: 'Zeitmanagement' }, { m: 'gallup-strengths', l: 'Stärken-Analyse' }],
            exercises: [
                { id: 'fl_inventory', title: 'Flow-Inventur', min: 10, timer: 0, dose: 'zum Einstieg', intro: 'Wann warst du zuletzt so vertieft, dass du die Zeit vergessen hast? Finde drei Situationen – und ihren gemeinsamen Nenner.', prompts: [
                    { l: 'Flow-Situation 1 / 2 / 3', p: '' },
                    { l: 'Gemeinsamer Nenner (Tätigkeit, Umgebung, Menschen, Tageszeit)?', p: '' },
                    { l: 'Wie bringe ich mehr davon in meine Woche?', p: '' }
                ], tip: 'Flow verrät dir, was dich wirklich fesselt – oft ein Hinweis auf deine Stärken.' },
                { id: 'fl_calibrate', title: 'Herausforderung ↔ Fähigkeit kalibrieren', min: 10, timer: 0, dose: 'bei Langeweile/Überforderung', intro: 'Langeweile = Fähigkeit > Herausforderung. Angst = Herausforderung > Fähigkeit. Flow = beides hoch & im Gleichgewicht. Justiere eine aktuelle Aufgabe.', prompts: [
                    { l: 'Die Aufgabe', p: '' },
                    { l: 'Zu leicht oder zu schwer?', p: '' },
                    { l: 'Wie erhöhe ich die Herausforderung (Zeitlimit, Qualität, Komplexität) oder baue Fähigkeit auf (Lernen, Hilfe, Teilschritte)?', p: '' }
                ], tip: 'Kleine Stellschrauben reichen: ein Zeitlimit, ein Qualitätsanspruch, eine selbstgesetzte Regel.' },
                { id: 'fl_transform', title: 'Routine-Aufgabe in Flow verwandeln', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Bügeln, Pendeln, Abwaschen, E-Mails: Mach aus einer Routine ein Spiel – mit Mikro-Zielen, klaren Regeln und sofortigem Feedback.', prompts: [
                    { l: 'Die Routine', p: '' },
                    { l: 'Mikro-Ziel / Regel / Feedback', p: 'z. B. „Alle E-Mails in 20 Min, jede unter 3 Sätze"' },
                    { l: 'Ausprobiert? Wie war es?', p: '' }
                ], tip: 'Die Tätigkeit ändert sich nicht – deine Aufmerksamkeit schon.' },
                { id: 'fl_block', title: 'Flow-Block', min: 45, timer: 45, dose: 'täglich', intro: 'Ein Block ungestörter Vertiefung: eine Aufgabe, klares Ziel, alle Benachrichtigungen aus, Timer an. Danach kurz bewerten.', prompts: [
                    { l: 'Aufgabe & Ziel für diesen Block', p: '' },
                    { l: 'Flow erlebt? (1–10) Was hat gestört / geholfen?', p: '' }
                ], tip: 'Flow braucht ca. 15 Minuten Anlauf. Jede Unterbrechung setzt die Uhr zurück.' },
                { id: 'fl_leisure', title: 'Smarte Freizeit', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Passive Freizeit (TV, Scrollen) fühlt sich erholsam an, erzeugt aber Apathie. Ersetze diese Woche eine passive Stunde durch eine aktive: Musik machen, Sport, Kochen, Lesen, Werken, Spielen.', prompts: [
                    { l: 'Welche passive Stunde ersetze ich?', p: '' },
                    { l: 'Wodurch?', p: '' },
                    { l: 'Wie war der Unterschied?', p: '' }
                ], tip: 'Aktive Freizeit kostet Startenergie – darum planen, nicht spontan entscheiden.' }
            ]
        },
        {
            id: 'savoring', n: 9, ic: '🍯', title: 'Freuden auskosten (Savoring)', color: '#d97706',
            short: 'Positives bewusst verlängern, vertiefen, teilen.',
            why: 'Savoring ist die Fähigkeit, positive Erfahrungen zu bemerken, zu verstärken und zu verlängern – in Vergangenheit (Erinnern), Gegenwart (Geniessen) und Zukunft (Vorfreude). Es ist das Gegenmittel gegen hedonische Adaptation.',
            research: 'Bryant & Veroff: Menschen, die Alltagsfreuden bewusst auskosten, sind glücklicher und weniger depressiv. Reminiszenz-Übungen (positive Erinnerungen 10 Min/Tag, 1 Woche) heben die Stimmung.',
            dose: 'Gewöhnliches auskosten: täglich 1× bewusst. Erinnerungsreise: 10 Min, mehrmals pro Woche. Vorfreude: wöchentlich planen.',
            links: [{ m: 'mindfulness', l: 'Achtsamkeit & Meditation' }, { m: 'sinnesschule', l: 'Schule der Sinne' }],
            exercises: [
                { id: 'sa_ordinary', title: 'Gewöhnliches auskosten', min: 5, timer: 5, dose: 'täglich', intro: 'Wähle eine alltägliche Freude – den ersten Kaffee, die Dusche, den Weg zur Arbeit. Erlebe sie 5 Minuten mit allen Sinnen, langsamer als sonst. Nichts nebenbei.', prompts: [
                    { l: 'Was habe ich ausgekostet?', p: '' },
                    { l: 'Was habe ich wahrgenommen, das mir sonst entgeht?', p: '' }
                ], tip: 'Sag dir innerlich, was du wahrnimmst: „Wärme der Tasse. Duft. Erster Schluck."' },
                { id: 'sa_album', title: 'Savoring-Album', min: 5, timer: 0, dose: 'täglich ein Eintrag', intro: 'Halte einen schönen Moment des Tages fest – als Foto, Satz oder Skizze. Nicht für andere, für dich. Blättere wöchentlich zurück.', prompts: [
                    { l: 'Der Moment des Tages', p: '' },
                    { l: 'Warum war er schön?', p: '' }
                ], tip: 'Bewusst festhalten ändert das Erleben selbst – du suchst aktiv nach Schönem.' },
                { id: 'sa_reminisce', title: 'Erinnerungsreise', min: 10, timer: 10, dose: '3× pro Woche', intro: 'Schliess die Augen. Geh zurück zu einem der glücklichsten Momente deines Lebens. Wo bist du? Wer ist dabei? Was siehst, hörst, riechst du? Bleib dort 10 Minuten.', prompts: [
                    { l: 'Welche Erinnerung?', p: '' },
                    { l: 'Welche Details sind aufgetaucht?', p: '' }
                ], tip: 'Nicht analysieren („Warum war es so schön?") – das zerstört den Effekt. Nur erleben.' },
                { id: 'sa_celebrate', title: 'Gute Nachrichten feiern & teilen', min: 10, timer: 0, dose: 'bei Erfolgen', intro: 'Etwas Gutes ist passiert? Nicht abhaken. Erzähl es jemandem ausführlich, feiere es konkret – ein Essen, ein Anruf, ein Glas. Teilen verdoppelt die Freude.', prompts: [
                    { l: 'Die gute Nachricht', p: '' },
                    { l: 'Mit wem geteilt, wie gefeiert?', p: '' }
                ], tip: 'Gable: Erlebnisse, die man teilt, werden besser erinnert und stärker gefühlt.' },
                { id: 'sa_anticipate', title: 'Vorfreude planen', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Vorfreude ist oft intensiver als das Ereignis. Plane etwas Schönes für die kommende Woche und male es dir in Details aus.', prompts: [
                    { l: 'Worauf freue ich mich – wann?', p: '' },
                    { l: 'Wie stelle ich es mir konkret vor?', p: '' }
                ], tip: 'Kleine, häufige Freuden schlagen seltene grosse – plane lieber drei kleine als eine riesige.' },
                { id: 'sa_bittersweet', title: 'Bittersüss: das letzte Mal', min: 5, timer: 0, dose: 'gelegentlich', intro: 'Stell dir vor, du erlebst etwas Vertrautes heute zum letzten Mal – ein Gespräch, einen Weg, einen Abend. Wie veränderst du deine Aufmerksamkeit?', prompts: [
                    { l: 'Was habe ich mir als „letztes Mal" vorgestellt?', p: '' },
                    { l: 'Was wurde dadurch kostbarer?', p: '' }
                ], tip: 'Kurtz (2008): Studierende, die ihre letzten Wochen am College bewusst als endlich erlebten, waren glücklicher.' }
            ]
        },
        {
            id: 'goals', n: 10, ic: '🎯', title: 'Sich Zielen verpflichten', color: '#10b981',
            short: 'Die richtigen Ziele – und das Dranbleiben.',
            why: 'Menschen mit bedeutsamen Zielen sind glücklicher – nicht erst beim Erreichen, sondern unterwegs. Ziele geben Struktur, Sinn, Selbstwirksamkeit. Aber: Nur bestimmte Arten von Zielen machen glücklich.',
            research: 'Sheldon & Lyubomirsky: Glücksfördernd sind Ziele, die intrinsisch (nicht Geld/Status), authentisch (eigene Werte), Annäherungs- statt Vermeidungsziele, harmonisch untereinander und aktivitätsbezogen (nicht Umstände) sind. Gollwitzer: Wenn-Dann-Pläne verdoppeln die Umsetzungsrate.',
            dose: 'Ziel-Check: pro neuem Ziel. Wenn-Dann-Pläne: pro Teilziel. Fortschritts-Satz: wöchentlich.',
            links: [{ m: 'goal-setting', l: 'Ziel-Setting (SMART)' }, { m: 'ikigai', l: 'Ikigai' }, { m: 'values-clarification', l: 'Werte-Klärung' }],
            exercises: [
                { id: 'go_check', title: 'Ziel-Check: Macht dieses Ziel glücklich?', min: 10, timer: 0, dose: 'pro Ziel', intro: 'Prüfe ein aktuelles Ziel gegen die fünf Kriterien glücksfördernder Ziele. Je mehr Ja, desto eher lohnt es sich.', prompts: [
                    { l: 'Das Ziel', p: '' },
                    { l: 'Intrinsisch? (Wachstum, Beziehung, Beitrag statt Geld, Status, Aussehen)', p: 'Ja / Nein – weil …' },
                    { l: 'Authentisch? (Meins, nicht erwartet)', p: '' },
                    { l: 'Annäherung statt Vermeidung? („Fit werden" statt „nicht dick werden")', p: '' },
                    { l: 'Harmonisch mit meinen anderen Zielen?', p: '' },
                    { l: 'Aktivität statt Umstand? („Dreimal pro Woche laufen" statt „10 kg weniger")', p: '' }
                ], tip: 'Vermeidungsziele kannst du fast immer in Annäherungsziele umformulieren.' },
                { id: 'go_sub', title: 'Teilziele & Meilensteine', min: 15, timer: 0, dose: 'pro Ziel', intro: 'Grosse Ziele lähmen. Zerlege dein Ziel in Teilziele, die du in 1–2 Wochen erreichen kannst – jedes ein kleiner Erfolg.', prompts: [
                    { l: 'Das Ziel', p: '' },
                    { l: 'Teilziel 1 (diese Woche)', p: '' },
                    { l: 'Teilziel 2 / 3 / 4', p: '' },
                    { l: 'Woran merke ich den Fortschritt?', p: '' }
                ], tip: 'Fortschrittsgefühl ist der stärkste Motivator (Amabile: „Progress Principle").' },
                { id: 'go_ifthen', title: 'Wenn-Dann-Pläne', min: 10, timer: 0, dose: 'pro Teilziel', intro: 'Implementation Intentions (Gollwitzer): „Wenn [Situation], dann [Handlung]." Plane auch Hindernisse: „Wenn ich keine Lust habe, dann …"', prompts: [
                    { l: 'Wenn … (konkrete Situation, Zeit, Ort)', p: 'z. B. „Wenn ich am Dienstag um 18 Uhr nach Hause komme"' },
                    { l: '… dann … (konkrete Handlung)', p: 'z. B. „ziehe ich sofort die Laufschuhe an"' },
                    { l: 'Hindernis-Plan: Wenn [Hindernis], dann …', p: '' }
                ], tip: 'Je konkreter der Auslöser, desto automatischer die Handlung.' },
                { id: 'go_progress', title: 'Wöchentlicher Fortschritts-Satz', min: 5, timer: 0, dose: 'wöchentlich', intro: 'Ein Satz pro Ziel: Was ist diese Woche passiert? Was ist der nächste Schritt? Kein Urteil, nur Bewegung.', prompts: [
                    { l: 'Ziel → Fortschritt diese Woche', p: '' },
                    { l: 'Nächster Schritt', p: '' },
                    { l: 'Muss ich das Ziel anpassen?', p: '' }
                ], tip: 'Flexibilität gehört dazu: Ziele dürfen sich ändern, wenn du dich änderst.' }
            ]
        },
        {
            id: 'spirituality', n: 11, ic: '✨', title: 'Spiritualität & Sinn', color: '#a855f7',
            short: 'Mit etwas Grösserem verbunden sein.',
            why: 'Religiöse und spirituelle Menschen sind im Schnitt glücklicher, gesünder und bewältigen Krisen besser – vermutlich durch Sinn, Gemeinschaft, Rituale, Dankbarkeit und Ehrfurcht. Das funktioniert auch ohne Konfession: Es geht um das Heilige im Alltag.',
            research: 'Pargament: „Sanctification" – Alltägliches als heilig zu erleben – korreliert mit Wohlbefinden. Keltner: Ehrfurcht (Awe) macht grosszügiger, bescheidener und zufriedener.',
            dose: 'Stille/Meditation/Gebet: täglich 10 Min. Sinn-Reflexion: wöchentlich. Awe-Walk: wöchentlich.',
            links: [{ m: 'ikigai', l: 'Ikigai' }, { m: 'values-clarification', l: 'Werte-Klärung' }, { m: 'mindfulness', l: 'Achtsamkeit & Meditation' }],
            exercises: [
                { id: 'sp_meaning', title: 'Sinn-Reflexion', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Drei Fragen, die Sinn sichtbar machen – ohne grosse Antworten erzwingen zu wollen.', prompts: [
                    { l: 'Wofür bin ich hier? (Was wäre nicht da, wenn es mich nicht gäbe?)', p: '' },
                    { l: 'Wann habe ich diese Woche Sinn gespürt?', p: '' },
                    { l: 'Was ist grösser als ich, zu dem ich gehöre?', p: '' }
                ], tip: 'Sinn ist eher etwas, das man entdeckt, als etwas, das man erfindet.' },
                { id: 'sp_still', title: 'Stille · Meditation · Gebet', min: 10, timer: 10, dose: 'täglich', intro: 'Zehn Minuten nichts tun – nach deiner Tradition: beten, meditieren, einfach still sitzen und atmen. Timer an, Augen zu.', prompts: [
                    { l: 'Was ist in der Stille aufgetaucht?', p: '' }
                ], tip: 'Es gibt kein Richtig. Gedanken kommen – lass sie ziehen und kehr zum Atem zurück.' },
                { id: 'sp_read', title: 'Spirituelle Lektüre', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Lies zehn Minuten in einem Text, der dich mit etwas Grösserem verbindet – heilige Schriften, Philosophie, Poesie, Weisheitsliteratur. Nimm einen Gedanken mit.', prompts: [
                    { l: 'Was habe ich gelesen?', p: '' },
                    { l: 'Der Gedanke, den ich mitnehme', p: '' }
                ], tip: 'Ein Satz, der dich trifft, ist mehr wert als zehn Seiten.' },
                { id: 'sp_sanctify', title: 'Das Alltägliche heiligen', min: 5, timer: 0, dose: 'täglich', intro: 'Wähle eine gewöhnliche Handlung – Kochen, Kinder ins Bett bringen, Arbeit – und tu sie heute, als wäre sie bedeutungsvoll, ein Dienst, ein Ritual.', prompts: [
                    { l: 'Welche Handlung?', p: '' },
                    { l: 'Wie hat sich das Erleben verändert?', p: '' }
                ], tip: 'Nicht die Handlung ist heilig – die Haltung macht sie dazu.' },
                { id: 'sp_awe', title: 'Awe-Walk (Ehrfurcht in der Natur)', min: 15, timer: 15, dose: 'wöchentlich', intro: 'Geh 15 Minuten nach draussen mit der Absicht, zu staunen: Himmel, Bäume, Weite, Details. Wie ein Kind, das alles zum ersten Mal sieht.', prompts: [
                    { l: 'Was hat mich staunen lassen?', p: '' },
                    { l: 'Wie fühle ich mich im Vergleich zu vorher?', p: '' }
                ], tip: 'Sturm et al. (2020): Wöchentliche Awe-Walks über 8 Wochen steigern positive Emotionen und senken Stress.' },
                { id: 'sp_community', title: 'Gemeinschaft suchen', min: 60, timer: 0, dose: 'monatlich', intro: 'Spiritualität wirkt stärker in Gemeinschaft – Gottesdienst, Meditationsgruppe, Chor, Philosophie-Zirkel. Plane einen Besuch.', prompts: [
                    { l: 'Welche Gemeinschaft passt zu mir?', p: '' },
                    { l: 'Wann gehe ich hin?', p: '' },
                    { l: 'Wie war es?', p: '' }
                ], tip: 'Die soziale Komponente erklärt einen grossen Teil des Glücks-Effekts von Religion.' }
            ]
        },
        {
            id: 'body', n: 12, ic: '🧘', title: 'Für den Körper sorgen', color: '#22c55e',
            short: 'Meditieren, bewegen, wie ein glücklicher Mensch handeln.',
            why: 'Der Körper ist der schnellste Weg zur Stimmung. Meditation verändert nachweislich das Gehirn, Bewegung wirkt bei leichter Depression so gut wie Medikamente, und körperliches „Als-ob"-Verhalten (Lächeln, Haltung) färbt auf das Erleben ab.',
            research: 'Davidson & Kabat-Zinn (2003): 8 Wochen Achtsamkeit erhöhen linkspräfrontale Aktivität (positive Emotionen) und Immunantwort. Babyak (2000): 30 Min Bewegung 3×/Woche so wirksam wie Antidepressiva – mit geringerer Rückfallquote.',
            dose: 'Meditation: täglich 10–20 Min. Bewegung: 30 Min, 3× pro Woche (besser täglich). Als-ob: jederzeit.',
            links: [{ m: 'koerperschule', l: 'Schule des Körpers' }, { m: 'mindfulness', l: 'Achtsamkeit & Meditation' }],
            exercises: [
                { id: 'bo_meditate', title: 'Meditation', min: 10, timer: 10, dose: 'täglich', intro: 'Aufrecht sitzen, Augen schliessen, Aufmerksamkeit auf den Atem. Wenn Gedanken kommen (sie kommen), freundlich zurückkehren. 10 Minuten.', prompts: [
                    { l: 'Wie war es? Wie oft abgeschweift? Egal – was hat sich verändert?', p: '' }
                ], tip: 'Konsistenz schlägt Dauer: 10 Minuten täglich wirken mehr als 60 Minuten einmal pro Woche.' },
                { id: 'bo_move', title: 'Bewegung (30 Minuten)', min: 30, timer: 30, dose: '3× pro Woche oder öfter', intro: 'Jede Bewegung zählt, die den Puls erhöht: zügig gehen, laufen, Rad, Schwimmen, Tanzen. Draussen wirkt doppelt.', prompts: [
                    { l: 'Was habe ich gemacht?', p: '' },
                    { l: 'Stimmung vorher → nachher (1–10)', p: '' }
                ], tip: 'Die Stimmungsverbesserung kommt sofort – nutze sie als Belohnung, nicht erst die Fitness in drei Monaten.' },
                { id: 'bo_actasif', title: 'Wie ein glücklicher Mensch handeln', min: 2, timer: 2, dose: 'jederzeit', intro: 'Facial Feedback: Lächle 60 Sekunden (auch ohne Grund), richte dich auf, geh energisch, sprich mit Wärme. Dein Körper sagt deinem Gehirn, wie es dir geht.', prompts: [
                    { l: 'Was habe ich ausprobiert? Hat sich etwas verändert?', p: '' }
                ], tip: 'Es wirkt am besten unauffällig und oft – nicht als einmaliges Experiment.' },
                { id: 'bo_laugh', title: 'Lachen (absichtlich)', min: 5, timer: 0, dose: 'täglich', intro: 'Such heute aktiv etwas zum Lachen: ein Video, ein Comic, ein Anruf bei jemandem, der dich zum Lachen bringt. Lachen senkt Stresshormone und verbindet.', prompts: [
                    { l: 'Worüber habe ich heute gelacht?', p: '' }
                ], tip: 'Lachen ist 30× wahrscheinlicher in Gesellschaft – nutze es sozial.' },
                { id: 'bo_sleep', title: 'Schlaf-Check', min: 5, timer: 0, dose: 'wöchentlich', intro: 'Zu wenig Schlaf ist ein stiller Glückskiller. Wie waren die letzten Nächte? Was steht einer besseren Nacht im Weg?', prompts: [
                    { l: 'Ø Schlafstunden diese Woche', p: '' },
                    { l: 'Grösster Störfaktor', p: 'z. B. Bildschirm bis spät, Koffein, Grübeln' },
                    { l: 'Eine Änderung für diese Woche', p: '' }
                ], tip: 'Konstante Schlafenszeit wirkt stärker als Schlafdauer.' }
            ]
        }
    ];

    /* Die fünf Hows nachhaltigen Glücks */
    const HOWS = [
        { id: 'emotion', ic: '😊', title: 'Positive Emotionen', q: 'Spüre ich nach den Übungen tatsächlich mehr Freude, Ruhe, Dankbarkeit, Neugier? (Nur was gut tut, hält.)', d: 'Positive Emotionen sind der Mechanismus: Sie erweitern Denken und Handeln und bauen Ressourcen auf (Fredrickson). Deine Stimmungs-Deltas im Logbuch zeigen es.' },
        { id: 'timing', ic: '⏱️', title: 'Timing & Vielfalt', q: 'Variiere ich Übungen und Zeitpunkte – oder mache ich immer dasselbe zur selben Zeit?', d: 'Hedonische Adaptation ist der Feind. Gegenmittel: die richtige Dosis (z. B. Dankbarkeit 1× statt 3×/Woche) und Abwechslung in Art, Ort und Form.' },
        { id: 'social', ic: '👥', title: 'Soziale Unterstützung', q: 'Weiss jemand von meinem Vorhaben? Habe ich eine Person, mit der ich mich austausche?', d: 'Wer sein Vorhaben teilt oder gemeinsam übt, bleibt deutlich eher dran. Erzähl jemandem, was du machst – oder lade jemanden ein, mitzumachen.' },
        { id: 'effort', ic: '🔥', title: 'Motivation, Anstrengung, Commitment', q: 'Ist mir klar, warum ich das tue? Bin ich bereit, auch an Tagen zu üben, an denen ich keine Lust habe?', d: 'Glück ist Arbeit – im Sinne eines Musikinstruments: Wer übt, wird besser. Die Entscheidung, glücklicher werden zu wollen, ist selbst schon ein Prädiktor.' },
        { id: 'habit', ic: '🔁', title: 'Gewohnheit', q: 'Ist die Übung an einen festen Auslöser gekoppelt, so dass ich nicht jedes Mal neu entscheiden muss?', d: 'Automatisiere die Entscheidung („nach dem Zähneputzen"), aber nicht die Ausführung – die soll bewusst und frisch bleiben. Nutze dafür die Methode „Gewohnheiten aufbauen".' }
    ];

    /* Pfade zu bestehenden Methoden (relativ zum Ordner methods/how-of-happiness/) */
    const METHOD_PATHS = {
        'journaling': '../journaling/journaling.html',
        'vision-board': '../vision-board/vision-board.html',
        'goal-setting': '../goal-setting/goal-setting.html',
        'mindfulness': '../mindfulness/mindfulness.html',
        'stress-management': '../stress-management/stress-management.html',
        'values-clarification': '../values-clarification/values-clarification.html',
        'nonviolent-communication': '../nonviolent-communication/nonviolent-communication.html',
        'communication': '../communication/communication.html',
        'resource-analysis': '../resource-analysis/resource-analysis.html',
        'emotional-intelligence': '../emotional-intelligence/emotional-intelligence.html',
        'time-management': '../time-management/time-management.html',
        'gallup-strengths': '../gallup-strengths/gallup-strengths.html',
        'sinnesschule': '../sinnesschule/index-sinnesschule.html',
        'koerperschule': '../koerperschule/index-koerperschule.html',
        'ikigai': '../ikigai/index-ikigai.html',
        'habit-building': '../habit-building/habit-building.html'
    };

    global.HOH_DATA = { PIE, SHS, FIT_DIMS, ACTIVITIES, HOWS, METHOD_PATHS };
})(window);
