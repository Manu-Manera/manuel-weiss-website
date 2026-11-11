/**
 * Tracking ↔ Konto (/user-data/applications) und Bewerbungsmappen pro Bewerbung.
 *
 * dashboard-core.js hält das Tracking nur im localStorage. Diese Datei hängt sich an
 * dessen globale Funktionen und gleicht beim Laden und Speichern mit dem Konto ab,
 * damit Bewerbungen aus der Stellensuche (Admin Panel) hier erscheinen.
 * Muss nach dashboard-core.js geladen werden.
 */
(function () {
  'use strict';

  if (window.self !== window.top) document.documentElement.style.overscrollBehavior = 'contain';

  let markReady;
  const ready = new Promise((resolve) => { markReady = resolve; });
  const synced = new Map();

  const loggedIn = () => !!window.cloudDataService?.isUserLoggedIn?.();
  const stamp = (a) => String(a.updatedAt || a.createdAt || '');

  async function pullFromCloud() {
    if (!loggedIn()) return;
    const cloud = await window.cloudDataService.getApplications(true).catch(() => null);
    if (!Array.isArray(cloud)) return;
    const merged = new Map(cloud.map((a) => [a.id, a]));
    for (const local of DashboardState.applications || []) {
      const remote = merged.get(local.id);
      if (!remote || stamp(local) > stamp(remote)) merged.set(local.id, local);
    }
    cloud.forEach((a) => synced.set(a.id, JSON.stringify(a)));
    DashboardState.applications = [...merged.values()];
    localStorage.setItem('bewerbungsmanager_applications', JSON.stringify(DashboardState.applications));
    calculateStats();
    pushToCloud();
  }

  function pushToCloud() {
    if (!loggedIn()) return;
    const current = new Map((DashboardState.applications || []).map((a) => [a.id, a]));
    for (const [id, app] of current) {
      const json = JSON.stringify(app);
      if (synced.get(id) === json) continue;
      synced.set(id, json);
      window.cloudDataService.saveApplication(app).catch((e) => console.warn('Tracking-Sync fehlgeschlagen:', e));
    }
    for (const id of [...synced.keys()]) {
      if (current.has(id)) continue;
      synced.delete(id);
      window.cloudDataService.apiRequest(`/applications?id=${encodeURIComponent(id)}`, 'DELETE')
        .catch((e) => console.warn('Tracking-Löschen fehlgeschlagen:', e));
    }
  }

  const originalLoad = window.loadSavedState;
  window.loadSavedState = async function () {
    await originalLoad();
    try { await pullFromCloud(); } catch (e) { console.warn('Tracking aus Konto nicht geladen:', e); }
    markReady();
  };

  const originalSave = window.saveState;
  window.saveState = function () {
    originalSave();
    pushToCloud();
  };

  const portfolioOf = (app) => app?.portfolio || (app?.coverLetterId ? { coverLetterId: app.coverLetterId, resumeId: app.resumeId, certificateIds: app.certificateIds || [], photoId: app.photoId } : null);

  const originalList = window.updateApplicationsList;
  window.updateApplicationsList = function (...args) {
    originalList(...args);
    document.querySelectorAll('#applicationsList .application-card').forEach((card) => {
      const app = DashboardState.applications.find((a) => a.id === card.dataset.id);
      const select = card.querySelector('.status-select');
      if (app?.status === 'draft' && select && !select.querySelector('option[value="draft"]')) {
        select.insertAdjacentHTML('afterbegin', '<option value="draft" selected>📝 Entwurf</option>');
        select.value = 'draft';
      }
      const actions = card.querySelector('.card-actions');
      if (!portfolioOf(app) || !actions || actions.querySelector('.portfolio-btn')) return;
      actions.insertAdjacentHTML('afterbegin', `<button class="portfolio-btn" onclick="openPortfolioFor('${app.id}')" title="Bewerbungsmappe: Anschreiben, Lebenslauf, Zeugnisse"><i class="fas fa-folder-open"></i></button>`);
    });
  };

  const originalStats = window.updateDashboardStats;
  window.updateDashboardStats = async function (...args) {
    await originalStats(...args);
    await ready;
    const el = document.getElementById('statPortfolios');
    if (el) el.textContent = (DashboardState.applications || []).filter(portfolioOf).length;
  };

  window.openPortfolioFor = async function (applicationId) {
    await ready;
    const app = DashboardState.applications.find((a) => a.id === applicationId);
    const p = portfolioOf(app);
    showTab('portfolio');
    if (!p) return;
    await loadPortfolioOptions();
    const setSelect = (id, value) => {
      const el = document.getElementById(id);
      if (el && value && [...el.options].some((o) => o.value === value)) el.value = value;
    };
    const setToggle = (id, on) => {
      const el = document.getElementById(id);
      if (el && el.checked !== on) { el.checked = on; el.dispatchEvent(new Event('change', { bubbles: true })); }
    };
    setToggle('includeCoverLetter', !!p.coverLetterId);
    setToggle('includeResume', !!p.resumeId);
    setToggle('includeCertificates', !!p.certificateIds?.length);
    setToggle('includePhoto', !!p.photoId);
    setSelect('selectCoverLetter', p.coverLetterId);
    setSelect('selectResume', p.resumeId);
    setSelect('selectPhoto', p.photoId);
    document.querySelectorAll('input[name="certificate"]').forEach((cb) => { cb.checked = (p.certificateIds || []).includes(cb.value); });
    await previewPortfolio();
    document.getElementById('portfolioPreview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  document.head.insertAdjacentHTML('beforeend', '<style>.application-card .status-indicator.draft{background:#f59e0b}</style>');

  const editStatus = document.getElementById('editAppStatus');
  if (editStatus && !editStatus.querySelector('option[value="draft"]')) {
    editStatus.insertAdjacentHTML('afterbegin', '<option value="draft">📝 Entwurf</option>');
  }

  window.ApplicationSync = { ready, pullFromCloud };
})();
