# ⚠️ Problem: Signature wird abgeschnitten

## ❌ Problem identifiziert

**Die Signature in Postman ist nur 54 Zeichen lang, sollte aber ~344 Zeichen sein!**

Das bedeutet, die Signature wurde abgeschnitten und ist unvollständig.

---

## 🔍 Ursachen

1. **Signing-Server sendet Signature nicht vollständig**
2. **Postman speichert Signature nicht vollständig**
3. **Signature wurde beim Kopieren abgeschnitten**

---

## ✅ Lösung

### Schritt 1: Prüfe Signing-Server

**Stelle sicher, dass der Signing-Server läuft:**

```bash
# Prüfe ob Server läuft
lsof -Pi :3001 -sTCP:LISTEN

# Falls nicht: Starte Server
./scripts/start-signing-server.sh
```

### Schritt 2: Prüfe Response von Request 2.5

**In Postman Console (unten):**

Nach Request 2.5 solltest du sehen:
- `Signature length: 344` (oder ähnlich, ~300-400 Zeichen)
- **NICHT:** `Signature length: 54` oder weniger!

**Falls Signature zu kurz ist:**
- ❌ Signing-Server sendet Signature nicht vollständig
- ❌ Postman speichert Signature nicht vollständig

### Schritt 3: Prüfe Environment Variable

**In Postman:**

1. **Öffne Environment Variables** (oben rechts)
2. **Prüfe `signature` Variable:**
   - Sollte ~344 Zeichen lang sein
   - Sollte vollständig sein (nicht abgeschnitten)

**Falls Signature abgeschnitten ist:**
- Kopiere die vollständige Signature aus Request 2.5 Response
- Füge sie manuell in Environment Variable ein

---

## 🔧 Quick Fix

### Option 1: Signature manuell kopieren

1. **Request 2.5:** Generate Signature → Send
2. **Kopiere die vollständige Signature** aus der Response (Body)
3. **Füge sie in Environment Variable `signature` ein**
4. **Request 3:** Get Token → Send

### Option 2: Signing-Server neu starten

```bash
# Stoppe Server (falls läuft)
pkill -f sign-challenge-server

# Starte Server neu
./scripts/start-signing-server.sh
```

### Option 3: Signature lokal generieren

```bash
# Hole Challenge aus Postman
# Dann:
node scripts/sign-challenge.js "<challenge>" "keys/9eadacab-bc87-4dff-8d01-e4862c654b45-private-key.pem"

# Kopiere die vollständige Signature
# Füge sie in Postman Environment Variable ein
```

---

## 📋 Checkliste

- [ ] Signing-Server läuft (Port 3001)
- [ ] Request 2.5 Response zeigt Signature length: ~344
- [ ] Environment Variable `signature` ist vollständig (~344 Zeichen)
- [ ] Signature wurde nicht abgeschnitten

---

## 🆘 Wenn nichts hilft

**Generiere Signature lokal:**

```bash
# Hole Challenge aus Postman (Request 2 Response)
# Dann:
node scripts/sign-challenge.js "<challenge>" "keys/9eadacab-bc87-4dff-8d01-e4862c654b45-private-key.pem"
```

**Kopiere die vollständige Signature und füge sie in Postman Environment Variable ein.**

