/**
 * Applications Section Module
 * Ablauf: 1 Stellen finden (js/admin/job-search.js) → 2 Prüfen & versenden → 3 Nachverfolgen,
 * dazu der eingebettete Bewerbungsmanager für Unterlagen und Bewerbungsmappen.
 * Bewerbungen liegen in /user-data/applications und werden mit dem Manager geteilt.
 */
class ApplicationsSection {
    constructor() {
        this.applications = [];
        this.filter = 'draft';
        this.pane = 'search';
        this.returnPane = 'review';
        this.managerApp = null;
        this.highlightId = null;
        this.initialized = false;
    }

    init() {
        this.initialized = true;
    }

    onNavigate() {
        const root = document.getElementById('jobSearchRoot');
        if (!root) return;
        if (!root.dataset.panesBound) {
            root.dataset.panesBound = '1';
            root.addEventListener('click', (e) => this.handleClick(e));
            root.addEventListener('change', (e) => {
                const select = e.target.closest('[data-act=status]');
                if (select) this.updateStatus(this.find(select.closest('[data-id]').dataset.id), select.value);
            });
        }
        window.JobSearch?.mount();
        this.renderManagerBar();
        this.loadApplications();
    }

    handleClick(e) {
        const el = e.target.closest('[data-portfolio], [data-manager-tab], [data-pane], [data-show-app], [data-act=sent], [data-act=delete], [data-act=back], #appsSeg button');
        if (!el) return;
        if (el.dataset.portfolio) { e.preventDefault(); this.openManager('portfolio', el.dataset.portfolio); return; }
        if (el.dataset.managerTab) { e.preventDefault(); this.openManager(el.dataset.managerTab); return; }
        if (el.dataset.showApp) { e.preventDefault(); this.focusApplication(el.dataset.showApp); return; }
        if (el.dataset.act === 'sent') { this.markSent(this.find(el.dataset.id || el.closest('[data-id]')?.dataset.id)); return; }
        if (el.dataset.act === 'delete') { this.deleteApplication(this.find(el.closest('[data-id]').dataset.id)); return; }
        if (el.dataset.act === 'back') { this.showPane(this.returnPane); return; }
        if (el.closest('#appsSeg')) { this.filter = el.dataset.f; this.syncPaneWithFilter(); this.render(); return; }
        if (el.dataset.pane) this.showPane(el.dataset.pane, el.dataset.managerTarget);
    }

    find(id) {
        return this.applications.find((a) => a.id === id);
    }

    // ─────────────────────────────────────────────── Bereiche

    showPane(name, managerTab) {
        if (name === 'manager') { this.openManager(managerTab); return; }
        if (name === 'review') this.filter = 'draft';
        if (name === 'follow' && (this.filter === 'draft' || this.filter === 'all')) this.filter = 'pending';
        this.activatePane(name);
        if (name !== 'search') this.loadApplications();
    }

    activatePane(name) {
        const root = document.getElementById('jobSearchRoot');
        if (!root) return;
        if (this.pane !== 'manager' && name === 'manager') this.returnPane = this.pane;
        this.pane = name;
        const body = name === 'review' || name === 'follow' ? 'tracking' : name;
        root.classList.toggle('is-manager', name === 'manager');
        root.querySelectorAll('.js-panes [data-pane]').forEach((b) => b.classList.toggle('on', b.dataset.pane === name));
        root.querySelectorAll('[data-pane-body]').forEach((s) => { s.hidden = s.dataset.paneBody !== body; });
        window.scrollTo({ top: 0 });
        if (name === 'manager') this.fitManager();
    }

    syncPaneWithFilter() {
        const pane = this.filter === 'draft' ? 'review' : 'follow';
        if (this.pane !== pane && this.pane !== 'manager') this.activatePane(pane);
    }

