/* =========================================================
   Die Schule des Körpers
   Geist und Körper verbunden: vier Disziplinen (Bewegung,
   Ernährung, Yoga, Meditation/Atem) als kleine, tägliche
   Schritte. Architektur identisch zu den Schulen des
   Gedächtnisses und der Sinne (gleiches XP-/Grad-/Streak-
   System, gleiche Persistenz, gleiche ss-* CSS-Basis).
   ========================================================= */

const KS_METHOD = 'koerperschule';

/* ---------------- Graduierungs-System (→ ∞) ---------------- */
const KS_TITLES = [
    'Erwachen', 'Beweglich', 'Verwurzelt', 'Belebt', 'Im Fluss', 'Kraftvoll',
    'Zentriert', 'Ausdauernd', 'Geschmeidig', 'Vital', 'Ausgeglichen', 'Standhaft',
    'Verbunden', 'Harmonie', 'Beherrschung', 'Vollendung'
];
function KS_gap(g) { return Math.round(110 * Math.pow(g, 1.42)); }
const _ksTcache = [0, 0];
function KS_T(g) {
    if (g < 1) return 0;
    for (let k = _ksTcache.length; k <= g; k++) _ksTcache[k] = _ksTcache[k - 1] + KS_gap(k - 1);
    return _ksTcache[g];
}
function KS_gradeFromXP(xp) {
    let g = 1;
    while (g < 2000 && xp >= KS_T(g + 1)) g++;
    return g;
}
function KS_titleFor(g) {
    if (g <= KS_TITLES.length) return KS_TITLES[g - 1];
    const cycle = Math.floor((g - 1) / KS_TITLES.length);
    const base = KS_TITLES[(g - 1) % KS_TITLES.length];
    const roman = ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][cycle] || ('×' + (cycle + 1));
    return `${base} ${roman}`.trim();
}
function KS_emblem(g) {
    if (g >= 40) return '🏆';
    if (g >= 28) return '🥇';
    if (g >= 18) return '🦅';
    if (g >= 12) return '💪';
    if (g >= 7) return '🧘';
    if (g >= 4) return '🤸';
    return '🌱';
}

/* ---------------- Dojo-Themes ---------------- */
const KS_THEMES = [
    { id: 'forest', name: 'Wald', a: '#34d399', a2: '#22d3ee' },
    { id: 'sunrise', name: 'Sonnenaufgang', a: '#fb923c', a2: '#f472b6' },
    { id: 'ocean', name: 'Ozean', a: '#22d3ee', a2: '#818cf8' },
    { id: 'lavender', name: 'Lavendel', a: '#a78bfa', a2: '#f472b6' }
];

const KS_ALIAS_ADJ = ['Ruhige', 'Starke', 'Bewegte', 'Atmende', 'Wache', 'Geschmeidige', 'Vitale', 'Zentrierte'];
const KS_ALIAS_NOUN = ['Bergziege', 'Kranich', 'Eiche', 'Welle', 'Flamme', 'Brise', 'Wurzel', 'Feder'];

/* ---------------- Die vier Disziplinen ---------------- */
const KS_DISCIPLINES = [
    { id: 'bewegung', name: 'Bewegung & Kraft', short: 'Bewegung', icon: '💪', accent: '#fb923c', soft: 'rgba(251,146,60,.16)', glow: 'rgba(251,146,60,.18)',
      tags: ['Mikro-Workout', 'Kraft', 'Mobilität'],
      blurb: 'Kleine tägliche Bewegungs- und Kraftimpulse. Konstanz baut den Körper – nicht der eine große Tag.' },
    { id: 'ernaehrung', name: 'Ernährung', short: 'Ernährung', icon: '🥗', accent: '#34d399', soft: 'rgba(52,211,153,.16)', glow: 'rgba(52,211,153,.18)',
      tags: ['Tages-Check', 'Achtsam essen', 'Hydration'],
      blurb: 'Gesunde Ernährung als Summe kleiner Entscheidungen – ein Check, eine bewusste Mahlzeit nach der anderen.' },
    { id: 'yoga', name: 'Yoga & Beweglichkeit', short: 'Yoga', icon: '🧘', accent: '#a78bfa', soft: 'rgba(167,139,250,.16)', glow: 'rgba(167,139,250,.18)',
      tags: ['Sonnengruß', 'Dehnung', 'Balance'],
      blurb: 'Geführte Flows und Dehnungen für Beweglichkeit, Haltung und einen ruhigen, präsenten Körper.' },
    { id: 'meditation', name: 'Meditation & Atem', short: 'Meditation', icon: '🌬️', accent: '#22d3ee', soft: 'rgba(34,211,238,.16)', glow: 'rgba(34,211,238,.18)',
      tags: ['Box-Atmung', '4-7-8', 'Body-Scan'],
      blurb: 'Atem- und Achtsamkeitsübungen senken Stress und verbinden Körper und Geist – die Brücke zu deinen anderen Schulen.' }
];
const KS_DISC_MAP = Object.fromEntries(KS_DISCIPLINES.map(d => [d.id, d]));

/* ---------------- Trainer / geführte Sessions ----------------
   type: 'guided' (getaktete Schritte mit Ring-Timer),
         'breath' (Atem-Orb), 'habit' (Mini-Checkliste). */
const KS_TRAINERS = {
    /* — Bewegung & Kraft — */
    mobility: { disc: 'bewegung', icon: '🤸', title: 'Gelenk-Mobilität', xp: 16, type: 'guided',
        blurb: 'Sanftes Aufwecken aller Gelenke – perfekt zum Start in den Tag.',
        steps: [
            { text: 'Steh locker, Füße hüftbreit. Atme 3-mal tief durch.', sec: 15 },
            { text: 'Nacken: Kopf langsam von Schulter zu Schulter rollen.', sec: 25 },
            { text: 'Schultern groß nach hinten kreisen.', sec: 25 },
            { text: 'Arme weit kreisen – vorwärts, dann rückwärts.', sec: 25 },
            { text: 'Hüfte kreisen, als rührtest du einen großen Topf.', sec: 25 },
            { text: 'Knie zusammen, sanft kreisen lassen.', sec: 20 },
            { text: 'Auf Zehenspitzen wippen, Fußgelenke lockern.', sec: 20 },
            { text: 'Schüttle Arme und Beine locker aus. Fertig!', sec: 15 }
        ] },
    micro_move: { disc: 'bewegung', icon: '⚡', title: '5-Minuten-Energie', xp: 22, type: 'guided',
        blurb: 'Kurzer Energieschub, der Kreislauf und Laune sofort hebt.',
        steps: [
            { text: 'Marschiere auf der Stelle, Arme mitschwingen.', sec: 30 },
            { text: 'Hampelmann in ruhigem Tempo.', sec: 30 },
            { text: 'Pause: tief durchatmen.', sec: 15 },
            { text: 'Kniebeugen – langsam und kontrolliert.', sec: 35 },
            { text: 'Armkreisen vorwärts und rückwärts.', sec: 25 },
            { text: 'Knie abwechselnd zur gegenüberliegenden Hand.', sec: 30 },
            { text: 'Auf der Stelle locker auslaufen.', sec: 20 },
            { text: 'Tief einatmen, Arme heben – ausatmen, senken.', sec: 20 }
        ] },
    kraft_basis: { disc: 'bewegung', icon: '🏋️', title: 'Kraft-Basis', xp: 28, type: 'guided',
        blurb: 'Vier Grundübungen mit dem eigenen Körpergewicht – steigerbar.',
        steps: [
            { text: 'Aufwärmen: 20 Sekunden auf der Stelle marschieren.', sec: 20 },
            { text: 'Kniebeugen: so viele du sauber schaffst.', sec: 40 },
            { text: 'Kurze Pause, schüttel die Beine aus.', sec: 15 },
            { text: 'Liegestütz (an Wand oder auf Knien geht auch).', sec: 40 },
            { text: 'Pause, locker atmen.', sec: 15 },
            { text: 'Plank halten – Bauch fest, Rücken gerade.', sec: 35 },
            { text: 'Ausfallschritte, im Wechsel links/rechts.', sec: 40 },
            { text: 'Geschafft! Dehne kurz die Oberschenkel.', sec: 20 }
        ] },

    /* — Ernährung — */
    tages_check: { disc: 'ernaehrung', icon: '✅', title: 'Tages-Check', xp: 20, type: 'habit',
        blurb: 'Hake ab, was dir heute schon gelungen ist – kleine Siege zählen.',
        habits: [
            '1,5–2 Liter Wasser getrunken',
            'Gemüse oder Obst bei mindestens zwei Mahlzeiten',
            'Eine gute Proteinquelle gegessen',
            'Kein gezuckertes Getränk',
            'Mindestens eine Mahlzeit langsam & ohne Bildschirm'
        ] },
    achtsam_essen: { disc: 'ernaehrung', icon: '🍵', title: 'Achtsam essen', xp: 16, type: 'guided',
        blurb: 'Eine kleine Portion vollkommen bewusst genießen – Sättigung neu spüren.',
        steps: [
            { text: 'Leg dir einen Bissen (z. B. Obst, Nuss) bereit.', sec: 15 },
            { text: 'Betrachte ihn: Farbe, Form, Oberfläche.', sec: 20 },
            { text: 'Rieche bewusst daran. Was nimmst du wahr?', sec: 20 },
            { text: 'Nimm den ersten Bissen – kaue ganz langsam.', sec: 30 },
            { text: 'Spüre Geschmack und Textur, ohne Eile.', sec: 30 },
            { text: 'Schlucke bewusst, atme einmal ruhig durch.', sec: 20 },
            { text: 'Frag dich: Wie satt/zufrieden fühle ich mich?', sec: 15 }
        ] },
    wasser_ritual: { disc: 'ernaehrung', icon: '💧', title: 'Wasser-Ritual', xp: 8, type: 'guided',
        blurb: 'Ein Glas Wasser bewusst trinken – Mikro-Gewohnheit mit großer Wirkung.',
        steps: [
            { text: 'Hol dir ein großes Glas Wasser.', sec: 15 },
            { text: 'Trinke die Hälfte in ruhigen Schlucken.', sec: 20 },
            { text: 'Atme durch, trinke den Rest bewusst aus.', sec: 20 }
        ] },

    /* — Yoga & Beweglichkeit — */
    sonnengruss: { disc: 'yoga', icon: '🌅', title: 'Sonnengruß', xp: 26, type: 'guided',
        blurb: 'Der klassische Flow – fließend von Haltung zu Haltung mit dem Atem.',
        steps: [
            { text: 'Berghaltung: aufrecht stehen, Hände vor dem Herzen.', sec: 20 },
            { text: 'Einatmen: Arme weit nach oben strecken.', sec: 15 },
            { text: 'Ausatmen: Vorbeuge, Hände Richtung Boden.', sec: 20 },
            { text: 'Halbe Vorbeuge: Rücken lang, Blick nach vorn.', sec: 15 },
            { text: 'Ausfallschritt zurück, Brustkorb öffnen.', sec: 20 },
            { text: 'Brett (Plank): Körper in einer Linie halten.', sec: 20 },
            { text: 'Kobra: Brust sanft heben, Schultern weg von Ohren.', sec: 20 },
            { text: 'Herabschauender Hund: Hüfte hoch, Fersen sinken.', sec: 25 },
            { text: 'Zurück nach vorn, sanft hochrollen in den Stand.', sec: 20 },
            { text: 'Berghaltung, Hände vors Herz. Spüre nach.', sec: 15 }
        ] },
    entspannung: { disc: 'yoga', icon: '🌙', title: 'Abend-Dehnung', xp: 18, type: 'guided',
        blurb: 'Sanfte Dehnungen zum Runterkommen – ideal vor dem Schlaf.',
        steps: [
            { text: 'Vierfüßlerstand: Katze-Kuh, Wirbel für Wirbel.', sec: 35 },
            { text: 'Kindhaltung: Stirn zum Boden, Arme lang.', sec: 30 },
            { text: 'Sitzende Vorbeuge, Knie dürfen weich sein.', sec: 30 },
            { text: 'Sanfter Drehsitz nach rechts.', sec: 25 },
            { text: 'Sanfter Drehsitz nach links.', sec: 25 },
            { text: 'Auf den Rücken: Knie umarmen, sanft schaukeln.', sec: 25 },
            { text: 'Ausstrecken, Augen schließen, ruhig atmen.', sec: 20 }
        ] },
    balance: { disc: 'yoga', icon: '🌳', title: 'Balance & Stand', xp: 18, type: 'guided',
        blurb: 'Gleichgewichtshaltungen für Stabilität, Fokus und starke Füße.',
        steps: [
            { text: 'Fester Stand, Blick auf einen festen Punkt.', sec: 15 },
            { text: 'Baum links: rechter Fuß an Wade/Oberschenkel.', sec: 30 },
            { text: 'Lösen, kurz ausschütteln.', sec: 10 },
            { text: 'Baum rechts: linker Fuß an Wade/Oberschenkel.', sec: 30 },
            { text: 'Stuhl: Knie beugen, Arme nach vorn/oben.', sec: 25 },
            { text: 'Auf Zehenspitzen, Gleichgewicht halten.', sec: 20 },
            { text: 'Lösen, ruhig stehen und nachspüren.', sec: 15 }
        ] },

    /* — Meditation & Atem — */
    box_breath: { disc: 'meditation', icon: '🟦', title: 'Box-Atmung', xp: 18, type: 'breath',
        blurb: 'Gleichmäßig 4-4-4-4 atmen – beruhigt das Nervensystem in Minuten.',
        breath: { repeats: 6, phases: [
            { label: 'Einatmen', action: 'inhale', sec: 4 },
            { label: 'Halten', action: 'hold', sec: 4 },
            { label: 'Ausatmen', action: 'exhale', sec: 4 },
            { label: 'Halten', action: 'hold', sec: 4 }
        ] } },
    breath_478: { disc: 'meditation', icon: '🌬️', title: '4-7-8-Atem', xp: 16, type: 'breath',
        blurb: 'Einatmen 4, halten 7, ausatmen 8 – der Klassiker zum Einschlafen.',
        breath: { repeats: 4, phases: [
            { label: 'Einatmen', action: 'inhale', sec: 4 },
            { label: 'Halten', action: 'hold', sec: 7 },
            { label: 'Ausatmen', action: 'exhale', sec: 8 }
        ] } },
    body_scan: { disc: 'meditation', icon: '🧠', title: 'Body-Scan', xp: 24, type: 'guided',
        blurb: 'Wandere mit der Aufmerksamkeit durch den Körper – tiefe Entspannung.',
        steps: [
            { text: 'Setz oder leg dich bequem hin, Augen sanft zu.', sec: 20 },
            { text: 'Spüre deine Füße. Lass jede Anspannung los.', sec: 30 },
            { text: 'Wandere zu Unterschenkeln und Knien.', sec: 30 },
            { text: 'Oberschenkel und Hüfte – werden schwer.', sec: 30 },
            { text: 'Bauch und Rücken – Atem fließt ruhig.', sec: 30 },
            { text: 'Brust, Schultern, Arme bis in die Hände.', sec: 30 },
            { text: 'Nacken, Gesicht, Kiefer – alles weich.', sec: 30 },
            { text: 'Spüre den ganzen Körper als Einheit.', sec: 25 },
            { text: 'Atme tief ein, bewege dich sanft, öffne die Augen.', sec: 15 }
        ] },
    fokus_atem: { disc: 'meditation', icon: '🎯', title: 'Atem-Fokus', xp: 20, type: 'guided',
        blurb: 'Stille Meditation: nur du und dein Atem. Gedanken ziehen vorbei.',
        steps: [
            { text: 'Sitz aufrecht und entspannt, Augen sanft zu.', sec: 20 },
            { text: 'Beobachte den Atem, ohne ihn zu verändern.', sec: 45 },
            { text: 'Zähle still: ein (ein), zwei (aus) … bis zehn.', sec: 60 },
            { text: 'Abgeschweift? Freundlich zurück zum Atem.', sec: 60 },
            { text: 'Lass das Zählen los, ruhe im Atem.', sec: 45 },
            { text: 'Werde wieder weit, öffne langsam die Augen.', sec: 20 }
        ] }
};

