# Admin-Login Anmeldedaten

## ✅ Admin-User ist eingerichtet!

**Du kannst dich jetzt anmelden mit:**

- **E-Mail:** `weiss-manuel@gmx.de`
- **Passwort:** `TempPassw0rd!`
- **Login-URL:** https://mawps.netlify.app/admin-login.html

## Status

✅ User `weiss-manuel@gmx.de` ist in der Admin-Gruppe  
✅ User ist CONFIRMED (bestätigt)  
✅ Login ist aktiviert  

## Login-Schritte

1. Öffne: https://mawps.netlify.app/admin-login.html
2. Gib ein:
   - E-Mail: `weiss-manuel@gmx.de`
   - Passwort: [dein aktuelles Passwort]
3. Nach erfolgreichem Login wirst du zum Admin-Panel weitergeleitet

## Hilfe

Bei Problemen:
- Prüfe mit: `./check-admin-users.sh`
- Siehe: `ADMIN_LOGIN_SETUP.md`
- Teste mit: `test-admin-login.html`

## Weitere Admin-User hinzufügen

Um weitere User zur Admin-Gruppe hinzuzufügen:

```bash
# Schnell-Script
./quick-add-admin.sh

# Oder manuell
aws cognito-idp admin-add-user-to-group \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "email@example.com" \
  --group-name admin \
  --region eu-central-1
```
