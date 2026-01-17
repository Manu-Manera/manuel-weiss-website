# 📋 Implementierungsplan: E-Mail-Selbstbestätigung & 2FA im Produktionssystem

## 🎯 Ziele

1. ✅ Benutzer können ihre E-Mail selbst bestätigen (keine manuelle Admin-Bestätigung)
2. ✅ Benutzer können 2FA (TOTP/SMS) einrichten
3. ✅ Alles im Produktionssystem (kein Sandbox-Modus)

---

## 📊 Aktueller Status

### ❌ Probleme:
- **SES:** Production Access = `False` (Sandbox-Modus)
- **Cognito MFA:** `OPTIONAL` aber nicht konfiguriert
- **E-Mail-Vorlagen:** Nicht gesetzt (null)
- **Frontend:** Keine 2FA-Setup-UI

### ✅ Bereits vorhanden:
- Cognito User Pool: `eu-central-1_8gP4gLK9r`
- Auto-Verify: Aktiviert für E-Mail
- MFA Configuration: `OPTIONAL`

---

## 🔧 Schritt 1: SES Production Access beantragen

### 1.1 Production Access Request erstellen

**Ziel:** SES aus Sandbox-Modus befreien

**Schritte:**
1. AWS Console → SES → Account Dashboard
2. "Request production access" klicken
3. Formular ausfüllen:
   - **Use case:** Transactional emails (E-Mail-Bestätigungen, 2FA-Codes)
   - **Website URL:** https://manuel-weiss.ch
   - **Mail Type:** Transactional
   - **Expected sending rate:** 100-1000 E-Mails/Tag
   - **Compliance:** SPF, DKIM, DMARC bereits konfiguriert
4. Warten auf Genehmigung (24-48 Stunden)

**Alternative:** Script erstellen für automatische Beantragung

---

## 🔧 Schritt 2: Cognito E-Mail-Verification konfigurieren

### 2.1 E-Mail-Vorlagen setzen

**Ziel:** Professionelle E-Mail-Bestätigungs-E-Mails

**Schritte:**
1. E-Mail-Subject setzen
2. E-Mail-Body setzen (HTML + Text)
3. Von-Adresse konfigurieren
4. Testen

**E-Mail-Vorlage:**
- Subject: "Bestätigen Sie Ihre E-Mail-Adresse - Manuel Weiss"
- Body: HTML mit Branding, Code-Anzeige, Link-Option
- Von: `noreply@manuel-weiss.ch` oder `mail@manuel-weiss.ch`

---

## 🔧 Schritt 3: Cognito MFA konfigurieren

### 3.1 MFA auf OPTIONAL mit TOTP + SMS setzen

**Ziel:** Benutzer können TOTP (Authenticator App) oder SMS wählen

**Schritte:**
1. MFA Configuration: `OPTIONAL`
2. MFA Second Factor: `TOTP` + `SMS`
3. SMS-Konfiguration (falls SMS gewählt)
4. TOTP-Konfiguration (Standard)

**Konfiguration:**
```json
{
  "MfaConfiguration": "OPTIONAL",
  "MfaConfigurationDetails": {
    "SmsMfaConfiguration": {
      "SmsAuthenticationMessage": "Ihr Manuel Weiss Bestätigungscode ist {####}",
      "SmsConfiguration": {
        "SnsRegion": "eu-central-1",
        "ExternalId": "manuel-weiss-cognito"
      }
    },
    "SoftwareTokenMfaConfiguration": {
      "Enabled": true
    }
  }
}
```

---

## 🔧 Schritt 4: Frontend: E-Mail-Bestätigung verbessern

### 4.1 Bestätigungs-Flow optimieren

**Ziel:** Benutzerfreundlicher E-Mail-Bestätigungs-Flow

**Schritte:**
1. Bestätigungs-Modal verbessern
2. Code-Eingabe mit Auto-Submit
3. "Code erneut senden" Funktion
4. Fehlerbehandlung verbessern
5. Success-Message mit Weiterleitung

**Features:**
- ✅ 6-stelliger Code mit Auto-Focus
- ✅ Code-Validierung in Echtzeit
- ✅ "Code erneut senden" mit Rate-Limiting
- ✅ Fehlermeldungen auf Deutsch
- ✅ Success → Automatische Weiterleitung

---

## 🔧 Schritt 5: Frontend: 2FA-Setup-UI

### 5.1 2FA-Setup-Seite erstellen

**Ziel:** Benutzer können 2FA einrichten (TOTP oder SMS)

**Schritte:**
1. 2FA-Setup-Seite im User-Profile
2. TOTP-Setup (QR-Code anzeigen)
3. SMS-Setup (Telefonnummer eingeben)
4. 2FA-Verifizierung beim Login
5. 2FA-Deaktivierung

**UI-Komponenten:**
- ✅ 2FA-Status anzeigen (aktiviert/deaktiviert)
- ✅ "2FA aktivieren" Button
- ✅ TOTP: QR-Code + Secret anzeigen
- ✅ SMS: Telefonnummer eingeben + verifizieren
- ✅ "2FA deaktivieren" Option

---

## 🔧 Schritt 6: Frontend: 2FA-Login-Flow

### 6.1 2FA beim Login integrieren

**Ziel:** 2FA-Abfrage nach erfolgreichem Login

