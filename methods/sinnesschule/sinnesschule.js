/* =========================================================
   Die Schule der Sinne
   Ein lebenslanger Meisterschaftsweg zur Schulung der Sinne.
   Persistenz: window.workflowAPI (DynamoDB, geräteübergreifend)
   mit automatischem localStorage-Fallback.
   ========================================================= */

const SS_METHOD = 'sinnesschule';

/* ---------------- Graduierungen (Kyū → Dan) ---------------- */
const SS_GRADES = [
    'Erwachen', 'Aufmerksamkeit', 'Unterscheidung', 'Schärfe', 'Feinheit',
    'Tiefe', 'Präsenz', 'Klarheit', 'Meisterschaft', 'Vollendung'
];
// XP nötig, um die jeweilige Stufe zu VERLASSEN (Index = aktuelle Stufe 1..9)
const SS_GRADE_XP = [0, 150, 350, 650, 1050, 1550, 2150, 2850, 3650, 4600];

/* ---------------- Die sechs Disziplinen ---------------- */
const SS_SENSES = [
    { id: 'sehen',     name: 'Sehen',     icon: '👁️', accent: '#60a5fa', soft: 'rgba(96,165,250,.16)', glow: 'rgba(96,165,250,.18)' },
    { id: 'hoeren',    name: 'Hören',     icon: '👂', accent: '#a78bfa', soft: 'rgba(167,139,250,.16)', glow: 'rgba(167,139,250,.18)' },
    { id: 'riechen',   name: 'Riechen',   icon: '👃', accent: '#f472b6', soft: 'rgba(244,114,182,.16)', glow: 'rgba(244,114,182,.18)' },
    { id: 'schmecken', name: 'Schmecken', icon: '👅', accent: '#fb923c', soft: 'rgba(251,146,60,.16)',  glow: 'rgba(251,146,60,.18)' },
    { id: 'tasten',    name: 'Tasten',    icon: '🖐️', accent: '#34d399', soft: 'rgba(52,211,153,.16)',  glow: 'rgba(52,211,153,.18)' },
    { id: 'innensinn', name: 'Innensinn', icon: '🌀', accent: '#e0b04a', soft: 'rgba(224,176,74,.16)',  glow: 'rgba(224,176,74,.18)' }
];
const SS_SENSE_MAP = Object.fromEntries(SS_SENSES.map(s => [s.id, s]));

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
    ]
};

/* ---------------- Prüfungen ---------------- */
const SS_EXAMS = {
    sehen:     { type: 'color', title: 'Prüfung des Sehens', protocol: 'Finde in jeder Runde das Feld, dessen Farbe minimal abweicht. Es wird mit jeder Runde feiner.' },
    hoeren:    { type: 'count', target: 8, unit: 'Klangschichten', title: 'Prüfung des Hörens',
                 protocol: 'Schließe 90 Sekunden die Augen und zähle so viele klar unterscheidbare Klangschichten wie möglich (nah, mittel, fern). Trage danach deine ehrliche Zahl ein.' },
    riechen:   { type: 'count', target: 6, unit: 'Düfte', title: 'Prüfung des Riechens',
                 protocol: 'Lass dir blind mehrere Düfte reichen (Gewürze, Kräuter, Obst). Identifiziere so viele wie möglich und trage die Zahl der korrekt erkannten ein.' },
    schmecken: { type: 'count', target: 5, unit: 'Aromen', title: 'Prüfung des Schmeckens',
                 protocol: 'Koste blind eine Speise und benenne ihre einzelnen Aromen/Komponenten. Trage ein, wie viele du klar unterscheiden konntest.' },
    tasten:    { type: 'count', target: 8, unit: 'Materialien', title: 'Prüfung des Tastens',
                 protocol: 'Lass dir blind verschiedene Materialien geben. Trage ein, wie viele du allein durch Tasten korrekt erkannt hast.' },
    innensinn: { type: 'scale', title: 'Prüfung des Innensinns',
                 protocol: 'Führe einen 3-minütigen Körperscan durch. Bewerte danach ehrlich, wie klar und vollständig du deinen Körper von innen wahrnehmen konntest.' }
};

/* ---------------- Philosophie ---------------- */
const SS_QUOTES = [
    { t: 'Der Anfänger sieht viele Möglichkeiten, der Meister wenige – aber er sieht sie ganz.', w: 'Zen-Geist' },
    { t: 'Wer einen Sinn schärft, schärft alle.', w: 'Shokunin-Weg' },
    { t: 'Nicht die Wiederholung macht den Meister, sondern die Aufmerksamkeit in der Wiederholung.', w: 'Kaizen' },
    { t: 'Die Welt ist nicht arm an Wundern, sondern an Aufmerksamkeit.', w: 'Alte Weisheit' },
    { t: 'Übe, als hättest du alle Zeit – und als wäre dieser Atemzug der einzige.', w: 'Die Schule der Sinne' }
];

