# Postman Setup - API Key Authentication

## 🚀 Quick Start

### 1. Environment Setup (einmalig)

```bash
# Keys automatisch in Environment schreiben
node scripts/update-postman-environment.js
```

### 2. In Postman

1. **Importiere Environment:** `API-Key-Authentication.postman_environment.json`
2. **Importiere Collection:** `API-Key-Authentication.postman_collection.json`
3. **Aktiviere Environment** (Dropdown oben rechts)

### 3. Workflow

1. **Request 1:** Register Public Key → Send
2. **Request 2:** Get Challenge → Send
3. **Request 2.5:** Generate Signature → Send (**SOFORT!**)
4. **Request 3:** Get Token → Send (**SOFORT!**)

**Wichtig:** Requests 2, 2.5 und 3 sollten innerhalb von 10 Sekunden ausgeführt werden!

---

## 📋 Wichtige Dateien

- `API-Key-Authentication.postman_collection.json` - Postman Collection
- `API-Key-Authentication.postman_environment.json` - Environment Variables
- `KEYS_AUTOMATISCH_SETZEN.md` - Detaillierte Anleitung für Keys
- `POSTMAN_AUTOMATISCH_WORKFLOW.md` - Workflow-Anleitung
- `ENVIRONMENT_SETUP_ANLEITUNG.md` - Environment Setup

---

## 🔧 Scripts

- `scripts/complete-api-key-setup.js` - Generiert Key-Pair und testet kompletten Flow
- `scripts/update-postman-environment.js` - Schreibt Keys automatisch in Environment-File

---

## ⚠️ Troubleshooting

**Problem: "Invalid signature"**
- Führe Requests 2, 2.5 und 3 schnell nacheinander aus (innerhalb von 10 Sekunden)
- Challenge ist nur 60 Sekunden gültig

**Problem: Keys gehen verloren**
- Verwende Environment Variables (nicht Collection Variables)
- Importiere Environment erneut nach Collection-Update