**Schritte:**
1. Login-Flow erweitern
2. 2FA-Abfrage (wenn aktiviert)
3. TOTP-Code oder SMS-Code eingeben
4. Token erhalten
5. Session speichern

**Flow:**
```
1. E-Mail + Passwort eingeben
2. Login → Erfolg
3. Prüfe: Hat Benutzer 2FA aktiviert?
   - Nein → Direkt eingeloggt
   - Ja → 2FA-Code abfragen
4. 2FA-Code eingeben
5. Verifizieren → Token erhalten
6. Eingeloggt
```

---

## 🔧 Schritt 7: Testing & Deployment

### 7.1 Tests durchführen

**Ziel:** Alles funktioniert im Produktionssystem

**Tests:**
1. ✅ E-Mail-Bestätigung (neue Registrierung)
2. ✅ Code erneut senden
3. ✅ 2FA TOTP Setup
4. ✅ 2FA SMS Setup
5. ✅ 2FA Login Flow
6. ✅ 2FA Deaktivierung

---

## 📝 Detaillierte Implementierungsschritte

### Phase 1: AWS-Konfiguration (Backend)

#### 1.1 SES Production Access
- [ ] Production Access Request stellen
- [ ] Warten auf Genehmigung
- [ ] Status prüfen

#### 1.2 Cognito E-Mail-Vorlagen
- [ ] E-Mail-Subject setzen
- [ ] E-Mail-Body (HTML) erstellen
- [ ] E-Mail-Body (Text) erstellen
- [ ] Von-Adresse konfigurieren
- [ ] Test-E-Mail senden

#### 1.3 Cognito MFA
- [ ] MFA auf OPTIONAL setzen
- [ ] TOTP aktivieren
- [ ] SMS aktivieren (optional)
- [ ] SMS-Konfiguration (SNS)

### Phase 2: Frontend-Integration

#### 2.1 E-Mail-Bestätigung
- [ ] Bestätigungs-Modal verbessern
- [ ] Code-Eingabe optimieren
- [ ] "Code erneut senden" implementieren
- [ ] Fehlerbehandlung
- [ ] Success-Flow

#### 2.2 2FA-Setup
- [ ] 2FA-Status-Seite erstellen
- [ ] TOTP-Setup-UI
- [ ] SMS-Setup-UI
- [ ] QR-Code-Generator
- [ ] Secret-Anzeige

#### 2.3 2FA-Login
- [ ] Login-Flow erweitern
- [ ] 2FA-Abfrage
- [ ] Code-Eingabe
- [ ] Verifizierung
- [ ] Session-Management

### Phase 3: Testing

#### 3.1 E-Mail-Bestätigung
- [ ] Neue Registrierung testen
- [ ] Code-Eingabe testen
- [ ] Code erneut senden testen
- [ ] Fehlerfälle testen

#### 3.2 2FA
- [ ] TOTP-Setup testen
- [ ] SMS-Setup testen
- [ ] 2FA-Login testen
- [ ] 2FA-Deaktivierung testen

---

## 🚀 Deployment-Reihenfolge

1. **SES Production Access** (kann 24-48h dauern)
2. **Cognito E-Mail-Vorlagen** (sofort)
3. **Cognito MFA** (sofort)
4. **Frontend E-Mail-Bestätigung** (sofort)
5. **Frontend 2FA-Setup** (sofort)
6. **Frontend 2FA-Login** (sofort)
7. **Testing** (nach Deployment)

---

## ⚠️ Wichtige Hinweise

### SES Production Access:
- **Dauer:** 24-48 Stunden
- **Voraussetzungen:** SPF, DKIM, DMARC konfiguriert ✅
- **Kosten:** Pay-as-you-go (sehr günstig)

### Cognito MFA:
- **TOTP:** Kostenlos (Standard)
- **SMS:** Kostenpflichtig (ca. $0.0065 pro SMS)
- **Empfehlung:** TOTP bevorzugen (kostenlos, sicherer)

### E-Mail-Bestätigung:
- **Auto-Verify:** Bereits aktiviert ✅
- **E-Mail-Vorlagen:** Müssen gesetzt werden
- **Von-Adresse:** `noreply@manuel-weiss.ch` oder `mail@manuel-weiss.ch`

---

## 📊 Erfolgs-Kriterien

✅ **E-Mail-Bestätigung:**
- Benutzer erhalten Bestätigungs-E-Mail
- Code kann eingegeben werden
- Code erneut senden funktioniert
- Bestätigung erfolgreich

✅ **2FA:**
- Benutzer können TOTP aktivieren
- Benutzer können SMS aktivieren (optional)
- 2FA-Login funktioniert
- 2FA kann deaktiviert werden

✅ **Produktionssystem:**
- SES Production Access aktiv
- Alle E-Mails kommen an
- Keine Sandbox-Limitierungen

---

## 🔗 Nützliche Links

- **AWS SES Console:** https://console.aws.amazon.com/ses/
- **AWS Cognito Console:** https://console.aws.amazon.com/cognito/
- **Cognito MFA Docs:** https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html

---

## 📝 Nächste Schritte

1. **SES Production Access beantragen** (kritisch, dauert 24-48h)
2. **Cognito E-Mail-Vorlagen setzen** (sofort möglich)
3. **Cognito MFA konfigurieren** (sofort möglich)
4. **Frontend implementieren** (parallel möglich)

**Empfehlung:** Starten Sie mit SES Production Access, während Sie die anderen Schritte implementieren.

