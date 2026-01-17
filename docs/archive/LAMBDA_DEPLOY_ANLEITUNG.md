# Lambda-Funktion "api-settings" manuell deployen

## Das Problem
AWS hat Lambda-Berechtigungen eingeschränkt wegen des Sicherheitsvorfalls. Die Lambda-Funktion muss manuell über die AWS Console aktualisiert werden.

## ZIP-Archiv
Das aktualisierte ZIP-Archiv befindet sich hier:
```
lambda/api-settings-encrypted.zip (3.7 MB)
```

## Schritt-für-Schritt Anleitung

### 1. AWS Console öffnen
1. Gehe zu [AWS Lambda Console](https://eu-central-1.console.aws.amazon.com/lambda/home?region=eu-central-1#/functions)
2. Melde dich mit deinem Root-Account an

### 2. Lambda-Funktion finden
1. Suche nach einer Funktion die "api-settings" enthält
2. Falls keine existiert, erstelle eine neue:
   - **Function name**: `mawps-api-settings`
   - **Runtime**: Node.js 18.x
   - **Architecture**: x86_64

### 3. Code hochladen
1. Klicke auf die Funktion
2. Im Tab "Code" → Klicke auf "Upload from" → ".zip file"
3. Wähle die Datei: `lambda/api-settings-encrypted.zip`
4. Klicke auf "Save"

### 4. Environment Variables setzen
Im Tab "Configuration" → "Environment variables" → "Edit":

| Key | Value |
|-----|-------|
| `API_SETTINGS_TABLE` | `mawps-api-settings` |
| `ENCRYPTION_SECRET` | `[Ein sicheres Passwort - z.B. 32 zufällige Zeichen]` |
| `AWS_REGION` | `eu-central-1` |

### 5. Handler prüfen
Im Tab "Code" → "Runtime settings" → "Edit":
- **Handler**: `index.handler`

### 6. Timeout erhöhen
Im Tab "Configuration" → "General configuration" → "Edit":
- **Timeout**: 30 Sekunden
- **Memory**: 256 MB

### 7. IAM-Rolle prüfen
Die Lambda-Funktion benötigt eine IAM-Rolle mit folgenden Berechtigungen:
- `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem` auf `mawps-api-settings`

### 8. API Gateway verbinden (falls nicht vorhanden)
1. Gehe zu [API Gateway Console](https://eu-central-1.console.aws.amazon.com/apigateway/main/apis?region=eu-central-1)
2. Öffne `manuel-weiss-profile-media` (ID: of2iwj7h2c)
3. Erstelle neue Resource `/api-settings` mit Methoden GET, PUT, DELETE
4. Verbinde mit der Lambda-Funktion

---

## DynamoDB-Tabelle erstellen (falls nicht vorhanden)

```bash
aws dynamodb create-table \
    --table-name mawps-api-settings \
    --attribute-definitions AttributeName=userId,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region eu-central-1
```

---

## Testen

Nach dem Deployment teste die Funktion:

```bash
# Im Browser einloggen und dann:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/api-settings
```

Oder speichere einen neuen API-Key im Admin Panel und prüfe, ob er verschlüsselt in DynamoDB gespeichert wird.
