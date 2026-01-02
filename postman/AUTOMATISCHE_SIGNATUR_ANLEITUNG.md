# 🤖 Automatische Signatur-Generierung in Postman

## 🎯 Übersicht

Du kannst jetzt die Challenge automatisch in Postman signieren lassen, ohne manuell das Terminal zu verwenden!

---

## 📋 Option 1: Lokaler Signing-Server (Empfohlen)

### Schritt 1: Signing-Server starten

**Im Terminal:**
```bash
node scripts/sign-challenge-server.js
```

**Output:**
```
🔐 Challenge Signing Server läuft auf http://localhost:3001
```

**Wichtig:** Server muss während der Postman-Tests laufen!

### Schritt 2: In Postman verwenden

**Request 3 ("Get Token")** signiert jetzt automatisch:
1. **Führe Request 2 aus** ("Get Challenge")
2. **Führe Request 3 aus** ("Get Token")
3. **Signature wird automatisch generiert!** ✅

**Das Pre-request Script:**
- Prüft ob `signature` gesetzt ist
- Falls nicht, ruft automatisch den Signing-Server auf
- Generiert Signature und speichert sie in Environment Variable
- Request wird dann mit Signature ausgeführt

---

## 📋 Option 2: Signing-Server URL anpassen

Falls der Server auf einem anderen Port läuft:

1. **Environment Variable setzen:**
   - Variable: `signingServerUrl`
   - Wert: `http://localhost:3001/sign` (oder dein Port)

2. **Oder:** Ändere den Port beim Start:
   ```bash
   node scripts/sign-challenge-server.js 3002
   ```

---

## 🔄 Vollständiger Workflow

```
1. Signing-Server starten (Terminal):
   node scripts/sign-challenge-server.js
   
2. Request 1: Public Key registrieren ✅
   ↓
3. Request 2: Challenge anfordern ✅
   ↓
4. Request 3: Token generieren ✅
   (Signature wird automatisch generiert!)
```

**Viel einfacher!** 🎉

---

## ⚠️ Wichtige Hinweise

### Server muss laufen
- **Signing-Server muss während Postman-Tests laufen**
- Falls Server nicht erreichbar: Manuelle Signatur-Generierung wird angezeigt

### Sicherheit
- **Server nur lokal verwenden!**
- **Niemals in Produktion deployen!**
- Server hat Zugriff auf Private Keys

### Server stoppen
- **Ctrl+C** im Terminal
- Oder Terminal schließen

---

## 🆘 Troubleshooting

### Problem: "Signing-Server nicht erreichbar"

**Lösung:**
1. Prüfe ob Server läuft: `http://localhost:3001/sign` sollte erreichbar sein
2. Prüfe ob Port korrekt ist (Standard: 3001)
3. Starte Server erneut

### Problem: "Private key not found"

**Lösung:**
1. Prüfe ob Private Key existiert: `keys/<apiKeyId>-private-key.pem`
2. Prüfe ob `apiKeyId` korrekt ist
3. Generiere neue Keys falls nötig

### Problem: Server läuft, aber Signature wird nicht generiert

**Lösung:**
1. Prüfe Postman Console (unten) für Fehlermeldungen
2. Prüfe ob `challenge` und `apiKeyId` gesetzt sind
3. Prüfe Server-Logs im Terminal

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

## 🔄 Fallback: Manuelle Signatur

Falls der Server nicht läuft, zeigt Postman automatisch die Anleitung für manuelle Signatur-Generierung.

**Oder manuell:**
```bash
node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"
```

