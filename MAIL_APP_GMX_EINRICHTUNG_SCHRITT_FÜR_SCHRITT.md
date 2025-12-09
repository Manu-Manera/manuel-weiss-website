# 📧 GMX in Mail.app einrichten - Schritt für Schritt

## ⚠️ WICHTIG: AWS SES funktioniert NICHT für eingehende E-Mails!

**Das Problem:** Sie haben ein AWS-Konto in Mail.app eingerichtet, aber AWS SES unterstützt **KEIN IMAP** für eingehende E-Mails.

**Die Lösung:** E-Mails werden automatisch an `weiss-manuel@gmx.de` weitergeleitet. Sie müssen daher **GMX** in Mail.app einrichten.

---

## 🗑️ SCHRITT 1: Falsches AWS-Konto entfernen

### 1.1 Konto löschen
1. Öffnen Sie **Mail** → **Einstellungen** (⌘,)
2. Klicken Sie auf **"Accounts"** (oder "Konten")
3. Wählen Sie das Konto **"Manuel-Weiss"** aus (das mit `imap.eu-central-1.amazonaws.com`)
4. Klicken Sie auf das **"-"** (Minus) Symbol unten links
5. Bestätigen Sie die Löschung mit **"Entfernen"**

**⚠️ Sicherheitshinweis:** Der AWS Access Key (`AKIAQR3HB4M3JM24NYXH`) sollte NICHT in E-Mail-Einstellungen gespeichert werden!

---

## ✅ SCHRITT 2: GMX-Konto hinzufügen

### 2.1 Neues Konto hinzufügen
1. Klicken Sie auf das **"+"** (Plus) Symbol unten links in der Accounts-Liste
2. Wählen Sie **"Andere E-Mail-Anbieter"** oder **"Weitere E-Mail-Anbieter"**

### 2.2 Kontoinformationen eingeben
- **Name:** Manuel Weiss (oder wie Sie möchten)
- **E-Mail-Adresse:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort
- Klicken Sie auf **"Anmelden"**

**Hinweis:** Mail.app versucht automatisch, die Einstellungen zu erkennen. Falls das nicht funktioniert, gehen Sie zu Schritt 2.3.

### 2.3 Manuelle Konfiguration (falls automatisch nicht funktioniert)

Gehen Sie zu **"Servereinstellungen"** und geben Sie folgende Werte ein:

#### E-Mail-Eingangsserver (IMAP):
- **Benutzername:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort
- **Hostname:** `imap.gmx.net`
- ✅ **"Verbindungseinstellungen automatisch verwalten"** aktivieren
- **Port:** Wird automatisch auf `993` gesetzt
- **Verschlüsselung:** SSL/TLS (wird automatisch erkannt)

#### E-Mail-Ausgangsserver (SMTP):
- **Account:** weiss-manuel@gmx.de (aus Dropdown wählen)
- **Benutzername:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort
- **Hostname:** `mail.gmx.net`
- ✅ **"Verbindungseinstellungen automatisch verwalten"** aktivieren
- **Port:** Wird automatisch auf `587` gesetzt
- **Verschlüsselung:** STARTTLS (wird automatisch erkannt)

### 2.4 Erweiterte Einstellungen (falls nötig)

Falls es Probleme gibt, klicken Sie auf **"Erweiterte IMAP-Einstellungen"**:

**IMAP:**
- **Port:** `993`
- **SSL/TLS verwenden:** ✅ Aktiviert
- **Authentifizierung:** Passwort

**SMTP:**
- **Port:** `587`
- **SSL/TLS verwenden:** ✅ Aktiviert
- **Authentifizierung:** Passwort

---

## ✅ SCHRITT 3: Konto testen

### 3.1 Test-E-Mail senden
1. Senden Sie eine Test-E-Mail an `mail@manuel-weiss.ch` von einer anderen Adresse
2. Warten Sie 1-2 Minuten

### 3.2 Prüfen Sie Mail.app
1. Öffnen Sie Mail.app
2. Wählen Sie das **GMX-Konto** in der Seitenleiste
3. Klicken Sie auf **"Posteingang"**
4. Die E-Mail sollte mit Betreff `[Weitergeleitet] ...` erscheinen

