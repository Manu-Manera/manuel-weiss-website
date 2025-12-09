# 📧 GMX in Mail.app einrichten (Schritt für Schritt)

## ⚠️ WICHTIG: AWS SES unterstützt KEIN IMAP!

**AWS SES kann keine E-Mails direkt an einen E-Mail-Client liefern.**

E-Mails an `mail@manuel-weiss.ch` werden automatisch an **`weiss-manuel@gmx.de`** weitergeleitet.

Sie müssen daher **GMX** in Mail.app einrichten, nicht AWS SES!

---

## 🗑️ Schritt 1: Falsches AWS-Konto entfernen

1. Öffnen Sie **Mail** → **Einstellungen** → **Accounts**
2. Wählen Sie das Konto **"Manuel-Weiss"** aus
3. Klicken Sie auf das **"-"** (Minus) Symbol unten links
4. Bestätigen Sie die Löschung

**WICHTIG:** Der AWS Access Key in den Einstellungen ist ein Sicherheitsrisiko!

---

## ✅ Schritt 2: GMX-Konto hinzufügen

### 2.1 Neues Konto hinzufügen
1. Klicken Sie auf das **"+"** (Plus) Symbol unten links
2. Wählen Sie **"Andere E-Mail-Anbieter"** oder **"Weitere E-Mail-Anbieter"**

### 2.2 Kontoinformationen eingeben
- **Name:** Manuel Weiss (oder wie Sie möchten)
- **E-Mail-Adresse:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort
- Klicken Sie auf **"Anmelden"**

### 2.3 Falls automatische Konfiguration fehlschlägt

Gehen Sie zu **"Servereinstellungen"** und geben Sie manuell ein:

**E-Mail-Eingangsserver (IMAP):**
- **Benutzername:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort
- **Hostname:** `imap.gmx.net`
- **Port:** `993` (wird automatisch erkannt)
- ✅ **"Verbindungseinstellungen automatisch verwalten"** aktivieren
- **Verschlüsselung:** SSL/TLS

**E-Mail-Ausgangsserver (SMTP):**
- **Account:** weiss-manuel@gmx.de
- **Benutzername:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort
- **Hostname:** `mail.gmx.net`
- **Port:** `587` (wird automatisch erkannt)
- ✅ **"Verbindungseinstellungen automatisch verwalten"** aktivieren
- **Verschlüsselung:** STARTTLS

---

## 🔍 Schritt 3: Erweiterte Einstellungen (falls nötig)

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

## ✅ Schritt 4: Testen

1. **Test-E-Mail senden:**
   - Senden Sie eine E-Mail an `mail@manuel-weiss.ch` von einer anderen Adresse
   - Warten Sie 1-2 Minuten

2. **Prüfen Sie:**
   - ✅ E-Mail kommt in GMX-Posteingang an
   - ✅ E-Mail wird in Mail.app angezeigt
   - ✅ Sie können antworten

---

## 🔐 Sicherheitshinweis

**Der AWS Access Key (`AKIAQR3HB4M3JM24NYXH`) sollte NICHT in E-Mail-Einstellungen gespeichert werden!**

Falls dieser Key kompromittiert wurde:
1. Gehen Sie zu AWS Console → IAM → Access Keys
2. Deaktivieren oder löschen Sie den Key
3. Erstellen Sie einen neuen Key falls nötig

---

## 📋 Zusammenfassung

**Richtige Konfiguration:**
- ✅ **GMX** in Mail.app einrichten
- ✅ IMAP: `imap.gmx.net` (Port 993, SSL/TLS)
- ✅ SMTP: `mail.gmx.net` (Port 587, STARTTLS)
- ✅ Benutzername: `weiss-manuel@gmx.de`

**Falsche Konfiguration (NICHT verwenden!):**
- ❌ AWS SES IMAP (existiert nicht)
- ❌ `imap.eu-central-1.amazonaws.com`
- ❌ AWS Access Keys in E-Mail-Einstellungen

---

## 🆘 Hilfe

Falls es nicht funktioniert:
1. Prüfen Sie GMX direkt: https://www.gmx.net
2. Prüfen Sie Spam-Ordner
3. Prüfen Sie AWS SES Status: `bash check-ses-complete-status.sh`
4. Prüfen Sie Lambda Logs für Weiterleitung

