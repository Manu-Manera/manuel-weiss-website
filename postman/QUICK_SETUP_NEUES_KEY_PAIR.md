# 🚀 Quick Setup - Neues Key-Pair (Alles automatisch!)

## ✅ Was wurde automatisch gemacht

1. ✅ **Key Pair generiert**
2. ✅ **Public Key registriert** (Request 1)
3. ✅ **Challenge geholt** (Request 2)
4. ✅ **Challenge signiert**
5. ✅ **Token generiert** (Request 3)

**Alles fertig!** 🎉

---

## 📋 In Postman setzen

### Neue API Key ID:
```
9eadacab-bc87-4dff-8d01-e4862c654b45
```

### Schritt 1: apiKeyId setzen

1. **Postman → Environments**
2. **Variable:** `apiKeyId`
3. **Wert:** `9eadacab-bc87-4dff-8d01-e4862c654b45`
4. **Save**

### Schritt 2: Public Key setzen

**Führe aus:**
```bash
node scripts/format-key-for-postman.js keys/9eadacab-bc87-4dff-8d01-e4862c654b45-public-key.pem
```

**Kopiere den formatierten Key** und füge in Postman Environment Variable `publicKey` ein.

### Schritt 3: Private Key setzen

**Führe aus:**
```bash
node scripts/format-key-for-postman.js keys/9eadacab-bc87-4dff-8d01-e4862c654b45-private-key.pem
```

**Kopiere den formatierten Key** und füge in Postman Environment Variable `privateKey` ein.

---

## ✅ Fertig!

**Alles ist bereits erledigt:**
- ✅ Public Key ist registriert
- ✅ Keys sind generiert
- ✅ Token wurde generiert

**Du kannst jetzt direkt in Postman verwenden!**

---

## 🔄 Nächstes Mal

**Einfach ausführen:**
```bash
node scripts/complete-api-key-setup.js
```

**Das macht alles automatisch!** 🚀

