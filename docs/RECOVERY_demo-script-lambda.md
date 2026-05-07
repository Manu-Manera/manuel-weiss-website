# Recovery-Anleitung: `website-demo-script-api` Lambda + API-Route wiederherstellen

> **Für wen:** Für einen KI-Agenten oder Entwickler, der diese Aufgabe **ohne Vorwissen** durchführen soll.
> **Wann:** Sobald AWS wieder Lambda-Schreibzugriffe im Konto **038333965110** erlaubt (aktuell geblockt, siehe Abschnitt 0).
> **Ergebnis:** `tempus-demo-pm.html` speichert wieder über API (kein 7-Tage-Token-Limit mehr), Fallback auf Presigned-PUT bleibt bestehen.

---

## 0. Vorbedingung: AWS-Sperre prüfen (MUSS zuerst)

Bevor du irgendetwas tust: Teste, ob AWS überhaupt Lambda-Writes erlaubt. Wenn nicht, brich ab und sag Bescheid.

```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"

# Test-Call mit existierender Lambda (harmlos, ändert nur Description):
aws lambda update-function-configuration \
  --function-name website-flashcards-api \
  --description "recovery-preflight-$(date +%s)" \
  --region eu-central-1 2>&1 | head -3
```

**Erwartete Ausgänge:**
- ✅ **JSON-Response mit `FunctionName`, `LastUpdateStatus`** → AWS erlaubt Writes, weiter mit Abschnitt 1.
- ❌ **`An error occurred (AccessDeniedException) ... operation: None`** → AWS blockt immer noch. **STOPP. NICHT WEITERMACHEN.** Dem User sagen: "AWS Lambda-Write ist weiterhin auf Kontoebene geblockt, Support-Case abwarten. Anleitung `docs/RECOVERY_demo-script-lambda.md` ist ready für später."

**Wenn geblockt**: Siehe letzter Abschnitt „Hintergrund/Diagnose" — dort sind alle Tests dokumentiert die der User in der AWS-Konsole durchgehen muss (Billing, Support-Case).

---

## 1. Umgebungs-Check

Stelle sicher, dass diese Dinge stimmen. Wenn irgendwas abweicht → STOPP und Bescheid sagen.

```bash
# 1.1 Richtiges Verzeichnis
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"
pwd
# Erwartet: /Users/manumanera/Documents/GitHub/Persönliche Website

# 1.2 AWS-Identity = cdk-deploy-admin im Konto 038333965110
aws sts get-caller-identity --query '[Account,Arn]' --output text
# Erwartet: 038333965110	arn:aws:iam::038333965110:user/cdk-deploy-admin

# 1.3 AWS-Region = eu-central-1 (Default)
aws configure get region
# Erwartet: eu-central-1

# 1.4 Quell-Dateien vorhanden
ls lambda/demo-script-api/index.js lambda/demo-script-api/package.json
# Erwartet: beide Dateien existieren
```

---

## 2. Lambda-Deployment-Paket bauen

```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website/lambda/demo-script-api"

# Saubere Neuinstallation der Dependencies (nur Runtime, kein Dev):
rm -rf node_modules package-lock.json
npm install --omit=dev --silent

# ZIP erstellen (im lambda/-Verzeichnis, nicht innerhalb von demo-script-api/):
rm -f ../demo-script-api.zip
zip -qr ../demo-script-api.zip .

# Größe prüfen — muss > 1 MB (sonst fehlt @aws-sdk/client-s3) und < 50 MB:
ls -la ../demo-script-api.zip
# Erwartet: ca. 3–4 MB

cd "/Users/manumanera/Documents/GitHub/Persönliche Website"
```

---

## 3. Lambda anlegen

Zwei Fälle: **Funktion existiert bereits** (nur Code updaten) oder **existiert nicht** (neu anlegen).

### 3.1 Fall-Check

```bash
aws lambda get-function \
  --function-name website-demo-script-api \
  --region eu-central-1 \
  --query 'Configuration.FunctionName' --output text 2>&1
```

- **Output `website-demo-script-api`** → Funktion existiert, **weiter mit 3.3 (Update)**.
- **Output enthält `ResourceNotFoundException`** → Funktion existiert nicht, **weiter mit 3.2 (Create)**.

