/**
 * FinanzenSection – Admin-Finanzmodul.
 * Lädt/speichert das Finanz-Dokument dauerhaft in DynamoDB (API Gateway Direct-Integration,
 * Cognito-gesichert) und rendert Überblick, Cashflow, Kredite, Portfolio, Sparziele und Coach.
 */
(function () {
  'use strict';

  var API_DEFAULT = 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';
  var V1_API = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
  var CACHE_KEY = 'admin_finance_doc';

  // Beliebte Kryptos -> CoinGecko-IDs (für Live-Kurse ohne API-Key).
  var CG_IDS = {
    btc: 'bitcoin', xbt: 'bitcoin', eth: 'ethereum', sol: 'solana', ada: 'cardano',
    xrp: 'ripple', dot: 'polkadot', doge: 'dogecoin', ltc: 'litecoin', bnb: 'binancecoin',
    matic: 'matic-network', link: 'chainlink', avax: 'avalanche-2', atom: 'cosmos',
    usdt: 'tether', usdc: 'usd-coin', trx: 'tron', xmr: 'monero'
  };

  function E() { return window.FinanceEngine; }
  function uid() { return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function eur(v) { return E().fmtEur(v); }
  function pct(v) { return (v == null ? '–' : Math.round(v * 100) + '%'); }

  function FinanzenSection() {
    this.initialized = false;
    this.doc = null;
    this.prices = {};
    this.activeTab = 'overview';
    this._charts = {};
    this._saveTimer = null;
    this._boundClick = null;
    this._boundChange = null;
  }

  FinanzenSection.prototype.init = function () {
    if (this.initialized) { this.load(); return; }
    var self = this;
    var tries = 0;
    (function wait() {
      var root = document.querySelector('.finanzen-section');
      if (!root) { if (tries++ < 50) return setTimeout(wait, 100); return; }
      self._attach(root);
      self.initialized = true;
      self.load();
    })();
  };

  FinanzenSection.prototype._attach = function (root) {
    var self = this;
    // Tabs
    root.querySelectorAll('.fin-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { self.switchTab(btn.getAttribute('data-fintab')); });
    });
    var reload = root.querySelector('#fin-reload-btn');
    if (reload) reload.addEventListener('click', function () { self.load(true); });

    // Event-Delegation für alle Panes
    this._boundClick = function (e) { self._onClick(e); };
    this._boundChange = function (e) { self._onChange(e); };
    root.addEventListener('click', this._boundClick);
    root.addEventListener('change', this._boundChange);
  };

  // ---------------- Persistenz ----------------
  FinanzenSection.prototype.getApiBase = function () {
    return (window.AWS_CONFIG && (window.AWS_CONFIG.apiBaseUrl ||
      (window.AWS_CONFIG.apiGateway && window.AWS_CONFIG.apiGateway.baseUrl))) || API_DEFAULT;
  };

  FinanzenSection.prototype._token = function () {
    var s = window.adminAuth && window.adminAuth.getSession && window.adminAuth.getSession();
    return s && s.idToken;
  };

  FinanzenSection.prototype.apiFetch = function (path, options) {
    options = options || {};
    var token = this._token();
    if (!token) return Promise.reject(new Error('Admin-Session fehlt – bitte erneut anmelden'));
    return fetch(this.getApiBase() + path, Object.assign({}, options, {
      headers: Object.assign({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }, options.headers || {})
    })).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error((data && (data.error || data.message)) || ('API-Fehler ' + res.status));
        return data;
      });
    });
  };

  FinanzenSection.prototype._defaultDoc = function () {
    return {
      settings: { currency: 'EUR', emergencyFundTargetMonths: 3, extraDebtPayment: 0, cashBalance: 0, basis: 'actual', appliedDebtTx: {}, autoCashBalance: true, accountBalances: {} },
      incomes: [], expenses: [], transactions: [], debts: [], holdings: [], goals: [], coachNotes: [],
      plan: { northStar: '', startDate: '', baselineDebt: 0, seeded: false, milestones: [] }
    };
  };

  // Persönliche Sanierungs-Vorlage – Phasen, Meilensteine & Motivationsanreize, abgestimmt auf Manuel.
  // Nur Struktur/Ziele, keine sensiblen Ist-Beträge: Fortschritt rechnet sich aus den echten Daten.
  FinanzenSection.prototype._planTemplate = function () {
    function m(phase, title, desc, metric, target, reward) {
      return { id: uid(), phase: phase, title: title, desc: desc, metric: metric, target: target, done: false, reward: reward, rewardClaimed: false };
    }
    return [
      m('1 · Stabilisieren', 'Liquidität sichern', 'Konto wieder im Plus, monatlich bleibt etwas übrig – kein neues Kredit-Hopping.', 'cashflowPositive', 0,
        'Ein bewusst entspannter Sonntag ohne Geld-Gedanken (Spaziergang + gutes Essen zu Hause).'),
      m('1 · Stabilisieren', 'Voller Überblick', 'Alle Schulden, Zinsen, Raten & Fristen erfasst – das Schlimmste ist die Ungewissheit.', 'manual', 0,
        'Lieblingskaffee + Haken dran. Du hast die Kontrolle zurück.'),
      m('2 · Kontrolle gewinnen', 'München neutralisiert', 'Untervermietung deckt die Münchner Miete dauerhaft – sauber & mit schriftlicher Erlaubnis (Hund geklärt).', 'manual', 0,
        'Ein Beachvolleyball-Abend mit Freunden.'),
      m('2 · Kontrolle gewinnen', 'Ratenpläne stehen', 'Mit allen Gläubigern realistische Raten schriftlich vereinbart – kein offenes Inkasso, keine Betreibung.', 'manual', 0,
        'Ein Feierabend-Apéro ohne schlechtes Gewissen.'),
      m('2 · Kontrolle gewinnen', 'Beratung an Bord', 'Termin bei gemeinnütziger Schuldenberatung im Kanton Zürich wahrgenommen.', 'manual', 0,
        'Ein freier Nachmittag nur für dich.'),
      m('3 · Schulden drücken', 'Teure Schulden weg', 'Beide gekündigten Kreditkarten (höchste Zinsen) vollständig getilgt.', 'manual', 0,
        'Ein schönes Essen auswärts – bewusst genießen.'),
      m('3 · Schulden drücken', 'Unter 100\u2019000', 'Gesamtschulden erstmals unter 100\u2019000 CHF.', 'debtBelow', 100000,
        'Ein Wochenend-Trip mit dem Wohnmobil (nah & günstig).'),
      m('3 · Schulden drücken', 'Halbzeit', 'Gesamtschulden unter 50\u2019000 CHF – der Berg wird kleiner.', 'debtBelow', 50000,
        'Ein größerer Wohnmobil-Trip oder ein Konzert.'),
      m('4 · Freiheit', 'Notgroschen Stufe 1', 'Ein Monat Ausgaben als Sicherheitspuffer auf der Seite.', 'emergencyMonths', 1,
        'Etwas Bleibendes, das dir lange Freude macht (bewusst gewählt).'),
      m('4 · Freiheit', 'Schuldenfrei 🎉', 'Alle Kredite getilgt. Das große Ziel ist erreicht.', 'debtFree', 0,
        'Die große Belohnung – worauf du die ganze Zeit hingearbeitet hast.'),
      m('4 · Freiheit', 'Sicherheitspuffer', 'Notgroschen 3–6 Monatsausgaben – und der erste ETF-Sparplan läuft.', 'emergencyMonths', 3,
        'Ruhe & Stolz. Ab jetzt baust du Vermögen auf statt Schulden ab.')
    ];
  };

  FinanzenSection.prototype._normalize = function (doc) {
    var d = doc && typeof doc === 'object' ? doc : {};
    var def = this._defaultDoc();
    d.settings = Object.assign(def.settings, d.settings || {});
    ['incomes', 'expenses', 'transactions', 'debts', 'holdings', 'goals', 'coachNotes'].forEach(function (k) {
      if (!Array.isArray(d[k])) d[k] = [];
    });
    d.plan = Object.assign({ northStar: '', startDate: '', baselineDebt: 0, seeded: false, milestones: [] }, d.plan || {});
    if (!Array.isArray(d.plan.milestones)) d.plan.milestones = [];
    // Erstbefüllung: Vorlage nur einmal laden, danach frei editierbar (kein erneutes Seeding).
    if (!d.plan.seeded && !d.plan.milestones.length) {
      d.plan.milestones = this._planTemplate();
      d.plan.seeded = true;
      if (!d.plan.northStar) d.plan.northStar = 'Schuldenfrei und finanziell frei – mit ruhigem Kopf und Spielraum für die Dinge, die mir wichtig sind.';
      if (!d.plan.startDate) d.plan.startDate = new Date().toISOString().slice(0, 10);
    }
    return d;
  };

  FinanzenSection.prototype.load = function (force) {
    var self = this;
    // Cache zuerst (schnelle Anzeige)
    if (!this.doc) {
      try {
        var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached) { this.doc = this._normalize(cached); }
      } catch (e) { /* ignore */ }
    }
    if (this.doc && !force) this._renderAll();

    this.apiFetch('/finance').then(function (resp) {
      var remote = resp && resp.data;
      if (remote) {
        self.doc = self._normalize(remote);
      } else if (!self.doc) {
        self.doc = self._defaultDoc();
      }
      self._cache();
      self._renderAll();
      self._refreshCryptoPrices();
      self._refreshStockPrices();
    }).catch(function (err) {
      console.warn('[Finanzen] Laden fehlgeschlagen:', err.message);
      if (!self.doc) self.doc = self._defaultDoc();
      self._renderAll();
      self._setStatus('offline', 'Offline – lokal gespeichert');
    });
  };

  FinanzenSection.prototype._cache = function () {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(this.doc)); } catch (e) { /* ignore */ }
  };

  FinanzenSection.prototype.save = function () {
    var self = this;
    this._cache();
    this._setStatus('saving', 'Speichere …');
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(function () {
      self.apiFetch('/finance', {
        method: 'PUT',
        body: JSON.stringify({ data: JSON.stringify(self.doc) })
      }).then(function () {
        self._setStatus('saved', 'Gespeichert ✓');
      }).catch(function (err) {
        console.warn('[Finanzen] Speichern fehlgeschlagen:', err.message);
        self._setStatus('error', 'Nicht gespeichert (lokal gesichert)');
      });
    }, 700);
  };

  FinanzenSection.prototype._setStatus = function (cls, text) {
    var el = document.getElementById('fin-save-status');
    if (!el) return;
    el.className = 'fin-save-status fin-status-' + cls;
    el.textContent = text;
    if (cls === 'saved') {
      setTimeout(function () { if (el.textContent === text) el.textContent = ''; }, 2500);
    }
  };

  // ---------------- Collection-Helfer ----------------
  FinanzenSection.prototype._add = function (coll, item) {
    item.id = item.id || uid();
    this.doc[coll].push(item);
    this.save();
    this._renderAll();
  };
  FinanzenSection.prototype._remove = function (coll, id) {
    this.doc[coll] = this.doc[coll].filter(function (x) { return x.id !== id; });
    this.save();
    this._renderAll();
  };
  FinanzenSection.prototype._update = function (coll, id, field, value) {
    var it = this.doc[coll].find(function (x) { return x.id === id; });
    if (!it) return;
    if (field === 'essential') it[field] = !!value;
    else if (['amount', 'balance', 'apr', 'minPayment', 'quantity', 'avgBuyPrice', 'target', 'saved', 'lastPrice', 'cashBalance', 'extraDebtPayment', 'emergencyFundTargetMonths'].indexOf(field) >= 0) it[field] = E().num(value);
    else it[field] = value;
    this.save();
  };
  FinanzenSection.prototype._updateSetting = function (field, value) {
    if (['cashBalance', 'extraDebtPayment', 'emergencyFundTargetMonths'].indexOf(field) >= 0) this.doc.settings[field] = E().num(value);
    else this.doc.settings[field] = value;
    this.save();
    this._recalc();
  };

  // ---------------- Events ----------------
  FinanzenSection.prototype._onClick = function (e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    var coll = t.getAttribute('data-coll');
    var id = t.getAttribute('data-id');

    if (act === 'del') { this._remove(coll, id); return; }
    if (act === 'add-row') { this._handleAdd(coll, t); return; }
    if (act === 'refresh-prices') { this._refreshCryptoPrices(true); return; }
    if (act === 'refresh-stocks') { this._refreshStockPrices(true); return; }
    if (act === 'ai-coach') { this._runAiCoach(); return; }
    if (act === 'set-strategy') {
      this.doc.settings.payoffStrategy = t.getAttribute('data-strategy');
      this.save(); this._recalc(); return;
    }
    if (act === 'set-basis') {
      this.doc.settings.basis = t.getAttribute('data-basis');
      this.save(); this._renderAll(); return;
    }
    // --- PDF-Import ---
    if (act === 'import-confirm') { this._confirmImport(); return; }
    if (act === 'import-clear') { this._importItems = null; this._importStatements = null; this._renderTransactions(); return; }
    if (act === 'import-tips') {
      var self = this; this.switchTab('coach'); setTimeout(function () { self._runAiCoach(); }, 60); return;
    }
    // --- Sanierungsplan ---
    if (act === 'ms-toggle') { this._toggleMilestoneDone(t.getAttribute('data-ms-id')); return; }
    if (act === 'ms-claim') { this._toggleMilestoneReward(t.getAttribute('data-ms-id')); return; }
    if (act === 'ms-del') { this._removeMilestone(t.getAttribute('data-ms-id')); return; }
    if (act === 'ms-add') { this._addMilestone(t); return; }
    if (act === 'plan-baseline') { this.doc.plan.baselineDebt = E().totalDebt(this.doc); this.save(); this._renderPlan(); return; }
    if (act === 'plan-template') {
      if (window.confirm('Vorlage neu laden? Bestehende Meilensteine werden ersetzt.')) {
        this.doc.plan.milestones = this._planTemplate();
        this.doc.plan.seeded = true;
        this.save(); this._renderPlan();
      }
      return;
    }
  };

  FinanzenSection.prototype._onChange = function (e) {
    var el = e.target;
    if (el.type === 'file' && el.getAttribute('data-import') === 'pdf') {
      this._importPdfs(el.files); el.value = ''; return;
    }
    if (el.getAttribute && el.getAttribute('data-import') === 'redact') {
      this._importRedact = el.checked; return;
    }
    if (el.hasAttribute && el.hasAttribute('data-imp-idx')) {
      var idx = parseInt(el.getAttribute('data-imp-idx'), 10);
      if (this._importItems && this._importItems[idx]) this._importItems[idx].checked = el.checked;
      this._updateImportCount(); return;
    }
    if (el.hasAttribute && el.hasAttribute('data-plan-field')) {
      this._updatePlan(el.getAttribute('data-plan-field'), el.value);
      return;
    }
    if (el.hasAttribute && el.hasAttribute('data-ms-id')) {
      this._updateMilestone(el.getAttribute('data-ms-id'), el.getAttribute('data-ms-field'), el.value);
      return;
    }
    if (el.hasAttribute && el.hasAttribute('data-setting')) {
      this._updateSetting(el.getAttribute('data-setting'), el.type === 'checkbox' ? el.checked : el.value);
      return;
    }
    if (!el.hasAttribute || !el.hasAttribute('data-coll')) return;
    var coll = el.getAttribute('data-coll');
    var id = el.getAttribute('data-id');
    var field = el.getAttribute('data-field');
    if (!coll || !id || !field) return;
    this._update(coll, id, field, el.type === 'checkbox' ? el.checked : el.value);
    // Gezieltes Teil-Update (kein komplettes Pane-Rerender -> kein Fokus-/Scrollverlust)
    this._recalc();
  };

  FinanzenSection.prototype._handleAdd = function (coll, btn) {
    var box = btn.closest('.fin-addform');
    if (!box) return;
    var item = {};
    box.querySelectorAll('[data-new]').forEach(function (inp) {
      var f = inp.getAttribute('data-new');
      if (inp.type === 'checkbox') item[f] = inp.checked;
      else item[f] = inp.value;
    });
    // Minimalvalidierung
    if (coll === 'transactions') {
      if (!E().num(item.amount)) { var a = box.querySelector('[data-new="amount"]'); if (a) a.focus(); return; }
    } else {
      var label = item.label || item.name || item.symbol;
      if (!label) { box.querySelector('[data-new]').focus(); return; }
    }
    this._add(coll, item);
  };

  // ---------------- Tab-Wechsel ----------------
  FinanzenSection.prototype.switchTab = function (tab) {
    this.activeTab = tab;
    document.querySelectorAll('.fin-tab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-fintab') === tab);
    });
    document.querySelectorAll('.fin-pane').forEach(function (p) {
      p.hidden = (p.id !== 'fintab-' + tab);
    });
    this._renderActive();
  };

  // ---------------- Rendering ----------------
  FinanzenSection.prototype._renderAll = function () {
    if (!this.doc) return;
    this._renderKpis();
    this._renderActive();
  };

  FinanzenSection.prototype._renderActive = function () {
    var map = {
      overview: '_renderOverview', plan: '_renderPlan', cashflow: '_renderCashflow', transactions: '_renderTransactions',
      debts: '_renderDebts', portfolio: '_renderPortfolio', goals: '_renderGoals', coach: '_renderCoach'
    };
    var fn = map[this.activeTab];
    if (fn && this[fn]) this[fn]();
  };

  /**
   * These 1: Gezieltes Teil-Update statt komplettes Pane-Rerender.
   * Aktualisiert KPIs + nur die abgeleiteten Anzeige-Elemente (Summen, Zeilenwerte,
   * Strategie-Karten, Charts) ohne die Eingabefelder neu zu erzeugen (kein Fokus-/Scrollverlust).
   */
  FinanzenSection.prototype._recalc = function () {
    if (!this.doc) return;
    var d = this.doc, eng = E(), self = this;
    this._renderKpis();
    var tab = this.activeTab;
    function setTxt(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }

    if (tab === 'overview') { this._renderOverview(); return; }
    if (tab === 'plan') { this._renderPlan(); return; }
    if (tab === 'coach') { return; }
    if (tab === 'transactions') { this._renderTransactions(); return; }

    if (tab === 'cashflow') {
      setTxt('fin-inc-sum', eur(eng.monthlyIncome(d)) + ' / Monat');
      setTxt('fin-exp-sum', eur(eng.monthlyExpenses(d)) + ' / Monat');
      d.incomes.concat(d.expenses).forEach(function (it) {
        var c = document.querySelector('[data-rowmonthly="' + it.id + '"]');
        if (c) c.textContent = eur(eng.toMonthly(it.amount, it.frequency));
      });
    } else if (tab === 'debts') {
      setTxt('fin-debt-sum', eur(eng.totalDebt(d)));
      var box = document.getElementById('fin-strats-box');
      if (box) box.innerHTML = this._stratsBoxHtml(d);
    } else if (tab === 'portfolio') {
      var totalVal = eng.portfolioValue(d.holdings, this.prices);
      var totalGain = totalVal - eng.portfolioCost(d.holdings);
      var ps = document.getElementById('fin-port-sum');
      if (ps) { ps.textContent = eur(totalVal) + ' (' + (totalGain >= 0 ? '+' : '') + eur(totalGain) + ')'; ps.className = 'fin-sum ' + (totalGain >= 0 ? 'good' : 'bad'); }
      d.holdings.forEach(function (h) {
        var key = (h.assetType + ':' + h.symbol).toLowerCase();
        var price = self.prices[key] != null ? self.prices[key] : h.lastPrice;
        var val = eng.holdingValue(h, price), cost = eng.holdingCost(h), gain = val - cost, gp = cost > 0 ? gain / cost : 0;
        var vc = document.querySelector('[data-rowval="' + h.id + '"]'); if (vc) vc.textContent = eur(val);
        var gc = document.querySelector('[data-rowgain="' + h.id + '"]'); if (gc) { gc.textContent = eur(gain) + ' (' + pct(gp) + ')'; gc.className = 'num ' + (gain >= 0 ? 'good' : 'bad'); }
      });
      this._drawAllocChart();
    } else if (tab === 'goals') {
      var em = eng.emergencyMonths(d);
      var ln = document.getElementById('fin-em-line');
      if (ln) { ln.textContent = (em == null ? '–' : em.toFixed(1) + ' Monate'); ln.className = (em != null && em >= 3 ? 'good' : 'warn'); }
      d.goals.forEach(function (g) {
        var prog = eng.num(g.target) > 0 ? Math.min(1, eng.num(g.saved) / eng.num(g.target)) : 0;
        var bar = document.querySelector('[data-goalbar="' + g.id + '"]'); if (bar) bar.style.width = Math.round(prog * 100) + '%';
        var sub = document.querySelector('[data-goalsub="' + g.id + '"]'); if (sub) sub.textContent = Math.round(prog * 100) + '% erreicht';
      });
    }
  };

  FinanzenSection.prototype._renderKpis = function () {
    var d = this.doc, eng = E();
    var box = document.getElementById('fin-kpis');
    if (!box) return;
    var cf = eng.effCashflow(d);
    var nw = eng.netWorth(d, this.prices);
    var debt = eng.totalDebt(d);
    var sr = eng.effSavingsRate(d);
    var score = eng.healthScore(d);
    var cmp = eng.comparePayoff(d);
    var freeDate = cmp.avalanche.payoffDate;
    var basisActual = eng.basisOf(d) !== 'plan' && eng.hasActuals(d);
    var cfSub = 'Sparquote ' + pct(sr) + (basisActual ? ' · Ist (Ø 3 Mon.)' : ' · Plan');

    function card(label, value, sub, tone) {
      return '<div class="fin-kpi ' + (tone || '') + '">' +
        '<div class="fin-kpi-label">' + label + '</div>' +
        '<div class="fin-kpi-value">' + value + '</div>' +
        '<div class="fin-kpi-sub">' + (sub || '') + '</div></div>';
    }
    box.innerHTML =
      card('Nettovermögen', eur(nw), nw >= 0 ? 'Vermögen − Schulden' : 'Schulden überwiegen', nw >= 0 ? 'good' : 'bad') +
      card('Cashflow / Monat', eur(cf), cfSub, cf >= 0 ? 'good' : 'bad') +
      card('Gesamtschulden', eur(debt), debt > 0 ? ('Ø ' + eng.weightedApr(d).toFixed(1) + '% Zins') : 'Schuldenfrei 🎉', debt > 0 ? 'warn' : 'good') +
      card('Schuldenfrei', freeDate ? freeDate.toLocaleDateString('de-CH', { month: 'short', year: 'numeric' }) : (debt > 0 ? 'nie (Raten zu niedrig)' : '–'), freeDate ? 'mit Avalanche-Strategie' : '', freeDate || debt === 0 ? 'good' : 'bad') +
      card('Finanz-Score', score.total + '/100', score.rating, score.total >= 60 ? 'good' : score.total >= 40 ? 'warn' : 'bad');
  };

  // ---- Wiederverwendbare Zeilen-/Formular-Bausteine ----
  function freqOptions(sel) {
    var opts = [['monthly', 'monatlich'], ['yearly', 'jährlich'], ['quarterly', 'quartalsweise'], ['weekly', 'wöchentlich'], ['once', 'einmalig']];
    return opts.map(function (o) { return '<option value="' + o[0] + '"' + (sel === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('');
  }
  function inp(coll, id, field, value, type, attrs) {
    return '<input class="fin-inp" data-coll="' + coll + '" data-id="' + id + '" data-field="' + field + '" type="' + (type || 'text') + '" value="' + esc(value) + '" ' + (attrs || '') + '>';
  }
  function newInp(field, ph, type, attrs) {
    return '<input class="fin-inp" data-new="' + field + '" type="' + (type || 'text') + '" placeholder="' + esc(ph) + '" ' + (attrs || '') + '>';
  }
  function delBtn(coll, id) {
    return '<button class="fin-icon-btn danger" data-act="del" data-coll="' + coll + '" data-id="' + id + '" title="Löschen"><i class="fas fa-trash"></i></button>';
  }

  FinanzenSection.prototype._renderOverview = function () {
    var d = this.doc, eng = E();
    var pane = document.getElementById('fintab-overview');
    if (!pane) return;
    var score = eng.healthScore(d);
    var b = eng.effBudget503020(d);
    var basis = eng.basisOf(d);
    function basisBtn(key, label) {
      return '<button class="fin-basis-btn ' + (basis === key ? 'active' : '') + '" data-act="set-basis" data-basis="' + key + '">' + label + '</button>';
    }
    var basisToggle = '<div class="fin-basis-toggle"><span class="fin-hint">Berechnung:</span>' +
      basisBtn('actual', 'Ist (echte Buchungen)') + basisBtn('plan', 'Plan (manuell)') + '</div>';

    var scoreBars = score.parts.map(function (p) {
      var w = Math.round(p.score / p.max * 100);
      var valTxt = p.key === 'savingsRate' ? pct(p.value)
        : p.key === 'emergency' ? (p.value == null ? '–' : p.value.toFixed(1) + ' Mon.')
          : p.key === 'dti' ? (p.value == null ? '–' : pct(p.value))
            : eur(p.value);
      return '<div class="fin-scorebar"><div class="fin-scorebar-top"><span>' + p.label + '</span><span>' + valTxt + '</span></div>' +
        '<div class="fin-bar"><div class="fin-bar-fill" style="width:' + w + '%"></div></div></div>';
    }).join('');

    function budgetRow(label, o) {
      var over = o.actual > o.target;
      return '<div class="fin-budget-row"><span>' + label + '</span>' +
        '<span class="' + (over ? 'bad' : 'good') + '">' + eur(o.actual) + ' / ' + eur(o.target) + '</span></div>';
    }

    pane.innerHTML =
      basisToggle +
      '<div class="fin-grid2">' +
        '<div class="fin-card">' +
          '<h3>Finanz-Gesundheit <span class="fin-score-pill ' + (score.total >= 60 ? 'good' : score.total >= 40 ? 'warn' : 'bad') + '">' + score.total + '/100 · ' + score.rating + '</span></h3>' +
          scoreBars +
        '</div>' +
        '<div class="fin-card">' +
          '<h3>Budget 50/30/20</h3>' +
          budgetRow('Bedürfnisse (50%)', b.needs) +
          budgetRow('Wünsche (30%)', b.wants) +
          budgetRow('Sparen/Tilgen (20%)', b.savings) +
          '<p class="fin-hint">Markiere Ausgaben als „essenziell", damit die Aufteilung stimmt.</p>' +
        '</div>' +
      '</div>' +
      '<div class="fin-grid2">' +
        '<div class="fin-card"><h3>Ausgaben nach Kategorie</h3><canvas id="fin-chart-cat" height="220"></canvas></div>' +
        '<div class="fin-card"><h3>Schulden-Tilgungskurve</h3><canvas id="fin-chart-debt" height="220"></canvas></div>' +
      '</div>' +
      '<div class="fin-card"><h3>Top-Empfehlungen</h3>' + this._insightsHtml(eng.insights(d).slice(0, 3)) + '</div>';

    this._drawCharts();
  };

  FinanzenSection.prototype._insightsHtml = function (list) {
    if (!list || !list.length) return '<p class="fin-hint">Keine akuten Hinweise – trage mehr Daten ein für Analysen.</p>';
    return '<ul class="fin-insights">' + list.map(function (i) {
      return '<li class="fin-insight ' + i.severity + '"><strong>' + esc(i.title) + '</strong><span>' + esc(i.text) + '</span></li>';
    }).join('') + '</ul>';
  };

  FinanzenSection.prototype._drawCharts = function () {
    var d = this.doc, eng = E(), self = this;
    if (typeof window.Chart === 'undefined') return;
    Object.keys(this._charts).forEach(function (k) { try { self._charts[k].destroy(); } catch (e) {} });
    this._charts = {};

    var catEl = document.getElementById('fin-chart-cat');
    if (catEl) {
      var byCat = eng.effExpenseByCategory(d);
      var labels = Object.keys(byCat);
      if (labels.length) {
        this._charts.cat = new Chart(catEl, {
          type: 'doughnut',
          data: { labels: labels, datasets: [{ data: labels.map(function (l) { return Math.round(byCat[l]); }) }] },
          options: { plugins: { legend: { position: 'bottom' } } }
        });
      } else { catEl.parentNode.insertAdjacentHTML('beforeend', '<p class="fin-hint">Noch keine Ausgaben erfasst.</p>'); }
    }

    var debtEl = document.getElementById('fin-chart-debt');
    if (debtEl) {
      var cmp = eng.comparePayoff(d);
      var av = cmp.avalanche.schedule || [];
      if (av.length) {
        this._charts.debt = new Chart(debtEl, {
          type: 'line',
          data: {
            labels: av.map(function (p) { return p.month; }),
            datasets: [{ label: 'Restschuld (€)', data: av.map(function (p) { return Math.round(p.remaining); }), fill: true, tension: 0.25 }]
          },
          options: { plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'Monat' } } } }
        });
      } else { debtEl.parentNode.insertAdjacentHTML('beforeend', '<p class="fin-hint">Keine Kredite erfasst.</p>'); }
    }
  };

  FinanzenSection.prototype._renderCashflow = function () {
    var d = this.doc, eng = E();
    var pane = document.getElementById('fintab-cashflow');
    if (!pane) return;

    var incRows = d.incomes.map(function (it) {
      return '<tr><td>' + inp('incomes', it.id, 'label', it.label, 'text') + '</td>' +
        '<td>' + inp('incomes', it.id, 'amount', it.amount, 'number', 'step="any" min="0"') + '</td>' +
        '<td><select class="fin-inp" data-coll="incomes" data-id="' + it.id + '" data-field="frequency">' + freqOptions(it.frequency) + '</select></td>' +
        '<td>' + inp('incomes', it.id, 'category', it.category || '', 'text') + '</td>' +
        '<td class="num" data-rowmonthly="' + it.id + '">' + eur(eng.toMonthly(it.amount, it.frequency)) + '</td>' +
        '<td>' + delBtn('incomes', it.id) + '</td></tr>';
    }).join('');

    var expRows = d.expenses.map(function (it) {
      return '<tr><td>' + inp('expenses', it.id, 'label', it.label, 'text') + '</td>' +
        '<td>' + inp('expenses', it.id, 'amount', it.amount, 'number', 'step="any" min="0"') + '</td>' +
        '<td><select class="fin-inp" data-coll="expenses" data-id="' + it.id + '" data-field="frequency">' + freqOptions(it.frequency) + '</select></td>' +
        '<td>' + inp('expenses', it.id, 'category', it.category || '', 'text') + '</td>' +
        '<td><input type="checkbox" data-coll="expenses" data-id="' + it.id + '" data-field="essential"' + (it.essential ? ' checked' : '') + '></td>' +
        '<td class="num" data-rowmonthly="' + it.id + '">' + eur(eng.toMonthly(it.amount, it.frequency)) + '</td>' +
        '<td>' + delBtn('expenses', it.id) + '</td></tr>';
    }).join('');

    pane.innerHTML =
      '<div class="fin-card"><h3>Einnahmen <span class="fin-sum good" id="fin-inc-sum">' + eur(eng.monthlyIncome(d)) + ' / Monat</span></h3>' +
        '<table class="fin-table"><thead><tr><th>Quelle</th><th>Betrag</th><th>Rhythmus</th><th>Kategorie</th><th class="num">≈ €/Monat</th><th></th></tr></thead>' +
        '<tbody>' + (incRows || '') + '</tbody></table>' +
        '<div class="fin-addform"><input class="fin-inp" data-new="label" type="text" placeholder="z. B. Gehalt"> ' +
          newInp('amount', 'Betrag', 'number', 'step="any" min="0"') +
          '<select class="fin-inp" data-new="frequency">' + freqOptions('monthly') + '</select>' +
          newInp('category', 'Kategorie') +
          '<button class="btn btn-primary btn-sm" data-act="add-row" data-coll="incomes"><i class="fas fa-plus"></i> Einnahme</button></div>' +
      '</div>' +
      '<div class="fin-card"><h3>Ausgaben <span class="fin-sum bad" id="fin-exp-sum">' + eur(eng.monthlyExpenses(d)) + ' / Monat</span></h3>' +
        '<table class="fin-table"><thead><tr><th>Posten</th><th>Betrag</th><th>Rhythmus</th><th>Kategorie</th><th>essenziell</th><th class="num">≈ €/Monat</th><th></th></tr></thead>' +
        '<tbody>' + (expRows || '') + '</tbody></table>' +
        '<div class="fin-addform"><input class="fin-inp" data-new="label" type="text" placeholder="z. B. Miete"> ' +
          newInp('amount', 'Betrag', 'number', 'step="any" min="0"') +
          '<select class="fin-inp" data-new="frequency">' + freqOptions('monthly') + '</select>' +
          newInp('category', 'Kategorie') +
          '<label class="fin-check"><input type="checkbox" data-new="essential"> essenziell</label>' +
          '<button class="btn btn-primary btn-sm" data-act="add-row" data-coll="expenses"><i class="fas fa-plus"></i> Ausgabe</button></div>' +
      '</div>';
  };

  // ---- These 3: Buchungen (Ist-Werte) + Monatsvergleich ----
  FinanzenSection.prototype._renderTransactions = function () {
    var d = this.doc, eng = E();
    var pane = document.getElementById('fintab-transactions');
    if (!pane) return;

    var now = new Date();
    var ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    var monthLabel = now.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' });
    var monthTx = d.transactions.filter(function (t) { return (t.date || '').slice(0, 7) === ym; });
    var istIn = monthTx.filter(function (t) { return t.type === 'income'; }).reduce(function (s, t) { return s + eng.num(t.amount); }, 0);
    var istEx = monthTx.filter(function (t) { return t.type === 'expense'; }).reduce(function (s, t) { return s + eng.num(t.amount); }, 0);
    var planIn = eng.monthlyIncome(d), planEx = eng.monthlyExpenses(d);

    function cmpCard(label, ist, plan, goodWhenAbove) {
      var diff = ist - plan;
      var ok = goodWhenAbove ? diff >= 0 : diff <= 0;
      return '<div class="fin-kpi"><div class="fin-kpi-label">' + label + '</div>' +
        '<div class="fin-kpi-value">' + eur(ist) + '</div>' +
        '<div class="fin-kpi-sub">Plan ' + eur(plan) + ' · <span class="' + (ok ? 'good' : 'bad') + '">' + (diff >= 0 ? '+' : '') + eur(diff) + '</span></div></div>';
    }

    var sorted = d.transactions.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var rows = sorted.map(function (t) {
      return '<tr><td>' + inp('transactions', t.id, 'date', t.date || '', 'date') + '</td>' +
        '<td><select class="fin-inp" data-coll="transactions" data-id="' + t.id + '" data-field="type">' +
          '<option value="expense"' + (t.type !== 'income' ? ' selected' : '') + '>Ausgabe</option>' +
          '<option value="income"' + (t.type === 'income' ? ' selected' : '') + '>Einnahme</option></select></td>' +
        '<td>' + inp('transactions', t.id, 'amount', t.amount, 'number', 'step="any" min="0"') + '</td>' +
        '<td>' + inp('transactions', t.id, 'category', t.category || '', 'text') + '</td>' +
        '<td>' + inp('transactions', t.id, 'note', t.note || '', 'text') + '</td>' +
        '<td>' + delBtn('transactions', t.id) + '</td></tr>';
    }).join('');

    var today = ym + '-' + String(now.getDate()).padStart(2, '0');
    pane.innerHTML =
      this._importCardHtml() +
      '<div class="fin-card"><h3>Monatsvergleich · ' + monthLabel + '</h3>' +
        '<div class="fin-kpis" style="margin:.5rem 0 0">' +
          cmpCard('Ist-Einnahmen', istIn, planIn, true) +
          cmpCard('Ist-Ausgaben', istEx, planEx, false) +
          '<div class="fin-kpi"><div class="fin-kpi-label">Ist-Saldo</div><div class="fin-kpi-value ' + ((istIn - istEx) >= 0 ? 'good' : 'bad') + '">' + eur(istIn - istEx) + '</div><div class="fin-kpi-sub">' + monthTx.length + ' Buchungen</div></div>' +
        '</div>' +
        '<p class="fin-hint">„Plan" = deine laufenden Einnahmen/Ausgaben. „Ist" = tatsächliche Buchungen in diesem Monat.</p></div>' +
      '<div class="fin-card"><h3>Buchungen</h3>' +
        '<table class="fin-table"><thead><tr><th>Datum</th><th>Art</th><th>Betrag</th><th>Kategorie</th><th>Notiz</th><th></th></tr></thead>' +
        '<tbody>' + (rows || '') + '</tbody></table>' +
        '<div class="fin-addform">' +
          '<input class="fin-inp" data-new="date" type="date" value="' + today + '">' +
          '<select class="fin-inp" data-new="type"><option value="expense">Ausgabe</option><option value="income">Einnahme</option></select>' +
          newInp('amount', 'Betrag', 'number', 'step="any" min="0"') + newInp('category', 'Kategorie') + newInp('note', 'Notiz') +
          '<button class="btn btn-primary btn-sm" data-act="add-row" data-coll="transactions"><i class="fas fa-plus"></i> Buchung</button></div>' +
        (sorted.length ? '' : '<p class="fin-hint">Noch keine Buchungen erfasst.</p>') +
      '</div>';
  };

  FinanzenSection.prototype._stratsBoxHtml = function (d) {
    var eng = E(), cmp = eng.comparePayoff(d);
    function strat(key, label) {
      var active = (d.settings.payoffStrategy || 'avalanche') === key;
      var r = cmp[key];
      var when = r.neverPaysOff ? 'nie' : (r.months + ' Mon. · ' + (r.payoffDate ? r.payoffDate.toLocaleDateString('de-CH', { month: 'short', year: 'numeric' }) : ''));
      return '<button class="fin-strat ' + (active ? 'active' : '') + '" data-act="set-strategy" data-strategy="' + key + '">' +
        '<div class="fin-strat-name">' + label + '</div>' +
        '<div class="fin-strat-when">' + when + '</div>' +
        '<div class="fin-strat-int">Zinsen: ' + eur(r.totalInterest) + '</div></button>';
    }
    var savedTxt = cmp.interestSaved != null && cmp.interestSaved > 0
      ? '<div class="fin-saved good">Mit Sondertilgung + Avalanche sparst du <strong>' + eur(cmp.interestSaved) + '</strong> Zinsen ggü. nur Mindestraten.</div>'
      : '';
    return '<div class="fin-strats">' + strat('avalanche', '❄️ Avalanche (höchster Zins zuerst)') +
      strat('snowball', '⛄ Snowball (kleinste Schuld zuerst)') +
      strat('minimum', '🐌 Nur Mindestraten') + '</div>' + savedTxt;
  };

  FinanzenSection.prototype._renderDebts = function () {
    var d = this.doc, eng = E();
    var pane = document.getElementById('fintab-debts');
    if (!pane) return;

    var rows = d.debts.map(function (it) {
      return '<tr><td>' + inp('debts', it.id, 'name', it.name, 'text') + '</td>' +
        '<td>' + inp('debts', it.id, 'balance', it.balance, 'number', 'step="any" min="0"') + '</td>' +
        '<td>' + inp('debts', it.id, 'apr', it.apr, 'number', 'step="any" min="0"') + '%</td>' +
        '<td>' + inp('debts', it.id, 'minPayment', it.minPayment, 'number', 'step="any" min="0"') + '</td>' +
        '<td>' + delBtn('debts', it.id) + '</td></tr>';
    }).join('');

    pane.innerHTML =
      '<div class="fin-card"><h3>Kredite &amp; Schulden <span class="fin-sum bad" id="fin-debt-sum">' + eur(eng.totalDebt(d)) + '</span></h3>' +
        '<table class="fin-table"><thead><tr><th>Name</th><th>Restschuld</th><th>Zins p.a.</th><th>Mindestrate</th><th></th></tr></thead>' +
        '<tbody>' + (rows || '') + '</tbody></table>' +
        '<div class="fin-addform">' + newInp('name', 'z. B. Autokredit') + newInp('balance', 'Restschuld', 'number', 'step="any" min="0"') +
          newInp('apr', 'Zins %', 'number', 'step="any" min="0"') + newInp('minPayment', 'Mindestrate', 'number', 'step="any" min="0"') +
          '<button class="btn btn-primary btn-sm" data-act="add-row" data-coll="debts"><i class="fas fa-plus"></i> Kredit</button></div>' +
      '</div>' +
      '<div class="fin-card"><h3>Tilgungsstrategie &amp; Sondertilgung</h3>' +
        '<label class="fin-field">Extra-Tilgung pro Monat (€) ' +
          '<input class="fin-inp" data-setting="extraDebtPayment" type="number" step="any" min="0" value="' + esc(d.settings.extraDebtPayment) + '"></label>' +
        '<div id="fin-strats-box">' + this._stratsBoxHtml(d) + '</div>' +
        '<p class="fin-hint">Avalanche spart am meisten Zinsen; Snowball motiviert durch schnelle Erfolge.</p>' +
      '</div>';
  };

  FinanzenSection.prototype._renderPortfolio = function () {
    var d = this.doc, eng = E(), self = this;
    var pane = document.getElementById('fintab-portfolio');
    if (!pane) return;

    function rows(type) {
      return d.holdings.filter(function (h) { return h.assetType === type; }).map(function (h) {
        var key = (h.assetType + ':' + h.symbol).toLowerCase();
        var price = self.prices[key] != null ? self.prices[key] : h.lastPrice;
        var val = eng.holdingValue(h, price);
        var cost = eng.holdingCost(h);
        var gain = val - cost;
        var gainPct = cost > 0 ? (gain / cost) : 0;
        return '<tr><td>' + inp('holdings', h.id, 'symbol', h.symbol, 'text', 'style="width:5rem"') + '</td>' +
          '<td>' + inp('holdings', h.id, 'name', h.name || '', 'text') + '</td>' +
          '<td>' + inp('holdings', h.id, 'quantity', h.quantity, 'number', 'step="any" min="0"') + '</td>' +
          '<td>' + inp('holdings', h.id, 'avgBuyPrice', h.avgBuyPrice, 'number', 'step="any" min="0"') + '</td>' +
          '<td class="num">' + (price ? eur(price) : (type === 'stock' ? inp('holdings', h.id, 'lastPrice', h.lastPrice || '', 'number', 'step="any"') : '–')) + '</td>' +
          '<td class="num" data-rowval="' + h.id + '">' + eur(val) + '</td>' +
          '<td class="num ' + (gain >= 0 ? 'good' : 'bad') + '" data-rowgain="' + h.id + '">' + eur(gain) + ' (' + pct(gainPct) + ')</td>' +
          '<td>' + delBtn('holdings', h.id) + '</td></tr>';
      }).join('');
    }

    var totalVal = eng.portfolioValue(d.holdings, this.prices);
    var totalCost = eng.portfolioCost(d.holdings);
    var totalGain = totalVal - totalCost;

    pane.innerHTML =
      '<div class="fin-card"><h3>Portfolio <span class="fin-sum ' + (totalGain >= 0 ? 'good' : 'bad') + '" id="fin-port-sum">' + eur(totalVal) + ' (' + (totalGain >= 0 ? '+' : '') + eur(totalGain) + ')</span></h3>' +
        '<canvas id="fin-chart-alloc" height="180"></canvas></div>' +
      '<div class="fin-card"><h3>₿ Krypto <span class="fin-hint">Live-Kurse via CoinGecko</span>' +
        '<button class="btn btn-outline btn-sm" data-act="refresh-prices" style="margin-left:auto"><i class="fas fa-sync"></i> Kurse</button></h3>' +
        '<table class="fin-table"><thead><tr><th>Symbol</th><th>Name</th><th>Menge</th><th>Ø Kaufpreis</th><th class="num">Kurs</th><th class="num">Wert</th><th class="num">G/V</th><th></th></tr></thead>' +
        '<tbody>' + (rows('crypto') || '') + '</tbody></table>' +
        '<div class="fin-addform">' + newInp('symbol', 'BTC') + newInp('name', 'Bitcoin') + newInp('quantity', 'Menge', 'number', 'step="any" min="0"') +
          newInp('avgBuyPrice', 'Ø Kaufpreis €', 'number', 'step="any" min="0"') +
          '<input type="hidden" data-new="assetType" value="crypto">' +
          '<button class="btn btn-primary btn-sm" data-act="add-row" data-coll="holdings"><i class="fas fa-plus"></i> Krypto</button></div>' +
      '</div>' +
      '<div class="fin-card"><h3>📈 Aktien / ETFs <span class="fin-hint" id="fin-stock-hint">Live-Kurse via Finnhub (Symbol z. B. AAPL, MSFT)</span>' +
        '<button class="btn btn-outline btn-sm" data-act="refresh-stocks" style="margin-left:auto"><i class="fas fa-sync"></i> Kurse</button></h3>' +
        '<table class="fin-table"><thead><tr><th>Symbol</th><th>Name</th><th>Menge</th><th>Ø Kaufpreis</th><th class="num">Kurs</th><th class="num">Wert</th><th class="num">G/V</th><th></th></tr></thead>' +
        '<tbody>' + (rows('stock') || '') + '</tbody></table>' +
        '<div class="fin-addform">' + newInp('symbol', 'AAPL') + newInp('name', 'Apple') + newInp('quantity', 'Menge', 'number', 'step="any" min="0"') +
          newInp('avgBuyPrice', 'Ø Kaufpreis', 'number', 'step="any" min="0"') + newInp('lastPrice', 'akt. Kurs', 'number', 'step="any" min="0"') +
          '<input type="hidden" data-new="assetType" value="stock">' +
          '<button class="btn btn-primary btn-sm" data-act="add-row" data-coll="holdings"><i class="fas fa-plus"></i> Aktie/ETF</button></div>' +
      '</div>';

    this._drawAllocChart();
  };

  FinanzenSection.prototype._drawAllocChart = function () {
    var d = this.doc, eng = E(), self = this;
    if (typeof window.Chart === 'undefined') return;
    if (this._charts.alloc) { try { this._charts.alloc.destroy(); } catch (e) {} }
    var el = document.getElementById('fin-chart-alloc');
    if (!el) return;
    var labels = [], data = [];
    d.holdings.forEach(function (h) {
      var key = (h.assetType + ':' + h.symbol).toLowerCase();
      var price = self.prices[key] != null ? self.prices[key] : h.lastPrice;
      var val = eng.holdingValue(h, price);
      if (val > 0) { labels.push(h.symbol || h.name); data.push(Math.round(val)); }
    });
    if (!labels.length) { el.parentNode.insertAdjacentHTML('beforeend', '<p class="fin-hint">Noch keine Positionen.</p>'); return; }
    this._charts.alloc = new Chart(el, {
      type: 'doughnut',
      data: { labels: labels, datasets: [{ data: data }] },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  };

  FinanzenSection.prototype._renderGoals = function () {
    var d = this.doc, eng = E();
    var pane = document.getElementById('fintab-goals');
    if (!pane) return;
    var em = eng.emergencyMonths(d);

    var rows = d.goals.map(function (g) {
      var prog = E().num(g.target) > 0 ? Math.min(1, E().num(g.saved) / E().num(g.target)) : 0;
      return '<div class="fin-goal"><div class="fin-goal-head">' +
        inp('goals', g.id, 'name', g.name, 'text') +
        '<select class="fin-inp" data-coll="goals" data-id="' + g.id + '" data-field="kind">' +
          ['emergency,Notgroschen', 'savings,Sparen', 'custom,Sonstiges'].map(function (o) { var p = o.split(','); return '<option value="' + p[0] + '"' + (g.kind === p[0] ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') +
        '</select>' + delBtn('goals', g.id) + '</div>' +
        '<div class="fin-goal-amts">Gespart ' + inp('goals', g.id, 'saved', g.saved, 'number', 'step="any" min="0"') +
          ' von ' + inp('goals', g.id, 'target', g.target, 'number', 'step="any" min="0"') + ' €</div>' +
        '<div class="fin-bar"><div class="fin-bar-fill" data-goalbar="' + g.id + '" style="width:' + Math.round(prog * 100) + '%"></div></div>' +
        '<div class="fin-goal-sub" data-goalsub="' + g.id + '">' + Math.round(prog * 100) + '% erreicht</div></div>';
    }).join('');

    var acc = d.settings.accountBalances || {};
    var accKeys = Object.keys(acc);
    var autoOn = d.settings.autoCashBalance !== false;
    var accLine = accKeys.length
      ? '<p class="fin-hint">Konten (zuletzt importiert): ' + accKeys.map(function (k) {
          var a = acc[k];
          return '<strong class="' + (E().num(a.balance) < 0 ? 'warn' : 'good') + '">' + esc(a.label || k) + ' ' + eur(E().num(a.balance)) + (a.currency ? ' ' + esc(a.currency) : '') + '</strong>' + (a.date ? ' <span style="opacity:.7">(' + esc(a.date) + ')</span>' : '');
        }).join(' · ') + '</p>'
      : '';

    pane.innerHTML =
      '<div class="fin-card"><h3>Notgroschen</h3>' +
        '<p>Reichweite aktuell: <strong id="fin-em-line" class="' + (em != null && em >= 3 ? 'good' : 'warn') + '">' + (em == null ? '–' : em.toFixed(1) + ' Monate') + '</strong> ' +
        '(Ziel: 3–6 Monatsausgaben). Bar-/Tagesgeld: ' +
        '<input class="fin-inp" data-setting="cashBalance" type="number" step="any"' + (autoOn && accKeys.length ? ' readonly title="Wird automatisch aus importierten Auszügen gepflegt"' : '') + ' value="' + esc(d.settings.cashBalance) + '"> €</p>' +
        accLine +
        '<label class="fin-hint" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" data-setting="autoCashBalance"' + (autoOn ? ' checked' : '') + '> Kontostand automatisch aus Auszügen pflegen</label></div>' +
      '<div class="fin-card"><h3>Sparziele</h3>' + (rows || '<p class="fin-hint">Noch keine Ziele.</p>') +
        '<div class="fin-addform">' + newInp('name', 'z. B. Notgroschen') + newInp('saved', 'gespart €', 'number', 'step="any" min="0"') +
          newInp('target', 'Ziel €', 'number', 'step="any" min="0"') +
          '<select class="fin-inp" data-new="kind"><option value="emergency">Notgroschen</option><option value="savings">Sparen</option><option value="custom">Sonstiges</option></select>' +
          '<button class="btn btn-primary btn-sm" data-act="add-row" data-coll="goals"><i class="fas fa-plus"></i> Ziel</button></div>' +
      '</div>';
  };

  FinanzenSection.prototype._renderCoach = function () {
    var d = this.doc, eng = E();
    var pane = document.getElementById('fintab-coach');
    if (!pane) return;
    var all = eng.insights(d);

    pane.innerHTML =
      '<div class="fin-card"><h3>🧭 Analyse &amp; Tipps</h3>' + this._insightsHtml(all) + '</div>' +
      '<div class="fin-card"><h3>🤖 KI-Finanzcoach</h3>' +
        '<p class="fin-hint">Persönlicher Plan auf Basis deiner Daten (nutzt OpenAI). Keine Anlage-/Steuerberatung.</p>' +
        '<button class="btn btn-primary" data-act="ai-coach"><i class="fas fa-wand-magic-sparkles"></i> Coaching-Plan erstellen</button>' +
        '<div id="fin-ai-output" class="fin-ai-output"></div></div>' +
      this._coachHistoryHtml() +
      '<div class="fin-card"><h3>💡 Einkommensideen</h3>' + this._incomeIdeasHtml() + '</div>';
  };

  FinanzenSection.prototype._coachHistoryHtml = function () {
    var notes = (this.doc.coachNotes || []).filter(function (n) { return n && n.text; });
    if (!notes.length) return '';
    var self = this;
    var items = notes.map(function (n) {
      var dt = '';
      try { dt = new Date(n.date).toLocaleString('de-CH', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { dt = n.date || ''; }
      return '<details class="fin-history-item"><summary>' + esc(dt) +
        '<span class="fin-history-del" data-act="del" data-coll="coachNotes" data-id="' + n.id + '" title="Löschen"><i class="fas fa-trash"></i></span></summary>' +
        '<div class="fin-ai-plan">' + self._mdToHtml(n.text) + '</div></details>';
    }).join('');
    return '<div class="fin-card"><h3>🗂️ Coaching-Verlauf <span class="fin-hint">letzte ' + notes.length + ' Pläne</span></h3>' + items + '</div>';
  };

  FinanzenSection.prototype._incomeIdeasHtml = function () {
    var ideas = [
      ['Skills monetarisieren', 'Beratung/Coaching in deinem Fachgebiet, Workshops oder Kurse (Udemy/eigene Plattform).'],
      ['Digitale Produkte', 'Vorlagen, E-Books, Notion-Templates, Software-Tools – einmal erstellen, mehrfach verkaufen.'],
      ['Freelancing', 'Projektarbeit (z. B. Entwicklung, Text, Design) über Upwork/Malt/Direktakquise.'],
      ['Vermietung', 'Ungenutzte Gegenstände, Stellplatz, Equipment oder Zimmer vermieten.'],
      ['Dividenden/Zinsen', 'Nach Schuldenabbau: breit gestreute ETFs/Tagesgeld als passives Einkommen.'],
      ['Content & Affiliate', 'Nische aufbauen (YouTube/Blog/Newsletter) mit Affiliate- und Werbeeinnahmen.']
    ];
    return '<div class="fin-ideas">' + ideas.map(function (i) {
      return '<div class="fin-idea"><strong>' + esc(i[0]) + '</strong><span>' + esc(i[1]) + '</span></div>';
    }).join('') + '</div>';
  };

  // ---------------- Live-Kurse (CoinGecko) ----------------
  FinanzenSection.prototype._refreshCryptoPrices = function (force) {
    var self = this;
    var cryptos = (this.doc.holdings || []).filter(function (h) { return h.assetType === 'crypto' && h.symbol; });
    if (!cryptos.length) return;
    var ids = [];
    var symToId = {};
    cryptos.forEach(function (h) {
      var id = h.coingeckoId || CG_IDS[(h.symbol || '').toLowerCase()];
      if (id) { ids.push(id); symToId[(h.symbol || '').toLowerCase()] = id; }
    });
    if (!ids.length) return;
    var url = 'https://api.coingecko.com/api/v3/simple/price?ids=' + encodeURIComponent(ids.join(',')) + '&vs_currencies=eur';
    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      cryptos.forEach(function (h) {
        var id = symToId[(h.symbol || '').toLowerCase()];
        if (id && data[id] && data[id].eur != null) {
          self.prices[('crypto:' + h.symbol).toLowerCase()] = data[id].eur;
        }
      });
      if (self.activeTab === 'portfolio') self._renderPortfolio();
      self._renderKpis();
    }).catch(function (e) { console.warn('[Finanzen] CoinGecko-Kurse nicht abrufbar:', e.message); });
  };

  // ---------------- These 2: Live-Aktienkurse (Finnhub) ----------------
  FinanzenSection.prototype._stockApiKey = function () {
    return fetch(V1_API + '/api-settings?action=key&provider=finnhub&global=true', {
      method: 'GET', headers: { 'Content-Type': 'application/json' }
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { return d && d.apiKey; })
      .catch(function () { return null; });
  };

  FinanzenSection.prototype._refreshStockPrices = function (force) {
    var self = this, eng = E();
    var stocks = (this.doc.holdings || []).filter(function (h) { return h.assetType === 'stock' && h.symbol; });
    if (!stocks.length) return;
    var hint = document.getElementById('fin-stock-hint');

    this._stockApiKey().then(function (key) {
      if (!key) {
        if (hint) hint.textContent = 'Für Live-Kurse einen Finnhub-API-Key unter Admin → API Keys (Provider „finnhub") hinterlegen. Bis dahin Kurs manuell.';
        return;
      }
      if (hint) hint.textContent = 'Live-Kurse via Finnhub (in Notierungswährung der Aktie).';
      var jobs = stocks.map(function (h) {
        var sym = encodeURIComponent((h.symbol || '').trim().toUpperCase());
        return fetch('https://finnhub.io/api/v1/quote?symbol=' + sym + '&token=' + encodeURIComponent(key))
          .then(function (r) { return r.json(); })
          .then(function (q) {
            if (q && typeof q.c === 'number' && q.c > 0) {
              self.prices[('stock:' + h.symbol).toLowerCase()] = q.c;
              h.lastPrice = q.c;
            }
          })
          .catch(function () { /* einzelne Symbole ignorieren */ });
      });
      return Promise.all(jobs).then(function () {
        self.save();
        if (self.activeTab === 'portfolio') self._renderPortfolio();
        self._renderKpis();
      });
    });
  };

  // ---------------- KI-Coach (OpenAI) ----------------
  FinanzenSection.prototype._aiKey = function () {
    return fetch(V1_API + '/api-settings?action=key&provider=openai&global=true', {
      method: 'GET', headers: { 'Content-Type': 'application/json' }
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { return d && d.apiKey; });
  };

  FinanzenSection.prototype._financeSummary = function () {
    var d = this.doc, eng = E();
    return {
      basis: eng.basisOf(d) === 'plan' ? 'plan' : (eng.hasActuals(d) ? 'ist_buchungen_3mon' : 'plan_fallback'),
      monatl_einkommen: Math.round(eng.effIncome(d)),
      monatl_ausgaben: Math.round(eng.effExpenses(d)),
      cashflow: Math.round(eng.effCashflow(d)),
      sparquote_prozent: Math.round(eng.effSavingsRate(d) * 100),
      gesamtschulden: Math.round(eng.totalDebt(d)),
      schulden: d.debts.map(function (x) { return { name: x.name, restschuld: eng.num(x.balance), zins: eng.num(x.apr), rate: eng.num(x.minPayment) }; }),
      notgroschen_monate: eng.emergencyMonths(d),
      nettovermoegen: Math.round(eng.netWorth(d, this.prices)),
      portfolio_wert: Math.round(eng.portfolioValue(d.holdings, this.prices)),
      finanz_score: eng.healthScore(d).total
    };
  };

  // gpt-4.1 ist laut Projekt-Key das freigeschaltete Hauptmodell; weitere als Fallback.
  FinanzenSection.prototype._coachModels = function () {
    return ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  };

  FinanzenSection.prototype._callOpenAI = function (key, body, models, idx) {
    var self = this;
    idx = idx || 0;
    if (idx >= models.length) {
      return Promise.reject(new Error('Kein verfügbares OpenAI-Modell. Geprüft: ' + models.join(', ') + '. Bitte im OpenAI-Projekt ein Modell freischalten oder einen Key mit Modellzugriff hinterlegen.'));
    }
    var model = models[idx];
    var payload = Object.assign({ model: model }, body);
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (data) {
        if (r.ok) return data;
        var msg = (data.error && data.error.message) || ('OpenAI-Fehler ' + r.status);
        // Bei fehlendem Modellzugriff/unbekanntem Modell das nächste Modell probieren.
        var noAccess = /does not have access to model|model_not_found|does not exist|invalid model/i.test(msg);
        if (noAccess && idx + 1 < models.length) {
          return self._callOpenAI(key, body, models, idx + 1);
        }
        throw new Error(msg);
      });
    });
  };

  FinanzenSection.prototype._runAiCoach = function () {
    var self = this;
    var out = document.getElementById('fin-ai-output');
    if (!out) return;
    out.innerHTML = '<div class="fin-loading"><i class="fas fa-spinner fa-spin"></i> Coach denkt nach …</div>';

    this._aiKey().then(function (key) {
      if (!key) throw new Error('Kein OpenAI-Key gefunden (Admin → API Keys → OpenAI).');
      var summary = self._financeSummary();
      var sys = 'Du bist ein erstklassiger, ehrlicher Finanzcoach für Privatpersonen im DACH-Raum. ' +
        'Ziel des Nutzers: raus aus den Schulden und finanzielle Freiheit. ' +
        'Antworte auf Deutsch, konkret, priorisiert und umsetzbar. Keine Rechts-/Steuerberatung, kein Disclaimer-Geschwurbel. ' +
        'Struktur: 1) Lage in 2 Sätzen 2) Top-3-Sofortmaßnahmen 3) Schuldenplan 4) Spar-/Investitionsschritt 5) eine konkrete Einkommensidee passend zur Lage.';
      var user = 'Hier meine Finanzdaten als JSON:\n' + JSON.stringify(summary, null, 2);

      return self._callOpenAI(key, {
        messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
        temperature: 0.6, max_tokens: 900
      }, self._coachModels());
    }).then(function (data) {
      var txt = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      out.innerHTML = '<div class="fin-ai-plan">' + self._mdToHtml(txt || 'Keine Antwort erhalten.') + '</div>';
      // im Dokument vermerken
      self.doc.coachNotes = self.doc.coachNotes || [];
      self.doc.coachNotes.unshift({ id: uid(), date: new Date().toISOString(), text: txt });
      self.doc.coachNotes = self.doc.coachNotes.slice(0, 10);
      self.save();
    }).catch(function (err) {
      out.innerHTML = '<div class="fin-insight critical"><strong>Coaching nicht möglich</strong><span>' + esc(err.message) + '</span></div>';
    });
  };

  FinanzenSection.prototype._mdToHtml = function (md) {
    var h = esc(md);
    h = h.replace(/^### (.*)$/gm, '<h4>$1</h4>')
      .replace(/^## (.*)$/gm, '<h4>$1</h4>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\s*[-*] (.*)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br>');
    return '<p>' + h + '</p>';
  };

  // ---------------- PDF-Import (Kontoauszüge) ----------------
  FinanzenSection.prototype._importCardHtml = function () {
    var redactChecked = (this._importRedact !== false) ? 'checked' : '';
    return '<div class="fin-card fin-import">' +
      '<h3><i class="fas fa-file-arrow-up"></i> Kontoauszug importieren ' +
        '<span class="fin-hint" style="margin-left:auto">PDF wird lokal gelesen – die Datei verlässt dein Gerät nicht</span></h3>' +
      '<div class="fin-import-drop">' +
        '<label class="btn btn-primary"><i class="fas fa-upload"></i> PDF(s) auswählen' +
          '<input type="file" accept="application/pdf" multiple data-import="pdf" hidden></label>' +
        '<label class="fin-check"><input type="checkbox" data-import="redact" ' + redactChecked + '> ' +
          'IBAN, Karten-/Kontonummern, Name &amp; Adresse vor der KI-Analyse entfernen <em>(empfohlen)</em></label>' +
      '</div>' +
      '<p class="fin-hint">So funktioniert es: die PDF wird im Browser ausgelesen, sensible Daten werden anonymisiert, ' +
        'nur der bereinigte Text geht zur Buchungs-Erkennung an die KI. Danach prüfst du die Vorschau und übernimmst alles mit einem Klick.</p>' +
      '<div id="fin-import-status" class="fin-import-status"></div>' +
      '<div id="fin-import-preview">' + (this._importItems ? this._importPreviewHtml() : '') + '</div>' +
    '</div>';
  };

  FinanzenSection.prototype._importPreviewHtml = function () {
    var items = this._importItems || [];
    if (!items.length) return '';
    var rows = items.map(function (it, i) {
      return '<tr class="' + (it.dup ? 'dup' : '') + '">' +
        '<td><input type="checkbox" data-imp-idx="' + i + '"' + (it.checked ? ' checked' : '') + '></td>' +
        '<td>' + esc(it.date) + '</td>' +
        '<td>' + (it.type === 'income' ? '<span class="good">Einnahme</span>' : 'Ausgabe') + '</td>' +
        '<td class="num">' + eur(it.amount) + '</td>' +
        '<td>' + esc(it.category || '') + '</td>' +
        '<td>' + esc(it.note || '') + (it.dup ? ' <span class="fin-import-dupflag">bereits erfasst</span>' : '') + '</td>' +
        '<td class="fin-hint">' + esc(it.source || '') + '</td></tr>';
    }).join('');
    var checked = items.filter(function (it) { return it.checked; }).length;
    return '<div class="fin-import-result">' +
      '<table class="fin-table"><thead><tr><th></th><th>Datum</th><th>Art</th><th class="num">Betrag</th><th>Kategorie</th><th>Beschreibung</th><th>Quelle</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table>' +
      '<div class="fin-import-actions">' +
        '<button class="btn btn-primary" data-act="import-confirm"><i class="fas fa-check"></i> <span id="fin-import-count">' + checked + '</span> Buchungen übernehmen</button>' +
        '<button class="btn btn-outline" data-act="import-clear">Verwerfen</button>' +
        '<button class="btn btn-outline" data-act="import-tips"><i class="fas fa-wand-magic-sparkles"></i> Tipps zum weiteren Vorgehen</button>' +
      '</div></div>';
  };

  FinanzenSection.prototype._setImportStatus = function (html) {
    var el = document.getElementById('fin-import-status');
    if (el) el.innerHTML = html;
  };
  FinanzenSection.prototype._updateImportCount = function () {
    var n = (this._importItems || []).filter(function (it) { return it.checked; }).length;
    var el = document.getElementById('fin-import-count');
    if (el) el.textContent = n;
  };

  FinanzenSection.prototype._importPdfs = function (fileList) {
    var self = this;
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    if (!window.FinanceImport) { this._setImportStatus('<span class="bad">Import-Modul nicht geladen.</span>'); return; }
    this._setImportStatus('<i class="fas fa-spinner fa-spin"></i> Lese ' + files.length + ' PDF(s) lokal …');

    this._importStatements = [];
    this._aiKey().then(function (key) {
      if (!key) throw new Error('Kein OpenAI-Key gefunden (Admin → API Keys → OpenAI).');
      var all = [];
      var seq = Promise.resolve();
      files.forEach(function (file) {
        seq = seq.then(function () {
          self._setImportStatus('<i class="fas fa-spinner fa-spin"></i> Verarbeite „' + esc(file.name) + '" …');
          return window.FinanceImport.extractPdfText(file).then(function (text) {
            var clean = window.FinanceImport.redact(text, self._importRedact !== false);
            return self._extractWithAI(key, clean).then(function (res) {
              (res.items || []).forEach(function (x) { x.source = file.name; all.push(x); });
              if (res.statement) { res.statement.source = file.name; self._importStatements.push(res.statement); }
            });
          });
        });
      });
      return seq.then(function () { return all; });
    }).then(function (all) {
      var existing = {};
      (self.doc.transactions || []).forEach(function (t) { existing[window.FinanceImport.dedupeKey(t)] = true; });
      var seen = {};
      all.forEach(function (it) {
        var k = window.FinanceImport.dedupeKey(it);
        it.dup = !!existing[k] || !!seen[k];
        it.checked = !it.dup;
        seen[k] = true;
      });
      all.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      self._importItems = all;
      var dupCount = all.filter(function (i) { return i.dup; }).length;
      self._renderTransactions();
      self._setImportStatus(all.length
        ? '<span class="good">' + all.length + ' Buchungen erkannt' + (dupCount ? (' (' + dupCount + ' bereits erfasst, abgewählt)') : '') + '. Bitte prüfen und übernehmen.</span>'
        : '<span class="warn">Keine Buchungen erkannt – ist es evtl. ein Bild-Scan? Dann bitte manuell erfassen.</span>');
    }).catch(function (err) {
      self._setImportStatus('<span class="bad">Fehler: ' + esc(err.message) + '</span>');
    });
  };

  FinanzenSection.prototype._extractWithAI = function (key, text) {
    var sys = 'Du bist ein präziser Parser für Bankkontoauszüge (Schweiz/Deutschland). ' +
      'Extrahiere ALLE einzelnen Buchungen aus dem Text. Ignoriere Anfangssaldo, Zwischensummen, ' +
      'Gebühren-/Entgeltübersichten, Saldoübersichten und Werbung. ' +
      'Gib AUSSCHLIESSLICH gültiges JSON zurück (keine Erklärungen). Schema: ' +
      '{"statement":{"account":"<Kurzname der Bank/Konto, z.B. UBS oder DKB>","currency":"CHF|EUR","closingBalance":<Schlusssaldo als Zahl, negativ wenn im Minus, sonst null>,"closingDate":"YYYY-MM-DD oder null"},' +
      '"transactions":[{"date":"YYYY-MM-DD","amount":<positive Zahl>,"direction":"in"|"out","category":"<Kategorie>","description":"<kurz, max 60 Zeichen>"}]}. ' +
      'closingBalance ist der Endkontostand des Auszugs (z.B. „Schlusssaldo", „Kontostand am …"); wenn nicht eindeutig vorhanden, null. ' +
      'amount immer positiv. direction "in" für Gutschrift/Zahlungseingang, "out" für Belastung/Lastschrift/Kartenzahlung/Überweisung raus. ' +
      'category ausschließlich aus: Wohnen, Versicherung, Lebensmittel, Abo, Kommunikation, Job-Werkzeug, Schulden/Tilgung, Transport, Gesundheit, Einkommen, Sonstiges. ' +
      'Beträge im DE/CH-Format korrekt interpretieren (Punkt, Komma, Apostroph als Tausendertrennzeichen). Datum normalisieren zu YYYY-MM-DD (zweistellige Jahre als 20JJ).';
    var user = 'Kontoauszug-Text:\n"""\n' + String(text || '').slice(0, 120000) + '\n"""';
    return this._callOpenAI(key, {
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      temperature: 0, max_tokens: 4000, response_format: { type: 'json_object' }
    }, this._coachModels()).then(function (data) {
      var txt = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      var parsed = window.FinanceImport.parseJson(txt) || {};
      var list = parsed.transactions || [];
      var items = list.map(function (x) {
        return {
          date: String(x.date || '').slice(0, 10),
          type: (x.direction === 'in' ? 'income' : 'expense'),
          amount: Math.abs(E().num(x.amount)),
          category: x.category || 'Sonstiges',
          note: x.description || ''
        };
      }).filter(function (x) { return x.amount > 0 && /^\d{4}-\d{2}-\d{2}$/.test(x.date); });
      var st = parsed.statement || null;
      if (st && (st.closingBalance === null || st.closingBalance === undefined || st.closingBalance === '')) st = null;
      return { items: items, statement: st };
    });
  };

  FinanzenSection.prototype._confirmImport = function () {
    var self = this;
    var items = (this._importItems || []).filter(function (it) { return it.checked; });
    if (!items.length) { this._setImportStatus('<span class="warn">Nichts ausgewählt.</span>'); return; }
    var added = [];
    items.forEach(function (it) {
      var t = { id: uid(), date: it.date, type: it.type, amount: it.amount, category: it.category, note: it.note };
      self.doc.transactions.push(t);
      added.push(t);
    });
    var n = items.length;
    var report = this._applyDebtPayments(added);
    var balReport = this._applyAccountBalances(this._importStatements);
    this._importItems = null;
    this._importStatements = null;
    this.save();
    this._renderAll();
    var debtMsg = report.length ? ' · <span class="warn">Kredite reduziert:</span> ' + report.join(', ') : '';
    var balMsg = balReport.length ? ' · <span class="good">Kontostand:</span> ' + balReport.join(', ') : '';
    this._setImportStatus('<span class="good">' + n + ' Buchungen übernommen ✓</span>' + debtMsg + balMsg + ' ' +
      '<button class="btn btn-outline btn-sm" data-act="import-tips"><i class="fas fa-wand-magic-sparkles"></i> Tipps zum weiteren Vorgehen</button>');
  };

  // Pflegt den Kontostand automatisch aus den Schlusssalden der Auszüge (je Konto, neuester gewinnt).
  FinanzenSection.prototype._applyAccountBalances = function (statements) {
    var self = this, eng = E();
    if (this.doc.settings.autoCashBalance === false) return [];
    var sts = (statements || []).filter(function (s) { return s && s.closingBalance != null; });
    if (!sts.length) return [];
    this.doc.settings.accountBalances = this.doc.settings.accountBalances || {};
    var acc = this.doc.settings.accountBalances;
    var report = [];
    sts.forEach(function (s) {
      var key = String(s.account || 'Konto').trim() || 'Konto';
      var prev = acc[key];
      var newDate = s.closingDate || '';
      if (!prev || !prev.date || newDate >= prev.date) {
        acc[key] = { label: key, currency: s.currency || '', balance: eng.num(s.closingBalance), date: newDate };
        report.push(esc(key) + ' ' + eur(eng.num(s.closingBalance)));
      }
    });
    var sum = 0;
    Object.keys(acc).forEach(function (k) { sum += eng.num(acc[k].balance); });
    this.doc.settings.cashBalance = Math.round(sum * 100) / 100;
    return report;
  };

  // Ordnet eine (Tilgungs-)Buchung einem Kredit zu – konservativ, um Fehlabzüge zu vermeiden.
  FinanzenSection.prototype._matchDebtForTx = function (t) {
    var debts = this.doc.debts || [];
    if (!debts.length) return null;
    var hay = ((t.note || '') + ' ' + (t.category || '')).toLowerCase();
    // 1) Treffer über einen aussagekräftigen Token im Kreditnamen (z. B. "cembra", "kfw")
    for (var i = 0; i < debts.length; i++) {
      var toks = (debts[i].name || '').toLowerCase().split(/[^a-zäöüß0-9]+/).filter(function (w) { return w.length > 3; });
      for (var j = 0; j < toks.length; j++) { if (hay.indexOf(toks[j]) >= 0) return debts[i]; }
    }
    // 2) Stichwort-Gruppen → Kredit, dessen Name das Schlüsselwort enthält
    var groups = [['cembra', ['cembra']], ['kfw', ['kfw', 'darlehen']], ['kreditkarte', ['kreditkarte', 'kreditk', 'mastercard', ' visa']]];
    for (var g = 0; g < groups.length; g++) {
      var words = groups[g][1];
      for (var k = 0; k < words.length; k++) {
        if (hay.indexOf(words[k]) >= 0) {
          var key = groups[g][0];
          var hit = debts.find(function (dd) { return (dd.name || '').toLowerCase().indexOf(key) >= 0; });
          if (hit) return hit;
        }
      }
    }
    // 3) Kategorie „Schulden/Tilgung" + genau ein Kredit → eindeutig
    if (t.category === 'Schulden/Tilgung' && debts.length === 1) return debts[0];
    return null;
  };

  // Zieht erkannte Tilgungen von den Kreditsalden ab. Schutz gegen Doppelabzug
  // über settings.appliedDebtTx (Buchungs-ID → Kredit-ID).
  FinanzenSection.prototype._applyDebtPayments = function (txns) {
    var self = this, eng = E();
    this.doc.settings.appliedDebtTx = this.doc.settings.appliedDebtTx || {};
    var applied = this.doc.settings.appliedDebtTx;
    var report = [];
    (txns || []).forEach(function (t) {
      if (t.type !== 'expense') return;
      if (applied[t.id]) return;
      var debt = self._matchDebtForTx(t);
      if (!debt) return;
      var before = eng.num(debt.balance);
      debt.balance = Math.max(0, before - eng.num(t.amount));
      applied[t.id] = debt.id;
      t.debtApplied = debt.id;
      report.push(esc(debt.name) + ' −' + eur(t.amount));
    });
    return report;
  };

  // ---------------- Sanierungsplan ----------------
  FinanzenSection.prototype._updatePlan = function (field, value) {
    if (field === 'baselineDebt') this.doc.plan.baselineDebt = E().num(value);
    else this.doc.plan[field] = value;
    this.save();
    if (field === 'baselineDebt') this._renderPlan();
  };
  FinanzenSection.prototype._updateMilestone = function (id, field, value) {
    var m = this.doc.plan.milestones.find(function (x) { return x.id === id; });
    if (!m) return;
    if (field === 'target') m.target = E().num(value);
    else m[field] = value;
    this.save();
    this._renderPlan();
  };
  FinanzenSection.prototype._toggleMilestoneDone = function (id) {
    var m = this.doc.plan.milestones.find(function (x) { return x.id === id; });
    if (!m) return;
    m.done = !m.done;
    this.save(); this._renderKpis(); this._renderPlan();
  };
  FinanzenSection.prototype._toggleMilestoneReward = function (id) {
    var m = this.doc.plan.milestones.find(function (x) { return x.id === id; });
    if (!m) return;
    m.rewardClaimed = !m.rewardClaimed;
    this.save(); this._renderPlan();
  };
  FinanzenSection.prototype._removeMilestone = function (id) {
    this.doc.plan.milestones = this.doc.plan.milestones.filter(function (x) { return x.id !== id; });
    this.save(); this._renderPlan();
  };
  FinanzenSection.prototype._addMilestone = function (btn) {
    var box = btn.closest('.fin-addform');
    if (!box) return;
    var item = { id: uid(), done: false, rewardClaimed: false };
    box.querySelectorAll('[data-new]').forEach(function (inp) {
      var f = inp.getAttribute('data-new');
      item[f] = f === 'target' ? E().num(inp.value) : inp.value;
    });
    if (!item.title) { var t = box.querySelector('[data-new="title"]'); if (t) t.focus(); return; }
    if (!item.metric) item.metric = 'manual';
    if (!item.phase) item.phase = 'Weitere Meilensteine';
    this.doc.plan.milestones.push(item);
    this.save(); this._renderPlan();
  };

  FinanzenSection.prototype._planMetrics = function () {
    return [
      ['manual', 'Manuell abhaken'],
      ['debtBelow', 'Schulden unter … CHF'],
      ['debtFree', 'Schuldenfrei'],
      ['emergencyMonths', 'Notgroschen ≥ … Monate'],
      ['cashflowPositive', 'Cashflow ≥ … / Monat'],
      ['savingsRate', 'Sparquote ≥ … (0–1)'],
      ['netWorthPositive', 'Nettovermögen ≥ … €']
    ];
  };

  FinanzenSection.prototype._renderPlan = function () {
    var d = this.doc, eng = E(), self = this;
    var pane = document.getElementById('fintab-plan');
    if (!pane) return;
    var plan = d.plan;
    var pp = eng.planProgress(d, this.prices);
    var ms = plan.milestones || [];

    // Nächster offener Meilenstein + aktuelle Phase + nächste Belohnung
    var nextOpen = null;
    for (var i = 0; i < ms.length; i++) {
      if (!pp.items[ms[i].id] || !pp.items[ms[i].id].achieved) { nextOpen = ms[i]; break; }
    }
    var currentPhase = nextOpen ? nextOpen.phase : 'Alles erreicht 🎉';
    var nextReward = nextOpen && nextOpen.reward ? nextOpen.reward : '';
    var pctTxt = Math.round(pp.pct * 100);

    function metricNow(m, ev) {
      switch (m.metric) {
        case 'debtBelow': case 'debtFree': return eur(ev.value || 0) + ' Schulden';
        case 'emergencyMonths': return (ev.value == null ? '0' : Number(ev.value).toFixed(1)) + ' Monate';
        case 'cashflowPositive': return eur(ev.value || 0) + ' / Monat';
        case 'savingsRate': return Math.round((ev.value || 0) * 100) + '% Sparquote';
        case 'netWorthPositive': return eur(ev.value || 0) + ' Nettovermögen';
        default: return '';
      }
    }
    function metricTarget(m) {
      switch (m.metric) {
        case 'debtBelow': return 'Ziel: < ' + eur(m.target);
        case 'debtFree': return 'Ziel: 0 Schulden';
        case 'emergencyMonths': return 'Ziel: ≥ ' + eng.num(m.target) + ' Monate';
        case 'cashflowPositive': return 'Ziel: ≥ ' + eur(m.target) + ' / Monat';
        case 'savingsRate': return 'Ziel: ≥ ' + Math.round(eng.num(m.target) * 100) + '%';
        case 'netWorthPositive': return 'Ziel: ≥ ' + eur(m.target);
        default: return '';
      }
    }
    var metricOpts = this._planMetrics();
    function metricSelect(m) {
      return '<select class="fin-inp" data-ms-id="' + m.id + '" data-ms-field="metric">' +
        metricOpts.map(function (o) { return '<option value="' + o[0] + '"' + (m.metric === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
        '</select>';
    }
    var noTarget = { manual: 1, debtFree: 1 };

    // Meilensteine nach Phase gruppiert (Reihenfolge wie im Array)
    var html = '';
    var lastPhase = null;
    ms.forEach(function (m) {
      var ev = pp.items[m.id] || { progress: 0, achieved: false, value: null };
      if (m.phase !== lastPhase) {
        html += '<div class="fin-ms-phase">' + esc(m.phase || 'Meilensteine') + '</div>';
        lastPhase = m.phase;
      }
      var isCurrent = (nextOpen && nextOpen.id === m.id);
      var stateClass = ev.achieved ? 'done' : (isCurrent ? 'current' : 'pending');
      var icon = ev.achieved ? '<i class="fas fa-circle-check"></i>' : (isCurrent ? '<i class="fas fa-location-arrow"></i>' : '<i class="far fa-circle"></i>');
      var w = Math.round(ev.progress * 100);

      var statusLine;
      if (m.metric === 'manual') {
        statusLine = '<button class="fin-ms-check ' + (m.done ? 'on' : '') + '" data-act="ms-toggle" data-ms-id="' + m.id + '">' +
          (m.done ? '<i class="fas fa-check"></i> erledigt' : 'als erledigt markieren') + '</button>';
      } else {
        statusLine = '<div class="fin-ms-metricnow"><span class="' + (ev.achieved ? 'good' : '') + '">' + metricNow(m, ev) + '</span>' +
          '<span class="fin-hint">' + metricTarget(m) + '</span></div>' +
          '<div class="fin-bar"><div class="fin-bar-fill" style="width:' + w + '%"></div></div>';
      }

      var targetField = noTarget[m.metric] ? '' :
        '<input class="fin-inp fin-ms-target" data-ms-id="' + m.id + '" data-ms-field="target" type="number" step="any" value="' + esc(m.target) + '" title="Zielwert">';

      html += '<div class="fin-ms ' + stateClass + '">' +
        '<div class="fin-ms-mark">' + icon + '</div>' +
        '<div class="fin-ms-body">' +
          '<div class="fin-ms-head">' +
            '<input class="fin-inp fin-ms-title" data-ms-id="' + m.id + '" data-ms-field="title" value="' + esc(m.title) + '">' +
            delMsBtn(m.id) +
          '</div>' +
          '<textarea class="fin-inp fin-ms-desc" data-ms-id="' + m.id + '" data-ms-field="desc" rows="2">' + esc(m.desc || '') + '</textarea>' +
          statusLine +
          '<div class="fin-ms-config">' + metricSelect(m) + targetField + '</div>' +
          '<div class="fin-ms-reward ' + (m.rewardClaimed ? 'claimed' : '') + '">' +
            '<span class="fin-ms-gift">🎁</span>' +
            '<input class="fin-inp" data-ms-id="' + m.id + '" data-ms-field="reward" value="' + esc(m.reward || '') + '" placeholder="Belohnung für diesen Meilenstein …">' +
            '<button class="fin-ms-claim ' + (m.rewardClaimed ? 'on' : '') + '" data-act="ms-claim" data-ms-id="' + m.id + '" title="Belohnung eingelöst">' +
              (m.rewardClaimed ? '<i class="fas fa-gift"></i> eingelöst' : 'eingelöst?') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });

    function delMsBtn(id) {
      return '<button class="fin-icon-btn danger" data-act="ms-del" data-ms-id="' + id + '" title="Meilenstein löschen"><i class="fas fa-trash"></i></button>';
    }

    var rewardBanner = nextReward
      ? '<div class="fin-next-reward"><span class="fin-ms-gift">🎁</span> <strong>Nächste Belohnung:</strong> ' + esc(nextReward) + '</div>'
      : '';

    pane.innerHTML =
      '<div class="fin-card fin-plan-hero">' +
        '<div class="fin-plan-hero-top">' +
          '<div class="fin-plan-ring" style="--p:' + pctTxt + '"><div class="fin-plan-ring-num">' + pctTxt + '%</div><div class="fin-plan-ring-sub">' + pp.count + '/' + pp.total + ' Meilensteine</div></div>' +
          '<div class="fin-plan-hero-main">' +
            '<label class="fin-plan-label">Mein Warum (North Star)</label>' +
            '<textarea class="fin-inp fin-plan-north" data-plan-field="northStar" rows="2" placeholder="Wofür mache ich das?">' + esc(plan.northStar || '') + '</textarea>' +
            '<div class="fin-plan-meta">' +
              '<span class="fin-ms-phase-pill">Aktuelle Phase: <strong>' + esc(currentPhase) + '</strong></span>' +
              '<label class="fin-field-inline">Start <input class="fin-inp" type="date" data-plan-field="startDate" value="' + esc(plan.startDate || '') + '"></label>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fin-bar fin-plan-bar"><div class="fin-bar-fill" style="width:' + pctTxt + '%"></div></div>' +
        rewardBanner +
      '</div>' +
      '<div class="fin-card">' +
        '<h3>Meilensteine <span class="fin-hint" style="margin-left:auto">Fortschritt rechnet sich aus deinen echten Zahlen (Tabs „Kredite", „Sparziele" …)</span></h3>' +
        '<div class="fin-plan-baseline">' +
          '<label class="fin-field-inline">Startschulden für % <input class="fin-inp" type="number" step="any" data-plan-field="baselineDebt" value="' + esc(plan.baselineDebt || 0) + '"></label>' +
          '<button class="btn btn-outline btn-sm" data-act="plan-baseline" title="Aktuelle Gesamtschulden als Startwert übernehmen"><i class="fas fa-crosshairs"></i> = aktuelle Schulden (' + eur(eng.totalDebt(d)) + ')</button>' +
        '</div>' +
        '<div class="fin-ms-list">' + (html || '<p class="fin-hint">Noch keine Meilensteine.</p>') + '</div>' +
        '<div class="fin-addform">' +
          newInp('title', 'Titel des Meilensteins') +
          newInp('phase', 'Phase (z. B. 3 · Schulden drücken)') +
          '<select class="fin-inp" data-new="metric">' + metricOpts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select>' +
          newInp('target', 'Zielwert', 'number', 'step="any"') +
          newInp('reward', 'Belohnung') +
          '<button class="btn btn-primary btn-sm" data-act="ms-add"><i class="fas fa-plus"></i> Meilenstein</button>' +
        '</div>' +
        '<div style="margin-top:.75rem"><button class="btn btn-outline btn-sm" data-act="plan-template"><i class="fas fa-rotate"></i> Vorlage neu laden</button></div>' +
      '</div>';
  };

  window.FinanzenSection = FinanzenSection;
})();
