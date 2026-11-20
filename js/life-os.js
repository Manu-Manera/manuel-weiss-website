/**
 * Life OS – „Manuel AG“
 * Leben als Unternehmen: 6 Divisionen, Health-Score, Coaching-Notes.
 * Persistenz: workflowAPI → DynamoDB WF#life-os (Ergebnisse), Fallback localStorage.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'life_os_doc_v1';
    var WF_ID = 'life-os';

    var DIVISIONS = [
        {
            id: 'career',
            title: 'Karriere / Pivot',
            icon: 'fa-briefcase',
            accent: '#0ea5e9',
            href: 'applications/index.html'
        },
        {
            id: 'impact',
            title: 'Wirkung / Angebot',
            icon: 'fa-bullhorn',
            accent: '#8b5cf6',
            href: 'index.html'
        },
        {
            id: 'finance',
            title: 'Finanzen',
            icon: 'fa-wallet',
            accent: '#10b981',
            href: 'admin.html#finanzen'
        },
        {
            id: 'body',
            title: 'Körper / Energie',
            icon: 'fa-heart-pulse',
            accent: '#34d399',
            href: 'methods/koerperschule/index-koerperschule.html'
        },
        {
            id: 'psyche',
            title: 'Psyche / Beziehungen',
            icon: 'fa-brain',
            accent: '#f59e0b',
            href: 'persoenlichkeitsentwicklung-uebersicht.html'
        },
        {
            id: 'learning',
            title: 'Lernen / Handwerk',
            icon: 'fa-graduation-cap',
            accent: '#6366f1',
            href: 'fachliche-entwicklung.html'
        }
    ];

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function clampScore(n) {
        n = Number(n);
        if (isNaN(n)) return 0;
        return Math.max(0, Math.min(100, Math.round(n)));
    }

    function statusFromScore(score) {
        if (score >= 75) return 'stark';
        if (score >= 50) return 'im Aufbau';
        if (score >= 30) return 'kritisch';
        return 'Notfall';
    }

    function statusClass(score) {
        if (score >= 75) return 'ok';
        if (score >= 50) return 'mid';
        if (score >= 30) return 'warn';
        return 'bad';
    }

    /** Intake-Seed aus Profil, CV und Coaching-Kontext (Stand Nov 2026) */
    function defaultDoc() {
        var now = new Date().toISOString();
        return {
            version: 1,
            companyName: 'Manuel AG',
            tagline: 'HR-Digitalisierung · Implementation · Pivot Solutions Engineer',
            vision: 'Klar positioniert, zahlungsfähig und energiegeladen: Kernkompetenz UKG/HRSD und Implementation ausspielen, parallel den realistischen Schritt zu Solutions Engineer bis Ende 2027 bauen – ohne Selbsttäuschung und ohne Burnout.',
            northStar: 'Eine Rolle, die fachliche Tiefe (HR-Prozesse + Tech) mit Beratung verbindet – und ein Leben, das das aushält.',
            intake: {
                updatedAt: now,
                summary: 'Implementation Specialist (Valkeen, Tempus Resource) nach 3 Jahren UKG HRSD (HR Campus). Track Kern: UKG/HRSD, HR-Prozesse, HRIS. Track Entwicklung: Solutions Engineer Stufe 1. Region: CH + Remote. Stimme: direkt, warm, schweizerisch.',
                facts: [
                    'Seit 03/2026: Implementation Specialist, Valkeen (Tempus Resource, REST-API, SSO/Entra ID, Migration)',
                    '05/2022–06/2025: HXM Consultant, HR Campus – UKG HR Service Delivery E2E',
                    'BPMN 2.0 / ADONIS (BOC), Studium WiWi mit HR-Schwerpunkt',
                    'Website & HR-Frameworks live auf manuel-weiss.ch',
                    'Bewerbungsmaschine + täglicher Stellencheck vorhanden'
                ],
                tensions: [
                    'Doppelstrategie Kern vs. Pivot braucht klare Quote und Realismus-Check',
                    'Finanzen und Energie sind Steuerungsgrössen, nicht Nebensache',
                    'PE-Methoden und Profile-Tabs existieren, waren aber nicht als ein Betriebssystem verdrahtet'
                ]
            },
            boardReview: {
                lastAt: now,
                nextAt: null,
                cadence: 'monthly',
                notes: 'Life OS gegründet. Nächstes Board: Scores ehrlich kalibrieren und eine Division als Fokus-Woche wählen.'
            },
            divisions: {
                career: {
                    score: 58,
                    goal: 'Kern-Rollen (UKG/HRSD, HR-Prozesse) aktiv bewerben; max. 1/3 Pakete Track Entwicklung (Solutions Engineer) mit Realismus-Check.',
                    kpi: 'Aktive Bewerbungen + Gespräche / Monat',
                    nextStep: 'Stellencheck laufen lassen, Shortlist selbst auswählen, 2–3 starke Pakete.',
                    notes: 'Nicht Sales-/Dev-Rollen. Warum-Wechsel Valkeen nur im Gespräch, nie im Anschreiben.',
                    history: [{ at: now, score: 58, note: 'Intake-Baseline' }]
                },
                impact: {
                    score: 52,
                    goal: 'Positionierung als HR-Digitalisierungs- und Implementation-Experte schärfen; Website als Vertrauensanker.',
                    kpi: 'Klare Angebotshierarchie auf der Startseite + messbare Leads/Anfragen',
                    nextStep: 'Hero/Über-mich und Frameworks gegen aktuelle Zielrollen abgleichen.',
                    notes: 'Öffentliche Marke und private Bewerbungsstimme müssen zusammenpassen.',
                    history: [{ at: now, score: 52, note: 'Intake-Baseline' }]
                },
                finance: {
                    score: 42,
                    goal: 'Cashflow und Schuldenabbau steuern wie ein Unternehmen – Admin-Finanzen als Single Source.',
                    kpi: 'Monatscashflow + Sanierungsplan-Fortschritt',
                    nextStep: 'Finanzen-Cockpit aktualisieren und eine konkrete Wochen-Massnahme setzen.',
                    notes: 'Keine Scham-Narrative – Zahlen und nächster Schritt.',
                    history: [{ at: now, score: 42, note: 'Intake-Baseline' }]
                },
                body: {
                    score: 38,
                    goal: 'Stabile Energie: Bewegung, Ernährung, Schlaf als Produktionsfaktoren.',
                    kpi: 'Tage/Woche mit ≥2 Daily-Brain-Ritualen (Körper/Sinne/Gedächtnis/Stimme)',
                    nextStep: 'Heute eine Körperschule- oder Micro-Move-Einheit abhaken.',
                    notes: 'Burnout-Prävention ist Karriere-Strategie.',
                    history: [{ at: now, score: 38, note: 'Intake-Baseline' }]
                },
                psyche: {
                    score: 48,
                    goal: 'Werte, Stress und Beziehungen bewusst führen – nicht nur „funktionieren“.',
                    kpi: '1 Reflexion/Woche + 1 PE-Methode/Monat vertieft',
                    nextStep: 'Lebensrad oder Werte-Klärung aktualisieren; Journal-Notiz zur Wochenenergie.',
                    notes: 'Systemisch: Karriere-Druck und Selbstwert nicht vermischen.',
                    history: [{ at: now, score: 48, note: 'Intake-Baseline' }]
                },
                learning: {
                    score: 55,
                    goal: 'Handwerk für Solutions-Engineer-Pfad belegbar ausbauen (laut karrierepfad.md, ohne Überversprechen).',
                    kpi: 'Lernblöcke/Woche + dokumentierte Belege (Portfolio/QRG)',
                    nextStep: 'Einen Skill aus dem aktuellen Datum-Stand im Karrierepfad 90 Min vertiefen.',
                    notes: 'Nie Zertifikate oder Architect-Titel behaupten, die nicht erreicht sind.',
                    history: [{ at: now, score: 55, note: 'Intake-Baseline' }]
                }
            },
            coachingNotes: [
                {
                    id: 'cn-intake-1',
                    at: now,
                    author: 'Coach',
                    text: 'Intake abgeschlossen. Betrieb gegründet. Fokus nicht auf Perfektion der Scores, sondern auf eine Division pro Woche und ehrliches Board-Review.'
                }
            ],
            weeklyFocus: 'career',
            updatedAt: now
        };
    }

    function mergeDoc(base, incoming) {
        if (!incoming || typeof incoming !== 'object') return base;
        var out = Object.assign({}, base, incoming);
        out.divisions = Object.assign({}, base.divisions, incoming.divisions || {});
        DIVISIONS.forEach(function (meta) {
            var id = meta.id;
            out.divisions[id] = Object.assign({}, base.divisions[id] || {}, (incoming.divisions && incoming.divisions[id]) || {});
            out.divisions[id].score = clampScore(out.divisions[id].score);
            if (!Array.isArray(out.divisions[id].history)) out.divisions[id].history = base.divisions[id].history || [];
        });
        out.boardReview = Object.assign({}, base.boardReview || {}, incoming.boardReview || {});
        out.intake = Object.assign({}, base.intake || {}, incoming.intake || {});
        if (!Array.isArray(out.coachingNotes)) out.coachingNotes = base.coachingNotes || [];
        return out;
    }

    function healthScore(doc) {
        var sum = 0;
        var n = 0;
        DIVISIONS.forEach(function (meta) {
            var d = doc.divisions && doc.divisions[meta.id];
            if (d) {
                sum += clampScore(d.score);
                n++;
            }
        });
        return n ? Math.round(sum / n) : 0;
    }

    /* ---------------- Live-Signale aus echten Daten ---------------- */

    function udBase() {
        try {
            if (typeof window.getApiUrl === 'function') {
                var u = window.getApiUrl('USER_DATA');
                if (u) return u;
            }
        } catch (e) { /* ignore */ }
        if (window.AWS_APP_CONFIG && window.AWS_APP_CONFIG.API_BASE) {
            return window.AWS_APP_CONFIG.API_BASE.replace(/\/$/, '') + '/user-data';
        }
        return 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/user-data';
    }

    function authToken() {
        try {
            var s = JSON.parse(localStorage.getItem('aws_auth_session') || 'null');
            if (s) return s.idToken || s.IdToken || s.id_token || null;
        } catch (e) { /* ignore */ }
        return null;
    }

    async function getJSON(path) {
        var t = authToken();
        if (!t) throw new Error('not logged in');
        var r = await fetch(udBase() + path, { headers: { Authorization: 'Bearer ' + t } });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }

    var SCHOOL_IDS = { sinnesschule: 1, gedaechtnisschule: 1, koerperschule: 1 };

    function schoolState(workflows, id) {
        var wrap = workflows[id] && workflows[id].results;
        if (!wrap) return null;
        return wrap.results || (wrap.startedAt ? wrap : null);
    }

    function computeSignals(workflows, all) {
        workflows = workflows || {};
        all = all || {};
        var pe = { started: 0, completed: 0 };
        var lastActive = null;
        Object.keys(workflows).forEach(function (k) {
            if (SCHOOL_IDS[k] || k === WF_ID) return;
            var w = workflows[k] || {};
            var started = !!w.results || (w.progress && w.progress.currentStep > 0) ||
                (w.steps && Object.keys(w.steps).length > 0);
            if (!started) return;
            pe.started++;
            if (w.progress && (w.progress.status === 'completed' || w.progress.completionPercentage >= 100)) pe.completed++;
            var ts = (w.results && w.results.updatedAt) || (w.progress && w.progress.updatedAt) || null;
            if (ts && (!lastActive || ts > lastActive)) lastActive = ts;
        });

        var apps = Array.isArray(all.applications) ? all.applications : [];
        var appOpen = apps.filter(function (a) {
            var s = String(a.status || a.phase || '').toLowerCase();
            return s && !/absage|abgesagt|abgelehnt|rejected|closed|geschlossen|zusage|accepted|angenommen|eingestellt|archiv/.test(s);
        }).length;

        var today = new Date().toISOString().slice(0, 10);
        function school(id, xpKey) {
            var st = schoolState(workflows, id);
            if (!st) return null;
            var xp = 0;
            var disc = st[xpKey] || st.senses || st.disc || {};
            Object.keys(disc).forEach(function (d) { xp += (disc[d] && disc[d].xp) || 0; });
            return { xp: xp, streak: st.streak || 0, today: st.lastPracticeDate === today };
        }
        var koer = school('koerperschule', 'disc');
        var senses = school('sinnesschule', 'senses');
        var mem = school('gedaechtnisschule', 'disc');

        var maxStreak = Math.max(
            (koer && koer.streak) || 0,
            (senses && senses.streak) || 0,
            (mem && mem.streak) || 0
        );

        return {
            pe: pe,
            apps: { total: apps.length, open: appOpen },
            body: koer,
            senses: senses,
            mind: mem,
            maxStreak: maxStreak,
            lastActive: lastActive
        };
    }

    function signalChip(id, sig) {
        if (!sig) return '';
        var txt = null;
        if (id === 'career' && sig.apps) {
            txt = sig.apps.open + ' aktive Bewerbung' + (sig.apps.open === 1 ? '' : 'en') + ' · ' + sig.apps.total + ' gesamt';
        } else if (id === 'psyche' && sig.pe) {
            txt = sig.pe.started + ' Methoden begonnen · ' + sig.pe.completed + ' abgeschlossen';
        } else if (id === 'body') {
            var parts = [];
            if (sig.body) parts.push((sig.body.today ? 'heute aktiv' : 'heute offen') + ' · 🔥 ' + sig.body.streak);
            if (!sig.body && sig.senses) parts.push('Sinne 🔥 ' + sig.senses.streak);
            txt = parts.length ? parts.join(' · ') : null;
        } else if (id === 'learning' && sig.mind) {
            txt = sig.mind.xp.toLocaleString('de-DE') + ' XP Gedächtnis · 🔥 ' + sig.mind.streak;
        } else if (id === 'finance') {
            txt = 'Cockpit im Admin';
        }
        if (!txt) return '';
        return '<p class="los-live"><i class="fas fa-signal"></i> ' + esc(txt) + '</p>';
    }

    function localLoad() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function localSave(doc) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
        } catch (e) { /* ignore */ }
    }

    function LifeOS() {
        this.doc = null;
        this.loading = false;
        this._saveTimer = null;
        this.signals = null;
    }

    LifeOS.prototype.loadSignals = async function (force) {
        if (this.signals && !force) return this.signals;
        try {
            var results = await Promise.all([
                getJSON('/workflows').catch(function () { return {}; }),
                getJSON('').catch(function () { return {}; })
            ]);
            this.signals = computeSignals(results[0], results[1]);
        } catch (e) {
            this.signals = null;
        }
        this.updateProfileHeaderStats();
        return this.signals;
    };

    /** Echte Zahlen in die Profil-Kopf-Statistiken (ersetzt Demo-Werte) */
    LifeOS.prototype.updateProfileHeaderStats = function () {
        var sig = this.signals;
        if (!sig) return;
        var set = function (id, v) {
            var el = document.getElementById(id);
            if (el) el.textContent = v;
        };
        set('completedMethods', String(sig.pe.completed));
        set('totalProgress', this.health() + '%');
        set('streakDays', String(sig.maxStreak));
    };

    LifeOS.prototype.meta = function () {
        return DIVISIONS.slice();
    };

    LifeOS.prototype.ensureDoc = function () {
        if (!this.doc) this.doc = defaultDoc();
        return this.doc;
    };

    LifeOS.prototype.load = async function (force) {
        if (this.doc && !force) return this.doc;
        this.loading = true;
        var base = defaultDoc();
        var cloud = null;
        try {
            if (window.workflowAPI && typeof window.workflowAPI.getWorkflowResults === 'function') {
                cloud = await window.workflowAPI.getWorkflowResults(WF_ID);
                if (cloud && cloud.results) cloud = cloud.results;
                if (cloud && cloud.methodId && cloud.results) cloud = cloud.results;
            }
        } catch (e) {
            console.warn('Life OS: Cloud-Laden fehlgeschlagen', e);
        }
        var local = localLoad();
        var hasCloudDoc = !!(cloud && cloud.divisions);
        var picked = hasCloudDoc ? cloud : (local || null);
        this.doc = mergeDoc(base, picked);
        // Noch kein Cloud-Dokument → Seed einmalig speichern (Sync)
        if (!hasCloudDoc) {
            try { await this.save(true); } catch (e) { /* ignore */ }
        }
        this.loading = false;
        window.dispatchEvent(new CustomEvent('life-os-updated', { detail: this.doc }));
        return this.doc;
    };

    LifeOS.prototype.save = async function (immediate) {
        var self = this;
        var run = async function () {
            var doc = self.ensureDoc();
            doc.updatedAt = new Date().toISOString();
            localSave(doc);
            try {
                if (window.workflowAPI && typeof window.workflowAPI.saveWorkflowResults === 'function') {
                    await window.workflowAPI.saveWorkflowResults(WF_ID, doc);
                    if (typeof window.workflowAPI.updateWorkflowProgress === 'function') {
                        var hs = healthScore(doc);
                        await window.workflowAPI.updateWorkflowProgress(WF_ID, Math.max(1, Math.round(hs / 20)), 5);
                    }
                }
            } catch (e) {
                console.warn('Life OS: Cloud-Speichern fehlgeschlagen', e);
            }
            window.dispatchEvent(new CustomEvent('life-os-updated', { detail: doc }));
        };
        if (immediate) return run();
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(function () { run(); }, 400);
    };

    LifeOS.prototype.setDivision = async function (id, patch) {
        var doc = this.ensureDoc();
        if (!doc.divisions[id]) doc.divisions[id] = {};
        var prev = clampScore(doc.divisions[id].score);
        Object.assign(doc.divisions[id], patch || {});
        doc.divisions[id].score = clampScore(doc.divisions[id].score);
        if (doc.divisions[id].score !== prev) {
            if (!Array.isArray(doc.divisions[id].history)) doc.divisions[id].history = [];
            doc.divisions[id].history.push({
                at: new Date().toISOString(),
                score: doc.divisions[id].score,
                note: (patch && patch.historyNote) || 'Score aktualisiert'
            });
            if (doc.divisions[id].history.length > 40) {
                doc.divisions[id].history = doc.divisions[id].history.slice(-40);
            }
        }
        await this.save(true);
        return doc;
    };

    LifeOS.prototype.addNote = async function (text, author) {
        var doc = this.ensureDoc();
        doc.coachingNotes = doc.coachingNotes || [];
        doc.coachingNotes.unshift({
            id: 'cn-' + Date.now().toString(36),
            at: new Date().toISOString(),
            author: author || 'Coach',
            text: String(text || '').trim()
        });
        if (doc.coachingNotes.length > 50) doc.coachingNotes = doc.coachingNotes.slice(0, 50);
        await this.save(true);
        return doc;
    };

    LifeOS.prototype.setWeeklyFocus = async function (id) {
        this.ensureDoc().weeklyFocus = id;
        await this.save(true);
    };

    LifeOS.prototype.health = function () {
        return healthScore(this.ensureDoc());
    };

    LifeOS.prototype.renderBoard = function (opts) {
        opts = opts || {};
        var doc = this.ensureDoc();
        var sig = this.signals;
        var hs = healthScore(doc);
        var focus = doc.weeklyFocus;
        var cards = DIVISIONS.map(function (meta) {
            var d = doc.divisions[meta.id] || {};
            var score = clampScore(d.score);
            var isFocus = focus === meta.id;
            return (
                '<a class="los-card' + (isFocus ? ' focus' : '') + '" href="' + esc(meta.href) + '" style="--los-accent:' + meta.accent + '">' +
                '<div class="los-card-top">' +
                '<span class="los-card-icon"><i class="fas ' + meta.icon + '"></i></span>' +
                '<span class="los-badge ' + statusClass(score) + '">' + esc(statusFromScore(score)) + '</span>' +
                '</div>' +
                '<h4>' + esc(meta.title) + (isFocus ? ' · Fokus' : '') + '</h4>' +
                '<div class="los-score-row">' +
                '<span class="los-score">' + score + '</span>' +
                '<div class="los-bar"><div class="los-bar-fill" style="width:' + score + '%"></div></div>' +
                '</div>' +
                signalChip(meta.id, sig) +
                '<p class="los-next"><strong>Nächster Schritt:</strong> ' + esc(d.nextStep || '–') + '</p>' +
                '</a>'
            );
        }).join('');

        var notes = (doc.coachingNotes || []).slice(0, opts.noteLimit || 2).map(function (n) {
            return '<div class="los-note"><span class="los-note-meta">' + esc(n.author || 'Coach') +
                (n.at ? ' · ' + new Date(n.at).toLocaleDateString('de-CH') : '') +
                '</span><p>' + esc(n.text) + '</p></div>';
        }).join('');

        return (
            '<section class="los-board" id="lifeOsBoard">' +
            '<div class="los-board-head">' +
            '<div>' +
            '<div class="los-kicker"><i class="fas fa-building"></i> Life OS · ' + esc(doc.companyName) + '</div>' +
            '<h2>' + esc(doc.tagline || 'Dein Leben als Unternehmen') + '</h2>' +
            '<p class="los-vision">' + esc(doc.northStar || doc.vision) + '</p>' +
            '</div>' +
            '<div class="los-health" title="Durchschnitt aller Divisionen">' +
            '<span class="los-health-num">' + hs + '</span>' +
            '<span class="los-health-lbl">Company Health</span>' +
            '<span class="los-health-status ' + statusClass(hs) + '">' + esc(statusFromScore(hs)) + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="los-grid">' + cards + '</div>' +
            (notes ? '<div class="los-notes">' + notes + '</div>' : '') +
            (opts.showLink !== false
                ? '<div class="los-actions">' +
                  '<button type="button" class="los-btn" data-los-goto="progress"><i class="fas fa-chart-line"></i> Fortschritt & Module</button>' +
                  '<a class="los-btn los-btn-ghost" href="admin.html#life-os"><i class="fas fa-sliders"></i> Steuerzentrale</a>' +
                  '</div>'
                : '') +
            '</section>'
        );
    };

    LifeOS.prototype.renderProgressPanel = function () {
        var doc = this.ensureDoc();
        var sig = this.signals;
        var hs = healthScore(doc);
        var rows = DIVISIONS.map(function (meta) {
            var d = doc.divisions[meta.id] || {};
            var score = clampScore(d.score);
            return (
                '<article class="los-prog-card" style="--los-accent:' + meta.accent + '">' +
                '<div class="los-prog-head">' +
                '<div class="los-prog-icon"><i class="fas ' + meta.icon + '"></i></div>' +
                '<div><h4>' + esc(meta.title) + '</h4><p class="los-prog-kpi">' + esc(d.kpi || '') + '</p></div>' +
                '<div class="los-prog-score ' + statusClass(score) + '">' + score + '</div>' +
                '</div>' +
                '<div class="los-bar"><div class="los-bar-fill" style="width:' + score + '%"></div></div>' +
                signalChip(meta.id, sig) +
                '<p><strong>Ziel:</strong> ' + esc(d.goal || '–') + '</p>' +
                '<p><strong>Nächster Schritt:</strong> ' + esc(d.nextStep || '–') + '</p>' +
                (d.notes ? '<p class="los-muted">' + esc(d.notes) + '</p>' : '') +
                '<a class="los-inline-link" href="' + esc(meta.href) + '">Zum Bereich <i class="fas fa-arrow-right"></i></a>' +
                '</article>'
            );
        }).join('');

        var intakeFacts = ((doc.intake && doc.intake.facts) || []).map(function (f) {
            return '<li>' + esc(f) + '</li>';
        }).join('');
        var tensions = ((doc.intake && doc.intake.tensions) || []).map(function (f) {
            return '<li>' + esc(f) + '</li>';
        }).join('');

        return (
            '<div class="los-progress-wrap">' +
            '<div class="los-progress-hero">' +
            '<div>' +
            '<h3><i class="fas fa-chart-line"></i> Life OS Fortschritt</h3>' +
            '<p>Sechs Divisionen, ein Health-Score – verbunden mit deinem Profil und den Workflows.</p>' +
            '</div>' +
            '<div class="los-health compact">' +
            '<span class="los-health-num">' + hs + '</span>' +
            '<span class="los-health-lbl">Health</span>' +
            '</div>' +
            '</div>' +
            '<div class="los-prog-grid">' + rows + '</div>' +
            '<div class="los-intake">' +
            '<h4><i class="fas fa-clipboard-check"></i> Intake · Ist-Bild</h4>' +
            '<p>' + esc((doc.intake && doc.intake.summary) || '') + '</p>' +
            (intakeFacts ? '<h5>Fakten</h5><ul>' + intakeFacts + '</ul>' : '') +
            (tensions ? '<h5>Spannungsfelder</h5><ul>' + tensions + '</ul>' : '') +
            '</div>' +
            '</div>'
        );
    };

    /* ---------------- Coach-Panel (Coach-Tab) ---------------- */

    LifeOS.prototype.renderCoachPanel = function () {
        var doc = this.ensureDoc();
        var self = this;
        var focusMeta = DIVISIONS.find(function (m) { return m.id === doc.weeklyFocus; });

        // Empfehlungen: schwächste Divisionen zuerst, Fokus immer oben
        var ranked = DIVISIONS.slice().sort(function (a, b) {
            if (a.id === doc.weeklyFocus) return -1;
            if (b.id === doc.weeklyFocus) return 1;
            return clampScore((doc.divisions[a.id] || {}).score) - clampScore((doc.divisions[b.id] || {}).score);
        }).slice(0, 3);

        var recs = ranked.map(function (m) {
            var d = doc.divisions[m.id] || {};
            return (
                '<a class="los-rec" href="' + esc(m.href) + '" style="--los-accent:' + m.accent + '">' +
                '<span class="los-rec-icon"><i class="fas ' + m.icon + '"></i></span>' +
                '<span class="los-rec-body">' +
                '<span class="los-rec-title">' + esc(m.title) + (m.id === doc.weeklyFocus ? ' · Fokus-Woche' : '') + '</span>' +
                '<span class="los-rec-task">' + esc(d.nextStep || d.goal || '') + '</span>' +
                '</span>' +
                '<i class="fas fa-arrow-right"></i>' +
                '</a>'
            );
        }).join('');

        var notes = (doc.coachingNotes || []).slice(0, 6).map(function (n) {
            return '<div class="los-note"><span class="los-note-meta">' + esc(n.author || 'Coach') +
                (n.at ? ' · ' + new Date(n.at).toLocaleDateString('de-CH') : '') +
                '</span><p>' + esc(n.text) + '</p></div>';
        }).join('');

        return (
            '<div class="los-coach">' +
            '<div class="los-coach-head">' +
            '<div>' +
            '<h4><i class="fas fa-user-tie"></i> Dein Coach · Life OS</h4>' +
            '<p>Wochenfokus: <strong>' + esc(focusMeta ? focusMeta.title : '–') + '</strong> · Company Health ' + this.health() + '</p>' +
            '</div>' +
            '<a class="los-btn los-btn-dark" href="admin.html#life-os"><i class="fas fa-sliders"></i> Steuerzentrale</a>' +
            '</div>' +
            '<h5>Empfehlungen (schwächste Bereiche zuerst)</h5>' +
            '<div class="los-recs">' + recs + '</div>' +
            '<h5>Coaching-Notizen</h5>' +
            '<div class="los-coach-note-form">' +
            '<textarea id="losCoachNoteInput" placeholder="Eigene Notiz / Reflexion …"></textarea>' +
            '<button type="button" class="los-btn" id="losCoachNoteBtn"><i class="fas fa-plus"></i> Speichern</button>' +
            '</div>' +
            (notes || '<p class="los-muted">Noch keine Notizen.</p>') +
            '</div>'
        );
    };

    LifeOS.prototype.mountCoach = function (host) {
        var self = this;
        if (!host) return;
        host.innerHTML = this.renderCoachPanel();
        var btn = host.querySelector('#losCoachNoteBtn');
        if (btn) {
            btn.addEventListener('click', async function () {
                var ta = host.querySelector('#losCoachNoteInput');
                var text = ta && ta.value.trim();
                if (!text) return;
                await self.addNote(text, 'Manuel');
                self.mountCoach(host);
            });
        }
    };

    /* ---------------- Echte Erfolge (Achievements-Tab) ---------------- */

    LifeOS.prototype.renderAchievements = function () {
        var sig = this.signals || { pe: { started: 0, completed: 0 }, apps: { total: 0, open: 0 }, maxStreak: 0, mind: null };
        var doc = this.ensureDoc();
        var defs = [
            { icon: 'fa-building', name: 'Life OS gegründet', desc: 'Dein Leben läuft als Manuel AG', earned: true, meta: doc.intake && doc.intake.updatedAt ? new Date(doc.intake.updatedAt).toLocaleDateString('de-CH') : '' },
            { icon: 'fa-star', name: 'Erste Schritte', desc: 'Erste PE-Methode abgeschlossen', earned: sig.pe.completed >= 1, meta: sig.pe.completed + ' abgeschlossen' },
            { icon: 'fa-seedling', name: 'Entdecker', desc: '5 Methoden begonnen', earned: sig.pe.started >= 5, meta: sig.pe.started + '/5 begonnen' },
            { icon: 'fa-graduation-cap', name: 'Entwicklungs-Experte', desc: '10 Methoden abgeschlossen', earned: sig.pe.completed >= 10, meta: sig.pe.completed + '/10' },
            { icon: 'fa-briefcase', name: 'Bewerber', desc: 'Erste Bewerbung im Manager', earned: sig.apps.total >= 1, meta: sig.apps.total + ' Bewerbungen' },
            { icon: 'fa-paper-plane', name: 'Pipeline-Profi', desc: '10 Bewerbungen verwaltet', earned: sig.apps.total >= 10, meta: sig.apps.total + '/10' },
            { icon: 'fa-fire', name: 'Streak-Master', desc: '7 Tage in Folge trainiert', earned: sig.maxStreak >= 7, meta: sig.maxStreak + '/7 Tage' },
            { icon: 'fa-brain', name: 'Gedächtnis-Athlet', desc: '1000 XP Gedächtniskraft', earned: !!(sig.mind && sig.mind.xp >= 1000), meta: sig.mind ? sig.mind.xp.toLocaleString('de-DE') + ' XP' : '0 XP' }
        ];
        return defs.map(function (a) {
            return (
                '<div class="achievement-card ' + (a.earned ? 'earned' : 'locked') + '">' +
                '<div class="achievement-icon"><i class="fas ' + a.icon + '"></i></div>' +
                '<div class="achievement-info"><h4>' + esc(a.name) + '</h4><p>' + esc(a.desc) + '</p></div>' +
                '<div class="achievement-progress"><span>' + esc(a.meta) + '</span></div>' +
                '</div>'
            );
        }).join('');
    };

    LifeOS.prototype.mountAchievements = function (host) {
        if (!host) return;
        host.innerHTML = this.renderAchievements();
    };

    LifeOS.prototype.mountOverview = function (host) {
        var self = this;
        if (!host) return;
        host.innerHTML = this.renderBoard({ noteLimit: 1 });
        host.querySelectorAll('[data-los-goto]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var t = btn.getAttribute('data-los-goto');
                if (window.userProfile && typeof window.userProfile.switchTab === 'function') {
                    window.userProfile.switchTab(t);
                } else {
                    location.hash = t;
                }
            });
        });
    };

    LifeOS.prototype.mountProgress = function (host) {
        if (!host) return;
        host.innerHTML = this.renderProgressPanel();
    };

    LifeOS.prototype.bindTabs = function () {
        var self = this;
        async function refreshProgress() {
            var el = document.getElementById('lifeOsProgressRoot');
            if (!el) return;
            await self.load();
            await self.loadSignals();
            self.mountProgress(el);
        }
        async function refreshCoach() {
            var el = document.getElementById('lifeOsCoachRoot');
            if (!el) return;
            await self.load();
            self.mountCoach(el);
        }
        async function refreshAchievements() {
            var el = document.getElementById('lifeOsAchievementsRoot');
            if (!el) return;
            await self.load();
            await self.loadSignals();
            self.mountAchievements(el);
        }
        window.addEventListener('life-os-updated', function () {
            var el = document.getElementById('lifeOsProgressRoot');
            if (el && el.offsetParent !== null) self.mountProgress(el);
        });
        document.querySelectorAll('.tab-btn[data-tab="progress"]').forEach(function (btn) {
            btn.addEventListener('click', function () { setTimeout(refreshProgress, 50); });
        });
        document.querySelectorAll('.tab-btn[data-tab="coach"]').forEach(function (btn) {
            btn.addEventListener('click', function () { setTimeout(refreshCoach, 50); });
        });
        document.querySelectorAll('.tab-btn[data-tab="achievements"]').forEach(function (btn) {
            btn.addEventListener('click', function () { setTimeout(refreshAchievements, 50); });
        });
        if (location.hash === '#progress') refreshProgress();
        if (location.hash === '#coach') refreshCoach();
        if (location.hash === '#achievements') refreshAchievements();
    };

    window.LifeOS = LifeOS;
    window.lifeOS = new LifeOS();

    function boot() {
        var ready = async function () {
            try { await window.lifeOS.load(); } catch (e) { /* ignore */ }
            try { await window.lifeOS.loadSignals(); } catch (e) { /* ignore */ }
            window.lifeOS.bindTabs();
            var prog = document.getElementById('lifeOsProgressRoot');
            if (prog) window.lifeOS.mountProgress(prog);
            var coach = document.getElementById('lifeOsCoachRoot');
            if (coach) window.lifeOS.mountCoach(coach);
            var ach = document.getElementById('lifeOsAchievementsRoot');
            if (ach) window.lifeOS.mountAchievements(ach);
            window.dispatchEvent(new CustomEvent('life-os-ready'));
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', ready);
        } else {
            ready();
        }
    }
    boot();
})();
