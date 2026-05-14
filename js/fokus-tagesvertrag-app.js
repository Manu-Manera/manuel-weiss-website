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

    async function getAuthToken() {
        if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
            const u = window.realUserAuth.getCurrentUser();
            if (u?.idToken) return u.idToken;
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
        const url = `${app.apiBase}/day?date=${encodeURIComponent(iso)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) throw new Error('auth');
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        return json.entry || null;
    }

    async function saveDay(iso, payload) {
        const token = await getAuthToken();
        const res = await fetch(`${app.apiBase}/day`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: iso, ...payload })
        });
        if (res.status === 401) throw new Error('auth');
        if (!res.ok) throw new Error(String(res.status));
    }

    async function fetchWeek(weekKey) {
        const token = await getAuthToken();
        const url = `${app.apiBase}/week?week=${encodeURIComponent(weekKey)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) throw new Error('auth');
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        return json.entry || null;
    }

    async function saveWeek(weekKey, payload) {
        const token = await getAuthToken();
        const res = await fetch(`${app.apiBase}/week`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ week: weekKey, ...payload })
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
                setStatus(e.message === 'auth' ? 'Bitte neu anmelden' : 'Speichern fehlgeschlagen', 'err');
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
                setStatus(e.message === 'auth' ? 'Bitte neu anmelden' : 'Speichern fehlgeschlagen', 'err');
            }
        }, DEBOUNCE_MS);
    }

    async function reloadDay() {
        try {
            setStatus('Lade…', '');
            const entry = await fetchDay(app.currentDayISO);
            app.skipDayLoad = true;
            applyDayToForm(entry);
            app.skipDayLoad = false;
            setStatus('Bereit', '');
        } catch (e) {
            console.error(e);
            applyDayToForm(null);
            setStatus('Konnte nicht laden', 'err');
        }
    }

    async function reloadWeek(weekKey) {
        try {
            setStatus('Lade…', '');
            const entry = await fetchWeek(weekKey);
            app.skipDayLoad = true;
            applyWeekToForm(entry);
            app.skipDayLoad = false;
            setStatus('Bereit', '');
        } catch (e) {
            console.error(e);
            applyWeekToForm(null);
            setStatus('Konnte nicht laden', 'err');
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

        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn()) {
            hideAppUnauthenticated();
            return;
        }

        showAppAuthenticated();

        if (app.initialized) {
            return;
        }
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

        const weekKey = updateWeekLabel();

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

        await Promise.all([reloadDay(), reloadWeek(weekKey)]);
    }

    function onAuthState() {
        if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
            tryInitAuthenticated();
        } else {
            hideAppUnauthenticated();
        }
    }

    window.ftOpenLogin = function () {
        // showLoginForm() nur Umschalten der Formulare *im* Modal — das Modal muss mit showAuthModal() sichtbar werden
        if (window.realUserAuth && typeof window.realUserAuth.showAuthModal === 'function') {
            window.realUserAuth.showAuthModal();
        } else {
            console.warn('realUserAuth.showAuthModal nicht verfügbar');
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        qs('ftLoginBtn')?.addEventListener('click', () => window.ftOpenLogin());

        document.addEventListener('authStateChange', () => onAuthState());

        const tryLater = () => {
            if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
                tryInitAuthenticated();
            } else {
                hideAppUnauthenticated();
            }
        };

        setTimeout(tryLater, 400);

        if (window.realUserAuth && typeof window.realUserAuth.onAuthStateChange === 'function') {
            window.realUserAuth.onAuthStateChange((loggedIn) => {
                if (loggedIn) tryInitAuthenticated();
                else {
                    app.initialized = false;
                    hideAppUnauthenticated();
                }
            });
        }
    });
})();
