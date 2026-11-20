/**
 * Admin Life OS – Steuerzentrale für Manuel AG
 */
(function () {
    'use strict';

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function LifeOsSection() {
        this.initialized = false;
        this.root = null;
    }

    LifeOsSection.prototype.init = function () {
        var self = this;
        var tries = 0;
        (function wait() {
            var root = document.querySelector('.life-os-section');
            if (!root) {
                if (tries++ < 50) return setTimeout(wait, 100);
                return;
            }
            self.root = root;
            if (!self.initialized) {
                self._attach(root);
                self.initialized = true;
            }
            self.load();
        })();
    };

    LifeOsSection.prototype._attach = function (root) {
        var self = this;
        var reload = root.querySelector('#los-reload-btn');
        var save = root.querySelector('#los-save-btn');
        var addNote = root.querySelector('#los-add-note-btn');
        if (reload) reload.addEventListener('click', function () { self.load(true); });
        if (save) save.addEventListener('click', function () { self.persistFromForm(true); });
        if (addNote) {
            addNote.addEventListener('click', async function () {
                var ta = root.querySelector('#los-new-note');
                var text = ta && ta.value.trim();
                if (!text || !window.lifeOS) return;
                await window.lifeOS.addNote(text, 'Coach');
                if (ta) ta.value = '';
                self.render();
                self._status('Notiz gespeichert', true);
            });
        }
        root.addEventListener('change', function (e) {
            if (e.target && e.target.matches('[data-los-field], #los-company, #los-tagline, #los-northstar, #los-vision, #los-weekly-focus, #los-board-notes')) {
                self.persistFromForm(false);
            }
        });
        root.addEventListener('input', function (e) {
            if (e.target && e.target.matches('input[type="range"][data-los-field="score"]')) {
                var id = e.target.getAttribute('data-los-id');
                var lbl = root.querySelector('[data-los-score-label="' + id + '"]');
                if (lbl) lbl.textContent = e.target.value;
            }
        });
    };

    LifeOsSection.prototype._status = function (msg, ok) {
        var el = this.root && this.root.querySelector('#los-save-status');
        if (!el) return;
        el.textContent = msg || '';
        el.className = 'los-save-status' + (ok ? ' ok' : '');
    };

    LifeOsSection.prototype.load = async function (force) {
        this._status('Lade …');
        try {
            if (!window.lifeOS) throw new Error('Life OS nicht geladen');
            await window.lifeOS.load(!!force);
            this.render();
            this._status('Geladen', true);
        } catch (e) {
            console.error(e);
            this._status('Fehler: ' + (e.message || e));
        }
    };

    LifeOsSection.prototype.persistFromForm = async function (immediate) {
        if (!window.lifeOS || !this.root) return;
        var doc = window.lifeOS.ensureDoc();
        var root = this.root;
        doc.companyName = (root.querySelector('#los-company') || {}).value || doc.companyName;
        doc.tagline = (root.querySelector('#los-tagline') || {}).value || doc.tagline;
        doc.northStar = (root.querySelector('#los-northstar') || {}).value || doc.northStar;
        doc.vision = (root.querySelector('#los-vision') || {}).value || doc.vision;
        doc.weeklyFocus = (root.querySelector('#los-weekly-focus') || {}).value || doc.weeklyFocus;
        doc.boardReview = doc.boardReview || {};
        doc.boardReview.notes = (root.querySelector('#los-board-notes') || {}).value || '';

        (window.lifeOS.meta() || []).forEach(function (meta) {
            var id = meta.id;
            var scoreEl = root.querySelector('input[data-los-id="' + id + '"][data-los-field="score"]');
            var goalEl = root.querySelector('textarea[data-los-id="' + id + '"][data-los-field="goal"]');
            var kpiEl = root.querySelector('input[data-los-id="' + id + '"][data-los-field="kpi"]');
            var nextEl = root.querySelector('textarea[data-los-id="' + id + '"][data-los-field="nextStep"]');
            var notesEl = root.querySelector('textarea[data-los-id="' + id + '"][data-los-field="notes"]');
            doc.divisions[id] = doc.divisions[id] || {};
            if (scoreEl) {
                var nextScore = Number(scoreEl.value);
                if (nextScore !== Number(doc.divisions[id].score)) {
                    doc.divisions[id].history = doc.divisions[id].history || [];
                    doc.divisions[id].history.push({
                        at: new Date().toISOString(),
                        score: nextScore,
                        note: 'Admin-Update'
                    });
                }
                doc.divisions[id].score = nextScore;
            }
            if (goalEl) doc.divisions[id].goal = goalEl.value;
            if (kpiEl) doc.divisions[id].kpi = kpiEl.value;
            if (nextEl) doc.divisions[id].nextStep = nextEl.value;
            if (notesEl) doc.divisions[id].notes = notesEl.value;
        });

        this._status(immediate ? 'Speichere …' : 'Änderungen …');
        await window.lifeOS.save(!!immediate);
        this.renderKpis();
        this._status(immediate ? 'Gespeichert' : 'Automatisch gespeichert', true);
    };

    LifeOsSection.prototype.renderKpis = function () {
        if (!window.lifeOS || !this.root) return;
        var doc = window.lifeOS.ensureDoc();
        var meta = window.lifeOS.meta();
        var focusMeta = meta.find(function (m) { return m.id === doc.weeklyFocus; });
        var set = function (id, v) {
            var el = document.getElementById(id);
            if (el) el.textContent = v;
        };
        set('los-kpi-health', String(window.lifeOS.health()));
        set('los-kpi-focus', focusMeta ? focusMeta.title.split('/')[0].trim() : '–');
        set('los-kpi-notes', String((doc.coachingNotes || []).length));
        set('los-kpi-updated', doc.updatedAt
            ? new Date(doc.updatedAt).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            : '–');
    };

    LifeOsSection.prototype.render = function () {
        if (!window.lifeOS || !this.root) return;
        var doc = window.lifeOS.ensureDoc();
        var root = this.root;
        var meta = window.lifeOS.meta();

        var company = root.querySelector('#los-company');
        var tagline = root.querySelector('#los-tagline');
        var north = root.querySelector('#los-northstar');
        var vision = root.querySelector('#los-vision');
        var focus = root.querySelector('#los-weekly-focus');
        var board = root.querySelector('#los-board-notes');
        if (company) company.value = doc.companyName || '';
        if (tagline) tagline.value = doc.tagline || '';
        if (north) north.value = doc.northStar || '';
        if (vision) vision.value = doc.vision || '';
        if (board) board.value = (doc.boardReview && doc.boardReview.notes) || '';
        if (focus) {
            focus.innerHTML = meta.map(function (m) {
                return '<option value="' + esc(m.id) + '"' + (doc.weeklyFocus === m.id ? ' selected' : '') + '>' + esc(m.title) + '</option>';
            }).join('');
        }

        var grid = root.querySelector('#los-admin-grid');
        if (grid) {
            grid.innerHTML = meta.map(function (m) {
                var d = doc.divisions[m.id] || {};
                var score = Number(d.score) || 0;
                return (
                    '<article class="los-admin-card" style="--los-accent:' + m.accent + '">' +
                    '<h3><i class="fas ' + m.icon + '"></i> ' + esc(m.title) + '</h3>' +
                    '<label>Score (<span class="los-admin-score-label" data-los-score-label="' + m.id + '">' + score + '</span>)</label>' +
                    '<input type="range" min="0" max="100" value="' + score + '" data-los-id="' + m.id + '" data-los-field="score" />' +
                    '<label>KPI</label>' +
                    '<input type="text" data-los-id="' + m.id + '" data-los-field="kpi" value="' + esc(d.kpi || '') + '" />' +
                    '<label>Ziel</label>' +
                    '<textarea data-los-id="' + m.id + '" data-los-field="goal">' + esc(d.goal || '') + '</textarea>' +
                    '<label>Nächster Schritt</label>' +
                    '<textarea data-los-id="' + m.id + '" data-los-field="nextStep">' + esc(d.nextStep || '') + '</textarea>' +
                    '<label>Notizen</label>' +
                    '<textarea data-los-id="' + m.id + '" data-los-field="notes">' + esc(d.notes || '') + '</textarea>' +
                    '</article>'
                );
            }).join('');
        }

        var list = root.querySelector('#los-notes-list');
        if (list) {
            var notes = doc.coachingNotes || [];
            list.innerHTML = notes.length
                ? notes.map(function (n) {
                    return '<div class="los-admin-note-item"><div class="meta">' + esc(n.author || 'Coach') +
                        (n.at ? ' · ' + new Date(n.at).toLocaleString('de-CH') : '') +
                        '</div><div>' + esc(n.text) + '</div></div>';
                }).join('')
                : '<p style="color:#64748b;font-size:13px;">Noch keine Notizen.</p>';
        }

        this.renderKpis();
    };

    window.LifeOsSection = LifeOsSection;
})();
