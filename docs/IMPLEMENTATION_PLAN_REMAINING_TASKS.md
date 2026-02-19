# Detaillierter Implementierungsplan: Alle verbleibenden Aufgaben

## Status-Übersicht

### ✅ BEREITS ERLEDIGT:
1. LinkedIn-URLs aktualisiert auf `www.linkedin.com/in/manuel-alexander-weiss`
2. Index.html: KI-Strategieentwicklung Kachel mit neuen Texten
3. Index.html: Neue HR-Selbsttest Kachel hinzugefügt
4. ki-strategieentwicklung.html: Button-Text geändert
5. ki-strategie-workflow.html: Slider-Labels weiß, Sidebar entfernt
6. hr-selbsttest.html: Tips ausgeblendet, Lead-Capture Modal, Mobile-Optimierung
7. hr-prozessautomatisierung.html: Workflow-Button hinzugefügt
8. ai-digitalisierung.html: Profilbild mit abgerundeten Ecken (nicht rund)
9. styles.css: Navbar weiß auf dunklem Hintergrund
10. Dateien auf S3 hochgeladen

### 📋 NOCH ZU ERLEDIGEN:
1. HR-Automation-Workflow auf 8 Schritte umstrukturieren (siehe separater Plan)
2. Digital-Workplace komplett neu gestalten
3. CloudFront Cache invalidieren

---

## AUFGABE 1: Digital-Workplace Redesign

### Datei: `/Users/manumanera/Documents/GitHub/Persönliche Website/digital-workplace.html`

### Ziel:
Die Seite soll das gleiche Design haben wie `ki-strategieentwicklung.html`:
- Dunkler Sternen-Hintergrund
- Hero-Section mit Badge "Harvard & MIT Methodologie"
- Glasmorphism-Effekte
- Workflow-Button

### Schritte:

#### Schritt 1: CSS-Klasse `starry-theme` zum Body hinzufügen
Suche:
```html
<body>
```
Ersetze durch:
```html
<body class="starry-theme">
```

#### Schritt 2: Starry-Background CSS importieren
Suche im `<head>`:
```html
<link rel="stylesheet" href="styles.css">
```
Füge danach hinzu:
```html
<link rel="stylesheet" href="css/starry-background.css">
```

#### Schritt 3: Hero-Section neu gestalten
Suche nach der bestehenden Hero-Section und ersetze sie durch:
```html
    <!-- Hero Section -->
    <section class="hero-dark" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%); min-height: 60vh; display: flex; align-items: center; position: relative; overflow: hidden;">
        <div class="hero-stars" style="position: absolute; inset: 0; background-image: radial-gradient(2px 2px at 20px 30px, white, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 40px, white, transparent), radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent); background-size: 200px 200px; animation: twinkle 5s ease-in-out infinite;"></div>
        <div class="container" style="position: relative; z-index: 1; text-align: center; padding: 3rem 1rem;">
            <span class="badge" style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99, 102, 241, 0.3); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.9rem; margin-bottom: 1.5rem; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                <i class="fas fa-graduation-cap"></i> Harvard & MIT Methodologie
            </span>
            <h1 style="font-size: 2.5rem; font-weight: 800; color: white; margin-bottom: 1rem;">Digital Workplace</h1>
            <p style="color: rgba(255,255,255,0.9); max-width: 600px; margin: 0 auto 2rem; font-size: 1.1rem;">
                Moderne Arbeitsplatzgestaltung mit KI-gestützten Tools, Collaboration-Plattformen und Employee Experience im Fokus.
            </p>
            <a href="digital-workplace-workflow.html" class="btn-workflow" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 12px; font-weight: 600; text-decoration: none; box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4); transition: all 0.3s ease;">
                <i class="fas fa-laptop-house"></i> Digital Workplace gestalten
            </a>
        </div>
    </section>
    
    <style>
        @keyframes twinkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .btn-workflow:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5);
        }
    </style>
```

