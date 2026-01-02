# 🤖 Automatische Signatur - Komplett Setup

## 🎯 Ziel

**Signature und Challenge werden automatisch generiert - du musst NICHTS mehr manuell eingeben!**

---

## 📋 Schritt 1: Signing-Server starten

**Im Terminal (Cursor):**

```bash
node scripts/sign-challenge-server.js
```

**Output:**
```
🔐 Challenge Signing Server
📁 Keys-Verzeichnis: /path/to/keys
🔐 Challenge Signing Server läuft auf http://localhost:3001
```

**Wichtig:** Server muss während der Postman-Tests laufen!

**Tipp:** Lass das Terminal-Fenster offen, während du Postman verwendest.

---

## 📋 Schritt 2: In Postman verwenden

### Workflow:

1. **Request 1:** Public Key registrieren ✅
2. **Request 2:** Challenge anfordern ✅
   - Challenge wird automatisch in Environment Variable gespeichert
3. **Request 3:** Token generieren ✅
   - **Pre-request Script:**
     - Prüft ob `signature` gesetzt ist
     - Falls nicht: Ruft automatisch Signing-Server auf
     - Generiert Signature automatisch
     - Speichert in Environment Variable
   - Request wird mit Signature ausgeführt

**Das war's!** 🎉

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

### Sicherheit
- **Server nur lokal verwenden!**
- **Niemals in Produktion deployen!**
- Server hat Zugriff auf Private Keys

---

## 🆘 Troubleshooting

### Problem: "Signing-Server nicht erreichbar"

**Lösung:**
1. Prüfe ob Server läuft: `http://localhost:3001/sign` sollte erreichbar sein
2. Prüfe ob Port korrekt ist (Standard: 3001)
3. Starte Server erneut:
   ```bash
   node scripts/sign-challenge-server.js
   ```

### Problem: "Private key not found"

**Lösung:**
1. Prüfe ob Private Key existiert: `keys/<apiKeyId>-private-key.pem`
2. Prüfe ob `apiKeyId` korrekt ist
3. Generiere neue Keys falls nötig:
   ```bash
   node scripts/generate-keypair.js
   ```

### Problem: "Invalid signature" trotz automatischer Generierung

**Lösung:**
1. Prüfe ob Challenge noch gültig ist (60 Sekunden)
2. Prüfe ob Public Key und Private Key zusammenpassen
3. Prüfe CloudWatch Logs für Details
4. Teste lokal:
   ```bash
   node scripts/test-signature.js "<challenge>" "<signature>" "keys/<apiKeyId>-public-key.pem"
   ```

---

## ✅ Quick Start

```bash
# Terminal 1: Signing-Server starten
node scripts/sign-challenge-server.js

# Postman:
# 1. Request 1: Register Public Key
# 2. Request 2: Get Challenge
# 3. Request 3: Get Token (Signature wird automatisch generiert!)
```

**Fertig!** 🎉

---

## 🔄 Alternative: Manuelle Signatur (falls Server nicht läuft)

Falls der Server nicht läuft, zeigt Postman automatisch die Anleitung für manuelle Signatur-Generierung.

**Oder manuell:**
```bash
# Challenge in Datei speichern:
echo "<challenge>" > challenge.txt

# Signiere:
node scripts/sign-challenge.js --file challenge.txt "keys/<apiKeyId>-private-key.pem"
```

Aber mit Signing-Server ist es viel einfacher! 🚀

