/* =========================================================
   Die Schule des Gedächtnisses
   Ein lebenslanger Meisterschaftsweg für das Gedächtnis.

   Vereint die evidenzbasierten Säulen der Gedächtnisforschung in
   EINER adaptiven Engine:
   - Arbeitsgedächtnis (Dual-N-Back, Zahlenspanne)
   - Mnemotechnik der Gedächtnissportler (Loci/Palast, Major-System)
   - Gedächtnissport (Speed Numbers, Wörter, Namen & Gesichter, Karten)
   - Spaced Repetition (FSRS-artiger Scheduler + Vergessenskurve)

   Architektur identisch zur "Schule der Sinne":
   Persistenz: window.workflowAPI (DynamoDB) + localStorage-Fallback.
   Rangliste: /snowflake-highscores?game=gedaechtnisschule (anonym).
   ========================================================= */

const GS_METHOD = 'gedaechtnisschule';

/* ---------------- Graduierungs-System (→ ∞) ---------------- */
const GS_TITLES = [
    'Erwachen', 'Aufmerksamkeit', 'Verankerung', 'Merkfähigkeit', 'Struktur',
    'Architektur', 'Schnelligkeit', 'Klarheit', 'Meisterschaft', 'Vollendung',
    'Großmeister', 'Hüter der Bilder', 'Palastbauer', 'Gedankenleser', 'Chronist',
    'Wahrer Mnemonist', 'Erleuchteter Geist', 'Wandler der Zeit', 'Zeitloser', 'Vollkommener'
];
function GS_gap(g) { return Math.round(120 * Math.pow(g, 1.45)); }
const _gsTcache = [0, 0];
function GS_T(g) {
    if (g < 1) return 0;
    for (let k = _gsTcache.length; k <= g; k++) _gsTcache[k] = _gsTcache[k - 1] + GS_gap(k - 1);
    return _gsTcache[g];
}
function GS_gradeFromXP(xp) {
    let g = 1;
    while (g < 2000 && xp >= GS_T(g + 1)) g++;
    return g;
}
function GS_roman(n) {
    if (n <= 0) return '';
    const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let r = ''; for (const [v, s] of map) while (n >= v) { r += s; n -= v; } return r;
}
function GS_titleFor(g) {
    if (g <= GS_TITLES.length) return GS_TITLES[g - 1];
    const tier = g - GS_TITLES.length;
    return `${GS_TITLES[GS_TITLES.length - 1]} ${GS_roman(tier + 1)}`;
}
function GS_reqExam(g) { return Math.min(96, 64 + g * 2); }

/* ---------------- Die sieben Disziplinen ---------------- */
const GS_DISCIPLINES = [
    { id: 'arbeitsgedaechtnis', name: 'Arbeitsgedächtnis', short: 'Arbeitsged.', icon: '🧠', accent: '#818cf8', soft: 'rgba(129,140,248,.16)', glow: 'rgba(129,140,248,.18)',
      tags: ['Dual-N-Back', 'Zahlenspanne'], blurb: 'Die Kapazität, Information aktiv im Kopf zu halten und zu verarbeiten – das Fundament jeder Denkleistung.',
      trainers: ['nback', 'span'], exam: 'nback' },
    { id: 'zahlen', name: 'Zahlen-Gedächtnis', short: 'Zahlen', icon: '🔢', accent: '#22d3ee', soft: 'rgba(34,211,238,.16)', glow: 'rgba(34,211,238,.18)',
      tags: ['Speed Numbers', 'Zahl-Form-System', 'Major-System'], blurb: 'Lange Ziffernfolgen in Sekunden einprägen – verwandle Ziffern in Bilder (Zahl-Form- und Major-System).',
      trainers: ['speednum', 'shapes', 'major'], exam: 'speednum' },
    { id: 'woerter', name: 'Wörter', short: 'Wörter', icon: '📝', accent: '#34d399', soft: 'rgba(52,211,153,.16)', glow: 'rgba(52,211,153,.18)',
      tags: ['Wortlisten', 'Geschichten-Kette'], blurb: 'Wortlisten in exakter Reihenfolge behalten – die Urübung aller Mnemotechnik.',
      trainers: ['words'], exam: 'words' },
    { id: 'namen', name: 'Namen & Gesichter', short: 'Namen', icon: '🧑‍🤝‍🧑', accent: '#fb923c', soft: 'rgba(251,146,60,.16)', glow: 'rgba(251,146,60,.18)',
      tags: ['Gesichter', 'Alltagsnah'], blurb: 'Die alltäglichste – und meistgefürchtete – Gedächtnisleistung: Namen zu Gesichtern behalten.',
      trainers: ['names'], exam: 'names' },
    { id: 'palast', name: 'Gedächtnispalast', short: 'Palast', icon: '🏛️', accent: '#e0b04a', soft: 'rgba(224,176,74,.16)', glow: 'rgba(224,176,74,.18)',
      tags: ['Loci-Methode', 'Zahlen-Reise', 'Eigene Routen'], blurb: 'Die Königsdisziplin: lege Inhalte – auch Zahlen als Bilder – an Orten einer vertrauten Route ab. Baue eigene Routen.',
      trainers: ['loci', 'zahlenreise'], exam: 'loci' },
    { id: 'karten', name: 'Spielkarten', short: 'Karten', icon: '🃏', accent: '#f472b6', soft: 'rgba(244,114,182,.16)', glow: 'rgba(244,114,182,.18)',
      tags: ['Kartenfolge', 'Speed Cards'], blurb: 'Die Reihenfolge gemischter Karten merken – Paradedisziplin der Gedächtnis-Weltmeister.',
      trainers: ['cards'], exam: 'cards' },
    { id: 'langzeit', name: 'Langzeit · Spaced Repetition', short: 'Langzeit', icon: '♾️', accent: '#a78bfa', soft: 'rgba(167,139,250,.16)', glow: 'rgba(167,139,250,.18)',
      tags: ['FSRS-Scheduler', 'Vergessenskurve'], blurb: 'Eigenes Wissen lebenslang verankern – wissenschaftlich exakt getaktete Wiederholung statt sturem Pauken.',
      trainers: [], exam: null, isSrs: true }
];
const GS_DISC_MAP = Object.fromEntries(GS_DISCIPLINES.map(d => [d.id, d]));

const GS_TRAINERS = {
    nback:    { disc: 'arbeitsgedaechtnis', icon: '🔁', title: 'Dual-N-Back', xp: 30, blurb: 'Erkenne, wenn Position und Buchstabe mit dem Reiz N Schritte zuvor übereinstimmen.' },
    span:     { disc: 'arbeitsgedaechtnis', icon: '↔️', title: 'Zahlenspanne', xp: 20, blurb: 'Gib Ziffernfolgen vorwärts und rückwärts wieder – die klassische Spanne.' },
    speednum: { disc: 'zahlen', icon: '⚡', title: 'Speed Numbers', xp: 26, blurb: 'Präge dir eine Ziffernfolge in begrenzter Zeit ein und gib sie wieder.' },
    shapes:   { disc: 'zahlen', icon: '🖼️', title: 'Zahl-Form-System', xp: 16, blurb: 'Gib jeder Ziffer ein festes Bild (1 = Kerze, 3 = Dreizack …) – erfinde deine eigenen und drille sie.' },
    major:    { disc: 'zahlen', icon: '🔤', title: 'Major-System-Trainer', xp: 16, blurb: 'Übersetze Ziffern blitzschnell in Konsonanten – das Tor zu unbegrenztem Zahlengedächtnis.' },
    words:    { disc: 'woerter', icon: '📚', title: 'Wortliste merken', xp: 24, blurb: 'Behalte eine Liste von Wörtern in exakter Reihenfolge.' },
    names:    { disc: 'namen', icon: '😊', title: 'Namen & Gesichter', xp: 24, blurb: 'Ordne Gesichtern die richtigen Namen zu.' },
    loci:     { disc: 'palast', icon: '🗺️', title: 'Palast-Route', xp: 28, blurb: 'Lege Begriffe an den Stationen einer Route ab und rufe sie geordnet ab.' },
    zahlenreise: { disc: 'palast', icon: '🧭', title: 'Zahlen-Reise', xp: 32, blurb: 'Deine „Eselswelt"-Technik: verwandle Ziffern in Bilder und lege sie auf deiner Route ab – so merkst du dir ganze Zahlen.' },
    cards:    { disc: 'karten', icon: '🃏', title: 'Kartenfolge', xp: 26, blurb: 'Merke dir die Reihenfolge gemischter Spielkarten.' }
};

