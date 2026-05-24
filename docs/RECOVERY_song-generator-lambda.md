# Recovery-Anleitung: `website-song-generator` Lambda + API-Route

> **Wann:** Sobald AWS wieder Lambda-Schreibzugriffe im Konto **038333965110** erlaubt
> (aktuell geblockt – siehe `docs/RECOVERY_demo-script-lambda.md` Abschnitt 0).
> **Ergebnis:** `persoenlichkeits-song-generator.html` nutzt zentrale Lambda statt
> Direct-OpenAI-Aufruf vom Browser → bessere Resilienz, sicherer Key-Handling.

Der Persönlichkeits-Song-Generator ist **bereits live und funktionsfähig**. Aktuell
ruft das Frontend OpenAI direkt vom Browser auf (Direct-Mode). Sobald die Lambda
deployed ist, schaltet das Frontend automatisch auf den Lambda-Pfad um (siehe
`callApi`-Logik in `js/song-generator.js`).

---

## 0. Vorbedingung: Preflight (siehe demo-script-lambda RECOVERY)

```bash
aws lambda update-function-configuration \
  --function-name website-flashcards-api \
  --description "preflight-$(date +%s)" \
  --region eu-central-1 2>&1 | head -3
```

✅ JSON-Response → weiter. ❌ AccessDenied → STOPP, Account-Block ist noch aktiv.

---

## 1. Lambda-Paket bauen

```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website/lambda/song-generator"

# Keine externen Dependencies (nur node-builtin fetch, runtime nodejs20.x).
# Trotzdem zip:
rm -f ../song-generator.zip
zip -qr ../song-generator.zip .

ls -la ../song-generator.zip
# Erwartet: ca. 15-20 KB (nur index.js + prompts.js + package.json)

cd "/Users/manumanera/Documents/GitHub/Persönliche Website"
```

---

## 2. Lambda-Rolle finden

```bash
aws iam list-roles --query "Roles[?contains(RoleName, 'WebsiteLambda')].[RoleName,Arn]" --output table
```

Den Arn der `manuel-weiss-website-api-WebsiteLambdaRole...` Rolle merken
(z.B. `arn:aws:iam::038333965110:role/manuel-weiss-website-api-WebsiteLambdaRole06E6525E-azbaEVqHxw0y`).

---

## 3. Lambda anlegen

```bash
LAMBDA_ROLE_ARN="arn:aws:iam::038333965110:role/manuel-weiss-website-api-WebsiteLambdaRole06E6525E-azbaEVqHxw0y"  # ggf. anpassen

aws lambda create-function \
  --function-name website-song-generator \
  --runtime nodejs20.x \
  --role "$LAMBDA_ROLE_ARN" \
  --handler index.handler \
  --timeout 60 \
  --memory-size 512 \
  --zip-file fileb://lambda/song-generator.zip \
  --region eu-central-1 \
  --query '[FunctionName,FunctionArn,State]' --output text

aws lambda wait function-active --function-name website-song-generator --region eu-central-1
```

> Hinweis: Der Lambda-Handler erwartet `apiKey` im Request-Body (vom Frontend
> mitgeschickt). Optional kann zusätzlich `OPENAI_API_KEY` als Lambda-Env-Var
> gesetzt werden, um auch Server-Side-Calls zu unterstützen:
> ```bash
> aws lambda update-function-configuration \
>   --function-name website-song-generator \
>   --environment "Variables={OPENAI_API_KEY=sk-...}" \
>   --region eu-central-1
> ```

---

## 4. Lambda direkt testen

```bash
cat > /tmp/song-test.json <<'EOF'
{"httpMethod":"POST","body":"{\"action\":\"health\"}"}
EOF

aws lambda invoke \
  --function-name website-song-generator \
  --region eu-central-1 \
  --cli-binary-format raw-in-base64-out \
  --payload file:///tmp/song-test.json \
  /tmp/song-out.json >/dev/null && cat /tmp/song-out.json; echo
```

Erwartet: `"statusCode": 401` (kein API-Key → erwartetes Verhalten).
Mit echtem Key:
```bash
cat > /tmp/song-test.json <<'EOF'
{"httpMethod":"POST","body":"{\"action\":\"health\",\"apiKey\":\"sk-...\"}"}
EOF
```
→ `"statusCode": 200`, `"success":true`.

---

## 5. API-Gateway-Route `/song-generator` anlegen

```bash
export API_ID="6i6ysj9c8c"
export REGION="eu-central-1"
export ACCOUNT_ID="038333965110"
export LAMBDA_ARN="arn:aws:lambda:eu-central-1:038333965110:function:website-song-generator"

ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION \
  --query "items[?path=='/'].id" --output text)

# Resource anlegen (oder existierende verwenden)
EXISTING=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION \
  --query "items[?path=='/song-generator'].id" --output text)

if [ -z "$EXISTING" ] || [ "$EXISTING" = "None" ]; then
  RES_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID --region $REGION \
    --parent-id $ROOT_ID --path-part "song-generator" \
    --query 'id' --output text)
else
  RES_ID=$EXISTING
fi
echo "RES_ID=$RES_ID"

# OPTIONS (Lambda liefert CORS selbst → AWS_PROXY)
aws apigateway put-method --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method OPTIONS --authorization-type NONE >/dev/null
aws apigateway put-integration --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method OPTIONS \
  --type AWS_PROXY --integration-http-method POST \
  --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations >/dev/null

# POST
aws apigateway put-method --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method POST --authorization-type NONE >/dev/null
aws apigateway put-integration --rest-api-id $API_ID --region $REGION \
  --resource-id $RES_ID --http-method POST \
  --type AWS_PROXY --integration-http-method POST \
  --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations >/dev/null

# Lambda-Permission
aws lambda add-permission \
  --function-name website-song-generator --region $REGION \
  --statement-id apigw-song-generator-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*/song-generator" 2>&1

# Stage v1 deployen
aws apigateway create-deployment \
  --rest-api-id $API_ID --region $REGION --stage-name v1 \
  --description "song-generator route $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --query '[id,createdDate]' --output text
```

---

## 6. End-to-End-Test

```bash
curl -s -o /dev/null -w "OPTIONS: %{http_code}\n" -X OPTIONS \
  https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/song-generator

curl -s -X POST -H "Content-Type: application/json" \
  -d '{"action":"health","apiKey":"sk-xxx..."}' \
  https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/song-generator
```

---

## 7. Browser-Test

1. `https://manuel-weiss.ch/persoenlichkeits-song-generator.html` öffnen.
2. DevTools → Network: Test-Fragen-Generierung → POST `/v1/song-generator` muss
   200 zurückgeben (kein 404/CORS-Fehler).
3. Console: `[SongGenerator] Lambda nicht erreichbar` darf NICHT mehr erscheinen.

---

## 8. Optional: CDK wieder einsynchronisieren

Sobald AWS-Block weg ist, kann der CDK-Stack wieder die Lambda übernehmen.
Die Definition steht bereits in `infrastructure/lib/website-api-stack.ts`
(`SongGeneratorFunction` + `/song-generator` Route). Bei Bedarf via
`cdk import` die manuell angelegte Lambda übernehmen, sonst entsteht beim
nächsten Deploy ein Konflikt.

```bash
cd infrastructure
npx cdk diff manuel-weiss-website-api
# Wenn Diff sagt „SongGeneratorFunction wird neu angelegt":
# → entweder import (advanced) oder die manuell angelegte Lambda umbenennen / löschen,
#   bevor `cdk deploy` läuft.
```
