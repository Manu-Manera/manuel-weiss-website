# ✅ Auto-Verify aktivieren - Schritt für Schritt

## 🎯 Ziel
Auto-Verify für E-Mail im Cognito User Pool aktivieren, damit Bestätigungs-E-Mails automatisch versendet werden.

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: AWS Console öffnen
1. Öffne deinen Browser
2. Gehe zu: **https://console.aws.amazon.com/**
3. Melde dich mit deinen AWS Credentials an

### Schritt 2: Zu Cognito navigieren
**Option A: Über Suche**
1. Klicke auf das Suchfeld oben (🔍)
2. Tippe: **"Cognito"**
3. Klicke auf "Amazon Cognito" in den Suchergebnissen

**Option B: Direkter Link**
- Gehe zu: **https://eu-central-1.console.aws.amazon.com/cognito/v2/idp/user-pools**

### Schritt 3: Region prüfen und wechseln ⚠️ WICHTIG!
1. **Oben rechts** in der AWS Console siehst du die aktuelle Region
2. **Prüfe:** Steht dort "Europa (Stockholm)" oder "eu-north-1"? → **FALSCH!**
3. **Klicke auf die Region-Anzeige** (oben rechts)
4. **Wähle:** "Europa (Frankfurt)" oder "eu-central-1"
5. Die Seite lädt automatisch neu
6. **WICHTIG:** Der User Pool existiert **NUR** in eu-central-1!

**Alternativ:** Verwende diesen direkten Link mit korrekter Region:
```
https://eu-central-1.console.aws.amazon.com/cognito/v2/idp/user-pools
```

### Schritt 4: User Pool auswählen
1. In der linken Seitenleiste: Klicke auf **"User pools"**
2. Suche nach: **"manuel-weiss-userfiles-users"**
3. Klicke auf den User Pool Namen

### Schritt 5: Auto-Verify aktivieren
1. In der linken Seitenleiste: Klicke auf **"Sign-in experience"**
2. Klicke auf den Tab **"Attributes"**
3. Scrolle nach unten zu **"Auto-verified attributes"**
4. Aktiviere das Checkbox: ✅ **"Email"**
5. Klicke auf **"Save changes"** (oben rechts)

### Schritt 6: Bestätigung
1. Du solltest eine Erfolgsmeldung sehen: "Changes saved successfully"
2. Unter "Auto-verified attributes" sollte jetzt **"Email"** angezeigt werden

## 🧪 Testen

Nach der Aktivierung kannst du testen:

```bash
./test-registration-debug.sh
```

**Erwartetes Ergebnis:**
- ✅ `CodeDeliveryDetails` sollten in der Antwort sein
- ✅ `DeliveryMedium: EMAIL`
- ✅ E-Mail sollte ankommen

## ⚠️ Wichtig

- **Region:** Muss **eu-central-1** sein
- **User Pool:** `manuel-weiss-userfiles-users`
- **Einstellung:** "Email" unter "Auto-verified attributes"

## 🔗 Direkte Links

- **AWS Console:** https://console.aws.amazon.com/
- **Cognito User Pools (eu-central-1):** https://eu-central-1.console.aws.amazon.com/cognito/v2/idp/user-pools
- **Cognito Homepage:** https://eu-central-1.console.aws.amazon.com/cognito/home?region=eu-central-1

## 📸 Screenshot-Pfad (falls benötigt)

1. AWS Console → Cognito
2. User pools → manuel-weiss-userfiles-users
3. Sign-in experience → Attributes
4. Auto-verified attributes → Email ✅

## ✅ Nach Aktivierung

Das System sollte jetzt:
- ✅ Automatisch E-Mails bei Registrierung versenden
- ✅ `resendConfirmationCode` funktionieren
- ✅ Vollständig funktionsfähig sein

