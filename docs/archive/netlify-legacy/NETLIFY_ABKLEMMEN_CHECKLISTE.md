# ✅ Netlify Abklemmen - Checkliste

> **Erstellt:** 2026-01-21  
> **Status:** ⚠️ Vorbereitung für Netlify-Deaktivierung

---

## 📊 AKTUELLER STATUS

### ✅ Bereits auf AWS migriert:
- ✅ **Frontend:** AWS S3 + CloudFront (`manuel-weiss.ch`)
- ✅ **Backend API:** AWS API Gateway (`https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1`)
- ✅ **Konfiguration:** `USE_AWS_API = true` in `js/aws-app-config.js`
- ✅ **Lambda Functions:** Alle API-Endpoints auf AWS

### ⚠️ Noch auf Netlify:
- ⚠️ **Fallback:** Netlify Functions (nur wenn `API_BASE` leer wäre)
- ⚠️ **Auto-Deploy:** GitHub Webhook → Netlify (noch aktiv)
- ⚠️ **URL:** `https://mawps.netlify.app` (noch erreichbar)

---

## ✅ VORBEDINGUNGEN PRÜFEN

### **1. AWS API funktioniert vollständig:**
```bash
# Test: API Gateway erreichbar?
curl -I "https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/user-data/profile"

# Erwartet: 200, 401 (Auth), oder 403 (nicht 404/500)
```

### **2. Alle Endpoints getestet:**
- [ ] User Data API
- [ ] CV Export
- [ ] Profile Image Upload
- [ ] Contact Email
- [ ] Snowflake Highscores
- [ ] OpenAI Proxy

### **3. Frontend verwendet AWS API:**
- [x] `USE_AWS_API = true` in `js/aws-app-config.js`
- [x] `API_BASE` ist gesetzt (nicht leer)
- [ ] Alle Seiten getestet (Login, Profile, CV Editor, etc.)

---

## 🔍 CODE-ANALYSE

### **Netlify-Referenzen im Code:**

#### **1. `js/aws-app-config.js`:**
- ✅ `USE_AWS_API = true` → AWS wird verwendet
- ⚠️ Fallback zu Netlify nur wenn `API_BASE` leer ist (aktuell nicht der Fall)
- **Status:** ✅ Kann bleiben (Fallback ist deaktiviert)

#### **2. `js/aws-profile-api.js`:**
- ⚠️ Verwendet möglicherweise noch Netlify Functions als Fallback
- **Prüfen:** Ob `USE_AWS_API` korrekt verwendet wird

#### **3. `netlify/functions/`:**
- ⚠️ Alte Netlify Functions noch vorhanden
- **Status:** Können gelöscht werden (werden nicht mehr verwendet)

#### **4. `netlify.toml`:**
- ⚠️ Netlify-Konfiguration noch vorhanden
- **Status:** Kann gelöscht werden (wird nicht mehr benötigt)

---

## 🚀 SCHRITTE ZUM ABKLEMMEN

### **Phase 1: Finale Tests (VOR dem Abklemmen)**

```bash
# 1. AWS API vollständig testen
curl -X GET "https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/user-data/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Frontend auf manuel-weiss.ch testen
# - Login funktioniert?
# - Profile laden funktioniert?
# - CV Editor funktioniert?
# - Alle Buttons funktionieren?

# 3. Browser Console prüfen
# - Keine Netlify-Fehler?
# - Alle API-Calls gehen zu AWS?
```

### **Phase 2: Code bereinigen (OPTIONAL)**

```bash
# 1. Netlify Functions löschen (optional, nur wenn sicher)
# rm -rf netlify/functions/*

# 2. netlify.toml löschen (optional)
# rm netlify.toml

# 3. Netlify-Referenzen im Code entfernen (optional)
# - Fallback-Code in aws-app-config.js entfernen
# - netlify-storage.js entfernen (falls nicht mehr verwendet)
```

### **Phase 3: Netlify deaktivieren**

#### **Option A: GitHub Webhook entfernen (empfohlen)**
```bash
# 1. GitHub Repository → Settings → Webhooks
# 2. Netlify Webhook finden und löschen
# 3. Oder: Netlify Dashboard → Site settings → Build & deploy → Stop builds
```

#### **Option B: Netlify Site löschen (endgültig)**
```bash
# 1. Netlify Dashboard → Site settings → General → Delete site
# 2. Bestätigen
# ⚠️ WICHTIG: Nur wenn 100% sicher, dass alles auf AWS funktioniert!
```

### **Phase 4: DNS prüfen (falls noch auf Netlify)**

```bash
# Prüfe DNS-Records:
dig manuel-weiss.ch
dig www.manuel-weiss.ch

# Sollten auf CloudFront zeigen, nicht auf Netlify
```

---

## ⚠️ RISIKEN & WARNUNGEN

