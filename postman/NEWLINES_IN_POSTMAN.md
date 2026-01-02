# 📋 Newlines in Postman - Das ist normal!

## ✅ Gute Nachricht

**Postman zeigt Newlines als "Enter-Zeichen" an - das ist normal und sollte funktionieren!**

Postman:
- ✅ **Zeigt** Newlines im Editor als echte Zeilenumbrüche an (für bessere Lesbarkeit)
- ✅ **Escaped** Newlines automatisch beim Senden des Requests (als `\n` im JSON)

## 🔍 So funktioniert es

### Im Postman Editor:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...
QIDAQAB
-----END PUBLIC KEY-----
```
*(Sieht aus wie echte Newlines)*

### Beim Senden (tatsächlich gesendet):
```json
{
  "apiKeyId": "...",
  "publicKey": "-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\\n...\\nQIDAQAB\\n-----END PUBLIC KEY-----"
}
```
*(Newlines sind escaped als `\n`)*

## ✅ Testen

1. **Füge den Public Key ein** (mit Newlines, wie sie angezeigt werden)
2. **Klicke auf Save**
3. **Führe Request aus:** "1. Register Public Key"
4. **Sollte funktionieren!** ✅

Die Lambda-Funktion kann jetzt auch echte Newlines verarbeiten, falls Postman sie nicht escaped.

## 🔍 Prüfen ob es funktioniert

### Option 1: Request ausführen
- Führe "1. Register Public Key" aus
- Sollte `{"success": true, ...}` zurückgeben

### Option 2: Request Body prüfen
1. **Klicke auf "Body" Tab** im Request
2. **Prüfe den JSON:**
   - Newlines sollten als `\n` angezeigt werden
   - Oder als echte Zeilenumbrüche (beides sollte funktionieren)

## ⚠️ Falls es nicht funktioniert

### Problem: "Invalid JSON in request body"

**Lösung 1:** Postman escaped nicht automatisch
- Verwende das Formatierungs-Script:
  ```bash
  node scripts/format-key-for-postman.js keys/<apiKeyId>-public-key.pem
  ```
- Kopiere den formatierten Key (mit `\n` escaped)
- Füge in Postman ein

**Lösung 2:** Key manuell formatieren
1. Öffne Text-Editor
2. Füge Key ein
3. Ersetze alle Newlines: `\n` → `\\n`
4. Kopiere und füge in Postman ein

## 📝 Zusammenfassung

- ✅ **Newlines als "Enter-Zeichen" anzeigen ist normal**
- ✅ **Postman escaped sie automatisch beim Senden**
- ✅ **Lambda-Funktion kann beide Formate verarbeiten**
- ✅ **Einfach Request ausführen und testen!**

**Das sollte funktionieren!** 🎉

