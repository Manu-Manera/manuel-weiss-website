/**
 * Persönlichkeits-Song Generator – Datenimport
 *
 * Sammelt aus zwei Quellen alle Erkenntnisse aus den
 * Persönlichkeitsentwicklungs-Methoden:
 *
 *  1. AWS-Profil (DynamoDB via window.awsProfileAPI):
 *     progressData.pages[pageId] mit formData, results, steps, completionPercentage
 *
 *  2. LocalStorage (lokal pro Methode):
 *     ikigai*, raisec-*, wheelOfLife*, johari-window-progress, five-pillars-progress,
 *     values-clarification-*, changeMgmtDetail*, …
 *
 * Erzeugt eine narrative Zusammenfassung pro Methode + Gesamt-Übersicht,
 * die anschließend an die KI als externer Input vom Typ
 * "personality_methods_history" übergeben wird.
 */

(function () {
  'use strict';

  // ────────────────────────────────────────────────────────────
  // Methoden-Mapping: pageId / localStorage-Key → Methodenname
  // ────────────────────────────────────────────────────────────
  const METHOD_MAP = {
    // Cloud pageIds (vom user-progress-tracker)
    'ikigai':                  { name: 'Ikigai',                  category: 'self-discovery' },
    'persoenlichkeitsentwicklung': { name: 'Ikigai-Workflow',     category: 'self-discovery' },
    'values-clarification':    { name: 'Werte-Klärung',           category: 'self-discovery' },
    'raisec':                  { name: 'RAISEC-Modell',           category: 'analysis' },
    'wheel-of-life':           { name: 'Lebensrad',               category: 'self-discovery' },
    'johari-window':           { name: 'Johari-Fenster',          category: 'self-awareness' },
    'five-pillars':            { name: 'Fünf-Säulen-Modell',      category: 'self-awareness' },
    'goal-setting':            { name: 'Zielsetzung',             category: 'goals' },
    'mindfulness':             { name: 'Achtsamkeit',             category: 'mindfulness' },
    'emotional-intelligence':  { name: 'Emotionale Intelligenz',  category: 'communication' },
    'habit-building':          { name: 'Gewohnheits-Aufbau',      category: 'habits' },
    'communication':           { name: 'Kommunikations-Modell',   category: 'communication' },
    'time-management':         { name: 'Zeitmanagement',          category: 'goals' },
    'aek-communication':       { name: 'AEK-Kommunikation',       category: 'communication' },
    'change-stages':           { name: 'Veränderungsphasen',      category: 'coaching' },
    'circular-interview':      { name: 'Zirkuläres Interview',    category: 'coaching' },
    'competence-map':          { name: 'Kompetenzlandkarte',      category: 'analysis' },
    'conflict-escalation':     { name: 'Konflikteskalation',      category: 'conflict' },
    'rubikon-model':           { name: 'Rubikon-Modell',          category: 'goals' },
    'solution-focused':        { name: 'Lösungsfokus',            category: 'coaching' },
    'systemic-coaching':       { name: 'Systemisches Coaching',   category: 'coaching' },
    'target-coaching':         { name: 'Ziel-Coaching',           category: 'coaching' },
    'walt-disney':             { name: 'Walt-Disney-Strategie',   category: 'coaching' },
    'nlp-dilts':               { name: 'NLP Dilts-Pyramide',      category: 'nlp' },
    'nlp-meta-goal':           { name: 'NLP Meta-Ziel',           category: 'nlp' },
    'nonviolent-communication':{ name: 'Gewaltfreie Kommunikation', category: 'communication' },
    'rafael-method':           { name: 'Rafael-Methode',          category: 'analysis' },
    'harvard-method':          { name: 'Harvard-Verhandlungsmodell', category: 'communication' },
    'moment-excellence':       { name: 'Moment der Exzellenz',    category: 'self-awareness' },
    'resource-analysis':       { name: 'Ressourcen-Analyse',      category: 'analysis' },
    'self-assessment':         { name: 'Selbsteinschätzung',      category: 'self-awareness' },
    'strengths-analysis':      { name: 'Stärken-Analyse',         category: 'analysis' },
    'stress-management':       { name: 'Stress-Management',       category: 'mindfulness' },
    'via-strengths':           { name: 'VIA-Stärken',             category: 'analysis' },
    'gallup-strengths':        { name: 'Gallup StrengthsFinder',  category: 'analysis' },
    'fachliche-entwicklung':   { name: 'Fachliche Entwicklung',   category: 'career' },
    'therapy-form-finder':     { name: 'Therapieform-Finder',     category: 'self-awareness' }
  };

  // LocalStorage-Keys, die wir scannen + Mapping zu pageId
  const LS_KEYS_TO_PAGE = {
    'ikigaiProgress':           'ikigai',
    'ikigaiStep1':              'ikigai',
    'ikigaiStep2':              'ikigai',
    'ikigaiStep3':              'ikigai',
    'ikigaiStep4':              'ikigai',
    'ikigaiStep5':              'ikigai',
    'ikigaiStep6':              'ikigai',
    'ikigaiStep7':              'ikigai',
    'raisec-workflow':          'raisec',
    'raisec-realistic':         'raisec',
    'raisec-investigative':     'raisec',
    'raisec-artistic':          'raisec',
    'raisec-social':            'raisec',
    'raisec-enterprising':      'raisec',
    'raisec-conventional':      'raisec',
    'wheelOfLifeSmartWorkflow': 'wheel-of-life',
    'johari-window-progress':   'johari-window',
    'five-pillars-progress':    'five-pillars',
    'values-clarification-progress': 'values-clarification',
    'changeMgmtDetailAssessments':   'change-stages',
    'gallup-strengths-result':  'gallup-strengths',
    'via-strengths-result':     'via-strengths',
    'fachliche-entwicklung-data': 'fachliche-entwicklung',
    'competence-map-data':      'competence-map'
  };

  // ────────────────────────────────────────────────────────────
  // Auth-Helfer
  // ────────────────────────────────────────────────────────────
  function isLoggedIn() {
    if (window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()) return true;
    if (window.awsAuth && window.awsAuth.isLoggedIn && window.awsAuth.isLoggedIn()) return true;
    return false;
  }

  function getCurrentUser() {
    if (window.realUserAuth && window.realUserAuth.getCurrentUser) return window.realUserAuth.getCurrentUser();
    if (window.awsAuth && window.awsAuth.getCurrentUser) return window.awsAuth.getCurrentUser();
    return null;
  }

  // ────────────────────────────────────────────────────────────
  // Cloud-Daten: AWS-Profil laden
  // ────────────────────────────────────────────────────────────
  async function loadCloudData() {
    if (!isLoggedIn()) return null;
    try {
      if (!window.awsProfileAPI) return null;
      const profile = await window.awsProfileAPI.loadProfile();
      return profile && profile.progressData ? profile.progressData : null;
    } catch (err) {
      console.warn('[SongGenerator/Import] Cloud-Profil konnte nicht geladen werden:', err && err.message);
      return null;
    }
  }

  // ────────────────────────────────────────────────────────────
  // LocalStorage scannen
  // ────────────────────────────────────────────────────────────
  function loadLocalStorageData() {
    const out = {};
    Object.keys(LS_KEYS_TO_PAGE).forEach(lsKey => {
      try {
        const raw = localStorage.getItem(lsKey);
        if (!raw) return;
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch (_e) { parsed = raw; }
        if (!parsed) return;
        const pageId = LS_KEYS_TO_PAGE[lsKey];
        if (!out[pageId]) out[pageId] = { sources: [] };
        out[pageId].sources.push({ key: lsKey, data: parsed });
      } catch (_e) { /* ignore */ }
    });
    return out;
  }

  // ────────────────────────────────────────────────────────────
  // Pro Methode eine narrative Zusammenfassung erzeugen
  // ────────────────────────────────────────────────────────────
  function summarizeIkigai(localSources, cloudPage) {
    const findings = [];
    if (cloudPage && cloudPage.formData) {
      const fd = cloudPage.formData;
      if (fd.passion) findings.push('Leidenschaft: ' + fd.passion);
      if (fd.mission) findings.push('Mission: ' + fd.mission);
      if (fd.profession) findings.push('Beruf: ' + fd.profession);
      if (fd.vocation) findings.push('Berufung: ' + fd.vocation);
      if (fd.ikigai) findings.push('Ikigai: ' + fd.ikigai);
    }
    (localSources || []).forEach(src => {
      const d = src.data;
      if (!d || typeof d !== 'object') return;
      ['passion', 'mission', 'profession', 'vocation', 'ikigai',
       'whatYouLove', 'whatTheWorldNeeds', 'whatYouCanBePaidFor', 'whatYouAreGoodAt']
        .forEach(field => {
          if (typeof d[field] === 'string' && d[field].trim()) {
            findings.push(field + ': ' + d[field].trim());
          }
        });
      // Generische Antworten/Notizen
      if (Array.isArray(d.answers)) findings.push('Antworten: ' + d.answers.slice(0, 5).join(' · '));
      if (typeof d.notes === 'string' && d.notes.trim()) findings.push('Notiz: ' + d.notes.slice(0, 200));
    });
    return findings;
  }

  function summarizeRaisec(localSources, cloudPage) {
    const findings = [];
    const dimensions = { realistic: 'Realistisch', investigative: 'Forschend',
      artistic: 'Künstlerisch', social: 'Sozial',
      enterprising: 'Unternehmerisch', conventional: 'Konventionell' };
    (localSources || []).forEach(src => {
      const m = src.key.match(/^raisec-(.+)$/);
      if (!m) return;
      const dim = dimensions[m[1]];
      const d = src.data;
      if (dim && d && typeof d === 'object') {
        const score = d.score || d.totalScore || (Array.isArray(d.answers) ? d.answers.reduce((a, x) => a + (Number(x) || 0), 0) : null);
        if (score !== null) findings.push(dim + ': ' + score);
      }
    });
    if (cloudPage && cloudPage.results && cloudPage.results.length) {
      const last = cloudPage.results[cloudPage.results.length - 1];
      if (last && last.dominantTypes) findings.push('Dominante Typen: ' + (Array.isArray(last.dominantTypes) ? last.dominantTypes.join(', ') : last.dominantTypes));
    }
    return findings;
  }

  function summarizeWheelOfLife(localSources, cloudPage) {
    const findings = [];
    (localSources || []).forEach(src => {
      const d = src.data;
      if (!d || typeof d !== 'object') return;
      if (d.scores && typeof d.scores === 'object') {
        Object.keys(d.scores).slice(0, 8).forEach(area => {
          findings.push(area + ': ' + d.scores[area] + '/10');
        });
      }
      if (typeof d.priority === 'string') findings.push('Top-Priorität: ' + d.priority);
    });
    return findings;
  }

  function summarizeValues(localSources, cloudPage) {
    const findings = [];
    (localSources || []).forEach(src => {
      const d = src.data;
      if (!d || typeof d !== 'object') return;
      if (Array.isArray(d.topValues)) findings.push('Top-Werte: ' + d.topValues.slice(0, 5).join(', '));
      if (Array.isArray(d.selected)) findings.push('Gewählte Werte: ' + d.selected.slice(0, 5).join(', '));
    });
    if (cloudPage && cloudPage.formData && Array.isArray(cloudPage.formData.topValues)) {
      findings.push('Cloud Top-Werte: ' + cloudPage.formData.topValues.slice(0, 5).join(', '));
    }
    return findings;
  }

  function summarizeJohari(localSources) {
    const findings = [];
    (localSources || []).forEach(src => {
      const d = src.data;
      if (!d || typeof d !== 'object') return;
      ['arena', 'blindSpot', 'facade', 'unknown'].forEach(field => {
        if (Array.isArray(d[field]) && d[field].length) {
          findings.push(field + ': ' + d[field].slice(0, 4).join(', '));
        } else if (typeof d[field] === 'string' && d[field]) {
          findings.push(field + ': ' + d[field]);
        }
      });
    });
    return findings;
  }

  function summarizeGeneric(localSources, cloudPage) {
    const findings = [];
    (localSources || []).forEach(src => {
      const d = src.data;
      if (!d) return;
      if (typeof d === 'string') {
        findings.push(d.slice(0, 200));
        return;
      }
      if (typeof d !== 'object') return;
      // 1) Wenn formData vorhanden, alles Stringartige extrahieren
      const fd = d.formData || d;
      Object.keys(fd).slice(0, 8).forEach(k => {
        const v = fd[k];
        if (typeof v === 'string' && v.trim() && v.length < 400) {
          findings.push(k + ': ' + v.trim());
        } else if (Array.isArray(v) && v.length) {
          findings.push(k + ': ' + v.slice(0, 5).join(', '));
        } else if (typeof v === 'number') {
          findings.push(k + ': ' + v);
        }
      });
    });
    if (cloudPage && cloudPage.formData) {
      Object.keys(cloudPage.formData).slice(0, 6).forEach(k => {
        const v = cloudPage.formData[k];
        if (typeof v === 'string' && v.trim()) findings.push(k + ': ' + v.trim().slice(0, 200));
      });
    }
    if (cloudPage && Array.isArray(cloudPage.results) && cloudPage.results.length) {
      const last = cloudPage.results[cloudPage.results.length - 1];
      if (typeof last === 'object') {
        Object.keys(last).slice(0, 5).forEach(k => {
          const v = last[k];
          if (typeof v === 'string' && v.trim()) findings.push(k + ': ' + v);
          else if (typeof v === 'number') findings.push(k + ': ' + v);
        });
      }
    }
    return findings;
  }

  // ────────────────────────────────────────────────────────────
  // Hauptfunktion: alle Methoden importieren + zusammenfassen
  // ────────────────────────────────────────────────────────────
  async function importAllMethodData() {
    const cloud = await loadCloudData();        // { pages: { ikigai: {...}, ... } }
    const local = loadLocalStorageData();        // { ikigai: { sources: [...] }, ... }

    const cloudPages = (cloud && cloud.pages) || {};
    const allPageIds = new Set([...Object.keys(cloudPages), ...Object.keys(local)]);

    const methods = [];

    allPageIds.forEach(pageId => {
      const meta = METHOD_MAP[pageId];
      const cloudPage = cloudPages[pageId] || null;
      const localSrc = (local[pageId] && local[pageId].sources) || [];

      // Findings je Methodentyp
      let findings;
      if (pageId === 'ikigai' || pageId === 'persoenlichkeitsentwicklung') findings = summarizeIkigai(localSrc, cloudPage);
      else if (pageId === 'raisec') findings = summarizeRaisec(localSrc, cloudPage);
      else if (pageId === 'wheel-of-life') findings = summarizeWheelOfLife(localSrc, cloudPage);
      else if (pageId === 'values-clarification') findings = summarizeValues(localSrc, cloudPage);
      else if (pageId === 'johari-window') findings = summarizeJohari(localSrc);
      else findings = summarizeGeneric(localSrc, cloudPage);

      // Nur Methoden mit echten Inhalten aufnehmen
      if (!findings || !findings.length) {
        // Nur „besucht aber leer" → ignorieren
        return;
      }

      methods.push({
        pageId,
        name: (meta && meta.name) || pageId,
        category: (meta && meta.category) || 'other',
        completion: cloudPage && typeof cloudPage.completionPercentage === 'number' ? cloudPage.completionPercentage : null,
        completedAt: cloudPage && cloudPage.completedAt || null,
        findings: findings.slice(0, 12)   // Maximal 12 Stichpunkte je Methode
      });
    });

    // Stable Sort: nach Kategorie, dann Name
    methods.sort((a, b) => (a.category + a.name).localeCompare(b.category + b.name));

    // Gesamtzusammenfassung als ausformulierter Text-Block
    const narrative = buildNarrativeSummary(methods);

    return {
      methods,
      methodCount: methods.length,
      hasCloud: !!cloud,
      narrative,
      generatedAt: new Date().toISOString(),
      user: getCurrentUser()
    };
  }

  // ────────────────────────────────────────────────────────────
  // Ausformulierte Zusammenfassung (für KI-Synthese und UI)
  // ────────────────────────────────────────────────────────────
  function buildNarrativeSummary(methods) {
    if (!methods || !methods.length) return '';
    const lines = [];
    lines.push('Aus ' + methods.length + ' bisher bearbeiteten Persönlichkeitsentwicklungs-Methoden ergeben sich folgende Erkenntnisse:');
    lines.push('');
    methods.forEach(m => {
      lines.push('## ' + m.name + (m.completion !== null ? ' (' + m.completion + '% bearbeitet)' : ''));
      m.findings.forEach(f => lines.push('  • ' + f));
      lines.push('');
    });
    return lines.join('\n');
  }

  // ────────────────────────────────────────────────────────────
  // Globale Exports
  // ────────────────────────────────────────────────────────────
  window.SongGeneratorImport = {
    importAllMethodData,
    isLoggedIn,
    getCurrentUser,
    METHOD_MAP
  };
})();
