/**
 * FinanceEngine – deterministische Finanzberechnungen für das Admin-Finanzmodul.
 * Reine Funktionen ohne DOM/Netzwerk, damit Logik testbar und vorhersehbar bleibt.
 *
 * Datenmodell (financeDoc):
 *   settings   { currency, emergencyFundTargetMonths, extraDebtPayment, cashBalance }
 *   incomes[]  { id, label, amount, frequency, category }
 *   expenses[] { id, label, amount, frequency, category, essential }
 *   transactions[] { id, date, type('income'|'expense'), amount, category, note }
 *   debts[]    { id, name, balance, apr, minPayment, type }
 *   holdings[] { id, assetType('stock'|'crypto'), symbol, name, quantity, avgBuyPrice }
 *   goals[]    { id, name, target, saved, kind('emergency'|'savings'|'custom'), deadline }
 */
(function () {
  'use strict';

  var FREQ_TO_MONTHLY = {
    daily: 365 / 12,
    weekly: 52 / 12,
    biweekly: 26 / 12,
    monthly: 1,
    quarterly: 4 / 12,
    yearly: 1 / 12,
    once: 0
  };

  function num(v) {
    var n = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  function toMonthly(amount, frequency) {
    var f = FREQ_TO_MONTHLY[frequency] != null ? FREQ_TO_MONTHLY[frequency] : 1;
    return num(amount) * f;
  }

  function sumMonthly(items) {
    return (items || []).reduce(function (s, it) {
      return s + toMonthly(it.amount, it.frequency || 'monthly');
    }, 0);
  }

  function monthlyIncome(doc) { return sumMonthly(doc && doc.incomes); }
  function monthlyExpenses(doc) { return sumMonthly(doc && doc.expenses); }

  function monthlyEssentialExpenses(doc) {
    var ex = (doc && doc.expenses) || [];
    var essential = ex.filter(function (e) { return e.essential; });
    // Falls nichts als essenziell markiert ist: gesamte Ausgaben als Näherung.
    return essential.length ? sumMonthly(essential) : sumMonthly(ex);
  }

  function cashflow(doc) { return monthlyIncome(doc) - monthlyExpenses(doc); }

  function savingsRate(doc) {
    var inc = monthlyIncome(doc);
    if (inc <= 0) return 0;
    return cashflow(doc) / inc;
  }

  function totalDebt(doc) {
    return ((doc && doc.debts) || []).reduce(function (s, d) { return s + num(d.balance); }, 0);
  }

  function totalMinPayments(doc) {
    return ((doc && doc.debts) || []).reduce(function (s, d) { return s + num(d.minPayment); }, 0);
  }

  function weightedApr(doc) {
    var debts = (doc && doc.debts) || [];
    var total = totalDebt(doc);
    if (total <= 0) return 0;
    return debts.reduce(function (s, d) { return s + num(d.balance) * num(d.apr); }, 0) / total;
  }

  /** Debt-to-Income: monatliche Schuldenraten / monatliches Einkommen. */
  function debtToIncome(doc) {
    var inc = monthlyIncome(doc);
    if (inc <= 0) return null;
    return totalMinPayments(doc) / inc;
  }

  function addMonths(date, months) {
    var d = new Date(date.getTime());
    d.setMonth(d.getMonth() + months);
    return d;
  }

  /**
   * Tilgungssimulation Monat für Monat.
   * strategy: 'avalanche' (höchster Zins zuerst), 'snowball' (kleinste Schuld zuerst),
   *           'minimum' (nur Mindestraten, keine Umverteilung).
   * extraPerMonth: zusätzliche Sondertilgung pro Monat.
   */
  function simulatePayoff(debtsInput, strategy, extraPerMonth) {
    var base = (debtsInput || [])
      .filter(function (d) { return num(d.balance) > 0; })
      .map(function (d) {
        return { id: d.id, name: d.name, balance: num(d.balance), apr: num(d.apr), min: num(d.minPayment) };
      });

    if (!base.length) {
      return { months: 0, payoffDate: null, totalInterest: 0, totalPaid: 0, neverPaysOff: false, order: [], schedule: [] };
    }

    var ordered = base.slice();
    if (strategy === 'snowball') ordered.sort(function (a, b) { return a.balance - b.balance; });
    else if (strategy === 'avalanche') ordered.sort(function (a, b) { return b.apr - a.apr; });

    var rollover = strategy !== 'minimum';
    var baseExtra = num(extraPerMonth);
    var totalMinAll = base.reduce(function (s, d) { return s + d.min; }, 0);

    var month = 0, totalInterest = 0, totalPaid = 0;
    var maxMonths = 1200;
    var schedule = [];

    function activeBalance() {
      return ordered.reduce(function (s, d) { return s + (d.balance > 0 ? d.balance : 0); }, 0);
    }

    while (activeBalance() > 0.005 && month < maxMonths) {
      month += 1;

      // 1) Zinsen aufschlagen
      ordered.forEach(function (d) {
        if (d.balance > 0) {
          var interest = d.balance * (d.apr / 100) / 12;
          d.balance += interest;
          totalInterest += interest;
        }
      });

      // 2) Verfügbares Budget bestimmen
      var pool;
      if (rollover) {
        var activeMins = ordered.reduce(function (s, d) { return s + (d.balance > 0 ? d.min : 0); }, 0);
        var freed = totalMinAll - activeMins; // freigewordene Mindestraten getilgter Schulden
        pool = activeMins + freed + baseExtra;
      } else {
        pool = ordered.reduce(function (s, d) { return s + (d.balance > 0 ? d.min : 0); }, 0);
      }

      var remaining = pool;

      // 3) Mindestraten auf alle aktiven Schulden
      ordered.forEach(function (d) {
        if (d.balance > 0 && remaining > 0) {
          var pay = Math.min(d.min, d.balance, remaining);
          d.balance -= pay; remaining -= pay; totalPaid += pay;
        }
      });

      // 4) Rest gebündelt auf die erste aktive Schuld in Reihenfolge
      for (var i = 0; i < ordered.length && remaining > 0.005; i += 1) {
        if (ordered[i].balance > 0) {
          var p = Math.min(ordered[i].balance, remaining);
          ordered[i].balance -= p; remaining -= p; totalPaid += p;
        }
      }

      if (month <= 600) {
        schedule.push({ month: month, remaining: activeBalance() });
      }
    }

    var neverPaysOff = activeBalance() > 0.005;
    return {
      months: neverPaysOff ? null : month,
      payoffDate: neverPaysOff ? null : addMonths(new Date(), month),
      totalInterest: totalInterest,
      totalPaid: totalPaid,
      neverPaysOff: neverPaysOff,
      order: ordered.map(function (d) { return d.name; }),
      schedule: schedule
    };
  }

  /** Vergleich der Strategien inkl. eingesparter Zinsen ggü. nur Mindestraten. */
  function comparePayoff(doc, extraPerMonth) {
    var debts = (doc && doc.debts) || [];
    var extra = extraPerMonth != null ? num(extraPerMonth) : num(doc && doc.settings && doc.settings.extraDebtPayment);
    var minimum = simulatePayoff(debts, 'minimum', 0);
    var avalanche = simulatePayoff(debts, 'avalanche', extra);
    var snowball = simulatePayoff(debts, 'snowball', extra);

    var interestSaved = null;
    if (!minimum.neverPaysOff && !avalanche.neverPaysOff) {
      interestSaved = minimum.totalInterest - avalanche.totalInterest;
    }
    return { extra: extra, minimum: minimum, avalanche: avalanche, snowball: snowball, interestSaved: interestSaved };
  }

  // ---- Portfolio ----
  function holdingValue(h, price) {
    return num(h.quantity) * num(price != null ? price : h.lastPrice);
  }
  function holdingCost(h) { return num(h.quantity) * num(h.avgBuyPrice); }

  function portfolioValue(holdings, priceMap) {
    priceMap = priceMap || {};
    return (holdings || []).reduce(function (s, h) {
      var key = (h.assetType + ':' + h.symbol).toLowerCase();
      var price = priceMap[key] != null ? priceMap[key] : h.lastPrice;
      return s + holdingValue(h, price);
    }, 0);
  }
  function portfolioCost(holdings) {
    return (holdings || []).reduce(function (s, h) { return s + holdingCost(h); }, 0);
  }

  // ---- Vermögen / Notgroschen ----
  function liquidSavings(doc) {
    var goals = (doc && doc.goals) || [];
    var saved = goals.reduce(function (s, g) { return s + num(g.saved); }, 0);
    return saved + num(doc && doc.settings && doc.settings.cashBalance);
  }

  function emergencyFundSaved(doc) {
    var goals = (doc && doc.goals) || [];
    var em = goals.filter(function (g) { return g.kind === 'emergency'; });
    if (em.length) return em.reduce(function (s, g) { return s + num(g.saved); }, 0);
    return num(doc && doc.settings && doc.settings.cashBalance);
  }

  function emergencyMonths(doc) {
    var essential = monthlyEssentialExpenses(doc);
    if (essential <= 0) return null;
    return emergencyFundSaved(doc) / essential;
  }

  function netWorth(doc, priceMap) {
    return portfolioValue(doc && doc.holdings, priceMap) + liquidSavings(doc) - totalDebt(doc);
  }

  // ---- 50/30/20 Budget ----
  function budget503020(doc) {
    var inc = monthlyIncome(doc);
    var ex = (doc && doc.expenses) || [];
    var needs = sumMonthly(ex.filter(function (e) { return e.essential; }));
    var wants = sumMonthly(ex.filter(function (e) { return !e.essential; }));
    var saves = Math.max(0, cashflow(doc));
    return {
      income: inc,
      needs: { actual: needs, target: inc * 0.5 },
      wants: { actual: wants, target: inc * 0.3 },
      savings: { actual: saves, target: inc * 0.2 }
    };
  }

  function expenseByCategory(doc) {
    var map = {};
    ((doc && doc.expenses) || []).forEach(function (e) {
      var cat = e.category || 'Sonstiges';
      map[cat] = (map[cat] || 0) + toMonthly(e.amount, e.frequency || 'monthly');
    });
    return map;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /**
   * Finanz-Gesundheits-Score 0..100 mit nachvollziehbaren Teilkomponenten.
   */
  function healthScore(doc) {
    var parts = [];

    // Sparquote: 20%+ = voll (auf Ist-Basis, falls Buchungen vorhanden)
    var sr = effSavingsRate(doc);
    var srScore = clamp(sr / 0.2, 0, 1) * 25;
    parts.push({ key: 'savingsRate', label: 'Sparquote', value: sr, score: srScore, max: 25 });

    // Notgroschen: 3 Monate = voll
    var em = emergencyMonths(doc);
    var emScore = em == null ? 0 : clamp(em / 3, 0, 1) * 25;
    parts.push({ key: 'emergency', label: 'Notgroschen', value: em, score: emScore, max: 25 });

    // Schuldenquote (DTI): 0% = voll, >=40% = 0
    var dti = effDebtToIncome(doc);
    var dtiScore = dti == null ? 12.5 : clamp(1 - dti / 0.4, 0, 1) * 25;
    parts.push({ key: 'dti', label: 'Schuldenquote', value: dti, score: dtiScore, max: 25 });

    // Vermögensaufbau: positives Nettovermögen + investiert
    var nw = netWorth(doc);
    var invested = portfolioCost(doc && doc.holdings) > 0;
    var wealthScore = (nw > 0 ? 15 : (nw === 0 ? 7 : 0)) + (invested ? 10 : 0);
    wealthScore = clamp(wealthScore, 0, 25);
    parts.push({ key: 'wealth', label: 'Vermögensaufbau', value: nw, score: wealthScore, max: 25 });

    var total = Math.round(parts.reduce(function (s, p) { return s + p.score; }, 0));
    var rating = total >= 80 ? 'Hervorragend' : total >= 60 ? 'Solide' : total >= 40 ? 'Ausbaufähig' : 'Kritisch';
    return { total: total, rating: rating, parts: parts };
  }

  /**
   * Regelbasierte Insights/Tipps – deterministisch, ohne KI.
   * Liefert priorisierte Liste { severity, title, text }.
   */
  function insights(doc) {
    var out = [];
    var inc = effIncome(doc);
    var cf = effCashflow(doc);
    var sr = effSavingsRate(doc);
    var em = emergencyMonths(doc);
    var dti = effDebtToIncome(doc);
    var debts = (doc && doc.debts) || [];

    if (inc <= 0) {
      out.push({ severity: 'info', title: 'Einkommen erfassen', text: 'Trage deine Einkünfte ein, damit Cashflow, Sparquote und Budget berechnet werden können.' });
    }
    if (cf < 0) {
      out.push({ severity: 'critical', title: 'Negativer Cashflow', text: 'Du gibst mehr aus als du einnimmst (' + fmtEur(cf) + '/Monat). Priorität: Ausgaben senken oder Einkommen erhöhen, bevor investiert wird.' });
    } else if (sr > 0 && sr < 0.1 && inc > 0) {
      out.push({ severity: 'warn', title: 'Niedrige Sparquote', text: 'Deine Sparquote liegt bei ' + Math.round(sr * 100) + '%. Ziel: mindestens 20%. Identifiziere die größten Ausgabenblöcke.' });
    }
    if (em != null && em < 3) {
      out.push({ severity: 'warn', title: 'Notgroschen aufbauen', text: 'Dein Notgroschen reicht für ' + (em).toFixed(1) + ' Monate. Ziel: 3-6 Monatsausgaben als Sicherheitspuffer.' });
    }
    if (dti != null && dti > 0.36) {
      out.push({ severity: 'critical', title: 'Hohe Schuldenlast', text: 'Deine Schuldenrate beträgt ' + Math.round(dti * 100) + '% des Einkommens (kritisch ab 36%). Fokus auf Tilgung, neue Kredite vermeiden.' });
    }
    if (debts.length > 1) {
      var byApr = debts.slice().sort(function (a, b) { return num(b.apr) - num(a.apr); });
      out.push({ severity: 'info', title: 'Tilgungsreihenfolge (Avalanche)', text: 'Tilge zuerst „' + byApr[0].name + '" (' + num(byApr[0].apr) + '% Zins) – das spart am meisten Zinsen.' });
    }
    var highApr = debts.filter(function (d) { return num(d.apr) >= 10; });
    if (highApr.length) {
      out.push({ severity: 'warn', title: 'Teure Schulden zuerst', text: highApr.length + ' Kredit(e) mit >=10% Zins. Prüfe Umschuldung/Ratenkredit zu niedrigerem Zins.' });
    }
    if (cf > 0 && (!doc.holdings || !doc.holdings.length) && (em == null || em >= 3) && (dti == null || dti < 0.2)) {
      out.push({ severity: 'info', title: 'Investieren starten', text: 'Solide Basis vorhanden. Überschuss von ' + fmtEur(cf) + '/Monat könnte breit gestreut investiert werden (z. B. ETF-Sparplan).' });
    }
    return out;
  }

  var DISPLAY_CCY = 'CHF';
  function setDisplayCurrency(c) { if (c) DISPLAY_CCY = c; }
  function fmtEur(v) {
    try {
      return new Intl.NumberFormat('de-CH', { style: 'currency', currency: DISPLAY_CCY, maximumFractionDigits: 0 }).format(v || 0);
    } catch (e) { return (Math.round(v || 0)) + ' ' + DISPLAY_CCY; }
  }

  // ===================================================================
  // IST-WERTE aus tatsächlichen Buchungen (transactions)
  // Damit sich KPIs, Score, Budget und Meilensteine an die echten
  // Kontoaktivitäten anpassen statt nur an die geplanten Werte.
  // ===================================================================
  var ACTUAL_WINDOW = 3; // Monate für den gleitenden Durchschnitt

  function ymOf(t) { return String((t && t.date) || '').slice(0, 7); }

  function txDistinctMonths(doc) {
    var seen = {};
    ((doc && doc.transactions) || []).forEach(function (t) { var m = ymOf(t); if (m) seen[m] = 1; });
    return Object.keys(seen).sort().reverse();
  }
  function hasActuals(doc) { return ((doc && doc.transactions) || []).length > 0; }
  function basisOf(doc) { return (doc && doc.settings && doc.settings.basis) || 'actual'; }

  /** Ø Monatswert eines Buchungstyps über die letzten ACTUAL_WINDOW Monate mit Daten. */
  function actualPerMonth(doc, type, maxMonths) {
    if (!hasActuals(doc)) return null;
    var months = txDistinctMonths(doc);
    if (!months.length) return null;
    var win = months.slice(0, maxMonths || ACTUAL_WINDOW);
    var winSet = {};
    win.forEach(function (m) { winSet[m] = 1; });
    var sum = 0;
    ((doc && doc.transactions) || []).forEach(function (t) {
      if (t.type === type && winSet[ymOf(t)]) sum += num(t.amount);
    });
    return sum / win.length;
  }

  function actualMonthlyIncome(doc) { return actualPerMonth(doc, 'income', ACTUAL_WINDOW); }
  function actualMonthlyExpenses(doc) { return actualPerMonth(doc, 'expense', ACTUAL_WINDOW); }

  // „eff" = effektiver Wert je nach Basis: 'actual' (Ist, Fallback Plan), 'plan' = nur Plan.
  function effIncome(doc) {
    if (basisOf(doc) !== 'plan') { var a = actualMonthlyIncome(doc); if (a != null) return a; }
    return monthlyIncome(doc);
  }
  function effExpenses(doc) {
    if (basisOf(doc) !== 'plan') { var a = actualMonthlyExpenses(doc); if (a != null) return a; }
    return monthlyExpenses(doc);
  }
  function effCashflow(doc) { return effIncome(doc) - effExpenses(doc); }
  function effSavingsRate(doc) { var i = effIncome(doc); return i > 0 ? effCashflow(doc) / i : 0; }
  function effDebtToIncome(doc) { var i = effIncome(doc); if (i <= 0) return null; return totalMinPayments(doc) / i; }

  function effExpenseByCategory(doc) {
    if (basisOf(doc) === 'plan' || !hasActuals(doc)) return expenseByCategory(doc);
    var win = txDistinctMonths(doc).slice(0, ACTUAL_WINDOW);
    if (!win.length) return expenseByCategory(doc);
    var winSet = {};
    win.forEach(function (m) { winSet[m] = 1; });
    var map = {};
    ((doc && doc.transactions) || []).forEach(function (t) {
      if (t.type === 'expense' && winSet[ymOf(t)]) {
        var c = t.category || 'Sonstiges';
        map[c] = (map[c] || 0) + num(t.amount);
      }
    });
    Object.keys(map).forEach(function (k) { map[k] = map[k] / win.length; });
    return map;
  }

  var NEEDS_CATS = { 'Wohnen': 1, 'Versicherung': 1, 'Lebensmittel': 1, 'Kommunikation': 1, 'Gesundheit': 1, 'Transport': 1, 'Job-Werkzeug': 1 };
  var DEBT_CATS = { 'Schulden/Tilgung': 1 };

  function effBudget503020(doc) {
    if (basisOf(doc) === 'plan' || !hasActuals(doc)) return budget503020(doc);
    var inc = effIncome(doc);
    var byCat = effExpenseByCategory(doc);
    var needs = 0, wants = 0, debtRepay = 0;
    Object.keys(byCat).forEach(function (c) {
      if (NEEDS_CATS[c]) needs += byCat[c];
      else if (DEBT_CATS[c]) debtRepay += byCat[c];
      else if (c !== 'Einkommen') wants += byCat[c];
    });
    var saves = Math.max(0, effCashflow(doc)) + debtRepay;
    return {
      income: inc,
      needs: { actual: needs, target: inc * 0.5 },
      wants: { actual: wants, target: inc * 0.3 },
      savings: { actual: saves, target: inc * 0.2 }
    };
  }

  // ===================================================================
  // WIEDERKEHRENDE POSTEN (Fixkosten/Abos) + LIQUIDITÄTS-PROGNOSE
  // Erkennt Daueraufträge/Abos aus echten Buchungen und projiziert den
  // Kontostand der nächsten Wochen ("Komme ich diesen Monat durch?").
  // ===================================================================

  // Schlüssel zur Gruppierung gleichartiger Buchungen (Händler-Signatur).
  function recurKey(note) {
    var s = String(note || '').toLowerCase();
    s = s.replace(/\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}/g, ' ');   // Datumsangaben
    s = s.replace(/[0-9*xX]{4,}/g, ' ');                          // Karten-/Kontonummern
    s = s.replace(/[^a-zäöüéèà ]+/gi, ' ');                       // nur Buchstaben behalten
    s = s.replace(/\s+/g, ' ').trim();
    return s.split(' ').filter(Boolean).slice(0, 2).join(' ');
  }

  var CANCELABLE_KW = ['apple', 'itunes', 'cursor', 'openai', 'chatgpt', 'audible', 'netflix', 'spotify', 'gamma', 'prime', 'premium', 'paddle', 'icloud', 'youtube', 'disney', 'adobe', 'google', 'paypal', 'epost', 'sky', 'dazn'];
  var NEGOTIABLE_KW = ['swica', 'helsana', 'axa', 'sanitas', 'css', 'concordia', 'versicherung', 'assura', 'salt', 'swisscom', 'sunrise', 'mobile', 'wingo', 'yallo', 'serafe', 'billag'];
  var CANCELABLE_CATS = { 'Abo': 1, 'Unterhaltung': 1 };
  var NEGOTIABLE_CATS = { 'Versicherung': 1, 'Kommunikation': 1 };

  function classifyRecur(label, category) {
    var l = String(label || '').toLowerCase();
    function hit(arr) { return arr.some(function (k) { return l.indexOf(k) >= 0; }); }
    if (CANCELABLE_CATS[category] || hit(CANCELABLE_KW)) return 'cancelable';
    if (NEGOTIABLE_CATS[category] || hit(NEGOTIABLE_KW)) return 'negotiable';
    return 'fixed';
  }

  /**
   * Erkennt wiederkehrende Buchungen (≥2 verschiedene Monate) aus den letzten
   * `windowMonths` Datenmonaten. Liefert je Posten einen geschätzten Monatsbetrag,
   * Geldfluss (in/out), Klassifizierung (cancelable/negotiable/fixed) und Tag im Monat.
   */
  function detectRecurring(doc, windowMonths) {
    var txs = (doc && doc.transactions) || [];
    if (!txs.length) return [];
    var months = txDistinctMonths(doc).slice(0, windowMonths || 4);
    if (!months.length) return [];
    var winSet = {};
    months.forEach(function (m) { winSet[m] = 1; });

    var groups = {};
    txs.forEach(function (t) {
      var ym = ymOf(t);
      if (!winSet[ym]) return;
      var key = recurKey(t.note || t.description || t.category || '');
      if (!key) return;
      var g = groups[key] || (groups[key] = {
        key: key, total: 0, count: 0, monthsSet: {}, inCount: 0, outCount: 0,
        lastDate: '', lastNote: '', cat: t.category || 'Sonstiges'
      });
      g.total += Math.abs(num(t.amount));
      g.count += 1;
      g.monthsSet[ym] = 1;
      if (t.type === 'income') g.inCount += 1; else g.outCount += 1;
      if ((t.date || '') >= g.lastDate) { g.lastDate = t.date || ''; g.lastNote = t.note || t.description || g.cat; g.cat = t.category || g.cat; }
    });

    var out = [];
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      var nMonths = Object.keys(g.monthsSet).length;
      if (nMonths < 2) return;                 // nur echte Wiederkehrer
      var monthly = g.total / nMonths;
      if (monthly < 5) return;                 // Rauschen ausblenden
      var flow = g.inCount > g.outCount ? 'in' : 'out';
      var label = String(g.lastNote || g.key).replace(/\s+/g, ' ').trim().slice(0, 40);
      var dom = parseInt(String(g.lastDate).slice(8, 10), 10) || 1;
      out.push({
        key: k, label: label, category: g.cat, flow: flow,
        kind: flow === 'out' ? classifyRecur(label + ' ' + g.key, g.cat) : 'income',
        monthly: monthly, occurrences: g.count, months: nMonths, dom: dom, lastDate: g.lastDate
      });
    });
    out.sort(function (a, b) { return b.monthly - a.monthly; });
    return out;
  }

  /** Summen des Fixkosten-/Abo-Radars je Klasse (nur Ausgaben). */
  function recurringSummary(doc) {
    var rec = detectRecurring(doc);
    var s = { cancelable: 0, negotiable: 0, fixed: 0, income: 0, items: rec };
    rec.forEach(function (r) {
      if (r.flow === 'in') s.income += r.monthly;
      else s[r.kind] += r.monthly;
    });
    s.totalOut = s.cancelable + s.negotiable + s.fixed;
    // Konservatives Sparpotenzial: Abos ganz, Verhandelbares ~15%.
    s.potentialSaving = s.cancelable + s.negotiable * 0.15;
    return s;
  }

  /**
   * Liquiditäts-Prognose: projiziert den Kontostand über `horizonDays` Tage
   * anhand der wiederkehrenden Ein-/Auszahlungen. Findet den Tiefstpunkt und
   * eine Ampel-Einstufung ("Komme ich diesen Monat durch?").
   */
  function liquidityForecast(doc, horizonDays) {
    horizonDays = horizonDays || 45;
    var rec = detectRecurring(doc);
    var hasIncome = rec.some(function (r) { return r.flow === 'in'; });
    if (!rec.length || !hasIncome) {
      return { available: false };
    }
    var start = num(doc && doc.settings && doc.settings.cashBalance);
    var events = rec.map(function (r) {
      return { dom: r.dom, amount: r.flow === 'in' ? r.monthly : -r.monthly, label: r.label };
    });

    var today = new Date(); today.setHours(0, 0, 0, 0);
    var bal = start;
    var minBal = start, minDate = new Date(today);
    var timeline = [];
    for (var i = 0; i <= horizonDays; i++) {
      var d = new Date(today); d.setDate(d.getDate() + i);
      var dom = d.getDate();
      events.forEach(function (e) { if (e.dom === dom && i > 0) bal += e.amount; });
      if (bal < minBal) { minBal = bal; minDate = new Date(d); }
      timeline.push({ date: new Date(d), balance: bal });
    }

    var essential = monthlyEssentialExpenses(doc);
    var buffer = Math.max(300, essential * 0.25);
    var status = minBal < 0 ? 'risk' : (minBal < buffer ? 'tight' : 'ok');
    return {
      available: true,
      start: start, end: bal, minBal: minBal, minDate: minDate,
      status: status, buffer: buffer,
      shortfall: minBal < 0 ? -minBal : 0,
      monthlyNet: effCashflow(doc),
      timeline: timeline
    };
  }

  // ---- Sanierungsplan / Meilensteine ----
  /**
   * Aktueller Ist-Wert einer Meilenstein-Metrik aus den Live-Finanzdaten.
   * Erlaubt, Projekt-Meilensteine automatisch mit echten Zahlen zu verknüpfen.
   */
  function planMetricValue(doc, metric, priceMap) {
    switch (metric) {
      case 'debtFree':
      case 'debtBelow': return totalDebt(doc);
      case 'emergencyMonths': return emergencyMonths(doc);
      case 'cashflowPositive': return effCashflow(doc);
      case 'savingsRate': return effSavingsRate(doc);
      case 'netWorthPositive': return netWorth(doc, priceMap);
      default: return null;
    }
  }

  /**
   * Wertet einen Meilenstein aus: erreicht? Fortschritt 0..1? aktueller Wert?
   * 'manual' = reiner Haken; alle anderen Metriken werden aus den Daten berechnet.
   */
  function evalMilestone(doc, m, priceMap) {
    var baseline = num(doc && doc.plan && doc.plan.baselineDebt);
    if (!m.metric || m.metric === 'manual') {
      return { value: null, met: !!m.done, achieved: !!m.done, progress: m.done ? 1 : 0 };
    }
    var v = planMetricValue(doc, m.metric, priceMap);
    var t = num(m.target);
    var met = false, progress = 0;
    if (m.metric === 'debtFree') {
      met = v <= 0.005;
      progress = baseline > 0 ? clamp(1 - v / baseline, 0, 1) : (met ? 1 : 0);
    } else if (m.metric === 'debtBelow') {
      met = v <= t;
      if (baseline > t) progress = clamp((baseline - v) / (baseline - t), 0, 1);
      else progress = met ? 1 : clamp(t / (v || t), 0, 1);
    } else if (m.metric === 'emergencyMonths') {
      var ev = v == null ? 0 : v;
      met = ev >= t; progress = t > 0 ? clamp(ev / t, 0, 1) : (met ? 1 : 0);
    } else if (m.metric === 'cashflowPositive') {
      met = v >= t; progress = met ? 1 : 0;
    } else if (m.metric === 'savingsRate') {
      met = v >= t; progress = t > 0 ? clamp(v / t, 0, 1) : (met ? 1 : 0);
    } else if (m.metric === 'netWorthPositive') {
      met = v >= t; progress = met ? 1 : 0;
    }
    return { value: v, met: met, achieved: met, progress: progress };
  }

  /** Gesamtfortschritt des Sanierungsprojekts über alle Meilensteine. */
  function planProgress(doc, priceMap) {
    var ms = (doc && doc.plan && doc.plan.milestones) || [];
    if (!ms.length) return { count: 0, total: 0, pct: 0, items: {} };
    var items = {};
    var sum = 0, achieved = 0;
    ms.forEach(function (m) {
      var ev = evalMilestone(doc, m, priceMap);
      items[m.id] = ev;
      sum += ev.progress;
      if (ev.achieved) achieved += 1;
    });
    return { count: achieved, total: ms.length, pct: sum / ms.length, items: items };
  }

  window.FinanceEngine = {
    toMonthly: toMonthly,
    monthlyIncome: monthlyIncome,
    monthlyExpenses: monthlyExpenses,
    monthlyEssentialExpenses: monthlyEssentialExpenses,
    cashflow: cashflow,
    savingsRate: savingsRate,
    totalDebt: totalDebt,
    totalMinPayments: totalMinPayments,
    weightedApr: weightedApr,
    debtToIncome: debtToIncome,
    simulatePayoff: simulatePayoff,
    comparePayoff: comparePayoff,
    portfolioValue: portfolioValue,
    portfolioCost: portfolioCost,
    holdingValue: holdingValue,
    holdingCost: holdingCost,
    liquidSavings: liquidSavings,
    emergencyFundSaved: emergencyFundSaved,
    emergencyMonths: emergencyMonths,
    netWorth: netWorth,
    budget503020: budget503020,
    expenseByCategory: expenseByCategory,
    healthScore: healthScore,
    insights: insights,
    hasActuals: hasActuals,
    basisOf: basisOf,
    actualMonthlyIncome: actualMonthlyIncome,
    actualMonthlyExpenses: actualMonthlyExpenses,
    effIncome: effIncome,
    effExpenses: effExpenses,
    effCashflow: effCashflow,
    effSavingsRate: effSavingsRate,
    effDebtToIncome: effDebtToIncome,
    effExpenseByCategory: effExpenseByCategory,
    effBudget503020: effBudget503020,
    planMetricValue: planMetricValue,
    evalMilestone: evalMilestone,
    planProgress: planProgress,
    detectRecurring: detectRecurring,
    recurringSummary: recurringSummary,
    liquidityForecast: liquidityForecast,
    fmtEur: fmtEur,
    setDisplayCurrency: setDisplayCurrency,
    num: num
  };
})();
