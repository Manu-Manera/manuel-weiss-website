# 📧 E-Mail-Adresse verifizieren: mail@manuel-weiss.de

## 🔍 Aktueller Status

- **E-Mail-Adresse:** `mail@manuel-weiss.de`
- **Status:** `PENDING` ⏳
- **Region:** `eu-central-1`

## ✅ Methode 1: Verifizierungs-E-Mail (Einfachste Methode)

### Schritt 1: Prüfe dein Postfach

1. **Öffne dein E-Mail-Postfach** für `mail@manuel-weiss.de`
   - Falls du noch keinen Zugriff hast, prüfe dein normales Postfach (falls E-Mails weitergeleitet werden)

2. **Suche nach einer E-Mail von AWS SES**
   - **Absender:** `no-reply-aws@amazon.com` oder `aws-verification@amazon.com`
   - **Betreff:** Enthält "Verify" oder "Verification"
   - **Wann gesendet:** Nach dem Ausführen von `setup-email-manuel-weiss-de.sh`

3. **Öffne die E-Mail** und klicke auf den **Verifizierungs-Link**

### Schritt 2: Verifizierungs-Link klicken

- Der Link führt zu einer AWS-Seite
- Nach dem Klick sollte die Verifizierung automatisch abgeschlossen sein
- Status ändert sich von `PENDING` zu `SUCCESS`

### Schritt 3: Status prüfen

```bash
aws sesv2 get-email-identity \
  --email-identity mail@manuel-weiss.de \
  --region eu-central-1 \
  --query "VerificationStatus" \
  --output text
```

**Erwartetes Ergebnis:** `SUCCESS` ✅

---

## 🔄 Methode 2: Verifizierungs-E-Mail erneut senden

Falls die E-Mail nicht angekommen ist, kannst du sie erneut anfordern:

### Schritt 1: Verifizierung neu starten

```bash
# Lösche die alte Verifizierung (falls vorhanden)
aws sesv2 delete-email-identity \
  --email-identity mail@manuel-weiss.de \
  --region eu-central-1

# Starte neue Verifizierung
aws sesv2 create-email-identity \
  --email-identity mail@manuel-weiss.de \
  --region eu-central-1
```

### Schritt 2: Warte auf E-Mail

- AWS sendet eine neue Verifizierungs-E-Mail
- Prüfe dein Postfach (auch Spam-Ordner!)
- Klicke auf den Link in der E-Mail

---

## 🌐 Methode 3: Über AWS Console (Manuell)

Falls die E-Mail nicht ankommt, kannst du die Verifizierung auch manuell in der AWS Console durchführen:

### Schritt 1: AWS Console öffnen

1. Gehe zu: https://console.aws.amazon.com/ses/home?region=eu-central-1#/verified-identities
2. Melde dich mit deinem AWS-Account an

### Schritt 2: E-Mail-Adresse finden

1. Klicke auf **Verified identities** (links im Menü)
2. Suche nach `mail@manuel-weiss.de` in der Liste
3. Status sollte `Pending verification` sein

### Schritt 3: Verifizierung anstoßen

1. Klicke auf `mail@manuel-weiss.de`
2. Klicke auf **Send verification email** (falls verfügbar)
3. Oder kopiere den **Verification token** (falls angezeigt)

### Schritt 4: Token manuell verwenden (falls nötig)

Falls ein Token angezeigt wird, kannst du ihn manuell verifizieren:

```bash
# Token abrufen
aws sesv2 get-email-identity \
  --email-identity mail@manuel-weiss.de \
  --region eu-central-1 \
  --query "VerificationRecords[0].Value" \
  --output text
```

**Hinweis:** Für E-Mail-Adressen (nicht Domains) gibt es normalerweise keinen Token - nur einen Link in der E-Mail.

---

## ⚠️ Häufige Probleme

### Problem 1: E-Mail kommt nicht an

**Lösung:**
- Prüfe den **Spam-Ordner**
- Prüfe, ob E-Mails an `mail@manuel-weiss.de` weitergeleitet werden
- Falls die Domain noch nicht verifiziert ist, kann die E-Mail nicht ankommen
- **Alternative:** Verwende eine andere E-Mail-Adresse für die Verifizierung

### Problem 2: Verifizierungs-Link funktioniert nicht

**Lösung:**
- Der Link ist nur 24 Stunden gültig
- Fordere eine neue Verifizierungs-E-Mail an (siehe Methode 2)
- Prüfe, ob der Link vollständig kopiert wurde

### Problem 3: Status bleibt PENDING

**Lösung:**
- Warte 5-10 Minuten nach dem Klick auf den Link
- Prüfe den Status erneut mit dem Befehl oben
- Falls immer noch PENDING, starte die Verifizierung neu

---

## 🔍 Status prüfen (Kurzfassung)

```bash
# E-Mail-Status prüfen
aws sesv2 get-email-identity \
  --email-identity mail@manuel-weiss.de \
  --region eu-central-1 \
  --query "VerificationStatus" \
  --output text
```

**Mögliche Werte:**
- `PENDING` ⏳ - Wartet auf Verifizierung
- `SUCCESS` ✅ - Verifizierung erfolgreich
- `FAILED` ❌ - Verifizierung fehlgeschlagen
- `TEMPORARY_FAILURE` ⚠️ - Temporäres Problem, wird erneut geprüft

---

## ✅ Nach erfolgreicher Verifizierung

Sobald der Status `SUCCESS` ist:

1. **E-Mails senden:**
   - Du kannst jetzt E-Mails von `mail@manuel-weiss.de` senden
   - **Hinweis:** Im Sandbox-Modus nur an verifizierte E-Mail-Adressen!

2. **Sandbox-Modus verlassen (optional):**
   ```bash
   # Beantrage Limit-Erhöhung in der AWS Console
   # Oder verwende:
   aws sesv2 put-account-sending-enabled --enabled true --region eu-central-1
   ```

3. **E-Mail-Client einrichten:**
   - Siehe `EMAIL_CLIENT_SETUP_MAC.md` für die Einrichtung in Mail.app

---

## 🔗 Nützliche Links

- **AWS SES Console:** https://console.aws.amazon.com/ses/home?region=eu-central-1#/verified-identities
- **Verifizierte Identitäten:** https://console.aws.amazon.com/ses/home?region=eu-central-1#/verified-identities
- **SES Dokumentation:** https://docs.aws.amazon.com/ses/latest/dg/verify-email-addresses.html

---

## 📋 Schnell-Checkliste

- [ ] Postfach für `mail@manuel-weiss.de` geprüft
- [ ] Spam-Ordner geprüft
- [ ] Verifizierungs-E-Mail von AWS gefunden
- [ ] Verifizierungs-Link geklickt
- [ ] Status auf `SUCCESS` geprüft
- [ ] E-Mail-Client eingerichtet (optional)

---

**Tipp:** Falls du Probleme hast, prüfe zuerst, ob die Domain `manuel-weiss.de` verifiziert ist. Eine verifizierte Domain erleichtert die E-Mail-Verifizierung.

