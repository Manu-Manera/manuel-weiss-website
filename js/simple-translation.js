/**
 * Simple Translation – DE/EN Umschaltung direkt auf der Seite
 *
 * Funktionsweise
 *  1. Elemente mit data-de / data-en werden über die Attribute umgeschaltet.
 *  2. Alle übrigen sichtbaren Texte werden über ein Wörterbuch (js/i18n/en.json)
 *     auf Text-Knoten-Ebene übersetzt; das deutsche Original bleibt im Speicher
 *     und wird beim Zurückschalten wiederhergestellt.
 *  3. Sprache: ?lang=en|de → localStorage → Browser-Sprache (erster Besuch) → de.
 *  4. Dynamisch nachgeladene Inhalte werden per MutationObserver übersetzt.
 *  5. Gibt es auf der Seite keinen Sprachumschalter (.lang-link-compact), wird
 *     ein kleiner schwebender Umschalter eingeblendet.
 */
(function () {
    'use strict';

    var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, PRE: 1, SVG: 1, TEMPLATE: 1, TEXTAREA: 1 };
    var ATTRS = ['placeholder', 'title', 'alt', 'aria-label'];
    var STORAGE_KEY = 'selectedLanguage';

    function scriptBase() {
        var s = document.currentScript || (function () {
            var all = document.getElementsByTagName('script');
            for (var i = all.length - 1; i >= 0; i--) {
                if (/simple-translation\.js/.test(all[i].src || '')) return all[i];
            }
            return null;
        })();
        if (!s || !s.src) return { base: '', version: '' };
        var q = (s.src.match(/[?&]v=([^&#]+)/) || [])[1] || '';
        return { base: s.src.replace(/simple-translation\.js.*$/, ''), version: q };
    }

    var META = scriptBase();
    var BASE = META.base;
    var VERSION = META.version;

    function normalize(str) {
        return String(str).replace(/\s+/g, ' ').trim();
    }

    function SimpleTranslation() {
        this.dict = null;
        this.dictPromise = null;
        this.originals = new WeakMap();     // Text-Knoten → deutsches Original
        this.attrOriginals = new WeakMap(); // Element → { attr: original }
        this.applying = false;
        this.observer = null;
        this.currentLanguage = this.detectLanguage();

        var self = this;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { self.init(); });
        } else {
            this.init();
        }
    }

    SimpleTranslation.prototype.detectLanguage = function () {
        var params = new URLSearchParams(window.location.search);
        var q = (params.get('lang') || '').toLowerCase();
        if (q === 'en' || q === 'de') {
            try { localStorage.setItem(STORAGE_KEY, q); } catch (e) {}
            return q;
        }
        if (/\/en\//.test(window.location.pathname)) return 'en';

        var stored = null;
        try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
        if (stored === 'en' || stored === 'de') return stored;

        var nav = (navigator.language || navigator.userLanguage || 'de').toLowerCase();
        return nav.indexOf('de') === 0 ? 'de' : 'en';
    };

    SimpleTranslation.prototype.init = function () {
        this.ensureSwitcher();
        this.bindSwitcher();
        this.applyLanguage();
        this.observe();
    };

    /* ------------------------------------------------------------------ */
    /* Wörterbuch                                                          */
    /* ------------------------------------------------------------------ */
    SimpleTranslation.prototype.loadDict = function () {
        if (this.dict) return Promise.resolve(this.dict);
        if (this.dictPromise) return this.dictPromise;
        var self = this;
        var url = (window.MW_I18N_DICT_URL) || (BASE + 'i18n/en.json' + (VERSION ? '?v=' + VERSION : ''));
        this.dictPromise = fetch(url)
            .then(function (r) { return r.ok ? r.json() : {}; })
            .catch(function () { return {}; })
            .then(function (d) { self.dict = d || {}; return self.dict; });
        return this.dictPromise;
    };

    /* ------------------------------------------------------------------ */
    /* Umschalten                                                          */
    /* ------------------------------------------------------------------ */
    SimpleTranslation.prototype.switchLanguage = function (lang) {
        if (lang !== 'en' && lang !== 'de') return;
        this.currentLanguage = lang;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
        // Alte statische /en/-Seiten: zurück zur deutschen Originalseite
        if (lang === 'de' && /^\/en\//.test(window.location.pathname)) {
            window.location.href = window.location.pathname.replace(/^\/en\//, '/') + window.location.search + window.location.hash;
            return;
        }
        this.applyLanguage();
    };
    SimpleTranslation.prototype.setLanguage = SimpleTranslation.prototype.switchLanguage;

    SimpleTranslation.prototype.applyLanguage = function () {
        var self = this;
        var lang = this.currentLanguage;
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.classList.toggle('lang-en', lang === 'en');
        document.documentElement.classList.toggle('lang-de', lang === 'de');
        this.updateSwitcher();

        var run = function () {
            self.applying = true;
            try {
                self.applyAttributes(document.body);
                self.translateTree(document.body);
                self.translateHead();
            } finally {
                self.applying = false;
            }
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        };

        if (lang === 'en') {
            this.loadDict().then(run);
        } else {
            run();
        }
    };

    /* data-de / data-en Attribute */
    SimpleTranslation.prototype.applyAttributes = function (root) {
        var lang = this.currentLanguage;
        var nodes = root.querySelectorAll('[data-de], [data-en]');
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var text = el.getAttribute('data-' + lang);
            if (text == null) continue;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.hasAttribute('placeholder')) el.setAttribute('placeholder', text);
                else el.value = text;
                continue;
            }
            var span = el.querySelector('span[data-de][data-en]');
            if (span && span !== el) continue; // Kind-Span wird separat behandelt
            var textNodes = [];
            for (var c = 0; c < el.childNodes.length; c++) {
                var n = el.childNodes[c];
                if (n.nodeType === 3 && normalize(n.nodeValue)) textNodes.push(n);
            }
            if (textNodes.length === 1) {
                textNodes[0].nodeValue = text;
            } else if (textNodes.length === 0 && el.children.length === 0) {
                el.textContent = text;
            } else if (textNodes.length > 1) {
                textNodes[0].nodeValue = text;
                for (var k = 1; k < textNodes.length; k++) textNodes[k].nodeValue = '';
            } else {
                var plain = el.querySelector('span:not([data-de]):not([data-en])');
                if (plain) plain.textContent = text;
            }
        }
    };

    /* Wörterbuch-Übersetzung auf Text-Knoten-Ebene */
    SimpleTranslation.prototype.translateTree = function (root) {
        if (!root) return;
        var lang = this.currentLanguage;
        var dict = this.dict || {};
        var self = this;

        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                var p = node.parentNode;
                if (!p || SKIP_TAGS[p.nodeName]) return NodeFilter.FILTER_REJECT;
                if (p.closest && p.closest('[data-no-translate], .notranslate, [data-de], [data-en]')) return NodeFilter.FILTER_REJECT;
                return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        });

        var node;
        var nodes = [];
        while ((node = walker.nextNode())) nodes.push(node);

        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            var original = self.originals.get(n);
            if (lang === 'de') {
                if (original != null) n.nodeValue = original;
                continue;
            }
            var source = original != null ? original : n.nodeValue;
            var key = normalize(source);
            var en = dict[key];
            if (!en) continue;
            if (original == null) self.originals.set(n, n.nodeValue);
            var lead = source.match(/^\s*/)[0];
            var trail = source.match(/\s*$/)[0];
            n.nodeValue = lead + en + trail;
        }

        // Attribute (placeholder, title, alt, aria-label)
        var els = root.querySelectorAll ? root.querySelectorAll('[placeholder],[title],[alt],[aria-label]') : [];
        for (var e = 0; e < els.length; e++) {
            var el = els[e];
            if (el.closest('[data-no-translate], .notranslate') || SKIP_TAGS[el.nodeName]) continue;
            var store = self.attrOriginals.get(el);
            for (var a = 0; a < ATTRS.length; a++) {
                var attr = ATTRS[a];
                if (!el.hasAttribute(attr)) continue;
                var orig = store && store[attr] != null ? store[attr] : el.getAttribute(attr);
                if (lang === 'de') {
                    if (store && store[attr] != null) el.setAttribute(attr, store[attr]);
                    continue;
                }
                var tr = dict[normalize(orig)];
                if (!tr) continue;
                if (!store) { store = {}; self.attrOriginals.set(el, store); }
                if (store[attr] == null) store[attr] = orig;
                el.setAttribute(attr, tr);
            }
        }
    };

    SimpleTranslation.prototype.translateHead = function () {
        var lang = this.currentLanguage;
        var dict = this.dict || {};
        var titleEl = document.querySelector('title');
        if (titleEl) {
            var tOrig = this.originals.get(titleEl) || titleEl.textContent;
            var tKey = normalize(tOrig);
            if (lang === 'en' && (titleEl.getAttribute('data-en') || dict[tKey])) {
                if (!this.originals.get(titleEl)) this.originals.set(titleEl, tOrig);
                titleEl.textContent = titleEl.getAttribute('data-en') || dict[tKey];
            } else if (lang === 'de' && this.originals.get(titleEl)) {
                titleEl.textContent = this.originals.get(titleEl);
            }
        }
        var meta = document.querySelector('meta[name="description"]');
        if (meta) {
            var mOrig = this.originals.get(meta) || meta.getAttribute('content') || '';
            var mKey = normalize(mOrig);
            if (lang === 'en' && (meta.getAttribute('data-en') || dict[mKey])) {
                if (!this.originals.get(meta)) this.originals.set(meta, mOrig);
                meta.setAttribute('content', meta.getAttribute('data-en') || dict[mKey]);
            } else if (lang === 'de' && this.originals.get(meta)) {
                meta.setAttribute('content', this.originals.get(meta));
            }
        }
    };

    /* ------------------------------------------------------------------ */
    /* Dynamische Inhalte                                                  */
    /* ------------------------------------------------------------------ */
    SimpleTranslation.prototype.observe = function () {
        if (this.observer || !window.MutationObserver) return;
        var self = this;
        var pending = false;
        var queue = [];
        this.observer = new MutationObserver(function (mutations) {
            if (self.applying) return;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.type === 'childList') {
                    for (var j = 0; j < m.addedNodes.length; j++) queue.push(m.addedNodes[j]);
                } else if (m.type === 'characterData') {
                    // Von Dritt-Skripten geänderter Text → Original neu lernen
                    self.originals.delete(m.target);
                    queue.push(m.target.parentNode);
                }
            }
            if (pending) return;
            pending = true;
            setTimeout(function () {
                pending = false;
                var items = queue.splice(0);
                if (self.currentLanguage !== 'en') return;
                self.loadDict().then(function () {
                    self.applying = true;
                    try {
                        for (var k = 0; k < items.length; k++) {
                            var n = items[k];
                            if (!n || !n.isConnected) continue;
                            if (n.nodeType === 3) n = n.parentNode;
                            if (!n || n.nodeType !== 1) continue;
                            self.applyAttributes(n);
                            self.translateTree(n);
                        }
                    } finally {
                        self.applying = false;
                    }
                });
            }, 60);
        });
        this.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    };

    /* ------------------------------------------------------------------ */
    /* Umschalter-UI                                                       */
    /* ------------------------------------------------------------------ */
    SimpleTranslation.prototype.ensureSwitcher = function () {
        if (document.querySelector('.lang-link-compact[data-lang]')) return;
        if (document.body.hasAttribute('data-no-lang-switch')) return;
        var box = document.createElement('div');
        box.className = 'coastal-lang-switch';
        box.setAttribute('data-no-translate', '');
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', 'Language');
        box.innerHTML =
            '<button type="button" class="lang-link-compact" data-lang="de" title="Deutsch" aria-label="Deutsch">🇩🇪</button>' +
            '<button type="button" class="lang-link-compact" data-lang="en" title="English" aria-label="English">🇬🇧</button>';
        document.body.appendChild(box);
    };

    SimpleTranslation.prototype.bindSwitcher = function () {
        var self = this;
        document.addEventListener('click', function (e) {
            var btn = e.target && e.target.closest ? e.target.closest('.lang-link-compact[data-lang]') : null;
            if (!btn) return;
            e.preventDefault();
            self.switchLanguage(btn.getAttribute('data-lang'));
        });
    };

    SimpleTranslation.prototype.updateSwitcher = function () {
        var lang = this.currentLanguage;
        var btns = document.querySelectorAll('.lang-link-compact[data-lang]');
        for (var i = 0; i < btns.length; i++) {
            var active = btns[i].getAttribute('data-lang') === lang;
            btns[i].classList.toggle('active', active);
            btns[i].setAttribute('aria-pressed', active ? 'true' : 'false');
        }
    };

    window.SimpleTranslation = SimpleTranslation;
    window.simpleTranslation = new SimpleTranslation();
})();