/* ---------------- Inhalts-Pools ---------------- */
const GS_WORDS = ['Apfel', 'Anker', 'Berg', 'Brücke', 'Drache', 'Eule', 'Feder', 'Fluss', 'Gabel', 'Garten', 'Hammer', 'Hut', 'Insel', 'Käfer', 'Kerze', 'Krone', 'Lampe', 'Löwe', 'Mond', 'Nadel', 'Nebel', 'Ofen', 'Pfeil', 'Pilz', 'Quelle', 'Rabe', 'Rakete', 'Ring', 'Säge', 'Schiff', 'Schlüssel', 'Stern', 'Tiger', 'Trommel', 'Uhr', 'Vase', 'Vogel', 'Wal', 'Wolke', 'Wurzel', 'Zange', 'Zelt', 'Zitrone', 'Zwerg', 'Brille', 'Kamel', 'Leiter', 'Muschel', 'Pinsel', 'Spiegel'];
const GS_NAMES = ['Anna', 'Ben', 'Clara', 'David', 'Emma', 'Felix', 'Greta', 'Hannah', 'Igor', 'Jana', 'Klaus', 'Lena', 'Mara', 'Noah', 'Olga', 'Paul', 'Quirin', 'Rosa', 'Sven', 'Tina', 'Uwe', 'Vera', 'Walter', 'Xenia', 'Yara', 'Zoe', 'Lukas', 'Mia', 'Jonas', 'Sophie'];
const GS_FACE_EMOJI = ['👩', '👨', '👵', '👴', '👱‍♀️', '👱', '🧔', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱', '👩‍🦳', '👨‍🦳', '🧑', '👲', '🧕'];
const GS_FACE_BG = ['#fca5a5', '#fdba74', '#fcd34d', '#86efac', '#67e8f9', '#93c5fd', '#c4b5fd', '#f9a8d4'];

// Vertraute Routen für den Gedächtnispalast (Loci)
const GS_PALACES = [
    { name: 'Deine Wohnung', stations: ['Wohnungstür', 'Garderobe', 'Küche', 'Kühlschrank', 'Esstisch', 'Sofa', 'Fernseher', 'Fenster', 'Bett', 'Bad'] },
    { name: 'Der Arbeitsweg', stations: ['Haustür', 'Briefkasten', 'Bushaltestelle', 'Bäckerei', 'Ampel', 'Park', 'Brücke', 'Eingang', 'Aufzug', 'Schreibtisch'] },
    { name: 'Der Körper', stations: ['Kopf', 'Nase', 'Schultern', 'Brust', 'Bauch', 'Hände', 'Hüfte', 'Knie', 'Füße', 'Zehen'] }
];

// Major-System: Ziffer → Konsonantenlaut + Merkhilfe
const GS_MAJOR = [
    { d: 0, c: 's, z', ex: '„z" wie Zero (0)' },
    { d: 1, c: 't, d', ex: '„t" hat 1 Abstrich' },
    { d: 2, c: 'n', ex: '„n" hat 2 Beine' },
    { d: 3, c: 'm', ex: '„m" hat 3 Beine' },
    { d: 4, c: 'r', ex: '„r" – vieR endet auf r' },
    { d: 5, c: 'l', ex: 'L = römisch 50' },
    { d: 6, c: 'sch, j, g', ex: 'gespiegeltes „J" ~ 6' },
    { d: 7, c: 'k, g', ex: 'zwei 7er bilden ein „K"' },
    { d: 8, c: 'f, w', ex: 'kursives „f" ~ 8' },
    { d: 9, c: 'p, b', ex: 'gespiegeltes „p" ~ 9' }
];
const GS_MAJOR_WORDS = { '0': 'Tasse', '1': 'Tee', '2': 'Noah', '3': 'Oma', '4': 'Ohr', '5': 'Aal', '6': 'Schuh', '7': 'Kuh', '8': 'Efeu', '9': 'Bauer' };

/* ---------------- Zahl-Form-System (Methode aus „Eselswelt") ----------------
   Jede Ziffer bekommt ein festes Bild, das ihrer Form ähnelt. Der Nutzer kann
   jedes Bild durch ein eigenes ersetzen – selbst erfundene Bilder wirken am
   stärksten (Generationseffekt). Die Bilder werden später auf einer vertrauten
   Route abgelegt (Loci-/Wegmethode) → so merkt man sich beliebig lange Zahlen. */
const GS_NUMSHAPES = [
    { d: 0, emoji: '🥚', word: 'Ei' },
    { d: 1, emoji: '🕯️', word: 'Kerze' },
    { d: 2, emoji: '🦢', word: 'Schwan' },
    { d: 3, emoji: '🔱', word: 'Dreizack' },
    { d: 4, emoji: '⛵', word: 'Segel' },
    { d: 5, emoji: '✋', word: 'Hand' },
    { d: 6, emoji: '🍒', word: 'Kirsche' },
    { d: 7, emoji: '🚩', word: 'Fahne' },
    { d: 8, emoji: '⛄', word: 'Schneemann' },
    { d: 9, emoji: '🎈', word: 'Ballon' }
];

/* ---------------- Starter-Decks (Spaced Repetition) ---------------- */
const GS_STARTER_DECKS = [
    { id: 'cap', name: 'Welt-Hauptstädte', cards: [
        ['Frankreich', 'Paris'], ['Japan', 'Tokio'], ['Australien', 'Canberra'], ['Kanada', 'Ottawa'],
        ['Brasilien', 'Brasília'], ['Ägypten', 'Kairo'], ['Norwegen', 'Oslo'], ['Türkei', 'Ankara'],
        ['Südkorea', 'Seoul'], ['Schweiz', 'Bern']
    ]},
    { id: 'en', name: 'Englisch-Vokabeln', cards: [
        ['to remember', 'sich erinnern'], ['memory', 'Gedächtnis'], ['to forget', 'vergessen'],
        ['knowledge', 'Wissen'], ['to learn', 'lernen'], ['skill', 'Fähigkeit'],
        ['mind', 'Geist'], ['brain', 'Gehirn'], ['to practice', 'üben'], ['challenge', 'Herausforderung']
    ]}
];

/* ---------------- Pseudonym-Generator (anonym) ---------------- */
const GS_ALIAS_ADJ = ['Stiller', 'Wacher', 'Schneller', 'Klarer', 'Tiefer', 'Scharfer', 'Heller', 'Geduldiger', 'Wandernder', 'Zeitloser', 'Findiger', 'Kluger', 'Flinker', 'Weiser', 'Wahrer'];
const GS_ALIAS_NOUN = ['Mnemonist', 'Architekt', 'Chronist', 'Denker', 'Seher', 'Baumeister', 'Wanderer', 'Geist', 'Kartograf', 'Hüter', 'Meister', 'Gelehrter', 'Stratege', 'Pilger', 'Magier'];

/* =========================================================
   App
   ========================================================= */
class GedaechtnisSchule {
    constructor() {
        this.view = 'dashboard';
        this.activeDisc = 'arbeitsgedaechtnis';
        this.timer = null;
        this.mode = 'practice';
        this.exam = null;
        this.leaderboard = null;
        this.state = this._defaultState();
    }

    _defaultState() {
        const disc = {};
        GS_DISCIPLINES.forEach(d => { disc[d.id] = { xp: 0, sessions: 0, doorGrade: 0, bestExam: 0, examScores: [], best: {} }; });
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
            srs: { decks: null, reviewsToday: 0, reviewsDate: null, totalReviews: 0 },
            numShapes: null,
            palaces: []
        };
    }

    _handleDeepLink() {
        try {
            const sp = new URLSearchParams(window.location.search);
            const start = sp.get('start');
            if (!start) return;
            if (GS_TRAINERS[start]) { this.go('practice'); this._startTrainer(start, 'practice'); }
            else if (start === 'srs') { this.go('srs'); }
            else if (['arena', 'exams', 'journal', 'practice'].includes(start)) { this.go(start); }
        } catch (e) { /* ignore */ }
    }

    _seedShapes() {
        const o = {};
        GS_NUMSHAPES.forEach(s => { o[s.d] = { emoji: s.emoji, word: s.word }; });
        return o;
    }
    _numShape(d) {
        const s = (this.state.numShapes && this.state.numShapes[d]) || GS_NUMSHAPES[d];
        return { emoji: (s && s.emoji) || '•', word: (s && s.word) || String(d) };
    }
    _setNumShape(d, patch) {
        if (!this.state.numShapes) this.state.numShapes = this._seedShapes();
        this.state.numShapes[d] = Object.assign({}, this._numShape(d), patch);
        this._save();
    }
    _allPalaces() {
        return [...(this.state.palaces || []), ...GS_PALACES];
    }
    _pickPalace() {
        const custom = (this.state.palaces || []).filter(p => p.stations && p.stations.length >= 4);
        if (custom.length && Math.random() < 0.7) return custom[Math.floor(Math.random() * custom.length)];
        const all = [...custom, ...GS_PALACES.filter(p => p.stations.length >= 4)];
        return all[Math.floor(Math.random() * all.length)];
    }

    async init() {
        await this._load();
        if (!this.state.alias) this.state.alias = this._generateAlias();
        if (!this.state.srs.decks) this.state.srs.decks = this._seedDecks();
        if (!this.state.numShapes) this.state.numShapes = this._seedShapes();
        if (!Array.isArray(this.state.palaces)) this.state.palaces = [];
        this._bindNav();
        this.render();
        this._handleDeepLink();
    }

    _seedDecks() {
        const now = new Date().toISOString();
        return GS_STARTER_DECKS.map(d => ({
            id: d.id, name: d.name, createdAt: now,
            cards: d.cards.map((c, i) => ({
                id: d.id + '_' + i, front: c[0], back: c[1],
                due: now, stability: 0, difficulty: 5, reps: 0, lapses: 0, last: null, state: 'new'
            }))
        }));
    }

    /* ---------------- Persistenz ---------------- */
    _merge(base, incoming) {
        const out = JSON.parse(JSON.stringify(base));
        if (!incoming) return out;
        Object.keys(incoming).forEach(k => {
            if (k === 'disc' && incoming.disc) {
                GS_DISCIPLINES.forEach(d => { out.disc[d.id] = Object.assign({}, out.disc[d.id], incoming.disc[d.id] || {}); });
            } else {
                out[k] = incoming[k];
            }
        });
        return out;
    }

    async _load() {
        try {
            const local = JSON.parse(localStorage.getItem('gs_state'));
            if (local && local.startedAt) this.state = this._merge(this._defaultState(), local);
        } catch (e) { /* ignore */ }
        try {
            if (window.workflowAPI) {
                const res = await window.workflowAPI.getWorkflowResults(GS_METHOD);
                const remote = res && (res.results || res.state || (res.startedAt ? res : null));
                if (remote && remote.startedAt) {
                    this.state = this._merge(this._defaultState(), remote);
                    localStorage.setItem('gs_state', JSON.stringify(this.state));
                }
            }
        } catch (e) { console.warn('Cloud-Load fehlgeschlagen:', e); }
    }

    async _save() {
        localStorage.setItem('gs_state', JSON.stringify(this.state));
        let synced = false;
        try {
            if (window.workflowAPI) {
                const loggedIn = this._isLoggedIn();
                await window.workflowAPI.saveWorkflowResults(GS_METHOD, this.state);
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
        const a = GS_ALIAS_ADJ[Math.floor(Math.random() * GS_ALIAS_ADJ.length)];
        const n = GS_ALIAS_NOUN[Math.floor(Math.random() * GS_ALIAS_NOUN.length)];
        const num = Math.floor(1000 + Math.random() * 9000);
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
    _rawGrade(id) { return GS_gradeFromXP(this.state.disc[id].xp); }
    _grade(id) {
        const d = GS_DISC_MAP[id];
        if (d && !d.exam) return this._rawGrade(id); // Disziplinen ohne Prüfung steigen frei
        return Math.min(this._rawGrade(id), (this.state.disc[id].doorGrade || 0) + 1);
    }
    _needsExam(id) { return this._rawGrade(id) > this._grade(id); }
    _gradeProgress(id) {
        if (this._needsExam(id)) return 100;
        const g = this._grade(id);
        const base = GS_T(g), next = GS_T(g + 1);
        const xp = this.state.disc[id].xp;
        return Math.max(0, Math.min(100, Math.round(((xp - base) / (next - base)) * 100)));
    }
    _totalXP() { return GS_DISCIPLINES.reduce((a, d) => a + (this.state.disc[d.id].xp || 0), 0); }
    _overallGrade() { return GS_gradeFromXP(Math.round(this._totalXP() / GS_DISCIPLINES.length)); }
    _overallTitle() { return GS_titleFor(this._overallGrade()); }

    /* ---------------- Navigation / Router ---------------- */
    _bindNav() {
        document.querySelectorAll('.ss-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.go(btn.dataset.view));
        });
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
            case 'srs':       main.innerHTML = this._renderSrs(); this._afterSrs(); break;
            case 'exams':     main.innerHTML = this._renderExams(); this._afterExams(); break;
            case 'journal':   main.innerHTML = this._renderJournal(); this._afterJournal(); break;
            case 'arena':     main.innerHTML = this._renderArena(); this._afterArena(); break;
            default:          main.innerHTML = this._renderDashboard(); this._afterDashboard();
        }
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ===================== DASHBOARD ===================== */
    _renderDashboard() {
        const total = this._totalXP();
        const due = this._dueCount();
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Dein Gedächtnis-Dojo</div>
            <h1>Schule dein Gedächtnis – ein Leben lang</h1>
            <p>Sieben Disziplinen, von Arbeitsgedächtnis und Mnemotechnik über Gedächtnissport bis zur wissenschaftlichen Spaced Repetition. Trainiere täglich, lege Prüfungen ab und steige in einen Grad auf, der nie endet.</p>
        </div>

        <div class="ss-stats">
            <div class="ss-stat"><div class="ss-stat-num">${total.toLocaleString('de-DE')}</div><div class="ss-stat-label">Gedächtniskraft</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this._overallTitle()}</div><div class="ss-stat-label">Titel · Grad ${this._overallGrade()}</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this.state.streak || 0}🔥</div><div class="ss-stat-label">Tage in Folge</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${due}</div><div class="ss-stat-label">Karten fällig</div></div>
        </div>

        ${due > 0 ? `<div class="ss-panel" style="--accent:#a78bfa"><div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
            <div><h3 style="margin:0"><i class="fas fa-layer-group"></i> ${due} Karten warten auf Wiederholung</h3><p class="sub" style="margin:4px 0 0">Halte dein Wissen mit getakteter Wiederholung lebendig.</p></div>
            <button class="ss-btn ss-btn-primary" id="gs-goto-srs">Jetzt wiederholen</button>
        </div></div>` : ''}

        <h2 style="margin:8px 0 14px;font-size:20px">Deine Disziplinen</h2>
        <div class="ss-grid">
            ${GS_DISCIPLINES.map(d => this._discCard(d)).join('')}
        </div>`;
    }

    _discCard(d) {
        const st = this.state.disc[d.id];
        const grade = this._grade(d.id);
        const prog = d.isSrs ? null : this._gradeProgress(d.id);
        const needs = !d.isSrs && this._needsExam(d.id);
        const sub = d.isSrs
            ? `${this._totalCards()} Karten · ${this._dueCount()} fällig`
            : `Grad ${grade} · ${GS_titleFor(grade)}`;
        return `
        <div class="ss-sense-card" data-disc="${d.id}" style="--accent:${d.accent};--accent-soft:${d.soft};--accent-glow:${d.glow}">
            <div class="ss-sense-head">
                <div class="ss-sense-icon">${d.icon}</div>
                <div>
                    <div class="ss-sense-name">${d.name}</div>
                    <div class="ss-sense-grade-name">${sub}</div>
                </div>
                ${needs ? `<div class="ss-sense-rank">⚑</div>` : `<div class="ss-sense-rank">${st.xp.toLocaleString('de-DE')}</div>`}
            </div>
            <p class="ss-sense-meta" style="margin:8px 0 0">${d.blurb}</p>
            <div class="gm-disc-tags">${d.tags.map(t => `<span class="gm-tag">${t}</span>`).join('')}</div>
            ${prog !== null ? `<div class="ss-prog"><div class="ss-prog-bar"><div class="ss-prog-fill" style="width:${prog}%"></div></div></div>` : ''}
        </div>`;
    }

    _afterDashboard() {
        document.querySelectorAll('.ss-sense-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.disc;
                if (GS_DISC_MAP[id].isSrs) { this.go('srs'); return; }
                this.activeDisc = id;
                this.go('practice');
            });
        });
        const g = document.getElementById('gs-goto-srs');
        if (g) g.addEventListener('click', () => this.go('srs'));
    }

    /* ===================== PRACTICE ===================== */
    _renderPractice() {
        const d = GS_DISC_MAP[this.activeDisc];
        const grade = this._grade(this.activeDisc);
        const needsExam = this._needsExam(this.activeDisc);
        const trainers = (d.trainers || []).map(id => ({ id, ...GS_TRAINERS[id] }));
        return `
        <div class="ss-sense-picker">
            ${GS_DISCIPLINES.filter(x => !x.isSrs).map(x => `<button class="ss-chip ${x.id === this.activeDisc ? 'active' : ''}" data-disc="${x.id}">${x.icon} ${x.short}</button>`).join('')}
        </div>
        <div class="ss-panel" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <h2>${d.icon} ${d.name} — ${GS_titleFor(grade)} (Grad ${grade})</h2>
            <p class="sub">${d.blurb}</p>
            ${needsExam ? `<div style="background:rgba(224,176,74,.12);border:1px solid rgba(224,176,74,.35);color:#e0b04a;padding:12px 16px;border-radius:12px;margin-bottom:16px;font-size:14px"><i class="fas fa-medal"></i> Du hast genug trainiert – die <strong>Prüfung</strong> öffnet die Tür zum nächsten Grad. <button class="ss-btn ss-btn-gold" style="margin-left:10px;padding:6px 14px;font-size:13px" id="gs-goto-exam">Zur Prüfung</button></div>` : ''}
            <div class="ss-exercise-list">
                ${trainers.map(t => `
                    <div class="ss-exercise-item" data-trainer="${t.id}">
                        <div class="ic">${t.icon}</div>
                        <div class="body">
                            <div class="title">${t.title}</div>
                            <div class="desc">${t.blurb}</div>
                        </div>
                        <div class="dur">+${t.xp}</div>
                    </div>`).join('')}
            </div>
            ${this.activeDisc === 'palast' ? `<button class="ss-btn ss-btn-ghost ss-btn-block" id="gs-manage-routes" style="margin-top:14px"><i class="fas fa-map-signs"></i> Eigene Routen verwalten (${(this.state.palaces || []).length})</button>` : ''}
        </div>`;
    }

    _afterPractice() {
        document.querySelectorAll('.ss-chip').forEach(c => c.addEventListener('click', () => { this.activeDisc = c.dataset.disc; this.render(); }));
        document.querySelectorAll('.ss-exercise-item').forEach(item => item.addEventListener('click', () => this._startTrainer(item.dataset.trainer, 'practice')));
        const examBtn = document.getElementById('gs-goto-exam');
        if (examBtn) examBtn.addEventListener('click', () => this.go('exams'));
        const routesBtn = document.getElementById('gs-manage-routes');
        if (routesBtn) routesBtn.addEventListener('click', () => this._palaceManager());
    }

    /* ===================== TRAINER-DISPATCH ===================== */
    _startTrainer(trainerId, mode) {
        this._stopTimer();
        this.mode = mode || 'practice';
        this.currentTrainer = trainerId;
        const t = GS_TRAINERS[trainerId];
        if (t) this.activeDisc = t.disc;
        const g = this._grade(this.activeDisc);
        switch (trainerId) {
            case 'nback': return this._tNback(g);
            case 'span': return this._tSpan(g);
            case 'speednum': return this._tSpeedNum(g);
            case 'shapes': return this._tShapes(g);
            case 'major': return this._tMajor(g);
            case 'words': return this._tWords(g);
            case 'names': return this._tNames(g);
            case 'loci': return this._tLoci(g);
            case 'zahlenreise': return this._tZahlenreise(g);
            case 'cards': return this._tCards(g);
        }
    }

    _gameShell(title, icon, introHtml, bodyId) {
        const d = GS_DISC_MAP[this.activeDisc];
        const main = document.getElementById('ss-main');
        const examTag = this.mode === 'exam' ? '<span class="gm-tag" style="margin-left:8px">Prüfung</span>' : '';
        main.innerHTML = `
        <div class="ss-panel ss-player" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <h2>${icon} ${title}${examTag}</h2>
            ${introHtml ? `<p class="sub">${introHtml}</p>` : ''}
            <div id="${bodyId}" class="gm-stage"></div>
            <div class="ss-player-controls" style="margin-top:14px">
                <button class="ss-btn ss-btn-ghost" id="gs-stop"><i class="fas fa-xmark"></i> Beenden</button>
            </div>
        </div>`;
        document.getElementById('gs-stop').addEventListener('click', () => { this._stopTimer(); this.mode === 'exam' ? this.go('exams') : this.go('practice'); });
    }

    // Abschluss eines Trainers (Übung) bzw. Weiterleitung an die Prüfung
    _finishTrainer(score, detail) {
        score = Math.max(0, Math.min(100, Math.round(score)));
        if (this.mode === 'exam') { this._finishExam(score); return; }
        const id = this.activeDisc;
        const t = GS_TRAINERS[this.currentTrainer];
        const xp = Math.max(5, Math.round((t ? t.xp : 20) * (0.45 + score / 180)));
        const before = this._grade(id);
        this._registerPracticeDay(2);
        this.state.disc[id].xp += xp;
        this.state.disc[id].sessions++;
        if (!this.state.disc[id].best) this.state.disc[id].best = {};
        const bestKey = this.currentTrainer;
        if (!this.state.disc[id].best[bestKey] || score > this.state.disc[id].best[bestKey]) this.state.disc[id].best[bestKey] = score;
        const after = this._grade(id);
        this.state.log.unshift({ id: Date.now(), date: this._today(), disc: id, trainer: t ? t.title : '', score, detail: detail || '', xp });
        this.state.log = this.state.log.slice(0, 120);
        this._save();
        this._chime(after > before);
        this._showTrainerResult(score, xp, detail, after > before, after);
    }

    _showTrainerResult(score, xp, detail, levelUp, grade) {
        const d = GS_DISC_MAP[this.activeDisc];
        const deg = Math.round(score * 3.6);
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="text-align:center;--accent:${d.accent}">
            <h2>${d.icon} Ergebnis</h2>
            <div class="ss-score-circle" style="--deg:${deg}deg"><span class="val">${score}</span></div>
            <p class="sub" style="text-align:center">+${xp} Gedächtniskraft${detail ? ' · ' + this._esc(detail) : ''}</p>
            ${levelUp ? `<p style="color:#e0b04a;font-weight:600">Aufstieg in Grad ${grade}: ${GS_titleFor(grade)}!</p>` : ''}
            <div class="ss-player-controls">
                <button class="ss-btn ss-btn-ghost" id="gs-again">Nochmal</button>
                <button class="ss-btn ss-btn-primary" id="gs-back">Weiter</button>
            </div>
        </div>`;
        main.querySelector('#gs-again').addEventListener('click', () => this._startTrainer(this.currentTrainer, 'practice'));
        main.querySelector('#gs-back').addEventListener('click', () => this.go('practice'));
        if (levelUp) this._toast(`Grad ${grade}: ${GS_titleFor(grade)}!`, 'gold');
    }

    /* ===================== TRAINER: DUAL N-BACK ===================== */
    _tNback(grade) {
        const n = this.mode === 'exam' ? Math.min(2 + Math.floor(grade / 3), 6) : Math.min(1 + Math.floor(grade / 4), 5);
        const trials = (this.mode === 'exam' ? 24 : 18) + n;
        const isi = 2700;
        this._gameShell('Dual-N-Back', '🔁',
            `Merke dir Position <em>und</em> Buchstabe. Stimmt der aktuelle Reiz mit dem von <strong>${n}</strong> Schritt(en) zuvor überein, drücke die passende Taste. <span style="color:var(--ss-text-dim)">(A = Position, L = Buchstabe)</span>`,
            'gs-game');
        const letters = ['K', 'T', 'L', 'R', 'S', 'P', 'H', 'Q'];

        // Sequenz vorab erzeugen, mit gezielt eingestreuten Treffern (~28%)
        const seq = [];
        for (let i = 0; i < trials; i++) {
            let pos = Math.floor(Math.random() * 9);
            let lt = letters[Math.floor(Math.random() * letters.length)];
            if (i >= n) {
                if (Math.random() < 0.28) pos = seq[i - n].pos;
                if (Math.random() < 0.28) lt = seq[i - n].let;
            }
            seq.push({ pos, let: lt });
        }
        const posTargets = seq.filter((s, i) => i >= n && s.pos === seq[i - n].pos).length;
        const letTargets = seq.filter((s, i) => i >= n && s.let === seq[i - n].let).length;

        const body = document.getElementById('gs-game');
        body.innerHTML = `
            <div class="gm-head"><strong>N = ${n}</strong><span class="meta" id="gs-nb-prog">0 / ${trials}</span></div>
            <div class="gm-nback-letter" id="gs-nb-letter">Bereit …</div>
            <div class="gm-nback-grid">${Array.from({ length: 9 }, (_, i) => `<div class="gm-nback-cell" data-c="${i}"></div>`).join('')}</div>
            <div class="gm-nback-controls">
                <button class="ss-btn ss-btn-ghost gm-match-btn" id="gs-nb-pos">Position (A)</button>
                <button class="ss-btn ss-btn-ghost gm-match-btn" id="gs-nb-let">Buchstabe (L)</button>
            </div>`;
        const cells = body.querySelectorAll('.gm-nback-cell');
        const letterEl = body.querySelector('#gs-nb-letter');
        const progEl = body.querySelector('#gs-nb-prog');
        const posBtn = body.querySelector('#gs-nb-pos');
        const letBtn = body.querySelector('#gs-nb-let');

        const stats = { posHit: 0, posFA: 0, letHit: 0, letFA: 0, posTargets, letTargets };
        let i = -1; let answeredPos = false, answeredLet = false;
        const speak = (ltr) => { try { if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(ltr); u.lang = 'de-DE'; u.rate = 1.05; speechSynthesis.cancel(); speechSynthesis.speak(u); } } catch (e) { /* ignore */ } };

        const markPos = () => {
            if (answeredPos || i < n || i >= trials) return; answeredPos = true;
            if (seq[i].pos === seq[i - n].pos) { stats.posHit++; posBtn.classList.add('hit'); }
            else { stats.posFA++; posBtn.classList.add('miss'); }
        };
        const markLet = () => {
            if (answeredLet || i < n || i >= trials) return; answeredLet = true;
            if (seq[i].let === seq[i - n].let) { stats.letHit++; letBtn.classList.add('hit'); }
            else { stats.letFA++; letBtn.classList.add('miss'); }
        };
        posBtn.addEventListener('click', markPos);
        letBtn.addEventListener('click', markLet);
        this._keyHandler = (e) => {
            if (e.key === 'a' || e.key === 'A') markPos();
            if (e.key === 'l' || e.key === 'L') markLet();
        };
        document.addEventListener('keydown', this._keyHandler);

        const step = () => {
            i++;
            progEl.textContent = `${Math.min(i + 1, trials)} / ${trials}`;
            if (i >= trials) { this._endNback(stats); return; }
            answeredPos = false; answeredLet = false;
            posBtn.classList.remove('hit', 'miss'); letBtn.classList.remove('hit', 'miss');
            cells.forEach(c => c.classList.remove('active'));
            const cell = cells[seq[i].pos];
            cell.classList.add('active');
            letterEl.textContent = seq[i].let;
            speak(seq[i].let);
            setTimeout(() => { cell.classList.remove('active'); }, isi * 0.6);
        };
        this.timer = setInterval(step, isi);
        setTimeout(step, 600);
    }

    _endNback(stats) {
        this._stopTimer();
        const posAcc = stats.posTargets ? stats.posHit / stats.posTargets : (stats.posFA ? 0 : 1);
        const letAcc = stats.letTargets ? stats.letHit / stats.letTargets : (stats.letFA ? 0 : 1);
        const fpPenalty = (stats.posFA + stats.letFA) * 0.06;
        let score = ((posAcc + letAcc) / 2 - fpPenalty) * 100;
        score = Math.max(0, Math.min(100, score));
        const detail = `Position ${stats.posHit}/${stats.posTargets}, Buchstabe ${stats.letHit}/${stats.letTargets}`;
        this._finishTrainer(score, detail);
    }

    /* ===================== TRAINER: ZAHLENSPANNE ===================== */
    _tSpan(grade) {
        const startLen = 3 + Math.floor(grade / 4);
        const backward = Math.random() < 0.4;
        this._gameShell('Zahlenspanne', '↔️',
            backward ? 'Die Ziffern erscheinen nacheinander – gib sie danach <strong>rückwärts</strong> ein.' : 'Die Ziffern erscheinen nacheinander – gib sie danach <strong>vorwärts</strong> ein.',
            'gs-game');
        const body = document.getElementById('gs-game');
        const st = { len: startLen, maxReached: startLen - 1, fails: 0 };

        const showSequence = () => {
            const seq = Array.from({ length: st.len }, () => Math.floor(Math.random() * 10));
            body.innerHTML = `
                <div class="gm-head"><strong>Länge ${st.len}${backward ? ' · rückwärts' : ''}</strong><span class="meta">Längste: ${st.maxReached}</span></div>
                <div class="gm-memorize"><div class="gm-digit" id="gs-span-show">…</div></div>`;
            const showEl = body.querySelector('#gs-span-show');
            let k = -1;
            const tick = () => {
                k++;
                if (k >= seq.length) { this._stopTimer(); setTimeout(() => askInput(seq), 350); return; }
                showEl.textContent = seq[k];
                showEl.style.opacity = 1;
                setTimeout(() => { showEl.style.opacity = .15; }, 550);
            };
            this.timer = setInterval(tick, 850);
            tick();
        };
        const askInput = (seq) => {
            const target = backward ? seq.slice().reverse() : seq;
            body.innerHTML = `
                <div class="gm-head"><strong>Wiedergabe${backward ? ' rückwärts' : ''}</strong></div>
                <div class="gm-recall-grid">${target.map((_, i) => `<input data-i="${i}" inputmode="numeric" maxlength="1">`).join('')}</div>
                <button class="ss-btn ss-btn-primary" id="gs-span-check"><i class="fas fa-check"></i> Prüfen</button>`;
            const inputs = [...body.querySelectorAll('input')];
            inputs[0] && inputs[0].focus();
            inputs.forEach((inp, idx) => inp.addEventListener('input', () => { if (inp.value && idx < inputs.length - 1) inputs[idx + 1].focus(); }));
            body.querySelector('#gs-span-check').addEventListener('click', () => {
                let correct = true;
                inputs.forEach((inp, i) => { const ok = String(target[i]) === inp.value.trim(); inp.classList.add(ok ? 'ok' : 'bad'); if (!ok) correct = false; });
                if (correct) { st.maxReached = Math.max(st.maxReached, st.len); st.len++; st.fails = 0; setTimeout(showSequence, 700); }
                else {
                    st.fails++;
                    if (st.fails >= 2) { const score = Math.min(100, Math.max(0, (st.maxReached - 2) * 14)); this._finishTrainer(score, `Längste Spanne: ${st.maxReached}`); }
                    else { this._toast('Ein Versuch bleibt noch', 'error'); setTimeout(() => askInput(seq), 700); }
                }
            });
        };
        showSequence();
    }

    /* ===================== TRAINER: SPEED NUMBERS ===================== */
    _tSpeedNum(grade) {
        const count = (this.mode === 'exam' ? 14 : 10) + grade * 2;
        const showMs = Math.max(4000, (this.mode === 'exam' ? 9000 : 13000) - grade * 350);
        this._gameShell('Speed Numbers', '⚡',
            `Präge dir <strong>${count} Ziffern</strong> ein – du hast dafür ${Math.round(showMs / 1000)} Sekunden. Tipp: verwandle jede Ziffer in ihr Bild (Zahl-Form-System) und lege sie auf deiner Route ab.`,
            'gs-game');
        const seq = Array.from({ length: count }, () => Math.floor(Math.random() * 10));
        const body = document.getElementById('gs-game');
        let left = Math.round(showMs / 1000);
        body.innerHTML = `
            <div class="gm-countdown">Einprägen – noch <span class="gm-bigtimer" id="gs-sn-t">${left}</span> s</div>
            <div class="gm-memorize">${seq.map((d, i) => `<span class="gm-digit grouped">${d}</span>${(i + 1) % 2 === 0 ? '<span style="width:8px"></span>' : ''}`).join('')}</div>
            <button class="ss-btn ss-btn-ghost" id="gs-sn-ready">Bereit – jetzt abrufen</button>`;
        const tEl = body.querySelector('#gs-sn-t');
        const toRecall = () => {
            this._stopTimer();
            body.innerHTML = `
                <div class="gm-head"><strong>Gib die ${count} Ziffern ein</strong></div>
                <div class="gm-recall-grid">${seq.map((_, i) => `<input data-i="${i}" inputmode="numeric" maxlength="1">`).join('')}</div>
                <button class="ss-btn ss-btn-primary" id="gs-sn-check"><i class="fas fa-check"></i> Auswerten</button>`;
            const inputs = [...body.querySelectorAll('input')];
            inputs[0] && inputs[0].focus();
            inputs.forEach((inp, idx) => inp.addEventListener('input', () => { if (inp.value && idx < inputs.length - 1) inputs[idx + 1].focus(); }));
            body.querySelector('#gs-sn-check').addEventListener('click', () => {
                let correct = 0;
                inputs.forEach((inp, i) => { const ok = String(seq[i]) === inp.value.trim(); inp.classList.add(ok ? 'ok' : 'bad'); if (ok) correct++; });
                this._finishTrainer(correct / count * 100, `${correct}/${count} Ziffern richtig`);
            });
        };
        this.timer = setInterval(() => { left--; if (tEl) tEl.textContent = left; if (left <= 0) toRecall(); }, 1000);
        body.querySelector('#gs-sn-ready').addEventListener('click', toRecall);
    }

    /* ===================== TRAINER: MAJOR-SYSTEM ===================== */
    _tMajor(grade) {
        // Lehr-/Drill-Modus: Ziffer → Konsonant abfragen
        this._gameShell('Major-System-Trainer', '🔤',
            'Das Major-System verwandelt jede Ziffer in einen Konsonantenlaut – so werden Zahlen zu merkbaren Wörtern. Lerne die Tabelle und übe im Drill.',
            'gs-game');
        const body = document.getElementById('gs-game');
        body.innerHTML = `
            <div class="gm-major-table">
                ${GS_MAJOR.map(m => `<div class="gm-major-cell"><div class="d">${m.d}</div><div class="c">${m.c}</div><div class="ex">${m.ex}</div></div>`).join('')}
            </div>
            <button class="ss-btn ss-btn-primary" id="gs-major-drill"><i class="fas fa-play"></i> Drill starten (10 Fragen)</button>
            <div id="gs-major-drillarea" style="margin-top:16px"></div>`;
        body.querySelector('#gs-major-drill').addEventListener('click', () => this._majorDrill(body.querySelector('#gs-major-drillarea')));
    }

    _majorDrill(area) {
        const rounds = 10;
        const st = { i: 0, correct: 0 };
        const render = () => {
            if (st.i >= rounds) { this._finishTrainer(st.correct / rounds * 100, `${st.correct}/${rounds} richtig`); return; }
            const d = Math.floor(Math.random() * 10);
            const right = GS_MAJOR[d];
            const opts = [right];
            while (opts.length < 4) { const c = GS_MAJOR[Math.floor(Math.random() * 10)]; if (!opts.includes(c)) opts.push(c); }
            opts.sort(() => Math.random() - 0.5);
            area.innerHTML = `
                <div class="gm-head"><strong>Frage ${st.i + 1}/${rounds}</strong><span class="meta">Welcher Laut gehört zur Ziffer?</span></div>
                <div class="gm-memorize" style="min-height:90px"><div class="gm-digit">${d}</div></div>
                <div class="ss-options">${opts.map(o => `<button class="ss-option" data-d="${o.d}">${o.c}</button>`).join('')}</div>`;
            area.querySelectorAll('.ss-option').forEach(b => b.addEventListener('click', () => {
                const chosen = +b.dataset.d;
                area.querySelectorAll('.ss-option').forEach(x => { const xd = +x.dataset.d; if (xd === d) x.classList.add('correct'); else if (xd === chosen) x.classList.add('wrong'); x.disabled = true; });
                if (chosen === d) st.correct++;
                st.i++;
                setTimeout(render, 650);
            }));
        };
        render();
    }

    /* ===================== TRAINER: ZAHL-FORM-SYSTEM ===================== */
    _tShapes() {
        this._gameShell('Zahl-Form-System', '🖼️',
            'Jede Ziffer bekommt ein festes Bild – aus der <strong>1</strong> wird eine Kerze, aus der <strong>3</strong> ein Dreizack, aus der <strong>5</strong> eine Hand. <strong>Erfinde deine eigenen Bilder</strong> (selbst erdachte merkt man am besten) und lege sie später auf deiner Route ab.',
            'gs-game');
        const body = document.getElementById('gs-game');
        const render = () => {
            body.innerHTML = `
                <div class="gm-shapes-grid">
                    ${GS_NUMSHAPES.map(s0 => { const s = this._numShape(s0.d); return `
                        <div class="gm-shape-cell">
                            <div class="head"><span class="em">${s.emoji}</span><span class="d">${s0.d}</span></div>
                            <input class="gm-shape-emoji" data-de="${s0.d}" value="${this._esc(s.emoji)}" maxlength="4" title="Symbol/Emoji">
                            <input class="gm-shape-word" data-d="${s0.d}" value="${this._esc(s.word)}" title="Bild-Wort">
                        </div>`; }).join('')}
                </div>
                <p class="sub" style="margin-top:8px"><i class="fas fa-lightbulb"></i> Tippe Bild oder Wort an, um es durch dein eigenes zu ersetzen – das ist wissenschaftlich am wirksamsten (Generationseffekt).</p>
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <button class="ss-btn ss-btn-primary" id="gs-shapes-drill"><i class="fas fa-play"></i> Drill starten (10 Fragen)</button>
                    <button class="ss-btn ss-btn-ghost" id="gs-shapes-reset"><i class="fas fa-rotate-left"></i> Standard wiederherstellen</button>
                </div>
                <div id="gs-shapes-drillarea" style="margin-top:16px"></div>`;
            body.querySelectorAll('.gm-shape-word').forEach(inp => inp.addEventListener('change', () => { const v = inp.value.trim(); if (v) this._setNumShape(+inp.dataset.d, { word: v }); }));
            body.querySelectorAll('.gm-shape-emoji').forEach(inp => inp.addEventListener('change', () => { const v = inp.value.trim(); if (v) { this._setNumShape(+inp.dataset.de, { emoji: v }); render(); } }));
            body.querySelector('#gs-shapes-drill').addEventListener('click', () => this._shapesDrill(body.querySelector('#gs-shapes-drillarea')));
            body.querySelector('#gs-shapes-reset').addEventListener('click', () => { this.state.numShapes = this._seedShapes(); this._save(); render(); });
        };
        render();
    }

    _shapeOptions(correct) {
        const ds = [correct];
        while (ds.length < 4) { const x = Math.floor(Math.random() * 10); if (!ds.includes(x)) ds.push(x); }
        return ds.sort(() => Math.random() - 0.5).map(d => ({ d, ...this._numShape(d) }));
    }

    _shapesDrill(area) {
        const rounds = 10;
        const st = { i: 0, correct: 0 };
        const render = () => {
            if (st.i >= rounds) { this._finishTrainer(st.correct / rounds * 100, `${st.correct}/${rounds} richtig`); return; }
            const d = Math.floor(Math.random() * 10);
            const s = this._numShape(d);
            const opts = this._shapeOptions(d);
            const d2w = Math.random() < 0.5;
            if (d2w) {
                area.innerHTML = `
                    <div class="gm-head"><strong>Frage ${st.i + 1}/${rounds}</strong><span class="meta">Welches Bild gehört zur Ziffer?</span></div>
                    <div class="gm-memorize" style="min-height:90px"><div class="gm-digit">${d}</div></div>
                    <div class="ss-options">${opts.map(o => `<button class="ss-option" data-d="${o.d}">${o.emoji} ${this._esc(o.word)}</button>`).join('')}</div>`;
            } else {
                area.innerHTML = `
                    <div class="gm-head"><strong>Frage ${st.i + 1}/${rounds}</strong><span class="meta">Welche Ziffer steckt hinter dem Bild?</span></div>
                    <div class="gm-memorize" style="min-height:90px;gap:8px"><div style="font-size:52px">${s.emoji}</div><div class="gm-word-chip">${this._esc(s.word)}</div></div>
                    <div class="ss-options">${opts.map(o => `<button class="ss-option" data-d="${o.d}">${o.d}</button>`).join('')}</div>`;
            }
            area.querySelectorAll('.ss-option').forEach(b => b.addEventListener('click', () => {
                const chosen = +b.dataset.d;
                area.querySelectorAll('.ss-option').forEach(x => { const xd = +x.dataset.d; if (xd === d) x.classList.add('correct'); else if (xd === chosen) x.classList.add('wrong'); x.disabled = true; });
                if (chosen === d) st.correct++;
                st.i++;
                setTimeout(render, 650);
            }));
        };
        render();
    }

    /* ===================== TRAINER: ZAHLEN-REISE (Eselswelt-Methode) ===================== */
    _tZahlenreise(grade) {
        const route = this._pickPalace();
        const maxLen = Math.min(route.stations.length, (this.mode === 'exam' ? 6 : 4) + Math.floor(grade / 3));
        const stations = route.stations.slice(0, maxLen);
        const digits = Array.from({ length: stations.length }, () => Math.floor(Math.random() * 10));
        const showMs = Math.max(7000, 18000 - grade * 200) + stations.length * 900;
        this._gameShell('Zahlen-Reise', '🧭',
            `Deine Technik aus „Eselswelt": Route <strong>${this._esc(route.name)}</strong>${route.id ? ' (deine Route)' : ''}. Verwandle jede Ziffer in ihr Bild und lege es lebendig an der Station ab – sieh, wie z. B. die Kerze auf der Bettdecke brennt. Danach gehst du die Route ab und liest die Zahl wieder ab.`,
            'gs-game');
        const body = document.getElementById('gs-game');
        let left = Math.round(showMs / 1000);
        body.innerHTML = `
            <div class="gm-countdown">Bilder ablegen – noch <span class="gm-bigtimer" id="gs-zr-t">${left}</span> s</div>
            <div class="gm-loci-route">${stations.map((s, i) => { const sh = this._numShape(digits[i]); return `<div class="gm-loci-station"><div class="pin">${i + 1}</div><div class="place">${this._esc(s)}</div><div class="item">${sh.emoji} ${this._esc(sh.word)} <b style="color:var(--ss-text)">(${digits[i]})</b></div></div>`; }).join('')}</div>
            <button class="ss-btn ss-btn-ghost" id="gs-zr-ready">Bereit – Zahl abrufen</button>`;
        const tEl = body.querySelector('#gs-zr-t');
        const toRecall = () => {
            this._stopTimer();
            body.innerHTML = `
                <div class="gm-head"><strong>Gehe die Route ab – welche Ziffer lag wo?</strong></div>
                <div class="gm-loci-route">${stations.map((s, i) => `<div class="gm-loci-station"><div class="pin">${i + 1}</div><div class="place">${this._esc(s)}</div><input data-i="${i}" inputmode="numeric" maxlength="1" placeholder="?" style="max-width:84px;text-align:center;font-size:20px;font-weight:700"></div>`).join('')}</div>
                <button class="ss-btn ss-btn-primary" id="gs-zr-check"><i class="fas fa-check"></i> Auswerten</button>`;
            const inputs = [...body.querySelectorAll('input')];
            inputs[0] && inputs[0].focus();
            inputs.forEach((inp, idx) => inp.addEventListener('input', () => { if (inp.value && idx < inputs.length - 1) inputs[idx + 1].focus(); }));
            body.querySelector('#gs-zr-check').addEventListener('click', () => {
                let correct = 0;
                inputs.forEach((inp, i) => { const ok = String(digits[i]) === inp.value.trim(); inp.closest('.gm-loci-station').classList.add(ok ? 'ok' : 'bad'); if (ok) correct++; });
                this._finishTrainer(correct / stations.length * 100, `Zahl ${digits.join('')} · ${correct}/${stations.length} richtig`);
            });
        };
        this.timer = setInterval(() => { left--; if (tEl) tEl.textContent = left; if (left <= 0) toRecall(); }, 1000);
        body.querySelector('#gs-zr-ready').addEventListener('click', toRecall);
    }

    /* ===================== ROUTEN-VERWALTUNG (eigene Wege) ===================== */
    _palaceManager() {
        this._stopTimer();
        const main = document.getElementById('ss-main');
        const custom = this.state.palaces || [];
        main.innerHTML = `
        <div class="ss-panel" style="--accent:#e0b04a">
            <h2>🗺️ Deine eigenen Routen</h2>
            <p class="sub">Eine Route ist ein Weg, den du blind kennst – z. B. von der Bettdecke morgens bis zur Uni. Je vertrauter, desto besser. Lege die Stationen in der Reihenfolge an, in der du sie abgehst. Deine Routen werden in „Palast-Route" und „Zahlen-Reise" verwendet.</p>
            <div class="gm-deck-list">
                ${custom.map(p => `<div class="gm-deck"><div class="icon"><i class="fas fa-route"></i></div><div class="body"><div class="name">${this._esc(p.name)}</div><div class="stats">${p.stations.length} Stationen · ${this._esc(p.stations.slice(0, 3).join(', '))}…</div></div><button class="ss-btn ss-btn-ghost gs-route-del" data-id="${p.id}" style="padding:8px 12px;font-size:13px"><i class="fas fa-trash"></i></button></div>`).join('')}
                ${GS_PALACES.map(p => `<div class="gm-deck" style="opacity:.75"><div class="icon" style="background:var(--ss-line)"><i class="fas fa-bookmark"></i></div><div class="body"><div class="name">${this._esc(p.name)}</div><div class="stats">Vorlage · ${p.stations.length} Stationen</div></div></div>`).join('')}
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
                <button class="ss-btn ss-btn-primary" id="gs-route-new"><i class="fas fa-plus"></i> Neue Route erstellen</button>
                <button class="ss-btn ss-btn-ghost" id="gs-route-back"><i class="fas fa-arrow-left"></i> Zurück</button>
            </div>
        </div>`;
        main.querySelector('#gs-route-back').addEventListener('click', () => { this.activeDisc = 'palast'; this.go('practice'); });
        main.querySelector('#gs-route-new').addEventListener('click', () => this._routeEditor());
        main.querySelectorAll('.gs-route-del').forEach(b => b.addEventListener('click', () => {
            this.state.palaces = (this.state.palaces || []).filter(p => p.id !== b.dataset.id);
            this._save();
            this._palaceManager();
        }));
    }

    _routeEditor() {
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:#e0b04a">
            <h2>🧭 Neue Route</h2>
            <div class="ss-field"><label>Name der Route</label><input class="gm-route-input" id="gs-rname" placeholder="z. B. Mein Weg zur Uni" autocomplete="off"></div>
            <p class="sub">Stationen in Reihenfolge (mindestens 4):</p>
            <div class="gm-recall-rows" id="gs-rstations"></div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
                <button class="ss-btn ss-btn-ghost" id="gs-radd"><i class="fas fa-plus"></i> Station</button>
                <button class="ss-btn ss-btn-primary" id="gs-rsave"><i class="fas fa-check"></i> Route speichern</button>
                <button class="ss-btn ss-btn-ghost" id="gs-rcancel">Abbrechen</button>
            </div>
        </div>`;
        const wrap = main.querySelector('#gs-rstations');
        const addRow = (val) => {
            const i = wrap.children.length;
            const div = document.createElement('div');
            div.className = 'gm-recall-row';
            div.innerHTML = `<span class="num">${i + 1}</span><input class="gm-route-input" value="${this._esc(val || '')}" placeholder="Station ${i + 1}" autocomplete="off">`;
            wrap.appendChild(div);
        };
        for (let i = 0; i < 6; i++) addRow('');
        main.querySelector('#gs-radd').addEventListener('click', () => addRow(''));
        main.querySelector('#gs-rcancel').addEventListener('click', () => this._palaceManager());
        main.querySelector('#gs-rsave').addEventListener('click', () => {
            const name = main.querySelector('#gs-rname').value.trim();
            const stations = [...wrap.querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean);
            if (!name) { this._toast('Bitte einen Namen vergeben', 'error'); return; }
            if (stations.length < 4) { this._toast('Mindestens 4 Stationen nötig', 'error'); return; }
            this.state.palaces.push({ id: 'r' + Date.now(), name, stations });
            this._save();
            this._toast('Route gespeichert!', 'success');
            this._palaceManager();
        });
        main.querySelector('#gs-rname').focus();
    }

    /* ===================== TRAINER: WÖRTER ===================== */
    _tWords(grade) {
        const count = (this.mode === 'exam' ? 9 : 7) + Math.floor(grade / 2);
        const showMs = Math.max(5000, (this.mode === 'exam' ? 11000 : 15000) - grade * 300);
        this._gameShell('Wortliste merken', '📚',
            `Merke dir <strong>${count} Wörter</strong> in Reihenfolge (${Math.round(showMs / 1000)} s). Tipp: verbinde sie zu einer absurden Geschichte.`,
            'gs-game');
        const pool = GS_WORDS.slice().sort(() => Math.random() - 0.5).slice(0, count);
        const body = document.getElementById('gs-game');
        let left = Math.round(showMs / 1000);
        body.innerHTML = `
            <div class="gm-countdown">Einprägen – noch <span class="gm-bigtimer" id="gs-w-t">${left}</span> s</div>
            <div class="gm-memorize">${pool.map((w, i) => `<span class="gm-word-chip">${i + 1}. ${w}</span>`).join('')}</div>
            <button class="ss-btn ss-btn-ghost" id="gs-w-ready">Bereit – jetzt abrufen</button>`;
        const tEl = body.querySelector('#gs-w-t');
        const toRecall = () => {
            this._stopTimer();
            body.innerHTML = `
                <div class="gm-head"><strong>Gib die Wörter in Reihenfolge ein</strong></div>
                <div class="gm-recall-rows">${pool.map((_, i) => `<div class="gm-recall-row"><span class="num">${i + 1}</span><input data-i="${i}" autocomplete="off"></div>`).join('')}</div>
                <button class="ss-btn ss-btn-primary" id="gs-w-check"><i class="fas fa-check"></i> Auswerten</button>`;
            const inputs = [...body.querySelectorAll('input')];
            inputs[0] && inputs[0].focus();
            body.querySelector('#gs-w-check').addEventListener('click', () => {
                let correct = 0;
                inputs.forEach((inp, i) => {
                    const ok = this._norm(inp.value) === this._norm(pool[i]);
                    inp.closest('.gm-recall-row').classList.add(ok ? 'ok' : 'bad');
                    if (!ok) { const r = inp.closest('.gm-recall-row'); if (!r.querySelector('.truth')) { const s = document.createElement('span'); s.className = 'truth'; s.textContent = '→ ' + pool[i]; r.appendChild(s); } }
                    if (ok) correct++;
                });
                this._finishTrainer(correct / count * 100, `${correct}/${count} Wörter richtig`);
            });
        };
        this.timer = setInterval(() => { left--; if (tEl) tEl.textContent = left; if (left <= 0) toRecall(); }, 1000);
        body.querySelector('#gs-w-ready').addEventListener('click', toRecall);
    }

    /* ===================== TRAINER: NAMEN & GESICHTER ===================== */
    _tNames(grade) {
        const count = (this.mode === 'exam' ? 6 : 4) + Math.floor(grade / 3);
        const showMs = Math.max(6000, (this.mode === 'exam' ? 10000 : 14000) - grade * 250);
        this._gameShell('Namen & Gesichter', '😊',
            `Präge dir <strong>${count} Gesichter</strong> mit Namen ein (${Math.round(showMs / 1000)} s). Tipp: verknüpfe den Namen mit einem auffälligen Merkmal.`,
            'gs-game');
        const people = [];
        const usedN = new Set(), usedE = new Set();
        for (let i = 0; i < count; i++) {
            let nm; do { nm = GS_NAMES[Math.floor(Math.random() * GS_NAMES.length)]; } while (usedN.has(nm)); usedN.add(nm);
            let em; do { em = GS_FACE_EMOJI[Math.floor(Math.random() * GS_FACE_EMOJI.length)]; } while (usedE.has(em) && usedE.size < GS_FACE_EMOJI.length); usedE.add(em);
            people.push({ name: nm, emoji: em, bg: GS_FACE_BG[i % GS_FACE_BG.length] });
        }
        const body = document.getElementById('gs-game');
        let left = Math.round(showMs / 1000);
        body.innerHTML = `
            <div class="gm-countdown">Einprägen – noch <span class="gm-bigtimer" id="gs-n-t">${left}</span> s</div>
            <div class="gm-faces">${people.map(p => `<div class="gm-face-card"><div class="gm-avatar" style="background:${p.bg}">${p.emoji}</div><div class="gm-face-name">${p.name}</div></div>`).join('')}</div>
            <button class="ss-btn ss-btn-ghost" id="gs-n-ready">Bereit – jetzt abrufen</button>`;
        const tEl = body.querySelector('#gs-n-t');
        const toRecall = () => {
            this._stopTimer();
            const shuffled = people.slice().sort(() => Math.random() - 0.5);
            body.innerHTML = `
                <div class="gm-head"><strong>Wie heißen sie?</strong></div>
                <div class="gm-faces">${shuffled.map((p, i) => `<div class="gm-face-card"><div class="gm-avatar" style="background:${p.bg}">${p.emoji}</div><input data-name="${p.name}" placeholder="Name?" autocomplete="off"></div>`).join('')}</div>
                <button class="ss-btn ss-btn-primary" id="gs-n-check"><i class="fas fa-check"></i> Auswerten</button>`;
            const inputs = [...body.querySelectorAll('input')];
            inputs[0] && inputs[0].focus();
            body.querySelector('#gs-n-check').addEventListener('click', () => {
                let correct = 0;
                inputs.forEach(inp => {
                    const ok = this._norm(inp.value) === this._norm(inp.dataset.name);
                    inp.classList.add(ok ? 'ok' : 'bad');
                    if (!ok) { const c = inp.closest('.gm-face-card'); if (!c.querySelector('.truth')) { const s = document.createElement('div'); s.className = 'truth'; s.textContent = inp.dataset.name; c.appendChild(s); } }
                    if (ok) correct++;
                });
                this._finishTrainer(correct / count * 100, `${correct}/${count} Namen richtig`);
            });
        };
        this.timer = setInterval(() => { left--; if (tEl) tEl.textContent = left; if (left <= 0) toRecall(); }, 1000);
        body.querySelector('#gs-n-ready').addEventListener('click', toRecall);
    }

    /* ===================== TRAINER: GEDÄCHTNISPALAST (LOCI) ===================== */
    _tLoci(grade) {
        const count = (this.mode === 'exam' ? 7 : 5) + Math.floor(grade / 3);
        const palace = this._pickPalace();
        const stations = palace.stations.slice(0, Math.min(count, palace.stations.length));
        const items = GS_WORDS.slice().sort(() => Math.random() - 0.5).slice(0, stations.length);
        const showMs = Math.max(6000, 16000 - grade * 250) + stations.length * 800;
        this._gameShell('Gedächtnispalast', '🗺️',
            `Route: <strong>${palace.name}</strong>. Lege an jeder Station bildhaft den Begriff ab – stelle dir vor, wie er dort liegt. Danach rufst du sie der Reihe nach ab.`,
            'gs-game');
        const body = document.getElementById('gs-game');
        let left = Math.round(showMs / 1000);
        body.innerHTML = `
            <div class="gm-countdown">Ablegen & einprägen – noch <span class="gm-bigtimer" id="gs-l-t">${left}</span> s</div>
            <div class="gm-loci-route">${stations.map((s, i) => `<div class="gm-loci-station"><div class="pin">${i + 1}</div><div class="place">${s}</div><div class="item">${items[i]}</div></div>`).join('')}</div>
            <button class="ss-btn ss-btn-ghost" id="gs-l-ready">Bereit – jetzt abrufen</button>`;
        const tEl = body.querySelector('#gs-l-t');
        const toRecall = () => {
            this._stopTimer();
            body.innerHTML = `
                <div class="gm-head"><strong>Gehe die Route ab – was lag wo?</strong></div>
                <div class="gm-loci-route">${stations.map((s, i) => `<div class="gm-loci-station"><div class="pin">${i + 1}</div><div class="place">${s}</div><input data-i="${i}" placeholder="Begriff?" autocomplete="off"></div>`).join('')}</div>
                <button class="ss-btn ss-btn-primary" id="gs-l-check"><i class="fas fa-check"></i> Auswerten</button>`;
            const inputs = [...body.querySelectorAll('input')];
            inputs[0] && inputs[0].focus();
            body.querySelector('#gs-l-check').addEventListener('click', () => {
                let correct = 0;
                inputs.forEach((inp, i) => {
                    const ok = this._norm(inp.value) === this._norm(items[i]);
                    inp.closest('.gm-loci-station').classList.add(ok ? 'ok' : 'bad');
                    if (ok) correct++;
                });
                this._finishTrainer(correct / stations.length * 100, `${correct}/${stations.length} Stationen richtig`);
            });
        };
        this.timer = setInterval(() => { left--; if (tEl) tEl.textContent = left; if (left <= 0) toRecall(); }, 1000);
        body.querySelector('#gs-l-ready').addEventListener('click', toRecall);
    }

    /* ===================== TRAINER: SPIELKARTEN ===================== */
    _tCards(grade) {
        const count = Math.min((this.mode === 'exam' ? 7 : 5) + Math.floor(grade / 2), 20);
        const showMs = Math.max(6000, (this.mode === 'exam' ? 11000 : 16000) - grade * 200) + count * 600;
        this._gameShell('Kartenfolge', '🃏',
            `Merke dir die Reihenfolge von <strong>${count} Karten</strong> (${Math.round(showMs / 1000)} s) und lege sie danach in genau dieser Folge.`,
            'gs-game');
        const deck = this._buildDeck();
        const seq = deck.sort(() => Math.random() - 0.5).slice(0, count);
        const body = document.getElementById('gs-game');
        let left = Math.round(showMs / 1000);
        body.innerHTML = `
            <div class="gm-countdown">Einprägen – noch <span class="gm-bigtimer" id="gs-c-t">${left}</span> s</div>
            <div class="gm-cards">${seq.map(c => this._cardHtml(c)).join('')}</div>
            <button class="ss-btn ss-btn-ghost" id="gs-c-ready">Bereit – jetzt legen</button>`;
        const tEl = body.querySelector('#gs-c-t');
        const toRecall = () => {
            this._stopTimer();
            const picker = this._buildDeck();
            const chosen = [];
            body.innerHTML = `
                <div class="gm-head"><strong>Lege die Karten in Reihenfolge</strong><span class="meta" id="gs-c-prog">0 / ${count}</span></div>
                <div class="gm-card-slots" id="gs-c-slots">${seq.map((_, i) => `<div class="gm-card-slot" data-slot="${i}">${i + 1}</div>`).join('')}</div>
                <div class="gm-cards" id="gs-c-picker">${picker.map(c => `<div class="gm-card pick ${c.red ? 'red' : ''}" data-id="${c.id}"><div>${c.rank}</div><div>${c.suit}</div></div>`).join('')}</div>
                <button class="ss-btn ss-btn-primary" id="gs-c-check" style="margin-top:14px" disabled><i class="fas fa-check"></i> Auswerten</button>`;
            const slots = body.querySelectorAll('.gm-card-slot');
            const prog = body.querySelector('#gs-c-prog');
            const checkBtn = body.querySelector('#gs-c-check');
            body.querySelectorAll('.gm-card.pick').forEach(el => el.addEventListener('click', () => {
                if (el.classList.contains('chosen') || chosen.length >= count) return;
                el.classList.add('chosen');
                const id = el.dataset.id;
                const slot = slots[chosen.length];
                const card = picker.find(c => c.id === id);
                slot.innerHTML = `<div class="gm-card ${card.red ? 'red' : ''}" style="width:100%;height:100%"><div>${card.rank}</div><div>${card.suit}</div></div>`;
                chosen.push(id);
                prog.textContent = `${chosen.length} / ${count}`;
                if (chosen.length === count) checkBtn.disabled = false;
            }));
            checkBtn.addEventListener('click', () => {
                let correct = 0;
                seq.forEach((c, i) => { if (chosen[i] === c.id) { correct++; slots[i].classList.add('ok'); } });
                this._finishTrainer(correct / count * 100, `${correct}/${count} Karten an richtiger Stelle`);
            });
        };
        this.timer = setInterval(() => { left--; if (tEl) tEl.textContent = left; if (left <= 0) toRecall(); }, 1000);
        body.querySelector('#gs-c-ready').addEventListener('click', toRecall);
    }
    _buildDeck() {
        const suits = [{ s: '♠', r: false }, { s: '♥', r: true }, { s: '♦', r: true }, { s: '♣', r: false }];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K'];
        const deck = [];
        suits.forEach(su => ranks.forEach(r => deck.push({ id: r + su.s, rank: r, suit: su.s, red: su.r })));
        return deck;
    }
    _cardHtml(c) { return `<div class="gm-card ${c.red ? 'red' : ''}"><div>${c.rank}</div><div>${c.suit}</div></div>`; }

    /* ===================== PRÜFUNGEN ===================== */
    _renderExams() {
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Prüfungen</div>
            <h1>Öffne die nächste Tür</h1>
            <p>Jede trainierbare Disziplin hat ihre Prüfung – eine anspruchsvollere, bewertete Version des Trainings. Bestehe sie, um in den nächsten Grad aufzusteigen. Die geforderte Punktzahl wächst mit jeder Stufe.</p>
        </div>
        <div class="ss-grid">
            ${GS_DISCIPLINES.filter(d => d.exam).map(d => {
                const st = this.state.disc[d.id];
                const grade = this._grade(d.id);
                const req = GS_reqExam(grade);
                const best = st.examScores.length ? Math.max(...st.examScores.map(e => e.score)) : 0;
                const needs = this._needsExam(d.id);
                return `
                <div class="ss-sense-card" data-exam="${d.id}" style="--accent:${d.accent};--accent-soft:${d.soft};--accent-glow:${d.glow}">
                    <div class="ss-sense-head">
                        <div class="ss-sense-icon">${d.icon}</div>
                        <div>
                            <div class="ss-sense-name">Prüfung · ${d.name}</div>
                            <div class="ss-sense-grade-name">${st.examScores.length} Versuche · Best ${best}</div>
                        </div>
                        <div class="ss-sense-rank">≥ ${req}</div>
                    </div>
                    <p class="ss-sense-meta" style="margin-top:8px">${needs ? '⚑ Tür wartet auf dich' : `Grad ${grade} · ${GS_titleFor(grade)}`}</p>
                </div>`;
            }).join('')}
        </div>`;
    }
    _afterExams() {
        document.querySelectorAll('[data-exam]').forEach(c => c.addEventListener('click', () => {
            const id = c.dataset.exam;
            this.activeDisc = id;
            this._startTrainer(GS_DISC_MAP[id].exam, 'exam');
        }));
    }
    _finishExam(score) {
        const id = this.activeDisc;
        const d = GS_DISC_MAP[id];
        const st = this.state.disc[id];
        const before = this._grade(id);
        const req = GS_reqExam(before);
        st.examScores.push({ date: this._today(), grade: before, score });
        if (score > (st.bestExam || 0)) st.bestExam = score;
        const passed = score >= req;
        if (passed) st.doorGrade = Math.max(st.doorGrade || 0, before);
        const xpGain = Math.round(score);
        st.xp += xpGain;
        this._registerPracticeDay(3);
        this.state.log.unshift({ id: Date.now(), date: this._today(), disc: id, trainer: 'Prüfung', score, xp: xpGain });
        this.state.log = this.state.log.slice(0, 120);
        const after = this._grade(id);
        this._save();
        this._chime(passed);
        const deg = Math.round(score * 3.6);
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="text-align:center;--accent:${d.accent}">
            <h2>${d.icon} Prüfungsergebnis</h2>
            <div class="ss-score-circle" style="--deg:${deg}deg"><span class="val">${score}</span></div>
            <p class="sub" style="text-align:center">${passed
                ? '<strong style="color:#34d399">Tür geöffnet!</strong> +' + xpGain + ' Gedächtniskraft'
                : `Noch nicht bestanden (≥ ${req} nötig). +${xpGain} Gedächtniskraft. Übe weiter – jeder Versuch zählt.`}</p>
            ${after > before ? `<p style="color:#e0b04a;font-weight:600">Aufstieg in Grad ${after}: ${GS_titleFor(after)}!</p>` : ''}
            <div class="ss-player-controls">
                <button class="ss-btn ss-btn-ghost" id="gs-exam-retry">Nochmal</button>
                <button class="ss-btn ss-btn-primary" id="gs-exam-back">Zur Übersicht</button>
            </div>
        </div>`;
        main.querySelector('#gs-exam-retry').addEventListener('click', () => this._startTrainer(d.exam, 'exam'));
        main.querySelector('#gs-exam-back').addEventListener('click', () => this.go('exams'));
    }

    /* ===================== SPACED REPETITION ===================== */
    _allCards() { return (this.state.srs.decks || []).flatMap(d => d.cards.map(c => ({ c, deck: d }))); }
    _totalCards() { return this._allCards().length; }
    _dueCount() { const now = Date.now(); return this._allCards().filter(({ c }) => new Date(c.due).getTime() <= now).length; }

    _renderSrs() {
        const decks = this.state.srs.decks || [];
        const due = this._dueCount();
        const total = this._totalCards();
        const retention = this._avgRetention();
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Langzeit · Spaced Repetition</div>
            <h1>Dein wissenschaftlicher Karteikasten</h1>
            <p>Ein adaptiver Scheduler (FSRS-Prinzip) modelliert für jede Karte deine persönliche Vergessenskurve und plant die Wiederholung exakt dann, wenn sie am meisten bringt – statt sturem Pauken.</p>
        </div>
        <div class="ss-panel">
            <div class="gm-statline">
                <div class="s"><b>${total}</b><span>Karten gesamt</span></div>
                <div class="s"><b style="color:#a78bfa">${due}</b><span>jetzt fällig</span></div>
                <div class="s"><b>${Math.round(retention * 100)}%</b><span>Ø Behaltensrate</span></div>
                <div class="s"><b>${this.state.srs.totalReviews || 0}</b><span>Wiederholungen</span></div>
            </div>
            ${due > 0 ? `<button class="ss-btn ss-btn-primary ss-btn-block" id="gs-srs-start"><i class="fas fa-play"></i> ${due} fällige Karten wiederholen</button>`
                      : `<div style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:#34d399;padding:14px 16px;border-radius:12px"><i class="fas fa-check-circle"></i> Alles erledigt für jetzt. Komm später wieder – der Scheduler meldet sich.</div>`}
        </div>

        ${this._curveHtml()}

        <div class="ss-panel">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
                <h3 style="margin:0"><i class="fas fa-layer-group"></i> Deine Stapel</h3>
                <button class="ss-btn ss-btn-ghost" id="gs-deck-new" style="padding:8px 14px;font-size:14px"><i class="fas fa-plus"></i> Neuer Stapel</button>
            </div>
            <div class="gm-deck-list" style="margin-top:14px">
                ${decks.map(dk => {
                    const dueN = dk.cards.filter(c => new Date(c.due).getTime() <= Date.now()).length;
                    return `
                    <div class="gm-deck" data-deck="${dk.id}">
                        <div class="icon"><i class="fas fa-clone"></i></div>
                        <div class="body">
                            <div class="name">${this._esc(dk.name)}</div>
                            <div class="stats">${dk.cards.length} Karten · ${dueN} fällig</div>
                        </div>
                        <span class="due-badge ${dueN ? '' : 'zero'}">${dueN}</span>
                        <button class="ss-btn ss-btn-ghost gs-deck-add" data-deck="${dk.id}" style="padding:8px 12px;font-size:13px"><i class="fas fa-plus"></i></button>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }

    _afterSrs() {
        const start = document.getElementById('gs-srs-start');
        if (start) start.addEventListener('click', () => this._srsReview());
        const nw = document.getElementById('gs-deck-new');
        if (nw) nw.addEventListener('click', () => this._srsNewDeck());
        document.querySelectorAll('.gs-deck-add').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); this._srsAddCard(b.dataset.deck); }));
        document.querySelectorAll('.gm-deck').forEach(d => d.addEventListener('click', () => this._srsAddCard(d.dataset.deck)));
    }

    _srsReview() {
        const now = Date.now();
        const queue = this._allCards().filter(({ c }) => new Date(c.due).getTime() <= now).sort((a, b) => new Date(a.c.due) - new Date(b.c.due));
        if (!queue.length) { this.go('srs'); return; }
        let idx = 0;
        const renderCard = () => {
            if (idx >= queue.length) { this._toast('Session abgeschlossen!', 'success'); this._save(); this.go('srs'); return; }
            const { c, deck } = queue[idx];
            const main = document.getElementById('ss-main');
            main.innerHTML = `
            <div class="ss-panel" style="--accent:#a78bfa">
                <div class="gm-head"><strong>${this._esc(deck.name)}</strong><span class="meta">${idx + 1} / ${queue.length}</span></div>
                <div class="gm-review-card">
                    <div class="gm-review-front">${this._esc(c.front)}</div>
                    <div class="gm-review-back" id="gs-back" style="display:none">${this._esc(c.back)}</div>
                </div>
                <button class="ss-btn ss-btn-primary ss-btn-block" id="gs-show"><i class="fas fa-eye"></i> Antwort zeigen</button>
                <div class="gm-grade-btns" id="gs-grades" style="display:none;margin-top:12px">
                    <button class="gm-grade-btn" data-g="1">Nochmal<small>&lt; 1 Min</small></button>
                    <button class="gm-grade-btn" data-g="2">Schwer<small>${this._previewInterval(c, 2)}</small></button>
                    <button class="gm-grade-btn" data-g="3">Gut<small>${this._previewInterval(c, 3)}</small></button>
                    <button class="gm-grade-btn" data-g="4">Leicht<small>${this._previewInterval(c, 4)}</small></button>
                </div>
                <div class="ss-player-controls" style="margin-top:14px">
                    <button class="ss-btn ss-btn-ghost" id="gs-srs-quit"><i class="fas fa-xmark"></i> Beenden</button>
                </div>
            </div>`;
            main.querySelector('#gs-show').addEventListener('click', () => {
                main.querySelector('#gs-back').style.display = 'block';
                main.querySelector('#gs-show').style.display = 'none';
                main.querySelector('#gs-grades').style.display = 'grid';
            });
            main.querySelector('#gs-srs-quit').addEventListener('click', () => { this._save(); this.go('srs'); });
            main.querySelectorAll('.gm-grade-btn').forEach(b => b.addEventListener('click', () => {
                this._applyFsrs(c, +b.dataset.g);
                this.state.srs.totalReviews = (this.state.srs.totalReviews || 0) + 1;
                this.state.disc.langzeit.xp += 3;
                this._registerPracticeDay(1);
                idx++;
                renderCard();
            }));
        };
        renderCard();
    }

    // FSRS-artige Aktualisierung von Stabilität/Schwierigkeit/Fälligkeit
    _applyFsrs(card, g) {
        const now = new Date();
        card.reps = (card.reps || 0) + 1;
        if (card.state === 'new' || !card.stability) {
            const initS = [0, 0.4, 1.0, 2.5, 5.0][g] || 2.5;
            card.stability = initS;
            card.difficulty = Math.min(10, Math.max(1, 6 - (g - 2)));
            card.state = 'review';
        } else {
            if (g === 1) {
                card.lapses = (card.lapses || 0) + 1;
                card.stability = Math.max(0.4, card.stability * 0.35);
                card.difficulty = Math.min(10, card.difficulty + 1);
            } else {
                card.difficulty = Math.min(10, Math.max(1, card.difficulty - (g - 3) * 0.7));
                const mult = g === 2 ? 1.25 : g === 3 ? 2.4 : 3.8;
                const diffFactor = 1.1 - card.difficulty * 0.04;
                card.stability = card.stability * mult * Math.max(0.4, diffFactor);
            }
        }
        card.last = now.toISOString();
        const days = g === 1 ? 0.007 : card.stability; // ~10 Min bei "Nochmal"
        card.due = new Date(now.getTime() + days * 86400000).toISOString();
    }
    _previewInterval(card, g) {
        const tmp = JSON.parse(JSON.stringify(card));
        this._applyFsrs(tmp, g);
        const days = (new Date(tmp.due) - Date.now()) / 86400000;
        if (days < 1) return Math.round(days * 24 * 60) + ' Min';
        if (days < 30) return Math.round(days) + ' Tg';
        if (days < 365) return Math.round(days / 30) + ' Mon';
        return (days / 365).toFixed(1) + ' J';
    }
    _avgRetention() {
        const cards = this._allCards().map(x => x.c).filter(c => c.stability && c.last);
        if (!cards.length) return 1;
        const now = Date.now();
        const sum = cards.reduce((a, c) => {
            const elapsed = (now - new Date(c.last).getTime()) / 86400000;
            return a + Math.exp(-elapsed / Math.max(0.1, c.stability));
        }, 0);
        return sum / cards.length;
    }
    _curveHtml() {
        const cards = this._allCards().map(x => x.c).filter(c => c.stability && c.last);
        const W = 600, H = 160, pad = 28;
        const days = 30;
        const pts = [];
        for (let d = 0; d <= days; d++) {
            let r;
            if (!cards.length) { r = Math.exp(-d / 4); }
            else {
                r = cards.reduce((a, c) => {
                    const elapsed = (Date.now() - new Date(c.last).getTime()) / 86400000 + d;
                    return a + Math.exp(-elapsed / Math.max(0.1, c.stability));
                }, 0) / cards.length;
            }
            const x = pad + (d / days) * (W - 2 * pad);
            const y = pad + (1 - r) * (H - 2 * pad);
            pts.push([x, y]);
        }
        const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        const fill = `M${pad} ${H - pad} ` + pts.map(p => 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + ` L${W - pad} ${H - pad} Z`;
        return `
        <div class="ss-panel">
            <h3 style="margin:0 0 6px"><i class="fas fa-chart-line"></i> Deine Vergessenskurve (Prognose 30 Tage)</h3>
            <p class="sub" style="margin:0 0 10px">Ohne Wiederholung sinkt die Behaltenswahrscheinlichkeit. Der Scheduler plant Reviews, bevor du vergisst.</p>
            <div class="gm-curve">
                <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
                    <line class="axis" x1="${pad}" y1="${pad}" x2="${pad}" y2="${H - pad}"/>
                    <line class="axis" x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}"/>
                    <path class="curve-fill" d="${fill}"/>
                    <path class="curve-line" d="${line}"/>
                </svg>
            </div>
        </div>`;
    }

    _srsNewDeck() {
        const name = (prompt('Name des neuen Stapels:') || '').trim();
        if (!name) return;
        this.state.srs.decks.push({ id: 'd' + Date.now(), name, createdAt: new Date().toISOString(), cards: [] });
        this._save();
        this.render();
    }
    _srsAddCard(deckId) {
        const deck = this.state.srs.decks.find(d => d.id === deckId);
        if (!deck) return;
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:#a78bfa">
            <h2><i class="fas fa-plus-circle"></i> Karte zu „${this._esc(deck.name)}"</h2>
            <div class="ss-field"><label>Vorderseite (Frage)</label><textarea class="ss-textarea" id="gs-cf" placeholder="z. B. Hauptstadt von Italien"></textarea></div>
            <div class="ss-field"><label>Rückseite (Antwort)</label><textarea class="ss-textarea" id="gs-cb" placeholder="z. B. Rom"></textarea></div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button class="ss-btn ss-btn-primary" id="gs-card-save"><i class="fas fa-check"></i> Speichern & weitere</button>
                <button class="ss-btn ss-btn-ghost" id="gs-card-done">Fertig</button>
            </div>
            <div id="gs-card-list" style="margin-top:18px"></div>
        </div>`;
        const renderList = () => {
            const el = main.querySelector('#gs-card-list');
            el.innerHTML = deck.cards.length ? `<p class="sub">${deck.cards.length} Karten im Stapel. Zuletzt:</p>` + deck.cards.slice(-5).reverse().map(c => `<div class="gm-recall-row"><span class="truth" style="flex:1">${this._esc(c.front)} → ${this._esc(c.back)}</span></div>`).join('') : '';
        };
        renderList();
        const save = () => {
            const f = main.querySelector('#gs-cf').value.trim();
            const b = main.querySelector('#gs-cb').value.trim();
            if (!f || !b) { this._toast('Bitte beide Seiten ausfüllen', 'error'); return; }
            deck.cards.push({ id: deckId + '_' + Date.now(), front: f, back: b, due: new Date().toISOString(), stability: 0, difficulty: 5, reps: 0, lapses: 0, last: null, state: 'new' });
            this._save();
            main.querySelector('#gs-cf').value = ''; main.querySelector('#gs-cb').value = ''; main.querySelector('#gs-cf').focus();
            renderList();
        };
        main.querySelector('#gs-card-save').addEventListener('click', save);
        main.querySelector('#gs-card-done').addEventListener('click', () => this.go('srs'));
    }

    /* ===================== JOURNAL ===================== */
    _renderJournal() {
        const log = this.state.log || [];
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Logbuch</div>
            <h1>Dein Trainings-Tagebuch</h1>
            <p>${log.length} Einträge. Jede Session ist ein Schritt auf deinem lebenslangen Weg.</p>
        </div>
        <div id="gs-journal-list">
            ${log.length === 0
                ? `<div class="ss-empty"><i class="fas fa-feather"></i>Noch keine Einträge. Beginne im Dojo mit einer Übung.</div>`
                : log.map(e => {
                    const d = GS_DISC_MAP[e.disc] || GS_DISCIPLINES[0];
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
    _afterJournal() { /* nichts */ }

    /* ===================== ARENA ===================== */
    _renderArena() {
        const total = this._totalXP();
        const loggedIn = this._isLoggedIn();
        const head = `
        <div class="ss-hero">
            <div class="ss-kicker">Arena · anonym</div>
            <h1>Wer hat das stärkste Gedächtnis?</h1>
            <p>Miss dich anonym mit allen Übenden. Verglichen wird deine <strong>Gedächtniskraft</strong> – die Summe aus Training und bestandenen Prüfungen. Niemand sieht, wer du bist; nur dein Pseudonym.</p>
        </div>`;
        const aliasPanel = `
        <div class="ss-panel">
            <h3><i class="fas fa-user-secret"></i> Dein Pseudonym</h3>
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
                <div style="font-size:22px;font-weight:800">${this._esc(this.state.alias)}</div>
                <button class="ss-btn ss-btn-ghost" id="gs-alias-reroll" style="padding:8px 14px;font-size:13px"><i class="fas fa-dice"></i> Neu würfeln</button>
            </div>
            <div style="margin-top:14px;display:flex;gap:20px;flex-wrap:wrap">
                <div><div style="font-size:24px;font-weight:800">${total.toLocaleString('de-DE')}</div><div style="color:var(--ss-text-dim);font-size:12px">Deine Gedächtniskraft</div></div>
                <div><div style="font-size:24px;font-weight:800;color:#e0b04a">${this._overallTitle()}</div><div style="color:var(--ss-text-dim);font-size:12px">Titel (Grad ${this._overallGrade()})</div></div>
            </div>
            ${loggedIn
                ? `<button class="ss-btn ss-btn-gold ss-btn-block" id="gs-arena-submit" style="margin-top:18px"><i class="fas fa-trophy"></i> In die Arena eintragen / aktualisieren</button>`
                : `<div style="margin-top:18px;background:rgba(99,102,241,.12);border:1px solid var(--ss-line);padding:14px 16px;border-radius:12px;color:var(--ss-text-dim);font-size:14px">
                     <i class="fas fa-lock"></i> Melde dich an, um anzutreten – so bleibt dein Rang geräteübergreifend erhalten.
                     <button class="ss-btn ss-btn-primary" id="gs-arena-login" style="margin-top:10px;padding:9px 16px;font-size:14px">Anmelden</button>
                   </div>`}
        </div>`;
        const board = `
        <div class="ss-panel">
            <h3><i class="fas fa-ranking-star"></i> Rangliste der stärksten Gedächtnisse</h3>
            <div id="gs-lb-list"><div class="ss-empty"><i class="fas fa-circle-notch fa-spin"></i>Lade Rangliste …</div></div>
        </div>`;
        return head + aliasPanel + board;
    }
    _afterArena() {
        const reroll = document.getElementById('gs-alias-reroll');
        if (reroll) reroll.addEventListener('click', () => { this.state.alias = this._generateAlias(); this._save(); this.render(); });
        const login = document.getElementById('gs-arena-login');
        if (login) login.addEventListener('click', () => this._openLogin());
        const submit = document.getElementById('gs-arena-submit');
        if (submit) submit.addEventListener('click', async () => {
            submit.disabled = true;
            submit.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Wird eingetragen …';
            await this._lbSubmit();
            await this._lbRefresh();
            this._toast('In der Arena eingetragen!', 'gold');
            this.render();
        });
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
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ game: GS_METHOD, userId: id, name: this.state.alias, title: this._overallTitle(), score: this._totalXP() })
            });
        } catch (e) { console.warn('Arena-Submit fehlgeschlagen:', e); }
    }
    async _lbRefresh() {
        const listEl = document.getElementById('gs-lb-list');
        if (!listEl) return;
        try {
            const res = await fetch(this._lbBase() + '?game=' + GS_METHOD + '&limit=25');
            const data = await res.json();
            this.leaderboard = (data && data.highscores) || [];
        } catch (e) { this.leaderboard = []; console.warn('Arena-Load fehlgeschlagen:', e); }
        const board = this.leaderboard || [];
        if (board.length === 0) { listEl.innerHTML = `<div class="ss-empty"><i class="fas fa-trophy"></i>Noch keine Einträge. Sei die / der Erste!</div>`; return; }
        const myAlias = this.state.alias;
        const medals = ['🥇', '🥈', '🥉'];
        listEl.innerHTML = `<div class="ss-lb">${board.map((e, i) => {
            const mine = e.name === myAlias;
            const rank = i < 3 ? medals[i] : (i + 1);
            return `<div class="ss-lb-row ${mine ? 'me' : ''}"><div class="ss-lb-rank">${rank}</div><div class="ss-lb-name">${this._esc(e.name)}${e.title ? `<span class="ss-lb-title">${this._esc(e.title)}</span>` : ''}</div><div class="ss-lb-score">${Number(e.score).toLocaleString('de-DE')}</div></div>`;
        }).join('')}</div>`;
    }

    /* ===================== HELPERS ===================== */
    _stopTimer() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; }
        try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
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
    window.gedaechtnisschule = new GedaechtnisSchule();
    window.gedaechtnisschule.init();
});