/* =========================================================
   App
   ========================================================= */
class Sinnesschule {
    constructor() {
        this.view = 'dashboard';
        this.activeSense = 'sehen';
        this.timer = null;
        this.exam = null;
        this.state = this._defaultState();
    }

    _defaultState() {
        const senses = {};
        SS_SENSES.forEach(s => {
            senses[s.id] = { xp: 0, grade: 1, sessions: 0, examsPassed: {}, examScores: [] };
        });
        return {
            startedAt: new Date().toISOString().slice(0, 10),
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
        // 1. Sofort lokal
        try {
            const local = JSON.parse(localStorage.getItem('ss_state'));
            if (local && local.startedAt) this.state = this._merge(this._defaultState(), local);
        } catch (e) { /* ignore */ }

        // 2. Cloud (überschreibt, wenn vorhanden & neuer)
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

        this._refreshStreak();
    }

    async _save() {
        localStorage.setItem('ss_state', JSON.stringify(this.state));
        let synced = false;
        try {
            if (window.workflowAPI) {
                const loggedIn = window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn();
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

    /* ---------------- Streak ---------------- */
    _refreshStreak() {
        const today = this._today();
        const yest = this._dayOffset(-1);
        if (this.state.lastPracticeDate && this.state.lastPracticeDate < yest) {
            // Streak ruht (kein harter Reset – sanfter Weg über die Jahre)
        }
    }

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

    /* ---------------- Graduierung ---------------- */
    _addXP(senseId, xp) {
        const s = this.state.senses[senseId];
        s.xp += xp;
        return this._checkAdvance(senseId);
    }

    _checkAdvance(senseId) {
        const s = this.state.senses[senseId];
        if (s.grade >= 10) return null;
        const need = SS_GRADE_XP[s.grade];
        const examOk = (s.examsPassed[s.grade] || 0) >= 70;
        if (s.xp >= need && examOk) {
            s.grade++;
            return s.grade;
        }
        return null;
    }

    _canAdvanceButNeedsExam(senseId) {
        const s = this.state.senses[senseId];
        if (s.grade >= 10) return false;
        return s.xp >= SS_GRADE_XP[s.grade] && (s.examsPassed[s.grade] || 0) < 70;
    }

    _gradeProgress(senseId) {
        const s = this.state.senses[senseId];
        if (s.grade >= 10) return 100;
        const prev = SS_GRADE_XP[s.grade - 1] || 0;
        const next = SS_GRADE_XP[s.grade];
        return Math.min(100, Math.round(((s.xp - prev) / (next - prev)) * 100));
    }

    _masteryPercent(senseId) {
        const s = this.state.senses[senseId];
        const maxXP = SS_GRADE_XP[9];
        return Math.min(100, Math.round((s.xp / maxXP) * 100));
    }

    _overallMastery() {
        const sum = SS_SENSES.reduce((acc, s) => acc + this._masteryPercent(s.id), 0);
        return Math.round(sum / SS_SENSES.length);
    }

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
            <p>Sechs Disziplinen, zehn Graduierungen, ein Leben Zeit. Wähle täglich einen Sinn, übe ihn bewusst und steige durch bestandene Prüfungen vom <em>Erwachen</em> bis zur <em>Vollendung</em>.</p>
        </div>

        <div class="ss-stats">
            <div class="ss-stat"><div class="ss-stat-value">${this.state.streak > 0 ? '<span class="flame">🔥</span> ' : ''}${this.state.streak || 0}</div><div class="ss-stat-label">Tage in Folge</div></div>
            <div class="ss-stat"><div class="ss-stat-value">${days}</div><div class="ss-stat-label">Übungstage</div></div>
            <div class="ss-stat"><div class="ss-stat-value">${hours}h ${mins}m</div><div class="ss-stat-label">Gesamte Praxis</div></div>
            <div class="ss-stat"><div class="ss-stat-value">${this._overallMastery()}%</div><div class="ss-stat-label">Meisterschaft</div></div>
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
        const prog = this._gradeProgress(s.id);
        const needsExam = this._canAdvanceButNeedsExam(s.id);
        const pips = Array.from({ length: 10 }, (_, i) => `<span class="ss-pip ${i < st.grade ? 'filled' : ''}"></span>`).join('');
        return `
        <div class="ss-sense-card" data-sense="${s.id}" style="--accent:${s.accent};--accent-soft:${s.soft};--accent-glow:${s.glow}">
            <div class="ss-sense-head">
                <div class="ss-sense-icon">${s.icon}</div>
                <div>
                    <div class="ss-sense-name">${s.name}</div>
                    <div class="ss-sense-grade-name">${st.grade}. ${SS_GRADES[st.grade - 1]}</div>
                </div>
                <div class="ss-sense-rank">${st.grade}/10</div>
            </div>
            <div class="ss-progress-track"><div class="ss-progress-fill" style="width:${prog}%"></div></div>
            <div class="ss-sense-meta">
                <span>${st.xp} XP</span>
                <span>${needsExam ? '⚑ Prüfung offen' : (st.grade >= 10 ? 'Vollendet' : `noch ${Math.max(0, SS_GRADE_XP[st.grade] - st.xp)} XP`)}</span>
            </div>
            <div class="ss-pips">${pips}</div>
        </div>`;
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
        const st = this.state.senses[this.activeSense];
        const exs = SS_EXERCISES[this.activeSense] || [];
        const needsExam = this._canAdvanceButNeedsExam(this.activeSense);

        return `
        <div class="ss-sense-picker">
            ${SS_SENSES.map(x => `<button class="ss-chip ${x.id === this.activeSense ? 'active' : ''}" data-sense="${x.id}">${x.icon} ${x.name}</button>`).join('')}
        </div>

        <div class="ss-panel" style="--accent:${s.accent};--accent-soft:${s.soft}">
            <h2>${s.icon} ${s.name} — ${st.grade}. ${SS_GRADES[st.grade - 1]}</h2>
            <p class="sub">Wähle eine Übung und führe sie bewusst aus. Jede abgeschlossene Übung bringt XP und einen Logbuch-Eintrag.</p>
            ${needsExam ? `<div style="background:rgba(224,176,74,.12);border:1px solid rgba(224,176,74,.35);color:#e0b04a;padding:12px 16px;border-radius:12px;margin-bottom:16px;font-size:14px"><i class="fas fa-medal"></i> Du hast genug XP für die nächste Stufe – lege die <strong>Prüfung des ${s.name}s</strong> ab, um aufzusteigen. <button class="ss-btn ss-btn-gold" style="margin-left:10px;padding:6px 14px;font-size:13px" id="ss-goto-exam">Zur Prüfung</button></div>` : ''}
            <div class="ss-exercise-list">
                ${exs.map(ex => `
                    <div class="ss-exercise-item" data-ex="${ex.id}">
                        <div class="ic">${ex.icon}</div>
                        <div class="body">
                            <div class="title">${ex.title}</div>
                            <div class="desc">${ex.breath ? 'Geführte Atem-Übung' : ex.steps.length + ' Schritte'} · +${ex.xp} XP</div>
                        </div>
                        <div class="dur">${Math.round(ex.dur / 60)} Min</div>
                    </div>`).join('')}
            </div>
        </div>`;
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
        const main = document.getElementById('ss-main');
        const R = 110, C = 2 * Math.PI * R;

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
        const minutes = Math.max(1, Math.round(ex.dur / 60));
        this._registerPracticeDay(minutes);
        const newGrade = this._addXP(this.activeSense, ex.xp);
        this.state.senses[this.activeSense].sessions++;

        // Logbuch-Eintrag-Vorschlag
        this._save();
        this._chime();

        if (newGrade) {
            this._showLevelUp(this.activeSense, newGrade);
        } else {
            this._toast(`+${ex.xp} XP · ${SS_SENSE_MAP[this.activeSense].name}`, 'success');
        }
        // Reflexion anbieten
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
        if (!ov) {
            ov = document.createElement('div');
            ov.className = 'ss-levelup';
            document.body.appendChild(ov);
        }
        ov.innerHTML = `
        <div class="ss-levelup-card">
            <div class="seal">${s.icon}</div>
            <h2>Aufstieg!</h2>
            <p>${s.name} · ${grade}. Stufe<br><strong style="color:#e0b04a;font-size:18px">${SS_GRADES[grade - 1]}</strong></p>
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
            <h1>Zeige deine Schärfe</h1>
            <p>Jede Disziplin hat ihre Prüfung. Bestehe sie (≥ 70 Punkte), um – sobald du genug geübt hast – in die nächste Stufe aufzusteigen. Deine Ergebnisse werden über die Jahre festgehalten.</p>
        </div>
        <div class="ss-grid">
            ${SS_SENSES.map(s => {
                const st = this.state.senses[s.id];
                const best = st.examScores.length ? Math.max(...st.examScores.map(e => e.score)) : 0;
                const passedCurrent = (st.examsPassed[st.grade] || 0) >= 70;
                return `
                <div class="ss-sense-card" data-exam="${s.id}" style="--accent:${s.accent};--accent-soft:${s.soft};--accent-glow:${s.glow}">
                    <div class="ss-sense-head">
                        <div class="ss-sense-icon">${s.icon}</div>
                        <div>
                            <div class="ss-sense-name">${SS_EXAMS[s.id].title}</div>
                            <div class="ss-sense-grade-name">${st.examScores.length} Versuche · Best: ${best}</div>
                        </div>
                        <div class="ss-sense-rank">${passedCurrent ? '✓' : st.grade}</div>
                    </div>
                    <p class="ss-sense-meta" style="margin-top:8px">${st.grade >= 10 ? 'Stufe vollendet' : (passedCurrent ? 'Prüfung dieser Stufe bestanden' : 'Prüfung ablegen')}</p>
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
    }

    // --- Farb-Prüfung (interaktiv) ---
    _examColor(senseId) {
        const s = SS_SENSE_MAP[senseId];
        this.exam = { round: 0, total: 8, correct: 0 };
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${SS_EXAMS[senseId].title}</h2>
            <p class="sub">${SS_EXAMS[senseId].protocol}</p>
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
        const delta = Math.max(3, 22 - ex.round * 2.5); // wird feiner
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
                else { sw.style.outline = '3px solid #ef4444'; }
                ex.round++;
                setTimeout(() => this._renderColorRound(), 180);
            });
        });
    }

    // --- Zähl-Prüfung (Protokoll + Eingabe) ---
    _examCount(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const exam = SS_EXAMS[senseId];
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${exam.title}</h2>
            <p class="sub">${exam.protocol}</p>
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

    // --- Skala-Prüfung (Selbstbewertung) ---
    _examScale(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const exam = SS_EXAMS[senseId];
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${exam.title}</h2>
            <p class="sub">${exam.protocol}</p>
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
        st.examScores.push({ date: this._today(), grade: st.grade, score });
        const passed = score >= 70;
        if (passed) {
            const prevBest = st.examsPassed[st.grade] || 0;
            if (score > prevBest) st.examsPassed[st.grade] = score;
        }
        // Prüfungen geben auch XP
        const xpGain = Math.round(score / 2);
        const newGrade = this._addXP(senseId, xpGain);
        this._save();
        this._chime(passed);

        const deg = Math.round(score * 3.6);
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="text-align:center;--accent:${s.accent}">
            <h2>${s.icon} Prüfungsergebnis</h2>
            <div class="ss-score-circle" style="--deg:${deg}deg"><span class="val">${score}</span></div>
            <p class="sub" style="text-align:center">${passed
                ? '<strong style="color:#34d399">Bestanden!</strong> +' + xpGain + ' XP'
                : 'Noch nicht bestanden (≥ 70 nötig). Übe weiter – jeder Versuch zählt und wird festgehalten.'}</p>
            ${newGrade ? `<p style="color:#e0b04a;font-weight:600">Aufstieg in Stufe ${newGrade}: ${SS_GRADES[newGrade - 1]}!</p>` : ''}
            <div class="ss-player-controls">
                <button class="ss-btn ss-btn-ghost" id="ss-exam-retry">Nochmal</button>
                <button class="ss-btn ss-btn-primary" id="ss-exam-back">Zur Übersicht</button>
            </div>
        </div>`;
        main.querySelector('#ss-exam-retry').addEventListener('click', () => this._startExam(senseId));
        main.querySelector('#ss-exam-back').addEventListener('click', () => this.go('dashboard'));
        if (newGrade) setTimeout(() => this._showLevelUp(senseId, newGrade), 400);
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
                // Repräsentativer Tag pro Woche (vereinfachte Jahres-Heatmap)
                const date = new Date(y, 0, 1 + w * 7);
                const ds = date.toISOString().slice(0, 10);
                // markiere Woche, wenn an irgendeinem Tag dieser Woche geübt wurde
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
            const st = this.state.senses[s.id];
            const pct = this._masteryPercent(s.id);
            return `
            <div class="ss-mastery-row">
                <div class="name">${s.icon} ${s.name}</div>
                <div class="bar"><span style="width:${pct}%"></span></div>
                <div class="rank">${st.grade}. ${SS_GRADES[st.grade - 1]}</div>
            </div>`;
        }).join('');

        const days = (this.state.practiceDays || []).length;
        const yearsActive = years.length;

        return `
        <div class="ss-hero">
            <div class="ss-kicker">Deine Reise</div>
            <h1>Ein Leben der Wahrnehmung</h1>
            <p>Begonnen ${this._fmtDate(this.state.startedAt)} · ${days} Übungstage über ${yearsActive} ${yearsActive === 1 ? 'Jahr' : 'Jahre'}. Der Weg ist nicht eilig – er ist stetig.</p>
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
        const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
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
