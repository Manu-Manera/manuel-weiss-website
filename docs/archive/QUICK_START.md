# 🚀 Quick Start für Ihr AWS Free Account

## ⚠️ Warum ich mich nicht direkt verbinden kann:
- **Sicherheit**: Niemals AWS-Credentials teilen oder weitergeben
- **Best Practice**: Jeder behält die Kontrolle über sein eigenes AWS-Account
- **Privatsphäre**: Ihre Cloud-Ressourcen bleiben 100% privat

## ✅ So machen wir das Setup gemeinsam:

### **Schritt 1: AWS CLI installieren**
```bash
# macOS (mit Homebrew):
brew install awscli

# Windows: 
# Download: https://awscli.amazonaws.com/AWSCLIV2.msi

# Linux:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### **Schritt 2: AWS-Credentials aus Ihrem Account holen**
1. **AWS Console öffnen**: https://console.aws.amazon.com
2. **Oben rechts auf Ihren Namen klicken** → "Security credentials"
3. **"Access keys" → "Create access key"**
4. **Wählen Sie**: "Command Line Interface (CLI)"
5. **Notieren Sie sich**:
   - Access Key ID (öffentlich)
   - Secret Access Key (GEHEIM! Niemals teilen!)

### **Schritt 3: AWS CLI konfigurieren**
```bash
aws configure
```

**Eingeben:**
- AWS Access Key ID: [Ihr Key]
- AWS Secret Access Key: [Ihr Secret]
- Default region name: `eu-central-1` (Frankfurt - näher zu Deutschland)
- Default output format: `json`

### **Schritt 4: Test der Verbindung**
```bash
# Testen ob alles funktioniert:
aws sts get-caller-identity

# Sollte Ihre Account-ID anzeigen ✅
```

### **Schritt 5: Deployment starten**
```bash
# In Ihrem Projekt-Verzeichnis:
./deploy-aws.sh
```

## 🤝 Wie ich Ihnen helfe:

### **👀 Ich schaue mit:**
- Sie führen die Befehle aus
- Sie teilen mir die Ausgaben/Fehlermeldungen
- Ich erkläre jeden Schritt und helfe bei Problemen

### **🛠️ Ich helfe bei:**
- Fehlermeldungen interpretieren
- Konfiguration anpassen
- Troubleshooting
- Best Practices erklären

### **❌ Was ich NICHT tue:**
- Ihre Credentials verwenden
- Direkt in Ihrem Account arbeiten
- Zugriff auf Ihre Daten

---

## 🎯 Nächste Schritte:

1. **AWS CLI installieren** (siehe oben)
2. **Credentials konfigurieren** (siehe oben) 
3. **Mir Bescheid geben**: "AWS CLI ist konfiguriert"
4. **Gemeinsam deployen**: Ich leite Sie durch jeden Schritt!
