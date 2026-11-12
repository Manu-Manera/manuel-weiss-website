/**
 * Applications Section Module
 * Ablauf: 1 Stellen finden → 2 Prüfen & versenden → 3 Nachverfolgen.
 * Pakete werden in einer leichten Eigenansicht geöffnet (kein schwerer iframe),
 * weil der Bewerbungsmanager-Dashboard auf Mobilgeräten Safari abstürzen lässt.
 */
class ApplicationsSection {
    constructor() {
        this.applications = [];
        this.filter = 'draft';
        this.pane = 'search';
        this.returnPane = 'review';
        this.managerApp = null;
        this.packApp = null;
        this.packClipboard = '';
        this.highlightId = null;
        this.initialized = false;
    }

    init() {
        this.initialized = true;
    }

    isMobile() {
        return window.matchMedia('(max-width: 860px)').matches || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
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
        const el = e.target.closest('[data-portfolio], [data-manager-tab], [data-pane], [data-show-app], [data-act=sent], [data-act=delete], [data-act=back], [data-act=copy], [data-pack-tab], #appsSeg button');
        if (!el) return;
        if (el.dataset.portfolio) { e.preventDefault(); this.openPack(el.dataset.portfolio); return; }
        if (el.dataset.managerTab) { e.preventDefault(); this.openManager(el.dataset.managerTab); return; }
        if (el.dataset.showApp) { e.preventDefault(); this.focusApplication(el.dataset.showApp); return; }
        if (el.dataset.act === 'sent') { this.markSent(this.find(el.dataset.id || el.closest('[data-id]')?.dataset.id || this.packApp?.id)); return; }
        if (el.dataset.act === 'delete') { this.deleteApplication(this.find(el.closest('[data-id]')?.dataset.id)); return; }
        if (el.dataset.act === 'back') { this.showPane(this.returnPane); return; }
        if (el.dataset.act === 'copy') { e.preventDefault(); this.copyText(this.packClipboard); return; }
        if (el.dataset.packTab) { e.preventDefault(); this.showPackTab(el.dataset.packTab); return; }
        if (el.closest('#appsSeg')) { this.filter = el.dataset.f; this.syncPaneWithFilter(); this.render(); return; }
        if (el.dataset.pane) this.showPane(el.dataset.pane, el.dataset.managerTarget);
    }

    find(id) {
        return this.applications.find((a) => a.id === id);
    }

    // ─────────────────────────────────────────────── Bereiche

    showPane(name, managerTab) {
        if (name === 'manager') { this.openManager(managerTab); return; }
        if (name === 'pack') return;
        if (name === 'review') this.filter = 'draft';
        if (name === 'follow' && (this.filter === 'draft' || this.filter === 'all')) this.filter = 'pending';
        this.activatePane(name);
        if (name !== 'search') this.loadApplications();
    }

    activatePane(name) {
        const root = document.getElementById('jobSearchRoot');
        if (!root) return;
        if (this.pane !== 'manager' && this.pane !== 'pack' && (name === 'manager' || name === 'pack')) {
            this.returnPane = this.pane;
        }
        this.pane = name;
        const body = name === 'review' || name === 'follow' ? 'tracking' : name;
        root.classList.toggle('is-manager', name === 'manager');
        root.classList.toggle('is-pack', name === 'pack');
        const activeTab = name === 'pack'
            ? (this.returnPane === 'follow' ? 'follow' : 'review')
            : name;
        root.querySelectorAll('.js-panes [data-pane]').forEach((b) => b.classList.toggle('on', b.dataset.pane === activeTab));
        root.querySelectorAll('[data-pane-body]').forEach((s) => { s.hidden = s.dataset.paneBody !== body; });
        window.scrollTo({ top: 0 });
        if (name === 'manager') this.fitManager();
    }

