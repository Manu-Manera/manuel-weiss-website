// Persönlichkeitsentwicklung – Suche, Filter, Trefferzähler
(function () {
    'use strict';

    var state = { q: '', cat: 'all' };
    var CAT_LABEL = {
        all: 'Alle',
        'self-discovery': 'Selbstfindung',
        goals: 'Ziele & Motivation',
        communication: 'Kommunikation',
        mindfulness: 'Achtsamkeit',
        coaching: 'Coaching',
        nlp: 'NLP',
        habits: 'Gewohnheiten',
        analysis: 'Analyse',
        conflict: 'Konflikt'
    };

    function cards() {
        return Array.prototype.slice.call(document.querySelectorAll('.methods-grid .method-card'));
    }

    function isUsable(card) {
        return !card.hasAttribute('hidden') && card.getAttribute('data-auth-gate') !== 'song-generator' ||
            (card.getAttribute('data-auth-gate') === 'song-generator' && !card.hasAttribute('hidden'));
    }

    function haystack(card) {
        if (card._peHay) return card._peHay;
        var parts = [
            card.getAttribute('data-keywords') || '',
            card.getAttribute('data-category') || '',
            (card.querySelector('h3') || {}).textContent || '',
            (card.querySelector('p') || {}).textContent || ''
        ];
        card.querySelectorAll('.service-features li').forEach(function (li) {
            parts.push(li.textContent);
        });
        card._peHay = parts.join(' ').toLowerCase().replace(/\s+/g, ' ');
        return card._peHay;
    }

    function score(card, q) {
        if (!q) return 1;
        var title = ((card.querySelector('h3') || {}).textContent || '').toLowerCase();
        var keys = (card.getAttribute('data-keywords') || '').toLowerCase();
        var hay = haystack(card);
        if (title.indexOf(q) === 0) return 4;
        if (title.indexOf(q) !== -1) return 3;
        if (keys.indexOf(q) !== -1) return 2;
        if (hay.indexOf(q) !== -1) return 1;
        return 0;
    }

    function apply() {
        var q = state.q;
        var list = cards();
        var visible = 0;
        var usable = 0;
        var byCat = {};

        list.forEach(function (card) {
            var gated = card.hasAttribute('hidden');
            if (gated) {
                card.classList.add('is-filtered');
                card.style.display = 'none';
                return;
            }
            usable += 1;
            var cat = card.getAttribute('data-category') || '';
            byCat[cat] = (byCat[cat] || 0) + 1;
            var s = score(card, q);
            var okCat = state.cat === 'all' || cat === state.cat;
            var show = okCat && s > 0;
            card.classList.toggle('is-filtered', !show);
            card.classList.toggle('is-hit', show && !!q);
            card.style.display = show ? '' : 'none';
            card.style.order = show ? String(20 - s) : '';
            if (show) visible += 1;
        });

        updateChips(byCat, usable);
        updateCount(visible, usable);
        updateEmpty(visible);
        updateClear();
        updateUrl();
    }

    function updateChips(byCat, usable) {
        document.querySelectorAll('.filter-tag[data-category]').forEach(function (chip) {
            var cat = chip.getAttribute('data-category');
            var n = cat === 'all' ? usable : (byCat[cat] || 0);
            chip.classList.toggle('active', state.cat === cat);
            chip.setAttribute('aria-selected', state.cat === cat ? 'true' : 'false');
            var num = chip.querySelector('.pe-chip-n');
            if (!num) {
                num = document.createElement('span');
                num.className = 'pe-chip-n';
                chip.appendChild(num);
            }
            num.textContent = String(n);
            chip.hidden = cat !== 'all' && n === 0 && !state.q;
        });
    }

    function updateCount(visible, usable) {
        var el = document.getElementById('pe-result-count');
        if (!el) return;
        var label = (document.documentElement.lang === 'en') ? 'methods' : 'Methoden';
        if (state.q || state.cat !== 'all') {
            el.innerHTML = '<b>' + visible + '</b> von ' + usable + ' ' + label;
        } else {
            el.innerHTML = '<b>' + usable + '</b> ' + label;
        }
        var hero = document.getElementById('pe-count');
        if (hero) hero.textContent = String(usable);
    }

    function updateEmpty(visible) {
        var grid = document.querySelector('.methods-grid');
        if (!grid) return;
        var empty = document.getElementById('pe-empty');
        if (visible === 0) {
            if (!empty) {
                empty = document.createElement('div');
                empty.id = 'pe-empty';
                empty.className = 'pe-empty';
                empty.innerHTML =
                    '<b>Keine Methode passt zu dieser Suche.</b>' +
                    'Probiere ein anderes Stichwort – oder blättere durch alle Methoden.' +
                    '<br><button type="button" data-pe-reset><i class="fas fa-undo"></i> Alle anzeigen</button>';
                grid.appendChild(empty);
            }
            empty.style.display = '';
        } else if (empty) {
            empty.style.display = 'none';
        }
        var nr = document.getElementById('noResultsMessage');
        if (nr) nr.remove();
        document.querySelectorAll('.similarity-indicator').forEach(function (n) { n.remove(); });
    }

    function updateClear() {
        var clr = document.getElementById('clearSearch');
        if (clr) clr.style.display = state.q ? '' : 'none';
    }

    function updateUrl() {
        if (!window.history || !window.history.replaceState) return;
        try {
            var url = new URL(window.location.href);
            if (state.q) url.searchParams.set('q', state.q); else url.searchParams.delete('q');
            if (state.cat && state.cat !== 'all') url.searchParams.set('cat', state.cat); else url.searchParams.delete('cat');
            window.history.replaceState({}, '', url);
        } catch (e) {}
    }

    function setCat(cat) {
        state.cat = cat || 'all';
        apply();
        var grid = document.getElementById('methods-overview');
        if (grid && window.scrollY > grid.offsetTop - 80) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function setQuery(q) {
        state.q = (q || '').trim().toLowerCase();
        apply();
    }

    function reset() {
        state.q = '';
        state.cat = 'all';
        var inp = document.getElementById('methodSearch');
        if (inp) inp.value = '';
        apply();
    }

    function stickySearch() {
        var box = document.querySelector('.pe-search');
        if (!box) return;
        var hero = document.querySelector('.personality-hero');
        function tick() {
            var y = window.scrollY || 0;
            var threshold = hero ? hero.offsetTop + hero.offsetHeight - 90 : 220;
            box.classList.toggle('is-stuck', y > threshold);
        }
        window.addEventListener('scroll', tick, { passive: true });
        tick();
    }

    function progressBadges() {
        var alias = { 'strengths-analysis': 'strengths-finder' };
        cards().forEach(function (card) {
            var m = (card.getAttribute('onclick') || '').match(/startMethod\('([^']+)'\)/);
            if (!m) return;
            var key = alias[m[1]] || m[1];
            var st = null;
            try { st = JSON.parse(localStorage.getItem('mk_' + key) || 'null'); } catch (e) { st = null; }
            if (!st || typeof st !== 'object') return;
            var step = Number(st.__step || 0);
            var hasData = Object.keys(st).some(function (k) { return k.indexOf('__') !== 0; });
            if (step <= 1 && !hasData) return;
            var old = card.querySelector('.pe-progress');
            if (old) old.remove();
            var b = document.createElement('span');
            b.className = 'pe-progress';
            var en = document.documentElement.lang === 'en';
            b.innerHTML = step > 1
                ? (en ? '<i class="fas fa-play"></i> Started · step ' + step : '<i class="fas fa-play"></i> Begonnen · Schritt ' + step)
                : (en ? '<i class="fas fa-pen"></i> Started' : '<i class="fas fa-pen"></i> Begonnen');
            card.appendChild(b);
        });
    }

    function bind() {
        var inp = document.getElementById('methodSearch');
        var clr = document.getElementById('clearSearch');
        var t = 0;
        if (inp) {
            try {
                var url = new URL(window.location.href);
                var q0 = url.searchParams.get('q') || '';
                var c0 = url.searchParams.get('cat') || 'all';
                if (q0) { inp.value = q0; state.q = q0.toLowerCase(); }
                if (c0) state.cat = c0;
            } catch (e) {}
            inp.addEventListener('input', function () {
                clearTimeout(t);
                var v = this.value;
                t = setTimeout(function () { setQuery(v); }, 80);
            });
            inp.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') { e.preventDefault(); reset(); }
                if (e.key === 'Enter') { e.preventDefault(); setQuery(this.value); }
            });
        }
        if (clr) clr.addEventListener('click', reset);
        document.querySelectorAll('.filter-tag[data-category]').forEach(function (chip) {
            chip.setAttribute('role', 'tab');
            chip.tabIndex = 0;
            chip.addEventListener('click', function () { setCat(chip.getAttribute('data-category')); });
            chip.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCat(chip.getAttribute('data-category')); }
            });
        });
        document.addEventListener('click', function (e) {
            if (e.target && e.target.closest && e.target.closest('[data-pe-reset]')) reset();
        });
        window.addEventListener('storage', function (e) {
            if (e.key && e.key.indexOf('mk_') === 0) progressBadges();
        });
        window.addEventListener('pageshow', progressBadges);
        document.addEventListener('languageChanged', function () {
            cards().forEach(function (c) { c._peHay = null; });
            apply();
        });
    }

    function init() {
        bind();
        stickySearch();
        progressBadges();
        apply();
    }

    window.filterMethods = function (cat) { setCat(cat || 'all'); };
    window.searchMethods = function () {
        var inp = document.getElementById('methodSearch');
        setQuery(inp ? inp.value : '');
    };
    window.clearSearch = reset;
    window.resetFilters = reset;
    window.initializeSearchAndFilter = init;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
