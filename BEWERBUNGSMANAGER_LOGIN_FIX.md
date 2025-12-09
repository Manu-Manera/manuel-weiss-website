# 🔧 Bewerbungsmanager Login-Problem: Lösung

## ❌ Problem

**Fehlermeldung:** "Anmeldung fehlgeschlagen. E-Mail-Adresse wurde noch nicht bestätigt."

**Ursache:**
- Benutzer wurde erstellt, aber E-Mail-Bestätigung fehlt
- SES ist im Sandbox-Modus → kann nur an verifizierte E-Mail-Adressen senden
- Bestätigungs-E-Mails kommen nicht an
- Benutzer bleibt im Status `UNCONFIRMED`

## ✅ Lösungen

### Lösung 1: Benutzer manuell bestätigen (Schnellste Lösung)

**Für Test-Benutzer oder wenn Sie Admin-Zugriff haben:**

```bash
# Benutzer manuell bestätigen
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username <USERNAME_ODER_EMAIL> \
  --region eu-central-1
```

**Oder verwenden Sie das Script:**
```bash
./fix-unconfirmed-users.sh
# Option 1 wählen: Benutzer manuell bestätigen
```

### Lösung 2: E-Mail-Adresse in SES verifizieren

**Für echte Benutzer (wenn Sie die E-Mail-Adresse kennen):**

1. **E-Mail-Adresse in SES verifizieren:**
```bash
aws sesv2 create-email-identity \
  --email-identity <EMAIL-ADRESSE> \
  --region eu-central-1
```

2. **Verifizierungs-E-Mail prüfen:**
   - Öffnen Sie das E-Mail-Postfach
   - Klicken Sie auf den Verifizierungs-Link

3. **Bestätigungscode erneut senden:**
```bash
aws cognito-idp resend-confirmation-code \
  --client-id 7kc5tt6a23fgh53d60vkefm812 \
  --username <EMAIL-ADRESSE> \
  --region eu-central-1
```

### Lösung 3: SES Production Access beantragen (Langfristig)

**Vorteil:** Kann an beliebige E-Mail-Adressen senden (nicht nur verifizierte)

1. Gehen Sie zu AWS Console → SES → Account Dashboard
2. Klicken Sie auf "Request production access"
3. Füllen Sie das Formular aus
4. Warten Sie auf Genehmigung (24-48 Stunden)

---

## 🔍 Welche E-Mail-Adresse verwendet der Benutzer?

**Prüfen Sie:**
1. Welche E-Mail-Adresse wurde bei der Registrierung verwendet?
2. Ist diese E-Mail-Adresse in SES verifiziert?

**Prüfen Sie verifizierte E-Mail-Adressen:**
```bash
aws sesv2 list-email-identities --region eu-central-1 \
  --query "EmailIdentities[?VerificationStatus=='SUCCESS'].IdentityName" \
  --output table
```

**Aktuell verifiziert:**
- ✅ `weiss-manuel@gmx.de`
- ✅ `manuelalexanderweiss@gmail.com`
- ✅ `manuel-weiss.ch` (Domain)

---

## 🛠️ Schnell-Fix: Benutzer manuell bestätigen

**Wenn Sie die E-Mail-Adresse des Benutzers kennen:**

```bash
# 1. Finden Sie den Username
EMAIL="ihre-email@example.com"
USERNAME=$(aws cognito-idp list-users \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --region eu-central-1 \
  --filter "email = \"$EMAIL\"" \
  --query "Users[0].Username" \
  --output text)

# 2. Bestätigen Sie den Benutzer
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "$USERNAME" \
  --region eu-central-1

echo "✅ Benutzer $EMAIL wurde bestätigt"
```

---

## 📋 Admin-Panel: Benutzer-Verwaltung

**Falls verfügbar:**
- Gehen Sie zu Admin Panel → Website Users
- Suchen Sie den Benutzer
- Klicken Sie auf "Bestätigen" oder "Manuell bestätigen"

---

## 🧪 Test nach Fix

1. **Versuchen Sie sich anzumelden:**
   - E-Mail: Ihre E-Mail-Adresse
   - Passwort: Ihr Passwort

2. **Erwartet:**
   - ✅ Anmeldung erfolgreich
   - ✅ Keine Fehlermeldung mehr
   - ✅ Zugriff auf Bewerbungsmanager

---

## ⚠️ Wichtige Hinweise

### SES Sandbox-Modus:
- **Aktuell:** `ProductionAccessEnabled: false`
- **Bedeutung:** Kann nur an verifizierte E-Mail-Adressen senden
- **Lösung:** 
  - E-Mail-Adressen in SES verifizieren ODER
  - SES Production Access beantragen

### Auto-Verify:
- **Status:** Aktiviert (`AutoVerifiedAttributes: ["email"]`)
- **Aber:** Funktioniert nur wenn E-Mail in SES verifiziert ist

---

## 🔗 Nützliche Befehle

### Alle unbestätigten Benutzer anzeigen:
```bash
aws cognito-idp list-users \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --region eu-central-1 \
  --filter "status = \"UNCONFIRMED\"" \
  --output json | python3 -m json.tool
```

### Benutzer-Status prüfen:
```bash
EMAIL="ihre-email@example.com"
aws cognito-idp admin-get-user \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "$EMAIL" \
  --region eu-central-1 \
  --query "UserStatus" \
  --output text
```

### Benutzer manuell bestätigen:
```bash
EMAIL="ihre-email@example.com"
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "$EMAIL" \
  --region eu-central-1
```

---

## 📝 Zusammenfassung

**Problem:** Benutzer ist unbestätigt (UNCONFIRMED)
**Ursache:** SES Sandbox-Modus - Bestätigungs-E-Mail kam nicht an
**Lösung:** Benutzer manuell bestätigen ODER E-Mail in SES verifizieren

**Schnellste Lösung:**
```bash
./fix-unconfirmed-users.sh
# Option 1: Benutzer manuell bestätigen
# E-Mail-Adresse eingeben
```

