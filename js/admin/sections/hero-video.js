/**
 * Admin Section: Hero Video
 * Verwaltung des Hero-Videos auf der Startseite
 */

class HeroVideoSection {
    constructor() {
        this.sectionId = 'hero-video';
        this.sectionPath = 'admin/sections/hero-video.html';
    }

    async load() {
        try {
            const response = await fetch(this.sectionPath);
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading hero-video section:', error);
            return '<div class="error">Fehler beim Laden der Hero-Video Sektion</div>';
        }
    }

    async init() {
        // Warten bis DOM der Section gerendert ist
        setTimeout(() => {
            try {
                this.initializeHandlers();
            } catch (e) {
                console.error('Error initializing HeroVideoSection handlers:', e);
            }
        }, 0);
    }

    initializeHandlers() {
        const fileInput = document.getElementById('videoFileInput');
        const preview = document.getElementById('videoPreview');
        const previewContainer = document.getElementById('videoPreviewContainer');
        const uploadBtn = document.getElementById('uploadVideoBtn');

        if (!fileInput || !uploadBtn) {
            console.warn('HeroVideoSection: Elemente nicht gefunden, init übersprungen');
            return;
        }

        // Datei-Auswahl: Vorschau + Button aktivieren
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (preview && previewContainer) {
                preview.src = URL.createObjectURL(file);
                previewContainer.style.display = 'block';
            }
            uploadBtn.disabled = false;
        });

        // Upload-Handler binden
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.uploadVideo();
        });

        // Aktuelles Video laden
        this.loadCurrentVideo();
    }

    async loadCurrentVideo() {
        try {
            const response = await fetch('/.netlify/functions/hero-video-settings');
            const data = await response.json();

            const infoP = document.getElementById('currentVideoInfo');
            const previewDiv = document.getElementById('currentVideoPreview');

            if (!infoP || !previewDiv) return;

            if (data.videoUrl) {
                infoP.textContent = `Aktuell aktiv: ${new URL(data.videoUrl).pathname.split('/').pop()}`;
                if (data.updatedAt) {
                    infoP.textContent += ` (Aktualisiert: ${new Date(data.updatedAt).toLocaleString('de-DE')})`;
                }

                previewDiv.innerHTML = `
                    <video controls style="width: 100%; max-width: 600px; border-radius: 8px; background: #000;">
                        <source src="${data.videoUrl}" type="video/mp4">
                    </video>
                `;
            } else {
                infoP.textContent = 'Kein Video aktiv. Bitte ein Video hochladen.';
                previewDiv.innerHTML = '<p style="opacity: 0.8;">Keine Vorschau verfügbar</p>';
            }
        } catch (error) {
            console.error('Error loading current video:', error);
            const infoP = document.getElementById('currentVideoInfo');
            if (infoP) infoP.textContent = 'Fehler beim Laden des Status';
        }
    }

    async uploadVideo() {
        const fileInput = document.getElementById('videoFileInput');
        const file = fileInput?.files?.[0];

        if (!file) {
            alert('Bitte wähle zuerst eine Video-Datei aus.');
            return;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB
            alert('Die Datei ist zu groß. Maximal 100MB erlaubt.');
            return;
        }

        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressStatus = document.getElementById('progress-status');
        const uploadBtn = document.getElementById('uploadVideoBtn');
        const successMessage = document.getElementById('successMessage');

        if (uploadProgress) uploadProgress.style.display = 'block';
        if (uploadBtn) uploadBtn.disabled = true;
        if (successMessage) successMessage.style.display = 'none';

        try {
            // Schritt 1: Presigned URL holen
            if (progressStatus) progressStatus.textContent = 'Vorbereitung...';
            if (progressFill) progressFill.style.width = '10%';
            if (progressPercentage) progressPercentage.textContent = '10%';

            const uploadUrlResponse = await fetch('/.netlify/functions/hero-video-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type || 'video/mp4'
                })
            });

            if (!uploadUrlResponse.ok) {
                throw new Error('Fehler beim Generieren der Upload-URL');
            }

            const { uploadUrl, publicUrl } = await uploadUrlResponse.json();

            // Schritt 2: Upload zu S3
            if (progressStatus) progressStatus.textContent = 'Lade Video hoch...';
            if (progressFill) progressFill.style.width = '30%';
            if (progressPercentage) progressPercentage.textContent = '30%';

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type || 'video/mp4'
                }
            });

            if (!uploadResponse.ok) {
                throw new Error('Fehler beim Hochladen des Videos');
            }

            // Schritt 3: URL speichern
            if (progressStatus) progressStatus.textContent = 'Speichere Einstellung...';
            if (progressFill) progressFill.style.width = '80%';
            if (progressPercentage) progressPercentage.textContent = '80%';

            const settingsResponse = await fetch('/.netlify/functions/hero-video-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl: publicUrl })
            });

            if (!settingsResponse.ok) {
                throw new Error('Fehler beim Speichern der Einstellung');
            }

            if (progressFill) progressFill.style.width = '100%';
            if (progressPercentage) progressPercentage.textContent = '100%';
            if (progressStatus) progressStatus.textContent = 'Fertig!';

            setTimeout(() => {
                if (uploadProgress) uploadProgress.style.display = 'none';
                if (successMessage) successMessage.style.display = 'block';
                if (uploadBtn) uploadBtn.disabled = false;
                if (fileInput) fileInput.value = '';
                const previewContainer = document.getElementById('videoPreviewContainer');
                if (previewContainer) previewContainer.style.display = 'none';
                this.loadCurrentVideo();
            }, 1000);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Fehler beim Hochladen: ' + error.message);
            if (uploadProgress) uploadProgress.style.display = 'none';
            if (uploadBtn) uploadBtn.disabled = false;
        }
    }
}

// Export für AdminApp
if (typeof window !== 'undefined') {
    window.HeroVideoSection = HeroVideoSection;
}

