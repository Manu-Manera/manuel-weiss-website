# 🔓 Lambda-Entsperrung: Anleitung

> **Status:** Lambda blockiert (AccessDeniedException)  
> **Account:** 038333965110  
> **Region:** eu-central-1

---

## 🔍 Problem

```bash
$ aws lambda list-functions --region eu-central-1
An error occurred (AccessDeniedException) when calling the ListFunctions operation: None
```

**Andere Services funktionieren:**
- ✅ S3: Zugriff funktioniert
- ✅ API Gateway: Zugriff funktioniert
- ✅ CloudFormation: Zugriff funktioniert
- ❌ Lambda: Blockiert

---

## 🎯 Lösungsansätze

### **Option 1: AWS Console Support (Empfohlen)**

1. **AWS Console öffnen:**
   - https://console.aws.amazon.com/support/home
   - Oder: https://console.aws.amazon.com/support/cases

2. **Support Case erstellen:**
   - **Kategorie:** "Account and billing support"
   - **Service:** "Lambda"
   - **Subject:** `Lambda AccessDeniedException - Account 038333965110`
   - **Description:** Siehe unten

3. **Beschreibung einfügen:**
   ```
   My AWS account (038333965110) shows AccessDeniedException when trying to access Lambda services.
   
   Error Details:
   - Error: AccessDeniedException when calling ListFunctions operation
   - Region: eu-central-1
   - Account: 038333965110
   - Service: AWS Lambda
   
   Context:
   - I'm migrating my website (manuel-weiss.ch) from Netlify to AWS
   - I have prepared 39 Lambda functions in my CDK stack
   - The CDK stack deployment fails because Lambda access is blocked
   - Other AWS services (S3, API Gateway, CloudFormation) work correctly
   
   Request:
   Please help resolve this issue and restore Lambda access for my account.
   
   Thank you!
   ```

4. **Severity:** Normal
5. **Submit**

---

### **Option 2: IAM Permissions prüfen**

Falls es ein IAM-Problem ist (nicht Account-Blockade):

```bash
# Aktuellen User prüfen
aws sts get-caller-identity

# IAM Policies prüfen
aws iam list-attached-user-policies --user-name YOUR_USERNAME
aws iam list-user-policies --user-name YOUR_USERNAME

# Lambda Permissions benötigt:
# - lambda:ListFunctions
# - lambda:GetFunction
# - lambda:CreateFunction
# - lambda:UpdateFunction
# - lambda:DeleteFunction
```

**Falls Permissions fehlen:**
- IAM Policy mit Lambda-Permissions hinzufügen
- Oder: AdministratorAccess Policy verwenden

---

### **Option 3: Billing Console prüfen**

1. **AWS Billing Console:**
   - https://console.aws.amazon.com/billing/home

2. **Prüfen:**
   - Account Status
   - Offene Rechnungen
   - Payment Methods
   - Service Limits

3. **Falls Billing-Problem:**
   - Payment Method aktualisieren
   - Offene Rechnungen bezahlen
   - Account Limits prüfen

---

### **Option 4: Account Status prüfen**

```bash
# Account Contact Information
aws account get-contact-information

# Account Details (falls Organizations)
aws organizations describe-account --account-id 038333965110
```

---

## 📋 Support Case Details

**Falls Premium Support verfügbar:**

```bash
aws support create-case \
  --subject "Lambda AccessDeniedException - Account 038333965110" \
  --service-code "amazon-lambda" \
  --severity-code "normal" \
  --category-code "account-and-billing-support" \
  --communication-body "Siehe Beschreibung oben" \
  --region us-east-1
```

**Hinweis:** Premium Support Subscription erforderlich!

---

## ✅ Nach Entsperrung

1. **Lambda-Zugriff testen:**
   ```bash
   aws lambda list-functions --region eu-central-1 --max-items 5
   ```

2. **CDK Deploy:**
   ```bash
   cd infrastructure
   npx cdk deploy -a "npx ts-node bin/website-api.ts" manuel-weiss-website-api
   ```

3. **Frontend konfigurieren:**
   - `js/aws-app-config.js`: `USE_AWS_API = true`
   - API URL aus CDK Output eintragen

4. **Weitere Schritte:** Siehe `MIGRATION_STATUS_UND_SCHRITTE.md`

---

## 🔗 Links

- **AWS Support Console:** https://console.aws.amazon.com/support/home
- **Billing Console:** https://console.aws.amazon.com/billing/home
- **IAM Console:** https://console.aws.amazon.com/iam/home
- **Lambda Console:** https://console.aws.amazon.com/lambda/home

---

*Erstellt: 2026-01-21*  
*Status: Lambda blockiert, Support-Anfrage vorbereitet*
