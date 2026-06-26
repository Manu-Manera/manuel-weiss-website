/**
 * Zentrales Dashboard ("Überblick")
 * Führt für angemeldete User alle Bereiche zusammen:
 *  - Persönlichkeitsentwicklung (alle Methoden via /user-data/workflows)
 *  - Sinnestraining (Die Schule der Sinne, workflow 'sinnesschule')
 *  - Bewerbungen (/user-data → applications)
 *  - Stimmtraining (Singing-Trainer, localStorage 'st_progress')
 *
 * Liest dieselbe Cloud-Quelle (DynamoDB mawps-user-profiles via API Gateway),
 * in die die einzelnen Module schreiben. Keine neue Infrastruktur nötig.
 */
(function () {
    'use strict';

    /* ---------------- Daten-Endpoints ---------------- */
    function udBase() {
        try {
            if (typeof window.getApiUrl === 'function') {
                const u = window.getApiUrl('USER_DATA');
                if (u) return u;
            }
        } catch (e) { /* ignore */ }
        if (window.AWS_APP_CONFIG && window.AWS_APP_CONFIG.API_BASE) {
            return window.AWS_APP_CONFIG.API_BASE.replace(/\/$/, '') + '/user-data';
        }
        return 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/user-data';
    }

    function authToken() {
        try {
            const s = JSON.parse(localStorage.getItem('aws_auth_session') || 'null');
            if (s) return s.idToken || s.IdToken || s.id_token || null;
        } catch (e) { /* ignore */ }
        return null;
    }

    function isLoggedIn() {
        try { if (window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()) return true; } catch (e) { /* ignore */ }
        try { if (window.awsAuth && window.awsAuth.isLoggedIn && window.awsAuth.isLoggedIn()) return true; } catch (e) { /* ignore */ }
        try { if (window.unifiedAuth && window.unifiedAuth.isLoggedIn && window.unifiedAuth.isLoggedIn()) return true; } catch (e) { /* ignore */ }
        return !!authToken();
    }

    function currentName() {
        const sources = [window.realUserAuth, window.awsAuth, window.unifiedAuth];
        for (const a of sources) {
            try {
                const u = a && a.getCurrentUser && a.getCurrentUser();
                if (u) return u.firstName || u.name || (u.email && u.email.split('@')[0]) || '';
            } catch (e) { /* ignore */ }
        }
        return '';
    }

    async function getJSON(path) {
        const t = authToken();
        const headers = {};
        if (t) headers['Authorization'] = 'Bearer ' + t;
        const r = await fetch(udBase() + path, { headers });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }

    /* ---------------- Methoden-Namen (für Aktivitäts-Liste) ---------------- */
    const METHOD_NAMES = {
        ikigai: 'Ikigai', raisec: 'RAISEC', 'values-clarification': 'Werte-Klärung',
        'strengths-analysis': 'Stärken-Analyse', 'goal-setting': 'Zielsetzung', mindfulness: 'Achtsamkeit',
        'emotional-intelligence': 'Emotionale Intelligenz', 'habit-building': 'Gewohnheiten', communication: 'Kommunikation',
        'time-management': 'Zeitmanagement', 'aek-communication': 'Aktiv-Empathisch Kommunizieren',
        'change-stages': 'Veränderungsphasen', 'circular-interview': 'Zirkuläres Interview', 'competence-map': 'Kompetenz-Map',
        'conflict-escalation': 'Konflikt-Eskalation', 'five-pillars': 'Fünf Säulen der Identität', 'gallup-strengths': 'Gallup-Stärken',
        'harvard-method': 'Harvard-Methode', 'johari-window': 'Johari-Fenster', journaling: 'Journaling',
        'moment-excellence': 'Moment of Excellence', 'nlp-dilts': 'NLP Dilts', 'nlp-meta-goal': 'NLP Meta-Ziel',
        'nonviolent-communication': 'Gewaltfreie Kommunikation', 'rafael-method': 'RAFAEL-Methode', 'resource-analysis': 'Ressourcen-Analyse',
        'rubikon-model': 'Rubikon-Modell', 'self-assessment': 'Selbsteinschätzung', 'solution-focused': 'Lösungsfokussiert',
        'stress-management': 'Stressmanagement', 'swot-analysis': 'SWOT-Analyse', 'systemic-coaching': 'Systemisches Coaching',
        'target-coaching': 'Ziel-Coaching', 'via-strengths': 'VIA-Stärken', 'vision-board': 'Vision Board',
        'walt-disney': 'Walt-Disney-Methode', 'wheel-of-life': 'Lebensrad'
    };
    function methodName(id) {
        if (METHOD_NAMES[id]) return METHOD_NAMES[id];
        return id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    function esc(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
    function num(n) { return (Number(n) || 0).toLocaleString('de-DE'); }
    function relTime(iso) {
        if (!iso) return '';
        const d = new Date(iso); if (isNaN(d)) return '';
        const diff = Date.now() - d.getTime();
        const day = 86400000;
        if (diff < day) return 'heute';
        if (diff < 2 * day) return 'gestern';
        if (diff < 7 * day) return 'vor ' + Math.floor(diff / day) + ' Tagen';
        if (diff < 30 * day) return 'vor ' + Math.floor(diff / (7 * day)) + ' Wochen';
        return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const EXCLUDE_FROM_PERSONALITY = new Set(['sinnesschule', 'gedaechtnisschule']);

    /* ---------------- Dashboard ---------------- */
    class CentralDashboard {
        constructor() { this.el = null; this.lastRender = 0; }

        mount() {
            this.el = document.getElementById('centralDashboard');
            if (this.el) this.refresh();
        }

        async refresh() {
            this.el = this.el || document.getElementById('centralDashboard');
            if (!this.el) return;
            if (!isLoggedIn()) { this.renderLoggedOut(); return; }
            this.renderLoading();
            let workflows = {}, all = {};
            try {
                [workflows, all] = await Promise.all([
                    getJSON('/workflows').catch(() => ({})),
                    getJSON('').catch(() => ({}))
                ]);
            } catch (e) { console.warn('Überblick: Laden fehlgeschlagen', e); }
            this.render(this.compute(workflows, all));
        }

        compute(workflows, all) {
            workflows = workflows || {};
            all = all || {};

            let pStarted = 0, pCompleted = 0, lastActive = null;
            const recent = [];
            Object.keys(workflows).forEach(k => {
                if (EXCLUDE_FROM_PERSONALITY.has(k)) return;
                const w = workflows[k] || {};
                const started = !!w.results || (w.progress && w.progress.currentStep > 0) ||
                    (w.steps && Object.keys(w.steps).length > 0);
                if (!started) return;
                pStarted++;
                const done = w.progress && (w.progress.status === 'completed' || w.progress.completionPercentage >= 100);
                if (done) pCompleted++;
                const ts = (w.results && w.results.updatedAt) || (w.progress && w.progress.updatedAt) || null;
                recent.push({ id: k, ts, done });
                if (ts && (!lastActive || ts > lastActive)) lastActive = ts;
            });

            // Sinnestraining
            let ss = null;
            const wrap = workflows.sinnesschule && workflows.sinnesschule.results;
            const ssState = wrap ? (wrap.results || (wrap.startedAt ? wrap : null)) : null;
            if (ssState && ssState.senses) {
                let xp = 0, activeSenses = 0;
                Object.keys(ssState.senses).forEach(id => {
                    const x = ssState.senses[id].xp || 0;
                    xp += x;
                    if (x > 0) activeSenses++;
                });
                ss = {
                    xp,
                    streak: ssState.streak || 0,
                    days: (ssState.practiceDays || []).length,
                    senses: activeSenses,
                    ts: wrap && wrap.updatedAt
                };
            }

            // Gedächtnistraining
            let mem = null;
            const mwrap = workflows.gedaechtnisschule && workflows.gedaechtnisschule.results;
            const memState = mwrap ? (mwrap.results || (mwrap.startedAt ? mwrap : null)) : null;
            if (memState && memState.disc) {
                let xp = 0, activeDisc = 0, due = 0;
                Object.keys(memState.disc).forEach(id => {
                    const x = (memState.disc[id] && memState.disc[id].xp) || 0;
                    xp += x;
                    if (x > 0) activeDisc++;
                });
                try {
                    const now = Date.now();
                    ((memState.srs && memState.srs.decks) || []).forEach(dk => {
                        (dk.cards || []).forEach(c => { if (new Date(c.due).getTime() <= now) due++; });
                    });
                } catch (e) { /* ignore */ }
                mem = { xp, streak: memState.streak || 0, disc: activeDisc, due, ts: mwrap && mwrap.updatedAt };
            }

            // Bewerbungen
            const apps = (all && Array.isArray(all.applications)) ? all.applications : [];
            const appOpen = apps.filter(a => {
                const s = String(a.status || a.phase || '').toLowerCase();
                return s && !/absage|abgesagt|abgelehnt|rejected|closed|geschlossen|zusage|accepted|angenommen|eingestellt|archiv/.test(s);
            }).length;

            // Stimmtraining
            let voice = null;
            try {
                const v = JSON.parse(localStorage.getItem('st_progress') || 'null');
                if (v) voice = { level: v.currentLevel || 1, xp: v.totalXP || 0, streak: v.streak || 0, sessions: v.sessionsCompleted || 0 };
            } catch (e) { /* ignore */ }

            recent.sort((a, b) => String(b.ts || '').localeCompare(String(a.ts || '')));

            return { pStarted, pCompleted, ss, mem, apps, appOpen, voice, lastActive, recent: recent.slice(0, 6) };
        }

        renderLoading() {
            this.el.innerHTML = `<div class="cd-loading"><i class="fas fa-circle-notch fa-spin"></i> Dein Überblick wird geladen …</div>`;
        }

        renderLoggedOut() {
            this.el.innerHTML = `
            <div class="cd-hero">
                <h2>Dein persönliches Dashboard</h2>
                <p>Melde dich an, damit hier alles zusammenfließt: Persönlichkeitsentwicklung, Sinnestraining, Bewerbungen und Stimmtraining – geräteübergreifend gespeichert.</p>
                <button class="cd-btn cd-btn-primary" id="cdLoginBtn"><i class="fas fa-right-to-bracket"></i> Anmelden</button>
            </div>`;
            const b = document.getElementById('cdLoginBtn');
            if (b) b.addEventListener('click', () => {
                if (typeof window.showLoginModal === 'function') window.showLoginModal();
                else if (window.authModals && window.authModals.showLogin) window.authModals.showLogin();
            });
        }

        card(opts) {
            const stats = (opts.stats || []).map(s =>
                `<div class="cd-stat"><span class="cd-stat-num">${s.v}</span><span class="cd-stat-lbl">${esc(s.l)}</span></div>`
            ).join('');
            const action = opts.onclick
                ? `<button class="cd-card-link" data-cd-action="${opts.onclick}">${esc(opts.cta)} <i class="fas fa-arrow-right"></i></button>`
                : `<a class="cd-card-link" href="${opts.href}">${esc(opts.cta)} <i class="fas fa-arrow-right"></i></a>`;
            return `
            <div class="cd-card" style="--cd-accent:${opts.accent}">
                <div class="cd-card-head">
                    <div class="cd-card-icon"><i class="fas ${opts.icon}"></i></div>
                    <h3>${esc(opts.title)}</h3>
                </div>
                <p class="cd-card-sub">${esc(opts.sub)}</p>
                <div class="cd-stats">${stats}</div>
                ${action}
            </div>`;
        }

        render(d) {
            const name = currentName();
            const cards = [];

            cards.push(this.card({
                accent: '#6366f1', icon: 'fa-brain', title: 'Persönlichkeitsentwicklung',
                sub: d.pStarted ? 'Deine Methoden-Reise' : 'Entdecke über 35 Methoden',
                stats: [
                    { v: num(d.pStarted), l: 'begonnen' },
                    { v: num(d.pCompleted), l: 'abgeschlossen' }
                ],
                cta: 'Zu den Methoden', href: 'persoenlichkeitsentwicklung-uebersicht.html'
            }));

            cards.push(this.card({
                accent: '#e0b04a', icon: 'fa-hand-sparkles', title: 'Sinnestraining',
                sub: d.ss ? 'Die Schule der Sinne' : 'Schule deine sieben Sinne',
                stats: d.ss ? [
                    { v: num(d.ss.xp), l: 'Schärfe' },
                    { v: (d.ss.streak > 0 ? '🔥 ' : '') + num(d.ss.streak), l: 'Tage Streak' },
                    { v: num(d.ss.senses) + '/7', l: 'Disziplinen' }
                ] : [{ v: '0', l: 'noch nicht gestartet' }],
                cta: d.ss ? 'Weiter trainieren' : 'Jetzt starten', href: 'methods/sinnesschule/index-sinnesschule.html'
            }));

            cards.push(this.card({
                accent: '#818cf8', icon: 'fa-brain', title: 'Gedächtnistraining',
                sub: d.mem ? 'Die Schule des Gedächtnisses' : 'Schule dein Gedächtnis',
                stats: d.mem ? [
                    { v: num(d.mem.xp), l: 'Gedächtniskraft' },
                    { v: (d.mem.streak > 0 ? '🔥 ' : '') + num(d.mem.streak), l: 'Tage Streak' },
                    { v: num(d.mem.due), l: 'Karten fällig' }
                ] : [{ v: '0', l: 'noch nicht gestartet' }],
                cta: d.mem ? 'Weiter trainieren' : 'Jetzt starten', href: 'methods/gedaechtnisschule/index-gedaechtnisschule.html'
            }));

            cards.push(this.card({
                accent: '#10b981', icon: 'fa-briefcase', title: 'Bewerbungen',
                sub: d.apps.length ? 'Dein Bewerbungsmanager' : 'Starte deine erste Bewerbung',
                stats: [
                    { v: num(d.apps.length), l: 'gesamt' },
                    { v: num(d.appOpen), l: 'aktiv' }
                ],
                cta: 'Zum Bewerbungsmanager', onclick: 'applications'
            }));

            cards.push(this.card({
                accent: '#ec4899', icon: 'fa-microphone-lines', title: 'Stimmtraining',
                sub: d.voice ? 'Dein Singing-Trainer' : 'Trainiere Tonhöhe & Stimme',
                stats: d.voice ? [
                    { v: 'Lvl ' + num(d.voice.level), l: 'Level' },
                    { v: num(d.voice.xp), l: 'XP' },
                    { v: (d.voice.streak > 0 ? '🔥 ' : '') + num(d.voice.streak), l: 'Streak' }
                ] : [{ v: '0', l: 'noch nicht gestartet' }],
                cta: d.voice ? 'Weiter singen' : 'Jetzt starten', href: 'singing-trainer.html'
            }));

            const moreChips = [
                { l: 'Training', t: 'training', i: 'fa-dumbbell' },
                { l: 'Ernährung', t: 'nutrition', i: 'fa-utensils' },
                { l: 'Tagebuch', t: 'journal', i: 'fa-book' },
                { l: 'Erfolge', t: 'coach', i: 'fa-trophy' },
                { l: 'Fortschritt', t: 'progress', i: 'fa-chart-line' }
            ].map(c => `<button class="cd-chip" data-cd-action="${c.t}"><i class="fas ${c.i}"></i> ${c.l}</button>`).join('');

            const activity = d.recent.length ? `
            <div class="cd-activity">
                <h3><i class="fas fa-clock-rotate-left"></i> Zuletzt aktiv</h3>
                <div class="cd-activity-list">
                    ${d.recent.map(r => `
                        <div class="cd-activity-item">
                            <i class="fas ${r.done ? 'fa-circle-check' : 'fa-circle-play'}"></i>
                            <span class="cd-activity-name">${esc(methodName(r.id))}</span>
                            <span class="cd-activity-meta">${r.done ? 'abgeschlossen' : 'in Arbeit'}${r.ts ? ' · ' + relTime(r.ts) : ''}</span>
                        </div>`).join('')}
                </div>
            </div>` : '';

            this.el.innerHTML = `
            <div class="cd-hero">
                <h2>Willkommen zurück${name ? ', ' + esc(name) : ''} 👋</h2>
                <p>Hier fließt alles zusammen – dein ganzer Weg auf einen Blick.${d.lastActive ? ' Zuletzt aktiv ' + relTime(d.lastActive) + '.' : ''}</p>
            </div>
            <div class="cd-grid">${cards.join('')}</div>
            <div class="cd-more">
                <span class="cd-more-label">Weitere Bereiche</span>
                <div class="cd-chips">${moreChips}</div>
            </div>
            ${activity}`;

            this.el.querySelectorAll('[data-cd-action]').forEach(b => {
                b.addEventListener('click', () => {
                    const t = b.getAttribute('data-cd-action');
                    if (window.userProfile && typeof window.userProfile.switchTab === 'function') {
                        window.userProfile.switchTab(t);
                    } else {
                        location.hash = t;
                    }
                });
            });
        }
    }

    window.centralDashboard = new CentralDashboard();

    function boot() {
        // Erst rendern, wenn der Überblick-Tab im DOM ist
        const tryMount = (n) => {
            if (document.getElementById('centralDashboard')) { window.centralDashboard.mount(); return; }
            if (n < 20) setTimeout(() => tryMount(n + 1), 150);
        };
        tryMount(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // Nach Login/Logout aktualisieren
    window.addEventListener('auth-state-changed', () => window.centralDashboard.refresh());
    window.addEventListener('storage', (e) => { if (e.key === 'aws_auth_session') window.centralDashboard.refresh(); });
})();