#### Schritt 4: Navbar-Textfarbe auf weiß setzen
Die Navbar sollte automatisch weiß sein durch die `starry-theme` Klasse im Body (CSS-Regeln in styles.css).

Falls nicht, füge inline hinzu:
```html
<style>
    .starry-theme .nav-link { color: white !important; }
    .starry-theme .nav-name { color: white !important; }
</style>
```

---

## AUFGABE 2: Digital-Workplace-Workflow Redesign

### Datei: `/Users/manumanera/Documents/GitHub/Persönliche Website/digital-workplace-workflow.html`

### Ziel:
Der Workflow soll das gleiche Design haben wie `ki-strategie-workflow.html`:
- Dunkler Sternen-Hintergrund
- Weiße Schrift
- Glasmorphism-Cards
- Mobile-optimierte Slider

### Schritte:

#### Schritt 1: Body-Klasse hinzufügen
```html
<body class="starry-theme" data-page-id="digital-workplace-workflow">
```

#### Schritt 2: Starry-Background CSS importieren
```html
<link rel="stylesheet" href="css/starry-background.css">
```

#### Schritt 3: Inline-Styles für dunkles Theme hinzufügen
Füge im `<style>` Block hinzu:
```css
body {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
    min-height: 100vh;
    color: white;
}

.workflow-step {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 2.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
}

.workflow-step h2,
.workflow-step h3,
.workflow-step label {
    color: white !important;
}

.workflow-step p,
.workflow-step .description {
    color: rgba(255, 255, 255, 0.8) !important;
}

input, select, textarea {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: white !important;
}

input::placeholder, textarea::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
}

.slider-labels {
    color: rgba(255, 255, 255, 0.85) !important;
}

/* Slider Mobile-Optimierung */
@media (max-width: 768px) {
    input[type="range"] {
        width: 100% !important;
        height: 10px !important;
    }
    input[type="range"]::-webkit-slider-thumb {
        width: 32px !important;
        height: 32px !important;
    }
}
```

---

## AUFGABE 3: CloudFront Cache Invalidierung

### Nach allen Änderungen ausführen:

```bash
# 1. Alle geänderten Dateien hochladen
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"

aws s3 sync . s3://manuel-weiss-website \
    --exclude ".git/*" \
    --exclude "node_modules/*" \
    --exclude "*.md" \
    --exclude ".DS_Store" \
    --exclude "docs/*"

# 2. CloudFront Cache invalidieren (Distribution ID aus AWS Console)
aws cloudfront create-invalidation \
    --distribution-id DEINE_DISTRIBUTION_ID \
    --paths "/*"
```

### Alternative: Nur spezifische Dateien invalidieren:
```bash
aws cloudfront create-invalidation \
    --distribution-id DEINE_DISTRIBUTION_ID \
    --paths "/index.html" "/styles.css" "/ki-strategie-workflow.html" "/hr-selbsttest.html" "/hr-automation-workflow.html" "/digital-workplace.html" "/digital-workplace-workflow.html"
```

---

## AUFGABE 4: AWS Lambda Lead-Benachrichtigung

### Ziel
Das Lead-Capture-Formular schickt bei Download-Anfrage eine HTTP `POST` an den AWS API Gateway Endpunkt `/api/send-lead-notification`. Dieser ruft eine AWS Lambda Funktion auf, die die Internal-Logik (SES oder SMTP) kapselt und eine Benachrichtigung an `mail@manuel-weiss.ch` sendet.

### Schritte
1. **Lambda-Funktion erstellen (z. B. unter `lambda/send-lead-notification/index.js`)**  
   - Node.js Handler liest Name, E-Mail, Zustimmung, Scores und Beratungsvorliebe aus dem Event-Body.
   - Erzeugt Email-Text und sendet ihn per AWS SES (oder alternativ über `nodemailer` mit SMTP-Credentials, wenn vorhanden).
   - Gibt JSON `{ success: true }` zurück oder `{ success: false, error: '...' }`.