    syncPaneWithFilter() {
        const pane = this.filter === 'draft' ? 'review' : 'follow';
        if (this.pane !== pane && this.pane !== 'manager' && this.pane !== 'pack') this.activatePane(pane);
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

    // ─────────────────────────────────────────────── Leichte Paketansicht (Handy-sicher)

    async openPack(applicationId) {
        const app = this.find(applicationId);
        if (!app) return;
        this.packApp = app;
        this.activatePane('pack');
        const bar = document.getElementById('packBar');
        const body = document.getElementById('packBody');
        if (!bar || !body) return;
        const back = this.returnPane === 'follow' ? 'Nachverfolgen' : 'Prüfen & versenden';
        const status = this.statusOf(app);
        bar.innerHTML = `
            <button type="button" class="js-btn small ghost" data-act="back"><i class="fas fa-arrow-left"></i> ${back}</button>
            <div class="js-pack-title">
                <b>${this.esc(app.position || 'Bewerbung')}</b>
                <span>${this.esc(app.company || '')}${app.location ? ` · ${this.esc(app.location)}` : ''}</span>
            </div>
            <em class="js-status-pill ${status}">${ApplicationsSection.STATUS[status]}</em>
            ${status === 'draft' ? `<button type="button" class="js-btn small primary" data-act="sent" data-id="${this.esc(app.id)}"><i class="fas fa-paper-plane"></i> Als versendet</button>` : ''}
            ${app.url ? `<a class="js-btn small" href="${this.esc(app.url)}" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> Anzeige</a>` : ''}`;
        body.innerHTML = '<div class="js-empty"><i class="fas fa-spinner fa-spin"></i>Paket wird geladen …</div>';

        try {
            const data = await this.loadPackData(app);
            this.renderPack(app, data);
        } catch (error) {
            body.innerHTML = `<div class="js-empty"><i class="fas fa-exclamation-triangle"></i>${this.esc(error.message)}</div>`;
        }
    }

    userDataBase() {
        return window.getApiUrl ? window.getApiUrl('USER_DATA') : `${window.AWS_APP_CONFIG?.API_BASE || ''}/user-data`;
    }

    async fetchUserData(path) {
        const token = window.adminAuth?.getSession?.()?.idToken;
        if (!token) throw new Error('Admin-Sitzung abgelaufen');
        const res = await fetch(`${this.userDataBase()}${path}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ([]));
        if (!res.ok) throw new Error(data.error || `Laden fehlgeschlagen (${res.status})`);
        return Array.isArray(data) ? data : [];
    }

    async loadPackData(app) {
        const p = app.portfolio || {};
        const coverId = p.coverLetterId || app.coverLetterId;
        const resumeId = p.resumeId || app.resumeId;
        const certIds = p.certificateIds || app.certificateIds || [];
        const photoId = p.photoId || app.photoId;
        const mobile = this.isMobile();
        const [covers, resumes, docs, photos] = await Promise.all([
            coverId ? this.fetchUserData('/cover-letters') : Promise.resolve([]),
            resumeId ? this.fetchUserData('/resumes') : Promise.resolve([]),
            certIds.length ? this.fetchUserData('/documents') : Promise.resolve([]),
            // Fotos kommen oft als grosse Base64-Payloads und killen Safari auf dem Handy.
            photoId && !mobile ? this.fetchUserData('/photos') : Promise.resolve([])
        ]);
        return {
            cover: covers.find((c) => c.id === coverId) || (app.coverLetter ? { id: coverId, content: app.coverLetter } : null),
            resume: resumes.find((r) => r.id === resumeId) || null,
            certificates: docs.filter((d) => certIds.includes(d.id)),
            photo: photoId
                ? (photos.find((ph) => ph.id === photoId) || (mobile ? { id: photoId, name: 'Bewerbungsfoto', dataUrl: 'data:,' } : null))
                : null
        };
    }

    renderPack(app, data) {
        const body = document.getElementById('packBody');
        if (!body) return;
        this.packClipboard = data.cover?.content || '';
        const tabs = [
            ['letter', 'Anschreiben', !!data.cover],
            ['resume', 'Lebenslauf', !!data.resume],
            ['certs', 'Zeugnisse', !!data.certificates.length],
            ['photo', 'Foto', !!data.photo]
        ];
        const first = tabs.find(([, , ok]) => ok)?.[0] || 'letter';
        body.innerHTML = `
            <nav class="js-pack-tabs" aria-label="Paketteile">
                ${tabs.map(([id, label, ok]) => `<button type="button" data-pack-tab="${id}" class="${id === first ? 'on' : ''}${ok ? '' : ' miss'}" ${ok ? '' : 'disabled'}>${label}</button>`).join('')}
            </nav>
            <div class="js-pack-panels">
                <article data-pack-panel="letter" ${first === 'letter' ? '' : 'hidden'}>
                    ${data.cover ? `
                        <div class="js-pack-actions">
                            <button type="button" class="js-btn small" data-act="copy"><i class="fas fa-copy"></i> Text kopieren</button>
                            ${data.cover.id ? `<a class="js-btn small" href="applications/cover-letter-editor.html?edit=${encodeURIComponent(data.cover.id)}" target="_blank" rel="noopener"><i class="fas fa-pen"></i> Bearbeiten</a>` : ''}
                        </div>
                        <pre class="js-letter">${this.esc(data.cover.content || '')}</pre>`
                        : '<div class="js-empty"><i class="fas fa-file-alt"></i>Kein Anschreiben verknüpft.</div>'}
                </article>
                <article data-pack-panel="resume" ${first === 'resume' ? '' : 'hidden'}>
                    ${data.resume ? this.resumeHtml(data.resume) : '<div class="js-empty"><i class="fas fa-id-card"></i>Kein Lebenslauf verknüpft.</div>'}
                </article>
                <article data-pack-panel="certs" ${first === 'certs' ? '' : 'hidden'}>
                    ${data.certificates.length ? `<ul class="js-cert-list">${data.certificates.map((c) => `
                        <li>
                            <div><b>${this.esc(c.name || c.fileName || 'Zeugnis')}</b><span>${this.esc(c.fileType || 'PDF')}</span></div>
                            ${c.url ? `<a class="js-btn small" href="${this.esc(c.url)}" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> Öffnen</a>
                            <a class="js-btn small" href="${this.esc(c.url)}" download="${this.esc(c.name || 'zeugnis.pdf')}"><i class="fas fa-download"></i> Laden</a>` : ''}
                        </li>`).join('')}</ul>`
                        : '<div class="js-empty"><i class="fas fa-award"></i>Keine Zeugnisse verknüpft.</div>'}
                </article>
                <article data-pack-panel="photo" ${first === 'photo' ? '' : 'hidden'}>
                    ${this.photoHtml(data.photo)}
                </article>
            </div>`;
    }

    photoHtml(photo) {
        if (!photo) return '<div class="js-empty"><i class="fas fa-camera"></i>Kein Foto verknüpft.</div>';
        const src = photo.url || photo.dataUrl || '';
        // Riesige Base64-Fotos / Handy: nicht einbetten, sonst knallt Safari.
        if (!photo.url && (this.isMobile() || (src.startsWith('data:') && src.length > 700000))) {
            return `<div class="js-empty"><i class="fas fa-camera"></i>Foto «${this.esc(photo.name || 'Bewerbungsfoto')}» ist hinterlegt.
                <div class="js-pack-actions" style="justify-content:center;margin-top:12px">
                    <a class="js-btn small" href="applications/dashboard.html#photos" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> Foto öffnen</a>
                </div></div>`;
        }
        return src && src !== 'data:,'
            ? `<img class="js-pack-photo" src="${this.esc(src)}" alt="${this.esc(photo.name || 'Bewerbungsfoto')}" loading="lazy">`
            : '<div class="js-empty"><i class="fas fa-camera"></i>Kein Foto verknüpft.</div>';
    }

    resumeHtml(r) {
        const pi = r.personalInfo || r;
        const name = `${pi.firstName || r.firstName || ''} ${pi.lastName || r.lastName || ''}`.trim() || r.name || 'Lebenslauf';
        const lines = [
            pi.title || r.title,
            pi.email || r.email,
            pi.phone || r.phone,
            pi.location || r.location || pi.address || r.address
        ].filter(Boolean);
        const summary = pi.summary || r.summary || '';
        return `
            <div class="js-resume-card">
                <h3>${this.esc(name)}</h3>
                ${lines.map((l) => `<p>${this.esc(l)}</p>`).join('')}
                ${summary ? `<div class="js-why">${this.esc(summary)}</div>` : ''}
                <p class="js-meta">Vollständigen Lebenslauf im Bewerbungsmanager bearbeiten oder als PDF exportieren.</p>
                <div class="js-pack-actions">
                    <a class="js-btn small" href="applications/dashboard.html#resume" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> Im Manager öffnen</a>
                </div>
            </div>`;
    }

    showPackTab(tab) {
        const root = document.getElementById('packBody');
        if (!root) return;
        root.querySelectorAll('[data-pack-tab]').forEach((b) => b.classList.toggle('on', b.dataset.packTab === tab));
        root.querySelectorAll('[data-pack-panel]').forEach((p) => { p.hidden = p.dataset.packPanel !== tab; });
    }

    async copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            window.JobSearch?.toast?.('Anschreiben kopiert', 'success');
        } catch {
            window.JobSearch?.toast?.('Kopieren nicht möglich', 'error');
        }
    }

    // ─────────────────────────────────────────────── Bewerbungsmanager (nur Desktop / neuer Tab)

    markManagerStale() {
        this.managerStale = true;
        const frame = document.getElementById('managerFrame');
        if (frame) frame.removeAttribute('src');
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
        // Auf dem Handy: schweres Dashboard nie im iframe – neuer Tab, sonst Absturz / Rauswurf zur Hauptwebsite.
        if (this.isMobile()) {
            this.shareSessionWithManager();
            const hash = applicationId ? 'tracking' : (tab || 'quick');
            window.open(`applications/dashboard.html#${hash}`, '_blank', 'noopener');
            window.JobSearch?.toast?.('Bewerbungsmanager in neuem Tab geöffnet (sicherer auf dem Handy).', 'info');
            return;
        }
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
            : `<span class="js-manager-ctx">Unterlagen pflegen: Lebenslauf, Zeugnisse, Fotos, Anschreiben. Auf dem Handy öffnet sich das immer in einem neuen Tab.</span>
               <a class="js-btn small" href="applications/dashboard.html" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> Manager öffnen</a>`;
    }

    // ─────────────────────────────────────────────── Daten

    endpoint(query = '') {
        return `${this.userDataBase()}/applications${query}`;
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
                   <span>${drafts ? 'Mappe öffnen, Anschreiben prüfen, über die Anzeige einreichen, dann als versendet markieren.' : 'Neue Pakete entstehen unter «Stellen finden».'}</span></div>
                   ${drafts ? '' : '<button type="button" class="js-btn small" data-pane="search"><i class="fas fa-search"></i> Stellen finden</button>'}`
                : `<i class="fas fa-bell"></i><div><b>${due ? `${due} Bewerbung${due === 1 ? '' : 'en'} zum Nachfassen` : `${active} laufende Bewerbung${active === 1 ? '' : 'en'}`}</b>
                   <span>Nach ${ApplicationsSection.FOLLOW_UP_DAYS} Tagen ohne Antwort lohnt sich eine kurze Nachfrage.</span></div>`;
            hint.classList.toggle('warn', this.filter !== 'draft' && due > 0);
        }

        const list = document.getElementById('applicationsList');
        if (!list) return;
        const shown = apps.filter((a) => this.filter === 'all' || this.statusOf(a) === this.filter);
        list.innerHTML = shown.length ? shown.map((a) => this.row(a)).join('')
            : `<div class="js-empty"><i class="fas fa-briefcase"></i>${apps.length ? 'In diesem Status gibt es keine Bewerbungen.' : 'Noch keine Bewerbungen. Starte unter «Stellen finden».'}</div>`;
        this.highlightId = null;
        if (this.pane === 'pack' && this.packApp) {
            const fresh = this.find(this.packApp.id);
            if (fresh) {
                this.packApp = fresh;
                const bar = document.getElementById('packBar');
                if (bar) {
                    const status = this.statusOf(fresh);
                    const sentBtn = bar.querySelector('[data-act=sent]');
                    const pill = bar.querySelector('.js-status-pill');
                    if (pill) { pill.className = `js-status-pill ${status}`; pill.textContent = ApplicationsSection.STATUS[status]; }
                    if (sentBtn && status !== 'draft') sentBtn.remove();
                }
            }
        }
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
                        ? `<button class="js-btn small primary" type="button" data-act="sent"><i class="fas fa-paper-plane"></i> Als versendet</button>`
                        : `<select data-act="status" aria-label="Status">${statuses.map(([k, v]) => `<option value="${k}"${k === status ? ' selected' : ''}>${v}</option>`).join('')}</select>`}
                    <div class="js-row-tools">
                        ${hasPortfolio ? `<button class="js-btn small" type="button" data-portfolio="${this.esc(a.id)}"><i class="fas fa-folder-open"></i> Mappe</button>` : ''}
                        ${a.coverLetterId ? `<a class="js-btn small" href="applications/cover-letter-editor.html?edit=${encodeURIComponent(a.coverLetterId)}" target="_blank" rel="noopener"><i class="fas fa-pen"></i> Text</a>` : ''}
                        <button class="js-btn small ghost" type="button" data-act="delete" title="Löschen"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>`;
    }

    async markSent(app) {
        if (!app) return;
        const now = new Date();
        try {
            await this.save(app, {
                status: 'pending', sentAt: now.toISOString(), date: now.toISOString().split('T')[0],
                notes: /noch nicht versendet/.test(app.notes || '') ? '' : app.notes
            });
            window.JobSearch?.toast?.(`«${app.position}» als versendet markiert.`, 'success');
            if (this.pane === 'pack') {
                this.filter = 'pending';
                this.activatePane('follow');
            }
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
            if (this.packApp?.id === app.id) this.showPane(this.returnPane);
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
