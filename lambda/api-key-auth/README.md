# API Key Authentication Lambda Function

## Übersicht

Lambda-Funktion für Private/Public Key Pair Authentifizierung mit Token-Generierung (4000 Sekunden Gültigkeit).

## Endpoints

### POST /auth/api-key/register
Registriert einen Public Key.

**Request:**
```json
{
  "apiKeyId": "my-api-key-123",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "metadata": {
    "name": "Postman API Key",
    "description": "API Key for testing"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Public key registered successfully",
  "apiKeyId": "my-api-key-123",
  "createdAt": "2025-01-15T12:00:00.000Z"
}
```

### POST /auth/api-key/challenge
Generiert eine Challenge für Signatur.

**Request:**
```json
{
  "apiKeyId": "my-api-key-123"
}
```

**Response:**
```json
{
  "challenge": "abc123...",
  "expiresIn": 60
}
```

### POST /auth/api-key/token
Generiert JWT Token nach erfolgreicher Signatur-Validierung.

**Request:**
```json
{
  "apiKeyId": "my-api-key-123",
  "challenge": "abc123...",
  "signature": "signature-base64..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 4000,
  "tokenType": "Bearer"
}
```

### GET /auth/api-key/status
Prüft ob ein API Key registriert ist.

**Query Parameters:**
- `apiKeyId`: API Key ID

**Response:**
```json
{
  "registered": true,
  "apiKeyId": "my-api-key-123",
  "active": true
}
```

## Environment Variables

- `API_KEYS_TABLE`: DynamoDB Table Name (default: `mawps-api-keys`)
- `JWT_SECRET` oder `TOKEN_SECRET`: Secret für JWT Token (muss gesetzt werden!)

## DynamoDB Schema

### API Keys Table

**Partition Key:** `pk` (String)
**Sort Key:** `sk` (String)

**Items:**
- `pk: apikey#<apiKeyId>`, `sk: publickey` - Public Key Storage
- `pk: challenge#<apiKeyId>`, `sk: challenge` - Challenge Storage (temporary)

## Deployment

```bash
cd lambda/api-key-auth
npm install
zip -r api-key-auth.zip .
aws lambda update-function-code \
  --function-name mawps-api-key-auth \
  --zip-file fileb://api-key-auth.zip
```

## Sicherheit

- Private Key bleibt beim Client (niemals an Server senden!)
- Challenge ist 60 Sekunden gültig
- Challenge wird nach einmaliger Verwendung gelöscht
- Token ist 4000 Sekunden (ca. 66 Minuten) gültig
- RSA-SHA256 Signatur-Validierung

