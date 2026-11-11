/**
 * Applications Section Module
 * Stellensuche (js/admin/job-search.js) und die eigenen Bewerbungen aus /user-data/applications
 */
class ApplicationsSection {
    constructor() {
        this.applications = [];
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
            root.addEventListener('click', (e) => {
                const portfolioLink = e.target.closest('[data-portfolio]');
                if (portfolioLink) { e.preventDefault(); this.openManager('portfolio', portfolioLink.dataset.portfolio); return; }
                const tabBtn = e.target.closest('[data-manager-tab]');
                if (tabBtn) { this.openManager(tabBtn.dataset.managerTab); return; }
                const btn = e.target.closest('[data-pane], [data-show-pane]');
                if (btn) this.showPane(btn.dataset.pane || btn.dataset.showPane, btn.dataset.managerTarget);
            });
        }
        window.JobSearch?.mount();
        this.loadApplications();
    }

    showPane(name, managerTab) {
        if (name === 'manager') { this.openManager(managerTab); return; }
        this.activatePane(name);
        if (name === 'tracking') this.loadApplications();
    }

    activatePane(name) {
        const root = document.getElementById('jobSearchRoot');
        if (!root) return;
        root.classList.toggle('is-manager', name === 'manager');
        root.querySelectorAll('[data-pane]').forEach((b) => b.classList.toggle('on', b.dataset.pane === name));
        root.querySelectorAll('[data-pane-body]').forEach((s) => { s.hidden = s.dataset.paneBody !== name; });
        if (name === 'manager') {
            window.scrollTo({ top: 0 });
            this.fitManager();
        }
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
        this.activatePane('manager');
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

    async loadApplications() {
        const list = document.getElementById('applicationsList');
        if (!list) return;
        try {
            const data = await this.request('GET');
            this.applications = (Array.isArray(data) ? data : [])
                .sort((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || '')));
            this.render();
        } catch (error) {
            list.innerHTML = `<div class="js-empty"><i class="fas fa-exclamation-triangle"></i>${this.esc(error.message)}</div>`;
        }
    }

    render() {
        const apps = this.applications;
        const count = (fn) => apps.filter(fn).length;
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('appsCount', apps.length);
        set('appsTotal', apps.length);
        set('appsOpen', count((a) => !a.status || a.status === 'pending'));
        set('appsInterview', count((a) => a.status === 'interview'));
        set('appsRejected', count((a) => a.status === 'rejected'));

        const list = document.getElementById('applicationsList');
        if (!list) return;
        if (!apps.length) {
            list.innerHTML = '<div class="js-empty"><i class="fas fa-briefcase"></i>Noch keine Bewerbungen. Starte mit der Stellensuche.</div>';
            return;
        }
        const statuses = Object.entries(ApplicationsSection.STATUS);
        list.innerHTML = apps.map((a) => `
            <div class="js-job js-app" data-id="${this.esc(a.id)}">
                <div class="js-score"><b class="${a.status === 'rejected' ? 'low' : a.status === 'pending' ? 'mid' : ''}"><i class="fas ${a.status === 'interview' ? 'fa-comments' : a.status === 'rejected' ? 'fa-times' : a.status === 'offer' ? 'fa-trophy' : 'fa-paper-plane'}"></i></b></div>
                <div>
                    <div class="js-title">${a.url ? `<a href="${this.esc(a.url)}" target="_blank" rel="noopener">${this.esc(a.position || 'Ohne Titel')}</a>` : this.esc(a.position || 'Ohne Titel')}
                        ${a.source === 'stellensuche' ? '<span class="js-badge focus">Stellensuche</span>' : ''}</div>
                    <div class="js-meta">${[a.company, a.location, this.formatDate(a.date || a.createdAt)].filter(Boolean).map((s) => this.esc(s)).join(' · ')}</div>
                    ${a.notes ? `<div class="js-why">${this.esc(a.notes)}</div>` : ''}
                </div>
                <div class="js-row-actions">
                    <select data-act="status" aria-label="Status">${statuses.map(([k, v]) => `<option value="${k}"${k === a.status ? ' selected' : ''}>${v}</option>`).join('')}</select>
                    <div style="display:flex;gap:6px">
                        ${a.portfolio || a.coverLetterId ? `<button class="js-btn small" type="button" data-portfolio="${this.esc(a.id)}" title="Bewerbungsmappe mit Anschreiben, Lebenslauf und Zeugnissen"><i class="fas fa-folder-open"></i> Mappe</button>` : ''}
                        ${a.coverLetterId ? `<a class="js-btn small" href="applications/cover-letter-editor.html?edit=${encodeURIComponent(a.coverLetterId)}" target="_blank" title="Anschreiben bearbeiten"><i class="fas fa-file-alt"></i></a>` : ''}
                        <button class="js-btn small ghost" data-act="delete" title="Löschen"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>`).join('');

        list.querySelectorAll('.js-app').forEach((row) => {
            const app = this.applications.find((a) => a.id === row.dataset.id);
            row.querySelector('[data-act=status]').addEventListener('change', (e) => this.updateStatus(app, e.target.value));
            row.querySelector('[data-act=delete]').addEventListener('click', () => this.deleteApplication(app));
        });
    }

    async updateStatus(app, status) {
        try {
            await this.request('POST', { ...app, status });
            app.status = status;
            this.render();
        } catch (error) {
            alert(`Status konnte nicht gespeichert werden: ${error.message}`);
        }
    }

    async deleteApplication(app) {
        if (!confirm(`Bewerbung «${app.position}» bei ${app.company} löschen?`)) return;
        try {
            await this.request('DELETE', null, `?id=${encodeURIComponent(app.id)}`);
            this.applications = this.applications.filter((a) => a.id !== app.id);
            this.render();
        } catch (error) {
            alert(`Löschen fehlgeschlagen: ${error.message}`);
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

ApplicationsSection.STATUS = {
    pending: 'Gesendet / offen',
    interview: 'Interview',
    offer: 'Angebot',
    rejected: 'Absage'
};

window.ApplicationsSection = ApplicationsSection;
