# Tempus-Demo: Speichern nur über AWS — eine Quelle, klare Kette

## Wo die Wahrheit im Repo steht

| Bestandteil | Datei / Ausgabe |
|-------------|-----------------|
| **API-Basis-URL (Stage v1)** | `infrastructure/cdk-outputs.json` → `WebsiteApiUrl` = `https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/` |
| **Routen** | `infrastructure/lib/website-api-stack.ts` — `GET`/`POST` auf `/demo-script` und `/demo-script/rm` → eine Lambda, Code unter `lambda/demo-script-api/` |
| **S3-Objekte** | `s3://manuel-weiss-website/data/tempus-demo-pm-state.json` bzw. `…-rm-state.json` (Lambda schreibt per IAM) |
| **Frontend (Demos)** | `Onboarding Valkeen/onboarding-app/public/tempus-demo-pm.html` & `tempus-demo-rm.html` — `WEBSITE_API_BASE` muss **identisch** zur CDK-`WebsiteApiUrl` sein (ohne Slash am Ende) |

Die HTML-Dateien bauen daraus:

- PM: `POST ${WEBSITE_API_BASE}/demo-script`
- RM: `POST ${WEBSITE_API_BASE}/demo-script/rm`

**Fallback (immer noch AWS):** Presigned-PUT auf dasselbe S3-Objekt — kein `localhost`, nur S3-REST.

---

## Prüfung Live-Zustand (so erkennt man die Lücke)

Wenn `POST` mit **HTTP 403** und Body `{"message":"MissingAuthenticationToken"}` antwortet, fehlt die **Ressource** in API Gateway für diesen Pfad (oder es wird eine falsche Base-URL aufgerufen).

Wenn `POST` **403** mit `{"error":"Ungültiges Passwort"}` liefert, ist die **Route lebendig** — dann stimmt `X-Demo-Password` nicht (Lambda-Env / Konstante in HTML).

Erwartet nach vollständigem Wire-up: siehe `docs/RECOVERY_demo-script-lambda.md` → Abschnitt 6 (curl-Tests).

---

## Vollständige AWS-Kette (Reihenfolge)

1. **Lambda** `website-demo-script-api` muss im Konto **existieren** (Code: `lambda/demo-script-api/`, Env: `S3_BUCKET`, `EDIT_PASSWORD`).  
   - Manuell: `docs/RECOVERY_demo-script-lambda.md` Abschnitt 2–3.  
   - Oder: `cd infrastructure && npx cdk deploy …` sobald das Konto **Lambda-Deployments** zuverlässig erlaubt (Hintergrund: Rollback/Quota — siehe gleiche Doku, Abschnitt 0).
2. **API Gateway** muss Ressourcen `/demo-script` und `/demo-script/rm` mit **Lambda-Proxy-Integration** haben und **Stage `v1`** muss **neu deployt** sein.  
   - Manuell: RECOVERY Abschnitt 5.  
   - Oder: über denselben CDK-Stack wie in `website-api-stack.ts` deployen, sobald (1) mit dem Stack konsistent deploybar ist.
3. **Berechtigung:** `lambda:InvokeFunction` von `apigateway.amazonaws.com` auf genau diese API (in RECOVERY Abschnitt 5.4 / CDK: automatisch).

Ohne (1)–(2) funktioniert **nur** der Presigned-S3-Fallback in den HTML-Dateien; das ist weiterhin **AWS (S3)**, kein `localhost`.

---

## Was nicht dazu gehört

- **Lokaler Vite-Port** (`localhost:3000`) — nur Entwicklungs-Server, **keine** Speicher-URL in den Public-Demos. Produktion: `https://manuel-weiss.ch/onboarding/...` → gleicher `Origin` wie `https://manuel-weiss.ch` (CORS in API Gateway + Lambda-Origins-Liste muss `https://manuel-weiss.ch` enthalten; siehe `website-api-stack.ts` + `lambda/demo-script-api/index.js`).

---

## Kurz: Änderung im Repo bei neuer API-ID

1. `cdk deploy` liefert neue `WebsiteApiUrl` in `infrastructure/cdk-outputs.json` (oder Cfn-Outputs).  
2. In `tempus-demo-pm.html` / `tempus-demo-rm.html` nur **`WEBSITE_API_BASE`** anpassen (ein String).  
3. Presigned-URLs in denselben Dateien ggf. mit `./refresh-demo-state-url.sh` erneuern (S3-Signatur, 7 Tage).
