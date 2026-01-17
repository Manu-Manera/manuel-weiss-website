# 🔐 AWS Access Key SICHER konfigurieren

## ⚠️ WICHTIG: NIEMALS Keys in Code speichern!

**Der AWS Access Key wurde kompromittiert und muss ersetzt werden.**

## ✅ Sichere Konfiguration über Netlify Environment Variables

### Schritt 1: Neuen AWS Access Key erstellen

1. Gehe zu **AWS Console** → **IAM** → **Users** → `manu-ses-smtp-user`
2. Klicke auf **"Security credentials"** Tab
3. Klicke auf **"Create access key"**
4. **WICHTIG:** Kopiere **BEIDE** Werte:
   - **Access Key ID** (beginnt mit `AKIA...`)
   - **Secret Access Key** (wird nur einmal angezeigt!)

### Schritt 2: In Netlify Environment Variables setzen

1. Gehe zu **Netlify Dashboard** → Dein Projekt → **Site settings** → **Environment variables**
2. Füge folgende Variablen hinzu:

| Variable Name | Value | Secret? |
|--------------|-------|---------|
| `NETLIFY_AWS_ACCESS_KEY_ID` | `[DEIN_NEUER_ACCESS_KEY_ID]` | ❌ Nein |
| `NETLIFY_AWS_SECRET_ACCESS_KEY` | `[DEIN_NEUER_SECRET_ACCESS_KEY]` | ✅ **JA** (wichtig!) |

3. **WICHTIG:** Bei `NETLIFY_AWS_SECRET_ACCESS_KEY` **MUSS** das Häkchen bei "Secret" aktiviert sein!

### Schritt 3: Alten Key deaktivieren

1. Gehe zu **AWS Console** → **IAM** → **Users** → `manu-ses-smtp-user`
2. Klicke auf **"Security credentials"** Tab
3. Finde den alten (deaktivierten) Key
4. Klicke auf **"Make inactive"** (NICHT löschen, falls noch Probleme auftreten)
5. Teste die Anwendung
6. Wenn alles funktioniert, **lösche** den alten Key endgültig

### Schritt 4: Deployment neu starten

Nach dem Setzen der Environment Variables:
1. Gehe zu **Netlify Dashboard** → **Deploys**
2. Klicke auf **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Warte bis das Deployment abgeschlossen ist

---

## 🔒 Warum diese Methode sicher ist

✅ **Keys sind NICHT im Code** - Sie werden nur in Netlify gespeichert  
✅ **Secret Keys sind verschlüsselt** - Netlify verschlüsselt Secrets automatisch  
✅ **Kein Git-Repository** - Keys werden nie committed  
✅ **Zugriff nur für Netlify** - Keys sind nur in der Netlify-Umgebung verfügbar  

---

## ❌ Was du NICHT tun solltest

❌ **NIEMALS** Keys direkt in Code schreiben  
❌ **NIEMALS** Keys in Git committen  
❌ **NIEMALS** Keys in öffentlichen Dokumentationen zeigen  
❌ **NIEMALS** Keys per E-Mail oder Chat teilen  

---

## 🧪 Testen

Nach dem Deployment kannst du testen:

1. **E-Mail-Versand testen:**
   - Gehe zu deiner Website
   - Sende eine Test-E-Mail über das Kontaktformular
   - Prüfe ob die E-Mail ankommt

2. **AWS Services prüfen:**
   - Gehe zu **AWS Console** → **CloudWatch** → **Logs**
   - Prüfe ob es Fehler gibt

---

## 📞 Bei Problemen

Falls etwas nicht funktioniert:

1. **Prüfe Netlify Logs:**
   - Netlify Dashboard → **Functions** → **Logs**
   - Suche nach Fehlermeldungen

2. **Prüfe AWS CloudWatch:**
   - AWS Console → **CloudWatch** → **Logs**
   - Suche nach "InvalidAccessKeyId" oder ähnlichen Fehlern

3. **Prüfe Environment Variables:**
   - Stelle sicher, dass beide Variablen gesetzt sind
   - Stelle sicher, dass `NETLIFY_AWS_SECRET_ACCESS_KEY` als "Secret" markiert ist

---

## 🔄 Für die Zukunft

**Best Practices:**

1. **Rotiere Keys regelmäßig** - Mindestens alle 90 Tage
2. **Verwende IAM Roles** statt Access Keys wo möglich
3. **Minimiere Berechtigungen** - Nur die nötigsten Permissions
4. **Aktiviere MFA** für AWS Root Account
5. **Überwache CloudTrail** auf verdächtige Aktivitäten
