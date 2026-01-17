# 🔍 Test-Analyse: API Key Authentication

## ❌ Problem

Alle Endpoints geben "Internal server error" (500) zurück:
- GET `/auth/api-key/status?apiKeyId=test-key-123` → 500
- POST `/auth/api-key/register` → 500

## 🔍 Analyse

### 1. Event-Struktur Problem

API Gateway REST API sendet Events in folgendem Format:
```json
{
  "httpMethod": "GET",
  "path": "/prod/auth/api-key/status",
  "queryStringParameters": { "apiKeyId": "test-123" },
  "headers": { "origin": "..." }
}
```

**Problem:** Der Path enthält `/prod/` als Prefix (Stage Name)!

### 2. Path-Matching Problem

Aktueller Code:
```javascript
if (method === 'GET' && path.includes('/auth/api-key/status')) {
```

**Problem:** Wenn `path = "/prod/auth/api-key/status"`, dann funktioniert `includes()` zwar, aber vielleicht gibt es ein anderes Problem.

### 3. Mögliche Ursachen

1. **DynamoDB Permissions:** Lambda hat möglicherweise keine Berechtigung
2. **Environment Variables:** `API_KEYS_TABLE` oder `JWT_SECRET` fehlen
3. **Path-Parsing:** Path wird nicht richtig erkannt
4. **Error vor try-catch:** Fehler tritt vor dem try-catch Block auf

## ✅ Durchgeführte Fixes

1. ✅ Try-catch um gesamten Handler
2. ✅ Safe Body Parsing
3. ✅ Verbesserte Path-Erkennung (includes, endsWith, exact match)
4. ✅ Detailliertes Logging
5. ✅ CORS Origins aktualisiert (manuel-weiss.ch)

## 🧪 Nächste Schritte

1. **CloudWatch Logs aktivieren** um genauen Fehler zu sehen
2. **DynamoDB Permissions prüfen**
3. **Environment Variables prüfen**
4. **Path ohne Stage-Prefix testen**

## 📋 Test-Commands

```bash
# Test über API Gateway
curl -X GET "https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/auth/api-key/status?apiKeyId=test-key-123" \
  -H "Content-Type: application/json" \
  -H "Origin: https://manuel-weiss.ch"

# Test direkt Lambda
aws lambda invoke \
  --function-name mawps-api-key-auth \
  --region eu-central-1 \
  --payload '{"httpMethod":"GET","path":"/auth/api-key/status","queryStringParameters":{"apiKeyId":"test-123"},"headers":{"origin":"https://manuel-weiss.ch"}}' \
  response.json
```

## 🔧 Empfohlene Fixes

1. **Path normalisieren:** Stage-Prefix entfernen
2. **CloudWatch Logs prüfen:** Genauen Fehler identifizieren
3. **DynamoDB Permissions:** IAM Role prüfen
4. **Environment Variables:** Prüfen ob gesetzt