/* ---------------- Equipment-Trainer (Coach nutzt verfügbares Material) ---------------- */
Object.assign(KS_TRAINERS, {
    db_kraft: { disc: 'bewegung', icon: '🏋️', title: 'Kurzhantel-Kraft', xp: 30, type: 'guided',
        blurb: 'Ganzkörper-Kraftzirkel mit Kurzhanteln – funktionell und steigerbar.',
        steps: [
            { text: 'Aufwärmen: Hanteln leicht, Arme kreisen.', sec: 25 },
            { text: 'Goblet-Squats: Hantel vor der Brust, tief beugen.', sec: 40 },
            { text: 'Kurze Pause, locker atmen.', sec: 15 },
            { text: 'Schulterdrücken: Hanteln über den Kopf drücken.', sec: 40 },
            { text: 'Vorgebeugtes Rudern: Rücken gerade, Hanteln ziehen.', sec: 40 },
            { text: 'Pause, schüttel die Arme aus.', sec: 15 },
            { text: 'Ausfallschritte mit Hanteln, im Wechsel.', sec: 40 },
            { text: 'Bizeps-Curls langsam und kontrolliert.', sec: 35 },
            { text: 'Geschafft! Dehne Schultern und Arme.', sec: 20 }
        ] },
    kb_flow: { disc: 'bewegung', icon: '⚙️', title: 'Kettlebell-Flow', xp: 32, type: 'guided',
        blurb: 'Schwungvoller Kettlebell-Flow für Kraft und Kondition zugleich.',
        steps: [
            { text: 'Aufwärmen: Hüfte kreisen, Schultern lockern.', sec: 25 },
            { text: 'Kettlebell-Swings: aus der Hüfte schwingen.', sec: 40 },
            { text: 'Pause, tief durchatmen.', sec: 15 },
            { text: 'Goblet-Squats mit der Kettlebell.', sec: 40 },
            { text: 'Einarmiges Rudern links.', sec: 30 },
            { text: 'Einarmiges Rudern rechts.', sec: 30 },
            { text: 'Russian Twists im Sitzen.', sec: 35 },
            { text: 'Auslaufen, Arme ausschütteln.', sec: 20 }
        ] },
    band_kraft: { disc: 'bewegung', icon: '🎗️', title: 'Band-Workout', xp: 24, type: 'guided',
        blurb: 'Gelenkschonende Kraft mit dem Widerstandsband – überall machbar.',
        steps: [
            { text: 'Band testen, Schultern lockern.', sec: 20 },
            { text: 'Band-Squats: aufs Band stellen, ziehen & beugen.', sec: 40 },
            { text: 'Rudern: Band um die Füße, zur Brust ziehen.', sec: 40 },
            { text: 'Schulterdrücken gegen den Bandzug.', sec: 35 },
            { text: 'Seitheben mit dem Band.', sec: 30 },
            { text: 'Glute-Bridge mit Band über den Knien.', sec: 35 },
            { text: 'Dehne kurz nach. Fertig!', sec: 20 }
        ] },
    pullup_basis: { disc: 'bewegung', icon: '🆙', title: 'Zug-Kraft (Stange)', xp: 28, type: 'guided',
        blurb: 'Zugmuster an der Klimmzugstange – Rücken und Griffkraft.',
        steps: [
            { text: 'Schultern aktivieren: an der Stange hängen.', sec: 25 },
            { text: 'Negative Klimmzüge: langsam herablassen.', sec: 40 },
            { text: 'Pause, Hände lockern.', sec: 20 },
            { text: 'Klimmzüge oder Australian Pull-ups.', sec: 40 },
            { text: 'Toter Hang halten – Griffkraft.', sec: 30 },
            { text: 'Dehne Unterarme und Lat. Stark!', sec: 20 }
        ] },
    rope_cardio: { disc: 'bewegung', icon: '🪢', title: 'Seil-Intervalle', xp: 26, type: 'guided',
        blurb: 'Springseil-Intervalle – effizientes Cardio für zwischendurch.',
        steps: [
            { text: 'Locker einspringen, Tempo finden.', sec: 30 },
            { text: 'Intervall 1: zügig springen.', sec: 40 },
            { text: 'Aktive Pause: auf der Stelle gehen.', sec: 25 },
            { text: 'Intervall 2: zügig springen.', sec: 40 },
            { text: 'Aktive Pause.', sec: 25 },
            { text: 'Intervall 3: dein Tempo.', sec: 40 },
            { text: 'Auslaufen, tief atmen.', sec: 20 }
        ] }
});

/* ---------------- Equipment, Ziele, Level ---------------- */
const KS_EQUIPMENT = [
    { id: 'none', icon: '🤸', name: 'Körpergewicht', hint: 'Immer dabei' },
    { id: 'mat', icon: '🧘', name: 'Matte' },
    { id: 'dumbbells', icon: '🏋️', name: 'Kurzhanteln' },
    { id: 'kettlebell', icon: '⚙️', name: 'Kettlebell' },
    { id: 'band', icon: '🎗️', name: 'Widerstandsband' },
    { id: 'pullup', icon: '🆙', name: 'Klimmzugstange' },
    { id: 'rope', icon: '🪢', name: 'Springseil' }
];
const KS_GOALS = [
    { id: 'kraft', icon: '💪', name: 'Kraft aufbauen' },
    { id: 'abnehmen', icon: '🔥', name: 'Fit & schlank' },
    { id: 'beweglichkeit', icon: '🤸', name: 'Beweglichkeit' },
    { id: 'entspannung', icon: '🌙', name: 'Stress & Schlaf' },
    { id: 'allgemein', icon: '✨', name: 'Allgemeine Fitness' }
];
const KS_LEVELS = [
    { id: 'einsteiger', name: 'Einsteiger', factor: 0.8 },
    { id: 'fortgeschritten', name: 'Fortgeschritten', factor: 1.0 },
    { id: 'profi', name: 'Profi', factor: 1.25 }
];

/* Trainer-Metadaten: Equipment, Ziele, Tageszeit, Intensität (1–3). */
const KS_TRAINER_META = {
    mobility:       { equip: ['none'], goals: ['beweglichkeit', 'allgemein'], time: 'morning', intensity: 1 },
    micro_move:     { equip: ['none'], goals: ['abnehmen', 'allgemein'], time: 'any', intensity: 2 },
    kraft_basis:    { equip: ['none'], goals: ['kraft', 'allgemein'], time: 'any', intensity: 3 },
    tages_check:    { equip: ['none'], goals: ['abnehmen', 'allgemein'], time: 'any', intensity: 1 },
    achtsam_essen:  { equip: ['none'], goals: ['entspannung', 'allgemein'], time: 'any', intensity: 1 },
    wasser_ritual:  { equip: ['none'], goals: ['allgemein'], time: 'any', intensity: 1 },
    sonnengruss:    { equip: ['mat', 'none'], goals: ['beweglichkeit', 'allgemein'], time: 'morning', intensity: 2 },
    entspannung:    { equip: ['mat', 'none'], goals: ['beweglichkeit', 'entspannung'], time: 'evening', intensity: 1 },
    balance:        { equip: ['none'], goals: ['beweglichkeit', 'allgemein'], time: 'any', intensity: 2 },
    box_breath:     { equip: ['none'], goals: ['entspannung'], time: 'any', intensity: 1 },
    breath_478:     { equip: ['none'], goals: ['entspannung'], time: 'evening', intensity: 1 },
    body_scan:      { equip: ['mat', 'none'], goals: ['entspannung'], time: 'evening', intensity: 2 },
    fokus_atem:     { equip: ['none'], goals: ['entspannung', 'allgemein'], time: 'any', intensity: 1 },
    db_kraft:       { equip: ['dumbbells'], goals: ['kraft', 'allgemein'], time: 'any', intensity: 3 },
    kb_flow:        { equip: ['kettlebell'], goals: ['kraft', 'abnehmen'], time: 'any', intensity: 3 },
    band_kraft:     { equip: ['band'], goals: ['kraft', 'beweglichkeit'], time: 'any', intensity: 2 },
    pullup_basis:   { equip: ['pullup'], goals: ['kraft'], time: 'any', intensity: 3 },
    rope_cardio:    { equip: ['rope'], goals: ['abnehmen'], time: 'any', intensity: 3 }
};
Object.keys(KS_TRAINERS).forEach(id => {
    const m = KS_TRAINER_META[id] || {};
    Object.assign(KS_TRAINERS[id], {
        equip: m.equip || ['none'],
        goals: m.goals || ['allgemein'],
        time: m.time || 'any',
        intensity: m.intensity || 2
    });
});

/* ---------------- Veränderungs-Reise (Verhaltensänderung lernen) ----------------
   Acht Phasen, die zusammen den vollständigen Kreislauf gelingender
   Veränderung lehren – nach den Prinzipien von Tiny Habits (BJ Fogg),
   Atomic Habits (James Clear), Wenn-Dann-Vorsätzen und identitätsbasierten
   Gewohnheiten. Statt eines starren Plans lernt man, sich zu ändern und es
   in den Alltag zu integrieren. */
const KS_JOURNEY = [
    { id: 'tiny', icon: '🌱', title: 'Winziger Anfang', req: 'action',
      principle: 'Mach es so klein, dass du nicht Nein sagen kannst.',
      lesson: 'Motivation schwankt – Gewohnheiten nicht. Der größte Fehler ist, zu groß zu starten. Schrumpfe deine Wunsch-Handlung, bis sie selbst an einem schlechten Tag in unter 60 Sekunden gelingt: <strong>eine</strong> Kniebeuge, <strong>ein</strong> Glas Wasser, <strong>zwei</strong> Minuten Dehnen. Die Größe kommt später von selbst – erst zählt, dass du es <em>jeden</em> Tag tust.',
      task: 'Lege in der Werkstatt eine Gewohnheit mit einer winzigen Handlung an.',
      examples: ['1 Kniebeuge nach dem Aufstehen', '1 Glas Wasser vor dem Kaffee', '2 Minuten dehnen vor dem Duschen'] },
    { id: 'anchor', icon: '⚓', title: 'Auslöser verankern', req: 'cue',
      principle: 'Hänge die neue Handlung an eine feste Routine.',
      lesson: 'Neue Gewohnheiten brauchen einen verlässlichen Auslöser. Statt „irgendwann am Tag" nutze einen <strong>Wenn-Dann-Vorsatz</strong>: „<em>Nachdem</em> ich [bestehende Routine erledigt habe], <em>werde</em> ich [winzige Handlung tun]." Bestehende Routinen wie Zähneputzen, Kaffee oder Mittagspause sind dein Anker – sie passieren ohnehin zuverlässig.',
      task: 'Ergänze bei deiner Gewohnheit einen konkreten Auslöser (Anker).',
      examples: ['Nach dem Zähneputzen → 5 Kniebeugen', 'Nach dem ersten Kaffee → 1 Glas Wasser', 'Nach dem Mittagessen → 3 Min Spaziergang'] },
    { id: 'celebrate', icon: '🎉', title: 'Sofort feiern', req: 'reward',
      principle: 'Eine kleine Feier verankert die Gewohnheit im Gehirn.',
      lesson: 'Was sich gut anfühlt, wird wiederholt. Gönn dir direkt nach der Handlung eine <strong>Mini-Feier</strong>: ein „Yes!", eine geballte Faust, ein Lächeln im Spiegel. Diese sofortige positive Emotion – nicht erst das Ergebnis in Wochen – sagt deinem Gehirn: „Das machen wir wieder."',
      task: 'Lege bei deiner Gewohnheit eine sofortige Belohnung oder Feier fest.',
      examples: ['Faust ballen und „Stark!" denken', 'Tief durchatmen und lächeln', 'Das Häkchen bewusst setzen'] },
    { id: 'environment', icon: '🏠', title: 'Umgebung gestalten', req: 'env',
      principle: 'Mach das Gute leicht und das Schlechte mühsam.',
      lesson: 'Willenskraft verliert auf Dauer gegen die Umgebung. Gestalte deinen Raum so, dass die gute Handlung der <strong>Weg des geringsten Widerstands</strong> ist: Sportkleidung sichtbar bereitlegen, die Wasserflasche auf den Schreibtisch, Obst in Sichtweite – und Süßes außer Reichweite.',
      task: 'Beschreibe eine Veränderung deiner Umgebung, die die Handlung erleichtert.',
      examples: ['Sportschuhe neben die Tür stellen', 'Wasserflasche auf den Schreibtisch', 'Süßigkeiten in den Keller räumen'] },
    { id: 'stack', icon: '🧱', title: 'Gewohnheiten stapeln', req: 'stack',
      principle: 'Wachse, indem du Neues an Bewährtes kettest.',
      lesson: 'Wenn eine winzige Gewohnheit sitzt, baue darauf auf. <strong>Habit-Stacking</strong> verkettet Handlungen zu einer Routine: „Nach [Gewohnheit 1] mache ich [Gewohnheit 2]." So wird aus einer Kniebeuge mit der Zeit ein kurzes Morgen-Workout – ohne dass es sich nach Überwindung anfühlt.',
      task: 'Lege eine zweite Gewohnheit an oder ergänze einen Stapel-Schritt.',
      examples: ['Nach 5 Kniebeugen → 5 Liegestütze', 'Nach dem Wasser → 1 Stück Obst', 'Nach dem Dehnen → 3 tiefe Atemzüge'] },
    { id: 'identity', icon: '🪞', title: 'Identität', req: 'identity',
      principle: 'Werde die Person, die diese Gewohnheit lebt.',
      lesson: 'Die stärksten Gewohnheiten gehören zu deiner <strong>Identität</strong>. Verschiebe den Fokus vom Ziel zur Person: nicht „Ich will abnehmen", sondern „Ich bin jemand, der sich täglich bewegt." Jede kleine Handlung ist eine Stimme für diese neue Identität. Formuliere sie als „Ich bin jemand, der …".',
      task: 'Formuliere bei deiner Gewohnheit eine Identitäts-Aussage.',
      examples: ['„Ich bin jemand, der seinen Körper pflegt."', '„Ich bin ein bewegter Mensch."', '„Ich bin jemand, der bewusst isst."'] },
    { id: 'relapse', icon: '🛟', title: 'Rückfälle meistern', req: 'reflect',
      principle: 'Verpasse nie zweimal hintereinander.',
      lesson: 'Rückfälle gehören dazu – sie sind kein Scheitern, sondern Teil des Weges. Die Regel der Meister: „<strong>Never miss twice</strong>." Ein verpasster Tag ist ein Unfall, zwei sind der Beginn einer neuen schlechten Gewohnheit. Plane deinen Wiedereinstieg <em>im Voraus</em> und begegne dir mit Freundlichkeit statt Härte.',
      task: 'Halte in der Reflexion deinen Wiedereinstiegs-Plan fest.',
      examples: ['„Verpasse ich einen Tag, mache ich morgen die Mini-Version."', '„Ich starte sofort wieder – ohne Drama."'] },
    { id: 'mastery', icon: '🏔️', title: 'Integration & Meisterschaft', req: 'none',
      principle: 'Die Gewohnheit ist jetzt Teil deines Lebens.',
      lesson: 'Du hast den Kreislauf der Veränderung einmal vollständig durchlaufen: klein anfangen, verankern, feiern, Umgebung gestalten, stapeln, Identität, Rückfälle meistern. Jetzt wird Veränderung zur Routine deines Lebens. Pflege deine Gewohnheiten weiter, skaliere behutsam – und beginne den Kreis für die nächste Gewohnheit von vorn.',
      task: 'Lebe deine Gewohnheiten weiter und starte bei Bedarf eine neue Reise.',
      examples: ['Eine neue winzige Gewohnheit hinzufügen', 'Bestehende behutsam vergrößern', 'Andere im Alltag inspirieren'] }
];

