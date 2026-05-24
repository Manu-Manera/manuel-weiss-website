/**
 * Fokus & Tagesvertrag — Cloud-Speicher, mobil optimiert
 */
(function () {
    'use strict';

    const DEBOUNCE_MS = 1100;

    function isoWeekString(d) {
        const date = new Date(d.getTime());
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() + 4 - ((date.getDay() + 6) % 7));
        const isoYear = date.getFullYear();
        const week1 = new Date(isoYear, 0, 1);
        const week =
            1 +
            Math.round(
                ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
            );
        return `${isoYear}-W${String(week).padStart(2, '0')}`;
    }

    function todayLocalISO() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function getApiBase() {
        try {
            if (window.getApiUrl && window.AWS_APP_CONFIG?.ENDPOINTS?.FOKUS_TAGEBUCH) {
                return window.getApiUrl('FOKUS_TAGEBUCH');
            }
        } catch (e) {
            console.warn(e);
        }
        const b = window.AWS_APP_CONFIG?.API_BASE;
        if (!b) return null;
        return (b.endsWith('/') ? b.slice(0, -1) : b) + '/fokus-tagebuch';
    }

    /** Basis-URL für /user-data (Fallback wenn /fokus-tagebuch am Gateway fehlt) */
    function getUserDataBase() {
        try {
            if (window.getApiUrl && window.AWS_APP_CONFIG?.ENDPOINTS?.USER_DATA) {
                return window.getApiUrl('USER_DATA');
            }
        } catch (e) {
            console.warn(e);
        }
        const b = window.AWS_APP_CONFIG?.API_BASE;
        if (!b) return null;
        return (b.endsWith('/') ? b.slice(0, -1) : b) + '/user-data';
    }

    const WF_NAME = 'fokusTagebuch20';

    function shouldFallbackFromPrimaryResponse(status, bodyText) {
        if (status === 404) return true;
        return !!(status === 403 && bodyText && bodyText.indexOf('Missing Authentication Token') !== -1);
    }

    /**
     * Pro Seitenaufruf: prüfen ob dedizierte Fokus-Routen existieren (sonst User-Profil-Dynamo via workflows).
     * Kein sessionStorage — sobald die API deployed ist, greift die Primär-Route automatisch.
     */
    async function resolveStorageMode(token) {
        const probeUrl = `${app.apiBase}/day?date=${encodeURIComponent(todayLocalISO())}`;
        let res;
        try {
            res = await fetch(probeUrl, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) {
            console.warn('Fokus API Probe:', e);
            return 'primary';
        }

        if (res.status === 401 || res.ok) {
            return 'primary';
        }

        const t = await res.text();
        if (shouldFallbackFromPrimaryResponse(res.status, t)) {
            console.warn('Fokus-Tagebuch API nicht am Gateway — Fallback über /user-data/workflows');
            return 'fallback';
        }

        return 'primary';
    }

    function stripWorkflowMeta(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        const { updatedAt: _u, ...rest } = obj;
        return rest;
    }

    function isUserLoggedIn() {
        try {
            if (window.awsAuth?.isLoggedIn?.()) return true;
            if (window.realUserAuth?.isLoggedIn?.()) return true;
        } catch (e) {}
        return false;
    }

    function getAuthToken() {
        if (window.awsAuth?.isLoggedIn?.()) {
            const u = window.awsAuth.getCurrentUser();
            if (u?.idToken) return u.idToken;
        }
        if (window.realUserAuth?.isLoggedIn?.()) {
            const u2 = window.realUserAuth.getCurrentUser();
            if (u2?.idToken) return u2.idToken;
        }
        const session = localStorage.getItem('aws_auth_session');
        if (session) {
            try {
                const p = JSON.parse(session);
                if (p.idToken) return p.idToken;
            } catch (e) {}
        }
        throw new Error('Nicht angemeldet');
    }

    function qs(id) {
        return document.getElementById(id);
    }

    function defaultDayPayload() {
        return {
            morning: { counts: ['', '', ''], notToday: ['', '', ''], oneThing: '' },
            reset: { doing: '', should: '', step: '' },
            evening: { done: '', jumped: '', triggered: '', reacted: '', easier: '' }
        };
    }

    function defaultWeekPayload() {
        return { q1: '', q2: '', q3: '', q4: '', q5: '', q6: '' };
    }

    const app = {
        apiBase: null,
        storageMode: null,
        dayDebounce: null,
        weekDebounce: null,
        weekAnchor: new Date(),
        currentDayISO: todayLocalISO(),
        dirtyDay: false,
        dirtyWeek: false,
        skipDayLoad: false,
        initialized: false
    };

    function setStatus(text, kind) {
        const el = qs('ftStatusText');
        if (!el) return;
        el.textContent = text;
        el.className = kind === 'ok' ? 'ft-sync-ok' : kind === 'err' ? 'ft-sync-err' : '';
    }

    function applyDayToForm(data) {
        const d = data && data.morning ? data : defaultDayPayload();
        const m = d.morning || {};
        const counts = m.counts || ['', '', ''];
        const notToday = m.notToday || ['', '', ''];
        for (let i = 0; i < 3; i++) {
            const inp = qs('ftCount' + (i + 1));
            if (inp) inp.value = counts[i] || '';
            const nt = qs('ftNot' + (i + 1));
            if (nt) nt.value = notToday[i] || '';
        }
        if (qs('ftOneThing')) qs('ftOneThing').value = m.oneThing || '';

        const r = d.reset || {};
        if (qs('ftResetDoing')) qs('ftResetDoing').value = r.doing || '';
        if (qs('ftResetShould')) qs('ftResetShould').value = r.should || '';
        if (qs('ftResetStep')) qs('ftResetStep').value = r.step || '';

        const e = d.evening || {};
        ['done', 'jumped', 'triggered', 'reacted', 'easier'].forEach((key) => {
            const id = 'ftEve' + key.charAt(0).toUpperCase() + key.slice(1);
            const node = qs(id);
            if (node) node.value = e[key] || '';
        });
    }

    function collectDayFromForm() {
        return {
            morning: {
                counts: [1, 2, 3].map((n) => qs('ftCount' + n)?.value || ''),
                notToday: [1, 2, 3].map((n) => qs('ftNot' + n)?.value || ''),
                oneThing: qs('ftOneThing')?.value || ''
            },
            reset: {
                doing: qs('ftResetDoing')?.value || '',
                should: qs('ftResetShould')?.value || '',
                step: qs('ftResetStep')?.value || ''
            },
            evening: {
                done: qs('ftEveDone')?.value || '',
                jumped: qs('ftEveJumped')?.value || '',
                triggered: qs('ftEveTriggered')?.value || '',
                reacted: qs('ftEveReacted')?.value || '',
                easier: qs('ftEveEasier')?.value || ''
            }
        };
    }

    function applyWeekToForm(data) {
        const w = data && typeof data === 'object' ? data : defaultWeekPayload();
        for (let i = 1; i <= 6; i++) {
            const node = qs('ftWQ' + i);
            if (node) node.value = w['q' + i] || '';
        }
    }

    function collectWeekFromForm() {
        const o = {};
        for (let i = 1; i <= 6; i++) {
            o['q' + i] = qs('ftWQ' + i)?.value || '';
        }
        return o;
    }

    async function fetchDay(iso) {
        const token = await getAuthToken();
        if (app.storageMode === 'fallback') {
            return fetchDayViaUserData(iso, token);
        }
        const url = `${app.apiBase}/day?date=${encodeURIComponent(iso)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) throw new Error('auth');
        if (res.ok) {
            const json = await res.json();
            return json.entry || null;
        }
        const errBody = await res.text();
        if (shouldFallbackFromPrimaryResponse(res.status, errBody)) {
            return fetchDayViaUserData(iso, token);
        }
        throw new Error(String(res.status));
    }

    async function fetchDayViaUserData(iso, token) {
        const base = getUserDataBase();
        if (!base) throw new Error('503');
        const step = encodeURIComponent('DAY_' + iso);
        const url = `${base}/workflows/${WF_NAME}/steps/${step}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) throw new Error('auth');
        if (!res.ok) throw new Error(String(res.status));
        const raw = await res.json();
        const cleaned = stripWorkflowMeta(raw);
        return cleaned && Object.keys(cleaned).length ? cleaned : null;
    }

    async function saveDay(iso, payload) {
        const token = await getAuthToken();
        if (app.storageMode === 'fallback') {
            return saveDayViaUserData(iso, payload, token);
        }
        const res = await fetch(`${app.apiBase}/day`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: iso, ...payload })
        });
        if (res.status === 401) throw new Error('auth');
        if (res.ok) return;
        const errBody = await res.text();
        if (shouldFallbackFromPrimaryResponse(res.status, errBody)) {
            return saveDayViaUserData(iso, payload, token);
        }
        throw new Error(String(res.status));
    }

    async function saveDayViaUserData(iso, payload, token) {
        const base = getUserDataBase();
        if (!base) throw new Error('503');
        const step = encodeURIComponent('DAY_' + iso);
        const url = `${base}/workflows/${WF_NAME}/steps/${step}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (res.status === 401) throw new Error('auth');
        if (!res.ok) throw new Error(String(res.status));
    }

    async function fetchWeek(weekKey) {
        const token = await getAuthToken();
        if (app.storageMode === 'fallback') {
            return fetchWeekViaUserData(weekKey, token);
        }
        const url = `${app.apiBase}/week?week=${encodeURIComponent(weekKey)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) throw new Error('auth');
        if (res.ok) {
            const json = await res.json();
            return json.entry || null;
        }
        const errBody = await res.text();
        if (shouldFallbackFromPrimaryResponse(res.status, errBody)) {
            return fetchWeekViaUserData(weekKey, token);
        }
        throw new Error(String(res.status));
    }

    async function fetchWeekViaUserData(weekKey, token) {
        const base = getUserDataBase();
        if (!base) throw new Error('503');
        const step = encodeURIComponent('WEEK_' + weekKey);
        const url = `${base}/workflows/${WF_NAME}/steps/${step}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) throw new Error('auth');
        if (!res.ok) throw new Error(String(res.status));
        const raw = await res.json();
        const cleaned = stripWorkflowMeta(raw);
        return cleaned && Object.keys(cleaned).length ? cleaned : null;
    }

    async function saveWeek(weekKey, payload) {
        const token = await getAuthToken();
        if (app.storageMode === 'fallback') {
            return saveWeekViaUserData(weekKey, payload, token);
        }
        const res = await fetch(`${app.apiBase}/week`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ week: weekKey, ...payload })
        });
        if (res.status === 401) throw new Error('auth');
        if (res.ok) return;
        const errBody = await res.text();
        if (shouldFallbackFromPrimaryResponse(res.status, errBody)) {
            return saveWeekViaUserData(weekKey, payload, token);
        }
        throw new Error(String(res.status));
    }

    async function saveWeekViaUserData(weekKey, payload, token) {
        const base = getUserDataBase();
        if (!base) throw new Error('503');
        const step = encodeURIComponent('WEEK_' + weekKey);
        const url = `${base}/workflows/${WF_NAME}/steps/${step}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (res.status === 401) throw new Error('auth');
        if (!res.ok) throw new Error(String(res.status));
    }

    function scheduleSaveDay() {
        app.dirtyDay = true;
        clearTimeout(app.dayDebounce);
        setStatus('Speichern…', '');
        app.dayDebounce = setTimeout(async () => {
            try {
                await saveDay(app.currentDayISO, collectDayFromForm());
                app.dirtyDay = false;
                setStatus('In der Cloud gespeichert', 'ok');
            } catch (e) {
                console.error(e);
                const msg = e && e.message;
                const authLike =
                    msg === 'auth' || msg === 'Nicht angemeldet' || (typeof msg === 'string' && msg.startsWith('401'));
                setStatus(authLike ? 'Bitte neu anmelden' : 'Speichern fehlgeschlagen', 'err');
            }
        }, DEBOUNCE_MS);
    }

    function scheduleSaveWeek(weekKey) {
        app.dirtyWeek = true;
        clearTimeout(app.weekDebounce);
        setStatus('Speichern…', '');
        app.weekDebounce = setTimeout(async () => {
            try {
                await saveWeek(weekKey, collectWeekFromForm());
                app.dirtyWeek = false;
                setStatus('In der Cloud gespeichert', 'ok');
            } catch (e) {
                console.error(e);
                const msg = e && e.message;
                const authLike =
                    msg === 'auth' || msg === 'Nicht angemeldet' || (typeof msg === 'string' && msg.startsWith('401'));
                setStatus(authLike ? 'Bitte neu anmelden' : 'Speichern fehlgeschlagen', 'err');
            }
        }, DEBOUNCE_MS);
    }

    async function reloadDay() {
        try {
            setStatus('Lade…', '');
            app.skipDayLoad = true;
            const entry = await fetchDay(app.currentDayISO);
            applyDayToForm(entry);
            setStatus('Bereit', '');
        } catch (e) {
            console.error(e);
            applyDayToForm(null);
            setStatus('Konnte nicht laden', 'err');
        } finally {
            app.skipDayLoad = false;
        }
    }

    async function reloadWeek(weekKey) {
        try {
            setStatus('Lade…', '');
            app.skipDayLoad = true;
            const entry = await fetchWeek(weekKey);
            applyWeekToForm(entry);
            setStatus('Bereit', '');
        } catch (e) {
            console.error(e);
            applyWeekToForm(null);
            setStatus('Konnte nicht laden', 'err');
        } finally {
            app.skipDayLoad = false;
        }
    }

    function updateWeekLabel() {
        const wk = isoWeekString(app.weekAnchor);
        const el = qs('ftWeekKey');
        if (el) el.textContent = wk;
        return wk;
    }

    function showAppAuthenticated() {
        const gate = qs('ftAuthGate');
        const main = qs('ftMain');
        const foot = qs('ftStatusWrap');
        if (gate) gate.classList.add('hidden');
        if (main) main.removeAttribute('hidden');
        if (foot) foot.removeAttribute('hidden');
    }

    function hideAppUnauthenticated() {
        const gate = qs('ftAuthGate');
        const main = qs('ftMain');
        const foot = qs('ftStatusWrap');
        if (gate) gate.classList.remove('hidden');
        if (main) main.setAttribute('hidden', '');
        if (foot) foot.setAttribute('hidden', '');
    }

    async function tryInitAuthenticated() {
        app.apiBase = getApiBase();
        if (!app.apiBase) {
            setStatus('API nicht konfiguriert', 'err');
            return;
        }

        if (!isUserLoggedIn()) {
            hideAppUnauthenticated();
            return;
        }

        showAppAuthenticated();

        let probeToken;
        try {
            probeToken = await getAuthToken();
        } catch (e) {
            hideAppUnauthenticated();
            return;
        }
        app.storageMode = await resolveStorageMode(probeToken);

        if (!app.initialized) {
            app.initialized = true;

            const dateInput = qs('ftDayDate');
            if (dateInput) {
                dateInput.value = app.currentDayISO;
                dateInput.addEventListener('change', async () => {
                    app.currentDayISO = dateInput.value || todayLocalISO();
                    await reloadDay();
                });
            }

            qs('ftTodayBtn')?.addEventListener('click', () => {
                app.currentDayISO = todayLocalISO();
                if (dateInput) dateInput.value = app.currentDayISO;
                reloadDay();
            });

            qs('ftWeekPrev')?.addEventListener('click', () => {
                app.weekAnchor.setDate(app.weekAnchor.getDate() - 7);
                const wk = updateWeekLabel();
                reloadWeek(wk);
            });
            qs('ftWeekNext')?.addEventListener('click', () => {
                app.weekAnchor.setDate(app.weekAnchor.getDate() + 7);
                const wk = updateWeekLabel();
                reloadWeek(wk);
            });
            qs('ftWeekThis')?.addEventListener('click', () => {
                app.weekAnchor = new Date();
                const wk = updateWeekLabel();
                reloadWeek(wk);
            });

            document.querySelectorAll('[data-ft-sync="day"]').forEach((el) => {
                el.addEventListener('input', () => {
                    if (app.skipDayLoad) return;
                    scheduleSaveDay();
                });
            });

            document.querySelectorAll('[data-ft-sync="week"]').forEach((el) => {
                el.addEventListener('input', () => {
                    if (app.skipDayLoad) return;
                    scheduleSaveWeek(updateWeekLabel());
                });
            });
        }

        const weekKey = updateWeekLabel();
        await Promise.all([reloadDay(), reloadWeek(weekKey)]);
    }

    function onUnifiedAuth(ev) {
        if (ev && ev.detail && ev.detail.loggedIn === false) {
            app.initialized = false;
            hideAppUnauthenticated();
            return;
        }
        tryInitAuthenticated();
    }

    window.ftOpenLogin = function () {
        if (window.authModals && typeof window.authModals.showLogin === 'function') {
            window.authModals.showLogin();
            return;
        }
        if (typeof window.showLoginModal === 'function') {
            window.showLoginModal();
            return;
        }
        if (window.realUserAuth && typeof window.realUserAuth.showAuthModal === 'function') {
            window.realUserAuth.showAuthModal();
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        qs('ftLoginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.ftOpenLogin();
        });

        window.addEventListener('authStateChanged', onUnifiedAuth);
        window.addEventListener('userLoggedIn', () => tryInitAuthenticated());

        setTimeout(() => tryInitAuthenticated(), 600);
        setTimeout(() => tryInitAuthenticated(), 1600);
    });
})();