### 3.2 Create (wenn nicht existiert)

```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"

aws lambda create-function \
  --function-name website-demo-script-api \
  --runtime nodejs18.x \
  --role arn:aws:iam::038333965110:role/manuel-weiss-website-api-WebsiteLambdaRole06E6525E-azbaEVqHxw0y \
  --handler index.handler \
  --timeout 30 \
  --memory-size 256 \
  --environment "Variables={S3_BUCKET=manuel-weiss-website,EDIT_PASSWORD=tempus-demo-edit-2024}" \
  --zip-file fileb://lambda/demo-script-api.zip \
  --region eu-central-1 \
  --query '[FunctionName,FunctionArn,State]' --output text
```

**Erwartet:**
```
website-demo-script-api    arn:aws:lambda:eu-central-1:038333965110:function:website-demo-script-api    Pending
```

→ Warten, bis `State = Active`:
```bash
aws lambda wait function-active --function-name website-demo-script-api --region eu-central-1
```

**Wenn Rolle nicht mehr existiert**: mit diesem Befehl alle Rollen finden die passen könnten:
```bash
aws iam list-roles --query "Roles[?contains(RoleName, 'WebsiteLambda')].[RoleName,Arn]" --output table
```
Den **genauen Arn** nehmen und oben `--role ...` ersetzen.

### 3.3 Update (wenn existiert)

```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"

aws lambda update-function-code \
  --function-name website-demo-script-api \
  --zip-file fileb://lambda/demo-script-api.zip \
  --region eu-central-1 \
  --query '[FunctionName,LastUpdateStatus]' --output text

aws lambda wait function-updated --function-name website-demo-script-api --region eu-central-1
```

---

## 4. Lambda direkt testen (vor API-Gateway)

```bash
cd /tmp

# 4.1 GET-Request simulieren (Event-Payload für Lambda):
cat > /tmp/test-get.json <<'EOF'
{"httpMethod":"GET","headers":{"origin":"https://manuel-weiss.ch"}}
EOF

aws lambda invoke \
  --function-name website-demo-script-api \
  --region eu-central-1 \
  --cli-binary-format raw-in-base64-out \
  --payload file:///tmp/test-get.json \
  /tmp/test-out.json >/dev/null && cat /tmp/test-out.json; echo
```

**Erwartet:** JSON mit `"statusCode": 200` oder `"statusCode": 204` (wenn Bucket leer ist). **Kein** `errorMessage`.

```bash
# 4.2 POST mit falschem Passwort → muss 403 sein:
cat > /tmp/test-post-wrong.json <<'EOF'
{"httpMethod":"POST","headers":{"origin":"https://manuel-weiss.ch","x-demo-password":"wrong"},"body":"{\"scenes\":[]}"}
EOF

aws lambda invoke \
  --function-name website-demo-script-api \
  --region eu-central-1 \
  --cli-binary-format raw-in-base64-out \
  --payload file:///tmp/test-post-wrong.json \
  /tmp/test-out.json >/dev/null && cat /tmp/test-out.json; echo
```

**Erwartet:** `"statusCode": 403` und `"error":"Ungültiges Passwort"`.

Wenn **beide Tests grün** → weiter zu Schritt 5. Wenn nicht → CloudWatch-Logs prüfen:
```bash
aws logs tail /aws/lambda/website-demo-script-api --region eu-central-1 --since 5m
```

---

## 5. API-Gateway-Route `/demo-script` anlegen