    focusApplication(id) {
        const app = this.find(id);
        if (!app) { this.showPane('follow'); return; }
        this.highlightId = id;
        this.filter = this.statusOf(app);
        this.activatePane(this.filter === 'draft' ? 'review' : 'follow');
        this.render();
        document.querySelector(`#applicationsList [data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Der Bewerbungsmanager ist im eigenen Bereich der einzige Scrollbereich; verschachteltes Scrollen bricht Safari-Trackpad-Gesten.
    fitManager() {
        const frame = document.getElementById('managerFrame');
        if (!frame) return;
        if (!this.resizeBound) {
            this.resizeBound = true;
            window.addEventListener('resize', () => {
                if (document.getElementById('jobSearchRoot')?.classList.contains('is-manager')) this.fitManager();
            });
        }
        requestAnimationFrame(() => {
            const top = frame.getBoundingClientRect().top + window.scrollY;
            let height = Math.max(420, window.innerHeight - top - 16);
            frame.style.height = `${height}px`;
            const overflow = document.scrollingElement.scrollHeight - window.innerHeight;
            if (overflow > 0 && height - overflow >= 420) {
                height -= overflow;
                frame.style.height = `${height}px`;
            }
        });
    }

    // ─────────────────────────────────────────────── Bewerbungsmanager

    markManagerStale() {
        this.managerStale = true;
    }

    async whenManagerReady(frame) {
        for (let i = 0; i < 60; i++) {
            try {
                const win = frame.contentWindow;
                if (win?.ApplicationSync?.ready) { await win.ApplicationSync.ready; return win; }
            } catch { /* lädt noch */ }
            await new Promise((r) => setTimeout(r, 250));
        }
        return frame.contentWindow;
    }

    // Der Bewerbungsmanager liest die Website-Sitzung (aws_auth_session); Admin- und Website-Login nutzen denselben Cognito-Client.
    shareSessionWithManager() {
        const admin = window.adminAuth?.getSession?.();
        if (!admin?.idToken) return false;
        let payload = {};
        try { payload = JSON.parse(atob(admin.idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return false; }
        let current = null;
        try { current = JSON.parse(localStorage.getItem('aws_auth_session') || 'null'); } catch { /* ungültig */ }
        const stillValid = current?.idToken && current.id === payload.sub && new Date(current.expiresAt) > new Date(Date.now() + 5 * 60 * 1000);
        if (stillValid) return true;
        const expiresAt = admin.expiresAt || new Date(payload.exp * 1000).toISOString();
        localStorage.setItem('aws_auth_session', JSON.stringify({
            id: payload.sub,
            email: payload.email || admin.email,
            firstName: payload.given_name || '',
            lastName: payload.family_name || '',
            accessToken: admin.accessToken,
            idToken: admin.idToken,
            refreshToken: admin.refreshToken,
            expiresIn: Math.max(60, Math.round((new Date(expiresAt) - Date.now()) / 1000)),
            tokenType: 'Bearer',
            loginTime: Date.now(),
            expiresAt
        }));
        return true;
    }

    async openManager(tab = 'quick', applicationId = null) {
        const frame = document.getElementById('managerFrame');
        if (!frame) return;
        this.managerApp = applicationId ? this.find(applicationId) || null : null;
        this.activatePane('manager');
        this.renderManagerBar();
        this.shareSessionWithManager();
        const url = `applications/dashboard.html?embedded=true#${tab}`;
        if (!frame.src || this.managerStale) {
            this.managerStale = false;
            frame.src = url;
        }
        const win = await this.whenManagerReady(frame);
        try {
            if (applicationId && win.openPortfolioFor) win.openPortfolioFor(applicationId);
            else win.showTab(tab);
        } catch {
            frame.src = url;
        }
    }

    renderManagerBar() {
        const bar = document.getElementById('managerBar');
        if (!bar) return;
        const app = this.managerApp;
        const back = this.returnPane === 'search' ? 'Stellen finden' : this.returnPane === 'follow' ? 'Nachverfolgen' : 'Prüfen & versenden';
        bar.innerHTML = app
            ? `<button type="button" class="js-btn small ghost" data-act="back"><i class="fas fa-arrow-left"></i> ${back}</button>
               <span class="js-manager-ctx"><i class="fas fa-folder-open"></i> Bewerbungsmappe für <b>${this.esc(app.position)}</b> · ${this.esc(app.company)}
                 <em class="js-status-pill ${this.statusOf(app)}">${ApplicationsSection.STATUS[this.statusOf(app)]}</em></span>
               ${this.statusOf(app) === 'draft' ? `<button type="button" class="js-btn small primary" data-act="sent" data-id="${this.esc(app.id)}"><i class="fas fa-paper-plane"></i> Als versendet markieren</button>` : ''}
               <a class="js-btn small ghost" href="applications/dashboard.html" target="_blank" rel="noopener" title="In neuem Tab öffnen"><i class="fas fa-external-link-alt"></i></a>`
            : `<span class="js-manager-ctx">Unterlagen pflegen: Lebenslauf, Zeugnisse, Fotos, Anschreiben und Bewerbungsmappen. Änderungen gelten für alle Bewerbungen.</span>
               <a class="js-btn small ghost" href="applications/dashboard.html" target="_blank" rel="noopener" title="In neuem Tab öffnen"><i class="fas fa-external-link-alt"></i></a>`;
    }

    // ─────────────────────────────────────────────── Daten

    endpoint(query = '') {
        const base = window.getApiUrl ? window.getApiUrl('USER_DATA') : `${window.AWS_APP_CONFIG?.API_BASE || ''}/user-data`;
        return `${base}/applications${query}`;
    }

    async request(method, body, query) {
        const token = window.adminAuth?.getSession?.()?.idToken;
        if (!token) throw new Error('Admin-Sitzung abgelaufen');
        const res = await fetch(this.endpoint(query), {
            method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            ...(body ? { body: JSON.stringify(body) } : {})
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);
        return data;
    }

    // Der Bewerbungsmanager hält eine lokale Kopie (gleiche Origin) und lädt lokal-only Einträge wieder hoch; deshalb mitpflegen.
    syncLocalCopy(app, removeId) {
        try {
            const key = 'bewerbungsmanager_applications';
            const list = JSON.parse(localStorage.getItem(key) || '[]').filter((a) => a.id !== (removeId || app.id));
            if (app) list.push(app);
            localStorage.setItem(key, JSON.stringify(list));
        } catch { /* lokale Kopie optional */ }
        this.markManagerStale();
    }

    async save(app, changes) {
        const updated = { ...app, ...changes, updatedAt: new Date().toISOString() };
        await this.request('POST', updated);
        Object.assign(app, updated);
        this.syncLocalCopy(app);
        return app;
    }

    async loadApplications() {
        const list = document.getElementById('applicationsList');
        try {
            const data = await this.request('GET');
            this.applications = (Array.isArray(data) ? data : [])
                .sort((a, b) => String(b.updatedAt || b.date || b.createdAt || '').localeCompare(String(a.updatedAt || a.date || a.createdAt || '')));
            await this.migrateDrafts();
            this.render();
            window.JobSearch?.refresh?.();
        } catch (error) {
            if (list) list.innerHTML = `<div class="js-empty"><i class="fas fa-exclamation-triangle"></i>${this.esc(error.message)}</div>`;
        }
    }

    async migrateDrafts() {
        const legacy = this.applications.filter((a) => a.status === 'pending' && a.source === 'stellensuche' && !a.sentAt && /noch nicht versendet/.test(a.notes || ''));
        await Promise.all(legacy.map((a) => this.save(a, { status: 'draft' }).catch(() => null)));
    }

    applicationForJob(job) {
        const key = (s) => String(s || '').split('?')[0].replace(/\/$/, '');
        return this.applications.find((a) => a.url && key(a.url) === key(job.url))
            || this.applications.find((a) => a.position === job.title && a.company === job.company);
    }

    statusOf(app) {
        return app?.status || 'pending';
    }

    daysSince(value) {
        const t = new Date(value).getTime();
        return Number.isNaN(t) ? null : Math.floor((Date.now() - t) / 86400000);
    }

    followUpDue(app) {
        if (this.statusOf(app) !== 'pending') return false;
        const days = this.daysSince(app.sentAt || app.date);
        return days != null && days >= ApplicationsSection.FOLLOW_UP_DAYS;
    }

    // ─────────────────────────────────────────────── Darstellung

    render() {
        const apps = this.applications;
        const count = (s) => (s === 'all' ? apps.length : apps.filter((a) => this.statusOf(a) === s).length);
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        const drafts = count('draft');
        const active = count('pending') + count('interview') + count('offer');
        const due = apps.filter((a) => this.followUpDue(a)).length;
        set('paneCountReview', drafts);
        set('paneCountFollow', active);
        document.getElementById('paneCountReview')?.classList.toggle('warn', drafts > 0);
        document.getElementById('paneCountFollow')?.classList.toggle('warn', due > 0);
        this.renderManagerBar();

        document.querySelectorAll('#appsSeg button').forEach((b) => {
            b.classList.toggle('on', b.dataset.f === this.filter);
            b.querySelector('em').textContent = count(b.dataset.f);
        });

        const hint = document.getElementById('appsHint');
        if (hint) {
            hint.innerHTML = this.filter === 'draft'
                ? `<i class="fas fa-clipboard-check"></i><div><b>${drafts ? `${drafts} Paket${drafts === 1 ? '' : 'e'} bereit zum Prüfen` : 'Keine offenen Entwürfe'}</b>
                   <span>${drafts ? 'Mappe öffnen, Anschreiben bei Bedarf anpassen, über die Stellenanzeige einreichen und dann als versendet markieren.' : 'Neue Pakete entstehen unter «Stellen finden».'}</span></div>
                   ${drafts ? '' : '<button type="button" class="js-btn small" data-pane="search"><i class="fas fa-search"></i> Stellen finden</button>'}`
                : `<i class="fas fa-bell"></i><div><b>${due ? `${due} Bewerbung${due === 1 ? '' : 'en'} zum Nachfassen` : `${active} laufende Bewerbung${active === 1 ? '' : 'en'}`}</b>
                   <span>Nach ${ApplicationsSection.FOLLOW_UP_DAYS} Tagen ohne Antwort lohnt sich eine kurze Nachfrage. Status hier oder im Bewerbungsmanager pflegen, beides ist verbunden.</span></div>`;
            hint.classList.toggle('warn', this.filter !== 'draft' && due > 0);
        }

        const list = document.getElementById('applicationsList');
        if (!list) return;
        const shown = apps.filter((a) => this.filter === 'all' || this.statusOf(a) === this.filter);
        list.innerHTML = shown.length ? shown.map((a) => this.row(a)).join('')
            : `<div class="js-empty"><i class="fas fa-briefcase"></i>${apps.length ? 'In diesem Status gibt es keine Bewerbungen.' : 'Noch keine Bewerbungen. Starte unter «Stellen finden».'}</div>`;
        this.highlightId = null;
    }

    row(a) {
        const status = this.statusOf(a);
        const p = a.portfolio || {};
        const parts = [
            ['Anschreiben', !!(p.coverLetterId || a.coverLetterId)],
            ['Lebenslauf', !!(p.resumeId || a.resumeId)],
            [`Zeugnisse${(p.certificateIds || a.certificateIds || []).length ? ` (${(p.certificateIds || a.certificateIds).length})` : ''}`, !!(p.certificateIds || a.certificateIds || []).length],
            ['Foto', !!(p.photoId || a.photoId)]
        ];
        const hasPortfolio = !!(a.portfolio || a.coverLetterId);
        const sentDays = this.daysSince(a.sentAt || a.date);
        const when = status === 'draft'
            ? `erstellt ${this.formatDate(a.createdAt || a.date)}`
            : `versendet ${this.formatDate(a.sentAt || a.date)}${sentDays != null ? ` · vor ${sentDays} Tag${sentDays === 1 ? '' : 'en'}` : ''}`;
        const statuses = Object.entries(ApplicationsSection.STATUS);
        const icon = { draft: 'fa-pen', pending: 'fa-paper-plane', interview: 'fa-comments', offer: 'fa-trophy', rejected: 'fa-times' }[status] || 'fa-paper-plane';
        return `
            <div class="js-job js-app is-${status}${a.id === this.highlightId ? ' flash' : ''}" data-id="${this.esc(a.id)}">
                <div class="js-app-icon ${status}"><i class="fas ${icon}"></i></div>
                <div>
                    <div class="js-title">${a.url ? `<a href="${this.esc(a.url)}" target="_blank" rel="noopener" title="Stellenanzeige öffnen">${this.esc(a.position || 'Ohne Titel')} <i class="fas fa-external-link-alt"></i></a>` : this.esc(a.position || 'Ohne Titel')}
                        ${this.followUpDue(a) ? '<span class="js-badge rec">Nachfassen fällig</span>' : ''}</div>
                    <div class="js-meta">${[a.company, a.location, when].filter(Boolean).map((s) => this.esc(s)).join(' · ')}</div>
                    ${hasPortfolio ? `<div class="js-parts">${parts.map(([label, ok]) => `<span class="${ok ? 'ok' : 'miss'}"><i class="fas ${ok ? 'fa-check' : 'fa-minus'}"></i> ${label}</span>`).join('')}</div>` : ''}
                    ${a.notes && !/noch nicht versendet/.test(a.notes) ? `<div class="js-why">${this.esc(a.notes)}</div>` : ''}
                </div>
                <div class="js-row-actions">
                    ${status === 'draft'
                        ? `<button class="js-btn small primary" type="button" data-act="sent"><i class="fas fa-paper-plane"></i> Als versendet markieren</button>`
                        : `<select data-act="status" aria-label="Status">${statuses.map(([k, v]) => `<option value="${k}"${k === status ? ' selected' : ''}>${v}</option>`).join('')}</select>`}
                    <div class="js-row-tools">
                        ${hasPortfolio ? `<button class="js-btn small" type="button" data-portfolio="${this.esc(a.id)}" title="Anschreiben, Lebenslauf und Zeugnisse als Mappe prüfen und als PDF laden"><i class="fas fa-folder-open"></i> Mappe</button>` : ''}
                        ${a.coverLetterId ? `<a class="js-btn small" href="applications/cover-letter-editor.html?edit=${encodeURIComponent(a.coverLetterId)}" target="_blank" title="Anschreiben bearbeiten"><i class="fas fa-pen"></i> Anschreiben</a>` : ''}
                        <button class="js-btn small ghost" type="button" data-act="delete" title="Löschen"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>`;
    }

    // ─────────────────────────────────────────────── Aktionen

    async markSent(app) {
        if (!app) return;
        const now = new Date();
        try {
            await this.save(app, {
                status: 'pending', sentAt: now.toISOString(), date: now.toISOString().split('T')[0],
                notes: /noch nicht versendet/.test(app.notes || '') ? '' : app.notes
            });
            window.JobSearch?.toast?.(`«${app.position}» als versendet markiert. Erinnerung zum Nachfassen in ${ApplicationsSection.FOLLOW_UP_DAYS} Tagen.`, 'success');
            this.render();
        } catch (error) {
            window.JobSearch?.toast?.(`Speichern fehlgeschlagen: ${error.message}`, 'error');
        }
    }

    async updateStatus(app, status) {
        if (!app) return;
        try {
            await this.save(app, { status, ...(status === 'pending' && !app.sentAt ? { sentAt: new Date().toISOString() } : {}) });
            this.render();
        } catch (error) {
            window.JobSearch?.toast?.(`Status konnte nicht gespeichert werden: ${error.message}`, 'error');
        }
    }

    async deleteApplication(app) {
        if (!app || !confirm(`Bewerbung «${app.position}» bei ${app.company} löschen?`)) return;
        try {
            await this.request('DELETE', null, `?id=${encodeURIComponent(app.id)}`);
            this.applications = this.applications.filter((a) => a.id !== app.id);
            this.syncLocalCopy(null, app.id);
            this.render();
            window.JobSearch?.refresh?.();
        } catch (error) {
            window.JobSearch?.toast?.(`Löschen fehlgeschlagen: ${error.message}`, 'error');
        }
    }

    formatDate(value) {
        if (!value) return '';
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('de-CH');
    }

    esc(s) {
        return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
}

ApplicationsSection.FOLLOW_UP_DAYS = 10;

ApplicationsSection.STATUS = {
    draft: 'Entwurf',
    pending: 'Versendet',
    interview: 'Interview',
    offer: 'Angebot',
    rejected: 'Absage'
};

window.ApplicationsSection = ApplicationsSection;
