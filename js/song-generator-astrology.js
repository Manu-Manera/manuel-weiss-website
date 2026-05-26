/**
 * Persönlichkeits-Song Generator – Astrologie-Modul
 *
 * Berechnet eine klassische Geburtskarte (Natal Chart) clientseitig:
 *   - Geozentrische Ekliptik-Längen für 10 Planeten via astronomy-engine
 *   - Aszendent (Asc) und Medium Coeli (MC) aus Datum/Zeit/Geo-Position
 *   - Whole-Sign-Häuser (Haus 1 = Aszendenten-Zeichen)
 *   - Aspekte (Konjunktion, Sextil, Quadrat, Trigon, Opposition) mit Orbis 6°
 *   - Mapping in eine musikalisch nutzbare Bildersprache (NICHT als Diagnose,
 *     sondern als symbolische Schicht, die der Songtext aufgreifen darf)
 *
 * Wichtig:
 *  - Astrologie ist wissenschaftlich nicht validiert. Wir nutzen sie hier
 *    ausschließlich als kreatives Bildervokabular für den Songtext.
 *  - Die wissenschaftliche Persönlichkeitsanalyse (IPIP-NEO + HEXACO + Werte +
 *    Bindung) bleibt die primäre Quelle für die Klang-DNA.
 *
 * Genauigkeit:
 *  - astronomy-engine: ±1 Bogenminute (mehr als ausreichend für astrologische
 *    Aussagen, die ohnehin mit Orbis 6° arbeiten)
 *  - Aszendent/MC: eigene Berechnung über Greenwich Mean Sidereal Time
 *    (Meeus, Astronomical Algorithms, Kap. 12) und Position der Ekliptik
 *    relativ zum lokalen Horizont (Meeus Kap. 13)
 *
 * Abhängigkeiten:
 *  - window.Astronomy (astronomy-engine, via CDN geladen)
 */

