# Netlify Environment Variables - Kostenlose Anleitung

## ⚠️ WICHTIG: Site-Ebene, nicht Team-Ebene!

Die Environment Variables müssen auf der **Site-Ebene** gesetzt werden, nicht als "Shared environment variables" im Team. Site-spezifische Environment Variables sind **kostenlos**!

## 📍 Korrekte Navigation

### Schritt 1: Gehe zu deiner Site
1. Im Netlify Dashboard: Klicke auf **"Sites"** oder **"Projects"** im linken Menü
2. Wähle deine Site aus (z.B. `mawps` oder `manuel-weiss`)

### Schritt 2: Gehe zu Site Settings
1. Klicke auf den **Site-Namen** (nicht auf Team Settings!)
2. Oder: Klicke auf das **Zahnrad-Icon** (⚙️) neben dem Site-Namen
3. Im linken Menü: Klicke auf **"Site settings"**

### Schritt 3: Environment Variables
1. Im linken Menü unter "Site settings": Klicke auf **"Environment variables"**
2. Hier kannst du **kostenlos** Environment Variables hinzufügen!

## ✅ Environment Variables hinzufügen

1. Klicke auf **"Add a variable"** oder **"Add environment variable"**
2. Füge folgende 5 Variablen hinzu:

| Variable Name | Value | Scope |
|--------------|-------|-------|
| `AWS_REGION` | `eu-central-1` | All scopes |
| `AWS_ACCESS_KEY_ID` | `[Siehe Terminal-Ausgabe beim Erstellen des IAM Users]` | All scopes |
| `AWS_SECRET_ACCESS_KEY` | `[Siehe Terminal-Ausgabe beim Erstellen des IAM Users]` | All scopes |
| `AWS_S3_HERO_VIDEO_BUCKET` | `manuel-weiss-hero-videos` | All scopes |
| `DYNAMODB_SETTINGS_TABLE` | `manuel-weiss-settings` | All scopes |

**Die AWS Keys findest du in der Terminal-Ausgabe oben oder erstelle neue mit:**
```bash
aws iam create-access-key --user-name netlify-hero-video-upload
```

3. Für jede Variable: Wähle **"All scopes"** oder **"Production"** aus
4. Klicke auf **"Save"** oder **"Add variable"**

## 🎯 Unterschied: Team vs. Site

- **Team Settings → Environment Variables**: "Shared environment variables" - **KOSTENPFLICHTIG** (nur für bezahlte Pläne)
- **Site Settings → Environment Variables**: Site-spezifische Variables - **KOSTENLOS** ✅

## 📸 Visueller Pfad

```
Netlify Dashboard
  └─ Sites / Projects
      └─ [Deine Site] (z.B. mawps)
          └─ Site settings (⚙️ Icon)
              └─ Environment variables
                  └─ "Add a variable" Button
```

## ✅ Nach dem Setzen

1. **Site neu deployen** (oder warte auf automatisches Deploy)
2. Die Variables sind sofort aktiv für alle Netlify Functions
3. Teste den Video-Upload im Admin Panel

## 🆘 Falls du die Site nicht findest

1. Im Netlify Dashboard: Klicke auf **"Sites"** im linken Menü
2. Suche nach deiner Site (z.B. `mawps` oder `manuel-weiss`)
3. Klicke auf den **Site-Namen** (nicht auf das Team!)

## 💡 Tipp

Falls du immer noch in "Team settings" bist:
- Klicke auf **"Sites"** oder **"Projects"** im linken Menü
- Das bringt dich zurück zur Site-Übersicht
- Von dort kannst du zu den Site Settings navigieren