Wir nutzen die bestehende REST-API `6i6ysj9c8c` („Manuel Weiss Website API"), Stage `v1`.

### 5.1 Variablen setzen

```bash
export API_ID="6i6ysj9c8c"
export REGION="eu-central-1"
export LAMBDA_ARN="arn:aws:lambda:eu-central-1:038333965110:function:website-demo-script-api"
export ACCOUNT_ID="038333965110"

# Root-Resource-ID ermitteln:
export ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION \
  --query "items[?path=='/'].id" --output text)
echo "ROOT_ID=$ROOT_ID"
# Erwartet: z.B. "zuzbeyllp2"
```

### 5.2 Resource `/demo-script` prüfen / anlegen

```bash
# Existiert schon?
EXISTING=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION \
  --query "items[?path=='/demo-script'].id" --output text)

if [ -z "$EXISTING" ] || [ "$EXISTING" = "None" ]; then
  # Neu anlegen:
  export RES_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID --region $REGION \
    --parent-id $ROOT_ID \
    --path-part "demo-script" \
    --query 'id' --output text)
  echo "Neu angelegt: RES_ID=$RES_ID"
else
  export RES_ID=$EXISTING
  echo "Existiert: RES_ID=$RES_ID"
fi
```

### 5.3 Methoden anlegen (OPTIONS, GET, POST) — jeweils mit Lambda-Proxy-Integration

Für jede der drei Methoden die **gleichen 4 Befehle**: `put-method`, `put-integration`, (nur für OPTIONS) `put-method-response` + `put-integration-response`, und am Ende `add-permission` einmalig.

```bash
# 5.3.1 OPTIONS (CORS-Preflight — Lambda liefert die CORS-Header selbst)
aws apigateway put-method \
  --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method OPTIONS \
  --authorization-type NONE >/dev/null

aws apigateway put-integration \
  --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method OPTIONS \
  --type AWS_PROXY --integration-http-method POST \
  --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations >/dev/null

# 5.3.2 GET
aws apigateway put-method \
  --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method GET \
  --authorization-type NONE >/dev/null

aws apigateway put-integration \
  --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method GET \
  --type AWS_PROXY --integration-http-method POST \
  --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations >/dev/null

# 5.3.3 POST
aws apigateway put-method \
  --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method POST \
  --authorization-type NONE >/dev/null

aws apigateway put-integration \
  --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method POST \
  --type AWS_PROXY --integration-http-method POST \
  --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations >/dev/null

echo "Methoden angelegt."
```

### 5.4 Lambda-Permission: API-Gateway darf die Lambda invoken

```bash
aws lambda add-permission \
  --function-name website-demo-script-api \
  --region $REGION \
  --statement-id apigw-demo-script-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*/demo-script" 2>&1
```

- **Erwartet:** JSON mit `Statement`.
- **Wenn `ResourceConflictException` (existiert schon)**: ignorieren, passt.

### 5.5 API deployen auf Stage `v1`

```bash
aws apigateway create-deployment \
  --rest-api-id $API_ID --region $REGION \
  --stage-name v1 \
  --description "demo-script route recovery $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --query '[id,createdDate]' --output text
```

---

## 6. End-to-End-Test

```bash
# 6.1 OPTIONS (Preflight) — muss 200 sein
curl -s -o /dev/null -w "OPTIONS: %{http_code}\n" \
  -X OPTIONS \
  -H "Origin: https://manuel-weiss.ch" \
  -H "Access-Control-Request-Method: POST" \
  https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/demo-script

# 6.2 GET (State laden) — 200 (wenn State da) oder 204 (wenn leer)
curl -s -w "\nGET: %{http_code}\n" \
  https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/demo-script

# 6.3 POST ohne Passwort → muss 403 sein (Sicherheitscheck)
curl -s -w "\nPOST (no pw): %{http_code}\n" \
  -X POST -H "Content-Type: application/json" \
  -d '{"scenes":[]}' \
  https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/demo-script

# 6.4 POST mit korrektem Passwort → muss 200 sein
curl -s -w "\nPOST (pw): %{http_code}\n" \
  -X POST -H "Content-Type: application/json" \
  -H "X-Demo-Password: tempus-demo-edit-2024" \
  -d '{"scenes":[],"ts":'"$(date +%s)"'000,"schemaVersion":1,"recoveryTest":true}' \
  https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/demo-script
```

**Alle vier müssen die Erwartungen erfüllen** (200, 200/204, 403, 200). Sonst: CloudWatch-Logs anschauen (Schritt 4).

---

## 7. HTML-Datei umstellen (API primär, Presigned als Fallback)

Datei: `Onboarding Valkeen/onboarding-app/public/tempus-demo-pm.html`

### 7.1 Konstanten ergänzen

Suche die Zeile (ca. Zeile 2863):
```javascript
// Presigned PUT-URL — max. 604800 s (7 Tage, AWS-SigV4-Obergrenze).
```

und **davor** einfügen:
```javascript
// API Gateway (kein Token-Ablauf — Lambda schreibt per IAM in S3).
const DEMO_SCRIPT_API_URL = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/demo-script';

// Editor-Passwort (auch vom Server via X-Demo-Password geprüft)
const EDIT_PASSWORD = 'tempus-demo-edit-2024';

```

### 7.2 `saveAll()` auf API-first umstellen

Die `try { const res = await fetch(PRESIGNED_PUT_URL, {...` Block ersetzen durch:

```javascript
  try {
    // Primär: API (läuft nicht ab)
    const apiRes = await fetch(DEMO_SCRIPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Demo-Password': EDIT_PASSWORD
      },
      body: payload
    });
    if (apiRes.ok) {
      localStorage.setItem(STORAGE_KEY, payload);
      setUnsaved(false);
      flashStatus('Gespeichert (AWS API)', false);
    } else {
      const errText = await apiRes.text().catch(() => '');
      throw new Error(`API ${apiRes.status} ${errText}`);
    }
  } catch (apiErr) {
    console.warn('API save failed, trying presigned S3 PUT:', apiErr);
    try {
      const res = await fetch(PRESIGNED_PUT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (res.status >= 200 && res.status < 300) {
        localStorage.setItem(STORAGE_KEY, payload);
        setUnsaved(false);
        flashStatus('Gespeichert (S3 Fallback)', false);
      } else {
        const hint = res.status === 403 ? ' Presigned-URL abgelaufen? → ./refresh-demo-state-url.sh' : '';
        throw new Error(`HTTP ${res.status}${hint}`);
      }
    } catch (err) {
      console.warn('S3 save failed:', err);
      try {
        localStorage.setItem(STORAGE_KEY, payload);
        setUnsaved(false);
        flashStatus('⚠️ Nur im Browser gespeichert — nicht in AWS.', true);
      } catch (e2) {
        alert('Speichern fehlgeschlagen (weder API, S3 noch Browser-Speicher).');
      }
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Speichern'; }
  }
}
```

### 7.3 `resetAll()` analog umstellen

Im `resetAll()` den einzelnen `fetch(PRESIGNED_PUT_URL, ...)` ersetzen durch:
```javascript
    fetch(DEMO_SCRIPT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Demo-Password': EDIT_PASSWORD },
      body: resetBody
    }).catch(() => {
      fetch(PRESIGNED_PUT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: resetBody
      }).catch(() => {});
    });
```

### 7.4 Kommentar-Block oben anpassen

Header-Kommentar (Zeile ~2854) aktualisieren:
```
Lesen:    S3 direkt (STATE_READ_URL) oder via API GET /demo-script
Schreiben: Primär API POST /demo-script (kein Ablauf).
           Fallback: Presigned PUT (max. 7 Tage; ./refresh-demo-state-url.sh)
```

---

## 8. Deployen + Committen

```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"

# Syntax-Check vor Deploy (optional aber empfohlen):
node --check "Onboarding Valkeen/onboarding-app/public/tempus-demo-pm.html" 2>&1 || echo "(HTML ist keine reine JS-Datei — ignorieren wenn Fehler)"

# Deploy:
./deploy-aws-website.sh --quick

# Git:
git add "Onboarding Valkeen/onboarding-app/public/tempus-demo-pm.html"
git commit -m "feat(tempus-demo-pm): API-Save reaktiviert (Lambda wieder deploybar)"
git push origin main
```

---

## 9. Browser-Test

1. `https://manuel-weiss.ch/onboarding/tempus-demo-pm.html` öffnen, Browser-Cache leeren (Cmd+Shift+R).
2. Edit-Modus aktivieren (Passwort: `tempus-demo-edit-2024`).
3. Irgendeine Kleinigkeit ändern, **Speichern** klicken.
4. DevTools → Network → **POST auf `/v1/demo-script`** muss **200** zurückgeben.
5. Status-Meldung unten muss **"Gespeichert (AWS API)"** sein (nicht „S3 Fallback", das wäre der zweite Pfad).
6. Seite neu laden, Änderung muss persistent sein.

---

## Hintergrund / Diagnose-Notizen (für späteres Nachvollziehen)

**Historie:**
- Stack `manuel-weiss-website-api` ging am **2026-04-05** via CDK-Update in `UPDATE_ROLLBACK_COMPLETE`. Beim Rollback sollten `DemoScriptFunctionD2FF00B4`, `TrainingAdminFunctionDF50FBDA`, `SingingTrainerFunction2053A641` gelöscht werden → alle drei mit `AccessDeniedException` fehlgeschlagen, später aber trotzdem physisch weg.
- Seither: **alle Lambda-Schreiboperationen** im Konto 038333965110 liefern HTTP 403 `AccessDeniedException` mit **leerem Body** (Content-Length 16) — CreateFunction, UpdateFunctionConfiguration, UpdateFunctionCode, PutFunctionConcurrency. Read-Operationen (GetFunction, ListFunctions) funktionieren.

**Was es NICHT ist:**
- `cdk-deploy-admin` hat `AdministratorAccess` + `LambdaFullAccessCursor` (mit `lambda:*`).
- Keine Permission Boundary, keine SCP, keine AWS Organization (`AWSOrganizationsNotInUseException`).
- `iam:SimulatePrincipalPolicy` sagt für alle Lambda-Actions **allowed**.
- Service-Quotas in Ordnung (30 / 1000 Functions, 253 MB / 80 GB Code).

**Was es wahrscheinlich IST:**
Account-Level-Restriktion außerhalb IAM — Billing-Hold / Abuse / Compliance-Event / Declarative Policy. Muss via **AWS Support-Case** geklärt werden.

**Was der User in der AWS-Console prüfen muss (bevor Recovery möglich):**
1. Billing Dashboard — offene Rechnungen, Budget Actions aktiv?
2. AWS Health Dashboard — Events für dieses Konto?
3. Support Center — gibt es offene Fälle oder Hinweise?
4. Ggf. neuen Support-Case eröffnen mit Titel:
   > "Lambda write APIs returning empty 403 AccessDeniedException for IAM user with AdministratorAccess"

   **Beilegen:**
   - Konto: 038333965110, Region: eu-central-1
   - IAM-User: cdk-deploy-admin (AdministratorAccess + LambdaFullAccessCursor)
   - Reproduktion: `aws lambda update-function-configuration --function-name website-flashcards-api --description "test" --region eu-central-1`
   - Erwartung: 200. Tatsächlich: 403 AccessDeniedException (leerer Body).
   - Read-Calls wie `ListFunctions` und `GetFunction` funktionieren.

**Sobald der Support-Fall gelöst ist**, funktioniert der Preflight-Test in Abschnitt 0 und diese Anleitung kann Punkt-für-Punkt abgearbeitet werden.

---

## Kurzversion für eilige KI-Agenten

```bash
# 0) Preflight
aws lambda update-function-configuration --function-name website-flashcards-api \
  --description "test-$(date +%s)" --region eu-central-1 || exit 1

# 1+2) Paket bauen
cd "/Users/manumanera/Documents/GitHub/Persönliche Website/lambda/demo-script-api"
rm -rf node_modules package-lock.json && npm install --omit=dev --silent
rm -f ../demo-script-api.zip && zip -qr ../demo-script-api.zip .
cd ..

# 3) Lambda anlegen
aws lambda create-function \
  --function-name website-demo-script-api --runtime nodejs18.x \
  --role arn:aws:iam::038333965110:role/manuel-weiss-website-api-WebsiteLambdaRole06E6525E-azbaEVqHxw0y \
  --handler index.handler --timeout 30 --memory-size 256 \
  --environment "Variables={S3_BUCKET=manuel-weiss-website,EDIT_PASSWORD=tempus-demo-edit-2024}" \
  --zip-file fileb://demo-script-api.zip --region eu-central-1
aws lambda wait function-active --function-name website-demo-script-api --region eu-central-1

# 5) API-Route (setze Variablen wie in 5.1–5.5)
# 6) Test (curl aus Abschnitt 6)
# 7) HTML editieren (Abschnitt 7)
# 8) Deploy + Push
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"
./deploy-aws-website.sh --quick
git add -A && git commit -m "feat: API-Save aktiviert" && git push origin main
```
