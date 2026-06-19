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

    /**
     * Helper: Auth-Token für API-Calls holen
     */
    /**
     * DynamoDB ist Source of Truth; Startseite liest zusätzlich /config/hero-video.json (S3).
     * Nach Upload: deploy-aws-website.sh oder scripts/sync-hero-video-config.sh ausführen.
     */
    async syncPublicHeroVideoConfig(videoUrl) {
        console.info(
            'ℹ️ Hero-Video in DynamoDB gespeichert. Für die Startseite:',
            'scripts/sync-hero-video-config.sh oder ./deploy-aws-website.sh'
        );
        const hint = document.getElementById('heroVideoDeployHint');
        if (hint) {
            hint.textContent =
                'Für die Live-Startseite bitte deploy-aws-website.sh oder scripts/sync-hero-video-config.sh ausführen.';
            hint.style.display = 'block';
        }
        void videoUrl;
    }

    async getAuthToken() {
        // 1. Versuche awsAPISettings
        if (window.awsAPISettings && typeof window.awsAPISettings.getAuthToken === 'function') {
            try {
                return await window.awsAPISettings.getAuthToken();
            } catch (e) {
                console.warn('⚠️ awsAPISettings.getAuthToken failed:', e);
            }
        }
        
        // 2. Versuche GlobalAuth
        if (window.GlobalAuth?.getCurrentUser()?.idToken) {
            return window.GlobalAuth.getCurrentUser().idToken;
        }
        
        // 3. Versuche admin_auth_session
        const adminSession = localStorage.getItem('admin_auth_session');
        if (adminSession) {
            try {
                const session = JSON.parse(adminSession);
                if (session.user?.idToken) return session.user.idToken;
                if (session.user?.accessToken) return session.user.accessToken;
            } catch (e) {
                console.warn('⚠️ Error parsing admin_auth_session:', e);
            }
        }
        
        // 4. Fallback: aws_auth_session
        const session = localStorage.getItem('aws_auth_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (parsed.idToken) return parsed.idToken;
            } catch (e) {
                console.warn('⚠️ Error parsing aws_auth_session:', e);
            }
        }
        
        throw new Error('Kein gültiges Auth-Token gefunden');
    }

    async loadCurrentVideo() {
        try {
            const apiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_SETTINGS') : (window.AWS_APP_CONFIG?.API_BASE ? window.AWS_APP_CONFIG.API_BASE + '/hero-video-settings' : '');
            const token = await this.getAuthToken();
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Nicht autorisiert. Bitte erneut anmelden.');
                }
                throw new Error(`Fehler beim Laden: ${response.status} ${response.statusText}`);
            }
            
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

        // Strategie: Versuche zuerst direkten S3-Upload (schneller, kein 6MB Limit)
        // Falls das fehlschlägt, verwende Server-Side Upload als Fallback
        
        let publicUrl = null; // Deklariere und initialisiere außerhalb des try-Blocks
        
        try {
            if (progressStatus) progressStatus.textContent = 'Vorbereitung...';
            if (progressFill) progressFill.style.width = '10%';
            if (progressPercentage) progressPercentage.textContent = '10%';
            const fileSizeMB = file.size / 1024 / 1024;
            const useDirectUpload = fileSizeMB < 50; // Für Videos < 50MB: Direkter Upload

            if (useDirectUpload) {
                // Methode 1: Direkter S3-Upload mit Pre-Signed URL
                console.log('🚀 Versuche direkten S3-Upload (Pre-Signed URL)...');
                
                // Schritt 1: Hole Pre-Signed URL
                const uploadApiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_UPLOAD') : (window.AWS_APP_CONFIG?.API_BASE ? window.AWS_APP_CONFIG.API_BASE + '/hero-video-upload' : '');
                const token = await this.getAuthToken();
                const uploadUrlResponse = await fetch(uploadApiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        contentType: file.type || 'video/mp4'
                    })
                });

                if (!uploadUrlResponse.ok) {
                    const errorData = await uploadUrlResponse.json().catch(() => ({ error: 'Unknown error' }));
                    console.error('❌ Fehler beim Generieren der Pre-Signed URL:', errorData);
                    throw new Error(errorData.message || errorData.error || 'Fehler beim Generieren der Upload-URL');
                }

                const urlData = await uploadUrlResponse.json();
                const { uploadUrl, publicUrl: preSignedPublicUrl } = urlData;
                
                if (!uploadUrl || !preSignedPublicUrl) {
                    console.error('❌ Ungültige Upload-URL erhalten:', urlData);
                    throw new Error('Ungültige Upload-URL erhalten');
                }

                // Schritt 2: Upload zu S3
                if (progressStatus) progressStatus.textContent = 'Lade Video hoch...';
                if (progressFill) progressFill.style.width = '30%';
                if (progressPercentage) progressPercentage.textContent = '30%';

                try {
                    await new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        
                        xhr.upload.addEventListener('progress', (e) => {
                            if (e.lengthComputable) {
                                const uploadPercent = 30 + (e.loaded / e.total) * 50;
                                if (progressFill) progressFill.style.width = `${uploadPercent}%`;
                                if (progressPercentage) progressPercentage.textContent = `${Math.round(uploadPercent)}%`;
                            }
                        });
                        
                        xhr.addEventListener('load', () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                console.log('✅ Video erfolgreich zu S3 hochgeladen (direkt)');
                                resolve();
                            } else {
                                reject(new Error(`S3 Upload fehlgeschlagen: ${xhr.status} ${xhr.statusText}`));
                            }
                        });
                        
                        xhr.addEventListener('error', () => {
                            reject(new Error('Netzwerkfehler beim S3 Upload'));
                        });
                        
                        xhr.open('PUT', uploadUrl);
                        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
                        xhr.send(file);
                    });

                    publicUrl = preSignedPublicUrl;
                    console.log('✅ publicUrl gesetzt (direkter Upload):', publicUrl);

                    // Schritt 3: Speichere URL in Settings
                    if (progressStatus) progressStatus.textContent = 'Speichere Einstellung...';
                    if (progressFill) progressFill.style.width = '80%';
                    if (progressPercentage) progressPercentage.textContent = '80%';

                    if (!publicUrl) {
                        throw new Error('publicUrl wurde nicht gesetzt');
                    }

                    const settingsApiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_SETTINGS') : (window.AWS_APP_CONFIG?.API_BASE ? window.AWS_APP_CONFIG.API_BASE + '/hero-video-settings' : '');
                    const settingsToken = await this.getAuthToken();
                    const settingsResponse = await fetch(settingsApiUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${settingsToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ videoUrl: publicUrl })
                    });

                    if (!settingsResponse.ok) {
                        throw new Error('Fehler beim Speichern der Einstellung');
                    }

                    await this.syncPublicHeroVideoConfig(publicUrl);

                } catch (directUploadError) {
                    console.warn('⚠️ Direkter S3-Upload fehlgeschlagen, versuche Server-Side Upload:', directUploadError);
                    // Fallback zu Server-Side Upload
                    throw new Error('FALLBACK_TO_SERVER');
                }
            } else {
                // Methode 2: Server-Side Upload für große Videos
                console.log('📦 Video zu groß für direkten Upload, verwende Server-Side Upload...');
                throw new Error('FALLBACK_TO_SERVER');
            }

            // Erfolg!
            if (progressStatus) progressStatus.textContent = 'Fertig!';
            if (progressFill) progressFill.style.width = '100%';
            if (progressPercentage) progressPercentage.textContent = '100%';

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
            
            // Fallback zu Server-Side Upload, falls direkter Upload fehlgeschlagen ist
            if (error.message === 'FALLBACK_TO_SERVER') {
                console.log('🔄 Wechsle zu Server-Side Upload...');
                try {
                    // Server-Side Upload: Konvertiere File zu Base64
                    if (progressStatus) progressStatus.textContent = 'Vorbereitung (Base64-Kodierung)...';
                    if (progressFill) progressFill.style.width = '10%';
                    if (progressPercentage) progressPercentage.textContent = '10%';

                    console.log('📦 Konvertiere File zu Base64...', file.name, file.size, 'bytes');
                    const fileData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            try {
                                const base64 = reader.result.split(',')[1];
                                if (!base64) {
                                    reject(new Error('Fehler beim Konvertieren zu Base64: Keine Daten erhalten'));
                                    return;
                                }
                                console.log('✅ Base64-Konvertierung erfolgreich, Länge:', base64.length);
                                resolve(base64);
                            } catch (error) {
                                reject(new Error('Fehler beim Konvertieren zu Base64: ' + error.message));
                            }
                        };
                        reader.onerror = (error) => {
                            console.error('❌ FileReader Fehler:', error);
                            reject(new Error('Fehler beim Lesen der Datei: ' + error.message));
                        };
                        reader.readAsDataURL(file);
                    });

                    // Prüfe Größe (Lambda Payload-Limit)
                    const base64SizeInBytes = (fileData.length * 3) / 4;
                    const NETLIFY_FUNCTION_PAYLOAD_LIMIT = 6 * 1024 * 1024; // 6MB
                    if (base64SizeInBytes > NETLIFY_FUNCTION_PAYLOAD_LIMIT) {
                        throw new Error(`Die Datei ist nach Base64-Kodierung zu groß (${(base64SizeInBytes / 1024 / 1024).toFixed(2)}MB). Max. Payload 6MB. Bitte komprimiere das Video oder wähle ein kleineres.`);
                    }

                    // Upload zu S3 über Server
                    if (progressStatus) progressStatus.textContent = 'Lade Video über Server hoch...';
                    if (progressFill) progressFill.style.width = '30%';
                    if (progressPercentage) progressPercentage.textContent = '30%';

                    const directUploadApiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_UPLOAD_DIRECT') : (window.AWS_APP_CONFIG?.API_BASE ? window.AWS_APP_CONFIG.API_BASE + '/hero-video-upload-direct' : '');
                    const directUploadToken = await this.getAuthToken();
                    const uploadResponse = await fetch(directUploadApiUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${directUploadToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            fileData: fileData,
                            fileName: file.name,
                            contentType: file.type || 'video/mp4'
                        })
                    });

                    console.log('📥 Server-Side Upload Response Status:', uploadResponse.status, uploadResponse.statusText);

                    if (!uploadResponse.ok) {
                        let errorBody;
                        try {
                            const errorText = await uploadResponse.text();
                            console.error('❌ Error Response Body:', errorText);
                            errorBody = JSON.parse(errorText);
                        } catch (parseError) {
                            console.error('❌ Fehler beim Parsen der Error-Response:', parseError);
                            errorBody = { message: `Upload fehlgeschlagen: ${uploadResponse.status} ${uploadResponse.statusText}` };
                        }
                        throw new Error(errorBody.message || errorBody.error || `Upload fehlgeschlagen: ${uploadResponse.status}`);
                    }

                    const result = await uploadResponse.json();
                    console.log('✅ Server-Side Upload Result:', result);
                    publicUrl = result.videoUrl;
                    
                    if (!publicUrl) {
                        console.error('❌ Keine Video-URL im Result:', result);
                        throw new Error('Keine Video-URL vom Server erhalten');
                    }

                    // WICHTIG: Speichere URL auch manuell in Settings, falls DynamoDB-Speicherung fehlgeschlagen ist
                    console.log('💾 Speichere Video-URL in Settings...');
                    try {
                        const saveSettingsApiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_SETTINGS') : (window.AWS_APP_CONFIG?.API_BASE ? window.AWS_APP_CONFIG.API_BASE + '/hero-video-settings' : '');
                        const saveSettingsToken = await this.getAuthToken();
                        const settingsResponse = await fetch(saveSettingsApiUrl, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${saveSettingsToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ videoUrl: publicUrl })
                        });
                        if (!settingsResponse.ok) {
                            console.warn('⚠️ Fehler beim Speichern in Settings, aber Upload war erfolgreich');
                        } else {
                            console.log('✅ Video-URL in Settings gespeichert');
                        }
                        await this.syncPublicHeroVideoConfig(publicUrl);
                    } catch (settingsError) {
                        console.warn('⚠️ Fehler beim Speichern in Settings:', settingsError);
                    }

                    console.log('✅ Video erfolgreich hochgeladen (Server-Side):', publicUrl);

                    // Erfolg!
                    if (progressStatus) progressStatus.textContent = 'Fertig!';
                    if (progressFill) progressFill.style.width = '100%';
                    if (progressPercentage) progressPercentage.textContent = '100%';

                    setTimeout(() => {
                        if (uploadProgress) uploadProgress.style.display = 'none';
                        if (successMessage) successMessage.style.display = 'block';
                        if (uploadBtn) uploadBtn.disabled = false;
                        if (fileInput) fileInput.value = '';
                        const previewContainer = document.getElementById('videoPreviewContainer');
                        if (previewContainer) previewContainer.style.display = 'none';
                        this.loadCurrentVideo();
                    }, 1000);
                    
                    return; // Erfolgreich, beende Funktion
                } catch (fallbackError) {
                    console.error('❌ Server-Side Upload auch fehlgeschlagen:', fallbackError);
                    error = fallbackError; // Verwende Fallback-Fehler für Anzeige
                }
            }
            
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

