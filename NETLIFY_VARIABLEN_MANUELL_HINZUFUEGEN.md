# Environment Variables manuell im Netlify Dashboard hinzufügen

Da die CLI-Variablen möglicherweise nicht sichtbar sind, füge sie bitte **manuell im Dashboard** hinzu:

## 📋 Die 3 fehlenden Variablen:

### 1. AWS_REGION

1. Klicke auf **"Add a variable"** (grüner Button oben rechts)
2. **Key**: `AWS_REGION`
3. **Secret**: ❌ NICHT aktivieren
4. **Scopes**: ✅ **"All scopes"** auswählen
5. **Values**: ✅ **"Same value for all deploy contexts"** auswählen
6. **Production Value**: `eu-central-1`
7. Klicke auf **"Add variable"** oder **"Save"**

---

### 2. AWS_ACCESS_KEY_ID

1. Klicke auf **"Add a variable"**
2. **Key**: `AWS_ACCESS_KEY_ID`
3. **Secret**: ❌ NICHT aktivieren
4. **Scopes**: ✅ **"All scopes"** auswählen
5. **Values**: ✅ **"Same value for all deploy contexts"** auswählen
6. **Production Value**: `[Siehe Terminal-Ausgabe beim Erstellen des IAM Users]`
7. Klicke auf **"Add variable"** oder **"Save"**

---

### 3. AWS_SECRET_ACCESS_KEY

1. Klicke auf **"Add a variable"**
2. **Key**: `AWS_SECRET_ACCESS_KEY`
3. **Secret**: ✅ **AKTIVIEREN** (wichtig!)
4. **Scopes**: ✅ **"All scopes"** auswählen
5. **Values**: ✅ **"Same value for all deploy contexts"** auswählen
6. **Production Value**: `[Siehe Terminal-Ausgabe beim Erstellen des IAM Users]`
7. Klicke auf **"Add variable"** oder **"Save"**

---

## ✅ Nach dem Hinzufügen

Du solltest dann **5 Variablen** sehen:
1. ✅ AWS_REGION
2. ✅ AWS_ACCESS_KEY_ID
3. ✅ AWS_SECRET_ACCESS_KEY
4. ✅ AWS_S3_HERO_VIDEO_BUCKET (bereits vorhanden)
5. ✅ DYNAMODB_SETTINGS_TABLE (bereits vorhanden)

## 🚀 Dann

1. **Site neu deployen** (oder warten auf automatisches Deploy)
2. **Video-Upload testen** im Admin Panel

