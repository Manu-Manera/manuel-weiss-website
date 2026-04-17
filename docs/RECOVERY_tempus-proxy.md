# Recovery-Anleitung: `/tempus-proxy/{proxy+}` API-Route (Login Mailer → Tempus)

> **Zweck:** CORS-fähiger Reverse-Proxy vom Browser-Client zur Tempus
> Supergrid API. Erlaubt `GET/POST/PUT/DELETE` gegen die fest hinterlegte
> Tempus-Instanz, ohne Lambda.

## Architektur

```
Browser                                ── Authorization-Header wird vom
  │  X-Tempus-Auth: Bearer …              API-Gateway vor dem Weiterreichen
  ▼                                        umgeschrieben auf Authorization
API Gateway 6i6ysj9c8c
  └ /v1/tempus-proxy/{proxy+}
       ANY  → HTTP_PROXY
              https://trial5.tempus-resource.com/slot4/{proxy}
       OPTIONS → MOCK (CORS)
```

- **Ziel-Basis-URL** (hart verdrahtet): `https://trial5.tempus-resource.com/slot4`
  → für weitere Tempus-Instanzen pro Instanz eine weitere Route anlegen.
- **Warum `X-Tempus-Auth` statt `Authorization`?** API Gateway interpretiert
  `Authorization`-Header als AWS SigV4 und verwirft den Request mit
  `IncompleteSignatureException`. Deshalb mappt die Integration
  `method.request.header.X-Tempus-Auth` auf
  `integration.request.header.Authorization`.

## Wiederherstellung

### 1. Resource anlegen

```bash
export API_ID=6i6ysj9c8c
export REGION=eu-central-1

ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION \
  --query "items[?path=='/'].id" --output text)

PROXY_ID=$(aws apigateway create-resource --rest-api-id $API_ID --region $REGION \
  --parent-id $ROOT_ID --path-part "tempus-proxy" --query 'id' --output text)

GREEDY_ID=$(aws apigateway create-resource --rest-api-id $API_ID --region $REGION \
  --parent-id $PROXY_ID --path-part '{proxy+}' --query 'id' --output text)
```

### 2. ANY (Proxy) + Header-Remap

```bash
aws apigateway put-method --rest-api-id $API_ID --region $REGION --resource-id $GREEDY_ID \
  --http-method ANY --authorization-type NONE \
  --request-parameters 'method.request.path.proxy=true,method.request.header.X-Tempus-Auth=false'

aws apigateway put-integration --rest-api-id $API_ID --region $REGION --resource-id $GREEDY_ID \
  --http-method ANY --type HTTP_PROXY --integration-http-method ANY \
  --uri 'https://trial5.tempus-resource.com/slot4/{proxy}' \
  --connection-type INTERNET --passthrough-behavior WHEN_NO_MATCH \
  --request-parameters 'integration.request.path.proxy=method.request.path.proxy,integration.request.header.Authorization=method.request.header.X-Tempus-Auth'
```

### 3. OPTIONS (CORS-Preflight)

```bash
aws apigateway put-method --rest-api-id $API_ID --region $REGION --resource-id $GREEDY_ID \
  --http-method OPTIONS --authorization-type NONE

aws apigateway put-integration --rest-api-id $API_ID --region $REGION --resource-id $GREEDY_ID \
  --http-method OPTIONS --type MOCK \
  --request-templates '{"application/json":"{\"statusCode\": 200}"}'

aws apigateway put-method-response --rest-api-id $API_ID --region $REGION --resource-id $GREEDY_ID \
  --http-method OPTIONS --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":false,"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Max-Age":false}'

cat > /tmp/options-params.json <<'EOF'
{
  "method.response.header.Access-Control-Allow-Origin": "'*'",
  "method.response.header.Access-Control-Allow-Headers": "'Authorization,Content-Type,Accept,X-Tempus-Auth'",
  "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
  "method.response.header.Access-Control-Max-Age": "'86400'"
}
EOF

aws apigateway put-integration-response --rest-api-id $API_ID --region $REGION --resource-id $GREEDY_ID \
  --http-method OPTIONS --status-code 200 \
  --response-parameters file:///tmp/options-params.json
```

### 4. Deploy auf Stage `v1`

```bash
aws apigateway create-deployment --rest-api-id $API_ID --region $REGION \
  --stage-name v1 --description "recover /tempus-proxy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

### 5. Smoke-Test

```bash
KEY="373-79b17597-9bc4-4912-9ecb-bcbfcb223050"   # Test-Key Tempus Trial5 / slot4
EP="https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/tempus-proxy"

curl -s "$EP/api/sg/v1/Resources/Identity" -H "X-Tempus-Auth: Bearer $KEY"
# → {"id":373,"name":"Manuel Weiss",...}

curl -s -i -X OPTIONS "$EP/api/sg/v1/Resources" \
  -H "Origin: https://manuel-weiss.ch" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: x-tempus-auth,content-type" \
  | grep -i "access-control\|^HTTP"
```

OPTIONS muss `Access-Control-Allow-Origin: *` und `Access-Control-Allow-Headers: Authorization,Content-Type,Accept,X-Tempus-Auth` liefern.

## Erweitern auf weitere Tempus-Instanzen

Das Zielset ist **fest** im Integrations-URI (`https://trial5.tempus-resource.com/slot4/{proxy}`). Für eine zweite Instanz (z. B. `slot2` oder eine Prod-Domain) eine weitere Route anlegen, z. B. `/tempus-proxy-prod/{proxy+}`, und im Frontend (`mailerUtils.js → TEMPUS_PROXY_BASE`) zwischen den Proxies umschalten.

Alternativ: Lambda-Proxy (sobald `lambda:CreateFunction`/`UpdateFunctionCode` im Konto wieder erlaubt ist) — Host dynamisch aus Request-Header extrahieren, dann ist nur eine Route nötig.