/* ---------------- Verbundene Pläne & Schwester-Schulen ---------------- */
const KS_LINKS = [
    { icon: '🏋️', title: 'Trainingsplan-Generator', desc: 'Erstelle deinen individuellen Wochen-Trainingsplan.', href: '../../personal-training.html', disc: 'bewegung' },
    { icon: '🥗', title: 'Ernährungsplan', desc: 'Lass dir einen persönlichen Ernährungs- und Mahlzeitenplan erstellen.', href: '../../ernaehrungsberatung.html', disc: 'ernaehrung' },
    { icon: '🧠', title: 'Schule des Gedächtnisses', desc: 'Trainiere deinen Geist – Teil deines täglichen Rituals.', href: '../gedaechtnisschule/index-gedaechtnisschule.html', disc: 'meditation' },
    { icon: '✋', title: 'Schule der Sinne', desc: 'Schärfe deine Wahrnehmung – Körper und Geist verbunden.', href: '../sinnesschule/index-sinnesschule.html', disc: 'yoga' }
];

class KoerperSchule {
    constructor() {
        this.view = 'dashboard';
        this.activeDisc = 'bewegung';
        this.timer = null;
        this.currentTrainer = null;
        this.journeyTab = 'reise';
        this.editingHabitId = null;
        this.state = this._defaultState();
    }

    _defaultState() {
        const disc = {};
        KS_DISCIPLINES.forEach(d => { disc[d.id] = { xp: 0, sessions: 0, best: {} }; });
        return {
            startedAt: new Date().toISOString().slice(0, 10),
            alias: null,
            disc,
            streak: 0,
            lastPracticeDate: null,
            totalSessions: 0,
            totalMinutes: 0,
            log: [],
            practiceDays: [],
            habitsToday: { date: null, checks: {} },
            journey: { phase: 0, ack: {}, habits: [], reflections: [] },
            profile: {
                onboarded: false,
                goal: 'allgemein',
                level: 'einsteiger',
                equipment: ['none'],
                daysPerWeek: 3,
                sessionLength: 10,
                reminderTime: '',
                voice: true
            },
            coach: { week: null, days: {}, adjust: {}, feedback: [] },
            theme: 'forest'
        };
    }

    _applyTheme() {
        const t = KS_THEMES.find(x => x.id === this.state.theme) || KS_THEMES[0];
        const r = document.documentElement.style;
        r.setProperty('--ss-accent', t.a);
        r.setProperty('--ss-accent-2', t.a2);
    }
    _rankEmblem() { return KS_emblem(this._overallGrade()); }

    _handleDeepLink() {
        try {
            const sp = new URLSearchParams(window.location.search);
            const start = sp.get('start');
            if (!start) return;
            if (KS_TRAINERS[start]) { this.activeDisc = KS_TRAINERS[start].disc; this.go('practice'); this._startTrainer(start); }
            else if (['plan', 'journal', 'practice', 'coach', 'dashboard'].includes(start)) { this.go(start); }
        } catch (e) { /* ignore */ }
    }

    async init() {
        await this._load();
        if (!this.state.alias) this.state.alias = this._generateAlias();
        if (!this.state.theme) this.state.theme = 'forest';
        if (!this.state.habitsToday) this.state.habitsToday = { date: null, checks: {} };
        this._profile();
        this._coach();
        this._journey();
        this._applyTheme();
        this._bindNav();
        this.render();
        this._handleDeepLink();
        this._scheduleReminder();
    }

    _profile() {
        const def = { onboarded: false, goal: 'allgemein', level: 'einsteiger', equipment: ['none'], daysPerWeek: 3, sessionLength: 10, reminderTime: '', voice: true };
        if (!this.state.profile || typeof this.state.profile !== 'object') this.state.profile = def;
        else this.state.profile = Object.assign({}, def, this.state.profile);
        if (!Array.isArray(this.state.profile.equipment) || !this.state.profile.equipment.length) this.state.profile.equipment = ['none'];
        if (!this.state.profile.equipment.includes('none')) this.state.profile.equipment.unshift('none');
        return this.state.profile;
    }
    _coach() {
        if (!this.state.coach || typeof this.state.coach !== 'object') this.state.coach = { week: null, days: {}, adjust: {}, feedback: [] };
        const c = this.state.coach;
        if (!c.days || typeof c.days !== 'object') c.days = {};
        if (!c.adjust || typeof c.adjust !== 'object') c.adjust = {};
        if (!Array.isArray(c.feedback)) c.feedback = [];
        return c;
    }

