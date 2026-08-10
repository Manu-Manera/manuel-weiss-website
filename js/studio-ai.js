/**
 * Studio-AI – KI-Assistent für das Musik-Studio.
 *
 * Analysiert den geladenen Song (Titel, Style, Lyrics, Timestamps, Dauer,
 * Versionen) und liefert strukturierte, direkt ausführbare Vorschläge:
 *   { type: 'replace_section'|'extend'|'cover'|'stems'|'add_vocals'|'add_instrumental'|'mix'|'wav', params: {...} }
 *
 * OpenAI Direct-Mode – gleicher Key-Pfad wie der Song-Generator
 * (globaler Key aus dem Admin-Panel, Fallback localStorage).
 */
(function () {
  'use strict';

  const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
  const MODEL = 'gpt-4.1';

  const _keyCache = { value: null, expiresAt: 0 };

  function isValidKey(k) { return typeof k === 'string' && k.startsWith('sk-') && k.length > 20; }

  async function getOpenAIKey() {
    if (_keyCache.value && _keyCache.expiresAt > Date.now()) return _keyCache.value;
    try {
      const res = await fetch(API_BASE + '/api-settings?action=key&provider=openai&global=true', {
        method: 'GET', headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json().catch(function () { return null; });
        if (data && isValidKey(data.apiKey)) {
          _keyCache.value = data.apiKey;
          _keyCache.expiresAt = Date.now() + 5 * 60 * 1000;
          return data.apiKey;
        }
      }
    } catch (_e) {}
    try {
      const lk = localStorage.getItem('openai-api-key');
      if (isValidKey(lk)) {
        _keyCache.value = lk;
        _keyCache.expiresAt = Date.now() + 5 * 60 * 1000;
        return lk;
      }
    } catch (_e) {}
    return null;
  }

  function safeJsonParse(text) {
    if (!text || typeof text !== 'string') return null;
    let candidate = text.trim()
      .replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
    try { return JSON.parse(candidate); } catch (_e) {}
    const first = candidate.indexOf('{');
    const last = candidate.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try { return JSON.parse(candidate.slice(first, last + 1)); } catch (_e) {}
    }
    return null;
  }

  async function callOpenAI(system, user, maxTokens) {
    const key = await getOpenAIKey();
    if (!key) throw new Error('Kein OpenAI-API-Key gefunden (Admin-Panel → API Keys → OpenAI).');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.7,
        max_tokens: maxTokens || 2500,
        response_format: { type: 'json_object' }
      })
    });
    const data = await res.json().catch(function () { return null; });
    if (!res.ok || !data) {
      const msg = data && data.error && data.error.message;
      throw new Error('OpenAI-Fehler: HTTP ' + res.status + (msg ? ' – ' + msg : ''));
    }
    const content = data.choices && data.choices[0] && data.choices[0].message &&
      data.choices[0].message.content;
    const parsed = safeJsonParse(content);
    if (!parsed) throw new Error('KI-Antwort war kein gültiges JSON.');
    return parsed;
  }

  // ────────────────────────────────────────────────────────────
  // Prompts
  // ────────────────────────────────────────────────────────────

  const SYSTEM = [
    'Du bist ein erfahrener Musikproduzent und Studio-Assistent in einem Web-Musikstudio.',
    'Das Studio kann folgende Aktionen auf einen bestehenden KI-generierten Song anwenden:',
    '- replace_section: Abschnitt von 6-60 Sekunden neu generieren (params: infillStartS, infillEndS, prompt = neue Lyrics des Abschnitts, tags = Stil-Tags)',
    '- extend: Song ab einem Zeitpunkt verlängern (params: continueAt in Sekunden, prompt = Beschreibung/Lyrics der Fortsetzung, style)',
    '- cover: Song in neuem Stil covern, Melodie bleibt (params: style = neuer Stil, prompt = Beschreibung)',
    '- stems: Song in Einzelspuren trennen (params: type = separate_vocal | split_stem)',
    '- add_vocals: Gesang auf ein Instrumental legen (params: prompt = Lyrics, style)',
    '- add_instrumental: Begleitung unter eine Gesangsspur legen (params: tags = Stil)',
    '- mix: Mixer-Empfehlung, wenn Stems vorhanden sind (params: stem = Name, gain = 0-2, hinweis)',
    '- wav: Export als hochauflösendes WAV (keine params)',
    '',
    'Antworte IMMER ausschließlich mit gültigem JSON nach diesem Schema:',
    '{',
    '  "summary": "1-2 Sätze Analyse des Songs auf Deutsch",',
    '  "suggestions": [',
    '    {',
    '      "title": "Kurzer Titel des Vorschlags",',
    '      "description": "1-2 Sätze, warum das den Song besser macht",',
    '      "type": "replace_section|extend|cover|stems|add_vocals|add_instrumental|mix|wav",',
    '      "params": { }',
    '    }',
    '  ],',
    '  "answer": "Nur bei direkten Fragen: deine Antwort auf Deutsch, sonst leer"',
    '}',
    '',
    'Regeln:',
    '- 3 bis 5 Vorschläge, konkret und auf DIESEN Song bezogen (nutze Titel, Lyrics, Stil, Dauer).',
    '- Bei replace_section: Zeitfenster MUSS 6-60 Sekunden lang sein und innerhalb der Songdauer liegen. Nutze die Timestamps, um sinnvolle Grenzen (Zeilen-/Sektionsanfänge) zu treffen. prompt = die NEUEN Lyrics nur für diesen Abschnitt.',
    '- Bei extend: continueAt < Songdauer.',
    '- Alle sichtbaren Texte auf Deutsch; style/tags-Parameter auf Englisch (Suno versteht Englisch besser).',
    '- Keine Vorschläge für Aktionen, die laut Kontext nicht verfügbar sind.'
  ].join('\n');

  function buildContext(ctx) {
    const parts = [];
    parts.push('SONG-KONTEXT:');
    parts.push('Titel: ' + (ctx.title || 'unbekannt'));
    if (ctx.style) parts.push('Stil/Tags: ' + ctx.style);
    if (ctx.duration) parts.push('Dauer: ' + Math.round(ctx.duration) + ' Sekunden');
    if (ctx.model) parts.push('Suno-Modell: ' + ctx.model);
    parts.push('Verfügbare Aktionen: ' + (ctx.capabilities || []).join(', '));
    if (ctx.versionCount > 1) parts.push('Bisherige Versionen: ' + ctx.versionCount);
    if (ctx.stems && ctx.stems.length) {
      parts.push('Vorhandene Stems: ' + ctx.stems.map(function (s) { return s.name; }).join(', '));
    }
    if (ctx.region) {
      parts.push('Vom Nutzer markierter Abschnitt: ' + ctx.region.start.toFixed(1) + 's bis ' +
        ctx.region.end.toFixed(1) + 's');
    }
    if (ctx.lyrics) {
      parts.push('');
      parts.push('LYRICS:');
      parts.push(String(ctx.lyrics).slice(0, 3000));
    }
    if (ctx.timestampSections && ctx.timestampSections.length) {
      parts.push('');
      parts.push('ZEITSTEMPEL (Zeilenanfänge):');
      ctx.timestampSections.slice(0, 60).forEach(function (l) {
        parts.push(l.time.toFixed(1) + 's: ' + l.text);
      });
    }
    return parts.join('\n');
  }

  /** Strukturierte Vorschläge für den aktuellen Song. */
  async function suggest(ctx) {
    const user = buildContext(ctx) + '\n\nAUFGABE:\nAnalysiere den Song und gib 3-5 konkrete Verbesserungs-Vorschläge nach dem Schema zurück.';
    return callOpenAI(SYSTEM, user, 2500);
  }

  /** Freitext-Frage/Anweisung des Nutzers, gleiche strukturierte Antwort. */
  async function chat(ctx, userMessage, history) {
    let user = buildContext(ctx);
    if (Array.isArray(history) && history.length) {
      user += '\n\nBISHERIGER DIALOG:\n' + history.slice(-6).map(function (h) {
        return (h.role === 'user' ? 'Nutzer: ' : 'Assistent: ') + h.text;
      }).join('\n');
    }
    user += '\n\nNUTZER-ANFRAGE:\n' + userMessage +
      '\n\nBeantworte die Anfrage im Feld "answer" und gib passende ausführbare Vorschläge in "suggestions" (0-4 Stück, nur wenn sinnvoll).';
    return callOpenAI(SYSTEM, user, 2500);
  }

  window.StudioAI = {
    suggest: suggest,
    chat: chat,
    getOpenAIKey: getOpenAIKey
  };
})();
