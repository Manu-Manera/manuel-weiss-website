/**
 * Admin Section: BPMN Generator (GPT 5.2)
 * Generiert BPMN 2.0 XML aus Prozessbeschreibung per POST /text-to-bpmn-gpt
 */

class BpmnGeneratorSection {
    constructor() {
        this.sectionId = 'bpmn-generator';
        this.sectionPath = 'admin/sections/bpmn-generator.html';
        this.currentBpmnXml = null;
    }

    async load() {
        try {
            const response = await fetch(this.sectionPath);
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading bpmn-generator section:', error);
            return '<div class="error">Fehler beim Laden der BPMN-Generator Sektion</div>';
        }
    }

    async init() {
        const tryInit = (attempt = 0) => {
            const maxAttempts = 5;
            const delay = attempt * 100;
            setTimeout(() => {
                const generateBtn = document.getElementById('bpmn-generate-btn');
                const copyBtn = document.getElementById('bpmn-copy-btn');
                const downloadBtn = document.getElementById('bpmn-download-btn');
                const openDemoBtn = document.getElementById('bpmn-open-demo-btn');
                if (generateBtn) {
                    this.initializeHandlers();
                } else if (attempt < maxAttempts) {
                    tryInit(attempt + 1);
                }
            }, delay);
        };
        tryInit();
    }

    initializeHandlers() {
        const generateBtn = document.getElementById('bpmn-generate-btn');
        const copyBtn = document.getElementById('bpmn-copy-btn');
        const downloadBtn = document.getElementById('bpmn-download-btn');
        const openDemoBtn = document.getElementById('bpmn-open-demo-btn');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateBpmn());
        }
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyXml());
        }
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadBpmn());
        }
        if (openDemoBtn) {
            openDemoBtn.addEventListener('click', () => this.openInDemoBpmnIo());
        }
    }

    setStatus(text) {
        const el = document.getElementById('bpmn-status');
        if (el) el.textContent = text;
    }

    setBusy(busy) {
        const btn = document.getElementById('bpmn-generate-btn');
        const status = document.getElementById('bpmn-status');
        if (btn) {
            btn.disabled = busy;
            btn.innerHTML = busy ? '<i class="fas fa-spinner fa-spin"></i> Generiere…' : '<i class="fas fa-magic"></i> BPMN mit GPT 5.2 generieren';
        }
        if (status && !busy) status.textContent = '';
    }

    showResult(xml) {
        this.currentBpmnXml = xml;
        const area = document.getElementById('bpmn-result-area');
        const pre = document.getElementById('bpmn-xml-output');
        const err = document.getElementById('bpmn-error');
        if (area) area.style.display = 'block';
        if (pre) pre.textContent = xml;
        if (err) { err.style.display = 'none'; err.textContent = ''; }
    }

    showError(message) {
        const area = document.getElementById('bpmn-result-area');
        const err = document.getElementById('bpmn-error');
        if (area) area.style.display = 'none';
        if (err) {
            err.style.display = 'block';
            err.textContent = message;
        }
    }

    async generateBpmn() {
        const textarea = document.getElementById('bpmn-process-text');
        const text = (textarea && textarea.value || '').trim();
        if (!text) {
            this.showError('Bitte eine Prozessbeschreibung eingeben.');
            return;
        }

        let openaiApiKey = '';
        if (window.awsAPISettings && typeof window.awsAPISettings.getFullApiKey === 'function') {
            try {
                const key = await window.awsAPISettings.getFullApiKey('openai');
                if (key && typeof key === 'string' && key.length > 10) {
                    openaiApiKey = key;
                }
            } catch (e) {
                console.warn('OpenAI-Key konnte nicht geladen werden, API verwendet Fallback-Template:', e);
            }
        }

        const apiUrl = window.getApiUrl ? window.getApiUrl('TEXT_TO_BPMN_GPT') : (window.AWS_APP_CONFIG && window.AWS_APP_CONFIG.API_BASE ? window.AWS_APP_CONFIG.API_BASE + '/text-to-bpmn-gpt' : '');
        if (!apiUrl) {
            this.showError('API-URL ist nicht konfiguriert (getApiUrl oder AWS_APP_CONFIG.API_BASE).');
            return;
        }

        this.setBusy(true);
        this.setStatus('Rufe API auf…');

        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, openaiApiKey })
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                this.showError(data.error || res.statusText || 'Unbekannter Fehler');
                return;
            }
            if (data.success && data.bpmnXml) {
                this.showResult(data.bpmnXml);
            } else {
                this.showError(data.error || 'Kein BPMN-XML in der Antwort.');
            }
        } catch (e) {
            this.showError(e.message || 'Netzwerk- oder Fehler beim Aufruf.');
        } finally {
            this.setBusy(false);
        }
    }

    copyXml() {
        if (!this.currentBpmnXml) return;
        navigator.clipboard.writeText(this.currentBpmnXml).then(() => {
            this.setStatus('In Zwischenablage kopiert.');
            setTimeout(() => this.setStatus(''), 2000);
        }).catch(() => this.showError('Kopieren fehlgeschlagen.'));
    }

    downloadBpmn() {
        if (!this.currentBpmnXml) return;
        const blob = new Blob([this.currentBpmnXml], { type: 'application/xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'prozess.bpmn';
        a.click();
        URL.revokeObjectURL(a.href);
        this.setStatus('Download gestartet.');
        setTimeout(() => this.setStatus(''), 2000);
    }

    openInDemoBpmnIo() {
        if (!this.currentBpmnXml) return;
        navigator.clipboard.writeText(this.currentBpmnXml).then(() => {
            window.open('https://demo.bpmn.io/new', '_blank');
            this.setStatus('XML kopiert. In demo.bpmn.io mit Strg+V einfügen.');
            setTimeout(() => this.setStatus(''), 4000);
        }).catch(() => this.showError('Kopieren fehlgeschlagen.'));
    }
}

// Für dynamisches Laden: Section-Objekt bereitstellen
if (typeof window !== 'undefined') {
    window.BpmnGeneratorSection = BpmnGeneratorSection;
}
