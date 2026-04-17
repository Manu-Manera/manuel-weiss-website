# Recovery-Anleitung: `/mailer-state` API-Route (Tempus Login Mailer)

> **Zweck:** Persistente S3-Speicherung für den Login Mailer **ohne Lambda**.
> Nutzt eine API-Gateway-Route mit direkter AWS-Service-Integration zu S3.
> **Läuft nicht ab** (keine Presigned-URL).

## Architektur

```
Browser  ──►  API Gateway 6i6ysj9c8c  ──► (AWS Service Integration) ──► S3
           /v1/mailer-state                                              data/tempus-mailer-state.json
             GET / PUT / OPTIONS        IAM role: apigw-mailer-state-s3
```

- **IAM-Rolle** `apigw-mailer-state-s3` (trusted principal: `apigateway.amazonaws.com`)
  mit Inline-Policy `s3-mailer-state-rw` (GetObject + PutObject nur auf
  `arn:aws:s3:::manuel-weiss-website/data/tempus-mailer-state.json`).
- **API-Ressource** `/mailer-state` (Resource ID: `qqcdkb`) in der REST-API
  `6i6ysj9c8c` ("Manuel Weiss Website API"), Stage `v1`.
- **Methoden** GET, PUT, OPTIONS – alle `authorization-type NONE`, CORS `*`.

## Sicherheitsmodell

Analog zum Demo-Skript: Der Endpunkt ist öffentlich erreichbar. Der
Passwort-Schutz läuft **clientseitig** über das Admin-Passwort
`tempus-mailer-edit-2024`, das im UI vor den Speicher-Buttons geprüft wird.
Wer das Passwort kennt (bzw. wer die JS-Bundles auseinandernimmt), kann die
Datei überschreiben. Das ist bewusst akzeptiert und entspricht dem
bestehenden `tempus-demo-pm`-Muster.

## Wiederherstellung (falls Ressourcen gelöscht wurden)

### 1. IAM-Rolle neu anlegen

```bash
ACCOUNT_ID=038333965110

cat > /tmp/apigw-trust.json <<'EOF'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"apigateway.amazonaws.com"},"Action":"sts:AssumeRole"}]}
EOF

aws iam create-role \
  --role-name apigw-mailer-state-s3 \
  --assume-role-policy-document file:///tmp/apigw-trust.json

cat > /tmp/apigw-s3-policy.json <<'EOF'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:GetObject","s3:PutObject"],"Resource":"arn:aws:s3:::manuel-weiss-website/data/tempus-mailer-state.json"}]}
EOF

aws iam put-role-policy \
  --role-name apigw-mailer-state-s3 \
  --policy-name s3-mailer-state-rw \
  --policy-document file:///tmp/apigw-s3-policy.json
```

### 2. API-Ressource + Methoden

```bash
export API_ID=6i6ysj9c8c
export REGION=eu-central-1
export ROLE_ARN="arn:aws:iam::038333965110:role/apigw-mailer-state-s3"
export S3_URI="arn:aws:apigateway:${REGION}:s3:path/manuel-weiss-website/data/tempus-mailer-state.json"

ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/'].id" --output text)

RES_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/mailer-state'].id" --output text)
if [ -z "$RES_ID" ] || [ "$RES_ID" = "None" ]; then
  RES_ID=$(aws apigateway create-resource --rest-api-id $API_ID --region $REGION --parent-id $ROOT_ID --path-part "mailer-state" --query 'id' --output text)
fi
echo "RES_ID=$RES_ID"

# --- PUT ---
aws apigateway put-method --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method PUT --authorization-type NONE --request-parameters '{"method.request.header.Content-Type":false}'
aws apigateway put-integration --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method PUT --type AWS --integration-http-method PUT --uri "$S3_URI" --credentials "$ROLE_ARN" --passthrough-behavior WHEN_NO_MATCH --request-parameters '{"integration.request.header.Content-Type":"method.request.header.Content-Type","integration.request.header.x-amz-acl":"'"'"'bucket-owner-full-control'"'"'"}'
aws apigateway put-method-response --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method PUT --status-code 200 --response-parameters '{"method.response.header.Access-Control-Allow-Origin":false,"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false}'
aws apigateway put-integration-response --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method PUT --status-code 200 --selection-pattern "2\\d{2}" --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'","method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,PUT,OPTIONS'"'"'"}'

# --- GET ---
aws apigateway put-method --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method GET --authorization-type NONE
aws apigateway put-integration --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method GET --type AWS --integration-http-method GET --uri "$S3_URI" --credentials "$ROLE_ARN" --passthrough-behavior WHEN_NO_MATCH
aws apigateway put-method-response --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method GET --status-code 200 --response-parameters '{"method.response.header.Access-Control-Allow-Origin":false,"method.response.header.Content-Type":false}'
aws apigateway put-integration-response --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method GET --status-code 200 --selection-pattern "2\\d{2}" --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'","method.response.header.Content-Type":"'"'"'application/json'"'"'"}'

# --- OPTIONS (CORS) ---
aws apigateway put-method --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method OPTIONS --authorization-type NONE
aws apigateway put-integration --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method OPTIONS --type MOCK --request-templates '{"application/json":"{\"statusCode\": 200}"}'
aws apigateway put-method-response --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method OPTIONS --status-code 200 --response-parameters '{"method.response.header.Access-Control-Allow-Origin":false,"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Max-Age":false}'
aws apigateway put-integration-response --rest-api-id $API_ID --region $REGION --resource-id $RES_ID --http-method OPTIONS --status-code 200 --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'","method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,PUT,OPTIONS'"'"'","method.response.header.Access-Control-Max-Age":"'"'"'86400'"'"'"}'
```

### 3. Deploy

```bash
aws apigateway create-deployment \
  --rest-api-id 6i6ysj9c8c --region eu-central-1 \
  --stage-name v1 \
  --description "recover /mailer-state $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

### 4. Smoke-Test

```bash
EP="https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/mailer-state"
curl -s -w "\nGET %{http_code}\n" "$EP"
curl -s -w "\nPUT %{http_code}\n" -X PUT -H "Content-Type: application/json" \
  -d '{"schemaVersion":1,"ts":0,"templates":[]}' "$EP"
curl -s -o /dev/null -w "OPTIONS %{http_code}\n" -X OPTIONS \
  -H "Origin: https://manuel-weiss.ch" -H "Access-Control-Request-Method: PUT" "$EP"
```

Alle drei müssen `200` liefern.
