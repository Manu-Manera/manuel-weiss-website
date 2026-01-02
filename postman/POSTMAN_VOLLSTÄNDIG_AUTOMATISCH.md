# 🤖 Postman - Vollständig automatisch (Kein Terminal nötig!)

## 🎯 Ziel

**Alles funktioniert automatisch in Postman - du musst NICHTS im Terminal machen!**

---

## ✅ Einmalige Einrichtung

### Schritt 1: Signing-Server starten (einmalig)

**Im Terminal (nur einmal):**

```bash
./scripts/start-signing-server.sh
```

**Oder manuell:**
```bash
node scripts/sign-challenge-server.js
```

**Wichtig:** Server muss laufen, während du Postman verwendest!

**Tipp:** Lass das Terminal-Fenster offen, während du Postman verwendest.

---

## 🚀 In Postman verwenden

### Workflow (alles automatisch):

1. **Request 1:** Public Key registrieren ✅
   - Klicke auf "Send"
   - Fertig!

2. **Request 2:** Challenge anfordern ✅
   - Klicke auf "Send"
   - Challenge wird automatisch gespeichert
   - Fertig!

3. **Request 3:** Token generieren ✅
   - Klicke auf "Send"
   - **Pre-request Script:**
     - Prüft ob `signature` gesetzt ist
     - Falls nicht: Ruft automatisch Signing-Server auf
     - Generiert Signature automatisch
     - Speichert in Environment Variable
   - Request wird mit Signature ausgeführt
   - Token wird automatisch gespeichert
   - **Fertig!** 🎉

**Das war's!** Du musst NICHTS mehr machen!

---

## 🔍 Wie es funktioniert

### Pre-request Script (Request 3):

1. **Prüft Variablen:**
   - `apiKeyId` ✅
   - `challenge` ✅
   - `signature` ❓

2. **Falls `signature` fehlt:**
   - Ruft `http://localhost:3001/sign` auf
   - Sendet: `{ challenge, apiKeyId }`
   - **Wartet auf Response** (bis zu 5 Sekunden)
   - Erhält: `{ signature }`
   - Speichert Signature in Environment Variable
   - Request wird mit Signature ausgeführt

3. **Falls Signing-Server nicht erreichbar:**
   - Zeigt Anleitung in Console
   - Request schlägt fehl (aber du siehst was zu tun ist)

---

## ⚠️ Wichtige Hinweise

### Server muss laufen
- **Signing-Server muss während Postman-Tests laufen**
- Falls Server nicht erreichbar: Request schlägt fehl
- Starte Server erneut falls nötig

### Timing
- **Challenge ist 60 Sekunden gültig**
- Request 2 → Request 3 sollte schnell passieren
- Signing-Server ist schnell (lokal), sollte kein Problem sein

### Server stoppen
```bash
lsof -ti:3001 | xargs kill
```

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
3. Prüfe Logs:
   ```bash
   tail -f /tmp/signing-server.log
   ```

### Problem: "Invalid signature"

**Lösung:**
1. Prüfe ob Challenge noch gültig ist (60 Sekunden)
2. Führe Request 2 erneut aus (neue Challenge)
3. Führe Request 3 SOFORT aus
4. Prüfe CloudWatch Logs für Details

### Problem: Server läuft, aber Signature wird nicht generiert

**Lösung:**
1. Prüfe Postman Console (unten) für Fehlermeldungen
2. Prüfe ob `challenge` und `apiKeyId` gesetzt sind
3. Prüfe Server-Logs:
   ```bash
   tail -f /tmp/signing-server.log
   ```

---

## ✅ Quick Start

```bash
# Terminal (einmalig): Signing-Server starten
./scripts/start-signing-server.sh

# Postman:
# 1. Request 1: Register Public Key → Send
# 2. Request 2: Get Challenge → Send
# 3. Request 3: Get Token → Send (Signature wird automatisch generiert!)
```

**Fertig!** 🎉

---

## 🔄 Alternative: Server automatisch starten

Du kannst auch ein Alias erstellen, das den Server automatisch startet:

```bash
# In ~/.zshrc:
alias postman-api-auth="cd '/Users/manumanera/Documents/GitHub/Persönliche Website' && ./scripts/start-signing-server.sh && echo '✅ Server gestartet! Jetzt Postman verwenden.'"
```

Dann einfach:
```bash
postman-api-auth
```

**Noch einfacher!** 🚀

