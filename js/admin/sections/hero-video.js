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
        // Mehrere Versuche mit steigenden Delays, da dynamisch geladenes HTML Zeit braucht
        const tryInit = (attempt = 0) => {
            const maxAttempts = 5;
            const delay = attempt * 100; // 0ms, 100ms, 200ms, 300ms, 400ms
            
            setTimeout(() => {
                try {
                    const fileInput = document.getElementById('videoFileInput');
                    const uploadBtn = document.getElementById('uploadVideoBtn');
                    
                    if (fileInput && uploadBtn) {
                        console.log('✅ HeroVideoSection: DOM-Elemente gefunden, initialisiere Handler');
                        this.initializeHandlers();
                    } else if (attempt < maxAttempts) {
                        console.log(`⏳ HeroVideoSection: Warte auf DOM-Elemente (Versuch ${attempt + 1}/${maxAttempts})`);
                        tryInit(attempt + 1);
                    } else {
                        console.error('❌ HeroVideoSection: DOM-Elemente nach mehreren Versuchen nicht gefunden');
                    }
                } catch (e) {
                    console.error('Error initializing HeroVideoSection handlers:', e);
                    if (attempt < maxAttempts) {
                        tryInit(attempt + 1);
                    }
                }
            }, delay);
        };
        
        tryInit();
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

        console.log('🔗 HeroVideoSection: Binde Event-Listener');

        // Entferne alte Event-Listener (falls vorhanden) und binde neue
        const newFileInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);
        
        const newUploadBtn = uploadBtn.cloneNode(true);
        uploadBtn.parentNode.replaceChild(newUploadBtn, uploadBtn);

        // Datei-Auswahl: Vorschau + Button aktivieren
        newFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            console.log('📁 HeroVideoSection: Datei ausgewählt:', file.name);
            if (preview && previewContainer) {
                preview.src = URL.createObjectURL(file);
                previewContainer.style.display = 'block';
            }
            newUploadBtn.disabled = false;
        });

        // Upload-Handler binden
        newUploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚀 HeroVideoSection: Upload-Button geklickt');
            this.uploadVideo();
        });

        // Aktuelles Video laden
        this.loadCurrentVideo();
        
        console.log('✅ HeroVideoSection: Event-Listener erfolgreich gebunden');
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
            
            if (!uploadUrl || !publicUrl) {
                throw new Error('Ungültige Upload-URL erhalten');
            }

            // Schritt 2: Upload zu S3 mit XMLHttpRequest (besser für große Dateien und Progress-Tracking)
            if (progressStatus) progressStatus.textContent = 'Lade Video hoch...';
            if (progressFill) progressFill.style.width = '30%';
            if (progressPercentage) progressPercentage.textContent = '30%';

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                // Progress-Tracking
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        // 30% bis 80% für den Upload (30% war bereits Vorbereitung)
                        const uploadPercent = 30 + (e.loaded / e.total) * 50;
                        if (progressFill) progressFill.style.width = `${uploadPercent}%`;
                        if (progressPercentage) progressPercentage.textContent = `${Math.round(uploadPercent)}%`;
                    }
                });
                
                // Erfolg
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('✅ Video erfolgreich zu S3 hochgeladen');
                        resolve();
                    } else {
                        const errorMsg = `S3 Upload fehlgeschlagen: ${xhr.status} ${xhr.statusText}`;
                        console.error('❌', errorMsg);
                        console.error('Response:', xhr.responseText);
                        console.error('Response Headers:', xhr.getAllResponseHeaders());
                        reject(new Error(errorMsg));
                    }
                });
                
                // Fehler
                xhr.addEventListener('error', (e) => {
                    console.error('❌ Netzwerkfehler beim S3 Upload:', e);
                    console.error('Upload URL (erste 100 Zeichen):', uploadUrl.substring(0, 100) + '...');
                    console.error('File size:', file.size, 'bytes');
                    console.error('File type:', file.type);
                    
                    // Detaillierte Fehlermeldung mit Lösungshinweis
                    const errorMsg = 'Netzwerkfehler beim Hochladen des Videos. ' +
                        'Dies deutet auf ein CORS-Problem hin. ' +
                        'Bitte prüfe die S3-Bucket CORS-Konfiguration (siehe S3_CORS_FIX.md). ' +
                        'Die Origin muss in den AllowedOrigins enthalten sein.';
                    reject(new Error(errorMsg));
                });
                
                xhr.addEventListener('abort', () => {
                    console.error('❌ Upload abgebrochen');
                    reject(new Error('Upload wurde abgebrochen'));
                });
                
                // Upload starten
                console.log('🚀 Starte S3 Upload zu:', uploadUrl.substring(0, 100) + '...');
                console.log('📦 File:', file.name, 'Size:', file.size, 'Type:', file.type);
                
                xhr.open('PUT', uploadUrl);
                // Nur Content-Type setzen, keine anderen Header (können CORS-Probleme verursachen)
                xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
                xhr.send(file);
            });

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
            console.error('❌ Upload error:', error);
            
            // Detaillierte Fehlermeldung
            let errorMessage = 'Fehler beim Hochladen: ';
            if (error.message) {
                errorMessage += error.message;
            } else if (error.toString) {
                errorMessage += error.toString();
            } else {
                errorMessage += 'Unbekannter Fehler';
            }
            
            // Zeige Fehler in der UI
            if (progressStatus) {
                progressStatus.textContent = 'Fehler!';
                progressStatus.style.color = '#ef4444';
            }
            
            alert(errorMessage);
            
            if (uploadProgress) uploadProgress.style.display = 'none';
            if (uploadBtn) uploadBtn.disabled = false;
            
            // Reset Progress
            if (progressFill) progressFill.style.width = '0%';
            if (progressPercentage) progressPercentage.textContent = '0%';
            if (progressStatus) {
                progressStatus.textContent = 'Vorbereitung...';
                progressStatus.style.color = '';
            }
        }
    }
}

// Export für AdminApp
if (typeof window !== 'undefined') {
    window.HeroVideoSection = HeroVideoSection;
}

