# 🌍 Region wechseln in AWS Console

## ❌ Problem

Die AWS Console zeigt **0 User Pools**, weil die falsche Region ausgewählt ist.

**Aktuell:** `eu-north-1` (Stockholm) ❌  
**Benötigt:** `eu-central-1` (Frankfurt) ✅

## ✅ Lösung: Region wechseln

### Schritt 1: Region-Auswahl finden
1. Oben rechts in der AWS Console siehst du die aktuelle Region
2. Aktuell steht dort: **"Europa (Stockholm)"** oder **"eu-north-1"**

### Schritt 2: Region wechseln
1. **Klicke auf die Region-Anzeige** (oben rechts)
2. Ein Dropdown-Menü öffnet sich mit allen verfügbaren Regionen
3. **Suche nach:** "Europa (Frankfurt)" oder "eu-central-1"
4. **Klicke darauf** um die Region zu wechseln

### Schritt 3: Seite neu laden
1. Nach dem Wechsel sollte die Seite automatisch neu laden
2. Oder: Klicke auf **"Benutzerpools"** in der linken Seitenleiste
3. Jetzt solltest du den User Pool sehen: **"manuel-weiss-userfiles-users"**

## 🔗 Direkter Link mit korrekter Region

**Direkter Link zu Cognito User Pools in eu-central-1:**
```
https://eu-central-1.console.aws.amazon.com/cognito/v2/idp/user-pools
```

Dieser Link öffnet direkt die richtige Region!

## 📋 Was du sehen solltest

Nach dem Region-Wechsel:
- ✅ Region: **"Europa (Frankfurt)"** oder **"eu-central-1"**
- ✅ User Pool: **"manuel-weiss-userfiles-users"**
- ✅ User Pool ID: **"eu-central-1_8gP4gLK9r"**

## ⚠️ Wichtig

- **User Pools sind regionsspezifisch**
- Der User Pool existiert nur in **eu-central-1**
- In anderen Regionen wirst du ihn nicht finden

## 🧪 Prüfen ob User Pool existiert

Falls du den User Pool auch nach Region-Wechsel nicht siehst, prüfe mit:

```bash
aws cognito-idp list-user-pools --max-results 10 --region eu-central-1
```

Dies sollte den User Pool anzeigen.