2. **API Gateway / Integration**  
   - Erstelle ein REST/HTTP API mit der Route `POST /send-lead-notification`, die die Lambda-Funktion triggert.
   - Aktiviere CORS (falls das Formular von der Website aus aufrufbar ist) und verweist auf die gleiche Domain wie die Website (z. B. `https://manuel-weiss.ch/api/send-lead-notification`).

3. **Beispielcode (Lambda Handler)**  
   ```javascript
   const aws = require('aws-sdk');
   const ses = new aws.SES({ region: 'eu-central-1' });

   exports.handler = async (event) => {
     const payload = JSON.parse(event.body || '{}');
     const { name, email, wantsConsultation, scores } = payload;
     const body = `
     Neuer HR-Selbsttest Lead
     -----------------------
     Name: ${name}
     E-Mail: ${email}
     Beratung: ${wantsConsultation ? 'Ja' : 'Nein'}

     Scores:
     Vision: ${scores?.vision?.toFixed(1) || '-'}
     Kultur: ${scores?.kultur?.toFixed(1) || '-'}
     Organisation: ${scores?.organisation?.toFixed(1) || '-'}
     Prozesse: ${scores?.prozesse?.toFixed(1) || '-'}

     `;

     await ses.sendEmail({
       Source: 'info@manuel-weiss.ch',
       Destination: { ToAddresses: ['mail@manuel-weiss.ch'] },
       Message: {
         Subject: { Data: `HR-Selbsttest Lead ${name}` },
         Body: { Text: { Data: body } }
       }
     }).promise();

     return { statusCode: 200, body: JSON.stringify({ success: true }) };
   };
   ```

4. **Dependencies**  
   - Für SES ist keine zusätzliche Dependency nötig, wenn `aws-sdk` vorhanden ist (Lambda-Umgebung).  
   - Falls SMTP gebraucht wird, kannst du `nodemailer` hinzufügen.

--- 

## AUFGABE 5: Git Commit

### Nach allen Änderungen:

```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"

git add -A

git commit -m "$(cat <<'EOF'
Website-Optimierungen: Workflows, Lead-Capture, Mobile

- HR-Automation-Workflow auf 8 Schritte erweitert
- Canvas-Zeichnen, Diktat, BPMN-Generierung integriert
- HR-Selbsttest Lead-Capture Modal hinzugefügt
- Digital-Workplace mit dunklem Theme
- Mobile-Optimierung für alle Slider
- Navbar-Farben für helle/dunkle Hintergründe
- LinkedIn-URLs aktualisiert
EOF
)"

git push origin main
```

---

## Checkliste für Abschluss

- [ ] HR-Automation-Workflow: 8 Schritte mit Canvas/Diktat/BPMN
- [ ] Digital-Workplace: Dunkles Theme
- [ ] Digital-Workplace-Workflow: Dunkles Theme
- [ ] AWS Lambda: Lead-Benachrichtigung (API Gateway `/api/send-lead-notification`)
- [ ] S3 Upload aller Dateien
- [ ] CloudFront Cache Invalidierung
- [ ] Git Commit & Push
- [ ] Live-Test auf manuel-weiss.ch

---

## Dateien-Übersicht

| Datei | Status | Priorität |
|-------|--------|-----------|
| index.html | ✅ Erledigt | - |
| styles.css | ✅ Erledigt | - |
| ki-strategieentwicklung.html | ✅ Erledigt | - |
| ki-strategie-workflow.html | ✅ Erledigt | - |
| hr-selbsttest.html | ✅ Erledigt | - |
| hr-prozessautomatisierung.html | ✅ Erledigt | - |
| ai-digitalisierung.html | ✅ Erledigt | - |
| hr-automation-workflow.html | 📋 Siehe separater Plan | HOCH |
| digital-workplace.html | 📋 Aufgabe 1 | MITTEL |
| digital-workplace-workflow.html | 📋 Aufgabe 2 | MITTEL |
| lambda/send-lead-notification/index.js | 📋 Aufgabe 4 | NIEDRIG |
