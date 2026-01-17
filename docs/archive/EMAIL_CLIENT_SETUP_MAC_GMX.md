# 📧 E-Mail-Einrichtung auf dem Mac (GMX)

## ⚠️ Wichtiger Hinweis

**AWS SES kann keine E-Mails direkt an einen E-Mail-Client liefern** (kein IMAP/POP3).

E-Mails an `mail@manuel-weiss.ch` werden automatisch an **`weiss-manuel@gmx.de`** weitergeleitet.

Sie müssen daher **GMX in Ihrem E-Mail-Client einrichten**, um die weitergeleiteten E-Mails zu empfangen.

---

## 🍎 Mail.app (Standard E-Mail-Client auf dem Mac)

### Schritt 1: Mail.app öffnen
1. Öffnen Sie die **Mail**-App auf Ihrem Mac
2. Falls Sie noch kein Konto haben: **Mail** → **E-Mail-Konto hinzufügen**

### Schritt 2: GMX-Konto hinzufügen
1. Wählen Sie **"Andere E-Mail-Anbieter"** oder **"Weitere E-Mail-Anbieter"**
2. Geben Sie folgende Informationen ein:

**Kontoinformationen:**
- **Name:** Ihr Name (z.B. "Manuel Weiss")
- **E-Mail-Adresse:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort

**Eingehende E-Mail-Server (IMAP):**
- **Server:** `imap.gmx.net`
- **Benutzername:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort
- **Port:** `993`
- **Verschlüsselung:** SSL/TLS

**Ausgehende E-Mail-Server (SMTP):**
- **Server:** `mail.gmx.net`
- **Benutzername:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort
- **Port:** `587`
- **Verschlüsselung:** STARTTLS

### Schritt 3: Konto verifizieren
1. Klicken Sie auf **"Anmelden"** oder **"Fertig"**
2. Mail.app wird das Konto automatisch konfigurieren
3. Falls Probleme auftreten, prüfen Sie die Einstellungen manuell

---

## 📬 Outlook (Microsoft Outlook)

### Schritt 1: Outlook öffnen
1. Öffnen Sie **Microsoft Outlook**
2. Gehen Sie zu **Outlook** → **Einstellungen** → **Konten**

### Schritt 2: Neues Konto hinzufügen
1. Klicken Sie auf **"+"** oder **"Konto hinzufügen"**
2. Wählen Sie **"IMAP"** oder **"Manuell konfigurieren"**

**Einstellungen:**
- **E-Mail-Adresse:** `weiss-manuel@gmx.de`
- **Passwort:** Ihr GMX-Passwort

**IMAP-Einstellungen:**
- **Server:** `imap.gmx.net`
- **Port:** `993`
- **Verschlüsselung:** SSL/TLS

**SMTP-Einstellungen:**
- **Server:** `mail.gmx.net`
- **Port:** `587`
- **Verschlüsselung:** STARTTLS
- **Authentifizierung:** Benutzername und Passwort

---

## 🔍 Thunderbird (Mozilla Thunderbird)

### Schritt 1: Thunderbird öffnen
1. Öffnen Sie **Thunderbird**
2. Gehen Sie zu **Bearbeiten** → **Einstellungen** → **Konten**

### Schritt 2: Neues Konto hinzufügen
1. Klicken Sie auf **"Konto-Aktionen"** → **"E-Mail-Konto hinzufügen"**
2. Geben Sie Ihre E-Mail-Adresse ein: `weiss-manuel@gmx.de`
3. Wählen Sie **"Manuelle Konfiguration"**

**Einstellungen:**
- **Server-Typ:** IMAP
- **Server-Name:** `imap.gmx.net`
- **Port:** `993`
- **SSL/TLS:** SSL/TLS
- **Authentifizierung:** Normales Passwort

**Ausgehend (SMTP):**
- **Server-Name:** `mail.gmx.net`
- **Port:** `587`
- **SSL/TLS:** STARTTLS
- **Authentifizierung:** Normales Passwort
- **Benutzername:** `weiss-manuel@gmx.de`

---

## ✅ Testen der Einrichtung

### 1. Test-E-Mail senden
Senden Sie eine Test-E-Mail an `mail@manuel-weiss.ch` von einer anderen E-Mail-Adresse.

### 2. Prüfen Sie:
- ✅ E-Mail kommt in GMX-Posteingang an (innerhalb von 1-2 Minuten)
- ✅ E-Mail wird in Ihrem E-Mail-Client angezeigt
- ✅ Sie können antworten (Antwort geht an die ursprüngliche Absender-Adresse)

---

## 🔧 Fehlerbehebung

### Problem: E-Mails kommen nicht an

**1. Prüfen Sie GMX direkt:**
- Öffnen Sie https://www.gmx.net
- Loggen Sie sich mit `weiss-manuel@gmx.de` ein
- Prüfen Sie den Posteingang und Spam-Ordner

**2. Prüfen Sie AWS SES Status:**
```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"
bash check-ses-complete-status.sh
```

**3. Prüfen Sie Lambda Logs:**
```bash
aws logs tail /aws/lambda/ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9 --since 30m --region eu-central-1
```

**4. Prüfen Sie S3 Bucket:**
```bash
aws s3 ls s3://manu-email-storage-038333965110/emails/ --recursive --region eu-central-1 | tail -5
```

### Problem: Authentifizierung schlägt fehl

**GMX 2-Faktor-Authentifizierung:**
- Falls Sie 2FA aktiviert haben, müssen Sie möglicherweise ein **App-Passwort** erstellen
- Gehen Sie zu GMX → Sicherheit → App-Passwörter
- Erstellen Sie ein App-Passwort für "Mail"
- Verwenden Sie dieses Passwort im E-Mail-Client

### Problem: Ports blockiert

**Firewall/Antivirus:**
- Stellen Sie sicher, dass Ports 993 (IMAP) und 587 (SMTP) nicht blockiert sind
- Prüfen Sie Ihre Firewall-Einstellungen

---

## 📋 Zusammenfassung

**E-Mail-Flow:**
1. E-Mail kommt an → `mail@manuel-weiss.ch`
2. AWS SES empfängt → speichert in S3
3. Lambda-Funktion → liest E-Mail aus S3
4. Weiterleitung → sendet an `weiss-manuel@gmx.de`
5. GMX empfängt → E-Mail ist in Ihrem Posteingang

**Wichtig:**
- ✅ E-Mails werden an `weiss-manuel@gmx.de` weitergeleitet
- ✅ Sie müssen GMX in Ihrem E-Mail-Client einrichten
- ✅ Antworten gehen automatisch an die ursprüngliche Absender-Adresse
- ✅ E-Mails werden auch in S3 gespeichert (als Backup)

---

## 🔗 Nützliche Links

- **GMX Webmail:** https://www.gmx.net
- **GMX Hilfe:** https://hilfe.gmx.net
- **AWS SES Console:** https://console.aws.amazon.com/ses/
- **S3 Bucket:** https://console.aws.amazon.com/s3/buckets/manu-email-storage-038333965110

