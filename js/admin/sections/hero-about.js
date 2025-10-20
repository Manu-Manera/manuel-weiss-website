/**
 * Hero & Über mich Section
 */
class HeroAboutSection {
    constructor() {
        this.storageKey = 'adminProfileData';
    }

    init() {
        this.cacheEls();
        this.loadFromStorage();
        this.attachEvents();
        console.log('HeroAbout Section initialized');
    }

    cacheEls() {
        this.els = {
            name: document.getElementById('heroName'),
            title: document.getElementById('heroTitle'),
            subtitle: document.getElementById('heroSubtitle'),
            email: document.getElementById('heroEmail'),
            phone: document.getElementById('heroPhone'),
            location: document.getElementById('heroLocation'),
            stat1Number: document.getElementById('stat1Number'),
            stat1Label: document.getElementById('stat1Label'),
            stat2Number: document.getElementById('stat2Number'),
            stat2Label: document.getElementById('stat2Label'),
            stat3Number: document.getElementById('stat3Number'),
            stat3Label: document.getElementById('stat3Label'),
            saveBtn: document.getElementById('heroSaveBtn'),
            applyBtn: document.getElementById('heroApplyBtn'),
            resetBtn: document.getElementById('heroResetBtn')
        };
    }

    attachEvents() {
        this.els.saveBtn?.addEventListener('click', () => this.save());
        this.els.applyBtn?.addEventListener('click', () => this.applyToWebsite());
        this.els.resetBtn?.addEventListener('click', () => this.reset());
    }

    loadFromStorage() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return;
            const data = JSON.parse(raw);
            Object.entries(this.els).forEach(([key, el]) => {
                if (el && key in data) {
                    el.value = data[key] || '';
                }
            });
        } catch (e) {
            console.error('HeroAbout load error', e);
        }
    }

    getFormData() {
        const get = (el) => (el ? el.value?.trim() : '');
        return {
            name: get(this.els.name),
            title: get(this.els.title),
            subtitle: get(this.els.subtitle),
            email: get(this.els.email),
            phone: get(this.els.phone),
            location: get(this.els.location),
            stat1Number: get(this.els.stat1Number),
            stat1Label: get(this.els.stat1Label),
            stat2Number: get(this.els.stat2Number),
            stat2Label: get(this.els.stat2Label),
            stat3Number: get(this.els.stat3Number),
            stat3Label: get(this.els.stat3Label)
        };
    }

    save() {
        try {
            const data = this.getFormData();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.toast('Gespeichert');
            // trigger website sync immediately if available
            if (window.loadWebsiteDataFromLocalStorage) {
                window.loadWebsiteDataFromLocalStorage();
            }
        } catch (e) {
            console.error('HeroAbout save error', e);
            this.toast('Fehler beim Speichern', 'error');
        }
    }

    applyToWebsite() {
        this.save();
        
        // Direkte Website-Sync aufrufen
        if (window.loadWebsiteDataFromLocalStorage) {
            window.loadWebsiteDataFromLocalStorage();
            this.toast('Auf Website angewendet');
        } else {
            // Fallback: Storage Event triggern
            window.dispatchEvent(new StorageEvent('storage', {
                key: this.storageKey,
                newValue: localStorage.getItem(this.storageKey)
            }));
            this.toast('Daten gespeichert - Website wird aktualisiert');
        }
    }

    reset() {
        localStorage.removeItem(this.storageKey);
        Object.values(this.els).forEach((el) => {
            if (el && 'value' in el) el.value = '';
        });
        this.toast('Zurückgesetzt');
    }

    toast(msg, type = 'success') {
        try {
            const t = document.createElement('div');
            t.className = `toast toast-${type}`;
            t.style.cssText = 'position:fixed;right:1rem;bottom:1rem;background:#111;color:#fff;padding:.75rem 1rem;border-radius:8px;z-index:9999;opacity:0;transition:opacity .2s';
            t.textContent = msg;
            document.body.appendChild(t);
            requestAnimationFrame(() => (t.style.opacity = '1'));
            setTimeout(() => {
                t.style.opacity = '0';
                setTimeout(() => t.remove(), 200);
            }, 2000);
        } catch {}
    }
}

// Global
window.HeroAboutSection = HeroAboutSection;

