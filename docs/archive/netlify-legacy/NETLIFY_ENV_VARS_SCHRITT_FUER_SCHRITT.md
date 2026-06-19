# Netlify Environment Variables - Schritt für Schritt

## 🎯 Einfache Anleitung

Für jede Variable: Klicke auf **"Add a variable"** und fülle die Felder aus.

## 📋 Die 5 Variablen, die du hinzufügen musst:

### 1. AWS_REGION

- **Key**: `AWS_REGION`
- **Secret**: ❌ NICHT aktivieren (ist kein Secret)
- **Scopes**: ✅ **"All scopes"** auswählen
- **Values**: ✅ **"Same value for all deploy contexts"** auswählen
- **Production Value**: `eu-central-1`
- Klicke auf **"Save"** oder **"Add variable"**

---

### 2. AWS_ACCESS_KEY_ID

- **Key**: `AWS_ACCESS_KEY_ID`
- **Secret**: ❌ NICHT aktivieren (Access Key ID ist nicht geheim)
- **Scopes**: ✅ **"All scopes"** auswählen
- **Values**: ✅ **"Same value for all deploy contexts"** auswählen
- **Production Value**: `[Siehe Terminal-Ausgabe beim Erstellen des IAM Users]`
- Klicke auf **"Save"** oder **"Add variable"**

---

### 3. AWS_SECRET_ACCESS_KEY

- **Key**: `AWS_SECRET_ACCESS_KEY`
- **Secret**: ✅ **AKTIVIEREN** (das ist ein Secret!)
- **Scopes**: ✅ **"All scopes"** auswählen
- **Values**: ✅ **"Same value for all deploy contexts"** auswählen
- **Production Value**: `[Siehe Terminal-Ausgabe beim Erstellen des IAM Users]`
- Klicke auf **"Save"** oder **"Add variable"**

---

### 4. AWS_S3_HERO_VIDEO_BUCKET

- **Key**: `AWS_S3_HERO_VIDEO_BUCKET`
- **Secret**: ❌ NICHT aktivieren
- **Scopes**: ✅ **"All scopes"** auswählen
- **Values**: ✅ **"Same value for all deploy contexts"** auswählen
- **Production Value**: `manuel-weiss-hero-videos`
- Klicke auf **"Save"** oder **"Add variable"**

---

### 5. DYNAMODB_SETTINGS_TABLE

- **Key**: `DYNAMODB_SETTINGS_TABLE`
- **Secret**: ❌ NICHT aktivieren
- **Scopes**: ✅ **"All scopes"** auswählen
- **Values**: ✅ **"Same value for all deploy contexts"** auswählen
- **Production Value**: `manuel-weiss-settings`
- Klicke auf **"Save"** oder **"Add variable"**

---

## ✅ Zusammenfassung

Für **ALLE** Variablen:
- ✅ **Scopes**: "All scopes"
- ✅ **Values**: "Same value for all deploy contexts"
- ❌ **Secret**: Nur bei `AWS_SECRET_ACCESS_KEY` aktivieren, sonst NICHT

## 🎯 Die Werte nochmal:

| Key | Value | Secret? |
|-----|-------|---------|
| `AWS_REGION` | `eu-central-1` | ❌ |
| `AWS_ACCESS_KEY_ID` | `[Siehe Terminal-Ausgabe]` | ❌ |
| `AWS_SECRET_ACCESS_KEY` | `[Siehe Terminal-Ausgabe]` | ✅ |
| `AWS_S3_HERO_VIDEO_BUCKET` | `manuel-weiss-hero-videos` | ❌ |
| `DYNAMODB_SETTINGS_TABLE` | `manuel-weiss-settings` | ❌ |

## 🚀 Nach dem Setzen

1. **Site neu deployen** (oder warte auf automatisches Deploy)
2. Die Variables sind sofort aktiv
3. Teste den Video-Upload im Admin Panel

## 💡 Tipp

Du musst dich **NICHT** um die anderen Optionen kümmern:
- ❌ "Upgrade to unlock" - ignorieren
- ❌ "Add a branch value" - ignorieren
- ❌ "Different value for each deploy context" - ignorieren

Einfach: **"All scopes"** + **"Same value for all deploy contexts"** = fertig! ✅

