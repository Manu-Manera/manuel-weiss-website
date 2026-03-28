/**
 * Admin: Blüten-/Schneeflocken-Highscores inkl. optionaler E-Mails (nur mit Admin-Header)
 */
class PetalHighscoresSection {
    constructor() {
        this.storageKey = 'petal_highscore_admin_secret';
    }

    apiUrl() {
        const base = window.AWS_APP_CONFIG?.API_BASE || 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
        return `${base.replace(/\/$/, '')}/snowflake-highscores`;
    }

    getSecret() {
        try {
            return sessionStorage.getItem(this.storageKey) || '';
        } catch {
            return '';
        }
    }

    setSecret(v) {
        try {
            sessionStorage.setItem(this.storageKey, v || '');
        } catch (e) {
            console.warn('sessionStorage:', e);
        }
    }

    init() {
        const input = document.getElementById('petalHighscoreAdminSecret');
        const saveBtn = document.getElementById('petalHighscoreSaveSecret');
        const loadBtn = document.getElementById('petalHighscoreLoadBtn');
        const status = document.getElementById('petalHighscoreStatus');

        if (!input || !loadBtn) return;

        input.value = this.getSecret();

        saveBtn?.addEventListener('click', () => {
            this.setSecret(input.value.trim());
            if (status) {
                status.textContent = 'Geheimnis für diese Browser-Sitzung gespeichert.';
                status.style.color = '#059669';
            }
        });

        loadBtn.addEventListener('click', () => this.loadList());

        setTimeout(() => this.loadList(), 200);
    }

    async loadList() {
        const tbody = document.getElementById('petalHighscoreAdminBody');
        const status = document.getElementById('petalHighscoreStatus');
        const inputEl = document.getElementById('petalHighscoreAdminSecret');
        const secret = ((inputEl && inputEl.value) ? inputEl.value : this.getSecret()).trim();

        if (!tbody) return;

        if (secret.length < 8) {
            tbody.innerHTML = '<tr><td colspan="5" style="padding: 1rem; color: #94a3b8;">Bitte zuerst das Admin-Geheimnis setzen und speichern.</td></tr>';
            if (status) {
                status.textContent = 'Kein oder zu kurzes Geheimnis (mindestens 8 Zeichen, wie in Lambda HIGHSCORE_ADMIN_SECRET).';
                status.style.color = '#b45309';
            }
            return;
        }

        if (status) {
            status.textContent = 'Lade…';
            status.style.color = '#64748b';
        }

        try {
            const res = await fetch(this.apiUrl(), {
                method: 'GET',
                headers: {
                    'X-Admin-Highscore-Secret': secret
                }
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || data.error || `HTTP ${res.status}`);
            }

            if (!data.adminView) {
                throw new Error('API liefert keine Admin-Ansicht – prüfe HIGHSCORE_ADMIN_SECRET in Lambda und ob es exakt übereinstimmt.');
            }

            const list = Array.isArray(data.highscores) ? data.highscores : [];
            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="padding: 1rem; color: #94a3b8;">Keine Einträge.</td></tr>';
            } else {
                tbody.innerHTML = list
                    .map(
                        (row, i) => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 0.6rem 0.5rem;">${i + 1}</td>
                        <td style="padding: 0.6rem 0.5rem;">${escapeHtml(row.name || '')}</td>
                        <td style="padding: 0.6rem 0.5rem;">${Number(row.score) || 0}</td>
                        <td style="padding: 0.6rem 0.5rem;">${escapeHtml(row.date || '')}</td>
                        <td style="padding: 0.6rem 0.5rem; word-break: break-all;">${escapeHtml(row.email || '—')}</td>
                    </tr>`
                    )
                    .join('');
            }

            if (status) {
                status.textContent = `${list.length} Einträge geladen.`;
                status.style.color = '#059669';
            }
        } catch (e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 1rem; color: #dc2626;">Fehler: ${escapeHtml(e.message || String(e))}</td></tr>`;
            if (status) {
                status.textContent = 'Laden fehlgeschlagen.';
                status.style.color = '#dc2626';
            }
        }
    }
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

window.PetalHighscoresSection = PetalHighscoresSection;