### 3.3 Falls E-Mail nicht erscheint

**Option A: Manuell abrufen**
1. Klicken Sie auf **"Posteingang abrufen"** (⌘⇧N) oder
2. Gehen Sie zu **"Posteingang"** → **"Alle Posteingänge abrufen"**

**Option B: GMX direkt prüfen**
1. Öffnen Sie https://www.gmx.net
2. Loggen Sie sich mit `weiss-manuel@gmx.de` ein
3. Prüfen Sie Posteingang und Spam-Ordner
4. Falls E-Mail dort ist, aber nicht in Mail.app:
   - Prüfen Sie die GMX-Einstellungen in Mail.app
   - Versuchen Sie, das Konto zu entfernen und neu hinzuzufügen

---

## 🔍 Fehlerbehebung

### Problem: Authentifizierung schlägt fehl

**GMX 2-Faktor-Authentifizierung:**
1. Gehen Sie zu https://www.gmx.net
2. Loggen Sie sich ein
3. Gehen Sie zu **Sicherheit** → **App-Passwörter**
4. Erstellen Sie ein App-Passwort für "Mail"
5. Verwenden Sie dieses App-Passwort in Mail.app (nicht Ihr normales Passwort)

### Problem: E-Mails kommen nicht an

**Prüfen Sie:**
1. ✅ GMX-Konto ist in Mail.app eingerichtet (nicht AWS!)
2. ✅ Benutzername: `weiss-manuel@gmx.de`
3. ✅ IMAP: `imap.gmx.net` (Port 993, SSL/TLS)
4. ✅ SMTP: `mail.gmx.net` (Port 587, STARTTLS)
5. ✅ Passwort ist korrekt

**Test:**
- Öffnen Sie GMX direkt im Browser
- Prüfen Sie, ob E-Mails dort ankommen
- Falls ja, aber nicht in Mail.app → Prüfen Sie die Einstellungen

### Problem: Ports blockiert

**Firewall/Antivirus:**
- Stellen Sie sicher, dass Ports 993 (IMAP) und 587 (SMTP) nicht blockiert sind
- Prüfen Sie Ihre Firewall-Einstellungen

---

## 📋 Zusammenfassung der richtigen Einstellungen

### ✅ RICHTIG (GMX):
- **IMAP:** `imap.gmx.net` (Port 993, SSL/TLS)
- **SMTP:** `mail.gmx.net` (Port 587, STARTTLS)
- **Benutzername:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort

### ❌ FALSCH (NICHT verwenden!):
- ❌ `imap.eu-central-1.amazonaws.com` (existiert nicht für eingehende E-Mails)
- ❌ `email-smtp.eu-central-1.amazonaws.com` (nur für ausgehende E-Mails)
- ❌ AWS Access Keys als Benutzername

---

## 🎯 Warum funktioniert es jetzt?

**E-Mail-Flow:**
1. E-Mail kommt an → `mail@manuel-weiss.ch` ✅
2. AWS SES empfängt → speichert in S3 ✅
3. Lambda-Funktion → liest E-Mail aus S3 ✅
4. Weiterleitung → sendet an `weiss-manuel@gmx.de` ✅
5. GMX empfängt → E-Mail ist in GMX-Posteingang ✅
6. Mail.app → synchronisiert mit GMX (wenn richtig eingerichtet) ✅

**Das Problem war:**
- Sie hatten AWS SES in Mail.app eingerichtet
- AWS SES kann keine eingehenden E-Mails über IMAP liefern
- Die E-Mails kamen in GMX an, aber Mail.app konnte sie nicht abrufen, weil es auf AWS zeigte

**Die Lösung:**
- GMX in Mail.app einrichten
- Mail.app synchronisiert dann mit GMX
- E-Mails erscheinen im Posteingang ✅

---

## 🔗 Nützliche Links

- **GMX Webmail:** https://www.gmx.net
- **GMX Hilfe:** https://hilfe.gmx.net
- **Mail.app Hilfe:** https://support.apple.com/de-de/guide/mail/

