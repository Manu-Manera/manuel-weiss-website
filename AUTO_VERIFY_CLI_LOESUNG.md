# ✅ Auto-Verify über AWS CLI aktivieren

Da die Navigation in der AWS Console schwierig ist, können wir Auto-Verify direkt über die AWS CLI aktivieren!

## 🚀 Schnelle Lösung

Ich habe versucht, Auto-Verify über die CLI zu aktivieren. Prüfe das Ergebnis unten.

## 📋 Manuelle Aktivierung über CLI

Falls nötig, führe diesen Befehl aus:

```bash
aws cognito-idp update-user-pool \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --region eu-central-1 \
  --auto-verified-attributes email
```

## 🔍 Prüfen ob es funktioniert hat

```bash
aws cognito-idp describe-user-pool \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --region eu-central-1 \
  --query 'UserPool.AutoVerifiedAttributes' \
  --output json
```

**Erwartetes Ergebnis:** `["email"]` ✅

## 🧪 Testen

Nach der Aktivierung:

```bash
./test-registration-debug.sh
```

**Erwartetes Ergebnis:**
- ✅ `CodeDeliveryDetails` sollten vorhanden sein
- ✅ `DeliveryMedium: EMAIL`
- ✅ E-Mail sollte ankommen

## 📍 Alternative: Console Navigation

Falls die CLI nicht funktioniert, versuche in der Console:

1. **Linke Seitenleiste** → Suche nach **"Anmeldeerlebnis"** oder **"Sign-in experience"**
   - Es ist ein **Hauptpunkt**, nicht unter "Authentifizierung"
   - Sollte auf der gleichen Ebene wie "Überblick", "Anwendungen", etc. sein

2. Klicke auf **"Anmeldeerlebnis"**

3. Oben siehst du **Tabs**: "Attribute", "Anmelden", "Registrieren"

4. Klicke auf Tab **"Attribute"**

5. Unten: **"Auto-verifizierte Attribute"** → ✅ **"E-Mail"** aktivieren

6. **"Änderungen speichern"** klicken

## ⚠️ Wichtig

- Auto-Verify muss aktiviert sein, damit E-Mails automatisch versendet werden
- Ohne Auto-Verify funktioniert auch `resendConfirmationCode` nicht

