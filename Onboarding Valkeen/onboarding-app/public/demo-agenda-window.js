/**
 * Tempus-Demos: Agenda in separatem Fenster (?view=agenda) — nur Stichpunkt-Agenda.
 */
(function () {
  const script = document.currentScript;
  const AGENDA_IDS = [
    'pm-training-agenda',
    'rm-training-agenda',
    'bpafg-training-agenda',
    'team-resources-training-agenda',
  ];
  const LANG_KEY = 'tempus-demo-agenda-lang';
  const params = new URLSearchParams(location.search);
  const isAgendaOnly = params.get('view') === 'agenda';

  function detectAgendaId() {
    const fromData = script?.dataset?.agendaId;
    if (fromData) return fromData;
    for (const id of AGENDA_IDS) {
      if (document.getElementById(id)) return id;
    }
    return null;
  }

  function presenterLang() {
    if (typeof window.presenterLang === 'function') return window.presenterLang();
    return document.documentElement.classList.contains('lang-de') ? 'de' : 'en';
  }

  function applyLang(lang) {
    if (typeof window.setLang === 'function') {
      window.setLang(lang);
      return;
    }
    document.documentElement.classList.remove('lang-de', 'lang-en');
    document.documentElement.classList.add('lang-' + lang);
    document.documentElement.lang = lang === 'de' ? 'de' : 'en';
    const de = document.getElementById('btn-de');
    const en = document.getElementById('btn-en');
    if (de) de.classList.toggle('active', lang === 'de');
    if (en) en.classList.toggle('active', lang === 'en');
  }

  function broadcastLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }

  function syncAgendaFromOpener(agendaId) {
    if (!window.opener || window.opener.closed) return false;
    const src = window.opener.document.getElementById(agendaId);
    const dst = document.getElementById(agendaId);
    if (!src || !dst) return false;
    dst.innerHTML = src.innerHTML;
    applyLang(window.opener.presenterLang?.() || presenterLang());
    return true;
  }

  function initAgendaOnlyView() {
    const agendaId = detectAgendaId();
    document.documentElement.classList.add('demo-agenda-only-view');

    const lang = params.get('lang');
    if (lang === 'de' || lang === 'en') applyLang(lang);

    const label = script?.dataset?.demoLabel || 'Demo';
    const chrome = document.createElement('div');
    chrome.id = 'demo-agenda-only-chrome';
    chrome.setAttribute('aria-label', 'Sprache und Aktualisieren');
    chrome.innerHTML = `
      <button type="button" data-lang="de" id="agenda-only-de" title="Deutsch">DE</button>
      <button type="button" data-lang="en" id="agenda-only-en" title="English">EN</button>
      <button type="button" id="agenda-only-refresh" title="Agenda aus Demo-Tab übernehmen" aria-label="Aktualisieren">↻</button>
    `;
    document.body.prepend(chrome);

    const refresh = () => {
      const ok = syncAgendaFromOpener(agendaId);
      const btn = document.getElementById('agenda-only-refresh');
      if (btn) btn.textContent = ok ? '↻' : '—';
    };

    chrome.querySelector('#agenda-only-de').addEventListener('click', () => {
      applyLang('de');
      broadcastLang('de');
    });
    chrome.querySelector('#agenda-only-en').addEventListener('click', () => {
      applyLang('en');
      broadcastLang('en');
    });
    chrome.querySelector('#agenda-only-refresh').addEventListener('click', refresh);

    function updateLangButtons() {
      const L = presenterLang();
      chrome.querySelector('#agenda-only-de').classList.toggle('active', L === 'de');
      chrome.querySelector('#agenda-only-en').classList.toggle('active', L === 'en');
    }
    updateLangButtons();
    refresh();

    window.addEventListener('storage', (e) => {
      if (e.key === LANG_KEY && (e.newValue === 'de' || e.newValue === 'en')) {
        applyLang(e.newValue);
        refresh();
        updateLangButtons();
      }
    });

    document.title = (presenterLang() === 'de' ? 'Agenda · ' : 'Agenda · ') + label;
  }

  function openAgendaTab() {
    const agendaId = detectAgendaId();
    if (!agendaId) return;
    const url = new URL(location.href);
    url.searchParams.set('view', 'agenda');
    url.searchParams.set('lang', presenterLang());
    url.hash = '';
    window.open(url.toString(), '_blank');
  }

  function injectPopoutButton() {
    const switcher = document.querySelector('.lang-switcher');
    if (!switcher || switcher.querySelector('.agenda-popout-btn')) return;
    const L = presenterLang();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-btn agenda-popout-btn';
    btn.title =
      L === 'de'
        ? 'Agenda in neuem Tab (nur Stichpunkte, z. B. zweiter Bildschirm)'
        : 'Open agenda in a new tab (bullet points only, e.g. second screen)';
    btn.innerHTML = '<span aria-hidden="true">📋</span><span class="agenda-popout-label">' +
      (L === 'de' ? 'Agenda' : 'Agenda') + '</span>';
    btn.addEventListener('click', openAgendaTab);
    switcher.appendChild(btn);
  }

  function wrapSetLang() {
    if (typeof window.setLang !== 'function' || window.setLang.__agendaWrapped) return;
    const orig = window.setLang;
    window.setLang = function (lang) {
      orig(lang);
      broadcastLang(lang);
      const lbl = document.querySelector('.agenda-popout-btn .agenda-popout-label');
      if (lbl) lbl.textContent = 'Agenda';
      const btn = document.querySelector('.agenda-popout-btn');
      if (btn) {
        btn.title =
          lang === 'de'
            ? 'Agenda in neuem Tab (nur Stichpunkte, z. B. zweiter Bildschirm)'
            : 'Open agenda in a new tab (bullet points only, e.g. second screen)';
      }
    };
    window.setLang.__agendaWrapped = true;
  }

  function boot() {
    if (isAgendaOnly) {
      initAgendaOnlyView();
      return;
    }
    injectPopoutButton();
    wrapSetLang();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
