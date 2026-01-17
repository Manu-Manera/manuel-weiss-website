# 🚀 Netlify → AWS Migration Anleitung

## Status: ⏸️ WARTEND AUF AWS-ENTSPERRUNG

Die Migration ist vollständig vorbereitet, aber AWS-Services (Lambda, Amplify, CloudFront) sind wegen eines Billing-Problems blockiert.

---

## ✅ Bereits erledigt

| Phase | Beschreibung | Status |
|-------|--------------|--------|
| 1 | 39 Lambda Functions erstellt | ✅ |
| 2 | CDK Stack konfiguriert | ✅ |
| 3 | Frontend mit `getApiUrl()` vorbereitet | ✅ |
| - | 21 Netlify Functions als Fallback | ✅ |
| - | Projekt aufgeräumt (2.1GB → 1.9GB) | ✅ |

---

## 🔧 Nach AWS-Entsperrung ausführen

### Schritt 1: CDK Deploy

```bash
cd infrastructure
npm install
npx cdk bootstrap  # Falls noch nicht gemacht
npx cdk deploy --all
```

### Schritt 2: API URL konfigurieren

Nach dem Deploy wird die API Gateway URL ausgegeben. Diese in `js/aws-app-config.js` eintragen:

```javascript
const USE_AWS_API = true; // Auf true ändern
// ...
API_BASE: 'https://DEINE-API-ID.execute-api.eu-central-1.amazonaws.com/v1'
```

### Schritt 3: ACM Zertifikat erstellen

```bash
# Zertifikat muss in us-east-1 sein für CloudFront!
aws acm request-certificate \
  --domain-name manuel-weiss.ch \
  --subject-alternative-names "*.manuel-weiss.ch" \
  --validation-method DNS \
  --region us-east-1
```

DNS-Validierung in Route53:
```bash
# CNAME Records aus ACM-Output in Route53 eintragen
aws route53 change-resource-record-sets ...
```

### Schritt 4: AWS Amplify Hosting

```bash
# App erstellen
aws amplify create-app \
  --name "manuel-weiss-website" \
  --repository "https://github.com/USER/Persoenliche-Website" \
  --region eu-central-1

# Custom Domain hinzufügen
aws amplify create-domain-association \
  --app-id APP_ID \
  --domain-name manuel-weiss.ch \
  --sub-domain-settings prefix="",branchName="main" prefix="www",branchName="main"
```

### Schritt 5: DNS umstellen

Route53 Records ändern:

```bash
# A-Record für manuel-weiss.ch
# Von: 75.2.60.5 (Netlify)
# Zu: CloudFront/Amplify Distribution

# CNAME für www.manuel-weiss.ch
# Von: mawps.netlify.app
# Zu: d1234567890.cloudfront.net (oder Amplify Domain)
```

### Schritt 6: Testen (1-2 Wochen Parallel-Betrieb)

1. Website über neue URL testen
2. Alle Funktionen prüfen:
   - Login/Logout
   - Datei-Upload (Profilbild, Dokumente)
   - CV Tailor
   - Kontaktformular
   - Snowflake Highscores
3. Performance vergleichen

### Schritt 7: Netlify deaktivieren

```bash
# Erst wenn alles funktioniert!
# Netlify Dashboard → Site settings → Delete site
```

---

## 📁 Wichtige Dateien

| Datei | Beschreibung |
|-------|--------------|
| `js/aws-app-config.js` | API-Konfiguration (USE_AWS_API Flag) |
| `infrastructure/` | CDK Stack Definition |
| `lambda/` | Alle Lambda Functions |
| `netlify/functions/` | Fallback Netlify Functions |
| `ENVIRONMENT_VARIABLES.md` | Alle benötigten Umgebungsvariablen |

---

## 🔗 Aktuelle DNS-Konfiguration

```
manuel-weiss.ch (A)      → 75.2.60.5 (Netlify)
www.manuel-weiss.ch      → mawps.netlify.app (CNAME)
mail.manuel-weiss.ch     → AWS SES (MX)
_dmarc.manuel-weiss.ch   → DMARC Policy (TXT)
*._domainkey...          → DKIM (CNAME)
```

**Email (SES) bleibt unverändert!** ✅

---

## ⚠️ AWS Support kontaktieren

Falls AWS-Account noch blockiert:

1. AWS Console → Support → Create case
2. "Account and billing support"
3. Subject: "AWS Services blocked - Lambda/Amplify AccessDeniedException"
4. Beschreibung: "My account shows AccessDeniedException for Lambda and Amplify services. Please help resolve this billing/security issue."

---

*Erstellt: 2026-01-17*
*Status: Wartend auf AWS-Entsperrung*
