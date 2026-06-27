/* =====================================================================
   Method-Kit · gemeinsames JS-Grundgerüst für die hellen Methoden-Seiten.
   Bietet: State (localStorage + optional Cloud via workflowAPI), Step-
   Navigation, Fortschrittsanzeige, Field-Binding, Toast, Export, Back.
   Jede Methode ruft MethodKit.init({...}) auf und ergänzt eigene Logik.
   ===================================================================== */
(function (global) {
    'use strict';

    const MethodKit = {
        method: null,
        state: {},
        step: 1,
        steps: [],
        _saveTimer: null,
        _onChange: null,

        /* ---------- Init ---------- */
        async init(opts) {
            opts = opts || {};
            this.method = opts.method || 'method';
            this.steps = opts.steps || [];
            this._onChange = typeof opts.onChange === 'function' ? opts.onChange : null;
            this._defaultState = opts.defaultState || {};
            if (opts.accent) this.setAccent(opts.accent, opts.accent2);

            this.state = JSON.parse(JSON.stringify(this._defaultState));
            await this._load();

            this._renderProgress();
            this._bindNav();
            this._bindBack();
            this.goTo(this.state.__step || 1, true);
            this._updateSyncBadge(this._wasSynced);
            return this;
        },

        setAccent(a, b) {
            const r = document.documentElement.style;
            if (a) {
                r.setProperty('--mk-accent', a);
                r.setProperty('--mk-accent-soft', this._soft(a));
            }
            if (b) r.setProperty('--mk-accent-2', b);
        },
        _soft(hex) {
            const c = hex.replace('#', '');
            if (c.length !== 6) return 'rgba(99,102,241,.10)';
            const n = parseInt(c, 16);
            return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.10)`;
        },

        /* ---------- Persistence ---------- */
        _key() { return 'mk_' + this.method; },
        isLoggedIn() {
            try {
                if (global.awsAuth && global.awsAuth.isLoggedIn) return !!global.awsAuth.isLoggedIn();
                if (global.realUserAuth && global.realUserAuth.isLoggedIn) return !!global.realUserAuth.isLoggedIn();
            } catch (e) {}
            return false;
        },
        async _load() {
            try {
                const local = JSON.parse(localStorage.getItem(this._key()));
                if (local && typeof local === 'object') this.state = Object.assign({}, this.state, local);
            } catch (e) {}
            try {
                if (global.workflowAPI && global.workflowAPI.getWorkflowResults) {
                    const res = await global.workflowAPI.getWorkflowResults(this.method);
                    const remote = res && (res.results || res.state || res);
                    if (remote && typeof remote === 'object' && Object.keys(remote).length) {
                        this.state = Object.assign({}, this.state, remote);
                        localStorage.setItem(this._key(), JSON.stringify(this.state));
                        this._wasSynced = this.isLoggedIn();
                    }
                }
            } catch (e) { console.warn('[MethodKit] Cloud-Load fehlgeschlagen:', e); }
        },
        save(opts) {
            opts = opts || {};
            try { localStorage.setItem(this._key(), JSON.stringify(this.state)); } catch (e) {}
            if (this._onChange) { try { this._onChange(this.state); } catch (e) {} }
            clearTimeout(this._saveTimer);
            this._saveTimer = setTimeout(() => this._cloudSave(), opts.now ? 0 : 800);
        },
        async _cloudSave() {
            let synced = false;
            try {
                if (global.workflowAPI && global.workflowAPI.saveWorkflowResults) {
                    await global.workflowAPI.saveWorkflowResults(this.method, this.state);
                    synced = this.isLoggedIn();
                }
            } catch (e) { console.warn('[MethodKit] Cloud-Save fehlgeschlagen:', e); }
            this._updateSyncBadge(synced);
        },
        _updateSyncBadge(synced) {
            const b = document.getElementById('mk-sync');
            if (!b) return;
            const icon = b.querySelector('i'), txt = b.querySelector('span');
            if (synced) {
                if (icon) icon.className = 'fas fa-cloud';
                if (txt) txt.textContent = 'Geräteübergreifend gespeichert';
            } else {
                if (icon) icon.className = 'fas fa-laptop';
                if (txt) txt.textContent = 'Lokal gespeichert';
            }
        },

        /* ---------- Steps ---------- */
        _stepEls() { return Array.from(document.querySelectorAll('.mk-step')); },
        _renderProgress() {
            const host = document.getElementById('mk-progress');
            if (!host || !this.steps.length) return;
            host.innerHTML = this.steps.map((s, i) => `
                <div class="mk-pstep" data-goto="${i + 1}">
                    <div class="dot">${s.icon || (i + 1)}</div>
                    <div class="lbl">${s.label}</div>
                </div>`).join('');
            host.querySelectorAll('[data-goto]').forEach(el => {
                el.addEventListener('click', () => this.goTo(parseInt(el.dataset.goto, 10)));
            });
        },
        _syncProgress() {
            const host = document.getElementById('mk-progress');
            if (!host) return;
            host.querySelectorAll('.mk-pstep').forEach((el, i) => {
                el.classList.toggle('active', i + 1 === this.step);
                el.classList.toggle('done', i + 1 < this.step);
            });
        },
        goTo(n, silent) {
            const els = this._stepEls();
            const total = els.length || this.steps.length || 1;
            n = Math.max(1, Math.min(n, total));
            this.step = n;
            els.forEach(el => el.classList.toggle('active', parseInt(el.dataset.step, 10) === n));
            this._syncProgress();
            const info = document.getElementById('mk-step-info');
            if (info) info.textContent = `Schritt ${n} von ${total}`;
            const prev = document.getElementById('mk-prev'), next = document.getElementById('mk-next');
            if (prev) prev.disabled = n === 1;
            if (next) {
                next.style.visibility = n === total ? 'hidden' : 'visible';
            }
            this.state.__step = n;
            if (!silent) {
                this.save();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            if (typeof this.onStep === 'function') { try { this.onStep(n); } catch (e) {} }
        },
        next() { this.goTo(this.step + 1); },
        prev() { this.goTo(this.step - 1); },
        _bindNav() {
            const prev = document.getElementById('mk-prev'), next = document.getElementById('mk-next');
            if (prev) prev.addEventListener('click', () => this.prev());
            if (next) next.addEventListener('click', () => this.next());
            document.querySelectorAll('[data-mk-next]').forEach(b => b.addEventListener('click', () => this.next()));
            document.querySelectorAll('[data-mk-prev]').forEach(b => b.addEventListener('click', () => this.prev()));
        },

        /* ---------- Field binding ---------- */
        bindFields() {
            document.querySelectorAll('[data-mk-field]').forEach(el => {
                const key = el.dataset.mkField;
                const isRange = el.type === 'range';
                if (this.state[key] !== undefined && this.state[key] !== null) {
                    el.value = this.state[key];
                }
                if (isRange) this._syncRange(el);
                const evt = (el.tagName === 'SELECT' || el.type === 'range') ? 'input' : 'input';
                el.addEventListener(evt, () => {
                    this.state[key] = el.value;
                    if (isRange) this._syncRange(el);
                    this.save();
                });
            });
        },
        _syncRange(el) {
            const out = document.querySelector(`[data-mk-rangeval="${el.dataset.mkField}"]`);
            if (out) out.textContent = el.value;
        },

        /* ---------- Toast ---------- */
        toast(msg, type) {
            let t = document.getElementById('mk-toast');
            if (!t) { t = document.createElement('div'); t.id = 'mk-toast'; t.className = 'mk-toast'; document.body.appendChild(t); }
            t.textContent = msg;
            t.className = 'mk-toast show' + (type ? ' ' + type : '');
            clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => { t.className = 'mk-toast' + (type ? ' ' + type : ''); }, 2400);
            if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
        },

        /* ---------- Export ---------- */
        exportText(filename, text) {
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
            this.toast('Heruntergeladen', 'success');
        },

        /* ---------- Back (herkunftsbewusst) ---------- */
        _bindBack() {
            const b = document.getElementById('mk-back');
            if (!b) return;
            b.addEventListener('click', () => {
                const r = document.referrer || '';
                if (r.indexOf('aktivitaeten-uebersicht') > -1) {
                    window.location.href = '../../aktivitaeten-uebersicht.html';
                } else {
                    window.location.href = '../../persoenlichkeitsentwicklung-uebersicht.html';
                }
            });
        },

        /* ---------- Helpers ---------- */
        esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); },
        uid() { return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
    };

    global.MethodKit = MethodKit;
})(window);
