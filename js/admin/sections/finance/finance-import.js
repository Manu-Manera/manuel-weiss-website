/**
 * FinanceImport – datenschutzfreundlicher Kontoauszug-Import.
 *
 * Ablauf:
 *  1) PDF wird AUSSCHLIESSLICH im Browser gelesen (pdf.js, lazy geladen). Die Datei
 *     selbst verlässt das Gerät nie.
 *  2) redact() entfernt vor jeder Weitergabe sensible Identifikatoren
 *     (IBAN, Kartennummern, Name, Adresse, Kunden-/Kontonummern, Depot).
 *  3) Erst der bereinigte Text wird (in finanzen.js) zur Struktur-Extraktion an
 *     die KI gegeben. parseJson() liest die Antwort robust ein.
 *
 * Reiner Utility-Layer ohne DOM-Abhängigkeit (außer pdf.js-Script-Injection).
 */
(function () {
  'use strict';

  var PDFJS_VERSION = '3.11.174';
  var PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION;

  function loadPdfjs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = PDFJS_BASE + '/pdf.min.js';
      s.onload = function () {
        try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + '/pdf.worker.min.js'; } catch (e) { /* ignore */ }
        if (window.pdfjsLib) resolve(window.pdfjsLib);
        else reject(new Error('PDF-Bibliothek nicht verfügbar'));
      };
      s.onerror = function () { reject(new Error('PDF-Bibliothek konnte nicht geladen werden (Internet nötig).')); };
      document.head.appendChild(s);
    });
  }

  // Text-Items einer Seite zu lesbaren Zeilen gruppieren (nach y-Position).
  function itemsToLines(items) {
    var lines = [];
    var cur = null;
    var lastY = null;
    items.forEach(function (it) {
      var y = it.transform ? Math.round(it.transform[5]) : 0;
      if (lastY === null || Math.abs(y - lastY) > 2) {
        cur = { y: y, parts: [] };
        lines.push(cur);
        lastY = y;
      }
      if (it.str) cur.parts.push(it.str);
    });
    return lines.map(function (l) { return l.parts.join(' ').replace(/\s+/g, ' ').trim(); })
      .filter(function (s) { return s.length; });
  }

  function extractPdfText(file) {
    return loadPdfjs().then(function (pdfjsLib) {
      return file.arrayBuffer().then(function (buf) {
        return pdfjsLib.getDocument({ data: buf }).promise;
      }).then(function (pdf) {
        var pageText = [];
        var seq = Promise.resolve();
        for (var i = 1; i <= pdf.numPages; i++) {
          (function (n) {
            seq = seq.then(function () {
              return pdf.getPage(n).then(function (page) { return page.getTextContent(); })
                .then(function (tc) { pageText.push(itemsToLines(tc.items).join('\n')); });
            });
          })(i);
        }
        return seq.then(function () { return pageText.join('\n'); });
      });
    });
  }

  /**
   * Entfernt personenbezogene Identifikatoren. Buchungstexte (Händler) bleiben
   * erhalten, da sie für die Kategorisierung gebraucht werden.
   */
  function redact(text, enabled) {
    if (enabled === false) return text;
    var t = String(text || '');
    // IBAN (z. B. CH73 0028 7287 ... / DE97 1203 ...)
    t = t.replace(/\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){10,32}\b/g, '[IBAN]');
    // BIC
    t = t.replace(/\b[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g, function (m) {
      return /\d/.test(m) ? '[BIC]' : m; // nur maskieren, wenn plausibel (enthält Ziffer)
    });
    // Maskierte/echte Kartennummern (13–19 Ziffern, evtl. mit X/Leerzeichen)
    t = t.replace(/\b(?:[0-9X]{4}[ ]?){3,4}[0-9X]{2,4}\b/gi, '[KARTE]');
    // Konto-/Kunden-/Depot-/Vertrags-/Gläubiger-IDs
    t = t.replace(/\b(Konto(?:-Nr| ?Nr|nummer)?|Kunden(?:-Nr| ?Nr|nummer)?|Depot(?:nummer)?|Vertrag|Gläubiger-?ID|D-?Nr|Kd\.?|Darlehenskonto-?Nr)\.?\s*:?[\s.]*([A-Z0-9\/.\- ]{4,})/gi,
      function (_m, label) { return label + ': [GESCHWÄRZT]'; });
    // Name
    t = t.replace(/Manuel(?:\s+Alexander)?\s+Wei(?:ß|ss)/gi, '[NAME]');
    // Adresse
    t = t.replace(/Pilatusstrasse\s*40/gi, '[ADRESSE]');
    t = t.replace(/8330\s*Pf[aä]ffikon(?:\s*ZH)?/gi, '[PLZ ORT]');
    return t;
  }

  /** Robustes JSON-Parsing aus einer Modell-Antwort (auch mit Code-Fences/Text drumherum). */
  function parseJson(str) {
    if (!str) return null;
    var s = String(str).trim();
    s = s.replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
    try { return JSON.parse(s); } catch (e) { /* weiter */ }
    var first = s.indexOf('{');
    var last = s.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try { return JSON.parse(s.slice(first, last + 1)); } catch (e2) { /* ignore */ }
    }
    return null;
  }

  /** Deduplizierungs-Schlüssel für eine Buchung. */
  function dedupeKey(tx) {
    var amt = Math.round((Number(tx.amount) || 0) * 100);
    var note = String(tx.note || tx.description || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14);
    return (tx.date || '') + '|' + amt + '|' + note;
  }

  window.FinanceImport = {
    extractPdfText: extractPdfText,
    redact: redact,
    parseJson: parseJson,
    dedupeKey: dedupeKey
  };
})();
