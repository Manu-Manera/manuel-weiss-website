# AWS Support Case: Lambda AccessDeniedException

> **Erstellt:** 2026-01-21  
> **Zweck:** Lambda-Entsperrung für Netlify → AWS Migration

---

## 📋 Support Case Details

### **Subject:**
```
AWS Services blocked - Lambda AccessDeniedException
```

### **Service Code:**
```
amazon-lambda
```

### **Severity:**
```
normal
```

### **Category:**
```
service-limit-increase
```
(oder: `account-and-billing-support` falls es ein Billing-Problem ist)

---

## 📝 Communication Body

```
My AWS account (038333965110) shows AccessDeniedException when trying to access Lambda services. 

I need to deploy Lambda functions for my website migration from Netlify to AWS.

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
Please help resolve this billing/security issue and restore Lambda access for my account.

Thank you!
```

---

## 🔧 Alternative: AWS Console

Falls CLI nicht funktioniert, über AWS Console:

1. **AWS Console öffnen**: https://console.aws.amazon.com/support/home
2. **"Create case"** klicken
3. **Kategorie wählen**: "Account and billing support"
4. **Service wählen**: "Lambda"
5. **Subject**: `AWS Services blocked - Lambda AccessDeniedException`
6. **Description**: Den Text aus "Communication Body" oben einfügen
7. **Severity**: Normal
8. **Submit**

---

## 📊 Zusätzliche Informationen für Support

### **Account Details:**
- Account ID: `038333965110`
- Region: `eu-central-1`
- Service: `AWS Lambda`

### **Fehler:**
```bash
$ aws lambda list-functions --region eu-central-1 --max-items 5
An error occurred (AccessDeniedException) when calling the ListFunctions operation: None
```

### **Was funktioniert:**
- ✅ S3: `aws s3 ls` funktioniert
- ✅ API Gateway: `aws apigateway get-rest-apis` funktioniert
- ✅ CloudFormation: `aws cloudformation describe-stacks` funktioniert
- ❌ Lambda: `aws lambda list-functions` → AccessDeniedException

### **CloudFormation Stacks:**
- `manuel-weiss-website-api`: ROLLBACK_COMPLETE (fehlgeschlagen wegen Lambda)
- `manuel-weiss-profile-media`: UPDATE_ROLLBACK_COMPLETE (fehlgeschlagen)
- `manuel-weiss-simple-stack`: CREATE_COMPLETE (erfolgreich)

### **Zweck:**
- Migration von Netlify zu AWS
- 39 Lambda Functions vorbereitet
- CDK Stack bereit zum Deploy
- Blockade verhindert Migration

---

## 🔄 Nach Support-Antwort

Sobald Lambda entsperrt ist:

1. **Lambda-Zugriff testen:**
   ```bash
   aws lambda list-functions --region eu-central-1 --max-items 5
   ```

2. **CDK Deploy ausführen:**
   ```bash
   cd infrastructure
   npx cdk deploy -a "npx ts-node bin/website-api.ts" manuel-weiss-website-api
   ```

3. **Frontend konfigurieren:**
   - `js/aws-app-config.js`: `USE_AWS_API = true`
   - API URL aus CDK Output eintragen

4. **Weitere Schritte:** Siehe `MIGRATION_STATUS_UND_SCHRITTE.md`

---

*Letzte Aktualisierung: 2026-01-21*
