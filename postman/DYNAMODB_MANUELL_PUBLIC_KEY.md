# Public Key manuell in DynamoDB speichern

## DynamoDB Tabellen-Struktur

**Tabelle:** `mawps-api-keys` (oder aus Environment Variable `API_KEYS_TABLE`)

**Item-Struktur:**
```json
{
  "pk": "apikey#<apiKeyId>",
  "sk": "publickey",
  "apiKeyId": "<apiKeyId>",
  "publicKey": "<Public Key als String mit \\n für Newlines>",
  "createdAt": "2026-01-02T20:51:27.898Z",
  "updatedAt": "2026-01-02T20:51:27.898Z",
  "active": true
}
```

## Beispiel für apiKeyId: `9eadacab-bc87-4dff-8d01-e4862c654b45`

### 1. Public Key laden

```bash
cat keys/9eadacab-bc87-4dff-8d01-e4862c654b45-public-key.pem
```

**Output:**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArm5z3eAoBi5iy/5N/sKZ
2GcyF4DPnudG06bT3wTsRnTwCmln/0Kdm09ItWHpGVUNlMHmBpgpfmR2U/t/ollg
EdlwRaM+5ZKruYBCObC3mknkMtYJKK0jJwaJ2WV0RhQ79Gm5+rwjg+SrGNZAO9rx
ZP5wTFciyOvB+nBjxOBEgON/hMKEh+RGd9eVTNCr+NDw652Q8yunelfzmT7RPLIm
zinzXy2nVbk5d+QCHOA+RqdgCW2qmC31FMaIRb0j6QTrwSRAeBodJ5kU3+r0TsRw
9z0a3sa4ivFfe7xf4ivnFcbOtAqXcYnBLyWHgi54mMOi50Y7bz8CbQlMNtpYdzYG
fQIDAQAB
-----END PUBLIC KEY-----
```

### 2. Public Key für DynamoDB formatieren

**Wichtig:** Newlines müssen als `\n` (escaped) gespeichert werden!

**Formatierter Public Key:**
```
-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArm5z3eAoBi5iy/5N/sKZ\n2GcyF4DPnudG06bT3wTsRnTwCmln/0Kdm09ItWHpGVUNlMHmBpgpfmR2U/t/ollg\nEdlwRaM+5ZKruYBCObC3mknkMtYJKK0jJwaJ2WV0RhQ79Gm5+rwjg+SrGNZAO9rx\nZP5wTFciyOvB+nBjxOBEgON/hMKEh+RGd9eVTNCr+NDw652Q8yunelfzmT7RPLIm\nzinzXy2nVbk5d+QCHOA+RqdgCW2qmC31FMaIRb0j6QTrwSRAeBodJ5kU3+r0TsRw\n9z0a3sa4ivFfe7xf4ivnFcbOtAqXcYnBLyWHgi54mMOi50Y7bz8CbQlMNtpYdzYG\nfQIDAQAB\n-----END PUBLIC KEY-----\n
```

### 3. AWS CLI Befehl

```bash
aws dynamodb put-item \
  --table-name mawps-api-keys \
  --item '{
    "pk": {"S": "apikey#9eadacab-bc87-4dff-8d01-e4862c654b45"},
    "sk": {"S": "publickey"},
    "apiKeyId": {"S": "9eadacab-bc87-4dff-8d01-e4862c654b45"},
    "publicKey": {"S": "-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArm5z3eAoBi5iy/5N/sKZ\\n2GcyF4DPnudG06bT3wTsRnTwCmln/0Kdm09ItWHpGVUNlMHmBpgpfmR2U/t/ollg\\nEdlwRaM+5ZKruYBCObC3mknkMtYJKK0jJwaJ2WV0RhQ79Gm5+rwjg+SrGNZAO9rx\\nZP5wTFciyOvB+nBjxOBEgON/hMKEh+RGd9eVTNCr+NDw652Q8yunelfzmT7RPLIm\\nzinzXy2nVbk5d+QCHOA+RqdgCW2qmC31FMaIRb0j6QTrwSRAeBodJ5kU3+r0TsRw\\n9z0a3sa4ivFfe7xf4ivnFcbOtAqXcYnBLyWHgi54mMOi50Y7bz8CbQlMNtpYdzYG\\nfQIDAQAB\\n-----END PUBLIC KEY-----\\n"},
    "createdAt": {"S": "2026-01-02T20:51:27.898Z"},
    "updatedAt": {"S": "2026-01-02T20:51:27.898Z"},
    "active": {"BOOL": true}
  }'
```

### 4. Mit Script automatisch formatieren

```bash
# Script erstellt automatisch den korrekten DynamoDB Item
node scripts/register-correct-public-key.js
```

## Über AWS Console

1. **Gehe zu DynamoDB Console:**
   - https://console.aws.amazon.com/dynamodb/
   - Wähle Tabelle: `mawps-api-keys`

2. **Erstelle neues Item:**
   - Klicke auf "Explore table items"
   - Klicke auf "Create item"

3. **Füge Attribute hinzu:**
   - `pk` (String): `apikey#9eadacab-bc87-4dff-8d01-e4862c654b45`
   - `sk` (String): `publickey`
   - `apiKeyId` (String): `9eadacab-bc87-4dff-8d01-e4862c654b45`
   - `publicKey` (String): Public Key mit `\n` für Newlines (siehe oben)
   - `createdAt` (String): ISO Timestamp
   - `updatedAt` (String): ISO Timestamp
   - `active` (Boolean): `true`

4. **Speichere Item**

## Wichtige Hinweise

⚠️ **Newlines:** DynamoDB speichert Newlines als `\n` (escaped). Beim manuellen Eintragen in der Console musst du `\n` als Text eingeben, nicht als echte Newlines!

⚠️ **Format:** Der Public Key muss im PEM-Format sein mit `-----BEGIN PUBLIC KEY-----` und `-----END PUBLIC KEY-----`

⚠️ **Einfacher:** Verwende das Script `node scripts/register-correct-public-key.js` - das macht alles automatisch!

