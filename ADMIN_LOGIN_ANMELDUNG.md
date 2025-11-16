# Admin-Login Anmeldedaten

## Aktueller Status

**⚠️ WICHTIG: Es gibt noch KEINEN Admin-User!**

Es wurden User im Cognito Pool gefunden, aber **keiner ist in der Admin-Gruppe**.

## Option 1: Bestehenden User zur Admin-Gruppe hinzufügen

Wenn du einen der bestehenden User als Admin verwenden möchtest:

```bash
# Beispiel: weiss-manuel@gmx.de zur Admin-Gruppe hinzufügen
aws cognito-idp admin-add-user-to-group \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "weiss-manuel@gmx.de" \
  --group-name admin \
  --region eu-central-1
```

**Dann kannst du dich anmelden mit:**
- **E-Mail:** weiss-manuel@gmx.de
- **Passwort:** [dein aktuelles Passwort]

## Option 2: Neuen Admin-User erstellen (Empfohlen)

Führe das Setup-Script aus:

```bash
./create-admin-user.sh
```

Das Script fragt nach:
- E-Mail-Adresse (z.B. `admin@manuel-weiss.ch`)
- Passwort (min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahlen)

**Nach dem Erstellen kannst du dich anmelden mit:**
- **E-Mail:** [die eingegebene E-Mail]
- **Passwort:** [das eingegebene Passwort]

## Option 3: Schnell-Setup für bestehenden User

Wenn du `weiss-manuel@gmx.de` als Admin verwenden möchtest:

```bash
# Zur Admin-Gruppe hinzufügen
aws cognito-idp admin-add-user-to-group \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "weiss-manuel@gmx.de" \
  --group-name admin \
  --region eu-central-1

# Prüfen ob es funktioniert hat
./check-admin-users.sh
```

## Login-URL

Nach dem Setup kannst du dich hier anmelden:

**🌐 https://mawps.netlify.app/admin-login.html**

## Verfügbare User (nicht in Admin-Gruppe)

Aktuell gefundene User:
- ✅ `weiss-manuel@gmx.de` (CONFIRMED) - **Kann zur Admin-Gruppe hinzugefügt werden**
- ⚠️ `test@mawps.netlify.app` (CONFIRMED)
- ⚠️ Andere Test-User (UNCONFIRMED)

## Nächste Schritte

1. **Entscheide dich für eine Option** (bestehender User oder neuer User)
2. **Führe das entsprechende Kommando aus**
3. **Teste den Login** auf https://mawps.netlify.app/admin-login.html

## Hilfe

Bei Problemen:
- Prüfe mit: `./check-admin-users.sh`
- Siehe: `ADMIN_LOGIN_SETUP.md`
- Teste mit: `test-admin-login.html`

