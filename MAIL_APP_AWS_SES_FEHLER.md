# ❌ WICHTIG: AWS SES in Mail.app funktioniert NICHT für E-Mail-Empfang!

## 🚨 Problem

Sie haben versucht, AWS SES direkt als IMAP-Server in Mail.app zu konfigurieren:
- **IMAP Server:** `imap.eu-central-1.amazonaws.com`
- **SMTP Server:** `email-smtp.eu-central-1.amazonaws.com`
- **Benutzername:** `AKIAQR3HB4M3JM24NYXH`

**Das funktioniert NICHT!** ❌

---

## ❌ Warum funktioniert das nicht?

**AWS SES ist KEIN E-Mail-Empfang-Service!**

- ✅ **AWS SES kann:** E-Mails SENDEN (SMTP)
- ❌ **AWS SES kann NICHT:** E-Mails EMPFANGEN (kein IMAP/POP3)

**AWS SES ist ein E-Mail-Versand-Service**, kein vollständiger E-Mail-Provider wie GMX oder Gmail.

---

## ✅ Lösung: Verwenden Sie GMX

Sie haben bereits **GMX** in Ihrer Mail.app-Liste! Das ist der richtige Weg.

### So richten Sie GMX korrekt ein:

1. **Entfernen Sie die AWS SES Konfiguration:**
   - Wählen Sie "Manuel-Weiss" (AWS SES) in der Liste
   - Klicken Sie auf "-" (Minus-Button)
   - Bestätigen Sie die Löschung

2. **Verwenden Sie GMX:**
   - Wählen Sie "Gmx" in der Liste
   - Oder fügen Sie GMX neu hinzu mit "+"

3. **GMX Einstellungen:**
   - **IMAP Server:** `imap.gmx.net`
   - **SMTP Server:** `mail.gmx.net`
   - **Benutzername:** `weiss-manuel@gmx.de`
   - **Passwort:** Ihr GMX-Passwort
   - **Port IMAP:** 993 (SSL)
   - **Port SMTP:** 587 (STARTTLS)

---

## 📧 Wie funktioniert das E-Mail-System?

### E-Mail-Empfang:
1. E-Mails kommen an `mail@manuel-weiss.ch` an
2. AWS SES Receipt Rules leiten sie weiter an `weiss-manuel@gmx.de`
3. GMX speichert die E-Mails in Ihrem Postfach
4. Mail.app lädt E-Mails von GMX über IMAP

### E-Mail-Versand:
1. Sie schreiben E-Mails in Mail.app
2. Mail.app sendet über GMX SMTP
3. ODER: Ihre Website sendet über AWS SES SMTP (für automatische E-Mails)

---

## 🔧 Korrekte Konfiguration

### In Mail.app sollten Sie haben:

**GMX Account (für E-Mail-Empfang):**
- ✅ IMAP: `imap.gmx.net` (Port 993, SSL)
- ✅ SMTP: `mail.gmx.net` (Port 587, STARTTLS)
- ✅ Benutzername: `weiss-manuel@gmx.de`
- ✅ Passwort: Ihr GMX-Passwort

**NICHT:**
- ❌ AWS SES IMAP (existiert nicht)
- ❌ AWS SES als E-Mail-Provider

---

## 📋 Schritt-für-Schritt Anleitung

### 1. AWS SES Account entfernen:
1. Öffnen Sie Mail.app → Einstellungen → Accounts
2. Wählen Sie "Manuel-Weiss" (AWS SES)
3. Klicken Sie auf "-" (Minus-Button unten links)
4. Bestätigen Sie: "Account entfernen"

### 2. GMX Account prüfen/konfigurieren:
1. Wählen Sie "Gmx" in der Liste
2. Prüfen Sie die Einstellungen:
   - **IMAP Server:** `imap.gmx.net`
   - **SMTP Server:** `mail.gmx.net`
   - **Benutzername:** `weiss-manuel@gmx.de`
3. Falls nicht korrekt, klicken Sie auf "Erweiterte Einstellungen" und korrigieren Sie

### 3. Testen:
1. Senden Sie eine Test-E-Mail an `mail@manuel-weiss.ch`
2. Warten Sie 1-2 Minuten
3. Prüfen Sie Ihr GMX-Postfach in Mail.app
4. Die E-Mail sollte erscheinen

---

## ⚠️ Wichtige Hinweise

### AWS SES wird verwendet für:
- ✅ **E-Mail-Versand** von Ihrer Website (Cognito, Lambda)
- ✅ **E-Mail-Empfang** über Receipt Rules (leitet weiter an GMX)

### GMX wird verwendet für:
- ✅ **E-Mail-Empfang** in Mail.app (über IMAP)
- ✅ **E-Mail-Versand** von Mail.app (über SMTP)

### Die beiden arbeiten zusammen:
```
E-Mail an mail@manuel-weiss.ch
    ↓
AWS SES Receipt Rules
    ↓
Weiterleitung an weiss-manuel@gmx.de
    ↓
GMX Postfach
    ↓
Mail.app (IMAP)
```

---

## ✅ Zusammenfassung

**Entfernen Sie:**
- ❌ "Manuel-Weiss" AWS SES Account aus Mail.app

**Verwenden Sie:**
- ✅ "Gmx" Account in Mail.app
- ✅ GMX IMAP für E-Mail-Empfang
- ✅ GMX SMTP für E-Mail-Versand

**AWS SES bleibt aktiv für:**
- ✅ E-Mail-Versand von Ihrer Website
- ✅ E-Mail-Empfang über Receipt Rules (automatisch)

---

## 🔗 Nützliche Links

- **GMX IMAP/SMTP Einstellungen:** Siehe `EMAIL_CLIENT_SETUP_MAC_GMX.md`
- **AWS SES Receipt Rules:** Bereits konfiguriert und aktiv

