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
    }

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
            self.mountProgress(el);
        }
        window.addEventListener('life-os-updated', function () {
            var el = document.getElementById('lifeOsProgressRoot');
            if (el && el.offsetParent !== null) self.mountProgress(el);
        });
        document.querySelectorAll('.tab-btn[data-tab="progress"]').forEach(function (btn) {
            btn.addEventListener('click', function () { setTimeout(refreshProgress, 50); });
        });
        if (location.hash === '#progress') refreshProgress();
    };

    window.LifeOS = LifeOS;
    window.lifeOS = new LifeOS();

    function boot() {
        var ready = async function () {
            try { await window.lifeOS.load(); } catch (e) { /* ignore */ }
            window.lifeOS.bindTabs();
            var prog = document.getElementById('lifeOsProgressRoot');
            if (prog) window.lifeOS.mountProgress(prog);
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