(function () {
  'use strict';

  // ────────────────────────────────────────────────────────────
  // Konstanten: Zeichen, Planeten, Aspekte
  // ────────────────────────────────────────────────────────────
  const SIGNS = [
    { idx:0,  key:'aries',       de:'Widder',       symbol:'\u2648', element:'fire',  modality:'cardinal' },
    { idx:1,  key:'taurus',      de:'Stier',        symbol:'\u2649', element:'earth', modality:'fixed' },
    { idx:2,  key:'gemini',      de:'Zwillinge',    symbol:'\u264A', element:'air',   modality:'mutable' },
    { idx:3,  key:'cancer',      de:'Krebs',        symbol:'\u264B', element:'water', modality:'cardinal' },
    { idx:4,  key:'leo',         de:'Löwe',         symbol:'\u264C', element:'fire',  modality:'fixed' },
    { idx:5,  key:'virgo',       de:'Jungfrau',     symbol:'\u264D', element:'earth', modality:'mutable' },
    { idx:6,  key:'libra',       de:'Waage',        symbol:'\u264E', element:'air',   modality:'cardinal' },
    { idx:7,  key:'scorpio',     de:'Skorpion',     symbol:'\u264F', element:'water', modality:'fixed' },
    { idx:8,  key:'sagittarius', de:'Schütze',      symbol:'\u2650', element:'fire',  modality:'mutable' },
    { idx:9,  key:'capricorn',   de:'Steinbock',    symbol:'\u2651', element:'earth', modality:'cardinal' },
    { idx:10, key:'aquarius',    de:'Wassermann',   symbol:'\u2652', element:'air',   modality:'fixed' },
    { idx:11, key:'pisces',      de:'Fische',       symbol:'\u2653', element:'water', modality:'mutable' }
  ];

  const PLANETS = [
    { key:'Sun',     de:'Sonne',   symbol:'\u2609', kind:'luminary' },
    { key:'Moon',    de:'Mond',    symbol:'\u263D', kind:'luminary' },
    { key:'Mercury', de:'Merkur',  symbol:'\u263F', kind:'personal' },
    { key:'Venus',   de:'Venus',   symbol:'\u2640', kind:'personal' },
    { key:'Mars',    de:'Mars',    symbol:'\u2642', kind:'personal' },
    { key:'Jupiter', de:'Jupiter', symbol:'\u2643', kind:'social' },
    { key:'Saturn',  de:'Saturn',  symbol:'\u2644', kind:'social' },
    { key:'Uranus',  de:'Uranus',  symbol:'\u2645', kind:'transpersonal' },
    { key:'Neptune', de:'Neptun',  symbol:'\u2646', kind:'transpersonal' },
    { key:'Pluto',   de:'Pluto',   symbol:'\u2647', kind:'transpersonal' }
  ];

  const ASPECTS = [
    { key:'conjunction', de:'Konjunktion', angle:   0, orb: 8, color:'#a78bfa', meaning:'verschmelzen, verstärken' },
    { key:'opposition',  de:'Opposition',  angle: 180, orb: 8, color:'#ef4444', meaning:'spannen, polarisieren' },
    { key:'trine',       de:'Trigon',      angle: 120, orb: 6, color:'#22c55e', meaning:'fließen, harmonisieren' },
    { key:'square',      de:'Quadrat',     angle:  90, orb: 6, color:'#f97316', meaning:'reiben, antreiben' },
    { key:'sextile',     de:'Sextil',      angle:  60, orb: 4, color:'#38bdf8', meaning:'inspirieren, einladen' }
  ];

  // Symbolisches Vokabular für den Songtext – bewusst poetisch,
  // klar als „Bildersprache" markiert, nicht als Persönlichkeitsaussage.
  const PLANET_THEMES = {
    Sun:     ['Lebensspur', 'Kern', 'innere Sonne', 'leuchten, gesehen werden'],
    Moon:    ['innere Welt', 'Stimmung', 'Nachtblick', 'Gedächtnis des Herzens'],
    Mercury: ['Stimme', 'Brücken bauen', 'Worte als Werkzeug', 'Denken in Bewegung'],
    Venus:  ['Liebe und Schönheit', 'was du anziehst', 'Verzauberung', 'Geschmack'],
    Mars:    ['Antrieb', 'Mut zum ersten Schritt', 'Glut', 'Kampf für etwas'],
    Jupiter: ['Weite', 'Großzügigkeit', 'Sinnsuche', 'Vertrauen, dass es trägt'],
    Saturn:  ['Form', 'Disziplin', 'lange Linien', 'Erwachsenwerden'],
    Uranus:  ['Bruch', 'Freiheit', 'plötzliche Klarheit', 'das Andere'],
    Neptune: ['Sehnsucht', 'Auflösung', 'Traum und Ozean', 'Empathie ohne Grenzen'],
    Pluto:   ['Transformation', 'Tiefe', 'Phoenix', 'was unter der Oberfläche brennt']
  };

  const SIGN_THEMES = {
    aries:       'Funke, erster Sprung, roher Mut',
    taurus:      'Stille, Sinne, Stand halten',
    gemini:      'Spiel, Brücken, viele Stimmen',
    cancer:      'Heim, Wasser, Erinnerung',
    leo:         'Bühne, Wärme, große Geste',
    virgo:       'Handwerk, Sorgfalt, Heilung im Kleinen',
    libra:       'Gleichgewicht, Begegnung, Ästhetik',
    scorpio:     'Tiefe, Wahrheit unter Lack, Verwandlung',
    sagittarius: 'Horizont, Lehre, Reise',
    capricorn:   'Berg, Plan, Geduld',
    aquarius:    'Netz, Vision, andere Möglichkeit',
    pisces:      'Welle, Mitgefühl, Auflösung im Klang'
  };

  // ────────────────────────────────────────────────────────────
  // Helfer: Winkel / Modulo
  // ────────────────────────────────────────────────────────────
  function mod360(x) { x = x % 360; if (x < 0) x += 360; return x; }
  function deg2rad(d) { return d * Math.PI / 180; }
  function rad2deg(r) { return r * 180 / Math.PI; }

  function signOf(longitudeDeg) {
    const idx = Math.floor(mod360(longitudeDeg) / 30);
    return SIGNS[idx];
  }
  function degInSign(longitudeDeg) {
    return mod360(longitudeDeg) % 30;
  }

  // ────────────────────────────────────────────────────────────
  // Greenwich Mean Sidereal Time (Stunden 0..24)
  // Meeus, Astronomical Algorithms, Formula 12.4
  // ────────────────────────────────────────────────────────────
  function gmstHours(date) {
    const jd = julianDay(date);
    const T = (jd - 2451545.0) / 36525.0;
    let theta = 280.46061837
      + 360.98564736629 * (jd - 2451545.0)
      + 0.000387933 * T * T
      - (T * T * T) / 38710000.0;
    theta = mod360(theta);
    return theta / 15; // → Stunden
  }

  function julianDay(date) {
    // date: JS Date (UTC)
    let Y = date.getUTCFullYear();
    let M = date.getUTCMonth() + 1;
    const D = date.getUTCDate()
      + date.getUTCHours() / 24
      + date.getUTCMinutes() / 1440
      + date.getUTCSeconds() / 86400;
    if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (Y + 4716))
         + Math.floor(30.6001 * (M + 1))
         + D + B - 1524.5;
  }

  // Schiefe der Ekliptik (mittel)
  function meanObliquity(date) {
    const T = (julianDay(date) - 2451545.0) / 36525.0;
    // Meeus 22.2
    return 23.43929111
      - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600.0;
  }

  // ────────────────────────────────────────────────────────────
  // Aszendent / MC nach Meeus, Kap. 13
  // ────────────────────────────────────────────────────────────
  function ascMc(date, latDeg, lonDeg) {
    // Lokale Sternzeit in Grad (Greenwich Mean Sidereal Time + geogr. Länge)
    const gmstH = gmstHours(date);
    let lstDeg = mod360(gmstH * 15 + lonDeg); // östliche Länge positiv
    const RAMC = lstDeg; // Right Ascension of MC (Grad)
    const eps = meanObliquity(date);
    const phi = latDeg;

    // MC (Meeus 13.5)
    const mcRad = Math.atan2(
      Math.sin(deg2rad(RAMC)),
      Math.cos(deg2rad(RAMC)) * Math.cos(deg2rad(eps))
    );
    let mc = mod360(rad2deg(mcRad));

    // ASC (Meeus 13.6, Vorzeichen anpassen)
    const ascRad = Math.atan2(
      -Math.cos(deg2rad(RAMC)),
      Math.sin(deg2rad(RAMC)) * Math.cos(deg2rad(eps))
        + Math.tan(deg2rad(phi)) * Math.sin(deg2rad(eps))
    );
    let asc = mod360(rad2deg(ascRad));
    // Korrektur: Asc muss östlich vom MC liegen
    if (mod360(asc - mc) > 180) asc = mod360(asc + 180);

    return { asc, mc, lstDeg, ramc: RAMC };
  }

  // ────────────────────────────────────────────────────────────
  // Planetenpositionen (Ekliptik-Längen, geozentrisch)
  // ────────────────────────────────────────────────────────────
  function planetLongitudes(date) {
    if (!window.Astronomy) {
      throw new Error('astronomy-engine wurde nicht geladen.');
    }
    const A = window.Astronomy;
    const time = A.MakeTime(date);
    const out = {};
    PLANETS.forEach(p => {
      try {
        if (p.key === 'Sun') {
          // Apparente geozentrische Position der Sonne
          const e = A.Ecliptic(A.GeoVector(A.Body.Sun, time, true));
          out[p.key] = mod360(e.elon);
        } else if (p.key === 'Moon') {
          const e = A.Ecliptic(A.GeoVector(A.Body.Moon, time, false));
          out[p.key] = mod360(e.elon);
        } else {
          const body = A.Body[p.key];
          const e = A.Ecliptic(A.GeoVector(body, time, true));
          out[p.key] = mod360(e.elon);
        }
      } catch (err) {
        console.warn('[Astro] Planet ' + p.key + ' fehlgeschlagen:', err.message);
      }
    });
    return out;
  }

  // ────────────────────────────────────────────────────────────
  // Aspekte zwischen Planeten
  // ────────────────────────────────────────────────────────────
  function computeAspects(longitudes) {
    const keys = Object.keys(longitudes);
    const out = [];
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const a = longitudes[keys[i]], b = longitudes[keys[j]];
        let d = Math.abs(mod360(a - b));
        if (d > 180) d = 360 - d;
        for (const asp of ASPECTS) {
          const orb = Math.abs(d - asp.angle);
          if (orb <= asp.orb) {
            out.push({
              a: keys[i], b: keys[j],
              type: asp.key, typeDe: asp.de, angle: asp.angle, orb: +orb.toFixed(2),
              color: asp.color, meaning: asp.meaning
            });
            break;
          }
        }
      }
    }
    return out;
  }

  // ────────────────────────────────────────────────────────────
  // Public: Komplette Geburtskarte aus Datum + Geo + Zeit
  // ────────────────────────────────────────────────────────────
  function computeChart(input) {
    // input: { date:'YYYY-MM-DD', time:'HH:MM' (lokal), tzOffsetMinutes:Number,
    //          lat:Number, lon:Number, place:String, timeKnown:Boolean }
    if (!input || !input.date) throw new Error('Geburtsdatum fehlt.');

    // UTC-Datum aus Lokal + Offset bauen
    const [yyyy, mm, dd] = input.date.split('-').map(n => parseInt(n, 10));
    let hh = 12, mi = 0; // Mittag, wenn Zeit unbekannt (minimiert Mondabweichung)
    if (input.time && input.timeKnown !== false) {
      const t = input.time.split(':');
      hh = parseInt(t[0], 10); mi = parseInt(t[1], 10);
    }
    const offset = (typeof input.tzOffsetMinutes === 'number') ? input.tzOffsetMinutes : 0;
    // Lokale Zeit → UTC: utc = local - offset
    const localMs = Date.UTC(yyyy, mm - 1, dd, hh, mi, 0);
    const utc = new Date(localMs - offset * 60 * 1000);

    const longitudes = planetLongitudes(utc);

    let asc = null, mc = null, ascSign = null, mcSign = null, houses = null;
    if (input.timeKnown !== false && typeof input.lat === 'number' && typeof input.lon === 'number') {
      const am = ascMc(utc, input.lat, input.lon);
      asc = am.asc; mc = am.mc;
      ascSign = signOf(asc); mcSign = signOf(mc);
      // Whole-Sign-Häuser: Haus 1 = Asc-Zeichen, dann jeweils +30°
      houses = [];
      for (let h = 0; h < 12; h++) {
        const cuspIdx = (ascSign.idx + h) % 12;
        houses.push({
          house: h + 1,
          signIdx: cuspIdx,
          sign: SIGNS[cuspIdx],
          cuspLongitude: cuspIdx * 30
        });
      }
    }

    // Planeten mit Zeichen, Haus, Symbolen
    const placements = PLANETS.map(p => {
      const lon = longitudes[p.key];
      if (typeof lon !== 'number') return null;
      const sign = signOf(lon);
      let house = null;
      if (houses) {
        // Whole-Sign-House für diesen Planeten
        const planetSignIdx = sign.idx;
        const startIdx = houses[0].signIdx;
        house = ((planetSignIdx - startIdx + 12) % 12) + 1;
      }
      return {
        planet: p.key, de: p.de, symbol: p.symbol, kind: p.kind,
        longitude: +lon.toFixed(2),
        sign: sign.de, signKey: sign.key, signSymbol: sign.symbol,
        signIdx: sign.idx, element: sign.element, modality: sign.modality,
        degInSign: +degInSign(lon).toFixed(2),
        house
      };
    }).filter(Boolean);

    const aspects = computeAspects(longitudes);

    // ── Element- und Modalitätsbilanz (kompakt, kreativ nutzbar) ──
    const elementBalance = { fire:0, earth:0, air:0, water:0 };
    const modalityBalance = { cardinal:0, fixed:0, mutable:0 };
    placements.forEach(pl => {
      const weight = pl.kind === 'luminary' ? 3 : (pl.kind === 'personal' ? 2 : 1);
      elementBalance[pl.element] += weight;
      modalityBalance[pl.modality] += weight;
    });

    // ── Musikalische Bildersprache (rein symbolisch) ──
    const motifs = [];
    const sun = placements.find(p => p.planet === 'Sun');
    const moon = placements.find(p => p.planet === 'Moon');
    const venus = placements.find(p => p.planet === 'Venus');
    const mars = placements.find(p => p.planet === 'Mars');
    if (sun)   motifs.push(PLANET_THEMES.Sun[0] + ' im ' + sun.sign + ' (' + SIGN_THEMES[sun.signKey] + ')');
    if (moon)  motifs.push(PLANET_THEMES.Moon[0] + ' im ' + moon.sign);
    if (venus) motifs.push('Venus im ' + venus.sign + ' – ' + SIGN_THEMES[venus.signKey].split(',')[0]);
    if (mars)  motifs.push('Mars im ' + mars.sign + ' – ' + SIGN_THEMES[mars.signKey].split(',')[0]);
    if (ascSign) motifs.push('Aszendent ' + ascSign.de + ' – wie du zuerst erscheinst');

    // ── musikalische Hints aus Element-Profil ──
    const hints = [];
    const total = elementBalance.fire + elementBalance.earth + elementBalance.air + elementBalance.water;
    if (total > 0) {
      if (elementBalance.fire / total >= 0.35) hints.push('Mehr Drive, hellere Spitzen');
      if (elementBalance.earth / total >= 0.35) hints.push('Geerdetes Tempo, akustische Wärme');
      if (elementBalance.air / total >= 0.35) hints.push('Lichte Texturen, viel Raum im Mix');
      if (elementBalance.water / total >= 0.35) hints.push('Hall, Releases, dynamische Spannweite');
    }

    return {
      input: {
        date: input.date, time: input.time || null,
        timeKnown: input.timeKnown !== false,
        lat: input.lat, lon: input.lon, place: input.place || null,
        tzOffsetMinutes: offset
      },
      placements, aspects,
      asc, mc, ascSign: ascSign ? ascSign.de : null, mcSign: mcSign ? mcSign.de : null,
      houses,
      elementBalance, modalityBalance,
      motifs, hints,
      signsTable: SIGNS,
      generatedAt: new Date().toISOString()
    };
  }

  // ────────────────────────────────────────────────────────────
  // Narrative für das Synthese-Prompt (kompakt, klar als symbolisch markiert)
  // ────────────────────────────────────────────────────────────
  function chartToNarrative(chart) {
    if (!chart) return '';
    const lines = [];
    lines.push('SYMBOLISCHE SCHICHT (astrologisch, bewusst poetisch, KEINE Diagnose):');
    if (chart.ascSign) lines.push('• Aszendent: ' + chart.ascSign + ' (' + SIGN_THEMES[chart.placements.find(p=>p.planet==='Sun')?.signKey] + ' – nur Bild)');
    chart.placements.forEach(p => {
      const planetTh = (PLANET_THEMES[p.planet] || [])[0] || p.planet;
      const signTh = SIGN_THEMES[p.signKey] || '';
      lines.push('• ' + p.de + ' im ' + p.sign + (p.house ? ' (H' + p.house + ')' : '') +
                 ' — ' + planetTh + ' im Feld „' + signTh + '"');
    });
    if (chart.aspects && chart.aspects.length) {
      lines.push('Auffällige Aspekte:');
      chart.aspects.slice(0, 6).forEach(a => {
        const pa = PLANETS.find(p=>p.key===a.a)?.de || a.a;
        const pb = PLANETS.find(p=>p.key===a.b)?.de || a.b;
        lines.push('  – ' + pa + ' ' + a.typeDe + ' ' + pb + ' (' + a.meaning + ')');
      });
    }
    if (chart.hints && chart.hints.length) {
      lines.push('Klang-Hinweise aus Element-Profil: ' + chart.hints.join('; '));
    }
    return lines.join('\n');
  }

  window.SongAstrology = {
    computeChart,
    chartToNarrative,
    SIGNS, PLANETS, ASPECTS,
    PLANET_THEMES, SIGN_THEMES
  };
})();
