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
            else if (['plan', 'journal', 'practice'].includes(start)) { this.go(start); }
        } catch (e) { /* ignore */ }
    }

    async init() {
        await this._load();
        if (!this.state.alias) this.state.alias = this._generateAlias();
        if (!this.state.theme) this.state.theme = 'forest';
        if (!this.state.habitsToday) this.state.habitsToday = { date: null, checks: {} };
        this._applyTheme();
        this._bindNav();
        this.render();
        this._handleDeepLink();
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
        document.querySelectorAll('.ss-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
        this.render();
    }
    render() {
        const main = document.getElementById('ss-main');
        if (!main) return;
        switch (this.view) {
            case 'dashboard': main.innerHTML = this._renderDashboard(); this._afterDashboard(); break;
            case 'practice':  main.innerHTML = this._renderPractice(); this._afterPractice(); break;
            case 'plan':      main.innerHTML = this._renderPlan(); this._afterPlan(); break;
            case 'journal':   main.innerHTML = this._renderJournal(); break;
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
        const todayId = this._todaysTrainer();
        const tt = KS_TRAINERS[todayId];
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
                    <div class="ss-kicker">${trainedToday ? 'Heute schon trainiert ✓ · noch eine Runde?' : 'Deine kleine Einheit für heute'}</div>
                    <h3 style="margin:4px 0 2px">${tt.icon} ${tt.title}</h3>
                    <p class="sub" style="margin:0">${td.icon} ${td.name} · ${this._fmtDur(this._sessionDur(tt))}</p>
                </div>
                <button class="ss-btn ss-btn-primary" id="ks-start-today"><i class="fas fa-play"></i> Starten</button>
            </div>
        </div>

        <h2 style="margin:8px 0 14px;font-size:20px">Deine Disziplinen</h2>
        <div class="ss-grid">
            ${KS_DISCIPLINES.map(d => this._discCard(d)).join('')}
        </div>

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
        if (today) today.addEventListener('click', () => { const id = this._todaysTrainer(); this.activeDisc = KS_TRAINERS[id].disc; this.go('practice'); this._startTrainer(id); });
        const plan = document.getElementById('ks-goto-plan');
        if (plan) plan.addEventListener('click', () => this.go('plan'));
        document.querySelectorAll('.gm-theme-dot').forEach(dot => dot.addEventListener('click', () => {
            this.state.theme = dot.dataset.theme;
            this._save();
            this._applyTheme();
            this.render();
        }));
    }

    /* ===================== PRACTICE ===================== */
    _renderPractice() {
        const d = KS_DISC_MAP[this.activeDisc];
        const grade = this._grade(this.activeDisc);
        const trainers = Object.keys(KS_TRAINERS).filter(id => KS_TRAINERS[id].disc === this.activeDisc).map(id => ({ id, ...KS_TRAINERS[id] }));
        return `
        <div class="ss-sense-picker">
            ${KS_DISCIPLINES.map(x => `<button class="ss-chip ${x.id === this.activeDisc ? 'active' : ''}" data-disc="${x.id}">${x.icon} ${x.short}</button>`).join('')}
        </div>
        <div class="ss-panel" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <h2>${d.icon} ${d.name} — ${KS_titleFor(grade)} (Grad ${grade})</h2>
            <p class="sub">${d.blurb}</p>
            <div class="ss-exercise-list">
                ${trainers.map(t => `
                    <div class="ss-exercise-item" data-trainer="${t.id}">
                        <div class="ic">${t.icon}</div>
                        <div class="body">
                            <div class="title">${t.title}</div>
                            <div class="desc">${t.blurb}</div>
                        </div>
                        <div class="dur">${t.type === 'habit' ? '+' + t.xp : this._fmtDur(this._sessionDur(t))}</div>
                    </div>`).join('')}
            </div>
        </div>`;
    }
    _afterPractice() {
        document.querySelectorAll('.ss-chip').forEach(c => c.addEventListener('click', () => { this.activeDisc = c.dataset.disc; this.render(); }));
        document.querySelectorAll('.ss-exercise-item').forEach(item => item.addEventListener('click', () => this._startTrainer(item.dataset.trainer)));
    }

    /* ===================== PLAN / VERBINDUNGEN ===================== */
    _renderPlan() {
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Pläne &amp; Programme</div>
            <h1>Vom kleinen Schritt zum großen Plan</h1>
            <p>Die täglichen Einheiten halten dich in Bewegung. Wenn du tiefer einsteigen willst, erstelle dir hier einen vollständigen Trainings- oder Ernährungsplan – oder verbinde dein Ritual mit den Schwester-Schulen.</p>
        </div>
        <div class="ss-grid">
            ${KS_LINKS.map(l => { const d = KS_DISC_MAP[l.disc]; return `
            <a class="ss-sense-card ks-link-card" href="${l.href}" style="--accent:${d.accent};--accent-soft:${d.soft};--accent-glow:${d.glow}">
                <div class="ss-sense-head">
                    <div class="ss-sense-icon">${l.icon}</div>
                    <div><div class="ss-sense-name">${l.title}</div></div>
                    <i class="fas fa-arrow-up-right-from-square ss-sense-rank" style="font-size:15px"></i>
                </div>
                <p class="ss-sense-meta" style="margin:8px 0 0">${l.desc}</p>
            </a>`; }).join('')}
        </div>`;
    }
    _afterPlan() { /* Links sind native Anker */ }

    /* ===================== JOURNAL ===================== */
    _renderJournal() {
        const log = this.state.log || [];
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Logbuch</div>
            <h1>Dein Körper-Tagebuch</h1>
            <p>${log.length} Einträge. Jede kleine Einheit ist ein Schritt zu mehr Vitalität.</p>
        </div>
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
        const total = this._sessionDur(t);
        this._playerShell(t, `
            <div class="ss-ring-wrap">
                <svg width="240" height="240">
                    <circle class="ss-ring-bg" cx="120" cy="120" r="${R}"></circle>
                    <circle class="ss-ring-fg" id="ks-ring" cx="120" cy="120" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="0"></circle>
                </svg>
                <div class="ss-ring-time" id="ks-time">${this._mmss(total)}</div>
            </div>
            <div class="ss-instruction" id="ks-instr">${this._esc(t.steps[0].text)}</div>
            <div class="ks-step-count" id="ks-stepc">Schritt 1 / ${t.steps.length}</div>`);
        let elapsed = 0, stepIdx = 0, stepEnd = t.steps[0].sec;
        const ring = document.getElementById('ks-ring');
        const timeEl = document.getElementById('ks-time');
        const instr = document.getElementById('ks-instr');
        const stepc = document.getElementById('ks-stepc');
        this.timer = setInterval(() => {
            elapsed++;
            if (timeEl) timeEl.textContent = this._mmss(Math.max(0, total - elapsed));
            if (ring) ring.style.strokeDashoffset = C * (elapsed / total);
            if (elapsed >= stepEnd && stepIdx < t.steps.length - 1) {
                stepIdx++;
                stepEnd += t.steps[stepIdx].sec;
                this._haptic('light');
                if (instr) { instr.style.opacity = 0; setTimeout(() => { instr.textContent = t.steps[stepIdx].text; instr.style.opacity = 1; }, 320); }
                if (stepc) stepc.textContent = `Schritt ${stepIdx + 1} / ${t.steps.length}`;
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
        main.innerHTML = `
        <div class="ss-panel" style="text-align:center;--accent:${d.accent}">
            <h2>${d.icon} Geschafft</h2>
            <div class="ss-score-circle" style="--deg:${deg}deg"><span class="val">${score}</span></div>
            <p class="sub" style="text-align:center">+${xp} Vitalkraft${detail ? ' · ' + this._esc(detail) : ''}</p>
            ${levelUp ? `<p style="color:#e0b04a;font-weight:600">Aufstieg in Grad ${grade}: ${KS_titleFor(grade)}!</p>` : ''}
            <div class="ss-player-controls">
                <button class="ss-btn ss-btn-ghost" id="ks-again">Nochmal</button>
                <button class="ss-btn ss-btn-primary" id="ks-back">Weiter</button>
            </div>
        </div>`;
        main.querySelector('#ks-again').addEventListener('click', () => this._startTrainer(this.currentTrainer));
        main.querySelector('#ks-back').addEventListener('click', () => this.go('practice'));
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
