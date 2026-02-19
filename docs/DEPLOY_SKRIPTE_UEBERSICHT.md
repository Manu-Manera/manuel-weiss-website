# Deploy-Skripte – Übersicht

Alle im Projekt vorhandenen Deployment-Skripte, Stand der Dateien.

---

## Im Projektroot (aktiv)

| Skript | Zweck |
|--------|--------|
| **deploy-aws-website.sh** | **Static Website → AWS:** Nur S3-Sync + CloudFront-Invalidierung (manuel-weiss.ch). Kein Git. |
| **🚀_DEPLOY_ALL.sh** | Frontend: Git Commit/Push + S3-Sync + CloudFront. Backend-Hinweis: siehe deploy-user-profile-lambda.sh. |
| **deploy-user-profile-lambda.sh** | User-Profile-Lambda packen und nach AWS deployen. |
| **deploy-contact-email-api.sh** | Contact-Email-API-Lambda deployen. |
| **deploy-api-key-auth.sh** | API-Key-Auth-Lambda deployen. |
| **deploy-admin-user-management.sh** | Admin-User-Management-Lambda deployen. |
| **deploy-aws-auth.sh** | AWS Cognito Auth (CDK Stack) deployen. |

---

## In Unterordnern

| Skript | Zweck |
|--------|--------|
| **deploy/deploy-profile-media.sh** | SAM-Stack für Profile Media (Profilbilder) deployen (aus infrastructure/). |
| **deploy/production-setup.sh** | AI Investment System: Env-Check, Build, CDK deploy --all, Lambda deploy. |
| **lambda/deploy-aws-backend.sh** | Backend: Profile-API + Documents-API Lambda + API Gateway deployen. |

---

## Im Archiv (scripts/archive/)

Kopien bzw. ältere Versionen der Root-Skripte, plus:

| Skript | Zweck |
|--------|--------|
| **deploy-website-api.sh** | CDK: nur Stack „manuel-weiss-website-api“ deployen (Lambda/API). Pfad im Script: `cd .../infrastructure` (von archive aus ggf. anpassen). |
| **deploy-upload-server.sh** | (Upload-Server-Deploy.) |
| **deploy-ocr-server.sh** | (OCR-Server-Deploy.) |
| **deploy-github.sh** | (Archiv) |

---

## Für „nur Website live“ (manuel-weiss.ch)

- **Nur Static Site deployen:**  
  `./deploy-aws-website.sh`  
  (S3 + CloudFront, kein Git.)

- **Mit Git + AWS:**  
  `./🚀_DEPLOY_ALL.sh`  
  (Commit/Push + S3 + CloudFront.)

---

## Backend / API

- **Website-API (Lambda + API Gateway):**  
  Aus `infrastructure/`:  
  `npx cdk deploy -a "npx ts-node bin/website-api.ts" manuel-weiss-website-api`  
  Oder Script aus archive nutzen (Pfad zu `infrastructure` prüfen).

- **User-Profile-Lambda:**  
  `./deploy-user-profile-lambda.sh`

- **Weitere Lambdas:**  
  Siehe Tabelle oben (deploy-contact-email-api.sh, deploy-api-key-auth.sh, …).
