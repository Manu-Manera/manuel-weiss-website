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
            this._bindKeyboard();
            this._bindAutosize();
            this._bindReset();
            this.goTo(this.state.__step || 1, true);
            this._lastSynced = !!this._wasSynced;
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
            this._flashSaved();
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
            this._lastSynced = synced;
            if (!this._flashing) this._updateSyncBadge(synced);
        },
        _flashSaved() {
            const b = document.getElementById('mk-sync');
            if (!b) return;
            const icon = b.querySelector('i'), txt = b.querySelector('span');
            this._flashing = true;
            b.classList.add('flash');
            if (icon) icon.className = 'fas fa-circle-check';
            if (txt) txt.textContent = 'Gespeichert';
            clearTimeout(this._flashTimer);
            this._flashTimer = setTimeout(() => {
                this._flashing = false;
                b.classList.remove('flash');
                this._updateSyncBadge(this._lastSynced);
            }, 1200);
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
        /* Alles zurücksetzen (lokal + Cloud) – wird über [data-mk-reset] gebunden */
        async reset(opts) {
            opts = opts || {};
            if (!opts.silent && !confirm('Wirklich alle Eingaben dieser Methode löschen? Das kann nicht rückgängig gemacht werden.')) return false;
            this.state = JSON.parse(JSON.stringify(this._defaultState));
            try { localStorage.removeItem(this._key()); } catch (e) {}
            try {
                if (global.workflowAPI && global.workflowAPI.saveWorkflowResults) {
                    await global.workflowAPI.saveWorkflowResults(this.method, this.state);
                }
            } catch (e) {}
            if (!opts.noReload) window.location.reload();
            return true;
        },
        _bindReset() {
            document.querySelectorAll('[data-mk-reset]').forEach(b => b.addEventListener('click', () => this.reset()));
        },

        /* ---------- Steps ---------- */
        _stepEls() { return Array.from(document.querySelectorAll('.mk-step')); },
        _renderProgress() {
            const host = document.getElementById('mk-progress');
            if (!host || !this.steps.length) return;
            host.setAttribute('role', 'tablist');
            host.innerHTML = this.steps.map((s, i) => `
                <button type="button" class="mk-pstep" data-goto="${i + 1}" role="tab" aria-label="Schritt ${i + 1}: ${this.esc(s.label)}">
                    <div class="dot"><span class="ic">${s.icon || (i + 1)}</span><i class="fas fa-check chk" aria-hidden="true"></i></div>
                    <div class="lbl">${s.label}</div>
                </button>`).join('');
            host.querySelectorAll('[data-goto]').forEach(el => {
                el.addEventListener('click', () => this.goTo(parseInt(el.dataset.goto, 10)));
            });
            // Wrapper + Fortschrittsbalken
            if (!host.parentElement.classList.contains('mk-progress-wrap')) {
                const wrap = document.createElement('div');
                wrap.className = 'mk-progress-wrap';
                host.parentNode.insertBefore(wrap, host);
                wrap.appendChild(host);
                const bar = document.createElement('div');
                bar.className = 'mk-progress-bar';
                bar.innerHTML = '<span></span>';
                wrap.appendChild(bar);
            }
            // Häkchen nur bei erledigten Schritten zeigen
            if (!document.getElementById('mk-pstep-style')) {
                const st = document.createElement('style');
                st.id = 'mk-pstep-style';
                st.textContent = '.mk-pstep .dot .chk{display:none}.mk-pstep.done .dot .chk{display:inline}.mk-pstep.done .dot .ic{display:none}';
                document.head.appendChild(st);
            }
        },
        _syncProgress() {
            const host = document.getElementById('mk-progress');
            if (!host) return;
            let activeEl = null;
            host.querySelectorAll('.mk-pstep').forEach((el, i) => {
                const active = i + 1 === this.step;
                el.classList.toggle('active', active);
                el.classList.toggle('done', i + 1 < this.step);
                el.setAttribute('aria-selected', active ? 'true' : 'false');
                if (active) activeEl = el;
            });
            const total = this._stepEls().length || this.steps.length || 1;
            const bar = host.parentElement && host.parentElement.querySelector('.mk-progress-bar > span');
            if (bar) bar.style.width = Math.round((this.step / total) * 100) + '%';
            // Aktiven Schritt horizontal in Sicht bringen (nur horizontal, kein Seiten-Scroll)
            if (activeEl && host.scrollWidth > host.clientWidth) {
                const target = activeEl.offsetLeft - (host.clientWidth - activeEl.offsetWidth) / 2;
                host.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
            }
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
                if (!next.dataset.origHtml) next.dataset.origHtml = next.innerHTML;
                if (n === total) {
                    next.innerHTML = 'Fertig <i class="fas fa-check"></i>';
                    next.classList.add('mk-btn-finish');
                } else {
                    next.innerHTML = next.dataset.origHtml;
                    next.classList.remove('mk-btn-finish');
                }
                next.style.visibility = 'visible';
            }
            this.state.__step = n;
            if (!silent) {
                this.save();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            if (typeof this.onStep === 'function') { try { this.onStep(n); } catch (e) {} }
            this._autosizeAll();
        },
        next() {
            const total = this._stepEls().length || this.steps.length || 1;
            if (this.step >= total) { this.finish(); return; }
            this.goTo(this.step + 1);
        },
        prev() { this.goTo(this.step - 1); },
        /* Letzter Schritt → "Fertig": speichert sofort und geht zurück zur Übersicht */
        finish() {
            this.save({ now: true });
            this.toast('Gespeichert – bis zum nächsten Mal!', 'success');
            setTimeout(() => this.goBack(), 600);
        },
        _bindNav() {
            const prev = document.getElementById('mk-prev'), next = document.getElementById('mk-next');
            if (prev) prev.addEventListener('click', () => this.prev());
            if (next) next.addEventListener('click', () => this.next());
            document.querySelectorAll('[data-mk-next]').forEach(b => b.addEventListener('click', () => this.next()));
            document.querySelectorAll('[data-mk-prev]').forEach(b => b.addEventListener('click', () => this.prev()));
        },
        _bindKeyboard() {
            document.addEventListener('keydown', (ev) => {
                if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
                if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
                const a = document.activeElement;
                if (a && (a.matches('input, textarea, select, [contenteditable="true"]'))) return;
                // Offenes Overlay/Dialog → nicht blättern
                const dlg = Array.from(document.querySelectorAll('[aria-modal="true"]')).find(d => d.offsetParent !== null);
                if (dlg) return;
                if (ev.key === 'ArrowRight') { const total = this._stepEls().length || 1; if (this.step < total) this.next(); }
                else this.prev();
            });
        },
        /* Textareas wachsen mit dem Inhalt */
        _bindAutosize() {
            document.addEventListener('input', (ev) => {
                if (ev.target && ev.target.matches && ev.target.matches('textarea.mk-textarea')) this._autosize(ev.target);
            });
            this._autosizeAll();
        },
        _autosize(t) {
            if (!t || t.offsetParent === null) return;
            t.style.height = 'auto';
            t.style.height = Math.max(t.scrollHeight + 2, parseInt(getComputedStyle(t).minHeight, 10) || 0) + 'px';
        },
        _autosizeAll() {
            document.querySelectorAll('textarea.mk-textarea').forEach(t => this._autosize(t));
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
        goBack() {
            const r = document.referrer || '';
            if (r.indexOf('aktivitaeten-uebersicht') > -1) {
                window.location.href = '../../aktivitaeten-uebersicht.html';
            } else {
                window.location.href = '../../persoenlichkeitsentwicklung-uebersicht.html';
            }
        },
        _bindBack() {
            const b = document.getElementById('mk-back');
            if (!b) return;
            b.addEventListener('click', () => this.goBack());
        },

        /* ---------- Helpers ---------- */
        esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); },
        uid() { return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
    };

    global.MethodKit = MethodKit;
})(window);