### **Was passiert, wenn Netlify abgeklemmt wird:**

1. ✅ **Frontend:** Kein Problem (läuft auf AWS S3 + CloudFront)
2. ✅ **Backend:** Kein Problem (läuft auf AWS API Gateway)
3. ⚠️ **Fallback:** Falls AWS API ausfällt, gibt es keinen Fallback mehr
4. ⚠️ **GitHub Auto-Deploy:** Netlify Auto-Deploy funktioniert nicht mehr

### **Empfehlung:**
- ✅ **Sicher:** GitHub Webhook entfernen (kein Auto-Deploy mehr)
- ⚠️ **Vorsichtig:** Netlify Site löschen (nur wenn 100% sicher)
- ✅ **Optional:** Code bereinigen (Netlify-Referenzen entfernen)

---

## 📋 CHECKLISTE VOR DEM ABKLEMMEN

### **Technische Prüfungen:**
- [ ] AWS API Gateway erreichbar und funktioniert
- [ ] Alle API-Endpoints getestet (User Data, CV, Profile, etc.)
- [ ] Frontend auf `manuel-weiss.ch` funktioniert vollständig
- [ ] Login/Logout funktioniert
- [ ] Profile laden funktioniert
- [ ] CV Editor funktioniert
- [ ] Design Editor funktioniert
- [ ] PDF Export funktioniert
- [ ] Alle Buttons funktionieren
- [ ] Browser Console zeigt keine Netlify-Fehler

### **Code-Prüfungen:**
- [x] `USE_AWS_API = true` gesetzt
- [x] `API_BASE` ist gesetzt (nicht leer)
- [ ] Alle Seiten verwenden AWS API (keine Netlify-Calls)

### **DNS-Prüfungen:**
- [ ] `manuel-weiss.ch` zeigt auf CloudFront
- [ ] `www.manuel-weiss.ch` zeigt auf CloudFront
- [ ] Keine Netlify-DNS-Records mehr aktiv

---

## 🎯 EMPFOHLENE REIHENFOLGE

### **1. Tests durchführen (JETZT):**
```bash
# Alle Funktionen auf manuel-weiss.ch testen
# Browser Console prüfen
# API-Calls prüfen
```

### **2. GitHub Webhook entfernen (SICHER):**
```bash
# Netlify Auto-Deploy stoppen
# GitHub → Settings → Webhooks → Netlify Webhook löschen
```

### **3. Code bereinigen (OPTIONAL):**
```bash
# Netlify-Referenzen entfernen
# netlify.toml löschen
# netlify/functions/ löschen (optional)
```

### **4. Netlify Site löschen (NUR WENN 100% SICHER):**
```bash
# Netlify Dashboard → Site settings → Delete site
# ⚠️ ENDGÜLTIG - kann nicht rückgängig gemacht werden!
```

---

## ✅ NACH DEM ABKLEMMEN

### **Monitoring:**
- [ ] CloudWatch Logs prüfen (Lambda Functions)
- [ ] API Gateway Logs prüfen
- [ ] Website-Funktionalität weiterhin testen
- [ ] Fehler-Alerts einrichten (falls möglich)

### **Dokumentation aktualisieren:**
- [ ] `DEPLOYMENT_ARCHITEKTUR.md` aktualisieren
- [ ] `MIGRATION_STATUS_UND_SCHRITTE.md` aktualisieren
- [ ] README aktualisieren (falls vorhanden)

---

## 🚨 NOTFALL-PLAN

### **Falls nach dem Abklemmen Probleme auftreten:**

1. **Netlify wieder aktivieren:**
   - GitHub Webhook wieder hinzufügen
   - Netlify Site wieder erstellen (falls gelöscht)

2. **AWS API prüfen:**
   - CloudWatch Logs prüfen
   - API Gateway Logs prüfen
   - Lambda Function Logs prüfen

3. **Fallback aktivieren:**
   - `USE_AWS_API = false` setzen (temporär)
   - Netlify Functions wieder aktivieren

---

## ✅ FAZIT

**Aktueller Status:**
- ✅ AWS API ist aktiv und funktioniert
- ✅ Frontend läuft auf AWS S3 + CloudFront
- ⚠️ Netlify ist noch als Fallback aktiv (aber nicht verwendet)

**Empfehlung:**
1. ✅ **JETZT:** Finale Tests durchführen
2. ✅ **DANN:** GitHub Webhook entfernen (sicher)
3. ⚠️ **SPÄTER:** Netlify Site löschen (nur wenn 100% sicher)

**Risiko:** ⚠️ **NIEDRIG** (AWS ist primär, Netlify nur Fallback)

---

*Letzte Aktualisierung: 2026-01-21*  
*Status: ✅ Bereit für Netlify-Deaktivierung (nach finalen Tests)*