    /* ---------------- Persistenz ---------------- */
    _merge(base, incoming) {
        const out = JSON.parse(JSON.stringify(base));
        if (!incoming) return out;
        Object.keys(incoming).forEach(k => {
            if (k === 'disc' && incoming.disc) {
                KS_DISCIPLINES.forEach(d => { out.disc[d.id] = Object.assign({}, out.disc[d.id], incoming.disc[d.id] || {}); });
            } else {
                out[k] = incoming[k];
            }
        });
        return out;
    }
    async _load() {
        try {
            const local = JSON.parse(localStorage.getItem('ks_state'));
            if (local && local.startedAt) this.state = this._merge(this._defaultState(), local);
        } catch (e) { /* ignore */ }
        try {
            if (window.workflowAPI) {
                const res = await window.workflowAPI.getWorkflowResults(KS_METHOD);
                const remote = res && (res.results || res.state || (res.startedAt ? res : null));
                if (remote && remote.startedAt) {
                    this.state = this._merge(this._defaultState(), remote);
                    localStorage.setItem('ks_state', JSON.stringify(this.state));
                }
            }
        } catch (e) { console.warn('Cloud-Load fehlgeschlagen:', e); }
    }
    async _save() {
        localStorage.setItem('ks_state', JSON.stringify(this.state));
        let synced = false;
        try {
            if (window.workflowAPI) {
                const loggedIn = this._isLoggedIn();
                await window.workflowAPI.saveWorkflowResults(KS_METHOD, this.state);
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

    /* ---------------- Identität ---------------- */
    _isLoggedIn() {
        try { return !!(window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()); }
        catch (e) { return false; }
    }
    _generateAlias() {
        const a = KS_ALIAS_ADJ[Math.floor(Math.random() * KS_ALIAS_ADJ.length)];
        const n = KS_ALIAS_NOUN[Math.floor(Math.random() * KS_ALIAS_NOUN.length)];
        const num = Math.floor(100 + Math.random() * 900);
        return `${a} ${n} #${num}`;
    }

    /* ---------------- Praxis-Tage / Streak ---------------- */
    _registerPracticeDay(minutes) {
        const today = this._today();
        const yest = this._dayOffset(-1);
        if (this.state.lastPracticeDate !== today) {
            if (this.state.lastPracticeDate === yest || !this.state.lastPracticeDate) this.state.streak = (this.state.streak || 0) + 1;
            else this.state.streak = 1;
            this.state.lastPracticeDate = today;
        }
        if (!this.state.practiceDays.includes(today)) this.state.practiceDays.push(today);
        this.state.totalSessions++;
        this.state.totalMinutes += minutes;
    }
    _today() { return new Date().toISOString().slice(0, 10); }
    _dayOffset(d) { return new Date(Date.now() + d * 86400000).toISOString().slice(0, 10); }

    /* ---------------- Graduierung ---------------- */
    _grade(id) { return KS_gradeFromXP(this.state.disc[id].xp); }
    _gradeProgress(id) {
        const g = this._grade(id);
        const base = KS_T(g), next = KS_T(g + 1);
        const xp = this.state.disc[id].xp;
        return Math.max(0, Math.min(100, Math.round(((xp - base) / (next - base)) * 100)));
    }
    _totalXP() { return KS_DISCIPLINES.reduce((a, d) => a + (this.state.disc[d.id].xp || 0), 0); }
    _overallGrade() { return KS_gradeFromXP(Math.round(this._totalXP() / KS_DISCIPLINES.length)); }
    _overallTitle() { return KS_titleFor(this._overallGrade()); }

    /* ---------------- Navigation / Router ---------------- */
    _bindNav() {
        document.querySelectorAll('.ss-nav-btn').forEach(btn => btn.addEventListener('click', () => this.go(btn.dataset.view)));
        this._bindSwipe();
    }
    _bindSwipe() {
        const main = document.getElementById('ss-main');
        if (!main || main._swipeBound) return;
        main._swipeBound = true;
        let x0 = null, y0 = null;
        main.addEventListener('touchstart', e => {
            if (e.touches.length !== 1) { x0 = null; return; }
            x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
        }, { passive: true });
        main.addEventListener('touchend', e => {
            if (x0 == null) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - x0, dy = t.clientY - y0;
            x0 = null;
            if (Math.abs(dx) < 65 || Math.abs(dy) > 55) return;
            if (this.timer) return;
            const views = [...document.querySelectorAll('#ss-nav .ss-nav-btn')].map(b => b.dataset.view);
            const cur = views.indexOf(this.view);
            if (cur < 0) return;
            const next = dx < 0 ? cur + 1 : cur - 1;
            if (next < 0 || next >= views.length) return;
            this._haptic('light');
            this.go(views[next]);
        }, { passive: true });
    }
    go(view) {
        this.view = view;
        this._stopTimer();
        this._coachActive = false; this._coachQueue = null;
        document.querySelectorAll('.ss-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
        this.render();
    }
    render() {
        const main = document.getElementById('ss-main');
        if (!main) return;
        if (!this.state.profile.onboarded) { main.innerHTML = this._renderOnboarding(); this._afterOnboarding(); return; }
        switch (this.view) {
            case 'dashboard': main.innerHTML = this._renderDashboard(); this._afterDashboard(); break;
            case 'coach':     main.innerHTML = this._renderCoach(); this._afterCoach(); break;
            case 'practice':  main.innerHTML = this._renderPractice(); this._afterPractice(); break;
            case 'plan':      main.innerHTML = this._renderPlan(); this._afterPlan(); break;
            case 'journal':   main.innerHTML = this._renderJournal(); this._afterJournal(); break;
            default:          main.innerHTML = this._renderDashboard(); this._afterDashboard();
        }
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------------- Tagesempfehlung ---------------- */
    _todaysTrainer() {
        const ids = Object.keys(KS_TRAINERS);
        const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return ids[doy % ids.length];
    }

    /* ===================== DASHBOARD ===================== */
    _renderDashboard() {
        const total = this._totalXP();
        this._buildCoachWeek();
        const todayPlan = this.state.coach.days[this._today()];
        const isRest = todayPlan && todayPlan.rest;
        const coachDone = todayPlan && todayPlan.done;
        const session = (todayPlan && !isRest && todayPlan.session) ? todayPlan.session.map(id => KS_TRAINERS[id]).filter(Boolean) : [];
        const tt = session[0] || KS_TRAINERS[this._todaysTrainer()];
        const td = KS_DISC_MAP[tt.disc];
        const trainedToday = this.state.lastPracticeDate === this._today();
        return `
        <div class="ss-hero gm-hero-id">
            <div class="gm-hero-emblem" title="Dein Rang wächst mit deinem Grad">${this._rankEmblem()}</div>
            <div class="gm-hero-body">
                <div class="ss-kicker">Dein Körper-Dojo · ${this._overallTitle()}</div>
                <h1>Trainiere deinen Körper – in kleinen Schritten</h1>
                <p>Vier Disziplinen: Bewegung &amp; Kraft, Ernährung, Yoga und Meditation &amp; Atem. Jeden Tag eine kleine Einheit – so wächst Vitalität, und Körper und Geist verbinden sich zu einem täglichen Ritual.</p>
            </div>
        </div>

        <div class="gm-theme-row">
            <span class="gm-theme-label"><i class="fas fa-palette"></i> Dojo-Stil</span>
            ${KS_THEMES.map(t => `<button class="gm-theme-dot ${this.state.theme === t.id ? 'active' : ''}" data-theme="${t.id}" title="${t.name}" style="background:linear-gradient(135deg,${t.a2},${t.a})"></button>`).join('')}
        </div>

        <div class="ss-stats">
            <div class="ss-stat"><div class="ss-stat-num">${total.toLocaleString('de-DE')}</div><div class="ss-stat-label">Vitalkraft</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this._overallTitle()}</div><div class="ss-stat-label">Titel · Grad ${this._overallGrade()}</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this.state.streak || 0}🔥</div><div class="ss-stat-label">Tage in Folge</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this.state.totalSessions || 0}</div><div class="ss-stat-label">Einheiten</div></div>
        </div>

        <div class="ss-panel ks-today" style="--accent:${td.accent};--accent-soft:${td.soft}">
            <div class="ks-today-head">
                <div>
                    <div class="ss-kicker">${isRest ? 'Heute · Erholungstag' : coachDone ? 'Heute erledigt ✓ · stark!' : 'Dein Coach-Training für heute'}</div>
                    <h3 style="margin:4px 0 2px">${isRest ? '🌙 Aktive Erholung' : (session.length > 1 ? '🔥 Kombi-Training' : tt.icon + ' ' + tt.title)}</h3>
                    <p class="sub" style="margin:0">${isRest ? 'Regeneration gehört dazu' : (session.length ? session.map(s => s.icon).join(' ') + ' · ' + this._fmtDur(session.reduce((a, s) => a + this._sessionDur(s), 0)) : td.name)}</p>
                </div>
                <button class="ss-btn ss-btn-primary" id="ks-start-today"><i class="fas fa-${isRest ? 'wind' : 'play'}"></i> ${isRest ? 'Coach' : coachDone ? 'Nochmal' : 'Starten'}</button>
            </div>
        </div>

        <h2 style="margin:8px 0 14px;font-size:20px">Deine Disziplinen</h2>
        <div class="ss-grid">
            ${KS_DISCIPLINES.map(d => this._discCard(d)).join('')}
        </div>

        ${this._ritualPanel()}

        <div class="ss-panel ks-bridge">
            <h3 style="margin:0 0 4px"><i class="fas fa-link"></i> Körper &amp; Geist verbinden</h3>
            <p class="sub" style="margin:0 0 12px">Dein tägliches Ritual reicht über den Körper hinaus. Trainiere auch Gedächtnis und Sinne.</p>
            <div class="ks-bridge-row">
                <a class="ss-btn ss-btn-ghost" href="../gedaechtnisschule/index-gedaechtnisschule.html">🧠 Gedächtnis</a>
                <a class="ss-btn ss-btn-ghost" href="../sinnesschule/index-sinnesschule.html">✋ Sinne</a>
                <button class="ss-btn ss-btn-ghost" id="ks-goto-plan"><i class="fas fa-clipboard-list"></i> Pläne &amp; Programme</button>
            </div>
        </div>`;
    }

    _ritualPanel() {
        const today = this._today();
        const schools = [
            { key: 'ks_state', icon: '体', name: 'Körper', here: true },
            { key: 'gs_state', icon: '🧠', name: 'Gedächtnis', href: '../gedaechtnisschule/index-gedaechtnisschule.html' },
            { key: 'ss_state', icon: '✋', name: 'Sinne', href: '../sinnesschule/index-sinnesschule.html' }
        ];
        const status = schools.map(s => {
            let done = false;
            try { const st = JSON.parse(localStorage.getItem(s.key) || 'null'); done = !!(st && st.lastPracticeDate === today); } catch (e) { /* ignore */ }
            return Object.assign({}, s, { done });
        });
        const doneCount = status.filter(s => s.done).length;
        return `
        <div class="ss-panel ks-ritual">
            <div class="ks-ritual-head">
                <h3 style="margin:0"><i class="fas fa-circle-nodes"></i> Tägliches Ritual</h3>
                <span class="ks-ritual-count">${doneCount}/3 heute</span>
            </div>
            <p class="sub" style="margin:4px 0 12px">Eine kleine Einheit in jeder Schule – Körper, Geist und Sinne als ein verbundenes Ritual.</p>
            <div class="ks-ritual-row">
                ${status.map(s => `
                    <${s.here ? 'button' : 'a'} class="ks-ritual-item ${s.done ? 'done' : ''}" ${s.here ? `data-ritual="coach"` : `href="${s.href}"`}>
                        <span class="ic">${s.icon}</span>
                        <span class="nm">${s.name}</span>
                        <span class="st">${s.done ? '<i class="fas fa-circle-check"></i> erledigt' : 'offen'}</span>
                    </${s.here ? 'button' : 'a'}>`).join('')}
            </div>
        </div>`;
    }
    _afterRitual() {
        document.querySelectorAll('[data-ritual="coach"]').forEach(b => b.addEventListener('click', () => this.go('coach')));
    }

    _discCard(d) {
        const grade = this._grade(d.id);
        const prog = this._gradeProgress(d.id);
        const st = this.state.disc[d.id];
        return `
        <div class="ss-sense-card" data-disc="${d.id}" style="--accent:${d.accent};--accent-soft:${d.soft};--accent-glow:${d.glow}">
            <div class="ss-sense-head">
                <div class="ss-sense-icon">${d.icon}</div>
                <div>
                    <div class="ss-sense-name">${d.name}</div>
                    <div class="ss-sense-grade-name">Grad ${grade} · ${KS_titleFor(grade)}</div>
                </div>
                <div class="ss-sense-rank">${(st.xp || 0).toLocaleString('de-DE')}</div>
            </div>
            <p class="ss-sense-meta" style="margin:8px 0 0">${d.blurb}</p>
            <div class="gm-disc-tags">${d.tags.map(t => `<span class="gm-tag">${t}</span>`).join('')}</div>
            <div class="ss-prog"><div class="ss-prog-bar"><div class="ss-prog-fill" style="width:${prog}%"></div></div></div>
        </div>`;
    }

    _afterDashboard() {
        document.querySelectorAll('.ss-sense-card').forEach(card => card.addEventListener('click', () => { this.activeDisc = card.dataset.disc; this.go('practice'); }));
        const today = document.getElementById('ks-start-today');
        if (today) today.addEventListener('click', () => {
            const plan = this.state.coach.days[this._today()];
            if (plan && !plan.rest && plan.session && plan.session.length) { this.view = 'coach'; this._startCoachSession(); }
            else this.go('coach');
        });
        const plan = document.getElementById('ks-goto-plan');
        if (plan) plan.addEventListener('click', () => this.go('plan'));
        document.querySelectorAll('.gm-theme-dot').forEach(dot => dot.addEventListener('click', () => {
            this.state.theme = dot.dataset.theme;
            this._save();
            this._applyTheme();
            this.render();
        }));
        this._afterRitual();
    }

    /* ===================== ONBOARDING (Coach-Setup) ===================== */
    _renderOnboarding() {
        const p = this.state.profile;
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Dein persönlicher Coach</div>
            <h1>Lass uns deinen Weg einrichten</h1>
            <p>Beantworte ein paar Fragen – dein Coach stellt dir danach jeden Tag das passende Training zusammen. Du kannst alles später ändern.</p>
        </div>
        <div class="ss-panel ks-onb">
            <div class="ks-onb-block">
                <h3>1 · Was ist dein Ziel?</h3>
                <div class="ks-opt-grid" id="onb-goal">
                    ${KS_GOALS.map(g => `<button class="ks-opt ${p.goal === g.id ? 'active' : ''}" data-goal="${g.id}"><span class="ic">${g.icon}</span><span>${g.name}</span></button>`).join('')}
                </div>
            </div>
            <div class="ks-onb-block">
                <h3>2 · Wie fit bist du gerade?</h3>
                <div class="ks-opt-grid cols-3" id="onb-level">
                    ${KS_LEVELS.map(l => `<button class="ks-opt ${p.level === l.id ? 'active' : ''}" data-level="${l.id}"><span>${l.name}</span></button>`).join('')}
                </div>
            </div>
            <div class="ks-onb-block">
                <h3>3 · Welches Equipment hast du?</h3>
                <p class="sub" style="margin:0 0 10px">Körpergewicht ist immer dabei. Wähle, was du zusätzlich nutzen kannst.</p>
                <div class="ks-opt-grid" id="onb-equip">
                    ${KS_EQUIPMENT.map(e => `<button class="ks-opt ${p.equipment.includes(e.id) ? 'active' : ''} ${e.id === 'none' ? 'locked' : ''}" data-equip="${e.id}"><span class="ic">${e.icon}</span><span>${e.name}</span></button>`).join('')}
                </div>
            </div>
            <div class="ks-onb-block ks-onb-row">
                <div>
                    <h3>4 · Tage pro Woche</h3>
                    <div class="ks-stepper" id="onb-days">
                        <button data-days="dec">−</button><span class="val" id="onb-days-val">${p.daysPerWeek}</span><button data-days="inc">+</button>
                    </div>
                </div>
                <div>
                    <h3>5 · Minuten pro Einheit</h3>
                    <div class="ks-opt-grid cols-3" id="onb-len">
                        ${[5, 10, 20].map(m => `<button class="ks-opt ${p.sessionLength === m ? 'active' : ''}" data-len="${m}"><span>${m} Min</span></button>`).join('')}
                    </div>
                </div>
            </div>
            <div class="ks-onb-block">
                <h3>6 · Tägliche Erinnerung <span class="sub" style="font-weight:400">(optional)</span></h3>
                <input type="time" id="onb-reminder" class="ks-time-input" value="${p.reminderTime || ''}">
            </div>
            <button class="ss-btn ss-btn-primary ss-btn-block" id="onb-finish"><i class="fas fa-flag-checkered"></i> Coaching starten</button>
        </div>`;
    }
    _afterOnboarding() {
        const p = this.state.profile;
        const main = document.getElementById('ss-main');
        main.querySelectorAll('#onb-goal [data-goal]').forEach(b => b.addEventListener('click', () => { p.goal = b.dataset.goal; main.querySelectorAll('#onb-goal .ks-opt').forEach(x => x.classList.toggle('active', x === b)); }));
        main.querySelectorAll('#onb-level [data-level]').forEach(b => b.addEventListener('click', () => { p.level = b.dataset.level; main.querySelectorAll('#onb-level .ks-opt').forEach(x => x.classList.toggle('active', x === b)); }));
        main.querySelectorAll('#onb-equip [data-equip]').forEach(b => b.addEventListener('click', () => {
            const id = b.dataset.equip;
            if (id === 'none') return;
            const i = p.equipment.indexOf(id);
            if (i >= 0) p.equipment.splice(i, 1); else p.equipment.push(id);
            b.classList.toggle('active');
        }));
        main.querySelectorAll('#onb-len [data-len]').forEach(b => b.addEventListener('click', () => { p.sessionLength = +b.dataset.len; main.querySelectorAll('#onb-len .ks-opt').forEach(x => x.classList.toggle('active', x === b)); }));
        main.querySelectorAll('#onb-days [data-days]').forEach(b => b.addEventListener('click', () => {
            p.daysPerWeek = Math.max(1, Math.min(7, p.daysPerWeek + (b.dataset.days === 'inc' ? 1 : -1)));
            document.getElementById('onb-days-val').textContent = p.daysPerWeek;
        }));
        const finish = document.getElementById('onb-finish');
        if (finish) finish.addEventListener('click', () => {
            const rt = document.getElementById('onb-reminder');
            p.reminderTime = rt ? rt.value : '';
            p.onboarded = true;
            this.state.coach.week = null;
            this._buildCoachWeek();
            this._save();
            this._scheduleReminder();
            this._celebrate();
            this._toast('Dein Coach ist bereit! 🎉', 'gold');
            this.go('coach');
        });
    }

    /* ===================== COACH (Freeletics-Stil) ===================== */
    _renderCoach() {
        const p = this.state.profile;
        const week = this._buildCoachWeek();
        const todayKey = this._today();
        const todayPlan = this.state.coach.days[todayKey];
        const goal = KS_GOALS.find(g => g.id === p.goal) || KS_GOALS[4];
        const lvl = KS_LEVELS.find(l => l.id === p.level) || KS_LEVELS[0];
        const doneToday = todayPlan && todayPlan.done;
        const sessIds = (todayPlan && !todayPlan.rest && Array.isArray(todayPlan.session)) ? todayPlan.session.filter(id => KS_TRAINERS[id]) : [];
        const session = sessIds.map(id => KS_TRAINERS[id]);
        const exDur = id => Math.round(this._sessionDur(KS_TRAINERS[id]) * this._intensity(id));
        const totalSec = sessIds.reduce((a, id) => a + exDur(id), 0);
        return `
        <div class="ss-hero ks-coach-hero">
            <div class="ss-kicker">Dein Coach · ${goal.icon} ${goal.name} · ${lvl.name}</div>
            <h1>${doneToday ? 'Heute erledigt – stark! 🎉' : (todayPlan && todayPlan.rest) ? 'Heute ist Erholungstag' : 'Dein Training für heute'}</h1>
            <p>Dein Coach passt das Training an dein Ziel, dein Equipment und dein Feedback an. Jeden Tag eine machbare Einheit – das ist der Freeletics-Weg in deinem Dojo.</p>
            <button class="ss-btn ss-btn-ghost ks-coach-edit" id="ks-coach-settings"><i class="fas fa-sliders"></i> Coach anpassen</button>
        </div>

        ${(todayPlan && todayPlan.rest)
            ? `<div class="ss-panel ks-rest"><span class="ic">🌙</span><div><h3 style="margin:0 0 4px">Aktive Erholung</h3><p class="sub" style="margin:0">Regeneration ist Teil des Fortschritts. Optional: eine kurze Atem- oder Dehn-Einheit.</p><div class="ks-bridge-row" style="margin-top:12px"><button class="ss-btn ss-btn-ghost" data-quick="breath_478">🌬️ 4-7-8-Atem</button><button class="ss-btn ss-btn-ghost" data-quick="entspannung">🌙 Abend-Dehnung</button></div></div></div>`
            : `<div class="ss-panel ks-coach-session">
                <div class="ks-coach-session-head">
                    <div><div class="ss-kicker">Heutige Einheit · ${this._fmtDur(totalSec)} · Intensität ${this._intensityLabel()}</div><h2 style="margin:4px 0 0">${session.length > 1 ? 'Kombi-Training' : (session[0] ? session[0].title : 'Training')}</h2></div>
                    ${doneToday ? `<span class="ks-done-badge"><i class="fas fa-circle-check"></i> Erledigt</span>` : ''}
                </div>
                <div class="ks-coach-steps">
                    ${sessIds.map((id, i) => { const t = KS_TRAINERS[id]; return `<div class="ks-coach-ex"><span class="n">${i + 1}</span><span class="ic">${t.icon}</span><div class="b"><div class="t">${t.title}</div><div class="s">${KS_DISC_MAP[t.disc].name} · ${this._fmtDur(exDur(id))}</div></div></div>`; }).join('')}
                </div>
                ${doneToday
                    ? `<button class="ss-btn ss-btn-ghost ss-btn-block" id="ks-coach-redo"><i class="fas fa-rotate-right"></i> Noch eine Runde</button>`
                    : `<button class="ss-btn ss-btn-primary ss-btn-block" id="ks-coach-start"><i class="fas fa-play"></i> Einheit starten</button>`}
            </div>`}

        <div class="ss-panel">
            <h3 style="margin:0 0 12px"><i class="fas fa-calendar-week"></i> Deine Woche</h3>
            <div class="ks-week">
                ${week.map(d => {
                    const pl = this.state.coach.days[d.key];
                    const cls = d.key === todayKey ? 'today' : '';
                    const state = pl && pl.done ? 'done' : pl && pl.rest ? 'rest' : pl ? 'planned' : 'empty';
                    const icon = state === 'done' ? '<i class="fas fa-check"></i>' : state === 'rest' ? '🌙' : state === 'planned' ? (KS_DISC_MAP[(pl.session[0] && KS_TRAINERS[pl.session[0]].disc) || 'bewegung'].icon) : '·';
                    return `<div class="ks-week-day ${cls} ${state}"><span class="dow">${d.dow}</span><span class="cell">${icon}</span></div>`;
                }).join('')}
            </div>
            <p class="sub" style="margin:12px 0 0">${p.daysPerWeek} Trainingstage/Woche · Rest passt sich an, wenn du an einem Tag mehr oder weniger machst.</p>
        </div>`;
    }
    _afterCoach() {
        const start = document.getElementById('ks-coach-start');
        if (start) start.addEventListener('click', () => this._startCoachSession());
        const redo = document.getElementById('ks-coach-redo');
        if (redo) redo.addEventListener('click', () => this._startCoachSession());
        const settings = document.getElementById('ks-coach-settings');
        if (settings) settings.addEventListener('click', () => { this.state.profile.onboarded = false; this.render(); });
        document.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.quick; this.activeDisc = KS_TRAINERS[id].disc; this.go('practice'); this._startTrainer(id); }));
    }

    /* ---------------- Coach-Logik ---------------- */
    _hasEquip(t) { const eq = this.state.profile.equipment || ['none']; return (t.equip || ['none']).some(e => eq.includes(e)); }
    _availableTrainerIds() { return Object.keys(KS_TRAINERS).filter(id => this._hasEquip(KS_TRAINERS[id])); }
    _timeOfDay() { const h = new Date().getHours(); return h < 11 ? 'morning' : h >= 18 ? 'evening' : 'midday'; }

    _intensity(trainerId) {
        const lvl = KS_LEVELS.find(l => l.id === this.state.profile.level) || KS_LEVELS[0];
        const adj = (this.state.coach.adjust && this.state.coach.adjust[trainerId]) || 0;
        return Math.max(0.6, Math.min(1.6, lvl.factor + adj));
    }
    _intensityLabel() {
        const lvl = KS_LEVELS.find(l => l.id === this.state.profile.level) || KS_LEVELS[0];
        return lvl.name;
    }

    /* Wählt eine Session (1–3 Trainer) passend zu Ziel, Equipment, Tageszeit und Länge. */
    _pickSessionFor(dateKey, seedExtra) {
        const p = this.state.profile;
        const avail = this._availableTrainerIds().map(id => ({ id, ...KS_TRAINERS[id] }));
        const tod = this._timeOfDay();
        const seed = this._dateSeed(dateKey) + (seedExtra || 0);
        const rnd = this._seeded(seed);
        // Bewertung: Zielpassung + Tageszeit + schwächste Disziplin fördern
        const grades = {}; KS_DISCIPLINES.forEach(d => grades[d.id] = this._grade(d.id));
        const minGrade = Math.min(...Object.values(grades));
        const score = t => {
            let s = 0;
            if ((t.goals || []).includes(p.goal)) s += 5;
            if ((t.goals || []).includes('allgemein')) s += 1;
            if (t.time === tod) s += 2;
            if (t.time === 'any') s += 1;
            if (grades[t.disc] === minGrade) s += 2;
            if (t.type === 'habit') s -= 2;
            return s + rnd() * 2;
        };
        // Hauptübung: beste bewegungs-/zielnahe Einheit, die nicht 'habit' ist
        const ranked = avail.filter(t => t.type !== 'habit').sort((a, b) => score(b) - score(a));
        const main = ranked[0] || avail[0];
        const session = [main.id];
        let budget = (p.sessionLength * 60) - this._sessionDur(main) * this._intensity(main.id);
        // Fülle mit ergänzenden Einheiten anderer Disziplinen
        const used = new Set([main.id]); const usedDisc = new Set([main.disc]);
        const allowSameDisc = p.sessionLength >= 20;
        for (const t of ranked) {
            if (session.length >= 3 || budget <= 30) break;
            if (used.has(t.id)) continue;
            if (usedDisc.has(t.disc) && !allowSameDisc) continue;
            const dur = this._sessionDur(t) * this._intensity(t.id);
            if (dur <= budget + 40) { session.push(t.id); used.add(t.id); usedDisc.add(t.disc); budget -= dur; }
        }
        // Abschluss bei längeren Einheiten: kurze Atem-/Dehn-Einheit
        if (p.sessionLength >= 10 && !session.some(id => KS_TRAINERS[id].disc === 'meditation')) {
            const cool = avail.find(t => t.disc === 'meditation' && t.type !== 'habit');
            if (cool && session.length < 3) session.push(cool.id);
        }
        return session;
    }

    _buildCoachWeek() {
        const c = this.state.coach;
        const monday = this._weekStart();
        if (c.week === monday && c.days && Object.keys(c.days).some(k => k >= monday)) {
            // Sorge dafür, dass heute existiert
            const tk = this._today();
            if (!c.days[tk]) c.days[tk] = this._planForDay(tk);
            return this._weekDays();
        }
        c.week = monday;
        const p = this.state.profile;
        // Trainingstage gleichmäßig über die Woche verteilen
        const trainIdx = this._spreadDays(p.daysPerWeek);
        const days = this._weekDays();
        const oldDays = c.days || {};
        c.days = {};
        days.forEach((d, i) => {
            const existing = oldDays[d.key];
            if (existing && existing.done) { c.days[d.key] = existing; return; }
            if (trainIdx.includes(i)) c.days[d.key] = { session: this._pickSessionFor(d.key), done: false, rest: false };
            else c.days[d.key] = { session: [], done: false, rest: true };
        });
        return days;
    }
    _planForDay(key) {
        const idx = (new Date(key).getDay() + 6) % 7;
        const trainIdx = this._spreadDays(this.state.profile.daysPerWeek);
        return trainIdx.includes(idx)
            ? { session: this._pickSessionFor(key), done: false, rest: false }
            : { session: [], done: false, rest: true };
    }
    _spreadDays(n) {
        n = Math.max(1, Math.min(7, n));
        const out = [];
        for (let i = 0; i < n; i++) out.push(Math.round(i * 7 / n) % 7);
        return [...new Set(out)];
    }
    _weekStart() {
        const d = new Date(); const day = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10);
    }
    _weekDays() {
        const start = new Date(this._weekStart());
        const dows = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        return dows.map((dow, i) => { const dt = new Date(start.getTime() + i * 86400000); return { key: dt.toISOString().slice(0, 10), dow }; });
    }
    _dateSeed(key) { return key.split('-').reduce((a, n) => a + parseInt(n, 10), 0); }
    _seeded(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

    _startCoachSession() {
        const tk = this._today();
        const plan = this.state.coach.days[tk];
        if (!plan || !plan.session || !plan.session.length) { this._toast('Heute ist Erholungstag', 'success'); return; }
        this._coachQueue = plan.session.slice();
        this._coachActive = true;
        this._runCoachNext();
    }
    _runCoachNext() {
        if (!this._coachQueue || !this._coachQueue.length) { this._finishCoachDay(); return; }
        const id = this._coachQueue.shift();
        if (!KS_TRAINERS[id]) return this._runCoachNext();
        this.activeDisc = KS_TRAINERS[id].disc;
        this._startTrainer(id);
    }
    _finishCoachDay() {
        this._coachActive = false;
        const tk = this._today();
        if (this.state.coach.days[tk]) this.state.coach.days[tk].done = true;
        this._save();
        this._haptic('level');
        this._celebrate();
        this.view = 'coach';
        this._renderCoachFeedback();
    }
    _renderCoachFeedback() {
        const main = document.getElementById('ss-main');
        if (!main) return;
        main.innerHTML = `
        <div class="ss-panel ks-feedback" style="text-align:center">
            <h2>🎉 Einheit abgeschlossen!</h2>
            <p class="sub">Wie hat sich das Training angefühlt? Dein Coach passt die nächste Einheit an.</p>
            <div class="ks-feedback-opts">
                <button class="ss-btn ss-btn-ghost" data-fb="easy">😎 Zu leicht</button>
                <button class="ss-btn ss-btn-primary" data-fb="ok">👍 Genau richtig</button>
                <button class="ss-btn ss-btn-ghost" data-fb="hard">🥵 Zu hart</button>
            </div>
        </div>`;
        main.querySelectorAll('[data-fb]').forEach(b => b.addEventListener('click', () => this._applyCoachFeedback(b.dataset.fb)));
    }
    _applyCoachFeedback(fb) {
        const tk = this._today();
        const plan = this.state.coach.days[tk];
        const delta = fb === 'easy' ? 0.1 : fb === 'hard' ? -0.1 : 0;
        if (plan && plan.session) plan.session.forEach(id => {
            const cur = this.state.coach.adjust[id] || 0;
            this.state.coach.adjust[id] = Math.max(-0.3, Math.min(0.4, cur + delta));
        });
        this.state.coach.feedback.unshift({ date: tk, fb });
        this.state.coach.feedback = this.state.coach.feedback.slice(0, 60);
        this._save();
        this._toast(fb === 'ok' ? 'Stark – weiter so!' : 'Coach angepasst ✓', 'success');
        this.go('coach');
    }

    /* ---------------- Erinnerung ---------------- */
    _scheduleReminder() {
        try {
            if (this._reminderTimer) { clearTimeout(this._reminderTimer); this._reminderTimer = null; }
            const rt = this.state.profile.reminderTime;
            if (!rt || !/^\d{2}:\d{2}$/.test(rt)) return;
            if (!('Notification' in window)) return;
            if (Notification.permission === 'default') Notification.requestPermission().catch(() => {});
            const [h, m] = rt.split(':').map(Number);
            const now = new Date();
            const target = new Date(); target.setHours(h, m, 0, 0);
            if (target <= now) return; // nur für heute, sonst beim nächsten Öffnen
            const ms = target - now;
            if (ms > 6 * 3600 * 1000) return;
            this._reminderTimer = setTimeout(() => {
                const tk = this._today();
                const plan = this.state.coach.days[tk];
                if (plan && plan.done) return;
                try { if (Notification.permission === 'granted') new Notification('Die Schule des Körpers', { body: 'Zeit für deine kleine Einheit heute 💪', icon: '/favicon.ico' }); } catch (e) { /* ignore */ }
                this._toast('Zeit für dein Training heute 💪', 'gold');
            }, ms);
        } catch (e) { /* ignore */ }
    }

    /* ===================== PRACTICE ===================== */
    _renderPractice() {
        const d = KS_DISC_MAP[this.activeDisc];
        const grade = this._grade(this.activeDisc);
        const all = Object.keys(KS_TRAINERS).filter(id => KS_TRAINERS[id].disc === this.activeDisc).map(id => ({ id, ...KS_TRAINERS[id] }));
        const avail = all.filter(t => this._hasEquip(t));
        const locked = all.filter(t => !this._hasEquip(t));
        const equipName = ids => (ids || []).filter(e => e !== 'none').map(e => { const x = KS_EQUIPMENT.find(q => q.id === e); return x ? x.name : e; }).join(', ');
        const equipBadge = t => { const need = (t.equip || ['none']).filter(e => e !== 'none'); return need.length ? `<span class="ks-equip-badge">${equipName(t.equip)}</span>` : ''; };
        return `
        <div class="ss-sense-picker">
            ${KS_DISCIPLINES.map(x => `<button class="ss-chip ${x.id === this.activeDisc ? 'active' : ''}" data-disc="${x.id}">${x.icon} ${x.short}</button>`).join('')}
        </div>
        <div class="ss-panel" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <h2>${d.icon} ${d.name} — ${KS_titleFor(grade)} (Grad ${grade})</h2>
            <p class="sub">${d.blurb}</p>
            <div class="ss-exercise-list">
                ${avail.map(t => `
                    <div class="ss-exercise-item" data-trainer="${t.id}">
                        <div class="ic">${t.icon}</div>
                        <div class="body">
                            <div class="title">${t.title} ${equipBadge(t)}</div>
                            <div class="desc">${t.blurb}</div>
                        </div>
                        <div class="dur">${t.type === 'habit' ? '+' + t.xp : this._fmtDur(this._sessionDur(t))}</div>
                    </div>`).join('')}
            </div>
            ${locked.length ? `<div class="ks-locked-hint"><i class="fas fa-lock"></i> ${locked.length} weitere Übung${locked.length > 1 ? 'en' : ''} mit zusätzlichem Equipment (${[...new Set(locked.flatMap(t => (t.equip || []).filter(e => e !== 'none')))].map(e => { const x = KS_EQUIPMENT.find(q => q.id === e); return x ? x.name : e; }).join(', ')}). <button class="ks-link-btn" id="ks-edit-equip">Equipment anpassen</button></div>` : ''}
        </div>`;
    }
    _afterPractice() {
        document.querySelectorAll('.ss-chip').forEach(c => c.addEventListener('click', () => { this.activeDisc = c.dataset.disc; this.render(); }));
        document.querySelectorAll('.ss-exercise-item').forEach(item => item.addEventListener('click', () => this._startTrainer(item.dataset.trainer)));
        const ee = document.getElementById('ks-edit-equip');
        if (ee) ee.addEventListener('click', () => { this.state.profile.onboarded = false; this.render(); });
    }

    /* ===================== VERÄNDERUNGS-REISE ===================== */
    _renderPlan() {
        const tab = this.journeyTab || 'reise';
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Veränderungs-Reise</div>
            <h1>Lerne, dich zu ändern – und es zu leben</h1>
            <p>Kein starrer Plan, sondern ein Weg: In kleinen Phasen verstehst du, wie Veränderung wirklich gelingt – und verankerst sie Schritt für Schritt in deinem Alltag, bis sie zu dir gehört.</p>
        </div>
        <div class="ss-sense-picker ks-journey-tabs">
            <button class="ss-chip ${tab === 'reise' ? 'active' : ''}" data-jtab="reise">🧭 Reise</button>
            <button class="ss-chip ${tab === 'werkstatt' ? 'active' : ''}" data-jtab="werkstatt">🛠️ Werkstatt</button>
            <button class="ss-chip ${tab === 'werkzeuge' ? 'active' : ''}" data-jtab="werkzeuge">📋 Werkzeuge</button>
        </div>
        ${tab === 'reise' ? this._journeyReise() : tab === 'werkstatt' ? this._journeyWerkstatt() : this._journeyWerkzeuge()}`;
    }
    _afterPlan() {
        document.querySelectorAll('[data-jtab]').forEach(b => b.addEventListener('click', () => { this.journeyTab = b.dataset.jtab; this.editingHabitId = null; this.render(); }));
        const tab = this.journeyTab || 'reise';
        if (tab === 'reise') this._afterJourneyReise();
        else if (tab === 'werkstatt') this._afterJourneyWerkstatt();
        else this._afterJourneyWerkzeuge();
    }

    _journeyReise() {
        const j = this._journey();
        const idx = Math.min(j.phase || 0, KS_JOURNEY.length - 1);
        const ph = KS_JOURNEY[idx];
        const reqMet = this._reqMet(ph.req);
        const acked = !!j.ack[idx];
        const isLast = idx >= KS_JOURNEY.length - 1;
        const canAdvance = acked && reqMet && !isLast;
        const habits = j.habits || [];
        const today = this._today();
        return `
        <div class="ss-stats">
            <div class="ss-stat"><div class="ss-stat-num">${idx + 1}/${KS_JOURNEY.length}</div><div class="ss-stat-label">Phase</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this._integrationDays()}</div><div class="ss-stat-label">Integrations-Tage</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${habits.length}</div><div class="ss-stat-label">Gewohnheiten</div></div>
        </div>
        <div class="ks-phase-path">
            ${KS_JOURNEY.map((p, i) => `<div class="ks-phase-dot ${i < idx ? 'done' : i === idx ? 'current' : 'locked'}" title="${this._esc(p.title)}"><span class="ic">${i < idx ? '✓' : p.icon}</span><span class="lbl">${this._esc(p.title)}</span></div>`).join('')}
        </div>
        <div class="ss-panel ks-phase-card">
            <div class="ks-phase-head"><span class="ic">${ph.icon}</span><div><div class="ss-kicker">Phase ${idx + 1} · ${isLast ? 'Dauerphase' : 'Lernschritt'}</div><h2 style="margin:2px 0">${ph.title}</h2><p class="ks-phase-principle">${this._esc(ph.principle)}</p></div></div>
            <div class="ks-phase-lesson">${ph.lesson}</div>
            <div class="ks-phase-examples"><span class="lbl">Beispiele:</span> ${ph.examples.map(e => `<span>${this._esc(e)}</span>`).join('')}</div>
            <div class="ks-phase-task ${reqMet ? 'met' : ''}">
                <i class="fas ${reqMet ? 'fa-circle-check' : 'fa-circle-dot'}"></i>
                <div class="body"><strong>Deine Aufgabe</strong><div>${this._esc(ph.task)}</div></div>
                ${ph.req !== 'none' && ph.req !== 'reflect' ? `<button class="ss-btn ss-btn-ghost" id="ks-go-werkstatt">Zur Werkstatt</button>` : ''}
                ${ph.req === 'reflect' ? `<button class="ss-btn ss-btn-ghost" id="ks-go-reflect">Reflexion schreiben</button>` : ''}
            </div>
            <label class="ks-ack"><input type="checkbox" id="ks-ack" ${acked ? 'checked' : ''}> Ich habe diese Phase verstanden und beginne, sie zu leben.</label>
            ${isLast
                ? `<p class="sub" style="margin-top:8px"><i class="fas fa-infinity"></i> Du hast den Kreislauf der Veränderung gemeistert. Pflege deine Gewohnheiten – oder starte eine neue Reise.</p>`
                : `<button class="ss-btn ss-btn-primary" id="ks-advance" ${canAdvance ? '' : 'disabled'}>Phase abschließen <i class="fas fa-arrow-right"></i></button>
                   ${!reqMet ? `<p class="sub" style="margin-top:8px">Erledige zuerst die Aufgabe, um die nächste Phase freizuschalten.</p>` : ''}`}
        </div>
        ${habits.length ? `
        <div class="ss-panel">
            <h3 style="margin:0 0 4px"><i class="fas fa-list-check"></i> Heute leben</h3>
            <p class="sub" style="margin:0 0 12px">Hake deine Mikro-Gewohnheiten ab – jeder Tag zählt für deine Integration.</p>
            <div class="ks-habit-today">
                ${habits.map(h => { const done = (h.days || []).includes(today); return `<button class="ks-today-habit ${done ? 'done' : ''}" data-hid="${h.id}"><span class="chk"><i class="fas ${done ? 'fa-circle-check' : 'fa-circle'}"></i></span><span class="tbody"><span class="t">${this._esc(h.title || h.action || 'Gewohnheit')}</span><span class="s">${h.cue ? 'Nach: ' + this._esc(h.cue) : this._esc(h.action || '')}</span></span><span class="streak">${this._habitStreak(h)}🔥</span></button>`; }).join('')}
            </div>
        </div>` : `<div class="ss-panel ks-plan-hint"><i class="fas fa-seedling"></i> Noch keine Gewohnheit. Lege in der <strong>Werkstatt</strong> deine erste winzige Gewohnheit an.</div>`}`;
    }
    _afterJourneyReise() {
        const ack = document.getElementById('ks-ack');
        if (ack) ack.addEventListener('change', () => { const j = this._journey(); const idx = Math.min(j.phase || 0, KS_JOURNEY.length - 1); j.ack[idx] = ack.checked; this._save(); this.render(); });
        const adv = document.getElementById('ks-advance');
        if (adv) adv.addEventListener('click', () => this._advancePhase());
        const gw = document.getElementById('ks-go-werkstatt');
        if (gw) gw.addEventListener('click', () => { this.journeyTab = 'werkstatt'; this.render(); });
        const gr = document.getElementById('ks-go-reflect');
        if (gr) gr.addEventListener('click', () => this._reflectPrompt());
        document.querySelectorAll('.ks-today-habit').forEach(b => b.addEventListener('click', () => this._toggleHabitToday(b.dataset.hid)));
    }

    _journeyWerkstatt() {
        const j = this._journey();
        const editing = this.editingHabitId ? (j.habits || []).find(h => h.id === this.editingHabitId) : null;
        const h = editing || {};
        const domains = [['bewegung', '💪 Bewegung'], ['ernaehrung', '🥗 Ernährung'], ['yoga', '🧘 Yoga'], ['meditation', '🌬️ Meditation'], ['allgemein', '✨ Allgemein']];
        return `
        <div class="ss-panel">
            <h2 style="margin:0 0 4px">🛠️ Gewohnheits-Werkstatt</h2>
            <p class="sub" style="margin:0 0 14px">Designe deine Gewohnheit Schritt für Schritt. Du musst nicht alle Felder sofort füllen – jede Phase ergänzt eines.</p>
            <div class="ks-form">
                <label>Gewohnheit (Titel)<input id="kf-title" value="${this._esc(h.title || '')}" placeholder="z. B. Morgen-Kniebeugen"></label>
                <label>Bereich<select id="kf-domain">${domains.map(d => `<option value="${d[0]}" ${(h.domain || 'bewegung') === d[0] ? 'selected' : ''}>${d[1]}</option>`).join('')}</select></label>
                <label>🌱 Winzige Handlung<input id="kf-action" value="${this._esc(h.action || '')}" placeholder="z. B. 1 Kniebeuge"></label>
                <label>⚓ Auslöser (nach welcher Routine?)<input id="kf-cue" value="${this._esc(h.cue || '')}" placeholder="z. B. nach dem Zähneputzen"></label>
                <label>🎉 Sofort-Belohnung<input id="kf-reward" value="${this._esc(h.reward || '')}" placeholder="z. B. Faust ballen und lächeln"></label>
                <label>🏠 Umgebung gestalten<input id="kf-env" value="${this._esc(h.env || '')}" placeholder="z. B. Sportschuhe bereitlegen"></label>
                <label>🧱 Stapel-Schritt (was folgt danach?)<input id="kf-stack" value="${this._esc(h.stack || '')}" placeholder="z. B. danach 5 Liegestütze"></label>
                <label>🪞 Identität<input id="kf-identity" value="${this._esc(h.identity || '')}" placeholder="Ich bin jemand, der …"></label>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
                <button class="ss-btn ss-btn-primary" id="kf-save"><i class="fas fa-check"></i> ${editing ? 'Änderungen speichern' : 'Gewohnheit anlegen'}</button>
                ${editing ? `<button class="ss-btn ss-btn-ghost" id="kf-cancel">Abbrechen</button>` : ''}
            </div>
        </div>
        ${(j.habits || []).length ? `
        <div class="ss-panel">
            <h3 style="margin:0 0 12px"><i class="fas fa-seedling"></i> Deine Gewohnheiten</h3>
            <div class="ks-habit-list">
                ${j.habits.map(hb => { const dm = KS_DISC_MAP[hb.domain]; const acc = dm ? dm.accent : '#34d399'; const done = (hb.days || []).includes(this._today()); return `
                <div class="ks-habit-row" style="--accent:${acc}">
                    <button class="chk ${done ? 'done' : ''}" data-hid="${hb.id}" title="Heute erledigt"><i class="fas ${done ? 'fa-circle-check' : 'fa-circle'}"></i></button>
                    <div class="hbody">
                        <div class="t">${this._esc(hb.title || hb.action || 'Gewohnheit')} <span class="streak">${this._habitStreak(hb)}🔥</span></div>
                        <div class="s">${hb.cue ? '<i class="fas fa-anchor"></i> ' + this._esc(hb.cue) + ' → ' : ''}${this._esc(hb.action || '')}</div>
                        ${hb.identity ? `<div class="idn">${this._esc(hb.identity)}</div>` : ''}
                    </div>
                    <div class="acts">
                        <button class="ic-btn" data-edit="${hb.id}" title="Bearbeiten"><i class="fas fa-pen"></i></button>
                        <button class="ic-btn" data-del="${hb.id}" title="Löschen"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`; }).join('')}
            </div>
        </div>` : ''}`;
    }
    _afterJourneyWerkstatt() {
        const save = document.getElementById('kf-save');
        if (save) save.addEventListener('click', () => this._saveHabit());
        const cancel = document.getElementById('kf-cancel');
        if (cancel) cancel.addEventListener('click', () => { this.editingHabitId = null; this.render(); });
        document.querySelectorAll('.ks-habit-row .chk').forEach(b => b.addEventListener('click', () => this._toggleHabitToday(b.dataset.hid)));
        document.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => { this.editingHabitId = b.dataset.edit; this.render(); window.scrollTo({ top: 0 }); }));
        document.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => this._deleteHabit(b.dataset.del)));
    }

    _journeyWerkzeuge() {
        return `
        <div class="ss-panel ks-plan-hint" style="margin-bottom:16px"><i class="fas fa-lightbulb"></i> Werkzeuge unterstützen deine Reise: Ein Trainings- oder Ernährungsplan liefert <em>Inhalte</em>, auf die du die Veränderungs-Methode anwendest. Der Wandel selbst entsteht durch deine täglichen kleinen Schritte.</div>
        <div id="ks-plan-live" class="ks-plan-live"></div>
        <h3 style="margin:8px 0 12px"><i class="fas fa-toolbox"></i> Programme &amp; Schwester-Schulen</h3>
        <div class="ss-grid">
            ${KS_LINKS.map(l => { const d = KS_DISC_MAP[l.disc]; return `<a class="ss-sense-card ks-link-card" href="${l.href}" style="--accent:${d.accent};--accent-soft:${d.soft};--accent-glow:${d.glow}"><div class="ss-sense-head"><div class="ss-sense-icon">${l.icon}</div><div><div class="ss-sense-name">${l.title}</div></div><i class="fas fa-arrow-up-right-from-square ss-sense-rank" style="font-size:15px"></i></div><p class="ss-sense-meta" style="margin:8px 0 0">${l.desc}</p></a>`; }).join('')}
        </div>`;
    }
    async _afterJourneyWerkzeuge() {
        const wrap = document.getElementById('ks-plan-live');
        if (!wrap) return;
        if (!this._isLoggedIn()) {
            wrap.innerHTML = `<div class="ss-panel ks-plan-hint"><i class="fas fa-cloud"></i> Melde dich an, damit erstellte Trainings- und Ernährungspläne hier erscheinen.</div>`;
            return;
        }
        wrap.innerHTML = `<div class="ss-panel ks-plan-hint"><i class="fas fa-circle-notch fa-spin"></i> Lade deine aktiven Pläne …</div>`;
        const panels = [];
        try { if (window.awsTrainingAPI) { const plan = await window.awsTrainingAPI.getCurrentPlan().catch(() => null); if (plan) panels.push(this._trainingPlanPanel(plan)); } } catch (e) { /* ignore */ }
        try { if (window.awsNutritionAPI) { const np = await window.awsNutritionAPI.getCurrentPlan().catch(() => null); let s = null; try { s = await window.awsNutritionAPI.getTodaysSummary(); } catch (e) { /* ignore */ } if (np || s) panels.push(this._nutritionPlanPanel(np, s)); } } catch (e) { /* ignore */ }
        wrap.innerHTML = panels.length ? panels.join('') : `<div class="ss-panel ks-plan-hint"><i class="fas fa-seedling"></i> Noch kein aktiver Plan erstellt.</div>`;
    }

    /* ---------------- Reise-Logik ---------------- */
    _journey() {
        if (!this.state.journey) this.state.journey = { phase: 0, ack: {}, habits: [], reflections: [] };
        const j = this.state.journey;
        if (!j.ack) j.ack = {};
        if (!Array.isArray(j.habits)) j.habits = [];
        if (!Array.isArray(j.reflections)) j.reflections = [];
        if (typeof j.phase !== 'number') j.phase = 0;
        return j;
    }
    _reqMet(req) {
        const j = this._journey();
        const H = j.habits;
        switch (req) {
            case 'action': return H.some(h => h.action);
            case 'cue': return H.some(h => h.cue);
            case 'reward': return H.some(h => h.reward);
            case 'env': return H.some(h => h.env);
            case 'stack': return H.length >= 2 || H.some(h => h.stack);
            case 'identity': return H.some(h => h.identity);
            case 'reflect': return j.reflections.some(r => (r.phase || 0) >= 6);
            case 'none': return true;
            default: return true;
        }
    }
    _integrationDays() {
        const j = this._journey();
        const set = new Set();
        j.habits.forEach(h => (h.days || []).forEach(d => set.add(d)));
        return set.size;
    }
    _habitStreak(h) {
        const setd = new Set(h.days || []);
        if (!setd.size) return 0;
        let cur = this._today();
        if (!setd.has(cur)) cur = this._dayOffset(-1);
        let streak = 0;
        while (setd.has(cur)) { streak++; cur = new Date(new Date(cur).getTime() - 86400000).toISOString().slice(0, 10); }
        return streak;
    }
    _saveHabit() {
        const g = id => document.getElementById(id);
        const get = id => (g(id) ? g(id).value.trim() : '');
        const title = get('kf-title');
        const action = get('kf-action');
        if (!title && !action) { this._toast('Bitte mindestens Titel oder Handlung angeben', 'error'); return; }
        const j = this._journey();
        const data = { title, domain: (g('kf-domain') ? g('kf-domain').value : 'bewegung'), action, cue: get('kf-cue'), reward: get('kf-reward'), env: get('kf-env'), stack: get('kf-stack'), identity: get('kf-identity') };
        if (this.editingHabitId) {
            const h = j.habits.find(x => x.id === this.editingHabitId);
            if (h) Object.assign(h, data);
            this.editingHabitId = null;
            this._toast('Gewohnheit aktualisiert', 'success');
        } else {
            j.habits.push(Object.assign({ id: 'h' + Date.now(), createdAt: this._today(), days: [] }, data));
            this._toast('Gewohnheit angelegt', 'success');
        }
        this._save();
        this.render();
    }
    _deleteHabit(id) {
        const j = this._journey();
        j.habits = j.habits.filter(h => h.id !== id);
        if (this.editingHabitId === id) this.editingHabitId = null;
        this._save();
        this.render();
    }
    _toggleHabitToday(id) {
        const j = this._journey();
        const h = j.habits.find(x => x.id === id);
        if (!h) return;
        if (!Array.isArray(h.days)) h.days = [];
        const today = this._today();
        const i = h.days.indexOf(today);
        if (i >= 0) {
            h.days.splice(i, 1);
        } else {
            h.days.push(today);
            h.lastDone = today;
            const dm = KS_DISC_MAP[h.domain];
            if (dm) {
                this._registerPracticeDay(1);
                this.state.disc[h.domain].xp += 6;
                this.state.log.unshift({ id: Date.now(), date: today, disc: h.domain, trainer: 'Gewohnheit: ' + (h.title || h.action || ''), score: 100, detail: 'Veränderungs-Reise', xp: 6 });
                this.state.log = this.state.log.slice(0, 120);
            }
            this._haptic('ok');
            this._chime(false);
        }
        this._save();
        this.render();
    }
    _advancePhase() {
        const j = this._journey();
        const idx = Math.min(j.phase || 0, KS_JOURNEY.length - 1);
        if (idx >= KS_JOURNEY.length - 1) return;
        if (!j.ack[idx] || !this._reqMet(KS_JOURNEY[idx].req)) { this._toast('Aufgabe und Bestätigung zuerst abschließen', 'error'); return; }
        j.phase = idx + 1;
        this._save();
        this._haptic('level');
        this._celebrate();
        this._toast('Neue Phase: ' + KS_JOURNEY[j.phase].title, 'gold');
        this.render();
    }
    _reflectPrompt() {
        this._modal({
            title: 'Dein Wiedereinstiegs-Plan',
            label: 'Wie steigst du nach einem verpassten Tag wieder ein?',
            placeholder: 'z. B. „Verpasse ich einen Tag, mache ich morgen die Mini-Version – ohne Drama."',
            confirm: 'Speichern',
            onConfirm: (txt) => {
                if (txt && txt.trim()) {
                    const j = this._journey();
                    j.reflections.unshift({ id: Date.now(), date: this._today(), phase: Math.min(j.phase || 0, KS_JOURNEY.length - 1), text: txt.trim() });
                    this._save();
                    this._toast('Reflexion gespeichert', 'success');
                    this.render();
                }
            }
        });
    }
    _modal({ title, label, placeholder, confirm, onConfirm }) {
        const prev = document.getElementById('ks-modal');
        if (prev) prev.remove();
        const wrap = document.createElement('div');
        wrap.id = 'ks-modal';
        wrap.className = 'ks-modal-overlay';
        wrap.innerHTML = `
        <div class="ks-modal" role="dialog" aria-modal="true" aria-label="${this._esc(title)}">
            <h3>${this._esc(title)}</h3>
            ${label ? `<label class="ks-modal-label">${this._esc(label)}</label>` : ''}
            <textarea class="ks-modal-input" rows="4" placeholder="${this._esc(placeholder || '')}"></textarea>
            <div class="ks-modal-actions">
                <button class="ss-btn ss-btn-ghost" data-act="cancel">Abbrechen</button>
                <button class="ss-btn ss-btn-primary" data-act="ok">${this._esc(confirm || 'OK')}</button>
            </div>
        </div>`;
        document.body.appendChild(wrap);
        const ta = wrap.querySelector('.ks-modal-input');
        setTimeout(() => ta && ta.focus(), 50);
        const close = () => wrap.remove();
        wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
        wrap.querySelector('[data-act="cancel"]').addEventListener('click', close);
        wrap.querySelector('[data-act="ok"]').addEventListener('click', () => { const v = ta ? ta.value : ''; close(); if (onConfirm) onConfirm(v); });
    }
    _trainingPlanPanel(plan) {
        const d = KS_DISC_MAP.bewegung;
        const goals = Array.isArray(plan.goals) ? plan.goals.slice(0, 3).join(', ') : '';
        const weeks = Array.isArray(plan.weeks) ? plan.weeks.length : null;
        return `
        <div class="ss-panel ks-plan-card" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <div class="ks-plan-card-head"><span class="ic">🏋️</span><div><div class="t">${this._esc(plan.title || 'Dein Trainingsplan')}</div><div class="s">Aktiver Trainingsplan</div></div></div>
            <div class="ks-plan-meta">
                ${plan.level ? `<span><i class="fas fa-signal"></i> ${this._esc(plan.level)}</span>` : ''}
                ${plan.frequency ? `<span><i class="fas fa-calendar-week"></i> ${this._esc(plan.frequency)}×/Woche</span>` : ''}
                ${plan.timePerSession ? `<span><i class="fas fa-clock"></i> ${this._esc(plan.timePerSession)} Min</span>` : ''}
                ${weeks ? `<span><i class="fas fa-layer-group"></i> ${weeks} Wochen</span>` : ''}
            </div>
            ${goals ? `<p class="sub" style="margin:10px 0 0"><i class="fas fa-bullseye"></i> ${this._esc(goals)}</p>` : ''}
            <a class="ss-btn ss-btn-ghost" style="margin-top:14px" href="../../personal-training-dashboard.html">Trainingsplan öffnen</a>
        </div>`;
    }
    _nutritionPlanPanel(plan, summary) {
        const d = KS_DISC_MAP.ernaehrung;
        const goal = (summary && summary.goal) || (plan && plan.dailyCalories) || null;
        const today = summary ? summary.calories : null;
        const meals = plan && plan.mealsPerDay;
        const pct = (goal && today != null) ? Math.min(100, Math.round(today / goal * 100)) : null;
        return `
        <div class="ss-panel ks-plan-card" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <div class="ks-plan-card-head"><span class="ic">🥗</span><div><div class="t">Dein Ernährungsplan</div><div class="s">Aktiver Plan</div></div></div>
            <div class="ks-plan-meta">
                ${goal ? `<span><i class="fas fa-fire"></i> Ziel ${goal} kcal/Tag</span>` : ''}
                ${meals ? `<span><i class="fas fa-utensils"></i> ${this._esc(meals)} Mahlzeiten/Tag</span>` : ''}
            </div>
            ${pct != null ? `<div class="ss-prog" style="margin-top:12px"><div class="ss-prog-bar"><div class="ss-prog-fill" style="width:${pct}%"></div></div></div><p class="sub" style="margin:6px 0 0">Heute: ${today} / ${goal} kcal</p>` : ''}
            <a class="ss-btn ss-btn-ghost" style="margin-top:14px" href="../../ernaehrungsberatung.html">Ernährungsplan öffnen</a>
        </div>`;
    }

    /* ===================== JOURNAL & INSIGHTS ===================== */
    _renderJournal() {
        const log = this.state.log || [];
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Logbuch &amp; Fortschritt</div>
            <h1>Dein Körper-Tagebuch</h1>
            <p>${log.length} Einträge. Jede kleine Einheit ist ein Schritt zu mehr Vitalität.</p>
        </div>
        ${this._insightsBlock()}
        <h3 style="margin:18px 0 12px"><i class="fas fa-feather"></i> Verlauf</h3>
        <div id="ks-journal-list">
            ${log.length === 0
                ? `<div class="ss-empty"><i class="fas fa-feather"></i>Noch keine Einträge. Beginne im Dojo mit deiner Tageseinheit.</div>`
                : log.map(e => {
                    const d = KS_DISC_MAP[e.disc] || KS_DISCIPLINES[0];
                    return `<div class="ss-log-entry" style="--accent:${d.accent};--accent-soft:${d.soft}">
                        <div class="ss-log-meta">
                            <span class="ss-log-tag">${d.icon} ${d.short}</span>
                            <span>${this._fmtDate(e.date)}</span>
                            ${e.trainer ? `<span>· ${this._esc(e.trainer)}</span>` : ''}
                            <span style="color:#e0b04a">· ${e.score}%</span>
                            <span style="color:var(--ss-green)">+${e.xp}</span>
                        </div>
                        ${e.detail ? `<div class="ss-log-text">${this._esc(e.detail)}</div>` : ''}
                    </div>`;
                }).join('')}
        </div>`;
    }
    _afterJournal() { /* statische Insights, keine Bindings nötig */ }

    _insightsBlock() {
        const week = this._weekDays().map(d => d.key);
        const log = this.state.log || [];
        const weekLogs = log.filter(e => week.includes(e.date));
        const perDisc = {}; KS_DISCIPLINES.forEach(d => perDisc[d.id] = 0);
        weekLogs.forEach(e => { if (perDisc[e.disc] != null) perDisc[e.disc]++; });
        const weekSessions = weekLogs.length;
        const weekDaysActive = new Set(weekLogs.map(e => e.date)).size;
        return `
        <div class="ss-panel ks-insights">
            <div class="ks-insights-grid">
                <div class="ks-insight-radar">
                    <h3 style="margin:0 0 8px"><i class="fas fa-chart-area"></i> Balance</h3>
                    ${this._radarSVG()}
                </div>
                <div class="ks-insight-side">
                    <h3 style="margin:0 0 8px"><i class="fas fa-bolt"></i> Diese Woche</h3>
                    <div class="ks-week-stats">
                        <div><span class="n">${weekSessions}</span><span class="l">Einheiten</span></div>
                        <div><span class="n">${weekDaysActive}</span><span class="l">aktive Tage</span></div>
                        <div><span class="n">${this.state.streak || 0}🔥</span><span class="l">Streak</span></div>
                    </div>
                    <div class="ks-disc-bars">
                        ${KS_DISCIPLINES.map(d => { const max = Math.max(1, ...Object.values(perDisc)); const w = Math.round((perDisc[d.id] / max) * 100); return `<div class="ks-disc-bar" style="--accent:${d.accent}"><span class="lbl">${d.icon}</span><div class="track"><div class="fill" style="width:${perDisc[d.id] ? Math.max(8, w) : 0}%"></div></div><span class="v">${perDisc[d.id]}</span></div>`; }).join('')}
                    </div>
                </div>
            </div>
            <h3 style="margin:18px 0 8px"><i class="fas fa-calendar-days"></i> Deine letzten Wochen</h3>
            ${this._heatmap()}
        </div>`;
    }
    _radarSVG() {
        const cx = 120, cy = 110, R = 84;
        const grades = KS_DISCIPLINES.map(d => this._grade(d.id));
        const maxG = Math.max(1, ...grades);
        const angles = [-90, 0, 90, 180]; // oben, rechts, unten, links
        const pt = (i, r) => { const a = angles[i] * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
        const rings = [0.25, 0.5, 0.75, 1].map(f => `<polygon points="${angles.map((_, i) => pt(i, R * f).join(',')).join(' ')}" class="ks-radar-ring"/>`).join('');
        const dataPts = grades.map((g, i) => pt(i, R * (g / maxG)).join(',')).join(' ');
        const labels = KS_DISCIPLINES.map((d, i) => { const [x, y] = pt(i, R + 16); return `<text x="${x}" y="${y}" class="ks-radar-lbl" text-anchor="middle" dominant-baseline="middle">${d.icon}</text>`; }).join('');
        return `
        <svg viewBox="0 0 240 240" class="ks-radar" role="img" aria-label="Balance der vier Disziplinen">
            ${rings}
            ${angles.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="ks-radar-axis"/>`; }).join('')}
            <polygon points="${dataPts}" class="ks-radar-data"/>
            ${grades.map((g, i) => { const [x, y] = pt(i, R * (g / maxG)); return `<circle cx="${x}" cy="${y}" r="3.5" class="ks-radar-dot"/>`; }).join('')}
            ${labels}
        </svg>
        <div class="ks-radar-legend">${KS_DISCIPLINES.map((d, i) => `<span style="--accent:${d.accent}">${d.icon} ${d.short} · G${grades[i]}</span>`).join('')}</div>`;
    }
    _heatmap() {
        const weeks = 12;
        const days = new Set(this.state.practiceDays || []);
        const logByDay = {}; (this.state.log || []).forEach(e => { logByDay[e.date] = (logByDay[e.date] || 0) + 1; });
        const today = new Date(); const todayDow = (today.getDay() + 6) % 7;
        const start = new Date(today.getTime() - (todayDow + (weeks - 1) * 7) * 86400000);
        const cols = [];
        for (let w = 0; w < weeks; w++) {
            const cells = [];
            for (let dow = 0; dow < 7; dow++) {
                const dt = new Date(start.getTime() + (w * 7 + dow) * 86400000);
                const key = dt.toISOString().slice(0, 10);
                const future = dt > today;
                const cnt = logByDay[key] || 0;
                const lvl = future ? 'future' : days.has(key) || cnt > 0 ? (cnt >= 3 ? 'l3' : cnt === 2 ? 'l2' : 'l1') : 'l0';
                cells.push(`<span class="ks-hm-cell ${lvl}" title="${key}${cnt ? ' · ' + cnt + ' Einheit(en)' : ''}"></span>`);
            }
            cols.push(`<div class="ks-hm-col">${cells.join('')}</div>`);
        }
        return `<div class="ks-heatmap">${cols.join('')}</div>
        <div class="ks-hm-legend"><span>weniger</span><span class="ks-hm-cell l0"></span><span class="ks-hm-cell l1"></span><span class="ks-hm-cell l2"></span><span class="ks-hm-cell l3"></span><span>mehr</span></div>`;
    }

    /* ===================== SESSION-RUNNER ===================== */
    _startTrainer(trainerId) {
        const t = KS_TRAINERS[trainerId];
        if (!t) return;
        this._stopTimer();
        this.currentTrainer = trainerId;
        this.activeDisc = t.disc;
        if (t.type === 'habit') return this._runHabits(t);
        if (t.type === 'breath') return this._runBreath(t);
        return this._runGuided(t);
    }

    _playerShell(t, innerHtml) {
        const d = KS_DISC_MAP[t.disc];
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel ss-player" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <h2>${t.icon} ${t.title}</h2>
            ${t.blurb ? `<p class="sub">${this._esc(t.blurb)}</p>` : ''}
            ${innerHtml}
            <div class="ss-player-controls" style="margin-top:14px">
                <button class="ss-btn ss-btn-ghost" id="ks-stop"><i class="fas fa-xmark"></i> Beenden</button>
            </div>
        </div>`;
        document.getElementById('ks-stop').addEventListener('click', () => { this._stopTimer(); this.go('practice'); });
    }

    _runGuided(t) {
        const R = 110, C = 2 * Math.PI * R;
        const factor = this._intensity(this.currentTrainer);
        const steps = t.steps.map(s => ({ text: s.text, sec: Math.max(5, Math.round(s.sec * factor)) }));
        const total = steps.reduce((a, s) => a + s.sec, 0);
        this._playerShell(t, `
            <div class="ss-ring-wrap">
                <svg width="240" height="240" role="img" aria-label="Timer">
                    <circle class="ss-ring-bg" cx="120" cy="120" r="${R}"></circle>
                    <circle class="ss-ring-fg" id="ks-ring" cx="120" cy="120" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="0"></circle>
                </svg>
                <div class="ss-ring-time" id="ks-time" aria-live="off">${this._mmss(total)}</div>
            </div>
            <div class="ss-instruction" id="ks-instr" aria-live="polite">${this._esc(steps[0].text)}</div>
            <div class="ks-step-count" id="ks-stepc">Schritt 1 / ${steps.length}</div>`);
        let elapsed = 0, stepIdx = 0, stepEnd = steps[0].sec;
        const ring = document.getElementById('ks-ring');
        const timeEl = document.getElementById('ks-time');
        const instr = document.getElementById('ks-instr');
        const stepc = document.getElementById('ks-stepc');
        this._speak(steps[0].text);
        this.timer = setInterval(() => {
            elapsed++;
            if (timeEl) timeEl.textContent = this._mmss(Math.max(0, total - elapsed));
            if (ring) ring.style.strokeDashoffset = C * (elapsed / total);
            if (elapsed >= stepEnd && stepIdx < steps.length - 1) {
                stepIdx++;
                stepEnd += steps[stepIdx].sec;
                this._haptic('light');
                this._beep();
                this._speak(steps[stepIdx].text);
                if (instr) { instr.style.opacity = 0; setTimeout(() => { instr.textContent = steps[stepIdx].text; instr.style.opacity = 1; }, 320); }
                if (stepc) stepc.textContent = `Schritt ${stepIdx + 1} / ${steps.length}`;
            }
            if (elapsed >= total) { this._stopTimer(); this._finishSession(t, 100, `${this._fmtDur(total)} geführt`); }
        }, 1000);
    }

    async _runBreath(t) {
        this._playerShell(t, `
            <div class="ss-breath-orb" id="ks-orb">Bereit</div>
            <div class="ss-instruction" id="ks-instr">Folge dem Rhythmus des Kreises.</div>`);
        const orb = document.getElementById('ks-orb');
        const instr = document.getElementById('ks-instr');
        let stopped = false;
        this._breathStop = () => { stopped = true; };
        await this._wait(800, () => stopped);
        for (let r = 0; r < t.breath.repeats && !stopped; r++) {
            for (const ph of t.breath.phases) {
                if (stopped) break;
                if (orb) { orb.className = 'ss-breath-orb ' + ph.action; orb.textContent = `${ph.label} · ${ph.sec}s`; }
                if (instr) instr.textContent = `Runde ${r + 1} / ${t.breath.repeats}`;
                this._haptic('light');
                if (ph.action !== 'hold') this._speak(ph.label);
                await this._wait(ph.sec * 1000, () => stopped);
            }
        }
        if (!stopped) this._finishSession(t, 100, `${t.breath.repeats} Atemrunden`);
    }

    _runHabits(t) {
        const today = this._today();
        if (!this.state.habitsToday || this.state.habitsToday.date !== today) this.state.habitsToday = { date: today, checks: {} };
        const saved = this.state.habitsToday.checks[this.currentTrainer] || [];
        this._playerShell(t, `
            <div class="ks-habits" id="ks-habits">
                ${t.habits.map((h, i) => `
                    <label class="ks-habit ${saved[i] ? 'checked' : ''}">
                        <input type="checkbox" data-i="${i}" ${saved[i] ? 'checked' : ''}>
                        <span class="box"><i class="fas fa-check"></i></span>
                        <span class="txt">${this._esc(h)}</span>
                    </label>`).join('')}
            </div>
            <button class="ss-btn ss-btn-primary ss-btn-block" id="ks-habit-save" style="margin-top:16px"><i class="fas fa-check-circle"></i> Eintragen</button>`);
        const wrap = document.getElementById('ks-habits');
        wrap.querySelectorAll('input').forEach(inp => inp.addEventListener('change', () => inp.closest('.ks-habit').classList.toggle('checked', inp.checked)));
        document.getElementById('ks-habit-save').addEventListener('click', () => {
            const checks = [...wrap.querySelectorAll('input')].map(i => i.checked);
            const done = checks.filter(Boolean).length;
            const pct = Math.round(done / checks.length * 100);
            this.state.habitsToday.checks[this.currentTrainer] = checks;
            this._finishSession(t, pct, `${done}/${checks.length} Gewohnheiten`);
        });
    }

    /* ---------------- Abschluss ---------------- */
    _finishSession(t, pct, detail) {
        pct = Math.max(0, Math.min(100, Math.round(pct)));
        const id = t.disc;
        const base = t.xp || 20;
        const xp = Math.max(4, Math.round(base * (0.5 + pct / 200)));
        const before = this._grade(id);
        const minutes = Math.max(1, Math.round(this._sessionDur(t) / 60));
        this._registerPracticeDay(minutes);
        this.state.disc[id].xp += xp;
        this.state.disc[id].sessions++;
        if (!this.state.disc[id].best) this.state.disc[id].best = {};
        if (!this.state.disc[id].best[this.currentTrainer] || pct > this.state.disc[id].best[this.currentTrainer]) this.state.disc[id].best[this.currentTrainer] = pct;
        const after = this._grade(id);
        this.state.log.unshift({ id: Date.now(), date: this._today(), disc: id, trainer: t.title, score: pct, detail: detail || '', xp });
        this.state.log = this.state.log.slice(0, 120);
        this._save();
        this._chime(after > before);
        if (after > before) { this._haptic('level'); this._celebrate(); } else this._haptic('ok');
        this._showResult(t, pct, xp, detail, after > before, after);
    }

    _showResult(t, score, xp, detail, levelUp, grade) {
        const d = KS_DISC_MAP[t.disc];
        const deg = Math.round(score * 3.6);
        const main = document.getElementById('ss-main');
        const coachMode = !!this._coachActive;
        const remaining = coachMode && this._coachQueue ? this._coachQueue.length : 0;
        main.innerHTML = `
        <div class="ss-panel" style="text-align:center;--accent:${d.accent}">
            <h2>${d.icon} Geschafft</h2>
            <div class="ss-score-circle" style="--deg:${deg}deg"><span class="val">${score}</span></div>
            <p class="sub" style="text-align:center">+${xp} Vitalkraft${detail ? ' · ' + this._esc(detail) : ''}</p>
            ${levelUp ? `<p style="color:#e0b04a;font-weight:600">Aufstieg in Grad ${grade}: ${KS_titleFor(grade)}!</p>` : ''}
            ${coachMode && remaining > 0 ? `<p class="sub">Noch ${remaining} Übung${remaining > 1 ? 'en' : ''} in dieser Einheit.</p>` : ''}
            <div class="ss-player-controls">
                ${coachMode
                    ? `<button class="ss-btn ss-btn-primary" id="ks-coach-cont">${remaining > 0 ? 'Nächste Übung' : 'Einheit abschließen'} <i class="fas fa-arrow-right"></i></button>`
                    : `<button class="ss-btn ss-btn-ghost" id="ks-again">Nochmal</button>
                       <button class="ss-btn ss-btn-primary" id="ks-back">Weiter</button>`}
            </div>
        </div>`;
        if (coachMode) {
            main.querySelector('#ks-coach-cont').addEventListener('click', () => this._runCoachNext());
        } else {
            main.querySelector('#ks-again').addEventListener('click', () => this._startTrainer(this.currentTrainer));
            main.querySelector('#ks-back').addEventListener('click', () => this.go('practice'));
        }
        if (levelUp) this._toast(`Grad ${grade}: ${KS_titleFor(grade)}!`, 'gold');
    }

    /* ===================== HELPERS ===================== */
    _sessionDur(t) {
        if (t.type === 'guided') return t.steps.reduce((a, s) => a + s.sec, 0);
        if (t.type === 'breath') return t.breath.repeats * t.breath.phases.reduce((a, p) => a + p.sec, 0);
        return 60;
    }
    _fmtDur(sec) {
        const m = Math.round(sec / 60);
        return m >= 1 ? `${m} Min` : `${sec} Sek`;
    }
    _stopTimer() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        if (this._breathStop) { this._breathStop(); this._breathStop = null; }
        try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
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
    _norm(s) { return (s == null ? '' : String(s)).trim().toLowerCase().replace(/\s+/g, ' '); }
    _esc(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
    _mmss(sec) { const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${s.toString().padStart(2, '0')}`; }
    _fmtDate(d) { try { return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }); } catch (e) { return d; } }
    _toast(msg, type) {
        const t = document.getElementById('ss-toast');
        if (!t) return;
        t.textContent = msg;
        t.className = 'ss-toast show' + (type ? ' ' + type : '');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.className = 'ss-toast', 2200);
    }
    _haptic(type) {
        try {
            if (!navigator.vibrate) return;
            const p = { light: 12, ok: [0, 22], err: [0, 45, 35, 45], level: [0, 30, 40, 30, 40, 70] }[type] || 12;
            navigator.vibrate(p);
        } catch (e) { /* ignore */ }
    }
    _celebrate() {
        try {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            if (!document.getElementById('ks-celebrate-style')) {
                const st = document.createElement('style');
                st.id = 'ks-celebrate-style';
                st.textContent = '@keyframes ksConfFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(var(--rot));opacity:.15}}.ks-conf{position:fixed;top:-16px;width:10px;height:14px;border-radius:2px;z-index:99999;pointer-events:none;will-change:transform;animation:ksConfFall var(--dur) cubic-bezier(.25,.6,.45,1) forwards}';
                document.head.appendChild(st);
            }
            const colors = ['#34d399', '#22d3ee', '#fb923c', '#a78bfa', '#f472b6', '#e0b04a'];
            for (let i = 0; i < 44; i++) {
                const c = document.createElement('div');
                c.className = 'ks-conf';
                c.style.left = (Math.random() * 100) + 'vw';
                c.style.top = (-16 - Math.random() * 60) + 'px';
                c.style.background = colors[i % colors.length];
                c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
                c.style.setProperty('--dur', (1.3 + Math.random() * 1.4) + 's');
                if (Math.random() < 0.4) c.style.borderRadius = '50%';
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 2900);
            }
        } catch (e) { /* ignore */ }
    }
    _speak(text) {
        try {
            if (!this.state.profile || !this.state.profile.voice) return;
            if (!('speechSynthesis' in window)) return;
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]*>/g, ''));
            u.lang = 'de-DE'; u.rate = 1.0; u.pitch = 1.0; u.volume = 0.9;
            speechSynthesis.speak(u);
        } catch (e) { /* ignore */ }
    }
    _beep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'sine'; o.frequency.value = 880;
            const t0 = ctx.currentTime;
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
            o.start(t0); o.stop(t0 + 0.2);
        } catch (e) { /* ignore */ }
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
    window.koerperschule = new KoerperSchule();
    window.koerperschule.init();
});
