# 🤖 Postman - Vollständig automatischer Workflow

## ⚠️ WICHTIG: Environment Setup (einmalig)

**Damit deine Werte (Public Key, Private Key, etc.) beim Neuladen der Collection erhalten bleiben:**

1. **Importiere das Environment:** `API-Key-Authentication.postman_environment.json`
2. **Aktiviere das Environment** (Dropdown oben rechts)
3. **Setze deine Werte** (apiKeyId, publicKey, privateKey) im Environment
4. **Fertig!** - Jetzt kannst du die Collection beliebig oft neu laden, ohne Werte zu verlieren!

**📖 Detaillierte Anleitung:** Siehe `ENVIRONMENT_SETUP_ANLEITUNG.md`

---

## 🎯 Lösung: Separater Request für Signature

**Problem:** Postman Pre-request Scripts können nicht zuverlässig auf asynchrone Requests warten.

**Lösung:** Separater Request, der die Signature generiert!

---

## ✅ Neuer Workflow (alles in Postman)

### Schritt 1: Signing-Server starten (einmalig)

**Im Terminal:**
```bash
./scripts/start-signing-server.sh
```

**Oder:**
```bash
node scripts/sign-challenge-server.js
```

### Schritt 2: In Postman (alles automatisch)

1. **Request 1:** Register Public Key → Send ✅
2. **Request 2:** Get Challenge → Send ✅
   - Challenge wird automatisch gespeichert
3. **Request 2.5:** Generate Signature (automatisch) → Send ✅
   - Ruft Signing-Server auf
   - Generiert Signature automatisch
   - Speichert in Environment Variable
4. **Request 3:** Get Token → Send ✅
   - Signature ist bereits gesetzt
   - Token wird generiert

**Das war's!** 🎉

---

## 🔍 Wie es funktioniert

### Request 2.5: "Generate Signature (automatisch)"

**Was macht er:**
- Ruft `http://localhost:3001/sign` auf
- Sendet: `{ challenge, apiKeyId }`
- Erhält: `{ signature }`
- Speichert Signature automatisch in Environment Variable

**Test Script:**
- Prüft ob Response 200 ist
- Prüft ob Signature vorhanden ist
- Speichert Signature automatisch

### Request 3: "Get Token"

**Pre-request Script:**
- Prüft ob `signature` gesetzt ist
- Falls nicht: Zeigt Anleitung (führe Request 2.5 aus)
- Request wird mit Signature ausgeführt

---

## ⚠️ Wichtige Hinweise

### Server muss laufen
- **Signing-Server muss während Postman-Tests laufen**
- Falls Server nicht erreichbar: Request 2.5 schlägt fehl
- Starte Server erneut falls nötig

### Workflow-Reihenfolge
1. Request 1 (Register)
2. Request 2 (Challenge)
3. **Request 2.5 (Signature)** ← Wichtig!
4. Request 3 (Token)

**Request 2.5 nicht vergessen!**

---

## 🆘 Troubleshooting

### Problem: "Signing-Server nicht erreichbar"

**Lösung:**
1. Prüfe ob Server läuft:
   ```bash
   lsof -Pi :3001 -sTCP:LISTEN
   ```
2. Falls nicht: Starte Server:
   ```bash
   ./scripts/start-signing-server.sh
   ```

### Problem: "Signature fehlt" in Request 3

**Lösung:**
1. Führe Request 2.5 aus ("Generate Signature")
2. Prüfe ob Signature in Environment Variable gesetzt ist
3. Führe Request 3 erneut aus

---

## ✅ Quick Start

```bash
# Terminal (einmalig): Server starten
./scripts/start-signing-server.sh

# Postman:
# 1. Request 1: Register Public Key → Send
# 2. Request 2: Get Challenge → Send
# 3. Request 2.5: Generate Signature → Send (NEU!)
# 4. Request 3: Get Token → Send
```

**Viel einfacher!** 🎉

---

## 💡 Warum Request 2.5?

**Postman's Pre-request Scripts sind asynchron** und können nicht zuverlässig auf HTTP-Requests warten. Ein separater Request ist die zuverlässigste Lösung!

**Vorteile:**
- ✅ Funktioniert zuverlässig
- ✅ Siehst genau was passiert
- ✅ Kann manuell wiederholt werden
- ✅ Keine Timing-Probleme

**Nachteile:**
- ⚠️ Ein zusätzlicher Request (aber schnell!)

---

## 🔄 Alternative: Automatisch mit Script

Falls du lieber ein Script verwendest:

```bash
node scripts/complete-api-key-setup.js
```

**Das macht alles automatisch** (außerhalb von Postman).

Aber mit Request 2.5 ist es auch in Postman automatisch! 🚀

