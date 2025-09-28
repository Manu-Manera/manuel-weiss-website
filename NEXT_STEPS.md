# 🚀 Nächste Schritte - AWS Konfiguration

## ✅ Erfolgreich installiert auf Ihrem MacBook Pro:
- AWS CLI v2.31.3
- Node.js v20.19.4  
- npm v10.8.2
- Alle Dependencies für Lambda-Deployment

---

## 🔑 Jetzt: AWS-Credentials konfigurieren

### **Schritt 1: AWS-Credentials aus Ihrem Account holen**

1. **AWS Console öffnen**: https://console.aws.amazon.com
2. **Anmelden** mit Ihrem Free Account
3. **Oben rechts auf Ihren Namen klicken** → **"Security credentials"**
4. **Nach unten scrollen zu "Access keys"**
5. **"Create access key"** klicken
6. **Wählen**: "Command Line Interface (CLI)"
7. **Häkchen setzen**: "I understand the above recommendation..."
8. **"Next"** → **"Create access key"**

### **Schritt 2: Notieren Sie sich:**
- ✅ **Access Key ID** (z.B. AKIAIOSFODNN7EXAMPLE)
- ✅ **Secret Access Key** (z.B. wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY)

⚠️ **Wichtig**: Secret Access Key nur EINMAL angezeigt - jetzt notieren!

### **Schritt 3: Credentials konfigurieren**
```bash
aws configure
```

**Eingeben:**
- AWS Access Key ID: [Ihr Access Key]
- AWS Secret Access Key: [Ihr Secret Key]  
- Default region name: `eu-central-1` (Frankfurt)
- Default output format: `json`

### **Schritt 4: Test**
```bash
aws sts get-caller-identity
```

**Erwartete Ausgabe:**
```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012", 
    "Arn": "arn:aws:iam::123456789012:user/username"
}
```

---

## 🎯 Nach der Konfiguration:

**Sagen Sie mir Bescheid**: "AWS CLI ist konfiguriert"  
**Dann starten wir**: `./deploy-aws.sh` für das Multi-User-System!

---

## 💡 Tipps:

- **Account-ID teilen ist OK** (steht auch in URLs)
- **Access Keys NIEMALS öffentlich posten**
- **Bei Problemen**: Credentials neu erstellen
- **Free Tier**: 12 Monate kostenlos für die meisten Services
